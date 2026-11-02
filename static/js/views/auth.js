// Authentication Views (Login / Register)
const AuthView = {
  renderLogin() {
    return `
      <div class="min-h-screen bg-slate-50/80 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in relative overflow-hidden">
        <!-- Ambient Background Glows -->
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-400/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div class="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-50 mb-4">
            ${getIcon('book-open', 'w-7 h-7')}
          </div>
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-[10px] font-bold tracking-wider uppercase mb-2">
            MBA EDITION
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">My Learning Hub</h2>
          <p class="mt-1 text-xs sm:text-sm text-slate-500 font-normal">Personal MBA Learning Management &amp; Resource System</p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div class="bg-white/95 backdrop-blur-sm py-8 sm:py-9 px-6 sm:px-10 shadow-xl shadow-slate-900/5 border border-slate-200/80 rounded-3xl">
            <form id="login-form" class="space-y-4">
              <div>
                <label for="login-email" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input id="login-email" type="email" required autocomplete="email"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="student@mba.edu">
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="login-password" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                </div>
                <input id="login-password" type="password" required autocomplete="current-password"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="••••••••">
              </div>

              <div id="login-error" class="hidden p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs"></div>

              <button type="submit" id="login-submit-btn"
                class="w-full flex justify-center py-3 px-4 rounded-xl shadow-xs text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-md cursor-pointer">
                Sign In to Hub
              </button>
            </form>

            <div class="mt-6 pt-6 border-t border-slate-100 text-center">
              <p class="text-xs text-slate-500 font-normal">
                Don't have an account yet?
                <button id="switch-to-register-btn" class="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1 cursor-pointer">
                  Create Personal Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderRegister() {
    return `
      <div class="min-h-screen bg-slate-50/80 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in relative overflow-hidden">
        <!-- Ambient Background Glows -->
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-400/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div class="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-50 mb-4">
            ${getIcon('book-open', 'w-7 h-7')}
          </div>
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-[10px] font-bold tracking-wider uppercase mb-2">
            MBA EDITION
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Create Your Learning Hub</h2>
          <p class="mt-1 text-xs sm:text-sm text-slate-500 font-normal">Set up your personal MBA workspace</p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-white py-8 sm:py-9 px-6 sm:px-10 shadow-lg border border-slate-200/70 rounded-3xl">
            <form id="register-form" class="space-y-4">
              <div>
                <label for="reg-name" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input id="reg-name" type="text" required
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="e.g. Alex Morgan">
              </div>

              <div>
                <label for="reg-email" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input id="reg-email" type="email" required
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="student@mba.edu">
              </div>

              <div>
                <label for="reg-program" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Academic Program</label>
                <input id="reg-program" type="text" value="Master of Business Administration (MBA)"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="reg-year" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Academic Year</label>
                  <select id="reg-year" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer">
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                  </select>
                </div>
                <div>
                  <label for="reg-semester" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Semester</label>
                  <select id="reg-semester" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer">
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="reg-password" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <input id="reg-password" type="password" required minlength="6"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="At least 6 characters">
              </div>

              <div id="register-error" class="hidden p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs"></div>

              <button type="submit" id="register-submit-btn"
                class="w-full flex justify-center py-3 px-4 rounded-xl shadow-xs text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-md cursor-pointer">
                Create Account &amp; Start
              </button>
            </form>

            <div class="mt-6 pt-6 border-t border-slate-100 text-center">
              <p class="text-xs text-slate-500 font-normal">
                Already registered?
                <button id="switch-to-login-btn" class="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1 cursor-pointer">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindLoginEvents() {
    const form = document.getElementById('login-form');
    const errorBox = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-submit-btn');

    document.getElementById('switch-to-register-btn').onclick = () => {
      window.router.navigate('register');
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      errorBox.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Signing in...';

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const user = await API.auth.login({ email, password });
        window.currentUser = user;
        showToast(`Welcome back, ${user.full_name}!`, 'success');
        window.router.navigate('dashboard');
      } catch (err) {
        errorBox.textContent = err.message || 'Login failed. Please check your credentials.';
        errorBox.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Sign In to Hub';
      }
    };
  },

  bindRegisterEvents() {
    const form = document.getElementById('register-form');
    const errorBox = document.getElementById('register-error');
    const submitBtn = document.getElementById('register-submit-btn');

    document.getElementById('switch-to-login-btn').onclick = () => {
      window.router.navigate('login');
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      errorBox.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Creating account...';

      const full_name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const program = document.getElementById('reg-program').value;
      const academic_year = document.getElementById('reg-year').value;
      const semester = document.getElementById('reg-semester').value;
      const password = document.getElementById('reg-password').value;

      try {
        const user = await API.auth.register({
          full_name,
          email,
          program,
          academic_year,
          semester,
          password,
        });
        window.currentUser = user;
        showToast('Account created successfully!', 'success');
        window.router.navigate('dashboard');
      } catch (err) {
        errorBox.textContent = err.message || 'Registration failed.';
        errorBox.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Create Account & Start';
      }
    };
  },
};
