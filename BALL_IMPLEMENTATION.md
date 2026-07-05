# Playful Ball — Implementation Plan

Interactive "playful ball" animation for the site. A single accent-colored ball sits on top of the page, gets "kicked" away when the cursor approaches, flies with realistic physics (bouncing off viewport edges, losing energy), and rests until the next kick.

> **Project note:** This is a **Vite + React SPA** (not Next.js) — entry is `src/main.tsx` → `src/App.tsx`, single route. Therefore `"use client"` is not needed and there is no SSR/hydration concern. All `window` access will still be guarded inside `useEffect` so the component remains SSR-safe if the project ever migrates to Next.js.
>
> **Accent color:** the site hardcodes `#2E8540` (green) throughout `App.tsx`; no CSS variable exists yet. We will introduce `--ball-accent`.

---

## Checklist

### 1. Accent color variable — `src/index.css`

- [x] Add a `:root` block defining the accent variable:
  ```css
  :root {
    --ball-accent: #2E8540;
  }
  ```
- [x] Ball component reads it via `var(--ball-accent, #2E8540)` (fallback included).

### 2. Create `src/components/PlayfulBall.tsx`

Self-contained, dependency-free TypeScript component.

#### Rendering
- [x] Fixed-position wrapper + ball element, high `z-index` (above all content).
- [x] `pointer-events: none` on **both** wrapper and ball — never blocks page interaction.
- [x] Ball: **48px**, perfectly round (`border-radius: 50%`), radial-gradient of the accent color + subtle soft `box-shadow` so it reads as a physical object.
- [x] Initial position: near the bottom-right corner of the viewport.
- [x] `will-change: transform` for smooth GPU-composited movement.

#### Device & accessibility gating (in a mount effect — no SSR issues)
- [x] `matchMedia('(pointer: fine)')` → on touch-only devices, render **nothing**.
- [x] `matchMedia('(prefers-reduced-motion: reduce)')` → render the ball **statically** (no physics, no listeners). React live to media-query changes.
- [x] Mark the element `aria-hidden="true"` (purely decorative).

#### Physics loop (requestAnimationFrame — zero React re-renders per frame)
- [x] Keep `pos` (x, y) and `vel` (vx, vy) in **refs**; each frame writes
      `transform: translate3d(x, y, 0) scale(sx, sy)` directly on the DOM node.
- [x] **Proximity kick:** global passive `pointermove` listener. When the cursor is within **~120px** of the ball's center, apply an impulse directed *away* from the cursor. Strength scales with proximity: `impulse ∝ (1 − dist / 120)` (closer = stronger kick).
  - [x] Works from idle (starts the rAF loop).
  - [x] Works mid-flight (re-kick while already moving).
- [x] **Air friction / damping:** `vel *= ~0.985` per frame, normalized by delta-time so behavior is consistent across refresh rates (60 Hz vs 144 Hz).
- [x] **Wall bounces:** collide with all four viewport edges (`0 … innerWidth − size`, `0 … innerHeight − size`); reflect velocity with **restitution 0.7** (each bounce loses energy). Ball always stays fully inside the viewport.
- [x] **Sleep state:** when speed drops below a small threshold, snap velocity to zero, `cancelAnimationFrame`, and set an idle flag → **zero CPU cost** while resting. Loop restarts only on the next proximity trigger.
- [x] Clamp delta-time (e.g. max 32 ms) to avoid physics explosions after tab switches.

#### Polish: squash & stretch
- [x] On each wall hit, set a squash factor along the collision axis, proportional to impact speed (capped, e.g. down to ~0.6).
- [x] Ease the scale back to `1` over subsequent frames — folded into the same `transform` write, no extra cost.

#### Resize handling
- [x] `resize` listener clamps `pos` back inside the viewport immediately — including while idle (one-off transform write, no loop restart needed).

#### Cleanup
- [x] Effect teardown removes all listeners (`pointermove`, `resize`, media-query) and cancels any pending rAF.

### 3. Mount in the root — `src/App.tsx`

- [x] `import PlayfulBall from './components/PlayfulBall';`
- [x] Render `<PlayfulBall />` once at the top level of the root JSX (SPA has a single route, so this covers "all pages").

### 4. Verification

- [x] `npm run dev` starts with no TypeScript/console errors.
- [x] Ball idles motionless; approaching cursor kicks it away with bounce + gradual slowdown to a full stop.
- [x] Re-kicking mid-flight works.
- [x] Ball never leaves the viewport; window resize clamps it back inside.
- [x] Page interaction unaffected everywhere: scrolling, links, forms, FAQ accordion, mobile menu.
- [x] With reduced motion enabled (DevTools emulation), ball is static.
- [x] In touch/mobile emulation, ball is not rendered.

---

## Files touched

| File | Change |
|---|---|
| `src/index.css` | Add `:root { --ball-accent: #2E8540; }` |
| `src/components/PlayfulBall.tsx` | **New** — full component (rendering, gating, physics, polish) |
| `src/App.tsx` | Mount `<PlayfulBall />` once |