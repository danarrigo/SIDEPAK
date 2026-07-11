# n8n Workflow — Credential Setup Guide

This folder ships a **sanitized** n8n workflow that you can import and re-bind to your own accounts. The original export (which still contains the previous author's IDs) is kept locally for reference but is **git-ignored** — do not commit it.

## Files

| File | Purpose | Safe to share? |
|---|---|---|
| `My workflow.json` | Original export from the author's n8n instance (contains webhook IDs, phone number ID, Supabase project ref) | **No** |
| `My workflow.sanitized.json` | Same workflow with all credentials and identifiers redacted — import this | **Yes** |

## What was redacted

The sanitized file has the following fields removed or replaced with `<...>` placeholders. n8n will auto-generate new values for the removed fields on import.

| Field | Replaced with | Why |
|---|---|---|
| `nodes[].id` (top-level node UUIDs) | _removed_ | n8n regenerates on import |
| `nodes[].webhookId` | _removed_ | Exposes the public webhook URL path; n8n regenerates |
| `nodes[].credentials.*` | _removed_ | Must be re-bound to your own credentials in n8n |
| `nodes[].parameters.phoneNumberId` (WhatsApp) | `=<YOUR_WHATSAPP_PHONE_NUMBER_ID>` | Identifies the WhatsApp Business account |
| `nodes[].parameters.endpointUrl` (MCP Supabase) | `https://mcp.supabase.com/mcp?project_ref=<YOUR_SUPABASE_PROJECT_REF>` | Identifies the Supabase project |
| Workflow top-level `id`, `versionId`, `meta` | _removed_ | n8n instance/version metadata |

The agent system prompts, node positions, expressions, and connection graph are **kept intact** so the workflow is functionally reproducible.

## Import steps

1. In n8n, click **Workflows → Import from File…** and choose `My workflow.sanitized.json`.
2. n8n will warn that some credentials are missing. Open each node marked with a red badge and re-create the credentials (see below).
3. Save the workflow, then **activate** it.

## Credentials you must create

Create the following credentials in **Settings → Credentials** before (or during) import. After creating each one, n8n will let you assign it to the relevant node.

### 1. WhatsApp OAuth account (trigger)

- **Type:** `WhatsApp Trigger OAuth2`
- **Used by:** `WhatsApp Trigger` node
- **Setup:** Connect the WhatsApp Business account you want to receive inbound messages on. Copy the **Phone number ID** from the Meta Business dashboard and paste it into the `phoneNumberId` field of the `Send message` and `Send message in WhatsApp Business Cloud` nodes (replacing `<YOUR_WHATSAPP_PHONE_NUMBER_ID>`).

### 2. WhatsApp Business Cloud account (send)

- **Type:** `WhatsApp Business Cloud`
- **Used by:** `Send message`, `Send message in WhatsApp Business Cloud`, `Send message in WhatsApp Business Cloud1`
- **Setup:** Same Meta app, scoped to **send** permissions. Use the same Phone number ID as above.

### 3. DeepSeek account (LLM)

- **Type:** `DeepSeek API`
- **Used by:** `DeepSeek Chat Model`, `DeepSeek Chat Model1`, `DeepSeek Chat Model2`
- **Setup:** Create an API key at <https://platform.deepseek.com> and paste it here. The model is set to `deepseek-chat` on each chat-model node — change it to a different DeepSeek model if you prefer.

### 4. Multiple Headers Auth account (Supabase MCP)

- **Type:** `HTTP Header Auth` (multi-header)
- **Used by:** `MCP Client`, `MCP Client1`, `MCP Client2`
- **Setup:** Send the headers required by the Supabase MCP endpoint:
  - `Authorization: Bearer <SUPABASE_PERSONAL_ACCESS_TOKEN>`
  - `apikey: <SUPABASE_ANON_OR_SERVICE_KEY>`
- The endpoint URL (set on each MCP Client node) must point at your own project:
  ```
  https://mcp.supabase.com/mcp?project_ref=<YOUR_SUPABASE_PROJECT_REF>
  ```
  Generate a personal access token at <https://supabase.com/dashboard/account/tokens>.

## What the workflow does (no credentials needed to understand it)

The workflow has **three AI agent branches** plus shared infrastructure:

```
                         ┌─► If (body not empty) ─► AI Agent (inbound) ─► Send message
WhatsApp Trigger ────────┤                              ▲   ▲   ▲
                         │                              │   │   └─ DeepSeek Chat Model
                         │                              │   └─ Simple Memory (per wa_id)
                         │                              └─ MCP Client (Supabase read-only)

Schedule Trigger (hourly) ┬─► AI Agent1  (events broadcast)  ─► Send message via tool
                          │        ▲   ▲   ▲
                          │        │   │   └─ DeepSeek Chat Model1
                          │        │   └─ MCP Client1 (Supabase read+UPDATE events)
                          │        └─ Send message in WhatsApp Business Cloud (tool)
                          │
                          └─► AI Agent2  (proposals broadcast)─► Send message via tool
                                  ▲   ▲   ▲
                                  │   │   └─ DeepSeek Chat Model2
                                  │   └─ MCP Client2 (Supabase read+UPDATE proposals)
                                  └─ Send message in WhatsApp Business Cloud1 (tool)
```

| Branch | Trigger | Purpose |
|---|---|---|
| **Inbound** | WhatsApp `messages` webhook | Reads a member's text message, runs an AI agent that can query Supabase **read-only** with the sender's `wa_id` as scope, and replies via WhatsApp. Has sliding-window chat memory keyed by `wa_id`. Enforces strict security guardrails: SELECT-only SQL, anti-prompt-injection, member-scoped WHERE clauses. |
| **Outbound — Events** | Schedule (hourly) | AI agent scans the `events` table for rows with `n8n_sent = false`, looks up the relevant cooperative's members, sends a WhatsApp notification to each, then `UPDATE events SET n8n_sent = true WHERE id = <event_id>`. Stateless per run. |
| **Outbound — Proposals** | Schedule (hourly) | Same pattern as the events branch but for the `proposals` table (governance proposals) — broadcast to members, then mark `n8n_sent = true`. |

> **Note on the schedule:** the system prompt in the original workflow says “setiap 15 menit” (every 15 minutes), but the Schedule Trigger node is configured for `hours`. Edit the rule in n8n if you want a tighter cadence.

## Verifying the import

After binding all four credentials and setting the `phoneNumberId` / `project_ref` placeholders:

1. Send a WhatsApp message to the connected number — you should see the **Inbound** branch fire in the n8n execution log and receive a reply.
2. Manually run the workflow once to exercise the **Outbound** branches (or wait for the next scheduled tick). Insert a row with `n8n_sent = false` into `events` or `proposals` first to see the broadcast in action.
3. Check the **Executions** tab for any node still showing a red “missing credentials” badge.
