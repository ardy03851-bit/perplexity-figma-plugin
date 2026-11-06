---
name: figma-shaders
description: Build GLSL shader effects and fills in Figma using the Figma MCP server's shader tools. Use when the user wants to create, read, update, or list shader effects or shader fills, e.g. animated gradients, noise, glows, distortion, or generative backgrounds for their designs.
---

# Figma shaders

Figma supports shader-based effects (rendered above a layer) and fills (rendered inside a layer). You manage them through the Figma MCP connector (server `figma`, https://mcp.figma.com/mcp).

## Tools

- `whoami` — required first step: shader creation needs a `planKey` copied exactly from the plans it returns (`(team|organization)::<numeric-id>`).
- `list_shaders` — lists shader effects and fills in the user's library.
- `get_shader` — reads a shader's source. You can read the code for any shader, not just your own.
- `create_shader` — creates a shader effect or fill starter (needs `planKey`). The starter is a working starting point, not the final shader.
- `update_shader` — updates a shader's source with the complete new contents.
- `list_file_shaders` — lists shaders used in a specific file.

## Hard rules

- `update_shader` file paths must be `main.ts` — the complete file, every time. Partial updates are not supported; files omitted from an update stay unchanged.
- A shader's `kind` (`effect` or `fill`) is fixed at creation and cannot be changed by an update.
- Updates require a Git-style `commitMessage`. They can also update metadata such as name and description; an empty `files` list updates only metadata.
- A response without an error means the update worked — it may not include a version number.
- If a build fails, the response includes compiler output. Make the smallest identified fix and retry once. If it fails again, show the user the compiler output and your diagnosis.

## Workflow

1. Call `whoami` and take a `planKey`.
2. Understand the target look. If unsure what's achievable, `list_shaders` and `get_shader` on existing shaders (including Figma's own) to study conventions.
3. `create_shader` with the chosen `kind`:
   - `effect` — post-process rendering above a layer (glows, distortion, stylization).
   - `fill` — generative content inside a layer (gradients, noise, patterns).
4. Write the shader in `main.ts` and update it with `update_shader`, always sending the complete file.
5. Verify: apply it in a file (see the `figma-design` skill) and `get_screenshot` to check the result visually. Iterate.
6. Report the shader name and where it was applied.

## Writing good shader code

- Shaders are GLSL fragment shaders wrapped in TypeScript. Keep the entry point signature the starter provides.
- Use uniforms for anything a designer might tweak (intensity, speed, colors) instead of hard-coding values.
- Prefer smooth, resolution-independent math: base sizes on UV coordinates, not pixels.
- Guard `for` loops with constant bounds and avoid expensive per-pixel work; Figma renders shaders live.
- Aim for a stable, pleasing default appearance with zero configuration.
- Common requests and approaches: animated gradient (mix two colors by time + smooth noise), grain/noise (hash-based value noise), glow (distance field falloff), aurora/blob (layered sine fbm).
