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

  // POST /api/chat - Send message and get AI response
  app.post("/api/chat", async (req, res) => {
    try {
      const { sessionId, message, courseContext } = req.body;

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
        courseContext as Course | undefined
      );

      // Check if response is an error/fallback message
      const isErrorResponse = aiResponse.startsWith("I apologize");

      // Save assistant message
      await storage.createChatMessage({
        sessionId,
        role: "assistant",
        content: aiResponse,
        courseContext: null,
      });

      res.json({ reply: aiResponse, isError: isErrorResponse });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
