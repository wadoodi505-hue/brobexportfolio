document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- 1. GLOBAL STATE & SCROLL (120Hz Optimized via RAF) ---
    const topNav = document.querySelector('.top-nav');
    const progressBar = document.getElementById('scroll-progress');
    const scrollBtn = document.getElementById('scrollToTopBtn');
    let scrollTicking = false;

    function handleScroll() {
        const scrollTop = window.scrollY;
        
        // Sticky Nav Styling
        if (topNav) {
            topNav.classList.toggle('scrolled', scrollTop > 50);
        }

        // Progress Bar & Scroll To Top
        if (progressBar || scrollBtn) {
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (progressBar && docHeight > 0) {
                progressBar.style.width = `${(scrollTop / docHeight) * 100}%`;
            }
            if (scrollBtn) {
                scrollBtn.classList.toggle('show', scrollTop > 400);
            }
        }
        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(handleScroll);
            scrollTicking = true;
        }
    }, { passive: true });

    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- 2. ACCESSIBLE MOBILE MENU ---
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-close-btn');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let isMenuOpen = false;

    function toggleMenu(state) {
        if (!mobileOverlay) return;
        isMenuOpen = state;
        
        if (state) {
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'true');
        } else {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
        }
    }

    if (mobileBtn) mobileBtn.addEventListener('click', () => toggleMenu(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
    mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

    // Close on ESC or Outside Click
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) toggleMenu(false);
    });
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) toggleMenu(false);
        });
    }

    // --- 3. HIGH-PERFORMANCE INTERSECTION OBSERVER ---
    function initObservers() {
        const revealElements = document.querySelectorAll('.reveal, .animate-on-scroll');
        
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealElements.forEach(el => el.classList.add('is-visible'));
            animateStatNumbers();
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => entry.target.classList.add('is-visible'), delay);
                    if (entry.target.classList.contains('hero-hud')) animateStatNumbers();
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => observer.observe(el));
    }
    initObservers();

    // --- 4. HARDWARE-ACCELERATED 3D TILT (Profile) ---
    const profileShowcase = document.getElementById('profile-showcase');
    const profileWrap = document.querySelector('.profile-image-wrap');

    if (profileShowcase && profileWrap && !prefersReducedMotion && !isTouchDevice) {
        let rafId = null;
        profileShowcase.addEventListener('mousemove', (e) => {
            const rect = profileShowcase.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
            const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                profileWrap.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                profileWrap.style.willChange = 'transform';
            });
        });

        profileShowcase.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            requestAnimationFrame(() => {
                profileWrap.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                profileWrap.style.willChange = 'auto';
            });
        });
    }

    // --- 5. STAT COUNTERS ---
    let statsAnimated = false;
    function animateStatNumbers() {
        if (statsAnimated) return;
        statsAnimated = true;
        document.querySelectorAll('.hud-num[data-target]').forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const prefix = stat.getAttribute('data-prefix') || '';
            const suffix = stat.getAttribute('data-suffix') || '';
            const startTime = performance.now();

            function update(currentTime) {
                const progress = Math.min((currentTime - startTime) / 1500, 1);
                const currentVal = Math.floor(progress * (2 - progress) * target);
                stat.textContent = `${prefix === '0' && currentVal < 10 ? '0' : ''}${currentVal}${suffix}`;
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });
    }

    // --- 6. ACTIVE NAVIGATION DETECTION ---
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .rail-item, .mobile-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === currentPath || (currentPath === '' && href === 'index.html'));
    });
});