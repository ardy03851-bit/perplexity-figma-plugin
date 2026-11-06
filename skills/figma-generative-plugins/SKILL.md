---
name: figma-generative-plugins
description: Build generative Figma plugins through the Figma MCP server. Use when the user wants a Figma plugin that generates or manipulates content on the canvas — e.g. a plugin that creates layouts, patterns, charts, or custom shapes from parameters.
---

# Generative Figma plugins

Generative plugins run inside Figma and use the Plugin API (`figma.*`) to create content on the canvas. You build, version, and deploy them through the Figma MCP connector (server `figma`, https://mcp.figma.com/mcp).

## Tools

- `whoami` — required first step: plugin creation needs a `planKey` copied exactly from the plans it returns (`(team|organization)::<numeric-id>`).
- `list_generative_plugins` — lists generative plugins in the user's library.
- `get_generative_plugin` — reads a plugin's source. You can only read the user's own plugins; every response includes an `owner` field (the user's email, `figma`, or a publisher handle).
- `create_generative_plugin` — creates a plugin starter (needs `planKey`). The starter is a working plugin that draws a square.
- `update_generative_plugin` — updates a plugin's source, then builds, versions, and deploys it.

## Hard rules

- `update_generative_plugin` file paths must be `code.ts` or `ui.html`:
  - `code.ts` runs in the plugin sandbox and is the only file that can call `figma.*`.
  - `ui.html` is the plugin panel and the only file with DOM access.
  - `manifest.json` cannot be replaced.
- Updates must include the complete contents of each file, not just the changes. Files omitted from an update stay as they are; new files cannot be added.
- Updates require a Git-style `commitMessage`. They can also update metadata (name, description); an empty `files` list updates only metadata.
- A response without an error means the update worked — it may not include a version number.
- If a build fails, the response includes compiler output. Make the smallest identified fix and retry once. If it fails again, show the user the compiler output and your diagnosis.

## Workflow

1. Call `whoami` and take a `planKey`.
2. If similar plugins might exist, `list_generative_plugins` and `get_generative_plugin` to study the user's own plugins before writing code.
3. `create_generative_plugin` with a clear name and description to get the working starter.
4. Replace the starter's square-drawing logic in `code.ts` with the real generative logic. Add `ui.html` only if the plugin needs user input or display; otherwise a UI-less plugin is simpler.
5. `update_generative_plugin` with the complete file contents and a meaningful `commitMessage`.
6. Verify: run the plugin's behavior in a file if possible (see the `figma-design` skill for canvas work) and `get_screenshot` the result.
7. Report what the plugin does, where it was deployed, and how to run it in Figma.

## Plugin API essentials (code.ts)

- Create nodes with `figma.createFrame()`, `figma.createRectangle()`, `figma.createText()`, `figma.createEllipse()`, `figma.createVector()`, etc.
- Use auto-layout (`frame.layoutMode`, `itemPadding`, `counterAxisAlignItems`) for structured output.
- Read selection with `figma.currentPage.selection`; write back with `figma.currentPage.selection = [...]`.
- `await figma.loadFontAsync({ family: "Inter", style: "Regular" })` before setting any text content.
- Finish with `figma.closePlugin()` when the plugin's work is done.
