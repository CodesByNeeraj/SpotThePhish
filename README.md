# SpotThePhish
Automated Phishing Simulation Platform Using AI Agents

## Table of Contents

1. [What is SpotThePhish?](#what-is-spotthephish)
2. [Try out SpotThePhish](#try-out-spotthephish)
3. [Product Walkthrough](#product-walkthrough)
4. [System Architecture Diagram](#system-architecture-diagram)
5. [Security & Guardrails](#security--guardrails)
6. [Tech Stack Used](#tech-stack-used)
7. [Key Decisions Made](#key-decisions-made)

## What is SpotThePhish?

SpotThePhish is a phishing awareness training platform. The user picks a type of phishing attack, such as a package delivery scam or an account suspension threat, and the platform generates a realistic (but harmless) phishing email based on research from trusted security websites.

The user then tries to spot the red flags in the email. An AI agent guides the conversation: it probes the user with hints until they have found the main warning signs, then gives them a short quiz to test what they learned. When the quiz is submitted, the agent explains the correct answers and gives feedback.

## Try out SpotThePhish

SpotThePhish is live at **[spotthephish-platform.up.railway.app](https://spotthephish-platform.up.railway.app/)**. Choose a category, click "Generate phishing email" and start spotting signs of phishing.

### Run it locally

You need Python 3, Node.js and an OpenAI API key.

1. Create a file named `backend/.env` and add your key. See `backend/.env.example` for the format.

   ```
   OPENAI_API_KEY=your-key-here
   ```

2. Start the backend. In terminal 1, from the `backend/` folder:

   ```
   pip install -r ../requirements.txt
   uvicorn main:app --reload
   ```

3. Start the frontend. In terminal 2, from the `frontend/` folder:

   ```
   npm install
   npm run dev
   ```

4. Open the address that Vite prints (usually `http://localhost:5173`). In development, the frontend sends its `/api` requests to the backend on port 8000.

Note: sessions are kept in memory, so restarting the backend (including the automatic restart from `--reload`) ends all active sessions.

## Product Walkthrough

1. Platform home page.

   ![Platform home page](gallery/spotthephishhomepage.png)

2. Users select a common phishing technique to practice, such as Package Delivery, Prize or Gift Card, or Account Suspension.

   ![Selecting a phishing category](gallery/selectoptionswhatthephish.png)

3. While the AI agents work in the background, the user sees a tip about a security best practice. This keeps the wait useful and improves the user experience.

   ![Security tip shown while the agents are working](gallery/thinkingstepshowingtip.png)

4. A sample phishing email is shown, and the user is asked to identify the phishing patterns and tactics in it.

   ![Generated phishing email](gallery/emailgenerated.png)

5. The agent probes the user until they have identified all the main tactics used in the email.

   ![Agent probing the user](gallery/agentprobinguser.png)

6. Once the user has spotted the red flags, a quiz is shown. It lets the user put what they learned about spotting phishing patterns to the test.

   ![Quiz, part 1](gallery/quizshowntouserafteruserspotsredflags.png)
   ![Quiz, part 2](gallery/quizpart2.png)

7. A prompt injection attempt is caught and rejected by the system.

   ![Prompt injection attempt rejected](gallery/promptinjectiononchat.png)

8. Off-topic conversation that is unrelated to phishing awareness training is not answered.

   ![Off-topic message rejected](gallery/offtopicchat.png)

## System Architecture Diagram

![System architecture diagram](gallery/sysarchdiag.png)

## Security & Guardrails

### Input Guardrails

Both guardrails run on the user's latest message before the orchestrator agent sees it. If either one trips, the message is rejected and the user gets a fixed reply.

1. Prompt Injection Guardrail

   A list of common injection phrases is checked against the user's message. This check is plain code with no model involved, so it is fast and deterministic. Its limit is coverage: it only catches the phrasings on the list.

   ![Prompt injection guardrail code](gallery/inputguardrailcode.png)

   Example: an attempted prompt injection to retrieve the system prompt is rejected.

   ![Prompt injection attempt rejected in the chat](gallery/promptinjectiononchat.png)

   The trace shows the guardrail tripping before any agent runs.

   ![Trace of the prompt injection guardrail](gallery/promptinjectionguardrailtrace.png)

2. Off-topic Guardrail

   An LLM checks whether the user's message is grounded in the purpose of the platform. It also catches injection attempts that the pattern list misses. Because this guardrail is itself a model reading user text, it narrows the risk but cannot remove it. It is limited to a yes/no output (in itself a guardrail) and is told to treat the message strictly as data to classify.

   ![Off-topic guardrail agent code](gallery/offtopicguardrailagentcode.png)

   Example: a message unrelated to phishing awareness is rejected.

   ![Off-topic message rejected in the chat](gallery/offtopicchat.png)

   The trace shows the off-topic guardrail agent running and flagging the message.

   ![Trace of the off-topic guardrail](gallery/offtopicguardrailtrace.png)

### Tool Call Security

The web search tool is restricted to an allowlist of trusted domains, which prevents the agent from reading malicious websites.

## Tech Stack Used

- **Backend:** Python, FastAPI, OpenAI Agents SDK, Pydantic
- **Frontend:** React, Vite, Tailwind CSS, three.js (animated ocean and navbar), react-markdown

## Key Decisions Made

1. **Multi-agent architecture**

   A single agent with a huge prompt would bloat the context and be harder to maintain. Splitting the work follows the software principle of separation of concerns: each agent has one specialised role (email creation, quiz creation, quiz feedback, conversation).

2. **Agents as tools, with one agent handling the conversation**

   One orchestrator agent owns the conversation with the user, combines the outputs of the specialist agents and enforces the guardrails in one place. It is also smart enough to decide when a specialist is needed and when it is not.

   ![Orchestrator deciding not to call a tool](gallery/agentracesmartenoughtopicknotool.png)

3. **Choosing the OpenAI Agents SDK**

   The SDK has clear documentation, useful built-in features and built-in tracing.

   - **Custom output extractor:** when the quiz agent runs as a tool, an extractor saves the full quiz (with answers) in a server-side context and returns only the questions and options to the orchestrator. The feedback agent reads the full quiz from that context. The orchestrator only sees the answers after the user submits, when it relays the feedback.

     ![Custom output extractor code](gallery/customoutputextractor.png)

   - **Tracing:** tracing helps with debugging and with checking that outputs match expectations. For example, the web search tool initially failed because the domains I gave were not in the format the API expects (bare hostnames, not full URLs). I found this by looking at the trace.

     ![Trace that helped debug the web search failure](gallery/tracinghelpeddebug.png)
