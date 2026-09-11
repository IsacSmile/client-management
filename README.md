# Client Management Web Application

A full-featured internal **Client Management Web Application** built with **Next.js 14 (App Router, TypeScript)**, **Tailwind CSS**, and **Prisma** with **SQLite**.

Designed with a strict, professional grayscale aesthetic (#212529, #343a40, #495057, #6c757d, #adb5bd, #dee2e6, #f8f9fa, #e9ecef), zero colorful badges/glassmorphism, centralized financial calculations (`lib/finance.ts`), session authentication, and responsive mobile card layouts.

---

## Features

- **Strict Grayscale Palette**: Professional neutral tones without colorful badges. Payment & project status are communicated cleanly via text, icons, and borders.
- **Centralized Finance Core (`lib/finance.ts`)**: Single source of truth for total paid, remaining balance (`totalAmount - totalPaid`), payment status ("Unpaid", "Partial Payment", "Paid"), INR currency formatting (`₹`), and dashboard metrics.
- **Session Authentication**: Email & password authentication with secure HTTP-only JWT cookies and Next.js middleware protection.
- **Dashboard**: Summary KPIs (Total Clients, Active Projects, Payment Due, Payment Received), Recent Clients table, and Payment Due ledger.
- **Client Management**: Searchable client list, empty state handling, and combined client & project creation with optional upfront payment in an atomic transaction.
- **Client Details & Management**: Client/project overview, progress control buttons (0%, 25%, 50%, 75%, 100%), payment history, payment entry form, inline editing, and permanent delete confirmation modal.
- **Projects & Payments Ledger**: Dedicated project tracking and full financial ledger with filter tabs (All, Paid, Partial Payment, Unpaid) and search.
- **Settings**: Profile overview, fixed INR currency setting display, password modification form, and secure sign-out.
- **Responsive Layout**: Sidebar for desktop/tablet and top navbar with collapsible drawer for mobile. Tables automatically collapse into stacked cards below ~640px.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS 3 (configured with custom grayscale color theme)
- **Database**: SQLite via Prisma ORM 5
- **Authentication**: `jose` JWT cookies & `bcryptjs`
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js **v18+**
- npm **v9+**

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and adjust variables as needed:
   ```bash
   cp .env.example .env
   ```
   *`.env` configures `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`.*

3. **Run Database Sync & Seed**:
   ```bash
   npx prisma db push
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Prisma schema (User, Client, Project, Payment)
│   └── seed.ts            # Seed script for initial data & demo user
├── src/
│   ├── app/
│   │   ├── api/           # Auth, Clients, Projects, Payments, & Settings APIs
│   │   ├── clients/       # /clients, /clients/new, and /clients/[id]
│   │   ├── dashboard/     # /dashboard KPI cards & summary tables
│   │   ├── login/         # /login card form
│   │   ├── payments/      # /payments ledger & filter tabs
│   │   ├── projects/      # /projects overview
│   │   └── settings/      # /settings profile, security & logout
│   ├── components/
│   │   ├── ConfirmModal.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Toast.tsx
│   └── lib/
│       ├── auth.ts        # JWT session & password hashing
│       ├── finance.ts     # Centralized financial logic
│       └── prisma.ts      # Singleton Prisma client instance
├── middleware.ts          # App Router auth guard middleware
├── tailwind.config.js     # Strict grayscale palette configuration
└── README.md
```
