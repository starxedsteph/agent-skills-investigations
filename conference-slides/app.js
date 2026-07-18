'use strict';

let currentIndex = 0;
let timers = [];
let goingForward = true;
let chatExpanded = false;
let paused = false;

const SPEED = 1.5; // global pacing multiplier — increase to slow down
const ms = n => Math.round(n * SPEED);

const beats = window.BEATS;

const views = {
  'slide':        document.getElementById('slide-view'),
  'vscode':       document.getElementById('vscode-view'),
  'query-editor': document.getElementById('query-editor-view'),
};

const beatCounter = document.getElementById('beat-counter');

// ===== NAVIGATION =====

function advance() {
  if (currentIndex < beats.length - 1) {
    clearTimers();
    clearPause();
    goingForward = true;
    currentIndex++;
    render();
  }
}

function back() {
  if (currentIndex > 0) {
    clearTimers();
    clearPause();
    goingForward = false;
    currentIndex--;
    render();
  }
}

function clearTimers() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
}

// ===== PAUSE (presenter safety valve) =====

function refreshCounter() {
  const beat = beats[currentIndex];
  if (!beat) return;
  beatCounter.textContent = `${beat.id}  ${currentIndex + 1} / ${beats.length}`;
}

function clearPause() {
  paused = false;
}

function setPaused(p) {
  paused = p;
  if (p) { clearTimers(); refreshCounter(); }
  else { render(); }   // resume replays the current beat's animation
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); advance(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
  else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setPaused(!paused); }
});

// ===== RENDER DISPATCH =====

function render() {
  const beat = beats[currentIndex];
  Object.entries(views).forEach(([k, el]) => {
    el.style.display = k === beat.view ? 'flex' : 'none';
  });
  beatCounter.textContent = `${beat.id}  ${currentIndex + 1} / ${beats.length}`;
  refreshCounter();

  if (beat.view === 'slide')        renderSlide(beat.slide);
  else if (beat.view === 'vscode')  renderVSCode(beat.vscode);
  else if (beat.view === 'query-editor') renderQueryEditor(beat.queryEditor);
}

// ===== SLIDE =====

function renderSlide(s) {
  const el = document.getElementById('slide-content');
  document.getElementById('slide-view').classList.toggle(
    'slide-accent',
    !['crowding', 'browser'].includes(s.type)
  );
  switch (s.type) {
    case 'title':       el.innerHTML = slideTitleHTML(s); break;
    case 'crowding':
      el.innerHTML = slideCrowdingHTML(s);
      if (goingForward) {
        const t = setTimeout(() => startCrowdingAnimation(), ms(400));
        timers.push(t);
      } else {
        document.querySelectorAll('.crowd-img-slot').forEach(sl => sl.style.opacity = '1');
      }
      break;
    case 'minimal':     el.innerHTML = slideMinimalHTML(s); break;
    case 'guardrails':  el.innerHTML = slideGuardrailsHTML(s); break;
    case 'stat':        el.innerHTML = slideStatHTML(s); break;
    case 'split':       el.innerHTML = slideSplitHTML(s); break;
    case 'browser':     el.innerHTML = slideBrowserHTML(s); break;
    case 'validation':  el.innerHTML = slideValidationHTML(s); break;
    case 'thread-map':  el.innerHTML = slideThreadMapHTML(); break;
    case 'qr':          el.innerHTML = slideQRHTML(s); break;
  }
}

function slideTitleHTML(s) {
  return `<div class="slide-title">
    <div class="talk-title">${esc(s.title)}</div>
    <div class="talk-subtitle">${esc(s.subtitle)}</div>
    <div class="speaker-name">${esc(s.name)}</div>
    <div class="speaker-affiliation">${esc(s.affiliation)}</div>
  </div>`;
}

function slideCrowdingHTML(s) {
  const wins = (s.windows || s.images || []).map(w => `
    <div class="crowd-img-slot ${w.slot}" style="opacity:0">
      <div class="doc-window doc-${w.kind || 'docs'}">
        <div class="dw-bar">
          <span class="dw-dots"><i></i><i></i><i></i></span>
          <span class="dw-title">${esc(w.title || w.label || '')}</span>
        </div>
        <div class="dw-body">
          ${crowdingWindowBodyHTML(w)}
        </div>
      </div>
    </div>`
  ).join('');
  return `<div class="slide-crowding">${wins}</div>`;
}

