require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const transRoutes = require('./routes/transRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();

// Security Middleware - Disable CSP agar script UI tidak error
app.use(helmet({ contentSecurityPolicy: false }));

// Cookie Parser
app.use(cookieParser());

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/products', productRoutes);
app.use('/', transRoutes);
app.use('/admin', reportRoutes);

// Home Route
app.get('/', verifyToken, (req, res) => {
    res.render('index', { user: req.user || null });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { user: req.user || null });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Terjadi kesalahan pada server!');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
