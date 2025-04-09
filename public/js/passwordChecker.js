document.addEventListener('DOMContentLoaded', () => {
    // Password toggle functionality
    const passwordFields = document.querySelectorAll('.auth-input[type="password"]');
    passwordFields.forEach(field => {
        const toggleBtn = field.nextElementSibling;
        if (toggleBtn && toggleBtn.classList.contains('password-toggle')) {
            toggleBtn.addEventListener('click', () => {
                const isPassword = field.type === 'password';
                field.type = isPassword ? 'text' : 'password';
                toggleBtn.querySelector('i').className = isPassword ? 'fa fa-eye' : 'fa fa-eye-slash';
            });
        }
    });

    // Password strength checker
    window.checkStrength = function(password) {
        const strengthSpan = document.getElementById('strength');
        if (!strengthSpan) return;

        let strength = 'Weak';
        strengthSpan.className = 'weak';

        if (password.length >= 8) {
            strength = 'Medium';
            strengthSpan.className = 'medium';
            if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
                strength = 'Strong';
                strengthSpan.className = 'strong';
            }
        }

        strengthSpan.textContent = strength;
    };

    // Form validation for Bootstrap
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', e => {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
});