import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChatbotResponse } from "./openai";
import type { Course } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/programs - Get all programs
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getAllPrograms();
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  // GET /api/programs/default - Get default program (first program)
  // This MUST come before /api/programs/:id to avoid matching "default" as an id
  app.get("/api/programs/default", async (req, res) => {
    try {
      const programs = await storage.getAllPrograms();
      
      if (programs.length === 0) {
        return res.status(404).json({ error: "No programs available" });
      }

      const program = programs[0];
      const courses = await storage.getCoursesByProgram(program.id);
      
      res.json({ program, courses });
    } catch (error) {
      console.error("Error fetching default program:", error);
      res.status(500).json({ error: "Failed to fetch default program" });
    }
  });

  // GET /api/programs/:id - Get program with courses
  app.get("/api/programs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const program = await storage.getProgram(id);
      
      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }

      const courses = await storage.getCoursesByProgram(id);
      
      res.json({ program, courses });
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ error: "Failed to fetch program" });
    }
  });

  // GET /api/chat/history/:sessionId - Get chat history for a session
  app.get("/api/chat/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // GET /api/export/chat/:sessionId - Export chat history as JSON
  app.get("/api/export/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessagesBySession(sessionId);
      
      const exportData = {
        sessionId,
        exportDate: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages.map(msg => ({
          timestamp: msg.timestamp,
          role: msg.role,
          content: msg.content,
          course: msg.courseContext ? `${(msg.courseContext as any).code}: ${(msg.courseContext as any).title}` : null
        }))
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=chat-history.json");
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting chat:", error);
      res.status(500).json({ error: "Failed to export chat history" });
    }
  });

  // GET /api/export/courses/:sessionId - Export course summary with courses taken
  app.get("/api/export/courses/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { courseIds } = req.query;
      
      const programs = await storage.getAllPrograms();
      if (programs.length === 0) {
        return res.status(404).json({ error: "No programs available" });
      }

      const program = programs[0];
      const courses = await storage.getCoursesByProgram(program.id);
      
      // Parse course IDs from query
      const takenCourseIds = typeof courseIds === 'string' ? courseIds.split(',') : [];
      const takenCourses = courses.filter(c => takenCourseIds.includes(c.id));
      
      // Generate HTML content for printing as PDF
      const takenUnits = takenCourses.reduce((sum, c) => sum + c.units, 0);
      const remainingUnits = program.totalUnits - takenUnits;
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Course Plan - ${program.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f3f4f6; font-weight: bold; }
    .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>${program.name}</h1>
  <p><strong>Program Name:</strong> ${program.name}</p>
  <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
  
  <div class="summary">
    <h2>Progress Summary</h2>
    <p><strong>Total Units Required:</strong> ${program.totalUnits}</p>
    <p><strong>Units Completed:</strong> ${takenUnits}</p>
    <p><strong>Units Remaining:</strong> ${remainingUnits}</p>
    <p><strong>Progress:</strong> ${Math.round((takenUnits / program.totalUnits) * 100)}%</p>
  </div>

  <h2>Courses Completed</h2>
  ${takenCourses.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Course Code</th>
          <th>Course Title</th>
          <th>Units</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        ${takenCourses.map(c => `
          <tr>
            <td>${c.code}</td>
            <td>${c.title}</td>
            <td>${c.units}</td>
            <td>${c.requirementType || 'Elective'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>No courses completed yet.</p>'}

  <h2>Courses Remaining</h2>
  ${courses.length - takenCourses.length > 0 ? `
    <p>To complete this program, you still need to take the following courses:</p>
    <table>
      <thead>
        <tr>
          <th>Course Code</th>
          <th>Course Title</th>
          <th>Units</th>
          <th>Semester</th>
        </tr>
      </thead>
      <tbody>
        ${courses.filter(c => !takenCourseIds.includes(c.id)).map(c => `
          <tr>
            <td>${c.code}</td>
            <td>${c.title}</td>
            <td>${c.units}</td>
            <td>${c.semester}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>All courses completed!</p>'}

  <div class="footer">
    <p>This document can be printed as PDF or saved. Please share this with your academic counselor.</p>
  </div>
</body>
</html>
      `;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=course-plan.html");
      res.send(htmlContent);
    } catch (error) {
      console.error("Error exporting courses:", error);
      res.status(500).json({ error: "Failed to export course plan" });
    }
  });

  // POST /api/chat - Send message and get AI response
  app.post("/api/chat", async (req, res) => {
    try {
      const { sessionId, message, courseContext, studentProfile } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        sessionId,
        role: "user",
        content: message,
        courseContext: courseContext || null,
      });

      // Get conversation history (excluding the just-added message)
      const history = await storage.getChatMessagesBySession(sessionId);
      const conversationHistory = history
        .filter((msg) => msg.id !== userMessage.id)
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Get AI response with context
      const aiResponse = await getChatbotResponse(
        message,
        conversationHistory,
        courseContext as Course | undefined,
        studentProfile as any
      );

      // Check if response is an error/fallback message
      const isErrorResponse = aiResponse.startsWith("I apologize");

      // Only save assistant message if it's not an error
      if (!isErrorResponse) {
        await storage.createChatMessage({
          sessionId,
          role: "assistant",
          content: aiResponse,
          courseContext: null,
        });
      }

      res.json({ reply: aiResponse, isError: isErrorResponse });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
