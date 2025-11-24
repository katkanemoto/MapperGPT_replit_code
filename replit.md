# Program Pathways Mapper with AI Chatbot

## Overview

This is an educational web application that helps students navigate academic program requirements through an interactive course pathway mapper with an integrated AI-powered chatbot assistant. The application visualizes degree programs as semester-organized course layouts, showing prerequisites, course details, and total unit requirements. Students can click on courses to get personalized AI assistance about prerequisites, course content, and academic planning.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component System**: The application uses shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. This provides a comprehensive, accessible component library following Material Design principles adapted for educational contexts.

**Design System**: Uses the "new-york" style variant of shadcn/ui with a neutral color palette. The design emphasizes clarity and information hierarchy with purposeful whitespace, making complex course data easily scannable. Typography uses the Inter font family for optimal data-heavy interface readability.

**State Management**: 
- React Query (@tanstack/react-query) handles server state, data fetching, and caching
- Local React state (useState) manages UI interactions like chatbot open/closed state and selected courses
- Session-based chat history tracking with unique session IDs generated client-side

**Routing**: wouter provides lightweight client-side routing

**Key UI Components**:
- `PathwayMapper`: Displays courses organized by semester in a responsive grid layout
- `CourseCard`: Individual course cards showing code, title, units, description, and prerequisites
- `ChatbotWidget`: Floating chat interface with message history and context-aware assistance

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript

**API Design**: RESTful API with the following endpoints:
- `GET /api/programs` - Fetch all available programs
- `GET /api/programs/default` - Fetch the first program with its courses
- `GET /api/programs/:id` - Fetch specific program with courses
- `POST /api/chat` - Send chat message and receive AI response
- `GET /api/chat/history/:sessionId` - Retrieve chat history for a session

**Development vs Production**: 
- Development mode uses Vite middleware for hot module replacement and instant feedback
- Production mode serves pre-built static assets from the dist/public directory
- Different entry points (index-dev.ts vs index-prod.ts) handle environment-specific setup

### Data Storage

**ORM**: Drizzle ORM provides type-safe database operations with schema definitions in TypeScript

**Database Schema**:
- `programs` table: Stores degree/certificate program information (id, name, description, totalUnits)
- `courses` table: Stores course details with foreign key to programs (code, title, units, description, prerequisites array, semester, semesterOrder)
- `chatMessages` table: Stores conversation history (sessionId, role, content, courseContext as JSON, timestamp)

**Current Implementation**: Uses in-memory storage (MemStorage class) with sample data initialization. The architecture supports PostgreSQL through Drizzle configuration and Neon serverless driver, allowing future migration to persistent database storage without code changes.

**Schema Validation**: drizzle-zod generates Zod schemas from Drizzle table definitions for runtime validation

### External Dependencies

**AI Integration**: 
- OpenAI API (GPT-5 model) powers the chatbot assistant
- Context-aware responses include course information when students click on courses
- System prompts configure the AI as an academic advisor
- Conversation history maintained for coherent multi-turn dialogues
- API key required via environment variable (OPENAI_API_KEY)

**Database Service**: 
- Configured for Neon serverless PostgreSQL via @neondatabase/serverless
- Connection string required via environment variable (DATABASE_URL)
- Currently using in-memory storage but infrastructure ready for database provisioning

**Third-Party UI Libraries**:
- Radix UI: Accessible, unstyled component primitives (@radix-ui/react-*)
- Tailwind CSS: Utility-first CSS framework for styling
- Lucide React: Icon library
- embla-carousel-react: Carousel component
- cmdk: Command palette component
- react-hook-form with @hookform/resolvers: Form handling and validation

**Development Tools**:
- Replit-specific plugins for vite (runtime error modal, cartographer, dev banner)
- TypeScript for type safety across the entire stack
- esbuild for production builds
- tsx for running TypeScript in development

**Design Assets**:
- Google Fonts (Inter) loaded from CDN for typography
- Custom favicon support

### Build and Deployment

**Build Process**:
- Client: Vite builds React application to dist/public
- Server: esbuild bundles Express server to dist/index.js with ESM format
- Shared types and schemas used across client and server prevent duplication

**Environment Configuration**:
- NODE_ENV determines development vs production behavior
- Path aliases (@/, @shared, @assets) simplify imports
- TypeScript paths configured in tsconfig.json match Vite aliases

**Session Management**:
- Client-generated session IDs using timestamp and random values
- No server-side session store currently implemented
- connect-pg-simple available for PostgreSQL session storage when database is provisioned