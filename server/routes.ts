import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { 
  wsMessageSchema, 
  insertRoomSchema, 
  insertUserSchema, 
  insertMessageSchema,
  type Room,
  type User,
  type Message
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server with ping interval to keep connections alive
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    clientTracking: true,
    perMessageDeflate: false // Disable compression for better performance
  });
  
  // Map to store connections by socketId
  const connections = new Map<string, WebSocket>();
  
  // Track "heartbeat" to detect dead connections
  function heartbeat(this: WebSocket) {
    (this as any).isAlive = true;
  }
  
  // Set up ping interval to detect and clean up dead connections
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if ((ws as any).isAlive === false) {
        const socketId = (ws as any).socketId;
        if (socketId) {
          console.log('Terminating inactive connection', socketId.substring(0, 6));
          connections.delete(socketId);
        }
        return ws.terminate();
      }
      
      (ws as any).isAlive = false;
      try {
        ws.ping();
      } catch (e) {
        // Connection already terminated, clean up
        const socketId = (ws as any).socketId;
        if (socketId) {
          connections.delete(socketId);
        }
      }
    });
  }, 30000); // Check every 30 seconds
  
  // Clean up interval when server closes
  wss.on('close', () => {
    clearInterval(pingInterval);
  });
  
  wss.on('connection', (ws) => {
    const socketId = randomUUID();
    
    // Mark connection as alive and store socket ID
    (ws as any).isAlive = true;
    (ws as any).socketId = socketId;
    
    // Register ping response handler
    ws.on('pong', heartbeat);
    
    // Store the connection with its socketId
    connections.set(socketId, ws);
    
    console.log('Client connected', socketId.substring(0, 6));
    
    // Send the socket ID to the client
    try {
      ws.send(JSON.stringify({
        type: 'connection_established',
        payload: { socketId }
      }));
    } catch (error) {
      console.error('Error sending connection message:', error);
    }
    
    ws.on('message', async (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        const validated = wsMessageSchema.parse(parsed);
        
        switch (validated.type) {
          case 'create_room':
            await handleCreateRoom(ws, socketId, validated.payload);
            break;
            
          case 'join_room':
            await handleJoinRoom(ws, socketId, validated.payload);
            break;
            
          case 'leave_room':
            await handleLeaveRoom(ws, socketId);
            break;
            
          case 'chat_message':
            await handleChatMessage(ws, socketId, validated.payload);
            break;
            
          case 'status_change':
            await handleStatusChange(ws, socketId, validated.payload);
            break;
            
          case 'timer_start':
            await handleTimerStart(ws, socketId);
            break;
            
          case 'timer_pause':
            await handleTimerPause(ws, socketId);
            break;
            
          case 'timer_reset':
            await handleTimerReset(ws, socketId);
            break;
            
          case 'timer_toggle_mode':
            await handleTimerToggleMode(ws, socketId);
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
        
        if (error instanceof ZodError) {
          ws.send(JSON.stringify({
            type: 'error',
            payload: {
              message: 'Invalid message format',
              details: error.errors
            }
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            payload: {
              message: 'Error processing message'
            }
          }));
        }
      }
    });
    
    ws.on('close', async () => {
      console.log('Client disconnected', socketId.substring(0, 6));
      
      // Remove from connections map
      connections.delete(socketId);
      
      // Handle user leaving room
      await handleLeaveRoom(ws, socketId);
    });
  });
  
  return httpServer;
  
  // Helper functions for WebSocket message handling
  
  async function handleCreateRoom(ws: WebSocket, socketId: string, payload: any) {
    console.log('Creating room with payload:', payload);
    console.log('Using socket ID:', socketId);
    
    try {
      const { nickname, roomName, roomTopic } = payload;
      console.log(`Creating room: ${roomName} with topic: ${roomTopic || 'none'} for user ${nickname}`);
      
      const roomId = generateRoomCode();
      console.log('Generated room code:', roomId);
      
      // Create the room
      const roomData = insertRoomSchema.parse({
        id: roomId,
        name: roomName,
        topic: roomTopic || 'General Study'
      });
      
      console.log('Validated room data:', roomData);
      const room = await storage.createRoom(roomData);
      console.log('Room created:', room);
      
      // Create the user as host
      const userData = insertUserSchema.parse({
        username: nickname,
        socketId: socketId,
        roomId: roomId,
        status: 'focused',
        isHost: true
      });
      
      console.log('Validated user data:', userData);
      const user = await storage.createUser(userData);
      console.log('User created:', user);
      
      // Create a system message
      const message = await storage.createMessage({
        roomId,
        type: 'system',
        text: `${nickname} created the room`
      });
      console.log('System message created:', message);
      
      // Prepare response
      const response = {
        type: 'room_created',
        payload: {
          roomId,
          room,
          user
        }
      };
      console.log('Sending response:', response);
      
      // Send success response to client
      try {
        ws.send(JSON.stringify(response));
        console.log('Room creation response sent successfully');
      } catch (sendError) {
        console.error('Error sending room_created response:', sendError);
      }
      
    } catch (error) {
      console.error('Error creating room:', error);
      try {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Failed to create room',
            details: error instanceof Error ? error.message : String(error)
          }
        }));
      } catch (sendError) {
        console.error('Error sending error response:', sendError);
      }
    }
  }
  
  async function handleJoinRoom(ws: WebSocket, socketId: string, payload: any) {
    try {
      const { nickname, roomId } = payload;
      
      // Check if room exists
      const room = await storage.getRoom(roomId);
      if (!room) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Room not found'
          }
        }));
        return;
      }
      
      // Create the user
      const userData = insertUserSchema.parse({
        username: nickname,
        socketId: socketId,
        roomId: roomId,
        status: 'focused',
        isHost: false
      });
      
      const user = await storage.createUser(userData);
      
      // Get all room members
      const members = await storage.getUsersByRoomId(roomId);
      
      // Get recent messages
      const messages = await storage.getMessagesByRoomId(roomId);
      
      // Create a system message
      const joinMessage = await storage.createMessage({
        roomId,
        type: 'system',
        text: `${nickname} joined the room`
      });
      
      // Send success response to client
      ws.send(JSON.stringify({
        type: 'room_joined',
        payload: {
          room,
          user,
          members,
          messages
        }
      }));
      
      // Notify other members in the room
      broadcastToRoom(roomId, socketId, {
        type: 'member_joined',
        payload: {
          user,
          message: joinMessage
        }
      });
      
    } catch (error) {
      console.error('Error joining room:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          message: 'Failed to join room'
        }
      }));
    }
  }
  
  async function handleLeaveRoom(ws: WebSocket, socketId: string) {
    try {
      // Find user by socket ID
      const user = await storage.getUserBySocketId(socketId);
      if (!user) return;
      
      const { id: userId, username, roomId } = user;
      
      if (roomId) {
        // Create a system message about leaving
        const leaveMessage = await storage.createMessage({
          roomId,
          type: 'system',
          text: `${username} left the room`
        });
        
        // Check if user is host, if yes, find someone to be the new host
        if (user.isHost) {
          const members = await storage.getUsersByRoomId(roomId);
          const otherMembers = members.filter(m => m.id !== userId);
          
          // If there are other members, assign a new host
          if (otherMembers.length > 0) {
            const newHost = otherMembers[0];
            await storage.updateUser(newHost.id, { isHost: true });
            
            // Notify room about new host
            broadcastToRoom(roomId, '', {
              type: 'host_changed',
              payload: {
                newHostId: newHost.id,
                message: await storage.createMessage({
                  roomId,
                  type: 'system',
                  text: `${newHost.username} is now the host`
                })
              }
            });
          } else {
            // If no other members, delete the room
            await storage.deleteRoom(roomId);
          }
        }
        
        // Notify other members about user leaving
        broadcastToRoom(roomId, socketId, {
          type: 'member_left',
          payload: {
            userId,
            message: leaveMessage
          }
        });
      }
      
      // Remove user
      await storage.deleteUser(userId);
      
    } catch (error) {
      console.error('Error handling user leave:', error);
    }
  }
  
  async function handleChatMessage(ws: WebSocket, socketId: string, payload: any) {
    try {
      const { text } = payload;
      
      // Find user by socket ID
      const user = await storage.getUserBySocketId(socketId);
      if (!user || !user.roomId) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'You are not in a room'
          }
        }));
        return;
      }
      
      // Create message
      const messageData = insertMessageSchema.parse({
        roomId: user.roomId,
        userId: user.id,
        username: user.username,
        text,
        type: 'user'
      });
      
      const message = await storage.createMessage(messageData);
      
      // Send confirmation to sender
      ws.send(JSON.stringify({
        type: 'message_sent',
        payload: { message }
      }));
      
      // Broadcast to room
      broadcastToRoom(user.roomId, socketId, {
        type: 'new_message',
        payload: { message }
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          message: 'Failed to send message'
        }
      }));
    }
  }
  
  async function handleStatusChange(ws: WebSocket, socketId: string, payload: any) {
    try {
      const { status } = payload;
      
      // Find user by socket ID
      const user = await storage.getUserBySocketId(socketId);
      if (!user || !user.roomId) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'You are not in a room'
          }
        }));
        return;
      }
      
      // Update user status
      const updatedUser = await storage.updateUser(user.id, { status });
      
      // Broadcast to room
      broadcastToRoom(user.roomId, '', {
        type: 'status_changed',
        payload: { 
          userId: user.id,
          status
        }
      });
      
    } catch (error) {
      console.error('Error changing status:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          message: 'Failed to change status'
        }
      }));
    }
  }
  
  async function handleTimerStart(ws: WebSocket, socketId: string) {
    try {
      // Find user by socket ID
      const user = await storage.getUserBySocketId(socketId);
      if (!user || !user.roomId) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'You are not in a room'
          }
        }));
        return;
      }
      
      // Only host can control timer
      if (!user.isHost) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Only the host can control the timer'
          }
        }));
        return;
      }
      
      // Get room
      const room = await storage.getRoom(user.roomId);
      if (!room) return;
      
      // Calculate end time
      const duration = room.timerMode === 'study' 
        ? (room.studyDuration ?? 25 * 60) 
        : (room.breakDuration ?? 5 * 60);
      const endTime = new Date(Date.now() + duration * 1000);
      
      // Update room timer state
      const updatedRoom = await storage.updateRoom(user.roomId, {
        timerState: 'running',
        timerEndTime: endTime
      });
      
      // Create system message
      const message = await storage.createMessage({
        roomId: user.roomId,
        type: 'system',
        text: `Timer started by ${user.username}`
      });
      
      // Broadcast to room
      broadcastToRoom(user.roomId, '', {
        type: 'timer_started',
        payload: {
          room: updatedRoom,
          message
        }
      });
      
    } catch (error) {
      console.error('Error starting timer:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          message: 'Failed to start timer'
        }
      }));
    }
  }
  
  async function handleTimerPause(ws: WebSocket, socketId: string) {
    try {
      // Find user by socket ID
      const user = await storage.getUserBySocketId(socketId);
      if (!user || !user.roomId) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'You are not in a room'
          }
        }));
        return;
      }
      
      // Only host can control timer
      if (!user.isHost) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Only the host can control the timer'
          }
        }));
        return;
      }
      
      // Get room
      const room = await storage.getRoom(user.roomId);
      if (!room) return;
      
      // Calculate remaining time
      let remainingSeconds = 0;
      if (room.timerEndTime) {
        remainingSeconds = Math.max(0, 
          Math.floor((new Date(room.timerEndTime).getTime() - Date.now()) / 1000)
        );
      }
      
      // Update room timer state
      const updatedRoom = await storage.updateRoom(user.roomId, {
        timerState: 'paused',
        timerEndTime: null,
        ...(room.timerMode === 'study' 
          ? { studyDuration: remainingSeconds } 
          : { breakDuration: remainingSeconds })
      });
      
      // Create system message
      const message = await storage.createMessage({
        roomId: user.roomId,
        type: 'system',
        text: `Timer paused by ${user.username}`
      });
      
      // Broadcast to room
      broadcastToRoom(user.roomId, '', {
        type: 'timer_paused',
        payload: {
          room: updatedRoom,
          message,
          remainingSeconds
        }
      });
      
    } catch (error) {
      console.error('Error pausing timer:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          message: 'Failed to pause timer'
        }
      }));
    }
  }
  
  async function handleTimerReset(ws: WebSocket, socketId: string) {
    try {
      // Find user by socket ID
      const user = await storage.getUserBySocketId(socketId);
      if (!user || !user.roomId) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'You are not in a room'
          }
        }));
        return;
      }
      
      // Only host can control timer
      if (!user.isHost) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Only the host can control the timer'
          }
        }));
        return;
      }
      
      // Get room
      const room = await storage.getRoom(user.roomId);
      if (!room) return;
      
      // Reset timer - set default durations
      const updatedRoom = await storage.updateRoom(user.roomId, {
        timerState: 'stopped',
        timerEndTime: null,
        studyDuration: 25 * 60,
        breakDuration: 5 * 60
      });
      
      // Create system message
      const message = await storage.createMessage({
        roomId: user.roomId,
        type: 'system',
        text: `Timer reset by ${user.username}`
      });
      
      // Broadcast to room
      broadcastToRoom(user.roomId, '', {
        type: 'timer_reset',
        payload: {
          room: updatedRoom,
          message
        }
      });
      
    } catch (error) {
      console.error('Error resetting timer:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          message: 'Failed to reset timer'
        }
      }));
    }
  }
  
  async function handleTimerToggleMode(ws: WebSocket, socketId: string) {
    try {
      // Find user by socket ID
      const user = await storage.getUserBySocketId(socketId);
      if (!user || !user.roomId) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'You are not in a room'
          }
        }));
        return;
      }
      
      // Only host can control timer
      if (!user.isHost) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Only the host can control the timer'
          }
        }));
        return;
      }
      
      // Get room
      const room = await storage.getRoom(user.roomId);
      if (!room) return;
      
      // Toggle mode
      const newMode = room.timerMode === 'study' ? 'break' : 'study';
      
      // Update room timer state
      const updatedRoom = await storage.updateRoom(user.roomId, {
        timerMode: newMode,
        timerState: 'stopped',
        timerEndTime: null
      });
      
      // Create system message
      const message = await storage.createMessage({
        roomId: user.roomId,
        type: 'system',
        text: `${newMode === 'study' ? 'Study time' : 'Break time'} started`
      });
      
      // Broadcast to room
      broadcastToRoom(user.roomId, '', {
        type: 'timer_mode_changed',
        payload: {
          room: updatedRoom,
          message
        }
      });
      
    } catch (error) {
      console.error('Error toggling timer mode:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          message: 'Failed to toggle timer mode'
        }
      }));
    }
  }
  
  // Helper to broadcast messages to all clients in a room
  async function broadcastToRoom(roomId: string, excludeSocketId: string, message: any) {
    try {
      // Get all users in the room
      const users = await storage.getUsersByRoomId(roomId);
      
      // For each user in the room, send the message to their socket if it exists
      for (const user of users) {
        // Skip the sender
        if (user.socketId === excludeSocketId) continue;
        
        // Get the client socket
        if (user.socketId) {
          const client = connections.get(user.socketId);
          
          // Send message if client exists and is open
          if (client && client.readyState === WebSocket.OPEN) {
            try {
              client.send(JSON.stringify(message));
            } catch (e) {
              console.error('Error sending message to client', user.socketId.substring(0, 6), e);
              // Clean up stale connections
              connections.delete(user.socketId);
            }
          } else if (client) {
            // Client exists but is not open - clean up stale connection
            console.log('Cleaning up stale connection', user.socketId.substring(0, 6));
            connections.delete(user.socketId);
          }
        }
      }
    } catch (error) {
      console.error('Error broadcasting to room:', error);
    }
  }
  
  // Helper to get a client by socket ID
  function getClientBySocketId(socketId: string): WebSocket | undefined {
    return connections.get(socketId);
  }
  
  // Generate a simple 6-character room code
  function generateRoomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}
