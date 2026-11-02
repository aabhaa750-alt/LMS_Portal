// Study Progress Tracker View
const ProgressView = {
  async render() {
    return `
      <div class="space-y-7 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/70 text-blue-800 text-[11px] font-semibold tracking-wide uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Curriculum Mastery Analytics
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Study Progress Tracker</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Track actual syllabus topic completion, pacing, and weekly academic study targets</p>
          </div>
          <button id="btn-edit-weekly-goal" class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all hover:shadow-sm cursor-pointer">
            ${getIcon('target', 'w-3.5 h-3.5')}
            <span>Set Weekly Study Goal</span>
          </button>
        </div>

        <!-- High-level Progress Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Overall Curriculum Completion Card -->
          <div class="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md flex flex-col justify-between card-hover transition-all">
            <div class="space-y-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Curriculum Completion</span>
              <div class="flex items-baseline gap-2.5 mt-2">
                <span class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900" id="prog-overall-pct">0%</span>
                <span class="text-xs text-slate-500 font-medium" id="prog-topic-ratio">0 / 0 topics</span>
              </div>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
              <div id="prog-overall-bar" class="h-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700" style="width: 0%"></div>
            </div>
            <p class="text-[11px] text-slate-400 mt-3 font-medium">Calculated strictly from syllabus topic mastery</p>
          </div>

          <!-- Topic Status Breakdown -->
          <div class="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md space-y-3.5 card-hover transition-all">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status Breakdown</span>
            <div class="space-y-3 pt-1">
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
                </span>
                <span class="font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100" id="prog-count-completed">0</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> In Progress
                </span>
                <span class="font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100" id="prog-count-in-progress">0</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Not Started
                </span>
                <span class="font-extrabold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600" id="prog-count-not-started">0</span>
              </div>
            </div>
          </div>

          <!-- Weekly Goal Tracker -->
          <div class="bg-gradient-to-br from-[#070b14] via-slate-900 to-[#141c2e] text-white p-6 sm:p-7 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between card-hover relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-blue-300" id="prog-goal-week-id">Weekly Goal</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">Target</span>
              </div>
              <div class="mt-3">
                <div class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white" id="prog-goal-pct">0%</div>
                <div class="text-xs text-blue-200 mt-1 font-medium" id="prog-goal-subtext">0 / 5 Topics Cleared This Week</div>
              </div>
            </div>
            <div class="pt-3.5 border-t border-white/10 text-xs text-slate-300 leading-relaxed font-normal" id="prog-goal-notes">
              Focus on mastering core case theories before deadlines.
            </div>
          </div>
        </div>

        <!-- Course-by-Course Progress Breakdown -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7 space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base font-bold text-slate-900 tracking-tight">Course-by-Course Curriculum Mastery</h2>
              <p class="text-xs text-slate-500 mt-0.5">Expand any course to review and toggle topic completion</p>
            </div>
          </div>

          <div class="space-y-4" id="progress-courses-container">
            ${renderLoadingState('Loading course topic analytics...')}
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    document.getElementById('btn-edit-weekly-goal').onclick = () => window.appModals.openStudyGoalModal();
    await this.loadProgressData();
  },

  async loadProgressData() {
    try {
      const data = await API.progress.getOverview();

      document.getElementById('prog-overall-pct').textContent = `${data.overall_progress_pct}%`;
      document.getElementById('prog-topic-ratio').textContent = `${data.completed_topics} / ${data.total_topics} topics`;
      document.getElementById('prog-overall-bar').style.width = `${data.overall_progress_pct}%`;

      document.getElementById('prog-count-completed').textContent = data.completed_topics;
      document.getElementById('prog-count-in-progress').textContent = data.in_progress_topics;
      document.getElementById('prog-count-not-started').textContent = data.not_started_topics;

      if (data.weekly_goal) {
        document.getElementById('prog-goal-week-id').textContent = `Target: ${data.weekly_goal.week_identifier}`;
        document.getElementById('prog-goal-pct').textContent = `${data.weekly_goal.progress_pct}%`;
        document.getElementById('prog-goal-subtext').textContent = `${data.weekly_goal.completed_topics_this_week} / ${data.weekly_goal.target_topics} Topics Cleared`;
        if (data.weekly_goal.notes) {
          document.getElementById('prog-goal-notes').textContent = data.weekly_goal.notes;
        }
      }

      const coursesContainer = document.getElementById('progress-courses-container');
      if (!data.course_breakdown || data.course_breakdown.length === 0) {
        coursesContainer.innerHTML = renderEmptyState({
          icon: 'book-open',
          title: 'No subjects added yet',
          description: 'Add courses and curriculum topics to track your semester learning curve.',
          actionText: 'Add Course',
          actionId: 'btn-prog-add-course',
        });
        const btn = document.getElementById('btn-prog-add-course');
        if (btn) btn.onclick = () => window.appModals.openAddCourse();
        return;
      }

      coursesContainer.innerHTML = data.course_breakdown.map(c => this.renderCourseProgressBlock(c)).join('');
    } catch (err) {
      showToast('Error loading study progress: ' + err.message, 'error');
    }
  },

  renderCourseProgressBlock(course) {
    return `
      <div class="border border-slate-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs">
        <div class="p-4 sm:p-5 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between cursor-pointer transition-colors" onclick="ProgressView.toggleCourseAccordion(${course.course_id})">
          <div class="flex items-center gap-3.5 min-w-0 pr-4">
            <span class="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" style="background-color: ${course.course_color || '#2563eb'}"></span>
            <div class="min-w-0 space-y-0.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">${escapeHtml(course.course_name)}</span>
                ${course.course_code ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200/60 text-slate-700">${escapeHtml(course.course_code)}</span>` : ''}
              </div>
              <span class="text-[11px] text-slate-500 font-medium">${course.completed_topics} of ${course.total_topics} Topics Cleared</span>
            </div>
          </div>

          <div class="flex items-center gap-4 shrink-0">
            <div class="text-right">
              <span class="text-xs sm:text-sm font-extrabold text-slate-900">${course.progress_pct}%</span>
              <div class="w-24 sm:w-32 bg-slate-200 rounded-full h-2 mt-1 overflow-hidden">
                <div class="h-2 rounded-full transition-all duration-500" style="width: ${course.progress_pct}%; background-color: ${course.course_color || '#2563eb'}"></div>
              </div>
            </div>
            <span id="accordion-arrow-${course.course_id}" class="text-slate-400 p-1 hover:text-slate-700 transition-colors">
              ${getIcon('chevron-down', 'w-4 h-4')}
            </span>
          </div>
        </div>

        <div id="accordion-body-${course.course_id}" class="p-4 sm:p-5 divide-y divide-slate-100 hidden bg-white">
          ${course.topics && course.topics.length > 0 ? course.topics.map(t => `
            <div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-3 min-w-0 pr-4">
                <span class="text-[10px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">${escapeHtml(t.unit_title)}</span>
                <span class="text-slate-300 hidden sm:inline">•</span>
                <span class="text-slate-800 font-semibold truncate">${escapeHtml(t.topic_title)}</span>
              </div>
              <select class="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-700 shrink-0 self-end sm:self-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer"
                onchange="ProgressView.updateTopicStatus(${t.id}, this.value)">
                <option value="Not Started" ${t.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
          `).join('') : `
            <div class="py-6 text-center text-xs text-slate-400">No topics added to this subject yet.</div>
          `}
        </div>
      </div>
    `;
  },

  toggleCourseAccordion(courseId) {
    const body = document.getElementById(`accordion-body-${courseId}`);
    const arrow = document.getElementById(`accordion-arrow-${courseId}`);
    if (body) {
      body.classList.toggle('hidden');
    }
  },

  async updateTopicStatus(topicId, status) {
    try {
      await API.courses.updateTopicStatus(topicId, status);
      showToast(`Topic updated to ${status}`, 'success');
      await this.loadProgressData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
};
