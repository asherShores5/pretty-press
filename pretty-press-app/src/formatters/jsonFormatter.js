// File: src/formatters/jsonFormatter.js
const prettier = require('prettier');

class JsonFormatter {
  async format(code) {
    try {
      // First validate the JSON
      JSON.parse(code);
      
      // Then format it
      const formattedCode = prettier.format(code, {
        parser: 'json',
        printWidth: 80,
        tabWidth: 2
      });
      
      return formattedCode;
    } catch (error) {
      throw new Error('Invalid JSON: ' + error.message);
    }
  }
}

module.exports = new JsonFormatter();