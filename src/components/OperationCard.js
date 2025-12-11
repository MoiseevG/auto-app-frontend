import { useState } from "react";

export default function OperationCard({ operation, currentUser, onPay, onCancel, onDelete }) {
  const isOperator = currentUser?.role === "operator";
  const isOpenShift = currentUser?.currentShift; // предполагаем, что в auth есть currentShift

  const statusClass = {
    PENDING: "status-pending",
    PAID: "status-paid",
    CANCELLED: "status-cancelled"
  }[operation.status] || "";

  const statusText = {
    PENDING: "Ожидает оплаты",
    PAID: "Оплачено",
    CANCELLED: "Отменено"
  }[operation.status] || "Неизвестно";

  const handlePay = () => {
    const comment = prompt("Комментарий к оплате", "");
    onPay(operation.id, comment);
  };

  const handleCancel = () => {
    const reason = prompt("Причина отмены");
    if (reason) onCancel(operation.id, reason);
  };

  return (
    <div className={`record-card ${statusClass}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#1e40af" }}>
          {operation.client_name}
        </h3>
        <div className={`status-badge ${statusClass}`}>
          {statusText}
        </div>
      </div>

      <div className="info-grid">
        <div><strong>Авто:</strong> {operation.car}</div>
        <div><strong>Услуга:</strong> {operation.service?.name || "—"}</div>
        <div><strong>Мастер:</strong> {operation.master?.name || "Не назначен"}</div>
        <div><strong>Сумма:</strong> <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#10b981" }}>{operation.price} ₽</span></div>
        <div><strong>Дата:</strong> {new Date(operation.date).toLocaleDateString("ru-RU")}</div>
        <div><strong>Оператор:</strong> {operation.operator?.name || "—"}</div>
      </div>

      {operation.comment && (
        <div style={{ background: "#ebf8ff", padding: "12px", borderRadius: "12px", margin: "16px 0" }}>
          <strong>Комментарий:</strong> {operation.comment}
        </div>
      )}

      {operation.cancel_reason && (
        <div style={{ background: "#fee2e2", padding: "12px", borderRadius: "12px", margin: "16px 0" }}>
          <strong>Причина отмены:</strong> {operation.cancel_reason}
        </div>
      )}

      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        {isOperator && isOpenShift && operation.status === "PENDING" && (
          <>
            <button onClick={handlePay} className="btn btn-pay">
              Провести оплату
            </button>
            <button onClick={handleCancel} className="btn btn-cancel">
              Отменить
            </button>
          </>
        )}
        <button onClick={() => onDelete(operation.id)} className="btn btn-delete">
          Удалить
        </button>
      </div>
    </div>
  );
}