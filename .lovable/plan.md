

# Plan: Zero-Ingress Deployment Architecture (v3 -- Final)

## Overview

Supabase acts as the message bus between Lovable and Databricks. The Lovable published URL is the primary source for built frontend assets (via Vite build manifest), with GitHub as an automatic fallback. Zero inbound connections to Databricks are required.

---

## Architecture

```text
  Lovable MCP Connector                           Databricks MCP Server
           |                                                |
           |  1. Queue request                              |
           +---------> [Supabase: deploy_requests] <--------+
           |                                       2. Poll  |
           |                                                |
           |                     3. Try: Fetch manifest.json from published URL
           |                        OK?  Download all assets from manifest
           |                        FAIL? Fallback: clone from GitHub, build locally
           |                                                |
           |                     4. Fetch schema+data from project-export edge fn
           |                                                |
           |                     5. Execute all stages locally in Databricks
           |                                                |
           |  7. Read status                                |
           +---------> [Supabase: deploy_requests] <--------+
           |                                 6. Write status|
```

---

## Service Role Key Delivery

**Default: Option A (Databricks Secrets)**

When `deploy_to_databricks` is called for the first time:

1. The MCP tool checks locally for a Databricks secret at scope `lovable`, key `srk_{project_ref}`
2. If NOT found, the tool **pauses** and returns a message to the user:
   - Displays the Service Role Key value (retrieved from `deploy-dispatch` response or Supabase env)
   - Provides a CLI command: `databricks secrets put-secret lovable srk_rgugamfapwullzgvslqn`
   - Also provides Databricks UI instructions as an alternative
3. The user stores the secret and either says "done" or calls `deploy_to_databricks` again
4. This time the secret is found -- deployment proceeds

This is a **one-time setup per project**. Subsequent deployments skip straight to step 4.

**Override: Option B (Inline)**

If the user passes `key_delivery: "inline"` in the deploy request:
- The `deploy-dispatch` edge function reads `SUPABASE_SERVICE_ROLE_KEY` from its environment and stores it in the `deploy_requests` row
- The MCP server reads it directly from the row
- No manual steps, fully automated
- Trade-off: key is stored in a database row (mitigated by the table only being accessible via Service Role Key)

---

## Lovable-Side Changes

### 1. Vite Build Manifest

**File: `vite.config.ts`**

Add `build: { manifest: true }` to the existing Vite config. This generates `.vite/manifest.json` in production builds, providing a machine-readable index of all output files (JS chunks, CSS, assets with content hashes).

No runtime impact. The manifest file is served as a static asset alongside the built app.

### 2. New Table: `deploy_requests`

Migration to create the deployment queue table:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid PK (gen_random_uuid) | Request identifier |
| status | text (default 'pending') | pending / in_progress / completed / failed |
| source_config | jsonb | Published URL, Supabase URL, project ref, GitHub repo+branch for fallback |
| stages | jsonb | Which stages to run + per-stage config |
| stage_results | jsonb (default '{}') | Per-stage status/errors, written by MCP server |
| key_delivery | text (default 'databricks_secret') | 'databricks_secret' or 'inline' |
| service_role_key | text nullable | Only populated when key_delivery = 'inline' |
| created_at | timestamptz (default now()) | When dispatched |
| updated_at | timestamptz (default now()) | Last status change |
| completed_at | timestamptz nullable | When finished |

RLS disabled. Table is only accessed via Service Role Key from edge functions -- never exposed to frontend users.

An `update_updated_at` trigger reuses the existing `update_updated_at_column()` function.

### 3. New Edge Function: `deploy-dispatch`

**File: `supabase/functions/deploy-dispatch/index.ts`**

Called by the MCP connector to queue a deployment request.

**POST** request with body:
```text
{
  published_app_url    -- e.g. "https://travel-everyday-app.lovable.app"
  github_repo          -- fallback, e.g. "owner/repo"
  github_branch        -- fallback, e.g. "main"
  include_data         -- boolean, whether to sync table data
  tables               -- optional array of table names to include
  databricks_app_name  -- target app name
  stages               -- array of stage names to execute
  key_delivery         -- "databricks_secret" (default) or "inline"
}
```

Behavior:
- Validates Authorization header (must be Service Role Key)
- Inserts a row into `deploy_requests` with status `pending`
- If `key_delivery` is `"inline"`, reads `SUPABASE_SERVICE_ROLE_KEY` from env and stores it in the row
- Returns: `{ id, status, source_config }` (source_config includes the Supabase URL and project ref so the MCP server knows where to call back)

### 4. New Edge Function: `deploy-status`

**File: `supabase/functions/deploy-status/index.ts`**

Two operations:

- **GET** `?id={request_id}` -- returns current status, stage_results, timestamps
- **PATCH** `?id={request_id}` -- updates status and/or stage_results (called by Databricks MCP server after each stage completes)

Auth: Service Role Key required on both methods.

The MCP connector polls GET every 5-10 seconds to relay progress to the user. The Databricks MCP server calls PATCH after each stage.

