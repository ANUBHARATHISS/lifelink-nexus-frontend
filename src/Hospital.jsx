import { useState } from 'react';
import { GROUPS, priority, rank, wavePlan } from './engine';

const BADGE = { notified: ['Notified', ''], accepted: ['Accepted', 'g'], declined: ['Declined', 'x'], donated: ['Donated ✓', 'g'], standby: ['Stand down', 'x'] };
const STEPS = ['Request created', 'Compatibility checked', 'Eligibility verified', 'Donors ranked', 'Notifications sent', 'Donor accepted', 'Donation completed'];

export default function Hospital({ state, dispatch }) {
  const [form, setForm] = useState({ group: 'O+', units: 2, hours: 3, urgency: 'CRITICAL' });
  const [open, setOpen] = useState({});
  const { request: req, status, sends, pool } = state;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (!req) {
    return (
      <div className="card">
        <h1>New Emergency Request</h1>
        <p className="subt">Tell us what the patient needs. We find and rank the best donors.</p>
        <div className="form">
          <label>Patient blood group<select value={form.group} onChange={set('group')}>{GROUPS.map((g) => <option key={g}>{g}</option>)}</select></label>
          <label>Units needed<input type="number" min="1" max="6" value={form.units} onChange={set('units')} /></label>
          <label>Needed within (hours)<input type="number" min="1" max="72" value={form.hours} onChange={set('hours')} /></label>
          <label>Urgency<select value={form.urgency} onChange={set('urgency')}><option>CRITICAL</option><option>HIGH</option><option>NORMAL</option></select></label>
        </div>
        <button className="btn full" onClick={() => dispatch({ type: 'CREATE_REQUEST', request: { ...form, units: +form.units, hours: +form.hours } })}>Find donors</button>
        <div className="sec">Demo tools</div>
        <div className="nav">
          <button className="btn ghost sm" onClick={() => dispatch({ type: 'ADVANCE_DAYS', days: 30 })}>Skip 30 days</button>
          <button className="btn ghost sm" onClick={() => dispatch({ type: 'RESET' })}>Reset demo data</button>
        </div>
        <div className="sub">Skip days to see donors become eligible again after their rest period.</div>
      </div>
    );
  }

  const pr = priority(req);
  const { ranked, excluded } = rank(req, pool);
  const plan = wavePlan(ranked, req.units);
  const vals = Object.values(status);
  const step = vals.includes('donated') ? 7 : vals.includes('accepted') ? 6 : vals.length ? 5 : 4;

  return (
    <div className="card">
      <h1>Donor Recommendations</h1>
      <p className="subt">Compatibility + eligibility + distance + urgency based ranking</p>
      <div className="steps">{STEPS.map((s, i) => <span key={s} className={i < step ? 'chip on' : 'chip'}>{i + 1}. {s}</span>)}</div>

      <div className="mini">
        <div className="box"><h4>Request</h4><b>{req.group}</b> • {req.units} units • within {req.hours} h<div className="sub">Urgency: {req.urgency}</div></div>
        <div className="box"><h4>Priority score</h4><div className="big">{pr.score} <small>{pr.level}</small></div>
          {pr.factors.map((f) => <div className="fl" key={f[0]}><span>{f[0]}</span><span>{f[1]} pts</span></div>)}</div>
        <div className="box"><h4>Notification plan</h4><div className="big">{plan.ids.length} donors</div>
          <div className="sub">{plan.probability}% chance of {req.units} units from this first wave</div>
          <button className="btn sm" disabled={plan.ids.every((id) => status[id])} onClick={() => dispatch({ type: 'NOTIFY', ids: plan.ids })}>Notify recommended donors</button></div>
      </div>

      <div className="sec">Ranked donors</div>
      {ranked.length === 0 && <div className="row">No eligible donors found. Widen the radius or contact the blood bank.</div>}
      {ranked.map((r, i) => {
        const d = r.donor, st = status[d.id];
        return (
          <div className="row" key={d.id}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="nm">{i + 1}. {d.name}{st && <span className={'badge ' + BADGE[st][1]}>{BADGE[st][0]}</span>}</div>
              <div className="sub">{d.group} • {d.km} km away • Eligible{sends[d.id] > 1 && ` • sent ${sends[d.id]}×`}</div>
              <div className="why">Why: {r.why}</div>
              <button className="lnk" onClick={() => setOpen({ ...open, [d.id]: !open[d.id] })}>{open[d.id] ? 'Hide' : 'Show'} score breakdown</button>
              {open[d.id] && r.factors.map((f) => (
                <div className="bar" key={f[0]}><span>{f[0]}</span><i><s style={{ width: `${(f[1] / f[2]) * 100}%` }} /></i><span>{Math.round(f[1] * 10) / 10}/{f[2]}</span></div>
              ))}
            </div>
            <div className="r">
              <div className="sc">Match Score<b>{r.score}</b></div>
              {!st && <button className="btn" onClick={() => dispatch({ type: 'NOTIFY', ids: [d.id] })}>Notify</button>}
              {st === 'notified' && <button className="btn" onClick={() => dispatch({ type: 'NOTIFY', ids: [d.id] })}>Notify again</button>}
              {st === 'accepted' && <button className="btn" onClick={() => dispatch({ type: 'CONFIRM', id: d.id })}>Confirm donation</button>}
            </div>
          </div>
        );
      })}

      <div className="sec">Filtered out (and why)</div>
      {excluded.map((x) => (
        <div className="row dim" key={x.donor.id}><div><div className="nm">{x.donor.name}</div><div className="sub">{x.donor.group} • {x.donor.km} km away</div></div><div className="no">{x.why}</div></div>
      ))}
      <button className="btn ghost full" onClick={() => dispatch({ type: 'NEW_REQUEST' })}>Start a new request</button>
    </div>
  );
}