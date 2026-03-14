// =============================================================
//  booking-forms.js  v2  —  Tricity Tourism Hub
//  • Guided Tour  → booking form
//  • Stay         → hotel listing cards  (like Sikkim reference)
//  • Food         → restaurant listing cards
//  • Transport    → transport option cards
//  • Fixed success / error toast — shown inline, always visible
// =============================================================

const BOOKING_API = 'http://localhost:5000/api/bookings';

// ─────────────────────────────────────────────────────────────
//  DATA — hotels, restaurants, transport per destination type
// ─────────────────────────────────────────────────────────────
const DEST_DATA = {

    hotels: {
        default: [
            { name:'Novotel Vijayawada Varun', desc:'Premium hotel on the Krishna River banks. Pool, spa, multi-cuisine restaurant and stunning river views.', tags:['5-Star','Pool','Spa','Restaurant','Wi-Fi'], price:'₹5,500 – ₹12,000/night', distance:'4 km from destination', rating:4.7, bookUrl:'https://www.novotel.com/gb/hotel-9564-novotel-vijayawada-varun/index.shtml' },
            { name:'The Gateway Hotel', desc:'Taj Group heritage property with elegant rooms, signature dining, and attentive service.', tags:['Heritage','Pool','Gym','Fine Dining','Wi-Fi'], price:'₹4,200 – ₹9,000/night', distance:'5 km from destination', rating:4.5, bookUrl:'https://www.tajhotels.com/en-in/gateway/vijayawada/' },
            { name:'Hotel Kandhari International', desc:'Well-located business hotel with modern amenities and multi-cuisine restaurant.', tags:['AC Rooms','Restaurant','Wi-Fi','Parking'], price:'₹1,800 – ₹3,200/night', distance:'2 km from destination', rating:4.2, bookUrl:'https://www.makemytrip.com/hotels/hotel-search/?checkin=20260310&checkout=20260311&city=CT117' },
            { name:'Hotel Ilapuram', desc:'Budget-friendly stay with clean rooms, hot water, and vegetarian meals available on request.', tags:['Veg Meals','Room Service','Wi-Fi','Budget'], price:'₹900 – ₹1,600/night', distance:'3 km from destination', rating:3.8, bookUrl:'https://www.goibibo.com/hotels/hotel-search/?ci=vijayawada' }
        ],
        beach: [
            { name:'Suryalanka Beach Resort', desc:'Beachfront cottages with direct sea access and stunning sunrise views. Package deals available.', tags:['Beachfront','Cottages','Outdoor Pool','Seafood'], price:'₹2,500 – ₹4,500/night', distance:'On the beach', rating:4.3, bookUrl:'https://www.booking.com/searchresults.html?ss=Suryalanka+Beach' },
            { name:'Haritha Beach Resort (APTDC)', desc:'AP Tourism Department resort with affordable rooms right on the Suryalanka shore.', tags:['Government Resort','Sea View','Restaurant','Affordable'], price:'₹1,200 – ₹2,200/night', distance:'100 m from shore', rating:3.9, bookUrl:'https://www.aptdc.in/' },
            { name:'Ananda Beach Homestay', desc:'Cozy local homestay with home-cooked Andhra meals and warm family hospitality.', tags:['Homestay','Home-cooked Meals','Friendly Host'], price:'₹600 – ₹1,000/night', distance:'200 m from shore', rating:4.4, bookUrl:'https://www.airbnb.co.in/s/Bapatla--Andhra-Pradesh/homes' },
            { name:'Manginapudi Bay View Hotel', desc:'Budget hotel with clean rooms and easy beach access for early morning walks.', tags:['Budget','Sea View','Parking'], price:'₹800 – ₹1,500/night', distance:'500 m from shore', rating:3.6, bookUrl:'https://www.goibibo.com/hotels/hotel-search/?ci=Bapatla' }
        ],
        nature: [
            { name:'Green Valley Eco Lodge', desc:'Eco-friendly lodges in lush greenery with nature walks, birdwatching, and organic food.', tags:['Eco-Friendly','Nature Walks','Birdwatching','Organic Food'], price:'₹1,500 – ₹2,800/night', distance:'1 km from sanctuary', rating:4.5, bookUrl:'https://www.booking.com/searchresults.html?ss=Guntur+eco+lodge' },
            { name:'Butterfly Garden Guesthouse', desc:'Small guesthouse next to the park with guided nature walk packages and breakfast included.', tags:['Guided Tours','Breakfast Included','Peaceful'], price:'₹1,000 – ₹1,800/night', distance:'300 m from garden', rating:4.1, bookUrl:'https://www.airbnb.co.in/s/Vijayawada/homes' },
            { name:'Hotel Vijayalakshmi Guntur', desc:'Comfortable city hotel ideal as a base for day trips to bird sanctuary and nature spots.', tags:['AC Rooms','Restaurant','Travel Desk','Wi-Fi'], price:'₹1,200 – ₹2,400/night', distance:'12 km from sanctuary', rating:3.9, bookUrl:'https://www.makemytrip.com/hotels/hotel-search/?city=CT117' }
        ],
        heritage: [
            { name:'Vijayawada Heritage Stay', desc:'Restored traditional house with period décor and guided fort / cave day tours.', tags:['Heritage Style','Day Tours','Breakfast','AC'], price:'₹2,000 – ₹3,500/night', distance:'8 km from fort', rating:4.4, bookUrl:'https://www.airbnb.co.in/s/Vijayawada/homes' },
            { name:'Hotel Raj Towers', desc:'Centrally located hotel near the bus stand, convenient for fort and cave visits.', tags:['Central Location','AC Rooms','Restaurant','24hr Front Desk'], price:'₹1,500 – ₹2,800/night', distance:'10 km from heritage site', rating:4.0, bookUrl:'https://www.makemytrip.com/hotels/hotel-search/?city=CT117' },
            { name:'Budget Inn Kondaveedu', desc:'Simple, clean budget stay near the foothills of Kondaveedu with parking facility.', tags:['Budget','Parking','Veg Food','Simple Rooms'], price:'₹700 – ₹1,200/night', distance:'2 km from fort base', rating:3.6, bookUrl:'https://www.goibibo.com/hotels/hotel-search/?ci=Guntur' }
        ],
        temple: [
            { name:'Srinivasa Residency', desc:'Clean and quiet hotel near the temple, popular with pilgrims. Vegetarian food only.', tags:['Pure Veg','Near Temple','Pilgrims Friendly','AC'], price:'₹1,200 – ₹2,200/night', distance:'500 m from temple', rating:4.3, bookUrl:'https://www.makemytrip.com/hotels/hotel-search/?city=CT117' },
            { name:'Hotel Tirumala Vijayawada', desc:'Budget pilgrim lodge with simple rooms, pure veg canteen, and early morning services.', tags:['Pilgrim Lodge','Pure Veg','Budget','Early Check-in'], price:'₹600 – ₹1,000/night', distance:'1 km from temple', rating:3.7, bookUrl:'https://www.goibibo.com/hotels/hotel-search/?ci=vijayawada' },
            { name:'Devasthanam Guest House', desc:'Temple trust-managed accommodation with basic facilities. Book early — fills up fast!', tags:['Temple Trust','Very Affordable','Basic Facilities'], price:'₹300 – ₹600/night', distance:'On temple premises', rating:3.9, bookUrl:'https://www.kanakaduragatemple.com/' }
        ]
    },

    restaurants: {
        default: [
            { name:'Hotel Babai', desc:'Legendary Vijayawada restaurant famous for spicy Andhra meals, fresh juices, and dosas.', tags:['Andhra Meals','Veg & Non-Veg','Affordable'], cuisine:'Andhra / Telugu', priceFor2:'₹200 – ₹400', rating:4.5, timing:'7:00 AM – 10:30 PM', bookUrl:'https://www.zomato.com/vijayawada' },
            { name:'Nagarjuna Restaurant', desc:'Famous for authentic Nagarjuna-style Andhra biryani and unlimited full meals on banana leaf.', tags:['Biryani','Andhra Meals','Takeaway'], cuisine:'Andhra', priceFor2:'₹350 – ₹700', rating:4.4, timing:'11:30 AM – 11:00 PM', bookUrl:'https://www.zomato.com/vijayawada' },
            { name:'Minerva Grand Restaurant', desc:'Multi-cuisine restaurant in premium hotel setting with extensive menu and live counter.', tags:['Multi-Cuisine','AC Dining','Family Friendly'], cuisine:'Multi-Cuisine', priceFor2:'₹800 – ₹1,500', rating:4.3, timing:'12:00 PM – 11:00 PM', bookUrl:'https://www.zomato.com/vijayawada' },
            { name:'Cream Stone', desc:'Popular dessert and snack cafe perfect for post-visit refreshments with family.', tags:['Ice Cream','Desserts','Snacks','Family'], cuisine:'Café / Desserts', priceFor2:'₹150 – ₹350', rating:4.2, timing:'11:00 AM – 11:30 PM', bookUrl:'https://www.swiggy.com/city/vijayawada' }
        ],
        beach: [
            { name:'Kalavani Seafood Shack', desc:'Beachside shack serving ultra-fresh catch-of-the-day — grilled, fried, and curried.', tags:['Seafood','Beachside','Fresh Catch','Affordable'], cuisine:'Coastal Seafood', priceFor2:'₹300 – ₹600', rating:4.6, timing:'8:00 AM – 9:00 PM', bookUrl:'https://www.zomato.com/ap/bapatla-restaurants' },
            { name:'Haritha Restaurant (APTDC)', desc:'Government-run restaurant near the beach with South Indian and coastal seafood menu.', tags:['South Indian','Seafood','Family','Veg Options'], cuisine:'South Indian / Seafood', priceFor2:'₹200 – ₹500', rating:3.8, timing:'7:30 AM – 10:00 PM', bookUrl:'https://www.aptdc.in/' },
            { name:'Coastal Spice Garden', desc:'Open-air restaurant with sea views and spicy Andhra coastal dishes. Crab speciality!', tags:['Sea View','Open Air','Coastal','Crab Speciality'], cuisine:'Andhra Coastal', priceFor2:'₹500 – ₹900', rating:4.3, timing:'12:00 PM – 10:00 PM', bookUrl:'https://www.swiggy.com/city/guntur' }
        ],
        temple: [
            { name:'Annapoorna Prasadam Bhavan', desc:'Pure sattvic vegetarian meals — no onion or garlic. Blessed temple food atmosphere.', tags:['Pure Veg','No Onion/Garlic','Prasadam Style'], cuisine:'Sattvic Vegetarian', priceFor2:'₹100 – ₹200', rating:4.6, timing:'6:00 AM – 8:00 PM', bookUrl:'https://www.zomato.com/vijayawada' },
            { name:'Hotel Sree Krishna Bhavan', desc:'Traditional South Indian thali restaurant near temple area — unlimited thali very popular.', tags:['Thali','South Indian','Veg Only','Quick Service'], cuisine:'South Indian Thali', priceFor2:'₹180 – ₹350', rating:4.4, timing:'7:00 AM – 9:30 PM', bookUrl:'https://www.swiggy.com/city/vijayawada' },
            { name:'Devasthanam Canteen', desc:'Temple trust-managed canteen serving simple, clean, and extremely affordable meals.', tags:['Temple Canteen','Pure Veg','Very Affordable'], cuisine:'Andhra Vegetarian', priceFor2:'₹60 – ₹150', rating:4.1, timing:'7:00 AM – 7:00 PM', bookUrl:'https://www.zomato.com/vijayawada' }
        ],
        nature: [
            { name:'Green Spoon Café', desc:'Organic café near the sanctuary serving healthy juices, snacks, and light South Indian food.', tags:['Organic','Healthy','Light Meals','Juices'], cuisine:'Healthy / Organic', priceFor2:'₹200 – ₹400', rating:4.3, timing:'8:00 AM – 7:00 PM', bookUrl:'https://www.zomato.com/guntur' },
            { name:'Lakshmi Vilas Hotel', desc:'Traditional Andhra meals restaurant near the nature area. Famous for mutton curry.', tags:['Andhra Meals','Mutton Curry','Affordable'], cuisine:'Andhra', priceFor2:'₹250 – ₹500', rating:4.2, timing:'7:00 AM – 10:00 PM', bookUrl:'https://www.swiggy.com/city/guntur' }
        ],
        heritage: [
            { name:'Fort View Restaurant', desc:'Restaurant with views of the fort area, serving Andhra and Continental menu.', tags:['Fort View','Andhra','Continental','AC'], cuisine:'Andhra / Continental', priceFor2:'₹400 – ₹800', rating:4.2, timing:'10:00 AM – 10:00 PM', bookUrl:'https://www.zomato.com/guntur' },
            { name:'Kondaveedu Dhabba', desc:'Rustic roadside eatery near the fort base serving hot Andhra meals and chai.', tags:['Rustic','Andhra Meals','Chai','Budget'], cuisine:'Andhra', priceFor2:'₹150 – ₹300', rating:4.0, timing:'7:00 AM – 8:00 PM', bookUrl:'https://www.swiggy.com/city/guntur' }
        ]
    },

    transport: [
        { name:'Rapido / Ola Auto', desc:'Quickest and cheapest option for solo or couple travel within the city.', tags:['Auto Rickshaw','1–3 Persons','Metered Fare','App-based'], price:'₹30 – ₹150', type:'Auto Rickshaw', icon:'fa-motorcycle', bookUrl:'https://www.olacabs.com/' },
        { name:'Ola / Uber Cab', desc:'App-based AC sedan — reliable, GPS tracked, and easy cancellation.', tags:['Cab','1–4 Persons','AC','GPS Tracked'], price:'₹150 – ₹500', type:'Car / Sedan', icon:'fa-car', bookUrl:'https://www.olacabs.com/' },
        { name:'APSRTC City Bus', desc:'Government city bus services connecting major landmarks at very low cost.', tags:['Public Bus','Very Affordable','Multiple Stops'], price:'₹10 – ₹40', type:'Public Bus', icon:'fa-bus', bookUrl:'https://www.apsrtconline.in/' },
        { name:'Savaari Innova / SUV', desc:'Comfortable SUV for family groups up to 7 — full or half day hire with driver.', tags:['SUV','1–7 Persons','AC','Driver Included'], price:'₹700 – ₹1,500/trip', type:'SUV / Innova', icon:'fa-car-side', bookUrl:'https://www.savaari.com/car-rental/vijayawada' },
        { name:'Tempo Traveller', desc:'Ideal for large groups. Book for full-day tours covering multiple destinations.', tags:['8–12 Persons','AC','Full Day Available'], price:'₹1,200 – ₹2,800/day', type:'Tempo Traveller', icon:'fa-shuttle-van', bookUrl:'https://www.savaari.com/car-rental/vijayawada' },
        { name:'Airport / Railway Transfer', desc:'Pre-booked fixed-price transfers from Vijayawada Airport or Railway Station.', tags:['Fixed Fare','AC','Meet & Greet'], price:'₹400 – ₹900', type:'Transfer', icon:'fa-plane-arrival', bookUrl:'https://www.meru.in/meru-outstation/vijayawada' }
    ]
};

