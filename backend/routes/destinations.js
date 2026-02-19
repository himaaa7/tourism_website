const express = require('express');
const db      = require('../models/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/destinations  — supports ?search= ?category= ?city=
router.get('/', async (req, res) => {
    try {
        const { category, city, search } = req.query;
        let sql = 'SELECT * FROM destinations WHERE 1=1';
        const p = [];
        if (category) { sql += ' AND category=?'; p.push(category); }
        if (city)     { sql += ' AND city=?';     p.push(city); }
        if (search) {
            const like = `%${search}%`;
            sql += ' AND (name LIKE ? OR description LIKE ? OR location LIKE ? OR category LIKE ? OR city LIKE ?)';
            p.push(like, like, like, like, like);
        }
        sql += ' ORDER BY category, name';
        const rows = await db.allAsync(sql, p);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/destinations/categories
router.get('/categories', async (req, res) => {
    try {
        const cats = await db.allAsync('SELECT category, COUNT(*) as count FROM destinations GROUP BY category');
        res.json({ success: true, data: cats });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/destinations/favourites/mine  ← must be BEFORE /:id
router.get('/favourites/mine', authenticate, async (req, res) => {
    try {
        const rows = await db.allAsync(
            `SELECT d.* FROM destinations d
             JOIN favourites f ON f.destination_id=d.id
             WHERE f.user_id=? ORDER BY f.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res) => {
    try {
        const dest = await db.getAsync('SELECT * FROM destinations WHERE id=?', [req.params.id]);
        if (!dest) return res.status(404).json({ success: false, message: 'Destination not found.' });
        const rating = await db.getAsync(
            'SELECT COUNT(*) as total, ROUND(AVG(rating),1) as average FROM reviews WHERE destination_id=?',
            [req.params.id]
        );
        res.json({ success: true, data: { ...dest, ...rating } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/destinations/:id/reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        const rows = await db.allAsync(
            `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
             FROM reviews r JOIN users u ON u.id=r.user_id
             WHERE r.destination_id=? ORDER BY r.created_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/destinations/:id/reviews
router.post('/:id/reviews', authenticate, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const destId = parseInt(req.params.id);
        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ success: false, message: 'Rating must be 1–5.' });

        const dest = await db.getAsync('SELECT id FROM destinations WHERE id=?', [destId]);
        if (!dest) return res.status(404).json({ success: false, message: 'Destination not found.' });

        const existing = await db.getAsync(
            'SELECT id FROM reviews WHERE user_id=? AND destination_id=?',
            [req.user.id, destId]
        );
        if (existing) {
            await db.runAsync('UPDATE reviews SET rating=?, comment=? WHERE id=?', [rating, comment||null, existing.id]);
            return res.json({ success: true, message: 'Review updated.' });
        }
        await db.runAsync(
            'INSERT INTO reviews (user_id,destination_id,rating,comment) VALUES (?,?,?,?)',
            [req.user.id, destId, rating, comment||null]
        );
        res.status(201).json({ success: true, message: 'Review submitted. Thank you!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/destinations/:id/favourite  (toggle)
router.post('/:id/favourite', authenticate, async (req, res) => {
    try {
        const destId = parseInt(req.params.id);
        const dest = await db.getAsync('SELECT id FROM destinations WHERE id=?', [destId]);
        if (!dest) return res.status(404).json({ success: false, message: 'Destination not found.' });

        const existing = await db.getAsync(
            'SELECT id FROM favourites WHERE user_id=? AND destination_id=?',
            [req.user.id, destId]
        );
        if (existing) {
            await db.runAsync('DELETE FROM favourites WHERE id=?', [existing.id]);
            return res.json({ success: true, saved: false, message: 'Removed from favourites.' });
        }
        await db.runAsync('INSERT INTO favourites (user_id,destination_id) VALUES (?,?)', [req.user.id, destId]);
        res.status(201).json({ success: true, saved: true, message: 'Added to favourites!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ADMIN: POST /api/destinations
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { name, category, location, city, description, long_desc, entry_fee, timings, best_season, image_url } = req.body;
        if (!name || !category || !location || !city || !description)
            return res.status(400).json({ success: false, message: 'name, category, location, city, description required.' });
        const result = await db.runAsync(
            `INSERT INTO destinations (name,category,location,city,description,long_desc,entry_fee,timings,best_season,image_url)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [name, category, location, city, description, long_desc||null, entry_fee||null, timings||null, best_season||null, image_url||null]
        );
        res.status(201).json({ success: true, message: 'Destination added.', id: result.lastID });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ADMIN: DELETE /api/destinations/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const dest = await db.getAsync('SELECT id FROM destinations WHERE id=?', [req.params.id]);
        if (!dest) return res.status(404).json({ success: false, message: 'Not found.' });
        await db.runAsync('DELETE FROM destinations WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Destination deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
