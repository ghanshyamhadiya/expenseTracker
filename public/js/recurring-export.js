// Recurring Transactions Export Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the recurring transactions page
    const recurringSection = document.querySelector('.recurring-section');
    if (!recurringSection) return;
    
    // Add export button to the filter controls
    addExportButton();
    
    // Function to add export button
    function addExportButton() {
        const filterControls = document.querySelector('.filter-controls');
        if (!filterControls) return;
        
        const exportButton = document.createElement('button');
        exportButton.id = 'export-recurring-data';
        exportButton.className = 'export-btn';
        exportButton.innerHTML = '<i class="fas fa-download"></i> Export Data';
        
        filterControls.appendChild(exportButton);
        
        // Add event listener to export button
        exportButton.addEventListener('click', exportRecurringData);
    }
    
    // Function to export recurring data
    function exportRecurringData() {
        // Get all visible recurring transactions
        const transactions = Array.from(document.querySelectorAll('.recurring-transaction-card'))
            .filter(t => t.style.display !== 'none');
        
        if (transactions.length === 0) {
            alert('No transactions to export.');
            return;
        }
        
        // Create CSV content
        const csvContent = generateCSV(transactions);
        
        // Create download link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'recurring_transactions.csv');
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
    }
    
    // Function to generate CSV content
    function generateCSV(transactions) {
        // CSV header
        let csv = 'Title,Type,Category,Amount,Frequency,Next Due Date,Start Date,End Date,Status,Description\n';
        
        // Add each transaction
        transactions.forEach(transaction => {
            const title = transaction.querySelector('.transaction-title').textContent.trim();
            const type = transaction.querySelector('.transaction-type-badge').textContent.trim();
            const category = transaction.querySelector('.transaction-category').textContent.trim();
            const amount = transaction.querySelector('.transaction-amount span').textContent.trim();
            const frequency = transaction.querySelector('.transaction-frequency span').textContent.trim();
            const nextDueDate = transaction.querySelector('.transaction-next-date span').textContent.replace('Next: ', '').trim();
            
            const startDateElement = transaction.querySelector('.transaction-dates div:first-child .date-value');
            const startDate = startDateElement ? startDateElement.textContent.trim() : '';
            
            const endDateElement = transaction.querySelector('.transaction-dates div:last-child .date-value');
            const endDate = endDateElement ? endDateElement.textContent.trim() : '';
            
            const status = transaction.classList.contains('inactive') ? 'Inactive' : 'Active';
            
            const descriptionElement = transaction.querySelector('.transaction-description span');
            const description = descriptionElement ? descriptionElement.textContent.trim() : '';
            
            // Escape fields that might contain commas
            const escapedTitle = `"${title.replace(/"/g, '""')}"`;
            const escapedCategory = `"${category.replace(/"/g, '""')}"`;
            const escapedDescription = `"${description.replace(/"/g, '""')}"`;
            
            // Add row to CSV
            csv += `${escapedTitle},${type},${escapedCategory},${amount},${frequency},${nextDueDate},${startDate},${endDate},${status},${escapedDescription}\n`;
        });
        
        return csv;
    }
});