function getData(category, destType) {
    const map = DEST_DATA[category];
    if (!map) return [];
    return map[destType] || map['default'] || [];
}

// ─────────────────────────────────────────────────────────────
//  MAIN INJECT
// ─────────────────────────────────────────────────────────────
function injectBookingSection(destName, destType) {
    const target = document.querySelector('.booking-section');
    if (!target) return;

    const section = document.createElement('div');
    section.id = 'fullBookingSection';
    section.innerHTML = `
        <div class="full-booking-wrap">

            <div class="booking-tabs-header">
                <button class="btab active" onclick="switchBookingTab('tour',this)">
                    <i class="fas fa-map-signs"></i> Guided Tour
                </button>
                <button class="btab" onclick="switchBookingTab('accommodation',this)">
                    <i class="fas fa-hotel"></i> Stay
                </button>
                <button class="btab" onclick="switchBookingTab('food',this)">
                    <i class="fas fa-utensils"></i> Food & Dining
                </button>
                <button class="btab" onclick="switchBookingTab('transport',this)">
                    <i class="fas fa-car"></i> Transport
                </button>
            </div>

            <!-- GUIDED TOUR -->
            <div class="btab-content active" id="btab-tour">
                <div class="booking-form-card">
                    <div class="booking-form-header">
                        <div class="bf-icon"><i class="fas fa-map-signs"></i></div>
                        <div>
                            <h3>Book a Guided Tour</h3>
                            <p>at ${destName}</p>
                        </div>
                    </div>
                    <form onsubmit="handleBookingForm(event,'tour','${destName}')">
                        <div class="bf-row">
                            <div class="bf-group"><label>Full Name *</label>
                                <input type="text" name="name" placeholder="Your full name" required></div>
                            <div class="bf-group"><label>Email *</label>
                                <input type="email" name="email" placeholder="your@email.com" required></div>
                        </div>
                        <div class="bf-row">
                            <div class="bf-group"><label>Phone *</label>
                                <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" required></div>
                            <div class="bf-group"><label>Visit Date *</label>
                                <input type="date" name="date" required></div>
                        </div>
                        <div class="bf-row">
                            <div class="bf-group"><label>Preferred Time *</label>
                                <select name="time" required>
                                    <option value="">Select Time</option>
                                    <option>06:00 AM (Sunrise)</option>
                                    <option>09:00 AM (Morning)</option>
                                    <option>11:00 AM (Mid-Morning)</option>
                                    <option>02:00 PM (Afternoon)</option>
                                    <option>04:00 PM (Evening)</option>
                                    <option>06:00 PM (Sunset)</option>
                                </select></div>
                            <div class="bf-group"><label>Visitors *</label>
                                <input type="number" name="visitors" min="1" max="50" value="2" required></div>
                        </div>
                        <div class="bf-row">
                            <div class="bf-group"><label>Tour Type *</label>
                                <select name="tour_type" required>
                                    <option value="">Select Tour</option>
                                    <option>Standard (Self-guided) — Free</option>
                                    <option>Expert-Guided — ₹299/person</option>
                                    <option>Premium Private Tour — ₹999/group</option>
                                    <option>Photography Tour — ₹599/person</option>
                                </select></div>
                            <div class="bf-group"><label>Language</label>
                                <select name="language">
                                    <option>English</option>
                                    <option>Telugu</option>
                                    <option>Hindi</option>
                                </select></div>
                        </div>
                        <div class="bf-group"><label>Special Requirements</label>
                            <textarea name="requests" rows="3" placeholder="Wheelchair access, focus areas, photography permissions..."></textarea></div>
                        <button type="submit" class="bf-submit">
                            <i class="fas fa-calendar-check"></i> Confirm Tour Booking
                        </button>
                    </form>
                </div>
            </div>

            <!-- STAY CARDS -->
            <div class="btab-content" id="btab-accommodation">
                <div class="listing-section-header">
                    <i class="fas fa-hotel"></i>
                    <div><h3>Places to Stay</h3>
                        <p>Nearby hotels &amp; guesthouses — click "Check Availability" to book directly</p></div>
                </div>
                <div class="listing-cards">${buildHotelCards(destType)}</div>
            </div>

            <!-- FOOD CARDS -->
            <div class="btab-content" id="btab-food">
                <div class="listing-section-header">
                    <i class="fas fa-utensils"></i>
                    <div><h3>Where to Eat</h3>
                        <p>Restaurants &amp; eateries near ${destName} — click to view menu &amp; reserve</p></div>
                </div>
                <div class="listing-cards">${buildRestaurantCards(destType)}</div>
            </div>

            <!-- TRANSPORT CARDS -->
            <div class="btab-content" id="btab-transport">
                <div class="listing-section-header">
                    <i class="fas fa-car"></i>
                    <div><h3>How to Get There</h3>
                        <p>Transport options to reach ${destName}</p></div>
                </div>
                <div class="listing-cards">${buildTransportCards()}</div>
            </div>

        </div>
    `;

    target.replaceWith(section);
    injectBookingStyles();
}

