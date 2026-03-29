# 🎓 StudyFlow - Student Progress Tracking System

A modern, AI-powered full-stack platform designed to solve student consistency challenges. Featuring dynamic personalized AI-driven study plans, flexible pivoting, gamification, and real-time analytics. Ideal for hackathons, StudyFlow makes complex learning tracks easy to manage and track!

## ✨ Key Features

- **Auth Modes (Login vs. Onboarding):** Lightning-fast dual mode onboarding. Returning users can jump back into their dashboard just by entering their exact previous name. New users get a full comprehensive onboarding flow!
- **AI-Powered Learning Blueprints:** Dynamically generates track-based study plans powered by external AI APIs. Choose from built-in tracks (Web Dev, Machine Learning, UI/UX, Cybersecurity, Cloud, etc.) or just type your **Custom** track.
- **"Flow State" Immersive Mode:** Cinematic, jet-black full-screen focus session. It hides the sidebar/nav, centers a glowing Pomodoro timer, isolates a single active task, and provides an integrated **"Play Lofi Beats"** audio player for deep, distraction-free work.
- **"Share to LinkedIn" (Proof of Work):** Hit 100% track completion to unlock a sleek celebration animation. Instantly generates and downloads a beautifully styled custom image card (via `html2canvas`) showcasing your streak, mastery, and "StudyFlow MVP" status to share on LinkedIn.
- **The "Panic Pivot" (AI Magic):** Overwhelmed? Just tell the AI Chatbot *"Bhai kuch samajh nahi aa raha, reset the plan to basics"*. The AI will automatically trigger the Pivot API, instantly wiping your stale tasks and cleanly regenerating a foundational track live on the dashboard!
- **Micro-Interactions & Sound Design:** Premium auditory feedback! Get a satisfying 'ding' when completing a task, and hear a premium coin drop sound when you successfully sync your GitHub commits.
- **Voice-Activated AI Motivator (TTS):** The AI Chatbot uses the Web Speech API to provide audio feedback and read messages aloud in different built-in personas (e.g., David Goggins mode).
- **Smart Study Material (Flashcards):** Generate quick flip-to-reveal micro-learning flashcards instantly from any topic or a YouTube link.
- **Contextual 1-Click Resource Fetching:** Smart task cards with a "Find Resources" button that instantly fetches relevant YouTube tutorials and articles for the active module.
- **Ghost Mode Leaderboard:** Compete against simulated "ghosts" of top learners in a live-updating gamified leaderboard.
- **Emotional Analytics (Heatmap):** A sleek, high-contrast GitHub-style consistency continuous heatmap to visually track daily study streaks.
- **Project Archives:** Automatically keeps a history of your past modules, tasks, and completion rates so no progress is ever lost.
- **Clean Slate Testing:** Highly customized for demos! Reload the page, and the session resets dynamically so you can demo multiple user journeys frictionlessly.
- **GitHub Sync & Gamification:** Connect your GitHub to see real-time repo activity and earn bonus study coins instantly. Live stats track Heatmaps, Streak points, and mastery scores.

## 💻 Tech Stack

- **Frontend:** React + Vite + Framer Motion + Recharts + React Markdown
- **Backend:** Node.js + Express + Google Gemini AI Setup
- **Architecture:** Lightweight file-based local JSON Database (\db.json\) ideal for rapid prototyping and completely independent of third-party DB setups.

## 🚀 How to Run Locally

### 1. Start Backend (Terminal 1)
\\\ash
cd backend
npm install
npm start  # Runs on http://localhost:4000
\\\
*(Ensure you have your .env ready with a \GEMINI_API_KEY\ if you're using the AI features!)*

### 2. Start Frontend (Terminal 2)
\\\ash
cd frontend
npm install
npm run dev
\\\
App will be accessible at \http://localhost:5173\

## 🔌 Core API Endpoints

- \POST /api/learners/login\ - **NEW!** Quick resume for returning users using Name verification.
- \POST /api/learners/onboard\ - Complete learner setup & new AI plan generation.
- \POST /api/learners/:id/replan\ - Pivot the current active plan safely to a new goal (cleans up old tasks magically!).
- \GET /api/dashboard/:id\ - Fetch live user profile and granular module stats.
- \PATCH /api/learners/:id\ - Partial account updates (Settings, GitHub handle).

## 🎮 Hackathon Demo Flow (Recommended)

1. **Start Fresh:** Simply reload the page. The app removes the stale state.
2. **Onboard User A:** Click "Sign Up", select the new **Custom** track option, and generate a course. Show the roadmap & tasks.
3. **Immersive "Flow State":** Click "Enter Flow State" to demonstrate the cinematic, distraction-free full-screen mode and toggle the embedded Lofi beats!
4. **The "Panic Pivot" (AI Magic Demo):** Open the chat widget and type: *"Bhai kuch samajh nahi aa raha, reset the plan to basics"*. Watch the AI automatically intercept the intent, trigger the Pivot API, and regenerate a new beginner-friendly plan on the fly!
5. **Micro-Interactions Demo:** Mark a task as complete to trigger the satisfying *ding* sound. Then, open settings, paste a GitHub handle, and sync activity to showcase the custom coin-drop sound effect.
6. **Share Milestone:** If time permits, mark tasks until reaching 100% completion to reveal the "Share Milestone" button, generating a downloadable PNG card for LinkedIn!
7. **Quick Resume Demo:** Reload the page to clear state, click **Login**, enter User A's exact name, and show the lightning-fast resume bypass flow!

## 🛠️ Future Upgrades (Post-Hackathon)

- Porting Local \db.json\ to MongoDB / PostgreSQL via Prisma.
- Full OAuth 2.0 Integration (Google/GitHub/Discord login).
- Real web-sockets for live collaborative studying & leaderboards.
- Native mobile wrapper via React Native / Expo.

