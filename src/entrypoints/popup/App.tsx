import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='popup'>
      <h1>YouNote</h1>

      <label className="setting">
        <span>Extension Enabled</span>
        <input
          type="checkbox"
        />
      </label>

      <label className="setting">
        <span>Setting 2</span>
        <input
          type="checkbox"
        />
      </label>

      <label className="setting">
        <span>Setting 3</span>
        <input
          type="checkbox"
        />
      </label>

      <button>View All Notes</button>
    </div>
  );
}

export default App;
