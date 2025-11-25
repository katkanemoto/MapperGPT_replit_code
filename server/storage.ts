import {
  type Program,
  type InsertProgram,
  type Course,
  type InsertCourse,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { transformMercedProgram } from "./merced-transformer";

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

    try {
      // Load Merced College Computer Science AS-T pathway data
      const pathwayFilePath = join(process.cwd(), "attached_assets", "Pasted--programMapId-60baac7d-cb57-42bc-a27b-0a5be0eef1e9-siteContentId-6fa96ee9-1318-42-1764029514333_1764029514334.txt");
      const pathwayJson = readFileSync(pathwayFilePath, "utf-8");
      const pathwayData = JSON.parse(pathwayJson);

      // Transform Merced data to our format
      const { program: programData, courses: coursesData } = transformMercedProgram(pathwayData);

      // Create program
      const programId = randomUUID();
      const program: Program = {
        id: programId,
        name: programData.name,
        description: programData.description ?? null,
        totalUnits: programData.totalUnits ?? 0,
      };
      this.programs.set(programId, program);

      // Create courses with the program ID
      coursesData.forEach(courseData => {
        const id = randomUUID();
        const course: Course = {
          id,
          programId,
          code: courseData.code,
          title: courseData.title,
          units: courseData.units,
          description: courseData.description ?? null,
          prerequisites: courseData.prerequisites ?? null,
          semester: courseData.semester,
          semesterOrder: courseData.semesterOrder,
          requirementType: courseData.requirementType ?? null,
          isChoice: courseData.isChoice ?? 0,
          choiceDescription: courseData.choiceDescription ?? null,
        };
        this.courses.set(id, course);
      });
    } catch (error) {
      console.error("Failed to load Merced pathway data:", error);
      // Fallback to empty data
    }
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
      requirementType: insertCourse.requirementType ?? null,
      isChoice: insertCourse.isChoice ?? 0,
      choiceDescription: insertCourse.choiceDescription ?? null,
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
