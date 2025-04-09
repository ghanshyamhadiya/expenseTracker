// Animation script for login and signup forms
document.addEventListener('DOMContentLoaded', function() {
    // Animate form elements sequentially
    const formElements = document.querySelectorAll('.custom-signup-form .input-group-float, .signup_reco, .custom-btn-blue');
    
    // Apply staggered animations
    formElements.forEach((element, index) => {
        // Set animation delay based on element index
        element.style.animationDelay = `${index * 0.1}s`;
        
        // Add animation classes
        if (element.classList.contains('input-group-float')) {
            element.classList.add('animate-slide-in');
        } else if (element.classList.contains('signup_reco')) {
            element.classList.add('animate-fade-in');
        } else if (element.classList.contains('custom-btn-blue')) {
            element.classList.add('animate-slide-up');
        }
    });
    
    // Add shine effect to buttons on hover
    const buttons = document.querySelectorAll('.custom-btn-blue');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('shine-effect');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('shine-effect');
            // Reset the animation by removing and re-adding the class
            setTimeout(() => {
                this.classList.remove('shine-effect');
            }, 300);
        });
    });
    
    // Add floating effect to form container
    const formContainer = document.querySelector('.signup-container-shadow');
    if (formContainer) {
        let floatingAnimation;
        
        // Subtle floating animation
        function startFloating() {
            let startTime = null;
            const duration = 3000; // 3 seconds for a complete cycle
            const amplitude = 5; // Maximum movement in pixels
            
            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = (elapsed % duration) / duration;
                
                // Sine wave movement for smooth floating effect
                const movement = amplitude * Math.sin(progress * Math.PI * 2);
                
                // Apply transform
                formContainer.style.transform = `translateY(${movement}px)`;
                
                floatingAnimation = requestAnimationFrame(animate);
            }
            
            floatingAnimation = requestAnimationFrame(animate);
        }
        
        // Start floating animation after initial animations complete
        setTimeout(startFloating, 1500);
        
        // Stop floating on form interaction
        formContainer.addEventListener('mouseenter', function() {
            if (floatingAnimation) {
                cancelAnimationFrame(floatingAnimation);
                formContainer.style.transform = 'translateY(0)';
            }
        });
        
        // Resume floating when not interacting
        formContainer.addEventListener('mouseleave', function() {
            startFloating();
        });
    }
    
    // Add focus effects for input fields
    const inputFields = document.querySelectorAll('.input-glow');
    inputFields.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focus');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focus');
        });
    });
});