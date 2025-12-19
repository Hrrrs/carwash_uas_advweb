const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'angin_mamiri_secret_key_2024';

// Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        req.user = null;
        res.clearCookie('token');
        next();
    }
};

// Require Authentication
const requireAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Require Admin Role
const requireAdmin = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).render('403', { user: decoded, message: 'Akses ditolak. Hanya admin yang dapat mengakses halaman ini.' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Require Customer Role
const requireCustomer = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

module.exports = {
    verifyToken,
    requireAuth,
    requireAdmin,
    requireCustomer,
    JWT_SECRET
};
