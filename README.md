# KNIGHT Chess Analysis

Static GitHub Pages chess workspace with screen preview, interactive position editor, FEN validation and Stockfish browser analysis.

## Important limitation
Screen sharing is a live preview only. Automatic chess-piece recognition from the shared image is not implemented. Enter the exact position with the board editor or paste FEN before requesting a move. Verify the position before relying on engine output.

## Dependencies
- chess.js 1.4.0 (ES module via jsDelivr)
- Stockfish 19 lite single-threaded (WebAssembly via jsDelivr, GPL-3.0)

## Deploy
GitHub Pages serves the root index.html from main.