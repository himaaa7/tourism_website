# 🌏 Tricity Tourism Hub — Complete Project

A full-stack tourism website for Guntur, Vijayawada & Amaravathi, Andhra Pradesh.

## 📁 Project Structure

```
tourism_website/
├── frontend/               ← All HTML, CSS, JS pages
│   ├── index.html          ← Home page
│   ├── virtual-tours.html  ← Virtual Tours (NEW)
│   ├── interactive-maps.html ← Interactive Map (NEW)
│   ├── events.html         ← Events & Festivals (NEW)
│   ├── about.html          ← About & Contact (NEW)
│   ├── booking-forms.js    ← Rich booking forms (NEW)
│   ├── script.js           ← Main JavaScript
│   ├── styles.css          ← Styles
│   ├── kanaka_durga_temple.html
│   ├── narasimhatemple.html
│   ├── undavallicaves.html
│   ├── kondaveedufort.html
│   ├── kondapallifort.html
│   ├── butterflygarden.html
│   ├── uppalapadu.html
│   ├── suryalankabeach.html
│   └── manginapudibeach.html
│
├── backend/                ← Node.js Express API
│   ├── server.js           ← Main server
│   ├── routes/
│   │   ├── auth.js         ← Login/signup
│   │   ├── destinations.js ← Destinations API
│   │   ├── contact.js      ← Contact messages
│   │   └── bookings.js     ← Bookings API (NEW)
│   ├── models/db.js        ← SQLite database
│   ├── middleware/auth.js  ← JWT auth
│   ├── data/               ← SQLite DB file
│   └── package.json
│
└── README.md
```

## 🚀 How to Run

### Step 1: Start the Backend

```bash
cd backend
npm install
node server.js
```

The API runs at: `http://localhost:5000`

### Step 2: Open the Frontend

Open `frontend/index.html` in your browser.
Use Live Server (VS Code) or any static server for best results:

```bash
# With Python
cd frontend
python -m http.server 8080
# Then open http://localhost:8080
```

Or install `live-server`:
```bash
npm install -g live-server
cd frontend
live-server
```

## 🔐 Default Admin Login

```
Email:    admin@tricitytourism.com
Password: Admin@1234
```

## 📄 Environment Variables

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_super_secret_key_here_change_this

# Optional: Email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_TO=admin@tricitytourism.com
```

## 🗺️ Pages Overview

| Page | Description |
|------|-------------|
| `index.html` | Home + all destination categories |
| `virtual-tours.html` | Video tour placeholders + guided tour booking |
| `interactive-maps.html` | Leaflet.js map with all 9 destinations pinned |
| `events.html` | 10 events with filters, calendar, booking forms |
| `about.html` | About, team, mission, contact form |
| `kanaka_durga_temple.html` etc. | Destination detail + 4-tab booking forms |

## 📋 Booking Form Tabs (on each destination page)

Each destination page has a **4-tab booking section**:
1. **Guided Tour** — Date, time, visitors, tour type, language
2. **Accommodation** — Check-in/out, room type, meal plan
3. **Food & Dining** — Restaurant reservation with cuisine preferences
4. **Transport** — Pickup/drop, vehicle type, trip type

## 🗺️ Adding Virtual Tour Videos

In `virtual-tours.html`, find `div#video-1` through `div#video-4` and replace the placeholder with:

```html
<!-- YouTube embed -->
<iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
        allowfullscreen allow="autoplay; fullscreen"></iframe>

<!-- OR direct video file -->
<video src="videos/your-tour.mp4" controls poster="pics/destination.jpg"></video>

<!-- OR 360° tour -->
<iframe src="https://your-360-tour-url.com/embed" allowfullscreen></iframe>
```

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/destinations` | List destinations |
| GET | `/api/destinations/:id` | Destination detail |
| POST | `/api/destinations/:id/reviews` | Submit review |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my?email=X` | User bookings |
| GET | `/api/bookings` | Admin: all bookings |
| POST | `/api/contact` | Contact message |

## 🎨 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JS, Leaflet.js (maps), Font Awesome
- **Backend**: Node.js, Express, SQLite3, JWT, bcryptjs
- **Maps**: OpenStreetMap via Leaflet.js (free, no API key needed)