function crowdingWindowBodyHTML(w) {
  const subtitle = esc(w.subtitle || '');

  if (w.kind === 'chat') return `
    <div class="mock-chat-shell">
      <aside class="mock-chat-rail">
        <div class="mock-workspace">T&amp;S Data</div>
        <div class="mock-rail-label">Channels</div>
        <div class="mock-channel active"># data-help</div>
        <div class="mock-channel"># investigations</div>
        <div class="mock-channel"># query-clinic</div>
      </aside>
      <section class="mock-chat-main">
        <div class="mock-chat-heading"># data-help <span>18 members</span></div>
        <div class="mock-message"><b>Priya</b><small>10:42 AM</small><p>Does anyone remember which column is the real user ID?</p></div>
        <div class="mock-message"><b>Marcus</b><small>10:44 AM</small><p>Use <code>account_id</code> in signups. <code>id</code> is the event row.</p></div>
        <div class="mock-reply">3 replies · last reply 2 months ago</div>
      </section>
    </div>`;

  if (w.kind === 'file') return `
    <div class="mock-editor-tabs"><span class="active">query_v3_FINAL.sql</span><span>query_v2.sql</span></div>
    <div class="mock-code"><span class="ln">1</span><span><b>SELECT</b> account_id, login, created_at</span>
<span class="ln">2</span><span><b>FROM</b> signups</span>
<span class="ln">3</span><span><b>WHERE</b> created_at &gt; <i>'2026-05-30'</i></span>
<span class="ln">4</span><span>  <b>AND</b> country_code = <i>'ES'</i>;</span>
<span class="ln">5</span><span class="mock-comment">-- the one that worked last time</span></div>`;

  if (w.kind === 'wiki') return `
    <div class="mock-breadcrumb">Data Platform / Tables / signups</div>
    <h3>Signup data dictionary</h3>
    <div class="mock-callout"><b>Important:</b> legacy field names do not always describe current behavior.</div>
    <div class="mock-field-row"><code>is_verified</code><span>Boolean</span></div>
    <p class="mock-field-copy">Means “was verified as of the last legacy sync.” This field is no longer updated.</p>
    <div class="mock-meta">Last updated 14 months ago · 6 min read</div>`;

  if (w.kind === 'note') return `
    <div class="mock-note-date">TABLE GOTCHAS · PERSONAL NOTES</div>
    <h3>Things I keep forgetting</h3>
    <div class="mock-check"><span>✓</span><code>signups.account_id</code> joins to <code>accounts.id</code></div>
    <div class="mock-check"><span>✓</span>Country is <code>country_code</code>, not <code>country</code></div>
    <div class="mock-check"><span>✓</span>Use the live classifications stream, not the nightly snapshot</div>
    <div class="mock-check"><span>□</span>Figure out which timestamp is UTC</div>
    <div class="mock-check"><span>□</span>Find the query where the JA4 join actually worked</div>
    <div class="mock-next-query"><b>Next time</b><p>Start from <code>query_v3_FINAL.sql</code>. Do not rebuild the date casting again.</p></div>`;

  if (w.kind === 'web') return `
    <div class="mock-searchbar">compare string to timestamp <span>Search</span></div>
    <div class="mock-qa">
      <div class="mock-votes"><b>47</b> votes<br><strong>2 answers</strong></div>
      <div><h3>How do I compare a string to a timestamp?</h3><p>I have a date value coming from a text field and need to compare it in a WHERE clause...</p><span class="mock-tag">sql</span><span class="mock-tag">timestamp</span><span class="mock-tag">casting</span></div>
    </div>`;

  const postgres = (w.title || '').includes('PostgreSQL');
  return `
    <div class="mock-docs-nav"><span>Documentation</span><span>Reference</span><span>Functions</span><input value="Search docs" readonly></div>
    <div class="mock-docs-layout">
      <aside><b>Contents</b><span>Overview</span><span class="active">${postgres ? 'Date/Time Functions' : 'Type Conversion'}</span><span>Examples</span></aside>
      <main><div class="mock-version">${postgres ? 'PostgreSQL 16' : 'MySQL 8.0'}</div><h3>${subtitle}</h3><p>${postgres ? 'Functions and operators for processing date and time values.' : 'Convert a value from one data type to another.'}</p><pre>${postgres ? "timestamp '2026-05-30'" : "CAST(expr AS type)"}</pre><h4>Example</h4><div class="mock-text-line"></div><div class="mock-text-line short"></div></main>
    </div>`;
}

function startCrowdingAnimation() {
  const slots = document.querySelectorAll('.crowd-img-slot');
  slots.forEach((slot, i) => {
    const t = setTimeout(() => {
      slot.style.zIndex = i + 1;
      slot.style.opacity = '1';
    }, ms(i * 900));
    timers.push(t);
  });
}

function slideMinimalHTML(s) {
  return `<div class="slide-minimal">
    <div class="slide-heading">${esc(s.heading)}</div>
    ${s.sub ? `<div class="slide-sub">${esc(s.sub)}</div>` : ''}
  </div>`;
}

function slideGuardrailsHTML(s) {
  const items = s.items.map(item =>
    `<div class="guardrail-item visible"><span class="guardrail-icon">✓</span>${esc(item)}</div>`
  ).join('');
  return `<div class="slide-guardrails">
    <div class="slide-heading">${esc(s.heading1 || 'A Security Note')}</div>
    <div class="slide-heading">${esc(s.heading2 || 'Non-optional')}</div>
    <div class="guardrail-items">${items}</div>
  </div>`;
}

function slideSplitHTML(s) {
  const col = (side) => side.items.map(item =>
    `<div class="split-item">${esc(item)}</div>`
  ).join('');
  return `<div class="slide-split">
    <div class="split-col">
      <div class="split-heading">${esc(s.left.heading)}</div>
      <div class="split-items">${col(s.left)}</div>
    </div>
    <div class="split-divider"></div>
    <div class="split-col">
      <div class="split-heading">${esc(s.right.heading)}</div>
      <div class="split-items">${col(s.right)}</div>
    </div>
  </div>`;
}

