# Investigation Skills

This folder contains starter skills for AI-assisted abuse investigations.

> These skills are provided for demonstration and educational purposes. Test them
> thoroughly in your own environment before relying on them for real work.

## What is a skill?

A skill is a folder with a `SKILL.md` file inside it. That file contains:
- A **name** and **description** the agent uses to decide when to load it
- **Instructions** that tell the agent how to do a specific type of work

```
my-skill/
  SKILL.md          ← required
  references/       ← optional: sample queries, table docs, gotchas
    tables.md
    sample-queries.md
```

The `SKILL.md` format uses YAML frontmatter:

```markdown
---
name: skill-name
description: One sentence describing what this skill does. The agent reads this to decide whether to load it.
---

# Instructions

Everything after the frontmatter is the skill's instructions.
Write them the way you'd explain the work to a new teammate.
```

The full format specification is at [agentskills.io/specification](https://agentskills.io/specification).

## How agents use skills

When you make a request, the agent scans the name and description of every
skill in your skills folder. It loads the ones relevant to your request and
ignores the rest. This keeps the context focused — the agent isn't trying
to hold every skill in mind at once.

If it realizes mid-investigation that it needs a skill it didn't load initially,
it can go back, scan the list again, and load additional skills.

> **Requiring another skill?** The spec has no dependency field and no
> auto-loading — skills are discovered and loaded on demand. If one skill needs
> another (for example, `scaffold-investigation-skill` builds on [`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator)),
> write that requirement into the skill's instructions — e.g. a short
> **Prerequisite** section that says "load and follow `skill-creator` first."
> Because a skill is just instructions, any agent that reads it will honor that,
> which keeps your skills portable across setups.

## The skills in this folder

| Skill | Description |
|---|---|
| [`scaffold-investigation-skill`](scaffold-investigation-skill/) | Interactive assistant for building new `investigation-*` skills consistently |
| [`campaign-identification`](campaign-identification/) | Orchestrates multi-signal campaign expansion from seed entities |
| [`investigation-seo-spam`](investigation-seo-spam/) | Internet-based SEO spam investigation; no internal data required |

## Building your own

The most important skills are the ones specific to your environment:
your tables, your abuse patterns, your query conventions.

Start here: [`adapting-to-your-environment.md`](adapting-to-your-environment.md)

## Tips for writing good skill instructions

**Write for your environment.** The agent doesn't know that `is_verified`
doesn't mean what it sounds like, or that you should always cast that column
before comparing. Write it down once; never re-research it again.

**Be specific about stopping criteria.** Investigation skills without stopping
criteria will expand forever. Tell the agent when to stop and call it a campaign.

**Declare your signals explicitly.** Don't just say "look for abuse patterns."
Name the specific signals you use: shared JA4 fingerprint, tight creation window,
templated content, proxy indicators. The more specific, the more useful.

**Keep one skill per investigation type.** One skill for signup investigation,
one for billing, one for phishing. The campaign-identification skill orchestrates
across them. This makes each skill easier to maintain and easier to improve.

**Git your skills.** Every change is a commit. When you update a skill and it
makes things worse, you can see exactly what changed and roll it back.
See [`best-practices.md`](best-practices.md) for the full list.

For broader guidance on writing effective skills, see [agentskills.io/skill-creation/best-practices](https://agentskills.io/skill-creation/best-practices) and Anthropic's [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills).
