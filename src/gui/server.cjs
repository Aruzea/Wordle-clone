'use strict';

const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '..', 'core',)));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'wordle.html'));
});

app.get('/spellcheck', async (req, res) => {
  const word = req.query.check;
  const url = `http://agilec.cs.uh.edu/spellcheck?check=${word}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/words', async(req,res) => {
  const url = 'https://agilec.cs.uh.edu/words'

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
