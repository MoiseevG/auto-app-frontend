// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Чтобы корректно использовать __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build static files
app.use(express.static(path.join(__dirname, 'build')));

// API proxy - forward all /api requests to FastAPI backend
app.use('/api', async (req, res) => {
  const url = `${BACKEND_URL}${req.path.replace('/api', '')}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
      fetchOptions.headers['content-type'] = 'application/json';
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html for all other SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Backend API proxied from: ${BACKEND_URL}`);
});
