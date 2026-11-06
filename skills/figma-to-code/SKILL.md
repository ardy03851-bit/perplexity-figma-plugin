---
name: figma-to-code
description: Turn Figma designs into code, specs, and design tokens using the Figma MCP server's read tools. Use when the user wants to implement a Figma design in code, extract design tokens or a component inventory, inspect a layer, screenshot a design, or convert a FigJam diagram.
---

# Figma to code

You read Figma designs through the Figma MCP connector (server `figma`, https://mcp.figma.com/mcp). These tools read the user's currently open selection or a file they reference — ask the user to open/select the design in Figma when a tool reports no active selection.

## Read tools

| Tool | Use |
|---|---|
| `get_design_context` | Design context and code for a layer or selection — the primary tool for handoff |
| `get_metadata` | Lightweight XML outline of a selection |
| `get_screenshot` | Screenshot of a selection |
| `download_assets` | Download exports and original source images (remote only) |
| `get_variable_defs` | Variables and styles used in a selection |
| `get_motion_context` | Keyframe animation data and code snippets |
| `get_figjam` | Convert FigJam diagrams to XML |
| `get_code_connect_map` | Code Connect mappings for selected instances |

Design-systems tools: `get_libraries`, `search_design_system` (find components/variables/styles across libraries), `get_code_connect_suggestions`, `add_code_connect_map` (map a Figma component to a code component).

The server also provides the MCP prompt `create_design_system_rules`, which produces a rules file with context for generating code that fits the user's codebase, design system, and tech stack. When starting a multi-screen implementation, run it and save the result in the project's `rules/` or `instructions/` folder, then follow those rules for all generated code.

## Workflow

1. **Identify the target.** Get the Figma URL and node IDs from the user (node ID in a URL like `?node-id=1-23` maps to `1:23`). If the tools operate on the live selection, ask the user to select the frame(s) in Figma.
2. **Understand before coding.** `get_metadata` for structure, `get_variable_defs` for the token set, `get_screenshot` for the visual target.
3. **Extract context per component.** `get_design_context` on each significant frame/component; use `search_design_system` to identify library components so code reuses the right abstractions.
4. **Generate code.** Match the user's stack. Use the extracted variables as design tokens in code (CSS custom properties, Tailwind config, etc.). Keep spacing, radius, and type scales exactly as specified.
5. **Assets.** `download_assets` for icons and images at the needed scale/format.
6. **Verify.** Compare your output against `get_screenshot` (render the code if the environment allows) and fix visual discrepancies.

## Notes

- For batch extraction (whole file components, styles, rendered images, versions) or automation outside MCP, use the `figma-rest-api` skill.
- For animations, `get_motion_context` returns keyframe data and code snippets.
- For Code Connect workflows, prefer `get_code_connect_suggestions` → confirm with the user → `add_code_connect_map`.
