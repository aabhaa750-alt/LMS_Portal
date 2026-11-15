// Reusable UI components and utilities for My Learning Hub LMS

// Clean SVG Icon Provider (Heroicons / Lucide style)
const ICONS = {
  'book-open': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
  'layout-dashboard': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>`,
  'folder': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`,
  'file-text': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
  'bookmark': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>`,
  'bookmark-filled': `<svg class="w-current h-current" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>`,
  'trending-up': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`,
  'check-circle': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  'calendar': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
  'user': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
  'settings': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  'search': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
  'plus': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
  'upload': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>`,
  'download': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
  'edit': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
  'trash': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
  'eye': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
  'x': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  'clock': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  'alert-triangle': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
  'log-out': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>`,
  'database': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>`,
  'sparkles': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`,
  'layers': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
  'calculator': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
  'target': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke-width="2"/></svg>`,
  'bar-chart-2': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 20V10m-6 10V4M6 20v-6"/></svg>`,
  'chevron-right': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`,
  'chevron-down': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`,
  'zoom-in': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>`,
  'zoom-out': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6"/></svg>`,
  'check': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
  'bot': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h.01M15 9h.01"/></svg>`,
  'brain': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
  'message-square': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
  'lightbulb': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
  'send': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`,
  'copy': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
  'refresh': `<svg class="w-current h-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
};

function getIcon(name, extraClasses = 'w-5 h-5') {
  const svg = ICONS[name] || ICONS['file-text'];
  return `<span class="inline-flex items-center justify-center shrink-0 ${extraClasses}">${svg}</span>`;
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    info: 'bg-slate-900 text-white',
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    warning: 'bg-amber-600 text-white',
  };

  const icons = {
    info: getIcon('sparkles', 'w-4 h-4 text-slate-300'),
    success: getIcon('check-circle', 'w-4 h-4 text-white'),
    error: getIcon('alert-triangle', 'w-4 h-4 text-white'),
    warning: getIcon('alert-triangle', 'w-4 h-4 text-white'),
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-medium text-sm transition-all transform duration-200 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="flex-1">${escapeHtml(message)}</span>
    <button class="text-white/70 hover:text-white p-0.5" onclick="this.parentElement.remove()">
      ${getIcon('x', 'w-3.5 h-3.5')}
    </button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

// Confirmation Dialog Modal
function showConfirmModal({ title, message, confirmText = 'Confirm', onConfirm, isDestructive = false }) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const btnStyle = isDestructive
    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200';

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="confirm-modal-backdrop">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 space-y-5 animate-scale-up">
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isDestructive ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}">
            ${getIcon(isDestructive ? 'alert-triangle' : 'check-circle', 'w-5 h-5')}
          </div>
          <div class="min-w-0 flex-1 pt-0.5">
            <h3 class="text-sm font-bold text-slate-900 tracking-tight">${escapeHtml(title)}</h3>
            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">${escapeHtml(message)}</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button id="confirm-cancel-btn" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200/60 cursor-pointer">
            Cancel
          </button>
          <button id="confirm-action-btn" class="px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer ${btnStyle}">
            ${escapeHtml(confirmText)}
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('confirm-cancel-btn').onclick = () => {
    modalContainer.innerHTML = '';
  };

  document.getElementById('confirm-modal-backdrop').onclick = (e) => {
    if (e.target.id === 'confirm-modal-backdrop') {
      modalContainer.innerHTML = '';
    }
  };

  document.getElementById('confirm-action-btn').onclick = async () => {
    modalContainer.innerHTML = '';
    if (onConfirm) await onConfirm();
  };
}

// Reusable Empty State Renderer
function renderEmptyState({ icon = 'folder', title, description, actionText, actionId }) {
  return `
    <div class="flex flex-col items-center justify-center py-14 px-6 text-center border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-blue-50 text-slate-400 flex items-center justify-center mb-3.5 shadow-2xs border border-slate-200/60">
        ${getIcon(icon, 'w-6 h-6 text-slate-500')}
      </div>
      <h3 class="text-sm font-bold text-slate-900 tracking-tight">${escapeHtml(title)}</h3>
      <p class="text-xs text-slate-500 max-w-sm mt-1.5 mb-5 leading-relaxed">${escapeHtml(description)}</p>
      ${actionText && actionId ? `
        <button id="${actionId}" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs btn-press">
          ${getIcon('plus', 'w-3.5 h-3.5')}
          ${escapeHtml(actionText)}
        </button>
      ` : ''}
    </div>
  `;
}

