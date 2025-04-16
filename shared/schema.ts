import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  socketId: text("socket_id"),
  roomId: text("room_id"),
  status: text("status").default("focused"),
  isHost: boolean("is_host").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  socketId: true,
  roomId: true,
  status: true,
  isHost: true,
});

// Room schema
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  topic: text("topic"),
  timerState: text("timer_state").default("stopped"), // stopped, running, paused
  timerMode: text("timer_mode").default("study"), // study, break
  timerEndTime: timestamp("timer_end_time"),
  studyDuration: integer("study_duration").default(25 * 60), // 25 minutes in seconds
  breakDuration: integer("break_duration").default(5 * 60), // 5 minutes in seconds
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  id: true,
  name: true,
  topic: true,
});

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull(),
  userId: integer("user_id"), // null for system messages
  username: text("username"),
  text: text("text").notNull(),
  type: text("type").default("user"), // user, system
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  roomId: true,
  userId: true,
  username: true,
  text: true,
  type: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// WebSocket message schema
export const wsMessageSchema = z.object({
  type: z.enum([
    "join_room", 
    "create_room", 
    "leave_room", 
    "chat_message", 
    "status_change",
    "timer_start",
    "timer_pause",
    "timer_reset",
    "timer_toggle_mode"
  ]),
  payload: z.any()
});

export type WSMessage = z.infer<typeof wsMessageSchema>;
