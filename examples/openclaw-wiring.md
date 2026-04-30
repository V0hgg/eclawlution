# Example OpenClaw Wiring

These are suggested schedules, job shapes, and companion files for a workspace you wire yourself.
The current repo does not auto-register these jobs.
`openclaw.plugin.json` is descriptive only today.

Use these as operator-facing examples, not as proof that native runtime hooks already exist.

## Suggested loops
- 02:00 workspace self-evolution
- 03:30 eclawlution repo self-evolution
- 06:00 summary to chat
- 23:40 conversation digest

## Suggested job objects

These are example cron payload shapes you can adapt in OpenClaw.
Adjust timezone, delivery, session binding, and exact prompt text to fit your workspace.

### Conversation digest

```json
{
  "name": "conversation-digest",
  "schedule": {
    "kind": "cron",
    "expr": "40 23 * * *",
    "tz": "Asia/Saigon"
  },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Run the conversation digest now. Review today's conversations and update style fit, durable preferences, and daily memory where justified."
  }
}
```

### Workspace self-evolution

```json
{
  "name": "workspace-self-evolution",
  "schedule": {
    "kind": "cron",
    "expr": "0 2 * * *",
    "tz": "Asia/Saigon"
  },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Run the self-evolution cycle now. Review recent memory, style fit, jobs, and workflow timing. Implement safe improvements and summarize what changed. Do not change auth or secrets, and do not restart live services."
  }
}
```

### Repo self-evolution

```json
{
  "name": "eclawlution-repo-self-evolution",
  "schedule": {
    "kind": "cron",
    "expr": "30 3 * * *",
    "tz": "Asia/Saigon"
  },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Work only inside the eclawlution repo in this workspace. Follow workflows/REPO-SELF-EVOLUTION.md, workflows/SELF-REVIEW.md, workflows/SECURITY-REVIEW.md, docs/USAGE.md, docs/SECURITY-MODEL.md, the repo docs, and the current roadmap. Spawn reviewer, tester, researcher, and security-reviewer subagents early when useful. Implement only safe additive changes, rerun checks, commit and push if safe, and write reports/YYYY-MM-DD.md. If a change is risky, unclear, auth-related, destructive, or could surprise live users, write a proposal under proposals/ instead of forcing it."
  }
}
```

### Summary to chat

If you want the summary to land back in the same chat session that created the job, bind it explicitly.

```json
{
  "name": "daily-summary",
  "schedule": {
    "kind": "cron",
    "expr": "0 6 * * *",
    "tz": "Asia/Saigon"
  },
  "sessionTarget": "current",
  "payload": {
    "kind": "agentTurn",
    "message": "Summarize what changed across the conversation digest, workspace self-evolution, and repo self-evolution loops. Keep it concise and call out anything that still needs review or approval."
  }
}
```

## Suggested companion files
- MEMORY.md
- DREAMS.md
- STYLE-HUNTER.md
- HERMES-LITE.md
- SELF-EVOLUTION.md
- CONVERSATION-DIGEST.md
- eclawlution/workflows/REPO-SELF-EVOLUTION.md
- eclawlution/reports/
- eclawlution/proposals/

## Wiring notes
- isolated jobs are a good default for heavier overnight loops
- use `current` only when you intentionally want a job bound to the chat session that created it
- keep repo self-evolution prompts explicitly scoped to the local repo so the agent does not wander across the workspace
- review the generated reports before widening the automation surface

## Suggested safety rule
Do not restart the gateway during active chat unless the user explicitly approves.
