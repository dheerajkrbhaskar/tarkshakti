'use client';

import type { QuestionContentBlock } from "@/lib/types/quiz";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Question = {
  isCorrect: boolean;
  orderIndex: number;
  explanation: string | null;
  explanationText?: string;
  explanationBlocks?: QuestionContentBlock[];
  timeTakenMs: number | null;
  correctOption: string | null;
  correctOptionText?: string;
  questionTitle: string;
  questionTitleText?: string;
  questionTitleBlocks?: QuestionContentBlock[];
  selectedOption: string | null;
  selectedOptionText?: string;
};

type ScoreResult = {
  quiz_id: string;
  quiz_duration: number;
  total_score: number;
  attempted: number;
  total_questions: number;
  questions: Question[];
};

export default function ScoreCard() {
  const params = useParams<{ sessionId: string }>();
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/quiz/session/${params.sessionId}/finalize`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load score");
      }

      const data = await response.json() as {
        success: boolean;
        data?: ScoreResult;
        error?: string;
      };
      const scoreData = data.data;
      if (!scoreData) {
        throw new Error(data.error || "Invalid response format");
      }

      setResult(scoreData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed loading score";
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.sessionId]);

  useEffect(() => {
    if (params.sessionId) {
      fetchScore();
    }
  }, [fetchScore, params.sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-lg">Loading results...</p>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{error || "Result not available"}</h1>
          <Link href="/quiz" className="text-accent font-semibold hover:underline">
            ← Start a new quiz
          </Link>
        </div>
      </main>
    );
  }

  const percentage = result.total_questions > 0
    ? Math.round((result.total_score / result.total_questions) * 100)
    : 0;
  const notAttempted = result.total_questions - result.attempted;

  function renderBlocks(blocks: QuestionContentBlock[] | undefined, prefix: string) {
    if (!blocks?.length) return null;

    return blocks.map((block, index) => {
      if (block.type === "image") {
        const src = /^https?:\/\//i.test(block.value) || block.value.startsWith("/")
                    ? block.value
                    : `/${block.value}`;
        return (
          <Image
            key={`${prefix}-img-${index}`}
            src={src}
            alt="Question visual"
            width={1200}
            height={720}
            className="mt-2 max-h-72 w-full rounded-lg border border-foreground/10 object-contain"
          />
        );
      }

      return (
        <p key={`${prefix}-txt-${index}`} className="mt-2 leading-relaxed">
          {block.value}
        </p>
      );
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        
        {/* Score Summary */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2">Quiz Complete</h1>
          <p className="text-foreground/60">You scored <span className="text-accent text-2xl font-bold">{result.total_score}/{result.total_questions}</span></p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10 p-6 rounded-2xl bg-white/5 border border-foreground/10">
          <div className="text-center">
            <p className="text-foreground/60 text-sm">Accuracy</p>
            <p className="text-2xl font-bold text-accent">{percentage}%</p>
          </div>
          <div className="text-center">
            <p className="text-foreground/60 text-sm">Attempted</p>
            <p className="text-2xl font-bold">{result.attempted}</p>
          </div>
          <div className="text-center">
            <p className="text-foreground/60 text-sm">Skipped</p>
            <p className="text-2xl font-bold">{notAttempted}</p>
          </div>
        </div>

        {/* Question Review */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Question Review</h2>
          <div className="space-y-3">
            {result.questions.map((q) => (
              <div
                key={q.orderIndex}
                className={`p-4 rounded-xl border ${
                  q.isCorrect
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-red-500/30 bg-red-500/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mt-1">
                    {q.isCorrect ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold mb-2">Q{q.orderIndex + 1}</p>
                    {q.questionTitleBlocks?.length
                      ? <div className="mb-2 text-foreground">{renderBlocks(q.questionTitleBlocks, `q-${q.orderIndex}`)}</div>
                      : <p className="font-medium mb-2">{q.questionTitleText || q.questionTitle}</p>}
                    
                    <div className="text-sm text-foreground/70 space-y-1">
                      <p>Your answer: <span className="text-foreground">{q.selectedOptionText || q.selectedOption || "Not answered"}</span></p>
                      
                      {(q.correctOptionText || q.correctOption) && (
                        <p>Correct: <span className="text-accent font-semibold">{q.correctOptionText || q.correctOption}</span></p>
                      )}
                      
                      {(q.explanationBlocks?.length || q.explanationText || q.explanation) && (
                        <div className="text-foreground/60 italic mt-2">
                          {q.explanationBlocks?.length
                            ? renderBlocks(q.explanationBlocks, `exp-${q.orderIndex}`)
                            : <p>{q.explanationText || q.explanation}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-6 border-t border-foreground/10">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition"
          >
            Dashboard
          </Link>
          {/* <Link
            href="/quiz"
            className="px-6 py-3 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition"
          >
            Another Quiz
          </Link> */}
        </div>
      </div>
    </main>
  );
}