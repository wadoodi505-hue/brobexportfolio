/**
 * BROBEX Website Estimator & Project Brief Builder
 * Scoped, resilient estimator logic. Keeps the existing pricing model and
 * 30% discount while improving accessibility, state handling and responsive UX.
 */

document.addEventListener('DOMContentLoaded', () => {
    const estimatorContainer = document.getElementById('brobexEstimator');
    if (!estimatorContainer) return;

    const CONFIG = {
        websiteTypes: [
            { id: 'business', icon: 'fa-building', title: 'Business / Company', desc: 'Professional corporate presence', basePrice: [300, 600] },
            { id: 'portfolio', icon: 'fa-user-astronaut', title: 'Portfolio / Personal', desc: 'Showcase your work and brand', basePrice: [250, 500] },
            { id: 'ecommerce', icon: 'fa-shopping-bag', title: 'E-commerce Store', desc: 'Sell products securely online', basePrice: [700, 1500] },
            { id: 'landing', icon: 'fa-rocket', title: 'Landing Page', desc: 'High-conversion single page', basePrice: [200, 400] },
            { id: 'saas', icon: 'fa-cloud', title: 'SaaS / Web App', desc: 'Complex application interfaces', basePrice: [1500, 3500] },
            { id: 'booking', icon: 'fa-calendar-check', title: 'Booking / Appointment', desc: 'Service scheduling systems', basePrice: [500, 900] },
            { id: 'blog', icon: 'fa-pen-nib', title: 'Blog / Content', desc: 'Content-driven architecture', basePrice: [350, 700] },
            { id: 'restaurant', icon: 'fa-utensils', title: 'Restaurant / Local', desc: 'Menus, location, and reservations', basePrice: [300, 600] },
            { id: 'realestate', icon: 'fa-home', title: 'Real Estate', desc: 'Property listings and filters', basePrice: [800, 1600] },
            { id: 'custom', icon: 'fa-code', title: 'Custom Website', desc: 'Unique, ground-up development', basePrice: [1000, 5000] }
        ],
        featuresList: [
            { id: 'f-contact', label: 'Contact Form', price: [0, 0] },
            { id: 'f-whatsapp', label: 'WhatsApp Integration', price: [0, 0] },
            { id: 'f-email', label: 'Email Integration', price: [50, 100] },
            { id: 'f-booking', label: 'Appointment System', price: [150, 300] },
            { id: 'f-catalog', label: 'Product Catalog', price: [100, 250] },
            { id: 'f-cart', label: 'Shopping Cart', price: [200, 400] },
            { id: 'f-payment', label: 'Payment Integration', price: [150, 350] },
            { id: 'f-cms', label: 'Blog / CMS', price: [150, 300] },
            { id: 'f-search', label: 'Advanced Search', price: [100, 250] },
            { id: 'f-users', label: 'User Accounts', price: [250, 500] },
            { id: 'f-admin', label: 'Admin Dashboard', price: [300, 600] },
            { id: 'f-anim', label: 'Animations & Interactions', price: [150, 400] },
            { id: 'f-seo', label: 'SEO Optimization', price: [100, 250] },
            { id: 'f-analytics', label: 'Analytics Integration', price: [50, 100] },
            { id: 'f-custom', label: 'Custom Functionality', price: [300, 1000] }
        ],
        multipliers: {
            pages: {
                '1-3': [0, 0],
                '4-6': [100, 250],
                '7-10': [250, 500],
                '10+': [500, 1000]
            },
            design: {
                'Clean & Professional': [0, 0],
                'Premium': [150, 300],
                'Luxury / High-End': [400, 800],
                'Fully Custom': [800, 2000]
            }
        }
    };

    const STEP_LABELS = ['WEBSITE TYPE', 'REQUIREMENTS', 'ESTIMATE', 'PROJECT BRIEF'];

    let state = createInitialState();
    let priceUpdateTimer = null;

    const typeGrid = document.getElementById('websiteTypeGrid');
    const featuresGrid = document.getElementById('req-features');
    const summaryList = document.getElementById('summaryList');
    const summaryPrice = document.getElementById('summaryPrice');
    const finalPriceDisplay = document.getElementById('finalPriceDisplay');
    const mobileProgressCount = document.getElementById('mobileProgressCount');
    const mobileProgressLabel = document.getElementById('mobileProgressLabel');
    const step1Error = document.getElementById('step1-error');
    const step2Error = document.getElementById('step2-error');
    const resetButton = document.getElementById('btnResetEstimator');

    const steps = Array.from(estimatorContainer.querySelectorAll('.estimator-step'));
    const progressSteps = Array.from(estimatorContainer.querySelectorAll('.progress-step'));
    const nextBtns = Array.from(estimatorContainer.querySelectorAll('.btn-next'));
    const backBtns = Array.from(estimatorContainer.querySelectorAll('.btn-back'));

    const briefName = document.getElementById('briefName');
    const briefEmail = document.getElementById('briefEmail');
    const briefBusiness = document.getElementById('briefBusiness');
    const briefPhone = document.getElementById('briefPhone');
    const briefNotes = document.getElementById('briefNotes');

    function createInitialState() {
        return {
            step: 1,
            type: null,
            pages: null,
            design: null,
            responsive: null,
            features: [],
            designStatus: null,
            contentStatus: null,
            timeline: null,
            originalMin: 0,
            originalMax: 0,
            estimatedMin: 0,
            estimatedMax: 0
        };
    }

    function init() {
        renderWebsiteTypes();
        renderFeatures();
        attachEventListeners();
        calculateEstimate();
        updateSummaryPanel();
        updateFinalEstimateDisplay();
        updateUI();
    }

    function renderWebsiteTypes() {
        if (!typeGrid) return;
        typeGrid.innerHTML = CONFIG.websiteTypes.map(type => `
            <label class="type-card-label">
                <input type="radio" name="websiteType" value="${type.id}" class="sr-only">
                <div class="type-card">
                    <i class="fas ${type.icon}" aria-hidden="true"></i>
                    <h4 class="type-card-title">${type.title}</h4>
                    <p class="type-card-desc">${type.desc}</p>
                </div>
            </label>
        `).join('');
    }

    function renderFeatures() {
        if (!featuresGrid) return;
        featuresGrid.innerHTML = CONFIG.featuresList.map(feature => `
            <label class="feature-check">
                <input type="checkbox" name="features" value="${feature.label}">
                <span>${feature.label}</span>
            </label>
        `).join('');
    }

    function attachEventListeners() {
        nextBtns.forEach(button => button.addEventListener('click', handleNext));
        backBtns.forEach(button => button.addEventListener('click', handleBack));
        resetButton?.addEventListener('click', resetEstimator);

        estimatorContainer.addEventListener('change', handleInputChange);

        document.getElementById('btnEmailBrief')?.addEventListener('click', event => {
            event.preventDefault();
            generateBrief('email');
        });

        document.getElementById('btnWhatsappBrief')?.addEventListener('click', event => {
            event.preventDefault();
            generateBrief('whatsapp');
        });
    }

    function handleInputChange(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) return;

        switch (target.name) {
            case 'websiteType': {
                const selected = CONFIG.websiteTypes.find(type => type.id === target.value);
                state.type = selected ? selected.title : null;
                const stepOneNext = document.querySelector('#step-1 .btn-next');
                if (stepOneNext) stepOneNext.disabled = !state.type;
                clearValidation(step1Error);
                break;
            }
            case 'pages':
                state.pages = target.value;
                clearValidation(step2Error);
                break;
            case 'design':
                state.design = target.value;
                clearValidation(step2Error);
                break;
            case 'responsive':
                state.responsive = target.value;
                clearValidation(step2Error);
                break;
            case 'designStatus':
                state.designStatus = target.value;
                break;
            case 'content':
                state.contentStatus = target.value;
                break;
            case 'timeline':
                state.timeline = target.value;
                clearValidation(step2Error);
                break;
            case 'features':
                state.features = Array.from(estimatorContainer.querySelectorAll('input[name="features"]:checked'))
                    .map(input => input.value);
                break;
            default:
                return;
        }

        calculateEstimate();
        updateSummaryPanel();
    }

    function calculateEstimate() {
        let min = 0;
        let max = 0;

        const typeConfig = CONFIG.websiteTypes.find(type => type.title === state.type);
        if (typeConfig) {
            min += typeConfig.basePrice[0];
            max += typeConfig.basePrice[1];
        }

        if (state.pages && CONFIG.multipliers.pages[state.pages]) {
            min += CONFIG.multipliers.pages[state.pages][0];
            max += CONFIG.multipliers.pages[state.pages][1];
        }

        if (state.design && CONFIG.multipliers.design[state.design]) {
            min += CONFIG.multipliers.design[state.design][0];
            max += CONFIG.multipliers.design[state.design][1];
        }

        state.features.forEach(featureLabel => {
            const feature = CONFIG.featuresList.find(item => item.label === featureLabel);
            if (feature) {
                min += feature.price[0];
                max += feature.price[1];
            }
        });

        state.originalMin = min;
        state.originalMax = max;

        // Preserve the existing 30% professional discount logic.
        state.estimatedMin = Math.round(min * 0.70);
        state.estimatedMax = Math.round(max * 0.70);
    }

    function updateSummaryPanel() {
        if (!summaryList || !summaryPrice) return;

        if (!state.type) {
            summaryList.innerHTML = '<div class="summary-item empty-state">Select a website type to begin your estimate.</div>';
            updateSummaryPrice();
            return;
        }

        const items = [
            ['Project Type', state.type],
            ['Pages', state.pages],
            ['Design', state.design],
            ['Responsive', state.responsive],
            ['Features', state.features.length ? state.features.join(', ') : 'None selected'],
            ['Design Status', state.designStatus],
            ['Content', state.contentStatus],
            ['Timeline', state.timeline]
        ];

        summaryList.innerHTML = items
            .filter(([, value]) => value)
            .map(([label, value]) => `
                <div class="summary-item">
                    <span class="summary-item-label">${label}</span>
                    <span class="summary-item-value">${value}</span>
                </div>
            `)
            .join('');

        updateSummaryPrice();
    }

    function updateSummaryPrice() {
        if (!summaryPrice) return;

        const parentTotal = summaryPrice.closest('.summary-total');
        if (parentTotal) parentTotal.classList.add('updating');

        window.clearTimeout(priceUpdateTimer);
        priceUpdateTimer = window.setTimeout(() => {
            const original = formatRange(state.originalMin, state.originalMax, shouldShowPlus());
            const discounted = formatRange(state.estimatedMin, state.estimatedMax, shouldShowPlus());

            if (!state.type) {
                summaryPrice.textContent = '$0 – $0';
            } else {
                summaryPrice.innerHTML = `
                    <span class="summary-original">${original}</span>
                    <span class="summary-discounted">${discounted}</span>
                    <span class="summary-discount-note">30% OFF</span>
                `;
            }

            parentTotal?.classList.remove('updating');
        }, 120);
    }

    function updateFinalEstimateDisplay() {
        if (!finalPriceDisplay) return;

        const original = formatRange(state.originalMin, state.originalMax, shouldShowPlus());
        const discounted = formatRange(state.estimatedMin, state.estimatedMax, shouldShowPlus());

        if (!state.type) {
            finalPriceDisplay.innerHTML = '<span class="price-val">$0</span><span class="price-sep">–</span><span class="price-val">$0</span>';
            return;
        }

        finalPriceDisplay.innerHTML = `
            <div class="estimate-price-stack">
                <span class="estimate-original">Original: ${original}</span>
                <div class="estimate-discounted-range" aria-label="30 percent discounted estimate">
                    <span class="price-val">$${state.estimatedMin.toLocaleString('en-US')}</span>
                    <span class="price-sep">–</span>
                    <span class="price-val">$${state.estimatedMax.toLocaleString('en-US')}${shouldShowPlus() ? '+' : ''}</span>
                </div>
                <span class="estimate-discount-badge">30% discount applied</span>
            </div>
        `;
    }

    function formatRange(min, max, plus = false) {
        return `$${min.toLocaleString('en-US')} – $${max.toLocaleString('en-US')}${plus ? '+' : ''}`;
    }

    function shouldShowPlus() {
        return state.design === 'Fully Custom' && state.originalMax > 4000;
    }

    function handleNext() {
        if (state.step === 1 && !state.type) {
            showValidation(step1Error, 'Please select a website type to continue.');
            focusFirstInput('#step-1 input[name="websiteType"]');
            return;
        }

        if (state.step === 2 && !validateRequirements()) return;

        if (state.step >= 4) return;

        if (state.step === 2) {
            calculateEstimate();
            updateFinalEstimateDisplay();
        }

        state.step += 1;
        updateUI();
        scrollToEstimator();
    }

    function validateRequirements() {
        const missing = [
            { value: state.pages, selector: 'input[name="pages"]' },
            { value: state.design, selector: 'input[name="design"]' },
            { value: state.responsive, selector: 'input[name="responsive"]' },
            { value: state.timeline, selector: 'input[name="timeline"]' }
        ].find(item => !item.value);

        if (!missing) {
            clearValidation(step2Error);
            return true;
        }

        showValidation(step2Error, 'Please complete Pages, Design, Responsive, and Timeline before estimating.');
        focusFirstInput(`#step-2 ${missing.selector}`);
        return false;
    }

    function showValidation(element, message) {
        if (!element) return;
        element.textContent = message;
    }

    function clearValidation(element) {
        if (element) element.textContent = '';
    }

    function focusFirstInput(selector) {
        const input = estimatorContainer.querySelector(selector);
        if (!input) return;
        window.requestAnimationFrame(() => input.focus({ preventScroll: true }));
    }

    function handleBack() {
        if (state.step <= 1) return;
        state.step -= 1;
        updateUI();
        scrollToEstimator();
    }

    function updateUI() {
        steps.forEach((stepElement, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === state.step;
            stepElement.classList.toggle('active', active);
            stepElement.hidden = !active;
            stepElement.setAttribute('aria-hidden', String(!active));
        });

        progressSteps.forEach((element, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === state.step;
            const completed = stepNumber < state.step;
            element.classList.toggle('active', active);
            element.classList.toggle('completed', completed);
            element.setAttribute('aria-current', active ? 'step' : 'false');
        });

        if (mobileProgressCount) mobileProgressCount.textContent = `STEP ${state.step} OF 4`;
        if (mobileProgressLabel) mobileProgressLabel.textContent = STEP_LABELS[state.step - 1] || STEP_LABELS[0];

        nextBtns.forEach(button => {
            if (button.closest('#step-1')) button.disabled = !state.type;
        });
    }

    function scrollToEstimator() {
        const element = document.getElementById('project-estimator');
        if (!element) return;

        const navHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--responsive-nav-height')) || 85;
        const offset = Math.max(16, navHeight + 12);
        const target = Math.max(0, element.getBoundingClientRect().top + window.scrollY - offset);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
            top: target,
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
    }

    function resetEstimator() {
        estimatorContainer.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });

        estimatorContainer.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(input => {
            input.value = '';
        });

        state = createInitialState();
        clearValidation(step1Error);
        clearValidation(step2Error);

        if (resetButton) resetButton.blur();
        calculateEstimate();
        updateSummaryPanel();
        updateFinalEstimateDisplay();
        updateUI();
        scrollToEstimator();
    }

    function generateBrief(type) {
        const clientName = briefName?.value.trim() || '[Not provided]';
        const clientEmail = briefEmail?.value.trim() || '[Not provided]';
        const clientBusiness = briefBusiness?.value.trim() || '[Not provided]';
        const clientPhone = briefPhone?.value.trim() || '[Not provided]';
        const notes = briefNotes?.value.trim() || 'No additional notes.';

        const customPlus = shouldShowPlus() ? '+' : '';
        const originalPrice = `$${state.originalMin.toLocaleString()} – $${state.originalMax.toLocaleString()}${customPlus}`;
        const discountedPrice = `$${state.estimatedMin.toLocaleString()} – $${state.estimatedMax.toLocaleString()}${customPlus}`;

        const briefBody = `Hello BROBEX,

I would like to discuss building a website. Below is my project brief generated from your website estimator.

PROJECT DETAILS
--------------------------------------------------
Name: ${clientName}
Email: ${clientEmail}
Business: ${clientBusiness}
Phone / WhatsApp: ${clientPhone}

TECHNICAL REQUIREMENTS
--------------------------------------------------
Website Type: ${state.type || 'Not specified'}
Pages: ${state.pages || 'Not specified'}
Design Level: ${state.design || 'Not specified'}
Responsive Requirements: ${state.responsive || 'Not specified'}
Selected Features: ${state.features.length ? state.features.join(', ') : 'None selected'}

ASSETS & TIMELINE
--------------------------------------------------
Design Status: ${state.designStatus || 'Not specified'}
Content Status: ${state.contentStatus || 'Not specified'}
Timeline: ${state.timeline || 'Not specified'}

ESTIMATED PROJECT INVESTMENT
--------------------------------------------------
Original Estimate: ${originalPrice}
30% Discounted Rate: ${discountedPrice}

ADDITIONAL PROJECT NOTES
--------------------------------------------------
${notes}

I would like to discuss the project and next steps.

Regards,
${clientName !== '[Not provided]' ? clientName : 'Potential Client'}`;

        if (type === 'email') {
            const subject = `BROBEX Website Project Inquiry — ${clientBusiness !== '[Not provided]' ? clientBusiness : clientName}`;
            window.location.href = `mailto:brobex.ffx@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefBody)}`;
            return;
        }

        if (type === 'whatsapp') {
            const whatsappNumber = '923709995042';
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(briefBody)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
    }

    init();
});