import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/netra';

  try {
    await mongoose.connect(uri);
    console.log('[Netra] MongoDB connected successfully');
  } catch (error) {
    console.error('[Netra] MongoDB connection error:', error);
    throw error;
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Netra] MongoDB runtime error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Netra] MongoDB disconnected');
  });
};
