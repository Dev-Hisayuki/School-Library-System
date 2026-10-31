const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservationRoutes = require('./routes/reservationRoutes');
const penaltyRoutes = require('./routes/penaltyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Register your assigned routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/penalties', penaltyRoutes);

app.get('/', (req, res) => {
  res.send('School Library System API - Member 4 Slice Active');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

