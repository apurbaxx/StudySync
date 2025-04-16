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

  // Define connect function without dependencies
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

    // Use stable references to event handlers
    const currentOnOpen = onOpen;
    const currentOnMessage = onMessage;
    const currentOnClose = onClose;
    const currentOnError = onError;
    const currentReconnectAttempts = reconnectAttempts;
    const currentReconnectInterval = reconnectInterval;

    socket.onopen = (event) => {
      setStatus('open');
      attemptRef.current = 0;
      if (currentOnOpen) currentOnOpen(event);
    };

    socket.onmessage = (event) => {
      if (currentOnMessage) currentOnMessage(event);
    };

    socket.onclose = (event) => {
      setStatus('closed');
      if (currentOnClose) currentOnClose(event);
      
      // Attempt to reconnect if not explicitly closed and reconnect attempts > 0
      if (attemptRef.current < currentReconnectAttempts) {
        attemptRef.current += 1;
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, currentReconnectInterval);
      }
    };

    socket.onerror = (event) => {
      setStatus('error');
      if (currentOnError) currentOnError(event);
    };
  }, []); // No dependencies to avoid unnecessary reconnections

  const sendMessage = useCallback((data: any) => {
    console.log('WebSocket sendMessage called with:', data);
    console.log('WebSocket current state:', socketRef.current ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][socketRef.current.readyState] : 'No connection');
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        console.log('Sending message:', message);
        socketRef.current.send(message);
        console.log('Message sent successfully');
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.error('WebSocket not open. Current readyState:', socketRef.current?.readyState);
      return false;
    }
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

  // Initialize connection - only once on mount
  useEffect(() => {
    // Only connect if automatic open is enabled and if there's no existing socket
    if (automaticOpen && !socketRef.current) {
      connect();
    }
    
    return () => {
      // Clean up on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [automaticOpen]); // Intentionally removed 'connect' from deps to avoid reconnection

  return {
    sendMessage,
    status,
    reconnect,
    close
  };
}