function slideBrowserHTML(s) {
  return `<div class="slide-browser">
    <div class="sb-chrome">
      <div class="sb-dots"><span></span><span></span><span></span></div>
      <div class="sb-url">agentskills.io</div>
      <div class="sb-spacer"></div>
    </div>
    <div class="sb-page">
      <nav class="sb-topnav">
        <span class="sb-logo">Agent Skills</span>
        <div class="sb-search"><span class="sb-search-icon">⌕</span> Search… <span class="sb-search-key">⌘K</span></div>
        <div class="sb-ask">✦ Ask Assistant</div>
        <div class="sb-github">⊕ agentskills/agentskills ☆ 23,150</div>
      </nav>
      <div class="sb-body">
        <aside class="sb-sidenav">
          <div class="sb-sidenav-item sb-sidenav-active">Overview</div>
          <div class="sb-sidenav-item">Specification</div>
          <div class="sb-sidenav-item">Client Showcase</div>
          <div class="sb-sidenav-section">For skill creators</div>
          <div class="sb-sidenav-item">Quickstart</div>
          <div class="sb-sidenav-item">Best practices</div>
          <div class="sb-sidenav-item">Optimizing descriptions</div>
          <div class="sb-sidenav-item">Evaluating skills</div>
          <div class="sb-sidenav-item">Using scripts</div>
          <div class="sb-sidenav-section">For client implementors</div>
          <div class="sb-sidenav-item">Adding skills support</div>
        </aside>
        <main class="sb-main">
          <h1 class="sb-h1">Agent Skills Overview</h1>
          <p class="sb-sub">A standardized way to give AI agents new capabilities and expertise.</p>
          <h2 class="sb-h2">What are Agent Skills?</h2>
          <p class="sb-p">Agent Skills are a lightweight, open format for extending AI agent capabilities with specialized knowledge and workflows.</p>
          <p class="sb-p">At its core, a skill is a folder containing a <code class="sb-code">SKILL.md</code> file. This file includes metadata (<code class="sb-code">name</code> and <code class="sb-code">description</code>, at minimum) and instructions that tell an agent how to perform a specific task.</p>
          <div class="sb-codeblock">
            <div class="sb-codeblock-line"><span class="sb-dir">my-skill/</span></div>
            <div class="sb-codeblock-line"><span class="sb-tree">├──</span> <span class="sb-file">SKILL.md</span>        <span class="sb-comment"># Required: metadata + instructions</span></div>
            <div class="sb-codeblock-line"><span class="sb-tree">├──</span> <span class="sb-file">scripts/</span>        <span class="sb-comment"># Optional: executable code</span></div>
            <div class="sb-codeblock-line"><span class="sb-tree">├──</span> <span class="sb-file">references/</span>     <span class="sb-comment"># Optional: documentation</span></div>
            <div class="sb-codeblock-line"><span class="sb-tree">├──</span> <span class="sb-file">assets/</span>         <span class="sb-comment"># Optional: templates, resources</span></div>
            <div class="sb-codeblock-line"><span class="sb-tree">└──</span> <span class="sb-file">...</span>             <span class="sb-comment"># Any additional files or directories</span></div>
          </div>
        </main>
        <aside class="sb-toc">
          <div class="sb-toc-title">≡ On this page</div>
          <div class="sb-toc-item">What are Agent Skills?</div>
          <div class="sb-toc-item">Why Agent Skills?</div>
          <div class="sb-toc-item">How do Agent Skills work?</div>
          <div class="sb-toc-item">Where can I use Agent Skills?</div>
          <div class="sb-toc-item">Open development</div>
          <div class="sb-toc-item">Get started with Agent Skills</div>
        </aside>
      </div>
    </div>
  </div>`;
}

function slideStatHTML(s) {
  return `<div class="slide-stat">
    <div class="stat-row">
      <div class="stat-number">${esc(s.from)}</div>
      <div class="stat-arrow">→</div>
      <div class="stat-number">${esc(s.to)}</div>
    </div>
    <div class="stat-label">${esc(s.unit)}</div>
  </div>`;
}

function slideValidationHTML(s) {
  const items = s.items.map(item =>
    `<li class="validation-item"><span class="vi-check">✓</span>${esc(item)}</li>`
  ).join('');
  return `<div class="slide-validation">
    <div class="slide-heading">${esc(s.heading)}</div>
    <ul class="validation-items">${items}</ul>
  </div>`;
}

function slideThreadMapHTML() {
  return `<div class="slide-thread-map" role="img" aria-label="A dense map of investigation paths with one unexpected branch highlighted">
    <div class="thread-line line-1"></div>
    <div class="thread-line line-2"></div>
    <div class="thread-line line-3"></div>
    <div class="thread-line line-4"></div>
    <div class="thread-line line-5"></div>
    <div class="thread-line line-6"></div>
    <div class="thread-line line-7"></div>
    <div class="thread-line line-8"></div>
    <div class="thread-line line-9"></div>
    <div class="thread-node node-1"></div>
    <div class="thread-node node-2"></div>
    <div class="thread-node node-3"></div>
    <div class="thread-node node-4"></div>
    <div class="thread-node node-5"></div>
    <div class="thread-node node-6"></div>
    <div class="thread-node node-7"></div>
    <div class="thread-node node-8"></div>
    <div class="thread-node node-9"></div>
    <div class="thread-node node-10"></div>
    <div class="thread-label">one more branch</div>
  </div>`;
}

function slideQRHTML(s) {
  return `<div class="slide-qr">
    <div class="qr-card">
      <span class="qr-spark qr-spark-1">✦</span>
      <span class="qr-spark qr-spark-2">✦</span>
      <span class="qr-dot qr-dot-1"></span>
      <span class="qr-dot qr-dot-2"></span>
      <a class="qr-box" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">
        <img src="${esc(s.qr)}" alt="QR code for ${esc(s.url)}">
      </a>
    </div>
    <a class="qr-url" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a>
  </div>`;
}

// ===== VS CODE =====

