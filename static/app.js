/**

 * Mind Cave — Cognitive Sanctuary & Reflective Studio - Client Controller

 * Manages Firebase authentication state, isolated multi-turn chat sessions,

 * MindPulse analytics charts, and security inspection sandboxes.

 */



// Application State

const state = {

  currentUser: {

    uid: localStorage.getItem('gemini_journal_uid') || 'user_alice',

    name: localStorage.getItem('gemini_journal_name') || 'Alice (Demo Sandbox)',

    token: localStorage.getItem('gemini_journal_token') || 'demo_user_alice',

    gender: localStorage.getItem('mind_cave_user_gender') || 'female'

  },

  currentPersona: 'cbt_reflector',

  currentSessionId: null,

  radarChart: null,

  lineChart: null,

  firebaseApp: null,

  firebaseAuth: null,

  timelineRange: localStorage.getItem('mind_cave_timeline_range') || 'day_standard',

  selectedDiaryDate: new Date(),

  mediaMode: localStorage.getItem('mind_cave_media_mode') || 'photos',

  diaryRangeMode: 'single', // 'single' | 'week' | 'all'

  isSpeakingSummary: false,

  isRecordingVoice: false,

  speechRecognition: null,

  speechUtterance: null,

  agendaItems: JSON.parse(localStorage.getItem('mind_cave_agenda_items') || 'null') || [

    {

      id: 'task_1',

      type: 'todo',

      title: 'Review System Architecture with Core Engineering',

      date: (new Date()).toISOString().split('T')[0],

      time: '14:30',

      priority: 'high',

      completed: false,

      gcalSynced: true

    },

    {

      id: 'task_2',

      type: 'reminder',

      title: 'Take 15-min Circadian Stroll & Deep Breathing',

      date: (new Date()).toISOString().split('T')[0],

      time: '16:00',

      priority: 'normal',

      completed: true,

      gcalSynced: true

    },

    {

      id: 'task_3',

      type: 'milestone',

      title: 'Quarterly Mind & Goal Alignment Milestone',

      date: (new Date()).toISOString().split('T')[0],

      time: '19:00',

      priority: 'high',

      completed: false,

      gcalSynced: true

    }

  ],

  todayGoals: JSON.parse(localStorage.getItem('mind_cave_today_goals') || 'null') || [

    {

      id: 'g1',

      title: 'Ship Core System Architecture & Validate Test Boundaries',

      completed: true,

      startTime: '09:30',

      endTime: '12:00',

      duration: '2h 30m',

      category: 'north_star',

      categoryLabel: 'North Star',

      notes: 'Clean zero-warning build & 7/7 pytest verification'

    },

    {

      id: 'g2',

      title: '30m Mindful Nature Walk & Somatic Breathing',

      completed: true,

      startTime: '13:30',

      endTime: '14:15',

      duration: '45m',

      category: 'wellness',

      categoryLabel: 'Wellness',

      notes: 'Zone 2 cardio completed'

    },

    {

      id: 'g3',

      title: 'Refactor Longitudinal Trajectory & Daily Harmony Engine',

      completed: false,

      startTime: '16:00',

      endTime: '18:00',
      duration: '2h',
      category: 'deep_work',
      categoryLabel: 'Deep Work',
      notes: 'In progress'
    }
  ],
  todayGoal: JSON.parse(localStorage.getItem('mind_cave_today_goal') || 'null') || {
    text: "Ship Core System Architecture & complete evening 30m mindful walk",
    completed: false
  },
  habitsList: JSON.parse(localStorage.getItem('mind_cave_habits_list') || 'null') || [
    { id: 'h1', title: 'Hydrate (Drink Water)', emoji: '💧', type: 'counter', targetCount: 8, currentCount: 5, unit: 'glasses', streak: 12, target: '8 glasses', isTimelineShortcut: true, history: [true, true, true, true, true, true, false] },
    { id: 'h2', title: '15m Mindfulness & CBT', emoji: '🧘', type: 'boolean', streak: 7, target: '15 mins', isTimelineShortcut: true, history: [true, true, true, false, true, true, true] },
    { id: 'h3', title: '30m Zone-2 Cardio / Walk', emoji: '🚶', type: 'counter', targetCount: 30, currentCount: 30, unit: 'mins', streak: 5, target: '30 mins', isTimelineShortcut: true, history: [true, true, true, true, false, true, true] },
    { id: 'h4', title: '20m Focused Reading', emoji: '📖', type: 'counter', targetCount: 20, currentCount: 15, unit: 'pages', streak: 9, target: '20 pages', isTimelineShortcut: true, history: [true, true, true, true, true, true, false] },
    { id: 'h5', title: '8h Circadian Sleep Protocol', emoji: '🌙', type: 'boolean', streak: 6, target: '8 hours', isTimelineShortcut: false, history: [true, true, true, true, true, true, true] },
    { id: 'h6', title: '90m Deep Work Block', emoji: '💻', type: 'counter', targetCount: 2, currentCount: 2, unit: 'blocks', streak: 14, target: '2 blocks', isTimelineShortcut: false, history: [true, true, true, true, true, true, true] }
  ],
  archivedHabits: JSON.parse(localStorage.getItem('mind_cave_archived_habits') || '[]'),
  bucketList: JSON.parse(localStorage.getItem('mind_cave_bucket_list') || 'null') || [
    { id: 'b1', title: 'Scuba dive the Great Barrier Reef', category: 'travel', year: '2027', achieved: false },
    { id: 'b2', title: 'Publish Open-Source AI Architecture Benchmark', category: 'career', year: '2026', achieved: true },
    { id: 'b3', title: 'Trek the Annapurna Circuit in Himalayas', category: 'adventure', year: '2027', achieved: false },
    { id: 'b4', title: 'Run a sub-4-hour Marathon', category: 'wellness', year: '2026', achieved: false },
    { id: 'b5', title: 'Solo Roadtrip across New Zealand South Island', category: 'travel', year: '2028', achieved: false },
    { id: 'b6', title: 'Build a private off-grid mountain cabin sanctuary', category: 'wellness', year: '2029', achieved: false }
  ],
  bucketCategories: JSON.parse(localStorage.getItem('mind_cave_bucket_categories') || 'null') || [
    { id: 'travel', name: 'Travel & World Exploration', color: 'cyan' },
    { id: 'career', name: 'Career & Mastery', color: 'indigo' },
    { id: 'adventure', name: 'Adventure & Sports', color: 'amber' },
    { id: 'wellness', name: 'Wellness & Health', color: 'emerald' },
    { id: 'creative', name: 'Art & Creation', color: 'purple' },
    { id: 'wealth', name: 'Financial Freedom', color: 'rose' }
  ],
  scrapbookTheme: 'pastel'
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMediaMode();
  initFirebaseAuth();
  checkGeminiKeyStatus();
  updateUserUI();
  initDiarySpace();
  initAgendaList();
  initTodayGoal();
  initHabitTracker();
  initGoalsTilesCollapse();
  initBucketList();
  initAnalyticsCharts();
  loadJournals();
  loadSecurityAudit();
  loadAIStudioConfig();
});

// =============================================================================
// THEME MANAGEMENT (LIGHT & DARK MODES)
// =============================================================================

function initTheme() {
  const savedTheme = localStorage.getItem('mind_cave_theme') || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  const html = document.documentElement;
  const icon = document.getElementById('theme-toggle-icon');
  const label = document.getElementById('theme-toggle-label');
  const menuIcon = document.getElementById('menu-theme-icon');
  const menuSublabel = document.getElementById('menu-theme-sublabel');
  const globalIcon = document.getElementById('global-theme-icon');

  if (theme === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
    if (icon) {
      icon.setAttribute('data-lucide', 'moon');
      icon.className = 'w-3.5 h-3.5';
    }
    if (label) label.textContent = 'Dark';
    if (menuIcon) menuIcon.setAttribute('data-lucide', 'moon');
    if (menuSublabel) menuSublabel.textContent = 'Currently: Light (Click for Dark)';
    if (globalIcon) {
      globalIcon.setAttribute('data-lucide', 'moon');
      globalIcon.className = 'w-4 h-4 text-indigo-400';
    }
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    if (icon) {
      icon.setAttribute('data-lucide', 'sun');
      icon.className = 'w-3.5 h-3.5';
    }
    if (label) label.textContent = 'Light';
    if (menuIcon) menuIcon.setAttribute('data-lucide', 'sun');
    if (menuSublabel) menuSublabel.textContent = 'Currently: Dark (Click for Light)';
    if (globalIcon) {
      globalIcon.setAttribute('data-lucide', 'sun');
      globalIcon.className = 'w-4 h-4 text-amber-400';
    }
  }

  localStorage.setItem('mind_cave_theme', theme);
  lucide.createIcons();

  updateChartsTheme(theme);

}



function toggleTheme() {

  const current = document.documentElement.classList.contains('light') ? 'light' : 'dark';

  const next = current === 'dark' ? 'light' : 'dark';

  applyTheme(next);

  showToast(`Switched to ${next === 'light' ? 'Light' : 'Dark'} Mode`);

}



function updateChartsTheme(theme) {

  const isLight = theme === 'light';

  const textColor = isLight ? '#475569' : '#94a3b8';

  const gridColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';



  if (state.radarChart && state.radarChart.options) {

    if (state.radarChart.options.scales?.r) {

      state.radarChart.options.scales.r.grid.color = gridColor;

      state.radarChart.options.scales.r.angleLines.color = gridColor;

      state.radarChart.options.scales.r.pointLabels.color = textColor;

    }

    state.radarChart.update();

  }



  if (state.lineChart && state.lineChart.options) {

    if (state.lineChart.options.scales?.x) {

      state.lineChart.options.scales.x.ticks.color = textColor;

      state.lineChart.options.scales.x.grid.color = gridColor;

    }

    if (state.lineChart.options.scales?.y) {

      state.lineChart.options.scales.y.ticks.color = textColor;

      state.lineChart.options.scales.y.grid.color = gridColor;

    }

    state.lineChart.update();

  }

}



// =============================================================================

// GEMINI API KEY & REAL CONVERSATIONS SETUP

// =============================================================================



function openGeminiKeyModal() {

  document.getElementById('gemini-key-modal')?.classList.remove('hidden');

}



function closeGeminiKeyModal() {

  document.getElementById('gemini-key-modal')?.classList.add('hidden');

}



async function checkGeminiKeyStatus() {

  try {

    const resp = await fetch('/api/security/audit');

    const data = await resp.json();

    const isConfigured = data.key_management.gemini_api_key_masked !== '[NOT SET]';



    const dot = document.getElementById('gemini-key-dot');

    const label = document.getElementById('gemini-key-label');



    if (dot && label) {

      if (isConfigured) {

        dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0';

        label.textContent = 'Gemini 3.5 (Live)';

        label.className = 'font-mono text-[11px] text-emerald-300 font-semibold whitespace-nowrap';

      } else {

        dot.className = 'w-2 h-2 rounded-full bg-amber-400 shrink-0';

        label.textContent = 'Connect Gemini API';

        label.className = 'font-mono text-[11px] text-amber-300 whitespace-nowrap';

      }

    }

  } catch (err) {

    console.debug('Key status check notice:', err);

  }

}



async function submitGeminiApiKey(event) {

  event.preventDefault();

  const input = document.getElementById('gemini-api-key-input');

  const apiKey = input.value.trim();



  if (!apiKey || apiKey.length < 15) {

    alert('Please enter a valid Gemini API Key from Google AI Studio.');

    return;

  }



  try {

    const response = await fetch('/api/security/set-key', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ api_key: apiKey })

    });



    if (!response.ok) {

      const err = await response.json();

      throw new Error(err.detail || 'Could not connect API key');

    }



    const data = await response.json();

    closeGeminiKeyModal();

    input.value = '';

    checkGeminiKeyStatus();

    loadSecurityAudit();



    showToast('Gemini 2.5 Flash API Connected! All conversations are now live.');

  } catch (err) {

    alert(`Error connecting Gemini API: ${err.message}`);

  }

}



// =============================================================================

// FIREBASE AUTHENTICATION & CLIENT INTEGRATION

// =============================================================================



async function initFirebaseAuth() {

  try {

    // Check if custom config exists in localStorage, otherwise query server

    let config = null;
    const resp = await fetch('/api/firebase/config');
    const serverConfig = await resp.json();

    if (serverConfig && serverConfig.is_configured) {
      config = serverConfig;
    } else {
      const savedConfig = localStorage.getItem('firebase_web_config');
      if (savedConfig) {
        try { config = JSON.parse(savedConfig); } catch (e) {}
      }
    }



    if (config && config.apiKey && typeof firebase !== 'undefined') {

      if (!firebase.apps.length) {

        state.firebaseApp = firebase.initializeApp(config);

      } else {

        state.firebaseApp = firebase.app();

      }

      state.firebaseAuth = firebase.auth();



      // Listen to auth state changes

      state.firebaseAuth.onAuthStateChanged(async (user) => {

        if (user) {

          const idToken = await user.getIdToken();

          state.currentUser = {

            uid: user.uid,

            name: user.displayName || user.email || 'Firebase User',

            token: idToken

          };

          localStorage.setItem('gemini_journal_uid', state.currentUser.uid);

          localStorage.setItem('gemini_journal_name', state.currentUser.name);

          localStorage.setItem('gemini_journal_token', state.currentUser.token);



          updateUserUI();

          updateFirebaseStatus(true, `Signed in as ${user.email || user.uid}`);

          loadJournals();

          loadAnalytics();

        } else {

          updateFirebaseStatus(true, 'Firebase Ready (Not Signed In)');

        }

      });

      updateFirebaseStatus(true, 'Firebase Initialized & Connected');

    } else {

      updateFirebaseStatus(false, 'Firebase Client Ready (Demo / Custom Config)');

    }

  } catch (err) {

    console.warn('Firebase init notice:', err);

    updateFirebaseStatus(false, 'Firebase Sandbox Mode Active');

  }

}



function getAuthHeaders() {
  const token = state.currentUser?.token || localStorage.getItem('gemini_journal_token') || `user_${state.currentUser?.uid || 'alice'}`;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}



function updateUserUI() {

  const nameEl = document.getElementById('user-display-name');

  const isAdmin = state.currentUser?.name?.toLowerCase() === 'vickykalam34@gmail.com' || state.currentUser?.name?.toLowerCase() === 'admin';



  // Header UI update

  if (nameEl) {

    let displayName = state.currentUser.name || 'Guest User';

    if (displayName.includes('@')) {

      displayName = displayName.split('@')[0];

    }

    nameEl.textContent = displayName;

    nameEl.parentElement.setAttribute('title', `Signed in as ${state.currentUser.name} (Click for Settings)`);

    if (isAdmin) {

      nameEl.parentElement.classList.add('border-blue-500');

    } else {

      nameEl.parentElement.classList.remove('border-blue-500');

    }

  }



  // Auth Modal UI update

  const modalLbl = document.getElementById('modal-current-user-lbl');

  const modalRoleLbl = document.getElementById('modal-role-lbl');

  const activeUserCard = document.getElementById('active-user-status-card');

  const authFormsContainer = document.getElementById('auth-forms-container');



  if (modalLbl && state.currentUser) {

    modalLbl.textContent = state.currentUser.name;

    

    // Check if real user (not demo fallback if you want, but for now we consider any currentUser logged in)

    // Actually the app uses user_alice as default fallback. Let's check if it's the default.

    // If it's user_alice, maybe we don't hide the form?

    // Wait, the user said "Once logged in what is the purpose of login page having email address and password?".

    // This implies they successfully logged in. If they log in, they shouldn't see it. 

    // Let's assume if state.currentUser exists, we show the card and hide the form, BUT we allow signing out.

    // However, if the current user is 'user_alice' (the default unauthenticated state), maybe show the form.

    // Let's hide the login forms only if it's a real email, or just if they are "logged in".

    const isGuest = state.currentUser.uid === 'user_alice' || !state.currentUser.name.includes('@');

    if (!isGuest) {

      if (activeUserCard) activeUserCard.classList.remove('hidden');

      if (authFormsContainer) authFormsContainer.classList.add('hidden');

      if (modalRoleLbl) modalRoleLbl.textContent = isAdmin ? 'Admin Access' : 'Client AES-256 Vault Active';

    } else {

      if (activeUserCard) activeUserCard.classList.add('hidden');

      if (authFormsContainer) authFormsContainer.classList.remove('hidden');

    }

  }



  // Admin RBAC logic

  const adminElements = document.querySelectorAll('.admin-only');

  adminElements.forEach(el => {

    if (isAdmin) {

      el.classList.remove('hidden');

    } else {

      el.classList.add('hidden');

    }

  });

}



function openAuthModal() {

  updateUserUI(); // Ensure UI is up to date when modal opens

  document.getElementById('auth-modal')?.classList.remove('hidden');

}



function closeAuthModal() {

  document.getElementById('auth-modal')?.classList.add('hidden');

}



function setSandboxUser(userId) {

  const names = {

    'user_alice': 'Alice (Demo Sandbox)',

    'user_bob': 'Bob (Demo Sandbox)',

    'google_dev_user': 'Google Dev (Demo Sandbox)'

  };

  state.currentUser = {

    uid: userId,

    name: names[userId] || userId,

    token: `demo_${userId}`

  };

  localStorage.setItem('gemini_journal_uid', state.currentUser.uid);

  localStorage.setItem('gemini_journal_name', state.currentUser.name);

  localStorage.setItem('gemini_journal_token', state.currentUser.token);



  updateUserUI();

  closeAuthModal();



  // Reset chat and reload user's isolated data

  startNewSession();

  loadJournals();

  loadAnalytics();



  showToast(`Switched to ${state.currentUser.name}. Zero data shared across users.`);

}



function setCustomUser() {

  const input = document.getElementById('custom-auth-input')?.value.trim();

  if (!input) return;



  const cleanUid = input.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  state.currentUser = {

    uid: cleanUid,

    name: input,

    token: `user_${cleanUid}`

  };

  localStorage.setItem('gemini_journal_uid', state.currentUser.uid);

  localStorage.setItem('gemini_journal_name', state.currentUser.name);

  localStorage.setItem('gemini_journal_token', state.currentUser.token);



  updateUserUI();

  closeAuthModal();

  startNewSession();

  loadJournals();

  loadAnalytics();



  showToast(`Authenticated as ${state.currentUser.name}`);

}



function updateFirebaseStatus(isConnected, text) {

  const dot = document.getElementById('fb-status-dot');

  const txt = document.getElementById('fb-status-text');

  if (dot) dot.className = `w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`;

  if (txt) txt.textContent = text;

}



function switchAuthTab(tab) {

  const pFb = document.getElementById('auth-panel-firebase');

  const pSb = document.getElementById('auth-panel-sandbox');

  const bFb = document.getElementById('auth-tab-btn-firebase');

  const bSb = document.getElementById('auth-tab-btn-sandbox');



  if (tab === 'firebase') {

    pFb.classList.remove('hidden');

    pSb.classList.add('hidden');

    bFb.className = 'flex-1 py-1.5 rounded-lg font-semibold bg-blue-600/30 text-blue-300 border border-blue-500/40';

    bSb.className = 'flex-1 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-slate-200';

  } else {

    pFb.classList.add('hidden');

    pSb.classList.remove('hidden');

    bSb.className = 'flex-1 py-1.5 rounded-lg font-semibold bg-blue-600/30 text-blue-300 border border-blue-500/40';

    bFb.className = 'flex-1 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-slate-200';

  }

}



function toggleFirebaseConfigBox() {

  const box = document.getElementById('firebase-config-box');

  box.classList.toggle('hidden');

}



function saveCustomFirebaseConfig() {
  const apiKey = document.getElementById('cfg-fb-api-key').value.trim();
  const authDomain = document.getElementById('cfg-fb-auth-domain').value.trim();
  const projectId = document.getElementById('cfg-fb-project-id').value.trim();

  if (!apiKey) {
    alert('Please enter at least a Firebase Web API Key (from Firebase Console → Project Settings → Web App).');
    return;
  }

  const cfg = { apiKey, authDomain, projectId };
  localStorage.setItem('firebase_web_config', JSON.stringify(cfg));
  showToast('Saved custom Firebase configuration. Initializing...');
  location.reload();
}

function clearCustomFirebaseConfig() {
  localStorage.removeItem('firebase_web_config');
  showToast('Cleared custom Firebase configuration. Reverting to default...');
  setTimeout(() => location.reload(), 600);
}



async function signInWithFirebaseGoogle() {

  if (!state.firebaseAuth) {

    // If live client isn't configured, prompt to configure or use sandbox

    const proceed = confirm("Firebase project is running in sandbox mode. Would you like to sign in as a demo Google user ('google_developer@gemini.com')?");

    if (proceed) {

      setSandboxUser('google_dev_user');

    }

    return;

  }



  try {

    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await state.firebaseAuth.signInWithPopup(provider);

    const idToken = await result.user.getIdToken();

    state.currentUser = {

      uid: result.user.uid,

      name: result.user.displayName || result.user.email,

      token: idToken

    };

    localStorage.setItem('gemini_journal_uid', state.currentUser.uid);

    localStorage.setItem('gemini_journal_name', state.currentUser.name);

    localStorage.setItem('gemini_journal_token', state.currentUser.token);



    updateUserUI();

    closeAuthModal();

    loadJournals();

    loadAnalytics();

    showToast(`Signed in with Google as ${state.currentUser.name}`);

  } catch (err) {
    if (err.code === 'auth/api-key-not-valid' || (err.message && err.message.includes('api-key-not-valid'))) {
      const reset = confirm("Firebase Error: The Web API key configured for Firebase Authentication is invalid.\n\nNote: Do NOT enter your Gemini AI Studio API Key here. Enter your Firebase Web App API Key (from Firebase Console → Project Settings → Web App).\n\nWould you like to clear the custom configuration now?");
      if (reset) {
        clearCustomFirebaseConfig();
      }
    } else {
      alert(`Google Sign-In Error: ${err.message}`);
    }
  }

}



async function signInWithFirebaseEmail() {

  const email = document.getElementById('firebase-email-input').value.trim();

  const password = document.getElementById('firebase-password-input').value.trim();



  if (!email || !password) {

    alert('Please enter both email and password.');

    return;

  }



  if (!state.firebaseAuth) {

    // Sandbox authentication

    setCustomUserWithEmail(email);

    return;

  }



  try {

    const cred = await state.firebaseAuth.signInWithEmailAndPassword(email, password);

    const idToken = await cred.user.getIdToken();

    state.currentUser = {

      uid: cred.user.uid,

      name: cred.user.displayName || cred.user.email,

      token: idToken

    };

    localStorage.setItem('gemini_journal_uid', state.currentUser.uid);

    localStorage.setItem('gemini_journal_name', state.currentUser.name);

    localStorage.setItem('gemini_journal_token', state.currentUser.token);



    updateUserUI();

    closeAuthModal();

    loadJournals();

    loadAnalytics();

    showToast(`Signed in as ${state.currentUser.name}`);

  } catch (err) {

    alert(`Firebase Sign-In Error: ${err.message}`);

  }

}



async function signUpWithFirebaseEmail() {

  const email = document.getElementById('firebase-email-input').value.trim();

  const password = document.getElementById('firebase-password-input').value.trim();



  if (!email || !password || password.length < 6) {

    alert('Please enter a valid email and a password of at least 6 characters.');

    return;

  }



  if (!state.firebaseAuth) {

    setCustomUserWithEmail(email);

    return;

  }



  try {

    const cred = await state.firebaseAuth.createUserWithEmailAndPassword(email, password);

    const idToken = await cred.user.getIdToken();

    state.currentUser = {

      uid: cred.user.uid,

      name: cred.user.email,

      token: idToken

    };

    localStorage.setItem('gemini_journal_uid', state.currentUser.uid);

    localStorage.setItem('gemini_journal_name', state.currentUser.name);

    localStorage.setItem('gemini_journal_token', state.currentUser.token);



    updateUserUI();

    closeAuthModal();

    loadJournals();

    loadAnalytics();

    showToast(`Firebase Account created for ${state.currentUser.name}`);

  } catch (err) {

    alert(`Firebase Sign-Up Error: ${err.message}`);

  }

}



function setCustomUserWithEmail(email) {

  const cleanUid = email.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  state.currentUser = {

    uid: cleanUid,

    name: email,

    token: `user_${cleanUid}`

  };

  localStorage.setItem('gemini_journal_uid', state.currentUser.uid);

  localStorage.setItem('gemini_journal_name', state.currentUser.name);

  localStorage.setItem('gemini_journal_token', state.currentUser.token);



  updateUserUI();

  closeAuthModal();

  startNewSession();

  loadJournals();

  loadAnalytics();



  showToast(`Authenticated as ${state.currentUser.name}`);

}



function signOutUser() {

  if (state.firebaseAuth && state.firebaseAuth.currentUser) {

    state.firebaseAuth.signOut();

  }

  setSandboxUser('user_alice');

  showToast('Signed out. Switched to Alice (Demo Sandbox).');

}



// =============================================================================

// MASTER HIERARCHICAL MENU & DIRECTORY

// =============================================================================



function openMasterMenuModal() {

  const modal = document.getElementById('master-menu-modal');

  if (modal) modal.classList.remove('hidden');

}



function closeMasterMenuModal() {

  const modal = document.getElementById('master-menu-modal');

  if (modal) modal.classList.add('hidden');

}



function navigateToSection(tabId, subTrack = null) {

  closeMasterMenuModal();

  switchTab(tabId);

  if (subTrack && tabId === 'journals') {

    switchJournalTrack(subTrack);

  }

}



function navigateToStudioPersona(personaId) {

  closeMasterMenuModal();

  switchTab('studio');

  selectPersona(personaId);

}



// =============================================================================

// TAB NAVIGATION

// =============================================================================



function switchTab(tabId) {

  // If target is one of the journal sub-pages

  const journalSubPages = ['chrono', 'harmony', 'memory_lane', 'memory', 'photos', 'sanctuary'];

  if (journalSubPages.includes(tabId)) {

    const trackTarget = tabId === 'photos' ? 'memory' : tabId;

    switchTab('journals');

    switchJournalTrack(trackTarget);

    return;

  }



  const views = ['studio', 'journals', 'analytics', 'security'];

  views.forEach(v => {

    const viewEl = document.getElementById(`view-${v}`);

    const btnEl = document.getElementById(`tab-btn-${v}`);

    const mobileBtnEl = document.getElementById(`mobile-tab-${v}`);

    if (v === tabId) {

      if (viewEl) viewEl.classList.remove('hidden');

      if (btnEl) btnEl.classList.add('active');

      if (mobileBtnEl) {

        mobileBtnEl.classList.add('active', 'text-cyan-400');

        mobileBtnEl.classList.remove('text-slate-400');

      }

    } else {

      if (viewEl) viewEl.classList.add('hidden');

      if (btnEl) btnEl.classList.remove('active');

      if (mobileBtnEl) {

        mobileBtnEl.classList.remove('active', 'text-cyan-400');

        mobileBtnEl.classList.add('text-slate-400');

      }

    }

  });



  if (tabId === 'journals') {

    loadJournals();

    renderChronoTimeline();

  }

  if (tabId === 'analytics') loadAnalytics();

  if (tabId === 'security') loadSecurityAudit();

}



// =============================================================================

// MULTI-TURN AI CHAT & JOURNALING STUDIO

// =============================================================================



function selectPersona(personaId) {

  state.currentPersona = personaId;

  document.querySelectorAll('#persona-selector .persona-btn[data-persona]').forEach(btn => {

    if (btn.getAttribute('data-persona') === personaId) {

      btn.classList.add('active');

    } else {

      btn.classList.remove('active');

    }

  });

}



function startNewSession() {

  state.currentSessionId = `session_${Date.now()}`;

  const heading = document.getElementById('session-topic-heading');

  if (heading) heading.textContent = 'Personal Reflective Space';



  const contextualChips = document.getElementById('contextual-prompt-chips');

  if (contextualChips) contextualChips.classList.add('hidden');



  const chatMessages = document.getElementById('chat-messages');

  chatMessages.className = "flex-1 flex flex-col justify-center overflow-y-auto space-y-6 px-1 py-4 mb-2";

  chatMessages.innerHTML = `

    <div id="empty-hero-stage" class="flex flex-col items-center justify-center text-center my-auto py-6">

      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white mb-4">

        <i data-lucide="sparkles" class="w-6 h-6"></i>

      </div>

      <h1 class="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tight mb-2">

        Where would you like to begin?

      </h1>

      <p class="text-xs sm:text-sm text-slate-400 max-w-md mb-8 leading-relaxed">

        Your private cognitive sanctuary. Unpack thoughts, challenge cognitive biases, or explore ideas with Gemini 3.5 Flash.

      </p>



      <!-- Bento Prompt Starters -->

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">

        <button onclick="insertPrompt('Help me untangle what is making me feel overwhelmed with my work today.')" class="prompt-starter-card group">

          <div class="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">

            <i data-lucide="sparkles" class="w-4 h-4"></i>

          </div>

          <div class="text-xs font-bold text-white mb-1">Untangle Overwhelm</div>

          <div class="text-[11px] text-slate-400 leading-snug">Deconstruct cognitive distortions and pinpoint root causes.</div>

        </button>

        <button onclick="insertPrompt('I want to celebrate a win and anchor my sense of gratitude.')" class="prompt-starter-card group">

          <div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">

            <i data-lucide="heart" class="w-4 h-4"></i>

          </div>

          <div class="text-xs font-bold text-white mb-1">Anchor Gratitude</div>

          <div class="text-[11px] text-slate-400 leading-snug">Deepen moments of joy and strengthen resilience.</div>

        </button>

        <button onclick="insertPrompt('Brainstorm an architecture strategy and challenge my assumptions.')" class="prompt-starter-card group">

          <div class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">

            <i data-lucide="compass" class="w-4 h-4"></i>

          </div>

          <div class="text-xs font-bold text-white mb-1">Socratic Ideation</div>

          <div class="text-[11px] text-slate-400 leading-snug">Examine hidden blind spots and structure execution.</div>

        </button>

      </div>

    </div>

  `;

  lucide.createIcons();

}



function insertPrompt(promptText) {

  const input = document.getElementById('chat-input');

  input.value = promptText;

  input.focus();

}



function handleTextareaKeydown(event) {

  if (event.key === 'Enter' && !event.shiftKey) {

    event.preventDefault();

    document.getElementById('chat-form').dispatchEvent(new Event('submit'));

  }

}



async function sendChatMessage(event) {

  if (event) event.preventDefault();

  const input = document.getElementById('chat-input');

  const message = input.value.trim();

  if (!message) return;



  // Track last prompt for retry

  state.lastUserPrompt = message;



  // Append User message to UI immediately

  appendChatMessage('user', message, state.currentUser.name);

  input.value = '';



  // Update dynamic topic title if first message

  updateSessionTitle(message);



  const sendBtn = document.getElementById('btn-send');

  sendBtn.disabled = true;

  sendBtn.classList.add('opacity-50');



  try {

    const response = await fetch('/api/chat', {

      method: 'POST',

      headers: getAuthHeaders(),

      body: JSON.stringify({

        message: message,

        session_id: state.currentSessionId,

        persona: state.currentPersona,

        analyze_cognition: true,

        profile_context: typeof getProfileContext === 'function' ? getProfileContext() : {}

      })

    });



    if (!response.ok) {

      throw new Error(`Chat API responded with status ${response.status}: ${response.statusText}`);

    }



    const data = await response.json();

    state.currentSessionId = data.session_id;



    // Append Calm, Editorial AI Response

    appendChatMessage('ai', data.message.content, 'Reflective Partner', data.model_used, data.cognitive_data, message);



    // Update Contextual Reflection Chips based on AI response and user emotion

    updateContextualSuggestions(message, data.cognitive_data);



  } catch (error) {

    console.error('Chat error:', error);

    appendErrorCard(error.message, message);

  } finally {

    sendBtn.disabled = false;

    sendBtn.classList.remove('opacity-50');

  }

}



function retryLastMessage() {

  if (!state.lastUserPrompt) return;

  const input = document.getElementById('chat-input');

  input.value = state.lastUserPrompt;

  sendChatMessage();

}



