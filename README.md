# School Dashboard Frontend (React + Vite)

React frontend for student/admin dashboards, charts, and weather integration.

## Tech Stack

- React + Vite
- React Router
- Axios
- Recharts

## Requirements

- Node.js 18+ and npm
- Backend API running (see backend README)

## Setup

1. Install dependencies.

```bash
npm install
```

2. Configure environment.

```bash
copy .env.example .env
```

3. Ensure your `.env` has the correct backend API base URL.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Optional auth path overrides:

```env
VITE_AUTH_LOGIN_PATH=/student/login
VITE_AUTH_REGISTER_PATH=/register
VITE_AUTH_LOGOUT_PATH=/logout
```

Optional weather key:

```env
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
```

## Troubleshooting

- **Port conflicts:** If port 5173 is in use, change the port in Vite config or use `npm run dev -- --port=XXXX`.
- **CORS errors:** Ensure your backend `.env` has `CORS_ALLOWED_ORIGINS` set to your frontend URL.
- **API errors:** Make sure `VITE_API_BASE_URL` in your `.env` matches your backend URL (default: http://127.0.0.1:8000/api).
- **.env files:** Always copy `.env.example` to `.env` and fill in all required values.

## .env.example

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_AUTH_LOGIN_PATH=/student/login
VITE_AUTH_REGISTER_PATH=/register
VITE_AUTH_LOGOUT_PATH=/logout
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
```

## Quick Start

1. Clone this repo and the backend repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update as needed.
4. Start the backend (see backend README).
5. Start the frontend:
   ```bash
   npm run dev
   ```
6. Open http://localhost:5173/ in your browser.

If you follow these steps, your frontend will run without errors on any computer with the required software installed.

## Run With Backend

Run in separate terminals:

Backend:

```bash
cd C:/Users/wenib/Backend_
php artisan serve --host=127.0.0.1 --port=8000
```

Frontend:

```bash
cd C:/Users/wenib/Frontend
npm run dev
```
