export function CourseLegend() {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2" data-testid="legend-major">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(300, 60%, 55%)" }} />
          <span className="text-gray-700 font-medium">Major Course</span>
        </div>
        
        <div className="flex items-center gap-2" data-testid="legend-general-ed">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(174, 45%, 52%)" }} />
          <span className="text-gray-700 font-medium">General Education Course</span>
        </div>
        
        <div className="flex items-center gap-2" data-testid="legend-elective">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(28, 93%, 61%)" }} />
          <span className="text-gray-700 font-medium">Elective Course</span>
        </div>
        
        <div className="flex items-center gap-2" data-testid="legend-milestone">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(16, 90%, 55%)" }} />
          <span className="text-gray-700 font-medium">Milestone</span>
        </div>
      </div>
    </div>
  );
}
