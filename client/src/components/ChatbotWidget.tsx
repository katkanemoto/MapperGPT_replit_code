import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Minimize2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatMessage, Course } from "@shared/schema";

interface ChatbotWidgetProps {
  onSendMessage: (message: string, courseContext?: Course) => Promise<void>;
  messages: ChatMessage[];
  isLoading: boolean;
  pendingCourseContext?: Course | null;
}

export function ChatbotWidget({
  onSendMessage,
  messages,
  isLoading,
  pendingCourseContext,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Auto-open chatbot when course context is sent
  useEffect(() => {
    if (pendingCourseContext && !isOpen) {
      setIsOpen(true);
    }
  }, [pendingCourseContext, isOpen]);

  // Focus input after opening or sending message
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input;
    setInput("");

    await onSendMessage(messageText, pendingCourseContext || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button - Collapsed State */}
      {!isOpen && (
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:scale-105 transition-transform duration-200"
          data-testid="button-open-chatbot"
          aria-label="Open AI Course Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chatbot Panel - Expanded State */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-card-border rounded-2xl shadow-2xl flex flex-col overflow-hidden",
            "transition-all duration-300 ease-in-out",
            "max-md:w-[calc(100vw-3rem)] max-md:h-[calc(100vh-3rem)]"
          )}
          data-testid="panel-chatbot"
        >
          {/* Header */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
            <h2 className="text-base font-semibold" data-testid="text-chatbot-title">
              AI Course Assistant
            </h2>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                data-testid="button-close-chatbot"
                aria-label="Close chatbot"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Course Context Badge */}
          {pendingCourseContext && (
            <div className="px-4 py-2 bg-accent border-b border-border">
              <Badge variant="secondary" className="text-xs" data-testid="badge-course-context">
                Context: {pendingCourseContext.code} - {pendingCourseContext.title}
              </Badge>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8" data-testid="text-empty-chat">
                  Click on any course card to get started, or ask me anything about the program!
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    {message.courseContext && typeof message.courseContext === 'object' && 'code' in message.courseContext && (
                      <div className="mt-2 pt-2 border-t border-primary-foreground/20">
                        <p className="text-xs opacity-80">
                          Course: {String(message.courseContext.code)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start" data-testid="indicator-loading">
                  <div className="bg-muted rounded-2xl px-4 py-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">AI Assistant is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="px-4 py-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about courses, prerequisites, or requirements..."
                className="resize-none min-h-[60px] text-sm"
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-[60px] w-[60px] shrink-0"
                data-testid="button-send-message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
