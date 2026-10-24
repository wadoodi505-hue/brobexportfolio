/*
 * BROBEX desktop enhancement runtime.
 * Deliberately avoids pointer-driven 3D card tilting and perspective transforms.
 * Existing subtle CSS hover states and responsive interactions remain available.
 */
(() => {
    'use strict';

    const runtimeKey = '__brobexDesktopMotionRuntime';
    if (window[runtimeKey]) return;

    const desktopQuery = window.matchMedia('(min-width: 993px) and (hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const refresh = () => {
        // Retain the lightweight desktop entrance polish, but never activate 3D cards.
        const enabled = desktopQuery.matches && !reducedMotionQuery.matches;
        document.body.classList.toggle('desktop-motion-enabled', enabled);
        document.querySelectorAll('.desktop-tilt, .is-pointer-active').forEach((element) => {
            element.classList.remove('desktop-tilt', 'is-pointer-active');
            element.style.removeProperty('--tilt-x');
            element.style.removeProperty('--tilt-y');
            element.style.removeProperty('--pointer-x');
            element.style.removeProperty('--pointer-y');
        });
    };

    const start = () => {
        refresh();
        window.addEventListener('resize', refresh, { passive: true });
        desktopQuery.addEventListener?.('change', refresh);
        reducedMotionQuery.addEventListener?.('change', refresh);
        window.addEventListener('pageshow', refresh);
        window[runtimeKey] = { refresh };
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
