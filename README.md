# NY Times Spelling Bee Solver

A Chrome extension that solves the NY Times Spelling Bee puzzle. It reads the official answer list directly from the page and displays all valid words in a docked side panel that stays visible while you type.

> **Disclaimer:** This is a cheat tool. It's intended to enhance your experience — use it to learn new words, get unstuck, or explore what's possible with the day's letters — not to replace the fun of playing. Use it as much or as little as you like.

## Features

- **Official answers** — extracts the game's own answer list from the page, so results are always complete and correct
- **Pangram highlighting** — pangrams (words using all 7 letters) are pinned to the top and highlighted
- **Sorting** — sort words by shortest first, longest first, or A→Z
- **Length filter** — narrow results by minimum and maximum word length
- **Side panel** — docked to the browser window so it stays open while you type in the puzzle
- **Fallback mode** — if the page data can't be read, falls back to a built-in word list

## Requirements

- Chrome 114 or newer (required for the Side Panel API)

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the project folder
5. The extension icon will appear in the Chrome toolbar

## Usage

1. Open the [NY Times Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee) in a tab
2. Click the extension icon to open the side panel
3. Click **Get Letters** to extract the puzzle letters from the page
4. Click **Get Answers** to display all valid words
5. Use the **Min/Max** inputs to filter by word length
6. Use the **Sort** dropdown to reorder the list — pangrams always stay on top

## How It Works

When you click Get Letters, the extension injects a content script into the NYT tab. That script attempts to extract the game data using three strategies, in order of reliability:

1. **Page global** — reads `window.gameData.today` if the page exposes it
2. **HTML regex** — scans the page source for the embedded JSON puzzle object
3. **DOM fallback** — reads letter text directly from the puzzle's SVG elements

When full game data is found, Get Answers shows the official answer list. Otherwise it falls back to filtering a built-in word list against the Spelling Bee rules (must contain the center letter, all letters must come from the 7 available letters).

## Legal

This project is not affiliated with, endorsed by, or connected to The New York Times Company in any way. "Spelling Bee" is a trademark of The New York Times.

The extension does not scrape, store, or redistribute any NYT content. It only reads puzzle data that your own browser has already downloaded as part of loading the page — no requests are made to NYT servers beyond what normal page load requires. A valid NYT subscription or free access is still needed to use the puzzle.

Users are responsible for ensuring their use complies with the [NY Times Terms of Service](https://help.nytimes.com/115014893428-Terms-of-Service).

## File Structure

```text
SpellingBeeSolver/
├── manifest.json       # Extension config (permissions, side panel, content script)
├── popup.html          # Side panel UI and styles
└── JS/
    ├── popup.js        # Side panel logic (extraction, filtering, rendering)
    ├── content.js      # Injected into the NYT page to extract puzzle data
    └── background.js   # Service worker — opens the side panel on icon click
```
