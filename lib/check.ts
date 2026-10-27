// Gharmalak Check: homebuyers talk to verified owners before they buy. Pune test, Wakad and Hinjewadi.
// Kept apart from the Nagpur club on purpose: Check pages never mention rounds or the club.
// A later owner-side idea: help owners rent out their own flats.

export const check = {
  city: 'Pune',
  areas: ['Wakad', 'Hinjewadi', 'Other'],
  prices: [99, 299] as const, // price test: each visitor sees one, picked at random
  minOwners: 3,
  hours: 24, // report promised within this many hours
  payoutAnswers: 150, // ₹ to an owner for a completed answer set
  payoutCall: 250, // ₹ to the owner for each call
  callPrice: 499, // ₹ a buyer pays for a call with a verified owner
  callMinutes: 15,
  paymentLinks: {
    99: process.env.NEXT_PUBLIC_CHECK_PAYMENT_LINK_99 || '',
    299: process.env.NEXT_PUBLIC_CHECK_PAYMENT_LINK_299 || '',
    499: process.env.NEXT_PUBLIC_CHECK_PAYMENT_LINK_CALL || '',
  } as Record<number, string>,
};

// Who someone lives as. Buyers are matched with owners of the same kind,
// so a bachelor hears from bachelors and a family from families.
export const households = [
  { id: 'bachelor', label: 'Bachelor or sharing' },
  { id: 'couple', label: 'Couple' },
  { id: 'family', label: 'Family' },
] as const;
export type Household = (typeof households)[number]['id'];
export const householdIds: string[] = households.map(h => h.id);

// Buildings with at least 3 verified owners. Add names here as owners are verified;
// they appear as suggestions in the search box and are marked "ready".
export const coveredBuildings: string[] = [];

export const questions = [
  { id: 'build', topic: 'Build quality', q: 'Any leakage, seepage, cracks or poor finishing in your flat or the common areas?' },
  { id: 'possession', topic: 'Possession', q: 'Did you get possession on the promised date? How late was it?' },
  { id: 'papers', topic: 'Papers', q: 'Is the OC in place, and did registration and the loan go smoothly?' },
  { id: 'builder', topic: 'Builder after the sale', q: 'When something broke after possession, did the builder fix it?' },
  { id: 'utilities', topic: 'Water and power', q: 'Any water shortage or tanker water in summer? How often does the power go?' },
  { id: 'maintenance', topic: 'Maintenance and society', q: 'What is the monthly maintenance, and has the society been handed over?' },
  { id: 'security', topic: 'Security and parking', q: 'How are the guards, CCTV and parking, for residents and visitors?' },
  { id: 'area', topic: 'The neighbourhood', q: 'Roads, traffic, schools, hospitals and shops nearby. Any construction coming up?' },
  { id: 'value', topic: 'Value', q: 'Did your flat hold its value? What do flats here resell or rent for now?' },
  { id: 'overall', topic: 'Overall', q: 'Would you buy here again? Why or why not?' },
] as const;

export type QuestionId = (typeof questions)[number]['id'];
