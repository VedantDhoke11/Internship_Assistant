# Internship Operating System (InternshipOS)

InternshipOS is an AI-powered internship application operating system designed for students. The platform aggregates internship openings, parses resumes using LLMs, tracks lifecycle pipelines via Kanban, and delivers contextual career advice backed by Retrieval-Augmented Generation (RAG).

This repository contains the **Stage 1: Foundation Setup** layout, establishing a production-grade codebase designed to scale.

---

## 🚀 Tech Stack & Design Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict compiler flags)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Next-generation CSS-first config)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/) (`base-nova` preset using Radix & Base UI primitives)
- **Theme Engine**: [next-themes](https://github.com/pacocoursey/next-themes) (Gated dark mode rendering)
- **Formatting & Linting**: [Prettier](https://prettier.io/) + [ESLint](https://eslint.org/) (Integrated conflict resolutions)

---

## 📂 Scalable Directory Structure

The project implements a domain-driven, modular directory structure under `src/` to separate global components from feature-specific implementations:

```text
src/
├── app/                  # Next.js pages, routing, loading/error boundaries, and global styles
│   ├── dashboard/        # Dashboard module layouts and sub-routes
│   ├── error.tsx         # Route level global error fallback
│   ├── globals.css       # Core styling & custom CSS variable tokens
│   ├── layout.tsx        # App wrapper (Metadata, Fonts, ThemeProviders)
│   ├── loading.tsx       # Pre-hydration visual loading layout
│   └── page.tsx          # High-converting landing page UI & playground
├── components/           # Common components shared across domains
│   ├── layouts/          # Layout-level wrappers (Navbar, Sidebar)
│   ├── shared/           # Cross-cutting widgets (ThemeToggle, ThemeProvider)
│   └── ui/               # Atomic custom styled UI primitives (Button, Card, Input)
├── features/             # Feature-grouped modules containing domain-isolated concerns
│   ├── ai-assistant/     # ATS Parsing, Skill Gap Analyzer, and Career chatbot
│   ├── auth/             # Sign-In, Sign-Up layouts and authentication providers
│   ├── dashboard/        # Visual Kanban tracking and analytical metrics charts
│   ├── internships/      # Aggregated listing feeds, bookmarking, and search
│   └── users/            # Student profiles, academic details, and resume files
├── hooks/                # Global custom hooks (e.g., useLocalStorage)
├── lib/                  # Reusable utility and constant libraries
│   ├── config/           # Central site configurations and brand definitions
│   ├── utils/            # Shared vanilla JS helper functions
│   └── validations/      # Zod validation schema templates
├── services/             # Core clients connecting external APIs and servers
├── styles/               # Extensible style configurations
└── types/                # Core TypeScript interfaces and schemas
```

---

## 🛠️ Getting Started & Commands

### Prerequisites
Make sure you have Node.js 18.x or above installed.

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Duplicate the environment template and configure keys:
   ```bash
   cp .env.example .env.local
   ```

3. Spin up the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) inside your browser.

---

## 📦 Core Scripts

- `npm run dev`: Launch the next dev server.
- `npm run build`: Compile and build the production bundle.
- `npm run start`: Launch the production build server.
- `npm run lint`: Run ESLint static code checker.

---

## 🎨 Theme & Dark Mode Setup

The app configures Next.js `next-themes` wrapped inside a client-side `ThemeProvider`. CSS custom variables are configured in `src/app/globals.css` using modern OKLCH coordinates.

- Toggle light/dark states smoothly via the `ThemeToggle` button located in the `Navbar`.
- Sub-components automatically adapt utilizing Tailwind `dark:` variants mapped on standard CSS themes.
