# Taskly – Full-Stack Task Management App

A secure, responsive task manager: React + Vite on the front end, Express + MongoDB Atlas on the back end, JWT authentication.

## Features
- Register / log in / log out, bcrypt-hashed passwords, JWT auth, protected routes
- Task CRUD with status (Pending, In Progress, Completed), priority (Low, Medium, High), due date, created/updated dates
- Dashboard: totals, pending / in-progress / completed / overdue counts, completion %, recent tasks, progress bar (all computed from the database)
- Search by title, filter by status & priority, overdue-only filter, sort by due/created date, reset filters
- Sidebar (desktop) and slide-out menu (mobile), modals, delete confirmation, toasts, loading/empty/error states

## Tech
Client: React 18, Vite, React Router, Axios, Lucide React, plain CSS. Server: Node.js, Express, Mongoose, jsonwebtoken, bcryptjs, dotenv, helmet, cors, express-rate-limit.

## Structure
```
task-management-app/
├── client/  (src/components, pages, layouts, context, services, utils, App.jsx, main.jsx, index.css)
├── server/  (config, controllers, middleware, models, routes, utils, server.js)
├── .gitignore
└── README.md
```

## Prerequisites
Node.js 18+ and a free MongoDB Atlas account.

## MongoDB Atlas setup
1. Create a free **M0** cluster at https://cloud.mongodb.com.
2. **Database Access → Add New Database User**: choose a username and password (avoid `@ : /` characters in the password, or URL-encode them). Give it *Read and write to any database*.
3. **Network Access → Add IP Address**: add your current IP for local development (use `0.0.0.0/0` only temporarily, e.g. for a hosted backend whose IP is not fixed, and keep a strong password).
4. **Database → Connect → Drivers**: copy the connection string, e.g. `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/taskly?retryWrites=true&w=majority`. Replace `USER`/`PASSWORD` and add a database name (`/taskly`) before the `?`.
5. Put it in `server/.env` (this file is git-ignored; never commit it).

## Run locally
```bash
# Terminal 1 – API
cd server
cp .env.example .env     # then edit MONGODB_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5000

# Terminal 2 – web app
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```
Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### Environment variables
| File | Variable | Meaning |
|---|---|---|
| server/.env | PORT | API port (5000) |
| | MONGODB_URI | Atlas connection string |
| | JWT_SECRET | Long random string, 16+ chars (server refuses to start otherwise) |
| | CLIENT_URL | Allowed CORS origin(s), comma-separated |
| client/.env | VITE_API_URL | API base URL, e.g. `http://localhost:5000/api` |

## API
All `/api/tasks*` routes need `Authorization: Bearer <token>`. Errors return `{ "message": "..." }`.

| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/register | `{name,email,password}` → 201 `{token,user}` |
| POST | /api/auth/login | `{email,password}` → `{token,user}`; 401 on bad credentials |
| GET | /api/auth/me | Current user |
| POST | /api/tasks | Create (title required) → 201 |
| GET | /api/tasks | Query: `search, status, priority, overdue=true, sort=dueDate\|createdAt, order=asc\|desc` |
| GET | /api/tasks/stats | Dashboard statistics + 5 recent tasks |
| GET | /api/tasks/:id | One task (404 if not yours) |
| PUT | /api/tasks/:id | Full update |
| PATCH | /api/tasks/:id/status | `{status}` |
| DELETE | /api/tasks/:id | Delete |

## Security notes
- Passwords hashed with bcrypt (cost 12); `password` is `select: false` and stripped from JSON.
- Every task query filters on `user: req.user._id` taken from the verified JWT; the body's user field is ignored. Other users' tasks return 404.
- Inputs are type-checked (strings only, which blocks NoSQL operator injection), enums whitelisted, search text regex-escaped, request body limited to 10 kB.
- helmet headers, CORS limited to `CLIENT_URL`, rate limit on `/api/auth`, secrets only in env files.
- **Token strategy:** a 7-day JWT sent as a Bearer header and kept in `localStorage` (never the password). Trade-off: any XSS bug could read it. React escapes output by default and no HTML is injected, but for stricter production setups switch to an `httpOnly; Secure; SameSite` cookie and add CSRF protection. Expired/invalid tokens return 401 and the client logs the user out.

## Manual test checklist
1. Register at `/register`; you land on the dashboard. Log out and log in; a wrong password shows "Invalid email or password."
2. Open `/tasks` while logged out → redirected to `/login`. `curl localhost:5000/api/tasks` → 401.
3. Create, edit, change status, delete (with confirmation) tasks; reload the page to confirm they persist in Atlas.
4. Use search, filters, sort, "Overdue only" (create a task with a past due date), then Reset.
5. Dashboard numbers change after each action.
6. Register a second user: they see an empty list, and `GET /api/tasks/<id of user 1's task>` returns 404.
7. Shrink the browser below 820px to check the mobile menu.

## Troubleshooting
- **`MongooseServerSelectionError`**: IP not whitelisted in Atlas Network Access, or wrong credentials/URI.
- **`bad auth`**: wrong DB user/password; URL-encode special characters.
- **CORS error in browser**: `CLIENT_URL` must exactly match the web origin (no trailing slash).
- **Network Error in the app**: API not running or `VITE_API_URL` wrong; restart `npm run dev` after editing `.env`.
- **"JWT_SECRET must be set"**: create `server/.env` from the example.

## Deployment
**Backend (Render / Railway):** root directory `server`, build `npm install`, start `npm start`. Add env vars `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL). Allow the host in Atlas Network Access.
**Frontend (Vercel / Netlify):** root directory `client`, build `npm run build`, output `dist`, env `VITE_API_URL=https://<your-api>/api`. Add a rewrite of all paths to `/index.html` (Netlify: `/* /index.html 200` in `public/_redirects`; Vercel: `vercel.json` rewrite) so deep links work. Then set the API's `CLIENT_URL` to the deployed frontend URL.
