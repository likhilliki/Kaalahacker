import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scam scan records
export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  imageUrl: text("image_url"),
  extractedText: text("extracted_text"),
  sourceType: varchar("source_type").notNull(), // whatsapp, sms, instagram, trading_app
  riskLevel: varchar("risk_level").notNull(), // high, medium, low, safe
  confidenceScore: real("confidence_score").notNull(),
  redFlags: jsonb("red_flags").$type<string[]>().default([]),
  analysis: text("analysis"),
  aiExplanation: text("ai_explanation"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages for education chatbot
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull(), // user, assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scam reports submitted to authorities
export const scamReports = pgTable("scam_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  scanId: varchar("scan_id").references(() => scans.id),
  portal: varchar("portal").notNull(), // chakshu, cybercrime
  description: text("description").notNull(),
  status: varchar("status").default("pending"), // pending, submitted, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications for users
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // high_risk, info, success
  isRead: boolean("is_read").default(false),
  scanId: varchar("scan_id").references(() => scans.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform statistics for admin
export const platformStats = pgTable("platform_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalScans: integer("total_scans").default(0),
  scamsDetected: integer("scams_detected").default(0),
  reportsSubmitted: integer("reports_submitted").default(0),
  activeUsers: integer("active_users").default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  scans: many(scans),
  chatMessages: many(chatMessages),
  scamReports: many(scamReports),
  notifications: many(notifications),
}));

export const scansRelations = relations(scans, ({ one, many }) => ({
  user: one(users, {
    fields: [scans.userId],
    references: [users.id],
  }),
  reports: many(scamReports),
  notifications: many(notifications),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const scamReportsRelations = relations(scamReports, ({ one }) => ({
  user: one(users, {
    fields: [scamReports.userId],
    references: [users.id],
  }),
  scan: one(scans, {
    fields: [scamReports.scanId],
    references: [scans.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  scan: one(scans, {
    fields: [notifications.scanId],
    references: [scans.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScanSchema = createInsertSchema(scans).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertScamReportSchema = createInsertSchema(scamReports).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ScamReport = typeof scamReports.$inferSelect;
export type InsertScamReport = z.infer<typeof insertScamReportSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type PlatformStats = typeof platformStats.$inferSelect;
