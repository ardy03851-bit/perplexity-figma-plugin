---
name: figma-rest-api
description: Automate Figma through the REST API at api.figma.com with a personal access token — read files, nodes, components, styles, versions, and rendered images; post comments; write variables and dev resources; manage webhooks; duplicate files. Use when MCP tools can't cover the job (batch exports, token sync, CI automation, file-wide inventories).
---

# Figma REST API

The REST API (`https://api.figma.com/v1/`) is the right tool for batch jobs, automation, and anything the Figma MCP tools don't expose. It is largely read-only; write access exists for comments and reactions, variables, dev resources, team/folder creation, file duplication, and team members. Design content (nodes, components, styles) can only be read.

## Authentication

- Personal Access Token (PAT) in the `X-Figma-Token` header — for personal use. The user generates one in Figma under Account Settings → Security, and can scope it narrowly.
- OAuth2 for apps acting on behalf of users.
- Ask the user for their PAT if it isn't already saved as a custom credential (`custom-cred:api.figma.com`). Never ask them to paste it in plain chat when a credential form is available.

## Key endpoints

Read (Tier 1 unless noted):
- `GET /v1/files/:key` — whole file as a JSON node tree (options: `version`, `ids`, `depth`, `geometry`, `plugin_data`, `branch_data`)
- `GET /v1/files/:key/nodes?ids=1:2,3:4` — specific subtrees; prefer this over whole files for performance
- `GET /v1/files/:key/styles` — style definitions
- `GET /v1/images/:key?ids=...&format=svg|png|jpg|pdf&scale=0.01-4` — render nodes
- `GET /v1/files/:key/versions` — version history
- `GET /v1/files/:key/components` — published components
- `GET /v1/teams/:team_id/projects`, `GET /v1/projects/:project_id/files`
- `GET /v1/me` — current user

Write:
- `POST /v1/files/:key/comments`, `DELETE /v1/files/:key/comments/:id` — comments
- `POST /v1/files/:key/variables` — batch create/update/delete variables, collections, and modes (single-call mutations; scopes `file_variables:read`/`write`)
- `POST /v1/dev_resources`, `PUT/DELETE /v1/dev_resources` — dev resources (scope `file_dev_resources:write`)
- `POST /v1/files/:file_key/duplicate` — duplicate a file (Tier 2, scope `file_duplicate:write`)

## Practical guidance

- The file key is the string after `/design/` (or `/file/`) in a Figma URL. Node IDs in URLs use `-` where the API uses `:`.
- Rate limits are tiered per plan (Tier 1 is roughly 10–20 requests/minute); on `429`, wait for the `Retry-After` header and retry. Cache aggressively and request only the node IDs you need.
- Use `depth` on `GET /v1/files/:key` to limit tree size when you only need top-level structure.
- For large files, fetch metadata first (`depth=1`), then pull subtrees with `/nodes`.
- Design-token sync: read variables via the Variables API (Enterprise scope) or `get_variable_defs` via MCP, transform to CSS/Tailwind/JSON tokens, and write back with `POST /v1/files/:key/variables`.
- Prefer MCP tools for anything involving the user's live selection; use the REST API for headless/batch work.
- Docs: https://developers.figma.com/docs/rest-api/
