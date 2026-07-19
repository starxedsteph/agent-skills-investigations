'use strict';

// NOTE: All data below — accounts, JA4 fingerprints, email domains, IDs, and
// campaign figures — is FICTIONAL and fabricated for demonstration only.
// It does not represent real users or any organization's internal data.

// ===== SHARED CONTENT =====

const SKILL_SIGNUP = `---
name: investigation-signup
description: Analyzes registration-time signals to identify coordinated account creation: timing patterns, shared infrastructure (IP, JA4), email provider clustering, and username templates.
---

## Instructions

- Pull all available fields for seed accounts before expanding.
- JA4 is a strong signal only in combination with at least one
  other dimension — never pivot on JA4 alone.
- Flag templated usernames: adjective+noun+number patterns.
- Document any email providers or IP ranges that are
  platform-assigned or shared infrastructure (not attacker-chosen).

## Tables

\`signups\` — id, login, email, country_code, ja4, created_at, ip_address
\`repos\` — id, owner_id, name, description, created_at
\`account_classifications\` — LIVE stream (use this, not users_snapshot)`;

const SKILL_SIGNUP_UPDATED = `---
name: investigation-signup
description: Analyzes registration-time signals to identify coordinated account creation: timing patterns, shared infrastructure (IP, JA4), email provider clustering, and username templates.
---

## Instructions

- Pull all available fields for seed accounts before expanding.
- JA4 is a strong signal only in combination with at least one
  other dimension — never pivot on JA4 alone.
- Flag templated usernames: adjective+noun+number patterns.

## Known Platform Patterns (do not flag as campaigns)

- **iCloud Hide My Email:** addresses formatted as
  adjective-animal-number@icloud.com are Apple-generated.
  This pattern looks identical to Faker output but is
  platform-assigned. Never flag as a campaign signal.

## Tables

\`signups\` — id, login, email, country_code, ja4, created_at, ip_address
\`repos\` — id, owner_id, name, description, created_at
\`account_classifications\` — LIVE stream (use this, not users_snapshot)`;

const SKILL_CAMPAIGN = `---
name: campaign-identification
description: Orchestrates investigation skills to expand from seed accounts into full campaign scope. Coordinates across investigation skills with consistent methodology, expansion thresholds, and stopping criteria.
---

## Core Principles

- The goal is confidence, not completeness.
- Every account in the final result must clearly belong to the campaign.
- Not all seeds may appear in the final result.

## Convention

All investigation skills follow the \`investigation-*\` naming pattern (e.g. \`investigation-signup\`, \`investigation-phishing\`). When expanding a campaign, look for and load skills matching this pattern.

## Example Triggers

- "I have 5 accounts that look related — help me find the full campaign."
- "These accounts were flagged for phishing abuse. Are there more?"`;

const SKILL_SCAFFOLD = `---
name: scaffold-investigation-skill
description: Assistant for building investigation skills. Guides you through defining the investigation domain, providing tables and queries, documenting abuse signals, and validating the skill against the agentskills.io spec.
---

## Prerequisite

This skill builds on \`skill-creator\`. Load and follow \`skill-creator\` first —
this skill adds the investigation-specific questions on top. (The spec has no
dependency field, so the requirement lives here in the instructions.)

## Instructions

Ask the user to provide the following. Rough answers are fine — document what they give you.

- **Tables** they query for this domain
- **Queries** they already use (even rough ones)
- **Domain knowledge** — "things to know" when working with this data (gotchas, misleading column names, platform-assigned patterns to exclude)
- **Abuse signals** they look for

Assemble the skill from their answers using the standard subfolder structure: assets/, references/, scripts/.
Validate the completed skill against the agentskills.io spec before writing the file.`;

const FILES_BASE = [
  { name: 'campaign-identification', type: 'dir', children: [] },
  { name: 'investigation-billing', type: 'dir', children: [] },
  { name: 'investigation-phishing', type: 'dir', children: [] },
  { name: 'investigation-signup', type: 'dir', children: [
    { name: 'assets', type: 'dir' },
    { name: 'references', type: 'dir' },
    { name: 'scripts', type: 'dir' },
    { name: 'SKILL.md', type: 'file' },
  ]},
  { name: 'query-skill', type: 'dir', children: [] },
  { name: 'skill-creator', type: 'dir', children: [] },
];

const FILES_WITH_SCAFFOLD = [
  { name: 'campaign-identification', type: 'dir', children: [] },
  { name: 'investigation-billing', type: 'dir', children: [] },
  { name: 'investigation-phishing', type: 'dir', children: [] },
  { name: 'investigation-signup', type: 'dir', children: [
    { name: 'assets', type: 'dir' },
    { name: 'references', type: 'dir' },
    { name: 'scripts', type: 'dir' },
    { name: 'SKILL.md', type: 'file' },
  ]},
  { name: 'query-skill', type: 'dir', children: [] },
  { name: 'scaffold-investigation-skill', type: 'dir', isNew: true, children: [
    { name: 'SKILL.md', type: 'file' },
  ]},
  { name: 'skill-creator', type: 'dir', children: [] },
];

