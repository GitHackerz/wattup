import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function VisualisationGraph({ onClose, ligne, jours, data }) {
  const chartData = {
    labels: jours,
    datasets: [
      {
        label: `Consommation de ${ligne}`,
        data: data,
        backgroundColor: 'rgba(30, 64, 175, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `Consommation de ${ligne} par jour` },
    },
    scales: {
      y: { title: { display: true, text: 'Consommation (Watt)' } },
      x: { title: { display: true, text: 'Jour' } },
    },
  };

  return (
    <div className="visualisation-modal">
      <div className="visualisation-content">
        <button className="close-btn" onClick={onClose}>Fermer</button>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default VisualisationGraph;
