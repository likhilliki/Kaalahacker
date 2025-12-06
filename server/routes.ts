// API Routes for Kaala.hacker - AI Financial Scam Detection Platform
// Following javascript_log_in_with_replit blueprint

import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { analyzeScamContent, getChatResponse, generateReportText } from "./openai";
import { registerUser, loginUser, getUserById } from "./auth";
import session from "express-session";

// Session middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session configuration - require SESSION_SECRET in production
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production environment");
  }
  
  app.use(
    session({
      secret: sessionSecret || "dev-only-secret-not-for-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // ============================================
  // Auth Routes
  // ============================================

  // Register new user
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName) {
        return res.status(400).json({ message: "Email, password, and first name are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const user = await registerUser({ email, password, firstName, lastName });

      // Create session
      req.session.userId = user.id;

      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Failed to register user" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await loginUser({ email, password });

      // Create session
      req.session.userId = user.id;

      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(401).json({ message: error.message || "Failed to login" });
    }
  });

  // Logout user
  app.post("/api/auth/logout", async (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ============================================
  // Scan Routes
  // ============================================

  // Analyze content for scams
  app.post("/api/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { imageBase64, extractedText, sourceType } = req.body;

      if (!imageBase64 && !extractedText) {
        return res.status(400).json({ message: "Either image or text is required" });
      }

      // Analyze with OpenAI
      const analysisResult = await analyzeScamContent(imageBase64, extractedText, sourceType);

      // Create scan record
      const scanData = {
        userId,
        imageUrl: imageBase64 ? "data:image/jpeg;base64,..." : null, // Don't store full base64
        extractedText: extractedText || null,
        sourceType: sourceType || "unknown",
        riskLevel: analysisResult.riskLevel,
        confidenceScore: analysisResult.confidenceScore,
        redFlags: analysisResult.redFlags,
        analysis: analysisResult.analysis,
        aiExplanation: analysisResult.aiExplanation,
      };

      const scan = await storage.createScan(scanData);

      // Create notification for high-risk scans
      if (analysisResult.riskLevel === "high") {
        await storage.createNotification({
          userId,
          title: "High Risk Alert!",
          message: `A high-risk scam has been detected. ${analysisResult.redFlags.length} red flags found.`,
          type: "high_risk",
          scanId: scan.id,
        });
      }

      res.json(scan);
    } catch (error: any) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ message: "Failed to analyze content: " + error.message });
    }
  });

  // Get user's scan history
  app.get("/api/scans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const scans = await storage.getUserScans(userId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  // Get single scan
  app.get("/api/scans/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const scan = await storage.getScan(id);
      
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      // Verify ownership
      const userId = req.session.userId;
      if (scan.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(scan);
    } catch (error) {
      console.error("Error fetching scan:", error);
      res.status(500).json({ message: "Failed to fetch scan" });
    }
  });

  // ============================================
  // Chat Routes
  // ============================================

  // Get chat history
  app.get("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const messages = await storage.getUserChatHistory(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Send chat message
  app.post("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        role: "user",
        content,
      });

      // Get chat history for context
      const history = await storage.getUserChatHistory(userId, 20);
      const contextMessages = history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Get AI response
      const aiResponse = await getChatResponse(contextMessages);

      // Save assistant message
      const assistantMessage = await storage.createChatMessage({
        userId,
        role: "assistant",
        content: aiResponse.content,
      });

      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to get response: " + error.message });
    }
  });

  // Clear chat history
  app.delete("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await storage.clearUserChatHistory(userId);
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      console.error("Error clearing chat:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  // ============================================
  // Report Routes
  // ============================================

  // Get user's reports
  app.get("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const reports = await storage.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Create a new report
  app.post("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { scanId, portal, description } = req.body;

      if (!portal || !description) {
        return res.status(400).json({ message: "Portal and description are required" });
      }

      // Get scan analysis for better report
      let enhancedDescription = description;
      if (scanId) {
        const scan = await storage.getScan(scanId);
        // Verify scan belongs to the current user
        if (scan && scan.userId !== userId) {
          return res.status(403).json({ message: "Access denied to this scan" });
        }
        if (scan && scan.analysis) {
          enhancedDescription = await generateReportText(
            scan.analysis,
            description,
            portal as "chakshu" | "cybercrime"
          );
        }
      }

      const report = await storage.createScamReport({
        userId,
        scanId: scanId || null,
        portal,
        description: enhancedDescription,
        status: "pending",
      });

      // Create notification
      await storage.createNotification({
        userId,
        title: "Report Submitted",
        message: `Your report has been submitted to ${portal === "chakshu" ? "Chakshu Portal" : "Cybercrime Portal"}.`,
        type: "success",
      });

      res.json(report);
    } catch (error: any) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report: " + error.message });
    }
  });

  // ============================================
  // Notification Routes
  // ============================================

  // Get user's notifications
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      
      // Fetch notification directly and verify ownership
      const notification = await storage.getNotification(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      if (notification.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.markNotificationRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification:", error);
      res.status(500).json({ message: "Failed to mark notification" });
    }
  });

  // Mark all notifications as read
  app.patch("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await storage.markAllNotificationsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking notifications:", error);
      res.status(500).json({ message: "Failed to mark notifications" });
    }
  });

  // ============================================
  // Stats Routes
  // ============================================

  // Get user stats
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get admin/platform stats
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      // Check if user is admin
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getPlatformStats();
      const dailyStats = await storage.getDailyStats(30);

      res.json({
        ...stats,
        dailyStats,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  return httpServer;
}
