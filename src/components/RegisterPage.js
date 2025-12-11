import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ phone: "", name: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Функция для автоформатирования номера телефона
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 1) return digits;
    
    if (digits.startsWith("7")) {
      const part1 = digits.slice(0, 1);
      const part2 = digits.slice(1, 4);
      const part3 = digits.slice(4, 7);
      const part4 = digits.slice(7, 9);
      const part5 = digits.slice(9, 11);
      
      let formatted = `+${part1}`;
      if (part2) formatted += ` (${part2}`;
      if (part3) formatted += `) ${part3}`;
      if (part4) formatted += `-${part4}`;
      if (part5) formatted += `-${part5}`;
      
      return formatted;
    }
    
    if (digits.startsWith("8") || digits.startsWith("9")) {
      return formatPhoneNumber("7" + digits.slice(1));
    }
    
    return digits;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setForm({ ...form, [name]: formatPhoneNumber(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 11) {
      setMessage("Пожалуйста, введите корректный номер телефона (11 цифр)");
      return;
    }
    if (!form.name.trim()) {
      setMessage("Пожалуйста, введите имя");
      return;
    }

    setLoading(true);
    setMessage("");
    
    // Преобразуем номер в формат +7...
    const normalizedPhone = cleanPhone.length === 11 ? `+${cleanPhone}` : form.phone;
    
    fetch("http://localhost:8000/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalizedPhone, name: form.name })
    })
    .then(r => {
      if (!r.ok) return r.json().then(e => Promise.reject(e));
      return r.json();
    })
    .then(data => {
      setMessage(`✅ Регистрация успешна! Ваш ID: ${data.id}. Теперь вы можете войти по этому номеру.`);
      setForm({ phone: "", name: "" });
    })
    .catch(err => {
      const errorMsg = err.detail || err.message || "Неизвестная ошибка";
      setMessage(`❌ Ошибка: ${errorMsg}`);
    })
    .finally(() => setLoading(false));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">📱 Регистрация</h2>
        <p className="auth-subtitle">Заполните только номер телефона и ФИО. Остальное добавит администратор.</p>

        <form onSubmit={handleSubmit} className="stack">
          <div>
            <label className="small" style={{ display: 'block', marginBottom: 8 }}>Ваше ФИО</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Иван Петров"
              required
              className="auth-input"
            />
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: 8 }}>Номер телефона</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
              required
              className="auth-input"
            />
          </div>

          {message && (
            <div style={{ padding: 12, borderRadius: 8, background: message.includes('✅') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)', color: message.includes('✅') ? '#86efac' : '#fca5a5' }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
}
