# Adapting to Your Environment

The starter skills in this repo are generic by design — they don't know your
tables, your column names, or the quirks of your data. That's the expertise you
give the agent.

You do not need to draft the skill yourself. Install
[`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
and this repository's
[`scaffold-investigation-skill`](scaffold-investigation-skill/), then let the
agent interview you, create the files, and validate the result.

---

## What goes in an investigation skill

An investigation skill teaches the agent how you investigate one type of abuse.
It should cover:

1. **Which tables to use** — and what they're actually called
2. **Column gotchas** — columns whose names are misleading, columns that require
   a cast, columns that mean something different than they sound like
3. **Query patterns** — your preferred JOIN style, common CTEs, how you handle
   timestamps, what indexes exist
4. **The signals** — the specific indicators you look for in this investigation type
5. **Stopping criteria** — when to stop expanding and call it a campaign
6. **Output format** — what rows to include so you can validate the finding

---

## Create a skill with the agent

Start with the investigation domain you know best. Ask the agent to load both
creation skills and lead the process:

```text
Load skill-creator and scaffold-investigation-skill. Help me create an
investigation skill for [abuse domain]. Ask me for the most important missing
information one question at a time. When you have enough context, create the
skill using the investigation-skill structure and validate it against the
agentskills.io specification.
```

Bring rough answers, not a polished draft. Existing queries, table notes,
runbooks, and examples from closed investigations are useful source material.
The agent should organize them into the canonical structure defined by
`scaffold-investigation-skill`:

```text
investigation-{domain}/
├── SKILL.md
└── references/
    ├── tables.md
    ├── queries.md
    └── patterns.md
```

The agent may omit reference files that are not needed. It should keep the main
`SKILL.md` focused and move detailed schemas, query libraries, and investigation
patterns into references that load on demand.

## Update a skill with the agent

Treat corrections from real use as inputs to the same workflow. Do not hand the
agent a replacement draft; give it the existing skill and the new knowledge:

```text
Load skill-creator and scaffold-investigation-skill. Review my existing
investigation-[domain] skill and update it with this correction:

[new query, false positive, signal, gotcha, or workflow correction]

Preserve accurate guidance, put the update in the right file, and validate the
complete skill after editing it.
```

---

## Column gotchas — why this matters

Every system has columns whose names don't match what they actually store.
You already know these by heart. Tell the agent so it can put them in the skill.

Examples of the kind of thing worth documenting:

- A flag called `is_verified` that actually means "was verified at whatever point
  we last checked, which we stopped doing in 2022"
- A `status` column that uses numeric codes with no enum, where `3` means active
  and `7` means suspended but the intuitive mapping is the opposite
- A timestamp stored as a string that requires explicit casting before you can
  compare it to another date

Every time the agent has to re-figure one of these out, it might get it wrong.
Have it record the correction once so the skill carries it into future work.

---

## What the agent should put in references

For complex tables or investigation types, add a `references/` subfolder:

```
investigation-billing/
  SKILL.md
  references/
    tables.md          ← detailed table and column documentation
    queries.md         ← queries you've used that work well
    patterns.md        ← specific patterns this team has seen before
```

The agent should link each reference from `SKILL.md` and say when to load it:

```markdown
See `references/tables.md` for full column documentation on the billing tables.
See `references/queries.md` for tested query patterns.
```

---

## Getting teammates involved

The best investigation skills come from more than one person.

That teammate who always knows the right table to query? Pull them in.
The person who's written every phishing investigation for the last three years?
Have them answer the agent's questions while it creates the phishing skill. Their knowledge goes in once;
the whole team can access it from that point forward.

A useful framing: "The agent is turning our [investigation type] process into a
reusable skill. Can you help answer its questions about the tables, queries,
signals, false positives, and gotchas we rely on?"

You're not replacing their expertise. You're making it available to everyone
who does this work.

---

For general best practices on writing effective skill instructions — description
writing, context management, skill organization — see
[agentskills.io/skill-creation/best-practices](https://agentskills.io/skill-creation/best-practices).
