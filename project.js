document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('.project-card');

  if (reducedMotion || !window.matchMedia('(hover: hover)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty('--pointer-x', `${x * 2}%`);
      card.style.setProperty('--pointer-y', `${y * 2}%`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--pointer-x');
      card.style.removeProperty('--pointer-y');
    });
  });
});