// Deals calendar. Deals run in rounds, named by when the work is installed:
// members opt in during the two months before, vendors bid on the batch, and
// installation follows. Nothing is installed in the monsoon (June to September);
// those months collect opt-ins for October. Each round leads with big deals (high
// ticket, where the group saving alone covers the membership) and adds quick wins
// (mid ticket, decided in days).
//
// reach says who can run the deal: 'multi' means one national or state-level
// vendor can serve many cities at once; 'local' means a crew in each city, so
// those deals start in Nagpur only.
export type DealKind =
  | 'solar' | 'painting' | 'waterproofing' | 'cooling' | 'backup' | 'pest' | 'water' | 'heater'
  | 'security' | 'kitchen' | 'fans' | 'appliances' | 'coolroof' | 'rainwater' | 'windows'
  | 'bathroom' | 'furniture' | 'decor' | 'whitegoods';

export type DealTier = 'big' | 'quick';
export type DealReach = 'multi' | 'local';

export type Round = {
  n: number;
  optInFrom: string; // YYYY-MM-DD
  optInTo: string; // YYYY-MM-DD
  install: string; // when the work happens
};

export type Deal = {
  id: string;
  round: number;
  tier: DealTier;
  kind: DealKind;
  title: string;
  ticket: string; // typical spend per home
  why: string;
  brands: string;
  reach: DealReach;
  roundHref?: string; // live round page, when there is one
};

// Launch cities: the Maharashtra cities on MSEDCL, so one empanelled solar
// installer can cover them all with the same subsidy and net-metering process.
export const launchCities = ['Nagpur', 'Wardha', 'Amravati', 'Chandrapur', 'Chh. Sambhajinagar', 'Nashik', 'Pune'];
export const laterCities = ['Mumbai', 'Ahmedabad', 'Surat', 'Vadodara', 'Indore', 'Bhopal', 'Raipur', 'Jaipur', 'Lucknow'];
export const dealCities = [...launchCities, ...laterCities, 'Other'];

// City centres, used on the visitor's own device to find the nearest city.
// Coordinates never leave the browser.
export const cityCentres: Record<string, [number, number]> = {
  Nagpur: [21.1458, 79.0882], Wardha: [20.7453, 78.6022], Amravati: [20.9374, 77.7796], Chandrapur: [19.9615, 79.2961],
  'Chh. Sambhajinagar': [19.8762, 75.3433], Nashik: [19.9975, 73.7898], Pune: [18.5204, 73.8567],
  Mumbai: [19.076, 72.8777], Ahmedabad: [23.0225, 72.5714], Surat: [21.1702, 72.8311], Vadodara: [22.3072, 73.1812],
  Indore: [22.7196, 75.8577], Bhopal: [23.2599, 77.4126], Raipur: [21.2514, 81.6296], Jaipur: [26.9124, 75.7873], Lucknow: [26.8467, 80.9462],
};

export function nearestCity(lat: number, lng: number): { city: string; km: number } {
  const rad = (d: number) => (d * Math.PI) / 180;
  let best = { city: 'Other', km: Infinity };
  for (const [city, [clat, clng]] of Object.entries(cityCentres)) {
    const a = Math.sin(rad(clat - lat) / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(clat)) * Math.sin(rad(clng - lng) / 2) ** 2;
    const km = 6371 * 2 * Math.asin(Math.sqrt(a));
    if (km < best.km) best = { city, km };
  }
  return best.km <= 80 ? best : { city: 'Other', km: best.km };
}

export const rounds: Round[] = [
  { n: 1, optInFrom: '2026-11-01', optInTo: '2026-12-31', install: 'January–February 2027' },
  { n: 2, optInFrom: '2027-01-01', optInTo: '2027-02-28', install: 'March–April 2027' },
  { n: 3, optInFrom: '2027-03-01', optInTo: '2027-04-30', install: 'May 2027, before the monsoon' },
  { n: 4, optInFrom: '2027-06-01', optInTo: '2027-09-15', install: 'October–November 2027' },
  { n: 5, optInFrom: '2027-10-01', optInTo: '2027-11-30', install: 'December 2027–January 2028' },
];

