# Codebase Notes for Tarkshakti

## What This Project Is
- A Next.js App Router quiz app with Supabase auth.
- Current structure is simple and readable, which is good for a student portfolio and interview demo.
- The codebase is mostly split into `app/`, `components/`, `contexts/`, and `lib/`, which is a clean small-scale SaaS layout.

## File Structure Insights
- `app/` holds route pages, route handlers, and the global layout.
- `components/` contains reusable UI pieces such as the header and landing section.
- `contexts/` is used for auth state sharing.
- `lib/` contains Supabase clients, server actions, constants, and quiz data/helpers.
- This is a good structure for a small product because it avoids over-engineering while still keeping responsibilities separated.

## Conventions Already In Use
- Client components are marked with `use client` when they use state, effects, or browser APIs.
- Tailwind CSS is used directly in component class names, so styling is close to the UI logic.
- Fonts are loaded with `next/font` in the root layout.
- Supabase browser access is centralized in `lib/supabase/browser-client.ts`.
- The app is using a very page-driven architecture, which keeps the learning curve low.

## Auth Flow Observations
- `contexts/user-auth-context.ts` is the shared auth state layer.
- `app/signin/page.tsx` and `app/signup/page.tsx` call Supabase directly from the browser client.
- This is fine for a small app, but the auth context should stay the single source of truth for user state once the app grows.
- Keep auth method names consistent across the app. The current context exposes `signout`, so any consumers should call that exact name unless you standardize it later.
- Sign-up redirects to `/auth/callback`, so that route should exist and be reliable before deployment.

## Quiz Flow Observations
- `app/api/generate-quiz/route.ts` is acting like a quiz generator endpoint.
- `lib/actions/quiz.action.ts` posts quiz counts to that API route.
- The current quiz question bank is hardcoded in the route file, which is okay for prototyping but not ideal for long-term scaling.
- The route currently returns a generated `quizId`, which is useful for future persistence and result pages.

## Code Quality Notes
- The project is intentionally simple, which is a strength for showcasing clarity in interviews.
- There is some duplicated UI logic between sign-in and sign-up pages, especially form layout and input styling.
- The quiz data in `app/api/generate-quiz/route.ts` contains malformed entries and should be cleaned before production use.
- `lib/actions/quiz.action.ts` depends on `NEXT_PUBLIC_BASE_URL`, so environment setup matters during deployment.
- Some routes referenced in the UI, such as `/dashboard` and `/auth/callback`, should be verified to exist or handled explicitly.

## Good Implementation Practices For This Codebase
- Keep components small and route-focused.
- Use shared types for auth state, quiz objects, and API payloads instead of `any` when you revisit the code.
- Keep server logic in route handlers or server actions, and browser-only code in client components.
- Centralize constants, quiz metadata, and Supabase helpers in `lib/`.
- Prefer explicit, readable state names like `loading`, `error`, `user`, `quizId`, and `selectedAnswer`.

## Interview-Friendly Improvements
- Add a real quiz database instead of hardcoded question arrays.
- Store quiz attempts and scores so users can resume or review results.
- Add route protection for authenticated pages.
- Add validation for sign-in and sign-up forms.
- Replace raw `window.location.href` redirects with Next.js navigation when possible.
- Add empty, loading, and error states for quiz generation and result pages.
- Add a reusable form component for auth screens to reduce duplication.
- Add minimal test coverage for auth and quiz generation logic.

## Small SaaS Tricks That Make It Look More Professional
- Use one consistent layout shell for authenticated pages.
- Keep a visible loading state when session or quiz data is being fetched.
- Show friendly error messages instead of silent failures.
- Store quiz progress or score history so the app feels like a product, not just a demo.
- Add a small dashboard page with summary cards: quizzes taken, best score, recent attempts.
- Use one strong accent color and a consistent spacing system.

## Suggested Build Order
1. Make auth stable and consistent.
2. Move quiz data into structured types or a database.
3. Protect private pages.
4. Add a dashboard and attempt history.
5. Improve form UX and error handling.
6. Add tests after the core flow is stable.

## Bottom Line
- This codebase is a good candidate for a clean, minimal SaaS showcase.
- The main opportunity is not complexity; it is consistency, type safety, and removing rough edges in auth and quiz data.
- If you keep the current structure simple and tighten the data flow, it will look professional without becoming overbuilt.
