import { CourseCard } from "./CourseCard";
import type { Course } from "@shared/schema";

interface PathwayMapperProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
  selectedCourseIds: string[];
}

export function PathwayMapper({
  courses,
  onCourseClick,
  selectedCourseIds,
}: PathwayMapperProps) {
  // Group courses by semester
  const semesterGroups = courses.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = [];
    }
    acc[course.semester].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  // Sort semesters by semesterOrder
  const sortedSemesters = Object.entries(semesterGroups).sort((a, b) => {
    const orderA = a[1][0]?.semesterOrder || 0;
    const orderB = b[1][0]?.semesterOrder || 0;
    return orderA - orderB;
  });

  const getTotalUnitsForSemester = (semesterCourses: Course[]) => {
    return semesterCourses.reduce((sum, course) => sum + course.units, 0);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* Grid layout for semester columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSemesters.map(([semesterName, semesterCourses]) => (
          <div
            key={semesterName}
            className="flex flex-col gap-4"
            data-testid={`column-semester-${semesterName.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {/* Semester Header */}
            <div className="sticky top-0 z-10 bg-background border border-border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground" data-testid={`text-semester-${semesterName.replace(/\s+/g, "-").toLowerCase()}`}>
                {semesterName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {getTotalUnitsForSemester(semesterCourses)} units
              </p>
            </div>

            {/* Course Cards */}
            <div className="flex flex-col gap-4">
              {semesterCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={onCourseClick}
                  isInConversation={selectedCourseIds.includes(course.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
