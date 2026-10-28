// Deals calendar for the next 12 months. Weather drives the order: solar before
// summer, cooling and backup for the heat, waterproofing and pest control around
// the monsoon, painting before Navratri and Diwali.
export type DealKind = 'solar' | 'painting' | 'waterproofing' | 'cooling' | 'backup' | 'pest' | 'water' | 'heater';

export type Deal = {
  id: string;
  month: string; // YYYY-MM when the round runs
  kind: DealKind;
  title: string;
  why: string;
  brands: string;
  roundHref?: string; // live round page, when there is one
};

export const deals: Deal[] = [
  { id: 'd-2026-11-solar', month: '2026-11', kind: 'solar', title: 'Rooftop solar, 3 kW', why: 'Install before summer bills peak; PM Surya Ghar subsidy applies.', brands: 'Tata Power Solar, Waaree, Adani Solar installers', roundHref: '/round/solar-nagpur' },
  { id: 'd-2026-12-heater', month: '2026-12', kind: 'heater', title: 'Solar and electric water heaters', why: 'Winter mornings; a solar heater pays back in about 3 years.', brands: 'Racold, V-Guard, Supreme Solar' },
  { id: 'd-2027-01-painting', month: '2027-01', kind: 'painting', title: 'Interior painting', why: 'Dry weather, quick drying, crews free after the festive rush.', brands: 'Asian Paints, Berger, Nerolac certified crews' },
  { id: 'd-2027-02-solar', month: '2027-02', kind: 'solar', title: 'Rooftop solar, round 2', why: 'Last window to go live before April heat.', brands: 'Tata Power Solar, Waaree, Adani Solar installers' },
  { id: 'd-2027-03-cooling', month: '2027-03', kind: 'cooling', title: 'ACs, coolers and servicing', why: 'Buy and service before the 45°C weeks.', brands: 'Voltas, Blue Star, Daikin dealers' },
  { id: 'd-2027-04-backup', month: '2027-04', kind: 'backup', title: 'Inverters and batteries', why: 'Summer load cuts; replace batteries older than 3 years.', brands: 'Luminous, Exide, Microtek' },
  { id: 'd-2027-05-waterproofing', month: '2027-05', kind: 'waterproofing', title: 'Terrace and wall waterproofing', why: 'Fix cracks before the first monsoon rain.', brands: 'Dr. Fixit, Asian Paints SmartCare applicators' },
  { id: 'd-2027-06-pest', month: '2027-06', kind: 'pest', title: 'Termite and pest control', why: 'Monsoon is when termites and mosquitoes spread.', brands: 'HiCare, Rentokil PCI' },
  { id: 'd-2027-07-water', month: '2027-07', kind: 'water', title: 'Water purifiers and tank cleaning', why: 'Monsoon water needs better filtering.', brands: 'Kent, Aquaguard, Livpure' },
  { id: 'd-2027-08-painting', month: '2027-08', kind: 'painting', title: 'Exterior painting, early booking', why: 'Book crews now for after the rains, ahead of Navratri.', brands: 'Asian Paints, Berger, Nerolac certified crews' },
  { id: 'd-2027-09-painting', month: '2027-09', kind: 'painting', title: 'Festive painting', why: 'Fresh walls for Navratri and Diwali.', brands: 'Asian Paints, Berger, Nerolac certified crews' },
  { id: 'd-2027-10-solar', month: '2027-10', kind: 'solar', title: 'Rooftop solar, festive round', why: 'Clear skies after the monsoon; ready before winter.', brands: 'Tata Power Solar, Waaree, Adani Solar installers' },
];

export const dealIds = deals.map(d => d.id);

export const dealCities = ['Nagpur', 'Pune', 'Nashik', 'Indore', 'Ahmedabad', 'Other'];

export function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
