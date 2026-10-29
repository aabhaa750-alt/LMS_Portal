// Settings & System Backup View
const SettingsView = {
  async render() {
    return `
      <div class="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Application Settings &amp; Data</h1>
          <p class="text-xs text-slate-500 mt-1">Configure your personal hub, review disk storage, and manage offline data backups</p>
        </div>

        <!-- System Storage & Database Status -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Storage &amp; Local Persistence</h2>
              <p class="text-xs text-slate-500">All data and files are persistently stored on your MacBook</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 status-pulse"></span>
              Local &amp; Secure
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" id="storage-metrics-cards">
            ${renderLoadingState('Calculating storage consumption...')}
          </div>

          <div class="bg-slate-50 rounded-xl p-4 space-y-2 text-xs font-mono text-slate-600 border border-slate-200">
            <div><strong>Database File:</strong> <span id="storage-db-path">-</span></div>
            <div><strong>Uploads Directory:</strong> <span id="storage-uploads-path">-</span></div>
          </div>
        </div>

        <!-- 1-Click Backup & Recovery -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <h2 class="text-sm font-bold text-slate-900">Data Backup &amp; Offline Export</h2>
              <p class="text-xs text-slate-500 max-w-xl leading-relaxed">
                Download a complete, timestamped ZIP archive containing your entire SQLite database (<code class="bg-slate-100 px-1 py-0.5 rounded text-[11px]">lms.db</code>) and all uploaded course materials. Keep this archive on an external drive or cloud drive for complete peace of mind.
              </p>
            </div>
            <a href="${API.system.backupUrl()}" download class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors shrink-0">
              ${getIcon('download', 'w-4 h-4')}
              Download Full Backup (.zip)
            </a>
          </div>

          <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 space-y-1">
            <div class="font-bold flex items-center gap-1.5">
              ${getIcon('check-circle', 'w-3.5 h-3.5 text-blue-600')}
              How to restore your data from a backup:
            </div>
            <ol class="list-decimal pl-4 space-y-0.5 text-blue-800">
              <li>Unzip the downloaded backup archive on your machine.</li>
              <li>Copy <code class="bg-white/80 px-1 rounded">database/lms.db</code> into the <code class="bg-white/80 px-1 rounded">data/</code> directory.</li>
              <li>Copy all files from <code class="bg-white/80 px-1 rounded">uploads/</code> into the <code class="bg-white/80 px-1 rounded">data/uploads/</code> directory.</li>
              <li>Restart the application server. All your courses, documents, notes, and progress will be instantly restored.</li>
            </ol>
          </div>
        </div>

        <!-- Starter Demo Data Management -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <h2 class="text-sm font-bold text-slate-900">Demo Curriculum Tools</h2>
              <p class="text-xs text-slate-500 max-w-xl">
                Load starter core MBA curriculum subjects (Managerial Economics, Financial Accounting, Marketing Management, Product Management, Analytics) if you want ready-to-use subjects and units.
              </p>
            </div>
            <button id="btn-settings-seed-demo" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0">
              ${getIcon('sparkles', 'w-3.5 h-3.5 text-amber-500')}
              Seed MBA Subjects
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadStorageInfo();

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
