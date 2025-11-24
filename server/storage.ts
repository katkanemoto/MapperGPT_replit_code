import {
  type Program,
  type InsertProgram,
  type Course,
  type InsertCourse,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Programs
  getProgram(id: string): Promise<Program | undefined>;
  getAllPrograms(): Promise<Program[]>;
  createProgram(program: InsertProgram): Promise<Program>;

  // Courses
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByProgram(programId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  createCourses(courses: InsertCourse[]): Promise<Course[]>;

  // Chat Messages
  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private programs: Map<string, Program>;
  private courses: Map<string, Course>;
  private chatMessages: Map<string, ChatMessage>;
  private initialized: boolean = false;

  constructor() {
    this.programs = new Map();
    this.courses = new Map();
    this.chatMessages = new Map();
  }

  private initializeSampleData() {
    if (this.initialized) return;
    this.initialized = true;

    // Create a sample program
    const programId = randomUUID();
    const program: Program = {
      id: programId,
      name: "Computer Programming - Certificate of Achievement",
      description: "A comprehensive program covering computer science fundamentals, programming languages, and software development",
      totalUnits: 32,
    };
    this.programs.set(programId, program);

    // Create sample courses
    const sampleCourses: Array<Omit<Course, 'id'>> = [
      {
        programId,
        code: "CS 101",
        title: "Introduction to Computer Science",
        units: 3,
        description: "Fundamental concepts of computer science including problem-solving, algorithms, and programming basics",
        prerequisites: [],
        semester: "Fall Year 1",
        semesterOrder: 1,
      },
      {
        programId,
        code: "MATH 120",
        title: "College Algebra",
        units: 4,
        description: "Functions, equations, inequalities, and their applications",
        prerequisites: [],
        semester: "Fall Year 1",
        semesterOrder: 1,
      },
      {
        programId,
        code: "CS 102",
        title: "Programming Fundamentals",
        units: 3,
        description: "Introduction to programming using a high-level language with emphasis on problem-solving",
        prerequisites: ["CS 101"],
        semester: "Spring Year 1",
        semesterOrder: 2,
      },
      {
        programId,
        code: "CS 110",
        title: "Data Structures",
        units: 4,
        description: "Study of data structures including arrays, linked lists, stacks, queues, trees, and graphs",
        prerequisites: ["CS 102"],
        semester: "Spring Year 1",
        semesterOrder: 2,
      },
      {
        programId,
        code: "CS 201",
        title: "Object-Oriented Programming",
        units: 3,
        description: "Principles of object-oriented design and programming using modern programming languages",
        prerequisites: ["CS 110"],
        semester: "Fall Year 2",
        semesterOrder: 3,
      },
      {
        programId,
        code: "CS 205",
        title: "Web Development",
        units: 3,
        description: "Front-end and back-end web development technologies including HTML, CSS, JavaScript, and server-side programming",
        prerequisites: ["CS 102"],
        semester: "Fall Year 2",
        semesterOrder: 3,
      },
      {
        programId,
        code: "CS 210",
        title: "Database Systems",
        units: 3,
        description: "Database design, SQL, normalization, and database management systems",
        prerequisites: ["CS 110"],
        semester: "Spring Year 2",
        semesterOrder: 4,
      },
      {
        programId,
        code: "CS 220",
        title: "Software Engineering",
        units: 4,
        description: "Software development lifecycle, design patterns, testing, and project management",
        prerequisites: ["CS 201"],
        semester: "Spring Year 2",
        semesterOrder: 4,
      },
      {
        programId,
        code: "COMM 101",
        title: "Technical Communication",
        units: 3,
        description: "Writing and presentation skills for technical professionals",
        prerequisites: [],
        semester: "Spring Year 2",
        semesterOrder: 4,
      },
    ];

    // Add courses to storage
    sampleCourses.forEach(courseData => {
      const id = randomUUID();
      const course: Course = { id, ...courseData };
      this.courses.set(id, course);
    });
  }

  // Programs
  async getProgram(id: string): Promise<Program | undefined> {
    this.initializeSampleData();
    return this.programs.get(id);
  }

  async getAllPrograms(): Promise<Program[]> {
    this.initializeSampleData();
    return Array.from(this.programs.values());
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = randomUUID();
    const program: Program = {
      id,
      name: insertProgram.name,
      description: insertProgram.description ?? null,
      totalUnits: insertProgram.totalUnits ?? 0,
    };
    this.programs.set(id, program);
    return program;
  }

  // Courses
  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByProgram(programId: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.programId === programId
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = {
      id,
      programId: insertCourse.programId,
      code: insertCourse.code,
      title: insertCourse.title,
      units: insertCourse.units,
      description: insertCourse.description ?? null,
      prerequisites: insertCourse.prerequisites ?? null,
      semester: insertCourse.semester,
      semesterOrder: insertCourse.semesterOrder,
    };
    this.courses.set(id, course);
    return course;
  }

  async createCourses(insertCourses: InsertCourse[]): Promise<Course[]> {
    const courses: Course[] = [];
    for (const insertCourse of insertCourses) {
      const course = await this.createCourse(insertCourse);
      courses.push(course);
    }
    return courses;
  }

  // Chat Messages
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }

  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((message) => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      id,
      sessionId: insertMessage.sessionId,
      role: insertMessage.role,
      content: insertMessage.content,
      courseContext: insertMessage.courseContext ?? null,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
