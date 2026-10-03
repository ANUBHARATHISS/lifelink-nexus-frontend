// Fake database. In the backend phase this is replaced by MySQL + REST API calls (Axios).
export const DONORS = [
  { id: 1, name: 'Arun K.', group: 'O+', km: 2.4, female: false, daysSince: 200, available: true, response: 0.9, recent: 0 },
  { id: 2, name: 'Meena S.', group: 'O+', km: 4.1, female: true, daysSince: 200, available: true, response: 0.75, recent: 1 },
  { id: 3, name: 'Ravi P.', group: 'O-', km: 3.3, female: false, daysSince: 200, available: true, response: 0.8, recent: 0 },
  { id: 4, name: 'Divya R.', group: 'O+', km: 7, female: true, daysSince: 200, available: true, response: 0.4, recent: 3 },
  { id: 5, name: 'Karthik M.', group: 'A+', km: 3.4, female: false, daysSince: 200, available: true, response: 0.9, recent: 0 },
  { id: 6, name: 'Sana F.', group: 'O+', km: 2.2, female: true, daysSince: 40, available: true, response: 0.95, recent: 0 },
  { id: 7, name: 'Vikram T.', group: 'B+', km: 5.5, female: false, daysSince: 150, available: true, response: 0.6, recent: 1 },
  { id: 8, name: 'Lakshmi N.', group: 'A-', km: 9, female: true, daysSince: 300, available: false, response: 0.7, recent: 0 },
];

// status per donor: notified | accepted | declined | donated | standby
// donors = live donor records (updated when a donation is confirmed)
// pool = snapshot of donors taken when the request was created, so the ranking stays stable during that request
export const initial = { request: null, status: {}, sends: {}, donors: DONORS, pool: DONORS };

export function reducer(s, a) {
  switch (a.type) {
    case 'CREATE_REQUEST': return { ...s, request: a.request, pool: s.donors, status: {}, sends: {} };
    case 'NEW_REQUEST': return { ...s, request: null, status: {}, sends: {} }; // keeps donor records
    case 'NOTIFY': { // Notify / Notify again / Notify recommended
      const status = { ...s.status }, sends = { ...s.sends };
      a.ids.forEach((id) => { status[id] = status[id] || 'notified'; sends[id] = (sends[id] || 0) + 1; });
      return { ...s, status, sends };
    }
    case 'RESPOND': return { ...s, status: { ...s.status, [a.id]: a.accept ? 'accepted' : 'declined' } };
    case 'CONFIRM': { // hospital confirms donation: winner donated, other pending donors stand down
      const status = {};
      Object.entries(s.status).forEach(([id, v]) => { status[id] = v === 'notified' || v === 'accepted' ? 'standby' : v; });
      status[a.id] = 'donated';
      // record the donation: the 90/120-day rest period starts again from today
      const donors = s.donors.map((d) => (d.id === a.id ? { ...d, daysSince: 0 } : d));
      return { ...s, status, donors };
    }
    case 'ADVANCE_DAYS': return { ...s, donors: s.donors.map((d) => ({ ...d, daysSince: d.daysSince + a.days })) }; // demo helper
    case 'RESET': return initial; // restore all demo data
    default: return s;
  }
}