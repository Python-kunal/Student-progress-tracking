const fs = require('fs');
let file = fs.readFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', 'utf8');

const navIndex = file.indexOf('<nav className="nav-links">');
if (navIndex !== -1) {
    const nextLineIndex = file.indexOf("setActiveTab('dashboard')", navIndex);
    const endOfDashboardNav = file.indexOf('</div>', nextLineIndex) + 6;

    // Safety check so we don't multiply
    if (!file.includes("setActiveTab('leaderboard')")) {
        const part1 = file.slice(0, endOfDashboardNav);
        const addition = `\n          <div className={\`nav-item \${activeTab === 'leaderboard' ? 'active' : ''}\`} onClick={() => setActiveTab('leaderboard')}>🏆 Leaderboard <span style={{fontSize:'0.6rem', background:'var(--blue)', padding:'2px 4px', borderRadius:'4px', marginLeft:'4px', color:'white'}}>LIVE</span></div>`;
        const part2 = file.slice(endOfDashboardNav);

        fs.writeFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', part1 + addition + part2);
        console.log('Nav fixed!');
    } else {
        console.log('Already patched');
    }
} else {
    console.log('Nav links not found');
}
