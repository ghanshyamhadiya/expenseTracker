// Export functionality for expense data

document.addEventListener('DOMContentLoaded', function() {
    // Check if export button exists
    const exportBtn = document.getElementById('export-data');
    if (!exportBtn) return;
    
    // Add click event listener to export button
    exportBtn.addEventListener('click', function() {
        exportToCSV();
    });
    
    // Function to export expense data to CSV
    function exportToCSV() {
        const expenseData = window.expenseData || [];
        if (!expenseData.length) {
            showMessage('No data to export', 'error');
            return;
        }
        
        // Get filter values if they exist
        const periodFilter = document.getElementById('period-filter');
        const categoryFilter = document.getElementById('category-filter');
        const period = periodFilter ? periodFilter.value : 'all';
        const category = categoryFilter ? categoryFilter.value : 'all';
        
        // Filter data based on selected filters
        let filteredData = [...expenseData];
        
        if (period !== 'all') {
            const now = new Date();
            let startDate;
            
            switch(period) {
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'quarter':
                    startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(0); // Beginning of time
            }
            
            filteredData = filteredData.filter(item => new Date(item.date) >= startDate);
        }
        
        if (category !== 'all') {
            filteredData = filteredData.filter(item => item.sourceOfCategory === category);
        }
        
        // Prepare CSV content
        const headers = ['Date', 'Type', 'Amount', 'Category', 'Description'];
        
        let csvContent = headers.join(',') + '\n';
        
        filteredData.forEach(item => {
            const date = new Date(item.date).toLocaleDateString();
            const type = item.type;
            const amount = item.Amount;
            const category = item.sourceOfCategory || 'Uncategorized';
            // Escape description to handle commas and quotes
            const description = `"${(item.description || '').replace(/"/g, '""')}"`;
            
            const row = [date, type, amount, category, description].join(',');
            csvContent += row + '\n';
        });
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `expense-tracker-export-${formatDate(new Date())}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('Export successful!', 'success');
    }
    
    // Helper function to format date for filename
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Helper function to show message
    function showMessage(message, type) {
        // Check if flash message container exists
        const flashContainer = document.querySelector('.flash-container');
        if (!flashContainer) return;
        
        // Create flash message
        const flashMessage = document.createElement('div');
        flashMessage.className = `flash-message ${type}`;
        flashMessage.innerHTML = `
            <div class="flash-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            </div>
            <div class="flash-content">
                <p>${message}</p>
            </div>
            <button class="flash-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        flashContainer.appendChild(flashMessage);
        
        // Add close button functionality
        const closeBtn = flashMessage.querySelector('.flash-close');
        closeBtn.addEventListener('click', function() {
            flashMessage.classList.add('removing');
            setTimeout(() => {
                flashContainer.removeChild(flashMessage);
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (flashContainer.contains(flashMessage)) {
                flashMessage.classList.add('removing');
                setTimeout(() => {
                    if (flashContainer.contains(flashMessage)) {
                        flashContainer.removeChild(flashMessage);
                    }
                }, 300);
            }
        }, 5000);
    }
});