function renderVSCode(state) {
  renderExplorer(state.explorer);
  renderEditor(state.editor);
  renderTerminal(state.terminal);
  renderChat(state.chat);

  // Skill scan animation
  if (state.skillScan) {
    const agentBubble = document.querySelector('#chat-messages .chat-msg-agent:last-child .chat-bubble');
    if (agentBubble) {
      if (goingForward) {
        runSkillScan(state.skillScan, state.explorer, agentBubble, timers);
      } else {
        renderExplorer({ ...state.explorer, highlighted: [] });
        const allLoaded = [
          ...state.skillScan.load,
          ...(state.skillScan.extraLoad || []).map(e => e.skill),
        ];
        agentBubble.innerHTML = allLoaded
          .map(n => `<div class="step-done"><span class="step-label">Loaded \`${n}\`</span></div>`)
          .join('');
      }
    }
  }

  // Chat input draft
  const inputEl = document.getElementById('chat-input-text');
  const phEl    = document.getElementById('chat-input-placeholder');
  const draft   = state.chatInputDraft || '';
  inputEl.innerHTML  = esc(draft).replace(/\n/g, '<br>');
  phEl.style.display = draft ? 'none' : 'block';

  if (goingForward && state.chatInputSequence) {
    inputEl.innerHTML = '';
    phEl.style.display = 'block';
    const seqDone = state.noAutoAdvance ? null : advance;
    executeChatInputSequence(state.chatInputSequence, inputEl, phEl, seqDone);
  }

  // Auth overlay
  const authOverlay = document.getElementById('auth-overlay');
  const authModal   = document.querySelector('.auth-modal');
  authModal.classList.remove('auth-approved');
  authOverlay.style.display = 'none';

  if (state.authPrompt && !goingForward) {
    authOverlay.style.display = 'flex';
  }

  applyChatExpanded();

  // Editor mode: show SKILL.md with narrow chat on the right
  const editorArea = document.querySelector('.editor-area');
  const chatPanel  = document.querySelector('.chat-panel');
  const vsWin      = document.querySelector('.vscode-window');
  if (state.editorMode) {
    vsWin.classList.add('editor-mode');
    vsWin.classList.remove('workspace-mode');
    editorArea.style.display = 'flex';
    chatPanel.style.display  = 'flex';
  } else if (state.workspaceMode) {
    vsWin.classList.remove('editor-mode');
    vsWin.classList.add('workspace-mode');
    editorArea.style.display = 'flex';
    chatPanel.style.display  = 'flex';
  } else {
    vsWin.classList.remove('editor-mode');
    vsWin.classList.remove('workspace-mode');
    editorArea.style.display = 'none';
    chatPanel.style.display  = 'flex';
  }

  if (state.authPrompt && goingForward) {
    const tShow = setTimeout(() => { authOverlay.style.display = 'flex'; }, ms(700));
    timers.push(tShow);
    const t1 = setTimeout(() => {
      authModal.classList.add('auth-approved');
      const titleEl = authModal.querySelector('.auth-title');
      if (titleEl) titleEl.textContent = 'Authenticated';
      const hintEl = authModal.querySelector('.auth-hint');
      if (hintEl) hintEl.textContent = '✓ Access granted';
    }, ms(1400));
    timers.push(t1);
    const t2 = setTimeout(() => {
      authOverlay.style.display = 'none';
      advance();
    }, ms(6000));
    timers.push(t2);
  }
}

// Explorer
function renderExplorer(explorer) {
  const tree = document.getElementById('explorer-tree');
  tree.innerHTML = buildTreeHTML(explorer.files, explorer.expanded || [], explorer.highlighted || [], 0);
}

function buildTreeHTML(files, expanded, highlighted, depth) {
  return files.map(f => {
    const isExp  = expanded.includes(f.name);
    const isHigh = highlighted.includes(f.name);
    const indent = depth * 12;

    if (f.type === 'dir') {
      const arrow = isExp ? '▾' : '▸';
      const childrenHTML = (isExp && f.children && f.children.length)
        ? `<div class="tree-children">${buildTreeHTML(f.children, [], [], depth + 1)}</div>`
        : '';
      return `
        <div class="tree-item ${isHigh ? 'highlighted' : ''} ${f.isNew ? 'new-item' : ''}"
             style="padding-left:${8 + indent}px">
          <span class="tree-arrow">${arrow}</span>
          <span class="tree-icon tree-folder-icon">📁</span>
          <span class="tree-name">${esc(f.name)}</span>
        </div>
        ${childrenHTML}`;
    } else {
      return `
        <div class="tree-item tree-file ${isHigh ? 'highlighted' : ''}"
             style="padding-left:${8 + indent}px">
          <span class="tree-arrow">&nbsp;</span>
          <span class="tree-icon tree-file-icon">📄</span>
          <span class="tree-name">${esc(f.name)}</span>
        </div>`;
    }
  }).join('');
}

// Editor
function renderEditor(editor) {
  const tabEl     = document.getElementById('editor-tab-name');
  const contentEl = document.getElementById('editor-content');
  if (!editor.filename) {
    tabEl.textContent = '';
    contentEl.innerHTML = '';
    tabEl.parentElement.style.display = 'none';
    return;
  }
  tabEl.parentElement.style.display = 'flex';
  tabEl.textContent = editor.filename.split('/').pop();
  contentEl.innerHTML = `<pre class="editor-code">${formatMD(editor.content)}</pre>`;
}

