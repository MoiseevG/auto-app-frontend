import { createContext, useContext, useState, useEffect } from "react";
import { loginUser as apiLogin, verifyUser as apiVerify, registerUser as apiRegister } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone) => {
    try {
      const response = await apiLogin(phone);
      // API returns 200 with empty body, so we just need to confirm the user exists
      return response;
    } catch (err) {
      throw err;
    }
  };

  const verify = async (phone, code) => {
    try {
      const data = await apiVerify(phone, code);
      // data should contain user info from backend
      // If API doesn't return user, we need to extract user info from response
      if (data && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } else if (data && data.id) {
        // If API returns user directly
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      throw err;
    }
  };

  const register = async (phone, name) => {
    try {
      const response = await apiRegister(phone, name);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verify, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
