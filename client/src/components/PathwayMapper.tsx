import { CourseCard } from "./CourseCard";
import type { Course } from "@shared/schema";

interface PathwayMapperProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
  selectedCourseIds: string[];
  takenCourseIds: string[];
  onToggleTaken: (courseId: string, isTaken: boolean) => void;
}

export function PathwayMapper({
  courses,
  onCourseClick,
  selectedCourseIds,
  takenCourseIds,
  onToggleTaken,
}: PathwayMapperProps) {
  const semesterGroups = courses.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = [];
    }
    acc[course.semester].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

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
      <div className="flex flex-col gap-8">
        {sortedSemesters.map(([semesterName, semesterCourses]) => (
          <div
            key={semesterName}
            className="flex flex-col lg:flex-row gap-6"
            data-testid={`section-semester-${semesterName.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <div className="lg:w-48 flex-shrink-0">
              <div className="sticky top-20">
                <h2 className="text-xl font-bold text-gray-900 mb-1" data-testid={`text-semester-${semesterName.replace(/\s+/g, "-").toLowerCase()}`}>
                  {semesterName}
                </h2>
                <div className="text-sm text-primary font-semibold">
                  {getTotalUnitsForSemester(semesterCourses)} UNITS
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {semesterCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onClick={onCourseClick}
                    isInConversation={selectedCourseIds.includes(course.id)}
                    isTaken={takenCourseIds.includes(course.id)}
                    onToggleTaken={onToggleTaken}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
