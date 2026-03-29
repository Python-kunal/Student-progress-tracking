const fs = require('fs');
const file = fs.readFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', 'utf8');

const targetStr = `                    <div className="task-actions">
                      <button onClick={() => updateTask(task.id, { completed: !task.completed })}>{task.completed ? 'Undo' : 'Complete'}</button>
                    </div>
                  </article>`;

const newStr = `                    <div className="task-actions">
                      <button className="ghost" style={{ marginRight: '8px' }} onClick={() => fetchResources(task.id, task.module)}>
                        {taskResources[task.id]?.loading ? 'Searching...' : 'Find Resources'}
                      </button>
                      <button onClick={() => updateTask(task.id, { completed: !task.completed })}>{task.completed ? 'Undo' : 'Complete'}</button>
                    </div>
                    {taskResources[task.id]?.data && (
                      <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--blue)' }}>Top Resources:</strong>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: '0.85rem' }}>
                          {taskResources[task.id].data.map(res => (
                            <li key={res.id} style={{ marginBottom: '6px' }}>
                              <a href={res.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {res.type === 'video' ? '▶️' : '📄'} {res.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>`;

fs.writeFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', file.replace(targetStr, newStr));
console.log('Resources feature added!');
