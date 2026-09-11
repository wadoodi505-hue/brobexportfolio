/**
 * Ultra-Performance Mobile Engine
 * Strips heavy desktop scroll hooks and enforces hardware acceleration on touch devices
 */
(function () {
  'use strict';

  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isMobile) return;

  // 1. Force Passive Event Listeners to Eliminate Touch Scroll Delay
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    let modOptions = options;
    if (['touchstart', 'touchmove', 'wheel', 'scroll'].includes(type)) {
      if (typeof options === 'boolean') {
        modOptions = { capture: options, passive: true };
      } else if (typeof options === 'object' || options === undefined) {
        modOptions = Object.assign({}, options, { passive: true });
      }
    }
    return originalAddEventListener.call(this, type, listener, modOptions);
  };

  document.addEventListener('DOMContentLoaded', () => {
    // 2. Kill Heavy Smooth Scroll Libraries (Lenis / Locomotive) on Mobile Touch
    if (window.lenis) {
      try {
        window.lenis.destroy();
        window.lenis = null;
      } catch (e) {}
    }

    // 3. Optimize GSAP & ScrollTrigger Bottlenecks on Mobile
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.config({ 
        limitCallbacks: true, 
        ignoreMobileResize: true 
      });
      
      // Disable heavy layout pins and scrub loops on mobile screens
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.pin || st.vars.scrub > 0) {
          st.kill(false);
        }
      });
    }

    // 4. Lightweight Native Intersection Observer for Viewport Animations
    const animatedElements = document.querySelectorAll('.animate, [data-aos], .reveal');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active', 'visible', 'aos-animate');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '50px 0px 50px 0px', threshold: 0.05 });

      animatedElements.forEach(el => observer.observe(el));
    }

    // 5. Defer Non-Essential Images
    const lazyImages = document.querySelectorAll('img:not([loading])');
    lazyImages.forEach(img => img.setAttribute('loading', 'lazy'));
  });
})();