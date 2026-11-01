import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import QuizCard from "./QuizCard.jsx";
import Thinking from "./Thinking.jsx";

function Message({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className="max-w-[85%] whitespace-pre-wrap rounded-ui bg-brand px-3 py-2 text-sm leading-6 text-white">
          {text}
        </div>
      ) : (
        <div className="markdown max-w-[85%] rounded-ui bg-surface px-3 py-2 text-sm leading-6 text-ink">
          {/* remarkBreaks keeps single line breaks, such as one quiz option per line */}
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>{text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({ messages, active, loading, tip, onSend }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const scrollRef = useRef(null);
  const quizRef = useRef(null);

  useEffect(() => {
    // A new quiz is scrolled to its top, so the user starts at question 1.
    // Everything else scrolls to the newest message.
    if (messages.at(-1)?.role === "quiz") {
      scrollRef.current.scrollTop = quizRef.current.offsetTop - 16;
    } else {
      endRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, loading]);

  function submit() {
    const text = draft.trim();
    if (!text || loading) return;
    setDraft("");
    onSend(text);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <section className="flex min-h-0 flex-col">
      <h2 className="mb-3 text-sm font-semibold text-ink">Conversation</h2>
      <div className="flex h-[38rem] flex-col rounded-ui border border-line">
        <div ref={scrollRef} className="relative flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {messages.length === 0 && !loading && (
            <p className="m-auto text-sm text-ink-subtle">
              The conversation starts after you generate an email.
            </p>
          )}
          {messages.map((m, i) =>
            m.role === "quiz" ? (
              <div key={i} ref={quizRef} className="shrink-0">
                <QuizCard quiz={m.quiz} loading={loading} onSubmit={onSend} />
              </div>
            ) : (
              <Message key={i} role={m.role} text={m.text} />
            )
          )}
          {loading && <Thinking tip={tip} />}
          <div ref={endRef} />
        </div>
        <div className="border-t border-line p-3">
          <label htmlFor="reply" className="sr-only">
            Your reply
          </label>
          <textarea
            id="reply"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!active}
            placeholder={active ? "Write your reply" : "Generate an email first"}
            className="w-full resize-none rounded-ui border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-brand disabled:bg-surface"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-ink-subtle">Enter to send, Shift+Enter for a new line</span>
            <button
              type="button"
              onClick={submit}
              disabled={!active || loading || !draft.trim()}
              className="h-8 rounded-ui bg-brand px-3 text-sm font-medium text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-subtle"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
