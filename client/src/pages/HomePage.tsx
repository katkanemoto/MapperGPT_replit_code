import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PathwayMapper } from "@/components/PathwayMapper";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Program, Course, ChatMessage } from "@shared/schema";

export default function HomePage() {
  const { toast } = useToast();
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingCourseContext, setPendingCourseContext] = useState<Course | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // Fetch program data with courses
  const { data: programData, isLoading: isProgramLoading } = useQuery<{
    program: Program;
    courses: Course[];
  }>({
    queryKey: ["/api/programs/default"],
  });

  // Fetch chat history
  const { data: chatHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history", sessionId],
    enabled: !!sessionId,
  });

  // Load chat history when available
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      message,
      courseContext,
    }: {
      message: string;
      courseContext?: Course;
    }) => {
      return await apiRequest("POST", "/api/chat", {
        sessionId,
        message,
        courseContext,
      }) as { reply: string; isError?: boolean };
    },
    onMutate: async ({ message, courseContext }) => {
      // Optimistically add user message
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        role: "user",
        content: message,
        courseContext: courseContext || null,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
    },
    onSuccess: (data, variables) => {
      if (data.isError) {
        // Show error toast for AI service issues
        toast({
          title: "AI Service Issue",
          description: data.reply,
          variant: "destructive",
        });
        
        // Add error indicator message
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          sessionId,
          role: "assistant",
          content: data.reply,
          courseContext: null,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        // Add successful assistant response
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sessionId,
          role: "assistant",
          content: data.reply,
          courseContext: null,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Clear pending course context after response
      setPendingCourseContext(null);

      // Remove course from selected list after response is complete
      if (variables.courseContext) {
        setSelectedCourseIds((prev) =>
          prev.filter((id) => id !== variables.courseContext!.id)
        );
      }

      // Invalidate chat history
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history", sessionId] });
    },
    onError: (error, variables) => {
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));

      // Clear pending context on error
      setPendingCourseContext(null);

      // Remove from selected courses on error
      if (variables.courseContext) {
        setSelectedCourseIds((prev) =>
          prev.filter((id) => id !== variables.courseContext!.id)
        );
      }

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    },
  });

  const handleCourseClick = (course: Course) => {
    // Add to selected courses
    setSelectedCourseIds((prev) => {
      // If already selected, remove and re-add for visual feedback
      if (prev.includes(course.id)) {
        const filtered = prev.filter((id) => id !== course.id);
        // Re-add after a brief moment
        setTimeout(() => {
          setSelectedCourseIds((current) => [...current, course.id]);
        }, 50);
        return filtered;
      }
      return [...prev, course.id];
    });

    // Set as pending context
    setPendingCourseContext(course);

    // Send auto-message to chatbot
    const contextMessage = `I'd like to know more about ${course.code}: ${course.title}`;
    sendMessageMutation.mutate({
      message: contextMessage,
      courseContext: course,
    });

    // Show toast notification
    toast({
      title: "Course sent to AI Assistant",
      description: `${course.code} - ${course.title}`,
    });
  };

  const handleSendMessage = async (message: string, courseContext?: Course) => {
    await sendMessageMutation.mutateAsync({ message, courseContext });
  };

  if (isProgramLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading program pathway...</p>
        </div>
      </div>
    );
  }

  if (!programData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load program data</p>
        </div>
      </div>
    );
  }

  const { program, courses } = programData;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 h-16 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-program-name">
              {program.name}
            </h1>
            {program.description && (
              <p className="text-sm text-muted-foreground">{program.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Units</p>
            <p className="text-xl font-semibold text-foreground" data-testid="text-total-units">
              {program.totalUnits}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <PathwayMapper
          courses={courses}
          onCourseClick={handleCourseClick}
          selectedCourseIds={selectedCourseIds}
        />
      </main>

      {/* Chatbot Widget */}
      <ChatbotWidget
        onSendMessage={handleSendMessage}
        messages={messages}
        isLoading={sendMessageMutation.isPending}
        pendingCourseContext={pendingCourseContext}
      />
    </div>
  );
}
