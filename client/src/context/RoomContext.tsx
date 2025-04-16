import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
  topic: string;
  timerState: 'stopped' | 'running' | 'paused';
  timerMode: 'study' | 'break';
  timerEndTime: Date | null;
  studyDuration: number;
  breakDuration: number;
}

interface Member {
  id: number;
  username: string;
  status: string;
  isHost: boolean;
}

interface Message {
  id: number;
  userId?: number;
  username?: string;
  text: string;
  type: 'user' | 'system';
  timestamp: Date;
}

interface RoomContextType {
  room: Room | null;
  members: Member[];
  messages: Message[];
  remainingTime: number;
  isLoadingRoom: boolean;
  createRoom: (nickname: string, roomName: string, roomTopic?: string) => void;
  joinRoom: (nickname: string, roomId: string) => void;
  leaveRoom: () => void;
  sendChatMessage: (text: string) => void;
  changeStatus: (status: string) => void;
  timerStart: () => void;
  timerPause: () => void;
  timerReset: () => void;
  timerToggleMode: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomContextProviderProps {
  children: ReactNode;
  onRoomTransition?: () => void;
}

export function RoomProvider({ children, onRoomTransition }: RoomContextProviderProps) {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [remainingTime, setRemainingTime] = useState<number>(25 * 60); // Default 25 minutes
  const [isLoadingRoom, setIsLoadingRoom] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      console.log('Received WebSocket message:', event.data);
      const data = JSON.parse(event.data);
      console.log('Parsed message data:', data);
      
      switch (data.type) {
        case 'connection_established':
          // Received socket ID from server
          console.log('Connection established, socketId:', data.payload.socketId);
          if (user) {
            setUser({ ...user, socketId: data.payload.socketId });
          }
          break;
          
        case 'error':
          // Handle errors
          console.error('Received error from server:', data.payload);
          toast({
            title: 'Error',
            description: data.payload.message || 'An unknown error occurred',
            variant: 'destructive'
          });
          
          // Reset loading state if there was an error during room creation/joining
          setIsLoadingRoom(false);
          break;
          
        case 'room_created':
          // Successfully created a room
          console.log('Room created successfully:', data.payload);
          setRoom(data.payload.room);
          setUser(data.payload.user);
          setIsLoadingRoom(false);
          
          // Show success toast
          toast({
            title: 'Success',
            description: `Room ${data.payload.roomId} created successfully!`,
            variant: 'default'
          });
          
          // Trigger transition to study room if a callback was provided
          if (onRoomTransition) {
            console.log('Transitioning to study room after room creation');
            onRoomTransition();
          }
          break;
          
        case 'room_joined':
          // Successfully joined a room
          setRoom(data.payload.room);
          setUser(data.payload.user);
          setMembers(data.payload.members);
          
          // Convert message timestamps to Date objects
          const parsedMessages = data.payload.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(parsedMessages);
          
          // Initialize timer state
          if (data.payload.room.timerState === 'running' && data.payload.room.timerEndTime) {
            const endTime = new Date(data.payload.room.timerEndTime);
            const remaining = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
            setRemainingTime(remaining);
            startCountdown();
          } else if (data.payload.room.timerState === 'paused') {
            const duration = data.payload.room.timerMode === 'study'
              ? data.payload.room.studyDuration
              : data.payload.room.breakDuration;
            setRemainingTime(duration);
          } else {
            // Timer stopped - set to full duration
            const duration = data.payload.room.timerMode === 'study' ? 25 * 60 : 5 * 60;
            setRemainingTime(duration);
          }
          
          setIsLoadingRoom(false);
          
          // Trigger transition to study room if a callback was provided
          if (onRoomTransition) {
            console.log('Transitioning to study room after joining room');
            onRoomTransition();
          }
          break;
          
        case 'member_joined':
          // New member joined
          setMembers(prev => [...prev, data.payload.user]);
          
          // Add system message
          if (data.payload.message) {
            const msg = {
              ...data.payload.message,
              timestamp: new Date(data.payload.message.timestamp)
            };
            setMessages(prev => [...prev, msg]);
          }
          break;
          
        case 'member_left':
          // Member left
          setMembers(prev => prev.filter(m => m.id !== data.payload.userId));
          
          // Add system message
          if (data.payload.message) {
            const msg = {
              ...data.payload.message,
              timestamp: new Date(data.payload.message.timestamp)
            };
            setMessages(prev => [...prev, msg]);
          }
          break;
          
        case 'host_changed':
          // Update member with new host status
          setMembers(prev => prev.map(m => 
            m.id === data.payload.newHostId 
              ? { ...m, isHost: true }
              : m
          ));
          
          // Add system message
          if (data.payload.message) {
            const msg = {
              ...data.payload.message,
              timestamp: new Date(data.payload.message.timestamp)
            };
            setMessages(prev => [...prev, msg]);
          }
          
          // If current user is the new host, update user state
          if (user && user.id === data.payload.newHostId) {
            setUser({ ...user, isHost: true });
          }
          break;
          
        case 'message_sent':
          // Handle confirmation of sent message
          break;
          
        case 'new_message':
          // Message from another user
          const message = {
            ...data.payload.message,
            timestamp: new Date(data.payload.message.timestamp)
          };
          setMessages(prev => [...prev, message]);
          break;
          
        case 'status_changed':
          // Update member status
          setMembers(prev => prev.map(m => 
            m.id === data.payload.userId 
              ? { ...m, status: data.payload.status }
              : m
          ));
          break;
          
        case 'timer_started':
          // Timer started
          setRoom(data.payload.room);
          
          // Start countdown
          if (data.payload.room.timerEndTime) {
            const endTime = new Date(data.payload.room.timerEndTime);
            const remaining = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
            setRemainingTime(remaining);
            startCountdown();
          }
          
          // Add system message
          if (data.payload.message) {
            const msg = {
              ...data.payload.message,
              timestamp: new Date(data.payload.message.timestamp)
            };
            setMessages(prev => [...prev, msg]);
          }
          break;
          
        case 'timer_paused':
          // Timer paused
          setRoom(data.payload.room);
          stopCountdown();
          setRemainingTime(data.payload.remainingSeconds);
          
          // Add system message
          if (data.payload.message) {
            const msg = {
              ...data.payload.message,
              timestamp: new Date(data.payload.message.timestamp)
            };
            setMessages(prev => [...prev, msg]);
          }
          break;
          
        case 'timer_reset':
          // Timer reset
          setRoom(data.payload.room);
          stopCountdown();
          
          // Reset to full duration based on mode
          const resetDuration = data.payload.room.timerMode === 'study' ? 25 * 60 : 5 * 60;
          setRemainingTime(resetDuration);
          
          // Add system message
          if (data.payload.message) {
            const msg = {
              ...data.payload.message,
              timestamp: new Date(data.payload.message.timestamp)
            };
            setMessages(prev => [...prev, msg]);
          }
          break;
          
        case 'timer_mode_changed':
          // Timer mode changed
          setRoom(data.payload.room);
          stopCountdown();
          
          // Set duration based on new mode
          const newDuration = data.payload.room.timerMode === 'study' ? 25 * 60 : 5 * 60;
          setRemainingTime(newDuration);
          
          // Add system message
          if (data.payload.message) {
            const msg = {
              ...data.payload.message,
              timestamp: new Date(data.payload.message.timestamp)
            };
            setMessages(prev => [...prev, msg]);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }, [user, setUser, toast, onRoomTransition]);
  
  // Create a stable WebSocket connection that doesn't constantly reconnect
  const { sendMessage, status: wsStatus } = useWebSocket({
    onMessage: handleMessage,
    onOpen: () => console.log('Connected to study room server'),
    onClose: () => console.log('Disconnected from study room server'),
    onError: () => {
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the server',
        variant: 'destructive'
      });
    },
    reconnectAttempts: 3, // Limited reconnection attempts 
    reconnectInterval: 3000, // 3 seconds between reconnect attempts
    automaticOpen: true // Open the connection automatically
  });
  
  // Log WebSocket status changes for debugging
  useEffect(() => {
    console.log('WebSocket status:', wsStatus);
  }, [wsStatus]);
  
  // Function to start the countdown timer
  const startCountdown = useCallback(() => {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Set a new interval
    const id = window.setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // Time's up - stop the interval and handle completion
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setIntervalId(id);
    
    return () => {
      if (id) clearInterval(id);
    };
  }, [intervalId]);
  
  // Function to stop the countdown timer
  const stopCountdown = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  // Room creation function
  const createRoom = useCallback((nickname: string, roomName: string, roomTopic?: string) => {
    setIsLoadingRoom(true);
    sendMessage({
      type: 'create_room',
      payload: {
        nickname,
        roomName,
        roomTopic
      }
    });
  }, [sendMessage]);
  
  // Room joining function
  const joinRoom = useCallback((nickname: string, roomId: string) => {
    setIsLoadingRoom(true);
    sendMessage({
      type: 'join_room',
      payload: {
        nickname,
        roomId
      }
    });
  }, [sendMessage]);
  
  // Leave room function
  const leaveRoom = useCallback(() => {
    sendMessage({
      type: 'leave_room',
      payload: {}
    });
    
    // Reset local state
    setRoom(null);
    setMembers([]);
    setMessages([]);
    stopCountdown();
    setRemainingTime(25 * 60);
  }, [sendMessage, stopCountdown]);
  
  // Send chat message function
  const sendChatMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    
    sendMessage({
      type: 'chat_message',
      payload: {
        text
      }
    });
  }, [sendMessage]);
  
  // Change status function
  const changeStatus = useCallback((status: string) => {
    sendMessage({
      type: 'status_change',
      payload: {
        status
      }
    });
    
    // Update local user state
    if (user) {
      setUser({ ...user, status });
    }
  }, [sendMessage, user, setUser]);
  
  // Timer control functions
  const timerStart = useCallback(() => {
    sendMessage({
      type: 'timer_start',
      payload: {}
    });
  }, [sendMessage]);
  
  const timerPause = useCallback(() => {
    sendMessage({
      type: 'timer_pause',
      payload: {}
    });
  }, [sendMessage]);
  
  const timerReset = useCallback(() => {
    sendMessage({
      type: 'timer_reset',
      payload: {}
    });
  }, [sendMessage]);
  
  const timerToggleMode = useCallback(() => {
    sendMessage({
      type: 'timer_toggle_mode',
      payload: {}
    });
  }, [sendMessage]);
  
  return (
    <RoomContext.Provider 
      value={{
        room,
        members,
        messages,
        remainingTime,
        isLoadingRoom,
        createRoom,
        joinRoom,
        leaveRoom,
        sendChatMessage,
        changeStatus,
        timerStart,
        timerPause,
        timerReset,
        timerToggleMode
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