### 5. Update `project-export` Edge Function

**File: `supabase/functions/project-export/index.ts`**

Add data extraction support:

- **`?include_data=true`** -- triggers paginated row extraction alongside schema
- **`?tables=profiles,saved_journeys`** -- optional filter for specific tables
- **`?since=2025-01-01T00:00:00Z`** -- optional delta sync via `updated_at` or `created_at`

New helper `extractTableData(supabase, tableName, since?)`:
- Uses Service Role Key client (bypasses RLS for full export)
- Paginates with `.range(offset, offset + 999)` in batches of 1000
- Returns `{ rows: [...], total_count: N }`

Response shape when `include_data=true`:
```text
{
  meta: { ... },
  database: {
    tables: { ...existing schema... },
    table_data: {
      profiles: { rows: [...], total_count: 3 },
      saved_journeys: { rows: [...], total_count: 12 }
    },
    functions: [...],
    triggers: [...]
  },
  github_delegation: { ...existing... }
}
```

Auth: Validates Authorization header is Service Role Key when `include_data=true`.

### 6. Config Updates

**File: `supabase/config.toml`**

Add entries for the two new edge functions with `verify_jwt = false` (auth is validated in code):
```text
[functions.deploy-dispatch]
verify_jwt = false

[functions.deploy-status]
verify_jwt = false
```

---

## Databricks MCP Server Changes (Your Repo)

### `deploy_to_databricks` Tool -- Revised Flow

```text
1. Check for Databricks secret lovable/srk_{project_ref}
   |
   +-- NOT FOUND (first-time setup) ---------+
   |   Call deploy-dispatch to get the key    |
   |   Return message to user:               |
   |     "Store this key in Databricks:       |
   |      databricks secrets put-secret       |
   |      lovable srk_xxx"                    |
   |   PAUSE -- wait for user to confirm      |
   |                                          |
   +-- FOUND (or user confirmed) ------------+
       Call deploy-dispatch edge function
       Poll deploy-status every 5-10 seconds
       Relay stage-by-stage progress to user
       Return final result when completed/failed
```

If `key_delivery: "inline"` is passed, step 1 is skipped entirely.

### Asset Retrieval: App UI Stage

```text
1. GET {published_app_url}/.vite/manifest.json
   |
   +-- 200 OK ----------------------------+
   |   Parse manifest                     |
   |   Download each file listed          |
   |   Also fetch: index.html, favicon,   |
   |   robots.txt, any public/ assets     |
   |   Result: complete build directory   |
   |                                      |
   +-- 404 / timeout / error -------------+
       Fallback to GitHub:
       GET /repos/{owner}/{repo}/tarball/{ref}
       Extract, npm install, npm run build
       Result: complete build directory
```

### Asset Retrieval: Lakebase Stage

Call `project-export?include_data=true` using the Service Role Key. Parse schema into CREATE TABLE statements, insert rows.

### Asset Retrieval: Edge Functions

Targeted GitHub fetch of `supabase/functions/*/index.ts` files only (not a full clone). This is the one stage that still uses GitHub, since edge function source is not available via the published URL or project-export.

### Other Stages

Unity Catalog, AI-BI, Model Serving -- all local Databricks SDK calls, unchanged.

---

## Security Model

| Layer | Mechanism |
|-------|-----------|
| Edge functions | Bearer token auth (Service Role Key) |
| Databricks workspace | Zero inbound connections; remove 0.0.0.0/0 |
| Published URL | Public static assets, no secrets |
| deploy_requests table | RLS off; accessible only via Service Role Key |
| Key storage (default) | Databricks Secrets scope, never in DB |
| Key storage (override) | deploy_requests row, table itself protected by SRK |
| GitHub (fallback) | Token auth for private repos |

---

## File Changes Summary

```text
Modified (Lovable project):
  vite.config.ts                                 -- add build.manifest: true
  supabase/functions/project-export/index.ts     -- add ?include_data=true + auth

New (Lovable project):
  supabase/functions/deploy-dispatch/index.ts    -- queue deployment requests
  supabase/functions/deploy-status/index.ts      -- read/update deployment progress
  + DB migration for deploy_requests table
  + config.toml entries for new functions

Databricks side (your repo):
  MCP server deploy_to_databricks tool           -- dispatch + poll + key check
  MCP server asset downloader                    -- manifest-first, GitHub-fallback
```

---

## Stage Source Summary

| Stage | Primary Source | Fallback |
|-------|---------------|----------|
| App UI | Published URL + manifest.json | GitHub tarball + local build |
| Lakebase | project-export edge function | -- |
| Edge Functions | GitHub (targeted file fetch) | -- |
| Unity Catalog | Local Databricks SDK | -- |
| AI-BI | Local Databricks SDK | -- |
| Model Serving | Local Databricks SDK | -- |

---

## User Experience

Unchanged for repeat deployments. On first deployment only, the user is guided through a one-time secret storage step (Option A default). After that, every deployment is a single command with stage-by-stage progress reporting.

