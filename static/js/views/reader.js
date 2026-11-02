// PDF Reader & Dedicated Study Workspace
const ReaderWorkspace = {
  currentResource: null,
  pdfDoc: null,
  pageNum: 1,
  pageCount: 1,
  scale: 1.2,
  isRendering: false,
  pageNumPending: null,

  async open(resourceId, options = {}) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md animate-fade-in" id="reader-modal">
        <!-- Top Toolbar -->
        <div class="h-14 bg-[#090d16] text-white px-4 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0 shadow-sm">
          <div class="flex items-center gap-3.5 min-w-0 pr-4">
            <button id="reader-close-btn" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer" title="Close Workspace">
              ${getIcon('x', 'w-5 h-5')}
            </button>
            <div class="min-w-0">
              <h2 class="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md tracking-tight" id="reader-doc-title">Loading...</h2>
              <p class="text-[10px] text-slate-400 truncate font-medium" id="reader-doc-subtitle">Study Workspace</p>
            </div>
          </div>

          <!-- Document Controls (Zoom, Pages, Actions) -->
          <div class="flex items-center gap-2">
            <!-- PDF Page controls (if PDF) -->
            <div id="pdf-controls" class="hidden flex items-center gap-1 bg-slate-800/80 rounded-xl px-2.5 py-1 text-xs border border-slate-700/60">
              <button id="pdf-prev-page" class="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer" title="Previous Page">
                &larr;
              </button>
              <span class="px-2 text-[11px] font-mono text-slate-200">
                <span id="pdf-current-page">1</span> / <span id="pdf-total-pages">1</span>
              </span>
              <button id="pdf-next-page" class="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer" title="Next Page">
                &rarr;
              </button>
              <div class="h-3.5 w-px bg-slate-700 mx-1"></div>
              <button id="pdf-zoom-out" class="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer" title="Zoom Out">
                ${getIcon('zoom-out', 'w-3.5 h-3.5')}
              </button>
              <span class="text-[10px] text-slate-400 font-mono w-9 text-center" id="pdf-zoom-val">120%</span>
              <button id="pdf-zoom-in" class="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer" title="Zoom In">
                ${getIcon('zoom-in', 'w-3.5 h-3.5')}
              </button>
            </div>

            <!-- Bookmark Toggle -->
            <button id="reader-bookmark-btn" class="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer" title="Bookmark Resource">
              ${getIcon('bookmark', 'w-4 h-4')}
            </button>

            <!-- Complete Toggle -->
            <button id="reader-complete-btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer" title="Toggle Completion">
              ${getIcon('check-circle', 'w-3.5 h-3.5')}
              <span id="reader-complete-text">Mark Complete</span>
            </button>

            <!-- Download -->
            <a id="reader-download-link" href="#" download class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer" title="Download Original File">
              ${getIcon('download', 'w-4 h-4')}
            </a>

            <!-- Toggle AI & Notes Drawer Buttons -->
            <button id="reader-toggle-ai" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-xs transition-all cursor-pointer">
              ${getIcon('sparkles', 'w-3.5 h-3.5')}
              <span>Ask AI</span>
            </button>
            <button id="reader-toggle-notes" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors cursor-pointer">
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

          <!-- Side Panel: Drawer with Tabs (Ask AI & Linked Notes) -->
          <div id="reader-notes-drawer" class="w-full sm:w-96 bg-white border-l border-slate-200/80 flex flex-col z-20 shadow-2xl transition-all duration-300">
            <!-- Header with Tabs -->
            <div class="p-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div class="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl">
                <button id="reader-tab-ai-btn" class="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-indigo-700 shadow-2xs transition-all cursor-pointer">
                  ✨ Ask AI
                </button>
                <button id="reader-tab-notes-btn" class="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
                  📝 Linked Notes
                </button>
              </div>
              <button id="reader-close-notes" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                ${getIcon('x', 'w-4 h-4')}
              </button>
            </div>

            <!-- Tab 1: AI Assistant Pane -->
            <div id="reader-ai-pane" class="flex-1 flex flex-col overflow-hidden">
              <div class="p-3 bg-indigo-50/50 border-b border-indigo-100/60 shrink-0 flex items-center justify-between text-[11px] text-indigo-900">
                <div class="flex items-center gap-1.5 font-semibold">
                  ${getIcon('bot', 'w-3.5 h-3.5 text-indigo-600')}
                  <span>AI Assistant scoped to this deck</span>
                </div>
                <button onclick="window.appModals.openExplainConcept('', window.readerWorkspace.currentResource?.course_id, window.readerWorkspace.currentResource?.id)" class="text-indigo-600 font-bold hover:underline cursor-pointer">
                  Explain Concept
                </button>
              </div>

              <!-- In-reader chat messages stream -->
              <div class="flex-1 overflow-y-auto p-4 space-y-3" id="reader-ai-messages">
                <div class="text-center py-6 space-y-2.5 text-slate-400">
                  <div class="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit mx-auto border border-indigo-100">
                    ${getIcon('sparkles', 'w-5 h-5')}
                  </div>
                  <p class="text-xs font-bold text-slate-800">Ask questions about this presentation</p>
                  <p class="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">Cites exact slide or page numbers from this document.</p>
                  <div class="flex flex-col gap-1.5 pt-2 text-left">
                    <button class="reader-ai-chip text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 text-[11px] text-slate-700 font-semibold border border-slate-200/80 transition-all cursor-pointer" data-prompt="Summarize the core takeaways and framework of this presentation in 5 bullet points.">
                      📌 Summarize key takeaways
                    </button>
                    <button class="reader-ai-chip text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 text-[11px] text-slate-700 font-semibold border border-slate-200/80 transition-all cursor-pointer" data-prompt="What are the essential formulas, metrics, and definitions covered here?">
                      📐 Key definitions &amp; metrics
                    </button>
                    <button class="reader-ai-chip text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 text-[11px] text-slate-700 font-semibold border border-slate-200/80 transition-all cursor-pointer" data-prompt="How would an MBA exam question test this material? Provide sample questions and answer frames.">
                      📝 Exam questions &amp; answers
                    </button>
                  </div>
                </div>
              </div>

              <!-- In-reader chat input -->
              <div class="p-3.5 border-t border-slate-100 bg-white shrink-0">
                <form id="reader-ai-form" class="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                  <input id="reader-ai-input" type="text" placeholder="Ask about this deck / slide..."
                    class="flex-1 bg-transparent border-0 text-xs text-slate-800 placeholder-slate-400 focus:outline-none px-2.5 py-1">
                  <button type="submit" id="reader-ai-send-btn" class="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 transition-colors shadow-2xs cursor-pointer">
                    ${getIcon('send', 'w-3.5 h-3.5')}
                  </button>
                </form>
              </div>
            </div>

            <!-- Tab 2: Linked Notes Pane -->
            <div id="reader-notes-pane" class="flex-1 flex flex-col overflow-hidden hidden">
              <!-- Notes List / Create Form -->
              <div class="p-4 border-b border-slate-100 bg-slate-50/70 space-y-2.5 shrink-0">
                <input id="reader-note-title" type="text" placeholder="Note heading..."
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold text-slate-900">
                <textarea id="reader-note-content" rows="4" placeholder="Take notes, formulas, or key case takeaways while studying this document..."
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed text-slate-800"></textarea>
                <div class="flex justify-between items-center gap-2 pt-1">
                  <input id="reader-note-tags" type="text" placeholder="Tags (e.g. formula, exam)"
                    class="flex-1 px-2.5 py-1.5 text-[11px] bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <button id="reader-save-note-btn" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all hover:shadow-sm cursor-pointer shrink-0">
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
      </div>
    `;

    // Bind Base Controls
    document.getElementById('reader-close-btn').onclick = () => {
      modalContainer.innerHTML = '';
      this.currentResource = null;
    };

    const notesDrawer = document.getElementById('reader-notes-drawer');
    const aiPane = document.getElementById('reader-ai-pane');
    const notesPane = document.getElementById('reader-notes-pane');
    const tabAiBtn = document.getElementById('reader-tab-ai-btn');
    const tabNotesBtn = document.getElementById('reader-tab-notes-btn');

    const showAiTab = () => {
      notesDrawer.classList.remove('hidden');
      aiPane.classList.remove('hidden');
      notesPane.classList.add('hidden');
      tabAiBtn.className = 'px-3 py-1 text-xs font-bold rounded-lg bg-white text-indigo-700 shadow-2xs transition-all';
      tabNotesBtn.className = 'px-3 py-1 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all';
    };

    const showNotesTab = () => {
      notesDrawer.classList.remove('hidden');
      aiPane.classList.add('hidden');
      notesPane.classList.remove('hidden');
      tabNotesBtn.className = 'px-3 py-1 text-xs font-bold rounded-lg bg-white text-blue-700 shadow-2xs transition-all';
      tabAiBtn.className = 'px-3 py-1 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all';
    };

    tabAiBtn.onclick = showAiTab;
    tabNotesBtn.onclick = showNotesTab;

    document.getElementById('reader-toggle-ai').onclick = () => {
      if (notesDrawer.classList.contains('hidden') || !aiPane.classList.contains('hidden')) {
        notesDrawer.classList.toggle('hidden');
      }
      if (!notesDrawer.classList.contains('hidden')) showAiTab();
    };

    document.getElementById('reader-toggle-notes').onclick = () => {
      if (notesDrawer.classList.contains('hidden') || !notesPane.classList.contains('hidden')) {
        notesDrawer.classList.toggle('hidden');
      }
      if (!notesDrawer.classList.contains('hidden')) showNotesTab();
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

      // Determine target page/slide
      const targetPage = options.pageNum || res.last_page_number || 1;
      const targetSlide = options.slideNum || res.last_slide_number || 1;
      const targetPos = options.position_label || (res.resource_type === 'Presentation' ? `Slide ${targetSlide}` : `Page ${targetPage}`);

      // Save initial access & position
      API.resources.saveProgress(res.id, {
        page_number: targetPage,
        slide_number: targetSlide,
        position_label: targetPos,
      }).catch(() => {});

      // Load Document Preview
      await this.renderDocumentPreview(res, { targetPage, targetSlide, targetPos });

      // Load and Bind Notes
      await this.loadLinkedNotes(res.id);

      // In-Reader AI Assistant Logic
      const readerAiContainer = document.getElementById('reader-ai-messages');
      const readerAiForm = document.getElementById('reader-ai-form');
      const readerAiInput = document.getElementById('reader-ai-input');

      const sendReaderAiMessage = async (promptText) => {
        if (!promptText || !promptText.trim()) return;
        const text = promptText.trim();
        readerAiInput.value = '';

        // Append user bubble
        const userEl = document.createElement('div');
        userEl.className = 'flex justify-end';
        userEl.innerHTML = `<div class="ai-user-bubble px-3 py-2 text-xs max-w-xs text-white">${escapeHtml(text)}</div>`;
        readerAiContainer.appendChild(userEl);

        // Append loading
        const loadEl = document.createElement('div');
        loadEl.className = 'flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-indigo-700 animate-fade-in';
        loadEl.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><span>Reviewing deck slides...</span>`;
        readerAiContainer.appendChild(loadEl);
        readerAiContainer.scrollTop = readerAiContainer.scrollHeight;

        try {
          const resp = await API.ai.chat({
            message: text,
            resource_id: res.id,
            course_id: res.course_id,
            study_mode: 'learn',
          });

          loadEl.remove();

          const botEl = document.createElement('div');
          botEl.className = 'p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-800 animate-fade-in';
          botEl.innerHTML = `
            <div class="ai-rendered-content">${formatAiMarkdown(resp.reply)}</div>
            ${resp.citations && resp.citations.length > 0 ? `
              <div class="pt-1.5 border-t border-slate-200/80 flex items-center gap-1 flex-wrap">
                ${resp.citations.map(c => `<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">${escapeHtml(c)}</span>`).join(' ')}
              </div>
            ` : ''}
            <div class="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
              <button class="reader-ai-save-note-btn text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
                ${getIcon('file-text', 'w-3 h-3')} Save as Linked Note
              </button>
              <button class="hover:text-slate-700" onclick="copyToClipboard(this.closest('.p-3').querySelector('.ai-rendered-content').innerText)">Copy</button>
            </div>
          `;

          const saveBtn = botEl.querySelector('.reader-ai-save-note-btn');
          if (saveBtn) {
            saveBtn.onclick = async () => {
              try {
                await API.notes.create({
                  title: `AI Note: ${text.slice(0, 40)}`,
                  content: resp.reply,
                  course_id: res.course_id,
                  resource_id: res.id,
                  tags: 'AI Note, Deck Study',
                });
                showToast('Answer saved directly to document notes!', 'success');
                await ReaderWorkspace.loadLinkedNotes(res.id);
              } catch (e) {
                showToast(e.message, 'error');
              }
            };
          }

          readerAiContainer.appendChild(botEl);
        } catch (err) {
          loadEl.remove();
          const errEl = document.createElement('div');
          errEl.className = 'p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700';
          errEl.textContent = `Error: ${err.message}`;
          readerAiContainer.appendChild(errEl);
        }
        readerAiContainer.scrollTop = readerAiContainer.scrollHeight;
      };

      if (readerAiForm) {
        readerAiForm.onsubmit = (e) => {
          e.preventDefault();
          sendReaderAiMessage(readerAiInput.value);
        };
      }

      document.querySelectorAll('.reader-ai-chip').forEach(chip => {
        chip.onclick = () => {
          const prompt = chip.getAttribute('data-prompt');
          sendReaderAiMessage(prompt);
        };
      });

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

  async renderDocumentPreview(res, opts = {}) {
    const viewer = document.getElementById('reader-viewer-area');
    const viewUrl = API.resources.viewUrl(res.id);

    if (res.file_extension === '.pdf') {
      document.getElementById('pdf-controls').classList.remove('hidden');
      const startPage = opts.targetPage || res.last_page_number || 1;
      const curPageSpan = document.getElementById('pdf-current-page');
      if (curPageSpan) curPageSpan.textContent = startPage;

      viewer.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-start overflow-auto" id="pdf-canvas-container">
          <iframe id="pdf-viewer-frame" src="${viewUrl}#page=${startPage}&toolbar=1" class="w-full h-full rounded-xl border border-slate-800 shadow-2xl bg-white" title="${escapeHtml(res.title)}"></iframe>
        </div>
      `;

      let curPage = startPage;
      const prevBtn = document.getElementById('pdf-prev-page');
      const nextBtn = document.getElementById('pdf-next-page');
      if (prevBtn) {
        prevBtn.onclick = () => {
          if (curPage > 1) {
            curPage--;
            if (curPageSpan) curPageSpan.textContent = curPage;
            const iframe = document.getElementById('pdf-viewer-frame');
            if (iframe) iframe.src = `${viewUrl}#page=${curPage}&toolbar=1`;
            API.resources.saveProgress(res.id, {
              page_number: curPage,
              position_label: `Page ${curPage}`
            }).catch(() => {});
          }
        };
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          curPage++;
          if (curPageSpan) curPageSpan.textContent = curPage;
          const iframe = document.getElementById('pdf-viewer-frame');
          if (iframe) iframe.src = `${viewUrl}#page=${curPage}&toolbar=1`;
          API.resources.saveProgress(res.id, {
            page_number: curPage,
            position_label: `Page ${curPage}`
          }).catch(() => {});
        };
      }
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
      const slideNum = opts.targetSlide || res.last_slide_number || 1;
      viewer.innerHTML = `
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
            ${getIcon('file-text', 'w-8 h-8')}
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-white">${escapeHtml(res.title)}</h3>
            <p class="text-xs text-slate-400">${extUpper} Office Presentation / Spreadsheet</p>
            <p class="text-[11px] font-mono text-slate-500">${escapeHtml(res.original_filename)} • ${formatBytes(res.file_size)}</p>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs mt-2">
              <span>Position: <strong>Slide ${slideNum}</strong></span>
            </div>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            This lecture presentation is indexed for AI questions and study notes. You can ask questions in the right-hand AI tab or download the file to open in PowerPoint or Keynote.
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
