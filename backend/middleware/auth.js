const jwt = require('jsonwebtoken');
const db  = require('../models/db');

async function authenticate(req, res, next) {
    const header = req.headers['authorization'];
    const token  = header && header.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user    = await db.getAsync('SELECT id,name,email,role FROM users WHERE id=?', [decoded.id]);
        if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
        req.user = user;
        next();
    } catch {
        res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role === 'admin') return next();
    res.status(403).json({ success: false, message: 'Admin access required.' });
}

module.exports = { authenticate, requireAdmin };
