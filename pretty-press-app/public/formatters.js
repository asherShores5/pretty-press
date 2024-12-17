// public/formatters.js
import prettier from 'https://unpkg.com/prettier@2.8.8/esm/standalone.mjs';
import parserPostcss from 'https://unpkg.com/prettier@2.8.8/esm/parser-postcss.mjs';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

// Note: js-beautify needs to be loaded via script tag in index.html
export class JsonFormatter {
  async format(code) {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      throw new Error('Invalid JSON: ' + error.message);
    }
  }
}

export class HtmlFormatter {
  async format(code) {
    try {
      // Use the global js-beautify from window
      const formattedCode = window.html_beautify(code, {
        indent_size: 8,
        indent_char: '\t',
        indent_with_tabs: true,
        preserve_newlines: true,
        max_preserve_newlines: 1,
        wrap_line_length: 0,
        wrap_attributes: 'auto',
        wrap_attributes_indent_size: undefined,
        end_with_newline: true
      });
      return formattedCode;
    } catch (error) {
      throw new Error('Invalid HTML: ' + error.message);
    }
  }
}

export class CssFormatter {
  async format(code) {
    try {
      const formattedCode = prettier.format(code, {
        parser: 'css',
        plugins: [parserPostcss],
        printWidth: 80,
        tabWidth: 2,
        useTabs: false
      });
      return formattedCode;
    } catch (error) {
      throw new Error('Invalid CSS: ' + error.message);
    }
  }
}

export class MarkdownFormatter {
  async format(code) {
    try {
      const html = marked.parse(code);
      return html;
    } catch (error) {
      throw new Error('Invalid Markdown: ' + error.message);
    }
  }
}

// Create instances
export const formatters = {
  json: new JsonFormatter(),
  html: new HtmlFormatter(),
  css: new CssFormatter(),
  markdown: new MarkdownFormatter()
};