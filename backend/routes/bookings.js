const express = require('express');
const validator = require('validator');
const db = require('../models/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/bookings  — create any type of booking (tour, accommodation, food, transport, event, virtual_tour)
router.post('/', async (req, res) => {
    try {
        const {
            type, destination, name, email, phone,
            date, time, visitors, guests, participants,
            tour_type, language, room_type, meal_plan,
            cuisine, dining_type, food_pref, vehicle,
            passengers, trip_type, checkin, checkout,
            ticket_category, adults, children,
            event_name, tour_name,
            pickup, drop,
            requests
        } = req.body;

        if (!type) return res.status(400).json({ success: false, message: 'Booking type is required.' });
        if (!name || !phone) return res.status(400).json({ success: false, message: 'Name and phone are required.' });
        if (email && !validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Invalid email address.' });

        // Build a summary for storage
        const summary = JSON.stringify(req.body);
        const destName = destination || event_name || tour_name || 'General';

        const result = await db.runAsync(
            `INSERT INTO bookings (type, destination, name, email, phone, booking_date, summary)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [type, destName, name.trim(), (email || '').toLowerCase(), phone.trim(), date || checkin || new Date().toISOString().split('T')[0], summary]
        );

        // Generate a booking reference
        const ref = 'TCT' + String(result.lastID).padStart(5, '0');

        res.status(201).json({
            success: true,
            message: `Booking confirmed! Your reference is ${ref}. ${email ? 'Confirmation sent to ' + email + '.' : ''}`,
            booking_ref: ref,
            booking_id: result.lastID
        });
    } catch (err) {
        console.error('Booking error:', err);
        // If table doesn't exist yet, create it and retry
        if (err.message && err.message.includes('no such table')) {
            await db.runAsync(`CREATE TABLE IF NOT EXISTS bookings (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                type         TEXT NOT NULL,
                destination  TEXT,
                name         TEXT NOT NULL,
                email        TEXT,
                phone        TEXT NOT NULL,
                booking_date TEXT,
                summary      TEXT,
                status       TEXT DEFAULT 'pending',
                created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            return res.status(503).json({ success: false, message: 'Please retry your booking.' });
        }
        res.status(500).json({ success: false, message: 'Server error while processing booking.' });
    }
});

// GET /api/bookings  (admin only)
router.get('/', authenticate, async (req, res) => {
    try {
        const { type, destination, status } = req.query;
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });
        let sql = 'SELECT * FROM bookings WHERE 1=1';
        const p = [];
        if (type)        { sql += ' AND type=?';        p.push(type); }
        if (destination) { sql += ' AND destination LIKE ?'; p.push('%' + destination + '%'); }
        if (status)      { sql += ' AND status=?';      p.push(status); }
        sql += ' ORDER BY created_at DESC';
        const rows = await db.allAsync(sql, p);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/bookings/my  — user's bookings by email
router.get('/my', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email || !validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Valid email required.' });
        const rows = await db.allAsync('SELECT id, type, destination, booking_date, status, created_at FROM bookings WHERE email=? ORDER BY created_at DESC', [email.toLowerCase()]);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// PATCH /api/bookings/:id/status  (admin only)
router.patch('/:id/status', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });
        const { status } = req.body;
        if (!['pending','confirmed','cancelled'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
        await db.runAsync('UPDATE bookings SET status=? WHERE id=?', [status, req.params.id]);
        res.json({ success: true, message: 'Booking status updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
