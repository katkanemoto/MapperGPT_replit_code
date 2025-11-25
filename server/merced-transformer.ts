import type { InsertProgram, InsertCourse } from "@shared/schema";

interface MercedPathwayElement {
  id: string;
  name: string;
  shortDescription: string;
  requirement: {
    requirementType: string;
  };
  recommendedOpportunity: {
    type: "COURSE" | "CHOICE";
    term: {
      customLabel: string;
      termNumber: number;
      year: number;
    };
    courseCode?: string;
    courseName?: string;
    name?: string;
    description?: string;
    minUnits: number;
    maxUnits: number;
  };
  elementAssociations: Array<{
    elementId: string;
    type: string;
    associatedElementId: string;
  }>;
}

interface MercedPathwayMap {
  programMapId: string;
  programId: string;
  programTitle: string;
  programAward: string;
  termsToCompletion: number;
  pathwayElements: MercedPathwayElement[];
}

function getSemesterLabel(termNumber: number, customLabel: string): string {
  const year = Math.ceil(termNumber / 2);
  return `${customLabel} Year ${year}`;
}

export function transformMercedProgram(pathwayMap: MercedPathwayMap): {
  program: InsertProgram;
  courses: InsertCourse[];
} {
  // Build element map for quick lookups
  const elementMap = new Map<string, MercedPathwayElement>();
  pathwayMap.pathwayElements.forEach((el) => elementMap.set(el.id, el));

  // Build bidirectional association map for prerequisites
  // Map: elementId -> list of prerequisite element IDs
  const prerequisitesMap = new Map<string, Set<string>>();
  
  pathwayMap.pathwayElements.forEach((element) => {
    if (!prerequisitesMap.has(element.id)) {
      prerequisitesMap.set(element.id, new Set());
    }
    
    element.elementAssociations.forEach((assoc) => {
      if (assoc.type === "REQUIRES") {
        // This element requires another element
        prerequisitesMap.get(element.id)!.add(assoc.associatedElementId);
      } else if (assoc.type === "REQUIREMENT_OF") {
        // This element is a prerequisite for another element
        // So that other element requires this one
        if (!prerequisitesMap.has(assoc.associatedElementId)) {
          prerequisitesMap.set(assoc.associatedElementId, new Set());
        }
        prerequisitesMap.get(assoc.associatedElementId)!.add(element.id);
      }
    });
  });

  // Calculate total units by counting minUnits for all elements (COURSE and CHOICE)
  // Each pathway element represents one slot in the schedule
  // CHOICE elements show the units needed for that selection slot
  const totalUnits = pathwayMap.pathwayElements.reduce((sum, element) => {
    return sum + (element.recommendedOpportunity.minUnits || 0);
  }, 0);

  // Create program
  const program: InsertProgram = {
    name: `${pathwayMap.programId} - ${pathwayMap.programTitle}`,
    description: `Merced College ${pathwayMap.programTitle} program`,
    totalUnits: Math.round(totalUnits),
  };

  // Transform courses - include both COURSE and CHOICE elements
  // CHOICE elements are marked so the UI can render them as selection prompts
  const courses: InsertCourse[] = pathwayMap.pathwayElements.map((element) => {
    const opp = element.recommendedOpportunity;
    const isChoice = opp.type === "CHOICE";

    // Determine course code and title
    const code = isChoice ? element.name : (opp.courseCode || element.name);
    const title = isChoice ? element.shortDescription : (opp.courseName || element.shortDescription);

    // Get prerequisites using the bidirectional map
    const prerequisites: string[] = [];
    const prereqIds = prerequisitesMap.get(element.id);
    if (prereqIds) {
      prereqIds.forEach((prereqId) => {
        const prereqElement = elementMap.get(prereqId);
        if (prereqElement) {
          const prereqCode = prereqElement.recommendedOpportunity.type === "CHOICE"
            ? prereqElement.name
            : (prereqElement.recommendedOpportunity.courseCode || prereqElement.name);
          if (!prerequisites.includes(prereqCode)) {
            prerequisites.push(prereqCode);
          }
        }
      });
    }

    return {
      programId: "", // Will be set when creating the program
      code,
      title,
      // For CHOICE elements, use minUnits to show required units for that selection
      // For COURSE elements, use maxUnits as the actual course units
      units: Math.round(isChoice ? opp.minUnits : (opp.maxUnits || opp.minUnits)),
      description: isChoice ? (opp.description || element.shortDescription) : null,
      prerequisites: prerequisites.length > 0 ? prerequisites : null,
      semester: getSemesterLabel(opp.term.termNumber, opp.term.customLabel),
      semesterOrder: opp.term.termNumber,
      requirementType: element.requirement.requirementType,
      isChoice: isChoice ? 1 : 0,
      choiceDescription: isChoice ? (opp.description || element.shortDescription) : null,
    };
  });

  return { program, courses };
}
