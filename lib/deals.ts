// Deals calendar for the next 12 months. Each month has one big deal (high ticket,
// where the group saving alone covers the membership) and one quick win (mid ticket,
// decided in days, so people join this month). Weather drives the order: solar
// before summer, cooling and backup for the heat, waterproofing and pest control
// around the monsoon, painting before Navratri and Diwali.
//
// reach says who can run the deal: 'multi' means one national or state-level
// vendor can serve many cities at once; 'local' means a crew in each city.
export type DealKind =
  | 'solar' | 'painting' | 'waterproofing' | 'cooling' | 'backup' | 'pest' | 'water' | 'heater'
  | 'security' | 'kitchen' | 'fans' | 'appliances' | 'coolroof' | 'rainwater' | 'windows'
  | 'bathroom' | 'furniture' | 'decor' | 'whitegoods';

export type DealTier = 'big' | 'quick';
export type DealReach = 'multi' | 'local';

export type Deal = {
  id: string;
  month: string; // YYYY-MM when the round runs
  tier: DealTier;
  kind: DealKind;
  title: string;
  ticket: string; // typical spend per home
  why: string;
  brands: string;
  reach: DealReach;
  roundHref?: string; // live round page, when there is one
};

export const tierLabel: Record<DealTier, string> = { big: 'Big deal', quick: 'Quick win' };
export const reachLabel: Record<DealReach, string> = { multi: 'One vendor, many cities', local: 'Local crew per city' };

