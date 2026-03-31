'use client';

type QuestionCardProps = {
    question: string;
    options: string[];
    userAnswer: string | null;
    onOptionSelect: (option: string) => void;
};

export default function QuestionCard({
    question,
    options,
    userAnswer,
    onOptionSelect,

}: QuestionCardProps) {
    return (
        <div className="w-full p-6 bg-background/90 border border-foreground/30 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{question}</h2>

            <ul className="flex flex-col gap-3">
                {options.map((option, idx) => {

                    return (
                        <li key={idx}>
                            <button
                                type="button"
                                onClick={() => onOptionSelect(option)}
                                className={`w-full text-left p-3 rounded-lg border-2 transition
                                ${userAnswer === option ? 'bg-accent text-background border-accent' : 'bg-background/50 border-foreground/20 text-foreground'}
                                hover:bg-accent/80 hover:text-background`}
                            >
                                {option}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
