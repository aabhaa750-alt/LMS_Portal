// Personal Study Notes View
const NotesView = {
  filterCourseId: '',
  filterSearch: '',
  activeNoteId: null,

  async render() {
    return `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Personal Study Notes</h1>
            <p class="text-xs text-slate-500 mt-1">Lecture summaries, framework deconstructions, formulas, and revision memos</p>
          </div>
          <button id="btn-create-note-main" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
            ${getIcon('plus', 'w-3.5 h-3.5')}
            New Note
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              ${getIcon('search', 'w-4 h-4')}
            </span>
            <input id="notes-search-input" type="text" placeholder="Search notes by title, keyword, or tag..."
              class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
          </div>
          <div class="w-full md:w-64">
            <select id="notes-filter-course" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              <option value="">All Subjects</option>
            </select>
          </div>
        </div>

        <!-- Two Column Notes Explorer -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Notes List (5 cols) -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600" id="notes-count-label">Notes (0)</span>
            </div>
            <div class="flex-1 overflow-y-auto divide-y divide-slate-100" id="notes-list-container">
              ${renderLoadingState('Loading notes...')}
            </div>
          </div>

          <!-- Note Active Editor / Viewer (7 cols) -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6" id="note-editor-container">
            <div class="py-16 text-center text-slate-400 text-xs">
              Select a note on the left or create a new note to start editing.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    document.getElementById('btn-create-note-main').onclick = () => this.initNewNoteForm();

    // Populate course filter
    try {
      const courses = await API.courses.list();
      const courseSelect = document.getElementById('notes-filter-course');
      courseSelect.innerHTML = '<option value="">All Subjects</option>' + courses.map(c => `
        <option value="${c.id}">${escapeHtml(c.name)}</option>
      `).join('');
    } catch (e) {}

    let searchTimer;
    document.getElementById('notes-search-input').oninput = (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        this.filterSearch = e.target.value.trim();
        this.loadNotes();
      }, 300);
    };

    document.getElementById('notes-filter-course').onchange = (e) => {
      this.filterCourseId = e.target.value;
      this.loadNotes();
    };

    await this.loadNotes();
  },

  async loadNotes() {
    const listContainer = document.getElementById('notes-list-container');
    listContainer.innerHTML = renderLoadingState('Loading notes...');

    try {
      const notes = await API.notes.list({
        course_id: this.filterCourseId || null,
        search: this.filterSearch || null,
      });

      document.getElementById('notes-count-label').textContent = `Notes (${notes.length})`;

      if (!notes || notes.length === 0) {
        listContainer.innerHTML = `
          <div class="p-8 text-center text-xs text-slate-400">
            No study notes found. Click "+ New Note" to write your first revision summary.
          </div>
        `;
        document.getElementById('note-editor-container').innerHTML = `
          <div class="py-16 text-center text-slate-400 text-xs">
            No note selected.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = notes.map(n => this.renderNoteListItem(n)).join('');

      // Auto-select first note or previously active
      if (!this.activeNoteId || !notes.some(n => n.id === this.activeNoteId)) {
        this.selectNote(notes[0].id);
      } else {
        this.selectNote(this.activeNoteId);
      }
    } catch (err) {
      listContainer.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50">Error: ${escapeHtml(err.message)}</div>`;
    }
  },

  renderNoteListItem(note) {
    const isSelected = this.activeNoteId === note.id;
    return `
      <div class="p-4 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'}"
        onclick="NotesView.selectNote(${note.id})">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-xs font-bold text-slate-900 truncate">${escapeHtml(note.title)}</h4>
          <span class="text-[10px] text-slate-400 shrink-0">${formatDate(note.updated_at)}</span>
        </div>
        <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">${escapeHtml(note.content.slice(0, 140))}</p>
        <div class="flex items-center gap-1.5 flex-wrap">
          ${note.course_name ? `
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
              ${escapeHtml(note.course_name)}
            </span>
          ` : ''}
          ${note.resource_title ? `
            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
              Linked Doc
            </span>
          ` : ''}
        </div>
      </div>
    `;
  },

  async selectNote(noteId) {
    this.activeNoteId = noteId;
    const editor = document.getElementById('note-editor-container');
    editor.innerHTML = renderLoadingState('Loading note editor...');

    try {
      const note = await API.notes.get(noteId);
      const courses = await API.courses.list();

      editor.innerHTML = `
        <div class="space-y-4 animate-fade-in">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-400">Last edited: ${formatDateTime(note.updated_at)}</span>
            </div>
            <div class="flex items-center gap-2">
              <button id="note-delete-btn" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Delete Note">
                ${getIcon('trash', 'w-4 h-4')}
              </button>
              <button id="note-save-btn" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
                ${getIcon('check', 'w-3.5 h-3.5')}
                Save Changes
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Subject</label>
              <select id="edit-note-course" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                <option value="">No Course (General)</option>
                ${courses.map(c => `
                  <option value="${c.id}" ${note.course_id === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Tags (comma separated)</label>
              <input id="edit-note-tags" type="text" value="${escapeHtml(note.tags)}" placeholder="e.g. formula, midterm, case-study"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Note Title</label>
            <input id="edit-note-title" type="text" value="${escapeHtml(note.title)}"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500">
          </div>

          <!-- Formatting Helper Toolbar -->
          <div class="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs">
            <button type="button" class="px-2 py-1 font-bold hover:bg-white rounded" title="Heading" onclick="NotesView.insertFormatting('## ')">H2</button>
            <button type="button" class="px-2 py-1 font-bold hover:bg-white rounded" title="Subheading" onclick="NotesView.insertFormatting('### ')">H3</button>
            <div class="h-3 w-px bg-slate-300 mx-1"></div>
            <button type="button" class="px-2 py-1 font-bold hover:bg-white rounded" title="Bold" onclick="NotesView.insertFormatting('**', '**')">B</button>
            <button type="button" class="px-2 py-1 italic hover:bg-white rounded" title="Italic" onclick="NotesView.insertFormatting('*', '*')">I</button>
            <button type="button" class="px-2 py-1 hover:bg-white rounded" title="Bullet List" onclick="NotesView.insertFormatting('- ')">&bull; List</button>
            <button type="button" class="px-2 py-1 hover:bg-white rounded" title="Numbered List" onclick="NotesView.insertFormatting('1. ')">1. List</button>
            <button type="button" class="px-2 py-1 hover:bg-white rounded font-mono" title="Code" onclick="NotesView.insertFormatting('\`', '\`')">&lt;/&gt;</button>
          </div>

          <div>
            <textarea id="edit-note-content" rows="14" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">${escapeHtml(note.content)}</textarea>
          </div>
        </div>
      `;

      // Attach Delete
      document.getElementById('note-delete-btn').onclick = () => {
        showConfirmModal({
          title: `Delete Note '${note.title}'?`,
          message: 'This note will be permanently removed.',
          confirmText: 'Delete Note',
          isDestructive: true,
          onConfirm: async () => {
            try {
              await API.notes.delete(note.id);
              showToast('Note deleted.', 'info');
              this.activeNoteId = null;
              await this.loadNotes();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }
        });
      };

      // Attach Save
      document.getElementById('note-save-btn').onclick = async () => {
        const title = document.getElementById('edit-note-title').value.trim();
        const content = document.getElementById('edit-note-content').value;
        const course_id = document.getElementById('edit-note-course').value;
        const tags = document.getElementById('edit-note-tags').value.trim();

        try {
          await API.notes.update(note.id, {
            title,
            content,
            course_id: course_id ? parseInt(course_id) : 0,
            tags,
          });
          showToast('Note saved successfully.', 'success');
          await this.loadNotes();
        } catch (err) {
          showToast(err.message, 'error');
        }
      };

    } catch (err) {
      editor.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50">Error: ${escapeHtml(err.message)}</div>`;
    }
  },

  async initNewNoteForm() {
    const editor = document.getElementById('note-editor-container');
    const courses = await API.courses.list();

    editor.innerHTML = `
      <div class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-sm font-bold text-slate-900">New Study Note</h3>
          <button id="note-create-btn" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
            ${getIcon('plus', 'w-3.5 h-3.5')}
            Create Note
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Subject</label>
            <select id="new-note-course" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
              <option value="">No Course (General)</option>
              ${courses.map(c => `
                <option value="${c.id}">${escapeHtml(c.name)}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Tags (comma separated)</label>
            <input id="new-note-tags" type="text" placeholder="e.g. framework, lecture-1, formulas"
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Note Title</label>
          <input id="new-note-title" type="text" placeholder="e.g. Porter's Five Forces Model Notes"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500">
        </div>

        <!-- Formatting Helper Toolbar -->
        <div class="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs">
          <button type="button" class="px-2 py-1 font-bold hover:bg-white rounded" title="Heading" onclick="NotesView.insertFormattingNew('## ')">H2</button>
          <button type="button" class="px-2 py-1 font-bold hover:bg-white rounded" title="Subheading" onclick="NotesView.insertFormattingNew('### ')">H3</button>
          <div class="h-3 w-px bg-slate-300 mx-1"></div>
          <button type="button" class="px-2 py-1 font-bold hover:bg-white rounded" title="Bold" onclick="NotesView.insertFormattingNew('**', '**')">B</button>
          <button type="button" class="px-2 py-1 italic hover:bg-white rounded" title="Italic" onclick="NotesView.insertFormattingNew('*', '*')">I</button>
          <button type="button" class="px-2 py-1 hover:bg-white rounded" title="Bullet List" onclick="NotesView.insertFormattingNew('- ')">&bull; List</button>
          <button type="button" class="px-2 py-1 hover:bg-white rounded" title="Numbered List" onclick="NotesView.insertFormattingNew('1. ')">1. List</button>
        </div>

        <div>
          <textarea id="new-note-content" rows="14" placeholder="Write your revision notes here. You can use markdown headings, lists, and bold text..."
            class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"></textarea>
        </div>
      </div>
    `;

    document.getElementById('note-create-btn').onclick = async () => {
      const title = document.getElementById('new-note-title').value.trim();
      const content = document.getElementById('new-note-content').value;
      const course_id = document.getElementById('new-note-course').value;
      const tags = document.getElementById('new-note-tags').value.trim();

      if (!title) {
        showToast('Please provide a note title.', 'warning');
        return;
      }

      try {
        const created = await API.notes.create({
          title,
          content,
          course_id: course_id ? parseInt(course_id) : null,
          tags,
        });
        showToast('Note created successfully.', 'success');
        this.activeNoteId = created.id;
        await this.loadNotes();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  },

  insertFormatting(prefix, suffix = '') {
    const textarea = document.getElementById('edit-note-content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, end + prefix.length);
  },

  insertFormattingNew(prefix, suffix = '') {
    const textarea = document.getElementById('new-note-content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, end + prefix.length);
  }
};
