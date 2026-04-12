import { useEffect, useRef, useState } from "react";

export function useQuizTimer(initialSeconds: number, onTimeout: () => void, enabled = true) {
    const [time, setTime] = useState(initialSeconds);
    const onTimeoutRef = useRef(onTimeout);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    //reset when new session/question loads
    useEffect(() => {
        setTime(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (!enabled) return;
        if (time <= 0) return;

        const timer = setInterval(() => {
            setTime(prev => {

                if (prev <= 1) {
                    clearInterval(timer)
                    onTimeoutRef.current()
                    return 0;
                }
                return prev - 1;
            })
        }, 1000)

        return () => clearInterval(timer);

    }, [enabled, time]);

    return {
        time,
        minutes: Math.floor(time / 60).toString().padStart(2, "0"),
        seconds: (time % 60).toString().padStart(2, "0"),
    };
}