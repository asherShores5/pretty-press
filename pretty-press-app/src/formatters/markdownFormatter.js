// File: src/formatters/markdownFormatter.js
const marked = require('marked');

class MarkdownFormatter {
  async format(code) {
    try {
      // Convert markdown to HTML
      const html = marked.parse(code);
      return html;
    } catch (error) {
      throw new Error('Invalid Markdown: ' + error.message);
    }
  }
}

module.exports = new MarkdownFormatter();