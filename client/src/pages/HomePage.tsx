import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PathwayMapper } from "@/components/PathwayMapper";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { CourseLegend } from "@/components/CourseLegend";
import { CourseDetailModal } from "@/components/CourseDetailModal";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Program, Course, ChatMessage } from "@shared/schema";

export default function HomePage() {
  const { toast } = useToast();
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingCourseContext, setPendingCourseContext] = useState<Course | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [takenCourseIds, setTakenCourseIds] = useState<string[]>([]);
  const [courseDetailOpen, setCourseDetailOpen] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);

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
    }): Promise<{ reply: string; isError?: boolean }> => {
      const response = await apiRequest("POST", "/api/chat", {
        sessionId,
        message,
        courseContext,
      });
      return response as unknown as { reply: string; isError?: boolean };
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

      // Clear all selected course IDs after response is complete
      setSelectedCourseIds([]);

      // Invalidate chat history
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history", sessionId] });
    },
    onError: (error, variables) => {
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));

      // Clear pending context on error
      setPendingCourseContext(null);

      // Clear all selected course IDs on error
      setSelectedCourseIds([]);

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    },
  });

  const handleCourseClick = (course: Course) => {
    setSelectedCourseForDetail(course);
    setCourseDetailOpen(true);
  };

  const handleAskAI = (course: Course) => {
    // Build context message including taken courses
    const takenCourses = programData?.courses.filter(c => takenCourseIds.includes(c.id)) || [];
    const takenCoursesList = takenCourses.map(c => c.code).join(", ");
    
    let contextMessage = `I'd like to know more about ${course.code}: ${course.title}.`;
    
    if (takenCoursesList) {
      contextMessage += `\n\nCourses I've taken: ${takenCoursesList}`;
    }

    setSelectedCourseIds([course.id]);
    setPendingCourseContext(course);

    sendMessageMutation.mutate({
      message: contextMessage,
      courseContext: course,
    });

    toast({
      title: "Course info sent to AI Assistant",
      description: `${course.code} - ${course.title}`,
    });
  };

  const handleToggleTaken = (courseId: string, isTaken: boolean) => {
    setTakenCourseIds((prev) => {
      if (isTaken) {
        return [...prev, courseId];
      } else {
        return prev.filter(id => id !== courseId);
      }
    });
  };

  const handleSendMessage = async (message: string, courseContext?: Course) => {
    await sendMessageMutation.mutateAsync({ message, courseContext });
  };

  const handleExportChatHistory = () => {
    if (!sessionId) return;
    window.location.href = `/api/export/chat/${sessionId}`;
    toast({
      title: "Chat history exported",
      description: "Your chat conversation has been downloaded as a JSON file",
    });
  };

  const handleExportCoursePlan = () => {
    if (!programData) return;
    const courseIds = takenCourseIds.join(',');
    const url = `/api/export/courses/${sessionId}?courseIds=${courseIds}`;
    window.location.href = url;
    toast({
      title: "Course plan exported",
      description: "Your course plan has been downloaded as an HTML file. You can print it as a PDF.",
    });
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b-2 border-primary shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary mb-2" data-testid="text-program-name">
                {program.name}
              </h1>
              {program.description && (
                <p className="text-sm text-gray-600">{program.description}</p>
              )}
            </div>
            <div className="text-right bg-primary/5 rounded-lg px-6 py-3 border border-primary/20">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Total Units Required</p>
              <p className="text-3xl font-bold text-primary" data-testid="text-total-units">
                {program.totalUnits}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCoursePlan}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition"
              data-testid="button-export-course-plan"
            >
              Download Course Plan
            </button>
            <button
              onClick={handleExportChatHistory}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              data-testid="button-export-chat"
            >
              Download Chat History
            </button>
          </div>
        </div>
      </header>

      <CourseLegend />

      <main className="bg-gray-50">
        <PathwayMapper
          courses={courses}
          onCourseClick={handleCourseClick}
          selectedCourseIds={selectedCourseIds}
          takenCourseIds={takenCourseIds}
          onToggleTaken={handleToggleTaken}
        />
      </main>

      <ChatbotWidget
        onSendMessage={handleSendMessage}
        messages={messages}
        isLoading={sendMessageMutation.isPending}
        pendingCourseContext={pendingCourseContext}
      />

      <CourseDetailModal
        open={courseDetailOpen}
        onOpenChange={setCourseDetailOpen}
        course={selectedCourseForDetail}
        onAskAI={handleAskAI}
      />
    </div>
  );
}
