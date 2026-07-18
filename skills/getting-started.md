# Getting Started

## What you need

- A capable AI agent (IDE-based, CLI-based, or chat-based with file/tool access)
- An AI model approved by your company for internal data (if querying internal data)
- A text editor
- Git

That's the full list. You don't need to write code. You don't need to deploy
anything. The skills are markdown files in a folder — you can start writing
them today.

---

## Path 1: Start without database access

You can use skills without any internal data connection.

**Option A — Internet-based investigation**
The `investigation-seo-spam` skill works entirely on public data.
Start there if you want to try the workflow before setting up a DB connection.

**Option B — Build queries you run yourself**
Load your skills and ask the agent to help you write queries. You run them,
paste back the results, and the agent helps interpret them. It's slower than
having the agent query directly, but it's a valid starting point and
requires no additional setup.

---

## Path 2: Full setup with database access

This is the setup that makes the workflow fast. The agent queries your data
directly and reasons over the results without you acting as an intermediary.

The [agentskills.io quickstart](https://agentskills.io/skill-creation/quickstart) covers the general skill setup steps; the steps below focus on what's specific to investigation workflows.

### Before you start

Read [`SECURITY.md`](SECURITY.md). Specifically:
- Confirm you have an AI model approved for your data classification
- Know where your credentials will live (environment variables)
- Ensure the database connection will be read-only

### Steps

**1. Set up your skills folder**

Clone this repo, or copy the `skills/` folder into your own repository.
Add it to git if it isn't already.

```
skills/
  campaign-identification/
  investigation-seo-spam/
  (your own skills here)
```

**2. Connect your agent to your skills folder**

How this works depends on your agent setup. Most IDE-based agents (e.g.,
Claude Code, Cursor, Copilot Chat) let you configure a workspace or
project-level context folder. Point it at your `skills/` directory.

If you're using a CLI-based agent, check its documentation for how to
specify a skills or context directory. A list of agents that support the
skills format natively is at [agentskills.io/clients](https://agentskills.io/clients).

**3. Get the database connection set up**

This is the step most likely to need engineering help. What you need:

- A read-only database user or service account with SELECT access to
  the tables you investigate
- Connection credentials stored as environment variables the agent can reach
- Confirmation from your security/privacy team that this setup is approved

If you have a principal engineer or platform engineer on your team,
this is the right person to ask. It's a one-time setup.

**4. Write your first skill**

Start with the tables you know best. Pick one investigation type
(signup abuse, billing fraud, content spam — whatever you do most)
and write a skill for it.

See [`adapting-to-your-environment.md`](adapting-to-your-environment.md) for
a template and guidance on what to include.

**5. Test it**

Run an investigation you already know the answer to. Use a case you've
already closed, where you know what the cluster looked like and how it was
found. See if the agent finds the same thing you did.

If it doesn't — that's useful information. Update the skill with what it missed.

---

## Checklist

- [ ] AI model approved for my data's classification level
- [ ] Skills folder created and added to git
- [ ] Agent configured to use skills folder
- [ ] Database connection set up (read-only) with credentials in env vars
- [ ] At least one investigation skill written for my environment
- [ ] First test investigation run on a known-closed case

---

## Getting help

Talk to your team. The best way to build your first investigation skill
is to sit down with a teammate who knows the tables cold and have them
help you write it. Their knowledge goes in once; the whole team benefits
every time after that.

If you can't get the DB connection set up on your own, ask a principal
engineer. Frame it as: "I need a read-only connection to [these tables]
with SELECT access, credentials stored as environment variables."
That's a specific, bounded request.
