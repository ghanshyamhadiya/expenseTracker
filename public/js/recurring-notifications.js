// Recurring Transactions Notifications System

document.addEventListener('DOMContentLoaded', function() {
    const recurringSection = document.querySelector('.recurring-section');
    if (!recurringSection) return;
    
    initializeNotifications();
    
    // Function to initialize notifications
    function initializeNotifications() {
        // Create notifications container if it doesn't exist
        if (!document.querySelector('.notifications-container')) {
            const notificationsContainer = document.createElement('div');
            notificationsContainer.className = 'notifications-container';
            document.body.appendChild(notificationsContainer);
        }
        
        // Check for upcoming transactions
        checkUpcomingTransactions();
        
        // Add notification preferences to user settings
        addNotificationPreferences();
    }
    
    // Function to check for upcoming transactions
    function checkUpcomingTransactions() {
        const transactions = document.querySelectorAll('.recurring-transaction-card');
        const upcomingTransactions = [];
        
        // Get current date and date 3 days from now
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        
        // Filter transactions due in the next 3 days
        transactions.forEach(transaction => {
            if (transaction.classList.contains('inactive')) return;
            
            const nextDueDateText = transaction.querySelector('.transaction-next-date span').textContent.replace('Next: ', '');
            const nextDueDate = new Date(nextDueDateText);
            
            if (nextDueDate >= today && nextDueDate <= threeDaysFromNow) {
                const type = transaction.querySelector('.transaction-type-badge').textContent.trim();
                const title = transaction.querySelector('.transaction-title').textContent.trim();
                const amount = transaction.querySelector('.transaction-amount span').textContent.trim();
                
                upcomingTransactions.push({
                    type,
                    title,
                    amount,
                    date: nextDueDate
                });
            }
        });
        
        // Show notifications for upcoming transactions
        if (upcomingTransactions.length > 0) {
            showNotificationBanner(upcomingTransactions);
        }
    }
    
    // Function to show notification banner
    function showNotificationBanner(transactions) {
        // Create notification banner if it doesn't exist
        let notificationBanner = document.querySelector('.notification-banner');
        
        if (!notificationBanner) {
            notificationBanner = document.createElement('div');
            notificationBanner.className = 'notification-banner';
            document.querySelector('.dashboard-container').prepend(notificationBanner);
        }
        
        // Create banner content
        let bannerContent = `
            <div class="notification-header">
                <i class="fas fa-bell"></i>
                <h3>Upcoming Transactions</h3>
                <button class="close-notification"><i class="fas fa-times"></i></button>
            </div>
            <div class="notification-content">
        `;
        
        // Add each transaction to the banner
        transactions.forEach(transaction => {
            const daysUntil = Math.ceil((transaction.date - new Date()) / (1000 * 60 * 60 * 24));
            const dayText = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
            
            bannerContent += `
                <div class="notification-item ${transaction.type.toLowerCase().includes('expense') ? 'expense' : 'income'}">
                    <div class="notification-icon">
                        <i class="fas ${transaction.type.toLowerCase().includes('expense') ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                    </div>
                    <div class="notification-details">
                        <span class="notification-title">${transaction.title}</span>
                        <span class="notification-date">${dayText} (${transaction.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</span>
                    </div>
                    <div class="notification-amount">
                        ${transaction.type.toLowerCase().includes('expense') ? '-' : '+'}$${transaction.amount}
                    </div>
                </div>
            `;
        });
        
        bannerContent += `
            </div>
            <div class="notification-footer">
                <button class="dismiss-all">Dismiss All</button>
                <button class="notification-settings">Notification Settings</button>
            </div>
        `;
        
        // Set banner content
        notificationBanner.innerHTML = bannerContent;
        
        // Add event listeners
        notificationBanner.querySelector('.close-notification').addEventListener('click', function() {
            notificationBanner.classList.add('hidden');
            // Store in session that user has dismissed notifications
            sessionStorage.setItem('notificationsDismissed', 'true');
        });
        
        notificationBanner.querySelector('.dismiss-all').addEventListener('click', function() {
            notificationBanner.classList.add('hidden');
            // Store in session that user has dismissed notifications
            sessionStorage.setItem('notificationsDismissed', 'true');
        });
        
        notificationBanner.querySelector('.notification-settings').addEventListener('click', function() {
            showNotificationSettings();
        });
        
        // Only show if user hasn't dismissed notifications this session
        if (sessionStorage.getItem('notificationsDismissed') !== 'true') {
            notificationBanner.classList.add('active');
        }
    }
    
    // Function to show notification settings
    function showNotificationSettings() {
        // Create modal for notification settings
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'notificationSettingsModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-bell"></i> Notification Settings</h2>
                    <button type="button" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="settings-group">
                        <h3>Notification Preferences</h3>
                        <div class="setting-item">
                            <label for="notify-days-before">Notify me</label>
                            <select id="notify-days-before">
                                <option value="0">On the day</option>
                                <option value="1">1 day before</option>
                                <option value="2">2 days before</option>
                                <option value="3" selected>3 days before</option>
                                <option value="5">5 days before</option>
                                <option value="7">7 days before</option>
                            </select>
                            <label for="notify-days-before">of due transactions</label>
                        </div>
                        
                        <div class="setting-item">
                            <label for="notification-types">Notify me about</label>
                            <select id="notification-types">
                                <option value="all" selected>All transactions</option>
                                <option value="expense">Expenses only</option>
                                <option value="income">Income only</option>
                                <option value="above">Transactions above amount</option>
                            </select>
                        </div>
                        
                        <div class="setting-item" id="amount-threshold-container" style="display: none;">
                            <label for="amount-threshold">Amount threshold: $</label>
                            <input type="number" id="amount-threshold" min="0" step="0.01" value="100">
                        </div>
                        
                        <div class="setting-item checkbox-item">
                            <input type="checkbox" id="email-notifications" checked>
                            <label for="email-notifications">Send email notifications</label>
                        </div>
                        
                        <div class="setting-item checkbox-item">
                            <input type="checkbox" id="browser-notifications" checked>
                            <label for="browser-notifications">Show browser notifications</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline cancel-btn">Cancel</button>
                    <button type="button" class="btn btn-primary save-btn">Save Settings</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }, 0);
        
        // Add event listeners
        modal.querySelector('.close-btn').addEventListener('click', closeNotificationSettingsModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeNotificationSettingsModal);
        modal.querySelector('.save-btn').addEventListener('click', saveNotificationSettings);
        
        // Show/hide amount threshold based on notification type selection
        const notificationTypesSelect = document.getElementById('notification-types');
        const amountThresholdContainer = document.getElementById('amount-threshold-container');
        
        notificationTypesSelect.addEventListener('change', function() {
            amountThresholdContainer.style.display = this.value === 'above' ? 'flex' : 'none';
        });
        
        // Load saved settings if available
        loadNotificationSettings();
    }
    
    // Function to close notification settings modal
    function closeNotificationSettingsModal() {
        const modal = document.getElementById('notificationSettingsModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        }, 300);
    }
    
    // Function to save notification settings
    function saveNotificationSettings() {
        const settings = {
            daysBefore: parseInt(document.getElementById('notify-days-before').value),
            notificationType: document.getElementById('notification-types').value,
            amountThreshold: parseFloat(document.getElementById('amount-threshold').value),
            emailNotifications: document.getElementById('email-notifications').checked,
            browserNotifications: document.getElementById('browser-notifications').checked
        };
        
        // Save settings to localStorage
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        
        // Close modal
        closeNotificationSettingsModal();
        
        // Show confirmation message
        showToast('Notification settings saved successfully!');
    }
    
    // Function to load notification settings
    function loadNotificationSettings() {
        const savedSettings = localStorage.getItem('notificationSettings');
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            document.getElementById('notify-days-before').value = settings.daysBefore;
            document.getElementById('notification-types').value = settings.notificationType;
            document.getElementById('amount-threshold').value = settings.amountThreshold;
            document.getElementById('email-notifications').checked = settings.emailNotifications;
            document.getElementById('browser-notifications').checked = settings.browserNotifications;
            
            // Show/hide amount threshold based on notification type
            const amountThresholdContainer = document.getElementById('amount-threshold-container');
            amountThresholdContainer.style.display = settings.notificationType === 'above' ? 'flex' : 'none';
        }
    }
    
    // Function to add notification preferences to user settings
    function addNotificationPreferences() {
        // This would typically integrate with a user settings page
        // For now, we'll just add a button to the header actions
        const headerActions = document.querySelector('.recurring-section .header-actions');
        
        if (headerActions) {
            const notificationButton = document.createElement('button');
            notificationButton.className = 'btn btn-outline notification-btn';
            notificationButton.innerHTML = '<i class="fas fa-bell"></i> Notifications';
            
            notificationButton.addEventListener('click', showNotificationSettings);
            
            headerActions.appendChild(notificationButton);
        }
    }
    
    // Function to show toast message
    function showToast(message) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('active');
        }, 10);
        
        // Add event listener to close button
        toast.querySelector('.toast-close').addEventListener('click', function() {
            toast.classList.remove('active');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        });
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
});