async function request(path, options) {
  const res = await fetch(`/api${path}`, options);
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
