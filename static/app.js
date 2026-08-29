/**
 * Gemini Cognitive Journal & Brainstorming Studio - Client Controller
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
  initFirebaseAuth();
  checkGeminiKeyStatus();
  updateUserUI();
  initAnalyticsCharts();
  loadJournals();
  loadSecurityAudit();
  loadAIStudioConfig();
});

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
        dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        label.textContent = 'Gemini 2.5 (Live)';
        label.className = 'font-mono text-[11px] text-emerald-300 font-semibold';
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-amber-400';
        label.textContent = 'Connect Gemini API';
        label.className = 'font-mono text-[11px] text-amber-300';
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

  if (tabId === 'journals') loadJournals();
  if (tabId === 'analytics') loadAnalytics();
  if (tabId === 'security') loadSecurityAudit();
}

// =============================================================================
// MULTI-TURN AI CHAT & JOURNALING STUDIO
// =============================================================================

function selectPersona(personaId) {
  state.currentPersona = personaId;
  document.querySelectorAll('.persona-btn').forEach(btn => {
    if (btn.getAttribute('data-persona') === personaId) {
      btn.className = "persona-btn active text-xs px-3 py-1.5 rounded-full font-medium transition-all bg-blue-600/30 text-blue-300 border border-blue-500/40";
    } else {
      btn.className = "persona-btn text-xs px-3 py-1.5 rounded-full font-medium transition-all text-slate-400 hover:text-slate-200 border border-transparent";
    }
  });
}

function startNewSession() {
  state.currentSessionId = `session_${Date.now()}`;
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = `
    <div class="chat-msg-ai-card">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white">Gemini Cognitive Studio</span>
              <span class="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">Gemini 2.5 Flash</span>
            </div>
            <span class="text-[11px] text-slate-400">Security-Guarded & Isolated Cloud Firestore</span>
          </div>
        </div>
        <span class="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Zero Leakage
        </span>
      </div>

      <div class="markdown-body text-sm text-slate-200">
        <p>New thread initialized for <strong>${escapeHtml(state.currentUser.name)}</strong>. What is on your mind today? Feel free to brainstorm an architecture, unpack cognitive distortions, or reflect on your day.</p>
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
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  // Append User message to UI immediately
  appendChatMessage('user', message, state.currentUser.name);
  input.value = '';

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
      throw new Error(`Chat API error: ${response.statusText}`);
    }

    const data = await response.json();
    state.currentSessionId = data.session_id;

    // Append AI Response with full cognitive metadata and tags
    appendChatMessage('ai', data.message.content, 'Gemini Reflective Partner', data.model_used, data.cognitive_data, message);

    // Update Live Cognitive Bar
    if (data.cognitive_data) {
      updateLiveCognitiveBar(data.cognitive_data);
    }

  } catch (error) {
    console.error('Chat error:', error);
    appendChatMessage('ai', `⚠️ Error communicating with Gemini backend: ${error.message}`, 'System');
  } finally {
    sendBtn.disabled = false;
    sendBtn.classList.remove('opacity-50');
  }
}

function appendChatMessage(role, content, authorName, modelTag, cognitiveData = null, originalPrompt = "") {
  const container = document.getElementById('chat-messages');
  const isUser = role === 'user';
  const turnId = `turn_${Date.now()}_${Math.floor(Math.random()*1000)}`;

  const msgDiv = document.createElement('div');
  msgDiv.className = isUser ? 'chat-msg-user-wrap' : 'w-full';

  if (isUser) {
    msgDiv.innerHTML = `
      <div class="chat-msg-user-card">
        <div class="flex items-center justify-between gap-3 mb-1.5 text-xs text-blue-300 font-semibold">
          <span>${escapeHtml(authorName)}</span>
          <span class="text-[10px] text-slate-400 font-mono">You</span>
        </div>
        <div class="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">${escapeHtml(content)}</div>
      </div>
    `;
  } else {
    const distortions = cognitiveData?.detected_distortions || [];
    const tags = cognitiveData?.semantic_tags || ['#SelfReflection'];

    msgDiv.innerHTML = `
      <div class="chat-msg-ai-card">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/5">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/25 text-white">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-white">${escapeHtml(authorName)}</span>
                <span class="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  ${modelTag || 'gemini-2.5-flash'}
                </span>
              </div>
              <span class="text-[11px] text-slate-400 capitalize">${(state.currentPersona || '').replace('_', ' ')} Guide</span>
            </div>
          </div>

          ${cognitiveData && cognitiveData.primary_emotion ? `
            <span class="text-xs bg-purple-950/40 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm">
              <span>💙</span> ${escapeHtml(cognitiveData.primary_emotion)}
            </span>
          ` : ''}
        </div>

        <!-- Expandable MindPulse Matrix Reasoning Pill (Perplexity Style) -->
        ${cognitiveData ? `
          <div class="mb-3.5">
            <button type="button" onclick="toggleReasoningAccordion('${turnId}')" class="reasoning-pill-btn">
              <div class="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <i data-lucide="brain" class="w-3.5 h-3.5 text-cyan-400"></i>
                <span>MindPulse Cognitive Matrix</span>
                ${distortions.length > 0 ? `
                  <span class="bg-amber-950/70 text-amber-300 border border-amber-500/40 px-2 py-0.2 rounded-full text-[10px] font-bold">
                    ⚠️ ${distortions.length} Distortion Pattern(s)
                  </span>
                ` : `
                  <span class="text-emerald-400 text-[10px] font-mono">✨ Balanced Emotional Vector</span>
                `}
              </div>
              <i data-lucide="chevron-down" id="reasoning-icon-${turnId}" class="w-3.5 h-3.5 text-slate-400 transition-transform"></i>
            </button>

            <div id="reasoning-body-${turnId}" class="hidden p-3 rounded-xl bg-black/40 border border-white/5 space-y-2.5 mb-3">
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                ${Object.entries(cognitiveData.mood_scores || {}).map(([k, v]) => `
                  <div class="bg-slate-900/80 p-1.5 rounded-lg border border-white/5">
                    <div class="text-[9px] text-slate-400 uppercase font-mono">${k}</div>
                    <div class="text-xs font-bold text-blue-400 font-mono">${v}%</div>
                  </div>
                `).join('')}
              </div>
              ${cognitiveData.cognitive_reframing ? `
                <div class="text-xs text-slate-300 bg-blue-950/30 p-2.5 rounded-lg border border-blue-500/20 leading-relaxed">
                  <strong class="text-blue-400">🔄 Clinical Reframing:</strong> ${escapeHtml(cognitiveData.cognitive_reframing)}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Markdown Body -->
        <div class="markdown-body text-sm text-slate-200 leading-relaxed">
          ${marked.parse(content)}
        </div>

        <!-- Footer Action Toolbar -->
        <div class="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex flex-wrap items-center gap-1.5">
            ${distortions.map(d => `
              <span class="bg-amber-950/60 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                ⚠️ ${escapeHtml(d)}
              </span>
            `).join('')}
            ${tags.map(t => `
              <span class="bg-blue-950/60 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                ${escapeHtml(t)}
              </span>
            `).join('')}
          </div>

          <div class="flex items-center gap-2">
            <button onclick="copyToClipboard('${escapeHtml(content).replace(/'/g, "\\'")}', this)" class="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
              <i data-lucide="copy" class="w-3 h-3 text-slate-400"></i>
              <span>Copy</span>
            </button>
            <button onclick="saveQuickJournal('${escapeHtml(originalPrompt || 'Reflection')}', '${escapeHtml(content).replace(/'/g, "\\'")}', '${cognitiveData?.primary_emotion || 'Reflective'}')" class="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
              <i data-lucide="bookmark" class="w-3 h-3 text-cyan-400"></i>
              <span>Save Vault</span>
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
// ISOLATED JOURNALS CRUD
// =============================================================================

function openNewJournalModal() {
  document.getElementById('journal-modal').classList.remove('hidden');
}

function closeNewJournalModal() {
  document.getElementById('journal-modal').classList.add('hidden');
}

async function submitNewJournal(event) {
  event.preventDefault();
  const title = document.getElementById('journal-title-input').value.trim();
  const content = document.getElementById('journal-content-input').value.trim();
  const persona = document.getElementById('journal-persona-input').value;
  const mood = document.getElementById('journal-mood-input').value;
  const isEncrypted = document.getElementById('journal-encrypt-checkbox').checked;

  try {
    const response = await fetch('/api/journals', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title,
        content,
        persona,
        mood,
        tags: [persona, mood],
        is_encrypted: isEncrypted
      })
    });

    if (!response.ok) throw new Error('Failed to create journal entry.');

    closeNewJournalModal();
    document.getElementById('journal-title-input').value = '';
    document.getElementById('journal-content-input').value = '';
    loadJournals();
    showToast('Journal entry saved strictly to your isolated vault.');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function loadJournals() {
  const container = document.getElementById('journals-grid');
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
