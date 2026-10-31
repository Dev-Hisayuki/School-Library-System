const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Register your assigned routes
app.use('/api/reservations', reservationRoutes);

app.get('/', (req, res) => {
    res.send('School Library System API - Member 4 Slice Active');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
