# FacultyPoint Setup Instructions

## 1. MongoDB

Use either a local MongoDB server or MongoDB Atlas.

Local example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/facultypoint
```

Atlas example:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster-name.mongodb.net/facultypoint
```

## 2. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Edit `backend/.env` if your MongoDB URL or frontend URL is different.

Backend URL:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

## 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 4. Going Live

For the backend host, set:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CLIENT_ORIGIN=https://your-frontend-domain.com
```

For the frontend host, set:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

Build the frontend before deploying:

```bash
npm run build
```

The frontend no longer stores app data in browser storage. Shared notes, assignments, submissions, saved links, mentee profiles, and mentee notes are stored through the Express API in MongoDB.
