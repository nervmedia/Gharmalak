'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Calendar, Check, ChevronDown, ClipboardList, IndianRupee, MessageCircle, Percent,
  PlayCircle, ShieldCheck, Sun, Users, Wrench, BadgePercent,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { StickyCta } from './StickyCta';
import { MalakCard } from './MalakCard';
import { HowVideo } from './HowVideo';
import { useLang } from './LangProvider';
import { useStats } from './useStats';
import { CountUp, useReveal } from './Motion';
import { currentRound, inr, site, waLink } from '@/lib/config';
import { dateLabel, deals, rounds, solarCities, type DealKind } from '@/lib/deals';

// Photo for each kind of deal, from public/images.
const dealImage: Record<DealKind, string> = {
  solar: 'rooftop-solar', painting: 'interior-painting', waterproofing: 'waterproofing', cooling: 'air-conditioners',
  backup: 'inverters-batteries', pest: 'pest-control', water: 'water-purifiers', heater: 'water-heaters',
  security: 'cctv-security', kitchen: 'modular-kitchen', fans: 'bldc-fans-lights', appliances: 'kitchen-appliances',
  coolroof: 'cool-roof', rainwater: 'rainwater-harvesting', windows: 'upvc-windows', bathroom: 'bathroom-improvements',
  furniture: 'mattresses-sofas', decor: 'blinds-curtains', whitegoods: 'home-appliances',
};
const img = (name: string) => `/images/${name}.jpg`;
const d = (n: number) => ({ '--d': n }) as React.CSSProperties;

