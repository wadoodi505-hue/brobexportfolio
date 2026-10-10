(() => {
    'use strict';

    const storageKey = 'brobex-theme';
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

    const getStoredTheme = () => {
        try {
            return window.localStorage.getItem(storageKey);
        } catch {
            return null;
        }
    };

    const saveTheme = (theme) => {
        try {
            window.localStorage.setItem(storageKey, theme);
        } catch {
            // Private browsing or a restricted storage context should not
            // prevent the toggle from working for the current page.
        }
    };

    const applyTheme = (theme, persist = false) => {
        const nextTheme = theme === 'light' ? 'light' : 'dark';
        root.dataset.theme = nextTheme;
        document.body?.classList.toggle('theme-light', nextTheme === 'light');
        document.body?.classList.toggle('theme-dark', nextTheme === 'dark');

        const themeColor = document.querySelector('meta[name="theme-color"]');
        themeColor?.setAttribute('content', nextTheme === 'light' ? '#f4f1e9' : '#020804');

        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            const isLight = nextTheme === 'light';
            toggle.setAttribute('aria-pressed', String(isLight));
            toggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
            toggle.querySelector('i')?.classList.toggle('fa-sun', !isLight);
            toggle.querySelector('i')?.classList.toggle('fa-moon', isLight);
            const label = toggle.querySelector('.theme-toggle-label');
            if (label) label.textContent = isLight ? 'DARK' : 'LIGHT';
        }

        if (persist) saveTheme(nextTheme);
    };

    const initialTheme = getStoredTheme() || (mediaQuery.matches ? 'light' : 'dark');

    const init = () => {
        applyTheme(initialTheme);
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();