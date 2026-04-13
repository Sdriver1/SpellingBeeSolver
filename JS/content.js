/**
 * content.js — Content script injected into the NY Times Spelling Bee page.
 *
 * Responsibilities:
 *  - Extract the 7 puzzle letters and the full game data from the page.
 *  - Respond to extractLetters messages sent by the side panel (popup.js).
 *
 * Extraction is attempted in order of reliability:
 *  1. Parse the JSON game data embedded in the page source (gives letters + answers).
 *  2. Read letter text from SVG elements with class "cell-letter".
 *  3. Read any single-letter SVG text element (broadest fallback).
 *
 * Wrapped in an IIFE to avoid polluting the page's global scope.
 */
(function () {

    /**
     * Attempts to extract the 7 puzzle letters using three strategies in order.
     * Strategy 1 (game data) also populates the answers and pangrams lists.
     * Strategies 2 and 3 return only the letters, with no answer data.
     *
     * @returns {{ center: string|null, outer: string[], gameData: object|null }}
     */
    function extractLetters() {
        const letters = {
            center: null,
            outer: [],
            gameData: null
        };

        try {
            // Strategy 1: parse embedded JSON game data (most reliable — gives answers too)
            const gameData = extractGameData();
            if (gameData) {
                letters.center = gameData.centerLetter;
                letters.outer = gameData.outerLetters;
                letters.gameData = gameData;
                return letters;
            }

            // Strategy 2: read from SVG elements with class "cell-letter".
            // The first element is the center (yellow) letter; the next 6 are outer.
            const cellLetters = document.querySelectorAll('text.cell-letter');
            if (cellLetters.length >= 7) {
                letters.center = cellLetters[0].textContent.trim().toLowerCase();
                letters.outer = Array.from(cellLetters).slice(1, 7).map(el =>
                    el.textContent.trim().toLowerCase()
                );
                return letters;
            }

            // Strategy 3: find any single alphabetic character inside an SVG.
            // Used if NYT changes their CSS class names.
            const svgTexts = document.querySelectorAll('svg text');
            const letterTexts = Array.from(svgTexts).filter(el => {
                const content = el.textContent.trim();
                return content.length === 1 && /[a-z]/i.test(content);
            });
            if (letterTexts.length >= 7) {
                letters.center = letterTexts[0].textContent.trim().toLowerCase();
                letters.outer = letterTexts.slice(1, 7).map(el =>
                    el.textContent.trim().toLowerCase()
                );
                return letters;
            }

        } catch (error) {
            console.error('Error extracting letters:', error);
        }

        return letters;
    }

    /**
     * Attempts to extract the full game data (letters, answers, pangrams) from
     * the page's embedded JavaScript. Tries three approaches in order:
     *
     *  1. Read the `window.gameData.today` global (works if the page exposes it).
     *  2. Regex-match the full "today" object from the raw page HTML.
     *  3. Regex-match a simpler pattern from individual <script> tag contents.
     *
     * The returned object shape matches the NYT game data structure:
     *  { centerLetter, outerLetters, validLetters, pangrams, answers }
     *
     * @returns {{ centerLetter: string, outerLetters: string[], validLetters: string[],
     *             pangrams: string[], answers: string[] } | null}
     */
    function extractGameData() {
        try {
            // Approach 1: global variable exposed by the page bundle
            if (window.gameData?.today) {
                return window.gameData.today;
            }

            const pageSource = document.documentElement.innerHTML;

            // Approach 2: match the complete "today" object containing all fields
            const todayPattern = /"today":\s*\{[^}]*?"centerLetter":\s*"([a-z])"[^}]*?"outerLetters":\s*\[([^\]]+)\][^}]*?"validLetters":\s*\[([^\]]+)\][^}]*?"pangrams":\s*\[([^\]]+)\][^}]*?"answers":\s*\[([^\]]+)\]/;
            const fullMatch = pageSource.match(todayPattern);
            if (fullMatch) {
                try {
                    return {
                        centerLetter: fullMatch[1],
                        outerLetters: JSON.parse('[' + fullMatch[2] + ']'),
                        validLetters: JSON.parse('[' + fullMatch[3] + ']'),
                        pangrams: JSON.parse('[' + fullMatch[4] + ']'),
                        answers: JSON.parse('[' + fullMatch[5] + ']'),
                    };
                } catch (e) { /* malformed capture group — fall through */ }
            }

            // Approach 3a: simpler pattern using only the fields we strictly need.
            // outerLetters is derived by removing the center from validLetters.
            // Pangrams are searched for separately since they may appear elsewhere.
            const simplePattern = /"centerLetter":\s*"([a-z])"[^}]*?"validLetters":\s*\[([^\]]+)\][^}]*?"answers":\s*\[([^\]]+)\]/;
            const simpleMatch = pageSource.match(simplePattern);
            if (simpleMatch) {
                try {
                    const centerLetter = simpleMatch[1];
                    const validLetters = JSON.parse('[' + simpleMatch[2] + ']');
                    const answers = JSON.parse('[' + simpleMatch[3] + ']');
                    const outerLetters = validLetters.filter(l => l !== centerLetter);
                    const gameData = { centerLetter, outerLetters, validLetters, answers, pangrams: [] };

                    const pangramMatch = pageSource.match(/"pangrams":\s*\[([^\]]+)\]/);
                    if (pangramMatch) {
                        try { gameData.pangrams = JSON.parse('[' + pangramMatch[1] + ']'); }
                        catch (e) { /* ignore malformed pangrams */ }
                    }

                    return gameData;
                } catch (e) { /* malformed capture group — fall through */ }
            }

            // Approach 3b: same simpler pattern applied to each <script> tag individually.
            // Handles cases where the data is in a separate inline script rather than the HTML.
            for (const script of document.querySelectorAll('script')) {
                const content = script.textContent || script.innerHTML;
                if (!content.includes('"validLetters"') || !content.includes('"answers"')) continue;

                const m = content.match(simplePattern);
                if (m) {
                    try {
                        const centerLetter = m[1];
                        const validLetters = JSON.parse('[' + m[2] + ']');
                        const answers = JSON.parse('[' + m[3] + ']');
                        const outerLetters = validLetters.filter(l => l !== centerLetter);
                        return { centerLetter, outerLetters, validLetters, answers, pangrams: [] };
                    } catch (e) { /* malformed capture group — try next script */ }
                }
            }

        } catch (error) {
            console.error('Error extracting game data:', error);
        }

        return null;
    }

    // Listen for messages from the side panel (popup.js).
    // Responds synchronously — no async work needed.
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractLetters') {
            sendResponse(extractLetters());
        }
    });

})();
