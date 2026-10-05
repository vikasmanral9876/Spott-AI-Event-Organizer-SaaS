# Spott — AI Event Organizer SaaS

Spott is a full-stack, AI-powered event management and ticketing platform designed to streamline event discovery, intelligent event creation, ticketing, and real-time attendee management. Built with Next.js 16, React 19, Convex, Clerk, and Google Gemini AI.

---

## Key Features

### 1. Intelligent AI Event Creator
* **Generative Drafting**: Organizers can enter a short event concept or prompt (e.g., *"Hands-on Next.js 16 workshop in Bangalore"*), and Google Gemini automatically drafts a compelling title, professional multi-sentence description, category classification, suggested capacity, and recommended ticket type.
* **Form Autofill & Customization**: Generated data automatically populates the event creation form, allowing the organizer to review, edit, or adjust all parameters prior to publishing.
* **Resilient Server Architecture**: Server-side prompt validation, structured JSON schema enforcement, model fallback handling, and rate-limiting safeguards keep the generation pipeline fast and reliable.

### 2. Event Discovery & Search
* **Dynamic Home & Explore Hub**: Browse upcoming events, featured highlights, and trending events.
* **Location-Based Discovery**: Automatically filter events by city and state using localized geo-filtering.
* **Category Filtering**: Explore events across Tech, Music, Business, Art, Food, Sports, and Community.
* **Live Search**: Instant keyword search matching event titles, locations, and descriptions.

### 3. Event Creation & Publishing
* **Rich Event Form**: Configure physical or online events, venues, addresses, dates, capacities, and pricing.
* **Curated Visuals with Unsplash**: Integrated photo picker to search high-resolution cover photos directly via the Unsplash API.
* **Category & Theming**: Dynamic theme color selection and categorized tags for optimal presentation.

### 4. Registration & Digital QR Ticketing
* **Seamless Registration**: Attendees can register for free or paid events with instant confirmation.
* **Digital Tickets**: Unique QR ticket generation for every attendee.
* **Ticket Management**: Dedicated "My Tickets" portal displaying event timing, venue details, and interactive QR codes for venue entry.

### 5. Organizer Dashboard & Analytics
* **Real-Time Event Analytics**: Track capacity utilization, total attendee count, check-in percentages, and total revenue.
* **Attendee Management**: Filter attendees by status (*All*, *Checked In*, *Pending*) and search attendees by name, email, or ticket ID.
* **One-Click CSV Export**: Export full registration and attendance rosters for offline auditing and reporting.
* **In-App QR Scanner**: Built-in camera-based QR code scanner with manual code fallback for rapid on-site attendee check-in.

### 6. Authentication & User Onboarding
* **Identity Management**: Secure authentication powered by Clerk with social sign-in and session persistence.
* **First-Time Onboarding**: Collects attendee location and event interests to tailor the event discovery experience.

---

## Architecture Overview

```text
 ┌──────────────────────────────────────────────────────────────┐
 │                      Client (Browser)                        │
 │        Next.js 16 (App Router) + React 19 + Tailwind CSS     │
 └──────────────┬───────────────────────────────┬───────────────┘
                │                               │
         Auth & Identity                Real-Time Reactive
         Session Tokens                 Data Queries & Mutations
                ▼                               ▼
       ┌─────────────────┐             ┌─────────────────┐
       │      Clerk      │             │     Convex      │
       │ Authentication  ├────────────►│  Cloud Backend  │
       └─────────────────┘  JWT Auth   │    & Database   │
                                       └─────────────────┘
                │
         AI Generation Request
                ▼
 ┌───────────────────────────────┐
 │ Next.js API Route             │
 │ /api/generate-event           │
 └──────────────┬────────────────┘
                │
         Google Generative AI
                ▼
 ┌───────────────────────────────┐
 │ Google Gemini API             │
 │ (gemini-3.5-flash-lite)       │
 └───────────────────────────────┘
```

---

## Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) | Full-stack React framework and server routes |
| **Frontend Library** | [React 19](https://react.dev/) | Component architecture and state management |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first responsive design and glassmorphic UI |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) & Radix UI | Accessible design system primitives |
| **Icons** | [Lucide React](https://lucide.dev/) | Vector iconography |
| **Backend & Database** | [Convex](https://www.convex.dev/) | Real-time reactive document database and serverless functions |
| **Authentication** | [Clerk](https://clerk.com/) | Identity management, protected routes, and user sessions |
| **AI Engine** | [Google Gemini API](https://ai.google.dev/) (`gemini-3.5-flash-lite`) | Generative structured JSON event drafting |
| **Form Management** | React Hook Form & Zod | Form validation and typed data submission |
| **Image Integration** | [Unsplash API](https://unsplash.com/developers) | Dynamic high-resolution event imagery |
| **QR Code & Scanning** | `react-qr-code`, `html5-qrcode` | Digital ticket generation and mobile check-in scanner |
| **Notifications** | Sonner | Real-time user feedback toasts |

---

## Project Structure

```text
sputt/
├── app/
│   ├── (main)/                      # Protected application routes
│   │   ├── create-event/            # Event creation page & AI creator modal
│   │   ├── my-events/               # Organizer dashboard, attendee list, QR scanner
│   │   └── my-tickets/              # User ticket portfolio & QR displays
│   ├── (public)/                    # Publicly accessible routes
│   │   ├── events/[slug]/           # Public event detail page & registration modal
│   │   └── explore/                 # Event search, location filters & category feeds
│   ├── api/
│   │   └── generate-event/          # Serverless route for Gemini AI event drafting
│   ├── auth/                        # Clerk sign-in and sign-up pages
│   ├── layout.js                    # Root application layout, theme & auth providers
│   └── page.jsx                     # Landing page with hero banner & featured events
├── components/                      # Reusable UI components & shadcn design primitives
│   ├── ui/                          # Button, dialog, card, tabs, input, carousel, etc.
│   ├── header.jsx                   # Global navigation header
│   ├── event-card.jsx               # Standardized event preview card
│   ├── onboarding-modal.jsx         # User interest & city onboarding modal
│   └── unsplash-image-picker.jsx    # Unsplash search and selection modal
├── convex/                          # Convex backend schemas and functions
│   ├── schema.js                    # Database tables: users, events, registrations
│   ├── events.js                    # Event queries and creation mutations
│   ├── explore.js                   # Featured, popular, category, and location queries
│   ├── registrations.js             # Ticket booking and check-in mutations
│   ├── dashboard.js                 # Organizer analytics and deletion queries
│   └── seed.js                      # Development seed data for testing
├── hooks/                           # Custom React hooks (Convex wrapper, onboarding)
├── lib/                             # Shared data constants, location lists, and utils
├── proxy.js                         # Next.js route protection middleware (Clerk)
└── public/                          # Static assets (hero images, logos)
```

---

## AI Event Generator Workflow

The AI Event Generator enables organizers to move from a raw thought to a structured, publish-ready event in seconds:

1. **User Prompt**: The organizer enters a natural language concept in the AI Event Creator dialog.
2. **Server-Side Validation**: `POST /api/generate-event` validates that the description is non-empty and within character limits (max 1,000 characters).
3. **Structured Gemini Inference**: The server invokes Google Gemini (`gemini-3.5-flash-lite`) requesting a strict JSON response.
4. **Data Normalization**: The backend verifies that the title, description, category, capacity, and ticket type adhere to platform constraints.
5. **Form Autofill**: The generated properties populate the React Hook Form in `create-event/page.jsx`.
6. **Organizer Review**: The organizer reviews and can freely edit dates, images, venues, and ticket pricing before final publishing.

> **Security Note**: All Google Gemini API keys are held strictly in server-side environment variables and are never transmitted to or accessible from the browser.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Google Gemini AI (Server-Side Only)
GEMINI_API_KEY=your_gemini_api_key_here

# Convex Backend Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-instance.clerk.accounts.dev

# Unsplash API (Image Picker)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

> **Security Reminder**: Never commit `.env.local` or any files containing private keys or credentials to version control. The repository's `.gitignore` is configured to prevent credential exposure.

---

## Local Development Setup

### Prerequisites
* **Node.js**: v18.17.0 or higher
* **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd sputt
npm install
```

### 2. Configure Convex
Initialize and link your Convex project:
```bash
npx convex dev
```
This runs the local Convex synchronization process and generates backend types in `convex/_generated/`.

### 3. Run Development Server
In a separate terminal, launch the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build & Lint Commands
* **Run ESLint**:
  ```bash
  npm run lint
  ```
* **Build Production Bundle**:
  ```bash
  npm run build
  ```
* **Run Production Server**:
  ```bash
  npm start
  ```

---

## Seed Data (Optional)

For local development or testing, a database seeding utility is included in `convex/seed.js`:

1. Open your Convex dashboard: `npx convex dashboard`
2. Navigate to **Functions** > **`seed:run`**.
3. Run the function to populate sample events across technology, music, business, and food categories.
4. To reset seed events, invoke **`seed:clear`**.

---

## License

No license has currently been specified for this project.
