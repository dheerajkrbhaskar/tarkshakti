'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QuestionCard from "../../../components/question-card";
import ConfirmBox from "../../../components/confirm-box";

// Sample quiz questions
const ques = [
  {
    question: "It is quite hard to remember everything that is taught during a lecture. What does 'retain' most nearly mean?",
    options: ["keep", "recall", "preserve", "conserve"],

    topic: "varc",
    subtopic: "synonym"
  },
  {
    question: "The life of the renowned artist was marked by constant ups and downs. What does 'vicissitudes' mean?",
    options: ["sorrows", "misfortunes", "changes", "surprises"],

    topic: "varc",
    subtopic: "synonym"
  },
  {
    question: "She possesses an endless passion for music. What is the closest meaning of 'insatiable'?",
    options: ["unsatisfiable", "unchanging", "irreconcilable", "undesirable"],

    topic: "varc",
    subtopic: "synonym"
  },
  {
    question: "The dancer amazed the audience with his agile and swift movements. What does 'nimble' imply?",
    options: ["unrhythmic", "lively", "quickening", "clear"],

    topic: "varc",
    subtopic: "synonym"
  },
];



export default function QuizPage() {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(Array(ques.length).fill(null)); //initially ans are null
  //future feature: add a feature to mark a question for review later, so we can store the index of those questions in an array and show them in the result page
  //const [markedForReview, setMarkedForReview] = useState<number[]>([]); //stores question index which is marked for review
  const router = useRouter();
  const isAttempted = (index: number) => userAnswers[index] !== null;
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    // Fetch quiz data using quizId from params
    // const { quizId } = useParams();
    // console.log("Quiz ID from params:", quizId);
    // Here you would typically fetch the quiz questions and other relevant data using the quizId
    console.log("Quiz data fetched for quiz ID: 1234");
  }, []);

  function handleSubmit() {
    setConfirmVisible(true);
  }

  const handleOptionClick = (option: string) => {

    const newAnswers = [...userAnswers];
    newAnswers[selectedQuestion] = option;
    setUserAnswers(newAnswers);

  };

  const currentQuestion = ques[selectedQuestion];

  return (
    <div className="min-h-screen bg-background  text-foreground p-6 flex flex-col items-center">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold ">Quiz ID: {1234}</h1>
        <p >Attempted: {userAnswers.filter((v): v is string => !!v).length}/{ques.length}</p>
      </header>

      {/* Grid Container for question menu and submit button */}
      <div className="flex w-full gap-4 mb-6 items-center ">
        {/* Question buttons container */}
        <div
          className="flex flex-1 overflow-x-auto no-scrollbar py-2 px-1 "
          style={{ display: "flex", gap: "0.5rem", flexWrap: "nowrap" }}
        >
          {ques.map((_, index) => {
            const isActive = selectedQuestion === index;
            const isDone = isAttempted(index);
            return (
              <button
                key={index}
                onClick={() => setSelectedQuestion(index)}
                className={`w-10 shrink-0 h-10 rounded-full border-2 flex items-center justify-center font-medium
                ${isActive ? 'bg-accent text-background border-accent' : ''}
                ${!isActive && isDone ? ' border-green-500 text-green-400' : ''}
                ${!isActive && !isDone ? 'border-foreground text-foreground' : ''}
                hover:bg-accent hover:cursor-pointer hover:text-background transition`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Submit button container */}
        <div className="col-span-1 flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent/70 disabled:opacity-50 transition max-w-full"
          >
            Submit
          </button>
        </div>
      </div>

      <QuestionCard
        question={currentQuestion.question}
        options={currentQuestion.options}
        userAnswer={userAnswers[selectedQuestion]}
        onOptionSelect={handleOptionClick}
      />

      {/* Navigation Buttons */}
      <div className="flex justify-between w-full  mt-6 gap-3">
        <button
          disabled={selectedQuestion === 0}
          onClick={() => setSelectedQuestion(selectedQuestion - 1)}
          className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/70 disabled:opacity-50 transition"
        >
          Previous
        </button>
        <button
          disabled={selectedQuestion === ques.length - 1}
          onClick={() => setSelectedQuestion(selectedQuestion + 1)}
          className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/70 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>

      {confirmVisible && (
        <ConfirmBox
          message="Are you sure?"
          onConfirm={() => router.push(`/quiz/${1234}/result`)}
          onCancel={() => setConfirmVisible(false)}
        />
      )}
    </div>
  );
}