// Loading state
function renderLoadingState(text = 'Loading content...') {
  return `
    <div class="flex flex-col items-center justify-center py-14 text-slate-400 gap-3">
      <div class="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-medium text-slate-500 animate-pulse">${escapeHtml(text)}</span>
    </div>
  `;
}

// Formatters
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Due Today';
  } else if (diffDays === 1) {
    return 'Due Tomorrow';
  } else if (diffDays === -1) {
    return 'Overdue by 1 day';
  } else if (diffDays < -1) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  } else if (diffDays > 1 && diffDays <= 7) {
    return `Due in ${diffDays} days`;
  }
  return formatDate(dateStr);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTypeBadge(type) {
  const styles = {
    PDF: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Presentation: 'bg-amber-50 text-amber-800 border-amber-200/80',
    Document: 'bg-blue-50 text-blue-700 border-blue-200/80',
    Spreadsheet: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Image: 'bg-purple-50 text-purple-700 border-purple-200/80',
    Text: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };
  const cls = styles[type] || 'bg-slate-50 text-slate-700 border-slate-200/80';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${cls}">${escapeHtml(type)}</span>`;
}

function getPriorityBadge(priority) {
  const styles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Medium: 'bg-amber-50 text-amber-800 border-amber-200/80',
    Low: 'bg-slate-100 text-slate-600 border-slate-200/80',
  };
  const cls = styles[priority] || styles.Medium;
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${cls}">${escapeHtml(priority)}</span>`;
}

function getStatusBadge(status) {
  const styles = {
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200/80',
    'To Do': 'bg-slate-100 text-slate-700 border-slate-200/80',
    'Not Started': 'bg-slate-100 text-slate-600 border-slate-200/80',
  };
  const cls = styles[status] || styles['Not Started'];
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cls}">${escapeHtml(status)}</span>`;
}

// Format AI Markdown with rich typography, bullet points, code blocks, and slide citation pills
function formatAiMarkdown(rawText) {
  if (!rawText) return '';
  let text = escapeHtml(rawText);

  // Format Code Blocks ```lang ... ```
  text = text.replace(/```([\s\S]*?)```/g, (match, p1) => {
    return `<pre class="bg-slate-900 text-slate-100 rounded-xl p-3 my-2 text-xs font-mono overflow-x-auto border border-slate-800"><code>${p1.trim()}</code></pre>`;
  });

  // Format inline `code`
  text = text.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200">$1</code>');

  // Format Slide / Deck Citations like [Deck.pptx, Slide 4] or [lecture1.pdf, Page 2]
  text = text.replace(/\[([^\]]+?\.(?:pptx|ppt|pdf)[^\]]*?)\]/gi, (match, p1) => {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs">${getIcon('sparkles', 'w-3 h-3 text-indigo-500')} ${p1}</span>`;
  });

  // Headers ###, ##, #
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-slate-900 mt-3.5 mb-1.5 flex items-center gap-1.5">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-100">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-lg font-extrabold text-slate-900 mt-5 mb-2.5">$1</h1>');

  // Bold & Italic
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-700">$1</em>');

  // Blockquotes > text
  text = text.replace(/^> (.*$)/gim, '<blockquote class="border-l-3 border-blue-500 bg-blue-50/50 pl-3 py-1 my-2 text-xs text-slate-700 rounded-r-md italic">$1</blockquote>');

  // Bullet Lists
  const lines = text.split('\n');
  let inList = false;
  let inNumberedList = false;
  const processedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul class="list-disc pl-5 space-y-1 my-2 text-xs text-slate-700">');
        inList = true;
      }
      processedLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inNumberedList) {
        processedLines.push('<ol class="list-decimal pl-5 space-y-1 my-2 text-xs text-slate-700">');
        inNumberedList = true;
      }
      processedLines.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inNumberedList) {
        processedLines.push('</ol>');
        inNumberedList = false;
      }
      if (trimmed.length > 0) {
        processedLines.push(`<p class="text-xs text-slate-700 leading-relaxed my-1.5">${line}</p>`);
      } else {
        processedLines.push('<div class="h-1.5"></div>');
      }
    }
  }
  if (inList) processedLines.push('</ul>');
  if (inNumberedList) processedLines.push('</ol>');

  return processedLines.join('\n');
}

