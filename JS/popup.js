/**
 * popup.js — Side panel logic for the NY Times Spelling Bee Solver.
 *
 * Flow:
 *  1. User clicks "Get Letters" → injects content.js into the NYT tab,
 *     sends it an extractLetters message, and displays the 7 letters.
 *  2. User clicks "Get Answers" → filters the official answer list (or falls
 *     back to basicWords) and renders matching words sorted by the chosen order.
 *  3. Changing the Sort dropdown re-renders the last result without refetching.
 */

/** Letters extracted from the current puzzle. Set once per "Get Letters" click. */
let currentLetters = null;

/**
 * Fallback word list used when the NYT page doesn't expose its answer data.
 * Only contains common 4-letter words — the official data path is strongly preferred.
 */
const basicWords = [
    "able", "about", "above", "acid", "acre", "acts", "aged", "aids", "aims", "ales", "also", "amid", "ante", "ants", "arch", "area", "arms", "army", "arts", "atom", "aunt", "auto", "away", "axis", "baby", "back", "bail", "ball", "band", "bank", "bare", "barn", "base", "bath", "beam", "bean", "bear", "beat", "been", "beer", "bell", "belt", "bend", "best", "beta", "bias", "bike", "bill", "bird", "bite", "blow", "blue", "boat", "body", "boil", "bold", "bone", "book", "boom", "born", "boss", "both", "bowl", "bulk", "burn", "bush", "busy", "cake", "call", "calm", "came", "camp", "card", "care", "cart", "case", "cash", "cast", "cave", "cell", "chat", "chip", "city", "clay", "clip", "club", "coal", "coat", "code", "cold", "come", "cook", "cool", "copy", "cord", "corn", "cost", "crew", "crop", "cube", "cute", "dark", "data", "date", "dawn", "days", "dead", "deal", "dean", "dear", "debt", "deck", "deep", "deer", "demo", "deny", "desk", "diet", "dish", "dock", "does", "done", "door", "dose", "down", "draw", "drew", "drop", "drug", "drum", "dual", "duck", "dude", "dump", "dust", "duty", "each", "earl", "earn", "ears", "east", "easy", "echo", "edge", "edit", "else", "emit", "ends", "epic", "even", "ever", "evil", "exit", "eyes", "face", "fact", "fail", "fair", "fall", "fame", "fare", "farm", "fast", "fate", "fear", "feed", "feel", "feet", "fell", "felt", "file", "fill", "film", "find", "fine", "fire", "firm", "fish", "five", "flag", "flat", "fled", "flip", "flow", "foam", "folk", "food", "foot", "ford", "fore", "fork", "form", "fort", "four", "free", "from", "fuel", "full", "fund", "gain", "game", "gate", "gave", "gear", "gift", "girl", "give", "glad", "goal", "goat", "goes", "gold", "golf", "gone", "good", "grab", "gram", "grew", "grid", "grip", "grow", "gulf", "hair", "half", "hall", "hand", "hang", "hard", "harm", "hate", "have", "head", "hear", "heat", "held", "hell", "help", "here", "hero", "hide", "high", "hill", "hint", "hire", "hits", "hold", "hole", "holy", "home", "hope", "host", "hour", "huge", "hung", "hunt", "hurt", "icon", "idea", "idle", "inch", "info", "iron", "item", "jail", "jane", "jazz", "jobs", "join", "joke", "jump", "june", "jury", "just", "keen", "keep", "kept", "keys", "kick", "kill", "kind", "king", "knee", "knew", "know", "lack", "lady", "laid", "lake", "land", "lane", "last", "late", "lawn", "laws", "lead", "leaf", "lean", "left", "legs", "lens", "less", "lied", "life", "lift", "like", "line", "link", "list", "live", "loan", "lock", "lone", "long", "look", "loop", "lord", "lose", "loss", "lost", "lots", "loud", "love", "luck", "lung", "made", "mail", "main", "make", "male", "mall", "many", "maps", "mark", "mars", "mass", "math", "meal", "mean", "meat", "meet", "memo", "menu", "mere", "mesh", "mice", "mild", "mile", "milk", "mind", "mine", "mint", "miss", "mode", "mood", "moon", "more", "most", "move", "much", "must", "name", "navy", "near", "neat", "neck", "need", "neon", "nest", "news", "next", "nice", "nine", "node", "noon", "norm", "nose", "note", "noun", "nude", "nuts", "oath", "odds", "oils", "okay", "once", "ones", "only", "onto", "open", "oral", "oval", "over", "pace", "pack", "page", "paid", "pain", "pair", "palm", "park", "part", "pass", "past", "path", "peak", "pick", "pile", "pine", "pink", "pipe", "plan", "play", "plot", "plus", "poem", "poet", "pole", "poll", "pool", "poor", "port", "post", "pour", "pull", "pure", "push", "quit", "race", "rail", "rain", "rank", "rate", "rats", "rays", "read", "real", "rear", "rely", "rent", "rest", "rice", "rich", "ride", "ring", "rise", "risk", "road", "rock", "role", "roll", "roof", "room", "root", "rope", "rose", "ruby", "rule", "rush", "safe", "said", "sake", "sale", "salt", "same", "sand", "save", "says", "seal", "seat", "seed", "seek", "seem", "seen", "self", "sell", "send", "sent", "ship", "shoe", "shop", "shot", "show", "shut", "sick", "side", "sign", "silk", "sing", "sink", "site", "size", "skin", "skip", "slip", "slow", "snap", "snow", "soap", "sock", "soft", "soil", "sold", "sole", "some", "song", "soon", "sort", "soul", "soup", "spin", "spot", "star", "stay", "step", "stop", "such", "suit", "sure", "swim", "take", "tale", "talk", "tall", "tank", "tape", "task", "team", "tech", "tell", "tend", "tent", "term", "test", "text", "than", "that", "them", "then", "they", "thin", "this", "thus", "tide", "tied", "ties", "time", "tiny", "tips", "tire", "told", "tone", "took", "tool", "tops", "torn", "tour", "town", "toys", "trap", "tree", "trip", "true", "tube", "tune", "turn", "twin", "type", "unit", "upon", "used", "user", "uses", "vary", "vast", "vein", "very", "vice", "view", "vote", "wage", "wait", "wake", "walk", "wall", "want", "ward", "warm", "warn", "wash", "wave", "ways", "weak", "wear", "week", "well", "went", "were", "west", "what", "when", "whom", "wide", "wife", "wild", "will", "wind", "wine", "wing", "wire", "wise", "wish", "with", "wolf", "wood", "wool", "word", "work", "worn", "yard", "year", "zero", "zone"
];

