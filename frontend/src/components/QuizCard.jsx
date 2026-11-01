import { useState } from "react";

const letter = (index) => String.fromCharCode(65 + index);

export default function QuizCard({ quiz, loading, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const complete = quiz.questions.every((_, q) => answers[q] !== undefined);

  function submit() {
    const summary = quiz.questions.map((_, q) => `${q + 1}${letter(answers[q])}`).join(", ");
    setSubmitted(true);
    onSubmit(`My quiz answers: ${summary}`);
  }

  return (
    <div className="shrink-0 rounded-ui border border-line bg-white">
      <div className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">{quiz.quiz_title}</div>
      <ol className="divide-y divide-line">
        {quiz.questions.map((question, q) => (
          <li key={q} className="px-4 py-3">
            <fieldset disabled={submitted || loading}>
              <legend className="mb-2 text-sm leading-6 text-ink">
                <span className="font-semibold">{q + 1}.</span> {question.question}
              </legend>
              <div className="flex flex-col gap-1">
                {question.options.map((option, o) => (
                  <label
                    key={o}
                    className="flex cursor-pointer items-start gap-2 rounded-ui px-2 py-1.5 text-sm leading-6 text-ink hover:bg-surface has-[:checked]:bg-brand-subtle"
                  >
                    <input
                      type="radio"
                      name={`question-${q}`}
                      checked={answers[q] === o}
                      onChange={() => setAnswers({ ...answers, [q]: o })}
                      className="mt-1.5 accent-brand"
                    />
                    <span>
                      <span className="font-semibold">{letter(o)}.</span> {option}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="text-xs text-ink-subtle">
          {submitted ? "Answers submitted" : "Answer every question to submit"}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={!complete || submitted || loading}
          className="h-8 rounded-ui bg-brand px-3 text-sm font-medium text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-subtle"
        >
          Submit answers
        </button>
      </div>
    </div>
  );
}
