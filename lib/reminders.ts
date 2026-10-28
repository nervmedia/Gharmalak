// Home-care reminders: only the upkeep jobs a club deal can do better, so every
// reminder leads to a club rate. Plain bill reminders (electricity, tax, society)
// are left to payment apps. We keep only the kind, its date and how often it
// repeats: no amounts, account or consumer numbers, so nothing sensitive to leak.
export type ReminderKind = 'ac_service' | 'ro_filter' | 'pest' | 'tank' | 'waterproofing' | 'battery';

export type Repeat = 'none' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export const reminderKinds: { id: ReminderKind; label: string; repeat: Repeat; dealId: string }[] = [
  { id: 'ac_service', label: 'AC service', repeat: 'half-yearly', dealId: 'r2-cooling' },
  { id: 'ro_filter', label: 'RO filter change', repeat: 'half-yearly', dealId: 'r4-water' },
  { id: 'tank', label: 'Water tank cleaning', repeat: 'half-yearly', dealId: 'r4-water' },
  { id: 'pest', label: 'Pest and termite control', repeat: 'yearly', dealId: 'r3-pest' },
  { id: 'waterproofing', label: 'Terrace leak check before the rains', repeat: 'yearly', dealId: 'r3-waterproofing' },
  { id: 'battery', label: 'Inverter battery check', repeat: 'yearly', dealId: 'r2-backup' },
];

export const repeatLabel: Record<Repeat, string> = {
  none: 'Once', monthly: 'Every month', quarterly: 'Every 3 months', 'half-yearly': 'Every 6 months', yearly: 'Every year',
};

const repeatMonths: Record<Repeat, number> = { none: 0, monthly: 1, quarterly: 3, 'half-yearly': 6, yearly: 12 };

export const kindIds = reminderKinds.map(k => k.id);
export const repeats = Object.keys(repeatLabel) as Repeat[];

export function kindLabel(id: string) {
  return reminderKinds.find(k => k.id === id)?.label ?? id;
}

// The next due date on or after `today`, rolling a repeating date forward.
// Returns null when a one-off date has passed.
export function nextDue(dueDate: string, repeat: Repeat, today: string): string | null {
  let d = new Date(dueDate + 'T00:00:00Z');
  const t = new Date(today + 'T00:00:00Z');
  const step = repeatMonths[repeat];
  if (!step) return d >= t ? dueDate : null;
  const day = d.getUTCDate();
  for (let i = 0; d < t && i < 600; i++) {
    const n = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + step, 1));
    const last = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 0)).getUTCDate();
    d = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), Math.min(day, last)));
  }
  return d.toISOString().slice(0, 10);
}
