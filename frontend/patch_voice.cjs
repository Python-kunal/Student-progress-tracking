const fs = require('fs');
const file = fs.readFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', 'utf8');

const targetStr = `{chatMessages.map((m, i) => (
                  <div key={i} className={\`chat-message \${m.sender}\`}>{m.text}</div>
                ))}`;

const newStr = `{chatMessages.map((m, i) => (
                  <div key={i} className={\`chat-message \${m.sender}\`} style={{ display: 'flex', alignItems: 'center', justifyContent: m.sender === 'ai' ? 'flex-start' : 'flex-end' }}>
                    {m.text}
                    {m.sender === 'ai' && (
                      <button onClick={() => speakText(m.text)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: '8px', padding: 0 }} title="Listen">
                        🔊
                      </button>
                    )}
                  </div>
                ))}`;

fs.writeFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', file.replace(targetStr, newStr));
console.log('Voice feature added!');