// V4 chat messages
const M_SEEDS = {
  role: 'user',
  content: 'These accounts appear to be related via email domains and signup date. Can you look for the whole campaign related to them?\n\n740021071  740021085  740021097  740021102  740021118\n740021129  740021143  740021151  740021165  740021174  740021188'
};

const SEEDS_INPUT_FINAL = 'These accounts appear to be related via email domains and signup date. Can you look for the whole campaign related to them?\n\n740021071  740021085  740021097  740021102  740021118\n740021129  740021143  740021151  740021165  740021174  740021188';

const M_PLAN = {
  role: 'agent',
  content: [
    { type: 'step', status: 'Loading `campaign-identification`...', label: 'Loaded `campaign-identification`', delay: 1800 },
    { type: 'step', status: 'Loading `investigation-signup`...', label: 'Loaded `investigation-signup`', delay: 1800 },
    { type: 'text', text: 'Let me start by pulling the seed accounts and checking what the registration signals look like.' }
  ]
};

const M_SEEDS_TABLE = {
  role: 'agent',
  content: [
    { type: 'step', status: 'Querying seed accounts — pulling registration signals...', label: 'Queried seed accounts', delay: 2500 },
    { type: 'table',
      headers: ['ts (2026-05-30)', 'id', 'login', 'email', 'ctry', 'ja4'],
      rows: [
        ['06:37:38', '740021071', 'brightpine4402',  'user4402@mysketchyhost.io',  'ES', 't00fake…abcabc'],
        ['06:37:38', '740021085', 'quietmeadow7715', 'user7715@mysketchyhost.io',  'ES', 't00fake…abcabc'],
        ['06:37:39', '740021097', 'copperfield310',  'user0310@throwaway-inbox.co','US', 't00fake…abcabc'],
        ['06:37:41', '740021102', 'silverbrook628',  'user0628@throwaway-inbox.co','US', 't00fake…abcabc'],
        ['06:37:50', '740021118', 'amberfox9930',    'user9930@mysketchyhost.io',  'ES', 't00fake…abcabc'],
        ['06:38:06', '740021129', 'mapleridge215',   'user0215@throwaway-inbox.co','US', 't00fake…abcabc'],
        ['06:38:21', '740021143', 'hollowvale825',   'user0825@throwaway-inbox.co','US', 't00fake…abcabc'],
        ['06:38:22', '740021151', 'driftwood118',    'user0118@mysketchyhost.io',  'ES', 't00fake…abcabc'],
        ['06:38:26', '740021165', 'cedarpost902',    'user0902@mysketchyhost.io',  'ES', 't00fake…abcabc'],
        ['06:38:36', '740021174', 'frostglen664',    'user0664@mysketchyhost.io',  'ES', 't00fake…abcabc'],
        ['06:39:04', '740021188', 'northgate473',    'user0473@mysketchyhost.io',  'ES', 't00fake…abcabc'],
      ]
    },
    { type: 'step', status: 'Analyzing JA4 fingerprints and creation window...', label: 'Analyzed JA4 fingerprints', delay: 2000 },
    { type: 'text', text: 'JA4 t00fake…abcabc reproduces exactly, **11/11**. 86-second burst. Two email providers, two countries — residential proxy pool, not one egress.\n\nTwo strong signals confirmed: shared JA4 × tight creation window. Expanding to find the full cohort.' }
  ]
};

const M_C1 = {
  role: 'agent',
  content: [
    { type: 'step', status: 'Expanding on shared JA4 across all recent signups...', label: 'Expanded JA4 cohort', delay: 3000 },
    { type: 'text', text: '`accounts_on_ja4 = 1,443`\n`total_templated_repos = 1,968`\n\n1,443 accounts on this fingerprint. Calling this **Cluster A**.\n\nA second repo template is surfacing alongside the first — rigid descriptions: *"A {adj} workspace for {noun} experiments."* on otherwise-empty repos. Let me expand on that template and split by JA4 to see whether these are the same group or a different one.' }
  ]
};

const M_C2 = {
  role: 'agent',
  content: [
    { type: 'step', status: 'Querying "workspace experiments" repos by JA4...', label: 'Queried workspace-exp repo fingerprint', delay: 2800 },
    { type: 'table',
      headers: ['ja4', 'accounts', 'repos', 'pattern'],
      rows: [
        ['t99fake…zzzzzz', '2,404', '12,032', 'workspace-exp'],
        ['t00fake…abcabc',   '462',  '2,151', 'workspace-exp'],
      ]
    },
    { type: 'text', text: '462 accounts with the workspace-experiments pattern share the same JA4 as the original cohort. Two distinct clusters, one infrastructure. Calling these **Cluster A** (original templated-repo group) and **Cluster B** (workspace-experiments group). **This is one operation running two payload patterns.**' },
  ]
};

const M_STATE = {
  role: 'agent',
  content: [
    { type: 'step', status: 'Checking live account_classifications stream...', label: 'Checked enforcement status', delay: 2500 },
    { type: 'table',
      headers: ['status', 'accounts'],
      rows: [
        ['flagged',                  '3,198'],
        ['not flagged / unclassified', '649'],
      ]
    },
    { type: 'text', text: '3,198 already flagged — enforcement has partial coverage. 649 still clean. Would you like me to scope the full campaign and build the report?' }
  ]
};

