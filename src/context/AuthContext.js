const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://auto-app-backend-production.up.railway.app';

export const loginUser = async (phone) => {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  return res.json();
};

export const verifyUser = async (phone, code) => {
  const res = await fetch(`${BACKEND_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });
  return res.json();
};

export const registerUser = async (phone, name) => {
  const res = await fetch(`${BACKEND_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name })
  });
  return res.json();
};
