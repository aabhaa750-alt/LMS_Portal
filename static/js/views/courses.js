// Courses & Hierarchy Management View
const CoursesView = {
  activeCourseId: null,

  async render() {
    return `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/70 text-blue-800 text-[11px] font-semibold tracking-wide uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Academic Course Studio
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Course &amp; Subject Management</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Hierarchical curriculum: Year &rarr; Semester &rarr; Course &rarr; Units &rarr; Study Resources</p>
          </div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <button id="btn-seed-mba-courses" class="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer">
              ${getIcon('sparkles', 'w-3.5 h-3.5 text-amber-500')}
              <span>Load Starter MBA Subjects</span>
            </button>
            <button id="btn-create-course-main" class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all hover:shadow-sm cursor-pointer">
              ${getIcon('plus', 'w-3.5 h-3.5')}
              <span>New Course</span>
            </button>
          </div>
        </div>

        <!-- Course Cards Grid -->
        <div id="courses-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${renderLoadingState('Loading courses...')}
        </div>

        <!-- Course Curriculum / Topic Hierarchy Drawer/Section -->
        <div id="course-curriculum-container" class="hidden bg-white rounded-2xl border border-slate-200/70 shadow-md p-6 sm:p-7 space-y-6">
          <!-- Populated dynamically when a course card is selected -->
        </div>
      </div>
    `;
  },

  async bindEvents() {
    document.getElementById('btn-create-course-main').onclick = () => window.appModals.openAddCourse();
    document.getElementById('btn-seed-mba-courses').onclick = async () => {
      showConfirmModal({
        title: 'Load Starter MBA Curriculum?',
        message: 'This will seed standard core MBA subjects (Managerial Economics, Financial Accounting, Marketing Management, Product Management, and Business Analytics) with study units.',
        confirmText: 'Load Subjects',
        onConfirm: async () => {
          try {
            const res = await API.system.seedDemo();
            showToast(res.message, 'success');
            await CoursesView.loadCourses();
          } catch (e) {
            showToast(e.message, 'error');
          }
        }
      });
    };

    await this.loadCourses();
  },

  async loadCourses() {
    const container = document.getElementById('courses-grid');
    try {
      const courses = await API.courses.list();

      if (!courses || courses.length === 0) {
        container.innerHTML = `
          <div class="col-span-full">
            ${renderEmptyState({
              icon: 'book-open',
              title: 'No courses added yet',
              description: 'Create your first MBA subject or click "Load Starter MBA Subjects" above.',
              actionText: 'Create First Course',
              actionId: 'btn-empty-course',
            })}
          </div>
        `;
        const btn = document.getElementById('btn-empty-course');
        if (btn) btn.onclick = () => window.appModals.openAddCourse();
        return;
      }

      container.innerHTML = courses.map(c => this.renderCourseCard(c)).join('');

      // If a course was previously selected, refresh its details
      if (this.activeCourseId) {
        await this.selectCourse(this.activeCourseId);
      }
    } catch (err) {
      container.innerHTML = `<div class="col-span-full p-4 text-center text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">Error: ${escapeHtml(err.message)}</div>`;
    }
  },

  renderCourseCard(course) {
    const isSelected = this.activeCourseId === course.id;
    const courseColor = course.color || '#2563eb';
    return `
      <div class="relative overflow-hidden bg-white rounded-2xl border ${isSelected ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200/70 shadow-2xs hover:shadow-md'} p-5 sm:p-6 flex flex-col justify-between card-hover transition-all">
        <!-- Top Subject Accent Ribbon -->
        <div class="absolute top-0 left-0 right-0 h-1.5" style="background-color: ${courseColor}"></div>

        <div class="space-y-4 pt-1">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs" style="background-color: ${courseColor}">
                ${course.code ? escapeHtml(course.code.slice(0, 4)) : getIcon('book-open', 'w-5 h-5 text-white')}
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">${escapeHtml(course.academic_year)} • ${escapeHtml(course.semester)}</span>
                <h3 class="text-sm font-bold text-slate-900 line-clamp-1 tracking-tight hover:text-blue-600 cursor-pointer transition-colors" onclick="CoursesView.selectCourse(${course.id})">${escapeHtml(course.name)}</h3>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" title="Edit Course" onclick="window.appModals.openEditCourse(${course.id})">
                ${getIcon('edit', 'w-3.5 h-3.5')}
              </button>
              <button class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer" title="Delete Course" onclick="CoursesView.confirmDeleteCourse(${course.id}, '${escapeHtml(course.name)}')">
                ${getIcon('trash', 'w-3.5 h-3.5')}
              </button>
            </div>
          </div>

          <p class="text-xs text-slate-600 line-clamp-2 min-h-[32px] leading-relaxed font-normal">${escapeHtml(course.description || 'No course syllabus description provided.')}</p>

          ${course.instructor ? `
            <div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              ${getIcon('user', 'w-3.5 h-3.5 text-slate-400')}
              <span>Faculty: ${escapeHtml(course.instructor)}</span>
            </div>
          ` : ''}

          <!-- Course Progress Bar -->
          <div class="pt-3 border-t border-slate-100">
            <div class="flex items-center justify-between text-[11px] mb-2">
              <span class="text-slate-500 font-medium">Syllabus Topic Mastery</span>
              <span class="text-slate-900 font-extrabold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">${course.progress_pct}% (${course.completed_topics}/${course.total_topics})</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="h-2 rounded-full transition-all duration-700" style="width: ${course.progress_pct}%; background-color: ${courseColor}"></div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            ${getIcon('folder', 'w-3.5 h-3.5 text-slate-400')}
            <span>${course.resource_count} materials</span>
          </span>
          <button class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group cursor-pointer" onclick="CoursesView.selectCourse(${course.id})">
            <span>Explore Curriculum</span>
            <span class="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>
      </div>
    `;
  },

  async selectCourse(courseId) {
    this.activeCourseId = courseId;
    const container = document.getElementById('course-curriculum-container');
    container.classList.remove('hidden');
    container.innerHTML = renderLoadingState('Loading course syllabus and units...');
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      const course = await API.courses.get(courseId);

      container.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
          <div class="space-y-1">
            <div class="flex items-center gap-2.5">
              <span class="px-2.5 py-0.5 rounded-md text-xs font-bold text-white shadow-2xs" style="background-color: ${course.color || '#2563eb'}">
                ${escapeHtml(course.code || 'COURSE')}
              </span>
              <h2 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">${escapeHtml(course.name)}</h2>
            </div>
            <p class="text-xs text-slate-500">${escapeHtml(course.academic_year)} • ${escapeHtml(course.semester)} • ${escapeHtml(course.instructor || 'Instructor unassigned')}</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer" onclick="window.appModals.openAddTopic(${course.id})">
              ${getIcon('plus', 'w-3.5 h-3.5')}
              <span>Add Unit / Topic</span>
            </button>
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/60 transition-all cursor-pointer" onclick="window.router.navigate('library', { course_id: ${course.id} })">
              ${getIcon('folder', 'w-3.5 h-3.5')}
              <span>Materials (${course.resource_count})</span>
            </button>
            <button class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" title="Close" onclick="document.getElementById('course-curriculum-container').classList.add('hidden'); CoursesView.activeCourseId = null;">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>
        </div>

        <!-- Topics & Units Hierarchy List -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Course Syllabus &amp; Study Topics</h3>
            <span class="text-xs font-semibold text-slate-600">${course.completed_topics} of ${course.total_topics} Topics Completed</span>
          </div>

          <div class="space-y-2.5" id="course-topics-list">
            ${course.unit_topics && course.unit_topics.length > 0 ? course.unit_topics.map(t => this.renderTopicItem(t)).join('') : `
              <div class="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                No syllabus units or topics added to this subject yet.
                <button class="text-blue-600 font-semibold underline block mx-auto mt-2 cursor-pointer" onclick="window.appModals.openAddTopic(${course.id})">
                  Add Unit 1 Topic
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl">Error loading course: ${escapeHtml(err.message)}</div>`;
    }
  },

  renderTopicItem(topic) {
    const isCompleted = topic.status === 'Completed';
    const isInProgress = topic.status === 'In Progress';
    const statusBg = isCompleted ? 'bg-emerald-50/60 border-emerald-200/70' : isInProgress ? 'bg-blue-50/50 border-blue-200/70' : 'bg-white border-slate-200/80';
    return `
      <div class="flex items-center justify-between p-3.5 rounded-xl border ${statusBg} hover:shadow-xs transition-all card-hover">
        <div class="flex items-start gap-3 min-w-0 pr-4">
          <button class="mt-0.5 p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer" title="Cycle Status" onclick="CoursesView.cycleTopicStatus(${topic.id}, '${topic.status}')">
            ${isCompleted ? getIcon('check-circle', 'w-5 h-5 text-emerald-600') : isInProgress ? getIcon('sparkles', 'w-5 h-5 text-blue-600') : getIcon('check-circle', 'w-5 h-5 text-slate-300')}
          </button>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">${escapeHtml(topic.unit_title)}</span>
              <span class="text-xs font-bold text-slate-900 ${isCompleted ? 'line-through text-slate-500' : ''}">${escapeHtml(topic.topic_title)}</span>
            </div>
            ${topic.description ? `<p class="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">${escapeHtml(topic.description)}</p>` : ''}
          </div>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <select class="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200/80 ${isCompleted ? 'bg-emerald-50 text-emerald-800' : isInProgress ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer transition-all"
            onchange="CoursesView.setTopicStatus(${topic.id}, this.value)">
            <option value="Not Started" ${topic.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
            <option value="In Progress" ${topic.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${topic.status === 'Completed' ? 'selected' : ''}>✓ Completed</option>
          </select>
          <button class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer" title="Delete Topic" onclick="CoursesView.confirmDeleteTopic(${topic.id})">
            ${getIcon('trash', 'w-3.5 h-3.5')}
          </button>
        </div>
      </div>
    `;
  },

  async cycleTopicStatus(topicId, currentStatus) {
    const nextStatus = currentStatus === 'Not Started' ? 'In Progress' : currentStatus === 'In Progress' ? 'Completed' : 'Not Started';
    await this.setTopicStatus(topicId, nextStatus);
  },

  async setTopicStatus(topicId, status) {
    try {
      await API.courses.updateTopicStatus(topicId, status);
      showToast(`Topic marked as ${status}`, 'success');
      await this.loadCourses();
      if (this.activeCourseId) {
        await this.selectCourse(this.activeCourseId);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteCourse(courseId, courseName) {
    showConfirmModal({
      title: `Delete '${courseName}'?`,
      message: 'This will permanently remove the course, all syllabus topics, and all uploaded files associated with it.',
      confirmText: 'Delete Course',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await API.courses.delete(courseId);
          showToast('Course deleted successfully.', 'info');
          if (this.activeCourseId === courseId) {
            this.activeCourseId = null;
            document.getElementById('course-curriculum-container').classList.add('hidden');
          }
          await this.loadCourses();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  },

  confirmDeleteTopic(topicId) {
    showConfirmModal({
      title: 'Delete Topic?',
      message: 'Are you sure you want to remove this topic from the curriculum?',
      confirmText: 'Delete Topic',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await API.courses.deleteTopic(topicId);
          showToast('Topic deleted.', 'info');
          if (this.activeCourseId) {
            await this.selectCourse(this.activeCourseId);
          }
          await this.loadCourses();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  }
};
