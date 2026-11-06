# Figma for Perplexity

A Perplexity plugin that connects Perplexity Computer to [Figma](https://figma.com). Install it to create and edit UI designs on the Figma canvas, build GLSL shaders and generative plugins, turn designs into code, and automate Figma via the REST API.

## What's inside

**Connector** — the official Figma remote MCP server (`https://mcp.figma.com/mcp`), declared in `mcp.json`. Once connected, it gives Perplexity Computer read and write access to your Figma account, including code-to-canvas tools.

**Skills** (in `skills/`):

| Skill | What it does |
|---|---|
| `figma-design` | Create and edit UI designs, screens, components, and design systems on the Figma canvas |
| `figma-shaders` | Build GLSL shader effects and fills in Figma |
| `figma-generative-plugins` | Build generative Figma plugins that create content on the canvas |
| `figma-to-code` | Turn Figma designs into code, specs, and design tokens |
| `figma-rest-api` | Automate Figma through the REST API (batch exports, token sync, comments, variables) |

## Install in Perplexity

1. Open **Plugins** in the Perplexity sidebar.
2. Select **Add custom → Import plugin from GitHub**.
3. Paste this repository's URL: `https://github.com/ardy03851-bit/perplexity-figma-plugin`
4. Confirm the plugin's skills and the Figma connector are listed, then connect the Figma connector with your Figma account when prompted.

You can also download the repo as a `.zip` and upload it via **Add custom → Upload plugin or skill**.

## Requirements

- A Perplexity plan that includes Perplexity Computer (plugins with skills require it).
- A Figma account to connect the MCP server. The Figma remote MCP server works on all plans and is free during beta.
- Optional: a Figma personal access token (Account Settings → Security) for the REST API skill.

## Using it

Try prompts like:

- "Create a new Figma design file for a fitness app with 3 mobile screens."
- "Turn this website into a Figma design: https://example.com"
- "Create a Figma shader effect that adds animated aurora noise to a layer."
- "Build a Figma plugin that generates bar charts from pasted data."
- "Implement this Figma frame as a React component with Tailwind."

## Package format

This repo follows the Perplexity plugin package format:

- `plugin.json` — manifest (name, description) at the repo root; the name must use only lowercase letters, numbers, and hyphens
- `mcp.json` — MCP server declarations (`.mcp.json` is included for Claude Code / Codex compatibility)
- `skills/<name>/SKILL.md` — one folder per skill

## License

MIT — see [LICENSE](LICENSE).
