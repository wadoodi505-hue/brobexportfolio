/*
 * BROBEX progressive enhancement runtime
 * --------------------------------------
 * One small shared runtime powers the command surface, settings, and project
 * archive. It has no dependencies and does not start a continuous loop.
 */
(() => {
    'use strict';

    const pages = [
        { title: 'Home', description: 'Return to the main BROBEX direction.', href: 'index.html', icon: 'fa-house' },
        { title: 'About', description: 'Read the story and technical direction.', href: 'about.html', icon: 'fa-user-astronaut' },
        { title: 'Services', description: 'Explore focused frontend services.', href: 'services.html', icon: 'fa-microchip' },
        { title: 'Experience', description: 'Follow the development journey.', href: 'experience.html', icon: 'fa-diagram-project' },
        { title: 'Projects', description: 'Browse selected work.', href: 'projects.html', icon: 'fa-table-cells' },
        { title: 'Contact', description: 'Start a project conversation.', href: 'contact.html', icon: 'fa-envelope' }
    ];

    const settingsKey = 'brobex-preferences';
    const root = document.documentElement;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const readSettings = () => {
        try {
            return JSON.parse(window.localStorage.getItem(settingsKey) || '{}');
        } catch {
            return {};
        }
    };

    const saveSettings = (settings) => {
        try {
            window.localStorage.setItem(settingsKey, JSON.stringify(settings));
        } catch {
            // Preferences are optional; the current page still works.
        }
    };

    const applySettings = (settings) => {
        root.dataset.performance = settings.performance ? 'high' : 'full';
        root.dataset.motion = settings.motion ? 'reduced' : 'full';
    };

    const createCommandTrigger = () => {
        const actions = document.querySelector('.top-nav-actions');
        if (!actions || document.getElementById('command-trigger')) return;
        const button = document.createElement('button');
        button.className = 'command-trigger';
        button.id = 'command-trigger';
        button.type = 'button';
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', 'command-layer');
        button.innerHTML = '<i class="fas fa-terminal" aria-hidden="true"></i><span>COMMAND</span><kbd>⌘K</kbd>';
        actions.insertBefore(button, actions.firstChild);
    };

    const createSettings = () => {
        if (document.getElementById('settings-layer')) return;
        const layer = document.createElement('div');
        layer.className = 'settings-layer';
        layer.id = 'settings-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = `
            <section class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
                <div class="settings-heading">
                    <div>
                        <span class="eyebrow">// CONTROL SURFACE</span>
                        <h2 id="settings-title">VIEW SETTINGS</h2>
                        <p>Keep the same BROBEX direction while choosing how much motion your device should render.</p>
                    </div>
                    <button class="settings-close" type="button" aria-label="Close settings"><i class="fas fa-times" aria-hidden="true"></i></button>
                </div>
                <div class="settings-options">
                    <label class="settings-option">
                        <span class="settings-option-copy"><span class="settings-option-title">Performance mode</span><span class="settings-option-description">Remove decorative effects and reduce GPU work.</span></span>
                        <input type="checkbox" data-setting="performance">
                    </label>
                    <label class="settings-option">
                        <span class="settings-option-copy"><span class="settings-option-title">Reduced motion</span><span class="settings-option-description">Keep reveals and transitions to a minimum.</span></span>
                        <input type="checkbox" data-setting="motion">
                    </label>
                </div>
                <button class="settings-reset" type="button" data-settings-reset>Reset preferences</button>
            </section>`;
        document.body.appendChild(layer);
    };

    const createCommandLayer = () => {
        if (document.getElementById('command-layer')) return;
        const layer = document.createElement('div');
        layer.className = 'command-layer';
        layer.id = 'command-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = `
            <section class="command-panel" role="dialog" aria-modal="true" aria-labelledby="command-title">
                <h2 id="command-title" class="sr-only">BROBEX command menu</h2>
                <div class="command-search-wrap">
                    <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
                    <input class="command-search" type="search" autocomplete="off" placeholder="Search pages and controls…" aria-label="Search pages and controls">
                </div>
                <ul class="command-list"></ul>
                <div class="command-footer"><span>↑ ↓ Navigate</span><span>Enter Select · Esc Close</span></div>
            </section>`;
        document.body.appendChild(layer);
    };

    const getSettings = () => {
        const settings = readSettings();
        if (typeof settings.motion !== 'boolean') settings.motion = reducedMotionQuery.matches;
        if (typeof settings.performance !== 'boolean') settings.performance = false;
        return settings;
    };

    const openLayer = (layer, focusSelector) => {
        layer.classList.add('is-open');
        layer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
        layer.querySelector(focusSelector)?.focus();
    };

    const closeLayer = (layer, restoreFocus) => {
        layer.classList.remove('is-open');
        layer.setAttribute('aria-hidden', 'true');
        if (!document.querySelector('.command-layer.is-open, .settings-layer.is-open')) {
            document.body.classList.remove('menu-open');
        }
        restoreFocus?.focus?.();
    };

    const setupSettings = () => {
        const layer = document.getElementById('settings-layer');
        const settings = getSettings();
        applySettings(settings);
        layer.querySelectorAll('[data-setting]').forEach((input) => {
            input.checked = Boolean(settings[input.dataset.setting]);
            input.addEventListener('change', () => {
                const next = getSettings();
                next[input.dataset.setting] = input.checked;
                saveSettings(next);
                applySettings(next);
            });
        });
        const close = layer.querySelector('.settings-close');
        const reset = layer.querySelector('[data-settings-reset]');
        close.addEventListener('click', () => closeLayer(layer, document.getElementById('command-trigger')));
        layer.addEventListener('click', (event) => {
            if (event.target === layer) closeLayer(layer, document.getElementById('command-trigger'));
        });
        reset.addEventListener('click', () => {
            const next = { performance: false, motion: reducedMotionQuery.matches };
            saveSettings(next);
            applySettings(next);
            layer.querySelector('[data-setting="performance"]').checked = false;
            layer.querySelector('[data-setting="motion"]').checked = next.motion;
        });
        return layer;
    };

    const setupCommandMenu = (settingsLayer) => {
        const layer = document.getElementById('command-layer');
        const list = layer.querySelector('.command-list');
        const search = layer.querySelector('.command-search');
        const trigger = document.getElementById('command-trigger');
        let selectedIndex = 0;
        let currentItems = [];
        let restoreFocus = trigger;

        const items = () => [
            ...pages.map((page) => ({
                ...page,
                action: () => { window.location.href = page.href; }
            })),
            {
                title: 'View settings',
                description: 'Theme-adjacent performance and motion controls.',
                icon: 'fa-sliders',
                action: () => {
                    closeLayer(layer);
                    openLayer(settingsLayer, '.settings-close');
                }
            },
            {
                title: 'Toggle theme',
                description: 'Switch between the dark and light visual system.',
                icon: 'fa-circle-half-stroke',
                action: () => document.getElementById('theme-toggle')?.click()
            }
        ];

        const render = () => {
            const query = search.value.trim().toLowerCase();
            currentItems = items().filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query));
            selectedIndex = Math.min(selectedIndex, Math.max(0, currentItems.length - 1));
            list.innerHTML = currentItems.length ? currentItems.map((item, index) => `
                <li><button class="command-item${index === selectedIndex ? ' is-selected' : ''}" type="button" data-command-index="${index}">
                    <i class="fas ${item.icon}" aria-hidden="true"></i>
                    <span class="command-item-copy"><span class="command-item-title">${item.title}</span><span class="command-item-description">${item.description}</span></span>
                </button></li>`).join('') : '<li class="command-empty">No matching command.</li>';
            list.querySelectorAll('[data-command-index]').forEach((button) => {
                button.addEventListener('click', () => currentItems[Number(button.dataset.commandIndex)].action());
            });
        };

        const open = () => {
            restoreFocus = document.activeElement;
            render();
            openLayer(layer, '.command-search');
        };

        trigger?.addEventListener('click', open);
        layer.addEventListener('click', (event) => {
            if (event.target === layer) closeLayer(layer, restoreFocus);
        });
        search.addEventListener('input', () => { selectedIndex = 0; render(); });
        search.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeLayer(layer, restoreFocus);
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, currentItems.length - 1);
                render();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                render();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                currentItems[selectedIndex]?.action();
            }
        });
        document.addEventListener('keydown', (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                if (layer.classList.contains('is-open')) closeLayer(layer, restoreFocus);
                else open();
            } else if (event.key === 'Escape') {
                if (layer.classList.contains('is-open')) closeLayer(layer, restoreFocus);
                if (settingsLayer.classList.contains('is-open')) closeLayer(settingsLayer, trigger);
            }
        });
    };

    const setupProjectArchive = () => {
        const grid = document.querySelector('.project-grid');
        if (!grid) return;
        const cards = [...grid.querySelectorAll('.project-card')];
        const tools = document.createElement('div');
        tools.className = 'project-tools';
        tools.setAttribute('aria-label', 'Project archive filters');
        tools.innerHTML = `
            <label class="sr-only" for="project-search">Search projects</label>
            <input class="project-search" id="project-search" type="search" placeholder="Search projects…" autocomplete="off">
            <label class="sr-only" for="project-filter">Filter project type</label>
            <select class="project-filter" id="project-filter"><option value="all">All project types</option></select>
            <span class="project-result-count" role="status" aria-live="polite"></span>`;
        grid.before(tools);
        const select = tools.querySelector('.project-filter');
        const search = tools.querySelector('.project-search');
        const result = tools.querySelector('.project-result-count');
        const empty = document.createElement('p');
        empty.className = 'project-empty';
        empty.textContent = 'No projects match that search yet.';
        grid.appendChild(empty);
        const types = [...new Set(cards.map((card) => card.querySelector('.card-meta')?.textContent.trim()).filter(Boolean))];
        types.forEach((type) => select.insertAdjacentHTML('beforeend', `<option value="${type}">${type}</option>`));
        const update = () => {
            const query = search.value.trim().toLowerCase();
            const type = select.value;
            let visible = 0;
            cards.forEach((card) => {
                const cardType = card.querySelector('.card-meta')?.textContent.trim() || '';
                const haystack = card.textContent.toLowerCase();
                const matches = (!query || haystack.includes(query)) && (type === 'all' || cardType === type);
                card.classList.toggle('is-filtered-out', !matches);
                if (matches) visible += 1;
            });
            empty.classList.toggle('is-visible', visible === 0);
            result.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown`;
        };
        search.addEventListener('input', update);
        select.addEventListener('change', update);
        update();
    };

    const init = () => {
        createCommandTrigger();
        createSettings();
        createCommandLayer();
        const settingsLayer = setupSettings();
        setupCommandMenu(settingsLayer);
        setupProjectArchive();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();