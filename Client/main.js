/********* Sample static posts (5) - mixed niches *********/
    const posts = [
      {
        id: 'p1',
        title: 'Top 14 AI Models in 2025 for Businesses to Watch',
        category: 'design',
        tags: ['design','creativity'],
        excerpt: ' The strongest AI models don’t just process data; they think, reason, and create. Some talk like humans, some decode complex logic, and others write code like expert engineers.',
        img: 'https://images.unsplash.com/photo-1495555687390-26b8a0b66b9a?w=1200&q=80',
        createdAt: '2025-10-01T10:15:00Z',
        views: 2300,
        readMore: 'https://www.thinkstack.ai/blog/best-ai-models/'
      },
      {
        id: 'p2',
        title: '10 Tech Facts That Sound Like Sci-Fi (But Are Real)',
        category: 'tech',
        tags: ['tech','ai'],
        excerpt: 'From neural networks to quantum quirks — these tech facts will make you feel like you’re living in the future already.',
        img: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&q=80',
        createdAt: '2025-09-28T08:30:00Z',
        views: 4700,
        readMore: 'https://example.com/tech-facts'
      },
      {
        id: 'p3',
        title: '10 Business Facts That Successful Founders Swear By',
        category: 'business',
        tags: ['business','strategy'],
        excerpt: 'Revenue rules and counterintuitive habits of top founders — short truths that help you cut through noise and build better products.',
        img: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&q=80',
        createdAt: '2025-09-15T12:00:00Z',
        views: 3200,
        readMore: 'https://example.com/business-facts'
      },
      {
        id: 'p4',
        title: '10 Bookish Facts That Make Reading a Superpower',
        category: 'books',
        tags: ['books','learning'],
        excerpt: 'Reading rewires how you think. These ten facts show why reading consistently is the highest ROI habit for creators and leaders.',
        img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80',
        createdAt: '2025-10-05T07:20:00Z',
        views: 1500,
        readMore: 'https://example.com/book-facts'
      },
      {
        id: 'p5',
        title: '10 Growth Hacks That Feel Unfair (But Work)',
        category: 'hacks',
        tags: ['growth','marketing'],
        excerpt: 'Tactical, ethical growth ideas you can apply today — from clever copy tweaks to product hook hacks that increase retention.',
        img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
        createdAt: '2025-09-05T16:45:00Z',
        views: 5400,
        readMore: 'https://example.com/growth-hacks'
      }
    ];

    /* ===== Utilities ===== */
    const formatTimeAgo = (iso) => {
      const t = new Date(iso).getTime();
      const now = Date.now();
      const diff = Math.floor((now - t) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
      if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
      return new Date(iso).toLocaleDateString();
    };

    /* ===== Render posts ===== */
    const postsGrid = document.getElementById('postsGrid');
    const emptyState = document.getElementById('emptyState');

    function createPostCard(post){
      const wrapper = document.createElement('article');
      wrapper.className = 'post-card';
      wrapper.setAttribute('data-id', post.id);
      wrapper.innerHTML = `
        <div class="post-media" aria-hidden="true">
          <img src="${post.img}" alt="${escapeHtml(post.title)}">
        </div>
        <div class="post-body">
          <div class="post-meta"><span class="tag">${post.category.toUpperCase()}</span><span>${formatTimeAgo(post.createdAt)}</span><span>• ${post.views.toLocaleString()} views</span></div>
          <h3 class="post-title">${escapeHtml(post.title)}</h3>
          <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>

          <div class="comments" aria-live="polite">
            <div class="comment-list" id="comments-${post.id}"></div>

            <form class="comment-form" onsubmit="return false">
              <input placeholder='Leave a quick comment...' id="input-${post.id}" required />
              <button type="button" data-post="${post.id}" class="cbtn">Comment</button>
            </form>
          </div>

          <div class="post-actions">
            <a class="readmore" href="${post.readMore}" target="_blank" rel="noopener">Read more</a>
          </div>
        </div>
      `;
      return wrapper;
    }

    // safe text
    function escapeHtml(text){
      return (text+'').replace(/[&<>"'`=\/]/g, function(s){ return ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
      })[s];});
    }

    /* render initial */
    function renderList(list){
      postsGrid.innerHTML = '';
      if(!list.length){ emptyState.style.display = 'block'; return; }
      emptyState.style.display = 'none';
      list.forEach(p => {
        postsGrid.appendChild(createPostCard(p));
      });

      // after insertion, show animation and bind comment handlers
      requestAnimationFrame(()=> {
        document.querySelectorAll('.post-card').forEach((el,i)=> {
          setTimeout(()=> el.classList.add('visible'), 80*i);
        });
      });

      // populate saved comments
      list.forEach(p => loadComments(p.id));
      // attach comment button handlers
      document.querySelectorAll('.cbtn').forEach(btn => {
        btn.onclick = () => {
          const postId = btn.dataset.post;
          const input = document.getElementById('input-'+postId);
          const text = input.value.trim();
          if(!text) return;
          addComment(postId, text);
          input.value = '';
        };
      });
    }

    /* ===== Simple comment store (localStorage) ===== */
    function commentsKey(postId){ return `comments_${postId}`; }
    function loadComments(postId){
      const node = document.getElementById('comments-'+postId);
      const raw = localStorage.getItem(commentsKey(postId));
      let arr = [];
      try{ arr = raw ? JSON.parse(raw) : []; } catch(e){ arr = []; }
      node.innerHTML = '';
      if(arr.length === 0){
        node.innerHTML = '<div style="color:var(--muted);font-size:13px">No comments yet — be the first.</div>';
        return;
      }
      arr.forEach(c => {
        const el = document.createElement('div');
        el.className = 'comment';
        el.innerHTML = `<small>${escapeHtml(c.name)} • ${formatTimeAgo(c.ts)}</small><div>${escapeHtml(c.text)}</div>`;
        node.appendChild(el);
      });
    }
    function addComment(postId, text){
      const key = commentsKey(postId);
      const raw = localStorage.getItem(key);
      let arr = raw ? JSON.parse(raw) : [];
      const comment = { name: 'Guest', text, ts: new Date().toISOString() };
      arr.unshift(comment);
      localStorage.setItem(key, JSON.stringify(arr.slice(0,30))); // keep recent 30
      loadComments(postId);
    }

    // Comment Feature (simple static)
      document.querySelectorAll('.comment-btn').forEach(button => {
      button.addEventListener('click', function() {
      const container = this.parentElement.querySelector('.comment-box');
      container.classList.toggle('show');
    });
  });

    document.querySelectorAll('.comment-box form').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const input = this.querySelector('input');
    const commentList = this.parentElement.querySelector('.comment-list');
    if (input.value.trim() !== '') {
      const li = document.createElement('li');
      li.textContent = input.value;
      commentList.appendChild(li);
      input.value = '';
    }
  });
});

    /* ===== Filtering & Search ===== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    let activeFilter = 'recent';
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    // categories dropdown
    const catBtn = document.getElementById('catBtn');
    const dropMenu = document.getElementById('dropMenu');
    catBtn.addEventListener('click', e => {
      const open = dropMenu.style.display === 'flex';
      dropMenu.style.display = open ? 'none' : 'flex';
      catBtn.setAttribute('aria-expanded', !open);
      dropMenu.setAttribute('aria-hidden', open);
    });
    dropMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = a.dataset.cat;
        // apply category as search token
        searchState.category = cat === 'all' ? '' : cat;
        applyFilters();
        dropMenu.style.display = 'none';
      });
    });

    // simple search
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const searchState = { q:'', category:'' };

    searchInput.addEventListener('input', e => {
      searchState.q = e.target.value.trim().toLowerCase();
      applyFilters();
    });
    clearSearch.addEventListener('click', () => {
      searchInput.value = ''; searchState.q = ''; applyFilters();
    });

    function applyFilters(){
      let list = posts.slice();

      // filter by category (news/tech/business/books/hacks/design)
      if(searchState.category){
        list = list.filter(p => p.category === searchState.category || (p.tags && p.tags.includes(searchState.category)));
      }

      // text search on title/excerpt/tags
      if(searchState.q){
        list = list.filter(p => {
          const hay = (p.title + ' ' + p.excerpt + ' ' + (p.tags||[]).join(' ')).toLowerCase();
          return hay.includes(searchState.q);
        });
      }

      // filter by 'recent' 'trending' 'latest'
      if(activeFilter === 'recent'){
        // recent = sort by createdAt desc
        list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if(activeFilter === 'trending'){
        // trending = sort by views desc
        list.sort((a,b) => b.views - a.views);
      } else if(activeFilter === 'latest'){
        // latest = created within last 30 days first
        const cutoff = Date.now() - (30*24*60*60*1000);
        list = list.sort((a,b) => {
          const aNew = new Date(a.createdAt).getTime() > cutoff ? 1:0;
          const bNew = new Date(b.createdAt).getTime() > cutoff ? 1:0;
          return bNew - aNew || new Date(b.createdAt) - new Date(a.createdAt);
        });
      }

      renderList(list);
    }

    // initial
    applyFilters();

    // close dropdown on outside click
    document.addEventListener('click', (e) => {
      if(!catBtn.contains(e.target) && !dropMenu.contains(e.target)){
        dropMenu.style.display = 'none';
        catBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // lazy re-run display for timeago updates every minute
    setInterval(()=>{
      document.querySelectorAll('.post-card .post-meta span:nth-child(2)').forEach((node, idx) => {
        // update based on posts order in DOM
        const parent = node.closest('.post-card');
        if(parent){
          const id = parent.getAttribute('data-id');
          const p = posts.find(x=>x.id===id);
          if(p) node.textContent = formatTimeAgo(p.createdAt);
        }
      });
    }, 60000);


    // Read More Buttons (redirect)
document.querySelectorAll('.read-more').forEach(button => {
  button.addEventListener('click', function() {
    const link = this.getAttribute('data-link');
    if (link) window.open(link, '_blank');
  });
});

// Scroll Animation for Cards
const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.85;
  posts.forEach(post => {
    const top = post.getBoundingClientRect().top;
    if (top < trigger) post.classList.add('visible');
  });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// Simulated time updates
function updatePostTimes() {
  const times = document.querySelectorAll('.post-time');
  times.forEach(time => {
    const hoursAgo = Math.floor(Math.random() * 48) + 1;
    time.textContent = `⏱ ${hoursAgo} hours ago`;
  });
}
updatePostTimes();

// ===== AdSense Placeholder (for your ad slots) =====
// When you're ready, replace <div class="ad-block"></div> with your AdSense code
document.querySelectorAll('.ad-block').forEach((ad, index) => {
  ad.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:#888;">Advertisement Placeholder #${index + 1}</p>`;
});