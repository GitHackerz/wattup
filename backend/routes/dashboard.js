const express = require('express');
const router = express.Router();

// Fake static data
const threshold = 100; // Example threshold
const dashboardData = [
  { ligne: 'Ligne 1', consommation: 99, temps: '12:00:00' },
  { ligne: 'Ligne 2', consommation: 102, temps: '12:00:05' },
  { ligne: 'Ligne 3', consommation: 100, temps: '12:00:10' },
  { ligne: 'Ligne 4', consommation: 98, temps: '12:00:15' },
  { ligne: 'Ligne 5', consommation: 101, temps: '12:00:20' },
];

// GET /dashboard - returns static dashboard data
router.get('/', (req, res) => {
  res.json({ threshold, data: dashboardData });
});

module.exports = router;
