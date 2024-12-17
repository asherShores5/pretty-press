// File: src/app.js
const express = require('express');
const cors = require('cors');
const formattersRouter = require('./routes/formatters');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/format', formattersRouter);

app.listen(PORT, () => {
  console.log(`PrettyPress server running on port ${PORT}`);
});