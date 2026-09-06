document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileButton = document.getElementById('mobile-menu-btn');
    const closeButton = document.getElementById('mobile-close-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    const scrollButton = document.getElementById('scrollToTopBtn');
    const progress = document.getElementById('scroll-progress');
    const nav = document.querySelector('.top-nav');

    const setMenu = (open) => {
        if (!overlay) return;
        overlay.classList.toggle('active', open);
        document.body.classList.toggle('menu-open', open);
        mobileButton?.setAttribute('aria-expanded', String(open));
        if (open) closeButton?.focus();
    };

    mobileButton?.addEventListener('click', () => setMenu(true));
    closeButton?.addEventListener('click', () => setMenu(false));
    overlay?.addEventListener('click', (event) => {
        if (event.target === overlay) setMenu(false);
    });
    overlay?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenu(false);
    });

    let ticking = false;
    const updateScrollUI = () => {
        const scrollTop = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        nav?.classList.toggle('scrolled', scrollTop > 50);
        scrollButton?.classList.toggle('show', scrollTop > 400);
        if (progress && height > 0) progress.style.width = `${Math.min(100, (scrollTop / height) * 100)}%`;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollUI);
            ticking = true;
        }
    }, { passive: true });
    updateScrollUI();
    scrollButton?.addEventListener('click', () => window.scrollTo({
        top: 0,
        behavior: reducedMotion ? 'auto' : 'smooth'
    }));

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .rail-item, .mobile-link').forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === currentPage);
    });

    const revealItems = document.querySelectorAll('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver((entries, instance) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const delay = Number(entry.target.dataset.delay || 0);
                window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
                instance.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -50px', threshold: .1 });
        revealItems.forEach((item) => observer.observe(item));
    }

    let countersStarted = false;
    const animateCounters = () => {
        if (countersStarted) return;
        countersStarted = true;
        document.querySelectorAll('.hud-num[data-target]').forEach((stat) => {
            const target = Number(stat.dataset.target);
            const prefix = stat.dataset.prefix || '';
            const suffix = stat.dataset.suffix || '';
            if (reducedMotion) {
                stat.textContent = `${prefix === '0' && target < 10 ? '0' : ''}${target}${suffix}`;
                return;
            }
            const startedAt = performance.now();
            const tick = (now) => {
                const progress = Math.min((now - startedAt) / 1200, 1);
                const value = Math.floor(progress * (2 - progress) * target);
                stat.textContent = `${prefix === '0' && value < 10 ? '0' : ''}${value}${suffix}`;
                if (progress < 1) window.requestAnimationFrame(tick);
            };
            window.requestAnimationFrame(tick);
        });
    };

    const counterGroup = document.querySelector('.hero-hud');
    if (counterGroup && ('IntersectionObserver' in window) && !reducedMotion) {
        const counterObserver = new IntersectionObserver((entries, instance) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            animateCounters();
            instance.disconnect();
        }, { threshold: 0.15 });
        counterObserver.observe(counterGroup);
    } else {
        animateCounters();
    }

    const profileShowcase = document.getElementById('profile-showcase');
    const profileImage = profileShowcase?.querySelector('.profile-image-wrap');
    if (profileShowcase && profileImage && !reducedMotion && window.matchMedia('(hover: hover)').matches) {
        let frame;
        profileShowcase.addEventListener('pointermove', (event) => {
            const bounds = profileShowcase.getBoundingClientRect();
            const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
            const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
                profileImage.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });
        });
        profileShowcase.addEventListener('pointerleave', () => {
            window.cancelAnimationFrame(frame);
            profileImage.style.transform = '';
        });
    }

    document.querySelectorAll('[data-contact-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const status = form.querySelector('.form-status');
            if (status) {
                status.textContent = 'Your message is ready to send. Please use the email link beside this form.';
            }
            form.reset();
        });
    });
});