# School Dashboard Frontend (React + Vite)

React frontend for student/admin dashboards, charts, and weather integration.

## Tech Stack

- React + Vite
- React Router
- Axios
- Recharts

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

4. Start the frontend dev server.

```bash
npm run dev
```

## Routes

- `/student/login`
- `/admin/login`
- `/register`
- `/dashboard` (student protected)
- `/admin/dashboard` (admin protected)

## Features

- Sanctum token authentication integration
- Protected routes for student/admin dashboards
- Dashboard charts:
	- Bar chart: enrollment trends
	- Pie chart: course distribution
	- Line chart: attendance
- Weather widget:
	- current weather
	- 5-day forecast
	- city search and geolocation
- Loading states and API error handling

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
