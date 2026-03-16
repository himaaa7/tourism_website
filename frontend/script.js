// =============================================================
//  Tricity Tourism Hub — script.js
//  Works on index.html AND all destination detail pages
// =============================================================

const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

// ── TOKEN / USER HELPERS ──────────────────────────────────────
function getToken()   { return localStorage.getItem('tct_token'); }
function saveToken(t) { localStorage.setItem('tct_token', t); }
function saveUser(u)  { localStorage.setItem('tct_user', JSON.stringify(u)); }
function getUser()    { try { return JSON.parse(localStorage.getItem('tct_user')); } catch(e) { return null; } }
function isLoggedIn() { return !!getToken(); }

function logout() {
    localStorage.removeItem('tct_token');
    localStorage.removeItem('tct_user');
    updateAuthUI();
    showToast('Logged out successfully.', 'info');
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

// ── TOAST NOTIFICATION ────────────────────────────────────────
function showToast(msg, type) {
    type = type || 'success';
    var old = document.getElementById('tct-toast');
    if (old) old.remove();
    var icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    var t = document.createElement('div');
    t.id = 'tct-toast';
    t.className = 'tct-toast tct-toast-' + type;
    t.innerHTML = '<i class="fas fa-' + (icons[type] || 'info-circle') + '"></i><span>' + msg + '</span>';
    document.body.appendChild(t);
    setTimeout(function() { t.classList.add('show'); }, 10);
    setTimeout(function() {
        t.classList.remove('show');
        setTimeout(function() { if (t.parentNode) t.remove(); }, 400);
    }, 5000);
}

// ── AUTH HEADER BUTTONS ───────────────────────────────────────
function updateAuthUI() {
    var btn = document.querySelector('.auth-buttons');
    if (!btn) return;
    var user = getUser();
    if (isLoggedIn() && user) {
        btn.innerHTML =
            '<span class="user-greeting"><i class="fas fa-user-circle"></i> ' + user.name + '</span>' +
            '<button class="btn-login" onclick="logout()">Logout</button>';
    } else {
        btn.innerHTML =
            '<button class="btn-login"  onclick="openModal(\'login\')">Login</button>' +
            '<button class="btn-signup" onclick="openModal(\'signup\')">Sign Up</button>';
    }
}

// ── INJECT MODAL ──────────────────────────────────────────────
function injectModal() {
    if (document.getElementById('authModal')) return;
    var div = document.createElement('div');
    div.id = 'authModal';
    div.className = 'modal-overlay';
    div.innerHTML =
        '<div class="modal-box">' +
            '<button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>' +
            '<div class="modal-tabs">' +
                '<button class="modal-tab active" data-tab="login" onclick="switchTab(\'login\')">Login</button>' +
                '<button class="modal-tab" data-tab="signup" onclick="switchTab(\'signup\')">Sign Up</button>' +
            '</div>' +
            '<div id="loginForm" class="modal-form active">' +
                '<h2><i class="fas fa-sign-in-alt"></i> Welcome Back</h2>' +
                '<p class="modal-subtitle">Login to save favourites &amp; write reviews</p>' +
                '<form id="loginFormEl" onsubmit="handleLogin(event)">' +
                    '<div class="modal-field"><label>Email</label><input type="email" id="loginEmail" placeholder="you@example.com" required></div>' +
                    '<div class="modal-field"><label>Password</label><input type="password" id="loginPassword" placeholder="Your password" required></div>' +
                    '<p class="form-error" id="loginError"></p>' +
                    '<button type="submit" class="btn-modal-submit">Login</button>' +
                '</form>' +
                '<p class="modal-switch">No account? <a href="#" onclick="switchTab(\'signup\')">Sign Up</a></p>' +
            '</div>' +
            '<div id="signupForm" class="modal-form">' +
                '<h2><i class="fas fa-user-plus"></i> Create Account</h2>' +
                '<p class="modal-subtitle">Join to explore and save your favourite spots</p>' +
                '<form id="signupFormEl" onsubmit="handleSignup(event)">' +
                    '<div class="modal-field"><label>Full Name</label><input type="text" id="signupName" placeholder="Your name" required></div>' +
                    '<div class="modal-field"><label>Email</label><input type="email" id="signupEmail" placeholder="you@example.com" required></div>' +
                    '<div class="modal-field"><label>Password</label><input type="password" id="signupPassword" placeholder="Min. 6 characters" required></div>' +
                    '<p class="form-error" id="signupError"></p>' +
                    '<button type="submit" class="btn-modal-submit">Create Account</button>' +
                '</form>' +
                '<p class="modal-switch">Have an account? <a href="#" onclick="switchTab(\'login\')">Login</a></p>' +
            '</div>' +
        '</div>';
    document.body.appendChild(div);
    div.addEventListener('click', function(e) { if (e.target === div) closeModal(); });
}

function openModal(tab) {
    injectModal();
    var m = document.getElementById('authModal');
    m.classList.add('active');
    switchTab(tab || 'login');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    var m = document.getElementById('authModal');
    if (m) m.classList.remove('active');
    document.body.style.overflow = '';
    document.querySelectorAll('.form-error').forEach(function(e) { e.textContent = ''; });
}

function switchTab(tab) {
    document.querySelectorAll('.modal-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.modal-form').forEach(function(f) { f.classList.remove('active'); });
    var tb = document.querySelector('.modal-tab[data-tab="' + tab + '"]');
    var fm = document.getElementById(tab + 'Form');
    if (tb) tb.classList.add('active');
    if (fm) fm.classList.add('active');
}

// ── LOGIN ─────────────────────────────────────────────────────
async function handleLogin(e) {
    e.preventDefault();
    var email    = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    var errEl    = document.getElementById('loginError');
    errEl.textContent = '';
    try {
        var res  = await fetch(API + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        var data = await res.json();
        if (!data.success) { errEl.textContent = data.message; return; }
        saveToken(data.token);
        saveUser(data.user);
        closeModal();
        updateAuthUI();
        showToast('Welcome back, ' + data.user.name + '! 🎉');
    } catch(err) {
        errEl.textContent = 'Cannot reach server. Is backend running on port 5000?';
    }
}

// ── SIGNUP ────────────────────────────────────────────────────
async function handleSignup(e) {
    e.preventDefault();
    var name     = document.getElementById('signupName').value.trim();
    var email    = document.getElementById('signupEmail').value.trim();
    var password = document.getElementById('signupPassword').value;
    var errEl    = document.getElementById('signupError');
    errEl.textContent = '';
    if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
    try {
        var res  = await fetch(API + '/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password })
        });
        var data = await res.json();
        if (!data.success) { errEl.textContent = data.message; return; }
        saveToken(data.token);
        saveUser(data.user);
        closeModal();
        updateAuthUI();
        showToast('Welcome, ' + data.user.name + '! Account created 🎉');
    } catch(err) {
        errEl.textContent = 'Cannot reach server. Is backend running on port 5000?';
    }
}

// ── SEARCH (index.html only) ──────────────────────────────────
async function performSearch() {
    var input   = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    if (!input || !results) return;
    var query = input.value.trim();
    if (!query) { results.classList.remove('active'); return; }
    try {
        var res  = await fetch(API + '/destinations?search=' + encodeURIComponent(query));
        var data = await res.json();
        if (!data.success || data.count === 0) {
            results.innerHTML = '<div class="no-results"><i class="fas fa-search" style="font-size:3rem;color:#ccc;margin-bottom:1rem;display:block"></i><p>No results for "' + query + '"</p></div>';
        } else {
            results.innerHTML = data.data.map(function(d) {
                return '<div class="search-result-item" onclick="scrollToDestination(\'' + d.name.replace(/'/g, "\\'") + '\')">' +
                    '<h4>' + d.name + '</h4>' +
                    '<p><i class="fas fa-map-marker-alt"></i> ' + d.location + ' &bull; ' + d.category + '</p>' +
                    '<p>' + d.description + '</p></div>';
            }).join('');
        }
        results.classList.add('active');
    } catch(err) {
        results.innerHTML = '<div class="no-results"><p>⚠️ Backend not reachable. Run <strong>node server.js</strong> in your backend folder.</p></div>';
        results.classList.add('active');
    }
}

function scrollToDestination(name) {
    document.querySelectorAll('.destination-card').forEach(function(card) {
        var h3 = card.querySelector('h3');
        if (h3 && h3.textContent === name) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var sr = document.getElementById('searchResults');
            var si = document.getElementById('searchInput');
            if (sr) sr.classList.remove('active');
            if (si) si.value = '';
        }
    });
}

// ── BOOKING FORM ──────────────────────────────────────────────
async function handleBooking(e) {
    e.preventDefault();
    if (!isLoggedIn()) {
        showToast('Please login to book a visit.', 'info');
        openModal('login');
        return;
    }
    var btn      = e.target.querySelector('button[type="submit"]');
    var origText = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; }

    var h1       = document.querySelector('.detail-content h1');
    var destName = h1 ? h1.textContent : document.title;
    var name     = (document.getElementById('name')     || {}).value || '';
    var email    = (document.getElementById('email')    || {}).value || '';
    var phone    = (document.getElementById('phone')    || {}).value || '';
    var date     = (document.getElementById('date')     || {}).value || '';
    var visitors = (document.getElementById('visitors') || {}).value || '';
    var message  = 'Booking for: ' + destName + '\nPhone: ' + phone + '\nDate: ' + date + '\nVisitors: ' + visitors;

    try {
        var res  = await fetch(API + '/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, subject: 'Booking: ' + destName, message: message })
        });
        var data = await res.json();
        if (data.success) {
            showToast('Booking request sent! We will contact you soon. ✅');
            e.target.reset();
        } else {
            showToast(data.message || 'Booking failed.', 'error');
        }
    } catch(err) {
        showToast('Cannot reach server. Is backend running?', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = origText; }
    }
}