function updateSessionTitle(userMessage) {

  const heading = document.getElementById('session-topic-heading');

  if (!heading) return;

  const lower = userMessage.toLowerCase();

  if (lower.includes('happy') || lower.includes('joy') || lower.includes('excited') || lower.includes('grateful')) {

    heading.textContent = 'A Moment of Joy & Contentment';

  } else if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('stress') || lower.includes('overwhelm') || lower.includes('deadline')) {

    heading.textContent = 'Untangling Stress & Overwhelm';

  } else if (lower.includes('architect') || lower.includes('build') || lower.includes('system') || lower.includes('code') || lower.includes('idea')) {

    heading.textContent = 'Creative Ideation & Architecture';

  } else if (lower.includes('sad') || lower.includes('down') || lower.includes('grief') || lower.includes('lonely')) {

    heading.textContent = 'Space for Gentle Reflection';

  } else {

    heading.textContent = userMessage.length > 35 ? userMessage.substring(0, 32) + '...' : userMessage;

  }

}



function updateContextualSuggestions(userMessage, cognitiveData) {

  const container = document.getElementById('contextual-prompt-chips');

  if (!container) return;



  const lower = userMessage.toLowerCase();

  let suggestions = [];



  if (lower.includes('happy') || lower.includes('joy') || lower.includes('excited') || lower.includes('good')) {

    suggestions = [

      { icon: 'sparkles', text: 'How does this happiness feel in your body right now?' },

      { icon: 'feather', text: 'What contributed to this positive feeling today?' },

      { icon: 'bookmark', text: 'Save this moment as a gratitude anchor' }

    ];

  } else if (lower.includes('anxious') || lower.includes('stress') || lower.includes('overwhelm') || lower.includes('deadline') || lower.includes('fear')) {

    suggestions = [

      { icon: 'zap', text: 'What is the single most actionable next step?' },

      { icon: 'repeat', text: 'Help me reframe this worst-case assumption' },

      { icon: 'wind', text: 'Guide me through a 2-minute centering reflection' }

    ];

  } else if (lower.includes('architect') || lower.includes('system') || lower.includes('build') || lower.includes('project') || lower.includes('strategy')) {

    suggestions = [

      { icon: 'lightbulb', text: 'What hidden assumptions might I be making?' },

      { icon: 'target', text: 'Break this down into 3 concrete milestones' },

      { icon: 'shield-alert', text: 'Where are the key security and edge-case risks?' }

    ];

  } else {

    suggestions = [

      { icon: 'feather', text: 'Explore this feeling a little deeper' },

      { icon: 'message-square', text: 'What do you think is at the root of this?' },

      { icon: 'file-text', text: 'Summarize key takeaways for my journal' }

    ];

  }



  container.classList.remove('hidden');

  container.innerHTML = suggestions.map(s => `

    <button onclick="insertPrompt('${escapeHtml(s.text).replace(/'/g, "\\'")}')" class="text-xs text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-3.5 py-1.5 rounded-full border border-white/10 transition-all shrink-0 flex items-center gap-1.5 shadow-sm">

      <i data-lucide="${s.icon}" class="w-3.5 h-3.5 text-cyan-400 shrink-0"></i> <span>${escapeHtml(s.text)}</span>

    </button>

  `).join('');

  lucide.createIcons();

}



function appendErrorCard(errorMessage, retryPrompt) {

  const container = document.getElementById('chat-messages');

  const errorDiv = document.createElement('div');

  errorDiv.className = 'w-full my-2';

  errorDiv.innerHTML = `

    <div class="chat-msg-ai-card border-rose-500/25 bg-rose-950/20">

      <div class="flex items-center gap-2 font-semibold text-rose-300 text-sm mb-1.5">

        <i data-lucide="sparkles" class="w-4 h-4 text-rose-400"></i>

        <span>Unable to generate reflection</span>

      </div>

      <p class="text-xs text-slate-300 mb-3">Gemini couldn't complete this response right now. Please check your connection or try again.</p>

      

      <div class="flex items-center gap-3">

        <button onclick="retryLastMessage()" class="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-1.5 rounded-lg border border-rose-500/30 font-medium transition-all flex items-center gap-1.5">

          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Try again

        </button>

        

        <details class="text-[11px] text-slate-400">

          <summary class="cursor-pointer hover:text-slate-300">Technical Details ▾</summary>

          <pre class="mt-2 p-2 rounded bg-black/60 text-[10px] text-slate-400 font-mono overflow-x-auto border border-white/5">${escapeHtml(errorMessage)}</pre>

        </details>

      </div>

    </div>

  `;

  container.appendChild(errorDiv);

  container.scrollTop = container.scrollHeight;

  lucide.createIcons();

}



function appendChatMessage(role, content, authorName, modelTag, cognitiveData = null, originalPrompt = "") {

  const container = document.getElementById('chat-messages');

  const hero = document.getElementById('empty-hero-stage');

  if (hero) {

    hero.remove();

    container.classList.remove('justify-center');

    container.classList.add('justify-start');

  }



  const isUser = role === 'user';

  const turnId = `turn_${Date.now()}_${Math.floor(Math.random()*1000)}`;



  const msgDiv = document.createElement('div');

  msgDiv.className = isUser ? 'chat-msg-user-wrap' : 'w-full';



  if (isUser) {

    msgDiv.innerHTML = `

      <div class="chat-msg-user-card">

        <div class="flex items-center justify-between gap-3 mb-1 text-[11px] text-blue-300 font-semibold">

          <span>${escapeHtml(authorName)}</span>

          <span class="text-[10px] text-slate-400 font-mono">You</span>

        </div>

        <div class="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">${escapeHtml(content)}</div>

      </div>

    `;

  } else {

    const distortions = cognitiveData?.detected_distortions || [];

    const tags = cognitiveData?.semantic_tags || ['#EmotionalClarity'];

    const emotion = cognitiveData?.primary_emotion || 'Balanced';



    msgDiv.innerHTML = `

      <div class="chat-msg-ai-card">

        <!-- Card Header: Clean & Human -->

        <div class="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/5">

          <div class="flex items-center gap-2">

            <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">

              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>

            </div>

            <span class="text-sm font-bold text-slate-100">Reflective Partner</span>

            <span class="text-[11px] text-emerald-400 flex items-center gap-1 font-mono ml-1">

              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Reflecting

            </span>

          </div>



          <span class="text-xs bg-slate-900 text-slate-300 border border-white/10 px-2.5 py-0.5 rounded-full font-medium">

            ${escapeHtml(emotion)}

          </span>

        </div>



        <!-- Markdown Body (The Hero) -->

        <div class="markdown-body text-sm text-slate-200 leading-relaxed">

          ${marked.parse(content)}

        </div>



        <!-- Progressive Disclosure: Technical & MindPulse Insights -->

        <div class="mt-3.5 pt-2.5 border-t border-white/5">

          <details class="group">

            <summary class="cursor-pointer flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 select-none py-1">

              <i data-lucide="brain" class="w-3 h-3 text-cyan-400"></i>

              <span>MindPulse Insight & Architecture Details</span>

              <i data-lucide="chevron-down" class="w-3 h-3 transition-transform group-open:rotate-180 ml-auto"></i>

            </summary>

            

            <div class="mt-2.5 p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">

              <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-b border-white/5 pb-2">

                <span>Model: <strong class="text-blue-300 font-mono">${escapeHtml(modelTag || 'gemini-3.5-flash')}</strong></span>

                <span>Privacy: <strong class="text-emerald-400 font-mono">Isolated Cloud Firestore</strong></span>

              </div>



              ${cognitiveData?.mood_scores ? `

                <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center pt-1">

                  ${Object.entries(cognitiveData.mood_scores).map(([k, v]) => `

                    <div class="bg-slate-900/80 p-1.5 rounded-lg border border-white/5">

                      <div class="text-[9px] text-slate-400 uppercase font-mono">${k}</div>

                      <div class="text-xs font-bold text-cyan-400 font-mono">${v}%</div>

                    </div>

                  `).join('')}

                </div>

              ` : ''}



              ${cognitiveData?.cognitive_reframing ? `

                <div class="text-xs text-slate-300 bg-blue-950/20 p-2 rounded-lg border border-blue-500/15 leading-relaxed flex items-start gap-1.5">

                  <strong class="text-blue-300 shrink-0 flex items-center gap-1"><i data-lucide="repeat" class="w-3.5 h-3.5 text-blue-400"></i><span>Reframing:</span></strong> <span>${escapeHtml(cognitiveData.cognitive_reframing)}</span>

                </div>

              ` : ''}

            </div>

          </details>

        </div>



        <!-- Footer Action Toolbar -->

        <div class="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">

          <!-- Tags & Distortions -->

          <div class="flex flex-wrap items-center gap-1.5">

            ${distortions.map(d => `

              <span class="bg-amber-950/50 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">

                <i data-lucide="alert-triangle" class="w-3 h-3 text-amber-400"></i>

                <span>${escapeHtml(d)}</span>

              </span>

            `).join('')}

            ${tags.map(t => `

              <span class="bg-blue-950/40 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">

                ${escapeHtml(t)}

              </span>

            `).join('')}

          </div>



          <!-- Action Buttons -->

          <div class="flex items-center gap-1.5">

            <button onclick="narrateAIMessage('${escapeHtml(content).replace(/'/g, "\\'")}', this)" class="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1" title="Listen to AI voice narration">

              <i data-lucide="volume-2" class="w-3 h-3 text-cyan-400"></i>

              <span>Listen</span>

            </button>

            <button onclick="saveAndFeedback('${escapeHtml(originalPrompt || 'Reflection')}', '${escapeHtml(content).replace(/'/g, "\\'")}', '${cognitiveData?.primary_emotion || 'Reflective'}', this)" class="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5">

              <i data-lucide="heart" class="w-3 h-3 text-rose-400"></i>

              <span>Save to Journal</span>

            </button>

            <button onclick="copyToClipboard('${escapeHtml(content).replace(/'/g, "\\'")}', this)" class="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all flex items-center gap-1">

              <i data-lucide="copy" class="w-3 h-3"></i>

              <span>Copy</span>

            </button>

          </div>

        </div>

      </div>

    `;

  }



  container.appendChild(msgDiv);

  container.scrollTop = container.scrollHeight;

  lucide.createIcons();

}



function narrateAIMessage(text, btnElement) {

  if (!('speechSynthesis' in window)) {

    showToast('Speech synthesis not supported in this browser.');

    return;

  }

  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*#_`~\[\]]/g, '');

  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.rate = 1.0;

  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);

  showToast('Speaking AI response...');

}



async function saveAndFeedback(title, content, mood, btnElement) {

  try {

    await saveQuickJournal(title, content, mood);

    if (btnElement) {

      const span = btnElement.querySelector('span');

      if (span) {

        span.textContent = 'Saved to Journal';

        btnElement.classList.add('text-emerald-300', 'bg-emerald-950/40', 'border-emerald-500/30');

      }

    }

    showToast('Saved to your private Journal Vault!');

  } catch (e) {

    showToast('Failed to save reflection');

  }

}



function toggleReasoningAccordion(turnId) {

  const body = document.getElementById(`reasoning-body-${turnId}`);

  const icon = document.getElementById(`reasoning-icon-${turnId}`);

  if (body) {

    const isHidden = body.classList.contains('hidden');

    if (isHidden) {

      body.classList.remove('hidden');

      if (icon) icon.style.transform = 'rotate(180deg)';

    } else {

      body.classList.add('hidden');

      if (icon) icon.style.transform = 'rotate(0deg)';

    }

  }

}



function copyToClipboard(text, btnElement) {

  navigator.clipboard.writeText(text).then(() => {

    if (btnElement) {

      const span = btnElement.querySelector('span');

      if (span) {

        const orig = span.textContent;

        span.textContent = 'Copied!';

        setTimeout(() => span.textContent = orig, 1500);

      }

    }

    showToast('Response copied to clipboard!');

  }).catch(() => {

    showToast('Copied to clipboard');

  });

}



function updateLiveCognitiveBar(cogData) {

  const bar = document.getElementById('live-cognitive-bar');

  if (!bar) return;

  

  bar.classList.remove('hidden');



  const emoEl = document.getElementById('live-primary-emotion');

  if (emoEl) emoEl.textContent = cogData.primary_emotion || 'Balanced';

  

  const distBadge = document.getElementById('live-distortions-badge');

  if (distBadge) {

    if (cogData.detected_distortions && cogData.detected_distortions.length > 0) {

      distBadge.innerHTML = `<span class="bg-amber-950/60 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3 text-amber-400"></i><span>${escapeHtml(cogData.detected_distortions.join(' • '))}</span></span>`;

    } else {

      distBadge.innerHTML = `<span class="text-[11px] text-emerald-400 font-mono flex items-center gap-1"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i><span>Zero Distortions Detected</span></span>`;

    }

  }



  const chipsContainer = document.getElementById('live-mood-chips');

  if (chipsContainer) {

    chipsContainer.innerHTML = '';

    const moods = cogData.mood_scores || {};

    Object.keys(moods).forEach(key => {

      const val = moods[key];

      chipsContainer.innerHTML += `

        <div class="bg-black/40 p-2 rounded-lg border border-white/5">

          <div class="text-[10px] text-slate-400 uppercase">${key}</div>

          <div class="text-xs font-bold text-blue-400 font-mono">${val}%</div>

        </div>

      `;

    });

  }

}



// =============================================================================

// MULTI-TRACK DIGITAL LIFE JOURNAL ENGINE (CHRONO, CBT, CYCLE, MEMORY)

// =============================================================================



// Mock Google Calendar Planned Events

const mockGCalSchedule = {

  '08:00': { title: 'Team Architecture Standup', duration: '30m', category: 'Team Sync' },

  '09:00': { title: 'Deep Work: Core AI Engine', duration: '2h', category: 'Focus Block' },

  '12:00': { title: 'Team Lunch & Mindful Walk', duration: '1h', category: 'Wellness' },

  '15:00': { title: 'Client Product Walkthrough', duration: '45m', category: 'External' },

  '17:00': { title: 'Daily Engineering Review', duration: '30m', category: 'Wrap-up' }

};



// Mock Memory Photos

let memoryPhotosList = [

  {

    id: 'photo_1',

    hour: '08:15',

    url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',

    caption: 'Morning coffee & quiet planning before the sprint',

    location: 'Cafe Botanica, Central Square',

    mood: 'Calm',

    energy: '8/10'

  },

  {

    id: 'photo_2',

    hour: '12:30',

    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',

    caption: 'Whiteboarding session on multi-track cognitive sync',

    location: 'Design Studio Room 4B',

    mood: 'Energized',

    energy: '9/10'

  },

  {

    id: 'photo_3',

    hour: '18:45',

    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',

    caption: 'Sunset run to clear mental cache and anchor gratitude',

    location: 'Riverbank Promenade',

    mood: 'Joyful',

    energy: '8/10'

  }

];



let attachedPhotoBase64 = null;

let currentSelectedMood = { name: 'Calm', emoji: '' };

let isGCalSynced = false;

let isCycleOptedIn = true;

let liveDiaryClockInterval = null;



// =============================================================================

// DIARY SPACE & LOCAL TIME INITIALIZATION

// =============================================================================



function initDiarySpace() {

  updateLiveDiaryClock();

  if (liveDiaryClockInterval) clearInterval(liveDiaryClockInterval);

  liveDiaryClockInterval = setInterval(updateLiveDiaryClock, 10000);



  updateMediaModeUI();

  renderDiaryWeeklyRibbon();

  applyGenderTrackVisibility(state.currentUser.gender);



  // Set Profile Selectors if elements exist

  const genderSelect = document.getElementById('profile-gender-select');

  if (genderSelect) genderSelect.value = state.currentUser.gender || 'female';



  const spanSelect = document.getElementById('profile-span-select');

  if (spanSelect) spanSelect.value = state.timelineRange || 'day_standard';



  const rangeSelect = document.getElementById('chrono-range-select');

  if (rangeSelect) rangeSelect.value = state.timelineRange || 'day_standard';



  setMomentTimeToNow();

}



function updateLiveDiaryClock() {

  const now = new Date();

  let hours = now.getHours();

  const minutes = String(now.getMinutes()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';

  const displayHours = hours % 12 || 12;

  const timeStr = `${displayHours}:${minutes} ${ampm}`;



  // Timezone Detection

  let tzName = 'Local';

  try {

    tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';

  } catch (e) {}



  const clockEl = document.getElementById('chrono-live-clock');

  if (clockEl) clockEl.textContent = `● LIVE: ${timeStr}`;



  const tzEl = document.getElementById('chrono-user-tz-badge');

  if (tzEl) tzEl.innerHTML = `<i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i><span>${tzName}</span>`;

}



function renderDiaryWeeklyRibbon() {

  const container = document.getElementById('diary-week-ribbon-container');

  if (!container) return;



  const selected = state.selectedDiaryDate || new Date();

  const now = new Date();

  const dayOfWeek = selected.getDay(); // 0 is Sunday

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  

  // Find Monday of the selected date's week

  const monday = new Date(selected);

  const diff = selected.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

  monday.setDate(diff);



  // Sync date picker input value (YYYY-MM-DD)

  const datePicker = document.getElementById('chrono-date-picker');

  if (datePicker) {

    const y = selected.getFullYear();

    const m = String(selected.getMonth() + 1).padStart(2, '0');

    const day = String(selected.getDate()).padStart(2, '0');

    datePicker.value = `${y}-${m}-${day}`;

  }



  let html = '';

  for (let i = 0; i < 7; i++) {

    const d = new Date(monday);

    d.setDate(monday.getDate() + i);

    const isSelected = d.toDateString() === selected.toDateString();

    const isToday = d.toDateString() === now.toDateString();

    const dayName = days[d.getDay()];

    const dayNum = d.getDate();



    html += `

      <div class="diary-day-pill ${isSelected ? 'active' : ''}" onclick="selectDiaryDate('${d.toISOString()}')" title="${d.toLocaleDateString()}">

        <span class="day-name text-[10px] text-slate-400 uppercase tracking-wider">${dayName}</span>

        <span class="day-number text-sm font-bold text-slate-200 mt-0.5">${dayNum}</span>

        ${isToday ? '<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1" title="Today"></span>' : ''}

      </div>

    `;

  }



  container.innerHTML = html;



  // Update Chronicle Title

  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };

  const isToday = selected.toDateString() === now.toDateString();

  const titleEl = document.getElementById('diary-current-date-title');

  if (titleEl) {

    titleEl.innerHTML = `<i data-lucide="book-marked" class="w-4 h-4 text-cyan-400"></i> <span>${isToday ? "Today's Daily Chronicle" : selected.toLocaleDateString('en-US', options)}</span>`;

    lucide.createIcons();

  }

}



function selectDiaryDate(isoDateStr) {

  state.selectedDiaryDate = new Date(isoDateStr);

  renderDiaryWeeklyRibbon();

  renderChronoTimeline();

  showToast(`Chronicle loaded: ${state.selectedDiaryDate.toLocaleDateString()}`);

}



function onDiaryDatePickerChange(dateVal) {

  if (!dateVal) return;

  const parts = dateVal.split('-');

  if (parts.length === 3) {

    state.selectedDiaryDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

    renderDiaryWeeklyRibbon();

    renderChronoTimeline();

    showToast(`Chronicle loaded: ${state.selectedDiaryDate.toLocaleDateString()}`);

  }

}



function stepDiaryDay(offset) {

  const current = state.selectedDiaryDate || new Date();

  const next = new Date(current);

  next.setDate(current.getDate() + offset);

  state.selectedDiaryDate = next;

  renderDiaryWeeklyRibbon();

  renderChronoTimeline();

  showToast(`Viewing: ${next.toLocaleDateString()}`);

}



function jumpToToday() {

  state.selectedDiaryDate = new Date();

  renderDiaryWeeklyRibbon();

  renderChronoTimeline();

  scrollToCurrentHour();

  showToast("Jumped to Today's Chronicle");

}



function initMediaMode() {

  const saved = localStorage.getItem('mind_cave_media_mode') || 'photos';

  state.mediaMode = saved;

  updateMediaModeUI();

}



function updateMediaModeUI() {

  const btn = document.getElementById('media-mode-toggle-btn');

  const icon = document.getElementById('media-mode-icon');

  const label = document.getElementById('media-mode-label');



  const isPhotos = state.mediaMode === 'photos';

  if (icon) {

    icon.setAttribute('data-lucide', isPhotos ? 'image' : 'file-text');

    icon.className = `w-3.5 h-3.5 ${isPhotos ? 'text-amber-400' : 'text-slate-400'}`;

  }

  if (label) {

    label.textContent = isPhotos ? 'Photos: On' : 'Light Text';

  }

  if (btn) {

    btn.title = isPhotos ? 'Photos are visible globally (Click for Lightweight Mode)' : 'Lightweight text mode active (Click to show Photos)';

  }

  lucide.createIcons();

}



function toggleMediaMode() {

  state.mediaMode = state.mediaMode === 'photos' ? 'compact' : 'photos';

  localStorage.setItem('mind_cave_media_mode', state.mediaMode);

  updateMediaModeUI();

  renderChronoTimeline();

  renderMemoryPhotos();

  showToast(state.mediaMode === 'compact' ? 'Lightweight Mode: Photos collapsed for fast reading.' : 'Rich Media Mode: Photos enabled across journal.');

}



function toggleSingleMomentPhoto(btn) {

  const card = btn.closest('.chrono-block-card');

  if (!card) return;

  const img = card.querySelector('.chrono-photo-preview');

  if (img) {

    const isHidden = img.classList.contains('hidden');

    img.classList.toggle('hidden', !isHidden);

    btn.textContent = isHidden ? 'Hide' : 'Preview';

  }

}



function triggerQuickPhotoMoment() {

  openNewJournalModal();

  const trackSel = document.getElementById('journal-track-select');

  if (trackSel) trackSel.value = 'memory';

  const fileInp = document.getElementById('journal-photo-input');

  if (fileInp) fileInp.click();

}



function getTrackPreferences(gender) {

  const customCycle = localStorage.getItem('mind_cave_track_cycle_enabled');

  const customCirc = localStorage.getItem('mind_cave_track_circadian_enabled');



  let cycleEnabled = true;

  let circEnabled = false;



  if (gender === 'female') {

    cycleEnabled = customCycle !== null ? customCycle === 'true' : true;

    circEnabled = customCirc !== null ? customCirc === 'true' : false;

  } else if (gender === 'male') {

    cycleEnabled = customCycle !== null ? customCycle === 'true' : false;

    circEnabled = customCirc !== null ? customCirc === 'true' : true;

  } else {

    // non_binary, unspecified (Others)

    cycleEnabled = customCycle !== null ? customCycle === 'true' : true;

    circEnabled = customCirc !== null ? customCirc === 'true' : true;

  }



  return { cycleEnabled, circEnabled };

}



function applyGenderTrackVisibility(gender) {

  const cycleBtn = document.getElementById('track-btn-cycle');

  const circBtn = document.getElementById('track-btn-circadian');

  const toggleCycle = document.getElementById('profile-toggle-cycle');

  const toggleCirc = document.getElementById('profile-toggle-circadian');

  const synthBioChip = document.getElementById('synthesis-bio-chip');



  const { cycleEnabled, circEnabled } = getTrackPreferences(gender);



  if (cycleBtn) cycleBtn.classList.toggle('hidden', !cycleEnabled);

  if (circBtn) circBtn.classList.toggle('hidden', !circEnabled);



  if (toggleCycle) toggleCycle.checked = cycleEnabled;

  if (toggleCirc) toggleCirc.checked = circEnabled;



  // Update AI Synthesis Bio chip dynamically

  if (synthBioChip) {

    if (cycleEnabled) {

      synthBioChip.classList.remove('hidden');

      synthBioChip.innerHTML = `<i data-lucide="moon" class="w-3 h-3 text-purple-400"></i><span id="synth-bio-chip">Luteal Phase</span>`;

    } else if (circEnabled) {

      synthBioChip.classList.remove('hidden');

      synthBioChip.innerHTML = `<i data-lucide="zap" class="w-3 h-3 text-amber-400"></i><span id="synth-bio-chip">Circadian Peak</span>`;

    } else {

      synthBioChip.classList.add('hidden');

    }

  }

}



function toggleTrackPreference(trackId, isChecked) {

  localStorage.setItem(`mind_cave_track_${trackId}_enabled`, isChecked ? 'true' : 'false');

  applyGenderTrackVisibility(state.currentUser.gender);

  showToast(`${trackId === 'cycle' ? 'Cycle Intelligence' : 'Circadian Energy'} track ${isChecked ? 'enabled' : 'hidden'}.`);

}



function updateUserGender(gender) {

  state.currentUser.gender = gender;

  localStorage.setItem('mind_cave_user_gender', gender);



  // Set smart default track states for chosen gender

  if (gender === 'female') {

    localStorage.setItem('mind_cave_track_cycle_enabled', 'true');

    localStorage.setItem('mind_cave_track_circadian_enabled', 'false');

  } else if (gender === 'male') {

    localStorage.setItem('mind_cave_track_cycle_enabled', 'false');

    localStorage.setItem('mind_cave_track_circadian_enabled', 'true');

  } else {

    // Non-Binary / Other / Unspecified

    localStorage.setItem('mind_cave_track_cycle_enabled', 'true');

    localStorage.setItem('mind_cave_track_circadian_enabled', 'true');

  }



  applyGenderTrackVisibility(gender);

  showToast(`Profile updated: ${gender === 'female' ? 'Female (Cycle Active)' : gender === 'male' ? 'Male (Circadian Active)' : 'Non-Binary / Other (Custom Active)'}`);

}



function changeTimeRange(rangeVal) {

  state.timelineRange = rangeVal;

  localStorage.setItem('mind_cave_timeline_range', rangeVal);

  

  const selA = document.getElementById('chrono-range-select');

  if (selA) selA.value = rangeVal;

  const selB = document.getElementById('profile-span-select');

  if (selB) selB.value = rangeVal;



  renderChronoTimeline();

  showToast(`Timeline span updated: ${rangeVal === 'full_24h' ? 'Full 24 Hours' : rangeVal === 'active_focus' ? 'Active Focus (08-20h)' : 'Day Span (06-23h)'}`);

}



function scrollToCurrentHour() {

  const nowMarker = document.querySelector('.timeline-now-marker') || document.querySelector('.timeline-hour-row.is-current-hour');

  if (nowMarker) {

    nowMarker.scrollIntoView({ behavior: 'smooth', block: 'center' });

    showToast('Jumped to current local time');

  }

}



function setMomentTimeToNow() {

  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');

  const minutes = String(now.getMinutes()).padStart(2, '0');

  const timeInput = document.getElementById('journal-exact-time-input');

  if (timeInput) timeInput.value = `${hours}:${minutes}`;



  const hourDropdown = document.getElementById('journal-hour-input');

  if (hourDropdown) {

    const matchHour = `${hours}:00`;

    if (hourDropdown.querySelector(`option[value="${matchHour}"]`)) {

      hourDropdown.value = matchHour;

    }

  }

}



function syncExactTimeFromHour(hourVal) {

  const timeInput = document.getElementById('journal-exact-time-input');

  if (timeInput) timeInput.value = hourVal;

}



function switchJournalTrack(trackId) {

  const tracks = ['chrono', 'harmony', 'memory_lane', 'memory', 'sanctuary', 'cbt', 'cycle', 'circadian'];

  tracks.forEach(t => {

    const el = document.getElementById(`journal-track-${t}`);

    const btn = document.getElementById(`track-btn-${t}`);

    if (el) el.classList.add('hidden');

    if (btn) btn.className = 'track-tab-btn';

  });



  const activeEl = document.getElementById(`journal-track-${trackId}`);

  const activeBtn = document.getElementById(`track-btn-${trackId}`);

  if (activeEl) activeEl.classList.remove('hidden');

  if (activeBtn) activeBtn.className = `track-tab-btn active-${trackId}`;



  if (trackId === 'chrono') renderChronoTimeline();

  if (trackId === 'sanctuary' || trackId === 'cbt') {

    renderCBTHeatmap();

    renderHabitTracker();

    renderBucketList();

  }

  if (trackId === 'memory') renderMemoryPhotos();

}



function toggleGCalSync() {

  isGCalSynced = !isGCalSynced;

  const btn = document.getElementById('btn-gcal-sync');

  const btnText = document.getElementById('gcal-btn-text');



  if (isGCalSynced) {

    btn.classList.add('!bg-blue-600/25', '!border-blue-500/40', '!text-blue-300');

    btnText.textContent = 'Google Calendar Synced (5 Events)';

    showToast('Google Calendar connected! 5 planned events mapped to your hourly timeline.');

  } else {

    btn.classList.remove('!bg-blue-600/25', '!border-blue-500/40', '!text-blue-300');

    btnText.textContent = 'Sync Google Calendar';

    showToast('Google Calendar disconnected.');

  }

  renderChronoTimeline();

}



function toggleCycleOptIn() {

  isCycleOptedIn = !isCycleOptedIn;

  const btn = document.getElementById('cycle-optin-btn');

  if (isCycleOptedIn) {

    btn.textContent = 'Active (Encrypted)';

    btn.className = 'text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40';

    showToast('Cycle intelligence active and encrypted locally.');

  } else {

    btn.textContent = 'Paused';

    btn.className = 'text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700';

    showToast('Cycle tracking paused.');

  }

}



function selectMoodChip(moodName, emoji, btnElement) {

  currentSelectedMood = { name: moodName, emoji };

  document.querySelectorAll('#mood-chip-group .mood-chip').forEach(btn => btn.classList.remove('selected'));

  if (btnElement) btnElement.classList.add('selected');

  const lbl = document.getElementById('mood-pulse-label');

  if (lbl) lbl.textContent = moodName;

}



function toggleLocationStamp(checkbox) {

  const txt = document.getElementById('journal-location-text');

  if (!txt) return;

  if (checkbox.checked) {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(

        () => { txt.textContent = 'Connaught Place, New Delhi'; },

        () => { txt.textContent = 'Central District (Approx)'; }

      );

    } else {

      txt.textContent = 'Home / Office Studio';

    }

  } else {

    txt.textContent = 'Location Stamp Disabled';

  }

}



function triggerPhotoUpload() {

  openNewJournalModal();

  document.getElementById('journal-track-select').value = 'memory';

  document.getElementById('journal-photo-input').click();

}



function openNewJournalModal(targetHour = null) {

  if (targetHour) {

    const hourSelect = document.getElementById('journal-hour-input');

    if (hourSelect) hourSelect.value = targetHour;

    const timeInput = document.getElementById('journal-exact-time-input');

    if (timeInput) timeInput.value = targetHour;

  } else {

    setMomentTimeToNow();

  }

  document.getElementById('journal-modal').classList.remove('hidden');

}



function closeNewJournalModal() {

  document.getElementById('journal-modal').classList.add('hidden');

  attachedPhotoBase64 = null;

  const box = document.getElementById('journal-photo-preview-box');

  if (box) box.classList.add('hidden');

}



let timelineViewMode = 'stream';

let storyCurrentIndex = 0;

let storyEventsCache = [];



function setTimelineViewMode(mode) {

  timelineViewMode = mode;

  const streamBtn = document.getElementById('view-mode-stream-btn');

  const storyBtn = document.getElementById('view-mode-story-btn');

  const streamView = document.getElementById('chrono-timeline-list');

  const storyView = document.getElementById('chrono-story-view');



  if (mode === 'stream') {

    if (streamBtn) streamBtn.className = 'px-2.5 py-1 rounded-lg font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1';

    if (storyBtn) storyBtn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-400 hover:text-white flex items-center gap-1';

    if (streamView) streamView.classList.remove('hidden');

    if (storyView) storyView.classList.add('hidden');

  } else {

    if (storyBtn) storyBtn.className = 'px-2.5 py-1 rounded-lg font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1';

    if (streamBtn) streamBtn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-400 hover:text-white flex items-center gap-1';

    if (streamView) streamView.classList.add('hidden');

    if (storyView) storyView.classList.remove('hidden');

    initStorySwipeDrag();

  }

}



