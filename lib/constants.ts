export const TOPICS = [
    { name: "Verbal And Reading Comprehension", size: 20, ref: "varc" },
    { name: "Data Interpretation", size: 20, ref: "di" },
    { name: "Logical Reasoning", size: 20, ref: "lr" },
    { name: "Quantitative Aptitude", size: 20, ref: "qa" }
] as const;

export type TopicRef = typeof TOPICS[number]["ref"];
export type QuizSizeType = Record<TopicRef, number>;
