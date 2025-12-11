const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build static files
app.use(express.static(path.join(__dirname, 'build')));

// API proxy - forward all /api requests to FastAPI backend
app.use('/api', (req, res) => {
  const url = `${BACKEND_URL}${req.path.replace('/api', '')}`;
  
  fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  })
    .then(r => r.json().then(data => ({ status: r.status, data })))
    .then(({ status, data }) => res.status(status).json(data))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Backend API proxied from: ${BACKEND_URL}`);
});
