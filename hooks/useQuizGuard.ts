import { useEffect, useState, useRef } from "react";

type UseQuizGuardArgs = {
    onViolationEnd: () => void;
    enabled?: boolean;
    maxViolations?: number;
};

export function useQuizGuard({ onViolationEnd, enabled = true, maxViolations = 2 }: UseQuizGuardArgs) {
    const [violations, setViolation] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showFullScreenHelp, setShowFullScreenHelp] = useState(false)
    const lastViolation = useRef(0)

    useEffect(() => {
        if (!enabled) return;

        const handleViolation = () => {
            const now = Date.now();

            //prevent multiple triggers
            if (now - lastViolation.current < 1000) return;

            lastViolation.current = now

            setViolation(prev => {
                const next = prev + 1;
                if (next >= maxViolations) onViolationEnd();
                return next;
            })
        }

        const onVisibility = ()=>{
            if (document.hidden) handleViolation();
        }
        const onFullscreen = ()=>{
            const active = Boolean(document.fullscreenElement);
            setIsFullscreen(active);
            if(!active) {
                setShowFullScreenHelp(true);
                handleViolation();
            }
        }

        setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("visibilitychange", onVisibility)
        document.addEventListener("fullscreenchange", onFullscreen)

        return () => {
            document.removeEventListener("visibilitychange", onVisibility)
            document.removeEventListener("fullscreenchange", onFullscreen)
        }
    }, [enabled, maxViolations, onViolationEnd])

    async function requestQuizFullscreen() {
        try {
            await document.documentElement.requestFullscreen();
            setShowFullScreenHelp(false);
            setIsFullscreen(true);
        } catch {
            setShowFullScreenHelp(true);
        }
    }

    return {
        violations,
        isFullscreen,
        showFullScreenHelp,
        setShowFullScreenHelp,
        requestQuizFullscreen,
    }
}