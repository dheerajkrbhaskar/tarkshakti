# Tarkshakti

Tarkshakti is a server-driven session based quiz app for aptitude practice. It lets signed-in users build short topic-based quizzes, answer timed questions, and review their results without getting lost in a bunch of extra screens.

## Description

The app is set up like a small product, not a throwaway demo. Users can sign up, sign in, choose how many questions they want from each topic, take the quiz one question at a time, and then check a score breakdown at the end. Supabase stores the session, answers, and history, while the Next.js app handles the experience in the browser.

## Features

- Email/password authentication with Supabase.
- Topic-based quiz generation for VARC, DI, LR, and QA.
- Timed quiz sessions with session validation on the server.
- Question navigation and saved answers during an active session.
- Final score review with correct answers, explanations, and attempt counts.
- Dashboard history pulled from Supabase RPC data.
- Profile editing for the authenticated user's full name.
- Support for both text and image-based question content.

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Auth/Data | Supabase SSR and Supabase JS |
| UI Icons | lucide-react |
| Media | next/image, next-cloudinary support in config |
| Tooling | ESLint, TypeScript, npm scripts |

## Architecture

The app splits responsibilities between the browser and the server. Browser components handle the UI and auth state, while route handlers and service functions check ownership, read Supabase cookies, and save quiz progress.

```mermaid
flowchart TD
	A[Sign up / Sign in] --> B[Auth context]
	B --> C[Dashboard]
	C --> D[Choose topic mix]
	D --> E[POST /api/quiz/session]
	E --> F[Create quiz + quiz_session]
	F --> G[Attach session_questions]
	G --> H[Open /quiz/{sessionId}]
	H --> I[GET current question]
	H --> J[PATCH question navigation]
	H --> K[POST selected answer]
	H --> L[GET finalize results]
	L --> M[Score review]
	C --> N[GET /api/dashboard]
	C --> O[PATCH /api/edit-profile]
```

Key design decisions:

- Supabase stores auth, quiz sessions, answers, and history.
- `UserAuthContext` keeps browser auth state in one place.
- Quiz creation rolls back if something fails halfway through, so the database does not end up half-written.
- Question content is normalized so the app can render either plain text or serialized content blocks.
- The app expects authenticated users to have a matching `profiles` row in Supabase.

## Installation & Setup

Prerequisites:

- Node.js 20 or later recommended.
- A Supabase project with the required tables, policies, and RPCs.

Setup steps:

```bash
git clone <repo-url>
cd tarkshakti
npm install
cp .env.example .env.local
```

Fill in the Supabase values in `.env.local`, then start the app:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

If you want to seed sample questions, run:

```bash
npm run insert:questions
```

Supabase schema expectations:

- Tables: `profiles`, `questions`, `quizzes`, `quiz_sessions`, `session_questions`, `session_answers`.
- RPCs: `get_user_quiz_dashboard`, `get_quiz_score`.
- Auth should create or maintain a `profiles` row for each signed-up user.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL used by the browser and server clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key used by the browser and server clients. |
| `NEXT_PUBLIC_BASE_URL` | No | Present in `.env.example`, but not currently used by runtime code. |
| `CLOUDINARY_CLOUD_NAME` | No | Placeholder from `.env.example`; the app does not actively use Cloudinary right now. |
| `CLOUDINARY_API_KEY` | No | Placeholder from `.env.example`. |
| `CLOUDINARY_API_SECRET` | No | Placeholder from `.env.example`. |

Example `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Usage

1. Sign up at `/signup` or sign in at `/signin`.
2. Open the dashboard and choose a topic mix from VARC, DI, LR, and QA.
3. Start a quiz session. The app creates the session on the server and sends you to `/quiz/[sessionId]`.
4. Answer questions, move between them, and submit when you're done.
5. Review the score page for accuracy, attempted count, skipped count, correct answers, and explanations.
6. Update your display name from the profile page if needed.

Available scripts:

```bash
npm run dev      # start the development server
npm run build    # create a production build
npm run start    # run the production server after build
npm run lint     # run ESLint
npm run insert:questions  # seed question records from lib/questions/insert-questions.mjs
```

There is no dedicated automated test script in the current `package.json`. For now, `npm run lint` and `npm run build` are the main checks.

## Folder Structure

| Path | Purpose |
| --- | --- |
| `app/` | App Router pages, layouts, and API route handlers. |
| `app/(auth)/` | Sign-in and sign-up screens. |
| `app/(main)/` | Auth-protected dashboard, profile, and quiz experience. |
| `components/` | Reusable UI pieces like the header, footer, question cards, and topic picker. |
| `contexts/` | Shared client state, primarily Supabase auth context. |
| `hooks/` | Client hooks for quiz timing, guards, answers, and sessions. |
| `lib/actions/` | Server-side helper actions used by API routes and app logic. |
| `lib/db/supabase/` | Browser and server Supabase client factories. |
| `lib/services/` | Quiz creation, navigation, scoring, dashboard, and profile services. |
| `lib/questions/` | Question content utilities and seed/import scripts. |
| `lib/schemas/` | Validation schemas for quiz and answer payloads. |
| `public/` | Static assets served directly by Next.js. |

## Future Improvements

- Add automated tests for auth, quiz creation, and score finalization.
- Replace any remaining demo-oriented placeholders with fully enforced flows.
- Add better empty and error states for dashboard and quiz loading paths.
- Move more quiz administration into structured data and migrations.
- Add retry/resume support for interrupted quiz sessions.

## License

No license file is currently included in the repository.
