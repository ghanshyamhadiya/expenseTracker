document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.password-toggle-btn');
        if (!toggleBtn) return; // Exit if not a toggle button

        // Find the associated password input by ID or proximity
        const passwordField = toggleBtn.closest('.input-group-float').querySelector('#password');
        
        if (passwordField) {
            // Toggle password visibility
            const isPassword = passwordField.type === 'password';
            passwordField.type = isPassword ? 'text' : 'password';

            // Update button icon and accessibility attributes
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                // Use correct Font Awesome classes (assuming v5 or v6)
                icon.className = isPassword ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
            toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        }
    });
});