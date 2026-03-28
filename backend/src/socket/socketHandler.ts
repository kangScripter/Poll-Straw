import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`📱 Client connected: ${socket.id}`);

    // Join poll room (B17: validate pollId format)
    socket.on('join-poll', (data: { pollId: string }) => {
      const { pollId } = data;
      if (pollId && typeof pollId === 'string' && pollId.length < 50 && /^[a-zA-Z0-9_-]+$/.test(pollId)) {
        socket.join(`poll:${pollId}`);
        console.log(`👀 Client ${socket.id} joined poll: ${pollId}`);
      }
    });

    // Leave poll room
    socket.on('leave-poll', (data: { pollId: string }) => {
      const { pollId } = data;
      if (pollId) {
        socket.leave(`poll:${pollId}`);
        console.log(`👋 Client ${socket.id} left poll: ${pollId}`);
      }
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`📴 Client disconnected: ${socket.id} (${reason})`);
    });

    // Error handler
    socket.on('error', (error: Error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  // Subscribe to Redis pub/sub for real-time updates (B8: handle async errors)
  setupRedisPubSub().catch((err) => {
    console.error('❌ Fatal: Redis pub/sub setup failed:', err);
  });

  console.log('✅ Socket.io initialized');

  return io;
};

// Setup Redis pub/sub for broadcasting updates
const setupRedisPubSub = async () => {
  try {
    const subscriber = redis.duplicate();
    
    await subscriber.connect();

    // Subscribe to all poll updates using pattern
    await subscriber.psubscribe('poll:*');

    subscriber.on('pmessage', (pattern: string, channel: string, message: string) => {
      // Extract poll ID from channel (poll:pollId)
      const pollId = channel.split(':')[1];
      
      if (pollId) {
        // Broadcast to all clients in the poll room
        io.to(`poll:${pollId}`).emit('vote-update', JSON.parse(message));
      }
    });

    console.log('✅ Redis pub/sub initialized');
  } catch (error: unknown) {
    console.error('❌ Failed to setup Redis pub/sub:', error);
    console.log('⚠️ Real-time updates will be limited');
  }
};

// Broadcast vote update to poll room
export const broadcastVoteUpdate = (pollId: string, data: object): void => {
  if (io) {
    io.to(`poll:${pollId}`).emit('vote-update', data);
  }
};

// Broadcast poll closed event
export const broadcastPollClosed = (pollId: string): void => {
  if (io) {
    io.to(`poll:${pollId}`).emit('poll-closed', { pollId });
  }
};

// Get socket.io instance
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
