import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { seedStudents } from './data/seedStudents.js';

const port = process.env.PORT || 8000;

try {
  await connectDatabase();
  await seedStudents();

  const server = app.listen(port, () => {
    console.log(`FacultyPoint API is running on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    console.error('Server startup error:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Failed to start FacultyPoint API:', error.message);
  process.exit(1);
}
