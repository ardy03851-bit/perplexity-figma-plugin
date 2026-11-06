// Aurora Fill — animated flowing aurora shader fill for Figma.
// Kind: fill (generates its own pixels; never samples an input raster).
// Animated: reads frame.time. Apply it to any layer's Fill → Shader.
//
// Intended workflow with the official Figma MCP server:
//   1. create_shader({ name: "Aurora Fill", kind: "fill", planKey: <from whoami> })
//   2. update_shader({ id, kind: "fill", files: [{ path: "main.ts", content: <this file> }],
//      commitMessage: "Aurora fill with flowing noise bands", metadata: { isAnimated: true } })
// Or paste this file into a Figma agent chat: "Create this shader fill:" + code.

import { defineProperties } from "figma:shaders"

export default function Fill() {}

export function setup(device, frame) {
  // Fullscreen quad: interleaved clip-space position (loc 0) and UV (loc 1).
  frame.state.quad = device.createBuffer({
    size: 6 * 4 * 4,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  })
  new Float32Array(frame.state.quad.getMappedRange()).set([
    -1, -1, 0, 1,  1, -1, 1, 1,  -1, 1, 0, 0,
    -1, 1, 0, 0,   1, -1, 1, 1,   1, 1, 1, 0,
  ])
  frame.state.quad.unmap()

  frame.state.shaderModule = device.createShaderModule({
    code: `
      diagnostic(off,derivative_uniformity);

      struct Uniforms {
        colorA: vec4f, // deep base
        colorB: vec4f, // mid glow
        colorC: vec4f, // bright band
        time: f32,
        speed: f32,
        scale: f32,
        intensity: f32,
        pad0: f32,
        pad1: f32,
        pad2: f32,
      };
      @group(0) @binding(0) var<uniform> u: Uniforms;

      struct VertexOut {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f,
      };

      @vertex
      fn vs_main(@location(0) pos: vec2f, @location(1) uvIn: vec2f) -> VertexOut {
        var out: VertexOut;
        out.position = vec4f(pos, 0.0, 1.0);
        out.uv = uvIn;
        return out;
      }

      fn hash(p: vec2f) -> f32 {
        return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453123);
      }

      fn noise(p: vec2f) -> f32 {
        let i = floor(p);
        let f = fract(p);
        let s = f * f * (3.0 - 2.0 * f);
        let a = hash(i);
        let b = hash(i + vec2f(1.0, 0.0));
        let c = hash(i + vec2f(0.0, 1.0));
        let d = hash(i + vec2f(1.0, 1.0));
        return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
      }

      fn fbm(p: vec2f) -> f32 {
        var value = 0.0;
        var amp = 0.5;
        var q = p;
        for (var i = 0; i < 5; i = i + 1) {
          value = value + amp * noise(q);
          q = q * 2.0;
          amp = amp * 0.5;
        }
        return value;
      }

      @fragment
      fn fs_main(in: VertexOut) -> @location(0) vec4f {
        let t = u.time * u.speed;
        let uv = in.uv; // (0,1) bottom-left, (1,0) top-right

        // Two drifting noise fields: large-scale flow and fine ripple.
        let flow = fbm(vec2f(uv.x * u.scale + t * 0.18, uv.y * u.scale * 0.6 - t * 0.12));
        let ripple = fbm(vec2f(uv.x * u.scale * 2.0 - t * 0.10, uv.y * u.scale * 1.5 + t * 0.05));

        // Wavy aurora band across the middle of the layer.
        let center = 0.45 + flow * 0.35;
        let d = abs(uv.y - center);
        let band = exp(-d * d * 18.0);
        let glow = exp(-d * 4.0);

        // Soft vertical fade so edges stay dark.
        let fade = smoothstep(0.0, 0.25, uv.y) * smoothstep(1.05, 0.55, uv.y);

        var col = mix(u.colorA.rgb, u.colorB.rgb, clamp(glow * (0.6 + ripple * 0.6), 0.0, 1.0));
        col = mix(col, u.colorC.rgb, clamp(band * (0.5 + ripple * 0.8), 0.0, 1.0));

        let brightness = 0.35 + u.intensity * (band * 1.2 + glow * 0.6);
        var color = vec4f(col * brightness * fade + vec3f(0.03, 0.04, 0.09), 1.0);
        color.a = clamp(0.8 + band * 0.2, 0.0, 1.0);
        return color;
      }
    `,
  })

  // 4 x vec4f = 64 bytes: multiple of 16, written every render.
  frame.state.uniforms = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  frame.state.pipelineFormat = ""
}

export function render(device, frame) {
  // Rebuild the pipeline only when the output format changes.
  if (frame.state.pipelineFormat !== frame.output.format) {
    frame.state.pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: frame.state.shaderModule,
        entryPoint: "vs_main",
        buffers: [{
          arrayStride: 16,
          attributes: [
            { shaderLocation: 0, format: "float32x2", offset: 0 },
            { shaderLocation: 1, format: "float32x2", offset: 8 },
          ],
        }],
      },
      fragment: {
        module: frame.state.shaderModule,
        entryPoint: "fs_main",
        targets: [{ format: frame.output.format }],
      },
      primitive: { topology: "triangle-list" },
    })
    frame.state.pipelineFormat = frame.output.format
  }

  // Live params into the uniform buffer (time in seconds from the absolute ms clock).
  device.queue.writeBuffer(
    frame.state.uniforms,
    0,
    new Float32Array([
      frame.params.colorA.r, frame.params.colorA.g, frame.params.colorA.b, frame.params.colorA.a,
      frame.params.colorB.r, frame.params.colorB.g, frame.params.colorB.b, frame.params.colorB.a,
      frame.params.colorC.r, frame.params.colorC.g, frame.params.colorC.b, frame.params.colorC.a,
      Number(frame.time) * 0.001, frame.params.speed, frame.params.scale, frame.params.intensity,
    ])
  )

  frame.state.bindGroup = device.createBindGroup({
    layout: frame.state.pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: frame.state.uniforms } }],
  })

  const encoder = device.createCommandEncoder()
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: frame.output.createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 0 },
      loadOp: "clear",
      storeOp: "store",
    }],
  })
  pass.setPipeline(frame.state.pipeline)
  pass.setBindGroup(0, frame.state.bindGroup)
  pass.setVertexBuffer(0, frame.state.quad)
  pass.draw(6)
  pass.end()
  device.queue.submit([encoder.finish()])
}

// User-editable controls.
defineProperties(Fill, {
  colorA: {
    type: "color",
    defaultValue: { r: 0.03, g: 0.07, b: 0.2, a: 1 },
  },
  colorB: {
    type: "color",
    defaultValue: { r: 0.06, g: 0.55, b: 0.55, a: 1 },
  },
  colorC: {
    type: "color",
    defaultValue: { r: 0.6, g: 0.25, b: 0.9, a: 1 },
  },
  speed: {
    type: "number",
    defaultValue: 1.0,
    min: 0.0,
    max: 3.0,
    step: 0.1,
    control: "slider",
  },
  scale: {
    type: "number",
    defaultValue: 3.0,
    min: 0.5,
    max: 8.0,
    step: 0.1,
    control: "slider",
  },
  intensity: {
    type: "number",
    defaultValue: 0.8,
    min: 0.2,
    max: 1.5,
    step: 0.05,
    control: "slider",
  },
})
