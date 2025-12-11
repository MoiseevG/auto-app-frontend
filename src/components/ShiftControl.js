import { useState, useEffect, useCallback } from "react";
import { getCurrentShift, openShift as apiOpenShift, closeShift as apiCloseShift } from "../services/api";

export default function ShiftControl({ currentUser, onShiftChange }) {
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkShift = useCallback(() => {
    if (currentUser?.role === "operator") {
      getCurrentShift(currentUser.id)
        .then(shift => {
          setCurrentShift(shift);
          if (onShiftChange) onShiftChange(shift);
          setLoading(false);
        })
        .catch(err => {
          console.log("Shift check error:", err);
          setCurrentShift(null);
          if (onShiftChange) onShiftChange(null);
          setLoading(false);
        });
    }
  }, [currentUser, onShiftChange]);

  useEffect(() => {
    checkShift();
  }, [checkShift]);

  const openShift = () => {
    setLoading(true);
    apiOpenShift(currentUser.id)
      .then(shift => {
        setCurrentShift(shift);
        if (onShiftChange) onShiftChange(shift);
        setLoading(false);
      })
      .catch(err => {
        alert("Ошибка: " + err.message);
        setLoading(false);
      });
  };

  const closeShift = () => {
    if (window.confirm("Закрыть смену?")) {
      setLoading(true);
      apiCloseShift(currentShift.id, currentUser.id)
        .then(() => {
          setCurrentShift(null);
          if (onShiftChange) onShiftChange(null);
          setLoading(false);
        })
        .catch(err => {
          alert("Ошибка: " + err.message);
          setLoading(false);
        });
    }
  };

  if (currentUser?.role !== "operator") return null;

  return (
    <div style={{ textAlign: "center", margin: "40px 0" }}>
      {loading ? (
        <p style={{ fontSize: "1.5rem", color: "white" }}>Загрузка...</p>
      ) : currentShift ? (
        <div>
          <p style={{ fontSize: "1.5rem", color: "#10b981" }}>
            ✓ Смена открыта: {new Date(currentShift.start_time).toLocaleString("ru-RU")}
          </p>
          <button onClick={closeShift} className="btn" style={{ background: "#ef4444" }}>
            Закрыть смену
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: "1.5rem", color: "#f59e0b" }}>✗ Смена не открыта</p>
          <button onClick={openShift} className="btn" style={{ background: "#10b981" }}>
            Открыть смену
          </button>
        </div>
      )}
    </div>
  );
}
