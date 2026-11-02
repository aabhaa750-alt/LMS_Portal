// Main Dashboard View with Dynamic Greeting, Daily Study Plan, Continue Learning & Real-World MBA Insights
const MBA_INSIGHTS = [
  {
    subject: 'Product Management & Tech Strategy',
    subjectColor: '#2563eb',
    concept: 'API-as-a-Product & Developer Moats',
    company: 'Stripe',
    industry: 'FinTech / Payments Infrastructure',
    explanation: 'Rather than selling monolithic banking software, Stripe abstracted credit card processing into 7 lines of code. By treating developers as the core customer persona and providing instantaneous sandbox onboarding, Stripe generated high switching costs and network effects, scaling to over $1 Trillion in payment volume.',
    aiPrompt: 'Explain Stripe\'s "API-as-a-Product" business model and developer switching costs from an MBA Product Management perspective. Include key metrics like Net Revenue Retention and Developer LTV.'
  },
  {
    subject: 'Operations & Supply Chain',
    subjectColor: '#059669',
    concept: 'Agile Supply Chains & Just-In-Time Postponement',
    company: 'Zara (Inditex)',
    industry: 'Retail & Global Logistics',
    explanation: 'While traditional fashion retailers plan apparel lines 6 to 9 months in advance, Zara manufactures 50% of garments in nearby facilities with un-dyed fabrics. Real-time store feedback triggers localized design changes within 15 days, virtually eliminating excess inventory markdowns and achieving industry-leading inventory turnover.',
    aiPrompt: 'Analyze Zara\'s agile supply chain and postponement strategy in Operations Management. Compare its inventory turnover velocity and working capital cycle against traditional retail models.'
  },
  {
    subject: 'Managerial Economics & Pricing',
    subjectColor: '#d97706',
    concept: 'Second-Degree Price Discrimination & Versioning',
    company: 'Apple',
    industry: 'Consumer Technology',
    explanation: 'Apple prices base-tier iPhone storage competitively to attract volume, but charges steep price deltas for higher storage capacities (a 256GB NAND upgrade costs Apple ~$20 to produce but commands a $150–$200 retail premium). This extracts maximum consumer surplus from high-willingness-to-pay power users without alienating price-sensitive buyers.',
    aiPrompt: 'Explain second-degree price discrimination and versioning strategy using Apple\'s iPhone storage tiering from a Managerial Economics perspective. How does it optimize consumer surplus extraction?'
  },
  {
    subject: 'Strategic Management',
    subjectColor: '#7c3aed',
    concept: 'Two-Sided Platform Network Effects & Asset-Light Scaling',
    company: 'Airbnb',
    industry: 'Hospitality & Platform Economy',
    explanation: 'Unlike Marriott or Hilton which bear massive capital expenditures for hotel real estate, Airbnb operates an asset-light marketplace. Cross-side network effects create high defensibility: each new host increases geographic variety and attracts more travelers, which in turn incentivizes more property owners to list, creating self-reinforcing liquidity.',
    aiPrompt: 'Explain how two-sided network effects and asset-light platforms create sustainable competitive advantages in Strategic Management using Airbnb as a case study.'
  },
  {
    subject: 'IT & Cloud Strategy',
    subjectColor: '#0284c7',
    concept: 'Decoupled Cloud Microservices & Scalability Moats',
    company: 'Netflix',
    industry: 'Digital Streaming & Infrastructure',
    explanation: 'Following a catastrophic database corruption outage at its DVD distribution facility in 2008, Netflix migrated from monolithic Oracle databases to distributed AWS cloud microservices. This architectural decoupling enabled continuous feature deployments, fault isolation (chaos monkey engineering), and seamless auto-scaling during global viral releases.',
    aiPrompt: 'Analyze Netflix\'s migration from monolithic systems to cloud microservices from an IT Management perspective. Discuss the trade-offs between system consistency, fault tolerance, and developer velocity.'
  }
];

function getTimeBasedGreeting(fullName) {
  const firstName = (fullName || 'MBA Student').trim().split(/\s+/)[0] || 'Aabha';
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  let greeting = '';
  let subtitle = '';

  // 5:00 AM – 11:59 AM (300 to 719 minutes)
  if (minutes >= 300 && minutes < 720) {
    greeting = `Good morning, ${firstName}!`;
    subtitle = 'A fresh day to learn something new.';
  }
  // 12:00 PM – 4:59 PM (720 to 1019 minutes)
  else if (minutes >= 720 && minutes < 1020) {
    greeting = `Good afternoon, ${firstName}!`;
    subtitle = 'Keep building your understanding, one topic at a time.';
  }
  // 5:00 PM – 8:59 PM (1020 to 1259 minutes)
  else if (minutes >= 1020 && minutes < 1260) {
    greeting = `Good evening, ${firstName}!`;
    subtitle = 'A little revision today can make tomorrow easier.';
  }
  // 9:00 PM – 4:59 AM (1260 to 1439 OR 0 to 299 minutes)
  else {
    greeting = `Working late, ${firstName}?`;
    subtitle = "Let's wrap up your learning goals for today.";
  }

  return { greeting, subtitle };
}