function formatMD(content) {
  if (!content) return '';
  return content.split('\n').map(line => {
    const e = esc(line);
    if (/^# /.test(line))  return `<span class="md-h1">${e}</span>`;
    if (/^## /.test(line)) return `<span class="md-h2">${e}</span>`;
    if (/^- \*\*/.test(line)) return `<span class="md-updated">${e}</span>`;
    if (/^- /.test(line))  return `<span class="md-list">${e}</span>`;
    // inline bold + code
    return e
      .replace(/\*\*(.+?)\*\*/g, '<span class="md-bold">$1</span>')
      .replace(/`(.+?)`/g, '<span class="md-code">$1</span>');
  }).join('\n');
}

// Terminal
function renderTerminal(terminal) {
  const panel = document.querySelector('.terminal-panel');
  if (panel) panel.style.display = (terminal && terminal.hidden) ? 'none' : 'flex';

  const el = document.getElementById('terminal-content');
  const prompt = `<span class="term-prompt">Stephanies-MacBook-Pro:~ starxedsteph$ </span>`;
  const lines = (terminal && terminal.lines) ? terminal.lines : [];

  if (!lines.length) {
    el.innerHTML = prompt + `<span class="cursor">▋</span>`;
    return;
  }

  const animate = goingForward && terminal && terminal.animate;

  if (!animate) {
    el.innerHTML = renderTerminalLines(lines) + prompt + `<span class="cursor">▋</span>`;
    el.scrollTop = el.scrollHeight;
    return;
  }

  // Animated: lines appear one by one
  el.innerHTML = prompt + `<span class="cursor">▋</span>`;
  let delay = 0;
  lines.forEach(line => {
    const t = setTimeout(() => {
      const cursor = el.querySelector('.cursor');
      const span = document.createElement('span');
      span.innerHTML = formatTermLine(line) + '\n';
      el.insertBefore(span, cursor);
      el.scrollTop = el.scrollHeight;
    }, delay);
    timers.push(t);
    delay += ms(line.startsWith('$') ? 250 : 80);
  });
}

function renderTerminalLines(lines) {
  return lines.map(l => formatTermLine(l) + '\n').join('');
}

function formatTermLine(line) {
  if (line === '') return '';
  if (line.startsWith('$')) {
    return `<span class="term-prompt">Stephanies-MacBook-Pro:~ starxedsteph$ </span><span class="term-cmd">${esc(line.slice(2))}</span>`;
  }
  if (line.startsWith('  →') || line.startsWith('  [main')) {
    return `<span class="term-git">${esc(line)}</span>`;
  }
  return `<span class="term-output">${esc(line)}</span>`;
}

// Chat
function renderChat(chat) {
  const el = document.getElementById('chat-messages');

  if (!chat || !chat.messages || !chat.messages.length) {
    el.innerHTML = `<div class="chat-empty">
      <div class="chat-empty-icon">💬</div>
      <div>Build with Agent</div>
      <div class="chat-empty-sub">AI responses may be inaccurate</div>
    </div>`;
    return;
  }

  el.innerHTML = '';
  const msgs = chat.messages;

  if (chat.autoPlay) {
    autoPlayChat(msgs, el);
    return;
  }

  msgs.forEach((msg, i) => {
    const isLast = i === msgs.length - 1;
    const shouldAnimate = goingForward && chat.animateLast && isLast;
    const msgEl = buildMsgEl(msg);
    el.appendChild(msgEl);

    if (shouldAnimate) {
      const bubble = msgEl.querySelector('.chat-bubble');
      bubble.innerHTML = '';
      const onDone = (goingForward && chat.autoAdvance)
        ? () => { const t = setTimeout(advance, ms(chat.autoAdvance)); timers.push(t); }
        : null;
      streamMsgContent(bubble, msg.content, el, onDone);
    }
  });

  // autoAdvance for non-animated last messages (e.g. user messages)
  if (goingForward && chat.autoAdvance && !(chat.animateLast)) {
    const t = setTimeout(advance, ms(chat.autoAdvance));
    timers.push(t);
  }

  el.scrollTop = el.scrollHeight;
}

function buildMsgEl(msg) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${msg.role}`;

  if (msg.steering) {
    div.classList.add('chat-msg-steering');
    div.innerHTML = `<span class="steering-badge">STEERING</span>
      <div class="steering-message-row">
        <div class="chat-bubble">${buildBubbleContent(msg.content)}</div>
      </div>`;
    return div;
  }

  const avatar = msg.role === 'user'
    ? `<div class="chat-avatar chat-avatar-user">S</div>`
    : `<div class="chat-avatar chat-avatar-agent">✦</div>`;

  div.innerHTML = avatar + `<div class="chat-bubble">${buildBubbleContent(msg.content)}</div>`;

  return div;
}

function streamMsgContent(bubbleEl, content, chatEl, onDone) {
  const cursor = document.createElement('span');
  cursor.className = 'chat-cursor';
  cursor.textContent = '▋';
  bubbleEl.appendChild(cursor);

  const parts = typeof content === 'string'
    ? [{ type: 'text', text: content }]
    : content;

  function next(i) {
    if (i >= parts.length) {
      cursor.remove();
      if (onDone) onDone();
      return;
    }

    const part = parts[i];

    if (part.type === 'text') {
      const textDiv = document.createElement('div');
      textDiv.className = 'chat-text';
      textDiv.innerHTML = fmtChat(part.text);
      bubbleEl.insertBefore(textDiv, cursor);
      chatEl.scrollTop = chatEl.scrollHeight;
      next(i + 1);

    } else if (part.type === 'table') {
      const wrap = document.createElement('div');
      wrap.innerHTML = buildTableHTML(part);
      bubbleEl.insertBefore(wrap.firstChild, cursor);
      chatEl.scrollTop = chatEl.scrollHeight;
      next(i + 1);

    } else if (part.type === 'step') {
      const stepEl = document.createElement('div');
      stepEl.className = 'step-indicator';
      stepEl.innerHTML = `<span class="step-dot"></span><span class="step-status">${esc(part.status)}</span>`;
      bubbleEl.insertBefore(stepEl, cursor);
      chatEl.scrollTop = chatEl.scrollHeight;

      const t = setTimeout(() => {
        stepEl.className = 'step-done';
        stepEl.innerHTML = `<span class="step-label">${esc(part.label)}</span>`;
        next(i + 1);
      }, ms(part.delay || 2500));
      timers.push(t);

    } else if (part.type === 'pending-step') {
      // Show step indicator but don't wait — stays pulsing while sequence moves on
      const stepEl = document.createElement('div');
      stepEl.className = 'step-indicator';
      stepEl.innerHTML = `<span class="step-dot"></span><span class="step-status">${esc(part.status)}</span>`;
      bubbleEl.insertBefore(stepEl, cursor);
      chatEl.scrollTop = chatEl.scrollHeight;
      next(i + 1);

    } else if (part.type === 'pause') {
      const t = setTimeout(() => next(i + 1), ms(part.ms));
      timers.push(t);

    } else if (part.type === 'campaign') {
      const wrap = document.createElement('div');
      wrap.innerHTML = buildCampaignHTML(part.data);
      bubbleEl.insertBefore(wrap.firstChild, cursor);
      cursor.remove();
      chatEl.scrollTop = chatEl.scrollHeight;
      if (onDone) onDone();

    } else {
      next(i + 1);
    }
  }

  next(0);
}

function autoPlayChat(msgs, chatEl) {
  const inputEl = document.getElementById('chat-input-text');
  const phEl    = document.getElementById('chat-input-placeholder');

  function playNext(i) {
    if (i >= msgs.length) return;
    const msg = msgs[i];

    if (msg.role === 'agent') {
      const msgEl = buildMsgEl(msg);
      chatEl.appendChild(msgEl);
      chatEl.scrollTop = chatEl.scrollHeight;
      const bubble = msgEl.querySelector('.chat-bubble');
      bubble.innerHTML = '';
      const pauseAfter = msg.pauseAfter || 1000;
      streamMsgContent(bubble, msg.content, chatEl, () => {
        const t = setTimeout(() => playNext(i + 1), ms(pauseAfter));
        timers.push(t);
      });
    } else {
      // Type user message into input box, then post
      const text = msg.content;
      let delay = ms(300);

      [...text].forEach((ch, idx) => {
        const t = setTimeout(() => {
          phEl.style.display = 'none';
          inputEl.innerHTML = esc(text.slice(0, idx + 1)).replace(/\n/g, '<br>');
        }, delay);
        timers.push(t);
        delay += ms(12);
      });

      delay += ms(600);
      const tPost = setTimeout(() => {
        inputEl.innerHTML = '';
        phEl.style.display = 'block';
        const msgEl = buildMsgEl(msg);
        chatEl.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight;
        const pauseAfter = msg.pauseAfter || 800;
        const t = setTimeout(() => playNext(i + 1), ms(pauseAfter));
        timers.push(t);
      }, delay);
      timers.push(tPost);
    }
  }

  playNext(0);
}

function buildBubbleContent(content) {
  if (typeof content === 'string') {
    return `<div class="chat-text">${fmtChat(content)}</div>`;
  }
  // Array of parts
  return content.map(part => {
    if (part.type === 'text')     return `<div class="chat-text">${fmtChat(part.text)}</div>`;
    if (part.type === 'table')    return buildTableHTML(part);
    if (part.type === 'campaign') return buildCampaignHTML(part.data);
    if (part.type === 'step')     return `<div class="step-done"><span class="step-label">${esc(part.label)}</span></div>`;
    return '';
  }).join('');
}

function buildTableHTML(part) {
  const ths = part.headers.map(h => `<th>${esc(h)}</th>`).join('');
  const trs = part.rows.map(row =>
    `<tr>${row.map(cell => `<td>${esc(String(cell))}</td>`).join('')}</tr>`
  ).join('');
  return `<div class="chat-table-wrap"><table class="chat-table">
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table></div>`;
}

function buildCampaignHTML(d) {
  const sigsHTML = (d.signals || []).map(s => `<li>${esc(s)}</li>`).join('');
  const recHTML  = (d.recommendation || []).map(r => `<li>${esc(r)}</li>`).join('');

  let configTableHTML = '';
  if (d.configTable) {
    const ths = d.configTable.headers.map(h => `<th>${esc(h)}</th>`).join('');
    const trs = d.configTable.rows.map(row =>
      `<tr>${row.map(cell => `<td>${esc(String(cell))}</td>`).join('')}</tr>`
    ).join('');
    configTableHTML = `<div class="campaign-config-table-wrap"><table class="campaign-config-table">
      <thead><tr>${ths}</tr></thead>
      <tbody>${trs}</tbody>
    </table></div>`;
  }

  return `<div class="campaign-box">
    <div class="campaign-header">CAMPAIGN IDENTIFIED</div>
    ${d.title  ? `<div class="campaign-title">${esc(d.title)}</div>` : ''}
    ${d.tldr   ? `<div class="campaign-tldr"><span class="campaign-tldr-lbl">TL;DR</span> ${esc(d.tldr)}</div>` : ''}
    ${configTableHTML}
    ${sigsHTML ? `<div class="campaign-section-lbl">Signals</div><ul class="campaign-signals">${sigsHTML}</ul>` : ''}
    ${recHTML  ? `<div class="campaign-section-lbl">Recommendation</div><ul class="campaign-rec">${recHTML}</ul>` : ''}
  </div>`;
}

function fmtInline(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function fmtChat(text) {
  if (!text) return '';
  return text.split('\n').map(line => {
    if (line.startsWith('# '))  return `<div class="chat-md-h1">${fmtInline(line.slice(2))}</div>`;
    if (line.startsWith('## ')) return `<div class="chat-md-h2">${fmtInline(line.slice(3))}</div>`;
    if (line.startsWith('- '))  return `<div class="chat-md-li"><span class="chat-md-bullet">•</span><span>${fmtInline(line.slice(2))}</span></div>`;
    if (line === '')             return '<div class="chat-md-gap"></div>';
    return `<div class="chat-md-p">${fmtInline(line)}</div>`;
  }).join('');
}

function executeChatInputSequence(sequence, inputEl, phEl, onDone) {
  let currentText = '';
  let delay = 0;
  let hasPost = false;

  function setInput(text) {
    currentText = text;
    inputEl.innerHTML = esc(text).replace(/\n/g, '<br>');
    phEl.style.display = text ? 'none' : 'block';
  }

  sequence.forEach(action => {
    if (action.type === 'set') {
      const text = action.text;
      const t = setTimeout(() => setInput(text), delay);
      timers.push(t);

    } else if (action.type === 'type') {
      for (let i = 0; i < action.text.length; i++) {
        const ch = action.text[i];
        delay += ms(action.delay || 25);
        const t = setTimeout(() => setInput(currentText + ch), delay);
        timers.push(t);
      }

    } else if (action.type === 'pause') {
      delay += ms(action.ms);

    } else if (action.type === 'paste') {
      const text = action.text;
      const t = setTimeout(() => setInput(currentText + text), delay);
      timers.push(t);

    } else if (action.type === 'post') {
      hasPost = true;
      delay += ms(300);
      const t = setTimeout(() => {
        const chatEl = document.getElementById('chat-messages');
        const msgEl = buildMsgEl({ role: 'user', content: currentText });
        chatEl.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight;
        inputEl.innerHTML = '';
        phEl.style.display = 'block';
        currentText = '';
        if (onDone) onDone();
      }, delay);
      timers.push(t);
    }
  });

  if (!hasPost && onDone) {
    delay += ms(700);
    const t = setTimeout(onDone, delay);
    timers.push(t);
  }
}

// ===== QUERY EDITOR =====

function renderQueryEditor(qe) {
  const resultsEl = document.getElementById('qe-results');
  resultsEl.innerHTML = '<div class="qe-placeholder">Results will appear here</div>';

  if (!goingForward || !qe.sequence) {
    // Instant render: show final state
    setQEText(qe.finalQuery || '');
    if (qe.finalError) {
      resultsEl.innerHTML = `<div class="qe-error">❌  ${esc(qe.finalError)}</div>`;
    }
    return;
  }

  // Animated: execute sequence
  executeQESequence(qe.sequence);
}

function setQEText(text, cursorPos) {
  const codeEl    = document.getElementById('qe-code');
  const lineNumEl = document.getElementById('qe-line-nums');
  const lines = text.split('\n');

  if (cursorPos !== undefined && cursorPos <= text.length) {
    const before = text.slice(0, cursorPos);
    const after  = text.slice(cursorPos);
    codeEl.innerHTML = syntaxSQL(before) + '<span class="qe-cursor">▋</span>' + syntaxSQL(after);
  } else {
    codeEl.innerHTML = syntaxSQL(text);
  }

  lineNumEl.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join('');
}

function executeQESequence(sequence) {
  const resultsEl = document.getElementById('qe-results');
  const runBtn    = document.getElementById('qe-run-btn');

  let currentText = '';
  let cursorPos   = 0;
  let delay = 0;

  function render() { setQEText(currentText, cursorPos); }

  sequence.forEach(action => {
    if (action.type === 'set') {
      const text = action.text;
      const t = setTimeout(() => {
        currentText = text;
        cursorPos   = text.length;
        render();
      }, delay);
      timers.push(t);

    } else if (action.type === 'type') {
      for (let i = 0; i < action.text.length; i++) {
        const ch = action.text[i];
        delay += ch === '\n' ? 220 : 75;
        const t = setTimeout(() => {
          currentText = currentText.slice(0, cursorPos) + ch + currentText.slice(cursorPos);
          cursorPos++;
          render();
        }, delay);
        timers.push(t);
      }

    } else if (action.type === 'complete') {
      // Instant autocomplete — text appears all at once at cursor
      const text = action.text;
      const t = setTimeout(() => {
        currentText = currentText.slice(0, cursorPos) + text + currentText.slice(cursorPos);
        cursorPos += text.length;
        render();
      }, delay);
      timers.push(t);

    } else if (action.type === 'backspace') {
      for (let i = 0; i < action.count; i++) {
        delay += 60;
        const t = setTimeout(() => {
          if (cursorPos > 0) {
            currentText = currentText.slice(0, cursorPos - 1) + currentText.slice(cursorPos);
            cursorPos--;
          }
          render();
        }, delay);
        timers.push(t);
      }

    } else if (action.type === 'moveCursor') {
      const pos = action.pos;
      const t = setTimeout(() => {
        cursorPos = pos === 'end' ? currentText.length : pos;
        render();
      }, delay);
      timers.push(t);

    } else if (action.type === 'pause') {
      delay += action.ms;

    } else if (action.type === 'clearError') {
      const t = setTimeout(() => {
        resultsEl.innerHTML = '<div class="qe-placeholder">Results will appear here</div>';
      }, delay);
      timers.push(t);

    } else if (action.type === 'run') {
      const t1 = setTimeout(() => {
        if (runBtn) runBtn.classList.add('qe-run-btn-active');
      }, delay);
      timers.push(t1);
      delay += 200;
      const t2 = setTimeout(() => {
        if (runBtn) runBtn.classList.remove('qe-run-btn-active');
      }, delay);
      timers.push(t2);

    } else if (action.type === 'error') {
      const errText = action.text;
      const t = setTimeout(() => {
        resultsEl.innerHTML = `<div class="qe-error">❌  ${esc(errText)}</div>`;
      }, delay);
      timers.push(t);
    }
  });
}

function syntaxSQL(code) {
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|JOIN|ON|GROUP BY|ORDER BY|LIMIT|COUNT|DISTINCT|AS|IN|NOT|LIKE|REGEXP|BETWEEN|WITH|TIMESTAMP|CAST|LEFT|INNER|OUTER|HAVING|BY|ASC|DESC|NULL|IS|INTO|VALUES)\b/gi;
  return esc(code).replace(keywords, m => `<span class="qe-kw">${m}</span>`);
}

// ===== SKILL SCAN =====

function runSkillScan(scan, explorerBase, agentBubbleEl, timers) {
  const chatEl = document.getElementById('chat-messages');
  let delay = ms(300);

  explorerBase.files.forEach(file => {
    const isLoaded = scan.load.includes(file.name);

    const tHighlight = setTimeout(() => {
      renderExplorer({ ...explorerBase, highlighted: [file.name] });
    }, delay);
    timers.push(tHighlight);
    delay += ms(scan.scanDelay);

    if (isLoaded) {
      delay += ms(scan.loadPause);

      let stepEl;
      const tStep = setTimeout(() => {
        stepEl = document.createElement('div');
        stepEl.className = 'step-indicator';
        stepEl.innerHTML = `<span class="step-dot"></span><span class="step-status">Loading \`${file.name}\`...</span>`;
        agentBubbleEl.appendChild(stepEl);
        chatEl.scrollTop = chatEl.scrollHeight;
      }, delay);
      timers.push(tStep);
      delay += ms(scan.stepDelay);

      const tLoaded = setTimeout(() => {
        stepEl.className = 'step-done';
        stepEl.innerHTML = `<span class="step-label">Loaded \`${file.name}\`</span>`;
      }, delay);
      timers.push(tLoaded);
    }
  });

  // Extra skills loaded after the scan (with thinking step)
  if (scan.extraLoad) {
    scan.extraLoad.forEach(item => {
      delay += ms(400);

      let thinkEl;
      const tThink = setTimeout(() => {
        thinkEl = document.createElement('div');
        thinkEl.className = 'step-indicator';
        thinkEl.innerHTML = `<span class="step-dot"></span><span class="step-status">${esc(item.think)}</span>`;
        agentBubbleEl.appendChild(thinkEl);
        chatEl.scrollTop = chatEl.scrollHeight;
      }, delay);
      timers.push(tThink);
      delay += ms(scan.thinkDelay || 1000);

      const tHighlight = setTimeout(() => {
        renderExplorer({ ...explorerBase, highlighted: [item.skill] });
      }, delay);
      timers.push(tHighlight);
      delay += ms(scan.loadPause);

      let loadEl;
      const tLoad = setTimeout(() => {
        thinkEl.className = 'step-done';
        thinkEl.innerHTML = `<span class="step-label">${esc(item.think)}</span>`;
        loadEl = document.createElement('div');
        loadEl.className = 'step-indicator';
        loadEl.innerHTML = `<span class="step-dot"></span><span class="step-status">Loading \`${item.skill}\`...</span>`;
        agentBubbleEl.appendChild(loadEl);
        chatEl.scrollTop = chatEl.scrollHeight;
      }, delay);
      timers.push(tLoad);
      delay += ms(scan.stepDelay);

      const tLoaded = setTimeout(() => {
        loadEl.className = 'step-done';
        loadEl.innerHTML = `<span class="step-label">Loaded \`${item.skill}\`</span>`;
      }, delay);
      timers.push(tLoaded);
    });
  }

  const tFinal = setTimeout(() => {
    renderExplorer({ ...explorerBase, highlighted: [] });
  }, delay + ms(300));
  timers.push(tFinal);
}

