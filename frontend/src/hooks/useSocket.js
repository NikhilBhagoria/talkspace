import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!userId) return;

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      if (socketRef.current) {
        socketRef.current.emit('user_join', userId);
      }
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
