const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const recipesRouter = require('./routes/recipes');
const filterOptions = require('./data/filterOptions');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Opções para montar os selects de filtro no frontend (país, dieta, etc.)
app.get('/api/filters', (req, res) => {
  res.json(filterOptions);
});

app.use('/api/recipes', recipesRouter);

app.listen(PORT, () => {
  console.log(`Remi backend rodando em http://localhost:${PORT}`);
});
