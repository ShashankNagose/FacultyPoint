import app from '../src/app.js';
import { connectDatabase } from '../src/config/db.js';
import { seedStudents } from '../src/data/seedStudents.js';

let databaseReady;

const prepareDatabase = async () => {
  if (!databaseReady) {
    databaseReady = connectDatabase().then(async () => {
      await seedStudents();
    });
  }

  return databaseReady;
};

export default async function handler(req, res) {
  try {
    await prepareDatabase();
    return app(req, res);
  } catch (error) {
    console.error('API startup failed:', error);
    return res.status(500).json({ message: 'API database connection failed.' });
  }
}
