# CivicConnect AI — Project Report

## 1. What the project does

CivicConnect AI is a production-quality, responsive full-stack web application for crowdsourced civic issue reporting and resolution. Citizens can report city problems (potholes, garbage, water leakage, broken streetlights, etc.) in seconds by snapping a photo, dropping a pin on a map, and adding a short description. A built-in AI assistant called **Civi** classifies the issue, estimates severity, suggests the correct municipal department, and flags possible duplicate reports. Administrators then triage complaints, assign them to departments, track resolution metrics, and manage users and roles.

The platform is designed for real-world municipal use: every complaint gets a unique tracking number, status updates are logged in an auditable history, and all data access is protected by row-level security so citizens only see their own reports while admins see the whole city.

---

## 2. What has been completed so far

### Backend / database (Lovable Cloud / Supabase)
- Migrations created and applied for:
  - `profiles` — user profiles linked to `auth.users`.
  - `user_roles` — separate role table with `citizen` and `admin` roles.
  - `departments` — 8 seeded municipal departments.
  - `issues` — civic complaints with auto-incrementing complaint numbers (`CIV-XXXX`).
  - `issue_updates` — status and assignment history.
  - `ai_analysis` — AI classification results.
  - `duplicate_links` — duplicate complaint relationships.
- PostgreSQL functions:
  - `handle_new_user` trigger to auto-create profiles on sign-up.
  - `private.has_role` security definer helper for role checks without recursion.
- Row-level security (RLS) policies for every table, scoped to owners and admins.
- Storage bucket `issue-images` with owner/admin ownership checks.
- Email/password authentication enabled with auto-confirmation and HIBP leaked-password protection.
- Demo users created:
  - Citizen: `citizen@civicconnect.demo`
  - Admin: `admin@civicconnect.demo`
  - Password for both: `Demo1234!`

### Design system
- Custom OKLCH color palette and Premium Claymorphism design tokens in `src/styles.css`.
- Semantic utility classes: `.clay`, `.clay-lg`, `.clay-inset`, `.clay-hover`.
- Manrope font loaded globally.
- shadcn/ui primitives configured and used throughout.

### Frontend routes and pages
- Landing page (`/`).
- Authentication (`/login`, `/register`).
- Citizen area:
  - Dashboard (`/citizen/dashboard`)
  - Report an issue (`/citizen/report`)
  - My issues list (`/citizen/issues`)
  - Issue detail (`/citizen/issues/$id`)
  - Map of my issues (`/citizen/map`)
  - Profile (`/citizen/profile`)
- Admin area:
  - Dashboard (`/admin/dashboard`)
  - Complaint queue (`/admin/issues/`)
  - Triage detail (`/admin/issues/$id`)
  - City map / heatmap (`/admin/map`)
  - Analytics (`/admin/analytics`)
  - Departments (`/admin/departments`)
  - Users & roles (`/admin/users`)
- Analytics demo (`/analytics-demo`) with synthetic data and CSV export.
- SEO sitemap (`/sitemap.xml`) and `robots.txt`.

### AI / server functions
- `analyzeIssue` — classifies a complaint from text + optional image, returns category, severity, department, title, and summary.
- `askCivi` — conversational assistant grounded in the caller's visible complaint data.
- `claimFirstAdmin` — lets the first signed-in citizen become an admin.
- `setUserRole` — lets existing admins promote or revoke admin access.

### Maps
- Leaflet-based interactive maps (client-only, SSR-safe).
- Draggable pin for location selection during reporting.
- Marker popups, priority-colored pins, and heat circles on the admin map.

### Analytics
- Admin analytics dashboard with Recharts line, bar, and pie charts.
- Standalone `/analytics-demo` route with 420 synthetic complaints over 180 days, interactive filters (time range, grouping, ward, category, status), KPI cards, and downloadable CSV.

### Security hardening
- Leaked-password protection enabled.
- Role helper moved to a private schema to avoid privilege escalation.
- Storage policies enforce ownership on issue images.
- RLS policies restrict data access to owners and admins.

