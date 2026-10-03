import { useState } from 'react';
import { rank } from './engine';

export default function Donor({ state, dispatch }) {
  const [id, setId] = useState(1);
  const { request: req, status, donors, pool } = state;
  const donor = donors.find((d) => d.id === id);
  const st = status[id];
  const info = req && rank(req, pool).ranked.find((r) => r.donor.id === id);

  return (
    <div className="card">
      <h1>Donor App</h1>
      <p className="subt">What a donor sees on their phone</p>
      <label className="form one">Signed in as
        <select value={id} onChange={(e) => setId(+e.target.value)}>{donors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.group})</option>)}</select>
      </label>
      <div className="sub">Last donation: {donor.daysSince === 0 ? 'today' : `${donor.daysSince} days ago`} • rest period {donor.female ? 120 : 90} days</div>
      {!st && <div className="row">No requests for you right now. Create a request in the Hospital Portal and click Notify.</div>}
      {st && req && (
        <div className="row" style={{ display: 'block' }}>
          <div className="nm">Emergency request • {req.group}<span className={'badge ' + (st === 'accepted' || st === 'donated' ? 'g' : st === 'declined' || st === 'standby' ? 'x' : '')}>{st === 'standby' ? 'Stand down' : st}</span></div>
          <div className="sub">{req.units} unit(s) needed within {req.hours} h • Urgency {req.urgency}</div>
          {info && <div className="why">About {info.eta} min away • you are a {info.score}/100 match</div>}
          {st === 'notified' && (
            <div className="nav"><button className="btn" onClick={() => dispatch({ type: 'RESPOND', id, accept: true })}>Accept</button>
              <button className="btn ghost" onClick={() => dispatch({ type: 'RESPOND', id, accept: false })}>Decline</button></div>
          )}
          {st === 'accepted' && <div className="why ok">Thank you! Head to the hospital. They will confirm your donation.</div>}
          {st === 'donated' && <div className="why ok">Donation complete. You will be eligible again in about {donor.female ? 120 : 90} days.</div>}
        </div>
      )}
    </div>
  );
}