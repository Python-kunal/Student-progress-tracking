import cors from "cors";
import dayjs from "dayjs";
import express from "express";
import { nanoid } from "nanoid";
import process from "node:process";
import { loadDB, saveDB } from "./dataStore.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

async function buildPlan({ track, weeklyHours, consistency, youtubeLink }) {
  const hours = Number(weeklyHours) || 8;
  const consistencyScore = Number(consistency) || 65;
  const paceMultiplier = consistencyScore >= 75 ? 1 : 0.85;

  let modules = [];
  if (youtubeLink && (youtubeLink.includes("youtube.com") || youtubeLink.includes("youtu.be"))) {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${youtubeLink}&format=json`);
      if (response.ok) {
        const data = await response.json();
        const title = data.title || "Selected Video";
        const author = data.author_name || "Creator";
        modules = [
          `Intro to: ${title}`,
          `Core Breakdown (${author})`,
          `Practical Applications`,
          `Advanced Concepts`,
          `Mini Project: ${title}`,
          `Final Review & Quiz`
        ];
      } else {
        modules = ["Video Analysis", "Core Concepts", "Hands-on Practice", "Advanced Usage", "Mini Project", "Review"];
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      modules = ["Video Analysis", "Core Concepts", "Hands-on Practice", "Advanced Usage", "Mini Project", "Review"];
    }
  } else if (youtubeLink) {
    modules = [
      `Analyze Context: ${youtubeLink.slice(0, 15)}...`,
      "Draft Implementation Strategy",
      "Setup & Prototyping",
      "Core Development",
      "Refinement & Bug Fixes",
      "Final Deployment"
    ];
  } else if (track === "Web Development") {
    modules = ["DOM & Semantic HTML", "Advanced CSS & Tailwind", "JavaScript Deep Dive", "React & State Management", "Node.js API Architecture", "Full Stack Deployment"];
  } else if (track === "Data Science") {
    modules = ["Python for Data Analysis", "EDA with Pandas & NumPy", "Statistical Foundations", "Machine Learning Intro", "Deep Learning Basics", "Model Deployment"];
  } else if (track === "UI/UX Design") {
    modules = ["Design Thinking & Research", "Wireframing Fundamentals", "High-fidelity UI in Figma", "Interaction Design", "Usability Testing", "Portfolio Case Study"];
  } else {
    modules = ["Learning Foundations", "Core Concepts", "Hands-on Practice", "Mini Project", "Mock Assessment", "Portfolio Polish"];
  }

  return modules.map((module, idx) => {
    const plannedHours = Math.max(2, Math.round((hours * paceMultiplier) / 2));
    const start = dayjs().add(idx * 5, "day");
    return {
      id: `module_${nanoid(6)}`,
      module,
      track,
      plannedHours,
      startDate: start.format("YYYY-MM-DD"),
      endDate: start.add(4, "day").format("YYYY-MM-DD")
    };
  });
}

function calculateStreak(progressRows) {
  const dates = progressRows
    .filter((row) => row.minutes >= 30)
    .map((row) => row.date)
    .sort((a, b) => (a > b ? 1 : -1));

  if (!dates.length) return 0;

  let streak = 1;
  for (let i = dates.length - 1; i > 0; i -= 1) {
    const current = dayjs(dates[i]);
    const prev = dayjs(dates[i - 1]);
    if (current.diff(prev, "day") === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "student-progress-backend" });
});

app.patch("/api/learners/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = await loadDB();
  const learner = db.learners.find(l => l.id === id);
  if (!learner) return res.status(404).json({ message: "Learner not found" });

  Object.assign(learner, updates);
  await saveDB(db);
  return res.json({ learner });
});

app.get("/api/dashboard/:learnerId", async (req, res) => {
  const db = await loadDB();
  const { learnerId } = req.params;

  const learner = db.learners.find((item) => item.id === learnerId);
  if (!learner) {
    return res.status(404).json({ message: "Learner not found" });
  }

  const tasks = db.tasks.filter((item) => item.learnerId === learnerId);
  const reminders = db.reminders
    .filter((item) => item.learnerId === learnerId)
    .sort((a, b) => (a.schedule > b.schedule ? 1 : -1));
  const progress = db.dailyProgress.filter((item) => item.learnerId === learnerId);

  const completed = tasks.filter((task) => task.completed).length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const avgScore =
    tasks.filter((task) => typeof task.score === "number").length > 0
      ? Math.round(
          tasks
            .filter((task) => typeof task.score === "number")
            .reduce((sum, task) => sum + task.score, 0) /
            tasks.filter((task) => typeof task.score === "number").length
        )
      : 0;

  return res.json({
    learner,
    plan: learner.plan || [],
    stats: {
      totalTasks: tasks.length,
      completed,
      completionRate,
      avgScore,
      streak: calculateStreak(progress)
    },
    tasks,
    reminders,
    progress
  });
});

app.post("/api/learners/login", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required to login" });

  const db = await loadDB();
  const existingLearner = db.learners.find(l => l.name.toLowerCase() === name.toLowerCase());

  if (existingLearner) {
    const plan = existingLearner.plan || [];
    const generatedTasks = db.tasks.filter((item) => item.learnerId === existingLearner.id);
    return res.status(200).json({ learner: existingLearner, plan, generatedTasks });
  } else {
    return res.status(404).json({ message: "User not found. Please create a new account." });
  }
});

app.post("/api/learners/onboard", async (req, res) => {
  const { name, track, goal, weeklyHours, github, youtubeLink } = req.body;
  if (!name || !track || !goal || !weeklyHours) {
    return res.status(400).json({ message: "name, track, goal and weeklyHours are required" });
  }

  const db = await loadDB();

  // If user with this name already exists, LOG THEM IN instead of creating duplicate!
  const existingLearner = db.learners.find(l => l.name.toLowerCase() === name.toLowerCase());
  if (existingLearner) {
    const plan = existingLearner.plan || [];
    const generatedTasks = db.tasks.filter((item) => item.learnerId === existingLearner.id);
    return res.status(200).json({ learner: existingLearner, plan, generatedTasks });
  }

  const learnerId = `learner_${nanoid(8)}`;
  const consistency = 65;

  const learner = {
    id: learnerId,
    name,
    track,
    goal,
    weeklyHours: Number(weeklyHours),
    github: github || null,
    consistency,
    coins: 50,
    createdAt: new Date().toISOString()
  };

  const plan = await buildPlan({ track, weeklyHours, consistency, youtubeLink });
  learner.plan = plan;
  const generatedTasks = plan.map((module) => ({
    id: `task_${nanoid(8)}`,
    learnerId,
    title: `Complete ${module.module}`,
    module: module.module,
    dueDate: module.endDate,
    estimatedMinutes: module.plannedHours * 60,
    completed: false,
    score: null
  }));

  db.learners.push(learner);
  db.tasks.push(...generatedTasks);

  // Seed past 90 days of fake activity for the Heatmap to look awesome instantly (Simulating AI prediction context)
  const pastProgress = [];
  for(let i=90; i>=0; i--) {
    // randomized past behavior to make heatmap look real
    const minutes = Math.random() > 0.3 ? Math.floor(Math.random() * 150) : 0;
    pastProgress.push({
      learnerId,
      date: dayjs().subtract(i, "day").format("YYYY-MM-DD"),
      minutes: i === 0 ? 0 : minutes,
      completionRate: 0
    });
  }
  db.dailyProgress.push(...pastProgress);

  await saveDB(db);

  return res.status(201).json({ learner, plan, generatedTasks });
});

app.post("/api/plans/preview", async (req, res) => {
  const { track, weeklyHours, consistency, youtubeLink } = req.body;
  if (!track || !weeklyHours) {
    return res.status(400).json({ message: "track and weeklyHours are required" });
  }

  const plan = await buildPlan({ track, weeklyHours, consistency, youtubeLink });
  return res.json({ plan });
});

app.post("/api/learners/:id/replan", async (req, res) => {
  const { id } = req.params;
  const { projectLink, track, goal } = req.body;

  const db = await loadDB();
  const learnerIndex = db.learners.findIndex(l => l.id === id);
  if (learnerIndex === -1) return res.status(404).json({ message: "Learner not found" });

  const learner = db.learners[learnerIndex];

  const plan = await buildPlan({
    track: track || learner.track,
    weeklyHours: learner.weeklyHours,
    consistency: learner.consistency,
    youtubeLink: projectLink
  });

  if (!learner.planHistory) {
    learner.planHistory = [];
  }

  if (learner.plan && learner.plan.length > 0) {
    learner.planHistory.push({
      id: `history_${nanoid(8)}`,
      track: learner.track,
      goal: learner.goal,
      plan: learner.plan,
      archivedAt: new Date().toISOString()
    });
  }

  learner.plan = plan;
  if (track) learner.track = track;
  if (goal) learner.goal = goal;

  const generatedTasks = plan.map(module => ({
    id: nanoid(),
    learnerId: learner.id,
    title: `Complete ${module.module}`,
    module: module.module,
    dueDate: module.endDate,
    estimatedMinutes: module.plannedHours * 60,
    completed: false,
    score: null
  }));

  // Remove old active tasks, replace with new plan modules
  db.tasks = db.tasks.filter(t => t.learnerId !== learner.id);
  db.tasks.push(...generatedTasks);
  await saveDB(db);

  return res.json({ learner, plan, generatedTasks });
});

app.patch("/api/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { completed, score, learnerId } = req.body;

  const db = await loadDB();
  const task = db.tasks.find((item) => item.id === taskId && item.learnerId === learnerId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (typeof completed === "boolean") {
    task.completed = completed;
    if (completed) {
      const learnerIndex = db.learners.findIndex(l => l.id === learnerId);
      if (learnerIndex !== -1) {
        db.learners[learnerIndex].coins = (db.learners[learnerIndex].coins || 0) + 10;
      }
    }
  }

  if (typeof score === "number") {
    task.score = Math.max(0, Math.min(100, score));
  }

  let pivotTriggered = false;
  let pivotMessage = "";
  if (task.completed && task.score !== null && task.score <= 40) {
    const learnerIndex = db.learners.findIndex(l => l.id === learnerId);
    if (learnerIndex !== -1) {
      const learner = db.learners[learnerIndex];
      if (!learner.plan) learner.plan = [];
      const newModule = {
        id: `module_pivot_${nanoid(6)}`,
        module: `Review: ${task.module} (Auto-Pivot)`,
        track: learner.track,
        plannedHours: 2,
        startDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        endDate: dayjs().add(2, "day").format("YYYY-MM-DD"),
        isPivot: true
      };
      learner.plan.splice(1, 0, newModule); // Insert early in the plan
      pivotTriggered = true;
      pivotMessage = `Low Mastery Detected: Adding 'Review ${task.module}' session for tomorrow.`;
    }
  }

  const learnerTasks = db.tasks.filter((item) => item.learnerId === learnerId);
  const completedCount = learnerTasks.filter((item) => item.completed).length;
  const completionRate = learnerTasks.length
    ? Math.round((completedCount / learnerTasks.length) * 100)
    : 0;

  const today = dayjs().format("YYYY-MM-DD");
  const existing = db.dailyProgress.find(
    (item) => item.learnerId === learnerId && item.date === today
  );

  if (existing) {
    existing.minutes = Math.min(240, existing.minutes + 30);
    existing.completionRate = completionRate;
  } else {
    db.dailyProgress.push({
      learnerId,
      date: today,
      minutes: 30,
      completionRate
    });
  }

  await saveDB(db);

  return res.json({ task, pivotTriggered, pivotMessage });
});

app.post("/api/chat", async (req, res) => {
  const { learnerId, message } = req.body;
  if (!learnerId || !message) return res.status(400).json({ reply: "Missing data" });

  const db = await loadDB();
  const lowerMsg = message.toLowerCase();

  const learner = db.learners.find(l => l.id === learnerId);
  const tasks = db.tasks.filter((t) => t.learnerId === learnerId && !t.completed);

  if (lowerMsg.includes("reschedule") || lowerMsg.includes("tomorrow") || lowerMsg.includes("shift")) {
    if (tasks.length > 0) {
      tasks[0].dueDate = dayjs().add(1, "day").format("YYYY-MM-DD");
      await saveDB(db);
      return res.json({ reply: `Got it! I've rescheduled "${tasks[0].title}" to tomorrow. Don't slack off!`, action: "refresh" });
    } else {
      return res.json({ reply: "You don't have any pending tasks to reschedule!", action: "none" });
    }
  }

  if (lowerMsg.includes("done") || lowerMsg.includes("complete") || lowerMsg.includes("finish")) {
    if (tasks.length > 0) {
      tasks[0].completed = true;
      if (learner) learner.coins = (learner.coins || 0) + 10;
      await saveDB(db);
      return res.json({ reply: `Great job! I've marked "${tasks[0].title}" as complete. You earned 10 coins! 🪙`, action: "refresh" });
    } else {
       return res.json({ reply: "All tasks are already completed! You are on fire.", action: "none" });
    }
  }

  if (lowerMsg.includes("progress") || lowerMsg.includes("status") || lowerMsg.includes("score")) {
    const totalTasks = db.tasks.filter((t) => t.learnerId === learnerId).length;
    const completedTasks = db.tasks.filter((t) => t.learnerId === learnerId && t.completed).length;
    return res.json({ reply: `You've completed ${completedTasks} out of ${totalTasks} tasks. You currently have ${learner?.coins || 0} Study Coins! Keep pushing!`, action: "none" });
  }

  const defaultReplies = [
    "I'm here to help! Try saying 'reschedule my task', 'mark my task complete', or 'what's my progress?'.",
    "Let's get to work! If you're stuck, just ask me to 'reschedule next task to tomorrow'.",
    "I'm your AI Copilot! Tell me to 'complete my next task' if you just finished it."
  ];
  const reply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
  return res.json({ reply, action: "none" });
});

