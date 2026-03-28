const fs = require('fs');
const file = fs.readFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', 'utf8');
const oldStr = fs.readFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/form_to_replace.txt', 'utf8');
const newStr = `            <h2>{authMode === 'login' ? 'Welcome Back!' : 'Start Learning'}</h2>
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
            )}`;
fs.writeFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', file.replace(oldStr, newStr));