# 🚗 Автосервис CRM — Modern Auto Service Management System

Полнофункциональное веб-приложение для управления автосервисом с современным UI/UX, ролевым доступом и управлением мастерами.

## 📋 Описание

Система управления автосервисом включает:
- **Роли пользователей**: Клиент, Оператор, Механик
- **Управление записями**: создание, оплата, отмена операций
- **Управление сменами**: открытие/закрытие смен с логированием
- **Управление услугами**: список услуг, назначение мастеров
- **Управление мастерами**: создание мастеров и привязка к услугам (только для операторов)
- **Логи смен**: просмотр истории открытия/закрытия смен

## 🛠️ Стек технологий

**Frontend:**
- React 18 с React Router
- Современный CSS (CSS переменные, градиенты, стекломорфизм)
- Fetch API для коммуникации с бэкендом

**Backend:**
- FastAPI (Python)
- SQLModel + SQLAlchemy ORM
- SQLite база данных
- Uvicorn сервер

---

## 🚀 Быстрый старт

### Требования
- **Node.js** 16+ (для фронтенда)
- **Python** 3.9+ (для бэкенда)

### 1️⃣ Запуск Backend (FastAPI)

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**API будет доступен:** http://127.0.0.1:8000  
**Swagger Docs:** http://127.0.0.1:8000/docs

### 2️⃣ Запуск Frontend (React)

В **новом терминале** из корня:

```bash
npm install
npm start
```

**Приложение:** http://localhost:3000

---

## 👥 Тестовые аккаунты

| Роль | Телефон | Код |
|------|---------|-----|
| 👤 **Клиент** | `+79993334455` | `1234` |
| ⚙️ **Оператор** | `+79991112233` | `1234` |
| 🔧 **Механик** | `+79992223344` | `1234` |

---

## 🔐 Роли и права

### 👤 Клиент
- Просмотр записей и статуса
- Просмотр услуг

### ⚙️ Оператор
- Управление записями (создание, оплата, отмена, удаление)
- Управление сменами (открытие/закрытие)
- Просмотр логов смен
- **Создание и назначение мастеров на услуги**

### 🔧 Механик
- Просмотр записей
- Оплата записей

---

## 📁 Структура проекта

```
auto-app/
├── backend/              # FastAPI приложение
│   ├── api.py           # Роутеры (users, services, shifts, operations)
│   ├── models.py        # SQLModel схемы
│   ├── database.py      # Конфигурация БД (SQLite)
│   ├── main.py          # Entry point
│   ├── init_db.py       # Инициализация + тестовые данные
│   └── requirements.txt  # Python зависимости
├── src/                 # React приложение
│   ├── components/      # React компоненты
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── RecordList.js
│   │   ├── Card.js
│   │   ├── ServicesPage.js
│   │   ├── ShiftControl.js
│   │   └── ShiftLogsPage.js
│   ├── styles/
│   │   └── theme.css    # Глобальная тема + компоненты
│   ├── App.js
│   └── index.js
├── package.json
├── .gitignore
└── README.md
```

---

## 🎨 Дизайн

- **Тёмная тема** с градиентами и стекломорфизмом
- **Современные кнопки**: primary (cyan), outline, danger (red)
- **Action bars** внизу карточек
- **Отзывчивый дизайн** для мобилей

---

## 📚 Документация API

**Аутентификация:**
- `POST /auth/login` — вход по номеру
- `POST /auth/verify` — проверка кода

**Пользователи:**
- `POST /users/register` — регистрация клиента
- `POST /users/create_master` — создание мастера (оператор)
- `GET /users/masters` — список мастеров

**Услуги:**
- `GET /services/` — список услуг
- `POST /services/` — создание услуги
- `GET /services/{id}/masters` — мастера для услуги
- `POST /services/{id}/assign-master` — назначить мастера

**Смены:**
- `POST /shifts/open` — открыть смену
- `POST /shifts/close` — закрыть смену
- `GET /shifts/logs` — логи смен

**Операции:**
- `POST /operations/` — создать запись
- `PATCH /operations/{id}/pay` — оплатить
- `PATCH /operations/{id}/cancel` — отменить
- `DELETE /operations/{id}` — удалить

---

## 🚀 Готово к использованию!

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
