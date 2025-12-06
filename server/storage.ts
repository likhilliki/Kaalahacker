// Database storage for Kaala.hacker
// Following javascript_database and javascript_log_in_with_replit blueprints

import {
  users,
  scans,
  chatMessages,
  scamReports,
  notifications,
  platformStats,
  type User,
  type UpsertUser,
  type Scan,
  type InsertScan,
  type ChatMessage,
  type InsertChatMessage,
  type ScamReport,
  type InsertScamReport,
  type Notification,
  type InsertNotification,
  type PlatformStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: { email: string; password: string; firstName?: string | null; lastName?: string | null }): Promise<User>;


  // Scan operations
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  getUserScans(userId: string): Promise<Scan[]>;
  getRecentScans(limit?: number): Promise<Scan[]>;

  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  clearUserChatHistory(userId: string): Promise<void>;

  // Scam report operations
  createScamReport(report: InsertScamReport): Promise<ScamReport>;
  getUserReports(userId: string): Promise<ScamReport[]>;
  updateReportStatus(id: string, status: string): Promise<ScamReport | undefined>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;

  // Stats operations
  getUserStats(userId: string): Promise<{
    totalScans: number;
    scamsDetected: number;
    reportsSubmitted: number;
  }>;
  getPlatformStats(): Promise<{
    totalScans: number;
    scamsDetected: number;
    reportsSubmitted: number;
    activeUsers: number;
  }>;
  getDailyStats(days?: number): Promise<PlatformStats[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const [result] = await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async createUser(data: { email: string; password: string; firstName?: string | null; lastName?: string | null }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(data)
      .returning();
    return user;
  }

  // Scan operations
  async createScan(scanData: InsertScan): Promise<Scan> {
    const [scan] = await db.insert(scans).values(scanData).returning();
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async getUserScans(userId: string): Promise<Scan[]> {
    return await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt));
  }

  async getRecentScans(limit: number = 10): Promise<Scan[]> {
    return await db
      .select()
      .from(scans)
      .orderBy(desc(scans.createdAt))
      .limit(limit);
  }

  // Chat message operations
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  async getUserChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  }

  async clearUserChatHistory(userId: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  }

  // Scam report operations
  async createScamReport(reportData: InsertScamReport): Promise<ScamReport> {
    const [report] = await db.insert(scamReports).values(reportData).returning();
    return report;
  }

  async getUserReports(userId: string): Promise<ScamReport[]> {
    return await db
      .select()
      .from(scamReports)
      .where(eq(scamReports.userId, userId))
      .orderBy(desc(scamReports.createdAt));
  }

  async updateReportStatus(id: string, status: string): Promise<ScamReport | undefined> {
    const [report] = await db
      .update(scamReports)
      .set({ status })
      .where(eq(scamReports.id, id))
      .returning();
    return report;
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    totalScans: number;
    scamsDetected: number;
    reportsSubmitted: number;
  }> {
    const userScans = await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId));

    const userReports = await db
      .select()
      .from(scamReports)
      .where(eq(scamReports.userId, userId));

    return {
      totalScans: userScans.length,
      scamsDetected: userScans.filter((s) => s.riskLevel === "high" || s.riskLevel === "medium").length,
      reportsSubmitted: userReports.length,
    };
  }

  async getPlatformStats(): Promise<{
    totalScans: number;
    scamsDetected: number;
    reportsSubmitted: number;
    activeUsers: number;
  }> {
    const allScans = await db.select().from(scans);
    const allReports = await db.select().from(scamReports);
    const allUsers = await db.select().from(users);

    // Count unique users who have scans in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentScans = await db
      .select({ userId: scans.userId })
      .from(scans)
      .where(gte(scans.createdAt, thirtyDaysAgo));

    const activeUserIds = new Set(recentScans.map((s) => s.userId));

    return {
      totalScans: allScans.length,
      scamsDetected: allScans.filter((s) => s.riskLevel === "high" || s.riskLevel === "medium").length,
      reportsSubmitted: allReports.length,
      activeUsers: activeUserIds.size || allUsers.length,
    };
  }

  async getDailyStats(days: number = 30): Promise<PlatformStats[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await db
      .select()
      .from(platformStats)
      .where(gte(platformStats.date, startDate))
      .orderBy(platformStats.date);
  }
}

export const storage = new DatabaseStorage();