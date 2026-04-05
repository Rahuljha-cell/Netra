import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/database';
import { initSocketIO } from './config/socket';
import { startScraper } from './services/scraper/scraperService';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocketIO(server);

const start = async (): Promise<void> => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`[Netra] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

      // Start news scraper
      if (process.env.ENABLE_SCRAPER !== 'false') {
        startScraper();
      }
    });
  } catch (error) {
    console.error('[Netra] Failed to start server:', error);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[Netra] Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('[Netra] SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