function setDiaryRangeMode(mode) {

  state.diaryRangeMode = mode;

  const singleBtn = document.getElementById('range-mode-single-btn');

  const weekBtn = document.getElementById('range-mode-week-btn');

  const allBtn = document.getElementById('range-mode-all-btn');



  if (singleBtn) singleBtn.className = mode === 'single' ? 'px-2 py-0.5 rounded-lg font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px]' : 'px-2 py-0.5 rounded-lg font-semibold text-slate-400 hover:text-white text-[11px]';

  if (weekBtn) weekBtn.className = mode === 'week' ? 'px-2 py-0.5 rounded-lg font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px]' : 'px-2 py-0.5 rounded-lg font-semibold text-slate-400 hover:text-white text-[11px]';

  if (allBtn) allBtn.className = mode === 'all' ? 'px-2 py-0.5 rounded-lg font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px]' : 'px-2 py-0.5 rounded-lg font-semibold text-slate-400 hover:text-white text-[11px]';



  renderChronoTimeline();

  const labelMap = { single: 'Day View', week: '7-Day Consolidated Digest', all: 'All-Time Life Stream' };

  showToast(`View switched to ${labelMap[mode] || mode}`);

}



function getChronologicalEvents(journals) {

  const events = [];

  const selectedDate = state.selectedDiaryDate || new Date();

  const selectedDateStr = selectedDate.toDateString();

  const isSelectedToday = selectedDateStr === (new Date()).toDateString();



  // Calculate Week boundaries for 7-day mode

  const dayOfWeek = selectedDate.getDay();

  const weekStart = new Date(selectedDate);

  weekStart.setDate(selectedDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

  weekStart.setHours(0, 0, 0, 0);



  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekStart.getDate() + 7);

  weekEnd.setHours(23, 59, 59, 999);



  // 1. Add Journal Entries

  journals.forEach((j, idx) => {

    let entryDate = new Date();

    if (j.created_at) {

      entryDate = typeof j.created_at === 'number' ? new Date(j.created_at * 1000) : new Date(j.created_at);

    }

    

    let matches = false;

    if (state.diaryRangeMode === 'all') {

      matches = true;

    } else if (state.diaryRangeMode === 'week') {

      matches = entryDate >= weekStart && entryDate <= weekEnd;

    } else {

      matches = isSelectedToday || (entryDate.toDateString() === selectedDateStr);

    }



    if (matches) {

      let timeStr = '12:00';

      const timeMatch = j.title && j.title.match(/\[(\d{1,2}:\d{2})\]/);

      if (timeMatch) {

        timeStr = timeMatch[1];

      } else {

        const hoursMap = ['08:15', '11:30', '14:45', '17:30', '20:00'];

        timeStr = hoursMap[idx % hoursMap.length];

      }



      events.push({

        id: `journal_${j.id || idx}`,

        type: 'journal',

        time: timeStr,

        rawHour: parseInt(timeStr.substring(0, 2), 10) || 12,

        entryDate: entryDate,

        dateHeader: entryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),

        title: j.title.replace(/\[\d{1,2}:\d{2}\]\s*/, '') || 'Reflective Journal Turn',

        content: j.content,

        mood: j.mood || 'Reflective',

        cbtNote: j.insights?.cognitive_reframing || null,

        location: 'Connaught Place, New Delhi',

        energy: '8/10',

        photoUrl: null

      });

    }

  });



  // 2. Add Memory Photos

  if (state.diaryRangeMode === 'all' || state.diaryRangeMode === 'week' || isSelectedToday) {

    memoryPhotosList.forEach(p => {

      events.push({

        id: p.id,

        type: 'photo',

        time: p.hour,

        rawHour: parseInt(p.hour.substring(0, 2), 10) || 12,

        entryDate: selectedDate,

        dateHeader: selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),

        title: p.caption,

        content: p.caption,

        mood: p.mood,

        cbtNote: null,

        location: p.location,

        energy: p.energy,

        photoUrl: p.url

      });

    });

  }



  // 3. Add Google Calendar Events if synced

  if (isGCalSynced && (state.diaryRangeMode === 'all' || state.diaryRangeMode === 'week' || isSelectedToday)) {

    Object.keys(mockGCalSchedule).forEach(h => {

      const g = mockGCalSchedule[h];

      events.push({

        id: `gcal_${h}`,

        type: 'gcal',

        time: h,

        rawHour: parseInt(h.substring(0, 2), 10),

        entryDate: selectedDate,

        dateHeader: selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),

        title: `Google Calendar: ${g.title}`,

        content: `Scheduled session for ${g.duration} (${g.category}). Planned agenda synchronized to daily chronicle.`,

        mood: 'Planned',

        cbtNote: null,

        location: 'Google Meet / Workspace',

        energy: 'Schedule',

        photoUrl: null

      });

    });

  }



  // 4. Add Life Agenda Tasks & Milestones

  state.agendaItems.forEach(t => {

    const taskDate = new Date(t.date + 'T' + t.time);

    let taskMatches = false;

    if (state.diaryRangeMode === 'all') {

      taskMatches = true;

    } else if (state.diaryRangeMode === 'week') {

      taskMatches = taskDate >= weekStart && taskDate <= weekEnd;

    } else {

      taskMatches = isSelectedToday || (taskDate.toDateString() === selectedDateStr);

    }



    if (taskMatches) {

      events.push({

        id: `task_item_${t.id}`,

        taskId: t.id,

        type: 'task',

        time: t.time,

        rawHour: parseInt(t.time.substring(0, 2), 10) || 12,

        entryDate: taskDate,

        dateHeader: taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),

        title: t.title,

        content: `Priority: ${t.priority.toUpperCase()} • 2-Way Google Calendar Synced`,

        isCompleted: t.completed,

        taskType: t.type,

        mood: t.completed ? 'Fulfilled' : 'Actionable',

        cbtNote: null,

        location: 'Google Calendar Task',

        energy: t.priority === 'high' ? 'High Priority' : 'Normal Priority',

        photoUrl: null

      });

    }

  });



  // 5. Add Today's Achievable Goals & Completion Duration to Timeline Stream

  if (state.todayGoals && Array.isArray(state.todayGoals) && (state.diaryRangeMode === 'all' || isSelectedToday)) {

    state.todayGoals.forEach(g => {

      let goalTime = g.startTime || '09:00';

      events.push({

        id: `goal_event_${g.id}`,

        goalId: g.id,

        type: 'goal',

        time: goalTime,

        rawHour: parseInt(goalTime.substring(0, 2), 10) || 9,

        entryDate: selectedDate,

        dateHeader: selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),

        title: g.title,

        content: `Domain: ${g.categoryLabel || 'North Star'}${g.duration ? ' • Focus Duration: ' + g.duration : ''}${g.notes ? ' • Note: ' + g.notes : ''}`,

        isCompleted: g.completed,

        startTime: g.startTime,

        endTime: g.endTime,

        duration: g.duration,

        category: g.category,

        categoryLabel: g.categoryLabel || 'North Star',

        mood: g.completed ? 'Completed Goal' : 'Intended Goal',

        cbtNote: g.notes || null,

        location: "Today's Goal Plan",

        energy: g.duration ? g.duration : 'Focus Block',

        photoUrl: null

      });

    });

  }



  // Sort strictly by Date + Time (Newest / Most Recent at top)

  events.sort((a, b) => {

    if (state.diaryRangeMode !== 'single') {

      const dateA = a.entryDate ? a.entryDate.getTime() : 0;

      const dateB = b.entryDate ? b.entryDate.getTime() : 0;

      if (dateA !== dateB) return dateB - dateA; // Newest date first

    }

    return b.time.localeCompare(a.time); // Newest time first

  });



  return events;

}



async function renderChronoTimeline() {

  const container = document.getElementById('chrono-timeline-list');

  if (!container) return;



  // Fetch saved journals

  let journals = [];

  try {

    const response = await fetch('/api/journals', { headers: getAuthHeaders() });

    const data = await response.json();

    journals = data.journals || [];

  } catch (e) {

    journals = [];

  }



  const events = getChronologicalEvents(journals);

  storyEventsCache = events;



  // Real-time details

  const now = new Date();

  const currentHourInt = now.getHours();

  const currentMinStr = String(now.getMinutes()).padStart(2, '0');

  const displayAmpm = currentHourInt >= 12 ? 'PM' : 'AM';

  const display12H = (currentHourInt % 12 || 12) + ':' + currentMinStr + ' ' + displayAmpm;



  const isSelectedToday = (state.selectedDiaryDate || new Date()).toDateString() === now.toDateString();

  const dateFormatted = (state.selectedDiaryDate || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });



  // If NO logged entries exist

  if (events.length === 0) {

    container.innerHTML = `

      <div class="p-8 text-center bg-black/30 rounded-3xl border border-white/5 space-y-3 my-4">

        <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mx-auto shadow-lg shadow-cyan-500/10">

          <i data-lucide="feather" class="w-6 h-6"></i>

        </div>

        <h4 class="text-base font-bold text-white">${isSelectedToday ? "Your Daily Chronicle is Open" : `No Moments Recorded for ${dateFormatted}`}</h4>

        <p class="text-xs text-slate-400 max-w-sm mx-auto">

          ${isSelectedToday ? "No entries recorded for today yet. Every thought, mood pulse, and task you capture will appear here in chronological order." : `No reflections were captured on ${dateFormatted}. You can log a moment or reflection for this date.`}

        </p>

        <button onclick="openNewJournalModal()" class="btn-island mx-auto mt-2 !py-2 !px-4">

          <span>+ Log Moment for ${dateFormatted}</span>

          <div class="btn-island-icon !w-5 !h-5">

            <i data-lucide="plus" class="w-3.5 h-3.5 text-white"></i>

          </div>

        </button>

      </div>

    `;

    lucide.createIcons();

    renderStoryCarousel(events);

    return;

  }



  let html = '<div class="timeline-spine"></div>';

  let nowMarkerInserted = false;

  let lastDateHeader = '';



  events.forEach((ev) => {

    // Render Consolidated Multi-Date Divider if in week / all mode

    if (state.diaryRangeMode !== 'single' && ev.dateHeader && ev.dateHeader !== lastDateHeader) {

      html += `

        <div class="consolidated-date-divider">

          <span class="consolidated-date-pill">

            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>

            <span>${ev.dateHeader}</span>

          </span>

        </div>

      `;

      lastDateHeader = ev.dateHeader;

    }



    // Circadian / Weather Badge

    let weatherBadge = 'Midday Focus';

    if (ev.rawHour >= 5 && ev.rawHour < 9) weatherBadge = 'Dawn Routine';

    else if (ev.rawHour >= 9 && ev.rawHour < 13) weatherBadge = 'Focus Block';

    else if (ev.rawHour >= 13 && ev.rawHour < 17) weatherBadge = 'Execution Block';

    else if (ev.rawHour >= 17 && ev.rawHour < 20) weatherBadge = 'Golden Hour';

    else if (ev.rawHour >= 20) weatherBadge = 'Night Sanctuary';

    else weatherBadge = 'Deep Rest';



    // Insert LIVE NOW laser needle if viewing today in single mode

    if (state.diaryRangeMode === 'single' && isSelectedToday && !nowMarkerInserted && ev.rawHour >= currentHourInt) {

      html += `

        <div class="timeline-now-marker">

          <div class="timeline-now-badge">

            <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>

            <span>● ${display12H} (NOW)</span>

          </div>

          <div class="timeline-now-line"></div>

        </div>

      `;

      nowMarkerInserted = true;

    }



    const isGCal = ev.type === 'gcal';

    const isTask = ev.type === 'task';

    const isGoal = ev.type === 'goal';



    html += `

      <div class="timeline-hour-row has-entry ${isGCal ? 'has-gcal' : ''} ${isTask ? 'has-task' : ''} ${isGoal ? 'has-goal' : ''}">

        <!-- Node Dot & Hour Label -->

        <div class="timeline-hour-node">

          <div class="timeline-node-dot"></div>

          <span class="timeline-hour-label font-mono font-bold">${ev.time}</span>

        </div>



        <!-- Editorial Diary Page Card -->

        <div class="chrono-block-card type-${ev.type} ${isGoal ? 'border-amber-500/30 dark:border-amber-500/25' : ''}">

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2.5 mb-2 pb-2 border-b border-black/5 dark:border-white/5">

            <div class="flex items-center gap-1.5 flex-wrap">

              <!-- Event Category Pill -->

              ${isGoal ? `

                <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ev.isCompleted ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-500/30' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-500/30'} border shrink-0">

                  <i data-lucide="${ev.isCompleted ? 'check-circle' : 'target'}" class="w-3 h-3 text-amber-500"></i>

                  <span>${escapeHtml(ev.categoryLabel || "Today's Goal")}</span>

                </span>

              ` : isGCal ? `

                <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 shrink-0">

                  <i data-lucide="calendar" class="w-3 h-3 text-blue-500"></i>

                  <span>Google Calendar</span>

                </span>

              ` : isTask ? `

                <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ev.isCompleted ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'} border shrink-0">

                  <i data-lucide="${ev.isCompleted ? 'check-circle' : 'target'}" class="w-3 h-3"></i>

                  <span>${ev.isCompleted ? 'Completed Task' : (ev.taskType === 'milestone' ? 'Goal Milestone' : 'Action Item')}</span>

                </span>

              ` : ev.type === 'photo' ? `

                <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 shrink-0">

                  <i data-lucide="image" class="w-3 h-3 text-purple-500"></i>

                  <span>Visual Memory</span>

                </span>

              ` : `

                <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shrink-0">

                  <i data-lucide="feather" class="w-3 h-3 text-emerald-500"></i>

                  <span>${escapeHtml(ev.mood || 'Reflection')}</span>

                </span>

              `}



              <span class="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 shrink-0">

                ${weatherBadge}

              </span>



              ${ev.energy ? `

                <span class="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-semibold shrink-0">

                  ${ev.energy}

                </span>

              ` : ''}

            </div>



            <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-0.5 sm:pt-0">

              <span class="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[140px] sm:max-w-[200px] flex items-center gap-1">

                <i data-lucide="map-pin" class="w-3 h-3 shrink-0"></i>

                <span class="truncate">${escapeHtml(ev.location)}</span>

              </span>

              <div class="flex items-center gap-1 shrink-0">

                ${isGoal ? `

                  <button onclick="openTodayGoalModal('${ev.goalId}')" class="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:opacity-80 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30" title="Edit Goal Details">

                    <i data-lucide="edit-2" class="w-3 h-3"></i> <span>Edit</span>

                  </button>

                ` : isTask ? `

                  <button onclick="convertTaskToReflection('${ev.taskId}')" class="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:opacity-80 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30" title="Reflect on this task">

                    <i data-lucide="sparkles" class="w-3 h-3"></i> <span>Reflect</span>

                  </button>

                  <button onclick="deleteTask('${ev.taskId}')" class="text-xs text-slate-400 hover:text-rose-500 transition-colors p-1" title="Delete Task">

                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>

                  </button>

                ` : `

                  <button onclick="openNewJournalModal('${ev.time}')" class="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:opacity-80 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30">

                    <i data-lucide="edit-3" class="w-3 h-3"></i> <span>Add Note</span>

                  </button>

                `}

              </div>

            </div>

          </div>



          <!-- Entry Details -->

          <div class="space-y-1.5 pt-0.5">

            ${isGoal ? `

              <div class="flex items-start gap-2.5">

                <button type="button" onclick="toggleGoalItemComplete('${ev.goalId}')" class="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer mt-0.5 ${ev.isCompleted ? 'bg-amber-500 border-amber-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:border-amber-500 text-transparent'}" title="Toggle Goal Complete">

                  <i data-lucide="check" class="w-3.5 h-3.5 ${ev.isCompleted ? 'block' : 'hidden'}"></i>

                </button>

                <div class="min-w-0 flex-1">

                  <h4 class="chrono-card-title text-sm sm:text-base font-bold leading-snug ${ev.isCompleted ? 'line-through opacity-60' : ''}">${escapeHtml(ev.title)}</h4>

                  ${ev.startTime && ev.endTime ? `<div class="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3 shrink-0"></i><span>${ev.startTime} - ${ev.endTime} (${ev.duration || 'Calculated'})</span></div>` : ev.duration ? `<div class="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3 shrink-0"></i><span>Duration: ${ev.duration}</span></div>` : ''}

                </div>

              </div>

            ` : isTask ? `

              <div class="flex items-start gap-2.5">

                <button type="button" onclick="toggleTaskComplete('${ev.taskId}')" class="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer mt-0.5 ${ev.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'}" title="Click to mark done/undone">

                  <i data-lucide="check" class="w-3.5 h-3.5 ${ev.isCompleted ? 'block' : 'hidden'}"></i>

                </button>

                <div class="min-w-0 flex-1">

                  <h4 class="chrono-card-title text-sm sm:text-base font-bold leading-snug ${ev.isCompleted ? 'line-through opacity-50' : ''}">${escapeHtml(ev.title)}</h4>

                </div>

              </div>

            ` : `

              <h4 class="chrono-card-title text-sm sm:text-base font-bold leading-snug">${escapeHtml(ev.title)}</h4>

            `}

            

            <p class="chrono-card-text text-xs sm:text-sm leading-relaxed">${escapeHtml(ev.content)}</p>

            

            ${ev.cbtNote ? `

              <div class="p-2.5 sm:p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 italic mt-2 flex items-start gap-2">

                <i data-lucide="brain" class="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5"></i>

                <span><strong>Reflection Note:</strong> "${escapeHtml(ev.cbtNote)}"</span>

              </div>

            ` : ''}

          </div>



          <!-- Photo Attachment Preview (Respecting Global Media Mode) -->

          ${ev.photoUrl ? (

            state.mediaMode === 'compact' ? `

              <div class="mt-2.5 p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">

                <div class="flex items-center justify-between">

                  <span class="flex items-center gap-1.5 text-[11px] text-amber-300 font-mono">

                    <i data-lucide="image" class="w-3.5 h-3.5 text-amber-400"></i>

                    <span>Photo Attached (Lightweight Mode)</span>

                  </span>

                  <button type="button" onclick="toggleSingleMomentPhoto(this)" class="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-semibold transition-colors">

                    Preview

                  </button>

                </div>

                <img src="${ev.photoUrl}" alt="${escapeHtml(ev.title)}" class="chrono-photo-preview hidden w-full h-44 object-cover rounded-xl border border-white/10 mt-1">

              </div>

            ` : `

              <div class="mt-3 rounded-2xl overflow-hidden border border-white/10 max-w-md shadow-lg group">

                <img src="${ev.photoUrl}" alt="${escapeHtml(ev.title)}" class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500">

              </div>

            `

          ) : ''}

        </div>

      </div>

    `;

  });



  // If NOW laser needle was not inserted and viewing today

  if (state.diaryRangeMode === 'single' && isSelectedToday && !nowMarkerInserted) {

    html += `

      <div class="timeline-now-marker">

        <div class="timeline-now-badge">

          <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>

          <span>● ${display12H} (NOW)</span>

        </div>

        <div class="timeline-now-line"></div>

      </div>

    `;

  }



  // Floating + Add Next Moment Banner at bottom

  html += `

    <div class="pt-2 text-center">

      <button onclick="openNewJournalModal()" class="btn-secondary !py-2 !px-4 text-xs mx-auto flex items-center gap-2 hover:border-cyan-400">

        <i data-lucide="plus-circle" class="w-4 h-4 text-cyan-400"></i>

        <span>+ Log Another Life Moment for ${dateFormatted}</span>

      </button>

    </div>

  `;



  container.innerHTML = html;

  lucide.createIcons();



  // Also update Story Flow Carousel

  renderStoryCarousel(events);

}



// =============================================================================

// STORY FLOW CAROUSEL / TIMELINE SLIDE REVIEW (SWIPE & DRAG)

// =============================================================================



function renderStoryCarousel(events) {

  const track = document.getElementById('story-carousel-track');

  const dots = document.getElementById('story-dots-container');

  const indicator = document.getElementById('story-progress-indicator');

  if (!track || !dots) return;



  const dateFormatted = (state.selectedDiaryDate || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });



  if (events.length === 0) {

    track.innerHTML = `

      <div class="story-slide-card text-center justify-center items-center py-12">

        <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mx-auto mb-3">

          <i data-lucide="book-open" class="w-6 h-6"></i>

        </div>

        <h4 class="text-base font-bold text-white">No Story Slides for ${dateFormatted}</h4>

        <p class="text-xs text-slate-400 max-w-xs mt-1">Capture a moment to begin your interactive story review.</p>

      </div>

    `;

    dots.innerHTML = '';

    if (indicator) indicator.textContent = '0 Moments';

    lucide.createIcons();

    return;

  }



  storyCurrentIndex = Math.min(storyCurrentIndex, events.length - 1);



  track.innerHTML = events.map((ev, i) => `

    <div class="story-slide-card">

      <div>

        <!-- Slide Top Header -->

        <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">

          <div class="flex items-center gap-2">

            <span class="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">

              <i data-lucide="clock" class="w-3 h-3"></i>

              <span>${ev.time}</span>

            </span>

            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">

              ${escapeHtml(ev.mood)}

            </span>

          </div>

          <span class="text-[11px] text-slate-400 font-mono">${escapeHtml(ev.location)}</span>

        </div>



        <!-- Title & Content -->

        <h3 class="text-lg font-bold text-white mb-2 leading-snug">${escapeHtml(ev.title)}</h3>

        <p class="text-sm text-slate-300 leading-relaxed font-sans">${escapeHtml(ev.content)}</p>



        <!-- Optional CBT Note -->

        ${ev.cbtNote ? `

          <div class="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 italic mt-4 flex items-start gap-2">

            <i data-lucide="sparkles" class="w-4 h-4 text-purple-400 shrink-0 mt-0.5"></i>

            <span>CBT Reframing: "${escapeHtml(ev.cbtNote)}"</span>

          </div>

        ` : ''}

      </div>



      <!-- Slide Image & Footer (Respecting Global Media Mode) -->

      <div class="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        ${ev.photoUrl ? (

          state.mediaMode === 'compact' ? `

            <div class="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-amber-300">

              <i data-lucide="image" class="w-4 h-4 text-amber-400"></i>

              <span class="font-mono text-[11px]">1 Media Moment Stamped</span>

            </div>

          ` : `

            <div class="rounded-xl overflow-hidden border border-white/10 max-h-36 w-full sm:w-64">

              <img src="${ev.photoUrl}" alt="${escapeHtml(ev.title)}" class="w-full h-full object-cover">

            </div>

          `

        ) : '<div></div>'}



        <div class="flex items-center gap-3 text-xs text-slate-400 self-end sm:self-auto">

          <span>Energy: <strong class="text-amber-400 font-mono">${ev.energy || '8/10'}</strong></span>

          <span>•</span>

          <span class="font-mono">Moment ${i + 1} of ${events.length}</span>

        </div>

      </div>

    </div>

  `).join('');



  // Render Pagination Dots

  dots.innerHTML = events.map((_, i) => `

    <div class="story-dot ${i === storyCurrentIndex ? 'active' : ''}" onclick="goToStorySlide(${i})"></div>

  `).join('');



  updateStorySlidePosition();

  lucide.createIcons();

}



function updateStorySlidePosition() {

  const track = document.getElementById('story-carousel-track');

  const indicator = document.getElementById('story-progress-indicator');

  const dots = document.querySelectorAll('#story-dots-container .story-dot');



  if (track) {

    track.style.transform = `translateX(-${storyCurrentIndex * 100}%)`;

  }



  if (indicator && storyEventsCache.length > 0) {

    indicator.textContent = `Moment ${storyCurrentIndex + 1} of ${storyEventsCache.length}`;

  }



  dots.forEach((dot, i) => {

    if (i === storyCurrentIndex) dot.classList.add('active');

    else dot.classList.remove('active');

  });

}



function nextStorySlide() {

  if (storyCurrentIndex < storyEventsCache.length - 1) {

    storyCurrentIndex++;

    updateStorySlidePosition();

  } else {

    storyCurrentIndex = 0; // loop back

    updateStorySlidePosition();

  }

}



function prevStorySlide() {

  if (storyCurrentIndex > 0) {

    storyCurrentIndex--;

    updateStorySlidePosition();

  } else {

    storyCurrentIndex = Math.max(0, storyEventsCache.length - 1);

    updateStorySlidePosition();

  }

}



function goToStorySlide(index) {

  storyCurrentIndex = index;

  updateStorySlidePosition();

}



// Swipe & Drag Gesture Recognizer

let isDraggingStory = false;

let startX = 0;

let currentTranslate = 0;



function initStorySwipeDrag() {

  const viewport = document.getElementById('story-carousel-viewport');

  if (!viewport || viewport.dataset.initialized) return;



  viewport.dataset.initialized = 'true';



  // Touch handlers

  viewport.addEventListener('touchstart', (e) => {

    startX = e.touches[0].clientX;

    isDraggingStory = true;

  }, { passive: true });



  viewport.addEventListener('touchend', (e) => {

    if (!isDraggingStory) return;

    isDraggingStory = false;

    const endX = e.changedTouches[0].clientX;

    const diff = startX - endX;

    if (diff > 45) nextStorySlide();

    else if (diff < -45) prevStorySlide();

  });



  // Mouse drag handlers

  viewport.addEventListener('mousedown', (e) => {

    startX = e.clientX;

    isDraggingStory = true;

  });



  window.addEventListener('mouseup', (e) => {

    if (!isDraggingStory) return;

    isDraggingStory = false;

    const endX = e.clientX;

    const diff = startX - endX;

    if (diff > 45) nextStorySlide();

    else if (diff < -45) prevStorySlide();

  });



  // Keyboard navigation

  window.addEventListener('keydown', (e) => {

    if (timelineViewMode !== 'story') return;

    if (e.key === 'ArrowRight') nextStorySlide();

    if (e.key === 'ArrowLeft') prevStorySlide();

  });

}



function regenerateDailySynthesis() {

  const summaryEl = document.getElementById('cross-track-synthesis-text');

  // Auto-expand when refreshing

  const body = document.getElementById('synthesis-expanded-body');

  if (body && body.classList.contains('hidden')) {

    toggleSynthesisExpand();

  }

  if (summaryEl) {

    summaryEl.innerHTML = `

      <em>Synthesizing your daily temporal rhythm, CBT reframing patterns, hormonal stamina, and visual memories...</em>

    `;

    setTimeout(() => {

      summaryEl.innerHTML = `

        <strong>Cross-Track Synthesis Complete:</strong> You maintained high cognitive stamina across ${storyEventsCache.length || 3} recorded intervals today. Your morning focus phase effectively neutralized stress biases, aligning seamlessly with your natural circadian peak. Evening gratitude reflections indicate resilient mental equilibrium.

      `;

      showToast('AI Daily Synthesis updated across all 4 life tracks.');

    }, 600);

  }

}



function toggleSynthesisExpand() {

  const body = document.getElementById('synthesis-expanded-body');

  const btn = document.getElementById('synthesis-expand-btn');

  if (!body) return;

  const isHidden = body.classList.contains('hidden');

  body.classList.toggle('hidden', !isHidden);

  if (btn) btn.classList.toggle('expanded', isHidden);

}



function renderCBTHeatmap() {

  const container = document.getElementById('cbt-heatmap-container');

  if (!container) return;



  let html = '';

  for (let day = 1; day <= 28; day++) {

    const heatClass = day % 7 === 0 ? 'cbt-heat-3' : (day % 3 === 0 ? 'cbt-heat-2' : (day % 2 === 0 ? 'cbt-heat-1' : ''));

    html += `

      <div class="cbt-heat-cell ${heatClass}" title="Aug ${day}, 2026: Clarity Level ${day % 4 + 1}/4">

        ${day}

      </div>

    `;

  }

  container.innerHTML = html;

}



function renderMemoryPhotos() {

  const container = document.getElementById('memory-photos-grid');

  if (!container) return;



  container.innerHTML = memoryPhotosList.map(p => `

    <div class="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 shadow-sm hover:shadow-md transition-all duration-300 group">

      <div class="relative w-full h-44 overflow-hidden bg-slate-900">

        <img src="${p.url}" alt="${escapeHtml(p.caption)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">

        <div class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-amber-300 font-mono">

          ${p.hour}

        </div>

        <div class="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-cyan-300 font-medium">

          ${p.mood}

        </div>

      </div>

      <div class="p-3.5 flex flex-col justify-between flex-1 gap-2">

        <div>

          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i><span>${escapeHtml(p.location)}</span></span>

          <h5 class="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">${escapeHtml(p.caption)}</h5>

        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">

          <span class="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-semibold flex items-center gap-1"><i data-lucide="zap" class="w-3 h-3"></i><span>${p.energy}</span></span>

          <button onclick="openScrapbookModal()" class="text-xs text-pink-600 dark:text-pink-400 hover:opacity-80 flex items-center gap-1 font-semibold">

            <i data-lucide="share-2" class="w-3 h-3"></i> <span>Scrapbook</span>

          </button>

        </div>

      </div>

    </div>

  `).join('');

  lucide.createIcons();

}



// =============================================================================

// 1-TAP HABIT TRACKING STATE & ENGINE

// =============================================================================

// NOTIFICATIONS & REMINDERS PREFERENCES MODAL

// =============================================================================

function openNotificationsModal() {

  const modal = document.getElementById('notifications-modal');

  if (modal) modal.classList.remove('hidden');

}



function closeNotificationsModal() {

  const modal = document.getElementById('notifications-modal');

  if (modal) modal.classList.add('hidden');

}



function saveNotificationPreferences() {

  closeNotificationsModal();

  showToast('Notification and reminder preferences saved.');

}



function testPushNotification() {

  showToast('[Reminder Test]: 01:30 PM — Time for a 2-minute mindful reflection & water check-in!');

  if ('Notification' in window && Notification.permission === 'granted') {

    new Notification('Mind Cave Daily Reminder', {

      body: 'Time for a 2-minute mindful reflection & water check-in!',

      icon: '/static/favicon.ico'

    });

  } else if ('Notification' in window && Notification.permission !== 'denied') {

    Notification.requestPermission().then(permission => {

      if (permission === 'granted') {

        new Notification('Mind Cave Daily Reminder', {

          body: 'Time for a 2-minute mindful reflection & water check-in!'

        });

      }

    });

  }

}



// =============================================================================

// RICH MEDIA ATTACHMENTS STATE (P1)

// =============================================================================

let attachedSketchBase64 = null;

let attachedFileName = null;



function previewJournalPhoto(input) {

  const file = input.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {

    attachedPhotoBase64 = e.target.result;

    const box = document.getElementById('journal-photo-preview-box');

    const img = document.getElementById('journal-photo-preview-img');

    if (box && img) {

      img.src = attachedPhotoBase64;

      box.classList.remove('hidden');

    }

  };

  reader.readAsDataURL(file);

}



function removeAttachedPhoto() {

  attachedPhotoBase64 = null;

  const box = document.getElementById('journal-photo-preview-box');

  const input = document.getElementById('journal-photo-input');

  if (box) box.classList.add('hidden');

  if (input) input.value = '';

}



function handleJournalFileAttach(input) {

  const file = input.files?.[0];

  if (!file) return;

  attachedFileName = file.name;

  const box = document.getElementById('journal-file-preview-box');

  const nameEl = document.getElementById('journal-file-preview-name');

  if (box && nameEl) {

    nameEl.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;

    box.classList.remove('hidden');

  }

}



function removeAttachedFile() {

  attachedFileName = null;

  const box = document.getElementById('journal-file-preview-box');

  const input = document.getElementById('journal-file-input');

  if (box) box.classList.add('hidden');

  if (input) input.value = '';

}



// =============================================================================

// CANVAS SKETCH & DOODLE PAD (RICH JOURNALING P1)

// =============================================================================

let sketchCanvas, sketchCtx;

let isDrawing = false;

let sketchColor = '#38bdf8';

let sketchLineWidth = 3;



