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

console.log('🚀 Frontend Server Starting...');
console.log(`📍 Port: ${PORT}`);
console.log(`🔗 Backend URL: ${BACKEND_URL}`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
      headers: { 
        'Content-Type': 'application/json'
      },
    };
    
    // Copy relevant headers
    if (req.headers.authorization) {
      fetchOptions.headers.authorization = req.headers.authorization;
    }
    if (req.headers['user-agent']) {
      fetchOptions.headers['user-agent'] = req.headers['user-agent'];
    }
    
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Правильно передаём тело запроса
      if (req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }
    }
    
    console.log(`[FETCH] Calling: ${url} with method ${req.method}`);
    const response = await fetch(url, fetchOptions);
    console.log(`[RESPONSE] Status: ${response.status}`);
    
    // Forward status and response
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (err) {
    console.error(`[PROXY ERROR] ${req.method} ${url}:`, err);
    res.status(502).json({ 
      error: 'Bad Gateway',
      message: err.message,
      backend: BACKEND_URL
    });
  }
};

// Health check endpoint
app.get('/api/_health', (req, res) => {
  res.json({ 
    ok: true, 
    backend: BACKEND_URL,
    timestamp: new Date().toISOString()
  });
});

// API proxy - forward all /api/* requests to FastAPI backend
app.all(/^\/api/, proxyRequest);

// Serve index.html for all other SPA routes (MUST come AFTER /api routes)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Backend API proxied from: ${BACKEND_URL}`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/api/_health`);
});
