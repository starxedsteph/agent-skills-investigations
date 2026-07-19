# Getting Started

## What you need

- A capable AI agent (IDE-based, CLI-based, or chat-based with file/tool access)
- An AI model approved by your company for internal data (if querying internal data)
- A text editor
- Git

That's the full list. You don't need to write code. You don't need to deploy
anything. You provide the investigation expertise; the agent uses skill-creation
skills to interview you, organize that knowledge, and write or update the files.

---

## Install the skills

This repository keeps source material under `skills/`, but clients discover
skills from client-specific locations. The easiest option is to ask your model
to install them for you:

```text
Install these skills in the appropriate project skills location for my client.
Copy each complete skill directory and tell me where you installed it.
```

You can also copy each complete skill directory yourself into a supported
project or personal skills directory.

For GitHub Copilot in VS Code, project skills can live in `.github/skills/`,
`.claude/skills/`, or `.agents/skills/`. The example below uses
`.github/skills/`:

```text
.github/skills/
  campaign-identification/
  investigation-seo-spam/
  scaffold-investigation-skill/
  skill-creator/
```

Install the complete [`skill-creator` directory from Anthropic's skills
repository](https://github.com/anthropics/skills/tree/main/skills/skill-creator).
`scaffold-investigation-skill` requires it for the base skill-creation and
revision workflow.

See [Use Agent Skills in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
for VS Code installation options. Other clients use different discovery
locations; choose your client from the [agentskills.io client
directory](https://agentskills.io/clients) and follow its instructions.

Add your project skills directory to git so skill changes are reviewed and
versioned. Ask the agent to create an investigation skill as described below.
If it does not discover the creation workflow, check the skill-discovery
location for your client before continuing.

## Have the agent create your first skill

Start with the investigation type you know best (signup abuse, billing fraud,
content spam, or whatever you do most). Do not draft the skill first. Describe
what you want to create and let the agent discover the relevant skills. It will
interview you for your tables, working queries, signals, false positives,
stopping criteria, and gotchas, then assemble and validate the files.

```text
Help me create a ___ investigation skill
```

See [`adapting-to-your-environment.md`](adapting-to-your-environment.md) for
what expertise to bring to that conversation.

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

**1. Get the database connection set up**

This is the step most likely to need engineering help. What you need:

- A read-only database user or service account with SELECT access to
  the tables you investigate
- Connection credentials stored as environment variables the agent can reach
- Confirmation from your security/privacy team that this setup is approved

If you have a principal engineer or platform engineer on your team,
this is the right person to ask. It's a one-time setup.

**2. Test it**

Run an investigation you already know the answer to. Use a case you've
already closed, where you know what the cluster looked like and how it was
found. See if the agent finds the same thing you did.

If it doesn't — that's useful information. Update the skill with what it missed.
Ask the agent to review the existing skill, make the correction in the right
place, and revalidate the result.

---

## Checklist

- [ ] AI model approved for my data's classification level
- [ ] Skills copied to a discovery location supported by my client
- [ ] `skill-creator` installed from Anthropic's complete skill directory
- [ ] Agent discovers the skill-creation workflow from my request
- [ ] Project skills directory added to git
- [ ] Database connection set up read-only with credentials in env vars (if needed)
- [ ] Agent created at least one investigation skill for my environment
- [ ] First test investigation run on a known-closed case

---

## Getting help

Talk to your team. The best way to build your first investigation skill
is to sit down with a teammate who knows the tables cold and have them
answer the agent's questions with you. The agent handles the file structure;
their knowledge goes in once, and the whole team benefits every time after that.

If you can't get the DB connection set up on your own, ask a principal
engineer. Frame it as: "I need a read-only connection to [these tables]
with SELECT access, credentials stored as environment variables."
That's a specific, bounded request.