const M_CAMPAIGN = {
  role: 'agent',
  content: [
    { type: 'text', text: '# Account farming campaign — May 30 signup burst' },
    { type: 'pause', ms: 500 },
    { type: 'text', text: '**TL;DR:** 3,847 accounts across two clusters (Cluster A + Cluster B) on two JA4 fingerprints linked by shared infrastructure. Cluster A creates templated repos; Cluster B creates workspace-experiments repos. 3,198 already flagged. **649 remain unflagged.**' },
    { type: 'pause', ms: 700 },
    { type: 'text', text: '## Cluster breakdown' },
    { type: 'table',
      headers: ['Cluster', 'Accounts', 'Repos'],
      rows: [
        ['Cluster A',   '1,443', '1,968 templated'],
        ['Cluster B',   '2,404', '12,032 workspace-exp'],
        ['Total (A+B)', '3,847', 'distinct JA4s, no overlap'],
      ]
    },
    { type: 'text', text: '462 of Cluster A\'s accounts also push Cluster B\'s workspace-experiments payload — the shared-JA4 bridge that proves this is one operation running two payload patterns.' },
    { type: 'pause', ms: 700 },
    { type: 'text', text: '## Signals\n\n- **Shared JA4: `t00fake…abcabc`** — 11/11 seeds match. 86-second creation burst, 2026-05-30 06:37 UTC.\n- **Residential proxy pool** — two email providers, two countries. Not a single egress point.\n- **Templated usernames** — adjective+noun+number pattern consistent across both clusters.\n- **Repos created within minutes of signup** — both clusters, immediately after account creation.' },
  ]
};

const M_YES = { role: 'user', content: 'Yes' };

// V4 terminal lines (accumulate per beat)
const T4_4 = [
  '$ SELECT 1 FROM signups LIMIT 1;',
  '  → 1 row returned. Auth and connectivity good.',
  '',
  '$ SELECT id, login, email, country_code, ja4, created_at',
  '    FROM signups',
  '    WHERE id IN (740021071, 740021085, 740021097, 740021102,',
  '                 740021118, 740021129, 740021143, 740021151,',
  '                 740021165, 740021174, 740021188)',
  '    ORDER BY created_at;',
];

const T4_5 = [
  ...T4_4, '',
  "$ SELECT COUNT(DISTINCT s.id) AS c1_accounts,",
  "         COUNT(r.id)          AS total_templated_repos",
  "    FROM signups s JOIN repos r ON r.owner_id = s.id",
  "    WHERE s.ja4 = 't00fakeja4h0_555555abcabc_abcabc555555'",
  "      AND r.name REGEXP '^[a-z]+-[a-z]+-[a-z]+-[0-9]{3}$';",
];

const T4_6 = [
  ...T4_5, '',
  "$ SELECT s.ja4, COUNT(DISTINCT s.id) AS accounts,",
  "         COUNT(r.id) AS repos",
  "    FROM signups s JOIN repos r ON r.owner_id = s.id",
  "    WHERE r.description LIKE 'A % workspace for % experiments.'",
  "    GROUP BY s.ja4 ORDER BY accounts DESC;",
];

const T4_7 = [
  ...T4_6, '',
  "$ WITH campaign AS (",
  "    SELECT DISTINCT s.id FROM signups s",
  "    JOIN repos r ON r.owner_id = s.id",
  "    WHERE (s.ja4 = 't00fakeja4h0...' AND r.name REGEXP '...')",
  "       OR (s.ja4 = 't99fakeja4h9...' AND r.description LIKE '...')",
  "  )",
  "  SELECT ac.current_classification AS status, COUNT(*) AS accounts",
  "  FROM campaign c",
  "  JOIN account_classifications ac ON ac.account_id = c.id",
  "  GROUP BY ac.current_classification;",
];

// V12 chat messages
const M_V12_1_PROMPT = { role: 'user', content: 'I see a spike of signup activity on June 30. Look for account farming campaigns that may have started then.', pauseAfter: 600 };
const M_V12_1_AGENT  = {
  role: 'agent',
  content: [
    { type: 'step', status: 'Loading `campaign-identification`...', label: 'Loaded `campaign-identification`', delay: 1200 },
    { type: 'step', status: 'Loading `investigation-signup`...', label: 'Loaded `investigation-signup`', delay: 1200 },
    { type: 'step', status: 'Loading `query-skill`...', label: 'Loaded `query-skill`', delay: 800 },
    { type: 'step', status: 'Counting templated-login accounts around the spike...', label: 'Counted templated-login accounts', delay: 2500 },
    { type: 'text', text: '🚨 Massive campaign — ~40,000 accounts on a templated login shape.' },
    { type: 'pending-step', status: 'Pulling registration signals for top accounts...' },
  ],
  pauseAfter: 3000
};
const M_V12_1_CORR   = { role: 'user',  content: '40,000?? That\'s way too big for a one-day spike.', steering: true, pauseAfter: 2500 };
const M_V12_1_FIX    = { role: 'agent', content: 'Re-checking — the window was written `<= 2026-06-30` with no lower bound. Pulled months of historical signups. Bounding to the spike window, the cohort drops from ~40,000 to ~4,300, and most are ordinary free-mail signups.\n\nMy mistake on the date range.', pauseAfter: 2000 };

