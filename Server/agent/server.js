import express from "express";
import cors from "cors";
import { agent, runMarketingPrompt } from "./agent.impl.js";
import fs from "fs";
import path from "path";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Hello from Agent server");
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt, thread_id } = req.body;

    if (!prompt) return res.status(400).json({ error: "prompt required" });

    // Prefer agent.invoke if available, else fallback to runMarketingPrompt
    let result;
    if (agent && typeof agent.invoke === "function") {
      result = await agent.invoke({ messages: [{ role: "user", content: prompt }] }, { configurable: { thread_id } });
      // try common shapes
      const out = result?.messages?.at(-1)?.content ?? result?.output ?? result;
      return res.json({ ok: true, result: out });
    }

    const fallback = await runMarketingPrompt(prompt);
    return res.json({ ok: true, result: fallback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Simple blog search and comments API ---
// small in-memory posts list (kept in sync with client sample)
const POSTS = [
  { id: 'p1', title: 'Top 14 AI Models in 2025 for Businesses to Watch', category: 'design', tags: ['design','creativity'], excerpt: 'The strongest AI models don’t just process data; they think, reason, and create.', createdAt: '2025-10-01T10:15:00Z', views: 2300 },
  { id: 'p2', title: '10 Tech Facts That Sound Like Sci-Fi (But Are Real)', category: 'tech', tags: ['tech','ai'], excerpt: 'From neural networks to quantum quirks — these tech facts will make you feel like you’re living in the future already.', createdAt: '2025-09-28T08:30:00Z', views: 4700 },
  { id: 'p3', title: '10 Business Facts That Successful Founders Swear By', category: 'business', tags: ['business','strategy'], excerpt: 'Revenue rules and counterintuitive habits of top founders.', createdAt: '2025-09-15T12:00:00Z', views: 3200 },
  { id: 'p4', title: '10 Bookish Facts That Make Reading a Superpower', category: 'books', tags: ['books','learning'], excerpt: 'Reading rewires how you think. These ten facts show why reading consistently is high-ROI.', createdAt: '2025-10-05T07:20:00Z', views: 1500 },
  { id: 'p5', title: '10 Growth Hacks That Feel Unfair (But Work)', category: 'hacks', tags: ['growth','marketing'], excerpt: 'Tactical, ethical growth ideas you can apply today.', createdAt: '2025-09-05T16:45:00Z', views: 5400 }
];

const COMMENTS_FILE = path.resolve(process.cwd(), 'comments.json');
function readComments() {
  try {
    if (fs.existsSync(COMMENTS_FILE)) return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf8'));
  } catch (e) { console.error('readComments error', e); }
  return {};
}
function writeComments(obj) {
  try { fs.writeFileSync(COMMENTS_FILE, JSON.stringify(obj, null, 2), 'utf8'); } catch (e) { console.error('writeComments error', e); }
}

// Search endpoint: accepts { q } and returns matching posts
app.post('/api/search', (req, res) => {
  try {
    const { q } = req.body || {};
    if (!q) return res.json({ ok: true, results: POSTS });
    const ql = String(q).toLowerCase();
    const results = POSTS.filter(p => (p.title + ' ' + p.excerpt + ' ' + (p.tags || []).join(' ')).toLowerCase().includes(ql));
    return res.json({ ok: true, results });
  } catch (err) { console.error(err); return res.status(500).json({ ok: false, error: String(err) }); }
});

// Comments endpoints
app.get('/api/comments/:postId', (req, res) => {
  try {
    const postId = req.params.postId;
    const all = readComments();
    return res.json({ ok: true, comments: all[postId] || [] });
  } catch (err) { console.error(err); return res.status(500).json({ ok: false, error: String(err) }); }
});

app.post('/api/comments/:postId', (req, res) => {
  try {
    const postId = req.params.postId;
    const { name = 'Guest', text } = req.body || {};
    if (!text) return res.status(400).json({ ok: false, error: 'text required' });
    const all = readComments();
    all[postId] = all[postId] || [];
    const comment = { name, text, ts: new Date().toISOString() };
    all[postId].unshift(comment);
    writeComments(all);
    return res.json({ ok: true, comment });
  } catch (err) { console.error(err); return res.status(500).json({ ok: false, error: String(err) }); }
});

app.listen(port, () => {
  console.log(`Agent server listening on http://localhost:${port}`);
});
