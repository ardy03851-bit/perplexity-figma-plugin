---
name: figma-design
description: Create and edit UI designs, screens, components, and design systems directly on the Figma canvas using the Figma MCP server's write tools. Use when the user wants to design an app, website, dashboard, or mockup in Figma, generate a design from a description or web page, or edit an existing Figma file.
---

# Designing in Figma

You create and edit real Figma files through the Figma MCP connector (server `figma`, https://mcp.figma.com/mcp). If the connector is not connected, ask the user to connect it from the plugin/connector settings — they sign in with their own Figma account. All write tools below are remote-only and require that connection.

## Core tools

- `whoami` — your identity, plans, and seats. Always call this first; it returns the `planKey` values you need for file/plugin/shader creation.
- `create_new_file` — creates a blank Figma Design, FigJam, or Figma Slides file in Drafts. `fileType`: `design` | `figjam` | `slides`.
- `use_figma` — the main write tool. Creates, edits, and inspects content in Figma files: frames, auto-layout, text, shapes, fills, components, instances, styles, and more.
- `upload_assets` — uploads images and SVGs into a Figma file.
- `generate_figma_design` — turns live web UI into design layers (point it at a URL).
- `html_to_figma` — converts an HTML document into design layers.
- `generate_image` — generates an image from a text prompt for use in the design.
- `get_screenshot` — screenshot a selection to visually verify your work. Always verify after building.
- `search_design_system` / `get_libraries` — find existing components, variables, and styles in the user's libraries so new designs stay consistent.

## Workflow

1. **Clarify the brief.** Know the product, screens needed, platform (desktop/mobile), brand colors, and whether a design system must be respected. Ask only when it materially changes the design.
2. **Call `whoami`.** Grab a `planKey` (format `team::<numeric-id>` or `organization::<numeric-id>`) in case file creation is needed.
3. **Find the target file.** Either:
   - Create one with `create_new_file` (needs `planKey` copied exactly from the `whoami` response), or
   - Use an existing file — the file key is the long string after `/design/` in a Figma URL like `figma.com/design/<FILE_KEY>/Name?node-id=<NODE_ID>`. Node IDs in URLs use `-` where the API uses `:` (e.g. `1-23` → `1:23`).
4. **Check the design system.** `get_libraries` then `search_design_system` for existing components/variables before drawing anything new. Reuse components and styles; don't rebuild what exists.
5. **Build with structure.** Use `use_figma` to create screens as frames with auto-layout, real text layers, and reusable components. Prefer auto-layout over absolute positioning, use text styles and color styles from the library, and name layers meaningfully.
6. **Verify.** `get_screenshot` each screen you build. Inspect it yourself: alignment, spacing, contrast, text overflow, and consistency across screens. Fix issues before reporting done.
7. **Report.** Give the user the file URL (format `https://figma.com/design/<fileKey>/<name>`) and a summary of what was created.

## Tips

- For "make this look like [website]", use `generate_figma_design` or fetch the page, then `html_to_figma`, then clean up the resulting layers.
- Batch related operations into fewer `use_figma` calls where the tool supports it; the MCP server has rate limits.
- If a write fails, read the error: it usually names the missing parameter (e.g. wrong `planKey`, invalid node ID format).
- When the user asks for a design system or tokens, create color/text/effect styles and components; pair with the `figma-rest-api` skill for variable work if the MCP tools don't cover it.
