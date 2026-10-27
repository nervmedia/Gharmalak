'use client';
import Link from 'next/link';
import { Sun, ShieldCheck, Tag, FileText, BadgeCheck, Check, MessageCircle, ChevronDown, Clock, ArrowRight } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { StickyCta } from './StickyCta';
import { MalakCard } from './MalakCard';
import { useLang } from './LangProvider';
import { useStats } from './useStats';
import { currentRound, inr, site, waLink } from '@/lib/config';

export function Home() {
  const { t } = useLang();
  const stats = useStats();
  const optins = stats?.optins ?? 0;
  const pct = Math.min(100, Math.round((optins / currentRound.target) * 100));
  const closes = new Date(currentRound.closes).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <>
      <Header />
      <main id="main">
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div>
                <p className="overline">{t.hero_over}</p>
                <h1>{t.hero_title}</h1>
                <p className="hero-body">{t.hero_body}</p>
                <div className="hero-ctas">
                  <Link href="/join" className="gm-btn gm-btn-primary">{t.hero_cta} <ArrowRight size={18} /></Link>
                  <a className="gm-btn gm-btn-secondary" href={waLink('Hi Gharmalak, I want to know more about the club.')} target="_blank" rel="noopener"><MessageCircle size={18} /> {t.hero_wa}</a>
                </div>
                <p className="hero-note"><BadgeCheck size={18} /> {t.hero_note}</p>
              </div>
              <div className="card-stage" aria-hidden="true">
                <MalakCard className="back" name=" " number=" " label=" " over=" " />
                <MalakCard name="Priya Deshmukh" number="GM · 0001 · NGP" label={t.card_member} over={t.card_over} />
                <div className="gm-alert float">
                  <div className="gm-alert-badge"><MessageCircle size={18} /></div>
                  <div className="gm-alert-body">
                    <p className="gm-alert-from">Gharmalak <span>{t.example}</span></p>
                    <p className="gm-alert-text">Round 1: rooftop solar opens 18 Nov.{'\n'}Reply YES to opt in.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="stats" role="list">
              <div className="stat" role="listitem"><span className="amount">{stats ? stats.members.toLocaleString('en-IN') : '·'}</span><span>{t.stat_members}</span></div>
              <div className="stat" role="listitem"><span className="amount">{stats ? stats.optins.toLocaleString('en-IN') : '·'}</span><span>{t.stat_optins}</span></div>
              <div className="stat" role="listitem"><span className="amount">{currentRound.target}</span><span>{t.stat_target}</span></div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="wrap">
            <div className="section-head">
              <p className="overline">{t.how_over}</p>
              <h2>{t.how_title}</h2>
            </div>
            <div className="how-grid">
              {[1, 2, 3, 4].map(n => (
                <article key={n} className={`how-card ${n === 4 ? 'warn' : ''}`}>
                  <span className="how-num">0{n}</span>
                  <h3>{t[`step${n}_t` as 'step1_t']}</h3>
                  <p>{t[`step${n}_b` as 'step1_b']}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap round-grid">
            <div>
              <p className="overline">{t.round_over}</p>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <h2>{t.round_title}</h2>
                <p>{t.round_body}</p>
              </div>
              <div className="hero-ctas">
                <Link href="/round/solar-nagpur" className="gm-btn gm-btn-secondary">{t.round_cta} <ArrowRight size={18} /></Link>
              </div>
            </div>
            <article className="gm-deal">
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

        <section className="section">
          <div className="wrap">
            <div className="section-head"><p className="overline">{t.why_over}</p></div>
            <div className="why-grid">
              <div className="why"><div className="why-icon"><ShieldCheck /></div><div><h3>{t.why1_t}</h3><p>{t.why1_b}</p></div></div>
              <div className="why"><div className="why-icon"><Tag /></div><div><h3>{t.why2_t}</h3><p>{t.why2_b}</p></div></div>
              <div className="why"><div className="why-icon"><BadgeCheck /></div><div><h3>{t.why3_t}</h3><p>{t.why3_b}</p></div></div>
              <div className="why"><div className="why-icon"><FileText /></div><div><h3>{t.why4_t}<span className="soon">Soon</span></h3><p>{t.why4_b}</p></div></div>
            </div>
          </div>
        </section>

        <section className="section" id="join">
          <div className="wrap plan-wrap">
            <div className="gm-plan">
              <p className="overline">{t.plan_title}</p>
              <div className="gm-plan-price"><span className="gm-amount amount">{inr(site.fee)}</span><span className="gm-plan-per">{t.plan_per}</span></div>
              <ul className="gm-ticks">
                {[t.plan_t1, t.plan_t2, t.plan_t3, t.plan_t4].map(x => <li key={x}><Check className="gm-icon" size={20} /> {x}</li>)}
              </ul>
              <Link href="/join" className="gm-btn gm-btn-primary gm-btn-block">{t.hero_cta}</Link>
            </div>
            <div>
              <h2 style={{ fontSize: 28, marginBottom: 16 }}>{t.faq_title}</h2>
              <div className="faq">
                {[1, 2, 3, 4].map(n => (
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
            <p className="overline">{t.hero_over}</p>
            <h2>{t.hero_title}</h2>
            <div className="hero-ctas">
              <Link href="/join" className="gm-btn gm-btn-primary">{t.hero_cta}</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
