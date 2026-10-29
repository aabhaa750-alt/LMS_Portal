// Learning Resource Library View
const LibraryView = {
  viewMode: 'grid', // 'grid' or 'list'
  filterCourseId: '',
  filterType: '',
  filterSearch: '',
  sortBy: 'newest',

  async render(params = {}) {
    if (params.course_id) {
      this.filterCourseId = params.course_id;
    }

    return `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Resource Library</h1>
            <p class="text-xs text-slate-500 mt-1">Central repository for lecture slides, PDFs, notes, spreadsheets, and case materials</p>
          </div>
          <button id="btn-upload-resource-main" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
            ${getIcon('upload', 'w-3.5 h-3.5')}
            Upload New Resource
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
          <!-- Search Input -->
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              ${getIcon('search', 'w-4 h-4')}
            </span>
            <input id="lib-search-input" type="text" value="${escapeHtml(this.filterSearch)}" placeholder="Search resources by title, tag, or topic..."
              class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
          </div>

          <!-- Course Filter Dropdown -->
          <div class="w-full md:w-52">
            <select id="lib-filter-course" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              <option value="">All Courses &amp; Subjects</option>
            </select>
          </div>

          <!-- Resource Type Filter -->
          <div class="w-full md:w-40">
            <select id="lib-filter-type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              <option value="">All Formats</option>
              <option value="PDF" ${this.filterType === 'PDF' ? 'selected' : ''}>PDF Documents</option>
              <option value="Presentation" ${this.filterType === 'Presentation' ? 'selected' : ''}>Presentations (PPT/X)</option>
              <option value="Document" ${this.filterType === 'Document' ? 'selected' : ''}>Word / Docs</option>
              <option value="Spreadsheet" ${this.filterType === 'Spreadsheet' ? 'selected' : ''}>Excel / Spreadsheets</option>
              <option value="Image" ${this.filterType === 'Image' ? 'selected' : ''}>Images (PNG/JPG)</option>
              <option value="Text" ${this.filterType === 'Text' ? 'selected' : ''}>Text / Notes</option>
            </select>
          </div>

          <!-- Sort Dropdown -->
          <div class="w-full md:w-44">
            <select id="lib-sort-by" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              <option value="newest" ${this.sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
              <option value="oldest" ${this.sortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
              <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Name (A &rarr; Z)</option>
              <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>Name (Z &rarr; A)</option>
              <option value="size_desc" ${this.sortBy === 'size_desc' ? 'selected' : ''}>File Size</option>
            </select>
          </div>

          <!-- Grid / List View Toggle -->
          <div class="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
            <button id="view-mode-grid" class="p-1.5 rounded-lg transition-colors ${this.viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}" title="Grid View">
              ${getIcon('layout-dashboard', 'w-4 h-4')}
            </button>
            <button id="view-mode-list" class="p-1.5 rounded-lg transition-colors ${this.viewMode === 'list' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}" title="List View">
              ${getIcon('file-text', 'w-4 h-4')}
            </button>
          </div>
        </div>

        <!-- Resources Content Area -->
        <div id="library-resources-container">
          ${renderLoadingState('Loading library resources...')}
        </div>
      </div>
    `;
  },

  async bindEvents() {
    document.getElementById('btn-upload-resource-main').onclick = () => window.appModals.openUploadResource(this.filterCourseId);

    // Populate Courses filter
    try {
      const courses = await API.courses.list();
      const courseSelect = document.getElementById('lib-filter-course');
      courseSelect.innerHTML = '<option value="">All Courses &amp; Subjects</option>' + courses.map(c => `
        <option value="${c.id}" ${String(this.filterCourseId) === String(c.id) ? 'selected' : ''}>${escapeHtml(c.name)}</option>
      `).join('');
    } catch (e) {}

    // Attach listeners
    const searchInput = document.getElementById('lib-search-input');
    let debounceTimer;
    searchInput.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.filterSearch = e.target.value.trim();
        this.loadResources();
      }, 300);
    };

    document.getElementById('lib-filter-course').onchange = (e) => {
      this.filterCourseId = e.target.value;
      this.loadResources();
    };

    document.getElementById('lib-filter-type').onchange = (e) => {
      this.filterType = e.target.value;
      this.loadResources();
    };

    document.getElementById('lib-sort-by').onchange = (e) => {
      this.sortBy = e.target.value;
      this.loadResources();
    };

    document.getElementById('view-mode-grid').onclick = () => {
      this.viewMode = 'grid';
      document.getElementById('view-mode-grid').className = 'p-1.5 rounded-lg bg-white shadow-xs text-blue-600 font-bold transition-colors';
      document.getElementById('view-mode-list').className = 'p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors';
      this.loadResources();
    };

    document.getElementById('view-mode-list').onclick = () => {
      this.viewMode = 'list';
      document.getElementById('view-mode-list').className = 'p-1.5 rounded-lg bg-white shadow-xs text-blue-600 font-bold transition-colors';
      document.getElementById('view-mode-grid').className = 'p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors';
      this.loadResources();
    };

    await this.loadResources();
  },

  async loadResources() {
    const container = document.getElementById('library-resources-container');
    container.innerHTML = renderLoadingState('Loading resources...');

    try {
      const resources = await API.resources.list({
        course_id: this.filterCourseId || null,
        resource_type: this.filterType || null,
        search: this.filterSearch || null,
        sort_by: this.sortBy,
      });

      if (!resources || resources.length === 0) {
        container.innerHTML = renderEmptyState({
          icon: 'folder',
          title: 'No resources match criteria',
          description: this.filterSearch || this.filterCourseId || this.filterType
            ? 'Try clearing active filters to see all uploaded materials.'
            : 'Your library is empty. Upload your first PDF, lecture slides, or spreadsheet.',
          actionText: 'Upload Resource',
          actionId: 'btn-lib-empty-upload',
        });
        const btn = document.getElementById('btn-lib-empty-upload');
        if (btn) btn.onclick = () => window.appModals.openUploadResource(this.filterCourseId);
        return;
      }

      if (this.viewMode === 'grid') {
        container.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            ${resources.map(r => this.renderResourceCard(r)).join('')}
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div class="divide-y divide-slate-100">
              ${resources.map(r => this.renderResourceListItem(r)).join('')}
            </div>
          </div>
        `;
      }
    } catch (err) {
      container.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl">Error loading resources: ${escapeHtml(err.message)}</div>`;
    }
  },

  renderResourceCard(res) {
    return `
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between card-hover">
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              ${getTypeBadge(res.resource_type)}
              <span class="text-[11px] font-semibold text-slate-500">${formatBytes(res.file_size)}</span>
            </div>
            <div class="flex items-center gap-1">
              <button class="p-1 text-slate-400 hover:text-amber-500 transition-colors" title="Bookmark" onclick="LibraryView.toggleBookmark(${res.id})">
                ${res.is_bookmarked ? getIcon('bookmark-filled', 'w-4 h-4 text-amber-500') : getIcon('bookmark', 'w-4 h-4')}
              </button>
              <button class="p-1 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Metadata" onclick="window.appModals.openEditResource(${res.id})">
                ${getIcon('edit', 'w-3.5 h-3.5')}
              </button>
              <button class="p-1 text-slate-400 hover:text-rose-600 transition-colors" title="Delete Resource" onclick="LibraryView.confirmDeleteResource(${res.id}, '${escapeHtml(res.title)}')">
                ${getIcon('trash', 'w-3.5 h-3.5')}
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer" onclick="window.readerWorkspace.open(${res.id})">
              ${escapeHtml(res.title)}
            </h3>
            <p class="text-[11px] text-slate-400 font-mono mt-0.5 truncate">${escapeHtml(res.original_filename)}</p>
          </div>

          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${res.course_color || '#2563eb'}"></span>
              ${escapeHtml(res.course_name)}
            </span>
            ${res.topic_title ? `
              <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                ${escapeHtml(res.topic_title)}
              </span>
            ` : ''}
          </div>

          ${res.tags ? `
            <div class="flex items-center gap-1 flex-wrap pt-1">
              ${res.tags.split(',').filter(t => t.trim()).map(t => `
                <span class="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">#${escapeHtml(t.trim())}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700" onclick="window.readerWorkspace.open(${res.id})">
            ${getIcon('eye', 'w-3.5 h-3.5')}
            Open &amp; Study
          </button>
          <a href="${API.resources.downloadUrl(res.id)}" download class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800">
            ${getIcon('download', 'w-3.5 h-3.5')}
            Download
          </a>
        </div>
      </div>
    `;
  },

  renderResourceListItem(res) {
    return `
      <div class="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
        <div class="flex items-center gap-3.5 min-w-0 pr-4">
          <div class="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0">
            ${getIcon('file-text', 'w-5 h-5')}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-xs font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer" onclick="window.readerWorkspace.open(${res.id})">
                ${escapeHtml(res.title)}
              </h4>
              ${getTypeBadge(res.resource_type)}
            </div>
            <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
              <span class="font-medium text-slate-700">${escapeHtml(res.course_name)}</span>
              ${res.topic_title ? `<span>• Topic: ${escapeHtml(res.topic_title)}</span>` : ''}
              <span>•</span>
              <span>${formatBytes(res.file_size)}</span>
              <span>•</span>
              <span>Added ${formatDate(res.created_at)}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button class="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100" title="Bookmark" onclick="LibraryView.toggleBookmark(${res.id})">
            ${res.is_bookmarked ? getIcon('bookmark-filled', 'w-4 h-4 text-amber-500') : getIcon('bookmark', 'w-4 h-4')}
          </button>
          <button class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors" onclick="window.readerWorkspace.open(${res.id})">
            ${getIcon('eye', 'w-3.5 h-3.5')}
            Open
          </button>
          <a href="${API.resources.downloadUrl(res.id)}" download class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" title="Download">
            ${getIcon('download', 'w-4 h-4')}
          </a>
          <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" title="Edit Metadata" onclick="window.appModals.openEditResource(${res.id})">
            ${getIcon('edit', 'w-3.5 h-3.5')}
          </button>
          <button class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50" title="Delete" onclick="LibraryView.confirmDeleteResource(${res.id}, '${escapeHtml(res.title)}')">
            ${getIcon('trash', 'w-3.5 h-3.5')}
          </button>
        </div>
      </div>
    `;
  },

  async toggleBookmark(resourceId) {
    try {
      const res = await API.bookmarks.toggle(resourceId);
      showToast(res.message, 'success');
      await this.loadResources();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteResource(resourceId, title) {
    showConfirmModal({
      title: `Delete '${title}'?`,
      message: 'This will permanently remove the resource file and all associated study notes.',
      confirmText: 'Delete Resource',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await API.resources.delete(resourceId);
          showToast('Resource deleted from library.', 'info');
          await this.loadResources();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  }
};
