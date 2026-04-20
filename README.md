# PrettyPress

A fast, fully browser-based code and document formatter. Paste or drop in your code, hit format, and get clean output instantly — no server, no installs.

Try it live at: [prettypress.ashershores.com](https://prettypress.ashershores.com)

![image](https://github.com/user-attachments/assets/6fff7de9-93f7-4637-9422-17f2a1f728cd)

## Features

**8 supported languages**
| Language | Format | Minify |
|---|---|---|
| JSON | ✓ | ✓ |
| HTML | ✓ | ✓ |
| CSS | ✓ | ✓ |
| JavaScript | ✓ | ✓ |
| TypeScript | ✓ | — |
| XML | ✓ | ✓ |
| SQL | ✓ | ✓ |
| Markdown → HTML | ✓ | — |

**Editor**
- Ace Editor with syntax highlighting for all supported languages
- Word wrap toggle and font size controls (A− / A+), both persisted across sessions
- Line/column cursor position and character count in the status bar
- `Ctrl+Enter` / `Cmd+Enter` keyboard shortcut to format

**Input**
- Drag and drop a file onto the input panel to load it
- Load file button with auto language detection from file extension
- Input is auto-saved to `localStorage` per language — restored on next visit

**Output**
- Copy to clipboard with one click
- Download output as the correct file type (`.json`, `.ts`, `.sql`, etc.)
- Live preview for HTML and Markdown output in a sandboxed iframe
- Minify mode with size reduction percentage shown in the status bar

**Diff view**
- Switch to Diff mode to see exactly what the formatter changed
- Line-level diff using LCS — green for added lines, red for removed
- Copy diff as `+/-` prefixed plain text

## Tech Stack

- HTML / CSS / JavaScript (no framework)
- [Ace Editor](https://ace.c9.io/) — code editing and syntax highlighting
- [Prettier](https://prettier.io/) — JavaScript, TypeScript, and CSS formatting
- [js-beautify](https://github.com/beautify-web/js-beautify) — HTML formatting
- [Marked](https://marked.js.org/) — Markdown to HTML conversion
- [Vite](https://vitejs.dev/) — build tooling
- Hosted on [AWS Amplify](https://aws.amazon.com/amplify/)

All formatting runs entirely in the browser — no data is sent to any server.

## Development

```bash
git clone https://github.com/asherShores5/pretty-press.git
cd pretty-press/pretty-press-app
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build   # outputs to dist/
```

Configured for AWS Amplify hosting. Push to the connected branch to deploy.

## License

Apache License 2.0

## Author

[Asher Shores](https://github.com/asherShores5)