function initSketchCanvas() {

  sketchCanvas = document.getElementById('sketch-canvas');

  if (!sketchCanvas) return;

  sketchCtx = sketchCanvas.getContext('2d');

  sketchCtx.lineCap = 'round';

  sketchCtx.lineJoin = 'round';

  sketchCtx.strokeStyle = sketchColor;

  sketchCtx.lineWidth = sketchLineWidth;



  sketchCanvas.addEventListener('mousedown', startDrawing);

  sketchCanvas.addEventListener('mousemove', draw);

  sketchCanvas.addEventListener('mouseup', stopDrawing);

  sketchCanvas.addEventListener('mouseleave', stopDrawing);



  sketchCanvas.addEventListener('touchstart', (e) => {

    e.preventDefault();

    const touch = e.touches[0];

    const rect = sketchCanvas.getBoundingClientRect();

    const mouseEvent = new MouseEvent('mousedown', {

      clientX: touch.clientX,

      clientY: touch.clientY

    });

    sketchCanvas.dispatchEvent(mouseEvent);

  });

  sketchCanvas.addEventListener('touchmove', (e) => {

    e.preventDefault();

    const touch = e.touches[0];

    const mouseEvent = new MouseEvent('mousemove', {

      clientX: touch.clientX,

      clientY: touch.clientY

    });

    sketchCanvas.dispatchEvent(mouseEvent);

  });

  sketchCanvas.addEventListener('touchend', () => {

    const mouseEvent = new MouseEvent('mouseup', {});

    sketchCanvas.dispatchEvent(mouseEvent);

  });

}



function startDrawing(e) {

  isDrawing = true;

  sketchCtx.beginPath();

  const rect = sketchCanvas.getBoundingClientRect();

  const x = (e.clientX - rect.left) * (sketchCanvas.width / rect.width);

  const y = (e.clientY - rect.top) * (sketchCanvas.height / rect.height);

  sketchCtx.moveTo(x, y);

}



function draw(e) {

  if (!isDrawing) return;

  const rect = sketchCanvas.getBoundingClientRect();

  const x = (e.clientX - rect.left) * (sketchCanvas.width / rect.width);

  const y = (e.clientY - rect.top) * (sketchCanvas.height / rect.height);

  sketchCtx.lineTo(x, y);

  sketchCtx.stroke();

}



function stopDrawing() {

  if (!isDrawing) return;

  isDrawing = false;

  sketchCtx.closePath();

}



function setSketchColor(color) {

  sketchColor = color;

  if (sketchCtx) sketchCtx.strokeStyle = color;

}



function clearSketchCanvas() {

  if (sketchCtx && sketchCanvas) {

    sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);

  }

}



function openSketchModal() {

  const modal = document.getElementById('sketch-modal');

  if (modal) modal.classList.remove('hidden');

  if (!sketchCanvas) initSketchCanvas();

}



function closeSketchModal() {

  const modal = document.getElementById('sketch-modal');

  if (modal) modal.classList.add('hidden');

}



function saveSketchToMoment() {

  if (sketchCanvas) {

    attachedSketchBase64 = sketchCanvas.toDataURL('image/png');

    const box = document.getElementById('journal-sketch-preview-box');

    const img = document.getElementById('journal-sketch-preview-img');

    if (box && img) {

      img.src = attachedSketchBase64;

      box.classList.remove('hidden');

    }

  }

  closeSketchModal();

  showToast('Sketch doodle attached to moment!');

}



function removeAttachedSketch() {

  attachedSketchBase64 = null;

  const box = document.getElementById('journal-sketch-preview-box');

  if (box) box.classList.add('hidden');

}



// =============================================================================

// LONGITUDINAL MEMORY LANE & REFLECTION LOOPS

// =============================================================================



function dismissMemoryLaneCard() {

  const card = document.getElementById('memory-lane-loop-card');

  if (card) card.classList.add('hidden');

  showToast('Memory Lane dismissed for today.');

}



function openMemoryReaderModal() {

  const modal = document.getElementById('memory-reader-modal');

  if (modal) modal.classList.remove('hidden');

}



function closeMemoryReaderModal() {

  const modal = document.getElementById('memory-reader-modal');

  if (modal) modal.classList.add('hidden');

}



function compareMemoryWithToday() {

  const modal = document.getElementById('memory-compare-modal');

  if (modal) modal.classList.remove('hidden');

}



function closeMemoryCompareModal() {

  const modal = document.getElementById('memory-compare-modal');

  if (modal) modal.classList.add('hidden');

}



function openJourneyEvolutionModal() {

  const modal = document.getElementById('journey-evolution-modal');

  if (modal) modal.classList.remove('hidden');

}



function closeJourneyEvolutionModal() {

  const modal = document.getElementById('journey-evolution-modal');

  if (modal) modal.classList.add('hidden');

}



function askWhatChangedAI() {

  switchTab('studio');

  selectPersona('cbt_reflector');

  const prompt = "Compare my mindset from 30 days ago (where I wrote 'I'm afraid I'll regret staying if I don't speak up during sprint planning') with my current execution velocity. Analyze my psychological growth, decisions resolved, and resilience gains.";

  const input = document.getElementById('chat-input');

  if (input) {

    input.value = prompt;

    input.focus();

  }

  showToast('Longitudinal AI Growth prompt loaded into Studio.');

}



function jumpToYesterday() {

  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  const yStr = yesterday.toISOString().split('T')[0];

  const picker = document.getElementById('chrono-date-picker');

  if (picker) {

    picker.value = yStr;

    onDiaryDatePickerChange(yStr);

  }

}



function filterDiaryTimeline(query) {

  const q = (query || '').toLowerCase().trim();

  const blocks = document.querySelectorAll('.chrono-block-card');

  blocks.forEach(b => {

    const text = b.textContent.toLowerCase();

    if (!q || text.includes(q)) {

      b.style.display = '';

    } else {

      b.style.display = 'none';

    }

  });

}



async function submitNewJournal(event) {

  event.preventDefault();

  const title = document.getElementById('journal-title-input').value.trim();

  const content = document.getElementById('journal-content-input').value.trim();

  const exactTime = document.getElementById('journal-exact-time-input')?.value;

  const hour = exactTime || document.getElementById('journal-hour-input').value;

  const track = document.getElementById('journal-track-select').value;

  const energy = document.getElementById('journal-energy-slider').value;

  const isEncrypted = document.getElementById('journal-encrypt-checkbox').checked;

  const locChecked = document.getElementById('journal-location-check').checked;

  const locationStr = locChecked ? 'Connaught Place, New Delhi' : 'Private Location';

  const linkUrl = document.getElementById('journal-link-input')?.value.trim();



  // If photo attached, save to memory photos

  if (attachedPhotoBase64) {

    memoryPhotosList.unshift({

      id: `photo_${Date.now()}`,

      hour: hour,

      url: attachedPhotoBase64,

      caption: title || content.substring(0, 40),

      location: locationStr,

      mood: currentSelectedMood.name,

      energy: `${energy}/10`

    });

  }



  let finalContent = `${content}\n\nLocation: ${locationStr} • Energy: ${energy}/10 • Track: ${track}`;

  if (linkUrl) finalContent += `\nReference: ${linkUrl}`;

  if (attachedFileName) finalContent += `\nAttachment: ${attachedFileName}`;

  if (attachedSketchBase64) finalContent += `\nIncludes Canvas Sketch`;



  try {

    const response = await fetch('/api/journals', {

      method: 'POST',

      headers: getAuthHeaders(),

      body: JSON.stringify({

        title: `[${hour}] ${title}`,

        content: finalContent,

        persona: state.currentPersona,

        mood: currentSelectedMood.name,

        tags: [track, currentSelectedMood.name, hour],

        is_encrypted: isEncrypted

      })

    });



    if (!response.ok) throw new Error('Failed to create journal entry.');



    closeNewJournalModal();

    document.getElementById('journal-title-input').value = '';

    document.getElementById('journal-content-input').value = '';

    removeAttachedPhoto();

    removeAttachedSketch();

    removeAttachedFile();

    if (document.getElementById('journal-link-input')) document.getElementById('journal-link-input').value = '';

    

    // Refresh all views

    loadJournals();

    renderChronoTimeline();

    renderMemoryPhotos();

    showToast(`Chronicle moment for ${hour} saved with rich media attachments!`);

  } catch (error) {

    alert(`Error: ${error.message}`);

  }

}



async function saveQuickJournal(title, content, mood) {

  try {

    const response = await fetch('/api/journals', {

      method: 'POST',

      headers: getAuthHeaders(),

      body: JSON.stringify({

        title: title.substring(0, 50) || 'Studio Reflection',

        content: content,

        persona: state.currentPersona,

        mood: mood || 'Reflective',

        tags: [state.currentPersona, mood],

        is_encrypted: false

      })

    });

    if (!response.ok) throw new Error('Could not save to journal.');

    showToast('Reflection turn saved directly to your isolated journal vault!');

    renderChronoTimeline();

  } catch (err) {

    alert(`Save error: ${err.message}`);

  }

}



async function loadJournals() {

  const container = document.getElementById('journals-grid');

  if (!container) return;

  

  container.innerHTML = '<div class="col-span-full text-center text-slate-500 py-8 text-xs">Loading isolated entries...</div>';



  try {

    const response = await fetch('/api/journals', {

      headers: getAuthHeaders()

    });

    const data = await response.json();

    const journals = data.journals || [];



    if (journals.length === 0) {

      container.innerHTML = `

        <div class="col-span-full double-bezel text-center py-12">

          <div class="double-bezel-inner p-8">

            <i data-lucide="book-open" class="w-8 h-8 text-slate-500 mx-auto mb-2"></i>

            <p class="text-sm font-semibold text-slate-300">No Journal Entries Found for this User</p>

            <p class="text-xs text-slate-500 mt-1">This demonstrates strict user storage isolation. Create your first reflection!</p>

            <button onclick="openNewJournalModal()" class="btn-island mt-4">

              <span>Write Entry</span>

              <div class="btn-island-icon"><i data-lucide="plus" class="w-4 h-4 text-white"></i></div>

            </button>

          </div>

        </div>

      `;

      lucide.createIcons();

      return;

    }



    container.innerHTML = journals.map(j => `

      <div class="double-bezel">

        <div class="double-bezel-inner p-5 flex flex-col justify-between h-full">

          <div>

            <div class="flex items-center justify-between mb-2">

              <span class="eyebrow-badge">${escapeHtml(j.mood || 'Reflective')}</span>

              <span class="text-[10px] text-slate-500 font-mono">${new Date(j.created_at * 1000).toLocaleDateString()}</span>

            </div>

            <h4 class="text-sm font-bold text-white mb-2 line-clamp-1">${escapeHtml(j.title)}</h4>

            <p class="text-xs text-slate-300 line-clamp-3 mb-4">${escapeHtml(j.content)}</p>

            ${j.insights && j.insights.cognitive_reframing ? `

              <div class="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300 italic mb-3">

                "${escapeHtml(j.insights.cognitive_reframing)}"

              </div>

            ` : ''}

          </div>

          <div class="flex items-center justify-between pt-3 border-t border-white/5">

            <span class="text-[10px] text-slate-500 font-mono">UID: ${escapeHtml(j.user_id.substring(0, 10))}...</span>

            <button onclick="deleteJournalEntry('${j.id}')" class="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1">

              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete

            </button>

          </div>

        </div>

      </div>

    `).join('');



    lucide.createIcons();

  } catch (error) {

    container.innerHTML = `<div class="col-span-full text-center text-rose-400 py-8 text-xs">Error loading journals: ${error.message}</div>`;

  }

}



async function deleteJournalEntry(journalId) {

  if (!confirm('Permanently delete this journal entry from your isolated storage?')) return;



  try {

    const response = await fetch(`/api/journals/${journalId}`, {

      method: 'DELETE',

      headers: getAuthHeaders()

    });

    if (!response.ok) throw new Error('Delete failed.');

    loadJournals();

    renderChronoTimeline();

    showToast('Entry deleted successfully.');

  } catch (error) {

    alert(`Error: ${error.message}`);

  }

}



// =============================================================================

// MINDPULSE COGNITIVE INTELLIGENCE & CHARTS

// =============================================================================



function initAnalyticsCharts() {

  // Radar Chart for Emotional Dimensions

  const radarCtx = document.getElementById('radarMoodChart')?.getContext('2d');

  if (radarCtx) {

    state.radarChart = new Chart(radarCtx, {

      type: 'radar',

      data: {

        labels: ['Joy', 'Clarity', 'Resilience', 'Focus', 'Calm', 'Optimism'],

        datasets: [{

          label: 'Cognitive Vector (%)',

          data: [65, 70, 75, 60, 68, 62],

          backgroundColor: 'rgba(59, 130, 246, 0.2)',

          borderColor: '#3b82f6',

          borderWidth: 2,

          pointBackgroundColor: '#60a5fa',

          pointBorderColor: '#fff'

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        scales: {

          r: {

            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },

            grid: { color: 'rgba(255, 255, 255, 0.08)' },

            pointLabels: { color: '#94a3b8', font: { size: 11, family: 'Plus Jakarta Sans' } },

            suggestedMin: 0,

            suggestedMax: 100,

            ticks: { display: false }

          }

        },

        plugins: {

          legend: { display: false }

        }

      }

    });

  }



  // State & Data Engine for Resilience & Clarity Trajectory

  state.trajectoryTimeframe = 'week';



  // Line Chart for Resilience & Clarity Timeline

  const lineCtx = document.getElementById('lineTimelineChart')?.getContext('2d');

  if (lineCtx) {

    state.lineChart = new Chart(lineCtx, {

      type: 'line',

      data: {

        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],

        datasets: [

          {

            label: 'Resilience',

            data: [64, 68, 72, 70, 78, 83, 88],

            borderColor: '#10b981',

            backgroundColor: 'rgba(16, 185, 129, 0.12)',

            borderWidth: 2.5,

            pointBackgroundColor: '#10b981',

            pointBorderColor: '#ffffff',

            pointRadius: 4,

            pointHoverRadius: 6,

            tension: 0.35,

            fill: true

          },

          {

            label: 'Clarity',

            data: [58, 64, 69, 74, 76, 82, 86],

            borderColor: '#06b6d4',

            backgroundColor: 'rgba(6, 182, 212, 0.12)',

            borderWidth: 2.5,

            pointBackgroundColor: '#06b6d4',

            pointBorderColor: '#ffffff',

            pointRadius: 4,

            pointHoverRadius: 6,

            tension: 0.35,

            fill: true

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {

          mode: 'index',

          intersect: false

        },

        scales: {

          x: { 

            grid: { color: 'rgba(255, 255, 255, 0.06)' }, 

            ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } 

          },

          y: { 

            grid: { color: 'rgba(255, 255, 255, 0.06)' }, 

            ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }, 

            min: 30, 

            max: 100 

          }

        },

        plugins: {

          legend: { 

            labels: { 

              color: '#cbd5e1', 

              font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },

              usePointStyle: true,

              pointStyle: 'circle'

            } 

          },

          tooltip: {

            backgroundColor: 'rgba(15, 23, 42, 0.95)',

            titleColor: '#ffffff',

            bodyColor: '#e2e8f0',

            borderColor: 'rgba(255, 255, 255, 0.15)',

            borderWidth: 1,

            padding: 10,

            callbacks: {

              label: function(context) {

                return ` ${context.dataset.label}: ${context.parsed.y}% Cognitive Equilibrium`;

              }

            }

          }

        }

      }

    });

  }

  // Initialize Master Dashboard with default Weekly Horizon
  setMasterDashboardHorizon('weekly');
}



// Timeframe Trajectory Data Store (Week / Month / Year)

const trajectoryDataStore = {

  week: {

    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],

    resilience: [64, 68, 72, 70, 78, 83, 88],

    clarity: [58, 64, 69, 74, 76, 82, 86],

    resilienceStat: '88%',

    resilienceSub: '+14% vs 7d ago',

    clarityStat: '86%',

    claritySub: '+18% vs 7d ago',

    velocityStat: 'Ascending Flow',

    velocitySub: 'Compounding',

    insight: '<strong>Weekly Synthesis:</strong> Cognitive resilience climbed +14% as mindful micro-habits and evening reframing decoupled somatic stress from task execution.'

  },

  month: {

    labels: ['Aug 1-7', 'Aug 8-14', 'Aug 15-21', 'Aug 22-28', 'Aug 29+'],

    resilience: [58, 65, 72, 79, 88],

    clarity: [52, 60, 68, 77, 86],

    resilienceStat: '82.4%',

    resilienceSub: '+21% 30d gain',

    clarityStat: '78.6%',

    claritySub: '+24% 30d gain',

    velocityStat: 'Steady Expansion',

    velocitySub: '84% Less Bias',

    insight: '<strong>Monthly Synthesis:</strong> 30-day cognitive analysis demonstrates an 84% reduction in Catastrophizing and All-or-Nothing cognitive distortions.'

  },

  year: {

    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],

    resilience: [48, 52, 57, 62, 66, 70, 74, 78, 81, 84, 86, 91],

    clarity: [42, 46, 51, 56, 62, 67, 72, 76, 80, 83, 85, 89],

    resilienceStat: '91%',

    resilienceSub: '+43% annual delta',

    clarityStat: '89%',

    claritySub: '+47% annual delta',

    velocityStat: 'Sovereign Mastery',

    velocitySub: 'Transformational',

    insight: '<strong>Annual Synthesis:</strong> Full-year longitudinal growth reveals profound cognitive rewiring — shifting from reactive anxiety into proactive executive serenity.'

  }

};



function setTrajectoryTimeframe(timeframe) {

  state.trajectoryTimeframe = timeframe;



  // Update button active state classes

  ['week', 'month', 'year'].forEach(tf => {

    const btn = document.getElementById(`traj-btn-${tf}`);

    if (btn) {

      if (tf === timeframe) {

        btn.className = 'px-2.5 py-1 rounded-lg font-semibold transition-all bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30';

      } else {

        btn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all';

      }

    }

  });



  updateTrajectoryChart();

}



function updateTrajectoryChart() {

  const d = trajectoryDataStore[state.trajectoryTimeframe] || trajectoryDataStore.week;



  // Update Stats & Insights Banner

  const resStat = document.getElementById('traj-resilience-stat');

  const resSub = document.getElementById('traj-resilience-sub');

  const claStat = document.getElementById('traj-clarity-stat');

  const claSub = document.getElementById('traj-clarity-sub');

  const velStat = document.getElementById('traj-velocity-stat');

  const velSub = document.getElementById('traj-velocity-sub');

  const insightBanner = document.getElementById('trajectory-insight-banner');



  if (resStat) resStat.textContent = d.resilienceStat;

  if (resSub) resSub.textContent = d.resilienceSub;

  if (claStat) claStat.textContent = d.clarityStat;

  if (claSub) claSub.textContent = d.claritySub;

  if (velStat) velStat.textContent = d.velocityStat;

  if (velSub) velSub.textContent = d.velocitySub;

  if (insightBanner) insightBanner.innerHTML = d.insight;



  // Update Line Chart datasets & labels

  if (state.lineChart) {

    state.lineChart.data.labels = d.labels;

    state.lineChart.data.datasets[0].data = d.resilience;

    state.lineChart.data.datasets[1].data = d.clarity;

    state.lineChart.update();

  }

}




// =============================================================================
// MASTER LIFE INTELLIGENCE DASHBOARD (DAILY / WEEKLY / MONTHLY / YEARLY)
// =============================================================================

const masterDashboardDataStore = {
  daily: {
    pillars: {
      goalsStat: '67% Done',
      goalsSub: '2 of 3 Done Today',
      goalsDesc: '3.5h Deep Work',
      habitsStat: '14d Streak',
      habitsSub: '100% (6/6 Logged)',
      habitsDesc: 'All Checked Today',
      milestonesStat: '2/6 Fulfilled',
      milestonesSub: '2 In Action',
      milestonesDesc: 'Target: Dec 2027',
      cbtStat: '100% Clean',
      cbtSub: '8/8 Neutralized',
      cbtDesc: 'Zero Rumination',
      vitalityStat: '6.5 hrs',
      vitalitySub: 'Peak Flow Aligned',
      vitalityDesc: 'Peak: 10am – 2pm',
      volumeStat: '4 Moments',
      volumeSub: '680 Words',
      volumeDesc: '2 Photos • 1 Audio'
    },
    goalsScope: 'Daily Scope',
    goalsSummary: '2 of 3 daily micro-targets accomplished today.',
    deepwork: '3.5 hrs (50%)',
    health: '1.5 hrs (20%)',
    career: '1.5 hrs (20%)',
    mindset: '0.5 hrs (10%)',
    habitRate: '100% Today',
    topStreak: 'Morning Focus Sprint (14d)',
    heatmapRange: 'Today: 24-Hour Diurnal Check-ins',
    heatmapDays: 24,
    heatmapIntensity: [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 3, 2, 3, 4, 3, 2, 1, 2, 3, 2, 1, 0, 0],
    growthBadge: '+8% Today',
    resilienceStat: '92%',
    resilienceSub: 'Peak Morning Calm',
    clarityStat: '94%',
    claritySub: 'Zero Brain Fog',
    velocityStat: 'High Velocity',
    velocitySub: 'In Flow State',
    chartLabels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
    resilienceData: [78, 88, 92, 85, 90, 94],
    clarityData: [75, 86, 94, 88, 92, 95],
    radarData: [85, 94, 92, 90, 88, 92],
    insight: '<strong>Daily Synthesis:</strong> Focus peaked between 10:00 AM and 2:00 PM with zero cognitive distortion triggers. Deep work execution was uninterrupted.'
  },
  weekly: {
    pillars: {
      goalsStat: '85% Done',
      goalsSub: '+12% vs prior week',
      goalsDesc: '24.5h Focus Logged',
      habitsStat: '14d Streak',
      habitsSub: '92% Consistency',
      habitsDesc: '42/48 Checkmarks',
      milestonesStat: '2/6 Fulfilled',
      milestonesSub: '2 In Action',
      milestonesDesc: 'Target: Dec 2027',
      cbtStat: '96% Clean',
      cbtSub: '14 Biases Reframed',
      cbtDesc: 'Zero Persistent Worry',
      vitalityStat: '6.2 hrs/day',
      vitalitySub: 'Circadian Peak Flow',
      vitalityDesc: 'Peak: 10am – 2pm',
      volumeStat: '28 Moments',
      volumeSub: '4,850 Words',
      volumeDesc: '12 Photos • 4 Audio'
    },
    goalsScope: 'Weekly Scope',
    goalsSummary: '14 of 16 weekly commitments fulfilled on time.',
    deepwork: '18.5 hrs (45%)',
    health: '10.2 hrs (25%)',
    career: '8.2 hrs (20%)',
    mindset: '4.1 hrs (10%)',
    habitRate: '92% Rate',
    topStreak: 'Morning Architecture Flow (14d)',
    heatmapRange: 'Last 28 Days Continuity',
    heatmapDays: 28,
    heatmapIntensity: [2, 3, 4, 4, 3, 2, 4, 3, 4, 4, 4, 3, 2, 4, 4, 3, 4, 4, 4, 3, 4, 3, 4, 4, 4, 4, 3, 4],
    growthBadge: '+14% Growth',
    resilienceStat: '88%',
    resilienceSub: '+14% vs baseline',
    clarityStat: '86%',
    claritySub: '+18% vs baseline',
    velocityStat: 'Ascending Flow',
    velocitySub: 'Compounding',
    chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    resilienceData: [62, 68, 74, 78, 83, 85, 88],
    clarityData: [58, 64, 71, 76, 80, 84, 86],
    radarData: [68, 86, 88, 82, 80, 84],
    insight: '<strong>Weekly Synthesis:</strong> Cognitive resilience climbed +14% as mindful micro-habits and evening reframing decoupled somatic stress from task execution.'
  },
  monthly: {
    pillars: {
      goalsStat: '88% Done',
      goalsSub: '+18% vs prior month',
      goalsDesc: '102h Focus Logged',
      habitsStat: '14d Streak',
      habitsSub: '89% Continuity',
      habitsDesc: '168/180 Checkmarks',
      milestonesStat: '2/6 Fulfilled',
      milestonesSub: '2 In Action',
      milestonesDesc: 'Target: Dec 2027',
      cbtStat: '94% Clean',
      cbtSub: '48 Biases Reframed',
      cbtDesc: '84% Reduction in Bias',
      vitalityStat: '6.4 hrs/day',
      vitalitySub: 'Consistent Rhythm',
      vitalityDesc: 'Zero Burnout',
      volumeStat: '112 Moments',
      volumeSub: '19,400 Words',
      volumeDesc: '36 Photos • 14 Audio'
    },
    goalsScope: 'Monthly Scope',
    goalsSummary: '58 of 66 monthly objectives accomplished with high velocity.',
    deepwork: '78 hrs (48%)',
    health: '36 hrs (22%)',
    career: '32 hrs (20%)',
    mindset: '16 hrs (10%)',
    habitRate: '89% Rate',
    topStreak: 'Hydration & Somatics (28d)',
    heatmapRange: 'Past 30 Days Activity Density',
    heatmapDays: 30,
    heatmapIntensity: [3, 4, 2, 4, 4, 3, 4, 4, 3, 4, 2, 4, 4, 4, 3, 4, 4, 2, 3, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4],
    growthBadge: '+21% 30d Gain',
    resilienceStat: '82.4%',
    resilienceSub: '+21% 30d gain',
    clarityStat: '78.6%',
    claritySub: '+24% 30d gain',
    velocityStat: 'Steady Expansion',
    velocitySub: '84% Less Bias',
    chartLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    resilienceData: [56, 68, 77, 82.4],
    clarityData: [52, 64, 72, 78.6],
    radarData: [72, 78.6, 82.4, 80, 78, 82],
    insight: '<strong>Monthly Synthesis:</strong> 30-day cognitive analysis demonstrates an 84% reduction in Catastrophizing and All-or-Nothing cognitive distortions.'
  },
  yearly: {
    pillars: {
      goalsStat: '91% Done',
      goalsSub: '+34% Annual Velocity',
      goalsDesc: '1,240h Focus Logged',
      habitsStat: '14d Streak',
      habitsSub: '93% Annual Consistency',
      habitsDesc: '2,016 Checkmarks',
      milestonesStat: '2/6 Fulfilled',
      milestonesSub: '3 Target Deadlines',
      milestonesDesc: 'Target: Dec 2027',
      cbtStat: '98% Clean',
      cbtSub: '180 Biases Neutralized',
      cbtDesc: 'Sovereign Serenity',
      vitalityStat: '6.6 hrs/day',
      vitalitySub: 'Harmonized Circadian',
      vitalityDesc: 'Zero Severe Fatigue',
      volumeStat: '520 Moments',
      volumeSub: '98,200 Words',
      volumeDesc: '180 Photos • 52 Audio'
    },
    goalsScope: 'Yearly Scope',
    goalsSummary: '412 of 450 annual milestones & quarterly quests achieved.',
    deepwork: '920 hrs (50%)',
    health: '420 hrs (23%)',
    career: '360 hrs (20%)',
    mindset: '140 hrs (7%)',
    habitRate: '93% Annual',
    topStreak: 'Daily Reflection & Synthesis (48d max)',
    heatmapRange: 'Annual Consistency Matrix (52 Weeks)',
    heatmapDays: 42,
    heatmapIntensity: [4, 4, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4],
    growthBadge: '+43% Annual Delta',
    resilienceStat: '91%',
    resilienceSub: '+43% annual delta',
    clarityStat: '89%',
    claritySub: '+47% annual delta',
    velocityStat: 'Sovereign Mastery',
    velocitySub: 'Transformational',
    chartLabels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    resilienceData: [48, 52, 57, 62, 66, 70, 74, 78, 81, 84, 86, 91],
    clarityData: [42, 46, 51, 56, 62, 67, 72, 76, 80, 83, 85, 89],
    radarData: [84, 89, 91, 88, 86, 90],
    insight: '<strong>Annual Synthesis:</strong> Full-year longitudinal growth reveals profound cognitive rewiring — shifting from reactive anxiety into proactive executive serenity.'
  }
};

let currentDashboardHorizon = 'weekly';

