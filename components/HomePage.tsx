'use client';
import Link from 'next/link';
import { Sun, ShieldCheck, BadgeCheck, Check, MessageCircle, ChevronDown, Clock, ArrowRight, House, Building2, HeartHandshake } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { StickyCta } from './StickyCta';
import { MalakCard } from './MalakCard';
import { HowVideo } from './HowVideo';
import { useLang } from './LangProvider';
import { useStats } from './useStats';
import { CountUp, useReveal } from './Motion';
import { currentRound, inr, site, waLink } from '@/lib/config';
import { deals, launchCities, roundOf } from '@/lib/deals';

const BACK_POSE = { rx: 9, ry: -16, gx: 70, gy: 30 };

export function Home() {
  const { t } = useLang();
  const stats = useStats();
  useReveal();
  const optins = stats?.optins ?? 0;
  const pct = Math.min(100, Math.round((optins / currentRound.target) * 100));
  const seatsTaken = Math.min(site.foundingSeats, stats?.members ?? 0);
  const seatsPct = Math.round((seatsTaken / site.foundingSeats) * 100);
  const seatsLabel = t.plan_seats.replace('{n}', (site.foundingSeats - seatsTaken).toLocaleString('en-IN'));
  const closes = new Date(currentRound.closes).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <>
      <Header />
      <main id="main">
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div>
                <p className="overline" data-reveal>{t.hero_over}</p>
                <h1 data-reveal style={{ '--d': 1 } as React.CSSProperties}>{t.hero_title}</h1>
                <p className="hero-line" data-reveal style={{ '--d': 2 } as React.CSSProperties}>{t.h_line}</p>
                <div className="hero-ctas" data-reveal style={{ '--d': 3 } as React.CSSProperties}>
                  <Link href="/join" className="gm-btn gm-btn-primary">{t.hero_cta} <ArrowRight size={18} /></Link>
                  <Link href="/deals" className="gm-btn gm-btn-secondary">{t.h_deals}</Link>
                </div>
                <p className="hero-note" data-reveal style={{ '--d': 4 } as React.CSSProperties}><BadgeCheck size={18} /> {t.hero_note}</p>
              </div>
              <div className="card-stage" aria-hidden="true">
                <MalakCard className="back" finish="titanium" still pose={BACK_POSE} name="Rahul Joshi" number="GM · 0002 · NGP" label={t.card_member} over={t.card_over} />
                <MalakCard className="front" name="Priya Deshmukh" number="GM · 0001 · NGP" label={t.card_member} over={t.card_over} />
                <div className="gm-alert float">
                  <div className="gm-alert-badge"><MessageCircle size={18} /></div>
                  <div className="gm-alert-body">
                    <p className="gm-alert-from">Gharmalak <span>{t.example}</span></p>
                    <p className="gm-alert-text">Round 1: rooftop solar, installed in January. Opt in from 1 Nov.{'\n'}Reply YES.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section statement">
          <div className="wrap">
            <p className="overline" data-reveal>{t.st_over}</p>
            <h2 className="statement-title" data-reveal style={{ '--d': 1 } as React.CSSProperties}>{t.st_title}</h2>
            <p className="statement-body" data-reveal style={{ '--d': 2 } as React.CSSProperties}>{t.st_body}</p>
            <div className="counters" role="list">
              <div className="counter" role="listitem" data-reveal><span className="counter-num amount">{stats ? <CountUp to={stats.members} /> : '·'}</span><span>{t.stat_members}</span></div>
              <div className="counter" role="listitem" data-reveal style={{ '--d': 1 } as React.CSSProperties}><span className="counter-num amount">{stats ? <CountUp to={stats.optins} /> : '·'}</span><span>{t.stat_optins}</span></div>
              <div className="counter" role="listitem" data-reveal style={{ '--d': 2 } as React.CSSProperties}><span className="counter-num amount"><CountUp to={10} suffix="%" /></span><span>{t.stat_saving}</span></div>
              <div className="counter" role="listitem" data-reveal style={{ '--d': 3 } as React.CSSProperties}><span className="counter-num amount"><CountUp to={launchCities.length} /></span><span>{t.stat_cities}</span></div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="wrap">
            <div className="section-head">
              <p className="overline" data-reveal>{t.how_over}</p>
              <h2 data-reveal style={{ '--d': 1 } as React.CSSProperties}>{t.how_title}</h2>
            </div>
            <div className="how-grid">
              {[1, 2, 3, 4].map(n => (
                <article key={n} className={`how-card ${n === 4 ? 'warn' : ''}`} data-reveal style={{ '--d': n } as React.CSSProperties}>
                  <span className="how-num">0{n}</span>
                  <h3>{t[`step${n}_t` as 'step1_t']}</h3>
                  <p>{t[`step${n}_b` as 'step1_b']}</p>
                </article>
              ))}
            </div>
            <HowVideo />
          </div>
        </section>

        <section className="section">
          <div className="wrap round-grid">
            <div>
              <p className="overline" data-reveal>{t.round_over}</p>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <h2 data-reveal style={{ '--d': 1 } as React.CSSProperties}>{t.round_title}</h2>
                <p data-reveal style={{ '--d': 2 } as React.CSSProperties}>{t.r1_line}</p>
              </div>
              <div className="hero-ctas" data-reveal style={{ '--d': 3 } as React.CSSProperties}>
                <Link href="/round/solar-nagpur" className="gm-btn gm-btn-secondary">{t.round_cta} <ArrowRight size={18} /></Link>
              </div>
            </div>
            <article className="gm-deal" data-reveal style={{ '--d': 2 } as React.CSSProperties}>
              <div className="gm-deal-head">
                <h3 className="gm-deal-title"><Sun className="gm-icon" /> {t.i_solar}</h3>
                <span className="gm-badge gm-badge-pending"><Clock className="gm-icon" /> {t.r_status_soon}</span>
              </div>
              <div className="round-facts">
                <div className="fact"><small>{t.round_pbt}</small><strong>{t.round_pbt_val}</strong></div>
                <div className="fact"><small>{t.round_saving}</small><strong>{t.round_saving_val}</strong></div>
              </div>
              <div className="meter">
                <div className="gm-progress" role="progressbar" aria-valuenow={optins} aria-valuemin={0} aria-valuemax={currentRound.target} aria-label={t.round_homes}><span style={{ width: `${Math.max(pct, 2)}%` }} /></div>
                <div className="meter-row"><span><strong className="amount" style={{ color: 'var(--ink)' }}>{optins}</strong> / {currentRound.target} {t.round_homes}</span><span>{t.round_closes} {closes}</span></div>
              </div>
            </article>
          </div>
        </section>

        <section className="section ahead">
          <div className="wrap ahead-head">
            <div>
              <p className="overline" data-reveal>{t.ahead_over}</p>
              <h2 data-reveal style={{ '--d': 1 } as React.CSSProperties}>{t.ahead_title}</h2>
            </div>
            <Link href="/deals" className="deal-link" data-reveal style={{ '--d': 2 } as React.CSSProperties}>{t.ahead_cta} <ArrowRight size={16} /></Link>
          </div>
          <div className="marquee" aria-label={t.ahead_title}>
            <ul className="marquee-track">
              {[...deals, ...deals].map((d, i) => (
                <li key={d.id + i} className="marquee-item" aria-hidden={i >= deals.length}>
                  <span className="marquee-when">{roundOf(d).install}</span>
                  <span>{d.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="overline" data-reveal>{t.who_over}</p>
              <h2 data-reveal style={{ '--d': 1 } as React.CSSProperties}>{t.who_title}</h2>
            </div>
            <div className="who-grid">
              {([[House, 1], [Building2, 2], [HeartHandshake, 3]] as const).map(([Icon, n]) => (
                <article key={n} className="who-card" data-reveal style={{ '--d': n } as React.CSSProperties}>
                  <div className="why-icon"><Icon /></div>
                  <h3>{t[`who${n}_t` as 'who1_t']}</h3>
                  <p>{t[`who${n}_b` as 'who1_b']}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section promise">
          <div className="wrap">
            <p className="overline" data-reveal>{t.not_over}</p>
            <h2 className="statement-title" data-reveal style={{ '--d': 1 } as React.CSSProperties}>{t.not_title}</h2>
            <ul className="promise-ticks" data-reveal style={{ '--d': 2 } as React.CSSProperties}>
              {[t.why1_t, t.why2_t, t.why3_t].map(x => <li key={x}><ShieldCheck size={18} /> {x}</li>)}
            </ul>
          </div>
        </section>

        <section className="section" id="join">
          <div className="wrap plan-wrap">
            <div className="gm-plan" data-reveal>
              <div className="plan-head"><p className="overline">{t.plan_title}</p><span className="plan-badge">{t.plan_badge}</span></div>
              <div className="gm-plan-price"><s className="plan-was">{inr(site.regularFee)}</s><span className="gm-amount amount">{inr(site.fee)}</span><span className="gm-plan-per">{t.plan_per}</span></div>
              <p className="plan-save"><BadgeCheck size={18} /> {t.plan_save}</p>
              <ul className="gm-ticks">
                {[t.plan_t1, t.plan_t2, t.plan_t3, t.plan_t4].map(x => <li key={x}><Check className="gm-icon" size={20} /> {x}</li>)}
              </ul>
              <div className="meter">
                <div className="gm-progress" role="progressbar" aria-valuenow={seatsTaken} aria-valuemin={0} aria-valuemax={site.foundingSeats} aria-label={seatsLabel}><span style={{ width: `${Math.max(seatsPct, 2)}%` }} /></div>
                <div className="meter-row"><span>{seatsLabel}</span></div>
              </div>
              <Link href="/join" className="gm-btn gm-btn-primary gm-btn-block">{t.hero_cta}</Link>
              <p className="plan-note">{t.plan_note}</p>
            </div>
            <div data-reveal style={{ '--d': 1 } as React.CSSProperties}>
              <h2 style={{ fontSize: 28, marginBottom: 16 }}>{t.faq_title}</h2>
              <div className="faq">
                {[5, 1, 2, 3, 4].map(n => (
                  <details key={n}>
                    <summary>{t[`faq${n}_q` as 'faq1_q']} <ChevronDown size={20} /></summary>
                    <p>{t[`faq${n}_a` as 'faq1_a']}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="wrap">
            <p className="overline" data-reveal>{t.end_over}</p>
            <h2 data-reveal style={{ '--d': 1 } as React.CSSProperties}>{t.end_title}</h2>
            <div className="hero-ctas" data-reveal style={{ '--d': 2 } as React.CSSProperties}>
              <Link href="/join" className="gm-btn gm-btn-primary">{t.hero_cta}</Link>
              <a className="gm-btn gm-btn-secondary" href={waLink('Hi Gharmalak, I want to know more about the club.')} target="_blank" rel="noopener"><MessageCircle size={18} /> {t.hero_wa}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
