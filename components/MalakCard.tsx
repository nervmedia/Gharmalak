import { Mark } from './Mark';

export function MalakCard({ name, number, label, over = 'MALAK CARD', className = '' }: { name: string; number: string; label: string; over?: string; className?: string }) {
  return (
    <div className={`gm-malak ${className}`} aria-label={`${over}: ${name}`}>
      <div className="gm-malak-top">
        <div>
          <div className="gm-malak-over">{over}</div>
        </div>
        <Mark size={34} />
      </div>
      <div className="card-chip" aria-hidden="true" />
      <div>
        <p className="gm-malak-name">{name}</p>
        <div className="gm-malak-meta"><span>{number}</span><span>{label}</span></div>
      </div>
    </div>
  );
}
