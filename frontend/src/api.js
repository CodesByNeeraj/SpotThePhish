// In dev, /api is proxied to the backend. In production, VITE_API_URL is the backend's URL.
const API = import.meta.env.VITE_API_URL ?? "/api";

async function request(path, options) {
  const res = await fetch(`${API}${path}`, options);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function post(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const getCategories = () => request("/categories");

// Starting a session with a category makes the backend generate a new email.
export const startSession = (sessionId, category) =>
  post("/chat", { session_id: sessionId, category });

export const sendMessage = (sessionId, message) =>
  post("/chat", { session_id: sessionId, message });
