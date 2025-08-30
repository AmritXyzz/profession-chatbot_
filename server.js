const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// --- Chat endpoint ---
app.get("/generate-text", async (req, res) => {
  const userMessage = req.query.message;
  const profession = req.query.profession || "";
  if (!userMessage) return res.status(400).json({ error: "Missing message" });

  const SYSTEM_PROMPT = `Your name is Erina. You are warm and compassionate...`;
  let dynamicPrompt = SYSTEM_PROMPT;
  if(profession) dynamicPrompt += `\nRoleplay as a ${profession}.`;

  try {
    const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','X-Deepinfra-Source':'web-page'},
      body: JSON.stringify({ model:"meta-llama/Llama-3.3-70B-Instruct",
        messages: [{ role:"system", content:dynamicPrompt }, { role:"user", content:userMessage }],
        temperature:0.7, stream:false })
    });
    const data = await response.json();
    res.json({ text: data.choices?.[0]?.message?.content?.trim() || "" });
  } catch(err) {
    res.status(500).json({ error:"Text generation failed" });
  }
});

// --- Memories endpoint with pagination ---
const allMemories = [
  { id:1, name:"Vladimir Vladimirovich Putin", genre:"Travel", image:"https://c4.wallpaperflare.com/wallpaper/195/615/615/vladimir-putin-russia-president-rocket-wallpaper-preview.jpg", description:"President of Russia" },
  { id:2, name:"Mountain Hike", genre:"Adventure", image:"https://source.unsplash.com/200x150/?mountain,hiking", description:"Exploring mountain trails." },
  { id:3, name:"City Night", genre:"Urban", image:"https://source.unsplash.com/200x150/?city,night", description:"The city lights at night." },
  { id:4, name:"Forest Path", genre:"Nature", image:"https://source.unsplash.com/200x150/?forest,path", description:"Walking through a dense forest." },
  { id:5, name:"Cozy Cafe", genre:"Lifestyle", image:"https://source.unsplash.com/200x150/?cafe,coffee", description:"Enjoying coffee at a cozy cafe." },
  { id:6, name:"Desert Dunes", genre:"Travel", image:"https://source.unsplash.com/200x150/?desert,dunes", description:"The vast desert landscape." },
  { id:7, name:"Snowy Mountains", genre:"Adventure", image:"https://source.unsplash.com/200x150/?snow,mountains", description:"Snow covered peaks." },
  { id:8, name:"Flower Field", genre:"Nature", image:"https://source.unsplash.com/200x150/?flowers,field", description:"A colorful flower field." },
  { id:9, name:"Rainy Street", genre:"Urban", image:"https://source.unsplash.com/200x150/?rain,street", description:"A rainy evening street." },
  { id:10, name:"Lakeside", genre:"Travel", image:"https://source.unsplash.com/200x150/?lake,water", description:"Peaceful lake view." },
  { id:11, name:"Camping Night", genre:"Adventure", image:"https://source.unsplash.com/200x150/?camping,night", description:"Camping under stars." },
  { id:12, name:"Sunflower Field", genre:"Nature", image:"https://source.unsplash.com/200x150/?sunflower,field", description:"Bright sunflowers in summer." }
];

app.get('/api/memories', (req, res) => {
  let page = parseInt(req.query.page)||1;
  let limit = parseInt(req.query.limit)||8;
  const start = (page-1)*limit;
  const end = start+limit;
  const paginatedMemories = allMemories.slice(start,end);
  const totalPages = Math.ceil(allMemories.length/limit);
  res.json({ page, totalPages, memories: paginatedMemories });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
