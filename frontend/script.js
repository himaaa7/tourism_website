// =============================================================
//  Tricity Tourism Hub — script.js
//  Works on index.html AND all destination detail pages
// =============================================================

const API = 'http://localhost:5000/api';

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
    }, 3500);
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
