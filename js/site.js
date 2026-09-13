(() => {
  'use strict';

  const init = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileQuery = window.matchMedia('(max-width: 992px)');
    const menuButton = document.getElementById('mobile-menu-btn');
    const closeButton = document.getElementById('mobile-close-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    const scrollButton = document.getElementById('scrollToTopBtn');
    const progressBar = document.getElementById('scroll-progress');
    const topNav = document.querySelector('.top-nav');
    const focusableSelector = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let lastFocusedElement = null;
    let menuOpen = false;
    let scrollTicking = false;
    let countersStarted = false;

    overlay?.setAttribute('aria-hidden', 'true');

    const setMenu = (open) => {
      if (!overlay || !menuButton) return;

      menuOpen = open;
      overlay.classList.toggle('active', open);
      overlay.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');

      if (open) {
        lastFocusedElement = document.activeElement;
        window.requestAnimationFrame(() => closeButton?.focus());
      } else {
        lastFocusedElement?.focus?.();
        lastFocusedElement = null;
      }
    };

    const closeMenuOnDesktop = () => {
      if (!mobileQuery.matches && menuOpen) setMenu(false);
    };

    menuButton?.addEventListener('click', () => setMenu(!menuOpen));
    closeButton?.addEventListener('click', () => setMenu(false));
    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) setMenu(false);
    });
    overlay?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', (event) => {
      if (!menuOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...overlay.querySelectorAll(focusableSelector)]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', closeMenuOnDesktop);
    } else {
      mobileQuery.addListener?.(closeMenuOnDesktop);
    }

    const updateScrollUI = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      topNav?.classList.toggle('scrolled', scrollTop > 50);
      scrollButton?.classList.toggle('show', scrollTop > 400);
      if (progressBar) {
        progressBar.style.width = documentHeight > 0
          ? `${Math.min(100, (scrollTop / documentHeight) * 100)}%`
          : '0%';
      }
      scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollUI);
    }, { passive: true });
    updateScrollUI();

    scrollButton?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .rail-item, .mobile-link').forEach((link) => {
      const href = link.getAttribute('href');
      const isCurrent = href === currentPage || (currentPage === '' && href === 'index.html');
      link.classList.toggle('active', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const revealItems = document.querySelectorAll('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = Number(entry.target.dataset.delay || 0);
          window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -50px', threshold: 0.1 });
      revealItems.forEach((item) => revealObserver.observe(item));
    }

    const animateCounters = () => {
      if (countersStarted) return;
      countersStarted = true;
      document.querySelectorAll('.hud-num[data-target]').forEach((stat) => {
        const target = Number(stat.dataset.target);
        const prefix = stat.dataset.prefix || '';
        const suffix = stat.dataset.suffix || '';
        const render = (value) => {
          const padded = prefix === '0' && value < 10 ? `0${value}` : `${value}`;
          stat.textContent = `${padded}${suffix}`;
        };

        if (reducedMotion) {
          render(target);
          return;
        }

        const startedAt = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - startedAt) / 1200, 1);
          render(Math.floor(progress * (2 - progress) * target));
          if (progress < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      });
    };

    const counterGroup = document.querySelector('.hero-hud');
    if (counterGroup && !reducedMotion && 'IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        animateCounters();
        observer.disconnect();
      }, { threshold: 0.15 });
      counterObserver.observe(counterGroup);
    } else {
      animateCounters();
    }

    const profileShowcase = document.getElementById('profile-showcase');
    const profileImage = profileShowcase?.querySelector('.profile-image-wrap');
    if (profileShowcase && profileImage && !reducedMotion && canHover) {
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

    if (canHover && !reducedMotion) {
      document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
          const bounds = card.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width) * 100;
          const y = ((event.clientY - bounds.top) / bounds.height) * 100;
          card.style.setProperty('--pointer-x', `${x}%`);
          card.style.setProperty('--pointer-y', `${y}%`);
        });
        card.addEventListener('pointerleave', () => {
          card.style.removeProperty('--pointer-x');
          card.style.removeProperty('--pointer-y');
        });
      });
    }

    document.querySelectorAll('[data-contact-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const status = form.querySelector('.form-status');
        const name = form.elements.name?.value.trim();
        const email = form.elements.email?.value.trim();
        const message = form.elements.message?.value.trim();

        if (!name || !email || !message) return;

        if (status) {
          status.textContent = 'Opening your email app with the brief prepared…';
        }

        const subject = encodeURIComponent(`BROBEX project inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject direction:\n${message}`);
        window.location.href = `mailto:brobex.ffx@gmail.com?subject=${subject}&body=${body}`;
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();