// ── STARS ─────────────────────────────────────────────────────
function renderStars(rating) {
    rating = parseFloat(rating) || 0;
    var full  = Math.floor(rating);
    var half  = (rating % 1 >= 0.5) ? 1 : 0;
    var empty = 5 - full - half;
    var h = '';
    for (var i = 0; i < full;  i++) h += '<i class="fas fa-star" style="color:#ffc107"></i>';
    if (half)                        h += '<i class="fas fa-star-half-alt" style="color:#ffc107"></i>';
    for (var i = 0; i < empty; i++) h += '<i class="far fa-star" style="color:#ffc107"></i>';
    return h;
}

// ── LOAD REVIEWS ─────────────────────────────────────────────
async function loadReviews(destId) {
    var container = document.getElementById('reviewsList');
    var avgEl     = document.getElementById('avgRating');
    if (!container) return;
    try {
        var r1 = await fetch(API + '/destinations/' + destId);
        var r2 = await fetch(API + '/destinations/' + destId + '/reviews');
        var d1 = await r1.json();
        var d2 = await r2.json();

        if (d1.success && avgEl) {
            var avg   = d1.data.average || 0;
            var total = d1.data.total   || 0;
            avgEl.innerHTML =
                '<span>' + renderStars(avg) + '</span>' +
                '<span style="font-weight:600;margin-left:6px">' + (avg > 0 ? parseFloat(avg).toFixed(1) : 'No ratings yet') + '</span>' +
                '<span style="color:#999;font-size:.9rem;margin-left:6px">(' + total + ' review' + (total !== 1 ? 's' : '') + ')</span>';
        }

        if (!d2.success || d2.count === 0) {
            container.innerHTML = '<p style="color:#999;text-align:center;padding:1.5rem">No reviews yet. Be the first!</p>';
            return;
        }
        container.innerHTML = d2.data.map(function(r) {
            return '<div class="review-card">' +
                '<div class="review-header">' +
                    '<strong>' + r.user_name + '</strong>' +
                    '<span style="margin-left:8px">' + renderStars(r.rating) + '</span>' +
                    '<span style="color:#999;font-size:.85rem;margin-left:8px">' + new Date(r.created_at).toLocaleDateString('en-IN') + '</span>' +
                '</div>' +
                (r.comment ? '<p class="review-comment">' + r.comment + '</p>' : '') +
                '</div>';
        }).join('');
    } catch(err) {
        container.innerHTML = '<p style="color:#999">Could not load reviews.</p>';
    }
}

