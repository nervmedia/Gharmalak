'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BellRing, Check, Lock, Trash2 } from 'lucide-react';
import { kindLabel, nextDue, reminderKinds, repeatLabel, repeats, type ReminderKind, type Repeat } from '@/lib/reminders';
import { inr, site } from '@/lib/config';

type Draft = { dueDate: string; repeat: Repeat };
type Saved = { id: string; kind: string; dueDate: string; repeat: Repeat; token: string };

const STORE = 'gm_reminders';
const readSaved = (): Saved[] => { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } };
const writeSaved = (list: Saved[]) => { try { localStorage.setItem(STORE, JSON.stringify(list)); } catch {} };
const pretty = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function MyHomeView() {
  const [picked, setPicked] = useState<Partial<Record<ReminderKind, Draft>>>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [remindDays, setRemindDays] = useState<3 | 7>(3);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [member, setMember] = useState<boolean | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setSaved(readSaved());
    try { const p = localStorage.getItem('gm_phone'); if (p) setPhone(p); } catch {}
  }, []);

  const toggle = (k: ReminderKind, repeat: Repeat) => setPicked(p => {
    const next = { ...p };
    if (next[k]) delete next[k]; else next[k] = { dueDate: '', repeat };
    return next;
  });
  const setDraft = (k: ReminderKind, patch: Partial<Draft>) => setPicked(p => ({ ...p, [k]: { ...p[k]!, ...patch } }));
  const digits = phone.replace(/\D/g, '').slice(-10);
  const pickedKinds = reminderKinds.filter(k => picked[k.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!pickedKinds.length) err.kinds = 'Tap at least one reminder above.';
    for (const k of pickedKinds) {
      const dft = picked[k.id]!;
      if (!dft.dueDate) err['d_' + k.id] = 'Pick the next due date.';
      else if (dft.repeat === 'none' && dft.dueDate < today) err['d_' + k.id] = 'This date has passed.';
    }
    if (name.trim().length < 2) err.name = 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(digits)) err.phone = 'Enter a 10-digit WhatsApp number.';
    if (!consent) err.consent = 'Please agree so we can remind you on WhatsApp.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: digits, remindDays, consent, items: pickedKinds.map(k => ({ kind: k.id, ...picked[k.id] })) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      const list = [...readSaved(), ...d.items.map((x: Omit<Saved, 'token'>) => ({ ...x, token: d.token }))];
      writeSaved(list);
      setSaved(list);
      setMember(d.member);
      setPicked({});
      try { localStorage.setItem('gm_phone', digits); } catch {}
    } catch {
      setErrors({ server: 'Something went wrong. Please try again, or message us on WhatsApp.' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(r: Saved) {
    const res = await fetch('/api/reminders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id, token: r.token }) }).catch(() => null);
    if (res && (res.ok || res.status === 404)) {
      const list = readSaved().filter(x => x.id !== r.id);
      writeSaved(list);
      setSaved(list);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="overline">My home · Free during launch</p>
          <h1>Never miss a <em>home bill</em> again.</h1>
          <p className="hero-line">Add your due dates once. We remind you on WhatsApp a few days before.</p>
          <p className="hero-note"><Lock size={18} /> Dates only. No amounts, account or consumer numbers. Delete anytime. Never sold.</p>
        </div>
      </section>

      {saved.length > 0 && (
        <section className="section" style={{ paddingTop: 0, borderTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 760 }}>
            <div className="panel stack">
              <p className="overline">On this phone</p>
              <h2 style={{ fontSize: 22, margin: 0 }}>Your reminders</h2>
              {member === false && <p className="muted" style={{ margin: 0 }}>Saved. Members also get club rates on services like AC, RO and pest control: {inr(site.fee)} for the first year if you join by 31 December. <Link href="/join" className="deal-link">Join the club <ArrowRight size={14} /></Link></p>}
              <ul className="rem-list">
                {saved.map(r => {
                  const due = nextDue(r.dueDate, r.repeat, today);
                  const deal = reminderKinds.find(k => k.id === r.kind)?.dealId;
                  return (
                    <li key={r.id} className="rem-row">
                      <BellRing size={18} />
                      <div className="rem-main">
                        <strong>{kindLabel(r.kind)}</strong>
                        <span className="muted">{due ? `Next: ${pretty(due)}` : 'Done'} · {repeatLabel[r.repeat]}</span>
                        {deal && <Link href={`/deals?deal=${deal}`} className="deal-link">Club deal for this <ArrowRight size={14} /></Link>}
                      </div>
                      <button type="button" className="gm-btn gm-btn-ghost" onClick={() => remove(r)} aria-label={`Delete ${kindLabel(r.kind)} reminder`}><Trash2 size={16} /></button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="section" style={saved.length ? undefined : { paddingTop: 0, borderTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <form className="panel form" onSubmit={submit} noValidate>
            <div>
              <h2 style={{ fontSize: 22 }}>What should we remind you about?</h2>
              <p className="muted">Tap the ones you need, then pick the next due date.</p>
              {errors.kinds && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.kinds}</p>}
            </div>
            <div className="gm-chips">
              {reminderKinds.map(k => (
                <button key={k.id} type="button" className="gm-chip" aria-pressed={!!picked[k.id]} onClick={() => toggle(k.id, k.repeat)}>
                  {picked[k.id] && <Check size={14} />} {k.label}
                </button>
              ))}
            </div>
            {pickedKinds.map(k => (
              <div key={k.id} className={`rem-edit ${errors['d_' + k.id] ? 'gm-field-error' : ''}`}>
                <span className="rem-edit-label">{k.label}</span>
                <label className="sr-only" htmlFor={'due_' + k.id}>{k.label}: next due date</label>
                <div className="gm-input-wrap"><input id={'due_' + k.id} type="date" className="gm-input" min={k.repeat === 'none' ? today : undefined} value={picked[k.id]!.dueDate} onChange={e => setDraft(k.id, { dueDate: e.target.value })} /></div>
                <label className="sr-only" htmlFor={'rep_' + k.id}>{k.label}: repeats</label>
                <div className="gm-input-wrap"><select id={'rep_' + k.id} className="gm-input" value={picked[k.id]!.repeat} onChange={e => setDraft(k.id, { repeat: e.target.value as Repeat })}>
                  {repeats.map(r => <option key={r} value={r}>{repeatLabel[r]}</option>)}
                </select></div>
                {errors['d_' + k.id] && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors['d_' + k.id]}</p>}
              </div>
            ))}
            <fieldset className="gm-field plain-fieldset">
              <legend className="gm-label">Remind me</legend>
              <div className="gm-chips">
                {([3, 7] as const).map(n => <button key={n} type="button" className="gm-chip" aria-pressed={remindDays === n} onClick={() => setRemindDays(n)}>{n} days before</button>)}
              </div>
            </fieldset>
            <div className={`gm-field ${errors.name ? 'gm-field-error' : ''}`}>
              <label className="gm-label" htmlFor="rname">Your name</label>
              <div className="gm-input-wrap"><input id="rname" className="gm-input" autoComplete="name" value={name} onChange={e => setName(e.target.value.slice(0, 120))} aria-invalid={!!errors.name} /></div>
              {errors.name && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.name}</p>}
            </div>
            <div className={`gm-field ${errors.phone ? 'gm-field-error' : ''}`}>
              <label className="gm-label" htmlFor="rphone">WhatsApp number</label>
              <div className="gm-input-wrap"><span className="gm-input-prefix">+91</span><input id="rphone" className="gm-input" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.slice(0, 14))} aria-invalid={!!errors.phone} /></div>
              {errors.phone && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.phone}</p>}
            </div>
            <label className="check">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>Send me these reminders on WhatsApp. I can reply STOP anytime. Gharmalak keeps only these dates and never sells them (<Link href="/privacy">privacy</Link>).</span>
            </label>
            {errors.consent && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.consent}</p>}
            {errors.server && <p className="gm-error"><AlertCircle className="gm-icon" /> {errors.server}</p>}
            <button type="submit" className="gm-btn gm-btn-primary gm-btn-block" disabled={busy}>{busy ? 'Saving…' : 'Save my reminders'}</button>
          </form>
        </div>
      </section>
    </>
  );
}
