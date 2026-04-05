import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export const initSocketIO = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a geographic room for localized alerts
    socket.on('join:location', (data: { lat: number; lng: number; radius?: number }) => {
      const roomKey = `geo:${Math.round(data.lat * 10) / 10}:${Math.round(data.lng * 10) / 10}`;
      socket.join(roomKey);
      console.log(`[Socket] ${socket.id} joined room ${roomKey}`);
    });

    socket.on('leave:location', (data: { lat: number; lng: number }) => {
      const roomKey = `geo:${Math.round(data.lat * 10) / 10}:${Math.round(data.lng * 10) / 10}`;
      socket.leave(roomKey);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