// ── SUBMIT REVIEW ─────────────────────────────────────────────
async function submitReview(destId, e) {
    e.preventDefault();
    if (!isLoggedIn()) {
        showToast('Please login to submit a review.', 'info');
        openModal('login');
        return;
    }
    var ratingEl  = document.querySelector('input[name="rating"]:checked');
    var commentEl = document.getElementById('reviewComment');
    var errEl     = document.getElementById('reviewError');
    var rating    = ratingEl ? parseInt(ratingEl.value) : 0;
    var comment   = commentEl ? commentEl.value.trim() : '';
    if (!rating) { if (errEl) errEl.textContent = 'Please select a star rating.'; return; }
    if (errEl) errEl.textContent = '';
    try {
        var res  = await fetch(API + '/destinations/' + destId + '/reviews', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ rating: rating, comment: comment })
        });
        var data = await res.json();
        if (!data.success) { if (errEl) errEl.textContent = data.message; return; }
        showToast(data.message);
        e.target.reset();
        loadReviews(destId);
    } catch(err) {
        if (errEl) errEl.textContent = 'Could not submit review.';
    }
}

// ── INJECT REVIEWS SECTION ────────────────────────────────────
function injectReviewsSection(destId) {
    var bookingSection = document.querySelector('.booking-section');
    if (!bookingSection) return;
    if (document.getElementById('reviewsSection')) return;

    var section = document.createElement('div');
    section.id = 'reviewsSection';
    section.className = 'reviews-section';
    section.innerHTML =
        '<h2><i class="fas fa-star" style="color:#ffc107;margin-right:8px"></i>Visitor Reviews</h2>' +
        '<div id="avgRating" style="display:flex;align-items:center;gap:6px;margin-bottom:1.5rem;font-size:1.05rem"></div>' +
        '<div id="reviewsList"><p style="color:#999;text-align:center;padding:1rem">Loading reviews...</p></div>' +
        '<div class="review-form-section">' +
            '<h3>Write a Review</h3>' +
            '<form id="reviewForm" onsubmit="submitReview(' + destId + ', event)">' +
                '<div class="star-rating">' +
                    '<input type="radio" id="s5" name="rating" value="5"><label for="s5">★</label>' +
                    '<input type="radio" id="s4" name="rating" value="4"><label for="s4">★</label>' +
                    '<input type="radio" id="s3" name="rating" value="3"><label for="s3">★</label>' +
                    '<input type="radio" id="s2" name="rating" value="2"><label for="s2">★</label>' +
                    '<input type="radio" id="s1" name="rating" value="1"><label for="s1">★</label>' +
                '</div>' +
                '<div style="margin-bottom:1rem">' +
                    '<textarea id="reviewComment" rows="3" placeholder="Share your experience (optional)" ' +
                        'style="width:100%;padding:.75rem;border:2px solid #e0e0e0;border-radius:8px;font-family:inherit;font-size:1rem;resize:vertical;transition:border-color .3s" ' +
                        'onfocus="this.style.borderColor=\'#667eea\'" onblur="this.style.borderColor=\'#e0e0e0\'"></textarea>' +
                '</div>' +
                '<p class="form-error" id="reviewError"></p>' +
                '<button type="submit" class="btn-submit" style="width:auto;padding:.75rem 2rem">' +
                    '<i class="fas fa-paper-plane"></i> Submit Review' +
                '</button>' +
            '</form>' +
        '</div>';

    bookingSection.parentNode.insertBefore(section, bookingSection);
    loadReviews(destId);
}

