---
name: scaffold-investigation-skill
description: Interactive assistant for creating and updating investigation skills. Guides you through defining the investigation domain, providing tables and queries, documenting abuse signals and false positives, incorporating corrections from real use, and validating the result against the agentskills.io spec. Use when creating or revising an investigation-* skill for a specific abuse domain.
---

# scaffold-investigation-skill

> A specialized skill-creator for building **investigation-*** skills.

## Prerequisite

This skill builds on **[`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator)**.
Install the complete `skill-creator` directory from that exact location. Before
doing anything else, load and follow `skill-creator` for the base creation and
revision flow — this skill adds the investigation-specific questions (tables,
queries, signals, false positives, and gotchas) on top.

The Agent Skills spec has no dependency field and no auto-loading: skills are
discovered and loaded on demand. So rather than rely on a non-spec `dependencies`
field, the requirement is written here in the instructions. Any agent that reads
this skill will honor it, which keeps it portable.

---

## Purpose

Investigation skills capture how an analyst investigates one abuse domain — the
tables they query, the queries they already trust, the signals they look for, and
the quirks of their environment. This skill interviews you and assembles that
knowledge into a consistent, spec-compliant skill so every investigation skill on
your team looks and works the same way.

You bring the domain knowledge. This skill handles the structure.

---

## When to use

Use this when you want a new `investigation-{domain}` skill for:

- A new abuse category not yet covered by an existing skill
- A product area with its own investigation needs
- A new data source that needs documented query patterns
- Updating an existing investigation skill with new queries, signals, gotchas,
  false positives, or corrections learned from real use

**Don't use this for:**

- General skill creation → use the base `skill-creator`
- Non-investigation skills (dashboards, tooling, one-off scripts)

---

## The investigation-skill pattern

Every `investigation-{domain}` skill follows the same layout:

```
investigation-{domain}/
├── SKILL.md          # Overview, when-to-use, data sources, signals, patterns
└── references/       # Optional, loaded on demand
    ├── tables.md     # Schema, partitions, retention, gotchas
    ├── queries.md    # Full query library
    └── patterns.md   # Abuse patterns and investigation workflows
```

### Naming convention

- Use the `investigation-{domain}` format (e.g. `investigation-signup`,
  `investigation-billing`).
- The `investigation-` prefix signals to the agent — and to
  [`campaign-identification`](../campaign-identification/) — that the skill
  provides investigation capabilities it can orchestrate.

### Recommended SKILL.md sections

1. **Purpose** — what domain, what you can do with it
2. **When to use** — the triggers that should load this skill
3. **Data sources** — tables/sources, how to reach them, retention, partitions
4. **Key signals** — abuse indicators, ideally with a rough severity
5. **False positives** — how to tell abuse from legitimate use
6. **Common patterns** — the investigation workflows you actually run
7. **Output shape** — what a finished result should contain (see below)
8. **Related skills** — cross-references to complementary skills

---

## What the assistant collects

Work statelessly: each turn, check what's still missing and ask for the single
most important gap — not everything at once.

### Required before generating

| Need | What good looks like |
|------|----------------------|
| **Domain** | A clear abuse area ("account takeover", "signup abuse") |
| **Tables / sources** | At least one source the domain is investigated from |
| **Queries** | At least one working query, or a clear description of what to find |
| **Signals** | What actually indicates abuse in this domain |

### Optional, but improves quality

| Need | Ask when… |
|------|-----------|
| Domain knowledge / gotchas | The user mentions misleading column names or quirks |
| False positives | The user has been burned by legitimate-looking activity |
| Investigation patterns | The user describes their step-by-step workflow |
| Stopping criteria | The user talks about when a cluster gets too wide |

**Ready to generate when:** the domain is clear, at least one source is
documented, there's at least one query or a concrete description of what to find,
and the basic abuse signals are named.

---

## Output shape (bake this into every skill)

Every investigation skill should produce results a human can spot-check. Instruct
the generated skill to return the **minimum identifiable context needed** to
confirm the cluster by hand:

- A stable identifier (account id, username, or equivalent)
- Human-readable context needed for validation (created-at, country, etc.)
- **The specific field that ties each row to the cluster** — the connecting signal

Include email or other PII only when it is necessary for validation and the
output location is approved for that data.

A finding you can't spot-check isn't actionable. Make that non-negotiable in the
skills you generate.

---

## agentskills.io spec compliance

New skills must satisfy the [Agent Skills spec](https://agentskills.io/specification):

| Constraint | Requirement |
|------------|-------------|
| `name` | ≤ 64 chars, lowercase letters/numbers/hyphens, matches the directory name |
| `description` | ≤ 1024 chars, says what it does *and* when to use it |
| `SKILL.md` body | ≤ 500 lines recommended — move detail into `references/` |
| Directory name | Must match the `name` field exactly |

Validate before writing the file. You can ask the agent to check it:

```
Validate my new investigation-{domain} skill against the agentskills.io spec:
name, description, line count, and directory match.
```

If `SKILL.md` runs long, move query libraries and schema notes into `references/`.

---

## Example prompts

**Start interactively**

```
I want to create an investigation skill for account takeovers.
Walk me through what you need from me.
```

**Provide tables and queries upfront**

```
Help me create an investigation skill for account takeovers.

Sources I use:
- recent_logins, password_change_events, email_change_events

Queries I have:
[paste your queries]

Things to know:
- A password reset followed by an email change within minutes is the strongest signal.
```

**Scaffold from existing queries**

```
Here are the queries I use for takeover investigations:
[paste queries]

Turn these into a proper investigation-account-takeover skill,
and ask me for any context you still need.
```

**Add domain knowledge later**

```
Load skill-creator and scaffold-investigation-skill, then update my
investigation-account-takeover skill with this gotcha:
"last_login is updated lazily — it can lag real activity by up to an hour."

Review the existing skill, make the change in the right section, and validate
the updated skill against the agentskills.io spec.
```

---

## Quality checklist

### Structure
- [ ] `name` matches the directory name exactly
- [ ] `name` ≤ 64 chars, lowercase + hyphens only
- [ ] `description` ≤ 1024 chars and says what *and* when
- [ ] `SKILL.md` ≤ 500 lines (detail moved to `references/`)
- [ ] Recommended sections present

### Content
- [ ] Data sources note how to reach them, retention, and partitions
- [ ] Signals named, with a rough sense of strength/severity
- [ ] False positives documented
- [ ] At least one real investigation pattern
- [ ] A handful of ready-to-run queries (in `references/` if long)
- [ ] Output shape requires the minimum context needed for spot-checking
- [ ] Email and other PII are included only when necessary and appropriate

### Integration
- [ ] Related-skills section cross-references complementary skills
- [ ] Skill can be picked up and orchestrated by `campaign-identification`

### Validation
- [ ] Every documented source/column actually exists
- [ ] Every query runs before it ships
- [ ] A teammate could follow the skill and reproduce a result

---

## Related skills

- [`campaign-identification`](../campaign-identification/) — orchestrates
  investigation skills to expand seeds into a full campaign
- [`investigation-seo-spam`](../investigation-seo-spam/) — a worked example of the
  investigation-skill pattern that needs no internal data

For general guidance on tailoring skills to your own environment, see
[`adapting-to-your-environment.md`](../adapting-to-your-environment.md) and
[`best-practices.md`](../best-practices.md).
