import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // 1 = ввод телефона, 2 = ввод кода
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const { login, verify } = useAuth();

  // Функция для автоформатирования номера телефона
  const formatPhoneNumber = (value) => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, "");
    
    // Если менее 11 цифр - просто возвращаем
    if (digits.length <= 1) return digits;
    
    // Форматируем: +7 (999) 123-45-67
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
    
    // Если начинается с 8 или 9 - заменяем на 7
    if (digits.startsWith("8") || digits.startsWith("9")) {
      return formatPhoneNumber("7" + digits.slice(1));
    }
    
    return digits;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length !== 11) {
      alert("Пожалуйста, введите корректный номер (11 цифр)");
      return;
    }

    try {
      setSending(true);
      setError("");
      await login(phone);
      setStep(2); // Только если всё ок — переходим к коду
    } catch (err) {
      setError(err.message || "Не удалось отправить код");
    }
    finally {
      setSending(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 4) {
      alert("Код должен быть 4 цифры");
      return;
    }

    try {
      setSending(true);
      setError("");
      await verify(phone, code);
      window.location.href = "/"; // Переход в систему
    } catch (err) {
      setError(err.message || "Неверный код");
    }
    finally {
      setSending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">🚗 Автосервис CRM</h2>
        <p className="auth-subtitle">
          {step === 1 ? "Вход в систему" : "Введите код верификации"}
        </p>

        {step === 1 && (
          <div className="card" style={{ marginBottom: 18 }}>
            <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--primary)' }}>📱 Демо-аккаунты (тестовые номера):</p>
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="small"><strong>👤 Клиент:</strong> <code style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 6, marginLeft: 8 }}>+79993334455</code></div>
              <div className="small"><strong>⚙️ Оператор:</strong> <code style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 6, marginLeft: 8 }}>+79991112233</code></div>
              <div className="small"><strong>🔧 Механик:</strong> <code style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 6, marginLeft: 8 }}>+79992223344</code></div>
              <div className="small" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                Код: <code style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 6, marginLeft: 8 }}>1234</code>
              </div>
            </div>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handlePhoneSubmit} className="stack">
            <div>
              <label className="small" style={{ display: 'block', marginBottom: 8 }}>Номер телефона</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 (999) 123-45-67"
                required
                className="auth-input"
              />
            </div>
            {error && <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
            <button type="submit" className="auth-button" disabled={sending}>
              {sending ? "Отправка..." : "Получить код"}
            </button>

            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span style={{ color: 'var(--muted)', marginRight: 8 }}>Нет аккаунта?</span>
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Зарегистрироваться
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <p style={{
              textAlign: "center",
              marginBottom: "24px",
              color: "#666",
              fontSize: "0.95rem"
            }}>
              Код отправлен на номер:<br />
              <strong style={{ color: "#1e3a8a", fontSize: "1.1rem" }}>{phone}</strong>
            </p>
            <div style={{
              marginBottom: "24px"
            }}>
              <label style={{
                display: "block",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Код верификации (тест: 1234)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Введите четыре цифры"
                required
                maxLength="4"
                className="auth-input"
                style={{ fontFamily: "monospace", textAlign: "center", letterSpacing: "8px", fontWeight: "bold", fontSize: "1.2rem" }}
              />
            </div>
            {error && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>}
            <button type="submit" className="auth-button" disabled={sending}>{sending ? "Проверка..." : "Войти"}</button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-gray"
              style={{ width: "100%", marginTop: "12px" }}
            >
              Вернуться
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
