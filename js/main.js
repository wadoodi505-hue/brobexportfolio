/**
 * BROBEX - Core Homepage Script
 * Complete vanilla JavaScript implementation handling scroll progress, 
 * observer-based reveals, stat counters, and micro-interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Respect user reduced-motion setting
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Instantly trigger reveals since the artificial loader has been removed
    triggerInitialReveals();

    /* ==========================================================================
       1. SCROLL PROGRESS INDICATOR
       ========================================================================== */
    const progressBar = document.getElementById('scroll-progress');

    function updateScrollProgress() {
        if (!progressBar) return;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${scrollPercent}%`;
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    /* ==========================================================================
       2. MOBILE NAVIGATION MENU
       ========================================================================== */
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-close-btn');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMobileMenu(open) {
        if (!mobileOverlay) return;
        if (open) {
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (mobileBtn) mobileBtn.addEventListener('click', () => toggleMobileMenu(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleMobileMenu(false));

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMobileMenu(false));
    });

    /* ==========================================================================
       3. INTERSECTION OBSERVER - SCROLL REVEALS
       ========================================================================== */
    function triggerInitialReveals() {
        const revealElements = document.querySelectorAll('.reveal');

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealElements.forEach(el => el.classList.add('is-visible'));
            animateStatNumbers();
            return;
        }

        const observerOptions = {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);

                    // Trigger stats animation if entering HUD section
                    if (entry.target.classList.contains('hero-hud')) {
                        animateStatNumbers();
                    }

                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    }

    /* ==========================================================================
       4. ANIMATED STAT NUMBERS
       ========================================================================== */
    let statsAnimated = false;

    function animateStatNumbers() {
        if (statsAnimated) return;
        statsAnimated = true;

        const statNumbers = document.querySelectorAll('.hud-num[data-target]');

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const prefix = stat.getAttribute('data-prefix') || '';
            const suffix = stat.getAttribute('data-suffix') || '';
            const duration = 1500;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Ease out quad
                const easedProgress = progress * (2 - progress);
                const currentValue = Math.floor(easedProgress * target);

                let formattedValue = currentValue.toString();
                if (prefix === '0' && currentValue < 10) {
                    formattedValue = '0' + currentValue;
                }

                stat.textContent = `${formattedValue}${suffix}`;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    let finalVal = target.toString();
                    if (prefix === '0' && target < 10) finalVal = '0' + target;
                    stat.textContent = `${finalVal}${suffix}`;
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    /* ==========================================================================
       5. 120FPS 3D MAGNETIC TILT EFFECT (Profile Element)
       ========================================================================== */
    const profileShowcase = document.getElementById('profile-showcase');
    const profileWrap = document.querySelector('.profile-image-wrap');

    if (profileShowcase && profileWrap && !prefersReducedMotion) {
        let rafId = null;

        profileShowcase.addEventListener('mousemove', (e) => {
            const rect = profileShowcase.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit rotation to 12 degrees to keep it highly polished/realistic
            const rotateX = ((y - centerY) / centerY) * -12; 
            const rotateY = ((x - centerX) / centerX) * 12;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                // Apply 3D perspective to inner wrap so it doesn't break the float keyframes
                profileWrap.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });
        });

        profileShowcase.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                profileWrap.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    /* ==========================================================================
       6. ACTIVE NAVIGATION DETECTION
       ========================================================================== */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .rail-item, .mobile-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    console.log("%c BROBEX ARCHITECTURE ACTIVE ", "background: #E60000; color: #ffffff; font-weight: bold; padding: 4px 8px;");
});document.addEventListener('DOMContentLoaded', () => {
    const cursorGlow = document.getElementById('cursor-glow');
    const particleContainer = document.getElementById('particle-container');

    // Hide effect on mobile devices (touch screens)
    if (window.matchMedia("(hover: none)").matches) {
        cursorGlow.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    // Luxury Palette for Particles: Golds and Parrot Greens
    const colors = ['#D4AF37', '#F7D046', '#7ED321', '#8EF511'];

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        createParticle(e.clientX, e.clientY);
    });

    // 1. BUTTERY SMOOTH GLOW ANIMATION (Lerping)
    function animateGlow() {
        // The 0.15 multiplier creates a beautiful, heavy luxury "drag" effect
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
        
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // 2. PARTICLE GENERATION SYSTEM
    let lastParticleTime = 0;
    function createParticle(x, y) {
        const now = Date.now();
        // Throttle to prevent lagging the browser (spawns 1 particle every 40ms max)
        if (now - lastParticleTime < 40) return; 
        lastParticleTime = now;

        const particle = document.createElement('div');
        particle.classList.add('cursor-particle');
        
        // Randomize size between 2px and 5px
        const size = Math.random() * 3 + 2; 
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Randomize trajectory (scatter X, fall Y)
        const tx = (Math.random() - 0.5) * 80; // Scatters left/right by 40px
        const ty = Math.random() * 60 + 20;    // Drifts downward 20px to 80px
        
        // Apply inline styles to the specific particle
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;
        particle.style.boxShadow = `0 0 ${size * 1.5}px ${color}`; // Give particles a tiny glow
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Inject trajectory variables into the CSS animation
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        particleContainer.appendChild(particle);
        
        // Clean up DOM: Remove particle after the 1s CSS animation finishes
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
});