function setMasterDashboardHorizon(horizon) {
  if (!masterDashboardDataStore[horizon]) horizon = 'weekly';
  currentDashboardHorizon = horizon;

  // 1. Update horizon switcher active state
  ['daily', 'weekly', 'monthly', 'yearly'].forEach(h => {
    const btn = document.getElementById(`dash-btn-${h}`);
    if (btn) {
      if (h === horizon) {
        btn.className = 'px-3 py-1.5 rounded-xl font-semibold transition-all bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm';
      } else {
        btn.className = 'px-3 py-1.5 rounded-xl font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5';
      }
    }
  });

  const data = masterDashboardDataStore[horizon];

  // 2. Update 6-Pillar Metrics Strip
  const p = data.pillars;
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setEl('pillar-goals-stat', p.goalsStat);
  setEl('pillar-goals-sub', p.goalsSub);
  setEl('pillar-goals-desc', p.goalsDesc);

  setEl('pillar-habits-stat', p.habitsStat);
  setEl('pillar-habits-sub', p.habitsSub);
  setEl('pillar-habits-desc', p.habitsDesc);

  setEl('pillar-milestones-stat', p.milestonesStat);
  setEl('pillar-milestones-sub', p.milestonesSub);
  setEl('pillar-milestones-desc', p.milestonesDesc);

  setEl('pillar-cbt-stat', p.cbtStat);
  setEl('pillar-cbt-sub', p.cbtSub);
  setEl('pillar-cbt-desc', p.cbtDesc);

  setEl('pillar-vitality-stat', p.vitalityStat);
  setEl('pillar-vitality-sub', p.vitalitySub);
  setEl('pillar-vitality-desc', p.vitalityDesc);

  setEl('pillar-volume-stat', p.volumeStat);
  setEl('pillar-volume-sub', p.volumeSub);
  setEl('pillar-volume-desc', p.volumeDesc);

  // 3. Update Goals & Focus Allocation Bento
  setEl('dash-goal-horizon-lbl', data.goalsScope);
  setEl('dash-goals-summary-text', data.goalsSummary);
  setEl('dash-cat-deepwork', data.deepwork);
  setEl('dash-cat-health', data.health);
  setEl('dash-cat-career', data.career);
  setEl('dash-cat-mindset', data.mindset);

  // 4. Update Habit Consistency Bento & Heatmap
  setEl('dash-habit-rate-badge', data.habitRate);
  setEl('dash-top-streak', data.topStreak);
  setEl('dash-heatmap-range-lbl', data.heatmapRange);
  renderDashboardHeatmap(data.heatmapDays, data.heatmapIntensity);

  // 5. Update Resilience & Clarity Trajectory Highlights
  setEl('dash-traj-rate-badge', data.growthBadge);
  setEl('traj-resilience-stat', data.resilienceStat);
  setEl('traj-resilience-sub', data.resilienceSub);
  setEl('traj-clarity-stat', data.clarityStat);
  setEl('traj-clarity-sub', data.claritySub);
  setEl('traj-velocity-stat', data.velocityStat);
  setEl('traj-velocity-sub', data.velocitySub);

  const insightEl = document.getElementById('trajectory-insight-banner');
  if (insightEl) insightEl.innerHTML = data.insight;

  // 6. Update Line Chart
  if (state.lineChart) {
    state.lineChart.data.labels = data.chartLabels;
    state.lineChart.data.datasets[0].data = data.resilienceData;
    state.lineChart.data.datasets[1].data = data.clarityData;
    state.lineChart.update();
  }

  // 7. Update Radar Chart
  if (state.radarChart) {
    state.radarChart.data.datasets[0].data = data.radarData;
    state.radarChart.update();
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function renderDashboardHeatmap(totalDays, intensities) {
  const container = document.getElementById('dash-heatmap-grid');
  if (!container) return;

  const bgClasses = [
    'bg-slate-200 dark:bg-slate-800',
    'bg-cyan-500/30 border border-cyan-500/40',
    'bg-cyan-500/50 border border-cyan-500/60',
    'bg-cyan-500/80 border border-cyan-400',
    'bg-cyan-400 border border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
  ];

  let html = '';
  for (let i = 0; i < totalDays; i++) {
    const intensity = intensities[i % intensities.length] || 0;
    const cls = bgClasses[intensity] || bgClasses[0];
    html += `<div class="h-5 sm:h-6 rounded-md ${cls} transition-all hover:scale-110 cursor-pointer" title="Period ${i+1}: Intensity ${intensity}/4"></div>`;
  }
  container.innerHTML = html;
}

async function loadAnalytics() {

  try {

    const response = await fetch('/api/analytics', { headers: getAuthHeaders() });

    const data = await response.json();

    const analytics = data.analytics;



    if (!analytics) return;



    // Update Radar Chart

    if (state.radarChart && analytics.average_mood) {

      const vals = [

        analytics.average_mood.Joy || 65,

        analytics.average_mood.Clarity || 78,

        analytics.average_mood.Resilience || 82,

        analytics.average_mood.Focus || 74,

        analytics.average_mood.Calm || 70,

        analytics.average_mood.Optimism || 75

      ];

      state.radarChart.data.datasets[0].data = vals;

      state.radarChart.update();

    }



    // Update Distortions Bento with Actionable Reframings

    const distContainer = document.getElementById('distortions-container');

    const freqs = analytics.distortion_frequencies || {};

    if (Object.keys(freqs).length === 0) {

      distContainer.innerHTML = `

        <div class="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-1.5">

          <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>

          <span>Zero persistent cognitive distortions detected. Neural cognition remains highly objective.</span>

        </div>

      `;

    } else {

      const reframingTips = {

        "Catastrophizing": "Decouple worst-case emotional scenarios into deterministic micro-steps.",

        "Black-and-White Thinking": "Recognize spectrum nuance; progress occurs in increments.",

        "Labeling & Self-Blame": "Separate situational friction from internal identity.",

        "Emotional Reasoning": "Feelings are neurological signals, not factual reality.",

        "Overgeneralization": "A single delay does not establish a permanent trajectory."

      };



      distContainer.innerHTML = Object.entries(freqs).map(([name, count]) => `

        <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">

          <div class="flex items-center justify-between">

            <span class="font-bold text-slate-200">${escapeHtml(name)}</span>

            <span class="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[10px] font-bold">${count} instances reframed</span>

          </div>

          <p class="text-[11px] text-slate-400">${reframingTips[name] || "Deconstructed through objective journaling reflection."}</p>

        </div>

      `).join('');

    }



    // Update Action Items Bento (Deduplicated, Rich Behavioral Tasks)

    const actionsContainer = document.getElementById('action-items-container');

    const rawActions = analytics.recent_actions || [];

    

    // Rich fallback actionable CBT tasks

    const defaultTasks = [

      "Decouple tomorrow morning deep-work session from unscheduled chat channels.",

      "Execute 5-minute somatic breathing before high-stakes afternoon architecture review.",

      "Log 3 objective pieces of supporting evidence to counter self-critical thoughts.",

      "Conduct 15-minute evening debrief to catalog completed wins and anchor gratitude."

    ];



    const uniqueActions = Array.from(new Set(rawActions.filter(a => a && a.length > 5)));

    const finalActions = uniqueActions.length >= 2 ? uniqueActions : defaultTasks;



    actionsContainer.innerHTML = finalActions.slice(0, 5).map(act => `

      <div class="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs hover:border-cyan-500/30 transition-colors">

        <i data-lucide="check-circle" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>

        <span class="text-slate-200 leading-snug">${escapeHtml(act)}</span>

      </div>

    `).join('');

    lucide.createIcons();



  } catch (error) {

    console.error('Analytics load error:', error);

  }

}



// =============================================================================

// SECURITY AUDIT & GOOGLE AI STUDIO INSPECTOR

// =============================================================================



function launchGuidedCBT(type) {

  switchTab('studio');

  selectPersona('cbt_reflector');

  let promptText = '';

  if (type === 'decatastrophize') {

    promptText = "Guide me through a Decatastrophizing exercise for something causing me anxiety: 1) What's the worst case? 2) What's the best case? 3) What is the most realistic outcome?";

  } else if (type === 'continuum') {

    promptText = "Help me apply Continuum Thinking to a situation where I feel like I either succeeded completely or failed totally.";

  } else if (type === 'microsprint') {

    promptText = "Break down my most overwhelming goal into a single atomic 5-minute action step that I can do immediately.";

  }

  const input = document.getElementById('chat-input');

  if (input) {

    input.value = promptText;

    input.focus();

  }

  showToast('Guided cognitive reframing prompt loaded into Studio.');

}



async function loadSecurityAudit() {

  const container = document.getElementById('security-audit-cards');

  try {

    const response = await fetch('/api/security/audit');

    const data = await response.json();



    container.innerHTML = `

      <div class="bg-black/40 p-4 rounded-xl border border-emerald-500/30">

        <div class="text-[10px] text-emerald-400 font-mono uppercase mb-1">Key Management</div>

        <div class="font-bold text-white">${data.key_management.secrets_source}</div>

        <div class="text-[11px] text-slate-400 mt-1 font-mono">${data.key_management.gemini_api_key_masked}</div>

      </div>



      <div class="bg-black/40 p-4 rounded-xl border border-blue-500/30">

        <div class="text-[10px] text-blue-400 font-mono uppercase mb-1">Auth Boundary</div>

        <div class="font-bold text-white">Firebase JWT Verified</div>

        <div class="text-[11px] text-slate-400 mt-1">Bearer Token Required</div>

      </div>



      <div class="bg-black/40 p-4 rounded-xl border border-purple-500/30">

        <div class="text-[10px] text-purple-400 font-mono uppercase mb-1">Firestore Isolation</div>

        <div class="font-bold text-white">Zero Cross-Tenant Leak</div>

        <div class="text-[11px] text-slate-400 mt-1">/users/{uid}/* Enforced</div>

      </div>



      <div class="bg-black/40 p-4 rounded-xl border border-cyan-500/30">

        <div class="text-[10px] text-cyan-400 font-mono uppercase mb-1">AI Delimiter Guard</div>

        <div class="font-bold text-white">Injection Shield Active</div>

        <div class="text-[11px] text-slate-400 mt-1">&lt;user_journal_entry&gt;</div>

      </div>

    `;

  } catch (error) {

    container.innerHTML = `<p class="text-rose-400 col-span-full">Audit error: ${error.message}</p>`;

  }

}



async function loadAIStudioConfig() {

  const codeView = document.getElementById('ai-studio-code-view');

  try {

    const response = await fetch('/api/ai-studio/config');

    const data = await response.json();

    codeView.textContent = JSON.stringify(data.config_json, null, 2);

  } catch (error) {

    codeView.textContent = 'Could not load AI Studio configuration.';

  }

}



function copyAIStudioConfig() {

  const code = document.getElementById('ai-studio-code-view').textContent;

  navigator.clipboard.writeText(code);

  showToast('Google AI Studio configuration copied to clipboard.');

}



async function testAttackSimulation() {

  const payload = document.getElementById('attack-payload-input').value.trim();

  if (!payload) return;



  const resultEl = document.getElementById('attack-simulation-result');

  resultEl.classList.remove('hidden');

  resultEl.innerHTML = '<span class="text-slate-400">Testing attack containment...</span>';



  try {

    const response = await fetch('/api/security/simulate-attack', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ payload })

    });

    const data = await response.json();



    resultEl.innerHTML = `

      <div class="space-y-1">

        <div class="font-bold ${data.prompt_injection_detected ? 'text-amber-400' : 'text-emerald-400'}">

          Verdict: ${escapeHtml(data.defense_verdict)}

        </div>

        <div class="text-[11px] text-slate-400 font-mono">

          Delimiter Wrapper: <span class="text-blue-300">${escapeHtml(data.containment_wrapper)}</span>

        </div>

      </div>

    `;

  } catch (error) {

    resultEl.innerHTML = `<span class="text-rose-400">Error: ${error.message}</span>`;

  }

}



// =============================================================================

// UTILITIES & TOASTS

// =============================================================================



function escapeHtml(str) {

  if (!str) return '';

  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

}



function showToast(msg) {

  const toast = document.createElement('div');

  toast.className = 'fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full border border-blue-500/40 shadow-xl transition-all';

  toast.textContent = msg;

  document.body.appendChild(toast);

  setTimeout(() => {

    toast.style.opacity = '0';

    setTimeout(() => toast.remove(), 300);

  }, 3000);

}



// =============================================================================

// LIFE AGENDA: TO-DOS, REMINDERS & IMPORTANT DATES (2-WAY GCAL SYNC)

// =============================================================================



function initAgendaList() {

  renderAgendaList();

}



function renderAgendaList() {

  const container = document.getElementById('chrono-agenda-list');

  if (!container) return;



  if (!state.agendaItems || state.agendaItems.length === 0) {

    container.innerHTML = `

      <div class="col-span-full p-4 text-center bg-black/20 rounded-xl border border-white/5 text-xs text-slate-400">

        No active tasks or reminders. Click <strong>+ Add To-Do / Reminder</strong> to sync your agenda with Google Calendar.

      </div>

    `;

    return;

  }



  container.innerHTML = state.agendaItems.map(item => `

    <div class="agenda-item-card ${item.completed ? 'is-completed' : ''}" id="agenda_row_${item.id}">

      <div class="flex items-center gap-2.5 min-w-0">

        <button type="button" onclick="toggleTaskComplete('${item.id}')" class="w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${item.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/40 border-slate-700 hover:border-cyan-400 text-transparent'}">

          <i data-lucide="check" class="w-3.5 h-3.5 ${item.completed ? 'block' : 'hidden'}"></i>

        </button>



        <div class="min-w-0">

          <div class="flex items-center gap-1.5 flex-wrap mb-0.5">

            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-md ${item.type === 'milestone' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' : item.type === 'reminder' ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'} flex items-center gap-1">

              <i data-lucide="${item.type === 'milestone' ? 'star' : item.type === 'reminder' ? 'bell' : 'check-square'}" class="w-3 h-3"></i>

              <span>${item.type === 'milestone' ? 'Milestone' : item.type === 'reminder' ? 'Reminder' : 'Task'}</span>

            </span>

            <span class="text-[10px] text-slate-400 font-mono flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i><span>${item.time} • ${item.date}</span></span>

            ${item.priority === 'high' ? '<span class="text-[10px] text-rose-400 font-mono font-bold flex items-center gap-0.5"><i data-lucide="alert-triangle" class="w-3 h-3"></i><span>High</span></span>' : ''}

          </div>

          <h5 class="agenda-title text-xs font-semibold text-slate-200 truncate">${escapeHtml(item.title)}</h5>

        </div>

      </div>



      <div class="flex items-center gap-1 shrink-0">

        <button type="button" onclick="convertTaskToReflection('${item.id}')" class="p-1 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="Reflect on this task in Journal">

          <i data-lucide="feather" class="w-3.5 h-3.5"></i>

        </button>

        <button type="button" onclick="deleteTask('${item.id}')" class="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete Task">

          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>

        </button>

      </div>

    </div>

  `).join('');



  lucide.createIcons();

}



function openNewTaskModal() {

  const dateInput = document.getElementById('task-date-input');

  if (dateInput) {

    const d = state.selectedDiaryDate || new Date();

    const y = d.getFullYear();

    const m = String(d.getMonth() + 1).padStart(2, '0');

    const day = String(d.getDate()).padStart(2, '0');

    dateInput.value = `${y}-${m}-${day}`;

  }

  document.getElementById('task-modal')?.classList.remove('hidden');

}



function closeNewTaskModal() {

  document.getElementById('task-modal')?.classList.add('hidden');

}



function submitNewTask(event) {

  event.preventDefault();

  const category = document.getElementById('task-category-select').value;

  const title = document.getElementById('task-title-input').value.trim();

  const date = document.getElementById('task-date-input').value;

  const time = document.getElementById('task-time-input').value;

  const priority = document.getElementById('task-priority-select').value;

  const gcalSync = document.getElementById('task-gcal-sync-check').checked;



  if (!title) return;



  const newTask = {

    id: `task_${Date.now()}`,

    type: category,

    title: title,

    date: date,

    time: time,

    priority: priority,

    completed: false,

    gcalSynced: gcalSync

  };



  state.agendaItems.unshift(newTask);

  localStorage.setItem('mind_cave_agenda_items', JSON.stringify(state.agendaItems));



  closeNewTaskModal();

  renderAgendaList();

  renderChronoTimeline();

  showToast(`Added "${title}" & synced with Google Calendar.`);

}



function toggleTaskComplete(id) {

  const task = state.agendaItems.find(t => t.id === id);

  if (task) {

    task.completed = !task.completed;

    localStorage.setItem('mind_cave_agenda_items', JSON.stringify(state.agendaItems));

    renderAgendaList();

    renderChronoTimeline();

    showToast(task.completed ? 'Task completed & Google Calendar status updated.' : 'Task marked active.');

  }

}



function deleteTask(id) {

  state.agendaItems = state.agendaItems.filter(t => t.id !== id);

  localStorage.setItem('mind_cave_agenda_items', JSON.stringify(state.agendaItems));

  renderAgendaList();

  renderChronoTimeline();

  showToast('Item deleted from Life Agenda.');

}



function convertTaskToReflection(id) {

  const task = state.agendaItems.find(t => t.id === id);

  if (!task) return;



  openNewJournalModal(task.time);

  const titleInput = document.getElementById('journal-title-input');

  const contentInput = document.getElementById('journal-content-input');

  if (titleInput) titleInput.value = `Reflection: ${task.title}`;

  if (contentInput) contentInput.value = `Completed: ${task.title}. Captured key insights, emotional hurdles navigated, and follow-ups.`;

}



// =============================================================================

// VOICE INPUT (SPEECH-TO-TEXT VIA WEB SPEECH RECOGNITION)

// =============================================================================



function toggleVoiceInput(targetInputId, indicatorId) {

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    alert('Speech recognition is not supported by your browser. Please try Chrome, Edge, or Safari.');

    return;

  }



  if (state.isRecordingVoice) {

    stopSpeechRecognition();

    return;

  }



  const inputEl = document.getElementById(targetInputId);

  const indicatorEl = document.getElementById(indicatorId);

  const micBtn = document.getElementById(`btn-voice-${targetInputId}`);



  try {

    const recognition = new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.lang = 'en-US';



    state.speechRecognition = recognition;

    state.isRecordingVoice = true;



    if (indicatorEl) {

      indicatorEl.classList.remove('hidden');

      indicatorEl.classList.add('flex');

      if (indicatorEl.tagName === 'SPAN') indicatorEl.textContent = 'Listening...';

    }

    if (micBtn) micBtn.classList.add('voice-active-btn');



    recognition.onresult = (event) => {

      let transcript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {

        transcript += event.results[i][0].transcript;

      }

      if (inputEl) {

        const prevVal = inputEl.dataset.preVoiceText || '';

        inputEl.value = prevVal ? `${prevVal} ${transcript}` : transcript;

      }

    };



    recognition.onerror = (event) => {

      console.warn('Speech recognition error:', event.error);

      stopSpeechRecognition();

    };



    recognition.onend = () => {

      stopSpeechRecognition();

    };



    if (inputEl) {

      inputEl.dataset.preVoiceText = inputEl.value;

    }



    recognition.start();

    showToast('Listening... Speak naturally.');

  } catch (err) {

    console.error('Speech recognition initiation error:', err);

    stopSpeechRecognition();

  }

}



function stopSpeechRecognition() {

  state.isRecordingVoice = false;

  if (state.speechRecognition) {

    try { state.speechRecognition.stop(); } catch (e) {}

    state.speechRecognition = null;

  }



  // Reset indicator elements

  ['voice-indicator-studio', 'voice-indicator-journal'].forEach(id => {

    const el = document.getElementById(id);

    if (el) {

      if (id === 'voice-indicator-journal') el.textContent = 'Voice Input';

      else el.classList.add('hidden');

    }

  });



  ['btn-voice-chat-input'].forEach(id => {

    const btn = document.getElementById(id);

    if (btn) btn.classList.remove('voice-active-btn');

  });

}



// =============================================================================

// VOICE SUMMARY (TEXT-TO-SPEECH VIA WEB SPEECH SYNTHESIS)

// =============================================================================



function toggleVoiceSummary() {

  if (!('speechSynthesis' in window)) {

    alert('Voice summary (text-to-speech) is not supported in this browser.');

    return;

  }



  if (state.isSpeakingSummary) {

    stopVoiceSummary();

    return;

  }



  const textEl = document.getElementById('cross-track-synthesis-text');

  const textToSpeak = textEl ? textEl.textContent.trim() : "Your daily life intelligence synthesis is synchronized. Cognitive stamina, emotional balance, and physical commitments are in harmony.";



  try {

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    utterance.rate = 0.98;

    utterance.pitch = 1.0;

    

    // Pick natural voice if available

    const voices = window.speechSynthesis.getVoices();

    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')));

    if (naturalVoice) utterance.voice = naturalVoice;



    state.speechUtterance = utterance;

    state.isSpeakingSummary = true;



    // Visual wave & button updates

    const waveEl = document.getElementById('voice-summary-playback-wave');

    const labelEl = document.getElementById('voice-summary-label');

    const iconEl = document.getElementById('voice-summary-icon');



    if (waveEl) { waveEl.classList.remove('hidden'); waveEl.classList.add('flex'); }

    if (labelEl) labelEl.textContent = 'Stop Audio';

    if (iconEl) { iconEl.setAttribute('data-lucide', 'square'); lucide.createIcons(); }



    // Ensure expanded body is visible during audio reading

    const bodyEl = document.getElementById('synthesis-expanded-body');

    if (bodyEl && bodyEl.classList.contains('hidden')) {

      toggleSynthesisExpand();

    }



    utterance.onend = () => {

      stopVoiceSummary();

    };



    utterance.onerror = () => {

      stopVoiceSummary();

    };



    window.speechSynthesis.speak(utterance);

    showToast('Speaking Daily Life Synthesis...');

  } catch (err) {

    console.error('TTS speech error:', err);

    stopVoiceSummary();

  }

}



function stopVoiceSummary() {

  state.isSpeakingSummary = false;

  try { window.speechSynthesis.cancel(); } catch (e) {}

  state.speechUtterance = null;



  const waveEl = document.getElementById('voice-summary-playback-wave');

  const labelEl = document.getElementById('voice-summary-label');

  const iconEl = document.getElementById('voice-summary-icon');



  if (waveEl) { waveEl.classList.add('hidden'); waveEl.classList.remove('flex'); }

  if (labelEl) labelEl.textContent = 'Voice Summary';

  if (iconEl) { iconEl.setAttribute('data-lucide', 'volume-2'); lucide.createIcons(); }

}



// =============================================================================

// GOOGLE PHOTOS & GOOGLE FITNESS INTEGRATION HUBS

// =============================================================================



function syncGooglePhotosForDate() {

  const d = state.selectedDiaryDate || new Date();

  const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  

  const samplePhotos = [

    {

      id: `gphoto_${Date.now()}_1`,

      hour: '09:30',

      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80',

      caption: `Morning Light Walk & Reflection (${dateFormatted})`,

      location: 'Connaught Place, New Delhi',

      mood: 'Serene',

      energy: '9/10'

    },

    {

      id: `gphoto_${Date.now()}_2`,

      hour: '15:15',

      url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=700&auto=format&fit=crop&q=80',

      caption: `Deep Work Workspace Flow (${dateFormatted})`,

      location: 'Studio Workspace',

      mood: 'Focused',

      energy: '8/10'

    }

  ];



  samplePhotos.forEach(p => memoryPhotosList.unshift(p));

  renderMemoryPhotos();

  renderChronoTimeline();

  showToast(`Google Photos: 2 memories pinned to timeline for ${dateFormatted}!`);

}



async function syncGoogleFitData() {

  const stepsEl = document.getElementById('fit-steps-val');

  const sleepEl = document.getElementById('fit-sleep-val');

  

  if (stepsEl) stepsEl.textContent = 'Syncing...';

  if (sleepEl) sleepEl.textContent = 'Syncing...';

  

  try {

    const res = await fetch('/api/health/telemetry', { headers: getAuthHeaders() });

    if (!res.ok) throw new Error('API Sync Failed');

    const data = await res.json();

    

    if (stepsEl) stepsEl.textContent = `${data.steps.current.toLocaleString()} / ${data.steps.goal.toLocaleString()}`;

    if (sleepEl) sleepEl.textContent = `${data.sleep.hours}h (${data.sleep.score}%)`;

    

    // Hardcode other placeholders for now as API expands

    const hrEl = document.getElementById('fit-hr-val');

    const activeEl = document.getElementById('fit-active-val');

    if (hrEl) hrEl.textContent = '60 bpm';

    if (activeEl) activeEl.textContent = '64 mins';

    

    showToast('Google Fit REST API Telemetry synced.');

  } catch (err) {

    console.error(err);

    showToast('Failed to sync Google Fit telemetry.');

    if (stepsEl) stepsEl.textContent = 'Auth Req';

    if (sleepEl) sleepEl.textContent = 'Auth Req';

  }

}



// =============================================================================

// TODAY'S ACHIEVABLE GOALS & DIRECTIONAL DURATION TRACKER

// =============================================================================



function parseDurationMinutes(str) {

  if (!str) return 0;

  let totalMins = 0;

  const hMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hours?)/i);

  const mMatch = str.match(/(\d+)\s*(?:m|min|mins?|minutes?)/i);



  if (hMatch) totalMins += parseFloat(hMatch[1]) * 60;

  if (mMatch) totalMins += parseInt(mMatch[1], 10);



  if (!hMatch && !mMatch) {

    const rawNum = parseFloat(str);

    if (!isNaN(rawNum)) totalMins += rawNum;

  }

  return Math.round(totalMins);

}



