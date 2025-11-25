import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@shared/schema";
import { X } from "lucide-react";

interface CourseContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCourse: Course | null;
  allCourses: Course[];
  onSubmit: (context: {
    selectedCourse: Course;
    hasCompletedCourse: boolean;
    completedCourses: Course[];
    transferDestination: string;
  }) => void;
}

export function CourseContextDialog({
  open,
  onOpenChange,
  selectedCourse,
  allCourses,
  onSubmit,
}: CourseContextDialogProps) {
  const [hasCompletedCourse, setHasCompletedCourse] = useState<string>("no");
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(new Set());
  const [transferDestination, setTransferDestination] = useState("");

  const resetDialogState = () => {
    setHasCompletedCourse("no");
    setCompletedCourseIds(new Set());
    setTransferDestination("");
  };

  useEffect(() => {
    if (open && selectedCourse) {
      resetDialogState();
    }
  }, [open, selectedCourse]);

  const handleCourseToggle = (courseId: string) => {
    const newSet = new Set(completedCourseIds);
    if (newSet.has(courseId)) {
      newSet.delete(courseId);
    } else {
      newSet.add(courseId);
    }
    setCompletedCourseIds(newSet);
  };

  const handleSubmit = () => {
    if (!selectedCourse) return;

    const completedCourses = allCourses.filter(course => 
      completedCourseIds.has(course.id)
    );

    onSubmit({
      selectedCourse,
      hasCompletedCourse: hasCompletedCourse === "yes",
      completedCourses,
      transferDestination: transferDestination.trim(),
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    resetDialogState();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDialogState();
    }
    onOpenChange(newOpen);
  };

  if (!selectedCourse) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-course-context">
        <DialogHeader>
          <DialogTitle className="text-xl" data-testid="text-dialog-title">
            Tell us about your academic journey
          </DialogTitle>
          <DialogDescription>
            This helps us provide more personalized guidance about <strong>{selectedCourse.code}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Have you completed {selectedCourse.code}?
            </Label>
            <RadioGroup value={hasCompletedCourse} onValueChange={setHasCompletedCourse}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="completed-yes" data-testid="radio-completed-yes" />
                <Label htmlFor="completed-yes" className="font-normal cursor-pointer">
                  Yes, I've completed this course
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="completed-no" data-testid="radio-completed-no" />
                <Label htmlFor="completed-no" className="font-normal cursor-pointer">
                  No, I haven't taken it yet
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Which other courses have you completed?
            </Label>
            <p className="text-sm text-muted-foreground">
              Click on the courses you've already taken
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
              {allCourses
                .filter(course => course.id !== selectedCourse.id)
                .map(course => (
                  <button
                    key={course.id}
                    onClick={() => handleCourseToggle(course.id)}
                    className={`text-left p-2 rounded-md border transition-colors ${
                      completedCourseIds.has(course.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    data-testid={`button-course-${course.id}`}
                  >
                    <div className="font-semibold text-sm">{course.code}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {course.title}
                    </div>
                  </button>
                ))}
            </div>
            {completedCourseIds.size > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from(completedCourseIds).map(courseId => {
                  const course = allCourses.find(c => c.id === courseId);
                  return course ? (
                    <Badge key={courseId} variant="secondary" className="gap-1">
                      {course.code}
                      <button
                        onClick={() => handleCourseToggle(courseId)}
                        className="ml-1 hover:bg-muted rounded-full"
                        data-testid={`button-remove-${courseId}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="transfer-destination" className="text-base font-semibold">
              Where do you plan to transfer? (Optional)
            </Label>
            <Input
              id="transfer-destination"
              placeholder="e.g., UC Merced, CSU Fresno, CSU Stanislaus"
              value={transferDestination}
              onChange={(e) => setTransferDestination(e.target.value)}
              data-testid="input-transfer-destination"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} data-testid="button-start-chat">
            Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