// Clipboard Helper
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  } catch (err) {
    showToast('Unable to copy to clipboard', 'error');
  }
}

// ==========================================
// User Identity & First-Time Setup Helpers
// ==========================================
const USER_NAME_STORAGE_KEY = 'mylearninghub_student_name';

function getStoredStudentName() {
  try {
    const val = localStorage.getItem(USER_NAME_STORAGE_KEY);
    return val && val.trim() ? val.trim() : null;
  } catch (e) {
    return null;
  }
}

function setStoredStudentName(name) {
  try {
    if (name && typeof name === 'string' && name.trim()) {
      localStorage.setItem(USER_NAME_STORAGE_KEY, name.trim());
    }
  } catch (e) {
    console.warn('localStorage access error:', e);
  }
}

function updateHeaderUserDisplay(fullName) {
  const name = fullName || getStoredStudentName() || (window.currentUser ? window.currentUser.full_name : '') || 'Student';
  const userGreetingEl = document.getElementById('header-user-name');
  if (userGreetingEl) {
    userGreetingEl.textContent = name;
  }
  const userAvatarEl = document.getElementById('header-avatar');
  if (userAvatarEl) {
    userAvatarEl.textContent = name.trim().charAt(0).toUpperCase() || 'S';
  }
}

const WelcomeSetup = {
  isFirstTime() {
    return !getStoredStudentName();
  },

  show() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/60 backdrop-blur-md animate-fade-in" id="welcome-modal-backdrop">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full p-7 sm:p-8 space-y-6 animate-scale-up relative overflow-hidden">
          <!-- Ambient accent line -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

          <!-- Welcome Header -->
          <div class="text-center space-y-3 pt-2">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25 ring-4 ring-blue-50">
              ${getIcon('sparkles', 'w-7 h-7 text-white')}
            </div>
            <div class="space-y-1">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Welcome to My Learning Hub
              </div>
              <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Personalize Your Hub</h2>
              <p class="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Enter your full name so your dashboard, greetings, and lecture materials are customized for you.
              </p>
            </div>
          </div>

          <!-- First-Time Setup Form (Full Name Only) -->
          <form id="welcome-setup-form" class="space-y-4">
            <div>
              <label for="welcome-full-name" class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                id="welcome-full-name"
                required
                autocomplete="name"
                autofocus
                placeholder="e.g. Rahul Sharma"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
              />
              <p class="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                ${getIcon('sparkles', 'w-3 h-3 text-indigo-500')}
                <span>No password or account registration required.</span>
              </p>
            </div>

            <button
              type="submit"
              id="welcome-submit-btn"
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer btn-press"
            >
              <span>Get Started</span>
              <span class="text-base font-normal">&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    `;

    const input = document.getElementById('welcome-full-name');
    if (input) {
      setTimeout(() => input.focus(), 80);
    }

    const form = document.getElementById('welcome-setup-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const inputEl = document.getElementById('welcome-full-name');
        const name = inputEl ? inputEl.value.trim() : '';
        if (!name) return;

        // 1. Save to browser localStorage
        setStoredStudentName(name);

        // 2. Update currentUser global object
        if (window.currentUser) {
          window.currentUser.full_name = name;
        }

        // 3. Update header display and avatar
        updateHeaderUserDisplay(name);

        // 4. Update Dashboard view dynamic greeting if active
        if (window.DashboardView) {
          window.DashboardView.currentUserFullName = name;
          window.DashboardView.refreshGreeting();
        }

        // 5. Close modal
        modalContainer.innerHTML = '';

        // 6. Asynchronously update profile on server so database is kept aligned
        if (window.API && API.auth && typeof API.auth.updateProfile === 'function') {
          API.auth.updateProfile({ full_name: name }).catch((err) => {
            console.log('Background profile sync note:', err);
          });
        }

        // 7. Show welcoming toast
        const firstName = name.split(/\s+/)[0];
        showToast(`Welcome, ${firstName}!`, 'success');

        // 8. Re-render current dashboard if on dashboard route
        const hash = window.location.hash.replace('#', '');
        if (!hash || hash === 'dashboard') {
          if (window.router && typeof window.router.renderCurrentRoute === 'function') {
            await window.router.renderCurrentRoute();
          }
        }
      };
    }
  }
};
window.WelcomeSetup = WelcomeSetup;