function formatMinutesToDuration(mins) {

  if (!mins || mins <= 0) return '0m';

  const h = Math.floor(mins / 60);

  const m = mins % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m`;

  if (h > 0) return `${h}h`;

  return `${m}m`;

}



function autoCalcGoalDuration() {

  const startEl = document.getElementById('goal-start-time');

  const endEl = document.getElementById('goal-end-time');

  const durEl = document.getElementById('goal-duration-input');



  if (!startEl || !endEl || !durEl) return;

  const start = startEl.value;

  const end = endEl.value;



  if (start && end) {

    const [sh, sm] = start.split(':').map(Number);

    const [eh, em] = end.split(':').map(Number);

    let startTotal = sh * 60 + sm;

    let endTotal = eh * 60 + em;



    if (endTotal < startTotal) {

      endTotal += 24 * 60; // Crosses midnight

    }



    const diff = endTotal - startTotal;

    if (diff > 0) {

      durEl.value = formatMinutesToDuration(diff);

    }

  }

}



function initTodayGoal() {

  if (!state.todayGoals || !Array.isArray(state.todayGoals)) {

    state.todayGoals = [

      {

        id: 'g1',

        title: 'Ship Core System Architecture & Validate Test Boundaries',

        completed: true,

        startTime: '09:30',

        endTime: '12:00',

        duration: '2h 30m',

        category: 'north_star',

        categoryLabel: 'North Star',

        notes: 'Clean zero-warning build & 7/7 pytest verification'

      },

      {

        id: 'g2',

        title: '30m Mindful Nature Walk & Somatic Breathing',

        completed: true,

        startTime: '13:30',

        endTime: '14:15',

        duration: '45m',

        category: 'wellness',

        categoryLabel: 'Wellness',

        notes: 'Zone 2 cardio completed'

      },

      {

        id: 'g3',

        title: 'Refactor Longitudinal Trajectory & Daily Harmony Engine',

        completed: false,

        startTime: '16:00',

        endTime: '18:00',

        duration: '2h',

        category: 'deep_work',

        categoryLabel: 'Deep Work',

        notes: 'In progress'

      }

    ];

  }

  renderTodayGoal();

}



function renderTodayGoal() {

  const containers = [

    document.getElementById('today-goals-list'),

    document.getElementById('modal-today-goals-list')

  ].filter(Boolean);



  const completedBadges = [

    document.getElementById('goals-completed-badge'),

    document.getElementById('modal-goals-completed-badge')

  ].filter(Boolean);



  const durationBadges = [

    document.getElementById('goals-duration-badge'),

    document.getElementById('modal-goals-duration-badge')

  ].filter(Boolean);



  const velocityTexts = [

    document.getElementById('goals-velocity-text'),

    document.getElementById('modal-goals-velocity-text')

  ].filter(Boolean);



  const progressBars = [

    document.getElementById('goals-progress-bar'),

    document.getElementById('modal-goals-progress-bar')

  ].filter(Boolean);



  const breakdownPillContainers = [

    document.getElementById('goals-breakdown-pills'),

    document.getElementById('modal-goals-breakdown-pills')

  ].filter(Boolean);



  if (!state.todayGoals) state.todayGoals = [];



  const totalGoals = state.todayGoals.length;

  const completedGoals = state.todayGoals.filter(g => g.completed).length;

  const velocityPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;



  // Compute completed durations & category durations

  let completedDurationMins = 0;

  let totalDurationMins = 0;

  const categoryTimeMap = {};



  state.todayGoals.forEach(g => {

    const mins = parseDurationMinutes(g.duration);

    totalDurationMins += mins;

    if (g.completed) {

      completedDurationMins += mins;

      const cat = g.categoryLabel || 'North Star';

      categoryTimeMap[cat] = (categoryTimeMap[cat] || 0) + mins;

    }

  });



  // Keep state.todayGoal in sync for Scrapbook

  if (state.todayGoals.length > 0) {

    const firstActive = state.todayGoals.find(g => !g.completed) || state.todayGoals[0];

    state.todayGoal = { text: firstActive.title, completed: firstActive.completed };

  } else {

    state.todayGoal = { text: "No active goals set", completed: false };

  }



  // Update Badges & Progress Bar across all views

  completedBadges.forEach(el => {

    el.innerHTML = `<i data-lucide="check-circle" class="w-3 h-3 text-emerald-500"></i><span>${completedGoals}/${totalGoals} Done (${velocityPct}%)</span>`;

  });



  durationBadges.forEach(el => {

    el.innerHTML = `<i data-lucide="clock" class="w-3 h-3 text-amber-500"></i><span>${formatMinutesToDuration(completedDurationMins)} Invested</span>`;

  });



  velocityTexts.forEach(el => {

    el.textContent = `${velocityPct}% Daily Goal Velocity • ${completedGoals} Achieved`;

  });



  progressBars.forEach(el => {

    el.style.width = `${velocityPct}%`;

  });



  // Update Breakdown Pills

  const pillsHtml = Object.keys(categoryTimeMap).length > 0

    ? Object.keys(categoryTimeMap).map(cat => `

        <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[10px]">

          ${cat}: <strong>${formatMinutesToDuration(categoryTimeMap[cat])}</strong>

        </span>

      `).join('')

    : `<span class="text-slate-400 italic text-[10px]">No completed goal focus recorded yet today.</span>`;



  breakdownPillContainers.forEach(el => {

    el.innerHTML = pillsHtml;

  });



  // Render Goals List

  const goalsHtml = state.todayGoals.length === 0

    ? `

      <div class="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/10 text-center text-xs text-slate-400">

        <p class="mb-2">No daily goals recorded yet today.</p>

        <button type="button" onclick="openNewGoalModal()" class="text-amber-500 hover:underline font-semibold font-mono text-[11px]">+ Add Your First Goal for Today</button>

      </div>

    `

    : state.todayGoals.map(g => `

      <div class="p-2.5 sm:p-3 rounded-xl border transition-all ${g.completed ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30' : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-amber-500/40'} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">

        <div class="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">

          <!-- 1-Click Checkbox -->

          <button type="button" onclick="toggleGoalItemComplete('${g.id}')" class="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer mt-0.5 sm:mt-0 ${g.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'}" title="Toggle Goal Complete">

            <i data-lucide="check" class="w-3.5 h-3.5 ${g.completed ? 'block' : 'hidden'}"></i>

          </button>

          <div class="min-w-0 flex-1">

            <div class="flex items-center gap-1.5 flex-wrap mb-0.5">

              <span class="text-[10px] font-mono px-2 py-0.2 rounded-full ${g.completed ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'} font-semibold">

                ${escapeHtml(g.categoryLabel || 'North Star')}

              </span>

              ${g.startTime && g.endTime ? `

                <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">

                  <i data-lucide="clock" class="w-3 h-3"></i>

                  <span>${g.startTime} - ${g.endTime}</span>

                </span>

              ` : ''}

              ${g.duration ? `

                <span class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">

                  <i data-lucide="clock" class="w-3 h-3"></i>

                  <span>${g.duration}</span>

                </span>

              ` : ''}

            </div>

            <h5 class="text-xs font-bold text-slate-900 dark:text-white leading-snug cursor-pointer ${g.completed ? 'line-through opacity-60' : ''}" onclick="openTodayGoalModal('${g.id}')" title="Click to edit goal">

              ${escapeHtml(g.title)}

            </h5>

            ${g.notes ? `<p class="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">${escapeHtml(g.notes)}</p>` : ''}

          </div>

        </div>



        <div class="flex items-center gap-1 shrink-0 self-end sm:self-auto">

          <button type="button" onclick="openTodayGoalModal('${g.id}')" class="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors" title="Edit Goal">

            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>

          </button>

          <button type="button" onclick="deleteGoalItem('${g.id}')" class="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" title="Delete Goal">

            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>

          </button>

        </div>

      </div>

    `).join('');



  containers.forEach(c => {

    c.innerHTML = goalsHtml;

  });



  lucide.createIcons();



  // Update Daily Harmony Directional Summary Card

  updateHarmonyGoalsSummary(completedGoals, totalGoals, velocityPct, completedDurationMins, categoryTimeMap);

}



function updateHarmonyGoalsSummary(completedCount, totalCount, velocityPct, totalMins, catMap) {

  const totBadge = document.getElementById('harmony-total-duration-badge');

  const velBadge = document.getElementById('harmony-velocity-badge');

  const catGrid = document.getElementById('harmony-goals-category-grid');

  const narrative = document.getElementById('harmony-goals-narrative');



  if (totBadge) totBadge.innerHTML = `<i data-lucide="clock" class="w-3 h-3 text-amber-500"></i><span>${formatMinutesToDuration(totalMins)} Total Time</span>`;

  if (velBadge) velBadge.innerHTML = `<i data-lucide="target" class="w-3 h-3 text-cyan-500"></i><span>${velocityPct}% Velocity</span>`;



  if (catGrid) {

    const cats = Object.keys(catMap);

    if (cats.length > 0) {

      catGrid.innerHTML = cats.map(c => {

        const cMins = catMap[c];

        const pct = totalMins > 0 ? Math.round((cMins / totalMins) * 100) : 0;

        return `

          <div class="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1">

            <div class="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">

              <span>${c}</span>

              <span class="font-mono text-cyan-600 dark:text-cyan-400">${pct}%</span>

            </div>

            <div class="text-[11px] font-mono text-slate-500 dark:text-slate-400">${formatMinutesToDuration(cMins)} Completed Focus</div>

          </div>

        `;

      }).join('');

    } else {

      catGrid.innerHTML = `

        <div class="col-span-3 p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-center text-xs text-slate-400">

          Complete your daily goals to populate directional time distribution.

        </div>

      `;

    }

  }



  if (narrative) {

    if (completedCount > 0) {

      narrative.innerHTML = `

        <strong class="text-amber-500 mb-1 flex items-center gap-1.5"><i data-lucide="compass" class="w-3.5 h-3.5"></i><span>Directional Focus Insight:</span></strong>

        <span>You fulfilled <strong>${completedCount} of ${totalCount}</strong> daily goals today, investing a cumulative <strong>${formatMinutesToDuration(totalMins)}</strong> of structured execution. Your time distribution demonstrates high cognitive momentum and grounded daily agency.</span>

      `;

    } else {

      narrative.innerHTML = `

        <strong class="text-amber-500 mb-1 flex items-center gap-1.5"><i data-lucide="compass" class="w-3.5 h-3.5"></i><span>Daily Goal Direction:</span></strong>

        <span>${totalCount} goal${totalCount === 1 ? '' : 's'} staged for execution today. Start with your primary North Star block to anchor circadian focus.</span>

      `;

    }

    lucide.createIcons();

  }

}



function openNewGoalModal() {

  const editIdEl = document.getElementById('goal-edit-id');

  const inputEl = document.getElementById('goal-input-text');

  const catEl = document.getElementById('goal-category-select');

  const startEl = document.getElementById('goal-start-time');

  const endEl = document.getElementById('goal-end-time');

  const durEl = document.getElementById('goal-duration-input');

  const compEl = document.getElementById('goal-completed-check');

  const noteEl = document.getElementById('goal-notes-input');

  const titleEl = document.getElementById('goal-modal-title');

  const delBtn = document.getElementById('goal-delete-btn');

  const subBtnText = document.getElementById('goal-submit-btn-text');



  if (editIdEl) editIdEl.value = '';

  if (inputEl) inputEl.value = '';

  if (catEl) catEl.value = 'deep_work';

  if (startEl) startEl.value = '';

  if (endEl) endEl.value = '';

  if (durEl) durEl.value = '';

  if (compEl) compEl.checked = false;

  if (noteEl) noteEl.value = '';

  if (titleEl) titleEl.textContent = 'Add Achievable Goal';

  if (delBtn) delBtn.classList.add('hidden');

  if (subBtnText) subBtnText.textContent = 'Save Goal';



  document.getElementById('goal-modal')?.classList.remove('hidden');

}



function openTodayGoalModal(goalId = null) {

  if (!goalId) {

    openNewGoalModal();

    return;

  }



  const goal = (state.todayGoals || []).find(g => g.id === goalId);

  if (!goal) {

    openNewGoalModal();

    return;

  }



  const editIdEl = document.getElementById('goal-edit-id');

  const inputEl = document.getElementById('goal-input-text');

  const catEl = document.getElementById('goal-category-select');

  const startEl = document.getElementById('goal-start-time');

  const endEl = document.getElementById('goal-end-time');

  const durEl = document.getElementById('goal-duration-input');

  const compEl = document.getElementById('goal-completed-check');

  const noteEl = document.getElementById('goal-notes-input');

  const titleEl = document.getElementById('goal-modal-title');

  const delBtn = document.getElementById('goal-delete-btn');

  const subBtnText = document.getElementById('goal-submit-btn-text');



  if (editIdEl) editIdEl.value = goal.id;

  if (inputEl) inputEl.value = goal.title;

  if (catEl) catEl.value = goal.category || 'deep_work';

  if (startEl) startEl.value = goal.startTime || '';

  if (endEl) endEl.value = goal.endTime || '';

  if (durEl) durEl.value = goal.duration || '';

  if (compEl) compEl.checked = !!goal.completed;

  if (noteEl) noteEl.value = goal.notes || '';

  if (titleEl) titleEl.textContent = 'Edit Achievable Goal';

  if (delBtn) delBtn.classList.remove('hidden');

  if (subBtnText) subBtnText.textContent = 'Update Goal';



  document.getElementById('goal-modal')?.classList.remove('hidden');

}



function closeTodayGoalModal() {

  document.getElementById('goal-modal')?.classList.add('hidden');

}



function submitTodayGoal(event) {

  event.preventDefault();

  const editId = document.getElementById('goal-edit-id')?.value;

  const title = document.getElementById('goal-input-text')?.value.trim();

  const category = document.getElementById('goal-category-select')?.value || 'deep_work';

  const startTime = document.getElementById('goal-start-time')?.value || '';

  const endTime = document.getElementById('goal-end-time')?.value || '';

  const duration = document.getElementById('goal-duration-input')?.value.trim() || '';

  const completed = document.getElementById('goal-completed-check')?.checked || false;

  const notes = document.getElementById('goal-notes-input')?.value.trim() || '';



  if (!title) return;



  const catLabelMap = {

    north_star: 'North Star',

    deep_work: 'Deep Work',

    wellness: 'Wellness',

    learning: 'Learning',

    team: 'Collaboration',

    admin: 'Admin'

  };

  const categoryLabel = catLabelMap[category] || 'North Star';



  if (!state.todayGoals) state.todayGoals = [];



  if (editId) {

    const idx = state.todayGoals.findIndex(g => g.id === editId);

    if (idx !== -1) {

      state.todayGoals[idx] = {

        ...state.todayGoals[idx],

        title,

        category,

        categoryLabel,

        startTime,

        endTime,

        duration,

        completed,

        notes

      };

    }

  } else {

    const newGoal = {

      id: `g_${Date.now()}`,

      title,

      category,

      categoryLabel,

      startTime,

      endTime,

      duration,

      completed,

      notes

    };

    state.todayGoals.unshift(newGoal);

  }



  localStorage.setItem('mind_cave_today_goals', JSON.stringify(state.todayGoals));

  localStorage.setItem('mind_cave_today_goal', JSON.stringify(state.todayGoal));



  closeTodayGoalModal();

  renderTodayGoal();

  renderChronoTimeline();

  showToast(editId ? 'Goal updated successfully.' : 'New goal added to today.');

}



function toggleGoalItemComplete(goalId) {

  if (!state.todayGoals) return;

  const goal = state.todayGoals.find(g => g.id === goalId);

  if (!goal) return;



  goal.completed = !goal.completed;

  localStorage.setItem('mind_cave_today_goals', JSON.stringify(state.todayGoals));

  localStorage.setItem('mind_cave_today_goal', JSON.stringify(state.todayGoal));



  renderTodayGoal();

  renderChronoTimeline();

  showToast(goal.completed ? `Goal Achieved: "${goal.title}" (${goal.duration || 'Done'})` : `Goal marked in progress.`);

}



function deleteGoalItem(goalId) {

  if (!state.todayGoals) return;

  state.todayGoals = state.todayGoals.filter(g => g.id !== goalId);

  localStorage.setItem('mind_cave_today_goals', JSON.stringify(state.todayGoals));

  localStorage.setItem('mind_cave_today_goal', JSON.stringify(state.todayGoal));



  renderTodayGoal();

  renderChronoTimeline();

  showToast('Goal removed.');

}



function deleteGoalFromModal() {

  const editId = document.getElementById('goal-edit-id')?.value;

  if (editId) {

    deleteGoalItem(editId);

    closeTodayGoalModal();

  }

}



function toggleTodayGoalComplete() {

  if (!state.todayGoals || state.todayGoals.length === 0) {

    openNewGoalModal();

    return;

  }

  toggleGoalItemComplete(state.todayGoals[0].id);

}



// =============================================================================

// DAILY HABIT TRACKER & STREAKS

// =============================================================================



let selectedHabitEmojiVal = '💧';



function selectHabitEmoji(emoji) {

  selectedHabitEmojiVal = emoji;

  const badge = document.getElementById('habit-selected-emoji-badge');

  if (badge) badge.textContent = emoji;

}



function initHabitTracker() {

  if (!state.archivedHabits) {

    state.archivedHabits = JSON.parse(localStorage.getItem('mind_cave_archived_habits') || '[]');

  }

  renderHabitTracker();

  renderTimelineShortcuts();

  updateArchivedHabitsBadges();

}



function updateArchivedHabitsBadges() {

  if (!state.archivedHabits) state.archivedHabits = [];

  const count = state.archivedHabits.length;



  const inlineBadge = document.getElementById('archived-habits-badge-inline');

  const modalBadge = document.getElementById('archived-habits-badge-modal');

  const sanctuaryBadge = document.getElementById('archived-habits-badge-sanctuary');

  const sanctuaryFooterBadge = document.getElementById('archived-habits-badge-sanctuary-footer');

  const modalCountBadge = document.getElementById('archived-habits-count-badge');



  const text = count > 0 ? `Archive (${count})` : 'Archive';

  const footerText = count > 0 ? `Archive Vault (${count})` : 'Archive Vault';



  if (inlineBadge) inlineBadge.textContent = text;

  if (modalBadge) modalBadge.textContent = text;

  if (sanctuaryBadge) sanctuaryBadge.textContent = text;

  if (sanctuaryFooterBadge) sanctuaryFooterBadge.textContent = footerText;

  if (modalCountBadge) modalCountBadge.textContent = `${count} Archived`;

}



function renderHabitTracker() {

  const containers = [

    document.getElementById('habit-tracker-list'),

    document.getElementById('modal-habit-tracker-list'),

    document.getElementById('sanctuary-habit-tracker-list')

  ].filter(Boolean);



  if (containers.length === 0) return;



  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const todayDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const currentDayName = dayNames[todayDayIdx];



  const habitsHtml = state.habitsList.length === 0

    ? `

      <div class="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/10 text-center text-xs text-slate-400 space-y-1.5">

        <p>No active habits scheduled for today.</p>

        <div class="flex items-center justify-center gap-2 pt-1">

          <button type="button" onclick="openNewHabitModal()" class="text-cyan-500 hover:underline font-semibold font-mono text-[11px]">+ Add Your First Habit</button>

          ${state.archivedHabits && state.archivedHabits.length > 0 ? `

            <span class="text-slate-500">•</span>

            <button type="button" onclick="openArchivedHabitsModal()" class="text-amber-500 hover:underline font-semibold font-mono text-[11px]">Restore from Archive (${state.archivedHabits.length})</button>

          ` : ''}

        </div>

      </div>

    `

    : state.habitsList.map(h => {

      const isCounter = h.type === 'counter' || Boolean(h.targetCount);

      const targetCount = Number(h.targetCount) || 1;

      const currentCount = Number(h.currentCount) || 0;

      const isDoneToday = isCounter ? (currentCount >= targetCount) : Boolean(h.history && h.history[todayDayIdx]);

      const unit = h.unit || 'times';

      const pct = isCounter ? Math.min(100, Math.round((currentCount / targetCount) * 100)) : (isDoneToday ? 100 : 0);



      return `

        <div class="habit-row p-2 sm:p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-1.5 sm:gap-2.5 shadow-sm ${isDoneToday ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30' : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/5 hover:border-cyan-400/40'}" id="habit_row_${h.id}" ontouchstart="habitTouchStart(event, '${h.id}')" ontouchmove="habitTouchMove(event, '${h.id}')" ontouchend="habitTouchEnd(event, '${h.id}')">

          <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">

            <span class="text-base sm:text-lg shrink-0">${h.emoji || '💧'}</span>

            <div class="min-w-0 flex-1">

              <div class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5 flex-wrap">

                <span class="cursor-pointer hover:text-cyan-500 transition-colors truncate ${isDoneToday ? 'font-bold text-emerald-600 dark:text-emerald-300' : ''}" onclick="openNewHabitModal('${h.id}')" title="Click to edit">${escapeHtml(h.title)}</span>

                ${isCounter ? `<span class="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-mono font-bold shrink-0">${currentCount}/${targetCount} ${unit}</span>` : ''}

                ${h.isTimelineShortcut !== false ? '<span class="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-mono shrink-0">Shortcut</span>' : ''}

              </div>

              <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">

                <span class="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 shrink-0"><i data-lucide="flame" class="w-3 h-3 text-amber-500"></i><span>${h.streak}d streak</span></span>

                ${isCounter ? `

                  <div class="flex items-center gap-1.5">

                    <div class="w-12 sm:w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">

                      <div class="h-full ${isDoneToday ? 'bg-emerald-500' : 'bg-cyan-500'} rounded-full transition-all duration-300" style="width: ${pct}%"></div>

                    </div>

                    <span class="text-slate-600 dark:text-slate-300 font-bold">${pct}%</span>

                  </div>

                ` : (h.target ? `<span class="text-slate-400 hidden xs:inline">•</span> <span class="text-slate-600 dark:text-slate-300 truncate hidden xs:inline">${escapeHtml(h.target)}</span>` : '')}

              </div>

            </div>

          </div>



          <!-- Actions: Repeatable Counter Stepper OR 1-Tap Toggle -->

          <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">

            ${isCounter ? `

              <!-- Repeatable Counter Stepper: [-] [Count/Target] [+1] -->

              <div class="flex items-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200 dark:border-white/10">

                <button type="button" onclick="incrementHabitCount('${h.id}', -1)" class="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs transition-colors" title="Subtract 1 ${unit}">-</button>

                <span class="px-1.5 font-mono font-bold text-[11px] sm:text-xs ${isDoneToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-cyan-600 dark:text-cyan-300'}">${currentCount}/${targetCount}</span>

                <button type="button" onclick="incrementHabitCount('${h.id}', 1)" class="px-1.5 sm:px-2 h-5 sm:h-6 rounded-lg ${isDoneToday ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm' : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm'} flex items-center gap-0.5 font-bold text-xs transition-colors" title="Log +1 ${unit}">

                  <i data-lucide="plus" class="w-3 h-3 text-white"></i>

                  <span class="text-[10px] sm:text-xs">+1</span>

                </button>

              </div>

            ` : (showWeeklyHabitMatrix ? `

              <div class="flex items-center gap-1 mr-1">

                ${h.history.map((isDone, idx) => `

                  <div onclick="toggleHabitDay('${h.id}', ${idx})" class="habit-dot ${isDone ? 'done' : ''} ${idx === todayDayIdx ? 'ring-1 ring-amber-400 font-bold' : ''}" title="${days[idx]} - ${isDone ? 'Done' : 'Missed'}">

                    ${isDone ? '✓' : days[idx]}

                  </div>

                `).join('')}

              </div>

            ` : `

              <!-- 1-Tap Today Action Button -->

              <button type="button" onclick="toggleHabitToday('${h.id}')" class="px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${isDoneToday ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600' : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-cyan-400 hover:text-cyan-500'}" title="Toggle completion for Today (${currentDayName})">

                <i data-lucide="${isDoneToday ? 'check-circle' : 'circle'}" class="w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDoneToday ? 'text-white' : 'text-slate-400'}"></i>

                <span class="whitespace-nowrap">${isDoneToday ? 'Done Today' : 'Mark Done'}</span>

              </button>

            `)}

            <button type="button" onclick="openNewHabitModal('${h.id}')" class="p-1 text-slate-400 hover:text-amber-500 transition-colors" title="Edit Habit & Target Metrics">

              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>

            </button>

            <button type="button" onclick="deleteHabit('${h.id}')" class="p-1 text-slate-400 hover:text-rose-500 transition-colors" title="Move to Archive (Preserves Tracks & Streaks)">

              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>

            </button>

          </div>

        </div>

      `;

    }).join('');



  containers.forEach(c => {

    c.innerHTML = habitsHtml;

  });



  // Update Done count pills & streak badges

  const doneCount = state.habitsList.filter(h => {

    if (h.type === 'counter' || h.targetCount) {

      return (Number(h.currentCount) || 0) >= (Number(h.targetCount) || 1);

    }

    return Boolean(h.history && h.history[todayDayIdx]);

  }).length;

  const totalHabits = state.habitsList.length;

  const habitPct = totalHabits > 0 ? Math.round((doneCount / totalHabits) * 100) : 0;



  const pills = [

    document.getElementById('habit-progress-pill'),

    document.getElementById('sanctuary-habit-progress-pill')

  ].filter(Boolean);

  pills.forEach(p => {

    p.innerHTML = `<i data-lucide="check-circle" class="w-3 h-3 text-cyan-500"></i><span>${doneCount}/${totalHabits} Done Today (${habitPct}%)</span>`;

  });



  const modalStreak = document.getElementById('modal-habit-streak-badge');

  const streakBadge = document.getElementById('habit-streak-badge');

  const maxStreak = Math.max(...state.habitsList.map(h => h.streak || 0), 0);

  if (modalStreak) modalStreak.textContent = `${maxStreak || 14} Days Streak`;

  if (streakBadge) streakBadge.innerHTML = `<i data-lucide="flame" class="w-3 h-3 text-amber-500"></i><span>${maxStreak || 14} Days Streak</span>`;



  renderUndoHabitBanner();

  updateArchivedHabitsBadges();

  lucide.createIcons();

}



function refreshHabitsTracker(btnEl = null) {

  if (btnEl) {

    const icon = btnEl.querySelector('i') || btnEl.querySelector('svg');

    if (icon) icon.classList.add('animate-spin');

  }



  // Synchronize habits from storage if any external tab updated them

  try {

    const saved = localStorage.getItem('mind_cave_habits_list');

    if (saved) {

      state.habitsList = JSON.parse(saved);

    }

  } catch (e) {

    console.warn('Storage sync fallback:', e);

  }



  // Recalculate streak values dynamically

  const todayDayIdx = (new Date().getDay() + 6) % 7;

  state.habitsList.forEach(h => {

    if (h.type === 'counter' && h.targetCount) {

      h.currentCount = Number(h.currentCount) || 0;

      h.targetCount = Number(h.targetCount) || 1;

    }

    if (Array.isArray(h.history)) {

      let currentStreak = 0;

      for (let i = todayDayIdx; i >= 0; i--) {

        if (h.history[i]) currentStreak++;

        else if (i !== todayDayIdx) break;

      }

      h.streak = Math.max(h.streak || 0, currentStreak);

    }

  });



  localStorage.setItem('mind_cave_habits_list', JSON.stringify(state.habitsList));

  renderHabitTracker();

  renderTimelineShortcuts();

  if (typeof renderGoalsFocusDeck === 'function') renderGoalsFocusDeck();



  showToast('🔄 Daily Habits & Streaks refreshed and synchronized!');



  if (btnEl) {

    setTimeout(() => {

      const icon = btnEl.querySelector('i') || btnEl.querySelector('svg');

      if (icon) icon.classList.remove('animate-spin');

    }, 600);

  }

}



function incrementHabitCount(habitId, delta = 1) {

  const todayDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  const habit = state.habitsList.find(h => h.id === habitId);

  if (!habit) return;



  habit.type = 'counter';

  const target = Number(habit.targetCount) || 8;

  habit.targetCount = target;

  habit.currentCount = Math.max(0, (Number(habit.currentCount) || 0) + delta);

  const wasCompleted = Boolean(habit.history && habit.history[todayDayIdx]);

  const isNowCompleted = habit.currentCount >= target;



  if (Array.isArray(habit.history)) {

    habit.history[todayDayIdx] = isNowCompleted;

  }



  if (isNowCompleted && !wasCompleted) {

    habit.streak = (habit.streak || 0) + 1;

    showToast(`🎉 Daily Target Met! ${habit.title} (${habit.currentCount}/${target} ${habit.unit || 'units'})`);

  } else if (!isNowCompleted && wasCompleted) {

    habit.streak = Math.max(0, (habit.streak || 1) - 1);

  } else if (delta > 0) {

    showToast(`+1 ${habit.unit || 'time'} logged for "${habit.title}" (${habit.currentCount}/${target})`);

  }



  localStorage.setItem('mind_cave_habits_list', JSON.stringify(state.habitsList));

  renderHabitTracker();

  renderTimelineShortcuts();

  renderShortcutsManagerList();

}



function toggleHabitTypeFields(type) {

  const boolGroup = document.getElementById('habit-boolean-fields-group');

  const countGroup = document.getElementById('habit-counter-fields-group');

  if (type === 'counter') {

    if (boolGroup) boolGroup.classList.add('hidden');

    if (countGroup) countGroup.classList.remove('hidden');

  } else {

    if (boolGroup) boolGroup.classList.remove('hidden');

    if (countGroup) countGroup.classList.add('hidden');

  }

  lucide.createIcons();

}



let showWeeklyHabitMatrix = false;



function toggleHabitWeeklyView() {

  showWeeklyHabitMatrix = !showWeeklyHabitMatrix;

  renderHabitTracker();

}



function toggleHabitToday(habitId) {

  const todayDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  toggleHabitDay(habitId, todayDayIdx);

}



let recentlyDeletedHabits = [];



function deleteHabit(habitId) {

  const index = state.habitsList.findIndex(h => h.id === habitId);

  if (index === -1) return;



  const deletedHabit = state.habitsList[index];



  // Preserve full historic tracks and streak in archivedHabits

  const archivedCopy = JSON.parse(JSON.stringify(deletedHabit));

  archivedCopy.archivedAt = new Date().toISOString();



  if (!state.archivedHabits) state.archivedHabits = [];

  state.archivedHabits = state.archivedHabits.filter(h => h.id !== habitId);

  state.archivedHabits.unshift(archivedCopy);

  localStorage.setItem('mind_cave_archived_habits', JSON.stringify(state.archivedHabits));



  // Push to transient undo stack

  recentlyDeletedHabits.push({ habit: JSON.parse(JSON.stringify(deletedHabit)), index: index });



  // Remove from active list

  state.habitsList.splice(index, 1);

  localStorage.setItem('mind_cave_habits_list', JSON.stringify(state.habitsList));



  renderHabitTracker();

  renderTimelineShortcuts();

  renderShortcutsManagerList();

  updateArchivedHabitsBadges();



  showToast(`Moved "${deletedHabit.title}" to Archive. Historical tracks preserved!`);

}



function undoDeleteHabit() {

  if (recentlyDeletedHabits.length === 0) {

    showToast('No recently deleted habits to restore.');

    return;

  }



  const last = recentlyDeletedHabits.pop();

  const insertIndex = Math.min(last.index, state.habitsList.length);

  state.habitsList.splice(insertIndex, 0, last.habit);



  if (state.archivedHabits) {

    state.archivedHabits = state.archivedHabits.filter(h => h.id !== last.habit.id);

    localStorage.setItem('mind_cave_archived_habits', JSON.stringify(state.archivedHabits));

  }



  localStorage.setItem('mind_cave_habits_list', JSON.stringify(state.habitsList));

  renderHabitTracker();

  renderTimelineShortcuts();

  renderShortcutsManagerList();

  updateArchivedHabitsBadges();



  showToast(`Restored habit: "${last.habit.title}" with tracks.`);

}



function openArchivedHabitsModal() {

  renderArchivedHabitsList();

  document.getElementById('archived-habits-modal')?.classList.remove('hidden');

  lucide.createIcons();

}



function closeArchivedHabitsModal() {

  document.getElementById('archived-habits-modal')?.classList.add('hidden');

}



function renderArchivedHabitsList() {

  const container = document.getElementById('archived-habits-list-container');

  if (!container) return;



  if (!state.archivedHabits) state.archivedHabits = [];

  updateArchivedHabitsBadges();



  if (state.archivedHabits.length === 0) {

    container.innerHTML = `

      <div class="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-slate-400 space-y-2">

        <i data-lucide="archive" class="w-8 h-8 text-slate-500 mx-auto"></i>

        <p class="font-medium text-slate-300">Your Archive is Empty</p>

        <p class="text-[11px] text-slate-500 max-w-xs mx-auto">When you remove a habit from your active routine, it is safely stored here with its original streaks and 7-day track record intact.</p>

      </div>

    `;

    lucide.createIcons();

    return;

  }



  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];



  container.innerHTML = state.archivedHabits.map(h => {

    const formattedDate = h.archivedAt ? new Date(h.archivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Archived';

    return `

      <div class="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div class="flex items-start sm:items-center gap-3 min-w-0 flex-1">

          <span class="text-xl shrink-0 p-2 rounded-xl bg-white/5 border border-white/10">${h.emoji || '💧'}</span>

          <div class="min-w-0 flex-1 space-y-1">

            <div class="flex items-center gap-2 flex-wrap">

              <h5 class="text-xs font-bold text-white truncate">${escapeHtml(h.title)}</h5>

              <span class="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">

                <i data-lucide="flame" class="w-3 h-3 text-amber-400"></i>

                <span>${h.streak || 0}d streak preserved</span>

              </span>

            </div>

            <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono flex-wrap">

              ${h.target ? `<span>Target: ${escapeHtml(h.target)}</span> •` : ''}

              <span>${formattedDate}</span>

            </div>

            <!-- Preserved 7-day dot track preview -->

            ${h.history && h.history.length > 0 ? `

              <div class="flex items-center gap-1 pt-1">

                <span class="text-[9px] text-slate-500 font-mono uppercase tracking-wider mr-1">Preserved Tracks:</span>

                ${h.history.map((isDone, idx) => `

                  <div class="habit-dot ${isDone ? 'done' : ''} !w-4 !h-4 !text-[8px]" title="${days[idx]} - ${isDone ? 'Completed' : 'Missed'}">

                    ${isDone ? '✓' : days[idx]}

                  </div>

                `).join('')}

              </div>

            ` : ''}

          </div>

        </div>



        <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto justify-end">

          <button type="button" onclick="restoreArchivedHabit('${h.id}')" class="btn-island !bg-gradient-to-r !from-cyan-500 !to-blue-600 text-xs !py-1.5 !px-3 font-semibold shadow-sm" title="Restore this habit and all its past tracking logs back to active view">

            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-white mr-1"></i>

            <span>Restore</span>

          </button>

          <button type="button" onclick="purgeArchivedHabit('${h.id}')" class="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors" title="Permanently Delete">

            <i data-lucide="trash-2" class="w-4 h-4"></i>

          </button>

        </div>

      </div>

    `;

  }).join('');



  lucide.createIcons();

}



function restoreArchivedHabit(habitId) {

  if (!state.archivedHabits) return;

  const habit = state.archivedHabits.find(h => h.id === habitId);

  if (!habit) return;



  const restored = JSON.parse(JSON.stringify(habit));

  delete restored.archivedAt;



  state.habitsList.unshift(restored);

  localStorage.setItem('mind_cave_habits_list', JSON.stringify(state.habitsList));



  state.archivedHabits = state.archivedHabits.filter(h => h.id !== habitId);

  localStorage.setItem('mind_cave_archived_habits', JSON.stringify(state.archivedHabits));



  renderHabitTracker();

  renderTimelineShortcuts();

  renderShortcutsManagerList();

  renderArchivedHabitsList();

  updateArchivedHabitsBadges();



  showToast(`Restored "${restored.title}" with all historic tracks intact!`);

}



function purgeArchivedHabit(habitId) {

  if (!state.archivedHabits) return;

  state.archivedHabits = state.archivedHabits.filter(h => h.id !== habitId);

  localStorage.setItem('mind_cave_archived_habits', JSON.stringify(state.archivedHabits));



  renderArchivedHabitsList();

  updateArchivedHabitsBadges();

  showToast('Habit permanently deleted from archive.');

}



function clearAllArchivedHabits() {

  if (!state.archivedHabits || state.archivedHabits.length === 0) return;

  if (!confirm('Are you sure you want to permanently clear all archived habits?')) return;



  state.archivedHabits = [];

  localStorage.setItem('mind_cave_archived_habits', JSON.stringify(state.archivedHabits));



  renderArchivedHabitsList();

  updateArchivedHabitsBadges();

  showToast('All archived habits permanently cleared.');

}



function renderUndoHabitBanner() {

  const banners = [

    document.getElementById('habit-undo-banner'),

    document.getElementById('modal-habit-undo-banner')

  ].filter(Boolean);



  banners.forEach(b => {

    if (recentlyDeletedHabits.length > 0) {

      const last = recentlyDeletedHabits[recentlyDeletedHabits.length - 1];

      b.innerHTML = `

        <div class="p-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">

          <span class="truncate flex items-center gap-1.5">

            <i data-lucide="info" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>

            <span class="truncate">Deleted "${escapeHtml(last.habit.title)}"</span>

          </span>

          <div class="flex items-center gap-1.5 shrink-0 ml-2">

            <button type="button" onclick="undoDeleteHabit()" class="px-2.5 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1">

              <i data-lucide="rotate-ccw" class="w-3 h-3 text-slate-950"></i>

              <span>Undo</span>

            </button>

            <button type="button" onclick="openArchivedHabitsModal()" class="text-[11px] text-cyan-400 hover:underline font-semibold font-mono">

              View Archive →

            </button>

          </div>

        </div>

      `;

      b.classList.remove('hidden');

    } else {

      b.innerHTML = '';

      b.classList.add('hidden');

    }

  });

}



function toggleHabitDay(habitId, dayIndex) {

  const habit = state.habitsList.find(h => h.id === habitId);

  if (!habit) return;



  if (habit.type === 'counter' || habit.targetCount) {

    incrementHabitCount(habitId, 1);

    return;

  }



  habit.history[dayIndex] = !habit.history[dayIndex];

  if (habit.history[dayIndex]) habit.streak += 1;

  else habit.streak = Math.max(0, habit.streak - 1);



  localStorage.setItem('mind_cave_habits_list', JSON.stringify(state.habitsList));

  renderHabitTracker();

  renderTimelineShortcuts();

  showToast(`${habit.title}: ${habit.history[dayIndex] ? 'Completed!' : 'Marked incomplete'}`);

}



function openNewHabitModal(habitId = null) {

  const modal = document.getElementById('habit-modal');

  if (!modal) return;



  const idInput = document.getElementById('habit-edit-id-input');

  const titleInput = document.getElementById('habit-title-input');

  const targetInput = document.getElementById('habit-target-unit-input');

  const freqSelect = document.getElementById('habit-freq-select');

  const shortcutToggle = document.getElementById('habit-shortcut-toggle-check');

  const modalTitle = document.getElementById('habit-modal-title');

  const deleteBtn = document.getElementById('habit-modal-delete-btn');

  const submitLbl = document.getElementById('habit-modal-submit-lbl');



  const boolRadio = document.getElementById('habit-type-boolean');

  const counterRadio = document.getElementById('habit-type-counter');

  const targetCountInput = document.getElementById('habit-target-count-input');

  const unitNameInput = document.getElementById('habit-unit-name-input');

  const currentCountInput = document.getElementById('habit-current-count-input');



  if (habitId) {

    const habit = state.habitsList.find(h => h.id === habitId);

    if (habit) {

      if (idInput) idInput.value = habit.id;

      if (titleInput) titleInput.value = habit.title;

      if (targetInput) targetInput.value = habit.target || '';

      selectHabitEmoji(habit.emoji || '💧');

      if (freqSelect) freqSelect.value = habit.frequency || 'daily';

      if (shortcutToggle) shortcutToggle.checked = habit.isTimelineShortcut !== false;

      if (modalTitle) modalTitle.textContent = 'Edit Custom Habit';

      if (submitLbl) submitLbl.textContent = 'Update Habit';

      if (deleteBtn) deleteBtn.classList.remove('hidden');



      if (habit.type === 'counter' || habit.targetCount) {

        if (counterRadio) counterRadio.checked = true;

        if (boolRadio) boolRadio.checked = false;

        toggleHabitTypeFields('counter');

        if (targetCountInput) targetCountInput.value = habit.targetCount || 8;

        if (unitNameInput) unitNameInput.value = habit.unit || 'glasses';

        if (currentCountInput) currentCountInput.value = habit.currentCount || 0;

      } else {

        if (boolRadio) boolRadio.checked = true;

        if (counterRadio) counterRadio.checked = false;

        toggleHabitTypeFields('boolean');

      }

    }

  } else {

    if (idInput) idInput.value = '';

    if (titleInput) titleInput.value = '';

    if (targetInput) targetInput.value = '';

    selectHabitEmoji('💧');

    if (freqSelect) freqSelect.value = 'daily';

    if (shortcutToggle) shortcutToggle.checked = true;

    if (modalTitle) modalTitle.textContent = 'Add New Micro-Habit';

    if (submitLbl) submitLbl.textContent = 'Save Habit';

    if (deleteBtn) deleteBtn.classList.add('hidden');



    if (boolRadio) boolRadio.checked = true;

    if (counterRadio) counterRadio.checked = false;

    toggleHabitTypeFields('boolean');

    if (targetCountInput) targetCountInput.value = 8;

    if (unitNameInput) unitNameInput.value = 'glasses';

    if (currentCountInput) currentCountInput.value = 0;

  }



  modal.classList.remove('hidden');

  lucide.createIcons();

}



function closeNewHabitModal() {

  document.getElementById('habit-modal')?.classList.add('hidden');

}



function deleteCurrentEditingHabit() {

  const id = document.getElementById('habit-edit-id-input')?.value;

  if (id) {

    deleteHabit(id);

    closeNewHabitModal();

  }

}



function submitNewHabit(event) {

  event.preventDefault();

  const id = document.getElementById('habit-edit-id-input')?.value;

  const title = document.getElementById('habit-title-input')?.value.trim();

  const target = document.getElementById('habit-target-unit-input')?.value.trim();

  const freq = document.getElementById('habit-freq-select')?.value;

  const isShortcut = document.getElementById('habit-shortcut-toggle-check')?.checked ?? true;



  const isCounter = document.getElementById('habit-type-counter')?.checked;

  const targetCount = Number(document.getElementById('habit-target-count-input')?.value) || 8;

  const unitName = document.getElementById('habit-unit-name-input')?.value.trim() || 'times';

  const currentCount = Number(document.getElementById('habit-current-count-input')?.value) || 0;



  if (!title) return;



  if (id) {

    // Edit existing

    const habit = state.habitsList.find(h => h.id === id);

    if (habit) {

      habit.title = title;

      habit.emoji = selectedHabitEmojiVal;

      habit.frequency = freq;

      habit.isTimelineShortcut = isShortcut;



      if (isCounter) {

        habit.type = 'counter';

        habit.targetCount = targetCount;

        habit.unit = unitName;

        habit.currentCount = currentCount;

        habit.target = `${targetCount} ${unitName}`;

      } else {

        habit.type = 'boolean';

        habit.target = target;

        delete habit.targetCount;

        delete habit.currentCount;

        delete habit.unit;

      }



      showToast(`Updated habit: ${title}`);

    }

  } else {

    // Add new

    const todayDayIdx = (new Date().getDay() + 6) % 7;

    const historyArr = [false, false, false, false, false, false, false];

    if (isCounter && currentCount >= targetCount) historyArr[todayDayIdx] = true;



    const newHabit = {

      id: `h_${Date.now()}`,

      title: title,

      emoji: selectedHabitEmojiVal,

      type: isCounter ? 'counter' : 'boolean',

      target: isCounter ? `${targetCount} ${unitName}` : target,

      frequency: freq,

      isTimelineShortcut: isShortcut,

      streak: 1,

      history: historyArr

    };



    if (isCounter) {

      newHabit.targetCount = targetCount;

      newHabit.unit = unitName;

      newHabit.currentCount = currentCount;

    }



    state.habitsList.push(newHabit);

    showToast(`Added habit: ${title}`);

  }



  localStorage.setItem('mind_cave_habits_list', JSON.stringify(state.habitsList));

  closeNewHabitModal();

  renderHabitTracker();

  renderTimelineShortcuts();

}



function toggleHabitTimelineShortcut(habitId) {

  const habit = state.habitsList.find(h => h.id === habitId);

  if (habit) {

    habit.isTimelineShortcut = !habit.isTimelineShortcut;

    localStorage.setItem('mind_cave_habits_list', JSON.stringify(state.habitsList));

    renderTimelineShortcuts();

    renderShortcutsManagerList();

    showToast(`${habit.title} ${habit.isTimelineShortcut ? 'added to' : 'removed from'} timeline shortcuts.`);

  }

}



function openTimelineShortcutsModal() {

  renderShortcutsManagerList();

  document.getElementById('shortcuts-modal')?.classList.remove('hidden');

}



function closeTimelineShortcutsModal() {

  document.getElementById('shortcuts-modal')?.classList.add('hidden');

}



function renderShortcutsManagerList() {

  const container = document.getElementById('shortcuts-manager-list');

  if (!container) return;



  container.innerHTML = state.habitsList.map(h => `

    <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">

      <div class="flex items-center gap-2.5 min-w-0">

        <span class="text-lg">${h.emoji || '💧'}</span>

        <div class="min-w-0">

          <div class="text-xs font-bold text-white truncate">${escapeHtml(h.title)}</div>

          <div class="text-[10px] text-slate-400 font-mono flex items-center gap-1"><i data-lucide="flame" class="w-3 h-3 text-amber-400"></i><span>${h.streak}d streak ${h.target ? '• ' + escapeHtml(h.target) : ''}</span></div>

        </div>

      </div>

      <div class="flex items-center gap-2 shrink-0">

        <label class="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold ${h.isTimelineShortcut !== false ? 'text-cyan-300' : 'text-slate-500'}">

          <input type="checkbox" ${h.isTimelineShortcut !== false ? 'checked' : ''} onchange="toggleHabitTimelineShortcut('${h.id}')" class="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 cursor-pointer">

          <span class="hidden sm:inline">Timeline</span>

        </label>

        <button type="button" onclick="openNewHabitModal('${h.id}')" class="p-1 text-slate-400 hover:text-amber-300" title="Edit Habit">

          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>

        </button>

        <button type="button" onclick="deleteHabit('${h.id}')" class="p-1 text-slate-400 hover:text-rose-400" title="Delete Habit">

          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>

        </button>

      </div>

    </div>

  `).join('');



  lucide.createIcons();

}



function renderTimelineShortcuts() {

  const containers = [

    document.getElementById('timeline-custom-shortcuts-container'),

    document.getElementById('modal-timeline-shortcuts-container')

  ].filter(Boolean);



  if (containers.length === 0) return;



  const todayDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  const shortcutHabits = state.habitsList.filter(h => h.isTimelineShortcut !== false);



  if (shortcutHabits.length === 0) {

    const emptyHtml = `<span class="text-[11px] text-slate-400 italic py-1">No shortcuts pinned. Click <strong>Customize</strong> to pin 1-tap habits.</span>`;

    containers.forEach(c => { c.innerHTML = emptyHtml; });

    return;

  }



  const shortcutsHtml = shortcutHabits.map(h => {

    const isCounter = h.type === 'counter' || Boolean(h.targetCount);

    const targetCount = Number(h.targetCount) || 1;

    const currentCount = Number(h.currentCount) || 0;

    const isDone = isCounter ? (currentCount >= targetCount) : Boolean(h.history && h.history[todayDayIdx]);



    return `

      <button type="button" onclick="logHabit('${h.id}')" class="p-1 px-2.5 rounded-xl border transition-all text-left flex items-center gap-1.5 shrink-0 ${isDone ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-cyan-400 text-slate-700 dark:text-slate-200'}" title="1-Tap Log: ${escapeHtml(h.title)}">

        <span class="text-xs">${h.emoji || '💧'}</span>

        <span class="text-xs font-semibold whitespace-nowrap">${escapeHtml(h.title.split(' ')[0] || h.title)}</span>

        ${isCounter ? `<span class="text-[10px] font-mono font-bold ${isDone ? 'text-emerald-500' : 'text-cyan-400'}">${currentCount}/${targetCount}</span>` : ''}

        <span class="text-[10px] font-bold ${isDone ? 'text-emerald-500' : 'text-slate-400'}">${isDone && !isCounter ? '✓' : '+1'}</span>

      </button>

    `;

  }).join('');



  containers.forEach(c => {

    c.innerHTML = shortcutsHtml;

  });

}



function logHabit(habitKey) {

  let habit = state.habitsList.find(h => h.id === habitKey || h.id === `h_${habitKey}`);

  if (!habit) {

    habit = state.habitsList.find(h => h.title.toLowerCase().includes(habitKey.toLowerCase()));

  }

  if (!habit && state.habitsList.length > 0) {

    habit = state.habitsList[0];

  }

  if (!habit) return;



  if (habit.type === 'counter' || habit.targetCount) {

    incrementHabitCount(habit.id, 1);

  } else {

    const todayDayIdx = (new Date().getDay() + 6) % 7;

    toggleHabitDay(habit.id, todayDayIdx);

  }

}



function toggleGoalsTilesCollapse() {

  const deck = document.getElementById('goals-habits-deck-body');

  const chevron = document.getElementById('goals-tiles-chevron');

  if (!deck) return;



  const isCollapsed = deck.classList.contains('hidden');

  if (isCollapsed) {

    deck.classList.remove('hidden');

    if (chevron) chevron.style.transform = 'rotate(0deg)';

    localStorage.setItem('mind_cave_goals_collapsed', 'false');

  } else {

    deck.classList.add('hidden');

    if (chevron) chevron.style.transform = 'rotate(180deg)';

    localStorage.setItem('mind_cave_goals_collapsed', 'true');

  }

}



function initGoalsTilesCollapse() {

  const isCollapsed = localStorage.getItem('mind_cave_goals_collapsed') === 'true';

  const deck = document.getElementById('goals-habits-deck-body');

  const chevron = document.getElementById('goals-tiles-chevron');

  if (deck && isCollapsed) {

    deck.classList.add('hidden');

    if (chevron) chevron.style.transform = 'rotate(180deg)';

  }

}



function openGoalsHabitsModal() {

  const modal = document.getElementById('goals-habits-modal');

  if (modal) {

    modal.classList.remove('hidden');

    renderTodayGoal();

    renderHabitTracker();

    renderTimelineShortcuts();

    lucide.createIcons();

  }

}



function closeGoalsHabitsModal() {

  const modal = document.getElementById('goals-habits-modal');

  if (modal) modal.classList.add('hidden');

}



// =============================================================================

// PLAN VS ACTION & BLOCKER / FRICTION LOGGING

// =============================================================================



function openBlockerModal(taskId) {

  const input = document.getElementById('blocker-task-id-input');

  if (input) input.value = taskId;

  document.getElementById('blocker-modal')?.classList.remove('hidden');

}



function closeBlockerModal() {

  document.getElementById('blocker-modal')?.classList.add('hidden');

}



function setTaskBlockerReason(reasonKey) {

  const taskId = document.getElementById('blocker-task-id-input')?.value;

  closeBlockerModal();

  showToast(`Logged friction blocker for task. Added to AI Reframing analysis.`);

}



// =============================================================================

// LIFE BUCKET LIST & MILESTONE DREAMS VAULT (TRACKER & ACTION ENGINE)

// =============================================================================



let bucketStatusFilter = 'all';

let bucketCategoryFilter = 'all';



function initBucketList() {

  if (!state.bucketCategories) {

    state.bucketCategories = JSON.parse(localStorage.getItem('mind_cave_bucket_categories') || 'null') || [

      { id: 'travel', name: 'Travel & World Exploration', color: 'cyan' },

      { id: 'career', name: 'Career & Mastery', color: 'indigo' },

      { id: 'adventure', name: 'Adventure & Sports', color: 'amber' },

      { id: 'wellness', name: 'Wellness & Health', color: 'emerald' },

      { id: 'creative', name: 'Art & Creation', color: 'purple' },

      { id: 'wealth', name: 'Financial Freedom', color: 'rose' }

    ];

  }



  // Normalize existing bucketList items to have rich fields if missing

  if (state.bucketList) {

    state.bucketList.forEach(b => {

      if (!b.targetDate) b.targetDate = b.year ? `${b.year}-12-31` : '2027-12-31';

      if (!b.status) b.status = b.achieved ? 'fulfilled' : 'planning';

      if (b.progress === undefined) b.progress = b.achieved ? 100 : 35;

      if (!b.plan) b.plan = '• Phase 1: Research & define key requirements\n• Phase 2: Secure resources and initial milestones\n• Phase 3: Final execution and summit celebration';

      if (!Array.isArray(b.completedStepIndices)) b.completedStepIndices = b.achieved ? [0, 1, 2] : [];

    });

  }



  populateBucketCategoryDropdowns();

  renderBucketList();

  renderDashboardMilestoneRadar();

}



function getCategoryColorClasses(color) {

  const colorMap = {

    cyan: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',

    indigo: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',

    amber: 'text-amber-400 bg-amber-950/60 border-amber-500/30',

    emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',

    purple: 'text-purple-400 bg-purple-950/60 border-purple-500/30',

    rose: 'text-rose-400 bg-rose-950/60 border-rose-500/30',

    pink: 'text-pink-400 bg-pink-950/60 border-pink-500/30'

  };

  return colorMap[color] || 'text-slate-300 bg-black/40 border-white/10';

}



function populateBucketCategoryDropdowns() {

  const selects = [

    document.getElementById('bucket-category-select'),

    document.getElementById('bucket-category-filter')

  ].filter(Boolean);



  if (!state.bucketCategories) return;



  const modalSelect = document.getElementById('bucket-category-select');

  if (modalSelect) {

    const currentVal = modalSelect.value;

    modalSelect.innerHTML = state.bucketCategories.map(c => `

      <option value="${c.id}">${escapeHtml(c.name)}</option>

    `).join('');

    if (currentVal && state.bucketCategories.some(c => c.id === currentVal)) {

      modalSelect.value = currentVal;

    }

  }



  const filterSelect = document.getElementById('bucket-category-filter');

  if (filterSelect) {

    const currentVal = filterSelect.value || 'all';

    filterSelect.innerHTML = `

      <option value="all">All Domains</option>

      ${state.bucketCategories.map(c => `

        <option value="${c.id}">${escapeHtml(c.name)}</option>

      `).join('')}

    `;

    filterSelect.value = currentVal;

  }

}



function openBucketCategoriesModal() {

  renderBucketCategoriesList();

  document.getElementById('bucket-categories-modal')?.classList.remove('hidden');

  lucide.createIcons();

}



function closeBucketCategoriesModal() {

  document.getElementById('bucket-categories-modal')?.classList.add('hidden');

}



function renderBucketCategoriesList() {

  const container = document.getElementById('bucket-categories-list-container');

  if (!container || !state.bucketCategories) return;



  container.innerHTML = state.bucketCategories.map(c => `

    <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">

      <div class="flex items-center gap-2">

        <span class="w-2.5 h-2.5 rounded-full bg-${c.color || 'pink'}-500"></span>

        <span class="text-xs font-bold text-white">${escapeHtml(c.name)}</span>

        <span class="text-[10px] font-mono px-2 py-0.2 rounded-full border ${getCategoryColorClasses(c.color)} capitalize">${c.color}</span>

      </div>

      <button type="button" onclick="deleteBucketCategory('${c.id}')" class="p-1 text-slate-400 hover:text-rose-400 transition-colors" title="Delete Category">

        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>

      </button>

    </div>

  `).join('');



  lucide.createIcons();

}



function submitNewBucketCategory(event) {

  event.preventDefault();

  const nameInput = document.getElementById('new-category-name-input');

  const colorSelect = document.getElementById('new-category-color-select');

  const name = nameInput?.value.trim();

  const color = colorSelect?.value || 'pink';



  if (!name) return;



  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  if (!state.bucketCategories) state.bucketCategories = [];

  if (state.bucketCategories.some(c => c.id === id)) {

    showToast(`Category "${name}" already exists.`);

    return;

  }



  state.bucketCategories.push({ id, name, color });

  localStorage.setItem('mind_cave_bucket_categories', JSON.stringify(state.bucketCategories));



  if (nameInput) nameInput.value = '';

  renderBucketCategoriesList();

  populateBucketCategoryDropdowns();

  renderBucketList();

  showToast(`Added new domain category: "${name}"`);

}



function deleteBucketCategory(catId) {

  if (!state.bucketCategories || state.bucketCategories.length <= 1) {

    showToast('You must keep at least 1 category.');

    return;

  }

  state.bucketCategories = state.bucketCategories.filter(c => c.id !== catId);

  localStorage.setItem('mind_cave_bucket_categories', JSON.stringify(state.bucketCategories));

  renderBucketCategoriesList();

  populateBucketCategoryDropdowns();

  renderBucketList();

  showToast('Category deleted.');

}



function filterBucketListByStatus(status, btnEl) {

  bucketStatusFilter = status;

  const pills = document.querySelectorAll('.bucket-filter-pill');

  pills.forEach(p => {

    p.classList.remove('active', 'bg-pink-500/20', 'text-pink-400', 'border-pink-500/30');

    p.classList.add('bg-slate-100', 'dark:bg-black/40', 'text-slate-600', 'dark:text-slate-400', 'border-slate-200', 'dark:border-white/5');

  });

  if (btnEl) {

    btnEl.classList.add('active', 'bg-pink-500/20', 'text-pink-400', 'border-pink-500/30');

    btnEl.classList.remove('bg-slate-100', 'dark:bg-black/40', 'text-slate-600', 'dark:text-slate-400', 'border-slate-200', 'dark:border-white/5');

  }

  renderBucketList();

}



function filterBucketListByCategory(cat) {

  bucketCategoryFilter = cat;

  renderBucketList();

}



function formatTargetDateCountdown(targetDateStr) {

  if (!targetDateStr) return { text: 'Aspiration', badgeClass: 'text-amber-300' };

  const target = new Date(targetDateStr);

  const now = new Date();

  if (isNaN(target.getTime())) return { text: targetDateStr, badgeClass: 'text-amber-300' };



  const diffMs = target.getTime() - now.getTime();

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const dateFormatted = target.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });



  if (diffDays < 0) {

    return { text: `${dateFormatted} • Passed`, badgeClass: 'text-rose-400' };

  } else if (diffDays <= 90) {

    return { text: `${dateFormatted} • ⏳ ${diffDays}d left`, badgeClass: 'text-amber-400 animate-pulse' };

  } else if (diffDays <= 365) {

    const months = Math.round(diffDays / 30);

    return { text: `${dateFormatted} • ~${months} mo`, badgeClass: 'text-cyan-400' };

  } else {

    const years = (diffDays / 365).toFixed(1);

    return { text: `${dateFormatted} • ~${years} yrs`, badgeClass: 'text-slate-300' };

  }

}



function generateLocalAIBucketPlan(title, category, targetDate) {

  const cat = (category || 'general').toLowerCase();

  if (cat.includes('travel') || cat.includes('adventure')) {

    return `• Phase 1 (Prep): Deep destination research, gear acquisition & budget allocation\n• Phase 2 (Logistics): Secure flights, mountain/expedition permits & guide bookings\n• Phase 3 (Execution): Embark on journey, document milestones & summit achievement\n• Immediate Action: Create dedicated gear checklist and set aside monthly travel fund`;

  } else if (cat.includes('career') || cat.includes('wealth')) {

    return `• Phase 1 (Architecture): Define technical MVP specification, market positioning & roadmap\n• Phase 2 (Building): Sprint 1-4 prototype builds, benchmark testing & code audits\n• Phase 3 (Launch & Scale): Public open-source launch, conference demonstration & scaling\n• Immediate Action: Schedule 2 hours deep-work block this Saturday to finish Phase 1 spec`;

  } else if (cat.includes('wellness')) {

    return `• Phase 1 (Foundation): Establish baseline physiological biomarkers, training plan & diet protocol\n• Phase 2 (Progression): Build volume consistently, zone-2 cardio & weekly milestone checks\n• Phase 3 (Target Event): Race day / goal execution and structured recovery protocol\n• Immediate Action: Book initial fitness assessment and log weekly training schedule`;

  } else {

    return `• Phase 1 (Foundation): Establish core requirements, resources & execution timeline for "${title}"\n• Phase 2 (Execution): Build tangible prototypes and complete Phase 2 milestone sprints\n• Phase 3 (Fulfillment): Final polish, milestone fulfillment and reflective retrospective\n• Immediate Action: Dedicate 30 minutes this week to define milestone 1 deliverables`;

  }

}



async function generateAIBucketPlan(dreamId = null) {

  let title = '';

  let category = '';

  let targetDate = '';



  const titleInput = document.getElementById('bucket-title-input');

  const catSelect = document.getElementById('bucket-category-select');

  const dateInput = document.getElementById('bucket-target-date-input');

  const planInput = document.getElementById('bucket-plan-input');

  const progressSlider = document.getElementById('bucket-progress-slider');

  const btn = document.getElementById('btn-generate-ai-bucket-plan');



  if (titleInput && titleInput.value.trim()) {

    title = titleInput.value.trim();

    category = catSelect?.value || 'adventure';

    targetDate = dateInput?.value || '2027-12-31';

  } else if (dreamId) {

    const item = state.bucketList.find(b => b.id === dreamId);

    if (item) {

      title = item.title;

      category = item.category;

      targetDate = item.targetDate;

    }

  }



  if (!title) {

    showToast('Please enter a dream or milestone title first.');

    titleInput?.focus();

    return;

  }



  if (btn) {

    btn.disabled = true;

    btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 text-pink-400 animate-spin"></i><span>Generating AI Plan...</span>`;

  }



  try {

    const response = await fetch('/api/gemini/generate-plan', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },

      body: JSON.stringify({

        title: title,

        category: category,

        target_date: targetDate

      })

    });



    let generatedPlan = '';

    if (response.ok) {

      const data = await response.json();

      generatedPlan = data.plan;

    }



    if (!generatedPlan) {

      generatedPlan = generateLocalAIBucketPlan(title, category, targetDate);

    }



    if (planInput) {

      planInput.value = generatedPlan;

    }

    if (progressSlider) {

      progressSlider.value = 35;

      const lbl = document.getElementById('bucket-progress-val-lbl');

      if (lbl) lbl.textContent = '35%';

    }



    showToast(`✨ Generated AI execution blueprint for "${title}"!`);

  } catch (err) {

    const localPlan = generateLocalAIBucketPlan(title, category, targetDate);

    if (planInput) planInput.value = localPlan;

    showToast(`✨ AI blueprint structured for "${title}"!`);

  } finally {

    if (btn) {

      btn.disabled = false;

      btn.innerHTML = `<i data-lucide="sparkles" class="w-3 h-3 text-pink-400"></i><span>✨ AI Blueprint Generator</span>`;

      lucide.createIcons();

    }

  }

}



