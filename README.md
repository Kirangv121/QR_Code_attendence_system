# QR Code Attendance System

Full-stack web app: **React (JSX)**, **Node.js + Express + MongoDB**, **Flask** QR image service, **JWT** auth, **bcrypt** passwords, **5-minute** QR expiry, duplicate scan prevention.

## Prerequisites

- Node.js 18+
- Python 3.10+ with `pip`
- MongoDB Atlas URI (or local MongoDB)

## Quick start

### 1. Python QR service (port 5001)

```bash
cd python-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 2. Backend API (port 5000)

```bash
cd backend
copy .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, PYTHON_QR_SERVICE_URL, FRONTEND_ORIGIN
npm install
npm run dev
```

New users register from the **Register** link on the sign-in page (**Faculty** or **Student** role). Returning users choose the matching **Faculty login** / **Student login** entry points and pick the correct role when signing in.

### 3. Frontend (port 5173)

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL` if the API is not at `http://localhost:5000/api`.

## Architecture

| Layer | Path | Role |
|--------|------|------|
| Frontend | `frontend/` | React Router, Axios, `html5-qrcode` camera scanner |
| API | `backend/src/` | MVC-style routes, controllers, models, auth middleware |
| QR | `python-service/` | Encodes JSON `{ sessionId, timestamp, token }` into PNG |

Collections: **users**, **sessions**, **attendance** (see Mongoose models).

## Security notes

- Change `JWT_SECRET` and use strong passwords in production.
- Serve over HTTPS in production; restrict CORS `FRONTEND_ORIGIN` to your deployed UI origin.
