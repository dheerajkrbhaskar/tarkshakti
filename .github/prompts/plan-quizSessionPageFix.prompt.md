## Plan: Fix quiz session page

Preserve all existing commented blocks in the quiz page and correct the live code around them. The current page has compile errors from undefined state, a malformed navigator prop call, and a type mismatch between the session loader response and the UI components. The fix should be minimal and focused on restoring the page to a working state without removing the commented anti-cheat / timer logic.

**Steps**
1. Reconcile the session response shape with the page UI, *depends on understanding the loader output*.
   - Confirm whether `load-question.service.ts` returns question text as `title` or `question` and normalize one side so `QuestionCard` receives a definite string and string[] options.
   - Change the remaining-time field to a numeric or consistently formatted value that `useQuizTimer` and the header can render without React node/type errors.
2. Restore the quiz state wiring in `app/(main)/quiz/[sessionId]/page.tsx`, *depends on step 1*.
   - Use `useQuizAnswers(data.totalQuestions)` to provide `selectedQuestion`, `userAnswers`, `answeredCount`, `setSelectedQuestion`, and `handleOptionClick`.
   - Re-enable the existing guard/timer flow by wiring `useQuizGuard` and `useQuizTimer` to the loaded session state while keeping their commented alternatives intact.
   - Define the submit confirmation message from real derived values instead of undeclared identifiers such as `answeredCount`, `totalQuestions`, and `violationCount`.
3. Fix the navigator integration, *depends on step 2*.
   - Replace the malformed `props={...}` JSX with explicit `currentIndex` and `totalQuestions` props.
   - Update `QuestionNavigator` only if needed so it can navigate through the current quiz session state instead of showing the alert stub.
4. Keep the comment blocks and make the page compile cleanly, *depends on steps 1-3*.
   - Leave the commented-out fullscreen / finalize logic in place, but make the active code compile around it.
   - Remove only dead imports or unused locals that remain after the live state is restored.
5. Validate the fix, *depends on step 4*.
   - Run type/error checks on `app/(main)/quiz/[sessionId]/page.tsx` and the related quiz service files.
   - Verify the page loads a session, shows the current question, renders the timer, opens the confirmation modal, and keeps the preserved comments untouched.

**Relevant files**
- `/home/dhee/Documents/Training System/tarkshakti/app/(main)/quiz/[sessionId]/page.tsx` — restore live quiz state and fix the JSX/type errors.
- `/home/dhee/Documents/Training System/tarkshakti/lib/services/load-question.service.ts` — normalize the loader response shape and remaining-time type.
- `/home/dhee/Documents/Training System/tarkshakti/lib/types/quiz.ts` — align `QuestionResponse` with the loader and page expectations.
- `/home/dhee/Documents/Training System/tarkshakti/hooks/useQuizAnswers.ts` — provide selected answer state and navigation helpers.
- `/home/dhee/Documents/Training System/tarkshakti/components/question-navigator.tsx` — fix prop usage and replace the alert stub with session-aware navigation.
- `/home/dhee/Documents/Training System/tarkshakti/components/question-card.tsx` — confirm the required props and selection handling remain compatible.

**Verification**
1. Type-check the quiz page and supporting files after the edit.
2. Open the quiz route in the browser and confirm the current question, timer, and submit dialog render without runtime errors.
3. Confirm the preserved comment blocks are still present and unchanged in the page file.

**Decisions**
- Preserve all commented-out logic exactly as requested.
- Prefer aligning data shapes at the source rather than papering over them with temporary casts in the page component.
- Keep the page focused on rendering and local session state; do not expand scope to implement the full placeholder API routes unless needed for this specific compile/runtime fix.
