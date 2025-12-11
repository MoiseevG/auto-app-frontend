import { useState, useEffect } from 'react';
import './App.css';
import RecordList from './components/RecordList';
import CreateCard from './components/RecordForm';
import ServicesPage from './components/ServicesPage';
import RegisterPage from './components/RegisterPage';
import ShiftControl from './components/ShiftControl';
import ShiftLogsPage from './components/ShiftLogsPage';
import LoginPage from './components/LoginPage';

import { 
  getRecords, 
  createRecord, 
  updatePaymentStatus, 
  removeRecord 
} from './services/api';

import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

function Navigation() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="container">
      <nav className="app-nav">
        <div className="left">
          <Link to="/records">📋 Записи</Link>
          {user.role !== "client" && <Link to="/create">➕ Новая запись</Link>}
          <Link to="/services">🔧 Услуги</Link>
          {user.role === "operator" && <Link to="/shift-logs">📊 Логи смен</Link>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ marginRight: 12 }}>Добро пожаловать, <strong>{user.name}</strong></div>
          <div className={`app-badge ${user.role === 'operator' ? 'badge-operator' : user.role === 'master' ? 'badge-master' : 'badge-client'}`}>
            {user.role === 'operator' && '⚙️ Оператор'}
            {user.role === 'master' && '🔧 Механик'}
            {user.role === 'client' && '👤 Клиент'}
          </div>

          <button onClick={logout} className="btn-gray">Выйти</button>
        </div>
      </nav>
    </div>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      async function load() {
        try {
          const data = await getRecords(user.id);
          setRecords(data);
        } catch (err) {
          console.error(err);
          alert("Ошибка загрузки записей: " + err.message);
          logout();
        } finally {
          setLoading(false);
        }
      }
      load();
    }
  }, [user, logout]);

  const handleCreateRecord = async (newRecord) => {
    try {
      const created = await createRecord(newRecord);
      setRecords(prev => [...prev, created]);
    } catch (err) {
      alert("Ошибка создания: " + err.message);
    }
  };

  const handleUpdateRecord = async (record) => {
    try {
      const updated = await updatePaymentStatus(record.id, user.id);
      setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch (err) {
      alert("Ошибка обновления: " + err.message);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Удалить запись?")) return;
    try {
      await removeRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert("Ошибка удаления: " + err.message);
    }
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', fontSize: '1.8rem' }}>Загрузка записей...</div>;
  }

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/records" replace />} />
        
        <Route 
          path="/records" 
          element={
            <>
              {user.role === "operator" && <ShiftControl currentUser={user} />}
              <RecordList
                records={records}
                onUpdate={handleUpdateRecord}
                onDelete={handleDeleteRecord}
              />
            </>
          } 
        />

        <Route 
          path="/create" 
          element={
            user.role === "client" ? (
              <Navigate to="/records" replace />
            ) : (
              <>
                {user.role === "operator" && <ShiftControl currentUser={user} />}
                <CreateCard onCreate={handleCreateRecord} />
              </>
            )
          } 
        />

        <Route 
          path="/services" 
          element={
            <>
              {user.role === "operator" && <ShiftControl currentUser={user} />}
              <ServicesPage />
            </>
          } 
        />

        <Route 
          path="/shift-logs" 
          element={
            user.role === "client" ? (
              <Navigate to="/records" replace />
            ) : (
              <ShiftLogsPage />
            )
          } 
        />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<div style={{ padding: 20 }}><h2>Страница не найдена</h2><Link to="/records">На главную</Link></div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
