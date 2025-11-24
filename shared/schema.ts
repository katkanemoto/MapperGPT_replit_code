import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Programs table - different degree/certificate pathways
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  totalUnits: integer("total_units").notNull().default(0),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull().references(() => programs.id),
  code: text("code").notNull(),
  title: text("title").notNull(),
  units: integer("units").notNull(),
  description: text("description"),
  prerequisites: text("prerequisites").array(),
  semester: text("semester").notNull(), // "Fall Year 1", "Spring Year 1", etc.
  semesterOrder: integer("semester_order").notNull(), // For sorting: 1, 2, 3, etc.
});

// Chat messages table for conversation history
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  courseContext: jsonb("course_context"), // Optional course data sent with message
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert schemas
export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Select types
export type Program = typeof programs.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Insert types
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Frontend-only types
export type CourseWithContext = Course & {
  isInConversation?: boolean;
};
