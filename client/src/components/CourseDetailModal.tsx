import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Course } from "@shared/schema";

interface CourseDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onAskAI?: (course: Course) => void;
}

export function CourseDetailModal({
  open,
  onOpenChange,
  course,
  onAskAI,
}: CourseDetailModalProps) {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-course-detail">
        <DialogHeader>
          <DialogTitle className="text-2xl" data-testid="text-course-title">
            {course.code}: {course.title}
          </DialogTitle>
          <DialogDescription>
            Course Details and Information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Units */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Units</h3>
            <p className="text-lg" data-testid="text-course-units">
              {course.units} {course.units === 1 ? "unit" : "units"}
            </p>
          </div>

          {/* Requirement Type */}
          {course.requirementType && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Requirement Type</h3>
              <Badge variant="outline" data-testid="badge-requirement-type">
                {course.requirementType}
              </Badge>
            </div>
          )}

          {/* Description */}
          {course.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed" data-testid="text-course-description">
                {course.description}
              </p>
            </div>
          )}

          {/* Choice Description */}
          {course.isChoice === 1 && course.choiceDescription && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Choice Information</h3>
              <p className="text-sm text-gray-600 italic leading-relaxed" data-testid="text-choice-description">
                {course.choiceDescription}
              </p>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {course.prerequisites.map((prereq, idx) => (
                  <Badge key={idx} variant="secondary" data-testid={`badge-prereq-${idx}`}>
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Semester */}
          {course.semester && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Semester</h3>
              <p className="text-sm text-gray-600" data-testid="text-course-semester">
                {course.semester}
              </p>
            </div>
          )}
        </div>

        {/* Footer with Action Button */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={() => {
              onAskAI?.(course);
              onOpenChange(false);
            }}
            data-testid="button-ask-ai"
          >
            Ask AI Assistant
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-modal"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