const M_V12_2_AGENT  = {
  role: 'agent',
  content: [
    { type: 'step', status: 'Clustering accounts by email pattern near spike window...', label: 'Clustered by email pattern', delay: 2800 },
    { type: 'text', text: '**Strong pattern detected** — 847 accounts sharing the same adjective-animal-number email format (`mossy-otter042@icloud.com`, `bright-fox-391@icloud.com`…). This looks coordinated.' },
    { type: 'pending-step', status: 'Expanding cluster to look for shared infrastructure...' },
  ],
  pauseAfter: 3000
};
const M_V12_2_CORR   = { role: 'user',  content: 'Those are iCloud Hide My Email addresses. That pattern is assigned by iCloud.', steering: true, pauseAfter: 2500 };
const M_V12_2_FIX    = { role: 'agent', content: 'Understood — `adjective-animal-number@icloud.com` is Apple\'s Hide My Email format, platform-assigned. Not attacker-chosen. The pattern is indistinguishable from Faker output, but the source is Apple, not the attacker.\n\nDropping this cluster.', pauseAfter: 1500 };

// V13 terminal
const T13 = [
  '$ git checkout -b fix/icloud-hme-pattern',
  "  Switched to a new branch 'fix/icloud-hme-pattern'",
  '$ git add skills/investigation-signup/SKILL.md',
  '$ git commit -m "exclude iCloud HME from campaign signals"',
  '  [fix/icloud-hme-pattern 9c2e441] exclude iCloud HME from campaign signals',
  '   1 file changed, 5 insertions(+)',
];

// V9 terminal
const T9 = [
  '$ git add skills/scaffold-investigation-skill/',
  '$ git commit -m "add scaffold-investigation-skill"',
  '  [main 3a7f912] add scaffold-investigation-skill',
  '   3 files changed, 47 insertions(+)',
];

// V13 chat messages
const M_V13_Q = { role: 'user', content: 'How can we improve the skills you used to avoid identifying the iCloud Hide My Email feature as an abuse pattern?' };
const M_V13_SUGGESTIONS = { role: 'agent', content: 'Looking at `investigation-signup/SKILL.md`...\n\nA few ways to address this:\n\n1. **Document iCloud Hide My Email as a known platform pattern** — add a \'Known Platform Patterns\' section noting that `adjective-animal-number@icloud.com` is Apple-generated, not attacker-chosen. Exclude from email clustering signals.\n\n2. **Add a pre-expansion filter** — instruct the skill to strip known platform-assigned email patterns before pivoting on email provider.\n\n3. **Scope email signals to free disposable providers only** — refine the signal definition to flag only providers known to be abuser-preferred.\n\nWhich fits best?' };
const M_V13_PICK = { role: 'user', content: 'Option 2. Please create a branch for this.' };
const M_V13_DONE = { role: 'agent', content: 'Creating branch `fix/icloud-hme-pattern`...\n\nUpdated `investigation-signup/SKILL.md` — added a \'Known Platform Patterns\' section documenting iCloud Hide My Email addresses as platform-assigned. Pattern excluded from email clustering signals.\n\nCommitted to `fix/icloud-hme-pattern`.' };

// ===== BEATS ARRAY =====

