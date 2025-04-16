import { 
  users, type User, type InsertUser,
  rooms, type Room, type InsertRoom,
  messages, type Message, type InsertMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserBySocketId(socketId: string): Promise<User | undefined>;
  getUsersByRoomId(roomId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Room operations
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, data: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;
  
  // Message operations
  getMessagesByRoomId(roomId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rooms: Map<string, Room>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private messageIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.messageIdCounter = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserBySocketId(socketId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.socketId === socketId);
  }
  
  async getUsersByRoomId(roomId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.roomId === roomId);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Room operations
  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }
  
  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = { 
      ...insertRoom,
      timerState: "stopped",
      timerMode: "study",
      timerEndTime: null,
      studyDuration: 25 * 60,
      breakDuration: 5 * 60
    };
    
    this.rooms.set(room.id, room);
    return room;
  }
  
  async updateRoom(id: string, data: Partial<Room>): Promise<Room | undefined> {
    const room = await this.getRoom(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...data };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }
  
  async deleteRoom(id: string): Promise<boolean> {
    return this.rooms.delete(id);
  }
  
  // Message operations
  async getMessagesByRoomId(roomId: string, limit: number = 50): Promise<Message[]> {
    const roomMessages = Array.from(this.messages.values())
      .filter(message => message.roomId === roomId)
      .sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
    
    if (limit && roomMessages.length > limit) {
      return roomMessages.slice(roomMessages.length - limit);
    }
    
    return roomMessages;
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp: new Date()
    };
    
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
