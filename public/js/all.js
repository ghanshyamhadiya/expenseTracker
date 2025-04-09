document.addEventListener('DOMContentLoaded', function() {
    // Set default start date to today
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.value = today;
        startDateInput.min = today;
    }
    
    // Set min date for end date to start date
    const endDateInput = document.getElementById('endDate');
    if (endDateInput && startDateInput) {
        startDateInput.addEventListener('change', function() {
            endDateInput.min = startDateInput.value;
        });
        endDateInput.min = startDateInput.value;
    }
    
    // Add animation classes to form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${0.1 * (index + 1)}s`;
    });
    
    // Add currency symbol to amount field
    const amountInput = document.getElementById('amount');
    const typeRadios = document.querySelectorAll('input[name="type"]');
    
    function addCurrencySymbol() {
        if (!amountInput) return;
        
        // Create currency symbol if it doesn't exist
        let currencySymbol = amountInput.parentElement.querySelector('.currency-symbol');
        if (!currencySymbol) {
            currencySymbol = document.createElement('span');
            currencySymbol.className = 'currency-symbol';
            amountInput.parentElement.appendChild(currencySymbol);
            
            // Position the symbol
            currencySymbol.style.position = 'absolute';
            currencySymbol.style.left = '12px';
            currencySymbol.style.top = '50%';
            currencySymbol.style.transform = 'translateY(-50%)';
            currencySymbol.style.fontWeight = '500';
            
            // Add left padding to amount input
            amountInput.style.paddingLeft = '2rem';
        }
        
        // Set symbol based on transaction type
        const isExpense = document.getElementById('type-expense').checked;
        if (isExpense) {
            currencySymbol.textContent = '-$';
            currencySymbol.style.color = 'var(--error-color)';
        } else {
            currencySymbol.textContent = '+$';
            currencySymbol.style.color = 'var(--success-color)';
        }
    }
    
    // Initialize and update currency symbol
    addCurrencySymbol();
    typeRadios.forEach(radio => {
        radio.addEventListener('change', addCurrencySymbol);
    });
    
    // Add validation and enhanced interaction
    const form = document.querySelector('.recurring-form');
    const allInputs = form.querySelectorAll('input, select, textarea');
    
    // Focus indication
    allInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.closest('.form-group').classList.add('active');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.closest('.form-group').classList.remove('active');
            }
        });
    });
    
    // Form submission animation
    form.addEventListener('submit', function(e) {
        // Add visual feedback on form submission
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // You may want to add validation here before allowing submission
        const title = document.getElementById('title').value.trim();
        const amount = document.getElementById('amount').value;
        
        if (!title || !amount) {
            e.preventDefault();
            
            if (!title) highlightError('title');
            if (!amount) highlightError('amount');
            
            // Reset button
            submitBtn.innerHTML = 'Create Recurring Transaction';
            submitBtn.disabled = false;
        }
    });
    
    // Error highlighting function
    function highlightError(fieldId) {
        const field = document.getElementById(fieldId);
        field.style.borderColor = 'var(--error-color)';
        field.style.backgroundColor = 'rgba(253, 57, 122, 0.05)';
        
        field.addEventListener('input', function resetField() {
            field.style.borderColor = '';
            field.style.backgroundColor = '';
            field.removeEventListener('input', resetField);
        });
        
        // Add shake animation
        field.classList.add('shake-error');
        setTimeout(() => {
            field.classList.remove('shake-error');
        }, 500);
    }
    
    // Add shake animation CSS dynamically
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        @keyframes shakeField {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        .shake-error {
            animation: shakeField 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
    `;
    document.head.appendChild(styleSheet);
});