/**
 * BROBEX Website Estimator & Project Brief Builder
 * Isolated logic to maintain site integrity.
 * Updated: Includes 30% Professional Discount Formatting
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const estimatorContainer = document.getElementById('brobexEstimator');
    if (!estimatorContainer) return; // Exit if not on the correct page

    // =========================================================================
    // CONFIGURATION & PRICING RANGES
    // =========================================================================
    
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

    // =========================================================================
    // STATE MANAGEMENT
    // =========================================================================

    let state = {
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

    // =========================================================================
    // DOM ELEMENTS
    // =========================================================================

    const typeGrid = document.getElementById('websiteTypeGrid');
    const featuresGrid = document.getElementById('req-features');
    const summaryList = document.getElementById('summaryList');
    const summaryPrice = document.getElementById('summaryPrice');
    const finalPriceDisplay = document.getElementById('finalPriceDisplay');
    
    // Navigation Arrays
    const steps = document.querySelectorAll('.estimator-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextBtns = document.querySelectorAll('.btn-next');
    const backBtns = document.querySelectorAll('.btn-back');

    // Inputs
    const briefName = document.getElementById('briefName');
    const briefEmail = document.getElementById('briefEmail');
    const briefBusiness = document.getElementById('briefBusiness');
    const briefPhone = document.getElementById('briefPhone');
    const briefNotes = document.getElementById('briefNotes');

    // =========================================================================
    // INITIALIZATION & RENDER
    // =========================================================================

    function init() {
        renderWebsiteTypes();
        renderFeatures();
        attachEventListeners();
        updateUI();
    }

    function renderWebsiteTypes() {
        typeGrid.innerHTML = CONFIG.websiteTypes.map(type => `
            <label class="type-card-label">
                <input type="radio" name="websiteType" value="${type.id}" class="sr-only">
                <div class="type-card">
                    <i class="fas ${type.icon}"></i>
                    <h4 class="type-card-title">${type.title}</h4>
                    <p class="type-card-desc">${type.desc}</p>
                </div>
            </label>
        `).join('');
    }

    function renderFeatures() {
        featuresGrid.innerHTML = CONFIG.featuresList.map(feature => `
            <label class="feature-check">
                <input type="checkbox" name="features" value="${feature.label}">
                <span>${feature.label}</span>
            </label>
        `).join('');
    }

    // =========================================================================
    // EVENT LISTENERS
    // =========================================================================

    function attachEventListeners() {
        // Step Navigation
        nextBtns.forEach(btn => btn.addEventListener('click', handleNext));
        backBtns.forEach(btn => btn.addEventListener('click', handleBack));
        
        // Reset
        document.getElementById('btnResetEstimator').addEventListener('click', resetEstimator);

        // Listen for all input changes inside the estimator
        estimatorContainer.addEventListener('change', (e) => {
            if(e.target.name === 'websiteType') {
                const selected = CONFIG.websiteTypes.find(t => t.id === e.target.value);
                state.type = selected ? selected.title : null;
                // Enable step 1 next button
                document.querySelector('#step-1 .btn-next').disabled = false;
                document.getElementById('step1-error').textContent = '';
            }
            if(e.target.name === 'pages') state.pages = e.target.value;
            if(e.target.name === 'design') state.design = e.target.value;
            if(e.target.name === 'responsive') state.responsive = e.target.value;
            if(e.target.name === 'designStatus') state.designStatus = e.target.value;
            if(e.target.name === 'content') state.contentStatus = e.target.value;
            if(e.target.name === 'timeline') state.timeline = e.target.value;
            
            if(e.target.name === 'features') {
                const checkedBoxes = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);
                state.features = checkedBoxes;
            }

            calculateEstimate();
            updateSummaryPanel();
        });

        // Brief generation
        document.getElementById('btnEmailBrief').addEventListener('click', (e) => {
            e.preventDefault();
            generateBrief('email');
        });
        document.getElementById('btnWhatsappBrief').addEventListener('click', (e) => {
            e.preventDefault();
            generateBrief('whatsapp');
        });
    }

    // =========================================================================
    // CALCULATION LOGIC (WITH 30% DISCOUNT)
    // =========================================================================

    function calculateEstimate() {
        let min = 0;
        let max = 0;

        // Base price from type
        const typeConfig = CONFIG.websiteTypes.find(t => t.title === state.type);
        if (typeConfig) {
            min += typeConfig.basePrice[0];
            max += typeConfig.basePrice[1];
        }

        // Add Pages multiplier
        if (state.pages && CONFIG.multipliers.pages[state.pages]) {
            min += CONFIG.multipliers.pages[state.pages][0];
            max += CONFIG.multipliers.pages[state.pages][1];
        }

        // Add Design multiplier
        if (state.design && CONFIG.multipliers.design[state.design]) {
            min += CONFIG.multipliers.design[state.design][0];
            max += CONFIG.multipliers.design[state.design][1];
        }

        // Add Features
        state.features.forEach(featLabel => {
            const featConfig = CONFIG.featuresList.find(f => f.label === featLabel);
            if (featConfig) {
                min += featConfig.price[0];
                max += featConfig.price[1];
            }
        });

        // Save original prices before discounting
        state.originalMin = min;
        state.originalMax = max;

        // Apply 30% Professional Discount
        state.estimatedMin = Math.round(min * 0.70);
        state.estimatedMax = Math.round(max * 0.70);
    }

    // =========================================================================
    // UI UPDATES
    // =========================================================================

    function updateSummaryPanel() {
        if (!state.type) {
            summaryList.innerHTML = `<div class="summary-item empty-state">Select a website type to begin your estimate.</div>`;
            return;
        }

        let html = '';
        const addSummaryItem = (label, value) => {
            if (value && value.length > 0) {
                const displayVal = Array.isArray(value) ? value.join(', ') : value;
                html += `
                    <div class="summary-item">
                        <span class="summary-item-label">${label}</span>
                        <span class="summary-item-value">${displayVal}</span>
                    </div>
                `;
            }
        };

        addSummaryItem('Project Type', state.type);
        addSummaryItem('Pages', state.pages);
        addSummaryItem('Design', state.design);
        addSummaryItem('Responsive', state.responsive);
        addSummaryItem('Features', state.features);
        addSummaryItem('Timeline', state.timeline);

        summaryList.innerHTML = html;

        // Subtle animation for price update
        const parentTotal = summaryPrice.parentElement;
        parentTotal.classList.add('updating');
        
        setTimeout(() => {
            const formattedOrigMin = state.originalMin.toLocaleString('en-US');
            const formattedOrigMax = state.originalMax.toLocaleString('en-US');
            const formattedMin = state.estimatedMin.toLocaleString('en-US');
            const formattedMax = state.estimatedMax.toLocaleString('en-US');
            
            // Format HTML to display the crossed-out original price and the discounted price
            if(state.design === 'Fully Custom' && state.originalMax > 4000) {
                 summaryPrice.innerHTML = `<s style="font-size:0.8em; opacity:0.6;">$${formattedOrigMin} – $${formattedOrigMax}+</s><br><span style="color:#28a745;">$${formattedMin} – $${formattedMax}+ <small>(30% OFF)</small></span>`;
            } else {
                 summaryPrice.innerHTML = `<s style="font-size:0.8em; opacity:0.6;">$${formattedOrigMin} – $${formattedOrigMax}</s><br><span style="color:#28a745;">$${formattedMin} – $${formattedMax} <small>(30% OFF)</small></span>`;
            }
            
            parentTotal.classList.remove('updating');
        }, 150);
    }

    function updateFinalEstimateDisplay() {
        if(!finalPriceDisplay) return;
        const formattedOrigMin = state.originalMin.toLocaleString('en-US');
        const formattedOrigMax = state.originalMax.toLocaleString('en-US');
        const formattedMin = state.estimatedMin.toLocaleString('en-US');
        const formattedMax = state.estimatedMax.toLocaleString('en-US');
        
        let customPlus = (state.design === 'Fully Custom' && state.originalMax > 4000) ? '+' : '';

        // Professional layout showing the discount
        const priceString = `
            <div style="font-size: 0.5em; text-decoration: line-through; color: #888; margin-bottom: -10px;">
                Original: $${formattedOrigMin} – $${formattedOrigMax}${customPlus}
            </div>
            <span class="price-val" style="color: #28a745;">$${formattedMin}</span>
            <span class="price-sep" style="color: #28a745;">–</span>
            <span class="price-val" style="color: #28a745;">$${formattedMax}${customPlus}</span>
            <div style="display: inline-block; background: #28a745; color: white; padding: 4px 10px; border-radius: 5px; font-size: 0.35em; vertical-align: middle; margin-left: 15px; font-weight: bold; letter-spacing: 1px;">
                30% DISCOUNT APPLIED
            </div>
        `;
        
        finalPriceDisplay.innerHTML = priceString;
    }

    // =========================================================================
    // NAVIGATION LOGIC
    // =========================================================================

    function handleNext() {
        // Validation Step 1
        if (state.step === 1 && !state.type) {
            document.getElementById('step1-error').textContent = 'Please select a website type to continue.';
            return;
        }

        // Validation Step 2
        if (state.step === 2) {
            if (!state.pages || !state.design || !state.responsive || !state.timeline) {
                document.getElementById('step2-error').textContent = 'Please complete the core requirements (Pages, Design, Responsive, Timeline) before estimating.';
                return;
            }
            document.getElementById('step2-error').textContent = '';
            updateFinalEstimateDisplay();
        }

        if (state.step < 4) {
            state.step++;
            updateUI();
            scrollToEstimator();
        }
    }

    function handleBack() {
        if (state.step > 1) {
            state.step--;
            updateUI();
            scrollToEstimator();
        }
    }

    function updateUI() {
        // Update Steps
        steps.forEach((el, index) => {
            if (index + 1 === state.step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Update Progress Indicator
        progressSteps.forEach((el, index) => {
            const stepNum = index + 1;
            el.classList.remove('active', 'completed');
            if (stepNum === state.step) {
                el.classList.add('active');
            } else if (stepNum < state.step) {
                el.classList.add('completed');
            }
        });
    }

    function scrollToEstimator() {
        const yOffset = -100; 
        const element = document.getElementById('project-estimator');
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }

    function resetEstimator() {
        // Reset Form Inputs
        const formInputs = estimatorContainer.querySelectorAll('input[type="radio"], input[type="checkbox"], input[type="text"], input[type="email"], input[type="tel"], textarea');
        formInputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') input.checked = false;
            else input.value = '';
        });

        // Reset State
        state = {
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

        document.querySelector('#step-1 .btn-next').disabled = true;
        document.getElementById('step1-error').textContent = '';
        document.getElementById('step2-error').textContent = '';

        updateSummaryPanel();
        updateUI();
        scrollToEstimator();
    }

    // =========================================================================
    // BRIEF GENERATOR
    // =========================================================================

    function generateBrief(type) {
        const clientName = briefName.value.trim() || '[Not provided]';
        const clientEmail = briefEmail.value.trim() || '[Not provided]';
        const clientBusiness = briefBusiness.value.trim() || '[Not provided]';
        const clientPhone = briefPhone.value.trim() || '[Not provided]';
        const notes = briefNotes.value.trim() || 'No additional notes.';

        const customPlus = (state.design === 'Fully Custom' && state.originalMax > 4000) ? '+' : '';
        const originalPriceStr = `$${state.originalMin.toLocaleString()} – $${state.originalMax.toLocaleString()}${customPlus}`;
        const discountedPriceStr = `$${state.estimatedMin.toLocaleString()} – $${state.estimatedMax.toLocaleString()}${customPlus}`;

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
Website Type: ${state.type}
Pages: ${state.pages}
Design Level: ${state.design}
Responsive Requirements: ${state.responsive}
Selected Features: ${state.features.length > 0 ? state.features.join(', ') : 'None selected'}

ASSETS & TIMELINE
--------------------------------------------------
Design Status: ${state.designStatus || 'Not specified'}
Content Status: ${state.contentStatus || 'Not specified'}
Timeline: ${state.timeline}

ESTIMATED PROJECT INVESTMENT
--------------------------------------------------
Original Estimate: ${originalPriceStr}
30% Discounted Rate: ${discountedPriceStr}

ADDITIONAL PROJECT NOTES
--------------------------------------------------
${notes}

I would like to discuss the project and next steps.

Regards,
${clientName !== '[Not provided]' ? clientName : 'Potential Client'}`;

        if (type === 'email') {
            const subject = `BROBEX Website Project Inquiry — ${clientBusiness !== '[Not provided]' ? clientBusiness : clientName}`;
            const mailtoUrl = `mailto:brobex.ffx@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefBody)}`;
            window.location.href = mailtoUrl;
        } 
        else if (type === 'whatsapp') {
            const whatsappNumber = '923709995042'; // Based on your codebase
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(briefBody)}`;
            window.open(whatsappUrl, '_blank');
        }
    }

    // Run init
    init();

});