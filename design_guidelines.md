# Design Guidelines: Program Pathways Mapper with AI Chatbot

## Design Approach

**Selected Framework:** Material Design System (adapted for educational context)
**Rationale:** The application is utility-focused with complex data visualization, requiring clear hierarchy and strong information architecture. Material Design provides excellent guidelines for data-dense interfaces while maintaining visual clarity.

**Key Design Principles:**
- Clarity over decoration: Information hierarchy guides every decision
- Purposeful whitespace: Content breathes but never feels sparse
- Scannable layouts: Users quickly find courses and understand prerequisites
- Contextual assistance: Chatbot feels integrated, not bolted-on

---

## Typography System

**Font Family:** Inter (Google Fonts) - exceptional readability for data-heavy interfaces
- Primary: Inter (400, 500, 600)

**Type Scale:**
- Page Title: text-3xl font-semibold (course program name)
- Section Headers: text-xl font-semibold (semester labels, "Certificate of Achievement")
- Course Card Title: text-base font-medium (course codes like "CS 101")
- Course Card Subtitle: text-sm font-normal (course names)
- Body Text: text-sm (units, prerequisites, descriptions)
- Chat Messages: text-sm (both user and bot)
- Metadata/Labels: text-xs font-medium uppercase tracking-wide

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4
- Tight groupings: space-y-2

**Container Strategy:**
- Main mapper area: Full-width with max-w-7xl mx-auto px-6
- Semester columns: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Chatbot: Fixed width 384px (w-96)

**Viewport Management:**
- No forced viewport heights
- Natural scroll for long program pathways
- Sticky header with program title and navigation
- Chatbot overlay doesn't obstruct mapper content

---

## Component Library

### Course Cards
- Rounded corners (rounded-lg)
- Subtle shadow (shadow-md) with hover elevation (shadow-lg transition)
- Padding: p-4
- Border: 2px solid (shows completion status or selection state)
- Structure:
  - Course code (top, bold)
  - Course title (middle)
  - Units badge (top-right, small pill shape)
  - Prerequisites indicator (bottom, small text)
  - Clickable state: cursor-pointer with scale transform on hover

### Semester Columns
- Vertical layout with sticky semester header
- Header: Rounded-top, with semester name and total units
- Stack of course cards with gap-4
- Visual connector lines between prerequisite courses (subtle, dashed)

### Chatbot Widget
**Collapsed State:**
- Floating action button (FAB): Fixed bottom-right (bottom-6 right-6)
- Circular, w-14 h-14, shadow-xl
- Icon: Chat bubble with message count badge if applicable
- Pulse animation when new context is sent

**Expanded State:**
- Slide-in panel from right
- Dimensions: w-96 h-[600px]
- Position: fixed bottom-6 right-6
- Rounded corners: rounded-2xl
- Shadow: shadow-2xl
- Structure:
  - Header (h-14): Title "AI Course Assistant" + minimize/close buttons
  - Chat area (flex-1): Scrollable message thread, pb-4
  - Input area (h-20): Text input + send button, sticky bottom

### Chat Messages
- User messages: Aligned right, rounded-2xl, max-w-[80%]
- Bot messages: Aligned left, rounded-2xl, max-w-[80%]
- Padding: px-4 py-3
- Spacing between messages: space-y-3
- Timestamp: text-xs below message

### Context Indicators
- When course clicked: Brief highlight animation on card (ring-2 ring-offset-2)
- Toast notification appears in chat: "Course details sent to AI Assistant"
- Small badge on course card indicating "in conversation"

### Program Header
- Sticky top-0 z-10
- Height: h-16
- Contains: Program title, total units counter, filter/search controls
- Subtle shadow when scrolled (shadow-sm)

---

## Interaction Patterns

**Course Selection:**
- Click course card → card highlights + data sent to chatbot
- Chatbot auto-opens if collapsed
- Bot sends acknowledgment: "I can help you with [Course Code]. What would you like to know?"

**Chat Interactions:**
- Smooth scroll to bottom on new messages
- Loading indicator (three dots) while AI responds
- Auto-focus input after sending message
- Enter to send, Shift+Enter for new line

**Visual Feedback:**
- All interactive elements have hover states (opacity, transform, or shadow changes)
- Transitions: transition-all duration-200 ease-in-out
- Disabled states clearly differentiated (opacity-50 cursor-not-allowed)

---

## Responsive Behavior

**Desktop (lg+):**
- 3-column semester layout
- Chatbot fixed at 384px wide
- Side-by-side optimal viewing

**Tablet (md):**
- 2-column semester layout
- Chatbot width maintained, might overlay content

**Mobile (base):**
- Single column semester layout
- Chatbot becomes full-screen modal when opened
- FAB remains bottom-right for access

---

## Accessibility

- All course cards: role="button" tabindex="0" with keyboard navigation
- Chat input: proper label and aria-describedby for screen readers
- Focus visible on all interactive elements (focus:ring-2)
- Sufficient contrast ratios throughout
- Semantic HTML (header, main, aside for chatbot)

---

## Animation Guidelines

**Use sparingly and purposefully:**
- Chatbot slide-in/out: duration-300 ease-in-out
- Course card hover: subtle scale (scale-105) and shadow
- Message appearance: fade-in from bottom (minimal, duration-150)
- Context send confirmation: brief pulse/ring animation
- No distracting scroll animations or parallax effects

---

## Images

**No hero image required** - this is a utility interface, not a marketing page. Focus is entirely on the interactive mapper and chatbot functionality. The visual interest comes from the structured layout of course pathways and the dynamic chat interface.