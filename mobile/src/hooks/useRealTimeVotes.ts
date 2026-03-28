import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/utils/constants';
import { Poll } from '@/types';

interface UseRealTimeVotesReturn {
  results: Poll | null;
  isConnected: boolean;
  error: string | null;
}

export const useRealTimeVotes = (pollId: string | null): UseRealTimeVotesReturn => {
  const [results, setResults] = useState<Poll | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!pollId) return;

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      setError(null);
      
      // Join poll room
      newSocket.emit('join-poll', { pollId });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('📴 Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to real-time updates');
      setIsConnected(false);
    });

    // Vote update handler (backend only emits 'vote-update')
    newSocket.on('vote-update', (data: Poll) => {
      console.log('📊 Vote update received');
      setResults(data);
    });

    // Poll closed handler
    newSocket.on('poll-closed', () => {
      console.log('🔒 Poll closed');
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.emit('leave-poll', { pollId });
        newSocket.disconnect();
      }
    };
  }, [pollId]);

  return { results, isConnected, error };
};

// Hook for managing socket connection state
export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return isConnected;
};
