import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getServices } from "../services/api";

const API_BASE_URL = "/api";

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [masters, setMasters] = useState([]);
  const [allMasters, setAllMasters] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [creatingMaster, setCreatingMaster] = useState(false);
  const [newMaster, setNewMaster] = useState({ name: "", phone: "" });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(err => console.error("Ошибка загрузки услуг:", err));

    if (user && user.role === 'operator') {
      fetch(`${API_BASE_URL}/users/masters`)
        .then(r => r.ok ? r.json() : [])
        .then(setAllMasters)
        .catch(() => setAllMasters([]));
    }
  }, [user]);

  const selectService = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service);

    setLoadingMasters(true);
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/masters`);
      if (response.ok) {
        const data = await response.json();
        setMasters(data);
      } else {
        setMasters([]);
      }
    } catch (err) {
      console.error("Ошибка загрузки мастеров:", err);
      setMasters([]);
    } finally {
      setLoadingMasters(false);
    }
  };

  const handleCreateMaster = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'operator') return alert('Только операторы могут добавлять мастеров');
    if (!newMaster.name || !newMaster.phone) return alert('Введите имя и телефон мастера');

    setCreatingMaster(true);
    try {
      const body = { name: newMaster.name, phone: newMaster.phone };
      const res = await fetch(`${API_BASE_URL}/users/create_master?operator_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw await res.json();
      const created = await res.json();
      setAllMasters(prev => [...prev, created]);
      setNewMaster({ name: '', phone: '' });
      alert('Мастер добавлен');
    } catch (err) {
      alert(err.detail || err.message || 'Ошибка при создании мастера');
    } finally {
      setCreatingMaster(false);
    }
  };

  const handleAssignMaster = async (masterId) => {
    if (!user || user.role !== 'operator') return alert('Только операторы могут назначать мастеров');
    if (!selectedService) return;
    setAssigning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/services/${selectedService.id}/assign-master?service_id=${selectedService.id}&master_id=${masterId}&operator_id=${user.id}`, { method: 'POST' });
      if (!res.ok) throw await res.json();
      alert('Мастер назначен');
      await selectService(selectedService.id);
    } catch (err) {
      alert(err.detail || err.message || 'Ошибка при назначении мастера');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="container">
      <h1 className="card-title" style={{ margin: '28px 0' }}>Услуги автосервиса</h1>

      <div className="card-grid">
        {services.map(service => (
          <div key={service.id} className="card" style={{ cursor: 'pointer' }} onClick={() => selectService(service.id)}>
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>{service.name}</h3>
            <div className="card-sub" style={{ marginTop: 6 }}>{service.price} ₽</div>
            <div className="small" style={{ marginTop: 8 }}>Нажмите для выбора</div>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="card-title">Услуга: "{selectedService.name}"</h2>
          <p className="card-sub">Стоимость: <strong>{selectedService.price} ₽</strong></p>

          <h3 style={{ marginTop: 16 }} className="card-sub">🔧 Мастера выполняющие эту услугу:</h3>
          {loadingMasters ? (
            <p className="small">Загрузка мастеров...</p>
          ) : masters.length > 0 ? (
            <div className="card-grid" style={{ marginTop: 12 }}>
              {masters.map(master => (
                <div key={master.id} className="card">
                  <p style={{ fontWeight: '700' }}>{master.name}</p>
                  <p className="small">📱 {master.phone}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="small" style={{ color: 'var(--danger)', marginTop: 12 }}>⚠️ Мастеров для этой услуги пока не найдено</p>
          )}

          {user && user.role === 'operator' && (
            <div style={{ marginTop: 18 }}>
              <h3 className="card-sub">Управление мастерами (Оператор)</h3>

              <div style={{ marginTop: 12 }}>
                <form onSubmit={handleCreateMaster} className="stack" style={{ maxWidth: 520 }}>
                  <div className="form-row">
                    <input className="auth-input" placeholder="Имя мастера" value={newMaster.name} onChange={e => setNewMaster(prev => ({ ...prev, name: e.target.value }))} />
                    <input className="auth-input" placeholder="Телефон (+7999...)" value={newMaster.phone} onChange={e => setNewMaster(prev => ({ ...prev, phone: e.target.value }))} />
                  </div>
                  <div className="form-actions">
                    <button className="btn-primary" disabled={creatingMaster}>{creatingMaster ? 'Добавление...' : 'Добавить'}</button>
                  </div>
                </form>
              </div>

              <div style={{ marginTop: 16 }}>
                <h4 className="small">Все мастера</h4>
                {allMasters.length === 0 ? (
                  <p className="small">Мастеров нет</p>
                ) : (
                  <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                    {allMasters.map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }} className="card">
                        <div>
                          <div style={{ fontWeight: 700 }}>{m.name}</div>
                          <div className="small">{m.phone}</div>
                        </div>
                        <div>
                          <button className="btn-primary" onClick={() => handleAssignMaster(m.id)} disabled={assigning}>Назначить</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button onClick={() => setSelectedService(null)} className="btn-gray">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
