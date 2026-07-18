# Best Practices

Three practices that are worth building in from the start.

---

## 1. Always test before returning

Give your agent a standing rule: **run every query before returning it.**
Not "here's a query that should work" — run it, confirm it executes,
then show the results.

This one rule catches most hallucination before you ever see it.
A fabricated table name or invented column produces a query that simply
doesn't run. The agent hits an error, not a plausible-looking wrong answer.

Add this to your skill instructions or to your agent's system prompt:

> Before returning any query or query results, execute the query and confirm
> it runs successfully. Do not return a query you haven't tested.

---

## 2. Git your skills

Skills are code. Treat them that way.

Keep your skills folder in a git repository. Every change is a commit.
Every commit has a message explaining why the skill was updated.

When you update a skill and the change makes things worse — and sometimes
it does — you can see exactly what changed and roll it back in seconds.
When someone asks why the skill handles a particular pattern the way it
does, the answer is in the history.

The loop is: **use → break → fix → commit.**
Every cycle through it, the skills get better.

Good commit message examples:
- `Add iCloud privaterelay exclusion to investigation-signup`
- `Tighten expansion threshold in campaign-identification to ≥2 signals`
- `Document the is_verified column gotcha in accounts table reference`

---

## 3. One investigation per chat

Each conversation is the agent's working memory for that session.

If you run two investigations in the same chat, signals start bleeding across.
The agent may reference a fingerprint from the first case while reasoning
about the second. The cluster boundaries get fuzzy.

Start a fresh chat for each investigation. It keeps the reasoning clean.

---

## Validation — before you act on a finding

Don't act on a cluster you can't spot-check.

Always require output that includes identifiable rows: username, ID, email,
and whatever data connects them. Then check a sample of them manually.
If you can't explain how the accounts in the cluster are related — in plain
language — ask the agent to explain its reasoning before you proceed.

If a finding seems too big, too clean, or too surprising — it might be right,
but it might also be the agent optimizing for the wrong goal or running a
query against a broader date range than you intended. Ask before you act.

A useful prompt when something looks off:

> How did you arrive at this cluster? Walk me through the signals you used
> and the query that produced these results.

The agent should be able to answer that clearly. If it can't, don't act on it.

---

## What the agent can do that you can't

- Process volume: 11 seed accounts to nearly 4,000 in minutes
- Hold multiple signal dimensions in mind simultaneously
- Recall your documented query patterns instantly without re-research
- Follow every thread at once, not just the most promising one

## What you can do that the agent can't

- Know which patterns are abuse vs. just how your platform works
- Recognize when a cluster is too wide
- Spot drift — when it's optimizing for the wrong goal
- Know when a finding is surprising enough to investigate further
- Make the call on whether to act

The correction is usually low-friction. But you have to be watching.

---

## Start from real expertise

This is the single most important idea behind these skills: they're only as good
as the expertise you put into them. An agent given no domain context falls back on
generic best practices — "look for suspicious patterns." A skill grounded in *your*
schemas, *your* failure modes, and the corrections you make while working will beat
a generically generated one every time.

The corrections you make during an investigation (the *use → break → fix → commit*
loop above) are the raw material. So is anything you've already written down:
runbooks, query libraries, past incident write-ups, code-review comments, and the
patches in your own git history.

The Agent Skills guidance says the same thing — see
[Start from real expertise](https://agentskills.io/skill-creation/best-practices#start-from-real-expertise).
