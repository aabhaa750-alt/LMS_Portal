// Personal Profile View
const ProfileView = {
  async render() {
    const currentName = (typeof getStoredStudentName === 'function' ? getStoredStudentName() : null) || (window.currentUser ? window.currentUser.full_name : '') || 'Student';
    const initial = currentName.trim().charAt(0).toUpperCase() || 'S';
    return `
      <div class="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
        <!-- Header -->
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/70 text-blue-800 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            MBA Candidate Identity
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Personal Student Profile</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">Manage your academic identity, MBA cohort, semester, and credentials</p>
        </div>

        <!-- Profile Overview Card -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6 card-hover transition-all">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 text-white flex items-center justify-center text-3xl font-extrabold shrink-0 shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50" id="profile-avatar-display">
            ${escapeHtml(initial)}
          </div>
          <div class="space-y-1">
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900" id="profile-name-display">${escapeHtml(currentName)}</h2>
            <p class="text-xs sm:text-sm font-semibold text-blue-600" id="profile-program-display">Master of Business Administration (MBA)</p>
            <p class="text-xs text-slate-500 font-medium" id="profile-meta-display">Year 1 • Semester 1 • student@mba.edu</p>
          </div>
        </div>

        <!-- Edit Profile Details Form -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7 space-y-6">
          <div class="pb-3.5 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900 tracking-tight">Academic &amp; Contact Information</h3>
            <p class="text-xs text-slate-500 mt-0.5">Update your academic track and greeting preferences</p>
          </div>

          <form id="profile-edit-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="prof-name" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input id="prof-name" type="text" required
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all">
              </div>

              <div>
                <label for="prof-email" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input id="prof-email" type="email" disabled
                  class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200/60 rounded-xl text-xs text-slate-400 cursor-not-allowed font-mono">
              </div>
            </div>

            <div>
              <label for="prof-program" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Program / Degree</label>
              <input id="prof-program" type="text"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="prof-year" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Academic Year</label>
                <input id="prof-year" type="text" placeholder="e.g. Year 1 or 2026-2027"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all">
              </div>

              <div>
                <label for="prof-semester" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Semester</label>
                <input id="prof-semester" type="text" placeholder="e.g. Semester 1"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all">
              </div>
            </div>

            <div class="flex justify-end pt-3">
              <button type="submit" id="btn-save-profile" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all hover:shadow-sm cursor-pointer">
                ${getIcon('check', 'w-3.5 h-3.5')}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Workspace Access Mode -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7 space-y-3">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-bold text-slate-900 tracking-tight">Workspace Access</h3>
              <p class="text-xs text-slate-500 mt-0.5">Direct, open personal study workspace</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Direct Access Active
            </span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed font-normal">
            Your Learning Hub operates in direct-access mode. You land directly on your MBA dashboard without requiring a username or password. All study materials, notes, deadlines, and AI features remain isolated and persistently stored.
          </p>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadUserProfile();

    // Profile form
    const profileForm = document.getElementById('profile-edit-form');
    if (profileForm) {
      profileForm.onsubmit = async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('prof-name').value.trim();
        const program = document.getElementById('prof-program').value.trim();
        const academic_year = document.getElementById('prof-year').value.trim();
        const semester = document.getElementById('prof-semester').value.trim();

        if (!full_name) {
          showToast('Please enter your full name', 'warning');
          return;
        }

        // 1. Immediately persist to localStorage
        if (typeof setStoredStudentName === 'function') {
          setStoredStudentName(full_name);
        }

        // 2. Immediately update header display and avatar
        if (typeof updateHeaderUserDisplay === 'function') {
          updateHeaderUserDisplay(full_name);
        }

        // 3. Immediately update DashboardView state and greeting
        if (window.DashboardView) {
          window.DashboardView.currentUserFullName = full_name;
          window.DashboardView.refreshGreeting();
        }

        try {
          const updated = await API.auth.updateProfile({
            full_name,
            program,
            academic_year,
            semester,
          });
          window.currentUser = { ...updated, full_name };
          showToast('Profile updated successfully!', 'success');
          await this.loadUserProfile();
        } catch (err) {
          // If offline or network glitch, preserve locally saved name
          if (window.currentUser) {
            window.currentUser.full_name = full_name;
          }
          await this.loadUserProfile();
          showToast('Saved locally: ' + err.message, 'warning');
        }
      };
    }
  },

  async loadUserProfile() {
    try {
      const user = await API.auth.getMe();
      const storedName = (typeof getStoredStudentName === 'function') ? getStoredStudentName() : null;
      const displayName = storedName || user.full_name || 'Student';

      window.currentUser = { ...user, full_name: displayName };

      // Overview header
      document.getElementById('profile-name-display').textContent = displayName;
      document.getElementById('profile-program-display').textContent = user.program;
      document.getElementById('profile-meta-display').textContent = `${user.academic_year} • ${user.semester} • ${user.email}`;
      document.getElementById('profile-avatar-display').textContent = displayName.charAt(0).toUpperCase() || 'S';

      // Form inputs
      document.getElementById('prof-name').value = displayName;
      document.getElementById('prof-email').value = user.email;
      document.getElementById('prof-program').value = user.program;
      document.getElementById('prof-year').value = user.academic_year;
      document.getElementById('prof-semester').value = user.semester;
    } catch (err) {
      showToast('Error loading profile: ' + err.message, 'error');
    }
  }
};
