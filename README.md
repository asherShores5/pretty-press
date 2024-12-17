# PrettyPress

A fast, browser-based code and document formatter. Format JSON, HTML, CSS, and Markdown with instant preview capabilities.

Try it live at: [prettypress.ashershores.com](https://prettypress.ashershores.com)

![image](https://github.com/user-attachments/assets/6fff7de9-93f7-4637-9422-17f2a1f728cd)

## Features

- **Multiple Format Support**
  - JSON formatting and validation
  - HTML beautification
  - CSS formatting
  - Markdown to HTML conversion

- **Real-time Preview**
  - Live preview for HTML and Markdown
  - Split-pane interface for input and output
  - Syntax highlighting for all supported formats

- **Developer-Friendly**
  - Copy formatted code with one click
  - Clear visual feedback
  - Configurable formatting options
  - Ace editor integration for better code editing

## Tech Stack

- **Frontend**
  - HTML/CSS/JavaScript
  - Ace Editor for code editing
  - Marked.js for Markdown processing
  - js-beautify for HTML formatting
  - Prettier for CSS formatting

- **Backend**
  - Originally built with Express.js
  - Converted to static site for improved performance
  - Hosted on AWS Amplify

## Development

1. Clone the repository:
```bash
git clone https://github.com/asherShores5/pretty-press.git
```

2. Install dependencies:
```bash
cd pretty-press
npm install
```

3. Start development server:
```bash
npm run dev
```

## Building and Deployment

Build the project:
```bash
npm run build
```

The project is configured for AWS Amplify hosting. The build outputs to the `dist` directory.

## Third-Party Libraries

- [Ace Editor](https://ace.c9.io/) - Code editor
- [Prettier](https://prettier.io/) - Code formatting
- [js-beautify](https://github.com/beautify-web/js-beautify) - HTML formatting
- [Marked](https://marked.js.org/) - Markdown processing

## License

Apache License 2.0

## Author

Asher Shores
