# Kernel — Project Specification

## Overview

**Kernel** is a curated, LLM-friendly documentation site covering AI concepts, agent frameworks, MCP, prompts, and more. Content is added manually via an admin panel. Visitors can read docs and copy any page as clean markdown to paste directly into an LLM.

**Brand:** Kernel  
**Logo files:** `kernel-logo.svg` (primary), `kernel-logo.png` (fallback)  
**Reference design:** Claude Code Docs (docs.anthropic.com/en/docs)  
**Language:** English only  
**Theme:** Light / Dark toggle in navbar

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG per page, fast, SEO-friendly |
| UI Components | Shadcn/ui | Claude docs aesthetic, unstyled base |
| Styling | Tailwind CSS v4 | Utility-first, pairs with Shadcn |
| Database + Auth | Supabase | Postgres + Row Level Security + Auth |
| Markdown Render | `next-mdx-remote` | Server-side MDX rendering |
| Syntax Highlight | `rehype-pretty-code` + `shiki` | Code blocks with themes |
| Search | `Fuse.js` | Client-side fuzzy search, no external service |
| Deployment | Vercel | Native Next.js, free tier sufficient |

---

## URL Structure

```
/                              → Landing page
/docs/[category]/[slug]        → Single doc page
/admin                         → Doc list (protected)
/admin/new                     → Create new doc (protected)
/admin/edit/[id]               → Edit existing doc (protected)
```

**URL examples:**
```
/docs/mcp/what-is-mcp
/docs/mcp/mcp-setup
/docs/context-window/what-is-context-window
/docs/context-window/how-to-manage
/docs/prompts/system-prompt-templates
/docs/langchain/agents
```

---

## Page Layouts

### Public: `/docs/[category]/[slug]`

Three-column layout matching Claude Code Docs:

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR: Logo | Search | Dark Mode Toggle               │
├──────────────┬──────────────────────────┬───────────────┤
│              │                          │               │
│  LEFT        │  CONTENT                 │  RIGHT        │
│  SIDEBAR     │                          │  SIDEBAR      │
│              │  Category label          │               │
│  Category 1  │  # Page Title            │  On this page │
│    - Page    │                          │               │
│    - Page ←  │  [Copy Page button]      │  - Heading 1  │
│              │                          │  - Heading 2  │
│  Category 2  │  Markdown content...     │  - Heading 3  │
│    - Page    │                          │               │
│    - Page    │  ---                     │               │
│              │  Source: example.com     │               │
│  Category 3  │                          │               │
│    - Page    │                          │               │
│              │                          │               │
└──────────────┴──────────────────────────┴───────────────┘
```

**Left Sidebar:**
- Categories listed with their child pages
- Active page highlighted
- Collapsible categories
- Sticky on scroll

**Content Area:**
- Category label in small caps above title
- H1 title (serif font, large — matching Claude docs)
- "Copy Page" button top-right (copies raw markdown to clipboard)
- Rendered markdown content
- Optional source URL at bottom

**Right Sidebar:**
- "On this page" heading
- Anchor links auto-generated from H2/H3 headings in content
- Highlights active section on scroll

### Public: `/` (Landing)

Simple, minimal:
- Hero: site name + one-line description
- Featured categories as cards
- "Browse Docs" CTA

### Admin: `/admin`

Protected route (Supabase session required):
- Table of all docs: Title | Category | Slug | Published | Edit | Delete
- "New Doc" button
- Filter by category

### Admin: `/admin/new` and `/admin/edit/[id]`

- Title input
- Category dropdown: fetches distinct `category` values from Supabase `docs` table, renders as `<select>`. Last option is "New category..." which reveals a text input for typing a new one
- Slug input (auto-generated from title, editable)
- Source URL input (optional)
- Markdown editor (textarea with monospace font — simple, no WYSIWYG)
- Published toggle
- Save button

---

## Database Schema (Supabase / Postgres)

### Table: `docs`

```sql
CREATE TABLE docs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL,
  category     text NOT NULL,
  content      text NOT NULL,          -- raw markdown
  source_url   text,                   -- optional, shown at bottom of page
  order_index  integer DEFAULT 0,      -- controls sidebar sort order within category
  published    boolean DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE(category, slug)
);
```

### Row Level Security

```sql
-- Public can only read published docs
ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON docs
  FOR SELECT USING (published = true);

-- Admin (authenticated) can do everything
CREATE POLICY "admin all" ON docs
  FOR ALL USING (auth.role() = 'authenticated');
