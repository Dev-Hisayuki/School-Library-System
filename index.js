const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservationRoutes = require('./routes/reservationRoutes');
const penaltyRoutes = require('./routes/penaltyRoutes');
// 1. Require your book and category routes
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Register your assigned routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/penalties', penaltyRoutes);
// 2. Mount your book and category routes
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.send('School Library System API - Member B Catalog Slice Active');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});