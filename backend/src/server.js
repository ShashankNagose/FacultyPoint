import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { seedStudents } from './data/seedStudents.js';

const port = process.env.PORT || 8000;

try {
  await connectDatabase();
  await seedStudents();
  app.listen(port, () => {
    console.log(`FacultyPoint API is running on http://localhost:${port}`);
  });
} catch (error) {
  console.error('Failed to start FacultyPoint API:', error.message);
  process.exit(1);
}
