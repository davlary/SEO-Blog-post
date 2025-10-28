// Blog client script — server-backed search & comments, mobile menu, efficient rendering
const $ = id => document.getElementById(id);

// Local fallback posts (same shape as server)
const LOCAL_POSTS = [
  { id: 'p1', title: 'Top 14 AI Models in 2025 for Businesses to Watch', category: 'design', tags: ['design','creativity'], excerpt: 'The strongest AI models don’t just process data; they think, reason, and create.', img: 'https://images.unsplash.com/photo-1495555687390-26b8a0b66b9a?w=1200&q=80', createdAt: '2025-10-01T10:15:00Z', views: 2300, readMore: 'https://www.thinkstack.ai/blog/best-ai-models/' },
  { id: 'p2', title: '10 Tech Facts That Sound Like Sci-Fi (But Are Real)', category: 'tech', tags: ['tech','ai'], excerpt: 'From neural networks to quantum quirks — these tech facts will make you feel like you’re living in the future already.', img: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&q=80', createdAt: '2025-09-28T08:30:00Z', views: 4700, readMore: 'https://example.com/tech-facts' },
  { id: 'p3', title: '10 Business Facts That Successful Founders Swear By', category: 'business', tags: ['business','strategy'], excerpt: 'Revenue rules and counterintuitive habits of top founders.', img: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&q=80', createdAt: '2025-09-15T12:00:00Z', views: 3200, readMore: 'https://example.com/business-facts' },
  { id: 'p4', title: '10 Bookish Facts That Make Reading a Superpower', category: 'books', tags: ['books','learning'], excerpt: 'Reading rewires how you think. These ten facts show why reading consistently is high-ROI.', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80', createdAt: '2025-10-05T07:20:00Z', views: 1500, readMore: 'https://example.com/book-facts' },
  { id: 'p5', title: '10 Growth Hacks That Feel Unfair (But Work)', category: 'hacks', tags: ['growth','marketing'], excerpt: 'Tactical, ethical growth ideas you can apply today.', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80', createdAt: '2025-09-05T16:45:00Z', views: 5400, readMore: 'https://example.com/growth-hacks' }
];

// Config - allow overriding from the host (window.API_BASE) or default to same-origin '/api'
const API_BASE = (window.API_BASE || '/api');

// Utils
const escapeHtml = s => String(s).replace(/[&<>"]|'/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const timeAgo = iso => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

// State
let POSTS = [];

const postsGrid = $('postsGrid');
const emptyState = $('emptyState');
const searchInput = $('searchInput');
const clearSearch = $('clearSearch');
const navToggle = $('navToggle');
const navLinks = $('navLinks');

// Fetch posts from server; fallback to local
async function fetchPosts(query) {
  try {
    const res = await fetch(`${API_BASE}/search`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ q: query || '' }) });
    if (!res.ok) throw new Error('search failed');
    const data = await res.json();
    return data.results || LOCAL_POSTS;
  } catch (err) {
    console.warn('server search failed, falling back to local', err);
    // local filter
    if (!query) return LOCAL_POSTS.slice();
    const ql = String(query).toLowerCase();
    return LOCAL_POSTS.filter(p => (p.title + ' ' + p.excerpt + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(ql));
  }
}

async function loadInitial() {
  POSTS = await fetchPosts();
  renderPosts(POSTS);
}

function renderPosts(list){
  postsGrid.innerHTML = '';
  if (!list.length){ emptyState.style.display = 'block'; return; }
  emptyState.style.display = 'none';
  const frag = document.createDocumentFragment();
  list.forEach(p => {
    const article = document.createElement('article'); article.className = 'post-card'; article.dataset.id = p.id;
    article.innerHTML = `
      <div class="post-media" aria-hidden="true"><img src="${p.img || ''}" alt="${escapeHtml(p.title)}"></div>
      <div class="post-body">
        <div class="post-meta"><span class="tag">${escapeHtml((p.category||'').toUpperCase())}</span><span>${timeAgo(p.createdAt||new Date())}</span><span>• ${p.views?.toLocaleString()||0} views</span></div>
        <h3 class="post-title">${escapeHtml(p.title)}</h3>
        <p class="post-excerpt">${escapeHtml(p.excerpt||'')}</p>
        <div class="comments" aria-live="polite"><div class="comment-list" id="comments-${p.id}"></div>
          <form class="comment-form" data-post="${p.id}"><input name="comment" placeholder='Leave a quick comment...' required /><button type="submit" class="cbtn">Comment</button></form>
        </div>
        <div class="post-actions"><a class="readmore" href="${p.readMore||'#'}" target="_blank" rel="noopener">Read more</a></div>
      </div>`;
    frag.appendChild(article);
  });
  postsGrid.appendChild(frag);
  // populate comments from server/local
  list.forEach(p => loadComments(p.id));
  // animate
  requestAnimationFrame(()=> document.querySelectorAll('.post-card').forEach((el,i)=> setTimeout(()=> el.classList.add('visible'), 60*i)));
}

// Comments: try server, fallback to localStorage
const commentsKey = id => `comments_${id}`;
async function loadComments(postId){
  const node = document.getElementById('comments-'+postId);
  if (!node) return;
  try {
    const res = await fetch(`${API_BASE}/comments/${postId}`);
    if (res.ok){ const data = await res.json(); const arr = data.comments||[]; renderComments(node, arr); return; }
  } catch(e){ /* ignore */ }
  // fallback
  const raw = localStorage.getItem(commentsKey(postId)); let arr = [];
  try{ arr = raw ? JSON.parse(raw) : []; } catch(e){ arr = []; }
  renderComments(node, arr);
}

function renderComments(node, arr){
  node.innerHTML = '';
  if (!arr.length) { node.innerHTML = '<div style="color:var(--muted);font-size:13px">No comments yet — be the first.</div>'; return; }
  arr.forEach(c => { const el = document.createElement('div'); el.className = 'comment'; el.innerHTML = `<small>${escapeHtml(c.name||'Guest')} • ${timeAgo(c.ts)}</small><div>${escapeHtml(c.text)}</div>`; node.appendChild(el); });
}

async function submitComment(postId, text){
  // try server
  try {
    const res = await fetch(`${API_BASE}/comments/${postId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text, name: 'Guest' }) });
    if (res.ok){ const data = await res.json(); loadComments(postId); return; }
  } catch (e){ /* ignore */ }
  // fallback local
  const key = commentsKey(postId); const raw = localStorage.getItem(key); let arr = raw ? JSON.parse(raw) : [];
  arr.unshift({ name: 'Guest', text, ts: new Date().toISOString() }); localStorage.setItem(key, JSON.stringify(arr.slice(0,30))); loadComments(postId);
}

// Delegated handlers
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.matches('.comment-form')){
    e.preventDefault(); const postId = form.dataset.post; const input = form.querySelector('input[name="comment"]'); if (input && input.value.trim()){ submitComment(postId, input.value.trim()); input.value = ''; }
  }
});

// Search with debounce — prefer server search
let searchTimer = null;
searchInput?.addEventListener('input', (e) => {
  const q = e.target.value.trim();
  clearTimeout(searchTimer); searchTimer = setTimeout(async () => { POSTS = await fetchPosts(q); renderPosts(POSTS); }, 250);
});
clearSearch?.addEventListener('click', async () => { if (searchInput) searchInput.value = ''; POSTS = await fetchPosts(''); renderPosts(POSTS); });

// Category filter buttons (Recent / Trending / Latest)
let activeFilter = 'recent';
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter || 'recent';
    // re-run using already fetched POSTS; if POSTS empty, fetch first
    if (!POSTS.length) POSTS = await fetchPosts('');
    applyFilters();
  });
});

async function applyFilters(){
  let list = POSTS.slice();
  // text search from input
  const q = (searchInput?.value || '').trim().toLowerCase();
  if (q) list = list.filter(p => (p.title + ' ' + p.excerpt + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q));

  // category filters
  if (activeFilter === 'recent'){
    list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (activeFilter === 'trending'){
    list.sort((a,b) => (b.views||0) - (a.views||0));
  } else if (activeFilter === 'latest'){
    const cutoff = Date.now() - (30*24*60*60*1000);
    list = list.sort((a,b) => {
      const aNew = new Date(a.createdAt).getTime() > cutoff ? 1:0;
      const bNew = new Date(b.createdAt).getTime() > cutoff ? 1:0;
      return bNew - aNew || new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  renderPosts(list);
}

// nav hamburger
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open'); navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// initial load
loadInitial();

// UX niceties
window.addEventListener('scroll', () => { document.querySelectorAll('.post-card').forEach((el) => { const rect = el.getBoundingClientRect(); if (rect.top < window.innerHeight * 0.9) el.classList.add('visible'); }); });

// periodic time update
setInterval(()=>{ document.querySelectorAll('.post-meta span:nth-child(2)').forEach((node, i)=>{ node.textContent = timeAgo(POSTS[i]?.createdAt || new Date()); }); }, 60000);