export const tierLabel: Record<DealTier, string> = { big: 'Big deal', quick: 'Quick win' };
export const reachLabel: Record<DealReach, string> = { multi: 'One vendor, many cities', local: 'Local crew, Nagpur first' };

const SOLAR = 'PM Surya Ghar-empanelled installers (Tata Power Solar, Waaree, Adani Solar)';

export const deals: Deal[] = [
  { id: 'd-2026-11-solar', round: 1, tier: 'big', kind: 'solar', title: 'Rooftop solar, 3 kW', ticket: '₹1.5–2.2 lakh before subsidy', why: 'Installed in January–February, so it runs before summer bills peak. PM Surya Ghar subsidy applies.', brands: SOLAR, reach: 'multi', roundHref: '/round/solar-nagpur' },
  { id: 'r1-painting', round: 1, tier: 'big', kind: 'painting', title: 'Interior painting', ticket: '₹40,000–1.5 lakh', why: 'Dry weather and quick drying; crews are free after the festive rush.', brands: 'Asian Paints, Berger, Nerolac certified crews', reach: 'local' },
  { id: 'r1-heater', round: 1, tier: 'quick', kind: 'heater', title: 'Solar and electric water heaters', ticket: '₹8,000–30,000', why: 'For winter mornings; a solar heater pays back in about 3 years.', brands: 'Racold, V-Guard, Supreme Solar', reach: 'multi' },
  { id: 'r1-security', round: 1, tier: 'quick', kind: 'security', title: 'CCTV, video doorbells and smart locks', ticket: '₹8,000–30,000', why: 'Peace of mind while you travel for holidays and weddings.', brands: 'CP Plus, Godrej, Qubo dealers', reach: 'multi' },

  { id: 'r2-solar', round: 2, tier: 'big', kind: 'solar', title: 'Rooftop solar, round 2', ticket: '₹1.5–2.2 lakh before subsidy', why: 'Installed by April, in time for the strongest sun and the highest bills.', brands: SOLAR, reach: 'multi' },
  { id: 'r2-cooling', round: 2, tier: 'big', kind: 'cooling', title: 'Air conditioners with installation', ticket: '₹35,000–1 lakh', why: 'Fitted before the 45°C weeks, when prices and waiting times go up.', brands: 'Voltas, Blue Star, Daikin dealers', reach: 'multi' },
  { id: 'r2-bathroom', round: 2, tier: 'big', kind: 'bathroom', title: 'Bathroom makeover with leak-proofing', ticket: '₹1–3 lakh', why: 'Fix seepage in the dry months, well before the rains.', brands: 'Local crews with Jaquar, Cera and Hindware fittings', reach: 'local' },
  { id: 'r2-backup', round: 2, tier: 'quick', kind: 'backup', title: 'Inverters and batteries', ticket: '₹15,000–45,000', why: 'Ready for summer load cuts; replace batteries older than 3 years.', brands: 'Luminous, Exide, Microtek', reach: 'multi' },
  { id: 'r2-fans', round: 2, tier: 'quick', kind: 'fans', title: 'Energy-saving BLDC fans and LED lights', ticket: '₹10,000–40,000 for a home', why: 'BLDC fans use about half the power; swap them before fan season.', brands: 'Atomberg, Havells, Crompton', reach: 'multi' },
  { id: 'r2-coolroof', round: 2, tier: 'quick', kind: 'coolroof', title: 'Cool-roof coating for top floors', ticket: '₹15,000–40,000', why: 'A white heat-reflective coat makes top-floor rooms noticeably cooler.', brands: 'Dr. Fixit, Asian Paints SmartCare applicators', reach: 'local' },

  { id: 'r3-waterproofing', round: 3, tier: 'big', kind: 'waterproofing', title: 'Terrace and wall waterproofing', ticket: '₹30,000–1.5 lakh', why: 'Done in May, the last dry month, before the first rain.', brands: 'Dr. Fixit, Asian Paints SmartCare applicators', reach: 'local' },
  { id: 'r3-windows', round: 3, tier: 'big', kind: 'windows', title: 'uPVC windows and mesh doors', ticket: '₹80,000–2.5 lakh', why: 'Fitted before the monsoon to keep out leaks, dust and mosquitoes.', brands: 'State-level fabricators using Fenesta and Encraft profiles', reach: 'multi' },
  { id: 'r3-rainwater', round: 3, tier: 'quick', kind: 'rainwater', title: 'Rainwater harvesting', ticket: '₹15,000–50,000', why: 'Ready to catch the first rain; refills borewells and cuts tanker bills.', brands: 'Local RWH contractors', reach: 'local' },
  { id: 'r3-pest', round: 3, tier: 'quick', kind: 'pest', title: 'Anti-termite and pest control', ticket: '₹3,000–15,000', why: 'Treat before the monsoon, when termites and mosquitoes spread.', brands: 'HiCare, Rentokil PCI', reach: 'multi' },

  { id: 'r4-solar', round: 4, tier: 'big', kind: 'solar', title: 'Rooftop solar, festive round', ticket: '₹1.5–2.2 lakh before subsidy', why: 'Clear skies after the monsoon; running before winter.', brands: SOLAR, reach: 'multi' },
  { id: 'r4-painting', round: 4, tier: 'big', kind: 'painting', title: 'Festive painting, inside and out', ticket: '₹60,000–2 lakh', why: 'Fresh walls for Diwali, once the walls have dried after the rains.', brands: 'Asian Paints, Berger, Nerolac certified crews', reach: 'local' },
  { id: 'r4-kitchen', round: 4, tier: 'big', kind: 'kitchen', title: 'Modular kitchens and wardrobes', ticket: '₹1.5–4 lakh', why: 'Measured in September, fitted before Diwali.', brands: 'State-level modular makers using Hettich and Hafele fittings', reach: 'multi' },
  { id: 'r4-appliances', round: 4, tier: 'quick', kind: 'appliances', title: 'Chimneys, hobs and dishwashers', ticket: '₹15,000–50,000', why: 'Festive offers, made better by buying as a group.', brands: 'Elica, Faber, Bosch dealers', reach: 'multi' },
  { id: 'r4-whitegoods', round: 4, tier: 'quick', kind: 'whitegoods', title: 'Fridges and washing machines', ticket: '₹25,000–60,000', why: 'Diwali prices, made better by buying as a group.', brands: 'LG, Samsung, Whirlpool, Godrej dealers', reach: 'multi' },
  { id: 'r4-water', round: 4, tier: 'quick', kind: 'water', title: 'Water purifiers and tank cleaning', ticket: '₹8,000–25,000', why: 'Clean tanks and new filters after the monsoon.', brands: 'Kent, Aquaguard, Livpure', reach: 'multi' },
  { id: 'r4-decor', round: 4, tier: 'quick', kind: 'decor', title: 'Blinds, curtains and lighting', ticket: '₹15,000–50,000', why: 'Finish the festive look once the painting is done.', brands: 'Local furnishers and lighting dealers', reach: 'local' },

  { id: 'r5-solar', round: 5, tier: 'big', kind: 'solar', title: 'Rooftop solar, winter round', ticket: '₹1.5–2.2 lakh before subsidy', why: 'Installed in the cool, dry months, ready for next summer.', brands: SOLAR, reach: 'multi' },
  { id: 'r5-furniture', round: 5, tier: 'quick', kind: 'furniture', title: 'Mattresses, sofas and beds', ticket: '₹15,000–60,000', why: 'Year-end offers, made better by buying as a group.', brands: 'Sleepwell, Wakefit, Godrej Interio dealers', reach: 'multi' },
];

export const dealIds = deals.map(d => d.id);

export function roundOf(d: Deal) {
  return rounds.find(r => r.n === d.round)!;
}

// Which cities a deal runs in at launch.
export function dealRunsIn(d: Deal, city: string) {
  return d.reach === 'multi' ? launchCities.includes(city) : city === 'Nagpur';
}

export function dateLabel(iso: string) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
