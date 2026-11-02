// AI Study Assistant View — Intelligent MBA Pair-Learning Interface
const AiAssistantView = {
  currentConversationId: null,
  selectedCourseId: '',
  selectedResourceId: '',
  activeStudyMode: 'learn', // 'learn', 'quick_revision', 'exam', 'business', 'ask_anything'
  conversations: [],
  courses: [],
  resources: [],
  messages: [],
  isGenerating: false,

  studyModes: [
    {
      id: 'learn',
      name: 'Learn Mode',
      icon: 'brain',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Foundations, clear conceptual breakdown, and MBA terminology',
    },
    {
      id: 'quick_revision',
      name: 'Quick Revision',
      icon: 'sparkles',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'High-yield summaries, key definitions, and flash takeaways',
    },
    {
      id: 'exam',
      name: 'Exam Mode',
      icon: 'file-text',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Answer framing, scoring keywords, and case application',
    },
    {
      id: 'business',
      name: 'Business Application',
      icon: 'target',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Real corporate examples, brand applications, and business impact',
    },
    {
      id: 'ask_anything',
      name: 'Ask Anything',
      icon: 'message-square',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      description: 'Open Q&A referencing your slide decks and textbooks',
    },
  ],

  suggestedPrompts: [
    { text: 'Teach me this topic from the beginning.', mode: 'learn' },
    { text: 'Explain this concept with an MBA-level example.', mode: 'business' },
    { text: 'Give me exam-oriented notes and scoring points.', mode: 'exam' },
    { text: 'Test my understanding with 3 practice questions.', mode: 'exam' },
    { text: 'Summarize the core takeaways into 5 bullet points.', mode: 'quick_revision' },
  ],

  async render(params = {}) {
    if (params.course_id) this.selectedCourseId = String(params.course_id);
    if (params.resource_id) this.selectedResourceId = String(params.resource_id);
    if (params.mode) this.activeStudyMode = params.mode;
    if (params.conversation_id) this.currentConversationId = parseInt(params.conversation_id);

    return `
      <div class="h-[calc(100vh-6rem)] -m-4 sm:-m-8 flex flex-col md:flex-row overflow-hidden bg-slate-50/80 animate-fade-in">
        <!-- Left Sidebar: Scope, Modes & Conversation History -->
        <aside class="w-full md:w-80 lg:w-92 bg-white border-r border-slate-200/70 flex flex-col shrink-0 h-auto md:h-full overflow-hidden shadow-xs">
          <!-- Top Header / New Chat Button -->
          <div class="p-4 sm:p-5 border-b border-slate-100 space-y-3.5 shrink-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/20">
                  ${getIcon('sparkles', 'w-4 h-4')}
                </div>
                <div>
                  <h2 class="text-sm font-bold text-slate-900 leading-tight">AI Study Assistant</h2>
                  <p class="text-[10px] text-slate-400 font-medium">Grounded in class PPTs &amp; PDFs</p>
                </div>
              </div>
              <button id="ai-new-chat-btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all hover:shadow-sm cursor-pointer" title="Start New Study Session">
                ${getIcon('plus', 'w-3.5 h-3.5')}
                <span>New Chat</span>
              </button>
            </div>

            <!-- Subject / Course Filter -->
            <div class="space-y-1">
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject / Course Scope</label>
              <select id="ai-scope-course" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors">
                <option value="">All Subjects &amp; Courses</option>
              </select>
            </div>

            <!-- Document / Presentation Filter -->
            <div class="space-y-1">
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Presentation / Document</label>
              <select id="ai-scope-resource" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors">
                <option value="">All Course Materials</option>
              </select>
            </div>
          </div>

          <!-- Study Modes Selector -->
          <div class="p-3.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Study Mode</span>
            <div class="grid grid-cols-2 gap-1.5" id="ai-study-mode-buttons">
              ${this.studyModes.map(m => `
                <button type="button" data-mode="${m.id}" class="ai-mode-btn text-left p-2 rounded-xl border text-xs transition-all cursor-pointer ${this.activeStudyMode === m.id ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-500 text-blue-900 font-semibold' : 'bg-white/80 border-slate-200/80 hover:bg-white text-slate-600 font-medium'}">
                  <div class="flex items-center gap-1.5">
                    ${getIcon(m.icon, `w-3.5 h-3.5 ${this.activeStudyMode === m.id ? 'text-blue-600' : 'text-slate-400'}`)}
                    <span class="truncate">${m.name}</span>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Conversation History List -->
          <div class="flex-1 overflow-y-auto p-3 space-y-1" id="ai-history-list">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">Past Discussions</span>
            <div id="ai-conversations-container">
              ${renderLoadingState('Loading history...')}
            </div>
          </div>

          <!-- Footer: AI Engine Status & Settings link -->
          <div class="p-3.5 border-t border-slate-100 bg-white shrink-0" id="ai-engine-status-box">
            <div class="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div class="flex items-center gap-2 min-w-0 pr-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0 status-pulse"></span>
                <div class="min-w-0">
                  <span class="text-[11px] font-semibold text-slate-800 block truncate" id="ai-status-label">Checking AI Engine...</span>
                  <span class="text-[10px] text-slate-400 block truncate" id="ai-status-sub">Grounded Local Slide Index</span>
                </div>
              </div>
              <button onclick="window.router.navigate('settings')" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer" title="AI Settings">
                ${getIcon('settings', 'w-3.5 h-3.5')}
              </button>
            </div>
          </div>
        </aside>

        <!-- Right Workspace: Chat Stream & Interactive Prompt Area -->
        <main class="flex-1 flex flex-col h-full bg-white overflow-hidden min-w-0">
          <!-- Top Chat Header Bar -->
          <div class="h-14 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 shadow-2xs">
            <div class="flex items-center gap-2.5 min-w-0 pr-4">
              <span id="ai-header-mode-badge" class="px-2.5 py-1 rounded-full text-xs font-semibold border ${this.studyModes.find(m => m.id === this.activeStudyMode)?.badge || 'bg-blue-50 text-blue-700 border-blue-200'}">
                ${this.studyModes.find(m => m.id === this.activeStudyMode)?.name || 'Learn Mode'}
              </span>
              <span class="text-xs text-slate-300">•</span>
              <span class="text-xs font-medium text-slate-600 truncate" id="ai-header-scope-label">
                All Course Materials
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="window.appModals.openExplainConcept('', AiAssistantView.selectedCourseId, AiAssistantView.selectedResourceId)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/60 rounded-xl transition-all shadow-2xs cursor-pointer" title="Generate 5-part MBA concept breakdown">
                ${getIcon('brain', 'w-3.5 h-3.5')}
                <span class="hidden sm:inline">Explain Concept</span>
              </button>
              <button id="ai-clear-chat-btn" class="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" title="Clear current messages">
                ${getIcon('trash', 'w-4 h-4')}
              </button>
            </div>
          </div>

          <!-- Messages Stream Container -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5" id="ai-messages-container">
            <!-- Dynamic messages will be rendered here -->
          </div>

          <!-- Prompt Input Dock -->
          <div class="p-4 sm:p-5 border-t border-slate-100 bg-white/95 backdrop-blur-md shrink-0 space-y-3">
            <!-- Quick Follow-up Pills -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-slate-600 no-scrollbar">
              <span class="text-[10px] uppercase font-bold text-slate-400 shrink-0">Quick Ask:</span>
              <button class="ai-quick-pill px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors cursor-pointer" data-prompt="Give me a real business example and case study of this concept.">
                Real Business Example
              </button>
              <button class="ai-quick-pill px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors cursor-pointer" data-prompt="How would an MBA professor ask this in an exam question? Frame the ideal response.">
                Exam Framing &amp; Keywords
              </button>
              <button class="ai-quick-pill px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors cursor-pointer" data-prompt="What are the essential formulas, metrics, and definitions for this topic?">
                Formulas &amp; Definitions
              </button>
              <button class="ai-quick-pill px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors cursor-pointer" data-prompt="Summarize the core takeaways in 3 crisp bullet points.">
                3-Bullet Summary
              </button>
            </div>

            <!-- Input Form Box -->
            <form id="ai-chat-form" class="relative flex items-end gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 focus-within:bg-white transition-all shadow-2xs">
              <textarea id="ai-chat-input" rows="2" placeholder="Ask a question about your uploaded PPTs or PDFs... (Press Enter to send, Shift+Enter for new line)"
                class="flex-1 bg-transparent border-0 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none px-2 py-1 max-h-36 leading-relaxed"></textarea>
              <button type="submit" id="ai-send-btn" class="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer">
                ${getIcon('send', 'w-4 h-4')}
              </button>
            </form>

            <div class="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Answers prioritize uploaded classroom PPTs and PDFs with slide citations.</span>
              <span class="font-mono text-[10px]">Markdown Supported</span>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  async bindEvents(params = {}) {
    // 1. Load Courses & Resources for dropdowns
    await this.loadCoursesAndResources();

    // 2. Load Status & Conversations
    await this.loadAiEngineStatus();
    await this.loadConversations();

    // 3. Handle initial prompt if passed
    if (params.initial_prompt) {
      document.getElementById('ai-chat-input').value = params.initial_prompt;
      setTimeout(() => this.sendMessage(params.initial_prompt), 200);
    } else if (this.currentConversationId) {
      await this.loadConversationMessages(this.currentConversationId);
    } else {
      this.renderWelcomeScreen();
    }

    // 4. Bind Dropdowns
    const courseSelect = document.getElementById('ai-scope-course');
    courseSelect.onchange = (e) => {
      this.selectedCourseId = e.target.value;
      this.updateResourceDropdown();
      this.updateHeaderScopeLabel();
    };

    const resSelect = document.getElementById('ai-scope-resource');
    resSelect.onchange = (e) => {
      this.selectedResourceId = e.target.value;
      this.updateHeaderScopeLabel();
    };

    // 5. Bind Study Mode Buttons
    document.querySelectorAll('.ai-mode-btn').forEach(btn => {
      btn.onclick = () => {
        const mode = btn.getAttribute('data-mode');
        this.setStudyMode(mode);
      };
    });

    // 6. Bind New Chat Button
    document.getElementById('ai-new-chat-btn').onclick = () => {
      this.currentConversationId = null;
      this.messages = [];
      this.renderWelcomeScreen();
      showToast('Started new study conversation.', 'info');
    };

    // 7. Bind Clear Chat
    document.getElementById('ai-clear-chat-btn').onclick = () => {
      this.messages = [];
      this.renderWelcomeScreen();
    };

    // 8. Bind Chat Form Submit & Keydown
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');

    form.onsubmit = (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text && !this.isGenerating) {
        this.sendMessage(text);
        input.value = '';
      }
    };

    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    };

    // 9. Bind Quick Ask Pills
    document.querySelectorAll('.ai-quick-pill').forEach(pill => {
      pill.onclick = () => {
        const prompt = pill.getAttribute('data-prompt');
        input.value = prompt;
        input.focus();
      };
    });
  },

  async loadCoursesAndResources() {
    try {
      const [courses, resources] = await Promise.all([
        API.courses.list(),
        API.resources.list(),
      ]);

      this.courses = courses || [];
      this.resources = resources || [];

      // Populate Courses
      const courseSelect = document.getElementById('ai-scope-course');
      if (courseSelect) {
        courseSelect.innerHTML = '<option value="">All Subjects &amp; Courses</option>' +
          this.courses.map(c => `
            <option value="${c.id}" ${String(this.selectedCourseId) === String(c.id) ? 'selected' : ''}>
              ${escapeHtml(c.name)}
            </option>
          `).join('');
      }

      this.updateResourceDropdown();
      this.updateHeaderScopeLabel();
    } catch (err) {
      console.error('Failed to load courses for AI:', err);
    }
  },

  updateResourceDropdown() {
    const resSelect = document.getElementById('ai-scope-resource');
    if (!resSelect) return;

    let filtered = this.resources;
    if (this.selectedCourseId) {
      filtered = filtered.filter(r => String(r.course_id) === String(this.selectedCourseId));
    }

    resSelect.innerHTML = '<option value="">All Course Materials</option>' +
      filtered.map(r => `
        <option value="${r.id}" ${String(this.selectedResourceId) === String(r.id) ? 'selected' : ''}>
          [${r.resource_type}] ${escapeHtml(r.title)}
        </option>
      `).join('');
  },

  updateHeaderScopeLabel() {
    const label = document.getElementById('ai-header-scope-label');
    if (!label) return;

    let text = 'All Course Materials';
    if (this.selectedResourceId) {
      const res = this.resources.find(r => String(r.id) === String(this.selectedResourceId));
      if (res) text = `${res.title} (${res.resource_type})`;
    } else if (this.selectedCourseId) {
      const c = this.courses.find(item => String(item.id) === String(this.selectedCourseId));
      if (c) text = `Subject: ${c.name}`;
    }
    label.textContent = text;
  },

  setStudyMode(modeId) {
    this.activeStudyMode = modeId;
    const modeObj = this.studyModes.find(m => m.id === modeId) || this.studyModes[0];

    // Update buttons
    document.querySelectorAll('.ai-mode-btn').forEach(btn => {
      const m = btn.getAttribute('data-mode');
      if (m === modeId) {
        btn.className = 'ai-mode-btn text-left p-2 rounded-xl border text-xs transition-all bg-white border-blue-500 shadow-xs ring-1 ring-blue-500 text-blue-900 font-semibold';
      } else {
        btn.className = 'ai-mode-btn text-left p-2 rounded-xl border text-xs transition-all bg-white/70 border-slate-200 hover:bg-white text-slate-600 font-medium';
      }
    });

    // Update Header Badge
    const headerBadge = document.getElementById('ai-header-mode-badge');
    if (headerBadge) {
      headerBadge.className = `px-2.5 py-1 rounded-full text-xs font-semibold border ${modeObj.badge}`;
      headerBadge.textContent = modeObj.name;
    }

    showToast(`Switched to ${modeObj.name}: ${modeObj.description}`, 'info');
  },

  async loadAiEngineStatus() {
    try {
      const status = await API.ai.getStatus();
      const label = document.getElementById('ai-status-label');
      const sub = document.getElementById('ai-status-sub');

      if (label && sub) {
        if (status.openai_configured) {
          label.textContent = `OpenAI GPT-4o-mini Connected`;
          sub.textContent = `${status.indexed_chunks_count} slide/PDF chunks indexed`;
        } else {
          label.textContent = `Local Grounded Synthesis`;
          sub.textContent = `${status.indexed_chunks_count} slide chunks ready (offline)`;
        }
      }
    } catch (e) {
      console.warn('AI status check failed', e);
    }
  },

  async loadConversations() {
    const container = document.getElementById('ai-conversations-container');
    if (!container) return;

    try {
      const list = await API.ai.listConversations();
      this.conversations = list || [];

      if (this.conversations.length === 0) {
        container.innerHTML = `
          <div class="px-2 py-4 text-center text-slate-400 text-xs">
            No previous chats yet. Ask a question to start.
          </div>
        `;
        return;
      }

      container.innerHTML = this.conversations.map(conv => `
        <div class="group flex items-center justify-between p-2 rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer ${this.currentConversationId === conv.id ? 'bg-blue-50/80 font-bold text-blue-900' : 'text-slate-700'}"
          onclick="AiAssistantView.selectConversation(${conv.id})">
          <div class="flex items-center gap-2 min-w-0 pr-2">
            ${getIcon('message-square', 'w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0')}
            <span class="truncate block">${escapeHtml(conv.title)}</span>
          </div>
          <button class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all shrink-0" title="Delete chat"
            onclick="event.stopPropagation(); AiAssistantView.deleteConversation(${conv.id})">
            ${getIcon('trash', 'w-3 h-3')}
          </button>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<div class="text-[11px] text-rose-500 p-2">Error: ${escapeHtml(err.message)}</div>`;
    }
  },

  async selectConversation(id) {
    this.currentConversationId = id;
    await this.loadConversations();
    await this.loadConversationMessages(id);
  },

  async deleteConversation(id) {
    try {
      await API.ai.deleteConversation(id);
      if (this.currentConversationId === id) {
        this.currentConversationId = null;
        this.messages = [];
        this.renderWelcomeScreen();
      }
      await this.loadConversations();
      showToast('Conversation deleted.', 'info');
    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  async loadConversationMessages(id) {
    const container = document.getElementById('ai-messages-container');
    container.innerHTML = renderLoadingState('Loading conversation transcript...');

    try {
      const conv = await API.ai.getConversation(id);
      this.messages = conv.messages || [];
      if (conv.course_id) this.selectedCourseId = String(conv.course_id);
      if (conv.resource_id) this.selectedResourceId = String(conv.resource_id);
      if (conv.study_mode) this.setStudyMode(conv.study_mode);

      this.renderMessages();
    } catch (err) {
      container.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl">Error: ${escapeHtml(err.message)}</div>`;
    }
  },

  renderWelcomeScreen() {
    const container = document.getElementById('ai-messages-container');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-2xl mx-auto py-10 space-y-7 text-center animate-fade-in">
        <!-- Hero Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200/70 text-indigo-800 text-xs font-bold shadow-2xs">
          ${getIcon('sparkles', 'w-3.5 h-3.5 text-indigo-600')}
          <span>AI-Powered MBA Learning Companion</span>
        </div>

        <div class="space-y-2.5">
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            What would you like to master today?
          </h1>
          <p class="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed font-normal">
            Synthesize your faculty presentations (PPTX), PDF reading packets, and notes. Ask conceptual questions, generate exam scoring answers, or explore corporate strategy examples.
          </p>
        </div>

        <!-- Suggested Prompt Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
          ${this.suggestedPrompts.map(p => `
            <button type="button" class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/20 flex items-start gap-3.5 transition-all text-left cursor-pointer card-hover"
              onclick="AiAssistantView.useSuggestedPrompt('${escapeHtml(p.text)}', '${p.mode}')">
              <div class="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shrink-0 flex items-center justify-center">
                ${getIcon('sparkles', 'w-4 h-4')}
              </div>
              <div class="min-w-0">
                <span class="text-xs font-bold text-slate-800 block leading-snug">${escapeHtml(p.text)}</span>
                <span class="text-[10px] text-indigo-600 uppercase tracking-wider font-extrabold mt-1 block">${p.mode.replace('_', ' ')}</span>
              </div>
            </button>
          `).join('')}
        </div>

        <div class="pt-5 border-t border-slate-100 flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
          <span class="inline-flex items-center gap-1.5">
            ${getIcon('check-circle', 'w-3.5 h-3.5 text-emerald-600')}
            Slide Citations
          </span>
          <span class="inline-flex items-center gap-1.5">
            ${getIcon('check-circle', 'w-3.5 h-3.5 text-emerald-600')}
            5 Study Modes
          </span>
          <span class="inline-flex items-center gap-1.5">
            ${getIcon('check-circle', 'w-3.5 h-3.5 text-emerald-600')}
            1-Click Note Saving
          </span>
        </div>
      </div>
    `;
  },

  useSuggestedPrompt(promptText, mode) {
    if (mode) this.setStudyMode(mode);
    const input = document.getElementById('ai-chat-input');
    if (input) {
      input.value = promptText;
      this.sendMessage(promptText);
    }
  },

  renderMessages() {
    const container = document.getElementById('ai-messages-container');
    if (!container) return;

    if (this.messages.length === 0) {
      this.renderWelcomeScreen();
      return;
    }

    container.innerHTML = this.messages.map((msg, idx) => {
      const isUser = msg.role === 'user';
      let citationsList = [];
      if (msg.citations_json) {
        try { citationsList = JSON.parse(msg.citations_json); } catch (e) {}
      }

      return `
        <div class="flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in">
          ${!isUser ? `
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              ${getIcon('bot', 'w-4 h-4')}
            </div>
          ` : ''}

          <div class="max-w-2xl ${isUser ? 'ai-user-bubble px-4 py-3' : 'ai-assistant-bubble p-5 space-y-3'}">
            ${isUser ? `
              <p class="text-xs text-white leading-relaxed whitespace-pre-wrap">${escapeHtml(msg.content)}</p>
            ` : `
              <!-- Assistant Message Body -->
              <div class="ai-rendered-content text-xs text-slate-800 leading-relaxed">
                ${formatAiMarkdown(msg.content)}
              </div>

              <!-- Citations Bar (if any) -->
              ${citationsList && citationsList.length > 0 ? `
                <div class="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Citations:</span>
                  ${citationsList.map(c => `
                    <span class="citation-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      ${getIcon('file-text', 'w-3 h-3 text-indigo-500')}
                      ${escapeHtml(c)}
                    </span>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Bottom Actions Bar -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div class="flex items-center gap-2">
                  <button class="inline-flex items-center gap-1 hover:text-blue-600 transition-colors font-medium" onclick="AiAssistantView.saveMessageAsNote(${idx})">
                    ${getIcon('file-text', 'w-3 h-3')}
                    <span>Save to Notes</span>
                  </button>
                  <span>•</span>
                  <button class="inline-flex items-center gap-1 hover:text-blue-600 transition-colors font-medium" onclick="copyToClipboard(AiAssistantView.messages[${idx}].content)">
                    ${getIcon('copy', 'w-3 h-3')}
                    <span>Copy</span>
                  </button>
                </div>
                <span class="text-[10px] text-slate-300 font-mono">${formatDateTime(msg.created_at)}</span>
              </div>
            `}
          </div>

          ${isUser ? `
            <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              ${window.currentUser?.full_name ? window.currentUser.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  },

  async sendMessage(promptText) {
    if (!promptText || this.isGenerating) return;

    this.isGenerating = true;
    const sendBtn = document.getElementById('ai-send-btn');
    if (sendBtn) sendBtn.disabled = true;

    // Append temporary user message
    this.messages.push({
      role: 'user',
      content: promptText,
      created_at: new Date().toISOString(),
    });
    this.renderMessages();

    // Append loading skeleton
    const container = document.getElementById('ai-messages-container');
    const loadingId = 'ai-loading-placeholder';
    const placeholder = document.createElement('div');
    placeholder.id = loadingId;
    placeholder.className = 'flex gap-3 justify-start animate-fade-in';
    placeholder.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
        ${getIcon('bot', 'w-4 h-4')}
      </div>
      <div class="ai-assistant-bubble p-4 space-y-2 w-72 sm:w-96">
        <div class="flex items-center gap-2 text-xs font-semibold text-indigo-700">
          <div class="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Synthesizing answer from course slides...</span>
        </div>
        <div class="h-2.5 bg-slate-100 rounded-full w-full ai-shimmer"></div>
        <div class="h-2.5 bg-slate-100 rounded-full w-4/5 ai-shimmer"></div>
        <div class="h-2.5 bg-slate-100 rounded-full w-2/3 ai-shimmer"></div>
      </div>
    `;
    container.appendChild(placeholder);
    container.scrollTop = container.scrollHeight;

    try {
      const response = await API.ai.chat({
        message: promptText,
        course_id: this.selectedCourseId ? parseInt(this.selectedCourseId) : null,
        resource_id: this.selectedResourceId ? parseInt(this.selectedResourceId) : null,
        study_mode: this.activeStudyMode,
        conversation_id: this.currentConversationId,
      });

      this.currentConversationId = response.conversation_id;

      // Replace loading skeleton with assistant message
      const citationsJson = JSON.stringify(response.citations || []);
      this.messages.push({
        role: 'assistant',
        content: response.reply,
        citations_json: citationsJson,
        created_at: new Date().toISOString(),
      });

      await this.loadConversations();
    } catch (err) {
      showToast(`AI Assistant: ${err.message}`, 'error');
      this.messages.push({
        role: 'assistant',
        content: `**Error:** Failed to generate response: ${err.message}`,
        created_at: new Date().toISOString(),
      });
    } finally {
      const el = document.getElementById(loadingId);
      if (el) el.remove();
      this.isGenerating = false;
      if (sendBtn) sendBtn.disabled = false;
      this.renderMessages();
    }
  },

  async saveMessageAsNote(msgIndex) {
    const msg = this.messages[msgIndex];
    if (!msg) return;

    try {
      const firstLine = msg.content.split('\n')[0].replace(/[#*`]/g, '').trim().slice(0, 50) || 'AI Study Note';
      await API.notes.create({
        title: `${firstLine} (AI Note)`,
        content: msg.content,
        course_id: this.selectedCourseId ? parseInt(this.selectedCourseId) : null,
        resource_id: this.selectedResourceId ? parseInt(this.selectedResourceId) : null,
        tags: 'AI Assistant, Revision',
      });
      showToast('Study note successfully saved to your Notes repository!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  },
};