// ── DOM READY ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

    injectModal();
    updateAuthUI();

    // Search bar (index page)
    var si = document.getElementById('searchInput');
    if (si) {
        si.addEventListener('input', performSearch);
        si.addEventListener('keypress', function(e) { if (e.key === 'Enter') performSearch(); });
    }

    // Close search on outside click
    document.addEventListener('click', function(e) {
        var sc = document.querySelector('.search-container');
        var sr = document.getElementById('searchResults');
        if (sc && sr && !sc.contains(e.target) && !sr.contains(e.target))
            sr.classList.remove('active');
    });

    // Scroll reveal (index page cards)
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(en) {
            if (en.isIntersecting) {
                en.target.style.opacity   = '1';
                en.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.destination-card').forEach(function(card) {
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        obs.observe(card);
    });

    // Smooth anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
        a.addEventListener('click', function(e) {
            var t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    // Detail pages: match filename to destination ID and inject reviews
    var pageMap = {
        'kanaka_durga_temple.html': 1,
        'narasimhatemple.html':     2,
        'undavallicaves.html':      3,
        'kondaveedufort.html':      4,
        'kondapallifort.html':      5,
        'butterflygarden.html':     6,
        'uppalapadu.html':          7,
        'suryalankabeach.html':     8,
        'manginapudibeach.html':    9
    };
    var filename = window.location.pathname.split('/').pop();
    var destId   = pageMap[filename];
    if (destId) injectReviewsSection(destId);
});

