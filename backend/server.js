require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS: allows frontend on any local port ──────────────────────────
app.use(cors({
    origin: function (origin, cb) {
        // allow no-origin (Postman, curl) and any localhost / 127.0.0.1
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === 'null') {
            return cb(null, true);
        }
        cb(new Error('CORS blocked: ' + origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ────────────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/bookings', require('./routes/bookings'));

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Tricity Tourism Hub API is running!', time: new Date() });
});

// ── Serve frontend if public/ folder exists ──────────────────────────
const publicPath = path.join(__dirname, '../frontend');
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    app.get('*', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));
}

// ── Global error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
    console.log('\n🌏  Tricity Tourism Hub API');
    console.log(`    ➜  http://localhost:${PORT}`);
    console.log(`    ➜  Health: http://localhost:${PORT}/api/health\n`);
});
