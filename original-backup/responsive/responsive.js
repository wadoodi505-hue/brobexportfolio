/*
 * BROBEX responsive runtime
 * Keeps the existing interactions intact and adds only viewport-safe behavior.
 */
(() => {
    'use strict';

    const root = document.documentElement;
    const viewport = window.visualViewport;
    let frame = 0;

    const syncViewportHeight = () => {
        frame = 0;
        const height = viewport?.height || window.innerHeight;
        root.style.setProperty('--viewport-height', `${Math.round(height)}px`);
    };

    const scheduleViewportSync = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(syncViewportHeight);
    };

    syncViewportHeight();
    window.addEventListener('resize', scheduleViewportSync, { passive: true });
    viewport?.addEventListener('resize', scheduleViewportSync, { passive: true });

    document.addEventListener('DOMContentLoaded', () => {
        const overlay = document.getElementById('mobile-nav-overlay');
        const menuButton = document.getElementById('mobile-menu-btn');
        const closeButton = document.getElementById('mobile-close-btn');

        if (!overlay || !menuButton) return;

        const updateMenuVisibility = () => {
            const isOpen = overlay.classList.contains('active');
            overlay.setAttribute('aria-hidden', String(!isOpen));
            menuButton.setAttribute('aria-expanded', String(isOpen));
        };

        updateMenuVisibility();

        // A viewport change can leave a menu open after switching from mobile
        // to desktop. Close it without duplicating site.js's menu logic.
        const closeOnDesktop = () => {
            if (window.matchMedia('(min-width: 993px)').matches && overlay.classList.contains('active')) {
                closeButton?.click();
            }
            updateMenuVisibility();
        };

        window.addEventListener('resize', closeOnDesktop, { passive: true });
        overlay.addEventListener('transitionend', updateMenuVisibility, { passive: true });
    });
})();