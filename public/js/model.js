function showUpdateModal() {
    const form = document.getElementById('updateForm');
    if (!form || !form.checkValidity()) {
        if (form) form.reportValidity();
        return;
    }

    const details = {
        type: document.getElementById('type').value,
        amount: document.getElementById('amount').value,
        date: document.getElementById('date').value,
        category: document.getElementById('category').value
    };

    const modal = document.getElementById('confirmModal');
    document.getElementById('modalType').textContent = details.type;
    document.getElementById('modalAmount').textContent = parseFloat(details.amount).toFixed(2);
    document.getElementById('modalDate').textContent = details.date;
    document.getElementById('modalCategory').textContent = details.category;
    modal.style.display = 'flex';
}

function hideUpdateModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
}

function submitUpdateForm() {
    const form = document.getElementById('updateForm');
    if (form) {
        // Find the submit button that triggered this action
        const submitBtn = document.querySelector('#confirmModal .confirm-btn');
        if (submitBtn) {
            // Disable button and show wait message
            submitBtn.disabled = true;
            submitBtn.dataset.originalText = submitBtn.textContent;
            submitBtn.textContent = 'Please wait...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        }
        form.submit();
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the update form if it exists
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', function(event) {
            // Find the submit button in this form
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                // Disable button and show wait message
                submitButton.disabled = true;
                submitButton.dataset.originalText = submitButton.textContent;
                submitButton.textContent = 'Please wait...';
                submitButton.style.opacity = '0.7';
                submitButton.style.cursor = 'not-allowed';
            }
        });
    }
});