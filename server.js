// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;
// The backend URL to which `/api` requests will be proxied.
// In Railway set the `BACKEND_URL` env var to your backend (include https://).
// Local default uses localhost for development; if you prefer you can set
// the production backend URL here, but it's better to set it in Railway envs.
const BACKEND_URL = process.env.BACKEND_URL || 'https://auto-app-backend-production.up.railway.app';

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build static files
app.use(express.static(path.join(__dirname, 'build')));

// Helper function to proxy requests
const proxyRequest = async (req, res) => {
  const targetPath = req.originalUrl.replace(/^\/api/, '') || '/';
  const url = `${BACKEND_URL}${targetPath}`;
  console.log(`[PROXY] ${req.method} ${url}`);
  try {
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers },
    };
    // Avoid sending the original Host header to the backend
    if (fetchOptions.headers) delete fetchOptions.headers.host;
    if (fetchOptions.headers) delete fetchOptions.headers['content-length'];
    
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Правильно передаём тело запроса
      if (req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }
      fetchOptions.headers['content-type'] = 'application/json';
    }
    const response = await fetch(url, fetchOptions);
    // Forward status and JSON response
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (err) {
    console.error(`[PROXY ERROR] ${req.method} ${url}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

// API proxy - forward all /api/* requests to FastAPI backend with ALL methods
// Use RegExp route to avoid path-to-regexp errors with '*' token
// Lightweight health route to verify the Express server and /api handling are active
app.get('/api/_health', (req, res) => {
  res.json({ ok: true, backend: BACKEND_URL });
});

app.all(/^\/api/, proxyRequest);

// Serve index.html for all other SPA routes
// This MUST come AFTER /api routes to avoid catching API calls
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Backend API proxied from: ${BACKEND_URL}`);
});