const DashboardView = {
  currentUserFullName: '',
  insightIndex: new Date().getDate() % MBA_INSIGHTS.length,
  _visibilityListenerBound: false,

  refreshGreeting() {
    const greetingEl = document.getElementById('dash-greeting');
    const subtextEl = document.getElementById('dash-subtext');
    if (greetingEl && subtextEl && this.currentUserFullName) {
      const { greeting, subtitle } = getTimeBasedGreeting(this.currentUserFullName);
      greetingEl.textContent = greeting;
      subtextEl.textContent = subtitle;
    }
  },

  async render() {
    return `
      <div class="space-y-8 animate-fade-in pb-12">
        <!-- 1. Top Welcome Bar with Dynamic Time-Based Greeting (Bento Hero) -->
        <div class="relative overflow-hidden bento-hero p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <!-- Subtle geometric background accent -->
          <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-2xl pointer-events-none"></div>
          <div class="absolute inset-0 bg-mesh-dots opacity-40 pointer-events-none"></div>

          <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div class="space-y-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-slate-200/80 text-blue-800 text-[11px] font-bold tracking-wide uppercase shadow-2xs backdrop-blur-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500 status-pulse"></span>
                <span id="dash-academic-badge">MBA Candidate · Semester 1</span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900" id="dash-greeting">Loading greeting...</h1>
              <p class="text-sm text-slate-500 font-normal leading-relaxed max-w-xl" id="dash-subtext">Manage, revise, and track your semester coursework.</p>
            </div>

            <!-- Tactile Quick Actions Dock -->
            <div class="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-xs">
              <button id="btn-quick-upload" class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-blue-500/20 hover:shadow-md btn-press">
                ${getIcon('upload', 'w-3.5 h-3.5')}
                <span>Upload Deck</span>
              </button>
              <button id="btn-quick-course" class="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all cursor-pointer btn-press">
                ${getIcon('plus', 'w-3.5 h-3.5 text-slate-500')}
                <span>Add Course</span>
              </button>
              <button id="btn-quick-note" class="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all cursor-pointer btn-press">
                ${getIcon('file-text', 'w-3.5 h-3.5 text-slate-500')}
                <span>Create Note</span>
              </button>
              <button id="btn-quick-task" class="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all cursor-pointer btn-press">
                ${getIcon('calendar', 'w-3.5 h-3.5 text-slate-500')}
                <span>Add Deadline</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Signature AI Study Assistant Deck -->
        <div class="relative overflow-hidden rounded-3xl bento-ai-deck p-7 sm:p-9 text-white shadow-xl border border-indigo-500/20">
          <!-- Ambient lighting layers -->
          <div class="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none animate-glow"></div>
          <div class="absolute right-1/3 -bottom-24 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none"></div>
          <div class="absolute inset-0 bg-mesh-dots-dark opacity-35 pointer-events-none"></div>

          <!-- Abstract SVG Neural Constellation Graphic in background -->
          <div class="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block pointer-events-none select-none">
            <svg class="w-96 h-64 text-indigo-400" viewBox="0 0 400 250" fill="none" stroke="currentColor">
              <circle cx="200" cy="125" r="42" stroke-width="1.5" stroke-dasharray="4 4" />
              <circle cx="200" cy="125" r="8" fill="currentColor" />
              <circle cx="120" cy="60" r="5" fill="currentColor" />
              <circle cx="280" cy="60" r="5" fill="currentColor" />
              <circle cx="100" cy="190" r="5" fill="currentColor" />
              <circle cx="300" cy="190" r="5" fill="currentColor" />
              <line x1="200" y1="125" x2="120" y2="60" stroke-width="1" />
              <line x1="200" y1="125" x2="280" y2="60" stroke-width="1" />
              <line x1="200" y1="125" x2="100" y2="190" stroke-width="1" />
              <line x1="200" y1="125" x2="300" y2="190" stroke-width="1" />
              <line x1="120" y1="60" x2="280" y2="60" stroke-width="0.75" stroke-dasharray="2 2" />
              <line x1="100" y1="190" x2="300" y2="190" stroke-width="0.75" stroke-dasharray="2 2" />
            </svg>
          </div>

          <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div class="space-y-4 max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-indigo-300 text-xs font-bold tracking-wide shadow-xs backdrop-blur-md">
                <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>STUDY INTELLIGENCE · GROUNDED IN YOUR CLASS PRESENTATIONS</span>
              </div>
              
              <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Instant MBA explanations with slide citations &amp; corporate case studies
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Synthesize difficult concepts directly from your faculty presentations. Generate clear conceptual foundations, real-world brand examples, and exam scoring frameworks.
              </p>

              <!-- Prompt Launch Chips -->
              <div class="flex items-center gap-2 flex-wrap pt-1">
                <button class="dash-ai-chip px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs" data-prompt="Teach me this topic from the beginning.">
                  🎓 Teach from basics
                </button>
                <button class="dash-ai-chip px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs" data-prompt="Explain this concept with an MBA-level business example and corporate application.">
                  💼 Business example
                </button>
                <button class="dash-ai-chip px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs" data-prompt="Give me exam-oriented notes, answer structures, and keywords.">
                  📝 Exam notes
                </button>
                <button onclick="window.appModals.openExplainConcept()" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 border border-indigo-300/40 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm">
                  🧠 5-Part Concept Explainer
                </button>
              </div>
            </div>

            <!-- Right Side CTA Dock -->
            <div class="shrink-0 flex items-start lg:flex-col lg:items-end gap-3.5">
              <button onclick="window.router.navigate('ai')" class="inline-flex items-center gap-3 px-6 py-4 text-xs font-extrabold text-slate-950 bg-white hover:bg-slate-100 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer">
                <span class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  ${getIcon('bot', 'w-3.5 h-3.5')}
                </span>
                <span>Launch AI Assistant Studio</span>
                <span class="text-slate-400 font-bold">&rarr;</span>
              </button>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] text-slate-300 font-mono">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>5 MBA Study Modes Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Differentiated Metrics Ribbon (Varied Visual Weights) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Metric 1: Overall Learning Progress with Circular Donut Ring -->
          <div class="bg-gradient-to-br from-white via-blue-50/25 to-indigo-50/40 p-5 rounded-2xl border border-blue-200/70 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-blue-900">Curriculum Mastery</span>
              <div class="p-1.5 rounded-xl bg-blue-600 text-white shadow-xs">
                ${getIcon('trending-up', 'w-3.5 h-3.5')}
              </div>
            </div>
            <div class="flex items-center justify-between gap-3 mt-2">
              <div>
                <div class="text-3xl font-extrabold tracking-tight text-slate-900" id="stat-progress">0%</div>
                <p class="text-[11px] text-slate-500 font-medium mt-0.5">Overall syllabus covered</p>
              </div>
              <!-- Compact Donut Ring -->
              <div class="relative w-12 h-12 shrink-0">
                <svg class="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path class="text-blue-100" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path id="stat-donut-circle" class="text-blue-600 transition-all duration-700" stroke-dasharray="0, 100" stroke-width="3" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
              </div>
            </div>
            <div class="w-full bg-blue-100/60 rounded-full h-1.5 mt-3 overflow-hidden">
              <div id="stat-progress-bar" class="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
          </div>

          <!-- Metric 2: Topics Mastered -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs card-hover flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-500 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Topics Mastered</span>
              <div class="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                ${getIcon('check-circle', 'w-4 h-4')}
              </div>
            </div>
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-extrabold tracking-tight text-slate-900" id="stat-topics">-</span>
                <span class="text-xs text-slate-400 font-medium" id="stat-total-topics">of - total</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-2 font-medium">Curriculum unit topics cleared</p>
            </div>
          </div>

          <!-- Metric 3: Active Courses -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs card-hover flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-500 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Courses</span>
              <div class="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                ${getIcon('book-open', 'w-4 h-4')}
              </div>
            </div>
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-extrabold tracking-tight text-slate-900" id="stat-courses">-</span>
                <span class="text-xs text-slate-500 font-medium">subjects</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-2 font-medium">Semester syllabus modules</p>
            </div>
          </div>

          <!-- Metric 4: Study Library Resources -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs card-hover flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-500 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Study Materials</span>
              <div class="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                ${getIcon('folder', 'w-4 h-4')}
              </div>
            </div>
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-extrabold tracking-tight text-slate-900" id="stat-resources">-</span>
                <span class="text-xs text-slate-500 font-medium">files</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-2 font-medium">Lecture decks, PDFs, spreadsheets</p>
            </div>
          </div>
        </div>

        <!-- 4. Asymmetrical Bento Section: Study Plan & Continue Session -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <!-- Left 7 cols: Today's Study Plan -->
          <div class="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  ${getIcon('check-circle', 'w-4 h-4')}
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900 tracking-tight">Your Study Plan for Today</h2>
                  <p class="text-xs text-slate-400 font-medium">Curated daily activities from your active syllabus &amp; deadlines</p>
                </div>
              </div>
              <span id="plan-progress-pill" class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                <span id="plan-progress-count">0 / 0</span>
                <span>Completed</span>
              </span>
            </div>

            <!-- Daily Plan Items List -->
            <div id="dash-daily-plan-list" class="space-y-2.5">
              ${renderLoadingState('Generating your study plan for today...')}
            </div>
          </div>

          <!-- Right 5 cols: Continue Where You Left Off -->
          <div class="lg:col-span-5 bg-gradient-to-br from-slate-900 via-[#0d1322] to-indigo-950 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>

            <div class="relative z-10 space-y-3">
              <div class="flex items-center justify-between">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-blue-300">
                  ${getIcon('rotate-cw', 'w-3 h-3 text-blue-400')}
                  <span>Active Learning Workspace</span>
                </div>
                <span class="text-[10px] font-mono text-slate-400">Autosaved session</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-tight">Continue Where You Left Off</h3>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">Resume your study session at your exact last slide position with synchronized AI notes.</p>
              </div>
            </div>

            <div id="dash-continue-learning-container" class="relative z-10">
              ${renderLoadingState('Loading your last study position...')}
            </div>
          </div>
        </div>

        <!-- 5. Weekly Study Goal Banner -->
        <div id="weekly-goal-container" class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-1.5 max-w-xl">
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300">
              ${getIcon('target', 'w-3.5 h-3.5 text-blue-400')}
              <span id="goal-week-id">Weekly Study Goal</span>
            </div>
            <h3 class="text-lg font-bold text-white tracking-tight" id="goal-title">Stay consistent with your academic targets</h3>
            <p class="text-xs text-slate-300 leading-relaxed font-normal" id="goal-desc">Target 5 topics per week to stay ahead before midterms.</p>
          </div>
          <div class="flex items-center gap-5">
            <div class="text-right">
              <div class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" id="goal-pct">0%</div>
              <div class="text-[11px] text-blue-200 font-medium" id="goal-progress-text">0 / 5 Topics Cleared</div>
            </div>
            <button id="btn-adjust-goal" class="px-4 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm border border-white/20 transition-all cursor-pointer btn-press">
              Adjust Goal
            </button>
          </div>
        </div>

        <!-- 6. MBA in the Real World — Business Case Insight of the Day (Editorial Brief) -->
        <div class="bg-gradient-to-br from-[#070b14] via-[#0d1322] to-[#1e1b4b] text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-800 space-y-4 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center gap-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold">
                ${getIcon('sparkles', 'w-3.5 h-3.5 text-amber-400')}
                <span>MBA in the Real World · Executive Case of the Day</span>
              </div>
            </div>
            <button id="btn-next-mba-insight" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors w-fit cursor-pointer btn-press">
              ${getIcon('rotate-cw', 'w-3.5 h-3.5')}
              <span>Next Case Insight</span>
            </button>
          </div>

          <div class="space-y-2.5">
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <span id="mba-insight-subject" class="font-bold text-indigo-300">Product Management</span>
              <span class="text-slate-600">•</span>
              <span id="mba-insight-company" class="font-extrabold text-white">Stripe</span>
              <span class="text-slate-600">•</span>
              <span id="mba-insight-industry" class="text-slate-400">FinTech</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight" id="mba-insight-concept">
              API-as-a-Product &amp; Developer Moats
            </h3>
            <p class="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 font-normal font-serif-italic text-[13px]" id="mba-insight-desc">
              Loading business case application...
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div class="text-[11px] text-slate-400">
              Classroom concepts applied directly to corporate strategy and operations.
            </div>
            <button id="btn-explore-insight-ai" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer btn-press">
              ${getIcon('bot', 'w-4 h-4 text-indigo-600')}
              <span>Explore with AI Assistant</span>
              <span class="text-slate-500">&rarr;</span>
            </button>
          </div>
        </div>

        <!-- 7. Two Column Main Section: Resources, Notes & Deadlines -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left 2 Cols: Recent Resources, Notes Shelf & Bookmarks -->
          <div class="lg:col-span-2 space-y-7">
            <!-- Recently Added Resources -->
            <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 class="text-base font-bold text-slate-900 tracking-tight">Recently Added Resources</h2>
                  <p class="text-xs text-slate-400 font-medium">Latest course slides, notes, and case studies uploaded</p>
                </div>
                <button id="view-all-resources-btn" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                  View Library &rarr;
                </button>
              </div>
              <div id="dash-recent-resources" class="space-y-2">
                ${renderLoadingState('Loading resources...')}
              </div>
            </div>

            <!-- Recently Created Study Notes Shelf -->
            <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 class="text-base font-bold text-slate-900 tracking-tight">Recent Study Notes</h2>
                  <p class="text-xs text-slate-400 font-medium">Synthesized notes, formulas, and revision takeaways</p>
                </div>
                <button id="view-all-notes-btn" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                  All Notes &rarr;
                </button>
              </div>
              <div id="dash-recent-notes" class="space-y-2">
                ${renderLoadingState('Loading notes...')}
              </div>
            </div>

            <!-- Bookmarked Resources Quick Shelf -->
            <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 class="text-base font-bold text-slate-900 tracking-tight">Bookmarked Quick Access</h2>
                  <p class="text-xs text-slate-400 font-medium">Pinned materials for rapid exam revision</p>
                </div>
                <button id="view-all-bookmarks-btn" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                  All Bookmarks &rarr;
                </button>
              </div>
              <div id="dash-bookmarked" class="space-y-2">
                ${renderLoadingState('Loading bookmarks...')}
              </div>
            </div>
          </div>

          <!-- Right 1 Col: Upcoming Deadlines & Tasks -->
          <div class="space-y-6">
            <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 class="text-base font-bold text-slate-900 tracking-tight">Upcoming Deadlines</h2>
                  <p class="text-xs text-slate-400 font-medium">Assignments, exams, and projects</p>
                </div>
                <button id="view-all-tasks-btn" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                  All Tasks &rarr;
                </button>
              </div>
              <div id="dash-tasks-list" class="space-y-2.5">
                ${renderLoadingState('Loading upcoming deadlines...')}
              </div>
            </div>

            <!-- Quick Academic Tips Card -->
            <div class="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white border border-indigo-100 rounded-3xl p-6 space-y-2.5 shadow-2xs">
              <div class="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                ${getIcon('sparkles', 'w-4 h-4 text-indigo-600')}
                <span>MBA Study Strategy</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed font-normal">
                Connect your personal notes directly to case study PDFs. While reviewing in the Study Workspace, write your SWOT or framework notes side-by-side with synchronized AI citations.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    // Quick action buttons
    document.getElementById('btn-quick-course').onclick = () => window.appModals.openAddCourse();
    document.getElementById('btn-quick-upload').onclick = () => window.appModals.openUploadResource();
    document.getElementById('btn-quick-note').onclick = () => window.appModals.openCreateNote();
    document.getElementById('btn-quick-task').onclick = () => window.appModals.openCreateTask();
    document.getElementById('btn-adjust-goal').onclick = () => window.appModals.openStudyGoalModal();

    document.getElementById('view-all-resources-btn').onclick = () => window.router.navigate('library');
    document.getElementById('view-all-bookmarks-btn').onclick = () => window.router.navigate('bookmarks');
    document.getElementById('view-all-tasks-btn').onclick = () => window.router.navigate('tasks');

    const viewNotesBtn = document.getElementById('view-all-notes-btn');
    if (viewNotesBtn) viewNotesBtn.onclick = () => window.router.navigate('notes');

    // Prompt launch chips on AI banner
    document.querySelectorAll('.dash-ai-chip').forEach(chip => {
      chip.onclick = () => {
        const prompt = chip.getAttribute('data-prompt');
        window.router.navigate('ai', { initial_prompt: prompt });
      };
    });

    // MBA in the Real World Case shuffle & Explore buttons
    const nextCaseBtn = document.getElementById('btn-next-mba-insight');
    if (nextCaseBtn) {
      nextCaseBtn.onclick = () => {
        this.insightIndex = (this.insightIndex + 1) % MBA_INSIGHTS.length;
        this.renderMbaInsight();
      };
    }

    const exploreAiBtn = document.getElementById('btn-explore-insight-ai');
    if (exploreAiBtn) {
      exploreAiBtn.onclick = () => {
        const current = MBA_INSIGHTS[this.insightIndex];
        window.router.navigate('ai', { initial_prompt: current.aiPrompt });
      };
    }

    // Register visibilitychange and focus listener to update dynamic greeting across time boundaries
    if (!this._visibilityListenerBound) {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          const hash = window.location.hash.replace('#', '');
          if (hash === '' || hash === 'dashboard') {
            this.refreshGreeting();
          }
        }
      });
      window.addEventListener('focus', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash === '' || hash === 'dashboard') {
          this.refreshGreeting();
        }
      });
      this._visibilityListenerBound = true;
    }

    // Initial render of MBA insight
    this.renderMbaInsight();

    // Load data
    await Promise.all([
      this.loadDashboardData(),
      this.loadDailyPlan(),
    ]);
  },

  renderMbaInsight() {
    const item = MBA_INSIGHTS[this.insightIndex];
    if (!item) return;

    const subjEl = document.getElementById('mba-insight-subject');
    const compEl = document.getElementById('mba-insight-company');
    const indEl = document.getElementById('mba-insight-industry');
    const conceptEl = document.getElementById('mba-insight-concept');
    const descEl = document.getElementById('mba-insight-desc');

    if (subjEl) subjEl.textContent = item.subject;
    if (compEl) compEl.textContent = item.company;
    if (indEl) indEl.textContent = item.industry;
    if (conceptEl) conceptEl.textContent = item.concept;
    if (descEl) descEl.textContent = item.explanation;
  },

  async loadDailyPlan() {
    const container = document.getElementById('dash-daily-plan-list');
    const pillCount = document.getElementById('plan-progress-count');
    const pillEl = document.getElementById('plan-progress-pill');

    if (!container) return;

    try {
      const plan = await API.dashboard.getDailyPlan();
      const items = plan.items || [];

      if (pillCount) {
        pillCount.textContent = `${plan.completed_items} / ${plan.total_items}`;
      }
      if (pillEl) {
        if (plan.total_items > 0 && plan.completed_items === plan.total_items) {
          pillEl.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
        } else {
          pillEl.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60';
        }
      }

      if (items.length === 0) {
        container.innerHTML = `
          <div class="py-6 px-4 text-center rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <p class="text-xs font-semibold text-slate-700">No active study plan items for today</p>
            <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
              Add semester courses, upload lecture presentations, or add upcoming deadlines to automatically generate your personalized daily plan.
            </p>
            <div class="pt-2 flex justify-center gap-2">
              <button onclick="window.appModals.openAddCourse()" class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100">
                + Add Course
              </button>
              <button onclick="window.appModals.openUploadResource()" class="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700">
                Upload Deck
              </button>
            </div>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map(item => {
        const isDone = item.is_completed;
        const color = item.subject_color || '#2563eb';

        return `
          <div class="flex items-center justify-between p-3.5 rounded-xl border ${isDone ? 'border-emerald-200/70 bg-emerald-50/30' : 'border-slate-200/80 bg-white hover:bg-slate-50/70'} transition-all gap-3 card-hover" data-item-id="${item.id}">
            <!-- Left: Checkbox & Item Details -->
            <div class="flex items-center gap-3.5 min-w-0">
              <button class="dash-plan-toggle-btn shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-slate-400 bg-white'}" data-key="${item.id}" title="${isDone ? 'Mark Incomplete' : 'Mark Completed'}">
                ${isDone ? getIcon('check', 'w-3.5 h-3.5 text-white stroke-[3]') : ''}
              </button>

              <div class="min-w-0 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase" style="background-color: ${color}15; color: ${color}; border: 1px solid ${color}30;">
                    ${escapeHtml(item.subject)}
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                    ${getIcon('clock', 'w-3 h-3')}
                    <span>${escapeHtml(item.estimated_duration)}</span>
                  </span>
                </div>
                <h4 class="text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'} truncate">
                  ${escapeHtml(item.title)}
                </h4>
                <p class="text-[11px] ${isDone ? 'text-slate-400' : 'text-slate-500'} line-clamp-1">
                  ${escapeHtml(item.activity)}
                </p>
              </div>
            </div>

            <!-- Right: Action Button -->
            <div class="shrink-0 flex items-center gap-2">
              <button class="dash-plan-action-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-2xs ${isDone ? 'text-slate-500 bg-slate-100 hover:bg-slate-200' : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60'}"
                data-action="${item.action_type}"
                data-target-id="${item.target_id || ''}"
                data-concept="${escapeHtml(item.concept_name || '')}">
                <span>${escapeHtml(item.action_label)}</span>
                &rarr;
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Bind interactive toggle checkboxes
      container.querySelectorAll('.dash-plan-toggle-btn').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const itemKey = btn.getAttribute('data-key');
          try {
            const resp = await API.dashboard.toggleDailyPlan(itemKey);
            showToast(resp.completed ? 'Task marked as completed!' : 'Task marked as incomplete', 'info');
            await this.loadDailyPlan();
          } catch (err) {
            showToast(err.message, 'error');
          }
        };
      });

      // Bind action buttons
      container.querySelectorAll('.dash-plan-action-btn').forEach(btn => {
        btn.onclick = () => {
          const action = btn.getAttribute('data-action');
          const targetId = btn.getAttribute('data-target-id');
          const concept = btn.getAttribute('data-concept');

          if (action === 'open_reader' && targetId) {
            window.readerWorkspace.open(parseInt(targetId, 10));
          } else if (action === 'open_course' && targetId) {
            window.router.navigate('courses', { course_id: targetId });
          } else if (action === 'open_tasks') {
            window.router.navigate('tasks');
          } else if (action === 'open_notes') {
            window.router.navigate('notes', targetId ? { note_id: targetId } : {});
          } else if (action === 'explain_concept') {
            window.appModals.openExplainConcept(concept);
          }
        };
      });

    } catch (err) {
      container.innerHTML = `
        <div class="py-4 text-center text-xs text-rose-500">
          Failed to load daily study plan: ${escapeHtml(err.message)}
        </div>
      `;
    }
  },

  async loadDashboardData() {
    try {
      const [data, notes] = await Promise.all([
        API.dashboard.getStats(),
        API.notes.list().catch(() => []),
      ]);

      // Save user full name and execute local device dynamic time greeting
      this.currentUserFullName = data.user_name || 'MBA Student';
      this.refreshGreeting();

      document.getElementById('dash-academic-badge').textContent = `${data.program} • ${data.academic_year}, ${data.semester}`;

      // Stats
      document.getElementById('stat-courses').textContent = data.total_courses;
      document.getElementById('stat-resources').textContent = data.total_resources;
      document.getElementById('stat-topics').textContent = data.completed_topics;
      document.getElementById('stat-total-topics').textContent = `of ${data.total_topics} topics`;
      document.getElementById('stat-progress').textContent = `${data.overall_progress_pct}%`;
      document.getElementById('stat-progress-bar').style.width = `${data.overall_progress_pct}%`;
      const donutCircle = document.getElementById('stat-donut-circle');
      if (donutCircle) {
        donutCircle.setAttribute('stroke-dasharray', `${data.overall_progress_pct}, 100`);
      }

      // Goal
      if (data.study_goal) {
        document.getElementById('goal-pct').textContent = `${data.study_goal.progress_pct}%`;
        document.getElementById('goal-progress-text').textContent = `${data.study_goal.completed_topics_this_week} / ${data.study_goal.target_topics} Topics Cleared`;
        if (data.study_goal.notes) {
          document.getElementById('goal-desc').textContent = data.study_goal.notes;
        }
      }

      // Render Continue Where You Left Off Card
      const continueContainer = document.getElementById('dash-continue-learning-container');
      if (continueContainer) {
        if (!data.continue_learning) {
          continueContainer.innerHTML = `
            <div class="py-6 px-4 text-center rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-xs">
              <div class="w-10 h-10 rounded-xl bg-white/10 text-blue-300 flex items-center justify-center mx-auto">
                ${getIcon('book-open', 'w-5 h-5')}
              </div>
              <p class="text-xs font-semibold text-white">No active learning session</p>
              <p class="text-[11px] text-slate-300 max-w-xs mx-auto">
                Open any lecture presentation, case PDF, or personal note to automatically bookmark your position and resume right where you leave off.
              </p>
              <button onclick="window.router.navigate('library')" class="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer">
                Browse Study Materials &rarr;
              </button>
            </div>
          `;
        } else {
          const item = data.continue_learning;
          const courseColor = item.course_color || '#2563eb';
          continueContainer.innerHTML = `
            <div class="p-4 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md space-y-3.5 transition-all hover:border-white/25">
              <div class="flex items-start gap-3.5 min-w-0">
                <div class="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-xs" style="background-color: ${courseColor}30; color: #ffffff; border: 1px solid ${courseColor}60;">
                  ${getIcon('file-text', 'w-5 h-5')}
                </div>
                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border" style="background-color: ${courseColor}25; color: #ffffff; border-color: ${courseColor}50;">
                      ${escapeHtml(item.course_name)}
                    </span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
                      ${getIcon('bookmark', 'w-3 h-3 text-indigo-400')}
                      <span>${escapeHtml(item.last_position || 'Slide 1')}</span>
                    </span>
                  </div>
                  <h3 class="text-xs font-bold text-white truncate hover:text-blue-300 cursor-pointer transition-colors" onclick="window.readerWorkspace.open(${item.id}, { pageNum: ${item.last_page_number || 1}, slideNum: ${item.last_slide_number || 1} })">
                    ${escapeHtml(item.title)}
                  </h3>
                  <div class="flex items-center gap-2 text-[10px] text-slate-300">
                    <span class="font-mono">${escapeHtml(item.resource_type)}</span>
                    <span>•</span>
                    <span class="text-slate-300 font-medium">${escapeHtml(item.relative_time || 'Recently accessed')}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <button onclick="window.router.navigate('ai', { resource_id: ${item.id}, course_id: ${item.course_id} })" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-indigo-200 bg-white/5 hover:bg-white/15 rounded-xl border border-white/10 transition-colors cursor-pointer" title="Ask AI About This Deck">
                  ${getIcon('sparkles', 'w-3 h-3 text-indigo-400')}
                  <span>Ask AI</span>
                </button>
                <button onclick="window.readerWorkspace.open(${item.id}, { pageNum: ${item.last_page_number || 1}, slideNum: ${item.last_slide_number || 1} })" class="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer">
                  <span>Resume Session</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          `;
        }
      }

      // Render Recently Added Resources
      const recentResContainer = document.getElementById('dash-recent-resources');
      if (!data.recent_resources || data.recent_resources.length === 0) {
        recentResContainer.innerHTML = renderEmptyState({
          icon: 'folder',
          title: 'No resources added yet',
          description: 'Upload your lecture slides, syllabus, and case studies to get started.',
          actionText: 'Upload First Resource',
          actionId: 'dash-empty-upload-btn',
        });
        const btn = document.getElementById('dash-empty-upload-btn');
        if (btn) btn.onclick = () => window.appModals.openUploadResource();
      } else {
        recentResContainer.innerHTML = data.recent_resources.map(r => this.renderResourceRow(r)).join('');
      }

      // Render Recently Created Study Notes
      const recentNotesContainer = document.getElementById('dash-recent-notes');
      if (recentNotesContainer) {
        const topNotes = (notes || []).slice(0, 3);
        if (topNotes.length === 0) {
          recentNotesContainer.innerHTML = `
            <div class="py-6 text-center text-xs text-slate-400">
              No notes created yet. Take notes in the study workspace or save AI explanations.
            </div>
          `;
        } else {
          recentNotesContainer.innerHTML = topNotes.map(n => `
            <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all card-hover cursor-pointer" onclick="window.router.navigate('notes', { note_id: ${n.id} })">
              <div class="flex items-center gap-3 min-w-0">
                <div class="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  ${getIcon('file-text', 'w-4 h-4')}
                </div>
                <div class="min-w-0">
                  <h4 class="text-xs font-semibold text-slate-900 truncate hover:text-blue-600">${escapeHtml(n.title)}</h4>
                  <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span class="font-medium text-slate-700">${escapeHtml(n.course_name || 'General')}</span>
                    <span>•</span>
                    <span>Updated ${formatDate(n.updated_at || n.created_at)}</span>
                  </div>
                </div>
              </div>
              <span class="text-xs text-blue-600 font-semibold shrink-0 ml-3">Review &rarr;</span>
            </div>
          `).join('');
        }
      }

      // Render Bookmarked Resources
      const bookmarkedContainer = document.getElementById('dash-bookmarked');
      if (!data.bookmarked_resources || data.bookmarked_resources.length === 0) {
        bookmarkedContainer.innerHTML = `
          <div class="py-6 text-center text-xs text-slate-400">
            No bookmarks saved yet. Click the bookmark icon on any document for quick access.
          </div>
        `;
      } else {
        bookmarkedContainer.innerHTML = data.bookmarked_resources.map(r => this.renderResourceRow(r)).join('');
      }

      // Render Tasks
      const tasksContainer = document.getElementById('dash-tasks-list');
      if (!data.upcoming_tasks || data.upcoming_tasks.length === 0) {
        tasksContainer.innerHTML = renderEmptyState({
          icon: 'calendar',
          title: 'No pending deadlines',
          description: 'Great job! You have cleared all assignments and exam preparations.',
          actionText: 'Add New Task',
          actionId: 'dash-empty-task-btn',
        });
        const btn = document.getElementById('dash-empty-task-btn');
        if (btn) btn.onclick = () => window.appModals.openCreateTask();
      } else {
        tasksContainer.innerHTML = data.upcoming_tasks.map(t => this.renderTaskRow(t)).join('');
      }
    } catch (err) {
      showToast('Failed to load dashboard metrics: ' + err.message, 'error');
    }
  },

  renderResourceRow(resource, showAccessTime = false) {
    return `
      <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all card-hover">
        <div class="flex items-center gap-3 min-w-0">
          <div class="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
            ${getIcon('file-text', 'w-4 h-4')}
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-semibold text-slate-900 truncate hover:text-blue-600 cursor-pointer" onclick="window.readerWorkspace.open(${resource.id}, { pageNum: ${resource.last_page_number || 1}, slideNum: ${resource.last_slide_number || 1} })">
              ${escapeHtml(resource.title)}
            </h4>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              <span class="font-medium text-slate-700">${escapeHtml(resource.course_name)}</span>
              <span>•</span>
              ${getTypeBadge(resource.resource_type)}
              <span>•</span>
              <span>${formatBytes(resource.file_size)}</span>
              ${showAccessTime && resource.last_accessed_at ? `<span>• Accessed ${formatRelative(resource.last_accessed_at)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 ml-3">
          <button class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/60" title="Ask AI About This Deck" onclick="window.router.navigate('ai', { resource_id: ${resource.id}, course_id: ${resource.course_id || ''} })">
            ${getIcon('sparkles', 'w-3 h-3 text-indigo-600')}
            <span class="hidden sm:inline">Ask AI</span>
          </button>
          <button class="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors" title="Open in Study Workspace" onclick="window.readerWorkspace.open(${resource.id}, { pageNum: ${resource.last_page_number || 1}, slideNum: ${resource.last_slide_number || 1} })">
            ${getIcon('eye', 'w-4 h-4')}
          </button>
          <a href="${API.resources.downloadUrl(resource.id)}" download class="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors" title="Download">
            ${getIcon('download', 'w-4 h-4')}
          </a>
        </div>
      </div>
    `;
  },

  renderTaskRow(task) {
    const overdueClass = task.is_overdue ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100 hover:bg-slate-50/70';
    return `
      <div class="flex items-start justify-between p-3 rounded-xl border ${overdueClass} transition-all">
        <div class="space-y-1 min-w-0 pr-2">
          <div class="flex items-center gap-2">
            ${task.is_overdue ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">OVERDUE</span>' : ''}
            <span class="text-xs font-semibold text-slate-900 truncate">${escapeHtml(task.title)}</span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-slate-500">
            <span>${escapeHtml(task.course_name || 'General')}</span>
            <span>•</span>
            <span class="${task.is_overdue ? 'text-rose-600 font-semibold' : ''}">${formatRelative(task.due_date)}</span>
          </div>
        </div>
        <div class="shrink-0 flex items-center gap-1.5">
          ${getPriorityBadge(task.priority)}
        </div>
      </div>
    `;
  },
};
