const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Render Login Page
exports.getLogin = (req, res) => {
    res.render('login', { user: null, error: null });
};

// Process Login
exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.render('login', { user: null, error: 'Username dan password wajib diisi!' });
        }

        // Find user - Using prepared statement
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.render('login', { user: null, error: 'Username tidak ditemukan!' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { user: null, error: 'Password salah!' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set HTTPOnly Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Redirect based on role
        if (user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/order');
        }

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { user: null, error: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
};

// Render Signup Page
exports.getSignup = (req, res) => {
    res.render('signup', { user: null, error: null, success: null });
};

// Process Signup
exports.postSignup = async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;

        // Validate input
        if (!username || !password || !confirmPassword) {
            return res.render('signup', { user: null, error: 'Semua field wajib diisi!', success: null });
        }

        // Check password match
        if (password !== confirmPassword) {
            return res.render('signup', { user: null, error: 'Password tidak cocok!', success: null });
        }

        // Check password length
        if (password.length < 6) {
            return res.render('signup', { user: null, error: 'Password minimal 6 karakter!', success: null });
        }

        // Check if username exists
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.render('signup', { user: null, error: 'Username sudah digunakan!', success: null });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user - Default role is 'customer'
        await db.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, 'customer']
        );

        res.render('signup', { user: null, error: null, success: 'Registrasi berhasil! Silakan login.' });

    } catch (error) {
        console.error('Signup error:', error);
        res.render('signup', { user: null, error: 'Terjadi kesalahan. Silakan coba lagi.', success: null });
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};
