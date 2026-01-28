/**
 * JidouNavi Landing Page
 * Waitlist with platform selection + Supabase integration
 */

// ================================
// CONFIGURATION
// ================================
const CONFIG = {
    // Launch state: 'pre-launch' | 'android-live' | 'both-live'
    launchState: 'pre-launch',

    // Store URLs (add when apps are approved)
    playStoreUrl: '',
    appStoreUrl: '',

    // Supabase configuration
    supabaseUrl: 'https://xkrsovejtlbpoznbvbha.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcnNvdmVqdGxicG96bmJ2YmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzA4MzYsImV4cCI6MjA4MjMwNjgzNn0.-QS9IXNIX4gpQxkir09QMdMYWVBgvjTBpFHBsuDSOV8',
};

// ================================
// SUPABASE CLIENT
// ================================
let supabase = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && CONFIG.supabaseUrl && CONFIG.supabaseAnonKey) {
        supabase = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
    }
}

// ================================
// CTA RENDERING
// ================================
function renderCTA() {
    const ctaSection = document.getElementById('cta-section');
    if (!ctaSection) return;

    const { launchState } = CONFIG;

    let html = '';

    if (launchState === 'both-live') {
        html = renderBothStoreBadges();
    } else if (launchState === 'android-live') {
        html = renderPlayStoreWithiOSWaitlist();
    } else {
        html = renderWaitlistForm();
    }

    ctaSection.innerHTML = html;
    attachEventListeners();
}

// ================================
// RENDER FUNCTIONS
// ================================

function renderWaitlistForm() {
    return `
        <h2 class="cta-title">Get notified when we launch</h2>
        <p class="cta-subtitle">Be the first to discover Japan's vending machines</p>

        <div class="platform-selector">
            <button type="button" class="platform-btn active" data-platform="android">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.342l1.473-2.546c.082-.142.037-.322-.105-.404-.142-.082-.322-.037-.404.105l-1.49 2.578c-1.138-.52-2.414-.81-3.77-.81s-2.633.29-3.771.81L8.967 12.5c-.082-.142-.262-.187-.404-.105-.142.082-.187.262-.105.404l1.473 2.545C7.107 16.573 5.285 19.174 5 22h14c-.285-2.826-2.107-5.427-4.977-6.658zm-6.523 3.66c-.345 0-.625-.28-.625-.625s.28-.625.625-.625.625.28.625.625-.28.625-.625.625zm7 0c-.345 0-.625-.28-.625-.625s.28-.625.625-.625.625.28.625.625-.28.625-.625.625zM6 10c0 .345.28.625.625.625.345 0 .625-.28.625-.625s-.28-.625-.625-.625C6.28 9.375 6 9.655 6 10zm.625-3.75c-.345 0-.625.28-.625.625v2.5c0 .345.28.625.625.625.345 0 .625-.28.625-.625v-2.5c0-.345-.28-.625-.625-.625zm10.75 0c-.345 0-.625.28-.625.625v2.5c0 .345.28.625.625.625.345 0 .625-.28.625-.625v-2.5c0-.345-.28-.625-.625-.625zM17 10c0-.345-.28-.625-.625-.625-.345 0-.625.28-.625.625s.28.625.625.625c.345 0 .625-.28.625-.625z"/>
                </svg>
                Android
            </button>
            <button type="button" class="platform-btn" data-platform="ios">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                iOS
            </button>
        </div>

        <form class="waitlist-form" id="waitlist-form">
            <input type="hidden" name="platform" value="android">
            <input
                type="email"
                name="email"
                class="email-input"
                placeholder="Enter your email"
                required
                autocomplete="email"
            >
            <button type="submit" class="submit-btn">Notify Me</button>
        </form>
        <div id="form-message"></div>
    `;
}

function renderBothStoreBadges() {
    return `
        <h2 class="cta-title">Download now</h2>
        <div class="store-badges">
            <a href="${CONFIG.appStoreUrl}" class="store-badge" target="_blank" rel="noopener">
                <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download on the App Store">
            </a>
            <a href="${CONFIG.playStoreUrl}" class="store-badge" target="_blank" rel="noopener">
                <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play">
            </a>
        </div>
    `;
}

function renderPlayStoreWithiOSWaitlist() {
    return `
        <h2 class="cta-title">Available now on Android!</h2>
        <div class="store-badges">
            <a href="${CONFIG.playStoreUrl}" class="store-badge" target="_blank" rel="noopener">
                <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play">
            </a>
        </div>

        <div class="ios-waitlist">
            <h3 class="ios-waitlist-title">Coming soon to iOS</h3>
            <p class="ios-waitlist-subtitle">Get notified when the iOS app launches</p>
            <form class="waitlist-form" id="waitlist-form">
                <input type="hidden" name="platform" value="ios">
                <input
                    type="email"
                    name="email"
                    class="email-input"
                    placeholder="Enter your email"
                    required
                    autocomplete="email"
                >
                <button type="submit" class="submit-btn">Notify Me</button>
            </form>
            <div id="form-message"></div>
        </div>
    `;
}

// ================================
// EVENT HANDLERS
// ================================
function attachEventListeners() {
    // Platform selector buttons
    const platformBtns = document.querySelectorAll('.platform-btn');
    platformBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            platformBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const platformInput = document.querySelector('input[name="platform"]');
            if (platformInput) {
                platformInput.value = btn.dataset.platform;
            }
        });
    });

    // Waitlist form submission
    const form = document.getElementById('waitlist-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formMessage = document.getElementById('form-message');
    const submitBtn = form.querySelector('.submit-btn');
    const emailInput = form.querySelector('input[name="email"]');
    const platformInput = form.querySelector('input[name="platform"]');

    const email = emailInput.value.trim();
    const platform = platformInput?.value || 'unknown';

    if (!email || !isValidEmail(email)) {
        showMessage(formMessage, 'Please enter a valid email address', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        if (!supabase) {
            console.log('Waitlist signup (no Supabase):', { email, platform });
            showMessage(formMessage, "You're on the list! We'll notify you when we launch.", 'success');
            emailInput.value = '';
            return;
        }

        const { error } = await supabase
            .from('waitlist')
            .insert([{ email, platform, source: 'landing' }]);

        if (error) {
            if (error.code === '23505') {
                showMessage(formMessage, "You're already on the list! We'll be in touch soon.", 'success');
            } else {
                throw error;
            }
        } else {
            showMessage(formMessage, "You're on the list! We'll notify you when we launch.", 'success');
        }

        emailInput.value = '';
    } catch (error) {
        console.error('Waitlist signup error:', error);
        showMessage(formMessage, 'Something went wrong. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Notify Me';
    }
}

// ================================
// UTILITIES
// ================================
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showMessage(element, message, type) {
    if (!element) return;

    element.className = `form-message ${type}`;
    element.textContent = message;

    setTimeout(() => {
        element.className = '';
        element.textContent = '';
    }, 5000);
}

// ================================
// INITIALIZATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    renderCTA();
});
