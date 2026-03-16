const express   = require('express');
const validator = require('validator');
const db        = require('../models/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message)
            return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
        if (!validator.isEmail(email))
            return res.status(400).json({ success: false, message: 'Enter a valid email.' });

        await db.runAsync(
            'INSERT INTO contact_messages (name,email,subject,message) VALUES (?,?,?,?)',
            [name.trim(), email.toLowerCase(), subject||'', message.trim()]
        );

        // Send email only if credentials are set in .env
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const nodemailer = require('nodemailer');
                const t = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.EMAIL_PORT) || 587,
                    secure: false,
                    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                });
                await t.sendMail({
                    from: `"Tricity Tourism" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_TO,
                    subject: `Contact: ${subject || 'General Enquiry'}`,
                    html: `<h3>From: ${name} (${email})</h3><p>${message.replace(/\n/g,'<br>')}</p>`
                });
            } catch (e) {
                console.error('Email send failed (message still saved):', e.message);
            }
        }

        res.status(201).json({ success: true, message: 'Thank you! We will get back to you soon.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/contact  (admin only — view all messages)
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const msgs = await db.allAsync('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json({ success: true, count: msgs.length, data: msgs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
