'use client';
import { PlayCircle } from 'lucide-react';
import { useLang } from './LangProvider';

// Explainer from /mnt/project-files/gharmalak/videos (silent; all copy is on screen).
// Wide cut on larger screens, tall cut on phones; nothing downloads until play.
const WIDE = '/videos/how-gharmalak-works-16x9.mp4';
const TALL = '/videos/how-gharmalak-works-9x16.mp4';

export function HowVideo() {
  const { t } = useLang();
  return (
    <figure className="how-video" data-reveal>
      <video className="how-video-wide" controls playsInline muted preload="none" poster="/videos/how-gharmalak-works-16x9.jpg" aria-label={t.vid_label}>
        <source src={WIDE} type="video/mp4" />
      </video>
      <video className="how-video-tall" controls playsInline muted preload="none" poster="/videos/how-gharmalak-works-9x16.jpg" aria-label={t.vid_label}>
        <source src={TALL} type="video/mp4" />
      </video>
      <figcaption><PlayCircle size={18} /> {t.vid_label} · {t.vid_note}</figcaption>
    </figure>
  );
}
