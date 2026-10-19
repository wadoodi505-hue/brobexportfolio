/* BROBEX interaction refinement: standard cursor and flat, 2D cards only. */
(() => {
  'use strict';
  const refresh = () => {
    document.querySelectorAll('.desktop-tilt, .is-pointer-active').forEach((el) => {
      el.classList.remove('desktop-tilt', 'is-pointer-active');
      el.style.removeProperty('--tilt-x');
      el.style.removeProperty('--tilt-y');
      el.style.removeProperty('--pointer-x');
      el.style.removeProperty('--pointer-y');
    });
    document.body.classList.remove('desktop-motion-enabled');
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true });
  else refresh();
  window.addEventListener('brobex:motion-refresh', refresh);
})();
