'use client';
import ConfirmBox from "@/components/confirm-box";
import QuestionCard from "@/components/question-card";
import QuestionNavigator from "@/components/question-navigator";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import type { PutOptionResponse, QuestionOptionResponse, QuestionResponse } from "@/lib/types/quiz";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId;
  const router = useRouter()

  const [data, setData] = useState<QuestionResponse | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(60);
  const [questionStartRemaining, setQuestionStartRemaining] = useState(60);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [sendingOption, setSendingOption] = useState(false)
  const [timedOut, setTimedOut] = useState(false);
  const isSubmittedRef = useRef(false);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    setLoadingQuestion(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/quiz/session/${sessionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Question load failed. Please retry.');
      }

      const payload = await response.json() as {
        success: boolean;
        data?: QuestionResponse;
        error?: string;
      };

      if (!payload.success || !payload.data?.question) {
        throw new Error(payload.error || 'Question data missing.');
      }

      const data = payload.data;

      setData(data);
      setSelectedOption(data.selected_option ?? null);
      const remainingSeconds = typeof data.remainingTime === 'number' ? data.remainingTime : 60;
      setRemainingTime(remainingSeconds);
      setQuestionStartRemaining(remainingSeconds);

      setAttempted(new Set(data.attemptedIndices || []));

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load quiz question right now.';
      setLoadError(message);
    } finally {
      setLoadingQuestion(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const finalizeQuiz = useCallback(() => {
    if (isSubmittedRef.current) {
      return;
    }
    isSubmittedRef.current = true;
    router.push(`/quiz/${sessionId}/score`)
  }, [sessionId])

  const handleTimeout = useCallback(() => {
    if (isSubmittedRef.current) {
      return;
    }

    setConfirmVisible(false);
    setTimedOut(true);
  }, []);

  useEffect(() => {
    if (!timedOut || isSubmittedRef.current || !sessionId) {
      return;
    }

    isSubmittedRef.current = true;
    router.push(`/quiz/${sessionId}/score`);
  }, [router, sessionId, timedOut]);

  // const finalizeQuiz = useCallback((reason: QuizFinalizeReason) => {
  //   if (!sessionId || !questionData || isSubmittedRef.current) {
  //     return;
  //   }

  //   isSubmittedRef.current = true;

  //   sessionStorage.setItem(
  //     `quiz-result:${sessionId}`,
  //     JSON.stringify({
  //       quizId: sessionId,
  //       sessionId,
  //       questions: [
  //         {
  //           question: questionData.title,
  //           options: questionData.options,
  //         },
  //       ],
  //       answers: userAnswers,
  //       meta: {
  //         reason,
  //         violations: violationCountRef.current,
  //         totalQuestions,
  //         attempted: answeredCount,
  //       },
  //     })
  //   );

  //   if (document.fullscreenElement) {
  //     document.exitFullscreen().catch(() => null);
  //   }

  //   router.push(`/quiz/${sessionId}/result`);
  // }, [answeredCount, questionData, router, sessionId, totalQuestions, userAnswers]);



  // const {
  //   violations,
  //   isFullscreen,
  //   showFullScreenHelp,
  //   setShowFullScreenHelp,
  //   requestQuizFullscreen,
  // } = useQuizGuard({
  //   onViolationEnd: () => {
  //     if (!isSubmittedRef.current) {
  //       finalizeQuiz("violation");
  //     }
  //   },
  //   enabled: Boolean(questionData) && !isSubmittedRef.current,
  //   maxViolations: 2,
  // });

  // useEffect(() => {
  //   violationCountRef.current = violations;
  // }, [violations]);

  // useEffect(() => {
  //   if (!questionData || isSubmittedRef.current) {
  //     return;
  //   }

  //requestQuizFullscreen();
  // }, [questionData, requestQuizFullscreen]);

  // const violationCount = violations;
  // const remainingViolationChances = Math.max(2 - violationCount, 0);
  // const progressPct = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  // const formattedTime = `${minutes}:${seconds}`;
  // const currentQuestion = useMemo(
  //   () => ({
  //     question: questionData?.title || "Question not available",
  //     options: questionData?.options || [],
  //   }),
  //   [questionData]
  // );

  const pageShell = "min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10";
  const panel = "rounded-2xl border border-foreground/10 bg-white/5 p-4 shadow-sm";

  const { time, minutes, seconds } = useQuizTimer(
    remainingTime,
    handleTimeout,
    Boolean(data) && !isSubmittedRef.current
  );


  async function onOptionSelect(option: string) {
    setSelectedOption(option);
    if (!sessionId || !option) return
    if (loadingQuestion) return
    setSendingOption(true)
    try {
      const elapsedSeconds = Math.max(questionStartRemaining - time, 0);
      const response = await fetch(`/api/quiz/session/${sessionId}/put-option`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_option: option, time_taken_s: elapsedSeconds }),
      })

      const responseData = await response.json() as PutOptionResponse;

      if (!response.ok) {
        throw new Error(responseData.error || "Option upload failed. Try again")
      }

      if (!responseData.success) {
        throw new Error(responseData.error || "Option upload failed. Try again")
      }

      const nextRemaining =
        typeof responseData.data === "number"
          ? responseData.data
          : typeof responseData.remainingTime === "number"
            ? responseData.remainingTime
            : null;

      if (typeof nextRemaining === "number") {
        setRemainingTime(nextRemaining);
        setQuestionStartRemaining(nextRemaining);
      }

      if (!data) return
      setAttempted(prev => {
        const next = new Set(prev);
        next.add(data.currentIndex);
        return next;
      });

    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Unable to upload the option")
    } finally {
      setSendingOption(false)
    }
  }

  async function onNavigate(targetQuestionIndex: number) {
    //PATCH /api/quiz/session/[sessionId]/ with selected quesIndex
    if (!sessionId) return
    if (sendingOption) return
    if (targetQuestionIndex < 0) return

    setLoadingQuestion(true)

    try {
      const response = await fetch(`/api/quiz/session/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetQuestionIndex })
      })
      const payload = await response.json() as {
        success: boolean;
        data?: QuestionOptionResponse;
        error?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Navigation failed");
      }

      const res = payload.data;

      setData({
        ...res,
        currentIndex: targetQuestionIndex,
      });
      setSelectedOption(res.selected_option ?? null)

      if (typeof res.remainingTime === 'number') {
        setRemainingTime(res.remainingTime);
        setQuestionStartRemaining(res.remainingTime);
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load quiz question right now.';
      setLoadError(message);
    } finally {
      setLoadingQuestion(false);
    }
  }
  function handleSubmit() {
    if (loadingQuestion || sendingOption) {
      return;
    }
    // if (!isFullscreen) {
    //   setShowFullScreenHelp(true);
    //   alert('Submission blocked: re-enter fullscreen. Violation rule is active and two violations will end the quiz.');
    //   return;
    // }
    setConfirmVisible(true);
  }

  function handleConfirmSubmit() {
    setConfirmVisible(false);
    // finalizeQuiz('submitted');

    finalizeQuiz()
  }
  if (loadingQuestion && !data && !loadError) {
    return (
      <main className={pageShell}>
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <p className="text-sm text-foreground/70">Preparing your quiz...</p>
        </div>
      </main>
    );
  }

  if (loadError || !data) {
    return (
      <main className={pageShell}>
        <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Quiz session missing</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">This quiz session could not be loaded.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-foreground/70">
            {loadError || 'Start a fresh quiz from the quiz page so the generated questions can be loaded into this session.'}
          </p>
          <Link
            href="/dashboard"
            className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={pageShell}>
      <div className="mx-auto max-w-5xl space-y-4">
        <section className={panel}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Quiz in progress</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Question {data.currentIndex + 1} of {data.totalQuestions}</h1>
              <p className="mt-2 text-sm text-foreground/70">Attempted {attempted.size}/{data.totalQuestions} </p>
            </div>

            <div className="flex items-center gap-2.5">
              Time: {`${minutes}:${seconds}`}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loadingQuestion || sendingOption}
              className="app-btn app-btn-accent"
            >
              Submit
            </button>
          </div>
          {/* {showFullScreenHelp && (
            <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100 sm:text-sm">
              <p className="font-semibold">Fullscreen required to continue.</p>
              <p className="mt-1">Leaving fullscreen or switching tabs counts as a violation. Remaining chances: {remainingViolationChances}.</p>
              <button
                type="button"
                onClick={requestQuizFullscreen}
                className="mt-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-semibold text-background transition hover:opacity-90"
              >
                Re-enter fullscreen
              </button>
            </div>
          )} */}

          {/* {!isFullscreen && !showFullScreenHelp && (
            <p className="mt-2 text-xs text-foreground/60">Waiting for fullscreen mode...</p>
          )} */}
        </section >

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-3">
            <QuestionCard
              compact
              questionNumber={data.currentIndex + 1}
              totalQuestions={data.totalQuestions}
              question={data.question?.title || 'Question Not available'}
              questionBlocks={data.question?.titleBlocks || []}
              options={data.question?.options || []}
              sendingOption={sendingOption || loadingQuestion}
              userAnswer={selectedOption}
              onOptionSelect={onOptionSelect}
            />


          </div>

          <QuestionNavigator
            currentIndex={data.currentIndex}
            totalQuestions={data.totalQuestions}
            onNavigate={onNavigate}
            attemptedQuestions={attempted}
            sendingOption={sendingOption || loadingQuestion} />
        </section>
      </div >

      {confirmVisible && (
        <ConfirmBox
          // title={violationCount > 0 ? "Submit now? Violation rule active" : "Submit this quiz?"}
          title="Submit this quiz?"
          message={`You are about to submit this quiz with ${data.totalQuestions} questions. Once submitted, your answers will be locked for review.`}
          confirmLabel="Submit quiz"
          cancelLabel="Keep answering"
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmVisible(false)}
        />
      )
      }
    </main >
  );
}