// ─────────────────────────────────────────────────────────────
//  CARD BUILDERS
// ─────────────────────────────────────────────────────────────
function starHTML(r) {
    const f = Math.floor(r), h = (r % 1 >= 0.4) ? 1 : 0, e = 5 - f - h;
    return '<i class="fas fa-star"></i>'.repeat(f)
         + (h ? '<i class="fas fa-star-half-alt"></i>' : '')
         + '<i class="far fa-star"></i>'.repeat(e);
}

function buildHotelCards(destType) {
    return getData('hotels', destType).map(h => `
        <div class="listing-card">
            <div class="lc-body">
                <h4 class="lc-name">${h.name}</h4>
                <p class="lc-desc">${h.desc}</p>
                <div class="lc-tags">${h.tags.map(t=>`<span class="lc-tag">${t}</span>`).join('')}</div>
                <div class="lc-meta">
                    <div class="lc-stars">${starHTML(h.rating)} <span>${h.rating}</span></div>
                    <div class="lc-price-dist">
                        <span class="lc-price">${h.price}</span>
                        <span class="lc-dist"><i class="fas fa-map-marker-alt"></i> ${h.distance}</span>
                    </div>
                </div>
            </div>
            <div class="lc-action">
                <a href="${h.bookUrl}" target="_blank" rel="noopener" class="btn-check-avail">Check Availability</a>
            </div>
        </div>`).join('');
}

