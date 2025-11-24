import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
  isInConversation?: boolean;
}

export function CourseCard({ course, onClick, isInConversation }: CourseCardProps) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover-elevate active-elevate-2",
        "hover:shadow-lg hover:scale-[1.02]",
        isInConversation && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={() => onClick(course)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(course);
        }
      }}
      data-testid={`card-course-${course.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-foreground mb-1" data-testid={`text-course-code-${course.id}`}>
            {course.code}
          </h3>
          <p className="text-sm text-foreground/90 line-clamp-2 mb-2" data-testid={`text-course-title-${course.id}`}>
            {course.title}
          </p>
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {course.description}
            </p>
          )}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs text-muted-foreground">Prerequisites:</span>
              {course.prerequisites.map((prereq, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="secondary" className="text-xs font-medium" data-testid={`badge-units-${course.id}`}>
            {course.units} {course.units === 1 ? "unit" : "units"}
          </Badge>
          {isInConversation && (
            <Badge variant="default" className="text-xs">
              In Chat
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
