'use client';
import { generateQuiz } from "@/lib/actions/quiz.action";
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from "react";
import { TOPICS, QuizCountsType } from "@/lib/constants";


export default function ChooseTopic({ setMenuVisible }: { setMenuVisible: Dispatch<SetStateAction<boolean>> }) {
    const router = useRouter();
    const [counts, setCounts] = useState<QuizCountsType>({ varc: 0, di: 0, lr: 0, qa: 0 });

    const increment = (ref: keyof QuizCountsType) => setCounts(prev => ({ ...prev, [ref]: prev[ref] + 1 }));
    const decrement = (ref: keyof QuizCountsType) => setCounts(prev => ({ ...prev, [ref]: Math.max(prev[ref] - 1, 0) }));

    async function handleStart() {
        if (Object.values(counts).reduce((a, b) => a + b, 0) === 0) {
            alert("Please select at least one question to start the quiz.");
            return;
        }
        // Proceed to start the quiz with the selected counts
        // console.log(`Starting quiz with ${Object.values(counts).reduce((a, b) => a + b, 0)} questions!`);


        const data = await generateQuiz(counts);
        console.log('Generated quiz data:', data.quizId);
        console.log('Questions array:', data.questions);


        setMenuVisible(false);
        router.push(`/quiz/${data.quizId}`); // Navigate to the quiz page with the generated quiz ID
    }

    return (
        // <section className="w-full overflow-hidden invisible pointer-events-none flex items-center justify-center py-16">
        //     <button onClick={() => setMenuVisible(false)}>X</button>
        //     <div>
        //         {TOPICS.map((topic) => (
        //             <div key={topic.ref} className="p-4 m-4 border border-foreground/20 rounded-lg hover:border-accent transition">
        //                 <h3 className="text-xl font-medium mb-2">{topic.name}</h3>
        //                 <p className="text-sm text-foreground/70">Number of questions: {topic.size}</p>
        //                 <div>
        //                     <button className="px-3 py-1 bg-accent text-background rounded-md hover:bg-accent/90 transition">^</button>
        //                     <input type="number" name={topic.ref} id={topic.ref} placeholder="0" defaultValue={0} className="w-16 text-center border border-foreground/30 rounded-md mx-2 py-1 focus:border-accent focus:ring-0 focus:border-l-4 focus:border-l-accent transition" />
        //                     <button className="px-3 py-1 bg-accent text-background rounded-md hover:bg-accent/90 transition">v</button>
        //                 </div>
        //             </div>
        //         ))}
        //     </div>
        // </section>
        <section 
        className="fixed inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-50 p-4"
        onClick={(e) => {
                if (e.target === e.currentTarget) setMenuVisible(false);
            }}
        >
            <div className="bg-background/90 border border-foreground/20 p-8 rounded-xl shadow-lg w-full max-w-lg overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Choose Topics</h2>
                    <button
                        onClick={() => setMenuVisible(false)}
                        className="text-accent font-bold text-xl hover:text-accent/80 transition"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {TOPICS.map(topic => (
                        <div
                            key={topic.ref}
                            className="p-4 border border-foreground/20 rounded-lg hover:border-accent transition"
                        >
                            <h3 className="text-lg mb-2 text-foreground">{topic.name}</h3>
                            <p className="text-sm text-foreground/70 mb-2">Avialable Questions: {topic.size}</p>
                            <div className="flex flex-row justify-center items-center gap-2">
                                <button
                                    onClick={() => counts[topic.ref] < topic.size && increment(topic.ref)}
                                    className="px-3 py-1 bg-accent text-background rounded-md hover:bg-accent/90 transition"
                                >
                                    +
                                </button>
                                {/* <input
                                    type="number"
                                    value={counts[topic.ref]}
                                    readOnly
                                    className="w-16 text-center border border-foreground/30 rounded-md py-1 focus:border-accent focus:ring-0 focus:border-l-4 focus:border-l-accent transition"
                                /> */}
                                <span className="w-16 text-center border border-foreground/30 rounded-md py-1 focus:border-accent focus:ring-0 focus:border-l-4 focus:border-l-accent transition">{counts[topic.ref]}</span>
                                <button
                                    onClick={() => decrement(topic.ref)}
                                    className="px-3 py-1 bg-accent text-background rounded-md hover:bg-accent/90 transition"
                                >
                                    −
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-center items-center mt-4">
                    <button
                        className="bg-accent text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                        onClick={handleStart}
                    >
                        Start with {Object.values(counts).reduce((a, b) => a + b, 0)} Questions
                    </button>
                </div>

            </div>
        </section>
    )
}