### Documentation
- Full GitHub-ready `README.md` with live URLs, demo credentials, feature list, tech stack, setup instructions, database schema, auth/roles explanation, security notes, and SEO details.

---

## 3. Key features and modules

### For citizens
- **Report in seconds** — multi-step form with photo upload, description, geolocation, and map-based pin confirmation.
- **AI classification** — Civi categorizes the issue, estimates severity, and writes a department summary.
- **Duplicate detection** — similar nearby reports are surfaced before filing.
- **Live tracking** — follow status from reported → AI analyzed → assigned → in progress → resolved → citizen verified.
- **Personal dashboard & map** — view all your reports and their locations.
- **Civi assistant** — ask plain-language questions about your complaints and the platform.

### For administrators
- **City-wide dashboard** — total reports, open issues, resolution rate, average resolution time.
- **Complaint queue** — filter, search, triage, assign, and update statuses.
- **Triage detail view** — view AI analysis, location, history, and route issues to departments.
- **Interactive city map** — visualize all issues and hotspot heat circles.
- **Analytics** — Recharts-powered trends, category distribution, priority mix, and resolution performance.
- **Department management** — view municipal departments and their workload.
- **User management** — promote citizens to admin and manage roles securely.
- **First-admin bootstrap** — when no admin exists, a signed-in citizen can claim admin access from their profile.

### Analytics demo
- Generates 420 synthetic complaints across 180 days.
- Filters: time range (30/90/180 days), grouping (day/week/month), ward, category, status.
- Charts: reports over time, priority pie, category bar, status bar.
- Table preview and CSV download of the filtered dataset.

---

## 4. What is currently working

| Area | Status | Notes |
|------|--------|-------|
| User registration & login | Working | Email/password auth, demo one-tap buttons, role-aware redirects. |
| Citizen reporting | Working | Multi-step form, image compression, geolocation, map pin, AI analysis, duplicate detection. |
| Citizen dashboard & issue list | Working | Personal reports, status badges, relative timestamps. |
| Citizen issue detail | Working | AI summary, status timeline, update history. |
| Citizen map | Working | Leaflet map with priority-colored markers. |
| Admin dashboard | Working | KPI cards and summary metrics. |
| Admin complaint queue | Working | Search and filters by status, priority, category. |
| Admin triage detail | Working | Assign departments, update statuses, view AI analysis. |
| Admin map | Working | City-wide markers and heat circles. |
| Admin analytics | Working | Recharts charts and data tables. |
| Admin users & roles | Working | Promote/revoke admin access with server-side guards. |
| Civi AI assistant | Working | Citizen and admin modes grounded in visible complaint data. |
| Analytics demo | Working | Synthetic data, filters, charts, CSV download. |
| Security policies | Working | RLS, private role helper, storage ownership, HIBP protection. |
| SEO | Working | Unique titles/descriptions per route, sitemap.xml, robots.txt. |

---

## 5. Pending work and next steps

The application is functionally complete for its current scope. Recommended next steps if you want to extend it:

1. **Email verification flow** — currently auto-confirmed for demo convenience; switch to real confirmation links in production.
2. **Push / SMS notifications** — notify citizens when their complaint status changes.
3. **Real-time updates** — use Supabase realtime to refresh dashboards when issues change.
4. **Advanced analytics** — export PDF reports, compare wards, track SLA compliance.
5. **Multi-image uploads** — allow several photos per complaint.
6. **Mobile app** — wrap the PWA or build a native companion.
7. **Department workload balancing** — auto-suggest departments based on open ticket count.
8. **Public status page** — a read-only view of resolved issues for transparency.
9. **Integration tests** — expand Playwright coverage for citizen and admin flows.
10. **Accessibility audit** — verify keyboard navigation and screen-reader labels across all modals and maps.

---

## 6. Technical architecture

