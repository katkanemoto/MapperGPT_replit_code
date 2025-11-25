# Design Guidelines: Program Pathways Mapper with AI Chatbot

## Design Approach

**Selected Framework:** Material Design System (adapted for educational context)
**Rationale:** Utility-focused data visualization requiring clear hierarchy and strong information architecture. Material Design excels at data-dense interfaces while maintaining scannable layouts for academic planning.

**Key Design Principles:**
- Information clarity over decoration
- Color-coding for instant course category recognition
- Academic credibility through professional, trustworthy aesthetics
- Generous spacing for easy scanning and decision-making

---

## Typography System

**Font Family:** Inter (Google Fonts CDN)
- Weights: 400 (regular), 500 (medium), 600 (semibold)

**Type Scale:**
- Program Title: text-3xl font-semibold tracking-tight
- Semester Headers: text-xl font-semibold
- Course Code: text-base font-semibold (primary text in cards)
- Course Title: text-sm font-normal (secondary text)
- Unit Count: text-xs font-medium
- Prerequisites: text-xs font-medium
- Chat Messages: text-sm
- Labels/Metadata: text-xs font-medium uppercase tracking-wider

---

## Layout System

**Spacing Primitives:** Tailwind units 2, 4, 6, 8
- Card padding: p-4
- Section spacing: space-y-6 or gap-6
- Semester column gaps: gap-6
- Card internal spacing: space-y-2

**Grid Structure:**
- Container: max-w-7xl mx-auto px-6
- Semester layout: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Each semester: Vertical stack of course cards

---

## Color System

**Primary Course Categories:**
- Major Courses: Blue (#1e40af / blue-800)
  - Card background tint: bg-blue-50
  - Border: border-blue-800 border-2
- General Education: Amber (#d97706 / amber-600)
  - Card background tint: bg-amber-50
  - Border: border-amber-600 border-2
- Electives: Gray (#6b7280 / gray-500)
  - Card background tint: bg-gray-50
  - Border: border-gray-500 border-2

**System Colors:**
- Header background: White with shadow
- Chat background: White
- Text primary: gray-900
- Text secondary: gray-600
- Chatbot accent: blue-600

---

## Component Library

### Course Cards
- Rounded corners: rounded-xl
- Shadow: shadow-md with hover shadow-lg
- Border: 2px solid (category color)
- Background: Light tint of category color
- Padding: p-4
- Structure (top to bottom):
  - Course code: font-semibold text-base in category color
  - Course title: text-sm text-gray-700, mt-1
  - Unit badge: Absolute top-right, rounded-full px-2 py-1, text-xs, category color background
  - Prerequisites: Bottom section, flex flex-wrap gap-1, small rounded pills with text-xs
- Hover state: scale-102 transform, shadow elevation, transition-all duration-200
- Clickable cursor: cursor-pointer

### Semester Columns
- Each column represents one term (Fall Year 1, Spring Year 1, etc.)
- Sticky header per column:
  - Rounded-t-lg background in subtle gray
  - Semester name: font-semibold
  - Total units for term: text-sm in badge
  - Padding: p-4
- Course stack: space-y-4 below header
- Subtle connector lines: SVG dashed lines connecting prerequisite relationships (stroke-gray-300, stroke-dasharray)

### Program Header
- Sticky: sticky top-0 z-20
- Height: h-16
- Background: white with shadow-sm when scrolled
- Contains: Program title (left), total units counter (right), optional search/filter
- Padding: px-6

### Chatbot Widget

**Collapsed State:**
- Fixed bottom-6 right-6
- Circular FAB: w-16 h-16 rounded-full
- Background: blue-600 with shadow-2xl
- Icon: Chat bubble (Heroicons via CDN)
- Pulse animation on new context

**Expanded State:**
- Fixed bottom-6 right-6
- Dimensions: w-96 h-[600px]
- Rounded: rounded-2xl
- Shadow: shadow-2xl
- Header (h-14): "AI Course Assistant" title + minimize button
- Chat area: flex-1 overflow-y-auto p-4, space-y-3
- Input area (h-20): Sticky bottom, flex items, text input + send button

### Chat Messages
- User: Aligned right, bg-blue-600 text-white, rounded-2xl px-4 py-3, max-w-[75%]
- Bot: Aligned left, bg-gray-100, rounded-2xl px-4 py-3, max-w-[75%]
- Spacing: space-y-3 between messages
- Timestamp: text-xs text-gray-500 below each

### Context Indicators
- Course click: Ring animation (ring-2 ring-blue-500 ring-offset-2) on selected card
- Brief toast notification within chat: "Sent [Course Code] details"
- Badge on card: Small "In conversation" indicator

---

## Interaction Patterns

**Course Selection:**
- Click card → highlights with ring → sends context to chatbot → chatbot auto-opens if collapsed
- Bot acknowledgment: "I can help with [Course Code]. Ask me anything!"

**Chat:**
- Auto-scroll to latest message
- Three-dot loading indicator during AI response
- Enter to send, Shift+Enter for new line
- Input auto-focus after send

**Visual Feedback:**
- All interactive elements: Clear hover states (transform, shadow, opacity)
- Transitions: transition-all duration-200 ease-in-out
- Disabled states: opacity-50 cursor-not-allowed

---

## Responsive Behavior

**Desktop (lg+):** 4-column semester layout, chatbot fixed 384px
**Tablet (md):** 2-column layout, chatbot overlays if needed
**Mobile (base):** Single column, chatbot becomes full-screen modal

---

## Accessibility

- Course cards: role="button" tabindex="0" with keyboard navigation
- All interactive: focus:ring-2 focus:ring-offset-2
- Semantic HTML: header, main, aside for chatbot
- Chat input: Proper labels and aria-describedby
- WCAG AA contrast ratios for all text

---

## Animation Guidelines

**Minimal, purposeful only:**
- Chatbot slide-in: duration-300 ease-in-out
- Course card hover: scale-102, shadow change
- Message appearance: fade-in from bottom, duration-150
- Context confirmation: brief ring pulse
- No scroll animations

---

## Images

**No hero image** - This is a utility interface focused on course planning. Visual interest derives from color-coded course cards, structured semester layout, and dynamic chatbot interactions. Educational credibility comes from clean information design, not decorative imagery.