// File: src/routes/formatters.js
const express = require('express');
const router = express.Router();
const jsonFormatter = require('../formatters/jsonFormatter');
const markdownFormatter = require('../formatters/markdownFormatter');
const htmlFormatter = require('../formatters/htmlFormatter');
const cssFormatter = require('../formatters/cssFormatter');

router.post('/json', async (req, res) => {
  try {
    const { code } = req.body;
    const formattedCode = await jsonFormatter.format(code);
    res.json({ formatted: formattedCode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/markdown', async (req, res) => {
  try {
    const { code } = req.body;
    const formattedCode = await markdownFormatter.format(code);
    res.json({ formatted: formattedCode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/html', async (req, res) => {
  try {
    const { code } = req.body;
    const formattedCode = await htmlFormatter.format(code);
    res.json({ formatted: formattedCode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/css', async (req, res) => {
  try {
    const { code } = req.body;
    const formattedCode = await cssFormatter.format(code);
    res.json({ formatted: formattedCode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;