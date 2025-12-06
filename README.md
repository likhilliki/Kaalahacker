# Kaala.hacker - AI-Powered Financial Scam Detection Platform

## Overview

Kaala.hacker is a financial scam detection and investor education platform specifically designed for Indian users. The platform enables users to upload screenshots from WhatsApp, SMS, Instagram, and trading apps to detect potential financial fraud using AI-powered analysis. The system provides real-time scam risk assessments, educational chatbot assistance, and facilitates reporting to regulatory authorities like SEBI.

**Core Value Proposition**: Protect Indian users from financial scams through instant AI-powered analysis of suspicious messages and content, while providing educational resources about financial regulations and investor rights.

**Target Audience**: Indian retail investors, financial consumers concerned about fraud, and individuals receiving suspicious investment-related messages.

**Key Features**:
- AI-powered scam detection from screenshots and text
- Risk level classification (high, medium, low, safe)
- Educational chatbot for financial literacy and SEBI regulations
- Scam reporting portal integration (Chakshu, Cybercrime, SEBI)
- Scan history and analytics dashboard
- Admin panel for platform monitoring

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, built using Vite for development and bundling.

**UI Component System**: Shadcn UI (New York style variant) with Radix UI primitives. The design follows Material Design principles adapted for financial compliance, prioritizing trust and clarity over creativity. Typography uses Inter for body text and Poppins for headings to establish professional authority.

**Styling Approach**: Tailwind CSS with custom design tokens defined in CSS variables. The system supports light/dark themes with a trust-driven color palette emphasizing safety (greens), warnings (oranges), and danger (reds) for risk levels.

**State Management**: TanStack Query (React Query) for server state management with aggressive caching strategies (staleTime: Infinity) to minimize API calls. Local UI state managed with React hooks.

**Routing**: Wouter for lightweight client-side routing. Protected routes require authentication via Replit Auth.

**Key Design Patterns**:
- Component composition with Radix UI primitives wrapped in custom components
- Responsive-first design with mobile breakpoint at 768px
- Accessibility-first approach using ARIA labels and semantic HTML
- Form handling with React Hook Form and Zod validation

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful JSON API with route handlers organized by feature domain (auth, scans, chat, reports, admin).

**Session Management**: Express-session with PostgreSQL session store (`connect-pg-simple`). Sessions last 7 days with secure, httpOnly cookies.

**Authentication**: Replit OpenID Connect (OIDC) authentication via Passport.js strategy. User identity managed through OIDC claims with automatic user profile synchronization.

**Request Processing Pipeline**:
1. JSON body parsing with raw buffer capture (for webhook verification)
2. URL-encoded form data parsing
3. Request logging middleware with timing information
4. Authentication middleware (`isAuthenticated`) for protected routes
5. Route handlers with error boundaries
6. Static file serving for production builds

**Build Process**: esbuild bundles server code with selective dependency bundling (allowlist) to reduce cold start times. Client built separately with Vite.

**Development Mode**: Vite dev server with HMR integrated into Express middleware, hot-reloading templates with cache-busting via nanoid.

### Data Storage

**Database**: PostgreSQL accessed via Drizzle ORM with type-safe schema definitions.

**Schema Design**:
- `users`: OIDC user profiles (email, name, profile image, admin flag)
- `sessions`: Session storage for Replit Auth
- `scans`: Scam analysis records (images, text, risk assessments, AI explanations)
- `chatMessages`: Conversational history between users and educational chatbot
- `scamReports`: User-submitted reports to regulatory authorities
- `notifications`: User notification queue (in-app alerts)
- `platformStats`: Aggregated platform metrics for admin dashboard

**Data Relationships**:
- Users have many scans, chat messages, reports, and notifications
- Scans can be associated with reports (one-to-many)
- All timestamps use PostgreSQL `timestamp` with `defaultNow()`

**Migration Strategy**: Drizzle Kit manages schema migrations in `./migrations` directory. Push strategy for development (`db:push`).

### External Dependencies

**AI/ML Services**:
- **OpenAI GPT-5**: Primary scam detection engine analyzing images and text for fraud indicators. Configured with domain-specific system prompts for Indian financial context (SEBI regulations, UPI phishing, Ponzi schemes). Returns structured JSON with risk levels, confidence scores, red flags, and bilingual explanations (Hindi-English mix).

**Authentication**:
- **Replit Auth (OIDC)**: Handles user authentication flow with automatic account provisioning. Issuer URL: `https://replit.com/oidc` or environment-specified. Session tokens stored in PostgreSQL.

**Database**:
- **PostgreSQL**: Relational database for all persistent storage. Connection managed via `pg` driver pooling. Required environment variable: `DATABASE_URL`.

**Email/Communication** (infrastructure present, not actively configured):
- Nodemailer setup in dependencies for potential notification delivery

**Payment Processing** (infrastructure present, not actively configured):
- Stripe integration dependencies suggest planned premium features

**File Storage**:
- Image uploads handled via Multer middleware
- Base64 encoding for AI processing
- Storage strategy not explicitly defined (likely filesystem or future cloud storage)

**Regulatory Portals** (referenced but external):
- Chakshu (DoT scam reporting)
- National Cybercrime Reporting Portal
- SEBI complaint portal
- RBI Sachet

**Chart/Visualization**:
- Recharts library for admin dashboard analytics (line charts, area charts, pie charts for risk distribution)

**WebSocket**:
- `ws` library included for potential real-time features (likely chat or live scan updates)

**Key Environment Variables Required**:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Express session encryption key
- `REPL_ID`: Replit deployment identifier
- `ISSUER_URL`: OIDC issuer (defaults to Replit)

**Notable Architectural Decisions**:
- Monorepo structure with shared schema types between client and server (`@shared/schema`)
- Type safety enforced across stack via TypeScript and Drizzle-Zod schema validation
- Server-side rendering disabled (SPA with client-side routing)
- API-first design with clear separation between frontend and backend
- Compliance-first approach: No stock tips, educational content uses 3+ month old data per SEBI regulations
- Trust-building through visual design, SEBI compliance badges, and transparent risk assessments