/**
 * BROBEX - About Page Logic
 * Handles 3D magnetic tilt for tech stack cards and timeline scroll logic.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ==========================================================================
       1. 3D MAGNETIC TILT - TECH STACK CARDS
       ========================================================================== */
    const techCards = document.querySelectorAll('.tech-card');

    if (!prefersReducedMotion && techCards.length > 0) {
        techCards.forEach(card => {
            let rafId = null;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top;  
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate rotation (Max 10 degrees for professional feel)
                const rotateX = ((y - centerY) / centerY) * -10; 
                const rotateY = ((x - centerX) / centerX) * 10;

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                    card.style.borderColor = 'var(--accent-green)';
                    card.style.zIndex = '10';
                });
            });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                    card.style.borderColor = 'rgba(212, 175, 55, 0.25)'; // Return to glass-border var equivalent
                    card.style.zIndex = '1';
                });
            });
        });
    }

    /* ==========================================================================
       2. PROGRESSION TRACK ANIMATION
       ========================================================================== */
    const trackSection = document.querySelector('.progression-track');

    if (trackSection && !prefersReducedMotion && ('IntersectionObserver' in window)) {
        const trackObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add class to trigger CSS gradient fill on the lines
                    entry.target.classList.add('animate-track');
                    
                    // Sequentially illuminate dots
                    const dots = entry.target.querySelectorAll('.node-dot:not(.active-dot)');
                    dots.forEach((dot, index) => {
                        setTimeout(() => {
                            dot.style.background = 'var(--accent-green)';
                            dot.style.borderColor = 'var(--accent-green-bright)';
                            dot.style.boxShadow = '0 0 15px var(--accent-green-glow)';
                        }, (index + 1) * 300); // 300ms delay per dot
                    });

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        trackObserver.observe(trackSection);
    }
});