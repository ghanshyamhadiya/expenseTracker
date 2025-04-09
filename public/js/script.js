
function showDeleteModal(expenseId) {
    document.getElementById('deleteForm').action = `/expense/remove/${expenseId}/?_method=DELETE`;
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
    // Add a small delay before adding the active class for better animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('active');
    // Add a small delay before hiding the modal to allow for animation
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Budget delete modal functions
function showBudgetDeleteModal(budgetId) {
    document.getElementById('budgetDeleteForm').action = `/budget/${budgetId}/delete?_method=DELETE`;
    const modal = document.getElementById('budgetDeleteModal');
    modal.style.display = 'flex';
    // Add a small delay before adding the active class for better animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeBudgetDeleteModal() {
    const modal = document.getElementById('budgetDeleteModal');
    modal.classList.remove('active');
    // Add a small delay before hiding the modal to allow for animation
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Ensure form submission is handled correctly
const deleteForm = document.getElementById('deleteForm');
if (deleteForm) {
    deleteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Get the submit button and disable it
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            disableButtonAndShowWait(submitBtn);
        }
        
        // Submit the form after a brief delay to allow the button state to update
        setTimeout(() => {
            this.submit();
        }, 100);
    });
}

const budgetDeleteForm = document.getElementById('budgetDeleteForm');
if (budgetDeleteForm) {
    budgetDeleteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Get the submit button and disable it
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            disableButtonAndShowWait(submitBtn);
        }
        
        // Submit the form after a brief delay to allow the button state to update
        setTimeout(() => {
            this.submit();
        }, 100);
    });
}

// Function to disable buttons and show 'Please wait...' message
function disableButtonAndShowWait(button) {
    // Store original text
    button.dataset.originalText = button.textContent;
    // Disable button
    button.disabled = true;
    // Change text to 'Please wait...'
    button.textContent = 'Please wait...';
    // Add loading animation class
    button.classList.add('btn-loading');
    // Remove any hover effects while loading
    button.classList.remove('btn-pulse', 'btn-slide-in', 'btn-fade-in');
}

// Function to restore button to original state
function restoreButton(button) {
    // Only restore if it was disabled by our function
    if (button.dataset.originalText) {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
        // Remove loading animation class
        button.classList.remove('btn-loading');
        // Add fade-in animation for smooth transition back
        button.classList.add('btn-fade-in');
        // Remove fade-in class after animation completes
        setTimeout(() => {
            button.classList.remove('btn-fade-in');
        }, 500);
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle all forms in the document
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(event) {
            // Don't disable for forms that are handled by modals
            if (this.id === 'deleteForm' || this.id === 'budgetDeleteForm') {
                return;
            }
            
            // Find the submit button in this form
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                disableButtonAndShowWait(submitButton);
            }
        });
    });
    
    // Handle specific buttons that trigger actions
    document.querySelectorAll('.remove-btn').forEach(button => {
        // Store the original onclick function
        const originalOnClick = button.onclick;
        
        button.onclick = function(event) {
            // Call the original onclick function
            if (originalOnClick) {
                originalOnClick.call(this, event);
            }
            
            // Disable the button and show wait message
            disableButtonAndShowWait(this);
            
            // For modal buttons, we need to restore them when modal is closed
            setTimeout(() => {
                restoreButton(this);
            }, 500);
        };
    });
});

// Improved modal functions with proper button state handling
// Store original functions for reference
const originalShowDeleteModal = showDeleteModal;
const originalShowBudgetDeleteModal = showBudgetDeleteModal;

// Override expense delete modal function with improved version
showDeleteModal = function(expenseId) {
    // Call the original function to set up the modal
    originalShowDeleteModal(expenseId);
    
    // The form submit event will handle button disabling
    // This ensures the modal works correctly and the button state is managed properly
};

// Override budget delete modal function with improved version
showBudgetDeleteModal = function(budgetId) {
    // Call the original function to set up the modal
    originalShowBudgetDeleteModal(budgetId);
    
    // The form submit event will handle button disabling
    // This ensures the modal works correctly and the button state is managed properly
};