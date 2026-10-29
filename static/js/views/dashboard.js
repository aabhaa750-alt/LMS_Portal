// Main Dashboard View
const DashboardView = {
  async render() {
    return `
      <div class="space-y-8 animate-fade-in pb-12">
        <!-- Top Greeting & Header Bar -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600 status-pulse"></span>
              <span id="dash-academic-badge">MBA Curriculum</span>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900" id="dash-greeting">Loading...</h1>
            <p class="text-sm text-slate-500" id="dash-subtext">Manage, revise, and track your semester coursework.</p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button id="btn-quick-course" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              ${getIcon('plus', 'w-3.5 h-3.5')}
              Add Course
            </button>
            <button id="btn-quick-upload" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
              ${getIcon('upload', 'w-3.5 h-3.5')}
              Upload Resource
            </button>
            <button id="btn-quick-note" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              ${getIcon('file-text', 'w-3.5 h-3.5')}
              Create Note
            </button>
            <button id="btn-quick-task" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              ${getIcon('calendar', 'w-3.5 h-3.5')}
              Add Deadline
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Courses -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover">
            <div class="flex items-center justify-between text-slate-500 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Courses</span>
              <div class="p-2 rounded-xl bg-blue-50 text-blue-600">
                ${getIcon('book-open', 'w-4 h-4')}
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-slate-900" id="stat-courses">-</span>
              <span class="text-xs text-slate-500">subjects</span>
            </div>
            <p class="text-xs text-slate-400 mt-2">Hierarchically organized</p>
          </div>

          <!-- Total Resources -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover">
            <div class="flex items-center justify-between text-slate-500 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Study Resources</span>
              <div class="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                ${getIcon('folder', 'w-4 h-4')}
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-slate-900" id="stat-resources">-</span>
              <span class="text-xs text-slate-500">files</span>
            </div>
            <p class="text-xs text-slate-400 mt-2">PDFs, decks, spreadsheets</p>
          </div>

          <!-- Completed Topics -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover">
            <div class="flex items-center justify-between text-slate-500 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Topics Mastered</span>
              <div class="p-2 rounded-xl bg-purple-50 text-purple-600">
                ${getIcon('check-circle', 'w-4 h-4')}
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-slate-900" id="stat-topics">-</span>
              <span class="text-xs text-slate-500" id="stat-total-topics">of - total</span>
            </div>
            <p class="text-xs text-slate-400 mt-2">Curriculum unit progress</p>
          </div>

          <!-- Overall Learning Progress -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover">
            <div class="flex items-center justify-between text-slate-500 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Learning Progress</span>
              <div class="p-2 rounded-xl bg-amber-50 text-amber-600">
                ${getIcon('trending-up', 'w-4 h-4')}
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-slate-900" id="stat-progress">-</span>
              <span class="text-xs text-slate-500">completed</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div id="stat-progress-bar" class="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
          </div>
        </div>

        <!-- Weekly Study Goal Banner -->
        <div id="weekly-goal-container" class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-1.5 max-w-xl">
            <div class="inline-flex items-center gap-1.5 text-xs font-medium text-blue-200">
              ${getIcon('target', 'w-3.5 h-3.5')}
              <span id="goal-week-id">Weekly Study Goal</span>
            </div>
            <h3 class="text-lg font-bold" id="goal-title">Stay consistent with your academic targets</h3>
            <p class="text-xs text-blue-100 leading-relaxed" id="goal-desc">Target 5 topics per week to stay ahead before midterms.</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-2xl font-extrabold" id="goal-pct">0%</div>
              <div class="text-[11px] text-blue-200" id="goal-progress-text">0 / 5 Topics Cleared</div>
            </div>
            <button id="btn-adjust-goal" class="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm border border-white/20 transition-colors">
              Adjust Goal
            </button>
          </div>
        </div>

        <!-- Two Column Main Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left 2 Cols: Recent Resources & Access History -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Recently Added Resources -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-base font-bold text-slate-900">Recently Added Resources</h2>
                  <p class="text-xs text-slate-500">Latest course slides, notes, and case studies uploaded</p>
                </div>
                <button id="view-all-resources-btn" class="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  View Library &rarr;
                </button>
              </div>
              <div id="dash-recent-resources" class="space-y-2">
                ${renderLoadingState('Loading resources...')}
              </div>
            </div>

            <!-- Recently Accessed Resources -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-base font-bold text-slate-900">Recently Accessed (Access History)</h2>
                  <p class="text-xs text-slate-500">Resume your recent study sessions</p>
                </div>
              </div>
              <div id="dash-recent-accessed" class="space-y-2">
                ${renderLoadingState('Loading access history...')}
              </div>
            </div>

            <!-- Bookmarked Resources Quick Shelf -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-base font-bold text-slate-900">Bookmarked Quick Access</h2>
                  <p class="text-xs text-slate-500">Pinned materials for rapid exam revision</p>
                </div>
                <button id="view-all-bookmarks-btn" class="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  All Bookmarks &rarr;
                </button>
              </div>
              <div id="dash-bookmarked" class="space-y-2">
                ${renderLoadingState('Loading bookmarks...')}
              </div>
            </div>
          </div>

          <!-- Right 1 Col: Upcoming Deadlines & Tasks -->
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-base font-bold text-slate-900">Upcoming Deadlines</h2>
                  <p class="text-xs text-slate-500">Assignments, exams, and projects</p>
                </div>
                <button id="view-all-tasks-btn" class="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  All Tasks &rarr;
                </button>
              </div>
              <div id="dash-tasks-list" class="space-y-2.5">
                ${renderLoadingState('Loading upcoming deadlines...')}
              </div>
            </div>

            <!-- Quick Academic Tips Card -->
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
              <div class="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                ${getIcon('sparkles', 'w-4 h-4 text-blue-600')}
                <span>MBA Study Tip</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Connect your personal notes directly to case study PDFs. While reviewing in the Study Workspace, write your SWOT or framework notes side-by-side.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    // Quick buttons
    document.getElementById('btn-quick-course').onclick = () => window.appModals.openAddCourse();
    document.getElementById('btn-quick-upload').onclick = () => window.appModals.openUploadResource();
    document.getElementById('btn-quick-note').onclick = () => window.appModals.openCreateNote();
    document.getElementById('btn-quick-task').onclick = () => window.appModals.openCreateTask();
    document.getElementById('btn-adjust-goal').onclick = () => window.appModals.openStudyGoalModal();

    document.getElementById('view-all-resources-btn').onclick = () => window.router.navigate('library');
    document.getElementById('view-all-bookmarks-btn').onclick = () => window.router.navigate('bookmarks');
    document.getElementById('view-all-tasks-btn').onclick = () => window.router.navigate('tasks');

    await this.loadDashboardData();
  },

  async loadDashboardData() {
    try {
      const data = await API.dashboard.getStats();

      // Greeting & Header
      document.getElementById('dash-greeting').textContent = `${data.greeting}, ${data.user_name}`;
      document.getElementById('dash-academic-badge').textContent = `${data.program} • ${data.academic_year}, ${data.semester}`;

      // Stats
      document.getElementById('stat-courses').textContent = data.total_courses;
      document.getElementById('stat-resources').textContent = data.total_resources;
      document.getElementById('stat-topics').textContent = data.completed_topics;
      document.getElementById('stat-total-topics').textContent = `of ${data.total_topics} topics`;
      document.getElementById('stat-progress').textContent = `${data.overall_progress_pct}%`;
      document.getElementById('stat-progress-bar').style.width = `${data.overall_progress_pct}%`;

      // Goal
      if (data.study_goal) {
        document.getElementById('goal-pct').textContent = `${data.study_goal.progress_pct}%`;
        document.getElementById('goal-progress-text').textContent = `${data.study_goal.completed_topics_this_week} / ${data.study_goal.target_topics} Topics Cleared`;
        if (data.study_goal.notes) {
          document.getElementById('goal-desc').textContent = data.study_goal.notes;
        }
      }

      // Render Recently Added Resources
      const recentResContainer = document.getElementById('dash-recent-resources');
      if (!data.recent_resources || data.recent_resources.length === 0) {
        recentResContainer.innerHTML = renderEmptyState({
          icon: 'folder',
          title: 'No resources added yet',
          description: 'Upload your lecture slides, syllabus, and case studies to get started.',
          actionText: 'Upload First Resource',
          actionId: 'dash-empty-upload-btn',
        });
        const btn = document.getElementById('dash-empty-upload-btn');
        if (btn) btn.onclick = () => window.appModals.openUploadResource();
      } else {
        recentResContainer.innerHTML = data.recent_resources.map(r => this.renderResourceRow(r)).join('');
      }

      // Render Recently Accessed
      const recentAccessContainer = document.getElementById('dash-recent-accessed');
      if (!data.recent_accessed || data.recent_accessed.length === 0) {
        recentAccessContainer.innerHTML = `
          <div class="py-6 text-center text-xs text-slate-400">
            No recent study activity logged yet. Open resources to resume your study workspace.
          </div>
        `;
      } else {
        recentAccessContainer.innerHTML = data.recent_accessed.map(r => this.renderResourceRow(r, true)).join('');
      }

      // Render Bookmarked
      const bookmarkedContainer = document.getElementById('dash-bookmarked');
      if (!data.bookmarked_resources || data.recent_resources.length === 0) {
        bookmarkedContainer.innerHTML = `
          <div class="py-6 text-center text-xs text-slate-400">
            No bookmarks saved yet. Click the bookmark icon on any document for quick access.
          </div>
        `;
      } else {
        bookmarkedContainer.innerHTML = data.bookmarked_resources.map(r => this.renderResourceRow(r)).join('');
      }

      // Render Tasks
      const tasksContainer = document.getElementById('dash-tasks-list');
      if (!data.upcoming_tasks || data.upcoming_tasks.length === 0) {
        tasksContainer.innerHTML = renderEmptyState({
          icon: 'calendar',
          title: 'No pending deadlines',
          description: 'Great job! You have cleared all assignments and exam preparations.',
          actionText: 'Add New Task',
          actionId: 'dash-empty-task-btn',
        });
        const btn = document.getElementById('dash-empty-task-btn');
        if (btn) btn.onclick = () => window.appModals.openCreateTask();
      } else {
        tasksContainer.innerHTML = data.upcoming_tasks.map(t => this.renderTaskRow(t)).join('');
      }
    } catch (err) {
      showToast('Failed to load dashboard metrics: ' + err.message, 'error');
    }
  },

  renderResourceRow(resource, showAccessTime = false) {
    return `
      <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all card-hover">
        <div class="flex items-center gap-3 min-w-0">
          <div class="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
            ${getIcon('file-text', 'w-4 h-4')}
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-semibold text-slate-900 truncate hover:text-blue-600 cursor-pointer" onclick="window.readerWorkspace.open(${resource.id})">
              ${escapeHtml(resource.title)}
            </h4>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              <span class="font-medium text-slate-700">${escapeHtml(resource.course_name)}</span>
              <span>•</span>
              ${getTypeBadge(resource.resource_type)}
              <span>•</span>
              <span>${formatBytes(resource.file_size)}</span>
              ${showAccessTime && resource.last_accessed_at ? `<span>• Accessed ${formatRelative(resource.last_accessed_at)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 ml-3">
          <button class="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors" title="Open in Study Workspace" onclick="window.readerWorkspace.open(${resource.id})">
            ${getIcon('eye', 'w-4 h-4')}
          </button>
          <a href="${API.resources.downloadUrl(resource.id)}" download class="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors" title="Download">
            ${getIcon('download', 'w-4 h-4')}
          </a>
        </div>
      </div>
    `;
  },

  renderTaskRow(task) {
    const overdueClass = task.is_overdue ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100 hover:bg-slate-50/70';
    return `
      <div class="flex items-start justify-between p-3 rounded-xl border ${overdueClass} transition-all">
        <div class="space-y-1 min-w-0 pr-2">
          <div class="flex items-center gap-2">
            ${task.is_overdue ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">OVERDUE</span>' : ''}
            <span class="text-xs font-semibold text-slate-900 truncate">${escapeHtml(task.title)}</span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-slate-500">
            <span>${escapeHtml(task.course_name || 'General')}</span>
            <span>•</span>
            <span class="${task.is_overdue ? 'text-rose-600 font-semibold' : ''}">${formatRelative(task.due_date)}</span>
          </div>
        </div>
        <div class="shrink-0 flex items-center gap-1.5">
          ${getPriorityBadge(task.priority)}
        </div>
      </div>
    `;
  },
};
