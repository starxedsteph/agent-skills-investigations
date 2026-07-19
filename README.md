# AI as Your Investigation Partner — Starter Skills

Companion resource for the TrustCon 2026 talk
**"AI as Your Investigation Partner: Building Agents That Surface Hidden Abuse Patterns."**

This repo contains starter investigation skills and setup guidance for building
an AI-assisted investigation workflow on your own team.

## Run the presentation

[View the TrustCon 2026 slides](https://starxedsteph.github.io/agent-skills-investigations/).

## Start Here

1. **[Security](skills/SECURITY.md)** — Read this before connecting anything to your data
2. **[Getting Started](skills/getting-started.md)** — Set up the workflow with or without database access
3. **[Investigation Skills](skills/README.md)** — Learn what skills are, how agents use them, and what this repository includes
4. **[Adapting to Your Environment](skills/adapting-to-your-environment.md)** — Build skills around your own tables, signals, and investigation process
5. **[Best Practices](skills/best-practices.md)** — Test agent output, version your skills, and validate findings before acting

## What's Included

| | |
|---|---|
| [`skills/`](skills/) | Starter skills and documentation |
| [`skills/campaign-identification`](skills/campaign-identification/) | Orchestrates multi-signal campaign expansion from seed entities |
| [`skills/investigation-seo-spam`](skills/investigation-seo-spam/) | Finds SEO spam using public web search — no internal data required |
| [`skills/scaffold-investigation-skill`](skills/scaffold-investigation-skill/) | Guides analysts through building spec-compliant investigation skills |

## About

Skills are markdown files that teach your AI agent your investigation workflow —
your preferred signals, your query patterns, the quirks in your data. They're
tool-agnostic: any capable agent setup can use them.

The skills here are starting points. The most valuable thing you can do is adapt
them to your environment and add skills for the abuse types you investigate every day.

→ [`skills/adapting-to-your-environment.md`](skills/adapting-to-your-environment.md)

## A note on the demo data

The accounts, fingerprints, email domains, IDs, and campaign figures in the
conference slides (`conference-slides/`) and in any example output are **entirely
fictional** — fabricated for demonstration. They do not represent real users,
real investigations, or any organization's internal data.

---

More at [agentskills.io](https://agentskills.io).

Original code and content in this repository are licensed under the
[MIT License](LICENSE). Third-party material identified in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) is excluded from that grant and
remains available under its stated license.
