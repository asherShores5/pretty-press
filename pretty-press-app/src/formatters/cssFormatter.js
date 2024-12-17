// File: src/formatters/cssFormatter.js
const prettier = require('prettier');

class CssFormatter {
  async format(code) {
    try {
      const formattedCode = prettier.format(code, {
        parser: 'css',
        printWidth: 80,
        tabWidth: 2
      });
      return formattedCode;
    } catch (error) {
      throw new Error('Invalid CSS: ' + error.message);
    }
  }
}

module.exports = new CssFormatter();