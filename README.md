# FacultyPoint

FacultyPoint is a React + Node.js portal for department study materials, assignments, submissions, and mentee records.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB through Mongoose

## Project Structure

```text
FacultyPoint/
  backend/
    src/
      config/
      models/
      routes/
      app.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      components/
      context/
      pages/
      utils/
    .env.example
    package.json
```

## Local Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create `backend/.env` from `backend/.env.example` and set your MongoDB connection:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/facultypoint
CLIENT_ORIGIN=http://localhost:5173
```

3. Start the backend:

```bash
npm run dev
```

4. Install and start the frontend:

```bash
cd ../frontend
npm install
npm run dev
```

The website runs at `http://localhost:5173` and the API runs at `http://localhost:8000`.

## API

- `GET /api/materials`
- `POST /api/materials`
- `DELETE /api/materials/:id`
- `GET /api/assignments`
- `POST /api/assignments`
- `DELETE /api/assignments/:id`
- `GET /api/assignments/:id/submissions`
- `POST /api/assignments/:id/submissions`
- `GET /api/students/:studentId/uploads`
- `POST /api/students/:studentId/uploads`
- `GET /api/mentees/:studentId/profile`
- `PUT /api/mentees/:studentId/profile`
- `GET /api/mentees/submissions`
- `POST /api/mentees/submissions`

## Deployment Notes

Set `MONGODB_URI` to your MongoDB Atlas connection string on the backend host. Set `VITE_API_BASE_URL` in the frontend host to your live backend URL, for example:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```
