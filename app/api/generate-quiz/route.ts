import { QuizCountsType } from "@/lib/constants";


const ques = [
    {
        "question": "It is quite hard to remember everything that is taught during a lecture. What does 'retain' most nearly mean?",
        "options": ["keep", "recall", "preserve", "conserve"],
        "correctAnswer": "keep",
        "explanation": "'Retain' means to keep or hold information in memory.",
        "topic": "varc",
        "subtopic": "synonym"

    },
    {
        "question": "The life of the renowned artist was marked by constant ups and downs. What does 'vicissitudes' mean?",
        "options": ["sorrows", "misfortunes", "changes", "surprises"],
        "correctAnswer": "changes",
        "explanation": "'Vicissitudes' refers to changes or variations, often unexpected.",
        "topic": "varc",
        "subtopic": "synonym"

    },
    {
        "question": "She possesses an endless passion for music. What is the closest meaning of 'insatiable'?",
        "options": ["unsatisfiable", "unchanging", "irreconcilable", "undesirable"],
        "correctAnswer": "unsatisfiable",
        "explanation": "'Insatiable' means something that cannot be satisfied.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "The dancer amazed the audience with his agile and swift movements. What does 'nimble' imply?",
        "options": ["unrhythmic", "lively", "quickening", "clear"],
        "correctAnswer": "quickening",
        "explanation": "'Nimble' refers to quick and light movement.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "The guest appeared to have a free-spirited and unconventional style. What does 'bohemian' mean?",
        "options": ["hostile", "unconventional", "sinister", "unfriendly"],
        "correctAnswer": "unconventional",
        "explanation": "'Bohemian' describes someone with an unconventional lifestyle.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "The injury caused by the bullet turned out to be deadly. What is the meaning of 'fatal'?",
        "options": ["grievous", "dangerous", "serious", "deadly"],
        "correctAnswer": "deadly",
        "explanation": "'Fatal' means causing death.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "The developed nations often show a lack of concern towards poorer countries. What does 'callous' mean?",
        "options": ["passive", "unkind", "cursed", "unfeeling"],
        "correctAnswer": "unfeeling",
        "explanation": "'Callous' means emotionally insensitive or unfeeling.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "Despite their hard work, the researchers made little progress in solving the issue. What does 'headway' mean?",
        "options": ["progress,", "thinking", "efforts", "start"],
        "correctAnswer": "progress",
        "explanation": "'Headway' refers to forward movement or progress.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "After careful examination, the officer realized the papers were fake. What does 'fabricated' mean?",
        "options": ["forged", , "historical", "prepared", "genuine"],
        "correctAnswer": "forged",
        "explanation": "'Fabricated' means artificially created or forged.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "Being unemployed is not always obvious through visible inactivity. What does 'manifest' mean?",
        "options": ["easily p,erceived", "easily acquired", "easily infected", "easily deflected"],
        "correctAnswer": "easily perceived",
        "explanation": "'Manifest' means clearly visible or obvious.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "The mishap happened due to his momentary mistake. What does 'lapse' mean?",
        "options": ["trick", , "interval", "error", "ignorance"],
        "correctAnswer": "error",
        "explanation": "'Lapse' refers to a temporary failure or mistake.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "The scenery displayed ever-changing patterns of colors due to light and shadow. What does 'kaleidoscope' suggest?",
        "options": [,
            "tube containing mirrors and colored pieces",
            "frequently changing pattern of bright scenes",
            "a mixture of black and white",
            "rainbow-like appearance"
        ],
        "correctAnswer": "frequently changing pattern of bright scenes",
        "explanation": "'Kaleidoscope' refers to constantly changing patterns.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "After the team's disappointing performance, the captain stepped down. What does 'dismal' mean?",
        "options": ["poor", "sorrowful", "minimum", "short"],
        "correctAnswer": "poor",
        "explanation": "'Dismal' means very bad or disappointing.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "We doubted his claim initially, but later events proved him correct. What does 'subsequent' mean?",
        "options": ["later", "many", "few", "earlier"],
        "correctAnswer": "later",
        "explanation": "'Subsequent' means occurring after something else.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "The early settlers showed great courage and determination. What does 'pioneers' mean?",
        "options": ["inventors", "explorers", "colonialist", "settlers"],
        "correctAnswer": "settlers",
        "explanation": "'Pioneers' refers to people who are among the first to explore or settle.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "He tends to fall into debt frequently. What does 'propensity' mean?",
        "options": ["natural tendency", "aptitude", "characteristic", "quality"],
        "correctAnswer": "natural tendency",
        "explanation": "'Propensity' means a natural inclination or tendency.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "He is very hopeful about the outcome of his exam. What does 'sanguine' mean?",
        "options": ["depressed", "pessimistic", "anxious", "optimistic"],
        "correctAnswer": "optimistic",
        "explanation": "'Sanguine' means confident and optimistic.",
        "topic": "varc",
        "subtopic": "synonym"
    },
    {
        "question": "He does not support the idea of conducting elections at present. What does 'averse' mean?",
        "options": ["convinced", "angry", "agreeable", "opposed"],
        "correctAnswer": "opposed",
        "explanation": "'Averse' means having a strong dislike or opposition.",
        "topic": "varc",
        "subtopic": "synonym"
    }
]



type Question = typeof ques[number];


const grouped: Partial<Record<keyof QuizCountsType, Question[]>> = {};

for (const q of ques) {
    if (!grouped[q.topic]) {
        grouped[q.topic] = [];
    }
    grouped[q.topic]!.push(q);
}

function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// export async function POST(request: Request) {
//     try {
//         const quizCounts: QuizCountsType = await request.json();

//         const generatedQuestions: Question[] = [];

//         for (const topic in quizCounts) {
//             const key = topic as keyof QuizCountsType;
//             const count = quizCounts[key];
//             const topicQuestions = grouped[key];

//             if (count > 0 && topicQuestions) {
//                 if (count > topicQuestions.length) {
//                     throw new Error(
//                         `Requested ${count} but only ${topicQuestions.length} available for ${topic}`
//                     );
//                 }

//                 const shuffled = shuffle(topicQuestions);
//                 generatedQuestions.push(...shuffled.slice(0, count));
//             }
//         }

//         return new Response(
//             JSON.stringify({ success: true, questions: generatedQuestions }),
//             { status: 200 }
//         );
//     } catch (error) {
//         return new Response(
//             JSON.stringify({ success: false, error: 'Failed to generate quiz' }),
//             { status: 500 }
//         );
//     }
// }

export async function POST(request: Request) {
    try {
        const quizCounts: QuizCountsType = await request.json();
        const generatedQuestions: Question[] = [];

        for (const topic in quizCounts) {
            const key = topic as keyof QuizCountsType;
            const count = quizCounts[key];
            const topicQuestions = grouped[key];

            if (count > 0 && topicQuestions && topicQuestions.length > 0) {
                const shuffled = shuffle(topicQuestions);
                generatedQuestions.push(...shuffled.slice(0, count));
            }
        }

        //quizid
        const quizId = crypto.randomUUID();

        return new Response(
            JSON.stringify({ success: true, questions: generatedQuestions, quizId }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error generating quiz:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to generate quiz' }),
            { status: 500 }
        );
    }
}