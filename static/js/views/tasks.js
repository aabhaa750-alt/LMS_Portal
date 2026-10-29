// Assignments and Deadlines View (List & Calendar modes)
const TasksView = {
  viewMode: 'list', // 'list' or 'calendar'
  filterStatus: '',
  filterCourseId: '',
  filterPriority: '',
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),

  async render() {
    return `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Assignments &amp; Deadlines</h1>
            <p class="text-xs text-slate-500 mt-1">Track case submissions, midterm exams, group projects, and deliverables</p>
          </div>
          <button id="btn-create-task-main" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
            ${getIcon('plus', 'w-3.5 h-3.5')}
            Add Assignment / Exam
          </button>
        </div>

        <!-- Toolbar (Filters & View Toggle) -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2.5 flex-1">
            <!-- Status Filter -->
            <select id="task-filter-status" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <!-- Course Filter -->
            <select id="task-filter-course" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">All Subjects</option>
            </select>

            <!-- Priority Filter -->
            <select id="task-filter-priority" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div class="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
            <button id="task-mode-list" class="p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${this.viewMode === 'list' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}">
              ${getIcon('file-text', 'w-3.5 h-3.5')}
              List View
            </button>
            <button id="task-mode-calendar" class="p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${this.viewMode === 'calendar' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}">
              ${getIcon('calendar', 'w-3.5 h-3.5')}
              Calendar View
            </button>
          </div>
        </div>

        <!-- Tasks Content Container -->
        <div id="tasks-content-area">
          ${renderLoadingState('Loading academic deadlines...')}
        </div>
      </div>
    `;
  },

  async bindEvents() {
    document.getElementById('btn-create-task-main').onclick = () => window.appModals.openCreateTask();

    // Populate Courses filter
    try {
      const courses = await API.courses.list();
      const courseSelect = document.getElementById('task-filter-course');
      courseSelect.innerHTML = '<option value="">All Subjects</option>' + courses.map(c => `
        <option value="${c.id}">${escapeHtml(c.name)}</option>
      `).join('');
    } catch (e) {}

    document.getElementById('task-filter-status').onchange = (e) => {
      this.filterStatus = e.target.value;
      this.loadTasks();
    };

    document.getElementById('task-filter-course').onchange = (e) => {
      this.filterCourseId = e.target.value;
      this.loadTasks();
    };

    document.getElementById('task-filter-priority').onchange = (e) => {
      this.filterPriority = e.target.value;
      this.loadTasks();
    };

    document.getElementById('task-mode-list').onclick = () => {
      this.viewMode = 'list';
      document.getElementById('task-mode-list').className = 'p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-white shadow-xs text-blue-600';
      document.getElementById('task-mode-calendar').className = 'p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-500';
      this.loadTasks();
    };

    document.getElementById('task-mode-calendar').onclick = () => {
      this.viewMode = 'calendar';
      document.getElementById('task-mode-calendar').className = 'p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-white shadow-xs text-blue-600';
      document.getElementById('task-mode-list').className = 'p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-500';
      this.loadTasks();
    };

    await this.loadTasks();
  },

  async loadTasks() {
    const container = document.getElementById('tasks-content-area');
    container.innerHTML = renderLoadingState('Loading tasks...');

    try {
      const tasks = await API.tasks.list({
        status_filter: this.filterStatus || null,
        course_id: this.filterCourseId || null,
        priority: this.filterPriority || null,
      });

      if (this.viewMode === 'list') {
        this.renderListView(container, tasks);
      } else {
        this.renderCalendarView(container, tasks);
      }
    } catch (err) {
      container.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl">Error: ${escapeHtml(err.message)}</div>`;
    }
  },

  renderListView(container, tasks) {
    if (!tasks || tasks.length === 0) {
      container.innerHTML = renderEmptyState({
        icon: 'calendar',
        title: 'No tasks or deadlines found',
        description: 'You have no pending assignments matching the active filters.',
        actionText: 'Add First Task',
        actionId: 'btn-tasks-empty-create',
      });
      const btn = document.getElementById('btn-tasks-empty-create');
      if (btn) btn.onclick = () => window.appModals.openCreateTask();
      return;
    }

    // Split tasks into Overdue, Pending, and Completed
    const overdue = tasks.filter(t => t.is_overdue);
    const active = tasks.filter(t => !t.is_overdue && t.status !== 'Completed');
    const completed = tasks.filter(t => t.status === 'Completed');

    container.innerHTML = `
      <div class="space-y-6">
        ${overdue.length > 0 ? `
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <h3 class="text-xs font-bold uppercase tracking-wider text-rose-700">Urgent / Overdue Deadlines (${overdue.length})</h3>
            </div>
            <div class="bg-white rounded-2xl border border-rose-200 divide-y divide-rose-100 shadow-sm overflow-hidden">
              ${overdue.map(t => this.renderTaskItem(t)).join('')}
            </div>
          </div>
        ` : ''}

        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Upcoming Deliverables (${active.length})</h3>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-sm overflow-hidden">
            ${active.length > 0 ? active.map(t => this.renderTaskItem(t)).join('') : `
              <div class="p-6 text-center text-xs text-slate-400">No active pending tasks.</div>
            `}
          </div>
        </div>

        ${completed.length > 0 ? `
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Completed (${completed.length})</h3>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-sm overflow-hidden opacity-75">
              ${completed.map(t => this.renderTaskItem(t)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  renderTaskItem(t) {
    const isCompleted = t.status === 'Completed';
    return `
      <div class="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
        <div class="flex items-center gap-3 min-w-0 pr-4">
          <button class="p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
            title="Toggle Status" onclick="TasksView.cycleStatus(${t.id}, '${t.status}')">
            ${isCompleted ? getIcon('check-circle', 'w-5 h-5 text-emerald-600') : getIcon('check-circle', 'w-5 h-5 text-slate-300')}
          </button>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-xs font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'} truncate">
                ${escapeHtml(t.title)}
              </h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                ${escapeHtml(t.task_type)}
              </span>
            </div>
            ${t.description ? `<p class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">${escapeHtml(t.description)}</p>` : ''}
            <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span class="font-medium text-slate-600">${escapeHtml(t.course_name || 'General')}</span>
              <span>•</span>
              <span class="${t.is_overdue ? 'text-rose-600 font-bold' : ''}">${formatRelative(t.due_date)} (${formatDateTime(t.due_date)})</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          ${getPriorityBadge(t.priority)}
          <select class="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
            onchange="TasksView.setStatus(${t.id}, this.value)">
            <option value="To Do" ${t.status === 'To Do' ? 'selected' : ''}>To Do</option>
            <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
          <button class="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100" title="Edit Task" onclick="window.appModals.openEditTask(${t.id})">
            ${getIcon('edit', 'w-3.5 h-3.5')}
          </button>
          <button class="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50" title="Delete Task" onclick="TasksView.confirmDeleteTask(${t.id}, '${escapeHtml(t.title)}')">
            ${getIcon('trash', 'w-3.5 h-3.5')}
          </button>
        </div>
      </div>
    `;
  },

  renderCalendarView(container, tasks) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = monthNames[this.calendarMonth];

    // Build days of month
    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1).getDay();
    const daysInMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();

    let calendarCells = '';
    // Empty cells before 1st of month
    for (let i = 0; i < firstDay; i++) {
      calendarCells += `<div class="min-h-[90px] p-2 bg-slate-50/50 border border-slate-100 rounded-xl"></div>`;
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDateStr = `${this.calendarYear}-${String(this.calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(dayDateStr));

      calendarCells += `
        <div class="min-h-[90px] p-2 bg-white border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-blue-400 transition-colors">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>${day}</span>
            ${dayTasks.length > 0 ? `<span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>` : ''}
          </div>
          <div class="space-y-1 mt-1 overflow-y-auto max-h-[60px]">
            ${dayTasks.map(t => `
              <div class="p-1 rounded text-[10px] font-semibold truncate ${t.is_overdue ? 'bg-rose-50 text-rose-700' : t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 line-through' : 'bg-blue-50 text-blue-700'} cursor-pointer"
                title="${escapeHtml(t.title)}" onclick="window.appModals.openEditTask(${t.id})">
                ${escapeHtml(t.title)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 class="text-base font-bold text-slate-900">${currentMonthName} ${this.calendarYear}</h2>
          <div class="flex items-center gap-2">
            <button id="cal-prev-month" class="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">&larr; Prev</button>
            <button id="cal-next-month" class="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Next &rarr;</button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        <div class="grid grid-cols-7 gap-2">
          ${calendarCells}
        </div>
      </div>
    `;

    document.getElementById('cal-prev-month').onclick = () => {
      if (this.calendarMonth === 0) {
        this.calendarMonth = 11;
        this.calendarYear--;
      } else {
        this.calendarMonth--;
      }
      this.loadTasks();
    };

    document.getElementById('cal-next-month').onclick = () => {
      if (this.calendarMonth === 11) {
        this.calendarMonth = 0;
        this.calendarYear++;
      } else {
        this.calendarMonth++;
      }
      this.loadTasks();
    };
  },

  async cycleStatus(taskId, currentStatus) {
    const nextStatus = currentStatus === 'Completed' ? 'To Do' : currentStatus === 'To Do' ? 'In Progress' : 'Completed';
    await this.setStatus(taskId, nextStatus);
  },

  async setStatus(taskId, status) {
    try {
      await API.tasks.updateStatus(taskId, status);
      showToast(`Task updated to ${status}`, 'success');
      await this.loadTasks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteTask(taskId, title) {
    showConfirmModal({
      title: `Delete Task '${title}'?`,
      message: 'This assignment deadline will be removed.',
      confirmText: 'Delete Task',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await API.tasks.delete(taskId);
          showToast('Task deleted.', 'info');
          await this.loadTasks();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  }
};
