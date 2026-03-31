'use server'

import { QuizCountsType } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const generateQuiz = async (quizCounts: QuizCountsType) => {
    try {
        const response = await fetch(`${BASE_URL}/api/generate-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quizCounts)

        });
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error generating quiz:', error);
        throw new Error('Failed to generate quiz');
    }
}   
