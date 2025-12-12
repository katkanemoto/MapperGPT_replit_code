# Program Pathways Mapper with AI Chatbot

An educational web application that helps students navigate academic program requirements through an interactive course pathway mapper with an integrated AI-powered chatbot assistant.

## Project Structure

### `/client`
React frontend application. Contains all UI components, pages, and client-side logic.
- `src/pages/` - Page components (HomePage, etc.)
- `src/components/` - Reusable UI components (ChatbotWidget, PathwayMapper, etc.)
- `src/lib/` - Utilities and query client setup

### `/server`
Express backend API server. Handles data persistence and OpenAI integration.
- `routes.ts` - API endpoints (programs, chat, exports)
- `storage.ts` - Data storage interface (in-memory or database)
- `openai.ts` - ChatGPT integration with student context
- `index-dev.ts` / `index-prod.ts` - Server entry points

### `/shared`
Shared code between frontend and backend.
- `schema.ts` - Database schema definitions and TypeScript types (Program, Course, ChatMessage, StudentProfile)

### Configuration Files
- `vite.config.ts` - Frontend build configuration
- `tailwind.config.ts` - Tailwind CSS styling
- `drizzle.config.ts` - Database ORM configuration
- `tsconfig.json` - TypeScript configuration

## Key Features

- **Course Pathway Visualization** - Courses organized by semester with unit requirements
- **Student Profile Tracking** - Stores student major, taken courses, and planned courses
- **AI Course Assistant** - GPT-5 powered chatbot with course and student context
- **Course Progress** - Mark courses as "Taken" to track progress
- **Export Features** - Download course plans as HTML (PDF-printable) and chat history as JSON

## Running the Project

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run db:push  # Push database schema changes
```

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for chatbot
- `DATABASE_URL` - PostgreSQL connection string (optional, uses in-memory storage by default)
- `SESSION_SECRET` - Session encryption secret

## Data Model

**Student Profile** - Tracks per-session student information:
- Major/Program name
- Courses completed (marked as "Taken")
- Planned courses (all available courses)
- Additional collected information

**Courses** - Each course contains:
- Code, title, units
- Prerequisites
- Requirement type (major, general ed, elective)
- Semester placement

**Chat Messages** - Conversation history with optional course context and student profile data
