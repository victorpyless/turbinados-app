# TURBINADOS - ENGINEERING GUIDELINES & CONTEXT
> "Excellence is not an act, but a habit."

## 1. PROJECT ARCHITECTURE & TECH STACK
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript (Strict Mode enabled)
* **Database & Auth:** Supabase (PostgreSQL + Auth Helpers via `@supabase/ssr`)
* **Styling:** Tailwind CSS (Utility-first + `tailwind-merge` for component classes)
* **AI Integration:** Google Gemini API (`@google/generative-ai`) via Server Actions

---

## 2. CODING STANDARDS (STRICT)

### 2.1. TypeScript & Type Safety
* **No `any` Policy:** Never use `any`. Use `unknown` with type narrowing if necessary.
* **Interfaces over Types:** Use `interface` for object definitions (better error messages/extensibility).
* **Zod Validation:** All Server Actions must validate inputs using Zod before processing.
* **Strong Typing:** All props, state, and API responses must be strictly typed.

### 2.2. Next.js App Router Paradigms
* **Server Components by Default:** Keep components as Server Components (RSC) unless interactivity (hooks like `useState`, `onClick`) is strictly needed.
* **Server Actions for Mutations:** Do not use API Routes (`pages/api`). Use Server Actions (`'use server'`) for form submissions and data mutations.
* **"Use Client" Boundaries:** Push Client Components as far down the tree as possible (Leaf Components) to preserve server rendering benefits.

### 2.3. Data Fetching & State
* **Fetch on Server:** Fetch data directly in Server Components (async/await) to reduce waterfall requests.
* **No Global State Overkill:** Avoid Redux/Zustand unless absolutely necessary. Prefer URL State (Query Params) for filters and search (e.g., `?search=opala&status=urgent`).

---

## 3. UI/UX DESIGN SYSTEM (TURBINADOS THEME)

### 3.1. Visual Language
* **Dark Mode Only:** The app is strictly dark-themed (`bg-zinc-950` or `bg-black`).
* **Accent Color:** "Turbinados Red" (`#EF4444` / `text-red-500` / `bg-red-600`).
* **Typography:** Sans-serif, bold headers, uppercase for statuses.
### 2.4. SUPABASE SERVER ACTIONS (CRITICAL)
* **Cookie Context is King:** In Server Actions (`'use server'`), you MUST use the specific server client that handles cookies.
    * ❌ WRONG: `import { createClient } from '@supabase/supabase-js'`
    * ✅ RIGHT: `import { createClient } from '@/utils/supabase/server'`
* **Session Validation Pattern:** Every protected action must start with this exact block:
    ```typescript
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { error: 'Unauthorized: Please log in again.' };
    }
    // Now use user.id safely
    ```
* **No "Guest" Mutations:** Never allow `INSERT`, `UPDATE`, or `DELETE` without a verified `user.id`.
### 3.2. Component Patterns
* **Loading States:** Always use Skeleton Loaders (`animate-pulse`) instead of spinners or blank screens.
* **Feedback:** Use Toast notifications (Success/Error) for all user actions.
* **Glassmorphism:** Use subtle transparency for cards (`bg-zinc-900/50 backdrop-blur-md`).

---

## 4. SECURITY & PERFORMANCE PROTOCOLS

### 4.1. Authentication (Supabase)
* **Middleware Protection:** All private routes (`/dashboard`) must be protected by Next.js Middleware checking Supabase Session.
* **Row Level Security (RLS):** Never rely solely on frontend logic. Ensure RLS policies are active on the database.

### 4.2. Performance
* **Image Optimization:** Always use `<Image />` from `next/image` with `sizes` prop defined.
* **Code Splitting:** Lazy load heavy components (like Modals or Charts) using `next/dynamic`.

---

## 5. WORKFLOW RULES FOR THE AGENT
1.  **Thinking Process:** Before writing code, analyze the file structure and potential side effects.
2.  **Error Handling:** Always implement `try/catch` blocks in Server Actions and provide user-friendly error messages.
3.  **Refactoring:** If you see "dirty code" or hardcoded strings, suggest a cleanup immediately.
4.  **DRY (Don't Repeat Yourself):** Extract reusable logic into `@/lib` or custom hooks.

## 6. CURRENT MODULES
* **Kanban Board:** Drag & Drop interface for video production.
* **Brainstorm AI:** Gemini integration for generating titles/thumbnails.
* **Auth System:** Email/Password login with secure session management.