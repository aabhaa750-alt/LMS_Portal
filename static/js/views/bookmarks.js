// Bookmarked Resources View
const BookmarksView = {
  filterCourseId: '',

  async render() {
    return `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/70 text-amber-800 text-[11px] font-semibold tracking-wide uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Pinned Study Cabinet
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Bookmarked Materials</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Quick-access revision deck for pinned case studies, formula sheets, and presentations</p>
          </div>
          <div class="w-full sm:w-64">
            <select id="bm-filter-course" class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all">
              <option value="">All Subjects</option>
            </select>
          </div>
        </div>

        <!-- Bookmarks Grid -->
        <div id="bookmarks-container">
          ${renderLoadingState('Loading bookmarks...')}
        </div>
      </div>
    `;
  },

  async bindEvents() {
    try {
      const courses = await API.courses.list();
      const courseSelect = document.getElementById('bm-filter-course');
      courseSelect.innerHTML = '<option value="">All Subjects</option>' + courses.map(c => `
        <option value="${c.id}">${escapeHtml(c.name)}</option>
      `).join('');
    } catch (e) {}

    document.getElementById('bm-filter-course').onchange = (e) => {
      this.filterCourseId = e.target.value;
      this.loadBookmarks();
    };

    await this.loadBookmarks();
  },

  async loadBookmarks() {
    const container = document.getElementById('bookmarks-container');
    container.innerHTML = renderLoadingState('Loading bookmarked items...');

    try {
      const bookmarks = await API.bookmarks.list(this.filterCourseId || null);

      if (!bookmarks || bookmarks.length === 0) {
        container.innerHTML = renderEmptyState({
          icon: 'bookmark',
          title: 'No bookmarked resources',
          description: this.filterCourseId
            ? 'No bookmarks found for this course.'
            : 'You haven\'t pinned any materials yet. Click the bookmark icon on any resource in your library to pin it here.',
          actionText: 'Browse Resource Library',
          actionId: 'btn-bm-goto-lib',
        });
        const btn = document.getElementById('btn-bm-goto-lib');
        if (btn) btn.onclick = () => window.router.navigate('library');
        return;
      }

      container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${bookmarks.map(res => `
            <div class="relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md p-5 sm:p-6 flex flex-col justify-between card-hover transition-all">
              <!-- Accent Top Bar -->
              <div class="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>

              <div class="space-y-3.5 pt-0.5">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2">
                    ${getTypeBadge(res.resource_type)}
                    <span class="text-[11px] font-semibold text-slate-400 font-mono">${formatBytes(res.file_size)}</span>
                  </div>
                  <button class="p-1.5 text-amber-500 hover:text-slate-400 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" title="Remove Bookmark" onclick="BookmarksView.removeBookmark(${res.id})">
                    ${getIcon('bookmark-filled', 'w-4 h-4 text-amber-500')}
                  </button>
                </div>

                <div>
                  <h3 class="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer tracking-tight transition-colors" onclick="window.readerWorkspace.open(${res.id})">
                    ${escapeHtml(res.title)}
                  </h3>
                  <p class="text-[11px] text-slate-400 font-mono mt-0.5 truncate">${escapeHtml(res.original_filename)}</p>
                </div>

                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${res.course_color || '#2563eb'}"></span>
                    ${escapeHtml(res.course_name)}
                  </span>
                  ${res.topic_title ? `
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      ${escapeHtml(res.topic_title)}
                    </span>
                  ` : ''}
                </div>
              </div>

              <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <button class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer" onclick="window.readerWorkspace.open(${res.id})">
                  ${getIcon('eye', 'w-3.5 h-3.5')}
                  <span>Open in Workspace</span>
                </button>
                <a href="${API.resources.downloadUrl(res.id)}" download class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer">
                  ${getIcon('download', 'w-3.5 h-3.5')}
                  <span>Download</span>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl">Error: ${escapeHtml(err.message)}</div>`;
    }
  },

  async removeBookmark(resourceId) {
    try {
      await API.bookmarks.toggle(resourceId);
      showToast('Bookmark removed.', 'info');
      await this.loadBookmarks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
};
