/*
 * BROBEX motion refinement runtime
 * Uses one IntersectionObserver, avoids scroll listeners and continuous loops.
 */
(() => {
  'use strict';

  const start = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const candidates = [
      '.page-hero', '.hero-section', '.split-hero', '.section-title',
      '.project-card', '.service-card', '.interactive-card', '.feature-card',
      '.contact-card', '.experience-card', '.estimator-container', '.futuristic-footer'
    ];
    const elements = [...new Set(candidates.flatMap(selector =>
      [...document.querySelectorAll(selector)]
    ))].filter(element =>
      !element.closest('[hidden], [aria-hidden="true"]') &&
      !element.classList.contains('motion-reveal')
    );

    if (reduceMotion || !('IntersectionObserver' in window) || elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    elements.forEach((element, index) => {
      element.classList.add('motion-reveal');
      if (element.matches('.project-card, .service-card, .interactive-card, .feature-card')) {
        element.dataset.motionDelay = String((index % 4) + 1);
      }
      observer.observe(element);
    });

    // Only activate the CSS hiding layer after all targets are registered.
    document.documentElement.classList.add('motion-ready');

    // If the tab is restored from the back-forward cache, reveal anything already visible.
    const revealVisible = () => {
      const height = window.innerHeight || document.documentElement.clientHeight;
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < height * 0.92) {
          element.classList.add('is-visible');
          observer.unobserve(element);
        }
      });
    };
    revealVisible();
    window.addEventListener('pageshow', revealVisible, { once: true, passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