export const deals: Deal[] = [
  { id: 'd-2026-11-solar', month: '2026-11', tier: 'big', kind: 'solar', title: 'Rooftop solar, 3 kW', ticket: '₹1.5–2.2 lakh before subsidy', why: 'Install before summer bills peak; PM Surya Ghar subsidy applies.', brands: 'Tata Power Solar, Waaree, Adani Solar installers', reach: 'multi', roundHref: '/round/solar-nagpur' },
  { id: 'd-2026-11-security', month: '2026-11', tier: 'quick', kind: 'security', title: 'CCTV, video doorbells and smart locks', ticket: '₹8,000–30,000', why: 'Peace of mind before winter holidays and wedding travel.', brands: 'CP Plus, Godrej, Qubo dealers', reach: 'multi' },

  { id: 'd-2026-12-kitchen', month: '2026-12', tier: 'big', kind: 'kitchen', title: 'Modular kitchens and wardrobes', ticket: '₹1.5–4 lakh', why: 'Year-end factory prices; measured in December, fitted in January.', brands: 'State-level modular makers using Hettich and Hafele fittings', reach: 'multi' },
  { id: 'd-2026-12-heater', month: '2026-12', tier: 'quick', kind: 'heater', title: 'Solar and electric water heaters', ticket: '₹8,000–30,000', why: 'Winter mornings; a solar heater pays back in about 3 years.', brands: 'Racold, V-Guard, Supreme Solar', reach: 'multi' },

  { id: 'd-2027-01-painting', month: '2027-01', tier: 'big', kind: 'painting', title: 'Interior painting', ticket: '₹40,000–1.5 lakh', why: 'Dry weather, quick drying, crews free after the festive rush.', brands: 'Asian Paints, Berger, Nerolac certified crews', reach: 'local' },
  { id: 'd-2027-01-fans', month: '2027-01', tier: 'quick', kind: 'fans', title: 'Energy-saving BLDC fans and LED lights', ticket: '₹10,000–40,000 for a home', why: 'BLDC fans use about half the power; swap them before fan season.', brands: 'Atomberg, Havells, Crompton', reach: 'multi' },

  { id: 'd-2027-02-solar', month: '2027-02', tier: 'big', kind: 'solar', title: 'Rooftop solar, round 2', ticket: '₹1.5–2.2 lakh before subsidy', why: 'Last window to go live before April heat.', brands: 'Tata Power Solar, Waaree, Adani Solar installers', reach: 'multi' },
  { id: 'd-2027-02-appliances', month: '2027-02', tier: 'quick', kind: 'appliances', title: 'Chimneys, hobs and dishwashers', ticket: '₹15,000–50,000', why: 'Financial-year-end offers; pairs with December kitchens.', brands: 'Elica, Faber, Bosch dealers', reach: 'multi' },

  { id: 'd-2027-03-cooling', month: '2027-03', tier: 'big', kind: 'cooling', title: 'Air conditioners with installation', ticket: '₹35,000–1 lakh', why: 'Buy before the 45°C weeks, when prices and waiting times go up.', brands: 'Voltas, Blue Star, Daikin dealers', reach: 'multi' },
  { id: 'd-2027-03-coolroof', month: '2027-03', tier: 'quick', kind: 'coolroof', title: 'Cool-roof coating for top floors', ticket: '₹15,000–40,000', why: 'A white heat-reflective coat makes top-floor rooms noticeably cooler.', brands: 'Dr. Fixit, Asian Paints SmartCare applicators', reach: 'local' },

  { id: 'd-2027-04-solar', month: '2027-04', tier: 'big', kind: 'solar', title: 'Rooftop solar, summer round', ticket: '₹1.5–2.2 lakh before subsidy', why: 'Strongest sun of the year; the first bill shows the saving.', brands: 'Tata Power Solar, Waaree, Adani Solar installers', reach: 'multi' },
  { id: 'd-2027-04-backup', month: '2027-04', tier: 'quick', kind: 'backup', title: 'Inverters and batteries', ticket: '₹15,000–45,000', why: 'Summer load cuts; replace batteries older than 3 years.', brands: 'Luminous, Exide, Microtek', reach: 'multi' },

  { id: 'd-2027-05-waterproofing', month: '2027-05', tier: 'big', kind: 'waterproofing', title: 'Terrace and wall waterproofing', ticket: '₹30,000–1.5 lakh', why: 'Fix cracks before the first monsoon rain.', brands: 'Dr. Fixit, Asian Paints SmartCare applicators', reach: 'local' },
  { id: 'd-2027-05-rainwater', month: '2027-05', tier: 'quick', kind: 'rainwater', title: 'Rainwater harvesting', ticket: '₹15,000–50,000', why: 'Set it up before the rain; refill borewells and cut tanker bills.', brands: 'Local RWH contractors', reach: 'local' },

  { id: 'd-2027-06-windows', month: '2027-06', tier: 'big', kind: 'windows', title: 'uPVC windows and mesh doors', ticket: '₹80,000–2.5 lakh', why: 'Keep out monsoon leaks, dust, mosquitoes and traffic noise.', brands: 'State-level fabricators using Fenesta and Encraft profiles', reach: 'multi' },
  { id: 'd-2027-06-pest', month: '2027-06', tier: 'quick', kind: 'pest', title: 'Termite and pest control', ticket: '₹3,000–15,000', why: 'Monsoon is when termites and mosquitoes spread.', brands: 'HiCare, Rentokil PCI', reach: 'multi' },

  { id: 'd-2027-07-bathroom', month: '2027-07', tier: 'big', kind: 'bathroom', title: 'Bathroom makeover with leak-proofing', ticket: '₹1–3 lakh', why: 'Indoor work that suits the rains; fix seepage while it shows.', brands: 'Local crews with Jaquar, Cera and Hindware fittings', reach: 'local' },
  { id: 'd-2027-07-water', month: '2027-07', tier: 'quick', kind: 'water', title: 'Water purifiers and tank cleaning', ticket: '₹8,000–25,000', why: 'Monsoon water needs better filtering.', brands: 'Kent, Aquaguard, Livpure', reach: 'multi' },

  { id: 'd-2027-08-painting', month: '2027-08', tier: 'big', kind: 'painting', title: 'Exterior painting, early booking', ticket: '₹60,000–2 lakh', why: 'Book crews now for after the rains, ahead of Navratri.', brands: 'Asian Paints, Berger, Nerolac certified crews', reach: 'local' },
  { id: 'd-2027-08-furniture', month: '2027-08', tier: 'quick', kind: 'furniture', title: 'Mattresses, sofas and beds', ticket: '₹15,000–60,000', why: 'Order before the festive rush so it arrives in time.', brands: 'Sleepwell, Wakefit, Godrej Interio dealers', reach: 'multi' },

  { id: 'd-2027-09-painting', month: '2027-09', tier: 'big', kind: 'painting', title: 'Festive painting', ticket: '₹40,000–1.5 lakh', why: 'Fresh walls for Navratri and Diwali.', brands: 'Asian Paints, Berger, Nerolac certified crews', reach: 'local' },
  { id: 'd-2027-09-decor', month: '2027-09', tier: 'quick', kind: 'decor', title: 'Blinds, curtains and lighting', ticket: '₹15,000–50,000', why: 'Finish the festive look once the painting is done.', brands: 'Local furnishers and lighting dealers', reach: 'local' },

  { id: 'd-2027-10-solar', month: '2027-10', tier: 'big', kind: 'solar', title: 'Rooftop solar, festive round', ticket: '₹1.5–2.2 lakh before subsidy', why: 'Clear skies after the monsoon; ready before winter.', brands: 'Tata Power Solar, Waaree, Adani Solar installers', reach: 'multi' },
  { id: 'd-2027-10-whitegoods', month: '2027-10', tier: 'quick', kind: 'whitegoods', title: 'Fridges and washing machines', ticket: '₹25,000–60,000', why: 'Diwali prices, made better by buying as a group.', brands: 'LG, Samsung, Whirlpool, Godrej dealers', reach: 'multi' },
];

export const dealIds = deals.map(d => d.id);

export const dealMonths = [...new Set(deals.map(d => d.month))];

export const dealCities = ['Nagpur', 'Pune', 'Nashik', 'Indore', 'Ahmedabad', 'Surat', 'Vadodara', 'Other'];

export function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
