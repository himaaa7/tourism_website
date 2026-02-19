const express   = require('express');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const validator = require('validator');
const db        = require('../models/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
        if (!validator.isEmail(email))
            return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
        if (password.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

        const exists = await db.getAsync('SELECT id FROM users WHERE email=?', [email.toLowerCase()]);
        if (exists)
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

        const hashed = bcrypt.hashSync(password, 10);
        const result = await db.runAsync(
            'INSERT INTO users (name,email,password) VALUES (?,?,?)',
            [name.trim(), email.toLowerCase(), hashed]
        );
        const token = jwt.sign({ id: result.lastID }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true, message: 'Account created!', token,
            user: { id: result.lastID, name: name.trim(), email: email.toLowerCase(), role: 'user' }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required.' });

        const user = await db.getAsync('SELECT * FROM users WHERE email=?', [email.toLowerCase()]);
        if (!user || !bcrypt.compareSync(password, user.password))
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            success: true, message: `Welcome back, ${user.name}!`, token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
