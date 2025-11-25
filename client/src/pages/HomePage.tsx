import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PathwayMapper } from "@/components/PathwayMapper";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { CourseLegend } from "@/components/CourseLegend";
import { CourseContextDialog } from "@/components/CourseContextDialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Program, Course, ChatMessage } from "@shared/schema";

export default function HomePage() {
  const { toast } = useToast();
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingCourseContext, setPendingCourseContext] = useState<Course | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourseForDialog, setSelectedCourseForDialog] = useState<Course | null>(null);

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
      return response as { reply: string; isError?: boolean };
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
    setSelectedCourseForDialog(course);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (context: {
    selectedCourse: Course;
    hasCompletedCourse: boolean;
    completedCourses: Course[];
    transferDestination: string;
  }) => {
    const { selectedCourse, hasCompletedCourse, completedCourses, transferDestination } = context;

    const completedCoursesList = completedCourses.map(c => c.code).join(", ");
    
    let contextMessage = `I'd like to know more about ${selectedCourse.code}: ${selectedCourse.title}.\n\n`;
    contextMessage += `I have ${hasCompletedCourse ? "completed" : "not completed"} this course.\n`;
    
    if (completedCourses.length > 0) {
      contextMessage += `Courses I've completed: ${completedCoursesList}\n`;
    }
    
    if (transferDestination) {
      contextMessage += `I plan to transfer to: ${transferDestination}\n`;
    }

    setSelectedCourseIds([selectedCourse.id, ...completedCourses.map(c => c.id)]);
    setPendingCourseContext(selectedCourse);

    sendMessageMutation.mutate({
      message: contextMessage,
      courseContext: selectedCourse,
    });

    toast({
      title: "Starting AI Chat",
      description: `${selectedCourse.code} - ${selectedCourse.title}`,
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b-2 border-primary shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between gap-6">
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
        </div>
      </header>

      <CourseLegend />

      <main className="bg-gray-50">
        <PathwayMapper
          courses={courses}
          onCourseClick={handleCourseClick}
          selectedCourseIds={selectedCourseIds}
        />
      </main>

      <ChatbotWidget
        onSendMessage={handleSendMessage}
        messages={messages}
        isLoading={sendMessageMutation.isPending}
        pendingCourseContext={pendingCourseContext}
      />

      <CourseContextDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedCourse={selectedCourseForDialog}
        allCourses={courses}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
}
