'use client';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from "react";
import { TOPICS, QuizSizeType } from "@/lib/constants";
import { useUserAuth } from '@/contexts/user-auth-context';


export default function ChooseTopic({ setMenuVisible }: { setMenuVisible: Dispatch<SetStateAction<boolean>> }) {
    const router = useRouter();
    const [counts, setCounts] = useState<QuizSizeType>({ varc: 0, di: 0, lr: 0, qa: 0 });
    const [loading, setLoading] = useState(false);
    const totalQuestions = Object.values(counts).reduce((sum, value) => sum + value, 0);
    const estimatedMinutes = Math.max(totalQuestions, 1);
    const { user } = useUserAuth();
    const increment = (ref: keyof QuizSizeType) => setCounts(prev => ({ ...prev, [ref]: prev[ref] + 1 }));
    const decrement = (ref: keyof QuizSizeType) => setCounts(prev => ({ ...prev, [ref]: Math.max(prev[ref] - 1, 0) }));

    async function handleStart() {
        if (!user) {
            alert('Please sign in to start a quiz.');
            return;
        }

        if (totalQuestions === 0) {
            alert("Please select at least one question to start the quiz.");
            return;
        }

        setLoading(true);

        try {
            const sessionResponse = await fetch('/api/quiz/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizSize: counts }),
            });

            if (!sessionResponse.ok) {
                const payload = await sessionResponse.json().catch(() => null);
                throw new Error(payload?.error || 'Failed to create quiz session. Please try again.');
            }
            const data = await sessionResponse.json();
            const sessionId = data.sessionId;

            sessionStorage.setItem(`quiz-session:${sessionId}`, JSON.stringify(data));

            setMenuVisible(false);
            router.push(`/quiz/${sessionId}`);
        } catch (error) {
            console.error(error);
            alert('Unable to start quiz right now. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-3 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) setMenuVisible(false);
            }}
        >
            <div className="w-full max-w-2xl rounded-3xl border border-foreground/10 bg-background/95 p-4 shadow-2xl sm:p-5">
                <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                    <div>
                        <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">Choose Topics</h2>
                    </div>
                    <button
                        onClick={() => setMenuVisible(false)}
                        className="rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-foreground/70 transition hover:border-accent hover:text-accent"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {TOPICS.map(topic => (
                        <article
                            key={topic.ref}
                            className="rounded-2xl border border-foreground/10 bg-white/5 p-3.5 transition hover:border-accent/40"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold leading-5 sm:text-base">{topic.name}</h3>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between rounded-xl border border-foreground/10 bg-background/70 px-2.5 py-2">
                                <button
                                    type="button"
                                    onClick={() => decrement(topic.ref)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/10 text-base font-semibold transition hover:border-accent hover:text-accent"
                                >
                                    −
                                </button>
                                <div className="text-center">
                                    <p className="mt-0.5 text-lg font-bold text-foreground">{counts[topic.ref]}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => counts[topic.ref] < topic.size && increment(topic.ref)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/10 text-base font-semibold transition hover:border-accent hover:text-accent"
                                >
                                    +
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-foreground/10 pt-3.5 sm:flex-row sm:items-center sm:justify-end">
                    

                    <button
                        type="button"
                        disabled={loading || totalQuestions === 0}
                        onClick={handleStart}
                        className="app-btn app-btn-accent"
                    >
                        {loading ? "Starting quiz..." : `Start quiz with ${totalQuestions} questions`}
                    </button>
                </div>
            </div>
        </section>
    )
}