### Stack
- **Framework:** TanStack Start v1 (React 19, SSR/SSG, file-based routing, Vite 8).
- **Backend & Auth:** Lovable Cloud / Supabase.
- **Database:** PostgreSQL with Row Level Security (RLS).
- **Styling:** Tailwind CSS v4 with custom OKLCH tokens and claymorphism utilities.
- **UI components:** shadcn/ui + Radix UI primitives.
- **Charts:** Recharts.
- **Maps:** Leaflet (client-only, SSR-safe).
- **AI:** Lovable AI Gateway (Gemini 2.5 Flash) for classification and Civi assistant.
- **Language:** TypeScript.

### Key files
| File | Purpose |
|------|---------|
| `src/routes/__root.tsx` | Root layout, fonts, Leaflet CSS, providers. |
| `src/hooks/useAuth.tsx` | Global auth context (session, profile, role). |
| `src/lib/civic.ts` | Domain constants: categories, priorities, statuses, helpers. |
| `src/lib/issues.ts` | TanStack Query options and issue helpers. |
| `src/lib/ai.functions.ts` | Server functions for AI, admin role changes. |
| `src/lib/ai.server.ts` | AI gateway client, PII redaction, fallback classification. |
| `src/lib/demo-analytics.ts` | Synthetic data generator and CSV helpers. |
| `src/lib/sitemap.ts` | Sitemap generation logic. |
| `src/components/civic/` | App-specific components: AppShell, IssueCard, CivicMap, MapPanel, CiviAssistant, etc. |
| `src/integrations/supabase/` | Generated clients, middleware, auth helpers. |

---

## 7. How it works — user flows

### Citizen flow
1. **Sign up / sign in** at `/login` or `/register`.
2. **Report** at `/citizen/report`:
   - Add a photo (compressed client-side).
   - Describe the problem.
   - Confirm or drag the map pin to set the exact location.
   - AI analyzes the report and suggests category, severity, and department.
   - Nearby similar reports are shown as possible duplicates.
3. **Track** on `/citizen/dashboard` or `/citizen/issues`:
   - See complaint number, status, priority, and last update.
   - Open a report for full AI summary and status history.
4. **Ask Civi** for plain-language help about your complaints.

### Admin flow
1. **Sign in** with an admin account.
2. **Dashboard** at `/admin/dashboard` shows city-wide KPIs.
3. **Queue** at `/admin/issues/` lists all open complaints with filters.
4. **Triage** an issue at `/admin/issues/$id`:
   - View AI analysis, location, and history.
   - Assign to a department and update status.
5. **Map** at `/admin/map` visualizes hotspots.
6. **Analytics** at `/admin/analytics` shows trends and distributions.
7. **Users** at `/admin/users` lets you promote/revoke admin access.

### First-admin bootstrap
- When no admin exists, a signed-in citizen can visit their profile and click **"Claim admin access"**.
- Once an admin exists, this path is disabled; further admins must be granted by existing admins.

---

## 8. Security summary

- **Authentication:** Supabase email/password with HIBP leaked-password protection.
- **Authorization:** Roles stored in a separate `user_roles` table; admin checks always happen server-side.
- **RLS:** Every table has Row Level Security enabled; citizens see only their own data, admins see everything.
- **Role helper:** `private.has_role` is a `SECURITY DEFINER` function in a private schema, preventing privilege escalation and recursive policy loops.
- **Storage:** `issue-images` bucket policies enforce that citizens can only read/write their own images; admins can read all images.
- **No client-side admin checks:** Admin status is never determined by localStorage or hardcoded credentials.

---

## 9. Live URLs and demo credentials

- **Published app:** https://citizen-civic-ai.lovable.app
- **Preview:** https://id-preview--8c5d3162-70c9-4806-91d1-d257d0516358.lovable.app

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@civicconnect.demo` | `Demo1234!` |
| Admin | `admin@civicconnect.demo` | `Demo1234!` |

Use the **Citizen demo** or **Admin demo** one-tap buttons on the sign-in page to log in instantly.

---

## 10. How to run locally

```sh
npm install
npm run dev
```

Open http://localhost:8080.

Required environment variables:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
LOVABLE_API_KEY=<your-lovable-api-key>
```

On Lovable Cloud, these secrets are managed for you.

---

*Report generated for the CivicConnect AI project.*