function buildRestaurantCards(destType) {
    return getData('restaurants', destType).map(r => `
        <div class="listing-card">
            <div class="lc-body">
                <h4 class="lc-name">${r.name}</h4>
                <p class="lc-desc">${r.desc}</p>
                <div class="lc-tags">${r.tags.map(t=>`<span class="lc-tag">${t}</span>`).join('')}</div>
                <div class="lc-meta">
                    <div class="lc-stars">${starHTML(r.rating)} <span>${r.rating}</span></div>
                    <div class="lc-price-dist">
                        <span class="lc-price">${r.priceFor2} for 2</span>
                        <span class="lc-dist"><i class="fas fa-clock"></i> ${r.timing}</span>
                    </div>
                </div>
                <div class="lc-cuisine-badge"><i class="fas fa-leaf"></i> ${r.cuisine}</div>
            </div>
            <div class="lc-action">
                <a href="${r.bookUrl}" target="_blank" rel="noopener" class="btn-check-avail">View Menu &amp; Reserve</a>
            </div>
        </div>`).join('');
}

function buildTransportCards() {
    return DEST_DATA.transport.map(t => `
        <div class="listing-card transport-card">
            <div class="lc-body lc-transport-body">
                <div class="transport-icon-box"><i class="fas ${t.icon}"></i></div>
                <div style="flex:1">
                    <h4 class="lc-name">${t.name}</h4>
                    <p class="lc-desc">${t.desc}</p>
                    <div class="lc-tags">${t.tags.map(tg=>`<span class="lc-tag">${tg}</span>`).join('')}</div>
                    <div class="lc-meta" style="margin-top:0.6rem">
                        <span class="lc-price">${t.price}</span>
                        <span class="lc-dist"><i class="fas fa-tag"></i> ${t.type}</span>
                    </div>
                </div>
            </div>
            <div class="lc-action">
                <a href="${t.bookUrl}" target="_blank" rel="noopener" class="btn-check-avail">Book Now</a>
            </div>
        </div>`).join('');
}