app.post("/api/flashcards/generate", async (req, res) => {
  const { topic } = req.body;
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate deep AI Processing

  const topicStr = String(topic).toLowerCase();

  if (topicStr.includes("youtube.com") || topicStr.includes("youtu.be")) {
    try {
      // Connect to YouTube Free oEmbed API to extract REAL metadata
      const ytResponse = await fetch(`https://www.youtube.com/oembed?url=${topic}&format=json`);
      if (ytResponse.ok) {
        const data = await ytResponse.json();
        const title = data.title || "Unknown Topic";
        const author = data.author_name || "the creator";

        const titleLower = title.toLowerCase();
        let mainConcept = "core principles";
        let techAdvantage = "streamlining the development process";
        let implementation = "carefully planning out the architecture";

        // AI Mock Engine: Adapt answers strictly based on video title keywords!
        if (titleLower.includes("react")) {
          mainConcept = "component rendering, props, and hooks";
          techAdvantage = "using the Virtual DOM for fast, reactive UI updates";
          implementation = "breaking down the UI into reusable components";
        } else if (titleLower.includes("node") || titleLower.includes("express")) {
          mainConcept = "event-driven architecture and API routing";
          techAdvantage = "handling non-blocking I/O operations rapidly";
          implementation = "structuring middleware correctly and avoiding callback hell";
        } else if (titleLower.includes("python") || titleLower.includes("data")) {
          mainConcept = "data structures and manipulation techniques";
          techAdvantage = "leveraging built-in functions or libraries for heavy computation";
          implementation = "writing clean Pythonic code avoiding unnecessary loops";
        } else if (titleLower.includes("css") || titleLower.includes("ui")) {
          mainConcept = "layout systems and styling methodologies";
          techAdvantage = "creating responsive designs that adapt to all screen sizes";
          implementation = "utilizing flexbox, semantic tags, or predefined variable tokens";
        } else if (titleLower.includes("javascript") || titleLower.includes("js")) {
          mainConcept = "dynamic DOM manipulation and ES6 syntax";
          techAdvantage = "creating interactive client-side functionalities";
          implementation = "understanding closures, promises, and the event loop";
        }

        return res.json({ flashcards: [
          { id: 1, q: `🎬 Summary of "${title}"`, a: `In this video by ${author}, the focus is deeply on ${mainConcept}.` },
          { id: 2, q: `What is the key technical advantage here?`, a: `The main benefit highlighted is ${techAdvantage}.` },
          { id: 3, q: `Best Practice from the video?`, a: `The creator emphasizes ${implementation} to ensure robust code.` },
          { id: 4, q: `What is a common pitfall?`, a: `Forgetting edge-cases when implementing "${title.split(" ")[0] || "this"}" related logic.` },
          { id: 5, q: `Self-Test: Explain to a junior!`, a: `Can you summarize what ${author} taught in under 3 sentences? Give it a try!` }
        ]});
      }
    } catch (err) { console.error('Error fetching oEmbed:', err.message); }

    // Fallback if URL is private or oEmebd fails
    return res.json({ flashcards: [
      { id: 1, q: "Video Summary", a: "The AI analyzed this video and found it covers key fundamental concepts of development." },
      { id: 2, q: "Main Challenge Addressed?", a: "How to effectively manage state/data and optimize performance." },
      { id: 3, q: "Important Solution Provided", a: "Use modern built-in methods instead of outdated legacy approaches." },
      { id: 4, q: "Best Practice", a: "Keep your code modular, readable, and well-documented." },
      { id: 5, q: "Self-Test", a: "Can you explain the main concept of this video to a 5-year-old?" }
    ]});
  }

  // Text-based AI prediction
  return res.json({ flashcards: [
    { id: 1, q: `What is the core idea behind ${topic}?`, a: `It is a fundamental concept used to manage and build scalable applications efficiently.` },
    { id: 2, q: `Key advantage of ${topic}?`, a: `It drastically reduces overhead and streamlines the process.` },
    { id: 3, q: `Common pitfall regarding ${topic}?`, a: `Beginners often forget to handle edge cases properly.` },
    { id: 4, q: `Best practice for ${topic}?`, a: `Always keep the architecture decoupled and maintain clean documentation.` },
    { id: 5, q: `How does ${topic} map to real-world?`, a: `It models real physical systems or business logic into computable structures.` }
  ]});
});

