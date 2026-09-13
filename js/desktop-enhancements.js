/*
 * BROBEX desktop motion runtime
 * -----------------------------
 * Pointer work is batched into one animation frame and is never installed on
 * touch layouts. The site remains usable when this file is unavailable.
 */
(() => {
    'use strict';

    const desktopQuery = window.matchMedia('(min-width: 993px) and (hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let glow;
    let pointerFrame = 0;
    let pointerPosition = { x: 0, y: 0 };
    let pointerListenerAttached = false;

    const isEnabled = () => desktopQuery.matches && !reducedMotionQuery.matches;

    const removeEnhancements = () => {
        document.body.classList.remove('desktop-motion-enabled');
        if (pointerListenerAttached) {
            document.removeEventListener('pointermove', scheduleGlow);
            pointerListenerAttached = false;
        }
        if (pointerFrame) {
            window.cancelAnimationFrame(pointerFrame);
            pointerFrame = 0;
        }
        glow?.remove();
        glow = null;
        document.querySelectorAll('.desktop-tilt').forEach((card) => {
            card.classList.remove('desktop-tilt', 'is-pointer-active');
            card.style.removeProperty('--tilt-x');
            card.style.removeProperty('--tilt-y');
            card.style.removeProperty('--pointer-x');
            card.style.removeProperty('--pointer-y');
        });
    };

    const updateGlow = () => {
        pointerFrame = 0;
        if (!glow || !isEnabled()) return;
        glow.style.left = `${pointerPosition.x}px`;
        glow.style.top = `${pointerPosition.y}px`;
    };

    const scheduleGlow = (event) => {
        if (!isEnabled()) return;
        pointerPosition = { x: event.clientX, y: event.clientY };
        if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updateGlow);
    };

    const addTilt = (card) => {
        if (card.dataset.desktopEnhancementAttached === 'true') {
            card.classList.add('desktop-tilt');
            return;
        }

        card.dataset.desktopEnhancementAttached = 'true';
        card.classList.add('desktop-tilt');
        card.addEventListener('pointerenter', () => {
            if (isEnabled()) card.classList.add('is-pointer-active');
        });
        card.addEventListener('pointermove', (event) => {
            if (!isEnabled()) return;
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;
            const rotateX = (0.5 - y) * 5;
            const rotateY = (x - 0.5) * 6;
            card.style.setProperty('--tilt-x', `${rotateY.toFixed(2)}deg`);
            card.style.setProperty('--tilt-y', `${rotateX.toFixed(2)}deg`);
            card.style.setProperty('--pointer-x', `${(x * 100).toFixed(1)}%`);
            card.style.setProperty('--pointer-y', `${(y * 100).toFixed(1)}%`);
        }, { passive: true });
        card.addEventListener('pointerleave', () => {
            card.classList.remove('is-pointer-active');
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    };

    const init = () => {
        if (!isEnabled()) return;

        document.body.classList.add('desktop-motion-enabled');

        glow = document.createElement('div');
        glow.className = 'desktop-cursor-glow';
        glow.setAttribute('aria-hidden', 'true');
        document.body.appendChild(glow);
        if (!pointerListenerAttached) {
            document.addEventListener('pointermove', scheduleGlow, { passive: true });
            pointerListenerAttached = true;
        }

        document.querySelectorAll(
            '.project-card, .service-card, .experience-card, .interactive-card, .pipeline-step, .contact-method'
        ).forEach(addTilt);
    };

    const handlePreferenceChange = () => {
        if (isEnabled()) {
            if (!document.body.classList.contains('desktop-motion-enabled')) init();
        } else {
            removeEnhancements();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    desktopQuery.addEventListener?.('change', handlePreferenceChange);
    reducedMotionQuery.addEventListener?.('change', handlePreferenceChange);
})();