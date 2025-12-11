import { useState } from "react";
import Card from "./Card";

export default function RecordList({ records, onUpdate, onDelete }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? records : records.filter(r => r.status === filter);

  return (
    <div className="container">
      <h1 className="card-title" style={{ marginBottom: 18 }}>Автосервис — Записи</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className={`pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все ({records.length})</button>
          <button className={`pill ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>В работе ({records.filter(r => r.status === 'PENDING').length})</button>
          <button className={`pill ${filter === 'PAID' ? 'active' : ''}`} onClick={() => setFilter('PAID')}>Оплачено ({records.filter(r => r.status === 'PAID').length})</button>
          <button className={`pill ${filter === 'CANCELLED' ? 'active' : ''}`} onClick={() => setFilter('CANCELLED')}>Отменено ({records.filter(r => r.status === 'CANCELLED').length})</button>
        </div>
        <div className="small">Показано: {filtered.length}</div>
      </div>

      {filtered.length === 0 ? (
        <p className="small">Записей нет</p>
      ) : (
        <div className="card-grid">
          {filtered.map((record) => (
            <Card key={record.id} record={record} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
