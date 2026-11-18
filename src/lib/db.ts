import mongoose from 'mongoose';

const rawUri =
  process.env.MONGODB_URI ||
  'mongodb+srv://anshpatel1:anshpatel1@clusteransh.sgufmbi.mongodb.net/studentxchange?retryWrites=true&w=majority';

// Ensure database name is always studentxchange
const MONGODB_URI = rawUri.includes('studentxchange')
  ? rawUri
  : rawUri.endsWith('/')
  ? `${rawUri}studentxchange?retryWrites=true&w=majority`
  : `${rawUri}/studentxchange?retryWrites=true&w=majority`;

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'studentxchange',
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully to studentxchange db');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}
