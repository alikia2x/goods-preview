# Rendering structure

- `/workspace/badge` retains the imperative `BadgeRenderer`, including its tuned material and depth-shadow pass.
- `/workspace/keychain` uses R3F. `KeychainModel` composes the extruded acrylic, alpha-masked print and metal hardware. `lib/keychain` owns image preparation and contour geometry, independently of React.
- `lib/studio` owns shared scene geometry, light-direction math, environment generation, square framing and capture. The badge environment adapter supplies its original profiles without changing their values.
- `components/studio` owns the R3F camera/controls, lighting, stage and error boundary. New products can compose these components with their own model; a product registry or renderer superclass is unnecessary. Both workspaces use the same `PreviewToolbar` and `AdjustmentPanel`, including the mobile actions and export controls.

## Artwork and materials

Images are trimmed to visible alpha bounds. A bounded 256-pixel mask generates an expanded outer cutline and a connected mounting tab. The cutline is simplified before beveling to remove raster stair steps, and bevel normals are smoothed. The tab hole is actual geometry. Interior transparent regions remain acrylic. Disconnected designs that do not join after expansion are rejected with a validation message; opaque JPEGs produce a rectangular cutline.

The diffuse print sits inside a 2–5 mm transmissive acrylic extrusion (IOR 1.49), with no second clearcoat layer. The current print is the same artwork viewed through both faces; its reverse is mirrored. Hardware uses uniform wire chain links, a continuous two-turn flattened spring ring, or a beveled cast clasp with a separate gate, hinge pin and lever. Print alpha and hardware cast native PCF shadow-map shadows; clear acrylic does not cast an opaque silhouette. Refraction is screen-space, with no caustics or spectral dispersion.

Keychains use the locally bundled **Studio Small 09** HDRI by Sergej Majboroda / Poly Haven (CC0). See `public/environments/LICENSE.md` for provenance. The original 2K HDR is retained as the source asset; the runtime loads a 512×256 half-float OpenEXR with ZIP compression to reduce transfer size while retaining HDR emitter luminance and dark studio surfaces. PMREM supplies roughness-dependent reflections. Its measured main-emitter direction is aligned to the light-direction control, along with the shadow-casting key light. The HDR is lighting only, never a visible background. The badge keeps its existing tuned environment profiles.

Neither product uses a fixed shadow frustum: `shadowFrustum` in `lib/studio/lighting.ts` recomputes left/right/top/bottom/near/far from the product volume plus its projection onto the receiver plane and, when the scene has one, the backdrop wall. The keychain's directional light and the badge's `ContactShadow` depth pass both consume it, so grazing angles stretch the box instead of clipping shadows, and each 2048-pixel map covers exactly what can be shaded.

The "studio" (窗影影棚) scene stays defined but is filtered out of the scene picker (`HIDDEN_SCENES` in `lib/studio/scenes.ts`) until its window-caster staging is retuned.

Remote assets travel through layered promise caches instead of raw `useLoader`. The compressed EXR fetch is global (network + parse, keyed implicitly by the single bundled URL), while PMREM conversion caches per `WebGLRenderer`, because render targets are bound to the GL context that produced them — the badge and keychain canvases are separate contexts. See `lib/studio/photographic-environment.ts` and `lib/studio/lighting-presets.ts`. The keychain canvas carries an `EnvironmentLoader` that resolves the cached promise and hands the render target to the page, so the overlay can show a "preparing lighting" status while waiting and a non-blocking error banner when the HDR fetch fails; in the failure case the model still renders, with reflections degraded.

Lighting is a first-class, product-independent choice: `LightingPreset` offers "matte" (broad soft lobe), "glossy" (tight elongated lobe) and "hdr" (the bundled panorama). The badge's finish control only drives surface roughness after the split; its environment comes from the same preset registry as the keychain.

## Debug overlay

Built only for `import.meta.env.DEV`. The imperative badge loop and the R3F loop both feed one collector (`lib/studio/debug-stats.ts`), so a single panel (`components/studio/DebugPanel.tsx`) can display FPS, per-frame millisecond budget, draw calls, triangles, geometry/texture counts, shader program count and WebGL context-loss state. Either the badge or the keychain loop can be skipped for a moment; once one restarts the panel resumes reporting.

The transparent scene hides its opaque set during PNG capture while retaining the shadow receiver. Renderer size, alpha and scene visibility are restored in a `finally` block. Output is cropped to the unobstructed square region, at 1024, 2048 or 4096 pixels.

The black scene's reflection floor shares one `Reflector` instance, but its nested pass runs only when the live render target is null (never from within the transmission buffer), disables shadow autoupdate for that pass, and resolves against the previous frame. The render-resolution is 256 instead of 512, which is enough for the Gaussian blur and avoids tripping a GPU watchdog.

## Verification

Run `bun test`, `bun run build`, `bun run lint`, and `git diff --check`. Browser interaction and visual checks require a user request under this repository's AGENTS.md.
