const fs = require('fs');
const file = fs.readFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', 'utf8');

// Part 1: Add Nav Item
const navTarget = `<div className=\`nav-item \${activeTab === 'dashboard' ? 'active' : ''}\` onClick={() => setActiveTab('dashboard')}>📊 Dashboard</div>`;
const navReplacement = `<div className=\`nav-item \${activeTab === 'dashboard' ? 'active' : ''}\` onClick={() => setActiveTab('dashboard')}>📊 Dashboard</div>
          <div className=\`nav-item \${activeTab === 'leaderboard' ? 'active' : ''}\` onClick={() => setActiveTab('leaderboard')}>🏆 Leaderboard <span style={{fontSize:'0.6rem', background:'var(--blue)', padding:'2px 4px', borderRadius:'4px', marginLeft:'4px'}}>LIVE</span></div>`;

// Part 2: Add renderContent block for Leaderboard
const settingsTarget = `if (activeTab === 'settings') {`;
const leaderBoardRender = `if (activeTab === 'leaderboard') {
        return (
           <Motion.motion.div className="bento-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="panel col-span-12" style={{ position: 'relative', overflow: 'hidden' }}>
                 <h2>Global Leaderboard <span style={{ color: 'var(--green)', fontSize: '0.9rem', marginLeft: '10px' }}>● Live Sync</span></h2>
                 <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>Compete with learners around the world. (Ghost Mode Enabled)</p>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {mockLeaderboard.map((user, idx) => (
                     <div key={user.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: idx === 0 ? '1px solid var(--blue)' : '1px solid transparent' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <span style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '30px', color: idx === 0 ? '#ffb347' : 'var(--muted)' }}>#{idx + 1}</span>
                         <div>
                           <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                             {user.name}
                             {user.live && <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--green)', borderRadius: '50%', boxShadow: '0 0 8px var(--green)' }} title="Currently active" />}
                           </h3>
                           <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{user.streak} Day Tracker</span>
                         </div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                         <h3 style={{ margin: 0, color: 'var(--blue)' }}>{user.points.toLocaleString()} pts</h3>
                         <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Mastery</span>
                       </div>
                     </div>
                   ))}

                   {dashboard && (
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px dashed var(--muted)', marginTop: '10px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <span style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '30px', color: 'var(--muted)' }}>#--</span>
                         <div>
                           <h3 style={{ margin: 0 }}>{dashboard.learner.name} (You)</h3>
                           <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{dashboard.learner.streakDays} Day Tracker</span>
                         </div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                         <h3 style={{ margin: 0, color: 'var(--text)' }}>{dashboard.learner.coins.toLocaleString()} pts</h3>
                       </div>
                     </div>
                   )}
                 </div>
              </div>
           </Motion.motion.div>
        );
      }

      if (activeTab === 'settings') {`;

let newFile = file.replace(navTarget, navReplacement);
newFile = newFile.replace(settingsTarget, leaderBoardRender);

fs.writeFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', newFile);
console.log('Leaderboard added!');
