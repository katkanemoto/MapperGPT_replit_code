import OpenAI from "openai";
import type { Course } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getChatbotResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  courseContext?: Course
): Promise<string> {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return "I apologize, but the AI assistant is not configured. Please contact the administrator to set up the OpenAI API key.";
    }

    // Build context-aware system message
    let systemMessage = `You are an AI Course Assistant helping students with their academic program pathway. You provide helpful, accurate information about courses, prerequisites, degree requirements, and academic planning. Be concise but informative.`;

    if (courseContext) {
      systemMessage += `\n\nCurrent Course Context:\n- Code: ${courseContext.code}\n- Title: ${courseContext.title}\n- Units: ${courseContext.units}\n- Description: ${courseContext.description || "N/A"}`;
      
      if (courseContext.prerequisites && courseContext.prerequisites.length > 0) {
        systemMessage += `\n- Prerequisites: ${courseContext.prerequisites.join(", ")}`;
      }
      
      systemMessage += `\n- Semester: ${courseContext.semester}`;
    }

    // Build messages array with conversation history
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages,
      max_completion_tokens: 2048,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Provide friendly error messages based on error type
    if (error?.status === 401) {
      return "I apologize, but the AI assistant authentication failed. Please check the API key configuration.";
    } else if (error?.status === 429) {
      return "I apologize, but the AI service is currently rate-limited. Please try again in a moment.";
    } else if (error?.message?.includes("model")) {
      return "I apologize, but the AI model is currently unavailable. The service may be experiencing issues. Please try again later.";
    }
    
    return "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.";
  }
}
