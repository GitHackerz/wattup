const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
  res.send('wattUP Backend is running!');
});

// Dashboard route
const dashboardRouter = require('./routes/dashboard');
app.use('/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});