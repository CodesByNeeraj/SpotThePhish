import { useEffect, useRef, useState } from "react";
import { getCategories, sendMessage, startSession } from "./api";
import Header from "./components/Header.jsx";
import SessionBar from "./components/SessionBar.jsx";
import EmailPanel from "./components/EmailPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import Ocean from "./components/Ocean.jsx";
import { shuffled, tips } from "./tips";

export default function App() {
  const sessionId = useRef(crypto.randomUUID());
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [email, setEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const tipOrder = useRef(shuffled(tips));
  const tipsShown = useRef(0);
  const [tip, setTip] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError("Could not load categories. Is the backend running?"));
  }, []);

  // Runs a request, then shows the assistant's reply and the latest email.
  async function run(request) {
    // each wait shows the next tip, so a session does not repeat one until all have been seen
    setTip(tipOrder.current[tipsShown.current++ % tipOrder.current.length]);
    setLoading(true);
    setError("");
    try {
      const data = await request();
      setEmail(data.email);
      setMessages((prev) => {
        const next = [...prev, { role: "assistant", text: data.reply }];
        // the quiz joins the conversation once, right after the reply that introduces it
        if (data.quiz && !prev.some((m) => m.role === "quiz")) {
          next.push({ role: "quiz", quiz: data.quiz });
        }
        return next;
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function generate() {
    setEmail(null);
    setMessages([]);
    setActiveCategory(category);
    run(() => startSession(sessionId.current, category));
  }

  function send(text) {
    setMessages((prev) => [...prev, { role: "user", text }]);
    run(() => sendMessage(sessionId.current, text));
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <Header activeCategory={activeCategory} />

      <SessionBar
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        onGenerate={generate}
        loading={loading}
      />

      {error && (
        <div role="alert" className="mx-6 mt-4 rounded-ui bg-danger-subtle px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <main className="grid flex-1 gap-6 px-6 pb-6 pt-6 lg:grid-cols-2">
        <EmailPanel email={email} loading={loading && !email} />
        <ChatPanel
          messages={messages}
          active={messages.length > 0}
          loading={loading}
          tip={tip}
          onSend={send}
        />
      </main>

      <Ocean />
    </div>
  );
}
