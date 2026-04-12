'use client';

type Props = {
  currentIndex: number;
  totalQuestions: number;
  onNavigate: (index: number) => void;
  attemptedQuestions: Set<number>;
  sendingOption: boolean,
};

export default function QuestionNavigator({
  currentIndex,
  totalQuestions,
  onNavigate,
  attemptedQuestions,
  sendingOption
}: Props) {

  function handleFetchQuestion(index: number) {
    if (index < 0 || index >= totalQuestions) return;
    onNavigate(index); // 
  }

  const navButtonBase =
    "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition";

  const interactionStyles = sendingOption
    ? "cursor-not-allowed opacity-50"
    : "cursor-pointer";

  return (

    <aside className="rounded-2xl border border-foreground/10 bg-white/5 p-4 shadow-sm">


      <p className="mb-3 text-sm font-semibold text-foreground/80">
        Question Navigator
      </p>

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isActive = index === currentIndex;
          const isDone = attemptedQuestions.has(index);

          let buttonClass = `${navButtonBase} border-foreground/15 bg-background/60 text-foreground/70 ${interactionStyles} ${!sendingOption ? "hover:border-accent hover:text-accent" : ""}`;


          if (isActive) {
            buttonClass = `${navButtonBase} border-accent bg-accent text-background ${interactionStyles} ${!sendingOption ? "hover:bg-accent hover:text-background" : ""}`;
          } else if (isDone) {
            buttonClass = `${navButtonBase} border-green-500/40 bg-green-500/10 text-green-300 ${interactionStyles} ${!sendingOption ? "hover:border-green-400 hover:bg-green-500/20 hover:text-green-200" : ""}`;
          }

          return (
            <button
              key={index}
              disabled={sendingOption}
              onClick={() => handleFetchQuestion(index)}
              className={buttonClass}
            >
              {isActive && sendingOption ? "..." : index + 1}
            </button>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          disabled={currentIndex === 0 || sendingOption}
          onClick={() => handleFetchQuestion(currentIndex - 1)}
          className={`rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium text-foreground transition sm:text-sm
            ${sendingOption
              ? "cursor-not-allowed opacity-50"
              : "hover:border-accent hover:text-accent cursor-pointer"
            }`}
        >
          Previous
        </button>

        <button
          disabled={currentIndex === totalQuestions - 1 || sendingOption}
          onClick={() => handleFetchQuestion(currentIndex + 1)}
          className={`rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium text-foreground transition sm:text-sm
            ${sendingOption
              ? "cursor-not-allowed opacity-50"
              : "hover:border-accent hover:text-accent cursor-pointer"
            }`}
        >
          Next
        </button>
      </div>
    </aside>
  );
}