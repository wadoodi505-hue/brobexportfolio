/*
 * BROBEX desktop motion runtime
 * Lightweight card tilt for fine-pointer desktops only. The standard system
 * cursor is preserved; there is no cursor replacement or pointer-following UI.
 */
(() => {
    'use strict';

    const runtimeKey = '__brobexDesktopMotionRuntime';
    if (window[runtimeKey]) {
        window.dispatchEvent(new CustomEvent('brobex:motion-refresh'));
        return;
    }

    const desktopQuery = window.matchMedia('(min-width: 993px) and (hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const selector = '.project-card, .service-card, .experience-card, .interactive-card, .pipeline-step, .contact-method';
    const isEnabled = () => desktopQuery.matches && !reducedMotionQuery.matches;
    const cleanups = new WeakMap();

    const clearCard = (card) => {
        card.classList.remove('desktop-tilt', 'is-pointer-active');
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
        card.style.removeProperty('--pointer-x');
        card.style.removeProperty('--pointer-y');
    };

    const attachCard = (card) => {
        if (cleanups.has(card)) return;
        const onEnter = () => {
            if (isEnabled()) card.classList.add('is-pointer-active');
        };
        const onMove = (event) => {
            if (!isEnabled()) return;
            const bounds = card.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
            const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
            card.style.setProperty('--tilt-x', `${((x - 0.5) * 4).toFixed(2)}deg`);
            card.style.setProperty('--tilt-y', `${((0.5 - y) * 3).toFixed(2)}deg`);
            card.style.setProperty('--pointer-x', `${(x * 100).toFixed(1)}%`);
            card.style.setProperty('--pointer-y', `${(y * 100).toFixed(1)}%`);
        };
        const onLeave = () => {
            card.classList.remove('is-pointer-active');
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        };
        card.addEventListener('pointerenter', onEnter);
        card.addEventListener('pointermove', onMove, { passive: true });
        card.addEventListener('pointerleave', onLeave);
        cleanups.set(card, () => {
            card.removeEventListener('pointerenter', onEnter);
            card.removeEventListener('pointermove', onMove);
            card.removeEventListener('pointerleave', onLeave);
            clearCard(card);
        });
        if (isEnabled()) card.classList.add('desktop-tilt');
    };

    const refresh = () => {
        const enabled = isEnabled();
        document.querySelectorAll(selector).forEach((card) => {
            attachCard(card);
            if (enabled) card.classList.add('desktop-tilt');
            else clearCard(card);
        });
        document.body.classList.toggle('desktop-motion-enabled', enabled);
    };

    const observer = new MutationObserver(() => refresh());
    const start = () => {
        refresh();
        observer.observe(document.body, { childList: true, subtree: true });
    };
    window.addEventListener('brobex:motion-refresh', refresh);
    desktopQuery.addEventListener?.('change', refresh);
    reducedMotionQuery.addEventListener?.('change', refresh);
    window[runtimeKey] = { refresh };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
