import { useEffect, useMemo, useState } from "react";

export function useQuizAnswers(questionCount: number) {
    const [selectedQuestion, setSelectedQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);

    useEffect(() => {
        if (questionCount <= 0) {
            setSelectedQuestion(0);
            setUserAnswers([]);
            return;
        }

        setSelectedQuestion(0);
        setUserAnswers(Array(questionCount).fill(null));
    }, [questionCount]);

    const answeredCount = useMemo(
        () => userAnswers.filter((answer): answer is string => Boolean(answer)).length,
        [userAnswers]
    );

    const handleOptionClick = (option: string) => {
        setUserAnswers((prev) => {
            const updated = [...prev];
            updated[selectedQuestion] = option;
            return updated;
        });
    };

    return {
        selectedQuestion,
        setSelectedQuestion,
        userAnswers,
        answeredCount,
        handleOptionClick,
    };
}
