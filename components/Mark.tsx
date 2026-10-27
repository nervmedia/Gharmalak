export function Mark({ size = 32, color = 'var(--brass-500)', title }: { size?: number; color?: string; title?: string }) {
  return (
    <svg width={size} height={size * 92 / 80} viewBox="10 4 80 92" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path fillRule="evenodd" d="M50 10 L84 36 V78 Q84 90 72 90 H28 Q16 90 16 78 V36 Z M46 60 A10 10 0 1 1 54 60 L57 74 H43 Z" fill={color} stroke={color} strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
}
