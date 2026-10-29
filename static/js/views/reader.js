// PDF Reader & Dedicated Study Workspace
const ReaderWorkspace = {
  currentResource: null,
  pdfDoc: null,
  pageNum: 1,
  pageCount: 1,
  scale: 1.2,
  isRendering: false,
  pageNumPending: null,

  async open(resourceId) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md animate-fade-in" id="reader-modal">
        <!-- Top Toolbar -->
        <div class="h-14 bg-slate-900 text-white px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div class="flex items-center gap-3 min-w-0 pr-4">
            <button id="reader-close-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Close Workspace">
              ${getIcon('x', 'w-5 h-5')}
            </button>
            <div class="min-w-0">
              <h2 class="text-xs font-bold text-white truncate max-w-sm sm:max-w-md" id="reader-doc-title">Loading...</h2>
              <p class="text-[10px] text-slate-400 truncate" id="reader-doc-subtitle">Study Workspace</p>
            </div>
          </div>

          <!-- Document Controls (Zoom, Pages, Actions) -->
          <div class="flex items-center gap-2">
            <!-- PDF Page controls (if PDF) -->
            <div id="pdf-controls" class="hidden flex items-center gap-1 bg-slate-800 rounded-xl px-2 py-1 text-xs">
              <button id="pdf-prev-page" class="p-1 text-slate-300 hover:text-white rounded transition-colors" title="Previous Page">
                &larr;
              </button>
              <span class="px-2 text-[11px] font-mono text-slate-200">
                <span id="pdf-current-page">1</span> / <span id="pdf-total-pages">1</span>
              </span>
              <button id="pdf-next-page" class="p-1 text-slate-300 hover:text-white rounded transition-colors" title="Next Page">
                &rarr;
              </button>
              <div class="h-3 w-px bg-slate-700 mx-1"></div>
              <button id="pdf-zoom-out" class="p-1 text-slate-300 hover:text-white rounded transition-colors" title="Zoom Out">
                ${getIcon('zoom-out', 'w-3.5 h-3.5')}
              </button>
              <span class="text-[10px] text-slate-400 font-mono w-9 text-center" id="pdf-zoom-val">120%</span>
              <button id="pdf-zoom-in" class="p-1 text-slate-300 hover:text-white rounded transition-colors" title="Zoom In">
                ${getIcon('zoom-in', 'w-3.5 h-3.5')}
              </button>
            </div>

            <!-- Bookmark Toggle -->
            <button id="reader-bookmark-btn" class="p-2 text-slate-300 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition-colors" title="Bookmark Resource">
              ${getIcon('bookmark', 'w-4 h-4')}
            </button>

            <!-- Complete Toggle -->
            <button id="reader-complete-btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Toggle Completion">
              ${getIcon('check-circle', 'w-3.5 h-3.5')}
              <span id="reader-complete-text">Mark Complete</span>
            </button>

            <!-- Download -->
            <a id="reader-download-link" href="#" download class="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors" title="Download Original File">
              ${getIcon('download', 'w-4 h-4')}
            </a>

            <!-- Toggle Notes Drawer Button -->
            <button id="reader-toggle-notes" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
              ${getIcon('file-text', 'w-3.5 h-3.5')}
              <span>Linked Notes</span>
            </button>
          </div>
        </div>

        <!-- Main Workspace Area -->
        <div class="flex-1 flex overflow-hidden relative">
          <!-- Document Viewer Area -->
          <div class="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-slate-950" id="reader-viewer-area">
            ${renderLoadingState('Opening document in secure workspace...')}
          </div>

          <!-- Side Panel: Linked Notes Drawer -->
          <div id="reader-notes-drawer" class="w-full sm:w-96 bg-white border-l border-slate-200 flex flex-col z-20 shadow-xl transition-all duration-300">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                ${getIcon('file-text', 'w-4 h-4 text-blue-600')}
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Document Study Notes</h3>
              </div>
              <button id="reader-close-notes" class="text-slate-400 hover:text-slate-600 p-1">
                ${getIcon('x', 'w-4 h-4')}
              </button>
            </div>

            <!-- Notes List / Create Form -->
            <div class="p-4 border-b border-slate-100 bg-slate-50 space-y-2 shrink-0">
              <input id="reader-note-title" type="text" placeholder="Note heading..."
                class="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold">
              <textarea id="reader-note-content" rows="4" placeholder="Take notes, formulas, or key case takeaways while studying this document..."
                class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"></textarea>
              <div class="flex justify-between items-center pt-1">
                <input id="reader-note-tags" type="text" placeholder="Tags (e.g. formula, exam)"
                  class="w-48 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none">
                <button id="reader-save-note-btn" class="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Save Note
                </button>
              </div>
            </div>

            <!-- Existing Notes for this resource -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3" id="reader-notes-list">
              ${renderLoadingState('Loading linked study notes...')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Base Controls
    document.getElementById('reader-close-btn').onclick = () => {
      modalContainer.innerHTML = '';
      this.currentResource = null;
    };

    const notesDrawer = document.getElementById('reader-notes-drawer');
    document.getElementById('reader-toggle-notes').onclick = () => {
      notesDrawer.classList.toggle('hidden');
    };
    document.getElementById('reader-close-notes').onclick = () => {
      notesDrawer.classList.add('hidden');
    };

    // Load Resource Details
    try {
      const res = await API.resources.get(resourceId);
      this.currentResource = res;

      document.getElementById('reader-doc-title').textContent = res.title;
      document.getElementById('reader-doc-subtitle').textContent = `${res.course_name} • ${res.resource_type} • ${formatBytes(res.file_size)}`;
      document.getElementById('reader-download-link').href = API.resources.downloadUrl(res.id);

      // Bookmark state
      const bmBtn = document.getElementById('reader-bookmark-btn');
      bmBtn.innerHTML = res.is_bookmarked ? getIcon('bookmark-filled', 'w-4 h-4 text-amber-400') : getIcon('bookmark', 'w-4 h-4');
      bmBtn.onclick = async () => {
        const toggleRes = await API.bookmarks.toggle(res.id);
        res.is_bookmarked = toggleRes.bookmarked;
        bmBtn.innerHTML = res.is_bookmarked ? getIcon('bookmark-filled', 'w-4 h-4 text-amber-400') : getIcon('bookmark', 'w-4 h-4');
        showToast(toggleRes.message, 'success');
      };

      // Completed state
      const compBtn = document.getElementById('reader-complete-btn');
      const compText = document.getElementById('reader-complete-text');
      if (res.is_completed) {
        compBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white transition-colors';
        compText.textContent = 'Completed';
      }
      compBtn.onclick = async () => {
        const updated = await API.resources.toggleComplete(res.id);
        res.is_completed = updated.is_completed;
        if (res.is_completed) {
          compBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white transition-colors';
          compText.textContent = 'Completed';
          showToast('Resource marked as completed!', 'success');
        } else {
          compBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors';
          compText.textContent = 'Mark Complete';
          showToast('Resource marked as incomplete.', 'info');
        }
      };

      // Load Document Preview
      await this.renderDocumentPreview(res);

      // Load and Bind Notes
      await this.loadLinkedNotes(res.id);
      document.getElementById('reader-save-note-btn').onclick = async () => {
        const title = document.getElementById('reader-note-title').value.trim();
        const content = document.getElementById('reader-note-content').value.trim();
        const tags = document.getElementById('reader-note-tags').value.trim();

        if (!title && !content) {
          showToast('Please enter note content.', 'warning');
          return;
        }

        try {
          await API.notes.create({
            title: title || `Note on ${res.title}`,
            content: content,
            course_id: res.course_id,
            unit_topic_id: res.unit_topic_id,
            resource_id: res.id,
            tags: tags,
          });
          document.getElementById('reader-note-title').value = '';
          document.getElementById('reader-note-content').value = '';
          document.getElementById('reader-note-tags').value = '';
          showToast('Linked study note saved!', 'success');
          await this.loadLinkedNotes(res.id);
        } catch (err) {
          showToast(err.message, 'error');
        }
      };
    } catch (err) {
      showToast('Error opening workspace: ' + err.message, 'error');
    }
  },

  async renderDocumentPreview(res) {
    const viewer = document.getElementById('reader-viewer-area');
    const viewUrl = API.resources.viewUrl(res.id);

    if (res.file_extension === '.pdf') {
      document.getElementById('pdf-controls').classList.remove('hidden');
      viewer.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-start overflow-auto" id="pdf-canvas-container">
          <!-- Fallback or native PDF frame with canvas rendering -->
          <iframe src="${viewUrl}#toolbar=1" class="w-full h-full rounded-xl border border-slate-800 shadow-2xl bg-white" title="${escapeHtml(res.title)}"></iframe>
        </div>
      `;
    } else if (['.png', '.jpg', '.jpeg'].includes(res.file_extension)) {
      viewer.innerHTML = `
        <div class="max-w-4xl max-h-full p-4 flex items-center justify-center">
          <img src="${viewUrl}" alt="${escapeHtml(res.title)}" class="max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain border border-slate-800">
        </div>
      `;
    } else if (['.txt', '.csv'].includes(res.file_extension)) {
      try {
        const resp = await fetch(viewUrl);
        const textContent = await resp.text();
        viewer.innerHTML = `
          <div class="w-full max-w-4xl max-h-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-auto text-left">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span class="text-xs font-mono text-slate-400">${escapeHtml(res.original_filename)}</span>
              <span class="text-[11px] text-slate-500">${res.file_size} bytes</span>
            </div>
            <pre class="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">${escapeHtml(textContent)}</pre>
          </div>
        `;
      } catch (e) {
        viewer.innerHTML = `<div class="text-xs text-rose-400">Failed to load text preview.</div>`;
      }
    } else {
      // Presentation / Office Document (PPT, DOC, XLS)
      const extUpper = res.file_extension.replace('.', '').toUpperCase();
      viewer.innerHTML = `
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
            ${getIcon('file-text', 'w-8 h-8')}
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-white">${escapeHtml(res.title)}</h3>
            <p class="text-xs text-slate-400">${extUpper} Office Presentation / Spreadsheet</p>
            <p class="text-[11px] font-mono text-slate-500">${escapeHtml(res.original_filename)} • ${formatBytes(res.file_size)}</p>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            This file format is stored safely in your local persistent storage. Open it directly with your installed desktop application (e.g., Microsoft PowerPoint, Excel, Word, or Keynote) or download a local copy.
          </p>
          <div class="flex justify-center gap-3 pt-2">
            <a href="${API.resources.downloadUrl(res.id)}" download class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
              ${getIcon('download', 'w-4 h-4')}
              Download Document
            </a>
          </div>
        </div>
      `;
    }
  },

  async loadLinkedNotes(resourceId) {
    const container = document.getElementById('reader-notes-list');
    try {
      const notes = await API.notes.list({ resource_id: resourceId });
      if (!notes || notes.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-slate-400 text-xs">
            No study notes attached to this document yet. Type above to create your first note.
          </div>
        `;
        return;
      }

      container.innerHTML = notes.map(n => `
        <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-left">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900">${escapeHtml(n.title)}</h4>
            <span class="text-[10px] text-slate-400">${formatDate(n.created_at)}</span>
          </div>
          <div class="text-xs text-slate-700 leading-relaxed formatted-content line-clamp-4">
            ${escapeHtml(n.content)}
          </div>
          ${n.tags ? `
            <div class="flex gap-1 pt-1">
              ${n.tags.split(',').filter(t => t.trim()).map(t => `
                <span class="text-[9px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">#${escapeHtml(t.trim())}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<div class="text-xs text-rose-500">Failed to load notes.</div>`;
    }
  }
};

window.readerWorkspace = ReaderWorkspace;
