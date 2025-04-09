
function hideMessage(messageId) {
    const container = document.getElementById(messageId);
    if (container) {
        // Add a subtle scale effect before hiding
        const flashMessage = container.querySelector('.flash-message');
        if (flashMessage) {
            flashMessage.style.transform = 'scale(0.98)';
        }
        
        // Add the hide class after a short delay for the scale effect
        setTimeout(() => {
            container.classList.add('hide');
            // Remove the element after the animation completes
            setTimeout(() => container.remove(), 500);
        }, 100);
    }
}

// Add a subtle entrance animation effect
function animateEntrance() {
    const messages = document.querySelectorAll('.message-container');
    messages.forEach((container, index) => {
        // Stagger the animations slightly for multiple messages
        container.style.animationDelay = `${index * 150}ms`;
        
        // Add a subtle bounce effect
        const flashMessage = container.querySelector('.flash-message');
        if (flashMessage) {
            flashMessage.style.animationName = 'bounceIn';
            flashMessage.style.animationDuration = '0.6s';
            flashMessage.style.animationFillMode = 'both';
        }
    });
}

// Auto-hide messages after 5 seconds
document.addEventListener('DOMContentLoaded', () => {
    const messages = ['success-message', 'update-message', 'error-message'];
    
    // Apply entrance animations
    animateEntrance();
    
    // Set up auto-hide timers
    messages.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            // The progress bar animation is set to 5s in CSS
            setTimeout(() => hideMessage(id), 5000);
        }
    });
    
    // Add hover effect to pause the progress bar
    document.querySelectorAll('.flash-message').forEach(message => {
        message.addEventListener('mouseenter', () => {
            const progressBar = message.querySelector('::after');
            if (progressBar) {
                progressBar.style.animationPlayState = 'paused';
            }
        });
        
        message.addEventListener('mouseleave', () => {
            const progressBar = message.querySelector('::after');
            if (progressBar) {
                progressBar.style.animationPlayState = 'running';
            }
        });
    });
});