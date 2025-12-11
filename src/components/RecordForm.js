import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getServices, getCurrentShift } from "../services/api";

export default function CreateCard({ onCreate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasShift, setHasShift] = useState(false);
  const [loadingShift, setLoadingShift] = useState(true);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [form, setForm] = useState({
    client_name: "",
    car: "",
    service_id: "",
    price: "",
    comment: ""
  });

  // Проверяем наличие открытой смены
  useEffect(() => {
    if (user?.id) {
      getCurrentShift(user.id)
        .then(shift => {
          setHasShift(!!shift);
          setLoadingShift(false);
        })
        .catch(err => {
          console.log("Error checking shift:", err);
          setHasShift(false);
          setLoadingShift(false);
        });
    }
  }, [user]);

  // Загружаем услуги
  useEffect(() => {
    getServices()
      .then(data => {
        setServices(data);
        setLoadingServices(false);
      })
      .catch(err => {
        console.log("Error loading services:", err);
        setLoadingServices(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "service_id") {
      // Когда выбираем услугу, автоматически заполняем цену
      const selectedService = services.find(s => s.id === parseInt(value));
      setForm({
        ...form,
        [name]: value,
        price: selectedService ? selectedService.price : ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.client_name || !form.car || !form.service_id || !form.price) {
      alert("Заполните все поля!");
      return;
    }

    if (!hasShift) {
      alert("Сначала откройте смену!");
      return;
    }

    onCreate({ 
      ...form, 
      service_id: Number(form.service_id),
      price: Number(form.price), 
      status: "PENDING",
      operator_id: user?.id 
    });
    navigate("/records");
  };

  return (
    <div className="page-background">
      <div className="create-card">
        <h2 className="create-title">Новая запись</h2>

        {user?.role !== "operator" && (
          <div style={{
            padding: "15px",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#991b1b"
          }}>
            ⚠️ Только операторы могут создавать записи!
          </div>
        )}

        {!hasShift && !loadingShift && user?.role === "operator" && (
          <div style={{
            padding: "15px",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#991b1b"
          }}>
            ⚠️ Смена не открыта! Откройте смену перед созданием записи.
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-form" style={{ opacity: user?.role !== "operator" ? 0.5 : 1 }}>
          <label>
            Клиент
            <input
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              placeholder="Иван Иванов"
              required
              disabled={user?.role !== "operator"}
            />
          </label>

          <label>
            Автомобиль
            <input
              name="car"
              value={form.car}
              onChange={handleChange}
              placeholder="Lada Vesta"
              required
              disabled={user?.role !== "operator"}
            />
          </label>

          <label>
            Услуга
            {loadingServices ? (
              <select disabled>
                <option>Загрузка услуг...</option>
              </select>
            ) : (
              <select
                name="service_id"
                value={form.service_id}
                onChange={handleChange}
                required
                disabled={user?.role !== "operator"}
              >
                <option value="">Выберите услугу</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price}₽
                  </option>
                ))}
              </select>
            )}
          </label>

          <label>
            Сумма
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Автоматически заполняется"
              readOnly
              disabled={user?.role !== "operator"}
            />
          </label>

          <label>
            Комментарий
            <input
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Дополнительные заметки"
              disabled={user?.role !== "operator"}
            />
          </label>

          <button 
            className="btn-submit" 
            type="submit"
            disabled={user?.role !== "operator" || !hasShift || loadingShift}
            style={{
              opacity: (user?.role !== "operator" || !hasShift || loadingShift) ? 0.5 : 1,
              cursor: (user?.role !== "operator" || !hasShift || loadingShift) ? "not-allowed" : "pointer"
            }}
          >
            {loadingShift ? "Проверка смены..." : "Создать запись"}
          </button>
        </form>
      </div>
    </div>
  );
}
