import { useReducer, useState } from 'react';
import { reducer, initial } from './store';
import Hospital from './Hospital.jsx';
import Donor from './Donor.jsx';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [role, setRole] = useState('hospital');
  return (
    <div className="wrap">
      <header>
        <div><span className="logo">LifeLink <b>Nexus</b></span><span className="demo">Demo</span></div>
        <nav>
          <button className={role === 'hospital' ? 'tab on' : 'tab'} onClick={() => setRole('hospital')}>Hospital Portal</button>
          <button className={role === 'donor' ? 'tab on' : 'tab'} onClick={() => setRole('donor')}>Donor App</button>
        </nav>
      </header>
      {role === 'hospital' ? <Hospital state={state} dispatch={dispatch} /> : <Donor state={state} dispatch={dispatch} />}
    </div>
  );
}
