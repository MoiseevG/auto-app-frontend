import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_TIMEOUT = 8000;

  const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (phone) => {
    const digits = String(phone).replace(/\D/g, "");
    const normalized = digits.length === 11 ? `+${digits[0]}${digits.slice(1)}` : String(phone);
    let res;
    try {
      res = await fetchWithTimeout("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized })
      });
    } catch (e) {
      throw new Error("Сервер авторизации недоступен");
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Пользователь не найден");
    }
    return res.json();
  };

  const verify = async (phone, code) => {
    const digits = String(phone).replace(/\D/g, "");
    const normalized = digits.length === 11 ? `+${digits[0]}${digits.slice(1)}` : String(phone);
    let res;
    try {
      res = await fetchWithTimeout("http://localhost:8000/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, code })
      });
    } catch (e) {
      throw new Error("Сервер авторизации недоступен");
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Неверный код");
    }
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verify, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
