# 🎓 StudyFlow - Student Progress Tracking System

A modern, AI-powered full-stack platform designed to solve student consistency challenges. Featuring dynamic personalized AI-driven study plans, flexible pivoting, gamification, and real-time analytics. Ideal for hackathons, StudyFlow makes complex learning tracks easy to manage and track!

## ✨ Key Features

- **Auth Modes (Login vs. Onboarding):** Lightning-fast dual mode onboarding. Returning users can jump back into their dashboard just by entering their exact previous name. New users get a full comprehensive onboarding flow!
- **AI-Powered Learning Blueprints:** Dynamically generates track-based study plans powered by external AI APIs. Choose from built-in tracks (Web Dev, Machine Learning, UI/UX, Cybersecurity, Cloud, etc.) or just type your **Custom** track.
- **Pivot/Replan Mechanism:** Fall behind or want to shift gears? The *Replan* feature cleanly wipes your current active tasks and generates a brand-new timeline using a custom instruction or a YouTube link, all without merging duplicate nodes!
- **Project Archives:** Automatically keeps a history of your past modules, tasks, and completion rates so no progress is ever lost.
- **Clean Slate Testing:** Highly customized for demos! Reload the page, and the session resets dynamically so you can demo multiple user journeys frictionlessly.
- **GitHub Sync & Gamification:** Connect your GitHub to see real-time repo activity and earn bonus study coins instantly. Live stats track Heatmaps, Streak points, and mastery scores.
- **AI Chatbot Motivator:** Offers direct guidance, gently roasts, pushes deadlines, or gives strict motivation based on your selected persona via a slick floating chat widget!

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
3. **Show Pivot:** Navigate to Pivot/Replan, drop a YouTube link, and watch it generate fresh tasks without carrying over the obsolete ones.
4. **Log completely out:** Refresh the page again.
5. **Quick Login:** Toggle to **Login**, enter User A's exact name, and show how easily returning users bypass the large form!
6. **Show Motivator & GitHub:** Open settings, paste a GitHub handle, claim coins. Chat with the AI Motivator widget for personalized help!

## 🛠️ Future Upgrades (Post-Hackathon)

- Porting Local \db.json\ to MongoDB / PostgreSQL via Prisma.
- Full OAuth 2.0 Integration (Google/GitHub/Discord login).
- Real web-sockets for live collaborative studying & leaderboards.
- Native mobile wrapper via React Native / Expo.
