export type QuizFinalizeReason = "submitted" | "timeout" | "violation";

export type QuestionContentBlock = {
  type: string;
  value: string;
};

export type QuizOptionItem = {
  value: string;
  text: string;
  blocks: QuestionContentBlock[];
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  topic?: string;
  subtopic?: string;
};

export type StoredQuizSession = {
  sessionId?: string;
  totalQuestions: QuizQuestion[];
  duration?: Record<string, number>;
};

export type QuizResultSession = {
  quizId: string;
  sessionId?: string;
  questions: QuizQuestion[];
  answers: Array<string | null>;
  meta?: {
    reason?: QuizFinalizeReason;
    violations?: number;
    totalQuestions?: number;
    attempted?: number;
  };
};

export type GenerateQuizResponse = {
  success: boolean;
  quizId?: string;
  sessionId?: string;
  questions?: QuizQuestion[];
  error?: string;
};

export type QuestionResponse = {
  success: boolean;
  question?: {
    title: string;
    titleBlocks?: QuestionContentBlock[];
    options: QuizOptionItem[];

  };
  currentIndex: number;
  totalQuestions: number;
  remainingTime?: number;
  selected_option?: string | null;
  attemptedIndices?:number[];
  error?: string;
};

export type QuestionOptionResponse = QuestionResponse & { selected_option: string | null }

export type PutOptionResponse = {
  success: boolean;
  data?: number;
  remainingTime?: number;
  error?: string;
}

// export type startSession = {
//   success:
//   quiz,
//   session,
//   totalQuestions,
//   remainingTime

// }
