// DOM helpers
    const $ = id => document.getElementById(id);
    let generatedContentText = '';

    // Loading dots animation (JS based)
    const dotsEl = $('loadingDots');
    if (dotsEl) {
      let dots = 0;
      setInterval(() => {
        dots = (dots + 1) % 4;
        dotsEl.textContent = '.'.repeat(dots);
      }, 500);
    }

    // Dark mode from OS preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      document.documentElement.classList.toggle('dark', e.matches);
    });

    // Safe Poe wrapper — guard if runtime missing
    function poeAvailable() {
      return typeof window.Poe === 'object' && typeof window.Poe.sendUserMessage === 'function';
    }

    // Form submit
    document.getElementById('contentForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      await generateContent();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      document.getElementById('contentForm').reset();
      hideResults();
    });

    document.getElementById('regenerateBtn').addEventListener('click', async () => {
      await generateContent();
    });

    document.getElementById('copyBtn').addEventListener('click', async () => {
      if (!generatedContentText) {
        showToast('No content to copy', 3000);
        return;
      }
      try {
        await navigator.clipboard.writeText(generatedContentText);
        showToast('Content copied to clipboard!', 3000);
      } catch (err) {
        showToast('Copy failed — please copy manually', 4000);
      }
    });

    // Show toast
    function showToast(msg, duration = 3000) {
      const el = document.getElementById('toast');
      el.innerHTML = `<div class="bg-gray-900 text-white px-4 py-2 rounded shadow">${msg}</div>`;
      el.classList.remove('invisible');
      el.style.opacity = '1';
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.classList.add('invisible'), 400);
      }, duration);
    }

    // UI helpers
    function showLoading() {
      $('loadingState').classList.remove('hidden');
      $('loadingState').setAttribute('aria-hidden', 'false');
      const btn = $('generateBtn');
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.querySelector('.btn-label').textContent = 'Generating...';
    }
    function hideLoading() {
      $('loadingState').classList.add('hidden');
      $('loadingState').setAttribute('aria-hidden', 'true');
      const btn = $('generateBtn');
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.querySelector('.btn-label').textContent = 'Generate Marketing Content';
    }
    function showResults() {
      $('resultsSection').classList.remove('hidden');
      $('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }
    function hideResults() {
      $('resultsSection').classList.add('hidden');
    }

    function showError(msg) {
      hideLoading();
      showToast(msg, 5000);
    }

    // Core generation function
    async function generateContent() {
      const companyName = $('companyName').value.trim();
      const industry = $('industry').value.trim();
      const websiteUrl = $('websiteUrl').value.trim();
      const contentType = $('contentType').value;
      const targetAudience = $('targetAudience').value.trim();

      if (!companyName || !websiteUrl) {
        showToast('Please fill in the company name and website URL or content.', 4000);
        return;
      }

      // map
      const contentTypeMap = {
        'blog': 'blog post',
        'social': 'social media post',
        'email': 'email marketing content',
        'product': 'product description',
        'press': 'press release'
      };

      // prompt (you can adapt for your LLM)
      const prompt = `Analyze the following company info and website/content and produce a well-structured, persuasive ${contentTypeMap[contentType]} optimized for engagement and conversions.

Company: ${companyName}
Industry: ${industry || 'Not specified'}
Website/Content: ${websiteUrl}
Target Audience: ${targetAudience || 'General audience'}

Requirements:
1. Highlight key value propositions from the website/content.
2. Use persuasive marketing language appropriate for the target audience.
3. Include a strong call-to-action.
4. Keep sections and headings and produce final output as Markdown.`;

      showLoading();
      hideResults();

      // If Poe runtime exists, use streaming handler. Otherwise, attempt a fallback (this depends on your backend).
      if (poeAvailable()) {
        try {
          // register handler if not already (safe guard)
          if (window.Poe && !window._contentGeneratorRegistered) {
            window.Poe.registerHandler('content-generator', (result) => {
              const response = result.responses && result.responses[0];
              if (!response) return;
              if (response.status === 'error') {
                showError('Error generating content: ' + (response.statusText || 'unknown'));
                return;
              }
              if (response.status === 'incomplete') {
                // streaming update
                $('generatedContent').innerHTML = marked.parse(response.content || '');
                generatedContentText = response.content || '';
              } else if (response.status === 'complete') {
                hideLoading();
                $('generatedContent').innerHTML = marked.parse(response.content || '');
                generatedContentText = response.content || '';
                $('generatedContent').classList.add('fade-in');
                showResults();
              }
            });
            window._contentGeneratorRegistered = true;
          }

          // send user message
          await window.Poe.sendUserMessage(prompt, { handler: 'content-generator', stream: true, openChat: false });
        } catch (err) {
          console.error(err);
          showError('Failed to generate content with Poe runtime.');
        }
      } else {
        // No Poe — fallback: try calling a server endpoint (replace /api/generate with your endpoint)
        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
          });
          if (!res.ok) throw new Error('Server error: ' + res.status);
          const data = await res.json();
          // expected { content: '...' }
          hideLoading();
          const content = data.content || 'No content returned.';
          $('generatedContent').innerHTML = marked.parse(content);
          generatedContentText = content;
          $('generatedContent').classList.add('fade-in');
          showResults();
        } catch (err) {
          console.error(err);
          showError('No LLM runtime found (Poe not available). If you use Poe, make sure its client script is loaded. Alternatively wire /api/generate on your backend.');
        }
      }
    }