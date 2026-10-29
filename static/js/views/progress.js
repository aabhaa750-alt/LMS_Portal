// Study Progress Tracker View
const ProgressView = {
  async render() {
    return `
      <div class="space-y-8 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Study Progress Tracker</h1>
            <p class="text-xs text-slate-500 mt-1">Track actual syllabus topic completion, pacing, and weekly academic study targets</p>
          </div>
          <button id="btn-edit-weekly-goal" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
            ${getIcon('target', 'w-3.5 h-3.5')}
            Set Weekly Study Goal
          </button>
        </div>

        <!-- High-level Progress Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Overall Curriculum Completion Card -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div class="space-y-1">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Curriculum Completion</span>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-4xl font-extrabold text-slate-900" id="prog-overall-pct">0%</span>
                <span class="text-xs text-slate-500" id="prog-topic-ratio">0 / 0 topics</span>
              </div>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
              <div id="prog-overall-bar" class="h-2.5 bg-blue-600 rounded-full transition-all duration-700" style="width: 0%"></div>
            </div>
            <p class="text-xs text-slate-400 mt-3">Calculated strictly from syllabus topic mastery</p>
          </div>

          <!-- Topic Status Breakdown -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Status Breakdown</span>
            <div class="space-y-2.5 pt-1">
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
                </span>
                <span class="font-bold text-slate-900" id="prog-count-completed">0</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> In Progress
                </span>
                <span class="font-bold text-slate-900" id="prog-count-in-progress">0</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Not Started
                </span>
                <span class="font-bold text-slate-900" id="prog-count-not-started">0</span>
              </div>
            </div>
          </div>

          <!-- Weekly Goal Tracker -->
          <div class="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wider text-blue-200" id="prog-goal-week-id">Weekly Goal</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/20">Target</span>
              </div>
              <div class="mt-3">
                <div class="text-3xl font-extrabold" id="prog-goal-pct">0%</div>
                <div class="text-xs text-blue-200 mt-1" id="prog-goal-subtext">0 / 5 Topics Cleared This Week</div>
              </div>
            </div>
            <div class="pt-3 border-t border-white/10 text-xs text-slate-300" id="prog-goal-notes">
              Focus on mastering core case theories before deadlines.
            </div>
          </div>
        </div>

        <!-- Course-by-Course Progress Breakdown -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Course-by-Course Curriculum Mastery</h2>
              <p class="text-xs text-slate-500">Expand any course to review and toggle topic completion</p>
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
      <div class="border border-slate-200/80 rounded-2xl overflow-hidden transition-all">
        <div class="p-4 bg-slate-50 flex items-center justify-between cursor-pointer" onclick="ProgressView.toggleCourseAccordion(${course.course_id})">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${course.course_color || '#2563eb'}"></span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900">${escapeHtml(course.course_name)}</span>
                ${course.course_code ? `<span class="text-[10px] text-slate-500 font-mono">(${escapeHtml(course.course_code)})</span>` : ''}
              </div>
              <span class="text-[11px] text-slate-500">${course.completed_topics} of ${course.total_topics} Topics Cleared</span>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="text-xs font-extrabold text-slate-800">${course.progress_pct}%</span>
              <div class="w-24 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div class="h-1.5 rounded-full" style="width: ${course.progress_pct}%; background-color: ${course.course_color || '#2563eb'}"></div>
              </div>
            </div>
            <span id="accordion-arrow-${course.course_id}" class="text-slate-400 p-1">
              ${getIcon('chevron-down', 'w-4 h-4')}
            </span>
          </div>
        </div>

        <div id="accordion-body-${course.course_id}" class="p-4 divide-y divide-slate-100 hidden bg-white">
          ${course.topics && course.topics.length > 0 ? course.topics.map(t => `
            <div class="py-2.5 flex items-center justify-between text-xs">
              <div class="flex items-center gap-3 min-w-0 pr-4">
                <span class="text-[10px] font-semibold text-slate-400 shrink-0">${escapeHtml(t.unit_title)}</span>
                <span class="text-slate-800 font-medium truncate">${escapeHtml(t.topic_title)}</span>
              </div>
              <select class="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 shrink-0"
                onchange="ProgressView.updateTopicStatus(${t.id}, this.value)">
                <option value="Not Started" ${t.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
          `).join('') : `
            <div class="py-4 text-center text-xs text-slate-400">No topics added to this subject yet.</div>
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
