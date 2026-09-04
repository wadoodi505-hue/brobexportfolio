/**
 * BROBEX - Navigation Logic
 * Handles mobile menu, active states, and page transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Highlight active nav based on URL
    const currentLocation = location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.top-nav-links a, .rail-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentLocation || (currentLocation === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Elegant Page Transitions
    const allLinks = document.querySelectorAll('a[href]:not([target="_blank"])');
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const destination = this.getAttribute('href');
            // If internal link
            if(destination.endsWith('.html')) {
                e.preventDefault();
                document.body.style.animation = 'none';
                document.body.style.opacity = '1';
                
                // Fade out
                document.body.style.transition = 'opacity 0.4s ease, filter 0.4s ease';
                document.body.style.opacity = '0';
                document.body.style.filter = 'blur(10px)';
                
                setTimeout(() => {
                    window.location.href = destination;
                }, 400);
            }
        });
    });
});