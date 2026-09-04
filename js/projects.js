/**
 * BROBEX - Project Interactions
 * Specific logic for the projects showcase page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Add futuristic scanline effect purely via JS event for interaction
        card.addEventListener('mouseenter', () => {
            const overlay = card.querySelector('.project-overlay');
            if(overlay) {
                overlay.style.background = 'linear-gradient(rgba(255,0,127,0.1) 1px, transparent 1px)';
                overlay.style.backgroundSize = '100% 4px';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const overlay = card.querySelector('.project-overlay');
            if(overlay) {
                overlay.style.background = 'rgba(5,5,7,0.7)';
            }
        });
    });
});