export function Home() {
  const { t } = useLang();
  const stats = useStats();
  useReveal();
  const [roundTab, setRoundTab] = useState(0);
  const shownRounds = roundTab ? rounds.filter(r => r.n === roundTab) : rounds;
  const optins = stats?.optins ?? 0;
  const pct = Math.min(100, Math.round((optins / currentRound.target) * 100));
  const seatsTaken = Math.min(site.foundingSeats, stats?.members ?? 0);
  const seatsPct = Math.round((seatsTaken / site.foundingSeats) * 100);
  const seatsLabel = t.plan_seats.replace('{n}', (site.foundingSeats - seatsTaken).toLocaleString('en-IN'));
  const closes = new Date(currentRound.closes).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const solarDeal = deals.find(x => x.kind === 'solar')!;

  return (
    <>
      <Header />
      <main id="main" className="hx">
        {/* Hero: photo behind, Malak Card and a WhatsApp message on the right */}
        <section className="hx-hero">
          <img className="hx-hero-photo" src={img('hero-bungalow')} alt="" fetchPriority="high" />
          <div className="wrap hx-hero-grid">
            <div>
              <p className="overline" data-reveal>{t.hero_over}</p>
              <h1 data-reveal style={d(1)}>{t.hero_title}</h1>
              <p className="hx-hero-line" data-reveal style={d(2)}>{t.h_line}</p>
              <p className="hx-hero-body" data-reveal style={d(2)}>{t.hero_body}</p>
              <div className="hero-ctas" data-reveal style={d(3)}>
                <Link href="/join" className="gm-btn gm-btn-primary">{t.hero_cta} <ArrowRight size={18} /></Link>
                <Link href="/deals" className="gm-btn gm-btn-secondary hx-btn-glass">{t.h_deals}</Link>
              </div>
              <p className="hero-note" data-reveal style={d(4)}><BadgeCheck size={18} /> {t.hero_note}</p>
            </div>
            <div className="hx-hero-side" aria-hidden="true">
              <MalakCard name="Priya Deshmukh" number="GM · 0001 · NGP" label={t.card_member} over={t.card_over} />
              <div className="gm-alert hx-alert">
                <div className="gm-alert-badge"><MessageCircle size={18} /></div>
                <div className="gm-alert-body">
                  <p className="gm-alert-from">Gharmalak <span>· {t.example}</span></p>
                  <p className="gm-alert-text">Round 1: rooftop solar, installed in January. Opt in from 1 Nov. Reply <b>YES</b>.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why: the statement, with the numbers in a card */}
        <section className="hx-section hx-tint">
          <div className="wrap hx-why">
            <div>
              <p className="overline" data-reveal>{t.st_over}</p>
              <h2 className="hx-h2" data-reveal style={d(1)}>{t.st_title}</h2>
              <p className="hx-lead" data-reveal style={d(2)}>{t.st_body}</p>
            </div>
            <div className="hx-stat-card" data-reveal style={d(2)}>
              <div className="hx-stat-top">
                <span className="hx-icon-tile"><BadgePercent /></span>
                <div><span className="hx-stat-big amount"><CountUp to={10} suffix="%" /></span><span className="hx-stat-cap">{t.stat_saving}</span></div>
              </div>
              <div className="hx-stat-row" role="list">
                <div role="listitem"><span className="amount">{stats ? <CountUp to={stats.members} /> : '·'}</span><small>{t.stat_members}</small></div>
                <div role="listitem"><span className="amount">{stats ? <CountUp to={stats.optins} /> : '·'}</span><small>{t.stat_optins}</small></div>
                <div role="listitem"><span className="amount"><CountUp to={solarCities.length} /></span><small>{t.stat_cities}</small></div>
              </div>
            </div>
          </div>
        </section>

        {/* How a round works: four steps with arrows, then the explainer */}
        <section className="hx-section" id="how">
          <div className="wrap">
            <div className="hx-head-row">
              <div>
                <p className="overline" data-reveal>{t.how_over}</p>
                <h2 className="hx-h2" data-reveal style={d(1)}>{t.how_title}</h2>
              </div>
              <a href="#how-video" className="hx-pill" data-reveal style={d(2)}><PlayCircle size={18} /> {t.vid_label} <span>· {t.vid_note}</span></a>
            </div>
            <ol className="hx-steps">
              {([ClipboardList, MessageCircle, Users, ShieldCheck] as const).map((Icon, i) => (
                <li key={i} className={`hx-step ${i === 3 ? 'warn' : ''}`} data-reveal style={d(i + 1)}>
                  <div className="hx-step-top"><span className="hx-icon-tile"><Icon /></span><span className="hx-num">0{i + 1}</span></div>
                  <h3>{t[`step${i + 1}_t` as 'step1_t']}</h3>
                  <p>{t[`step${i + 1}_b` as 'step1_b']}</p>
                  {i < 3 && <span className="hx-step-arrow" aria-hidden="true"><ArrowRight size={14} /></span>}
                </li>
              ))}
            </ol>
            <div id="how-video"><HowVideo /></div>
          </div>
        </section>

        {/* Round 1: photo and the live round card */}
        <section className="hx-section hx-tint">
          <div className="wrap">
            <article className="hx-round" data-reveal>
              <div className="hx-round-photo">
                <img src={img('rooftop-solar')} alt="Rooftop solar panels on a house" loading="lazy" />
                <p className="hx-chip"><Sun size={16} /> {t.hx_chip} · {t.hx_cities.replace('{n}', String(solarCities.length))} <b>{t.hx_subsidy}</b></p>
              </div>
              <div className="hx-round-body">
                <p className="overline">{t.round_over} · {t.r_status_soon}</p>
                <h2 className="hx-h2">{t.round_title}</h2>
                <p className="hx-round-line">{t.r1_line}</p>
                <p className="hx-muted">{t.round_body}</p>
                <dl className="hx-facts">
                  <div><Calendar /><dt>{t.hx_optwin}</dt><dd>{t.hx_optwin_val}</dd></div>
                  <div><IndianRupee /><dt>{t.round_pbt}</dt><dd>{t.round_pbt_val}</dd></div>
                  <div><Percent /><dt>{t.round_saving}</dt><dd>{t.round_saving_val}</dd></div>
                  <div><Users /><dt>{t.hx_group}</dt><dd><span className="amount">{optins}</span> / {currentRound.target} {t.round_homes}</dd></div>
                </dl>
                <div className="meter">
                  <div className="gm-progress" role="progressbar" aria-valuenow={optins} aria-valuemin={0} aria-valuemax={currentRound.target} aria-label={t.round_homes}><span style={{ width: `${Math.max(pct, 2)}%` }} /></div>
                  <div className="meter-row"><span><strong className="amount">{optins}</strong> / {currentRound.target} {t.round_homes}</span><span>{t.round_closes} {closes}</span></div>
                </div>
                <div className="hx-round-cta">
                  <Link href="/round/solar-nagpur" className="gm-btn gm-btn-primary">{t.round_cta} <ArrowRight size={18} /></Link>
                  <small>{t.hx_spend}: {solarDeal.ticket}</small>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* The year ahead: on phones a sliding row of rounds that open; on wider screens tabs and columns */}
        <section className="hx-section">
          <div className="wrap">
            <div className="hx-head-row">
              <div>
                <p className="overline" data-reveal>{t.ahead_over}</p>
                <h2 className="hx-h2" data-reveal style={d(1)}>{t.ahead_title}</h2>
              </div>
              <Link href="/deals" className="hx-pill" data-reveal style={d(2)}>{t.ahead_cta} <ArrowRight size={16} /></Link>
            </div>
            <div className="hx-only-phone"><RoundScroller /></div>
            <div className="hx-only-wide">
              <div className="hx-tabs" role="tablist" aria-label={t.ahead_title}>
                <button role="tab" aria-selected={roundTab === 0} onClick={() => setRoundTab(0)}>{t.hx_all.replace('{n}', String(deals.length))}</button>
                {rounds.map(r => (
                  <button key={r.n} role="tab" aria-selected={roundTab === r.n} onClick={() => setRoundTab(r.n)}>{t.hx_round.replace('{n}', String(r.n))}</button>
                ))}
              </div>
              <div className="hx-rounds">
                {shownRounds.map(r => {
                  const list = deals.filter(x => x.round === r.n);
                  return (
                    <section key={r.n} className="hx-col" aria-label={`${t.hx_round.replace('{n}', String(r.n))}, ${r.install}`}>
                      <header><span>{t.hx_round.replace('{n}', String(r.n))} · {r.install}</span><small>{t.hx_count.replace('{n}', String(list.length))}</small></header>
                      <ul>
                        {list.map(x => (
                          <li key={x.id}>
                            <Link href={`/deals?deal=${x.id}`} className="hx-deal">
                              <img src={img(dealImage[x.kind])} alt="" loading="lazy" />
                              <span><b>{x.title}</b><small>{x.ticket}</small></span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Who it's for: three photo cards */}
        <section className="hx-section hx-tint">
          <div className="wrap">
            <div className="section-head">
              <p className="overline" data-reveal>{t.who_over}</p>
              <h2 className="hx-h2" data-reveal style={d(1)}>{t.who_title}</h2>
            </div>
            <div className="hx-who">
              {(['independent-house', 'apartment-building', 'homeowners'] as const).map((photo, i) => (
                <article key={photo} className="hx-who-card" data-reveal style={d(i + 1)}>
                  <img src={img(photo)} alt="" loading="lazy" />
                  <div>
                    <h3>{t[`who${i + 1}_t` as 'who1_t']}</h3>
                    <p className="hx-who-line">{t[`who${i + 1}_b` as 'who1_b']}</p>
                    <p className="hx-muted">{t[`hx_who${i + 1}_d` as 'hx_who1_d']}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Our promise: full-width band */}
        <section className="hx-promise">
          <div className="wrap">
            <p className="overline" data-reveal>{t.not_over}</p>
            <h2 data-reveal style={d(1)}>{t.not_title}</h2>
            <div className="hx-promise-grid">
              {([[ShieldCheck, 1], [IndianRupee, 2], [Wrench, 3]] as const).map(([Icon, n]) => (
                <div key={n} data-reveal style={d(n)}>
                  <span className="hx-icon-tile"><Icon /></span>
                  <h3>{t[`why${n}_t` as 'why1_t']}</h3>
                  <p>{t[`why${n}_b` as 'why1_b']}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join: card and seats on the left, price on the right */}
        <section className="hx-section" id="join">
          <div className="wrap">
            <p className="overline" data-reveal>{t.join_over}</p>
            <h2 className="hx-h2" data-reveal style={d(1)}>{t.plan_title}</h2>
            <div className="hx-join">
              <div className="hx-join-side" data-reveal>
                <div className="hx-join-card" aria-hidden="true">
                  <MalakCard finish="titanium" name="Rahul Joshi" number="GM · 0002 · NGP" label={t.card_member} over={t.card_over} />
                </div>
                <div className="hx-seats">
                  <div className="meter-row" style={{ marginTop: 0 }}><strong>{seatsLabel}</strong></div>
                  <div className="gm-progress" role="progressbar" aria-valuenow={seatsTaken} aria-valuemin={0} aria-valuemax={site.foundingSeats} aria-label={seatsLabel}><span style={{ width: `${Math.max(seatsPct, 2)}%` }} /></div>
                  <p className="hx-muted">{t.pay_credit}</p>
                </div>
              </div>
              <div className="hx-price" data-reveal style={d(1)}>
                <div className="plan-head"><p className="overline">{t.plan_badge}</p><p className="plan-save"><BadgeCheck size={18} /> {t.plan_save}</p></div>
                <div className="gm-plan-price"><s className="plan-was">{inr(site.regularFee)}</s><span className="gm-amount amount">{inr(site.fee)}</span><span className="gm-plan-per">{t.plan_per}</span></div>
                <ul className="gm-ticks">
                  {[t.plan_t1, t.plan_t2, t.plan_t3, t.plan_t4].map(x => <li key={x}><Check className="gm-icon" size={20} /> {x}</li>)}
                </ul>
                <Link href="/join" className="gm-btn gm-btn-primary gm-btn-block">{t.hero_cta} <ArrowRight size={18} /></Link>
                <p className="plan-note">{t.plan_note}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Questions: two columns */}
        <section className="hx-section hx-tint">
          <div className="wrap">
            <h2 className="hx-h2" style={{ marginBottom: 'var(--space-8)' }}>{t.faq_title}</h2>
            <div className="hx-faq">
              {[5, 1, 2, 3, 4].map((n, i) => (
                <details key={n} open={i === 0}>
                  <summary>{t[`faq${n}_q` as 'faq1_q']} <ChevronDown size={20} /></summary>
                  <p>{t[`faq${n}_a` as 'faq1_a']}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing card */}
        <section className="hx-section">
          <div className="wrap">
            <div className="hx-end" data-reveal>
              <img src={img('final-cta-home')} alt="" loading="lazy" />
              <div>
                <p className="overline">{t.end_over}</p>
                <h2>{t.end_title}</h2>
                <div className="hero-ctas">
                  <Link href="/join" className="gm-btn gm-btn-primary">{t.hero_cta} <ArrowRight size={18} /></Link>
                  <a className="gm-btn gm-btn-secondary" href={waLink('Hi Gharmalak, I want to know more about the club.')} target="_blank" rel="noopener"><MessageCircle size={18} /> {t.hero_wa}</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}

// Rounds slide past on their own (paused on hover, touch or focus, and off for reduced
// motion); tapping a round opens its deals underneath.
function RoundScroller() {
  const { t } = useLang();
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(1);
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  const go = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
      setActive(Math.min(rounds.length - 1, Math.round(el.scrollLeft / (w + 16))));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => el.removeEventListener('scroll', onScroll);
    const timer = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: (el.children[0] as HTMLElement).offsetWidth + 16, behavior: 'smooth' });
    }, 3800);
    return () => { window.clearInterval(timer); el.removeEventListener('scroll', onScroll); };
  }, []);

  const pause = () => { paused.current = true; };
  const openRound = open ? rounds.find(r => r.n === open)! : null;
  const openDeals = open ? deals.filter(x => x.round === open) : [];

  return (
    <div className="hx-scroller" onMouseEnter={pause} onMouseLeave={() => { paused.current = false; }} onTouchStart={pause} onFocus={pause}>
      <div className="hx-scroll-nav">
        <button type="button" aria-label="Previous round" onClick={() => { pause(); go(Math.max(0, active - 1)); }}><ArrowLeft size={18} /></button>
        <div className="hx-dots" aria-hidden="true">{rounds.map((r, i) => <span key={r.n} className={i === active ? 'on' : ''} />)}</div>
        <button type="button" aria-label="Next round" onClick={() => { pause(); go(Math.min(rounds.length - 1, active + 1)); }}><ArrowRight size={18} /></button>
      </div>
      <div className="hx-track" ref={track}>
        {rounds.map(r => {
          const list = deals.filter(x => x.round === r.n);
          const lead = list.find(x => x.tier === 'big') ?? list[0];
          const isOpen = open === r.n;
          return (
            <button key={r.n} type="button" className={`hx-rcard ${isOpen ? 'open' : ''}`} aria-expanded={isOpen} aria-controls="hx-round-panel"
              onClick={() => { pause(); setOpen(isOpen ? null : r.n); }}>
              <img src={img(dealImage[lead.kind])} alt="" loading="lazy" />
              <span className="hx-rcard-shade" />
              <span className="hx-rcard-top"><b>{t.hx_round.replace('{n}', String(r.n))}</b><small>{t.hx_count.replace('{n}', String(list.length))}</small></span>
              <span className="hx-rcard-body">
                <strong>{r.install}</strong>
                <small>{t.hx_optin.replace('{a}', dateLabel(r.optInFrom)).replace('{b}', dateLabel(r.optInTo))}</small>
                <span className="hx-rcard-thumbs">{list.slice(0, 4).map(x => <img key={x.id} src={img(dealImage[x.kind])} alt="" loading="lazy" />)}</span>
                <span className="hx-rcard-cta">{isOpen ? t.hx_close : t.hx_open} <ArrowRight size={16} /></span>
              </span>
            </button>
          );
        })}
      </div>
      <div id="hx-round-panel" className={`hx-panel ${openRound ? 'open' : ''}`} aria-live="polite">
        <div>
          {openRound && (
            <div className="hx-panel-inner" key={openRound.n}>
              <div className="hx-panel-head">
                <p className="overline">{t.hx_round.replace('{n}', String(openRound.n))} · {openRound.install}</p>
                <Link href="/deals" className="hx-pill">{t.ahead_cta} <ArrowRight size={16} /></Link>
              </div>
              <ul className="hx-panel-grid">
                {openDeals.map((x, i) => (
                  <li key={x.id} style={{ '--i': i } as React.CSSProperties}>
                    <Link href={`/deals?deal=${x.id}`} className="hx-dcard">
                      <img src={img(dealImage[x.kind])} alt="" loading="lazy" />
                      <span><b>{x.title}</b><small>{x.ticket}</small><em>{x.why}</em></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
