import mongoose from 'mongoose';

const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'facultypoint';

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let normalizedUri = mongoUri;

  try {
    const parsedUri = new URL(mongoUri);
    if (!parsedUri.pathname || parsedUri.pathname === '/' || parsedUri.pathname === '/test') {
      parsedUri.pathname = `/${DEFAULT_DB_NAME}`;
      normalizedUri = parsedUri.toString();
    }
  } catch (error) {
    console.warn('Could not normalize MONGODB_URI; using the original connection string.', error.message);
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(normalizedUri, {
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    autoIndex: true,
  });

  console.log(`MongoDB connected to database: ${connection.connection.name}`);

  return connection;
}
