/**
 * JidouNavi Landing Page
 */

const CONFIG = {
    launchState: 'pre-launch', // 'pre-launch' | 'android-live' | 'both-live'
    playStoreUrl: '',
    appStoreUrl: '',
    supabaseUrl: 'https://xkrsovejtlbpoznbvbha.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcnNvdmVqdGxicG96bmJ2YmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzA4MzYsImV4cCI6MjA4MjMwNjgzNn0.-QS9IXNIX4gpQxkir09QMdMYWVBgvjTBpFHBsuDSOV8',
};

let supabaseClient = null;

// Initialize Supabase client
function initSupabase() {
    try {
        if (window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
        }
    } catch (e) {
        console.error('Supabase init error:', e);
    }
}

// Fetch waitlist count from Supabase
async function loadWaitlistCount() {
    const el = document.getElementById('waitlist-count');
    if (!el || !supabaseClient) return;

    try {
        const { data, error } = await supabaseClient
            .from('waitlist_public_stats') // ✅ VIEW
            .select('total')
            .single();

        if (error || !data || typeof data.total !== 'number' || data.total === 0) return;

        const rounded = Math.ceil(data.total / 10) * 10;
        el.textContent = `Currently ${rounded}+ people on the waitlist 🚀`;
    } catch {
        // silent on purpose
    }
}




// Render the CTA section
function renderCTA() {
    const ctaSection = document.getElementById('cta-section');
    if (!ctaSection) {
        console.error('CTA section not found');
        return;
    }

    try {
        let html = '';

        if (CONFIG.launchState === 'both-live') {
            html = `
                <h2 class="cta-title">Download now</h2>
                <div class="store-badges">
                    <a href="${CONFIG.appStoreUrl}" class="store-badge" target="_blank" rel="noopener">
                        <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="App Store">
                    </a>
                    <a href="${CONFIG.playStoreUrl}" class="store-badge" target="_blank" rel="noopener">
                        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Play Store">
                    </a>
                </div>
            `;
        } else if (CONFIG.launchState === 'android-live') {
            html = `
                <h2 class="cta-title">Available on Android!</h2>
                <div class="store-badges">
                    <a href="${CONFIG.playStoreUrl}" class="store-badge" target="_blank" rel="noopener">
                        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Play Store">
                    </a>
                </div>
                <div class="ios-waitlist">
                    <p class="ios-waitlist-title">Coming soon to iOS</p>
                    <form class="waitlist-form" id="waitlist-form">
                        <input type="hidden" name="platform" value="ios">
                        <input type="email" name="email" class="email-input" placeholder="Enter your email" required>
                        <button type="submit" class="submit-btn">Notify Me</button>
                    </form>
                    <div id="form-message"></div>
                </div>
            `;
        } else {
            html = `
                <h2 class="cta-title">Be first to explore!</h2>
                <div class="platform-selector">
                    <button type="button" class="platform-btn active" data-platform="android">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                        Android
                    </button>
                    <button type="button" class="platform-btn" data-platform="ios">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        iOS
                    </button>
                </div>
                <form class="waitlist-form" id="waitlist-form">
                    <input type="hidden" name="platform" value="android">
                    <input type="email" name="email" class="email-input" placeholder="Enter your email" required>
                    <button type="submit" class="submit-btn">Notify Me</button>
                </form>
                <p class="form-disclaimer">One email. Launch day. That's it.</p>
                <p class="waitlist-count" id="waitlist-count"></p>
                <div id="form-message"></div>
            `;
        }

        ctaSection.innerHTML = html;
        attachEventListeners();
        loadWaitlistCount();
    } catch (e) {
        console.error('Render error:', e);
        ctaSection.innerHTML = '<p>Error loading form. Please refresh the page.</p>';
    }
}

// Attach event listeners
function attachEventListeners() {
    // Platform buttons
    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const input = document.querySelector('input[name="platform"]');
            if (input) input.value = btn.dataset.platform;
        });
    });

    // Form submission
    const form = document.getElementById('waitlist-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
}

// Generate a random unsubscribe token
function generateToken() {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Send welcome email via edge function
async function sendWelcomeEmail(email, unsubscribe_token, platform) {
    try {
        await fetch(`${CONFIG.supabaseUrl}/functions/v1/send-welcome-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.supabaseAnonKey}`
            },
            body: JSON.stringify({ email, unsubscribe_token, platform, lang: 'en' })
        });
    } catch (err) {
        console.error('Failed to send welcome email:', err);
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const msg = document.getElementById('form-message');
    const btn = form.querySelector('.submit-btn');
    const emailInput = form.querySelector('input[name="email"]');
    const platformInput = form.querySelector('input[name="platform"]');

    const email = emailInput.value.trim();
    const platform = platformInput ? platformInput.value : 'unknown';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMsg(msg, 'Please enter a valid email', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Submitting...';

    const unsubscribe_token = generateToken();

    try {
        if (supabaseClient) {
            const { error } = await supabaseClient.from('waitlist').insert([{
                email,
                platform,
                source: 'landing',
                unsubscribe_token,
                subscribed: true,
                lang: 'en'
            }]);
            if (error && error.code === '23505') {
                showMsg(msg, "You're already on the list!", 'success');
            } else if (error) {
                throw error;
            } else {
                // Send welcome email with platform
                sendWelcomeEmail(email, unsubscribe_token, platform);
                showMsg(msg, "You're on the list! Check your email for confirmation.", 'success');
            }
        } else {
            showMsg(msg, "You're on the list! We'll notify you when we launch.", 'success');
        }
        emailInput.value = '';
    } catch (err) {
        console.error('Submit error:', err);
        showMsg(msg, 'Something went wrong. Try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Notify Me';
    }
}

// Show message
function showMsg(el, text, type) {
    if (!el) return;
    el.className = 'form-message ' + type;
    el.textContent = text;
    setTimeout(() => { el.className = ''; el.textContent = ''; }, 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    renderCTA();
});
