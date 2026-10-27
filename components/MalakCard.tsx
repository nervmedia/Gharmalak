'use client';
import { useEffect, useRef } from 'react';
import { Mark } from './Mark';

type Finish = 'brass' | 'titanium';
type Pose = { rx: number; ry: number; gx: number; gy: number };

const REST: Pose = { rx: 7, ry: -13, gx: 30, gy: 20 };

/* The Malak Card as a brushed metal card. It tilts toward the pointer and the light
   follows it; with no pointer it sways slowly so the metal still catches light.
   `still` renders a fixed pose (used for the card behind the hero card). */
export function MalakCard({ name, number, label, over = 'MALAK CARD', finish = 'brass', still = false, pose, className = '' }: {
  name: string; number: string; label: string; over?: string; finish?: Finish; still?: boolean; pose?: Partial<Pose>; className?: string;
}) {
  const scene = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = card.current, host = scene.current;
    if (!el || !host) return;
    const apply = (p: Pose) => {
      el.style.setProperty('--rx', `${p.rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${p.ry.toFixed(2)}deg`);
      el.style.setProperty('--gx', p.gx.toFixed(1));
      el.style.setProperty('--gy', p.gy.toFixed(1));
    };
    const rest = { ...REST, ...pose };
    apply(rest);
    if (still || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cur = { ...rest };
    let target: Pose | null = null;
    let raf = 0, visible = true;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const goal = target ?? {
        rx: rest.rx + 2.5 * Math.sin(t / 1.9),
        ry: rest.ry + 7 * Math.sin(t / 2.6),
        gx: 50 + 45 * Math.sin(t / 2.6),
        gy: 30 + 25 * Math.cos(t / 1.9),
      };
      const k = target ? 0.14 : 0.05;
      cur.rx += (goal.rx - cur.rx) * k; cur.ry += (goal.ry - cur.ry) * k;
      cur.gx += (goal.gx - cur.gx) * k; cur.gy += (goal.gy - cur.gy) * k;
      apply(cur);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      target = { rx: (0.5 - y) * 18, ry: (x - 0.5) * 26, gx: x * 100, gy: y * 100 };
    };
    const leave = () => { target = null; };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('pointercancel', leave);

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(host);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('pointercancel', leave);
    };
  }, [still, pose?.rx, pose?.ry, pose?.gx, pose?.gy]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={scene} className={`mc-scene ${className}`}>
      <div ref={card} className={`mc mc-${finish}`} role="img" aria-label={`${over}: ${name}`}>
        <i className="mc-edge" style={{ '--z': '-4px' } as React.CSSProperties} />
        <i className="mc-edge" style={{ '--z': '-3px' } as React.CSSProperties} />
        <i className="mc-edge" style={{ '--z': '-2px' } as React.CSSProperties} />
        <i className="mc-edge" style={{ '--z': '-1px' } as React.CSSProperties} />
        <div className="mc-face" aria-hidden="true">
          <div className="mc-brush" />
          <div className="mc-content">
            <div className="mc-top">
              <span className="mc-over">{over}</span>
              <span className="mc-mark"><Mark size={30} color={finish === 'brass' ? '#3d2f12' : '#cfae6a'} /></span>
            </div>
            <div className="mc-mid">
              <span className="mc-chip"><span /></span>
              <svg className="mc-nfc" viewBox="0 0 24 24" fill="none" strokeLinecap="round"><path d="M8.5 7.5a6.5 6.5 0 0 1 0 9" /><path d="M12 5a10 10 0 0 1 0 14" /><path d="M15.5 2.8a13 13 0 0 1 0 18.4" /><path d="M5 10a3 3 0 0 1 0 4" /></svg>
            </div>
            <div className="mc-bottom">
              <p className="mc-name">{name}</p>
              <div className="mc-meta"><span>{number}</span><span>{label}</span></div>
            </div>
          </div>
          <div className="mc-sheen" />
          <div className="mc-glare" />
        </div>
      </div>
    </div>
  );
}
