const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

// ==========================================
// MEMBER A — CORE SYSTEM
// ==========================================
const authRoutes = require('./routes/authRoutes');
const systemSettingsRoutes = require('./routes/systemSettingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// ==========================================
// EXISTING SYSTEM ROUTES
// ==========================================
const reservationRoutes = require('./routes/reservationRoutes');
const penaltyRoutes = require('./routes/penaltyRoutes');
const policyReservationRoutes = require('./app/routes/routesD_policyReservation');

// ==========================================
// MEMBER B — MASTER DATA AND CATALOG
// ==========================================
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const publisherRoutes = require('./routes/publisherRoutes');

// ==========================================
// MEMBER C — STUDENTS AND BORROWING
// ==========================================
const studentRoutes = require('./routes/studentRoutes');
const borrowerRoutes = require('./routes/borrowerRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

// ==========================================
// MEMBER D — RETURNS, LOGS AND ALERTS
// ==========================================
const returnRoutes = require('./routes/returnRoutes');
const inventoryLogRoutes = require('./routes/inventoryLogRoutes');
const stockAlertRoutes = require('./routes/stockAlertRoutes');

// ==========================================
// EXPRESS APPLICATION
// ==========================================
const app = express();
const PORT = 3001;

console.log('ACTIVE INDEX FILE:', __filename);

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('INCOMING REQUEST:', req.method, req.originalUrl);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// MEMBER A — CORE API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/settings', systemSettingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// TEMPORARY DASHBOARD TEST
app.get('/api/dashboard-test', (req, res) => {
    res.json({
        success: true,
        message: 'Dashboard route is reachable.'
    });
});

// ==========================================
// EXISTING API ROUTES
// ==========================================
app.use('/api/reservations', reservationRoutes);
app.use('/api/penalties', penaltyRoutes);
app.use('/api/policy-reservations', policyReservationRoutes);

// ==========================================
// MEMBER B — CATALOG API ROUTES
// ==========================================
app.use('/api/books', bookRoutes);

app.use('/api/categories', (req, res, next) => {
    console.log('CATEGORY REQUEST:', req.method, req.originalUrl);
    next();
}, categoryRoutes);

app.use('/api/publishers', publisherRoutes);

// ==========================================
// MEMBER C — STUDENTS AND BORROWING API ROUTES
// ==========================================
app.use('/api/students', studentRoutes);
app.use('/api/borrowers', borrowerRoutes);

// TEMPORARY BORROWING TEST
app.get('/api/borrows-test', (req, res) => {
    res.json({
        success: true,
        message: 'Borrowing route area is reachable.'
    });
});

app.use('/api/borrows', borrowRoutes);

// ==========================================
// MEMBER D — RETURNS AND LOGS
// ==========================================
app.use('/api/returns', returnRoutes);
app.use('/api/logs', inventoryLogRoutes);
app.use('/api/alerts', stockAlertRoutes);

// ==========================================
// HOME ROUTES
// ==========================================
app.get('/', (req, res) => {
    res.send('School Library System API - Active');
});

app.get('/reservation', (req, res) => {
    res.redirect('/reservations.html');
});

// ==========================================
// API 404 HANDLER
// ==========================================
app.use('/api', (req, res) => {
    console.log('UNMATCHED API REQUEST:', req.method, req.originalUrl);

    res.status(404).json({
        success: false,
        message: 'API endpoint not found.'
    });
});

// ==========================================
// START SERVER
// ==========================================
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log('====================================');
    console.log('       SCHOOL LIBRARY SYSTEM');
    console.log('====================================');
    console.log(`Server running at http://127.0.0.1:${PORT}`);
    console.log('');
    console.log('MEMBER A — CORE SYSTEM');
    console.log('Authentication: /api/auth');
    console.log('System Settings: /api/settings');
    console.log('Dashboard: /api/dashboard');
    console.log('Dashboard Test: /api/dashboard-test');
    console.log('');
    console.log('MEMBER B — CATALOG');
    console.log('Books: /api/books');
    console.log('Categories: /api/categories');
    console.log('Publishers: /api/publishers');
    console.log('');
    console.log('MEMBER C — STUDENTS AND BORROWING');
    console.log('Students: /api/students');
    console.log('Borrowers: /api/borrowers');
    console.log('Borrowing: /api/borrows');
    console.log('');
    console.log('MEMBER D — RETURNS AND LOGS');
    console.log('Returns: /api/returns');
    console.log('Activity Logs: /api/logs');
    console.log('Stock Alerts: /api/alerts');
    console.log('====================================');
});

server.on('close', () => {
    console.log('SERVER CLOSED');
});

server.on('error', (error) => {
    console.error('SERVER ERROR:', error);
});