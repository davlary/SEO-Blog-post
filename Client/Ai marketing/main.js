// Lightweight DOM helper and cached elements
const $ = id => document.getElementById(id);
let generatedContentText = '';

// Configurable API base — allows overriding via window.API_BASE; defaults to same-origin '/api'
const API_BASE = (window.API_BASE || '/api');

const els = {
  form: $('contentForm'),
  generateBtn: $('generateBtn'),
  clearBtn: $('clearBtn'),
  regenerateBtn: $('regenerateBtn'),
  copyBtn: $('copyBtn'),
  loadingState: $('loadingState'),
  loadingDots: $('loadingDots'),
  generatedContent: $('generatedContent'),
  resultsSection: $('resultsSection'),
  toast: $('toast'),
  llmStatus: $('llmStatus'),
  year: $('year')
};

// small init
(function init() {
  // set year in footer if present
  if (els.year) els.year.textContent = new Date().getFullYear();

  // loading dots
  if (els.loadingDots) {
    let dots = 0;
    setInterval(() => (els.loadingDots.textContent = '.'.repeat((dots = (dots + 1) % 4))), 500);
  }

  // theme from OS
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }

  // event listeners
  els.form?.addEventListener('submit', onSubmit);
  els.clearBtn?.addEventListener('click', onClear);
  els.regenerateBtn?.addEventListener('click', () => onSubmit(new Event('submit')));
  els.copyBtn?.addEventListener('click', onCopy);
})();

// Check server and LLM availability and update the small status badge
async function checkLLMStatus() {
  const badge = els.llmStatus;
  if (!badge) return;
  badge.textContent = 'Checking AI runtime…';
  // quick server ping
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const r = await fetch(`${API_BASE}/`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error('server ping failed');
    // server alive — now check generate endpoint quickly with short timeout
    try {
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), 2500);
      const rr = await fetch(`${API_BASE}/generate`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ prompt: 'healthcheck' }), signal: ctrl2.signal });
      clearTimeout(t2);
      if (rr.ok) {
        badge.textContent = 'AI runtime: available';
        badge.style.color = 'var(--accent-1)';
        return;
      }
      throw new Error('generate failed');
    } catch (e) {
      badge.textContent = 'AI runtime: unavailable';
      badge.style.color = '#ef4444';
      return;
    }
  } catch (err) {
    badge.textContent = 'Server: offline';
    badge.style.color = '#ef4444';
  }
}

// run initial status check
setTimeout(checkLLMStatus, 400);

function showToast(msg, duration = 3000) {
  if (!els.toast) return;
  els.toast.innerHTML = `<div class="bg-gray-900 text-white px-4 py-2 rounded shadow">${msg}</div>`;
  els.toast.classList.remove('invisible');
  els.toast.style.opacity = '1';
  setTimeout(() => {
    els.toast.style.opacity = '0';
    setTimeout(() => els.toast.classList.add('invisible'), 400);
  }, duration);
}

function setLoading(loading = true) {
  if (!els.loadingState || !els.generateBtn) return;
  els.loadingState.classList.toggle('hidden', !loading);
  els.loadingState.setAttribute('aria-hidden', (!loading).toString());
  els.generateBtn.disabled = loading;
  els.generateBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
  const label = els.generateBtn.querySelector('.btn-label');
  if (label) label.textContent = loading ? 'Generating...' : 'Generate Marketing Content';
}

function showResults() {
  els.resultsSection?.classList.remove('hidden');
  els.resultsSection?.scrollIntoView({ behavior: 'smooth' });
}

function hideResults() {
  els.resultsSection?.classList.add('hidden');
}

function showError(msg) {
  setLoading(false);
  showToast(msg, 5000);
}

function onClear() {
  els.form?.reset();
  hideResults();
}

async function onCopy() {
  if (!generatedContentText) return showToast('No content to copy', 3000);
  try {
    await navigator.clipboard.writeText(generatedContentText);
    showToast('Content copied to clipboard!', 3000);
  } catch (e) {
    showToast('Copy failed — copy manually', 4000);
  }
}

function buildPrompt({ companyName, industry, websiteUrl, contentType, targetAudience }) {
  const contentTypeMap = {
    blog: 'blog post',
    social: 'social media post',
    email: 'email marketing content',
    product: 'product description',
    press: 'press release'
  };
  return `Analyze the following company info and website/content and produce a well-structured, persuasive ${contentTypeMap[contentType] || 'marketing piece'} optimized for engagement and conversions.\n\nCompany: ${companyName}\nIndustry: ${industry || 'Not specified'}\nWebsite/Content: ${websiteUrl}\nTarget Audience: ${targetAudience || 'General audience'}\n\nRequirements:\n1. Highlight key value propositions from the website/content.\n2. Use persuasive marketing language appropriate for the target audience.\n3. Include a strong call-to-action.\n4. Provide headings and produce final output as Markdown.`;
}

// detect if Poe runtime is available
function poeAvailable() {
  return typeof window.Poe === 'object' && typeof window.Poe.sendUserMessage === 'function';
}

async function onSubmit(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();

  const companyName = $('companyName')?.value.trim() || '';
  const industry = $('industry')?.value.trim() || '';
  const websiteUrl = $('websiteUrl')?.value.trim() || '';
  const contentType = $('contentType')?.value || 'blog';
  const targetAudience = $('targetAudience')?.value.trim() || '';

  if (!companyName || !websiteUrl) return showToast('Please fill in the company name and website URL or content.', 4000);

  const prompt = buildPrompt({ companyName, industry, websiteUrl, contentType, targetAudience });

  setLoading(true);
  hideResults();

  // prefer Poe streaming if available
  if (poeAvailable()) {
    try {
      if (window.Poe && !window._contentGeneratorRegistered) {
        window.Poe.registerHandler('content-generator', (result) => {
          const response = result.responses && result.responses[0];
          if (!response) return;
          if (response.status === 'error') return showError('Error generating content: ' + (response.statusText || 'unknown'));
          if (response.status === 'incomplete') {
            els.generatedContent.innerHTML = marked.parse(response.content || '');
            generatedContentText = response.content || '';
          } else if (response.status === 'complete') {
            setLoading(false);
            els.generatedContent.innerHTML = marked.parse(response.content || '');
            generatedContentText = response.content || '';
            els.generatedContent.classList.add('fade-in');
            showResults();
          }
        });
        window._contentGeneratorRegistered = true;
      }

      await window.Poe.sendUserMessage(prompt, { handler: 'content-generator', stream: true, openChat: false });
    } catch (err) {
      console.error(err);
      showError('Failed to generate content with Poe runtime.');
    }

    return;
  }

  // fallback: call backend endpoint /api/generate (expects { result|content })
  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('Server error: ' + res.status);
    const data = await res.json();
    setLoading(false);
    const content = data.content || data.result || (typeof data === 'string' ? data : 'No content returned.');
    els.generatedContent.innerHTML = marked.parse(content);
    generatedContentText = content;
    els.generatedContent.classList.add('fade-in');
    showResults();
  } catch (err) {
    console.error(err);
    showError('No LLM runtime found (Poe not available). If you use Poe, make sure its client script is loaded. Alternatively wire /api/generate on your backend.');
  }
}