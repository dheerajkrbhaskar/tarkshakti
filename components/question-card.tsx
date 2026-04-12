'use client';
import { Loader2 } from "lucide-react";
import Image from "next/image";
import type { QuestionContentBlock, QuizOptionItem } from "@/lib/types/quiz";

type QuestionCardProps = {
    questionNumber?: number;
    totalQuestions?: number;
    question: string;
    questionBlocks?: QuestionContentBlock[];
    options: QuizOptionItem[];
    sendingOption: boolean,
    userAnswer: string | null;
    onOptionSelect: (option: string) => void;
    compact?: boolean;
};



export default function QuestionCard({
    questionNumber,
    totalQuestions,
    question,
    questionBlocks,
    options,
    sendingOption,
    userAnswer,
    onOptionSelect,
    compact = false,

}: QuestionCardProps) {


    const selectedOptionLabel = options.find((option) => option.value === userAnswer)?.text || null;

    function renderBlocks(blocks: QuestionContentBlock[], prefix: string) {
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
        <div className={`w-full rounded-4xl border border-foreground/10 bg-white/5 shadow-xl backdrop-blur-sm ${compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'}`}>
            <div className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Question</p>
                    <h2 className={`mt-2 font-bold tracking-tight ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
                        {questionBlocks?.length ? "Read the prompt below" : question}
                    </h2>
                    {questionBlocks?.length ? (
                        <div className="mt-1 text-sm text-foreground/85">
                            {renderBlocks(questionBlocks, "question")}
                        </div>
                    ) : null}
                </div>
            </div>

            <ul className={`flex flex-col ${compact ? 'mt-4 gap-2.5' : 'mt-6 gap-3'}`}>
                {options.map((option, idx) => {

                    return (
                        <li key={idx}>
                            <button
                                type="button"
                                disabled={sendingOption}
                                onClick={() => onOptionSelect(option.value)}
                                className={`flex w-full items-center justify-between rounded-2xl border text-left transition ${compact ? 'px-3.5 py-3' : 'px-4 py-4'}
                                ${userAnswer === option.value ? 'border-accent bg-accent text-background shadow-md' : 'border-foreground/10 bg-background/60 text-foreground hover:border-accent/40 hover:bg-white/10'}
                                ${sendingOption ? 'cursor-not-allowed opacity-80' : ''}`}
                            >
                                <div className={`${compact ? 'text-sm font-medium' : 'font-medium'}`}>
                                    {option.blocks.length > 0 ? renderBlocks(option.blocks, `option-${idx}`) : option.text}
                                </div>
                                <span className={`ml-4 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${userAnswer === option.value ? 'border-background/70 text-background' : 'border-foreground/20 text-foreground/60'}`}>
                                    {(userAnswer === option.value) && sendingOption ? <Loader2 className="h-4 w-4 animate-spin" /> : (userAnswer === option.value ? '✓' : String.fromCharCode(65 + idx))}

                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className={`flex flex-wrap items-center gap-3 text-sm text-foreground/65 ${compact ? 'mt-4' : 'mt-6'}`}>
                <span className="rounded-full border border-foreground/10 px-3 py-1">Selected: {selectedOptionLabel || 'None'}</span>
                <span className="rounded-full border border-foreground/10 px-3 py-1">Tap an option to answer</span>
            </div>
        </div>
    );
}