window.BEATS = [

  // ── V1: Title ──────────────────────────────────────────────────────────
  {
    id: 'V1',
    view: 'slide',
    slide: {
      type: 'title',
      title: 'AI as Your Investigation Partner',
      subtitle: 'Building Agents That Surface Hidden Abuse Patterns',
      name: 'Stephanie Elder',
      affiliation: 'Senior Data Analyst, Safety & Integrity · GitHub · TrustCon 2026',
      brandMark: 'brand/github-invertocat-white.svg',
    }
  },

  // ── V2: Crowding (auto-plays, no interaction needed) ──────────────────
  {
    id: 'V2',
    view: 'slide',
    slide: {
      type: 'crowding',
      // Overlapping reference windows — the pile you keep open just to remember your own data.
      // Appearance order: corners first, then middle fills in.
      windows: [
        { slot: 'slot-1', kind: 'web',  title: 'Stack Overflow',                     subtitle: '“compare a string to a timestamp?”' },  // top-right
        { slot: 'slot-6', kind: 'docs', title: 'PostgreSQL 16 — Date/Time Functions', subtitle: 'docs.postgresql.org' },                // bottom-left
        { slot: 'slot-4', kind: 'wiki', title: 'internal wiki — signups',             subtitle: 'is_verified = “was verified as of…”' }, // top-left
        { slot: 'slot-5', kind: 'file', title: 'query_v3_FINAL.sql',                  subtitle: 'the one that worked last time' },        // bottom-right
        { slot: 'slot-2', kind: 'docs', title: 'MySQL 8.0 Reference — CAST()',        subtitle: 'dev.mysql.com' },                        // center-left
        { slot: 'slot-3', kind: 'chat', title: '#data-help',                          subtitle: '“which column is the real user id?”' },  // upper-center
        { slot: 'slot-7', kind: 'note', title: 'Notes — table gotchas',              subtitle: 'account.id vs account_id' },             // dead center, last
      ]
    }
  },

  // ── V3: Query editor struggle — one continuous sequence ─────────────────
  {
    id: 'V3',
    view: 'query-editor',
    queryEditor: {
      finalQuery: `SELECT account_id, login, created_at\nFROM signups\nWHERE created_at > TIMESTAMP '2026-05-30'\n  AND country_code = 'ES'`,
      finalError: `PC LOAD LETTER`,
      sequence: [
        // SELECT — pauses between columns, typo on created_at
        { type: 'type', text: 'SELECT ' },
        { type: 'type', text: 'account_id' },
        { type: 'pause', ms: 400 },
        { type: 'type', text: ', login' },
        { type: 'pause', ms: 600 },        // thinking about the third column
        { type: 'type', text: ', creat' },
        { type: 'pause', ms: 150 },
        { type: 'type', text: 'd_at' },    // typo: creatd_at (missing e)
        { type: 'pause', ms: 350 },        // notice the typo
        { type: 'backspace', count: 4 },   // remove d_at
        { type: 'type', text: 'ed_at' },   // fix: created_at

        // FROM — type 'si', tab-complete to 'signups'
        { type: 'type', text: '\nFROM ' },
        { type: 'type', text: 'si' },
        { type: 'pause', ms: 500 },        // tab complete pause
        { type: 'complete', text: 'gnups' },

        // WHERE
        { type: 'pause', ms: 600 },
        { type: 'type', text: "\nWHERE created_at > '" },
        { type: 'pause', ms: 800 },        // thinking about the date
        { type: 'type', text: "2026-05-30'" },
        { type: 'pause', ms: 900 },
        { type: 'type', text: "\n  AND country = 'ES'" },
        { type: 'pause', ms: 1200 },
        { type: 'run' },
        { type: 'pause', ms: 700 },
        { type: 'error', text: "Unknown column 'country'" },

        // Fix 1: country → country_code
        { type: 'pause', ms: 1800 },       // reading the error
        { type: 'clearError' },
        { type: 'backspace', count: 9 },   // removes: ry = 'ES' (back into the word a bit)
        { type: 'pause', ms: 400 },
        { type: 'type', text: "ry_code = 'ES'" },
        { type: 'pause', ms: 1000 },
        { type: 'run' },
        { type: 'pause', ms: 700 },
        { type: 'error', text: "Invalid value for created_at: expected TIMESTAMP, got STRING" },

        // Fix 2: move cursor before the date, try CAST, backspace, use TIMESTAMP
        // Text at this point: "SELECT account_id, login, created_at\nFROM signups\nWHERE created_at > '2026-05-30'\n  AND country_code = 'ES'"
        // Position 69 = just before the ' in '2026-05-30'
        { type: 'pause', ms: 2200 },       // reading this error, more confused
        { type: 'clearError' },
        { type: 'moveCursor', pos: 69 },
        { type: 'type', text: 'CAST(' },
        { type: 'pause', ms: 600 },        // pause — second thoughts
        { type: 'backspace', count: 5 },   // removes CAST(
        { type: 'pause', ms: 700 },        // switching approach
        { type: 'type', text: 'TIMESTAMP ' },
        { type: 'moveCursor', pos: 'end' },
        { type: 'pause', ms: 1200 },
        { type: 'run' },
        { type: 'pause', ms: 700 },
        { type: 'error', text: 'PC LOAD LETTER' },
      ]
    }
  },

  // ── V4: Opening investigation ────────────────────────────────────────────
  {
    id: 'V4-0',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: '', content: '' },
      terminal: { lines: [] },
      chat: { messages: [] },
      chatInputDraft: SEEDS_INPUT_FINAL,
      chatInputSequence: [
        { type: 'set',   text: 'These accounts appear to be related via email domains and signup date. Can you lo' },
        { type: 'type',  text: 'ok for the whole campaign related to them?' },
        { type: 'pause', ms: 900 },
        { type: 'paste', text: '\n\n740021071  740021085  740021097  740021102  740021118\n740021129  740021143  740021151  740021165  740021174  740021188' },
        { type: 'pause', ms: 4000 },
      ],
      authPrompt: false,
    }
  },
  {
    id: 'V4-1',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: '', content: '' },
      terminal: { lines: [] },
      chat: { messages: [M_SEEDS], animateLast: true, autoAdvance: 7000 },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V4-2',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: ['campaign-identification', 'investigation-signup'] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [] },
      chat: { messages: [M_SEEDS, M_PLAN], animateLast: true, autoAdvance: 5500 },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V4-3',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [] },
      chat: { messages: [M_SEEDS, M_PLAN], animateLast: false },
      chatInputDraft: '',
      authPrompt: true,
    }
  },
  {
    id: 'V4-4',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: T4_4, animate: true },
      chat: { messages: [M_SEEDS, M_PLAN, M_SEEDS_TABLE], animateLast: true, autoAdvance: 4500 },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V4-5',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: T4_5, animate: true },
      chat: { messages: [M_SEEDS, M_PLAN, M_SEEDS_TABLE, M_C1], animateLast: true, autoAdvance: 4500 },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V4-6',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: T4_6, animate: true },
      chat: { messages: [M_SEEDS, M_PLAN, M_SEEDS_TABLE, M_C1, M_C2], animateLast: true, autoAdvance: 5500 },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V4-7',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: T4_7, animate: true },
      chat: { messages: [M_SEEDS, M_PLAN, M_SEEDS_TABLE, M_C1, M_C2, M_STATE], animateLast: true, autoAdvance: 5000 },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V4-7b',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: T4_7 },
      chat: { messages: [M_SEEDS, M_PLAN, M_SEEDS_TABLE, M_C1, M_C2, M_STATE] },
      chatInputDraft: 'Yes',
      chatInputSequence: [
        { type: 'pause', ms: 1000 },
        { type: 'type', text: 'Yes', delay: 120 },
        { type: 'pause', ms: 5000 },
      ],
      authPrompt: false,
    }
  },
  {
    id: 'V4-8',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: T4_7, hidden: true },
      chat: { messages: [M_SEEDS, M_PLAN, M_SEEDS_TABLE, M_C1, M_C2, M_STATE, M_YES, M_CAMPAIGN], animateLast: true },
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V5: Agent Skills slide ────────────────────────────────────────────────
  {
    id: 'V5',
    view: 'slide',
    slide: {
      type: 'minimal',
      heading: 'Agent Skills',
      sub: 'Packaged instructions an AI can load when it needs to handle a specific task',
      accent: 'skills',
    }
  },

  // ── V5b: agentskills.io spec page ─────────────────────────────────────
  {
    id: 'V5b',
    view: 'slide',
    slide: { type: 'browser' }
  },

  // ── V6: Skills folder ──────────────────────────────────────────────────
  {
    id: 'V6',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [] },
      chat: { messages: [] },
      editorMode: true,
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V7: Subfolders expanded ────────────────────────────────────────────
  {
    id: 'V7',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: ['investigation-signup'], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [] },
      chat: { messages: [] },
      editorMode: true,
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V8: Skill selection demo ───────────────────────────────────────────
  {
    id: 'V8',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_BASE, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [] },
      chat: {
        messages: [
          { role: 'user', content: 'mossy-otter042 was just flagged for phishing. Can you look for any accounts connected to it?' },
          { role: 'agent', content: '' },
        ],
      },
      skillScan: {
        load: ['campaign-identification', 'investigation-phishing'],
        extraLoad: [
          { skill: 'investigation-signup', think: 'Phishing accounts often share signup infrastructure — pulling signup signals too...' },
        ],
        scanDelay: 500,
        loadPause: 400,
        stepDelay: 1500,
        thinkDelay: 1000,
      },
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V8b: Campaign identification skill ────────────────────────────────
  {
    id: 'V8b',
    view: 'vscode',
    vscode: {
      explorer: { files: [
        { name: 'campaign-identification', type: 'dir', children: [
          { name: 'SKILL.md', type: 'file' },
        ]},
        { name: 'investigation-billing', type: 'dir', children: [] },
        { name: 'investigation-phishing', type: 'dir', children: [] },
        { name: 'investigation-signup', type: 'dir', children: [
          { name: 'assets', type: 'dir' },
          { name: 'references', type: 'dir' },
          { name: 'scripts', type: 'dir' },
          { name: 'SKILL.md', type: 'file' },
        ]},
        { name: 'query-skill', type: 'dir', children: [] },
        { name: 'skill-creator', type: 'dir', children: [] },
      ], expanded: ['campaign-identification'], highlighted: ['campaign-identification'] },
      editor: { filename: 'campaign-identification/SKILL.md', content: SKILL_CAMPAIGN },
      terminal: { lines: [] },
      chat: { messages: [] },
      editorMode: true,
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V9: Scaffold skill + first commit ─────────────────────────────────
  {
    id: 'V9',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: ['scaffold-investigation-skill'], highlighted: ['scaffold-investigation-skill'] },
      editor: { filename: 'scaffold-investigation-skill/SKILL.md', content: SKILL_SCAFFOLD },
      terminal: { lines: T9, animate: true },
      chat: { messages: [] },
      editorMode: true,
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V10: ATO scaffolding ──────────────────────────────────────────────
  {
    id: 'V10-1',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: ['scaffold-investigation-skill'] },
      editor: { filename: 'scaffold-investigation-skill/SKILL.md', content: SKILL_SCAFFOLD },
      terminal: { lines: [] },
      chat: {
        messages: [
          { role: 'user', content: 'I\'d like to create a new investigation skill to identify account takeovers', instant: true },
          { role: 'agent', content: 'Loading `scaffold-investigation-skill`...\n\nWhat table or data source contains the primary login and session signals you use for account takeover detection?' },
          { role: 'user', content: 'recent_logins, password_change_events, email_change_events', paste: true, beforePost: 800 },
          { role: 'agent', content: [
            { type: 'step', status: 'Documenting tables...', label: 'Documented tables', delay: 1500 },
            { type: 'text', text: 'What signals most reliably indicate an ATO in your environment? For example: login from a new country, new device fingerprint, password reset followed by email change.' },
          ]},
        ],
        autoPlay: true
      },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V10-4',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: [] },
      editor: { filename: 'scaffold-investigation-skill/SKILL.md', content: SKILL_SCAFFOLD },
      terminal: { lines: [] },
      chat: {
        messages: [
          { role: 'user', content: 'I\'d like to create a new investigation skill to identify account takeovers' },
          { role: 'agent', content: 'Loading `scaffold-investigation-skill`...\n\nWhat table or data source contains the primary login and session signals you use for account takeover detection?' },
          { role: 'user', content: 'recent_logins, password_change_events, email_change_events' },
          { role: 'agent', content: [
            { type: 'step', status: 'Documenting tables...', label: 'Documented tables', delay: 1500 },
            { type: 'text', text: 'What signals most reliably indicate an ATO in your environment? For example: login from a new country, new device fingerprint, password reset followed by email change.' },
          ]},
        ],
      },
      chatInputSequence: [
        { type: 'type', text: 'Yes, all of those.', delay: 60 },
        { type: 'pause', ms: 600 },
        { type: 'post' },
      ],
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  {
    id: 'V10-5',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: [] },
      editor: { filename: 'scaffold-investigation-skill/SKILL.md', content: SKILL_SCAFFOLD },
      terminal: { lines: [] },
      chat: {
        messages: [
          { role: 'user', content: 'I\'d like to create a new investigation skill to identify account takeovers' },
          { role: 'agent', content: 'Loading `scaffold-investigation-skill`...\n\nWhat table or data source contains the primary login and session signals you use for account takeover detection?' },
          { role: 'user', content: 'recent_logins, password_change_events, email_change_events' },
          { role: 'agent', content: [
            { type: 'step', status: 'Documenting tables...', label: 'Documented tables', delay: 1500 },
            { type: 'text', text: 'What signals most reliably indicate an ATO in your environment? For example: login from a new country, new device fingerprint, password reset followed by email change.' },
          ]},
          { role: 'user', content: 'Yes, all of those.' },
          { role: 'agent', content: [
            { type: 'step', status: 'Documenting signals...', label: 'Documented signals', delay: 1500 },
            { type: 'text', text: 'Are there any column names or table fields that look like one thing but mean another? Any known gotchas I should document?' },
          ]},
        ],
        animateLast: true
      },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V10-6',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: [] },
      editor: { filename: 'scaffold-investigation-skill/SKILL.md', content: SKILL_SCAFFOLD },
      terminal: { lines: [] },
      chat: {
        messages: [
          { role: 'user', content: 'I\'d like to create a new investigation skill to identify account takeovers' },
          { role: 'agent', content: 'Loading `scaffold-investigation-skill`...\n\nWhat table or data source contains the primary login and session signals you use for account takeover detection?' },
          { role: 'user', content: 'recent_logins, password_change_events, email_change_events' },
          { role: 'agent', content: [
            { type: 'step', status: 'Documenting tables...', label: 'Documented tables', delay: 1500 },
            { type: 'text', text: 'What signals most reliably indicate an ATO in your environment? For example: login from a new country, new device fingerprint, password reset followed by email change.' },
          ]},
          { role: 'user', content: 'Yes, all of those.' },
          { role: 'agent', content: [
            { type: 'step', status: 'Documenting signals...', label: 'Documented signals', delay: 1500 },
            { type: 'text', text: 'Are there any column names or table fields that look like one thing but mean another? Any known gotchas I should document?' },
          ]},
        ],
      },
      chatInputSequence: [
        { type: 'type', text: 'Yes — is_verified does not mean currently verified. It means "was verified as of whenever we stopped checking."', delay: 45 },
        { type: 'pause', ms: 600 },
        { type: 'post' },
      ],
      noAutoAdvance: true,
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V11: Security note slide ───────────────────────────────────────────
  {
    id: 'V11',
    view: 'slide',
    slide: {
      type: 'guardrails',
      items: [
        'Approved model',
        'Secure credentials',
        'Read-only data access',
      ]
    }
  },

  // ── V11b: Best practices slide ─────────────────────────────────────────
  {
    id: 'V11b',
    view: 'slide',
    slide: {
      type: 'guardrails',
      heading1: 'Best Practices',
      heading2: 'Highly recommended',
      items: [
        'Test before returning',
        'Version control',
        'One investigation per chat',
      ]
    }
  },

  // ── V12: Failure sequence (auto-plays) ────────────────────────────────
  {
    id: 'V12',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: [] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [
        "$ SELECT COUNT(*) AS accounts FROM signups",
        "    WHERE created_at <= '2026-06-30'",
        "      AND login REGEXP '^[a-z]{6,}[0-9]{3,}$';",
      ]},
      chat: {
        messages: [
          M_V12_1_PROMPT,
          M_V12_1_AGENT, M_V12_1_CORR, M_V12_1_FIX,
          M_V12_2_AGENT, M_V12_2_CORR, M_V12_2_FIX,
        ],
        autoPlay: true
      },
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V13: Correction — 4-beat sequence ────────────────────────────────
  {
    id: 'V13-1',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: ['investigation-signup'] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [] },
      chat: {
        messages: [
          M_V12_1_PROMPT, M_V12_1_AGENT, M_V12_1_CORR, M_V12_1_FIX,
          M_V12_2_AGENT, M_V12_2_CORR, M_V12_2_FIX,
        ],
      },
      chatInputSequence: [
        { type: 'type', text: 'How can we improve the skills you used to avoid identifying the iCloud Hide My Email feature as an abuse pattern?', delay: 28 },
        { type: 'pause', ms: 600 },
        { type: 'post' },
      ],
      noAutoAdvance: true,
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V13-2',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: ['investigation-signup'] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [] },
      chat: {
        messages: [
          M_V12_1_PROMPT, M_V12_1_AGENT, M_V12_1_CORR, M_V12_1_FIX,
          M_V12_2_AGENT, M_V12_2_CORR, M_V12_2_FIX,
          M_V13_Q, M_V13_SUGGESTIONS,
        ],
        animateLast: true
      },
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V13-3',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: ['investigation-signup'] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP },
      terminal: { lines: [] },
      chat: {
        messages: [
          M_V12_1_PROMPT, M_V12_1_AGENT, M_V12_1_CORR, M_V12_1_FIX,
          M_V12_2_AGENT, M_V12_2_CORR, M_V12_2_FIX,
          M_V13_Q, M_V13_SUGGESTIONS,
        ],
      },
      chatInputSequence: [
        { type: 'type', text: 'Option 2. Please create a branch for this.', delay: 50 },
        { type: 'pause', ms: 600 },
        { type: 'post' },
      ],
      chatInputDraft: '',
      authPrompt: false,
    }
  },
  {
    id: 'V13-4',
    view: 'vscode',
    vscode: {
      explorer: { files: FILES_WITH_SCAFFOLD, expanded: [], highlighted: ['investigation-signup'] },
      editor: { filename: 'investigation-signup/SKILL.md', content: SKILL_SIGNUP_UPDATED },
      terminal: { lines: T13, animate: true },
      chat: {
        messages: [
          M_V12_1_PROMPT, M_V12_1_AGENT, M_V12_1_CORR, M_V12_1_FIX,
          M_V12_2_AGENT, M_V12_2_CORR, M_V12_2_FIX,
          M_V13_Q, M_V13_SUGGESTIONS, M_V13_PICK, M_V13_DONE,
        ],
        animateLast: true
      },
      chatInputDraft: '',
      authPrompt: false,
    }
  },

  // ── V14a: Division of labor slide ─────────────────────────────────────
  {
    id: 'V14a',
    view: 'slide',
    slide: {
      type: 'split',
      left: {
        heading: 'What it handles',
        icon: 'volume',
        items: [
          'Volume',
          'Multiple signal dimensions at once',
          'Instant recall',
          'Works while you take a break',
        ]
      },
      right: {
        heading: 'Where you\'re irreplaceable',
        icon: 'judgment',
        items: [
          'The right first question',
          'Knowing when the cluster is too wide',
          'Watching for drift',
          'Spotting the false positives',
        ]
      }
    }
  },

  // ── V14a-2: Surfaces the unexpected ───────────────────────────────────
  {
    id: 'V14a-2',
    view: 'slide',
    slide: {
      type: 'thread-map',
    }
  },

  // ── V14b: Validation checklist ────────────────────────────────────────
  {
    id: 'V14b',
    view: 'slide',
    slide: {
      type: 'validation',
      heading: 'Before You Act',
      items: [
        'Spot-check — can you confirm accounts belong?',
        'Identifiable rows — username, ID, email, connecting signal',
        'Ask how it got there — understand the pivot',
        'You decide — not the AI',
      ]
    }
  },

  // ── V16a: Portable / your setup ───────────────────────────────────────
  {
    id: 'V16a',
    view: 'slide',
    slide: {
      type: 'portable-setup',
      copilotLockup: 'brand/github-copilot-lockup-white.svg',
    }
  },

  // ── V16b: Build it with your team ─────────────────────────────────────
  {
    id: 'V16b',
    view: 'slide',
    slide: {
      type: 'minimal',
      heading: 'AI → Person-to-Person Collaboration',
      sub: 'A shared place for the team\'s expertise to compound',
      accent: 'collaboration',
    }
  },

  // ── V16: Resource repo / QR ───────────────────────────────────────────
  {
    id: 'V16',
    view: 'slide',
    slide: {
      type: 'qr',
      url: 'https://github.com/starxedsteph/agent-skills-investigations',
      qr: 'agent-skills-investigations-qr.svg',
    }
  },

];
