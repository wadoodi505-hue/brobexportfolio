/* BROBEX Project Archive — data, rendering, filtering, detail modal and light motion. */
(() => {
  'use strict';

  const projects = Array.isArray(window.BROBEX_PROJECTS) ? window.BROBEX_PROJECTS : [];
  const root = document.querySelector('.projects-section[data-project-archive]');
  if (!root) return;

  const grid = root.querySelector('#project-grid-items');
  const featured = root.querySelector('#featured-project');
  const filters = root.querySelector('[data-project-filters]');
  const search = root.querySelector('#project-search');
  const result = root.querySelector('.project-result-count');
  const empty = root.querySelector('.project-empty');
  const modal = document.querySelector('#project-detail-modal');
  const modalContent = modal?.querySelector('.project-modal-content');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isCoarse = window.matchMedia('(hover: none) and (pointer: coarse)');

  let activeFilter = 'all';
  let query = '';
  let sortMode = 'newest';
  let previousFocus = null;
  let modalOpen = false;

  const safe = (value) => String(value ?? '');
  const escapeHTML = (value) => safe(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const normalizeType = (project) => project.type === 'game' ? 'game' : 'website';
  const orderedProjects = () => [...projects].sort((a, b) => {
    if (sortMode === 'featured') return Number(b.featured) - Number(a.featured) || Number(b.year || 0) - Number(a.year || 0);
    if (sortMode === 'websites') return Number(normalizeType(a) !== 'website') - Number(normalizeType(b) !== 'website') || String(b.year).localeCompare(String(a.year));
    if (sortMode === 'games') return Number(normalizeType(a) !== 'game') - Number(normalizeType(b) !== 'game') || String(b.year).localeCompare(String(a.year));
    return Number(b.year || 0) - Number(a.year || 0);
  });
  const visibleProjects = () => orderedProjects().filter((project) => {
    const type = normalizeType(project);
    const haystack = [project.name, project.description, project.type, project.category, project.year, project.status, ...(project.technologies || [])].join(' ').toLowerCase();
    const filterMatch = activeFilter === 'all' || (activeFilter === 'featured' ? project.featured === true : type === activeFilter);
    return filterMatch && (!query || haystack.includes(query));
  });

  const typeLabel = (project) => normalizeType(project) === 'game' ? 'Interactive Game' : 'Frontend Website';
  const statusClass = (status) => safe(status).toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const cardTemplate = (project, index, total) => {
    const tech = (project.technologies || []).slice(0, 5).map((item) => `<span>${escapeHTML(item)}</span>`).join('');
    return `<article class="project-card reveal fade-up${project.featured ? ' is-featured-card' : ''}" data-project-id="${escapeHTML(project.id)}" tabindex="0">
      <div class="project-media">
        <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.alt || `Preview of ${project.name}`)}" width="${Number(project.imageWidth) || 1200}" height="${Number(project.imageHeight) || 800}" loading="lazy" decoding="async">
        <span class="project-number">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
        <span class="project-status status-${escapeHTML(statusClass(project.status))}"><span class="status-dot" aria-hidden="true"></span>${escapeHTML(project.status || 'Live')}</span>
        ${project.featured ? '<span class="project-featured-badge">FEATURED</span>' : ''}
      </div>
      <div class="project-card-body">
        <div class="project-meta-row"><span class="card-meta">${escapeHTML(typeLabel(project))}</span><span>${escapeHTML(project.year)}</span></div>
        <h3 class="project-title">${escapeHTML(project.name)}</h3>
        <p class="project-description">${escapeHTML(project.description)}</p>
        <div class="project-tags">${tech}</div>
        <div class="project-actions">
          <button class="btn-secondary project-detail-trigger" type="button" data-project-open="${escapeHTML(project.id)}" aria-label="View details for ${escapeHTML(project.name)}">VIEW PROJECT <i class="fas fa-arrow-right" aria-hidden="true"></i></button>
          ${project.url ? `<a class="project-link-icon" href="${escapeHTML(project.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHTML(project.name)} live project"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}
        </div>
      </div>
    </article>`;
  };

  const featuredTemplate = (project) => {
    if (!project) return '';
    const tech = (project.technologies || []).map((item) => `<span>${escapeHTML(item)}</span>`).join('');
    return `<div class="featured-project reveal fade-up" data-project-id="${escapeHTML(project.id)}">
      <div class="featured-media"><img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.alt || `Preview of ${project.name}`)}" width="${Number(project.imageWidth) || 1200}" height="${Number(project.imageHeight) || 800}" fetchpriority="high" decoding="async"><span class="featured-index">01 / ${String(projects.length).padStart(2, '0')}</span><span class="featured-status"><span class="status-dot" aria-hidden="true"></span>${escapeHTML(project.status || 'LIVE')} BUILD</span><span class="project-featured-badge">FEATURED</span></div>
      <div class="featured-copy"><div class="project-meta-row"><span class="card-meta">${escapeHTML(typeLabel(project))}</span><span>${escapeHTML(project.year)}</span></div><h3>${escapeHTML(project.name)}</h3><p>${escapeHTML(project.description)}</p><div class="project-tags">${tech}</div><div class="project-actions"><button class="btn-primary project-link project-detail-trigger" type="button" data-project-open="${escapeHTML(project.id)}">VIEW PROJECT <i class="fas fa-arrow-right" aria-hidden="true"></i></button>${project.url ? `<a class="btn-secondary project-link" href="${escapeHTML(project.url)}" target="_blank" rel="noopener noreferrer">VIEW LIVE PROJECT <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}</div></div>
    </div>`;
  };

  const updateCounts = () => {
    const counts = projects.reduce((acc, project) => {
      const type = normalizeType(project);
      acc[type] += 1;
      if (project.featured) acc.featured += 1;
      return acc;
    }, { website: 0, game: 0, featured: 0 });
    root.querySelector('[data-count="all"]').textContent = projects.length;
    root.querySelector('[data-count="website"]').textContent = counts.website;
    root.querySelector('[data-count="game"]').textContent = counts.game;
    root.querySelector('[data-count="featured"]').textContent = counts.featured;
    document.querySelectorAll('[data-stat="projects"]').forEach((node) => { node.textContent = String(projects.length).padStart(2, '0'); });
    document.querySelectorAll('[data-stat="websites"]').forEach((node) => { node.textContent = String(counts.website).padStart(2, '0'); });
    document.querySelectorAll('[data-stat="games"]').forEach((node) => { node.textContent = String(counts.game).padStart(2, '0'); });
    document.querySelectorAll('[data-stat-label="projects"]').forEach((node) => { node.textContent = projects.length === 1 ? 'PROJECT' : 'PROJECTS'; });
    document.querySelectorAll('[data-stat-label="websites"]').forEach((node) => { node.textContent = counts.website === 1 ? 'WEBSITE' : 'WEBSITES'; });
    document.querySelectorAll('[data-stat-label="games"]').forEach((node) => { node.textContent = counts.game === 1 ? 'GAME' : 'GAMES'; });
  };

  const updateStructuredData = () => {
    const schema = document.querySelector('script[type="application/ld+json"]');
    if (!schema) return;
    try {
      const data = JSON.parse(schema.textContent);
      data.numberOfItems = projects.length;
      data.itemListElement = projects.map((project, index) => ({ '@type': 'ListItem', position: index + 1, name: project.name, ...(project.url ? { url: project.url } : {}) }));
      schema.textContent = JSON.stringify(data);
    } catch (_) {}
  };

  const render = () => {
    const featuredProject = projects.find((project) => project.featured);
    if (featured) featured.innerHTML = featuredTemplate(featuredProject);
    const ordered = orderedProjects();
    grid.innerHTML = ordered.filter((project) => !project.featured).map((project) => cardTemplate(project, ordered.indexOf(project), ordered.length)).join('');
    updateCounts();
    updateStructuredData();
    applyFilter(false);
    if (window.BROBEXReveal?.refresh) window.BROBEXReveal.refresh();
  };

  const applyFilter = (animate = true) => {
    const items = visibleProjects();
    const visibleIds = new Set(items.map((project) => project.id));
    const cards = root.querySelectorAll('[data-project-id]');
    cards.forEach((card) => {
      const show = visibleIds.has(card.dataset.projectId);
      card.classList.toggle('is-filtered-out', !show);
      if (animate && show && !prefersReduced.matches) card.classList.add('filter-enter');
    });
    empty.hidden = items.length !== 0;
    result.textContent = `${items.length} ${items.length === 1 ? 'project' : 'projects'} shown`;
  };

  const focusable = () => [...modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')].filter((node) => !node.hasAttribute('disabled'));

  const openModal = (id, trigger) => {
    const project = projects.find((item) => item.id === id);
    if (!project || !modal || !modalContent) return;
    previousFocus = trigger || document.activeElement;
    modalContent.innerHTML = `<div class="project-modal-media"><img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.alt || `Preview of ${project.name}`)}" width="${Number(project.imageWidth) || 1200}" height="${Number(project.imageHeight) || 800}" decoding="async"></div><div class="project-modal-copy"><div class="project-meta-row"><span class="card-meta">${escapeHTML(typeLabel(project))}</span><span>${escapeHTML(project.year)} · ${escapeHTML(project.status || 'Live')}</span></div><h2 id="project-modal-title">${escapeHTML(project.name)}</h2><p>${escapeHTML(project.description)}</p><div class="project-tags">${(project.technologies || []).map((item) => `<span>${escapeHTML(item)}</span>`).join('')}</div>${project.highlights?.length ? `<ul class="project-highlights">${project.highlights.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : ''}${project.screenshots?.length ? `<div class="project-screenshot-grid">${project.screenshots.map((shot) => `<img src="${escapeHTML(shot.src || shot)}" alt="${escapeHTML(shot.alt || `${project.name} screenshot`)}" loading="lazy" decoding="async">`).join('')}</div>` : ''}<div class="project-modal-actions">${project.url ? `<a class="btn-primary" href="${escapeHTML(project.url)}" target="_blank" rel="noopener noreferrer">LIVE PROJECT <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}${project.github ? `<a class="btn-secondary" href="${escapeHTML(project.github)}" target="_blank" rel="noopener noreferrer">GITHUB <i class="fab fa-github" aria-hidden="true"></i></a>` : ''}</div></div>`;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.classList.add('project-modal-open');
    modalOpen = true;
    focusable()[0]?.focus();
  };

  const closeModal = () => {
    if (!modalOpen) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('project-modal-open');
    modalOpen = false;
    window.setTimeout(() => { if (!modalOpen) modal.hidden = true; }, prefersReduced.matches ? 0 : 260);
    previousFocus?.focus?.();
  };

  filters?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-project-filter]');
    if (!button) return;
    activeFilter = button.dataset.projectFilter || 'all';
    filters.querySelectorAll('[data-project-filter]').forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyFilter(true);
  });

  root.querySelector('#project-sort')?.addEventListener('change', (event) => {
    sortMode = event.target.value || 'newest';
    render();
  });

  search?.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();
    applyFilter(false);
  }, { passive: true });

  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-project-open]');
    if (trigger) openModal(trigger.dataset.projectOpen, trigger);
    if (event.target.closest('[data-project-modal-close]')) closeModal();
  });

  root.addEventListener('keydown', (event) => {
    const card = event.target.closest('.project-card');
    if (card && (event.key === 'Enter' || event.key === ' ')) {
      if (event.target.closest('a, button')) return;
      event.preventDefault();
      openModal(card.dataset.projectId, card);
    }
    if (!modalOpen || event.key !== 'Tab') return;
    const nodes = focusable();
    if (!nodes.length) return;
    const first = nodes[0]; const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  modal?.addEventListener('click', (event) => { if (event.target === modal || event.target.closest('[data-project-modal-close]')) closeModal(); });

  if (!isCoarse.matches && !prefersReduced.matches) {
    root.addEventListener('pointermove', (event) => {
      const card = event.target.closest('.project-card');
      if (!card) return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
      card.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    }, { passive: true });
  }

  render();
})();
