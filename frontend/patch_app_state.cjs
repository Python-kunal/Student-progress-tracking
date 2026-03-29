const fs = require('fs');
const file = fs.readFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', 'utf8');

const targetStr = 'const [isGeneratingCards, setIsGeneratingCards] = useState(false);';
const newStr = `const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // New Features State
  const [taskResources, setTaskResources] = useState({});
  const mockLeaderboard = useMemo(() => [
    { name: 'AlexTheDev', points: 4320, streak: 12, live: true },
    { name: 'SarahCodex', points: 3850, streak: 9, live: false },
    { name: 'ByteMaster', points: 3100, streak: 5, live: true },
    { name: 'CodeNinja', points: 2940, streak: 4, live: false }
  ], []);

  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text to speech!');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (persona === 'David Goggins') {
        utterance.pitch = 0.5;
        utterance.rate = 1.1;
    }
    window.speechSynthesis.speak(utterance);
  }

  async function fetchResources(taskId, moduleName) {
    setTaskResources(prev => ({ ...prev, [taskId]: { loading: true, data: null } }));
    try {
      const response = await api.post('/api/resources', { topic: moduleName });
      setTaskResources(prev => ({ ...prev, [taskId]: { loading: false, data: response.data.resources } }));
    } catch (err) {
      setTaskResources(prev => ({ ...prev, [taskId]: { loading: false, data: [] } }));
    }
  }`;

fs.writeFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/frontend/src/App.jsx', file.replace(targetStr, newStr));
console.log('App.jsx states updated!');