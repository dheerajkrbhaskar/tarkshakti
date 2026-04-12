import { useEffect, useState } from "react";
import type { StoredQuizSession } from "@/lib/types/quiz";

export function useQuizSession(sessionId: string) {
    const [session, setSession] = useState<StoredQuizSession | null>(null)

    useEffect(() => {
        if (!sessionId) return;
        const stored = sessionStorage.getItem(`quiz-session:${sessionId}`)
        if (!stored) return setSession(null)

        try {
            const parsed = JSON.parse(stored) as StoredQuizSession

            if (!parsed?.totalQuestions?.length) {
                sessionStorage.removeItem(`quiz-session:${sessionId}`)
                return setSession(null)
            }

            setSession(parsed)

        } catch {
            sessionStorage.removeItem(`quiz-session:${sessionId}`)
            setSession(null)
        }

    }, [sessionId])
    return session
}