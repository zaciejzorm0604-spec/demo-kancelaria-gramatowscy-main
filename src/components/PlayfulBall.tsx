import { useEffect, useRef, useState } from 'react';

const BALL_SIZE = 96;
const KICK_RADIUS = 120;
const DAMPING = 0.985; // per frame at 60 Hz
const RESTITUTION = 0.7;
const SLEEP_THRESHOLD = 0.5; // px/frame
const MAX_DT = 32; // ms
const SQUASH_MAX = 0.6; // minimum scale factor on hit
const KICK_STRENGTH = 36; // 2x original (was 18)

export default function PlayfulBall() {
  const ballRef = useRef<HTMLDivElement>(null);

  // Physics state in refs — no React re-renders per frame
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);
  const sleeping = useRef(true);

  // Squash/stretch state
  const scaleX = useRef(1);
  const scaleY = useRef(1);

  // Gating state — needs React re-render only once on mount
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Kick-start or re-kick the rAF loop
  const startLoop = () => {
    if (rafId.current !== null) return; // already running
    sleeping.current = false;
    lastTime.current = null;
    const loop = (ts: number) => {
      const ball = ballRef.current;
      if (!ball) return;

      const dt = lastTime.current === null ? 16 : Math.min(ts - lastTime.current, MAX_DT);
      lastTime.current = ts;

      const factor = dt / (1000 / 60); // normalize to 60 Hz frame
      const dampFactor = Math.pow(DAMPING, factor);

      // Apply damping
      vel.current.x *= dampFactor;
      vel.current.y *= dampFactor;

      // Update position
      pos.current.x += vel.current.x * factor;
      pos.current.y += vel.current.y * factor;

      const maxX = window.innerWidth - BALL_SIZE;
      const maxY = window.innerHeight - BALL_SIZE;

      // Wall collisions
      let hitX = false;
      let hitY = false;
      const speed = Math.hypot(vel.current.x, vel.current.y);

      if (pos.current.x <= 0) {
        pos.current.x = 0;
        vel.current.x = Math.abs(vel.current.x) * RESTITUTION;
        hitX = true;
      } else if (pos.current.x >= maxX) {
        pos.current.x = maxX;
        vel.current.x = -Math.abs(vel.current.x) * RESTITUTION;
        hitX = true;
      }

      if (pos.current.y <= 0) {
        pos.current.y = 0;
        vel.current.y = Math.abs(vel.current.y) * RESTITUTION;
        hitY = true;
      } else if (pos.current.y >= maxY) {
        pos.current.y = maxY;
        vel.current.y = -Math.abs(vel.current.y) * RESTITUTION;
        hitY = true;
      }

      // Squash & stretch on wall hit
      if (hitX || hitY) {
        const impactSpeed = speed;
        const squash = Math.max(SQUASH_MAX, 1 - impactSpeed * 0.004);
        if (hitX) {
          scaleX.current = squash;
          scaleY.current = 1 / squash;
        } else {
          scaleY.current = squash;
          scaleX.current = 1 / squash;
        }
      }

      // Ease scale back to 1
      scaleX.current += (1 - scaleX.current) * 0.15;
      scaleY.current += (1 - scaleY.current) * 0.15;

      // Write transform directly to DOM
      ball.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(${scaleX.current}, ${scaleY.current})`;

      // Sleep check
      const currentSpeed = Math.hypot(vel.current.x, vel.current.y);
      if (currentSpeed < SLEEP_THRESHOLD) {
        vel.current.x = 0;
        vel.current.y = 0;
        sleeping.current = true;
        rafId.current = null;
        return; // stop loop
      }

      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    // Device gating: touch-only → render nothing
    const pointerMQ = window.matchMedia('(pointer: fine)');
    if (!pointerMQ.matches) {
      setVisible(false);
      return;
    }
    setVisible(true);

    // Reduced motion gating
    const motionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(motionMQ.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    motionMQ.addEventListener('change', onMotionChange);

    // Pointermove: proximity kick
    const onPointerMove = (e: PointerEvent) => {
      if (motionMQ.matches) return; // reduced motion: no kicks

      const cx = pos.current.x + BALL_SIZE / 2;
      const cy = pos.current.y + BALL_SIZE / 2;
      const dx = cx - e.clientX;
      const dy = cy - e.clientY;
      const dist = Math.hypot(dx, dy);

      if (dist < KICK_RADIUS && dist > 0) {
        const strength = (1 - dist / KICK_RADIUS) * KICK_STRENGTH;
        vel.current.x += (dx / dist) * strength;
        vel.current.y += (dy / dist) * strength;

        if (sleeping.current) {
          startLoop();
        }
      }
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Resize: clamp pos inside viewport
    const onResize = () => {
      const maxX = window.innerWidth - BALL_SIZE;
      const maxY = window.innerHeight - BALL_SIZE;
      pos.current.x = Math.min(pos.current.x, maxX);
      pos.current.y = Math.min(pos.current.y, maxY);
      const b = ballRef.current;
      if (b) {
        b.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(${scaleX.current}, ${scaleY.current})`;
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      motionMQ.removeEventListener('change', onMotionChange);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set initial position once ball is in the DOM (after visible becomes true)
  useEffect(() => {
    if (!visible) return;
    const ball = ballRef.current;
    if (!ball) return;

    // Position at center of hero section
    pos.current.x = window.innerWidth / 2 - BALL_SIZE / 2;
    pos.current.y = window.innerHeight / 2 - BALL_SIZE / 2;

    ball.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(1, 1)`;
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    >
      <div
        ref={ballRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55) 0%, transparent 45%), radial-gradient(circle at 70% 80%, rgba(212,160,23,0.35) 0%, transparent 50%), linear-gradient(135deg, #2E7D32 0%, #1C5228 40%, #0a2e14 80%, #1a3a5c 100%)`,
          boxShadow: '0 8px 32px rgba(28,82,40,0.55), 0 2px 8px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Start hidden until useEffect sets position
          transform: 'translate3d(-200px, -200px, 0)',
          // If reduced motion, position statically (useEffect won't start loop)
          ...(reduced ? { transition: 'none' } : {}),
        }}
      >
        <img 
          src="/paragraf - bialy na kulke.svg" 
          alt="Paragraf" 
          style={{ width: '45%', height: '45%', opacity: 0.9 }} 
          loading="lazy"
        />
      </div>
    </div>
  );
}