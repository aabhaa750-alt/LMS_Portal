// Personal Profile View
const ProfileView = {
  async render() {
    return `
      <div class="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Personal Student Profile</h1>
          <p class="text-xs text-slate-500 mt-1">Manage your academic identity, MBA cohort, semester, and credentials</p>
        </div>

        <!-- Profile Overview Card -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-6">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md shadow-blue-500/20" id="profile-avatar-display">
            A
          </div>
          <div class="space-y-1">
            <h2 class="text-xl font-bold text-slate-900" id="profile-name-display">Alex Morgan</h2>
            <p class="text-xs font-semibold text-blue-600" id="profile-program-display">Master of Business Administration (MBA)</p>
            <p class="text-xs text-slate-500" id="profile-meta-display">Year 1 • Semester 1 • student@mba.edu</p>
          </div>
        </div>

        <!-- Edit Profile Details Form -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div class="pb-3 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">Academic &amp; Contact Information</h3>
            <p class="text-xs text-slate-500">Update your academic track and greeting preferences</p>
          </div>

          <form id="profile-edit-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="prof-name" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input id="prof-name" type="text" required
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              </div>

              <div>
                <label for="prof-email" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <input id="prof-email" type="email" disabled
                  class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed">
              </div>
            </div>

            <div>
              <label for="prof-program" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Program / Degree</label>
              <input id="prof-program" type="text"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="prof-year" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Academic Year</label>
                <input id="prof-year" type="text" placeholder="e.g. Year 1 or 2026-2027"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              </div>

              <div>
                <label for="prof-semester" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Current Semester</label>
                <input id="prof-semester" type="text" placeholder="e.g. Semester 1"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" id="btn-save-profile" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
                ${getIcon('check', 'w-3.5 h-3.5')}
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password Section -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div class="pb-3 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">Security &amp; Password</h3>
            <p class="text-xs text-slate-500">Update your login password</p>
          </div>

          <form id="profile-password-form" class="space-y-4 max-w-md">
            <div>
              <label for="pwd-current" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Current Password</label>
              <input id="pwd-current" type="password" required
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
            </div>

            <div>
              <label for="pwd-new" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">New Password</label>
              <input id="pwd-new" type="password" required minlength="6"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
            </div>

            <div class="flex justify-start pt-2">
              <button type="submit" id="btn-change-pwd" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadUserProfile();

    // Profile form
    document.getElementById('profile-edit-form').onsubmit = async (e) => {
      e.preventDefault();
      const full_name = document.getElementById('prof-name').value.trim();
      const program = document.getElementById('prof-program').value.trim();
      const academic_year = document.getElementById('prof-year').value.trim();
      const semester = document.getElementById('prof-semester').value.trim();

      try {
        const updated = await API.auth.updateProfile({
          full_name,
          program,
          academic_year,
          semester,
        });
        window.currentUser = updated;
        showToast('Profile updated successfully!', 'success');
        await this.loadUserProfile();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    // Password form
    document.getElementById('profile-password-form').onsubmit = async (e) => {
      e.preventDefault();
      const current_password = document.getElementById('pwd-current').value;
      const new_password = document.getElementById('pwd-new').value;

      try {
        await API.auth.changePassword({ current_password, new_password });
        showToast('Password changed successfully.', 'success');
        document.getElementById('profile-password-form').reset();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  },

  async loadUserProfile() {
    try {
      const user = await API.auth.getMe();
      window.currentUser = user;

      // Overview header
      document.getElementById('profile-name-display').textContent = user.full_name;
      document.getElementById('profile-program-display').textContent = user.program;
      document.getElementById('profile-meta-display').textContent = `${user.academic_year} • ${user.semester} • ${user.email}`;
      document.getElementById('profile-avatar-display').textContent = user.full_name.charAt(0).toUpperCase();

      // Form inputs
      document.getElementById('prof-name').value = user.full_name;
      document.getElementById('prof-email').value = user.email;
      document.getElementById('prof-program').value = user.program;
      document.getElementById('prof-year').value = user.academic_year;
      document.getElementById('prof-semester').value = user.semester;
    } catch (err) {
      showToast('Error loading profile: ' + err.message, 'error');
    }
  }
};
