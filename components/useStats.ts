'use client';
import { useEffect, useState } from 'react';

export function useStats() {
  const [s, setS] = useState<{ members: number; optins: number } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/stats').then(r => r.ok ? r.json() : null).then(d => { if (alive && d) setS(d); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  return s;
}
