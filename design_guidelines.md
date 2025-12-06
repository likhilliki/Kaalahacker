# Kaala.hacker Design Guidelines

## Design Approach: Trust-Driven Utility System

**Selected System**: Material Design adapted for financial compliance with trust-building emphasis

**Justification**: This is a utility-focused, compliance-heavy platform where trust, clarity, and efficiency are paramount. Users need confidence in scam detection results and regulatory compliance. Material Design's structured hierarchy, clear information architecture, and professional aesthetic align with financial service expectations while maintaining accessibility.

**Core Principles**:
- Trust First: Professional, authoritative visual language
- Clarity Over Creativity: Information hierarchy and readability prioritized
- Compliance Visible: SEBI badges, regulatory information prominently displayed
- Efficiency: Quick scans to results workflow with minimal friction

---

## Typography

**Font Families** (Google Fonts):
- Primary: Inter (clean, professional, excellent readability)
- Accent/Headers: Poppins (friendly but authoritative)

**Hierarchy**:
- Hero Headings: Poppins Bold, 48px desktop / 32px mobile
- Section Headings: Poppins SemiBold, 32px desktop / 24px mobile
- Subsections: Inter SemiBold, 20px
- Body Text: Inter Regular, 16px (regulatory/educational content 17px for readability)
- Labels/Metadata: Inter Medium, 14px
- Captions/Timestamps: Inter Regular, 13px

---

## Layout System

**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24 for consistent rhythm
- Component padding: p-6, p-8
- Section spacing: py-12, py-16, py-24
- Card gaps: gap-6, gap-8
- Form fields: mb-6

**Grid System**:
- Max container: max-w-7xl for dashboards, max-w-4xl for forms/content
- Dashboard cards: 2-3 column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Analysis results: Single column with sidebar for metadata
- Mobile: Always single column stack

---

## Component Library

### Authentication Pages
**Login/Register**:
- Split layout: Left 40% branding panel with gradient, right 60% form
- Branding panel includes: Logo, tagline "Protect yourself from financial scams", trust badges (SEBI-compliant indicator)
- Form: Clean card with rounded-xl corners, elevated shadow
- Fields: Full-width with clear labels above, focus states with border accent
- Primary CTA: Full-width button at bottom
- Alternative auth: "Or continue with" divider, icon buttons for social login
- Mobile number OTP option prominently displayed

### Image Upload Interface
**Hero Upload Section**:
- Large drag-and-drop zone (min-h-96) with dashed border
- Center icon (upload cloud), heading "Upload Screenshot to Detect Scams"
- Supported formats clearly listed below: "WhatsApp, SMS, Instagram, Trading Apps"
- File input button as alternative to drag-drop
- Preview thumbnails in grid below upload zone once files added

### Scam Analysis Results
**Analysis Dashboard**:
- Top: Risk level badge (High/Medium/Low) with corresponding alert styling
- Main content: Extracted text in bordered panel with monospace font
- Red flag highlights: Pill badges for each detected issue ("Guaranteed Returns", "Fake SEBI ID", etc.)
- Detailed explanation: Expandable accordion sections for each red flag
- Bottom actions: "Report to Chakshu" and "Report to Cybercrime" buttons with pre-filled description preview

### Investor Education Chatbot
**Chat Interface** (Fixed bottom-right corner):
- Floating action button (60px circle) with chat icon
- On click: Expands to 400px wide, 600px tall card overlay
- Chat header: "Stock Market Education Assistant" with SEBI compliance note
- Message bubbles: User messages right-aligned, bot left-aligned
- Input: Fixed bottom with rounded text field and send button
- Disclaimer at top: "Based on 3+ month old data per SEBI regulations"

### User History Dashboard
**History Cards**:
- Timeline layout with date separators
- Each card shows: Thumbnail, date/time, risk level, quick summary
- Click to expand: Full analysis details
- Filter tabs at top: All / High Risk / Medium / Low / Archived
- Search bar with live filtering

### Scam Reporting Tool
**Report Generator**:
- Two-column layout: Left preview, right form fields
- Auto-generated description with editable fields
- Portal selection: Radio buttons for Chakshu vs Cybercrime
- Download button: Pre-filled complaint PDF
- Copy to clipboard: Quick copy description text

### Navigation
**Top Navigation Bar**:
- Left: Logo + "Kaala.hacker"
- Center: Main nav links (Dashboard, Analyze, Education, Reports)
- Right: User avatar dropdown
- Mobile: Hamburger menu

**Trust Elements** (Always Visible):
- SEBI compliance badge in footer
- "No Stock Tips" disclaimer
- Security indicators (SSL, encryption mentions)

---

## Images

**Hero Image**: Not applicable - this is a functional tool, not a marketing site. Login page uses gradient branding panel instead.

**Supporting Images**:
- Example screenshots: Show sample scam messages in "How it Works" section
- Trust badges: SEBI logo, cybercrime.gov.in logo (footer)
- Illustration: Simple icon-based graphics for empty states (no history yet, no scans detected)

---

## Key Screens Layout

**Login Page**: Split panel (branding left, form right)

**Main Dashboard**: Grid of recent scans, quick upload CTA, statistics cards (total scans, scams detected, reports filed)

**Analysis Page**: Upload interface → Loading state → Results with red flags → Report actions

**Education Chatbot**: Overlay interface always accessible

**History**: Filterable list with search and detailed views