// Home reminders: the due dates a homeowner wants a WhatsApp nudge for. We keep
// only the kind of bill, its date and how often it repeats: no amounts, account
// or consumer numbers, so there is nothing sensitive to leak or misuse.
export type ReminderKind =
  | 'property_tax' | 'electricity' | 'society' | 'water_bill' | 'insurance'
  | 'ac_service' | 'ro_filter' | 'pest' | 'tank' | 'warranty';

export type Repeat = 'none' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export const reminderKinds: { id: ReminderKind; label: string; repeat: Repeat; dealId?: string }[] = [
  { id: 'property_tax', label: 'Property tax', repeat: 'yearly' },
  { id: 'electricity', label: 'Electricity bill', repeat: 'monthly' },
  { id: 'society', label: 'Society maintenance', repeat: 'monthly' },
  { id: 'water_bill', label: 'Water bill', repeat: 'quarterly' },
  { id: 'insurance', label: 'Home insurance renewal', repeat: 'yearly' },
  { id: 'ac_service', label: 'AC service', repeat: 'half-yearly', dealId: 'r2-cooling' },
  { id: 'ro_filter', label: 'RO filter change', repeat: 'half-yearly', dealId: 'r4-water' },
  { id: 'pest', label: 'Pest control', repeat: 'yearly', dealId: 'r3-pest' },
  { id: 'tank', label: 'Water tank cleaning', repeat: 'half-yearly', dealId: 'r4-water' },
  { id: 'warranty', label: 'Warranty expiry', repeat: 'none' },
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
