import React, { useState } from 'react';
import './App.css';
import VisualisationGraph from './VisualisationGraph';

// Données statiques pour le dashboard
const threshold = 100;
const dashboardData = [
  { ligne: 'Ligne 1', consommation: 99, temps: '12:00:00' },
  { ligne: 'Ligne 2', consommation: 102, temps: '12:00:05' },
  { ligne: 'Ligne 3', consommation: 100, temps: '12:00:10' },
  { ligne: 'Ligne 4', consommation: 98, temps: '12:00:15' },
  { ligne: 'Ligne 5', consommation: 101, temps: '12:00:20' },
];

function isAnomalie(consommation) {
  return consommation > threshold + 1 || consommation < threshold - 1;
}

function Dashboard() {
  const [filter, setFilter] = useState('All');
  const [showGraph, setShowGraph] = useState(false);
  const [selectedLigne, setSelectedLigne] = useState(null);

  // Fake data for visualisation: consommation par jour pour chaque ligne
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const ligneData = {
    'Ligne 1': [99, 101, 100, 98, 102],
    'Ligne 2': [102, 103, 101, 104, 100],
    'Ligne 3': [100, 99, 98, 101, 100],
    'Ligne 4': [98, 97, 99, 100, 101],
    'Ligne 5': [101, 100, 102, 103, 99],
  };

  const filteredData =
    filter === 'Anomalie'
      ? dashboardData.filter(row => isAnomalie(row.consommation))
      : dashboardData;

  const handleViewGraph = (ligne) => {
    setSelectedLigne(ligne);
    setShowGraph(true);
  };

  return (
    <div className="dashboard-container">
      <h2>Tableau de bord énergétique</h2>
      <div className="filter-buttons">
        <button onClick={() => setFilter('All')} className={filter === 'All' ? 'active' : ''}>Tout</button>
        <button onClick={() => setFilter('Anomalie')} className={filter === 'Anomalie' ? 'active' : ''}>Anomalie</button>
      </div>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Ligne</th>
            <th>Temps</th>
            <th>Consommation (Watt)</th>
            <th>Seuil</th>
            <th>Visualisation</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={idx} className={isAnomalie(row.consommation) ? 'anomalie-row' : ''}>
              <td>{row.ligne}</td>
              <td>{row.temps}</td>
              <td>{row.consommation}</td>
              <td>{threshold}</td>
              <td><button onClick={() => handleViewGraph(row.ligne)}>Voir visualisation</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showGraph && (
        <VisualisationGraph
          onClose={() => setShowGraph(false)}
          ligne={selectedLigne}
          jours={jours}
          data={ligneData[selectedLigne]}
        />
      )}
    </div>
  );
}

export default Dashboard;