```

### Categories

Categories are not a separate table — they are derived from distinct `category` values in the `docs` table. Sidebar is built by grouping docs by category, sorted by `order_index`.

---

## Components

### `<Sidebar />`
- Fetches all published docs grouped by category
- Renders category headings + page links
- Highlights current page
- Built with Shadcn `ScrollArea`

### `<DocContent />`
- Receives raw markdown string
- Renders via `next-mdx-remote`
- Applies `rehype-pretty-code` for code blocks
- Applies `rehype-slug` + `rehype-autolink-headings` for anchor links

### `<CopyPageButton />`
- Client component
- On click: copies the raw markdown content to clipboard
- Shows "Copied!" feedback for 2 seconds
- Positioned top-right of content area

### `<OnThisPage />`
- Parses H2/H3 headings from markdown
- Renders as anchor links in right sidebar
- Uses `IntersectionObserver` to highlight active heading on scroll

### `<SearchDialog />`
- Triggered by Search bar in navbar or `Cmd+K`
- Fetches all docs titles + slugs client-side (or via API route)
- Fuse.js fuzzy search on title + category
- Navigate to result on select

### `<ThemeToggle />`
- Light / Dark toggle button in navbar
- Uses `next-themes`

---

## Modules & Features

### 1. Public Docs
- Statically generated at build time (`generateStaticParams`)
- Revalidated on demand when content changes (Next.js `revalidatePath`)
- SEO: dynamic `<title>` and `<meta description>` per page

### 2. Copy Page
- Copies raw markdown (not HTML) to clipboard
- This is the core LLM-friendly feature
- Button label: "Copy page" with clipboard icon (matching Claude docs)

### 3. Search
- Client-side Fuse.js
- Searches title and category fields
- Opens as a modal/dialog on Cmd+K or clicking search bar
- No external service needed

### 4. Admin Panel
- Protected by Supabase Auth (email/password, single admin user)
- CRUD for docs
- No public registration — admin account created manually in Supabase dashboard

### 5. Dark Mode
- `next-themes` with `system` default
- Toggle button in navbar
- Persisted in localStorage

---

## Styling Notes

**Goal:** Match Claude Code Docs aesthetic — minimal, clean, readable.

- **Font:** Geist Sans (body) + Geist Mono (code) — same as Vercel/Next.js docs
- **Title font:** Can use a serif (like `Georgia` or `Lora`) for H1, matching Claude's large serif titles
- **Colors:** Neutral grays, off-white background, subtle borders
- **Sidebar width:** ~260px
- **Content max-width:** ~720px centered
- **Right sidebar width:** ~200px
- **Code blocks:** Dark theme (Shiki `github-dark`) regardless of light/dark mode, or adaptive

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                  # Root layout, ThemeProvider
│   ├── page.tsx                    # Landing page
│   ├── docs/
│   │   └── [category]/
│   │       └── [slug]/
│   │           └── page.tsx        # Doc page (SSG)
│   └── admin/
│       ├── layout.tsx              # Admin layout (auth guard)
│       ├── page.tsx                # Doc list
│       ├── new/
│       │   └── page.tsx            # New doc form
│       └── edit/
│           └── [id]/
│               └── page.tsx        # Edit doc form
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                  # Uses /public/kernel-logo.svg (PNG fallback)
│   │   ├── Sidebar.tsx
│   │   └── OnThisPage.tsx
│   ├── docs/
│   │   ├── DocContent.tsx
│   │   └── CopyPageButton.tsx
│   ├── search/
│   │   └── SearchDialog.tsx
│   └── ui/                         # Shadcn components (auto-generated)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client
│   └── docs.ts                     # Fetch helpers (getDocs, getDoc, getCategories)
│
├── types/
│   └── index.ts                    # Doc type definitions
│
└── middleware.ts                    # Supabase auth middleware (protects /admin)
```

---

## Data Flow

### Public doc page

```
1. Build time: generateStaticParams() → fetches all [category, slug] pairs from Supabase
2. Request: page.tsx → getDoc(category, slug) → Supabase query
3. Render: markdown string → next-mdx-remote → HTML
4. Client: CopyPageButton reads raw markdown from page props
5. Client: OnThisPage parses headings, IntersectionObserver highlights active
```

### Admin flow

```
1. /admin → middleware checks Supabase session → redirect to login if none
2. Create/edit form → POST to Supabase via server action or API route
3. On save → revalidatePath('/docs/...') → next public request gets fresh data
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # only used server-side for admin operations
```

---

## Build & Deploy

```bash
# Local dev
npm install
npm run dev

# Supabase: create project, run schema SQL, create admin user in Auth dashboard

# Deploy
# Push to GitHub → connect to Vercel → add env vars → done
```

---

## Out of Scope (intentionally excluded)

- Multi-user / team accounts
- Comments or feedback on docs
- Versioning of doc content
- Automatic scraping / sync from external docs
- i18n (English only)
- Full-text search with external service (Algolia etc.) — Fuse.js is enough for this scale

---

## Development Order

1. **Setup** — Next.js 15 + Tailwind + Shadcn + Supabase
2. **Database** — Create `docs` table, RLS policies, seed a few test docs
3. **Layout** — Navbar, Sidebar, three-column layout shell
4. **Doc page** — SSG, markdown render, CopyPageButton, OnThisPage
5. **Landing page** — Simple hero + category cards
6. **Search** — Fuse.js dialog
7. **Admin panel** — Auth guard, doc list, create/edit form
8. **Polish** — Dark mode, fonts, responsive mobile layout
9. **Deploy** — Vercel + Supabase prod environment