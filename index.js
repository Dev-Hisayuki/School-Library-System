const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Existing routes on main
const reservationRoutes = require('./routes/reservationRoutes');
const penaltyRoutes = require('./routes/penaltyRoutes');

// Member D (Kurt Alvarado) routes
const returnRoutes = require('./routes/returnRoutes');
const inventoryLogRoutes = require('./routes/inventoryLogRoutes');
const stockAlertRoutes = require('./routes/stockAlertRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Register routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/penalties', penaltyRoutes);

// Member D routes
app.use('/api/returns', returnRoutes);
app.use('/api/logs', inventoryLogRoutes);
app.use('/api/alerts', stockAlertRoutes);

app.get('/', (req, res) => {
  res.send('School Library System API - Member D Slice Active');
});

// Shortcut redirect for browser auto-fill
app.get('/reservation', (req, res) => {
  res.redirect('/reservations.html');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