// pulse keyframe
var _s = document.createElement('style');
_s.textContent = '@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05);box-shadow:0 20px 50px rgba(102,126,234,.3)}100%{transform:scale(1)}}';
document.head.appendChild(_s);

// ─────────────────────────────────────────────────────────────
//  APPLE-STYLE MODAL — premium glassmorphism design
//  Persists via sessionStorage so Live Server reloads won't kill it
// ─────────────────────────────────────────────────────────────
function showAppleModal(type, data) {
    // Save to sessionStorage so modal survives page reloads
    sessionStorage.setItem('abm_pending', JSON.stringify({ type, data }));
    _renderAppleModal(type, data);
}

function _renderAppleModal(type, data) {
    const old = document.getElementById('apple-booking-modal');
    if (old) old.remove();

    injectAppleModalStyles();

    const isSuccess = type === 'success';

    const overlay = document.createElement('div');
    overlay.id = 'apple-booking-modal';
    overlay.innerHTML = `
        <div class="abm-backdrop"></div>
        <div class="abm-card ${isSuccess ? 'abm-success' : 'abm-error'}">

            <!-- Animated Icon -->
            <div class="abm-icon-wrap">
                ${isSuccess ? `
                <div class="abm-icon-circle abm-icon-success">
                    <svg class="abm-svg-check" viewBox="0 0 52 52">
                        <circle class="abm-svg-circle" cx="26" cy="26" r="24" fill="none"/>
                        <path class="abm-svg-path" fill="none" d="M15 27l7 7 15-15"/>
                    </svg>
                </div>` : `
                <div class="abm-icon-circle abm-icon-fail">
                    <svg class="abm-svg-cross" viewBox="0 0 52 52">
                        <circle class="abm-svg-circle-fail" cx="26" cy="26" r="24" fill="none"/>
                        <path class="abm-svg-path-fail" fill="none" d="M17 17l18 18"/>
                        <path class="abm-svg-path-fail abm-svg-path-fail2" fill="none" d="M35 17l-18 18"/>
                    </svg>
                </div>`}
            </div>

            <!-- Title -->
            <h2 class="abm-title">${isSuccess ? 'Booking Confirmed' : 'Booking Failed'}</h2>
            <p class="abm-subtitle">${data.dest || ''}</p>

            ${isSuccess ? `
            <!-- Reference Pill -->
            <div class="abm-ref-pill">
                <span class="abm-ref-label">REFERENCE</span>
                <span class="abm-ref-value">${data.ref}</span>
            </div>

            <!-- Details List -->
            <div class="abm-details">
                ${data.name ? `
                <div class="abm-detail-item">
                    <span class="abm-detail-label">Name</span>
                    <span class="abm-detail-value">${data.name}</span>
                </div>` : ''}
                ${data.date ? `
                <div class="abm-detail-item">
                    <span class="abm-detail-label">Date</span>
                    <span class="abm-detail-value">${new Date(data.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>` : ''}
                ${data.email ? `
                <div class="abm-detail-item">
                    <span class="abm-detail-label">Email</span>
                    <span class="abm-detail-value">${data.email}</span>
                </div>` : ''}
                ${data.phone ? `
                <div class="abm-detail-item">
                    <span class="abm-detail-label">Phone</span>
                    <span class="abm-detail-value">${data.phone}</span>
                </div>` : ''}
            </div>

            <p class="abm-confirm-note">A confirmation has been sent to your email.</p>
            ` : `
            <!-- Error Message -->
            <div class="abm-error-box">
                <p>${data.message}</p>
            </div>
            <p class="abm-confirm-note">Please check your details and try again.</p>
            `}

            <!-- Button -->
            <button class="abm-btn ${isSuccess ? 'abm-btn-success' : 'abm-btn-retry'}" onclick="closeAppleModal()">
                ${isSuccess ? 'Done' : 'Try Again'}
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Trigger entrance animations
    requestAnimationFrame(() => {
        overlay.classList.add('abm-visible');
    });
}

function closeAppleModal() {
    // Clear saved data so it won't re-show on next reload
    sessionStorage.removeItem('abm_pending');
    const modal = document.getElementById('apple-booking-modal');
    if (!modal) return;
    modal.classList.add('abm-closing');
    setTimeout(() => modal.remove(), 300);
}

// Re-show modal after Live Server auto-reload
window.addEventListener('DOMContentLoaded', () => {
    const saved = sessionStorage.getItem('abm_pending');
    if (saved) {
        try {
            const { type, data } = JSON.parse(saved);
            _renderAppleModal(type, data);
        } catch(e) {
            sessionStorage.removeItem('abm_pending');
        }
    }
});

function injectAppleModalStyles() {
    if (document.getElementById('abm-styles')) return;
    const s = document.createElement('style');
    s.id = 'abm-styles';
    s.textContent = `
        /* ── Modal Container ─────────────────────────── */
        #apple-booking-modal {
            position: fixed; inset: 0; z-index: 100000;
            display: flex; align-items: center; justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        #apple-booking-modal.abm-visible { opacity: 1; }
        #apple-booking-modal.abm-closing { opacity: 0; pointer-events: none; }

        /* ── Backdrop ────────────────────────────────── */
        .abm-backdrop {
            position: absolute; inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        /* ── Card ────────────────────────────────────── */
        .abm-card {
            position: relative;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border-radius: 24px;
            padding: 3rem 2.5rem 2.5rem;
            max-width: 400px;
            width: calc(100% - 3rem);
            text-align: center;
            box-shadow:
                0 0 0 0.5px rgba(0, 0, 0, 0.05),
                0 25px 70px rgba(0, 0, 0, 0.15),
                0 6px 20px rgba(0, 0, 0, 0.08);
            transform: scale(0.9) translateY(20px);
            transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .abm-visible .abm-card {
            transform: scale(1) translateY(0);
        }
        .abm-closing .abm-card {
            transform: scale(0.95) translateY(10px);
        }

        /* ── Animated Icon ───────────────────────────── */
        .abm-icon-wrap {
            margin-bottom: 1.5rem;
            display: flex; justify-content: center;
        }
        .abm-icon-circle {
            width: 72px; height: 72px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
        }
        .abm-icon-success {
            background: linear-gradient(145deg, #34C759, #30B350);
            box-shadow: 0 8px 24px rgba(52, 199, 89, 0.35);
            animation: abmPulseGreen 2s ease infinite;
        }
        .abm-icon-fail {
            background: linear-gradient(145deg, #FF3B30, #E5342B);
            box-shadow: 0 8px 24px rgba(255, 59, 48, 0.35);
            animation: abmPulseRed 2s ease infinite;
        }

        @keyframes abmPulseGreen {
            0%, 100% { box-shadow: 0 8px 24px rgba(52, 199, 89, 0.35); }
            50%      { box-shadow: 0 8px 32px rgba(52, 199, 89, 0.5); }
        }
        @keyframes abmPulseRed {
            0%, 100% { box-shadow: 0 8px 24px rgba(255, 59, 48, 0.35); }
            50%      { box-shadow: 0 8px 32px rgba(255, 59, 48, 0.5); }
        }

        /* Success checkmark SVG */
        .abm-svg-check { width: 36px; height: 36px; }
        .abm-svg-circle {
            stroke: rgba(255,255,255,0.35); stroke-width: 2;
            stroke-dasharray: 151; stroke-dashoffset: 151;
            animation: abmDraw 0.6s 0.2s cubic-bezier(0.65,0,0.45,1) forwards;
        }
        .abm-svg-path {
            stroke: white; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round;
            stroke-dasharray: 36; stroke-dashoffset: 36;
            animation: abmDraw 0.4s 0.6s cubic-bezier(0.65,0,0.45,1) forwards;
        }

        /* Failure cross SVG */
        .abm-svg-cross { width: 32px; height: 32px; }
        .abm-svg-circle-fail {
            stroke: rgba(255,255,255,0.35); stroke-width: 2;
            stroke-dasharray: 151; stroke-dashoffset: 151;
            animation: abmDraw 0.6s 0.2s cubic-bezier(0.65,0,0.45,1) forwards;
        }
        .abm-svg-path-fail {
            stroke: white; stroke-width: 3.5; stroke-linecap: round;
            stroke-dasharray: 26; stroke-dashoffset: 26;
            animation: abmDraw 0.35s 0.6s cubic-bezier(0.65,0,0.45,1) forwards;
        }
        .abm-svg-path-fail2 {
            animation-delay: 0.75s;
        }

        @keyframes abmDraw { to { stroke-dashoffset: 0; } }

        /* ── Title ───────────────────────────────────── */
        .abm-title {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Poppins', sans-serif;
            font-size: 1.45rem;
            font-weight: 700;
            color: #1d1d1f;
            margin: 0 0 0.2rem;
            letter-spacing: -0.02em;
        }
        .abm-subtitle {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Poppins', sans-serif;
            font-size: 0.95rem;
            color: #86868b;
            font-weight: 400;
            margin: 0 0 1.5rem;
        }

        /* ── Reference Pill ──────────────────────────── */
        .abm-ref-pill {
            display: inline-flex; flex-direction: column; align-items: center;
            background: #f5f5f7;
            border-radius: 14px;
            padding: 0.8rem 1.8rem;
            margin-bottom: 1.5rem;
        }
        .abm-ref-label {
            font-size: 0.65rem;
            font-weight: 600;
            color: #86868b;
            letter-spacing: 1.5px;
            margin-bottom: 0.25rem;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        }
        .abm-ref-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: #1d1d1f;
            letter-spacing: 1.5px;
            font-family: 'SF Mono', 'Menlo', 'Courier New', monospace;
        }

        /* ── Details List ────────────────────────────── */
        .abm-details {
            background: #f5f5f7;
            border-radius: 14px;
            padding: 0.2rem 0;
            margin-bottom: 1.2rem;
            overflow: hidden;
        }
        .abm-detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1.2rem;
        }
        .abm-detail-item + .abm-detail-item {
            border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        .abm-detail-label {
            font-size: 0.85rem;
            color: #86868b;
            font-weight: 500;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Poppins', sans-serif;
        }
        .abm-detail-value {
            font-size: 0.85rem;
            color: #1d1d1f;
            font-weight: 600;
            text-align: right;
            max-width: 60%;
            word-break: break-word;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Poppins', sans-serif;
        }

        /* ── Confirmation Note ───────────────────────── */
        .abm-confirm-note {
            font-size: 0.8rem;
            color: #86868b;
            margin: 0 0 1.5rem;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Poppins', sans-serif;
        }

        /* ── Error Box ───────────────────────────────── */
        .abm-error-box {
            background: rgba(255, 59, 48, 0.06);
            border-radius: 14px;
            padding: 1rem 1.2rem;
            margin-bottom: 1.2rem;
        }
        .abm-error-box p {
            font-size: 0.88rem;
            color: #FF3B30;
            margin: 0;
            line-height: 1.5;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Poppins', sans-serif;
        }

        /* ── Buttons ─────────────────────────────────── */
        .abm-btn {
            display: inline-block;
            width: 100%;
            padding: 0.9rem 2rem;
            border: none;
            border-radius: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Poppins', sans-serif;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            letter-spacing: -0.01em;
        }
        .abm-btn:active { transform: scale(0.97); }
        .abm-btn-success {
            background: #007AFF;
            color: white;
        }
        .abm-btn-success:hover {
            background: #0066d6;
            box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
        }
        .abm-btn-retry {
            background: #FF3B30;
            color: white;
        }
        .abm-btn-retry:hover {
            background: #e5342b;
            box-shadow: 0 4px 16px rgba(255, 59, 48, 0.3);
        }

        /* ── Responsive ──────────────────────────────── */
        @media (max-width: 480px) {
            .abm-card { padding: 2rem 1.5rem 1.8rem; border-radius: 20px; }
            .abm-title { font-size: 1.25rem; }
            .abm-ref-value { font-size: 1.05rem; }
        }
    `;
    document.head.appendChild(s);
}
