/**
 * background.js — Service worker for the NY Times Spelling Bee Solver extension.
 *
 * Handles the extension icon click by opening the solver as a Chrome Side Panel,
 * which stays docked to the browser window so it remains visible while the user
 * types answers into the puzzle.
 */

// Open (or focus) the side panel in the current window when the icon is clicked.
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});
