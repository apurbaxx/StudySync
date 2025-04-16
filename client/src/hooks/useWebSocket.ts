import { useEffect, useRef, useCallback, useState } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'error';

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  automaticOpen?: boolean;
}

interface UseWebSocketResult {
  sendMessage: (data: any) => void;
  status: WebSocketStatus;
  reconnect: () => void;
  close: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketResult {
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectInterval = 2000,
    reconnectAttempts = 0, // Set to 0 to prevent auto-reconnection
    automaticOpen = true,
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const attemptRef = useRef<number>(0);
  const [status, setStatus] = useState<WebSocketStatus>('connecting');

  const connect = useCallback(() => {
    // Close existing socket if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Determine protocol based on current URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    setStatus('connecting');

    socket.onopen = (event) => {
      setStatus('open');
      attemptRef.current = 0;
      if (onOpen) onOpen(event);
    };

    socket.onmessage = (event) => {
      if (onMessage) onMessage(event);
    };

    socket.onclose = (event) => {
      setStatus('closed');
      if (onClose) onClose(event);
      
      // Attempt to reconnect if not explicitly closed
      if (attemptRef.current < reconnectAttempts) {
        attemptRef.current += 1;
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    socket.onerror = (event) => {
      setStatus('error');
      if (onError) onError(event);
    };
  }, [onOpen, onMessage, onClose, onError, reconnectAttempts, reconnectInterval]);

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    attemptRef.current = 0;
    connect();
  }, [connect]);

  const close = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setStatus('closed');
  }, []);

  // Initialize connection
  useEffect(() => {
    if (automaticOpen) {
      connect();
    }
    
    return () => {
      // Clean up on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect, automaticOpen]);

  return {
    sendMessage,
    status,
    reconnect,
    close
  };
}
