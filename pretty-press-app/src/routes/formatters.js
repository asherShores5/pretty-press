import prettier from 'prettier/standalone';
import parserPostcss from 'prettier/parser-postcss';
import { html as beautifyHtml } from 'js-beautify';
import { marked } from 'marked';

export class JsonFormatter {
  async format(code) {
    try {
      // First validate the JSON
      const parsed = JSON.parse(code);
      // For browser compatibility, stringify with proper indentation
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      throw new Error('Invalid JSON: ' + error.message);
    }
  }
}

export class HtmlFormatter {
  async format(code) {
    try {
      const formattedCode = beautifyHtml(code, {
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
      // Use the standalone prettier with explicit CSS parser plugin
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