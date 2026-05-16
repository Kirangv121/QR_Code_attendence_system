# QR Code Attendance System

Full-stack web app: **React**, **Node.js + Express + MongoDB**, optional **Flask** QR service on Railway, **JWT** auth, **5-minute** QR expiry.

## Deploy overview

| Part | Host | Notes |
|------|------|--------|
| Frontend + API | **Vercel** (one project) | React static + Express serverless at `/api` |
| Python QR (optional) | **Railway** | Fallback only — Vercel API generates QR with Node |
| Database | **MongoDB Atlas** | Required |

### Do you put Python `venv` on Vercel?

**No.** Vercel does not use your local `.venv` folder.

- **Vercel** runs **Node.js** only (frontend build + `api/index.js`). QR images are created in Node (`qrcode` npm package).
- **Railway** runs Python from `python-service/requirements.txt`. Railway installs dependencies automatically — you do **not** upload `.venv` to Git or Railway.
- Keep `.venv` **only on your PC** for local Flask dev; it is in `.gitignore`.

---

## Deploy to Vercel (frontend + backend)

### 1. MongoDB Atlas

1. Create a cluster and database user.
2. **Network Access** → allow `0.0.0.0/0` (needed for Vercel serverless).
3. Copy the connection string → `MONGODB_URI`.

### 2. Push to GitHub

Import the repo in [vercel.com](https://vercel.com) → **Add New Project**.

**Important:** **Root Directory** = repository root (not `frontend` alone).

### 3. Environment variables (Vercel dashboard)

Project → **Settings** → **Environment Variables** (Production + Preview):

| Variable | Example | Required |
|----------|---------|----------|
| `MONGODB_URI` | `mongodb+srv://...` | Yes |
| `JWT_SECRET` | long random string (32+ chars) | Yes |
| `JWT_EXPIRES_IN` | `7d` | Yes |
| `QR_EXPIRY_MINUTES` | `5` | Yes |
| `FRONTEND_ORIGIN` | `https://your-app.vercel.app` | Yes — use your real URL after first deploy; comma-separate preview URLs if needed |
| `VITE_RELATIVE_API` | `true` | Yes — frontend calls `/api` on same domain |

Optional:

| Variable | When |
|----------|------|
| `PYTHON_QR_SERVICE_URL` | Only if you deploy `python-service` on Railway and want Node to fall back to it |

You do **not** need `VITE_API_URL` when `VITE_RELATIVE_API=true`.

### 4. Deploy

After deploy:

1. Open `https://<your-app>.vercel.app/api/health` → `{"ok":true}`
2. Open `https://<your-app>.vercel.app` → register / log in
3. Camera scan needs **HTTPS** (Vercel provides this)

Update `FRONTEND_ORIGIN` to your final URL and redeploy if CORS blocks login.

---

## Deploy Python to Railway (optional)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Set **Root Directory** to `python-service`
3. Railway detects Python from `requirements.txt` and starts with `Procfile` / `railway.toml`
4. Copy the public URL → set `PYTHON_QR_SERVICE_URL` on **Vercel** (optional)

Railway variables (optional):

| Variable | Value |
|----------|--------|
| `CORS_ORIGIN` | `https://your-app.vercel.app` |
| `FLASK_DEBUG` | `false` |

`PORT` is set by Railway automatically.

---

## Local development

### Backend (port 5000)

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

### Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Uses Vite proxy: `/api` → `http://127.0.0.1:5000`

### Python QR (optional, port 5001)

```bash
cd python-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Set `PYTHON_QR_SERVICE_URL=http://127.0.0.1:5001` in `backend/.env` only for local fallback.
