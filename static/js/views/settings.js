// Settings & System Backup View
const SettingsView = {
  async render() {
    return `
      <div class="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
        <!-- Header -->
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-800 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            System &amp; Intelligence Infrastructure
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Application Settings &amp; Data</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">Configure your personal hub, review disk storage, and manage offline data backups</p>
        </div>

        <!-- AI Learning Assistant Configuration & Intelligence Engine -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
                ${getIcon('brain', 'w-4 h-4')}
              </div>
              <div>
                <h2 class="text-sm font-bold text-slate-900 tracking-tight">AI Intelligence Engine &amp; API Configuration</h2>
                <p class="text-xs text-slate-500">Configure language models and manage slide indexing for grounded answers</p>
              </div>
            </div>
            <div id="settings-ai-status-badge">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400 status-pulse"></span>
                Checking...
              </span>
            </div>
          </div>

          <!-- AI Status Overview Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5" id="settings-ai-metric-cards">
            <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Indexed Slide Chunks</span>
              <div class="text-lg font-extrabold text-slate-900 tracking-tight" id="settings-ai-chunks-count">-</div>
              <p class="text-[10px] text-slate-500 font-medium">PPT slides &amp; PDF pages searchable</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">LLM Provider</span>
              <div class="text-lg font-extrabold text-slate-900 tracking-tight" id="settings-ai-provider-name">-</div>
              <p class="text-[10px] text-slate-500 font-medium" id="settings-ai-model-name">-</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Synthesis Engine</span>
              <div class="text-lg font-extrabold text-indigo-700 tracking-tight">Slide-Grounded</div>
              <p class="text-[10px] text-slate-500 font-medium">Exact presentation slide citations</p>
            </div>
          </div>

          <!-- OpenAI API Key Management -->
          <div class="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3.5">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h3 class="text-xs font-bold text-indigo-950 tracking-tight">OpenAI API Key (Optional)</h3>
                <p class="text-xs text-indigo-900/80 leading-relaxed font-normal">
                  Connect your OpenAI API key to enable GPT-4o-mini for conversational responses. If no key is set, the LMS uses the local grounded synthesis engine that indexes and searches your classroom PPT/PDF slides offline.
                </p>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-2.5">
              <input id="settings-ai-key-input" type="password" placeholder="sk-proj-..."
                class="w-full sm:flex-1 px-3.5 py-2.5 bg-white border border-indigo-200/80 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all">
              <button id="settings-save-key-btn" class="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all hover:shadow-sm cursor-pointer shrink-0">
                Save API Key
              </button>
              <button id="settings-clear-key-btn" class="w-full sm:w-auto px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer shrink-0">
                Clear
              </button>
            </div>
          </div>

          <!-- Slide & PDF Re-indexing Engine -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 gap-4">
            <div class="space-y-0.5">
              <h3 class="text-xs font-bold text-slate-900">Study Materials Search Index</h3>
              <p class="text-xs text-slate-500 font-normal leading-relaxed">
                Scan all uploaded presentations and documents, extract slide text, and update the search index used by the AI Study Assistant.
              </p>
            </div>
            <button id="settings-reindex-btn" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0">
              ${getIcon('refresh', 'w-3.5 h-3.5 text-indigo-600')}
              <span>Re-index Decks</span>
            </button>
          </div>
        </div>

        <!-- System Storage & Database Status -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7 space-y-4">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <h2 class="text-sm font-bold text-slate-900 tracking-tight">Storage &amp; Local Persistence</h2>
              <p class="text-xs text-slate-500">All data and files are persistently stored on your MacBook</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 status-pulse"></span>
              Local &amp; Secure
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" id="storage-metrics-cards">
            ${renderLoadingState('Calculating storage consumption...')}
          </div>

          <div class="bg-slate-50/80 rounded-xl p-4 space-y-2 text-xs font-mono text-slate-600 border border-slate-200/70">
            <div><strong>Database File:</strong> <span id="storage-db-path" class="text-slate-800">-</span></div>
            <div><strong>Uploads Directory:</strong> <span id="storage-uploads-path" class="text-slate-800">-</span></div>
          </div>
        </div>

        <!-- 1-Click Backup & Recovery -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div class="space-y-1">
              <h2 class="text-sm font-bold text-slate-900 tracking-tight">Data Backup &amp; Offline Export</h2>
              <p class="text-xs text-slate-500 max-w-xl leading-relaxed font-normal">
                Download a complete, timestamped ZIP archive containing your entire SQLite database (<code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">lms.db</code>) and all uploaded course materials. Keep this archive on an external drive or cloud drive for complete peace of mind.
              </p>
            </div>
            <a href="${API.system.backupUrl()}" download class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all hover:shadow-sm cursor-pointer shrink-0">
              ${getIcon('download', 'w-4 h-4')}
              <span>Download Full Backup (.zip)</span>
            </a>
          </div>

          <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 space-y-1.5">
            <div class="font-bold flex items-center gap-2 text-blue-950">
              ${getIcon('check-circle', 'w-4 h-4 text-blue-600')}
              <span>How to restore your data from a backup:</span>
            </div>
            <ol class="list-decimal pl-5 space-y-1 text-blue-900/90 leading-relaxed font-normal">
              <li>Unzip the downloaded backup archive on your machine.</li>
              <li>Copy <code class="bg-white/90 px-1 py-0.5 rounded font-mono text-[11px]">database/lms.db</code> into the <code class="bg-white/90 px-1 py-0.5 rounded font-mono text-[11px]">data/</code> directory.</li>
              <li>Copy all files from <code class="bg-white/90 px-1 py-0.5 rounded font-mono text-[11px]">uploads/</code> into the <code class="bg-white/90 px-1 py-0.5 rounded font-mono text-[11px]">data/uploads/</code> directory.</li>
              <li>Restart the application server. All your courses, documents, notes, and progress will be instantly restored.</li>
            </ol>
          </div>
        </div>

        <!-- Starter Demo Data Management -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div class="space-y-1">
              <h2 class="text-sm font-bold text-slate-900 tracking-tight">Demo Curriculum Tools</h2>
              <p class="text-xs text-slate-500 max-w-xl font-normal leading-relaxed">
                Load starter core MBA curriculum subjects (Managerial Economics, Financial Accounting, Marketing Management, Product Management, Analytics) if you want ready-to-use subjects and units.
              </p>
            </div>
            <button id="btn-settings-seed-demo" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer shrink-0">
              ${getIcon('sparkles', 'w-3.5 h-3.5 text-amber-500')}
              <span>Seed MBA Subjects</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadStorageInfo();
    await this.loadAiStatus();

    // Save AI Key
    const saveKeyBtn = document.getElementById('settings-save-key-btn');
    if (saveKeyBtn) {
      saveKeyBtn.onclick = async () => {
        const input = document.getElementById('settings-ai-key-input');
        const key = input.value.trim();
        if (!key) {
          showToast('Please enter a valid OpenAI API key or use Clear.', 'warning');
          return;
        }
        try {
          saveKeyBtn.disabled = true;
          saveKeyBtn.textContent = 'Saving...';
          const res = await API.ai.updateApiKey({ openai_api_key: key });
          showToast(res.message, 'success');
          input.value = '';
          await SettingsView.loadAiStatus();
        } catch (err) {
          showToast('Failed to save API key: ' + err.message, 'error');
        } finally {
          saveKeyBtn.disabled = false;
          saveKeyBtn.textContent = 'Save API Key';
        }
      };
    }

    // Clear AI Key
    const clearKeyBtn = document.getElementById('settings-clear-key-btn');
    if (clearKeyBtn) {
      clearKeyBtn.onclick = async () => {
        try {
          const res = await API.ai.updateApiKey({ openai_api_key: null });
          showToast(res.message, 'info');
          document.getElementById('settings-ai-key-input').value = '';
          await SettingsView.loadAiStatus();
        } catch (err) {
          showToast(err.message, 'error');
        }
      };
    }

    // Reindex Decks Button
    const reindexBtn = document.getElementById('settings-reindex-btn');
    if (reindexBtn) {
      reindexBtn.onclick = async () => {
        try {
          reindexBtn.disabled = true;
          reindexBtn.innerHTML = `${getIcon('refresh', 'w-3.5 h-3.5 text-indigo-600 animate-spin')}<span>Indexing slides...</span>`;
          showToast('Scanning all PPTX presentations and PDF documents...', 'info');
          const res = await API.ai.indexAll();
          showToast(res.message, 'success');
          await SettingsView.loadAiStatus();
        } catch (err) {
          showToast('Indexing error: ' + err.message, 'error');
        } finally {
          reindexBtn.disabled = false;
          reindexBtn.innerHTML = `${getIcon('refresh', 'w-3.5 h-3.5 text-indigo-600')}<span>Re-index Decks</span>`;
        }
      };
    }

    document.getElementById('btn-settings-seed-demo').onclick = () => {
      showConfirmModal({
        title: 'Seed MBA Starter Subjects?',
        message: 'This will add core MBA subjects with initial syllabus topics to your profile if you don\'t have existing courses.',
        confirmText: 'Seed Data',
        onConfirm: async () => {
          try {
            const res = await API.system.seedDemo();
            showToast(res.message, 'success');
            await SettingsView.loadStorageInfo();
          } catch (e) {
            showToast(e.message, 'error');
          }
        }
      });
    };
  },

  async loadAiStatus() {
    try {
      const status = await API.ai.getStatus();

      // Badge
      const badge = document.getElementById('settings-ai-status-badge');
      if (badge) {
        if (status.openai_configured) {
          badge.innerHTML = `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 status-pulse"></span>
              OpenAI GPT-4o-mini Connected
            </span>
          `;
        } else {
          badge.innerHTML = `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600 status-pulse"></span>
              Local Slide Search Engine (Offline)
            </span>
          `;
        }
      }

      // Metrics
      const countEl = document.getElementById('settings-ai-chunks-count');
      if (countEl) countEl.textContent = `${status.indexed_chunks_count} chunks`;

      const providerEl = document.getElementById('settings-ai-provider-name');
      if (providerEl) providerEl.textContent = status.openai_configured ? 'OpenAI' : 'Local Extraction';

      const modelEl = document.getElementById('settings-ai-model-name');
      if (modelEl) modelEl.textContent = status.model_name || 'Grounding Engine';

      const keyInput = document.getElementById('settings-ai-key-input');
      if (keyInput) {
        if (status.openai_configured) {
          keyInput.placeholder = status.masked_key || '•••••••••••••••• (API Key Active)';
        } else {
          keyInput.placeholder = 'Paste sk-proj-... or sk-... here';
        }
      }
    } catch (err) {
      console.warn('Failed to load AI status:', err);
    }
  },

  async loadStorageInfo() {
    const cardsContainer = document.getElementById('storage-metrics-cards');
    try {
      const stats = await API.system.getStorageInfo();

      cardsContainer.innerHTML = `
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Database Size</span>
          <div class="text-xl font-extrabold text-slate-900 mt-1">${stats.db_size_human}</div>
          <p class="text-[11px] text-slate-400 mt-1">SQLite ACID records</p>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uploads Directory</span>
          <div class="text-xl font-extrabold text-slate-900 mt-1">${stats.uploads_size_human}</div>
          <p class="text-[11px] text-slate-400 mt-1">${stats.upload_files_count} files stored</p>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Academic Records</span>
          <div class="text-xl font-extrabold text-slate-900 mt-1">${stats.user_courses} courses, ${stats.user_resources} docs</div>
          <p class="text-[11px] text-slate-400 mt-1">${stats.user_notes} notes, ${stats.user_tasks} tasks</p>
        </div>
      `;

      document.getElementById('storage-db-path').textContent = stats.db_path;
      document.getElementById('storage-uploads-path').textContent = stats.uploads_path;
    } catch (err) {
      cardsContainer.innerHTML = `<div class="col-span-full text-xs text-rose-500">Failed to load storage details.</div>`;
    }
  }
};
