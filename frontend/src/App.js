import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Dashboard from './Dashboard';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/')
      .then(res => setMessage(res.data))
      .catch(err => console.log('Error fetching from backend:', err));
  }, []);

    return ( 
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">wattUP</h1>
          <p className="text-lg text-gray-700">{message || 'Loading...'}</p>
        </header>
        <Dashboard />
      </div>
    );
}

export default App;