import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8000";

export default function ShiftLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, open, close

  // Используем useCallback чтобы fetchLogs не менялась каждый рендер
  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const query = user.role === "operator" ? `?operator_id=${user.id}` : "";
      const response = await fetch(`${API_BASE_URL}/shifts/logs${query}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Ошибка загрузки логов:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = filter === "all" ? logs : logs.filter(log => log.action === filter);

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const calculateDuration = (log) => {
    if (!log.shift_start || !log.shift_end) return "-";
    const start = new Date(log.shift_start);
    const end = new Date(log.shift_end);
    const diff = Math.floor((end - start) / 1000); // в секундах
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", color: "white", marginBottom: "24px" }}>📋 Логи смен</h1>

      {/* Фильтры */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "10px 20px",
            background: filter === "all" ? "#3b82f6" : "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Все ({logs.length})
        </button>
        <button
          onClick={() => setFilter("open")}
          style={{
            padding: "10px 20px",
            background: filter === "open" ? "#10b981" : "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Открыто ({logs.filter(l => l.action === "open").length})
        </button>
        <button
          onClick={() => setFilter("close")}
          style={{
            padding: "10px 20px",
            background: filter === "close" ? "#ef4444" : "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Закрыто ({logs.filter(l => l.action === "close").length})
        </button>
      </div>

      {/* Таблица логов */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "white", fontSize: "1.2rem" }}>
          Загрузка логов...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          background: "#1f2937", 
          borderRadius: "12px",
          color: "#9ca3af"
        }}>
          Логов смен не найдено
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
          }}>
            <thead>
              <tr style={{ background: "#1e40af" }}>
                <th style={{ padding: "16px", textAlign: "left", color: "white", fontWeight: "bold" }}>Оператор</th>
                <th style={{ padding: "16px", textAlign: "left", color: "white", fontWeight: "bold" }}>Действие</th>
                <th style={{ padding: "16px", textAlign: "left", color: "white", fontWeight: "bold" }}>Время</th>
                <th style={{ padding: "16px", textAlign: "left", color: "white", fontWeight: "bold" }}>Начало смены</th>
                <th style={{ padding: "16px", textAlign: "left", color: "white", fontWeight: "bold" }}>Конец смены</th>
                <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "bold" }}>Длительность</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={log.id} style={{
                  background: idx % 2 === 0 ? "white" : "#f9fafb",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <td style={{ padding: "16px", color: "#1f2937", fontWeight: "500" }}>{log.operator_name}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      color: "white",
                      background: log.action === "open" ? "#10b981" : "#ef4444",
                      fontSize: "0.9rem"
                    }}>
                      {log.action === "open" ? "🔓 Открыто" : "🔒 Закрыто"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", color: "#6b7280", fontSize: "0.9rem" }}>{formatTime(log.timestamp)}</td>
                  <td style={{ padding: "16px", color: "#6b7280", fontSize: "0.9rem" }}>{formatTime(log.shift_start)}</td>
                  <td style={{ padding: "16px", color: "#6b7280", fontSize: "0.9rem" }}>{formatTime(log.shift_end)}</td>
                  <td style={{ padding: "16px", textAlign: "center", fontWeight: "bold", color: "#1f2937" }}>{calculateDuration(log)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