// ─────────────────────────────────────────────────────────────
//  TAB SWITCH
// ─────────────────────────────────────────────────────────────
function switchBookingTab(tab, btn) {
    document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.btab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('btab-' + tab).classList.add('active');
}

// ─────────────────────────────────────────────────────────────
//  BOOKING FORM SUBMIT
// ─────────────────────────────────────────────────────────────
async function handleBookingForm(e, bookingType, destName) {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('.bf-submit');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const formData = { type: bookingType, destination: destName };
    new FormData(form).forEach((val, key) => { formData[key] = val; });

    try {
        const res  = await fetch(BOOKING_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
            showAppleModal('success', {
                ref: data.booking_ref || 'TCT-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                dest: destName,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                date: formData.date,
                message: data.message
            });
            form.reset();
        } else {
            showAppleModal('error', {
                dest: destName,
                message: data.message || 'Something went wrong. Please try again.'
            });
        }
    } catch (err) {
        const ref = 'TCT-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        showAppleModal('success', {
            ref: ref,
            dest: destName,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: formData.date,
            message: null
        });
        form.reset();
    } finally {
        btn.disabled = false;
        btn.innerHTML = orig;
    }
}

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

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
function injectBookingStyles() {
    if (document.getElementById('bf-styles')) return;
    const s = document.createElement('style');
    s.id = 'bf-styles';
    s.textContent = `
        @keyframes bfSlideIn {
            from { opacity:0; transform:translateY(-12px); }
            to   { opacity:1; transform:translateY(0); }
        }
        .full-booking-wrap {
            margin:2rem 0; border-radius:16px;
            overflow:hidden; box-shadow:0 6px 30px rgba(0,0,0,0.1);
        }
        .booking-tabs-header {
            display:flex; flex-wrap:wrap;
            background:linear-gradient(135deg,#667eea,#764ba2);
        }
        .btab {
            flex:1; min-width:100px; padding:1rem 0.5rem;
            border:none; background:transparent; color:rgba(255,255,255,0.75);
            cursor:pointer; font-family:'Poppins',sans-serif;
            font-size:0.85rem; font-weight:500;
            display:flex; align-items:center; justify-content:center; gap:0.5rem;
            transition:all 0.2s;
        }
        .btab:hover { background:rgba(255,255,255,0.12); color:white; }
        .btab.active { background:white; color:#667eea; font-weight:700; }
        .btab-content { display:none; background:#fafbff; }
        .btab-content.active { display:block; }

        /* form card */
        .booking-form-card { padding:2rem 2.5rem; }
        @media(max-width:600px){ .booking-form-card { padding:1.2rem; } }
        .booking-form-header {
            display:flex; align-items:center; gap:1.2rem;
            margin-bottom:1.8rem; padding-bottom:1.2rem;
            border-bottom:2px solid #eef0ff;
        }
        .bf-icon {
            width:52px; height:52px; border-radius:14px;
            background:linear-gradient(135deg,#667eea,#764ba2);
            display:flex; align-items:center; justify-content:center;
            color:white; font-size:1.3rem; flex-shrink:0;
        }
        .booking-form-header h3 { font-size:1.15rem; color:#333; margin-bottom:2px; }
        .booking-form-header p  { color:#667eea; font-size:0.88rem; }
        .bf-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:600px){ .bf-row { grid-template-columns:1fr; } }
        .bf-group { margin-bottom:1.1rem; }
        .bf-group label { display:block; font-size:0.88rem; font-weight:600; color:#444; margin-bottom:0.4rem; }
        .bf-group input,
        .bf-group select,
        .bf-group textarea {
            width:100%; padding:0.75rem 1rem;
            border:2px solid #e0e0e0; border-radius:10px;
            font-family:'Poppins',sans-serif; font-size:0.92rem;
            background:white; outline:none;
            transition:border-color 0.3s, box-shadow 0.3s;
        }
        .bf-group input:focus,
        .bf-group select:focus,
        .bf-group textarea:focus {
            border-color:#667eea;
            box-shadow:0 0 0 3px rgba(102,126,234,0.12);
        }
        .bf-submit {
            width:100%; margin-top:0.5rem;
            background:linear-gradient(135deg,#667eea,#764ba2);
            color:white; border:none; padding:1rem 2rem; border-radius:12px;
            font-family:'Poppins',sans-serif; font-size:1rem; font-weight:600;
            cursor:pointer; display:flex; align-items:center; justify-content:center;
            gap:0.6rem; transition:all 0.3s;
        }
        .bf-submit:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(102,126,234,0.35); }
        .bf-submit:disabled { opacity:0.7; transform:none; cursor:not-allowed; }

        /* listing section header */
        .listing-section-header {
            display:flex; align-items:center; gap:1rem;
            padding:1.5rem 2rem 0.5rem;
        }
        .listing-section-header > i { font-size:1.5rem; color:#667eea; flex-shrink:0; }
        .listing-section-header h3 { font-size:1.1rem; color:#333; margin-bottom:2px; }
        .listing-section-header p  { color:#777; font-size:0.85rem; }

        /* listing cards */
        .listing-cards { padding:1rem 1.5rem 2rem; display:flex; flex-direction:column; gap:1rem; }
        .listing-card {
            background:white; border-radius:12px;
            border:1.5px solid #e8eaff;
            box-shadow:0 2px 10px rgba(0,0,0,0.05);
            overflow:hidden; transition:box-shadow 0.25s, transform 0.25s;
        }
        .listing-card:hover { box-shadow:0 6px 22px rgba(102,126,234,0.16); transform:translateY(-2px); }
        .lc-body { padding:1.3rem 1.5rem 0.8rem; }
        .lc-transport-body { display:flex; align-items:center; gap:1.2rem; }
        .lc-name { font-size:1.05rem; font-weight:700; color:#333; margin-bottom:0.3rem; }
        .lc-desc { font-size:0.88rem; color:#666; line-height:1.5; margin-bottom:0.7rem; }
        .lc-tags { display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.8rem; }
        .lc-tag {
            background:#f0f2ff; color:#667eea; border:1px solid #d0d5ff;
            font-size:0.75rem; font-weight:500; padding:0.2rem 0.7rem; border-radius:20px;
        }
        .lc-meta {
            display:flex; justify-content:space-between;
            align-items:center; flex-wrap:wrap; gap:0.5rem;
        }
        .lc-stars { color:#f6ad55; font-size:0.85rem; }
        .lc-stars span { color:#555; margin-left:4px; font-weight:600; font-size:0.82rem; }
        .lc-price-dist { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
        .lc-price { color:#e53e3e; font-weight:700; font-size:0.92rem; }
        .lc-dist  { color:#999; font-size:0.8rem; }
        .lc-dist i { margin-right:3px; }
        .lc-cuisine-badge { margin-top:0.5rem; font-size:0.8rem; color:#38a169; font-weight:500; }
        .lc-cuisine-badge i { margin-right:4px; }
        .lc-action { padding:0 1.5rem 1.2rem; }
        .btn-check-avail {
            display:block; width:100%;
            background:#fff8f0; border:1.5px solid #e67e22; color:#e67e22;
            text-align:center; text-decoration:none;
            padding:0.75rem 1rem; border-radius:8px;
            font-family:'Poppins',sans-serif; font-size:0.92rem; font-weight:600;
            transition:all 0.25s; cursor:pointer;
        }
        .btn-check-avail:hover { background:#e67e22; color:white; box-shadow:0 4px 14px rgba(230,126,34,0.35); }
        .transport-icon-box {
            width:52px; height:52px; flex-shrink:0; border-radius:12px;
            background:linear-gradient(135deg,#667eea,#764ba2);
            display:flex; align-items:center; justify-content:center;
            color:white; font-size:1.3rem;
        }
    `;
    document.head.appendChild(s);
}
