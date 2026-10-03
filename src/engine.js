// The decision logic. In the backend phase this exact logic is rewritten in Java (MatchEngine.java).
export const GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const RARITY = { 'O-': 7, 'O+': 1, 'A-': 7, 'A+': 2, 'B-': 9, 'B+': 3, 'AB-': 10, 'AB+': 5 };

// A donor can give only if they have no antigen (A, B, Rh+) that the patient lacks.
export const canDonate = (d, r) =>
  (!d.includes('A') || r.includes('A')) && (!d.includes('B') || r.includes('B')) && (!d.endsWith('+') || r.endsWith('+'));

// Request priority (0-100): context-based, not just the urgency the user picks.
export function priority(req) {
  const f = [
    ['Declared urgency', { CRITICAL: 50, HIGH: 30, NORMAL: 10 }[req.urgency], req.urgency],
    ['Time window', req.hours <= 3 ? 25 : req.hours <= 6 ? 15 : req.hours <= 24 ? 8 : 0, `Needed within ${req.hours} h`],
    ['Blood group scarcity', RARITY[req.group], `${req.group} sourcing difficulty`],
    ['Units required', Math.min(15, (req.units - 1) * 5), `${req.units} unit(s)`],
  ];
  const score = f.reduce((a, x) => a + x[1], 0);
  return { score, level: score >= 80 ? 'CRITICAL' : score >= 55 ? 'HIGH' : 'ROUTINE', factors: f };
}

const rest = (d) => (d.female ? 120 : 90); // placeholder: cite your local blood-bank guideline

// Step 1: filter. Step 2: score with an explanation.
export function rank(req, donors) {
  const ranked = [], excluded = [];
  for (const d of donors) {
    let why = null;
    if (!canDonate(d.group, req.group)) why = `${d.group} cannot donate to ${req.group}`;
    else if (!d.available) why = 'Marked unavailable';
    else if (d.daysSince < rest(d)) why = `Donated ${d.daysSince} days ago; needs ${rest(d)}`;
    else if (d.km > 25) why = 'Outside 25 km radius';
    if (why) { excluded.push({ donor: d, why }); continue; }

    const wD = { CRITICAL: 40, HIGH: 32, NORMAL: 25 }[req.urgency];
    const p = 1 / (1 + Math.exp(-(-0.6 + 2.6 * d.response + 0.9 * Math.max(0, 1 - d.km / 25) - 0.35 * Math.min(4, d.recent))));
    const eta = Math.round((d.km / 25) * 60 + 10);
    const exact = d.group === req.group;
    const cExact = exact ? 1 : d.group === 'O-' ? (req.urgency === 'CRITICAL' ? 0.4 : 0) : 0.4;
    const f = [
      ['Distance', wD * Math.max(0, 1 - d.km / 25), wD, `${d.km} km away (~${eta} min)`],
      ['Acceptance likelihood', 30 * p, 30, `${Math.round(p * 100)}% predicted to accept`],
      ['Recovery readiness', 10 * Math.min(1, (d.daysSince - rest(d)) / 60), 10, 'Fully rested'],
      ['Group match', 10 * cExact, 10, exact ? 'Exact group match' : d.group === 'O-' && cExact === 0 ? 'Universal donor preserved' : 'Compatible, not exact'],
      ['Fair rotation', 10 * Math.max(0, 1 - 0.25 * d.recent), 10, `${d.recent} request(s) in last 30 days`],
    ];
    const score = Math.round(f.reduce((a, x) => a + x[1], 0) / (wD + 60) * 100);
    ranked.push({ donor: d, score, p, eta, factors: f, why: f.filter((x) => x[1] / x[2] >= 0.6).map((x) => x[3]).join(' • ') });
  }
  ranked.sort((a, b) => b.score - a.score);
  return { ranked, excluded };
}

// Smallest top group whose combined acceptance chance reaches the target (default 90%).
export function wavePlan(ranked, units, target = 0.9) {
  let dist = Array(units + 1).fill(0); dist[0] = 1;
  const ids = [];
  for (const r of ranked) {
    const n = Array(units + 1).fill(0);
    for (let k = 0; k < units; k++) { n[k] += dist[k] * (1 - r.p); n[k + 1] += dist[k] * r.p; }
    n[units] += dist[units]; dist = n; ids.push(r.donor.id);
    if (dist[units] >= target) break;
  }
  return { ids, probability: Math.round(dist[units] * 100) };
}