// ===== UTILS =====
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== RESIZE HANDLES =====

function makeDraggableX(handleEl, targetEl, min, max) {
  handleEl.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX     = e.clientX;
    const startWidth = targetEl.offsetWidth;
    handleEl.classList.add('dragging');

    function onMove(e) {
      const w = Math.max(min, Math.min(max, startWidth + (e.clientX - startX)));
      targetEl.style.width    = w + 'px';
      targetEl.style.minWidth = w + 'px';
    }
    function onUp() {
      handleEl.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function makeDraggableY(handleEl, targetEl, min, max) {
  handleEl.addEventListener('mousedown', e => {
    e.preventDefault();
    const startY      = e.clientY;
    const startHeight = targetEl.offsetHeight;
    handleEl.classList.add('dragging');

    function onMove(e) {
      const h = Math.max(min, Math.min(max, startHeight - (e.clientY - startY)));
      targetEl.style.height    = h + 'px';
      targetEl.style.minHeight = h + 'px';
    }
    function onUp() {
      handleEl.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

makeDraggableX(
  document.getElementById('sidebar-resize'),
  document.querySelector('.sidebar'),
  80, 480
);

makeDraggableY(
  document.getElementById('terminal-resize'),
  document.querySelector('.terminal-panel'),
  60, 520
);

// ===== CHAT EXPAND =====
function applyChatExpanded() {
  const win = document.querySelector('.vscode-window');
  const btn = document.getElementById('chat-expand-btn');
  const expandIcon   = document.getElementById('chat-expand-icon');
  const collapseIcon = document.getElementById('chat-collapse-icon');
  if (!win) return;
  if (chatExpanded) {
    win.classList.add('chat-expanded');
    btn && btn.classList.add('active');
    if (expandIcon)   expandIcon.style.display   = 'none';
    if (collapseIcon) collapseIcon.style.display = 'block';
  } else {
    win.classList.remove('chat-expanded');
    btn && btn.classList.remove('active');
    if (expandIcon)   expandIcon.style.display   = 'block';
    if (collapseIcon) collapseIcon.style.display = 'none';
  }
}

document.getElementById('chat-expand-btn').addEventListener('click', () => {
  chatExpanded = !chatExpanded;
  applyChatExpanded();
});

// ===== INIT =====
render();
