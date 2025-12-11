import { useState } from "react";
import { cancelOperation } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Card({ record, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [data, setData] = useState(record);
  const [editingPayment, setEditingPayment] = useState(false);
  const [editingCancel, setEditingCancel] = useState(false);
  const [amount, setAmount] = useState(data.price);
  const [comment, setComment] = useState(data.comment || "");
  const [cancelReason, setCancelReason] = useState(data.cancel_reason || "");

  const statusClass = {
    PENDING: "pending",
    PAID: "paid",
    CANCELLED: "cancelled",
  }[data.status];

  const statusText = {
    PENDING: "Ожидает оплаты",
    PAID: "Оплачено",
    CANCELLED: "Отменено",
  }[data.status];

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    const updated = { ...data, status: "PAID", price: Number(amount), comment };
    setData(updated);
    setEditingPayment(false);
    onUpdate(updated);
  };

  const handleSubmitCancel = async (e) => {
    e.preventDefault();
    try {
      const result = await cancelOperation(data.id, user.id, cancelReason);
      setData(result);
      setEditingCancel(false);
    } catch (err) {
      alert("Ошибка: " + err.message);
    }
  };

  return (
    <div className={`card`} data-status={statusClass}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h3 className="card-title">{data.client_name}</h3>
          <div className="small card-sub">{data.car} • {new Date(data.date).toLocaleDateString('ru-RU')}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div className={`pill status-${data.status.toLowerCase()}`}>{statusText}</div>
          <div className="small">{data.price} ₽</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="kv"><span className="small">Услуга:</span><strong>{data.service_id}</strong></div>
        {data.comment && <div style={{ marginTop: 8 }} className="small"><strong>Комментарий:</strong> {data.comment}</div>}
        {data.cancel_reason && <div style={{ marginTop: 8 }} className="small"><strong>Причина отмены:</strong> {data.cancel_reason}</div>}
      </div>

      <div className="action-bar">
        {user.role !== 'client' && (
          <>
            {data.status === 'PENDING' && !editingPayment && !editingCancel && (
              <>
                <button className="btn-primary" onClick={() => setEditingPayment(true)}>Оплатить</button>
                <button className="btn-outline" onClick={() => setEditingCancel(true)}>Отменить</button>
              </>
            )}
            <button className="btn-danger" onClick={() => onDelete(data.id)}>Удалить</button>
          </>
        )}
      </div>

      {editingPayment && user.role !== 'client' && (
        <form className="stack" onSubmit={handleSubmitPayment} style={{ marginTop: 12 }}>
          <input className="auth-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Сумма оплаты" required />
          <textarea className="auth-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Комментарий (необязательно)" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="auth-button" type="submit">Сохранить оплату</button>
            <button className="btn-gray" type="button" onClick={() => setEditingPayment(false)}>Отмена</button>
          </div>
        </form>
      )}

      {editingCancel && user.role !== 'client' && (
        <form className="stack" onSubmit={handleSubmitCancel} style={{ marginTop: 12 }}>
          <textarea className="auth-input" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Причина отмены" required />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-gray" type="submit">Сохранить отмену</button>
            <button className="btn-gray" type="button" onClick={() => setEditingCancel(false)}>Отмена</button>
          </div>
        </form>
      )}
    </div>
  );
}