document.addEventListener('DOMContentLoaded', function () {
    const extractBtn = document.getElementById('extractBtn');
    const actualAnswersBtn = document.getElementById('actualAnswersBtn');
    const lettersDisplay = document.getElementById('lettersDisplay');
    const wordList = document.getElementById('wordList');
    const status = document.getElementById('status');
    const minLengthInput = document.getElementById('minLength');
    const maxLengthInput = document.getElementById('maxLength');
    const sortSelect = document.getElementById('sortOrder');

    /**
     * Cached result of the last displayWords() call.
     * Stored so the sort dropdown can re-render without re-fetching data.
     */
    let lastWords = null;
    let lastMethod = null;
    let lastKnownPangrams = [];

    // Re-render the current word list whenever the sort order changes.
    sortSelect.addEventListener('change', function () {
        if (lastWords) displayWords(lastWords, lastMethod, lastKnownPangrams);
    });

    /**
     * "Get Letters" button handler.
     * Finds the NYT Spelling Bee tab, injects the content script if needed,
     * then requests the puzzle letters via message passing.
     */
    extractBtn.addEventListener('click', async function () {
        try {
            // Prefer an exact URL match; fall back to a broader NYT search
            // in case the URL has query params or a slightly different path.
            let tabs = await chrome.tabs.query({
                url: '*://www.nytimes.com/puzzles/spelling-bee*'
            });

            if (tabs.length === 0) {
                const allNytTabs = await chrome.tabs.query({ url: '*://www.nytimes.com/*' });
                tabs = allNytTabs.filter(tab =>
                    tab.url.includes('spelling-bee') ||
                    tab.title.toLowerCase().includes('spelling bee')
                );
            }

            if (tabs.length === 0) {
                status.textContent = 'Please open NY Times Spelling Bee in a tab first';
                return;
            }

            const tab = tabs[0];
            status.textContent = 'Extracting letters...';

            // executeScript throws if the content script is already present — that's fine.
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
            } catch {
                // Already injected — safe to ignore
            }

            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractLetters' });

            if (response && response.center && response.outer.length > 0) {
                currentLetters = response;
                displayLetters(currentLetters);
                actualAnswersBtn.disabled = false;
                status.textContent = response.gameData?.answers
                    ? 'Letters extracted with official game data!'
                    : 'Letters extracted successfully!';
            } else {
                status.textContent = 'Could not find letters. Make sure you are on the Spelling Bee page.';
            }
        } catch (error) {
            status.textContent = 'Error extracting letters: ' + error.message;
        }
    });

    /**
     * "Get Answers" button handler.
     * Uses the official answer list embedded in the page when available,
     * otherwise falls back to filtering basicWords.
     */
    actualAnswersBtn.addEventListener('click', function () {
        if (!currentLetters) {
            status.textContent = 'Please get letters first.';
            return;
        }

        const minLength = parseInt(minLengthInput.value) || 4;
        const maxLength = parseInt(maxLengthInput.value) || 15;

        if (currentLetters.gameData?.answers) {
            const filtered = currentLetters.gameData.answers.filter(
                word => word.length >= minLength && word.length <= maxLength
            );
            displayWords(filtered, 'Official Answers', currentLetters.gameData.pangrams || []);
        } else {
            status.textContent = 'No game data found. Using dictionary fallback...';
            const words = findPossibleWords(currentLetters, minLength, maxLength);
            displayWords(words, 'Dictionary Fallback');
        }
    });

    /**
     * Renders the 7 puzzle letters in the letters display area.
     * @param {{ center: string, outer: string[] }} letters
     */
    function displayLetters(letters) {
        const centerLetter = letters.center.toUpperCase();
        const outerLetters = letters.outer.map(l => l.toUpperCase());

        lettersDisplay.innerHTML = `
            <div style="margin-bottom: 10px;">
                <div class="center-letter">${centerLetter}</div>
            </div>
            <div>
                ${outerLetters.map(l => `<span class="outer-letter">${l}</span>`).join('')}
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                Center letter: ${centerLetter} (must be in every word)
            </div>
        `;
    }

    /**
     * Filters basicWords to find valid Spelling Bee answers.
     * Used only when the page's embedded game data is unavailable.
     *
     * Rules:
     *  - Word length must be within [minLength, maxLength].
     *  - Word must contain the center letter.
     *  - Every letter in the word must be one of the 7 available letters
     *    (letters can repeat, but no new letters are allowed).
     *
     * @param {{ center: string, outer: string[] }} letters
     * @param {number} minLength
     * @param {number} maxLength
     * @returns {string[]} Matching words sorted shortest-first then alphabetically.
     */
    function findPossibleWords(letters, minLength, maxLength) {
        const centerLetter = letters.center.toLowerCase();
        const allAvailableSet = new Set([centerLetter, ...letters.outer.map(l => l.toLowerCase())]);
        const results = [];

        for (const word of basicWords) {
            if (word.length < minLength || word.length > maxLength) continue;
            if (!word.includes(centerLetter)) continue;

            const allLettersValid = [...new Set(word.split(''))].every(l => allAvailableSet.has(l));
            if (allLettersValid) results.push(word);
        }

        return results.sort((a, b) => a.length - b.length || a.localeCompare(b));
    }

    /**
     * Returns true if the word is a pangram — i.e. it uses all 7 puzzle letters.
     * Checks both by set-size comparison and against the official pangram list.
     *
     * @param {string} word
     * @param {Set<string>} allAvailableLetters - Set of all 7 puzzle letters (lowercase).
     * @param {string[]} knownPangrams - Official pangram list from game data (lowercase).
     * @returns {boolean}
     */
    function checkIsPangram(word, allAvailableLetters, knownPangrams) {
        return new Set(word.split('')).size === allAvailableLetters.size ||
            knownPangrams.includes(word.toLowerCase());
    }

    /**
     * Returns a sorted copy of words based on the current sort dropdown value.
     * Ties in length are broken alphabetically.
     *
     * @param {string[]} words
     * @returns {string[]}
     */
    function sortWords(words) {
        const order = sortSelect.value;
        return [...words].sort((a, b) => {
            if (order === 'longest') return b.length - a.length || a.localeCompare(b);
            if (order === 'alpha') return a.localeCompare(b);
            return a.length - b.length || a.localeCompare(b); // 'shortest' (default)
        });
    }

    /**
     * Renders a word list in the panel and updates the status bar.
     * Pangrams are always pinned to the top, then the remaining words
     * are sorted by the current sort order.
     *
     * Caches its arguments so the sort dropdown can re-render without
     * going back to the network or game data.
     *
     * @param {string[]} words - All words to display (unordered).
     * @param {string} [method='Dictionary'] - Label shown in the status bar.
     * @param {string[]} [knownPangrams=[]] - Official pangram list for highlight purposes.
     */
    function displayWords(words, method = 'Dictionary', knownPangrams = []) {
        lastWords = words;
        lastMethod = method;
        lastKnownPangrams = knownPangrams;

        const allAvailableLetters = new Set([currentLetters.center, ...currentLetters.outer]);

        // Split into pangrams (pinned top) and everything else, then sort each group.
        const pangrams = words.filter(w => checkIsPangram(w, allAvailableLetters, knownPangrams));
        const rest = words.filter(w => !checkIsPangram(w, allAvailableLetters, knownPangrams));
        const sorted = [...sortWords(pangrams), ...sortWords(rest)];

        if (sorted.length === 0) {
            wordList.innerHTML = `<div class="status">No words found</div>`;
        } else {
            wordList.innerHTML = sorted.map(word => {
                const isPangram = checkIsPangram(word, allAvailableLetters, knownPangrams);
                const pangramClass = isPangram ? 'pangram' : '';
                const pangramLabel = isPangram ? ' 🎯' : '';

                return `<div class="word-item ${pangramClass}">
                    <span>${word.toUpperCase()}${pangramLabel}</span>
                    <span class="word-length">${word.length}L</span>
                </div>`;
            }).join('');
        }

        wordList.style.display = 'block';

        // Build status line, appending total-count info when using official data.
        const pangramCount = pangrams.length;
        let additionalInfo = '';
        if (currentLetters.gameData && method === 'Official Answers') {
            const total = currentLetters.gameData.answers?.length ?? 0;
            const totalPangrams = currentLetters.gameData.pangrams?.length ?? 0;
            additionalInfo = ` (Total: ${total} words, ${totalPangrams} pangram${totalPangrams !== 1 ? 's' : ''})`;
        }

        const pangramSuffix = pangramCount > 0
            ? ` (${pangramCount} pangram${pangramCount > 1 ? 's' : ''})`
            : '';
        status.textContent = `Found ${words.length} words using ${method}${pangramSuffix}${additionalInfo}`;
    }
});
