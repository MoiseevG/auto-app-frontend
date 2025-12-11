import { useState, useEffect } from "react";
import OperationCard from "./OperationCard";

export default function OperationList({ currentUser }) {
  const [operations, setOperations] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/operations")
      .then(r => r.json())
      .then(data => setOperations(data));
  }, []);

  const filtered = filter === "all" 
    ? operations 
    : operations.filter(op => op.status === filter);

  const handlePay = (id, comment) => {
    fetch(`/operations/${id}/pay`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment })
    }).then(() => window.location.reload());
  };

  const handleCancel = (id, reason) => {
    fetch(`/operations/${id}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    }).then(() => window.location.reload());
  };

  const handleDelete = (id) => {
    if (confirm("Удалить операцию?")) {
      fetch(`/operations/${id}`, { method: "DELETE" })
        .then(() => setOperations(ops => ops.filter(op => op.id !== id)));
    }
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: "center", fontSize: "2.8rem", color: "white", margin: "40px 0" }}>
        Операции автосервиса
      </h1>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <button onClick={() => setFilter("all")} className="btn" style={{ background: "#8b5cf6", margin: "0 8px" }}>
          Все ({operations.length})
        </button>
        <button onClick={() => setFilter("PENDING")} className="btn" style={{ background: "#f59e0b" }}>
          В работе
        </button>
        <button onClick={() => setFilter("PAID")} className="btn" style={{ background: "#10b981" }}>
          Оплачено
        </button>
        <button onClick={() => setFilter("CANCELLED")} className="btn" style={{ background: "#ef4444" }}>
          Отменено
        </button>
      </div>

      {filtered.map(op => (
        <OperationCard
          key={op.id}
          operation={op}
          currentUser={currentUser}
          onPay={handlePay}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}