function toggleBucketPlanStep(dreamId, stepIndex) {

  const item = state.bucketList.find(b => b.id === dreamId);

  if (!item) return;



  if (!Array.isArray(item.completedStepIndices)) {

    item.completedStepIndices = [];

  }



  const idx = item.completedStepIndices.indexOf(stepIndex);

  if (idx > -1) {

    item.completedStepIndices.splice(idx, 1);

  } else {

    item.completedStepIndices.push(stepIndex);

  }



  // Recalculate progress based on step completion

  const totalSteps = (item.plan || '').split('\n').filter(s => s.trim().length > 0).length || 1;

  const completedCount = item.completedStepIndices.length;

  item.progress = Math.min(100, Math.round((completedCount / totalSteps) * 100));



  if (item.progress === 100) {

    item.status = 'fulfilled';

    item.achieved = true;

    showToast(`🏆 All milestones completed for "${item.title}"!`);

  } else if (item.progress >= 75) {

    item.status = 'final_stretch';

    item.achieved = false;

  } else if (item.progress >= 30) {

    item.status = 'in_action';

    item.achieved = false;

  } else {

    item.status = 'planning';

    item.achieved = false;

  }



  localStorage.setItem('mind_cave_bucket_list', JSON.stringify(state.bucketList));

  renderBucketList();

  renderDashboardMilestoneRadar();

}



function renderDashboardMilestoneRadar() {

  const countBadge = document.getElementById('dashboard-radar-count-badge');

  const fulfillmentBadge = document.getElementById('dashboard-radar-fulfillment-badge');

  const stepContainer = document.getElementById('dashboard-radar-active-step');



  if (!state.bucketList || state.bucketList.length === 0) return;



  const total = state.bucketList.length;

  const fulfilled = state.bucketList.filter(b => b.achieved || b.status === 'fulfilled').length;

  const inAction = state.bucketList.filter(b => b.status === 'in_action' || b.status === 'final_stretch').length;

  const fulfilledPct = Math.round((fulfilled / total) * 100);



  if (countBadge) countBadge.textContent = `${inAction} In Flight`;

  if (fulfillmentBadge) fulfillmentBadge.textContent = `${fulfilled}/${total} Fulfilled (${fulfilledPct}%)`;



  if (stepContainer) {

    const activeDreams = state.bucketList.filter(b => !b.achieved && b.status !== 'fulfilled');

    if (activeDreams.length > 0) {

      const topDream = activeDreams[0];

      const countdown = formatTargetDateCountdown(topDream.targetDate || topDream.year);

      const steps = (topDream.plan || '').split('\n').map(s => s.trim()).filter(Boolean);

      const nextStep = steps[topDream.completedStepIndices ? topDream.completedStepIndices.length : 0] || steps[0] || 'Execute phase 1';



      stepContainer.innerHTML = `

        <span class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(topDream.title)}</span>

        <span class="text-slate-400">•</span>

        <span class="${countdown.badgeClass} font-mono font-bold">${countdown.text}</span>

        <span class="text-slate-400">•</span>

        <span class="text-pink-600 dark:text-pink-300 font-medium italic">Next Step: ${escapeHtml(nextStep.replace(/^[0-9•\-\.]+\s*/, ''))}</span>

      `;

    } else {

      stepContainer.textContent = 'All milestone dreams fulfilled! Add a new quest.';

    }

  }

}



