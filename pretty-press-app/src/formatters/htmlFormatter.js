// File: src/formatters/htmlFormatter.js
const prettify = require('js-beautify').html;

class HtmlFormatter {
  async format(code) {
    try {
      const formattedCode = prettify(code, {
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

module.exports = new HtmlFormatter();