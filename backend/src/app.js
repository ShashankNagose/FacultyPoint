import cors from 'cors';
import express from 'express';
import assignmentsRouter from './routes/assignments.js';
import materialsRouter from './routes/materials.js';
import menteesRouter from './routes/mentees.js';
import studentsRouter from './routes/students.js';

const app = express();
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) || [])
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || !process.env.CLIENT_ORIGIN) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to FacultyPoint API',
    version: '2.0.0',
    stack: 'Node.js, Express, MongoDB'
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/api/materials', materialsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/mentees', menteesRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Something went wrong.'
  });
});

export default app;
