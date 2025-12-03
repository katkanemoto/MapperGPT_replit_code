import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
  isInConversation?: boolean;
  isTaken?: boolean;
  onToggleTaken?: (courseId: string, isTaken: boolean) => void;
}

function getCourseColorClasses(requirementType: string | null, isChoice: number): {
  borderColor: string;
  bgColor: string;
  textColor: string;
  badgeColor: string;
} {
  const normalizedType = requirementType?.toUpperCase().replace(/\s+/g, "_") || "";

  if (normalizedType.includes("MAJOR") || normalizedType.includes("CORE")) {
    return {
      borderColor: "border-[hsl(var(--course-major))]",
      bgColor: "bg-[hsl(var(--course-major-bg))]",
      textColor: "text-[hsl(var(--course-major))]",
      badgeColor: "bg-[hsl(var(--course-major))] text-white",
    };
  }

  if (normalizedType.includes("GENERAL_EDUCATION") || normalizedType.includes("GE")) {
    return {
      borderColor: "border-[hsl(var(--course-general-ed))]",
      bgColor: "bg-[hsl(var(--course-general-ed-bg))]",
      textColor: "text-[hsl(var(--course-general-ed))]",
      badgeColor: "bg-[hsl(var(--course-general-ed))] text-white",
    };
  }

  if (normalizedType.includes("ELECTIVE")) {
    return {
      borderColor: "border-[hsl(var(--course-elective))]",
      bgColor: "bg-[hsl(var(--course-elective-bg))]",
      textColor: "text-[hsl(var(--course-elective))]",
      badgeColor: "bg-[hsl(var(--course-elective))] text-white",
    };
  }

  if (isChoice === 1) {
    return {
      borderColor: "border-[hsl(var(--course-elective))]",
      bgColor: "bg-[hsl(var(--course-elective-bg))]",
      textColor: "text-[hsl(var(--course-elective))]",
      badgeColor: "bg-[hsl(var(--course-elective))] text-white",
    };
  }

  return {
    borderColor: "border-[hsl(var(--course-major))]",
    bgColor: "bg-[hsl(var(--course-major-bg))]",
    textColor: "text-[hsl(var(--course-major))]",
    badgeColor: "bg-[hsl(var(--course-major))] text-white",
  };
}

export function CourseCard({ course, onClick, isInConversation, isTaken = false, onToggleTaken }: CourseCardProps) {
  const colors = getCourseColorClasses(course.requirementType || null, course.isChoice || 0);

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleTaken?.(course.id, !isTaken);
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border-[3px] p-4 cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.01]",
        colors.borderColor,
        colors.bgColor,
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
      {/* Unit Badge - Top Right */}
      <div className={cn(
        "absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
        colors.badgeColor
      )} data-testid={`badge-units-${course.id}`}>
        {course.units} {course.units === 1 ? "unit" : "units"}
      </div>

      {/* Checkbox - Bottom Right */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-2"
        onClick={handleCheckboxChange}
        data-testid={`checkbox-taken-${course.id}`}
      >
        <Checkbox 
          checked={isTaken} 
          onChange={() => {}}
          className="cursor-pointer"
          data-testid={`input-checkbox-taken-${course.id}`}
        />
        <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Taken</span>
      </div>

      {/* Course Content */}
      <div className="pr-20">
        {/* Course Code - Bold and prominent */}
        <h3 className={cn("text-base font-bold mb-1", colors.textColor)} data-testid={`text-course-code-${course.id}`}>
          {course.code}
        </h3>

        {/* Course Title */}
        <p className="text-sm text-gray-700 line-clamp-2 mb-2" data-testid={`text-course-title-${course.id}`}>
          {course.title}
        </p>

        {/* Choice Description for CHOICE elements */}
        {course.isChoice === 1 && course.choiceDescription && (
          <p className="text-xs text-gray-600 italic mb-2 line-clamp-3">
            {course.choiceDescription}
          </p>
        )}

        {/* Regular Description */}
        {course.description && course.isChoice !== 1 && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {course.description}
          </p>
        )}

        {/* Requirement Type Badge */}
        {course.requirementType && (
          <Badge variant="outline" className="text-xs mb-2 border-current">
            {course.requirementType}
          </Badge>
        )}

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center mt-3">
            <span className="text-xs text-gray-600 font-medium">Prerequisites:</span>
            {course.prerequisites.map((prereq, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                {prereq}
              </Badge>
            ))}
          </div>
        )}

        {/* In Conversation Indicator */}
        {isInConversation && (
          <div className="mt-3">
            <Badge className={cn("text-xs", colors.badgeColor)}>
              In Chat
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
