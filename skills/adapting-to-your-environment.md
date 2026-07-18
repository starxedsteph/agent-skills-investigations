# Adapting to Your Environment

The starter skills in this repo are generic by design — they don't know your
tables, your column names, or the quirks of your data. That's the part you add.

This guide walks through building an investigation skill for your environment.

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

## Template

Copy this as a starting point:

```markdown
---
name: investigation-[type]
description: Investigates [type] abuse using [main signals]. Covers [table-1], [table-2].
---

# Investigation: [Type]

## Tables

**[table_name]** — [what it contains and when to use it]
- `[column]` — [what it actually means, especially if the name is misleading]
- `[column]` — [cast requirements, if any]

**[table_name]** — [what it contains]
- `[column]` — [notes]

## Signals

The primary signals for this investigation type:

1. **[Signal name]** — [what it is and where to find it]. Strong signal if [threshold].
2. **[Signal name]** — [what it is and where to find it]. Treat as corroborating, not primary, if [condition].
3. **[Signal name]** — [what it is and where to find it].

## Query patterns

[Describe the approach: do you start with a subquery, a CTE, a direct JOIN?
Any specific patterns that work well or poorly in this environment?]

When querying [table], always [specific convention, e.g., "filter by created_at
before joining — the table is large and full scans are slow"].

## Expansion methodology

Starting from seed accounts:
1. Identify the strongest signal present across ≥ X% of seeds
2. Query for all accounts sharing that signal within [time window]
3. Require ≥ 2 independent signals before calling it a campaign
4. Stop expanding when [stopping criterion, e.g., the next expansion adds <5% new accounts]

## Gotchas

- `[column]` reads like [X] but actually means [Y]. Use [column_2] for [what you wanted].
- [Platform behavior that looks like abuse but isn't, e.g., iCloud Hide My Email creates
  privaterelay.appleid.com addresses for legitimate users — do not flag this as an abuse pattern]
- [Anything else you've learned the hard way]

## Output

Always include in results: [account_id, username, email, created_at, and the specific
field that connects them to the cluster]. This makes the finding spot-checkable.
```

---

## Column gotchas — why this matters

Every system has columns whose names don't match what they actually store.
You already know these by heart. Write them down.

Examples of the kind of thing worth documenting:

- A flag called `is_verified` that actually means "was verified at whatever point
  we last checked, which we stopped doing in 2022"
- A `status` column that uses numeric codes with no enum, where `3` means active
  and `7` means suspended but the intuitive mapping is the opposite
- A timestamp stored as a string that requires explicit casting before you can
  compare it to another date

Every time the agent has to re-figure one of these out, it might get it wrong.
Write it down once and it gets it right every time.

---

## Adding references

For complex tables or investigation types, add a `references/` subfolder:

```
investigation-billing/
  SKILL.md
  references/
    tables.md          ← detailed table and column documentation
    sample-queries.md  ← queries you've used that work well
    known-patterns.md  ← specific patterns this team has seen before
```

Reference these files in your SKILL.md:

```markdown
See `references/tables.md` for full column documentation on the billing tables.
See `references/sample-queries.md` for tested query patterns.
```

---

## Getting teammates involved

The best investigation skills come from more than one person.

That teammate who always knows the right table to query? Pull them in.
The person who's written every phishing investigation for the last three years?
Have them help write the phishing skill. Their knowledge goes in once;
the whole team can access it from that point forward.

A useful framing: "I'm writing down how we do [investigation type] so the
whole team can use it. Can you tell me which tables you start with and
what signals you look for?"

You're not replacing their expertise. You're making it available to everyone
who does this work.

---

For general best practices on writing effective skill instructions — description
writing, context management, skill organization — see
[agentskills.io/skill-creation/best-practices](https://agentskills.io/skill-creation/best-practices).
