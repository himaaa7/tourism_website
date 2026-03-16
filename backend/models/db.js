// models/db.js  —  uses 'sqlite3' (pure JS, no Visual Studio needed)
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const fs      = require('fs');
const bcrypt  = require('bcryptjs');

// Create data/ folder if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(path.join(dataDir, 'tricity.db'), err => {
    if (err) { console.error('DB Error:', err.message); process.exit(1); }
    console.log('✅ Database connected.');
});

// ── Promise wrappers so we can use async/await ───────────────────────
db.runAsync = (sql, p = []) => new Promise((res, rej) =>
    db.run(sql, p, function(e) { e ? rej(e) : res({ lastID: this.lastID, changes: this.changes }); })
);
db.getAsync = (sql, p = []) => new Promise((res, rej) =>
    db.get(sql, p, (e, row) => e ? rej(e) : res(row))
);
db.allAsync = (sql, p = []) => new Promise((res, rej) =>
    db.all(sql, p, (e, rows) => e ? rej(e) : res(rows))
);

// ── Create tables and seed data ──────────────────────────────────────
async function init() {
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA journal_mode = WAL');

    await db.runAsync(`CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        email      TEXT    NOT NULL UNIQUE,
        password   TEXT    NOT NULL,
        role       TEXT    NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS destinations (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        category    TEXT NOT NULL,
        location    TEXT NOT NULL,
        city        TEXT NOT NULL,
        description TEXT NOT NULL,
        long_desc   TEXT,
        entry_fee   TEXT,
        timings     TEXT,
        best_season TEXT,
        image_url   TEXT,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS favourites (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
        created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, destination_id)
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS reviews (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
        rating         INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
        comment        TEXT,
        created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS contact_messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL,
        subject    TEXT,
        message    TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS bookings (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        type         TEXT NOT NULL,
        destination  TEXT,
        name         TEXT NOT NULL,
        email        TEXT,
        phone        TEXT NOT NULL,
        booking_date TEXT,
        summary      TEXT,
        status       TEXT NOT NULL DEFAULT 'pending',
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed only if empty
    const { c } = await db.getAsync('SELECT COUNT(*) as c FROM destinations');
    if (c > 0) return;

    const sql = `INSERT INTO destinations
        (name,category,location,city,description,long_desc,entry_fee,timings,best_season,image_url)
        VALUES (?,?,?,?,?,?,?,?,?,?)`;

    const places = [
        ['Kanaka Durga Temple','Temples','Indrakeeladri Hill, Vijayawada','Vijayawada',
         'One of the most revered temples dedicated to Goddess Durga, offering panoramic views of the Krishna River.',
         'Kanaka Durga Temple is one of the most significant Hindu temples in Andhra Pradesh, situated on Indrakeeladri Hill on the banks of the Krishna River. Famous for its annual Dasara celebrations.',
         'Free (Special darshan tickets available)','6:00 AM – 12:30 PM, 2:30 PM – 8:00 PM','October – March','pics/durgatemple.jpg'],

        ['Lakshmi Narasimha Temple','Temples','Amaravathi','Amaravathi',
         'Ancient temple showcasing exquisite Dravidian architecture and rich cultural heritage.',
         'The Lakshmi Narasimha Temple in Amaravathi is dedicated to Lord Narasimha. It features classic Dravidian architecture and is one of the eight Swayambhu Narasimha Kshetras.',
         'Free','6:00 AM – 12:00 PM, 4:00 PM – 8:00 PM','October – February','pics/narasimhaswami.jpg'],

        ['Undavalli Caves','Heritage','Undavalli, Guntur','Vijayawada',
         'Rock-cut caves dating back to 4th–5th century, featuring intricate sculptures and ancient architecture.',
         'Undavalli Caves are carved out of solid sandstone, dating back to the 4th–5th century AD. Originally Jain temples, later converted to Hindu use. The four-storeyed cave temple is the most impressive.',
         '₹25 (Indians), ₹300 (Foreigners)','9:00 AM – 5:30 PM (Tue–Sun)','October – March','pics/undavallicaves.jpg'],

        ['Kondaveedu Fort','Heritage','Kondaveedu, Guntur','Guntur',
         'Historic hill fortress with stunning views and remnants of medieval Telugu kingdom glory.',
         'Kondaveedu Fort was once the capital of the Reddi Kingdom. The hill fort offers breathtaking panoramic views with remnants of palaces, temples, and granaries from medieval times.',
         '₹10','9:00 AM – 5:00 PM','October – February','pics/kondavid-fort.jpg'],

        ['Kondapalli Fort','Heritage','Kondapalli, Vijayawada','Vijayawada',
         'Ancient fort built in 14th century, famous for traditional toy-making and historical significance.',
         'Kondapalli Fort was built in the 14th century by the Reddi Kings. Famous for Kondapalli wooden toys which have a GI tag.',
         '₹15 (Indians), ₹200 (Foreigners)','9:00 AM – 5:00 PM','November – February','pics/kondapallifort.jpg'],

        ['Butterfly Garden','Nature','Vijayawada','Vijayawada',
         'Colorful paradise with diverse butterfly species and beautiful flora in a serene environment.',
         'The Butterfly Garden in Vijayawada houses over 120 species of butterflies amid lush greenery and flowering plants.',
         '₹20 (Adults), ₹10 (Children)','9:00 AM – 6:00 PM','October – March','pics/butterfly.jpg'],

        ['Uppalapadu Bird Sanctuary','Nature','Uppalapadu, Guntur','Guntur',
         'Haven for migratory birds including pelicans, painted storks, and various species of herons.',
         'Uppalapadu Bird Sanctuary is a freshwater lake home to thousands of migratory birds. Best visited October to March.',
         'Free','Open all day','October – March','pics/uppalapadu.jpg'],

        ['Bapatla Suryalanka Beach','Beaches','Suryalanka, Bapatla','Bapatla',
         'Beautiful beach with golden sands, perfect for relaxation and water sports activities.',
         'Suryalanka Beach is one of the cleanest beaches in Andhra Pradesh, known for calm waves and golden sands.',
         'Free','Open 24 hours','November – February','pics/Fishing_boat_near_Suryalanka_beach.jpg'],

        ['Manginapudi Beach','Beaches','Manginapudi, Guntur','Guntur',
         'Scenic beach known for its natural beauty, tranquil atmosphere, and stunning sunsets.',
         'Manginapudi Beach near Machilipatnam is famed for untouched natural beauty, fishing boats at dawn, and breathtaking sunsets.',
         'Free','Open 24 hours','October – January','pics/Machilipatnam_beach_at_dusk11_09.jpg'],
    ];

    for (const p of places) await db.runAsync(sql, p);
    console.log('✅ 9 destinations seeded.');

    const hashed = bcrypt.hashSync('Admin@1234', 10);
    await db.runAsync(
        `INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)`,
        ['Admin','admin@tricitytourism.com', hashed, 'admin']
    );
    console.log('✅ Admin user created  →  admin@tricitytourism.com  /  Admin@1234');
}

init().catch(err => { console.error('DB init failed:', err); process.exit(1); });

module.exports = db;
