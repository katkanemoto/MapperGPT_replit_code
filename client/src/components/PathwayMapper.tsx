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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedSemesters.map(([semesterName, semesterCourses]) => (
          <div
            key={semesterName}
            className="flex flex-col gap-4"
            data-testid={`column-semester-${semesterName.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <div className="sticky top-16 z-10 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 rounded-t-lg px-4 py-3 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800" data-testid={`text-semester-${semesterName.replace(/\s+/g, "-").toLowerCase()}`}>
                {semesterName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {getTotalUnitsForSemester(semesterCourses)} units
                </span>
                <span className="text-xs text-gray-500">
                  {semesterCourses.length} {semesterCourses.length === 1 ? "course" : "courses"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pb-8">
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
