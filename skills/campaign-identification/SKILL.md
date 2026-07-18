---
name: campaign-identification
description: Orchestrates a full campaign investigation from a set of seed entities. Expands from seeds to full campaign scope using available investigation skills, applies multi-signal confirmation, and produces a structured campaign summary.
---

# Campaign Identification

## Purpose

Given a set of seed accounts or entities suspected of coordinated abuse, identify
the full campaign: who else is part of it, what signals connect them, and how
confident we are in the scope.

This skill orchestrates across investigation skills (e.g., `investigation-signup`,
`investigation-billing`, `investigation-seo-spam`). Load whichever are available
and relevant to the abuse type you're investigating.

---

## Methodology

### Guiding principles

- **Prefer actionable over complete.** A cluster of 500 accounts you're 95% confident
  in is more useful than 2,000 accounts at 60% confidence. Stop before the signal
  gets noisy.
- **Require ≥ 2 independent signals.** One shared signal is a hypothesis. Two
  independent signals is a campaign. Don't call it a campaign on one signal alone.
  The signals must be genuinely independent — two views of the same underlying fact
  don't count — and at least one should be discriminating rather than a trait shared
  by large numbers of legitimate users.
- **Split before you force.** If your seeds don't all share the same signals, you
  probably have two campaigns, not one. It's better to report two internally
  consistent clusters than one cluster held together by a signal that only half the
  accounts actually share.
- **Surface the unexpected.** Follow every thread, not just the most obvious one.
  If an additional pattern appears during expansion — a second content template,
  a shared infrastructure signal you didn't start with — note it and investigate.

---

## Step 1 — Understand the seeds

Before expanding, pull the signals present across the seed accounts:

- Registration signals: creation timestamp, IP or network fingerprint, email provider,
  proxy/VPN indicators, device fingerprint if available
- Behavioral signals: timing patterns, content created, actions taken within
  first N hours of account creation
- Content signals: templated content, shared URLs, shared anchor text, referral patterns

Note which signals are present across all seeds vs. a subset. The strongest
signals are those present across 80%+ of seeds.

---

## Step 2 — Identify expansion signals

From the signals present in the seeds, select 1–2 to expand on first.
Criteria for a good expansion signal:

- Present across ≥ 80% of seeds
- Specific enough to be meaningful (a shared JA4 fingerprint, a tight creation
  window, a specific content template — not just "has an email address")
- Not a platform-wide behavior (a fingerprint used by millions of legitimate users
  is not an expansion signal)

Name each signal configuration as you identify it (C1, C2, etc.) if multiple
distinct configurations emerge.

---

## Step 3 — Expand

For each expansion signal:

1. Query for all entities matching that signal within a relevant time window
2. Record the count before filtering to the investigation window
3. Apply any necessary filters (exclude known-legitimate patterns — see below)
4. Cross-reference with a second signal to confirm overlap

**Stopping criteria — stop expanding when:**
- The next expansion step adds < 5% new entities
- The expansion signal produces a cluster too broad to be a single campaign
  (use judgment; a campaign in 48 hours that spans 50,000 accounts probably
  needs a second signal to subdivide it)
- You've reached ≥ 2 confirmed independent signals across the full cohort

---

## Step 4 — Check enforcement status

Before finalizing the campaign scope, check what's already been actioned:
- How many accounts in the cluster have already been flagged or removed?
- What's the current live count (unflagged)?
- Does prior enforcement align with the signals you found, or does it cover
  a different subset?

---

## Step 5 — Build the campaign summary

A campaign summary should include:

**Scope**
- Total accounts in campaign
- Breakdown by configuration if multiple configs found
- Enforcement status (already flagged vs. remaining)

**Signals**
- The 2+ signals used to define the cluster
- Confidence assessment for each
- Any unexpected signals found during investigation

**Evidence rows**
- A sample of identifiable rows (account ID, username, email or identifier,
  created_at, and the specific field that ties them to the cluster)
- Always include enough to spot-check the finding manually
- Keep raw identifiers in access-controlled outputs. Share the signals and a small
  spot-check sample in wider documents — not full dumps of accounts, emails, or IPs.

**Recommendation**
- What action is recommended for the unflagged accounts
- Any open questions that need investigation before acting (e.g., a second
  payload config whose purpose isn't clear yet)

> **Express the campaign as signals, not as a list of IDs.** A signal-based
> description — a shared fingerprint, a tight creation window, a specific content
> template — can be re-run, audited, and understood by a teammate. An opaque list
> of account IDs can't be verified or re-checked as the campaign evolves. If you
> provide identifiers for immediate actioning, include them *alongside* the signal
> definition, never instead of it.

---

## Patterns that look like abuse but often aren't

These are common sources of false positives. Do not use them as expansion
signals without additional corroboration:

- **Privacy relay / Hide My Email services** (e.g., iCloud's privaterelay.appleid.com,
  Firefox Relay, Apple's Hide My Email) — these produce shared email domain
  patterns for millions of legitimate users
- **Corporate proxy pools** — many legitimate enterprise users share egress IPs
  through proxied corporate networks
- **VPN services** — widespread among legitimate users; VPN IP ≠ abuse
- **Mobile carrier NAT** — multiple users behind a single IP via carrier-grade NAT
- **Automated browser fingerprints** — headless browser fingerprints can match
  legitimate users running accessibility tools or automation for legitimate purposes

When a potential signal is flagged for one of the above, require a second
independent signal before including it in the expansion.

---

## What to load

When this skill is activated, also load any `investigation-*` skills available
that are relevant to the abuse type described by the user. These skills carry
your environment's table documentation, column gotchas, and query patterns.

If no investigation skills are available, proceed with the methodology above
and ask the user to provide the relevant tables and signals.
