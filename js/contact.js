/**
 * BROBEX - Contact Form Logic
 * Handles client-side validation and success messaging.
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccess');

    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            if(name && email && message) {
                // Simulate data transmission delay
                const submitBtn = contactForm.querySelector('.form-submit');
                submitBtn.innerHTML = "TRANSMITTING... <i class='fas fa-spinner fa-spin'></i>";
                submitBtn.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    // Success state
                    contactForm.reset();
                    submitBtn.innerHTML = "TRANSMIT MESSAGE &rarr;";
                    submitBtn.style.pointerEvents = 'auto';
                    
                    successMsg.style.display = 'block';
                    successMsg.style.color = '#00FF00'; // Matrix green
                    successMsg.style.marginTop = '1rem';
                    successMsg.style.fontFamily = 'var(--font-tech)';
                    successMsg.style.fontSize = '0.8rem';
                    
                    setTimeout(() => {
                        successMsg.style.display = 'none';
                    }, 5000);
                }, 1500);
            }
        });
    }
});