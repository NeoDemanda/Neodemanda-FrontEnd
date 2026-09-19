import { useEffect, useRef } from "react";

function spherePoint() {
  const v = Math.random() * 2 - 1;
  const phi = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - v * v);
  return { x: r * Math.cos(phi), y: v, z: r * Math.sin(phi), phi };
}

function glowPoint(ctx, x, y, radius, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 5);
  g.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
  g.addColorStop(0.2, `${color}${Math.round(alpha * 0.5 * 255).toString(16).padStart(2, "0")}`);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius * 5, 0, Math.PI * 2);
  ctx.fill();
}

export default function ParticleSphere({ size = 700 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const mobile = window.innerWidth < 768;
    const count = mobile ? 1250 : 3000;
    const particles = Array.from({ length: count }, (_, i) => {
      const p = spherePoint();
      const band = Math.sin(p.phi * 7 + p.y * 9) * 0.5 + 0.5;
      return {
        ...p,
        size: 0.45 + Math.random() * 1.55,
        alpha: 0.25 + Math.random() * 0.75,
        twinkle: Math.random() * Math.PI * 2,
        band,
        drift: 0.4 + Math.random() * 1.2,
        index: i,
      };
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let time = 0;
    let rotation = -0.28;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const pointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const draw = (now) => {
      time = now * 0.001;
      pointerX += (targetX - pointerX) * 0.025;
      pointerY += (targetY - pointerY) * 0.025;
      if (!reduceMotion) rotation += 0.0022;

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.52;
      const radius = Math.min(size, width * 0.92, height * 1.1) * 0.48;
      const yaw = rotation + pointerX * 0.16;
      const pitch = pointerY * 0.12;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // Deep-water aura: the reference uses atmosphere, not a solid sphere.
      const aura = ctx.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius * 1.25);
      aura.addColorStop(0, "rgba(0,130,124,.16)");
      aura.addColorStop(0.42, "rgba(0,130,124,.08)");
      aura.addColorStop(0.73, "rgba(253,233,255,.045)");
      aura.addColorStop(1, "rgba(1,38,36,0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      const projected = [];

      for (const p of particles) {
        // Slightly deform the shell so it feels like a living data mass rather than a perfect dot globe.
        const wave = Math.sin(p.phi * 11 + p.y * 8 + time * p.drift) * 0.025;
        const rr = 1 + wave + (p.band - 0.5) * 0.025;
        const x0 = p.x * rr;
        const y0 = p.y * rr;
        const z0 = p.z * rr;

        const x1 = x0 * cosY - z0 * sinY;
        const z1 = x0 * sinY + z0 * cosY;
        const y1 = y0 * cosP - z1 * sinP;
        const z2 = y0 * sinP + z1 * cosP;

        const depth = 1.55 / (1.55 - z2 * 0.62);
        const px = cx + x1 * radius * depth;
        const py = cy + y1 * radius * depth;
        const front = (z2 + 1) / 2;
        const twinkle = 0.68 + Math.sin(time * 2.2 * p.drift + p.twinkle) * 0.32;
        const edge = Math.max(0, Math.abs(x1) * 0.65 + (1 - front) * 0.5 - 0.42);
        const cluster = Math.max(0, Math.sin(p.phi * 5 + p.y * 13) * 0.5 + 0.5 - 0.64);
        const alpha = p.alpha * twinkle * (0.16 + front * 0.84);

        projected.push({
          px,
          py,
          z: z2,
          size: p.size * (0.65 + depth * 0.48),
          alpha,
          edge,
          cluster,
          front,
        });
      }

      projected.sort((a, b) => a.z - b.z);

      // A few large bioluminescent points create the luminous data-node feel seen around the orb.
      for (let i = 0; i < projected.length; i += mobile ? 82 : 105) {
        const p = projected[i];
        if (p.front > 0.68 && p.alpha > 0.35) {
          glowPoint(ctx, p.px, p.py, p.size * 1.7, p.edge > 0.2 ? "#fde9ff" : "#cbfffc", 0.075);
        }
      }

      for (const p of projected) {
        const pinkWeight = Math.min(1, p.edge * 1.6 + p.cluster * 0.45);
        const cyan = `rgba(203,255,252,${Math.min(0.95, p.alpha)})`;
        const pink = `rgba(253,233,255,${Math.min(0.95, p.alpha * 0.95)})`;

        if (pinkWeight > 0.34) {
          ctx.fillStyle = pink;
        } else {
          ctx.fillStyle = cyan;
        }

        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft rim: it disappears into the canvas rather than drawing a visible outline.
      const rim = ctx.createRadialGradient(cx, cy, radius * 0.82, cx, cy, radius * 1.04);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(0.89, "rgba(203,255,252,.035)");
      rim.addColorStop(0.96, "rgba(253,233,255,.065)");
      rim.addColorStop(1, "rgba(253,233,255,0)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerleave", pointerLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerleave", pointerLeave);
    };
  }, [size]);

  return (
    <div className="pointer-events-auto relative h-[470px] w-full sm:h-[620px] lg:h-[700px]" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