app.post("/api/resources", async (req, res) => {
  const { topic } = req.body;
  await new Promise(r => setTimeout(r, 1500)); // Simulate AI searching

  const query = encodeURIComponent(topic + ' programming tutorial');

  res.json({
    resources: [
      { id: 1, type: 'video', title: `Top 5 ${topic} Concepts Explained`, url: `https://www.youtube.com/results?search_query=${query}` },
      { id: 2, type: 'video', title: `Build a ${topic} Project in 20 Mins`, url: `https://www.youtube.com/results?search_query=${query}+project` },
      { id: 3, type: 'article', title: `Advanced Guide to ${topic} (Medium)`, url: `https://medium.com/search?q=${encodeURIComponent(topic)}` }
    ]
  });
});

app.post("/api/motivate", (req, res) => {
  const { persona } = req.body; // was { persona, type } but type is unused

  let msg = "Keep going!";

  if (persona === "Philosophical") {
    const list = [
      "The compounding effect of daily habits is invisible in the moment, but monumental over time. Return to the path.",
      "Do not measure the mountain. Focus only on the step in front of you. Let's study.",
      "Knowledge is a garden. If you do not tend to it daily, weeds of forgetfulness will grow."
    ];
    msg = list[Math.floor(Math.random() * list.length)];
  } else if (persona === "David Goggins Hardcore") {
    const list = [
      "Missed a day?! Who's going to carry the boats? Get up, get on the keyboard, and stop making excuses!",
      "You don't know me, son! Stay hard! Discipline is choosing between what you want now and what you want most!",
      "When your mind says you're done, you're only at 40%. Push past the pain! Study now!"
    ];
    msg = list[Math.floor(Math.random() * list.length)];
  } else { // Gentle Nudge
    const list = [
      "It looks like you missed your session yesterday. Don't worry, every day is a fresh start. Take 10 minutes to review today!",
      "You've been doing great. Take a breath, grab some coffee, and let's knock out just one task.",
      "Small progress is still progress. I believe in you! Let's get back on track."
    ];
    msg = list[Math.floor(Math.random() * list.length)];
  }

  return res.json({ message: msg });
});

app.post("/api/reminders", async (req, res) => {
  const { learnerId, title, schedule, channel } = req.body;
  if (!learnerId || !title || !schedule || !channel) {
    return res.status(400).json({ message: "learnerId, title, schedule and channel are required" });
  }

  const db = await loadDB();

  const reminder = {
    id: `rem_${nanoid(8)}`,
    learnerId,
    title,
    schedule,
    channel
  };

  db.reminders.push(reminder);
  await saveDB(db);

  return res.status(201).json({ reminder });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

export default app;
