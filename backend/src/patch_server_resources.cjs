const fs = require('fs');
const file = fs.readFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/backend/src/server.js', 'utf8');

const anchor = 'app.post("/api/motivate", (req, res) => {';

if (file.includes('/api/resources') || !file.includes(anchor)) {
    console.log('Already added or anchor not found.');
    process.exit(0);
}

const resourcesEndpoint = `app.post("/api/resources", async (req, res) => {
  const { topic } = req.body;
  await new Promise(r => setTimeout(r, 1500)); // Simulate AI searching

  const query = encodeURIComponent(topic + ' programming tutorial');
  
  res.json({
    resources: [
      { id: 1, type: 'video', title: \`Top 5 \${topic} Concepts Explained\`, url: \`https://www.youtube.com/results?search_query=\${query}\` },
      { id: 2, type: 'video', title: \`Build a \${topic} Project in 20 Mins\`, url: \`https://www.youtube.com/results?search_query=\${query}+project\` },
      { id: 3, type: 'article', title: \`Advanced Guide to \${topic} (Medium)\`, url: \`https://medium.com/search?q=\${encodeURIComponent(topic)}\` }
    ]
  });
});

`;

const newFile = file.replace(anchor, resourcesEndpoint + anchor);
fs.writeFileSync('c:/Python projects😈/Portfolio/portfolio/Student-progress-tracking/backend/src/server.js', newFile);
console.log('Added /api/resources endpoint!');