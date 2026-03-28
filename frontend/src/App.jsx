import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as Motion from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const api = axios.create({ baseURL: '/' });

const cardAnim = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

function StatCard({ label, value, accent, idx }) {
  return (
    <Motion.motion.article className='stat-card' custom={idx} variants={cardAnim} initial='hidden' animate='visible'>
      <span className='label'>{label}</span>
      <h3 style={{ color: accent }}>{value}</h3>
    </Motion.motion.article>
  );
}

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLearnerId, setActiveLearnerId] = useState(null);

  const [showOnboardModal, setShowOnboardModal] = useState(true);
  const [showReplanModal, setShowReplanModal] = useState(false);
  const [replanForm, setReplanForm] = useState({ track: 'Web Development', goal: '', projectLink: '' });

  const [onboardForm, setOnboardForm] = useState({ name: '', track: 'Web Development', goal: '', weeklyHours: 10, github: '', youtubeLink: '' });
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [planPreview, setPlanPreview] = useState([]);
  const [persona, setPersona] = useState('Gentle Nudge');
  const [toastMessage, setToastMessage] = useState(null);
  const [message, setMessage] = useState('');
  const [isFlowState, setIsFlowState] = useState(false);
  const [timer, setTimer] = useState(25 * 60);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFlashing, setIsFlashing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [githubData, setGithubData] = useState(null);

  // New Features State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: "Hey! I'm your AI Copilot. Need to review or reschedule a task?" }]);
  const [chatInput, setChatInput] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  useEffect(() => { let interval; if (isFlowState && timer > 0) { interval = setInterval(() => setTimer((t) => t - 1), 1000); } return () => clearInterval(interval); }, [isFlowState, timer]);

  function formatTime(seconds) { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; }

  async function fetchDashboard(learnerId) {
    if (!learnerId) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/dashboard/${learnerId}`);
      setDashboard(response.data);
      setPlanPreview(response.data.plan || []);
      sessionStorage.setItem('activeLearnerId', learnerId); // Using sessionStorage so refresh during a session might still keep it optionally, but we cleared state initialization so it is irrelevant, let's just remove it.
      setMessage('');
    } catch (err) {
      if (err.response?.status === 404) {

        setActiveLearnerId(null);
        setDashboard(null);
        setShowOnboardModal(true);
        setMessage('Learner profile not found. Please create a new plan.');
      } else {
        setMessage(err.response?.data?.message || 'Dashboard load failed');
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { if (activeLearnerId) fetchDashboard(activeLearnerId); }, [activeLearnerId]);

  const completionData = useMemo(() => {
    if (!dashboard?.progress) return [];
    return dashboard.progress.map((item) => ({ date: item.date.slice(5), consistency: item.completionRate, minutes: item.minutes }));
  }, [dashboard]);

  async function previewPlan() {
    setIsGeneratingPlan(true);
    try {
      const response = await api.post('/api/plans/preview', { track: onboardForm.track, weeklyHours: onboardForm.weeklyHours, consistency: 70, youtubeLink: onboardForm.youtubeLink });
      setPlanPreview(response.data.plan);
    } catch (err) { setMessage(err.response?.data?.message || 'Plan preview failed'); }
    finally { setIsGeneratingPlan(false); }
  }

  const [loginName, setLoginName] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginName.trim()) return;
    setIsGeneratingPlan(true);
    try {
      const response = await api.post('/api/learners/login', { name: loginName });
      const learnerId = response.data.learner.id;
      setActiveLearnerId(learnerId);
      setPlanPreview(response.data.plan);
      setMessage(`Welcome back, ${response.data.learner.name}!`);
      setShowOnboardModal(false);
      setAuthMode('login');
      setLoginName('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed. Try creating a new account.');
    } finally {
      setIsGeneratingPlan(false);
    }
  }

  async function handleOnboard(e) {
    e.preventDefault();
    setIsGeneratingPlan(true);
    try {
      const response = await api.post('/api/learners/onboard', onboardForm);
      const learnerId = response.data.learner.id;
      setActiveLearnerId(learnerId);
      setPlanPreview(response.data.plan);
      setOnboardForm({ name: '', track: 'Web Development', goal: '', weeklyHours: 10, github: '', youtubeLink: '' });
      setMessage('New learner onboarded and personalized plan generated.');
      setShowOnboardModal(false);
    } catch (err) { setMessage(err.response?.data?.message || 'Onboarding failed'); }
    finally { setIsGeneratingPlan(false); }
  }

  async function handleReplan(e) {
    e.preventDefault();
    if (!activeLearnerId) return;
    setIsGeneratingPlan(true);
    try {
      await api.post(`/api/learners/${activeLearnerId}/replan`, replanForm);
      setMessage('New plan customized and generated successfully!');
      setShowReplanModal(false);
      setReplanForm({ track: 'Web Development', goal: '', projectLink: '' });
      fetchDashboard(activeLearnerId); // refresh
    } catch (err) { setMessage(err.response?.data?.message || 'Re-planning failed'); }
    finally { setIsGeneratingPlan(false); }
  }

  async function updateSetting(field, value) {
    if (!dashboard?.learner?.id) return;
    try {
      await api.patch(`/api/learners/${dashboard.learner.id}`, { [field]: value });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      await fetchDashboard(dashboard.learner.id);
    } catch (err) { setMessage(err.response?.data?.message || 'Failed to update settings'); }
  }

  async function updateTask(taskId, payload) {
    if (!dashboard?.learner?.id) return;
    try {
      const response = await api.patch(`/api/tasks/${taskId}`, { learnerId: dashboard.learner.id, ...payload });
      if (response.data.pivotTriggered) {
        setToastMessage(response.data.pivotMessage);
        setIsFlashing(true); setTimeout(() => setIsFlashing(false), 2000); setTimeout(() => setToastMessage(null), 8000);
      }
      await fetchDashboard(dashboard.learner.id);
    } catch (err) { setMessage(err.response?.data?.message || 'Task update failed'); }
  }

  async function simulateMissedDay() {
    try {
      const res = await api.post('/api/motivate', { persona, type: 'missed_day' });
      setToastMessage(res.data.message);
    } catch {
      setToastMessage("Wake up! Backend motivation failed, but your goals haven't. Get to work!");
    }
    setTimeout(() => setToastMessage(null), 6000);
  }

  async function syncGitHub() {
    if (!dashboard?.learner?.github) { setMessage('No GitHub username associated with this learner.'); return; }
    setLoading(true);
    try {
      const username = dashboard.learner.github;
      // Fetch user profile stats
      const userRes = await axios.get(`https://api.github.com/users/${username}`);
      const ghRes = await axios.get(`https://api.github.com/users/${username}/events/public`);
      const lastPush = ghRes.data.find((e) => e.type === 'PushEvent');

      const newGithubData = {
        avatar: userRes.data.avatar_url,
        followers: userRes.data.followers,
        publicRepos: userRes.data.public_repos,
        lastPushDate: lastPush ? new Date(lastPush.created_at).toLocaleDateString() : 'No recent pushes',
        lastRepo: lastPush ? lastPush.repo.name : 'N/A'
      };
      setGithubData(newGithubData);

      if (!lastPush) {
        setToastMessage(`AI Motivator: ZERO recent commits detected. Consistency trend dropping! Get back to coding!`);
        setTimeout(() => setToastMessage(null), 6000);
      } else {
        const lastDate = new Date(lastPush.created_at).toLocaleDateString();
        setMessage(`Automated GitHub Check: Push found on ${lastDate}! Rewarding +20 Coins ✨`);
        updateSetting('coins', (dashboard.learner.coins || 0) + 20);
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) { setMessage(`GitHub Sync Failed: Make sure the username is correct.`); } finally { setLoading(false); }
  }

  async function handleChatSubmit(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    try {
      const res = await api.post('/api/chat', { learnerId: activeLearnerId, message: userMsg });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
      if (res.data.action === 'refresh') {
        fetchDashboard(activeLearnerId);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: "Error connecting to AI." }]);
    }
  }

  async function generateFlashcards() {
    if (!flashcardTopic.trim()) {
      setMessage("Please enter a topic or YouTube link first.");
      return;
    }
    setIsGeneratingCards(true);
    setFlashcards([]);
    setFlippedCards({});
    try {
      const res = await api.post('/api/flashcards/generate', {
        topic: flashcardTopic,
        track: dashboard?.learner?.track || 'Web Development'
      });
      setFlashcards(res.data.flashcards);
      setFlashcardTopic('');
    } catch {
      setMessage("Error processing topic/URL to flashcards.");
    } finally {
      setIsGeneratingCards(false);
    }
  }

  function toggleCard(id) {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (isFlowState) {
    const nextTask = dashboard?.tasks?.find(t => !t.completed);
    return (
      <div className='flow-state-shell'>
        <div className='ambient ambient-one' /> <div className='ambient ambient-two' />
        <div className='flow-mode-container'>
          <Motion.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='flow-card'>
            <h2>Flow State Active</h2>
            <div className='timer-display'>{formatTime(timer)}</div>
            {nextTask ? ( <div className='focused-task'><h3>Focusing on:</h3><h2>{nextTask.title}</h2><p>{nextTask.module}</p></div> ) : ( <p>All tasks completed for now.</p> )}
            <div style={{ marginTop: '2rem' }}>
              <button onClick={() => setIsFlowState(false)} className='ghost'>Exit Flow State</button>
            </div>
          </Motion.motion.div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <Motion.motion.div className="bento-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="panel col-span-8">
            <h2>Live Learner Snapshot</h2>
            {!loading && dashboard ? (
              <>
                <div className="learner-meta">
                    <h3>{dashboard.learner.name}</h3>
                    <p>{dashboard.learner.track} • Goal: {dashboard.learner.goal}</p>
                </div>
                <div className="stats-grid">
                  <StatCard idx={1} label="Completion" value={`${dashboard.stats.completionRate}%`} accent="#ff7e3f" />
                  <StatCard idx={2} label="Current Streak" value={`${dashboard.stats.streak} days`} accent="#2ec4b6" />
                  <StatCard idx={3} label="Avg Score" value={`${dashboard.stats.avgScore}`} accent="#f7b801" />
                  <StatCard idx={4} label="Tasks Done" value={`${dashboard.stats.completed}/${dashboard.stats.totalTasks}`} accent="#66a6ff" />
                </div>
                <div className="chart-wrap">
                  <h4>Consistency Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={completionData}>
                      <defs>
                        <linearGradient id="consistencyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff7e3f" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#ff7e3f" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#adb5bd" />
                      <YAxis stroke="#adb5bd" />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12 }} />
                      <Area type="monotone" dataKey="consistency" stroke="#ff7e3f" strokeWidth={3} fillOpacity={1} fill="url(#consistencyGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <h4>Emotional Analytics (Heatmap)</h4>
                  <div className="heat-grid">
                    {Array.from({ length: 90 }).map((_, i) => {
                       // Find if we have progress for (90-i) days ago
                       const pastDate = new Date();
                       pastDate.setDate(pastDate.getDate() - (89 - i));
                       const formattedDate = pastDate.toISOString().split('T')[0];
                       const dayData = dashboard.progress?.find(p => p.date === formattedDate);
                       let intensity = 0;
                       if (dayData && dayData.minutes > 0) {
                          if (dayData.minutes < 30) intensity = 1;
                          else if (dayData.minutes < 60) intensity = 2;
                          else if (dayData.minutes < 120) intensity = 3;
                          else intensity = 4;
                       }
                       return <div key={i} className={`heat-box level-${intensity}`} title={`${formattedDate}: ${dayData ? dayData.minutes : 0} mins`} />
                    })}
                  </div>
                </div>
              </>
            ) : <p>We need a learner active. Please Onboard.</p>}
          </div>

          <div className="panel col-span-4">
             <h2>AI Motivator</h2>
             <p>Roast or Toast! Select how the AI should nudge you.</p>
             <div className="mini-form">
                <select value={persona} onChange={(e) => setPersona(e.target.value)}>
                  <option value="Gentle Nudge">Gentle Nudge</option>
                  <option value="Philosophical">Philosophical</option>
                  <option value="David Goggins Hardcore">David Goggins Hardcore</option>
                </select>
                <button type="button" className="ghost" onClick={simulateMissedDay}>Simulate Missed Day</button>
             </div>
          </div>

          <div className="panel col-span-12">
            <h2>Adaptive Task Board</h2>
            <p>Update completion to retrain consistency signal.</p>
            <div className="task-list">
              {dashboard?.tasks?.map((task) => {
                const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
                const isExcellent = task.score != null && task.score > 90;
                return (
                <article key={task.id} className={`task-item ${task.completed ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}>
                  <div>
                    <h4 className={isExcellent ? 'text-green' : ''}>{task.title}</h4>
                    <p>{task.module} • Due {task.dueDate}</p>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => updateTask(task.id, { completed: !task.completed })}>{task.completed ? 'Undo' : 'Complete'}</button>
                  </div>
                </article>
              )})}
            </div>
          </div>
        </Motion.motion.div>
      );
    }

    if (activeTab === 'timeline') {
      return (
         <Motion.motion.div className="bento-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="panel col-span-12">
             <h2>AI Plan Timeline</h2>
             <p>Dynamic schedule generated by AI.</p>
             <div className="timeline">
               {(planPreview.length ? planPreview : []).map((item) => (
                 <article key={item.id} className="timeline-item">
                   <span className={`dot ${item.isPivot ? 'pivot-dot' : ''}`} />
                   <div>
                     <h4 style={{ color: item.isPivot ? '#ff7e3f' : 'inherit' }}>{item.module}</h4>
                     <p>{item.startDate} to {item.endDate}</p>
                   </div>
                 </article>
               ))}
               {!planPreview.length && <p>No timeline generated.</p>}
             </div>
          </div>
          <div className="panel col-span-12">
            <h2>Smart Study Material (Flashcards)</h2>
              <p>Paste a YouTube link or any topic, and AI will extract 5 micro-learning flashcards instantly.</p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input
                  type="text"
                  value={flashcardTopic}
                  onChange={(e) => setFlashcardTopic(e.target.value)}
                  placeholder="e.g. https://youtu.be/... or 'React Hooks'"
                  style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--bg)', color: '#fff', outline: 'none' }}
                />
                <button onClick={generateFlashcards} className="primary" disabled={isGeneratingCards}>
                  {isGeneratingCards ? 'Extracting AI Magic...' : 'Generate Flashcards'}
                </button>
              </div>

            {flashcards.length > 0 && (
              <div className="flashcards-wrapper">
                {flashcards.map((fc) => (
                  <div key={fc.id} className={`flashcard ${flippedCards[fc.id] ? 'flipped' : ''}`} onClick={() => toggleCard(fc.id)}>
                    <div className="flashcard-inner">
                      <div className="flashcard-front">{fc.q}</div>
                      <div className="flashcard-back">{fc.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>        </Motion.motion.div>
      );
    }

    if (activeTab === 'archives') {
      const history = dashboard?.learner?.planHistory || [];
      return (
         <Motion.motion.div className="bento-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel col-span-12">
               <h2>Project Archives & History</h2>
               <p style={{ color: 'var(--muted)' }}>Your past learning blueprints and pivoted projects are safely stored here.</p>

               {history.length === 0 ? (
                 <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)', marginTop: '20px' }}>
                   <span style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}>📂</span>
                   <p style={{ color: 'var(--muted)', margin: 0 }}>No historical plans found yet.<br/>Use <b>"Pivot / Replan"</b> to start a new project, and your current one will be archived here.</p>
                 </div>
               ) : (
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
                   {history.slice().reverse().map((hist, idx) => (
                     <div key={hist.id || idx} style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                         <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.2rem' }}>{hist.track}</h3>
                         <span style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                           {new Date(hist.archivedAt).toLocaleDateString()}
                         </span>
                       </div>
                       <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '15px', lineHeight: '1.4' }}>
                         <strong>Goal:</strong> {hist.goal}
                       </p>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                         <strong style={{ fontSize: '0.85rem', color: 'var(--blue)', marginBottom: '4px' }}>Modules Completed:</strong>
                         {hist.plan.map((module, i) => (
                           <div key={i} style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', color: 'var(--text)', borderLeft: '2px solid var(--blue)' }}>
                             {module.module}
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
         </Motion.motion.div>
      );
    }

    if (activeTab === 'settings') {
      return (
         <Motion.motion.div className="bento-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel col-span-8">
               <h2>Settings & Integrations</h2>
               <p>Connect your tools to track your progress automatically.</p>
               <br/>
               <label style={{ display: 'block', marginBottom: '10px' }}>GitHub Username
                 <span style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                   <input
                     type="text"
                     placeholder="e.g. torvalds"
                     defaultValue={dashboard?.learner?.github || ''}
                     onBlur={(e) => updateSetting('github', e.target.value)}
                   />
                   <button onClick={syncGitHub} className="primary" style={{ width: 'auto' }}>Sync Activity</button>
                 </span>
               </label>
               <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '-5px', marginBottom: '20px' }}>
                 Your GitHub pushes will automatically top up your consistency score and coins!
               </p>

               {githubData && (
                 <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                   <img src={githubData.avatar} alt="github avatar" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                   <div>
                     <h3 style={{ margin: '0 0 5px 0' }}>{dashboard?.learner?.github}</h3>
                     <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--muted)' }}>
                       📦 {githubData.publicRepos} Repos &nbsp;|&nbsp; 👥 {githubData.followers} Followers
                     </p>
                     <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                       <span style={{ color: 'var(--green)' }}>●</span> Last Push: {githubData.lastPushDate} <br/>
                       <span style={{ fontSize: '0.8rem', color: 'var(--blue)', opacity: 0.8 }}>↳ {githubData.lastRepo}</span>
                     </p>
                   </div>
                 </div>
               )}

               <br/>
               <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}/>
               <button onClick={() => { setActiveLearnerId(null); setDashboard(null); setShowOnboardModal(true); setGithubData(null); }} className="ghost">Reset & Create New Learner</button>
            </div>
         </Motion.motion.div>
      );
    }

    return null;
  };

  return (
    <div className={`app-layout ${isFlashing ? 'flash-active' : ''}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <aside className="sidebar">
        <div className="brand"><div className="brand-dot"/> StudyFlow</div>
        <nav className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</div>
          <div className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>📅 Timeline</div>
          <div className={`nav-item ${activeTab === 'archives' ? 'active' : ''}`} onClick={() => setActiveTab('archives')}>🗂️ Archives</div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ Settings</div>
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="ghost" style={{ width: '100%', borderColor: '#3b4256' }} onClick={() => setShowOnboardModal(true)}>👤 New Learner</button>
          {activeLearnerId && (
            <button className="primary" style={{ width: '100%' }} onClick={() => setShowReplanModal(true)}>✨ Pivot / Replan</button>
          )}
        </div>
      </aside>

      <main className="main-area">
        <header className="top-header">
          <div className="header-left">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>
            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <button onClick={() => { setIsFlowState(true); setTimer(25 * 60); }} className="primary">
                  Enter Flow State
               </button>
               <div className="bell-icon" onClick={() => setToastMessage('No new notifications!')} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a7b3cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', display: 'block' }}>
                     <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none"></path>
                     <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none"></path>
                  </svg>
                  {message && <div className="bell-dot" style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: '#ff453a', borderRadius: '50%' }} />}
               </div>               {dashboard?.learner?.coins !== undefined && (
                  <div className="coin-purse" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,0.1)', padding: '6px 12px', borderRadius: '20px', color: '#ffd700', fontWeight: 'bold' }}>
                     🪙 {dashboard.learner.coins}
                  </div>
               )}               <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #66a6ff, #2ec4b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', flexShrink: 0 }}>
                     {dashboard?.learner?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontWeight: 600 }}>{dashboard?.learner?.name || 'Guest User'}</span>
               </div>
            </div>
        </header>

        <section className="page-content">
          {message && <div className="message-box">{message}</div>}
          {renderContent()}
        </section>
      </main>

      {/* Replan Modal */}
      {showReplanModal && (
        <div className="modal-overlay">
          <Motion.motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>Pivot Your Learning Plan</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Paste a new Project Link or YouTube Video to recreate your modules instantly, keeping your current points.</p>
            <form onSubmit={handleReplan}>
              <label>Track / Focus
                <input value={replanForm.track} onChange={(e) => setReplanForm((p) => ({ ...p, track: e.target.value }))} required placeholder="e.g. Next.js Mastery" />
              </label>
              <label>New Learning Goal
                <textarea value={replanForm.goal} onChange={(e) => setReplanForm((p) => ({ ...p, goal: e.target.value }))} required placeholder="Build a fullstack blog" />
              </label>
              <label>Project Link / YouTube Link
                <input type="text" placeholder="https://youtube.com/... or github.com/..." value={replanForm.projectLink || ''} onChange={(e) => setReplanForm((p) => ({ ...p, projectLink: e.target.value }))} required />
              </label>
              <div className="form-actions">
                <button type="button" className="ghost" onClick={() => setShowReplanModal(false)} disabled={isGeneratingPlan}>Cancel</button>
                <button type="submit" className="primary" disabled={isGeneratingPlan}>{isGeneratingPlan ? 'Pivoting Plan...' : 'Pivot Plan'}</button>
              </div>
            </form>
          </Motion.motion.div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboardModal && (
        <div className="modal-overlay">
          <Motion.motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
                        <h2>{authMode === 'login' ? 'Welcome Back!' : 'Start Learning'}</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                className={authMode === 'login' ? 'primary' : 'ghost'}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'signup' ? 'primary' : 'ghost'}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin}>
                <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
                  Enter your previous name to resume your progress.
                </p>
                <label>Name
                  <input
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    required
                    placeholder="E.g. Kunal Gupta"
                  />
                </label>
                <div className="form-actions">
                  <button type="submit" className="primary" disabled={isGeneratingPlan}>
                    {isGeneratingPlan ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOnboard}>
                <label>Name
                  <input value={onboardForm.name} onChange={(e) => setOnboardForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Kunal Gupta" />
                </label>
                <label>Track
                  <select
                    value={['Web Development', 'Data Science', 'UI/UX Design', 'Machine Learning', 'Cybersecurity', 'Mobile App Development', 'Cloud Computing'].includes(onboardForm.track) ? onboardForm.track : 'Custom'}
                    onChange={(e) => setOnboardForm((p) => ({ ...p, track: e.target.value === 'Custom' ? '' : e.target.value }))}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Custom">Custom (Type your own)</option>
                  </select>
                  {!['Web Development', 'Data Science', 'UI/UX Design', 'Machine Learning', 'Cybersecurity', 'Mobile App Development', 'Cloud Computing'].includes(onboardForm.track) && (
                    <input
                      style={{ marginTop: '10px' }}
                      value={onboardForm.track}
                      onChange={(e) => setOnboardForm((p) => ({ ...p, track: e.target.value }))}
                      placeholder="Type your custom track name..."
                      required
                    />
                  )}
                </label>
                <label>Learning Goal
                  <textarea value={onboardForm.goal} onChange={(e) => setOnboardForm((p) => ({ ...p, goal: e.target.value }))} required placeholder="Build 3 production-ready projects" />
                </label>
                <label>Weekly Hours
                  <input type="number" min="4" max="30" value={onboardForm.weeklyHours} onChange={(e) => setOnboardForm((p) => ({ ...p, weeklyHours: Number(e.target.value) }))} required />
                </label>
                <label>YouTube Link (Optional)
                  <input type="url" placeholder="Paste YouTube link for custom modules..." value={onboardForm.youtubeLink || ''} onChange={(e) => setOnboardForm((p) => ({ ...p, youtubeLink: e.target.value }))} />
                </label>
                <div className="form-actions">
                  {activeLearnerId && <button type="button" className="ghost" onClick={() => setShowOnboardModal(false)} disabled={isGeneratingPlan}>Cancel</button>}
                  <button type="button" className="ghost" onClick={previewPlan} disabled={isGeneratingPlan}>{isGeneratingPlan ? 'Thinking...' : 'Preview AI Plan'}</button>
                  <button type="submit" className="primary" disabled={isGeneratingPlan}>{isGeneratingPlan ? 'Generating...' : 'Generate Plan'}</button>
                </div>
              </form>
            )}
          </Motion.motion.div>
        </div>
      )}

      {toastMessage && (
        <Motion.motion.div className="toast-notification" initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
          <div className="toast-header">
            <strong>AI Motivator ({persona})</strong>
            <button onClick={() => setToastMessage(null)}>✕</button>
          </div>
          <p>{toastMessage}</p>
        </Motion.motion.div>
      )}

      {/* Floating AI Chat */}
      <div className="chat-widget">
        {!chatOpen ? (
          <button className="chat-btn" onClick={() => setChatOpen(true)}>AI</button>
        ) : (
          <div className="chat-window">
            <div className="chat-header">
              <span>Co-Pilot</span>
              <button className="close-chat" onClick={() => setChatOpen(false)}>×</button>
            </div>
            <div className="chat-messages">
              {chatMessages.map((m, i) => (
                <div key={i} className={`chat-message ${m.sender}`}>{m.text}</div>
              ))}
            </div>
            <form className="chat-input-area" onSubmit={handleChatSubmit}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type 'reschedule task to tomorrow'..." />
              <button type="submit">➤</button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;