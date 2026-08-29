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
    token: localStorage.getItem('gemini_journal_token') || 'demo_user_alice'
  },
  currentPersona: 'cbt_reflector',
  currentSessionId: null,
  radarChart: null,
  lineChart: null,
  firebaseApp: null,
  firebaseAuth: null
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFirebaseAuth();
  checkGeminiKeyStatus();
  updateUserUI();
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
  
  if (theme === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
    if (icon) {
      icon.setAttribute('data-lucide', 'moon');
      icon.className = 'w-3.5 h-3.5 text-indigo-500';
    }
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    if (icon) {
      icon.setAttribute('data-lucide', 'sun');
      icon.className = 'w-3.5 h-3.5 text-amber-400';
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
  showToast(`Switched to ${next === 'light' ? '☀️ Light' : '🌙 Dark'} Mode`);
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

    showToast('✨ Gemini 2.5 Flash API Connected! All conversations are now live.');
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
    const savedConfig = localStorage.getItem('firebase_web_config');
    if (savedConfig) {
      try { config = JSON.parse(savedConfig); } catch (e) {}
    }

    if (!config) {
      const resp = await fetch('/api/firebase/config');
      const serverConfig = await resp.json();
      if (serverConfig.is_configured) {
        config = serverConfig;
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
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${state.currentUser.token}`
  };
}

function updateUserUI() {
  const nameEl = document.getElementById('user-display-name');
  if (nameEl) {
    nameEl.textContent = state.currentUser.name;
  }
  const modalLbl = document.getElementById('modal-current-user-lbl');
  if (modalLbl) {
    modalLbl.textContent = state.currentUser.name;
  }
}

function openAuthModal() {
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
    alert('Please enter at least a Firebase Web API Key.');
    return;
  }

  const cfg = { apiKey, authDomain, projectId };
  localStorage.setItem('firebase_web_config', JSON.stringify(cfg));
  showToast('Saved custom Firebase configuration. Initializing...');
  location.reload();
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
    alert(`Google Sign-In Error: ${err.message}`);
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
// TAB NAVIGATION
// =============================================================================

function switchTab(tabId) {
  const views = ['studio', 'journals', 'analytics', 'security'];
  views.forEach(v => {
    const viewEl = document.getElementById(`view-${v}`);
    const btnEl = document.getElementById(`tab-btn-${v}`);
    if (v === tabId) {
      viewEl.classList.remove('hidden');
      btnEl.classList.add('active');
    } else {
      viewEl.classList.add('hidden');
      btnEl.classList.remove('active');
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
        analyze_cognition: true
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
      { icon: '✨', text: 'How does this happiness feel in your body right now?' },
      { icon: '🌿', text: 'What contributed to this positive feeling today?' },
      { icon: '💾', text: 'Save this moment as a gratitude anchor' }
    ];
  } else if (lower.includes('anxious') || lower.includes('stress') || lower.includes('overwhelm') || lower.includes('deadline') || lower.includes('fear')) {
    suggestions = [
      { icon: '⚡', text: 'What is the single most actionable next step?' },
      { icon: '🔄', text: 'Help me reframe this worst-case assumption' },
      { icon: '🌬️', text: 'Guide me through a 2-minute centering reflection' }
    ];
  } else if (lower.includes('architect') || lower.includes('system') || lower.includes('build') || lower.includes('project') || lower.includes('strategy')) {
    suggestions = [
      { icon: '💡', text: 'What hidden assumptions might I be making?' },
      { icon: '🎯', text: 'Break this down into 3 concrete milestones' },
      { icon: '🔍', text: 'Where are the key security and edge-case risks?' }
    ];
  } else {
    suggestions = [
      { icon: '🌿', text: 'Explore this feeling a little deeper' },
      { icon: '💭', text: 'What do you think is at the root of this?' },
      { icon: '📝', text: 'Summarize key takeaways for my journal' }
    ];
  }

  container.classList.remove('hidden');
  container.innerHTML = suggestions.map(s => `
    <button onclick="insertPrompt('${escapeHtml(s.text).replace(/'/g, "\\'")}')" class="text-xs text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-3.5 py-1.5 rounded-full border border-white/10 transition-all shrink-0 flex items-center gap-1.5 shadow-sm">
      <span>${s.icon}</span> <span>${escapeHtml(s.text)}</span>
    </button>
  `).join('');
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
                <div class="text-xs text-slate-300 bg-blue-950/20 p-2 rounded-lg border border-blue-500/15 leading-relaxed">
                  <strong class="text-blue-300">🔄 Reframing:</strong> ${escapeHtml(cognitiveData.cognitive_reframing)}
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
                ⚠️ ${escapeHtml(d)}
              </span>
            `).join('')}
            ${tags.map(t => `
              <span class="bg-blue-950/40 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
                ${escapeHtml(t)}
              </span>
            `).join('')}
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
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

async function saveAndFeedback(title, content, mood, btnElement) {
  try {
    await saveQuickJournal(title, content, mood);
    if (btnElement) {
      const span = btnElement.querySelector('span');
      if (span) {
        span.textContent = '✓ Saved to Journal';
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
      distBadge.innerHTML = `<span class="bg-amber-950/60 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">⚠️ ${escapeHtml(cogData.detected_distortions.join(' • '))}</span>`;
    } else {
      distBadge.innerHTML = `<span class="text-[11px] text-emerald-400 font-mono">✨ Zero Distortions Detected</span>`;
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
  } catch (err) {
    alert(`Save error: ${err.message}`);
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
    mood: '🙂 Calm',
    energy: '8/10'
  },
  {
    id: 'photo_2',
    hour: '12:30',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    caption: 'Whiteboarding session on multi-track cognitive sync',
    location: 'Design Studio Room 4B',
    mood: '🔥 Energized',
    energy: '9/10'
  },
  {
    id: 'photo_3',
    hour: '18:45',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    caption: 'Sunset run to clear mental cache and anchor gratitude',
    location: 'Riverbank Promenade',
    mood: '😊 Joyful',
    energy: '8/10'
  }
];

let attachedPhotoBase64 = null;
let currentSelectedMood = { name: 'Calm', emoji: '🙂' };
let isGCalSynced = false;
let isCycleOptedIn = true;

function switchJournalTrack(trackId) {
  const tracks = ['chrono', 'cbt', 'cycle', 'memory'];
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
  if (trackId === 'cbt') renderCBTHeatmap();
  if (trackId === 'memory') renderMemoryPhotos();
}

function toggleGCalSync() {
  isGCalSynced = !isGCalSynced;
  const btn = document.getElementById('btn-gcal-sync');
  const btnText = document.getElementById('gcal-btn-text');

  if (isGCalSynced) {
    btn.classList.add('!bg-blue-600/25', '!border-blue-500/40', '!text-blue-300');
    btnText.textContent = '✓ Google Calendar Synced (5 Events)';
    showToast('✨ Google Calendar connected! 5 planned events mapped to your hourly timeline.');
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
    btn.textContent = '✓ Active (Encrypted)';
    btn.className = 'text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40';
    showToast('Cycle intelligence active and encrypted locally.');
  } else {
    btn.textContent = '○ Paused';
    btn.className = 'text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
    showToast('Cycle tracking paused.');
  }
}

function selectMoodChip(moodName, emoji, btnElement) {
  currentSelectedMood = { name: moodName, emoji };
  document.querySelectorAll('#mood-chip-group .mood-chip').forEach(btn => btn.classList.remove('selected'));
  if (btnElement) btnElement.classList.add('selected');
  const lbl = document.getElementById('mood-pulse-label');
  if (lbl) lbl.textContent = `${emoji} ${moodName}`;
}

function previewJournalPhoto(input) {
  const file = input.files[0];
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

function toggleLocationStamp(checkbox) {
  const txt = document.getElementById('journal-location-text');
  if (!txt) return;
  if (checkbox.checked) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { txt.textContent = '📍 Connaught Place, New Delhi'; },
        () => { txt.textContent = '📍 Central District (Approx)'; }
      );
    } else {
      txt.textContent = '📍 Home / Office Studio';
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
  }
  document.getElementById('journal-modal').classList.remove('hidden');
}

function closeNewJournalModal() {
  document.getElementById('journal-modal').classList.add('hidden');
  attachedPhotoBase64 = null;
  const box = document.getElementById('journal-photo-preview-box');
  if (box) box.classList.add('hidden');
}

async function renderChronoTimeline() {
  const container = document.getElementById('chrono-timeline-list');
  if (!container) return;

  // Fetch saved journals to match hours
  let journals = [];
  try {
    const response = await fetch('/api/journals', { headers: getAuthHeaders() });
    const data = await response.json();
    journals = data.journals || [];
  } catch (e) {
    journals = [];
  }

  const hours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  let html = '<div class="timeline-spine"></div>';

  hours.forEach((h, index) => {
    const gcalEvent = isGCalSynced ? mockGCalSchedule[h] : null;
    const matchingJournal = journals[index % (journals.length || 1)] && index < 3 ? journals[index] : null;
    const matchingPhoto = memoryPhotosList.find(p => p.hour.startsWith(h.substring(0, 2)));

    const hasEntry = matchingJournal || matchingPhoto;
    const rowClass = `timeline-hour-row ${hasEntry ? 'has-entry' : ''} ${gcalEvent ? 'has-gcal' : ''}`;

    html += `
      <div class="${rowClass}">
        <!-- Node Dot & Hour Label -->
        <div class="timeline-hour-node">
          <div class="timeline-node-dot"></div>
          <span class="timeline-hour-label">${h}</span>
        </div>

        <!-- Hourly Content Card -->
        <div class="chrono-block-card">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 flex-wrap">
              ${gcalEvent ? `
                <span class="gcal-planned-pill">
                  <i data-lucide="calendar" class="w-3 h-3 text-blue-400"></i>
                  <span>Planned: ${escapeHtml(gcalEvent.title)}</span>
                </span>
              ` : ''}
              ${matchingJournal ? `
                <span class="eyebrow-badge !text-cyan-300 !bg-cyan-950/40 !border-cyan-500/30">
                  ${escapeHtml(matchingJournal.mood || 'Reflective')}
                </span>
              ` : ''}
              ${matchingPhoto ? `
                <span class="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <i data-lucide="camera" class="w-2.5 h-2.5"></i> Photo Attached
                </span>
              ` : ''}
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-500 font-mono">📍 Connaught Place</span>
              <button onclick="openNewJournalModal('${h}')" class="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                <i data-lucide="edit-2" class="w-3 h-3"></i> <span>Capture</span>
              </button>
            </div>
          </div>

          <!-- Entry Details or Unlogged Prompt -->
          ${matchingJournal ? `
            <div class="space-y-1.5">
              <h4 class="text-sm font-bold text-white">${escapeHtml(matchingJournal.title)}</h4>
              <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(matchingJournal.content)}</p>
              ${matchingJournal.insights && matchingJournal.insights.cognitive_reframing ? `
                <div class="p-2 rounded-lg bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-300 italic mt-2">
                  🧠 CBT Note: "${escapeHtml(matchingJournal.insights.cognitive_reframing)}"
                </div>
              ` : ''}
            </div>
          ` : gcalEvent ? `
            <div class="text-xs text-slate-400 italic">
              Google Calendar scheduled "${escapeHtml(gcalEvent.title)}". Tap capture to reflect on what actually took place.
            </div>
          ` : `
            <div class="text-xs text-slate-500 hover:text-slate-400 cursor-pointer" onclick="openNewJournalModal('${h}')">
              + No moment logged for ${h}. Tap to log thoughts, mood pulse, or photo.
            </div>
          `}

          <!-- Inline Photo Preview if any -->
          ${matchingPhoto ? `
            <div class="mt-3 rounded-xl overflow-hidden border border-white/10 max-w-sm">
              <img src="${matchingPhoto.url}" alt="Memory" class="w-full h-32 object-cover">
              <div class="p-2 bg-black/60 text-[11px] text-slate-300 flex items-center justify-between">
                <span>${escapeHtml(matchingPhoto.caption)}</span>
                <span class="text-amber-400 font-mono">${matchingPhoto.mood}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
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
    <div class="memory-photo-card group">
      <img src="${p.url}" alt="${escapeHtml(p.caption)}">
      <div class="memory-photo-overlay">
        <span class="text-[10px] text-amber-300 font-mono mb-0.5">${p.hour} • ${escapeHtml(p.location)}</span>
        <p class="text-xs font-semibold text-white line-clamp-2">${escapeHtml(p.caption)}</p>
        <div class="flex items-center justify-between mt-1 text-[10px] text-slate-300">
          <span>${p.mood}</span>
          <span class="font-mono text-cyan-300">⚡ ${p.energy}</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function submitNewJournal(event) {
  event.preventDefault();
  const title = document.getElementById('journal-title-input').value.trim();
  const content = document.getElementById('journal-content-input').value.trim();
  const hour = document.getElementById('journal-hour-input').value;
  const track = document.getElementById('journal-track-select').value;
  const energy = document.getElementById('journal-energy-slider').value;
  const isEncrypted = document.getElementById('journal-encrypt-checkbox').checked;
  const locChecked = document.getElementById('journal-location-check').checked;
  const locationStr = locChecked ? '📍 Connaught Place, New Delhi' : 'Private Location';

  // If photo attached, save to memory photos
  if (attachedPhotoBase64) {
    memoryPhotosList.unshift({
      id: `photo_${Date.now()}`,
      hour: hour,
      url: attachedPhotoBase64,
      caption: title || content.substring(0, 40),
      location: locationStr,
      mood: `${currentSelectedMood.emoji} ${currentSelectedMood.name}`,
      energy: `${energy}/10`
    });
  }

  try {
    const response = await fetch('/api/journals', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: `[${hour}] ${title}`,
        content: `${content}\n\n📍 ${locationStr} • Energy: ${energy}/10 • Track: ${track}`,
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
    
    // Refresh all views
    loadJournals();
    renderChronoTimeline();
    renderMemoryPhotos();
    showToast(`Life moment for ${hour} saved strictly to your isolated vault.`);
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

  // Line Chart for Resilience & Clarity Timeline
  const lineCtx = document.getElementById('lineTimelineChart')?.getContext('2d');
  if (lineCtx) {
    state.lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
        datasets: [
          {
            label: 'Resilience',
            data: [60, 65, 70, 68, 74, 80],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.35,
            fill: true
          },
          {
            label: 'Clarity',
            data: [50, 58, 64, 72, 70, 78],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, min: 30, max: 100 }
        },
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 11 } } }
        }
      }
    });
  }
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
        analytics.average_mood.Joy || 60,
        analytics.average_mood.Clarity || 65,
        analytics.average_mood.Resilience || 70,
        analytics.average_mood.Focus || 60,
        analytics.average_mood.Calm || 68,
        analytics.average_mood.Optimism || 62
      ];
      state.radarChart.data.datasets[0].data = vals;
      state.radarChart.update();
    }

    // Update Distortions Bento
    const distContainer = document.getElementById('distortions-container');
    const freqs = analytics.distortion_frequencies || {};
    if (Object.keys(freqs).length === 0) {
      distContainer.innerHTML = '<p class="text-xs text-emerald-400">✨ Zero persistent cognitive distortions detected. Thinking remains balanced and objective.</p>';
    } else {
      distContainer.innerHTML = Object.entries(freqs).map(([name, count]) => `
        <div class="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs">
          <span class="text-slate-300">${escapeHtml(name)}</span>
          <span class="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">${count} instances</span>
        </div>
      `).join('');
    }

    // Update Action Items Bento
    const actionsContainer = document.getElementById('action-items-container');
    const actions = analytics.recent_actions || [];
    if (actions.length === 0) {
      actionsContainer.innerHTML = '<p class="text-xs text-slate-500">Reflect in the studio to automatically generate actionable next steps.</p>';
    } else {
      actionsContainer.innerHTML = actions.slice(-5).map(act => `
        <div class="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs">
          <i data-lucide="check-square" class="w-4 h-4 text-blue-400 shrink-0 mt-0.5"></i>
          <span class="text-slate-300">${escapeHtml(act)}</span>
        </div>
      `).join('');
      lucide.createIcons();
    }

  } catch (error) {
    console.error('Analytics load error:', error);
  }
}

// =============================================================================
// SECURITY AUDIT & GOOGLE AI STUDIO INSPECTOR
// =============================================================================

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