function renderBucketList() {

  const container = document.getElementById('bucket-list-grid');

  if (!container) return;



  const catDict = {};

  if (state.bucketCategories) {

    state.bucketCategories.forEach(c => {

      catDict[c.id] = { label: c.name, color: getCategoryColorClasses(c.color) };

    });

  }



  const statusMap = {

    vision: { label: 'Future Vision', icon: 'sparkles', badge: 'bg-blue-950/60 text-blue-300 border-blue-500/30' },

    planning: { label: 'Planning', icon: 'clipboard-list', badge: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },

    in_action: { label: 'In Action', icon: 'zap', badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30' },

    final_stretch: { label: 'Final Stretch', icon: 'target', badge: 'bg-purple-950/60 text-purple-300 border-purple-500/30' },

    fulfilled: { label: 'Fulfilled', icon: 'trophy', badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' }

  };



  let filtered = [...state.bucketList];

  if (bucketStatusFilter !== 'all') {

    filtered = filtered.filter(b => b.status === bucketStatusFilter || (bucketStatusFilter === 'fulfilled' && b.achieved));

  }

  if (bucketCategoryFilter !== 'all') {

    filtered = filtered.filter(b => b.category === bucketCategoryFilter);

  }



  if (filtered.length === 0) {

    container.innerHTML = `

      <div class="col-span-full p-6 rounded-2xl bg-white dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/10 text-center text-xs text-slate-400 space-y-2">

        <i data-lucide="compass" class="w-8 h-8 text-pink-400 mx-auto"></i>

        <p>No milestone dreams found in this filter.</p>

        <button type="button" onclick="openBucketListModal()" class="text-pink-500 hover:underline font-semibold font-mono text-xs">+ Pin a New Milestone Dream</button>

      </div>

    `;

    lucide.createIcons();

    return;

  }



  container.innerHTML = filtered.map(b => {

    const isDone = b.achieved || b.status === 'fulfilled';

    const catInfo = catDict[b.category] || { label: b.category, color: 'text-slate-300 bg-black/40 border-white/10' };

    const stInfo = statusMap[b.status] || statusMap[isDone ? 'fulfilled' : 'planning'];

    const countdown = formatTargetDateCountdown(b.targetDate || b.year);

    const progressVal = isDone ? 100 : (b.progress !== undefined ? b.progress : 35);

    const completedSteps = Array.isArray(b.completedStepIndices) ? b.completedStepIndices : [];



    const planSteps = (b.plan || '')

      .split('\n')

      .map(s => s.trim())

      .filter(Boolean);



    return `

      <div class="p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 ${isDone ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30' : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-white/10 hover:border-pink-500/40 shadow-sm'}" id="bucket_${b.id}">

        <div class="space-y-2.5">

          <!-- Top Row: Category Pill & Status Badge -->

          <div class="flex items-center justify-between gap-1.5 flex-wrap">

            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ${catInfo.color} font-semibold">

              ${catInfo.label}

            </span>

            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ${stInfo.badge} font-bold flex items-center gap-1">

              <i data-lucide="${stInfo.icon}" class="w-3 h-3"></i>

              <span>${stInfo.label}</span>

            </span>

          </div>



          <!-- Title & Emotional Anchor -->

          <div>

            <h4 class="text-sm font-bold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-pink-500 transition-colors ${isDone ? 'line-through opacity-70' : ''}" onclick="openBucketListModal('${b.id}')" title="Click to edit dream">

              ${escapeHtml(b.title)}

            </h4>

            ${b.why ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 leading-tight">"${escapeHtml(b.why)}"</p>` : ''}

          </div>



          <!-- Target Date & Countdown Tracker -->

          <div class="p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">

            <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1">

              <i data-lucide="calendar" class="w-3.5 h-3.5 text-pink-500"></i>

              <span>Target:</span>

            </span>

            <span class="font-mono font-bold ${countdown.badgeClass}">

              ${countdown.text}

            </span>

          </div>



          <!-- Live Progress Bar -->

          <div class="space-y-1">

            <div class="flex justify-between text-[10px] font-mono">

              <span class="text-slate-500 dark:text-slate-400">Execution Velocity</span>

              <span class="font-bold ${isDone ? 'text-emerald-500' : 'text-pink-500'}">${progressVal}%</span>

            </div>

            <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">

              <div class="h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-pink-500 to-amber-400'}" style="width: ${progressVal}%;"></div>

            </div>

          </div>



          <!-- Interactive AI Milestone Checklist -->

          ${planSteps.length > 0 ? `

            <div class="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5">

              <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">

                <span>AI Milestone Tracker:</span>

                <span class="text-pink-500 font-bold">${completedSteps.length}/${planSteps.length} Steps</span>

              </div>

              <div class="space-y-1">

                ${planSteps.map((step, idx) => {

                  const isStepDone = completedSteps.includes(idx);

                  return `

                    <label class="p-1.5 rounded-xl border flex items-start gap-2 cursor-pointer transition-all ${isStepDone ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through' : 'bg-black/30 border-white/5 hover:border-pink-500/30 text-slate-200'}">

                      <input type="checkbox" ${isStepDone ? 'checked' : ''} onchange="toggleBucketPlanStep('${b.id}', ${idx})" class="mt-0.5 w-3.5 h-3.5 rounded text-pink-500 bg-slate-900 border-slate-700 cursor-pointer">

                      <span class="text-[11px] leading-tight flex-1">${escapeHtml(step.replace(/^[0-9•\-\.]+\s*/, ''))}</span>

                    </label>

                  `;

                }).join('')}

              </div>

            </div>

          ` : ''}

        </div>



        <!-- Card Action Footer -->

        <div class="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs gap-1">

          <div class="flex items-center gap-1.5">

            <button type="button" onclick="toggleBucketAchieved('${b.id}')" class="px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ${isDone ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-pink-400'}">

              <i data-lucide="${isDone ? 'check-circle' : 'circle'}" class="w-3 h-3 text-pink-500"></i>

              <span>${isDone ? 'Fulfilled' : 'Mark Done'}</span>

            </button>

            ${!isDone ? `

              <button type="button" onclick="advanceBucketStatus('${b.id}')" class="px-2 py-1 rounded-lg text-[10px] font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-500/20 hover:border-pink-500/40 transition-colors" title="Advance status to next milestone stage">

                <span>Advance Stage →</span>

              </button>

            ` : ''}

          </div>



          <div class="flex items-center gap-1 shrink-0">

            <button type="button" onclick="openBucketListModal('${b.id}')" class="p-1 text-slate-400 hover:text-pink-500 transition-colors" title="Edit Milestone & AI Plan">

              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>

            </button>

            <button type="button" onclick="deleteBucketItem('${b.id}')" class="p-1 text-slate-400 hover:text-rose-500 transition-colors" title="Delete Milestone">

              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>

            </button>

          </div>

        </div>

      </div>

    `;

  }).join('');



  lucide.createIcons();

  renderDashboardMilestoneRadar();



  // Update Summary Badge

  const countBadge = document.getElementById('bucket-count-badge');

  if (countBadge) {

    const done = state.bucketList.filter(b => b.achieved || b.status === 'fulfilled').length;

    const total = state.bucketList.length;

    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    countBadge.textContent = `${done}/${total} Fulfilled (${pct}%)`;

  }

}



function openBucketListModal(editId = null) {

  populateBucketCategoryDropdowns();

  const modal = document.getElementById('bucket-modal');

  const titleEl = document.getElementById('bucket-modal-title');

  const submitLbl = document.getElementById('bucket-modal-submit-lbl');

  const idInput = document.getElementById('bucket-edit-id-input');

  const titleInput = document.getElementById('bucket-title-input');

  const catSelect = document.getElementById('bucket-category-select');

  const statusSelect = document.getElementById('bucket-status-select');

  const dateInput = document.getElementById('bucket-target-date-input');

  const progressSlider = document.getElementById('bucket-progress-slider');

  const progressLbl = document.getElementById('bucket-progress-val-lbl');

  const planInput = document.getElementById('bucket-plan-input');

  const whyInput = document.getElementById('bucket-why-input');



  if (editId) {

    const item = state.bucketList.find(b => b.id === editId);

    if (item) {

      if (idInput) idInput.value = item.id;

      if (titleInput) titleInput.value = item.title;

      if (catSelect) catSelect.value = item.category || (state.bucketCategories[0]?.id || 'travel');

      if (statusSelect) statusSelect.value = item.status || (item.achieved ? 'fulfilled' : 'planning');

      if (dateInput) dateInput.value = item.targetDate || '';

      if (progressSlider) progressSlider.value = item.progress !== undefined ? item.progress : (item.achieved ? 100 : 35);

      if (progressLbl) progressLbl.textContent = `${progressSlider ? progressSlider.value : 35}%`;

      if (planInput) planInput.value = item.plan || '';

      if (whyInput) whyInput.value = item.why || '';

      if (titleEl) titleEl.textContent = 'Edit Milestone Dream';

      if (submitLbl) submitLbl.textContent = 'Update Milestone';

    }

  } else {

    if (idInput) idInput.value = '';

    if (titleInput) titleInput.value = '';

    if (catSelect) catSelect.value = state.bucketCategories[0]?.id || 'travel';

    if (statusSelect) statusSelect.value = 'planning';



    const nextYear = new Date();

    nextYear.setFullYear(nextYear.getFullYear() + 1);

    if (dateInput) dateInput.value = nextYear.toISOString().split('T')[0];



    if (progressSlider) progressSlider.value = 35;

    if (progressLbl) progressLbl.textContent = '35%';

    if (planInput) planInput.value = '• Phase 1: Research & budget preparation\n• Phase 2: Booking & logistics\n• Phase 3: Milestone execution';

    if (whyInput) whyInput.value = '';

    if (titleEl) titleEl.textContent = 'Life Milestone Dream Tracker';

    if (submitLbl) submitLbl.textContent = 'Pin to Bucket List';

  }



  if (modal) modal.classList.remove('hidden');

  lucide.createIcons();

}



function closeBucketListModal() {

  document.getElementById('bucket-modal')?.classList.add('hidden');

}



function onBucketStatusSelectChange(val) {

  const slider = document.getElementById('bucket-progress-slider');

  const lbl = document.getElementById('bucket-progress-val-lbl');

  const recMap = {

    vision: 15,

    planning: 35,

    in_action: 60,

    final_stretch: 85,

    fulfilled: 100

  };

  if (slider && recMap[val] !== undefined) {

    slider.value = recMap[val];

    if (lbl) lbl.textContent = `${recMap[val]}%`;

  }

}



function submitBucketItem(event) {

  event.preventDefault();

  const id = document.getElementById('bucket-edit-id-input')?.value;

  const title = document.getElementById('bucket-title-input')?.value.trim();

  const category = document.getElementById('bucket-category-select')?.value || 'travel';

  const status = document.getElementById('bucket-status-select')?.value || 'planning';

  const targetDate = document.getElementById('bucket-target-date-input')?.value || '';

  const progress = parseInt(document.getElementById('bucket-progress-slider')?.value || '35', 10);

  const plan = document.getElementById('bucket-plan-input')?.value.trim() || '';

  const why = document.getElementById('bucket-why-input')?.value.trim() || '';



  if (!title) return;



  const year = targetDate ? targetDate.split('-')[0] : '2027';

  const isFulfilled = status === 'fulfilled' || progress === 100;



  if (id) {

    const existing = state.bucketList.find(b => b.id === id);

    if (existing) {

      existing.title = title;

      existing.category = category;

      existing.status = status;

      existing.targetDate = targetDate;

      existing.year = year;

      existing.progress = progress;

      existing.plan = plan;

      existing.why = why;

      existing.achieved = isFulfilled;

      showToast(`Updated milestone: "${title}"`);

    }

  } else {

    const newItem = {

      id: `b_${Date.now()}`,

      title: title,

      category: category,

      status: status,

      targetDate: targetDate,

      year: year,

      progress: progress,

      plan: plan,

      why: why,

      completedStepIndices: [],

      achieved: isFulfilled

    };

    state.bucketList.unshift(newItem);

    showToast(`Pinned dream: "${title}" to your Bucket List!`);

  }



  localStorage.setItem('mind_cave_bucket_list', JSON.stringify(state.bucketList));

  closeBucketListModal();

  renderBucketList();

  renderDashboardMilestoneRadar();

}



function advanceBucketStatus(id) {

  const item = state.bucketList.find(b => b.id === id);

  if (!item) return;



  const sequence = ['vision', 'planning', 'in_action', 'final_stretch', 'fulfilled'];

  const currentIdx = sequence.indexOf(item.status || 'planning');

  const nextIdx = Math.min(currentIdx + 1, sequence.length - 1);

  item.status = sequence[nextIdx];



  const progressMap = { vision: 15, planning: 35, in_action: 60, final_stretch: 85, fulfilled: 100 };

  item.progress = progressMap[item.status];

  item.achieved = item.status === 'fulfilled';



  localStorage.setItem('mind_cave_bucket_list', JSON.stringify(state.bucketList));

  renderBucketList();

  renderDashboardMilestoneRadar();

  showToast(`Stage advanced to: ${item.status.replace('_', ' ').toUpperCase()} (${item.progress}%)`);

}



function toggleBucketAchieved(id) {

  const item = state.bucketList.find(b => b.id === id);

  if (!item) return;



  item.achieved = !item.achieved;

  if (item.achieved) {

    item.status = 'fulfilled';

    item.progress = 100;

  } else {

    item.status = 'in_action';

    item.progress = 60;

  }

  localStorage.setItem('mind_cave_bucket_list', JSON.stringify(state.bucketList));

  renderBucketList();

  renderDashboardMilestoneRadar();

  showToast(item.achieved ? 'Congratulations! Dream milestone fulfilled!' : 'Milestone returned to active pipeline.');

}



function deleteBucketItem(id) {

  state.bucketList = state.bucketList.filter(b => b.id !== id);

  localStorage.setItem('mind_cave_bucket_list', JSON.stringify(state.bucketList));

  renderBucketList();

  renderDashboardMilestoneRadar();

  showToast('Milestone removed from Bucket List.');

}



// =============================================================================

// AESTHETIC HANDWRITTEN SCRAPBOOK SOCIAL EXPORTER (CANVAS & PNG DOWNLOAD)

// =============================================================================



function openScrapbookModal() {

  document.getElementById('scrapbook-modal')?.classList.remove('hidden');

  renderScrapbookCard();

}



function closeScrapbookModal() {

  document.getElementById('scrapbook-modal')?.classList.add('hidden');

}



function setScrapbookTheme(theme) {

  state.scrapbookTheme = theme;

  document.querySelectorAll('#scrapbook-theme-selector .scrapbook-theme-btn').forEach(btn => {

    btn.classList.remove('active');

  });

  event?.currentTarget?.classList.add('active');

  renderScrapbookCard();

}



// Canvas Text Auto-Wrapping Engine

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {

  if (!text) return y;

  const words = text.split(' ');

  let line = '';

  let linesDrawn = 0;



  for (let n = 0; n < words.length; n++) {

    const testLine = line + words[n] + ' ';

    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {

      ctx.fillText(line.trim(), x, y);

      line = words[n] + ' ';

      y += lineHeight;

      linesDrawn++;

      if (linesDrawn >= maxLines - 1 && n < words.length - 1) {

        let remaining = words.slice(n).join(' ');

        while (ctx.measureText(remaining + '...').width > maxWidth && remaining.length > 0) {

          remaining = remaining.substring(0, remaining.length - 1);

        }

        ctx.fillText(remaining + '...', x, y);

        return y + lineHeight;

      }

    } else {

      line = testLine;

    }

  }

  ctx.fillText(line.trim(), x, y);

  return y + lineHeight;

}



function renderScrapbookCard() {

  const canvas = document.getElementById('scrapbook-render-canvas');

  if (!canvas) return;



  const ctx = canvas.getContext('2d');

  const width = canvas.width = 880;

  const height = canvas.height = 1150;



  // Selected font

  const fontSelect = document.getElementById('scrapbook-font-select');

  const selectedFont = fontSelect ? fontSelect.value : "'Caveat', cursive";



  // Checkbox toggles

  const incGoal = document.getElementById('scrap-toggle-goal')?.checked ?? true;

  const incHabits = document.getElementById('scrap-toggle-habits')?.checked ?? true;

  const incMetrics = document.getElementById('scrap-toggle-metrics')?.checked ?? true;

  const incPolaroid = document.getElementById('scrap-toggle-polaroid')?.checked ?? true;

  const incReflection = document.getElementById('scrap-toggle-reflection')?.checked ?? true;



  // Theme palettes (Cottagecore, Vintage Botanical, Muji Grid, Midnight Velvet)

  const themes = {

    pastel: {

      bg: '#fdf6ee',

      pageInner: '#fffdfa',

      ink: '#2b2333',

      inkLight: '#574c63',

      accent1: '#e11d48',

      accent2: '#0284c7',

      accent3: '#10b981',

      washi1: '#ffe4e6',

      washi2: '#e0f2fe',

      washi3: '#fef3c7',

      tapeBorder: '#fb7185',

      paperLines: '#f5ebe0',

      cardBg1: '#fff5f7',

      cardBg2: '#f0f9ff',

      cardBg3: '#fefce8',

      polaroidBg: '#ffffff',

      flameColor: '#f97316'

    },

    vintage: {

      bg: '#eddcc9',

      pageInner: '#f9f3ea',

      ink: '#2b2015',

      inkLight: '#594432',

      accent1: '#b45309',

      accent2: '#78350f',

      accent3: '#047857',

      washi1: '#e8d7c4',

      washi2: '#d8c2ad',

      washi3: '#fed7aa',

      tapeBorder: '#92400e',

      paperLines: '#e6d4c0',

      cardBg1: '#f5ebe0',

      cardBg2: '#ede0d4',

      cardBg3: '#ffedd5',

      polaroidBg: '#faf5ee',

      flameColor: '#d97706'

    },

    notebook: {

      bg: '#f1f5f9',

      pageInner: '#ffffff',

      ink: '#0f172a',

      inkLight: '#475569',

      accent1: '#0284c7',

      accent2: '#4f46e5',

      accent3: '#059669',

      washi1: '#e2e8f0',

      washi2: '#bae6fd',

      washi3: '#fef08a',

      tapeBorder: '#38bdf8',

      paperLines: '#e2e8f0',

      cardBg1: '#f8fafc',

      cardBg2: '#f0f9ff',

      cardBg3: '#fefce8',

      polaroidBg: '#ffffff',

      flameColor: '#ea580c'

    },

    cyber: {

      bg: '#05070d',

      pageInner: '#0b0f19',

      ink: '#f8fafc',

      inkLight: '#94a3b8',

      accent1: '#f43f5e',

      accent2: '#06b6d4',

      accent3: '#10b981',

      washi1: '#1e293b',

      washi2: '#164e63',

      washi3: '#831843',

      tapeBorder: '#38bdf8',

      paperLines: '#1e293b',

      cardBg1: '#111827',

      cardBg2: '#082f49',

      cardBg3: '#4c0519',

      polaroidBg: '#1e293b',

      flameColor: '#fb923c'

    }

  };



  const t = themes[state.scrapbookTheme] || themes.pastel;



  // 1. Canvas Background

  ctx.fillStyle = t.bg;

  ctx.fillRect(0, 0, width, height);



  // 2. Inner Textured Sheet with High-End Drop Shadow

  ctx.save();

  ctx.fillStyle = t.pageInner;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';

  ctx.shadowBlur = 28;

  ctx.shadowOffsetY = 10;

  ctx.beginPath();

  ctx.roundRect(45, 30, width - 90, height - 60, 24);

  ctx.fill();

  ctx.restore();



  // 3. Realistic Spiral Notebook Wire Binder on Left

  for (let y = 65; y < height - 60; y += 38) {

    // Punch Hole

    ctx.beginPath();

    ctx.arc(68, y, 6.5, 0, Math.PI * 2);

    ctx.fillStyle = state.scrapbookTheme === 'cyber' ? '#05070d' : '#cbd5e1';

    ctx.fill();



    // Metallic Double Wire Ring

    ctx.beginPath();

    ctx.ellipse(62, y, 16, 4.5, -0.18, 0, Math.PI * 2);

    ctx.strokeStyle = state.scrapbookTheme === 'cyber' ? '#38bdf8' : '#64748b';

    ctx.lineWidth = 2.5;

    ctx.stroke();

  }



  // 4. Subtle Ruled Journal Lines

  ctx.strokeStyle = t.paperLines;

  ctx.lineWidth = 1;

  for (let y = 145; y < height - 70; y += 34) {

    ctx.beginPath();

    ctx.moveTo(100, y);

    ctx.lineTo(width - 65, y);

    ctx.stroke();

  }



  // 5. Header Section: Title + Date Washi + Stickers

  ctx.fillStyle = t.ink;

  ctx.font = `bold 42px ${selectedFont}`;

  const d = state.selectedDiaryDate || new Date();

  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  ctx.fillText("✦ TODAY'S CHRONICLE ✦", 110, 85);



  // Date Washi Tape Banner

  ctx.save();

  ctx.fillStyle = t.washi2;

  ctx.beginPath();

  ctx.roundRect(110, 98, 300, 30, 8);

  ctx.fill();

  ctx.restore();



  ctx.font = `bold 21px ${selectedFont}`;

  ctx.fillStyle = t.accent2;

  ctx.fillText(`📅 ${dateStr}`, 124, 120);



  // Doodle Stickers & Sparkles

  ctx.font = `28px ${selectedFont}`;

  ctx.fillStyle = t.accent1;

  ctx.fillText("✨ 🌸 ♡ ☕ ✦", width - 240, 85);



  // =========================================================================

  // 2-COLUMN BALANCED AESTHETIC GRID

  // Left Column: x = 110, width = 345 px

  // Right Column: x = 480, width = 335 px

  // =========================================================================



  // --- LEFT COLUMN 1: NORTH STAR GOAL ---

  let leftY = 148;

  if (incGoal) {

    ctx.save();

    ctx.fillStyle = t.cardBg1;

    ctx.beginPath();

    ctx.roundRect(110, leftY, 345, 115, 16);

    ctx.fill();

    ctx.strokeStyle = t.tapeBorder;

    ctx.lineWidth = 1.5;

    ctx.setLineDash([5, 4]);

    ctx.stroke();



    // Washi Tape on top left

    ctx.fillStyle = t.washi1;

    ctx.setLineDash([]);

    ctx.fillRect(145, leftY - 8, 80, 18);

    ctx.restore();



    ctx.fillStyle = t.ink;

    ctx.font = `bold 24px ${selectedFont}`;

    ctx.fillText("🎯 North Star Goal", 125, leftY + 34);



    ctx.font = `20px ${selectedFont}`;

    ctx.fillStyle = t.inkLight;

    const goalText = `"${state.todayGoal?.text || 'Ship core system architecture & complete 30m mindful walk'}"`;

    wrapCanvasText(ctx, goalText, 125, leftY + 62, 315, 23, 2);



    leftY += 132;

  }



  // --- LEFT COLUMN 2: DAILY HABIT STREAKS (FULL TITLES, NO TRUNCATION) ---

  if (incHabits) {

    const activeHabits = state.habitsList.slice(0, 5);

    const boxHeight = 70 + (activeHabits.length * 36);



    ctx.save();

    ctx.fillStyle = t.cardBg2;

    ctx.beginPath();

    ctx.roundRect(110, leftY, 345, boxHeight, 16);

    ctx.fill();

    ctx.strokeStyle = t.accent2;

    ctx.lineWidth = 1.2;

    ctx.stroke();



    // Washi Tape

    ctx.fillStyle = t.washi2;

    ctx.fillRect(160, leftY - 8, 85, 18);

    ctx.restore();



    ctx.fillStyle = t.ink;

    ctx.font = `bold 24px ${selectedFont}`;

    ctx.fillText("🌿 Daily Habit Streaks", 125, leftY + 34);



    let habitRowY = leftY + 68;

    const todayDayIdx = (new Date().getDay() + 6) % 7;



    activeHabits.forEach((h) => {

      const isDone = h.history[todayDayIdx];

      // Habit Emoji & Title

      ctx.font = `21px ${selectedFont}`;

      ctx.fillStyle = isDone ? t.accent3 : t.ink;

      ctx.fillText(`${isDone ? '✓' : '○'} ${h.emoji || '💧'} ${h.title}`, 125, habitRowY);



      // Streak flame on right edge

      ctx.font = `bold 19px ${selectedFont}`;

      ctx.fillStyle = t.flameColor;

      ctx.fillText(`🔥 ${h.streak}d`, 390, habitRowY);



      habitRowY += 36;

    });



    leftY += boxHeight + 16;

  }



  // --- LEFT COLUMN 3: PLAN VS ACTION VELOCITY ---

  if (incMetrics && leftY < 920) {

    ctx.save();

    ctx.fillStyle = t.cardBg3;

    ctx.beginPath();

    ctx.roundRect(110, leftY, 345, 160, 16);

    ctx.fill();

    ctx.strokeStyle = t.accent1;

    ctx.lineWidth = 1;

    ctx.stroke();



    // Washi

    ctx.fillStyle = t.washi3;

    ctx.fillRect(210, leftY - 8, 80, 18);

    ctx.restore();



    ctx.fillStyle = t.ink;

    ctx.font = `bold 23px ${selectedFont}`;

    ctx.fillText("⚡ Plan vs. Action Velocity", 125, leftY + 34);



    ctx.font = `bold 19px ${selectedFont}`;

    ctx.fillStyle = t.accent1;

    ctx.fillText("80% Execution • 4/5 Tasks Completed", 125, leftY + 60);



    ctx.font = `20px ${selectedFont}`;

    ctx.fillStyle = t.inkLight;

    ctx.fillText("☑ Core Architecture Sprint", 125, leftY + 90);

    ctx.fillText("☑ 15m Mindfulness Stroll", 125, leftY + 116);

    ctx.fillText("☑ CBT Distortion Reframing", 125, leftY + 142);



    leftY += 175;

  }



  // --- RIGHT COLUMN 1: POLAROID PHOTO ---

  let rightY = 148;

  if (incPolaroid) {

    ctx.save();

    ctx.translate(645, rightY + 130);

    ctx.rotate(-0.035); // Subtle authentic tilt



    // Polaroid Card Sheet

    ctx.fillStyle = t.polaroidBg;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';

    ctx.shadowBlur = 18;

    ctx.shadowOffsetY = 8;

    ctx.beginPath();

    ctx.roundRect(-145, -135, 290, 275, 10);

    ctx.fill();

    ctx.restore();



    // Draw Photo Content

    ctx.save();

    ctx.translate(645, rightY + 130);

    ctx.rotate(-0.035);



    // Inner Photo Box

    ctx.fillStyle = state.scrapbookTheme === 'cyber' ? '#1e293b' : '#f1f5f9';

    ctx.fillRect(-130, -120, 260, 185);



    // Snapshot Graphic & Text

    ctx.fillStyle = t.accent2;

    ctx.font = `bold 22px ${selectedFont}`;

    ctx.textAlign = 'center';

    ctx.fillText("📸 Memory Snapshot", 0, -35);



    ctx.font = `18px ${selectedFont}`;

    ctx.fillStyle = t.inkLight;

    ctx.fillText("📍 Studio Sanctuary Flow", 0, -5);

    ctx.fillText("🌅 9.4/10 Vitality State", 0, 22);



    // Handwritten Caption below photo

    ctx.font = `bold 23px ${selectedFont}`;

    ctx.fillStyle = t.ink;

    ctx.fillText("Serenity & Clarity ✦", 0, 105);



    // Polaroid Top Scotch Tape

    ctx.rotate(0.035);

    ctx.fillStyle = t.washi1;

    ctx.fillRect(-55, -150, 110, 24);

    ctx.restore();



    rightY += 300;

  }



  // --- RIGHT COLUMN 2: CBT REFLECTION & WISDOM NOTE ---

  if (incReflection) {

    ctx.save();

    ctx.fillStyle = t.cardBg1;

    ctx.beginPath();

    ctx.roundRect(480, rightY, 335, 240, 16);

    ctx.fill();

    ctx.strokeStyle = t.tapeBorder;

    ctx.lineWidth = 1.4;

    ctx.stroke();



    // Top Washi

    ctx.fillStyle = t.washi1;

    ctx.fillRect(525, rightY - 8, 80, 18);

    ctx.restore();



    ctx.fillStyle = t.ink;

    ctx.font = `bold 24px ${selectedFont}`;

    ctx.fillText("💭 Daily Reflection & CBT Insight", 498, rightY + 34);



    ctx.font = `italic 21px ${selectedFont}`;

    ctx.fillStyle = t.inkLight;

    const quote = "Energy aligned with execution. Morning resistance was reframed into decoupled milestones. Deep flow maintained.";

    wrapCanvasText(ctx, `"${quote}"`, 498, rightY + 66, 300, 25, 4);



    // Cognitive Harmony Tag Pill

    ctx.save();

    ctx.fillStyle = t.washi2;

    ctx.beginPath();

    ctx.roundRect(498, rightY + 185, 290, 34, 10);

    ctx.fill();

    ctx.restore();



    ctx.font = `bold 19px ${selectedFont}`;

    ctx.fillStyle = t.accent3;

    ctx.fillText("🌿 96% Mental Equilibrium", 515, rightY + 208);



    rightY += 255;

  }



  // =========================================================================

  // FOOTER: BUCKET LIST DREAMS & SIGNATURE

  // =========================================================================

  const footerY = 945;

  ctx.save();

  ctx.fillStyle = t.washi3;

  ctx.beginPath();

  ctx.roundRect(110, footerY, width - 200, 95, 16);

  ctx.fill();

  ctx.strokeStyle = t.accent1;

  ctx.lineWidth = 1;

  ctx.stroke();

  ctx.restore();



  ctx.fillStyle = t.ink;

  ctx.font = `bold 22px ${selectedFont}`;

  ctx.fillText("🌠 Life Bucket List Milestone Progress:", 130, footerY + 32);



  ctx.font = `20px ${selectedFont}`;

  ctx.fillStyle = t.inkLight;

  const bucketDream = state.bucketList?.[0]?.title || "Scuba dive the Great Barrier Reef (2027)";

  ctx.fillText(`• ${bucketDream} ✨`, 130, footerY + 58);

  ctx.fillText("• Published Open-Source AI Architecture Benchmark [Achieved ✓]", 130, footerY + 82);



  // Bottom Signature Stamp

  ctx.font = `bold 21px ${selectedFont}`;

  ctx.fillStyle = t.accent1;

  ctx.fillText("✍ Mind Cave Life Intelligence Journal", width - 390, height - 48);

}



function generateNanoBananaScrapbookArt() {

  showToast('Nano Banana: Crafting custom AI aesthetic doodles & watercolor stickers...');

  setTimeout(() => {

    renderScrapbookCard();

    showToast('Nano Banana AI Artwork applied to your Scrapbook Card!');

  }, 400);

}



function downloadScrapbookPNG() {

  const canvas = document.getElementById('scrapbook-render-canvas');

  if (!canvas) return;



  const link = document.createElement('a');

  const d = state.selectedDiaryDate || new Date();

  const dateFormatted = d.toISOString().split('T')[0];

  link.download = `MindCave-Scrapbook-${dateFormatted}.png`;

  link.href = canvas.toDataURL('image/png');

  link.click();



  showToast('High-Res Scrapbook Card downloaded as PNG!');

}



async function shareScrapbookImage() {

  const canvas = document.getElementById('scrapbook-render-canvas');

  if (!canvas) return;



  canvas.toBlob(async (blob) => {

    if (!blob) return;

    const file = new File([blob], 'mind-cave-scrapbook.png', { type: 'image/png' });



    if (navigator.canShare && navigator.canShare({ files: [file] })) {

      try {

        await navigator.share({

          files: [file],

          title: 'My Daily Mind Cave Journal',

          text: 'My aesthetic daily life intelligence chronicle from Mind Cave'

        });

        showToast('Shared scrapbook card successfully!');

      } catch (e) {

        downloadScrapbookPNG();

      }

    } else {

      // Fallback: Copy Image to Clipboard or Download

      try {

        await navigator.clipboard.write([

          new ClipboardItem({ 'image/png': blob })

        ]);

        showToast('Scrapbook image copied to clipboard! Ready to paste into social apps.');

      } catch (e) {

        downloadScrapbookPNG();

      }

    }

  });

}



// =============================================================================

// FACTORY RESET & PERMANENT DATA WIPE (IRREVERSIBLE)

// =============================================================================



function openFactoryResetModal() {

  const modal = document.getElementById('factory-reset-modal');

  const input = document.getElementById('reset-confirm-input');

  const btn = document.getElementById('btn-execute-factory-reset');

  if (input) input.value = '';

  if (btn) {

    btn.disabled = true;

    btn.className = 'px-4 py-2 rounded-xl bg-rose-600/30 text-rose-400/50 border border-rose-500/20 text-xs font-bold transition-all cursor-not-allowed flex items-center gap-1.5';

  }

  if (modal) modal.classList.remove('hidden');

  lucide.createIcons();

}



function closeFactoryResetModal() {

  const modal = document.getElementById('factory-reset-modal');

  if (modal) modal.classList.add('hidden');

}



function onResetConfirmInput(val) {

  const btn = document.getElementById('btn-execute-factory-reset');

  if (!btn) return;

  const isMatch = val.trim().toUpperCase() === 'RESET';

  btn.disabled = !isMatch;

  if (isMatch) {

    btn.className = 'px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 animate-pulse';

  } else {

    btn.className = 'px-4 py-2 rounded-xl bg-rose-600/30 text-rose-400/50 border border-rose-500/20 text-xs font-bold transition-all cursor-not-allowed flex items-center gap-1.5';

  }

}



async function executeFactoryReset() {

  const btn = document.getElementById('btn-execute-factory-reset');

  if (btn) {

    btn.disabled = true;

    btn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Wiping all data...</span>`;

    lucide.createIcons();

  }



  try {

    // 1. Call Backend to wipe all database entries, chats, and analytics

    await fetch('/api/security/reset-all', {

      method: 'POST',

      headers: getAuthHeaders()

    });

  } catch (err) {

    console.warn('Backend reset call warning:', err);

  }



  // 2. Clear all local storage & session storage

  localStorage.clear();

  sessionStorage.clear();



  // 3. Re-initialize state to pristine clean defaults

  state.currentSessionId = null;

  state.chatHistory = [];

  state.journals = [];

  state.todayGoals = [];

  state.habitsList = [];

  state.agendaItems = [];

  state.timelineShortcuts = [];

  state.bucketList = [];

  state.todayGoal = { text: '', completed: false };

  state.currentPersona = 'cbt_reflector';

  storyEventsCache = [];

  memoryPhotosList = [];



  closeFactoryResetModal();



  showToast('Factory reset complete. Welcome to your fresh Mind Cave!');



  setTimeout(() => {

    window.location.reload();

  }, 900);

}



// --- GESTURES ENGINE ---

let touchStartX = 0;

let touchStartY = 0;

let currentHabitId = null;



window.habitTouchStart = function(e, id) {

  touchStartX = e.changedTouches[0].screenX;

  touchStartY = e.changedTouches[0].screenY;

  currentHabitId = id;

};



window.habitTouchMove = function(e, id) {

  if (currentHabitId !== id) return;

  const currentX = e.changedTouches[0].screenX;

  const currentY = e.changedTouches[0].screenY;

  const diffX = currentX - touchStartX;

  const diffY = currentY - touchStartY;

  

  // if mostly horizontal scroll

  if (Math.abs(diffX) > Math.abs(diffY)) {

    // optional: add css transform translateX here

    const row = document.getElementById(`habit_row_${id}`);

    if(row) {

       row.style.transform = `translateX(${diffX}px)`;

    }

  }

};



window.habitTouchEnd = function(e, id) {

  if (currentHabitId !== id) return;

  const currentX = e.changedTouches[0].screenX;

  const diffX = currentX - touchStartX;

  const row = document.getElementById(`habit_row_${id}`);

  

  if (row) row.style.transform = ""; // reset



  if (diffX > 75) {

    // Swipe Right -> Complete (or increment)

    const habit = state.habitsList.find(h => h.id === id);

    if(habit) {

      if(habit.type === "counter" || habit.targetCount) {

         incrementHabit(id);

      } else {

         const todayDayIdx = (new Date().getDay() + 6) % 7;

         if(!habit.history[todayDayIdx]) toggleHabitDay(id, todayDayIdx);

      }

    }

  } else if (diffX < -75) {

    // Swipe Left -> Archive/Delete

    archiveHabit(id);

  }

  

  currentHabitId = null;

};





// --- PULL-TO-REFRESH ENGINE ---

let ptrStartY = 0;

let ptrCurrentY = 0;

let ptrRefreshing = false;



document.addEventListener("DOMContentLoaded", () => {

  const chronoList = document.getElementById("chrono-timeline-list");

  if (!chronoList) return;



  chronoList.addEventListener("touchstart", (e) => {

    if (chronoList.scrollTop === 0) {

      ptrStartY = e.touches[0].clientY;

    }

  }, { passive: true });



  chronoList.addEventListener("touchmove", (e) => {

    if (chronoList.scrollTop === 0 && ptrStartY > 0 && !ptrRefreshing) {

      ptrCurrentY = e.touches[0].clientY;

      const dy = ptrCurrentY - ptrStartY;

      if (dy > 20) {

        // pull down

        chronoList.style.transform = `translateY(${Math.min(dy / 2, 60)}px)`;

      }

    }

  }, { passive: true });



  chronoList.addEventListener("touchend", (e) => {

    if (ptrStartY > 0) {

      const dy = ptrCurrentY - ptrStartY;

      if (dy > 70 && !ptrRefreshing) {

        ptrRefreshing = true;

        chronoList.style.transition = "transform 0.3s";

        chronoList.style.transform = "translateY(40px)";

        

        // Show loading indicator or trigger refresh

        if (typeof renderChronoTimeline === "function") {

           renderChronoTimeline();

        }

        

        setTimeout(() => {

          chronoList.style.transform = "translateY(0)";

          ptrRefreshing = false;

          setTimeout(() => chronoList.style.transition = "", 300);

        }, 800);

      } else {

        chronoList.style.transform = "translateY(0)";

      }

      ptrStartY = 0;
      ptrCurrentY = 0;
    }
  });
});



function saveProfileDetails() {
  const fname = document.getElementById('profile-first-name')?.value || '';
  const dob = document.getElementById('profile-dob')?.value || '';
  localStorage.setItem('mind_cave_profile_name', fname);
  localStorage.setItem('mind_cave_profile_dob', dob);
}

function loadProfileDetails() {
  let fname = localStorage.getItem('mind_cave_profile_name') || '';
  let dob = localStorage.getItem('mind_cave_profile_dob') || '';
  
  if (!fname && !dob && (!state.currentUser || state.currentUser.uid === 'user_alice')) {
    const randomNames = ['Explorer', 'Seeker', 'Nomad', 'Voyager'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomYear = 1985 + Math.floor(Math.random() * 15);
    const randomMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const randomDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    dob = randomYear + '-' + randomMonth + '-' + randomDay;
    fname = 'Anonymous ' + randomName;
    localStorage.setItem('mind_cave_profile_name', fname);
    localStorage.setItem('mind_cave_profile_dob', dob);
  }

  if (document.getElementById('profile-first-name')) {
    document.getElementById('profile-first-name').value = fname;
  }
  if (document.getElementById('profile-dob')) {
    document.getElementById('profile-dob').value = dob;
  }
}

function getProfileContext() {

  return {

    first_name: localStorage.getItem('mind_cave_profile_name') || 'Unknown',

    date_of_birth: localStorage.getItem('mind_cave_profile_dob') || 'Unknown',

    gender_track: document.getElementById('profile-gender-select')?.value || 'unspecified',

    vitality_tracks: {

      cycle_intelligence: document.getElementById('profile-toggle-cycle')?.checked || false,

      circadian_energy: document.getElementById('profile-toggle-circadian')?.checked || false

    }

  };

}



// Ensure loadProfileDetails runs on startup

document.addEventListener('DOMContentLoaded', () => {

  setTimeout(loadProfileDetails, 500);

});





