// Recurring Transactions Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the recurring transactions page
    const recurringSection = document.querySelector('.recurring-section');
    if (!recurringSection) return;
    
    // Check if there are recurring transactions
    const transactionsContainer = document.querySelector('.recurring-transactions-container');
    if (!transactionsContainer) return;
    
    // Initialize filter controls
    initializeFilterControls();
    
    // Create dashboard section
    createDashboardSection();
    
    // Initialize charts
    initializeCharts();
    
    // Function to initialize filter controls
    function initializeFilterControls() {
        // Create filter controls element
        const filterControls = document.createElement('div');
        filterControls.className = 'filter-controls';
        filterControls.innerHTML = `
            <div class="filter-group">
                <label for="status-filter">Status:</label>
                <select id="status-filter">
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="type-filter">Type:</label>
                <select id="type-filter">
                    <option value="all">All</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="category-filter">Category:</label>
                <select id="category-filter">
                    <option value="all">All Categories</option>
                    ${generateCategoryOptions()}
                </select>
            </div>
            
            <div class="filter-group sort-group">
                <label for="sort-by">Sort By:</label>
                <select id="sort-by">
                    <option value="next-date">Next Due Date</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                    <option value="title">Title</option>
                </select>
            </div>
        `;
        
        // Insert filter controls after section header
        const sectionHeader = document.querySelector('.recurring-section .section-header');
        sectionHeader.parentNode.insertBefore(filterControls, sectionHeader.nextSibling);
        
        // Add event listeners to filters
        document.getElementById('status-filter').addEventListener('change', applyFilters);
        document.getElementById('type-filter').addEventListener('change', applyFilters);
        document.getElementById('category-filter').addEventListener('change', applyFilters);
        document.getElementById('sort-by').addEventListener('change', applyFilters);
    }
    
    // Function to generate category options for filter
    function generateCategoryOptions() {
        const categories = [];
        const transactions = document.querySelectorAll('.recurring-transaction-card');
        
        transactions.forEach(transaction => {
            const category = transaction.querySelector('.transaction-category').textContent.trim();
            if (!categories.includes(category)) {
                categories.push(category);
            }
        });
        
        categories.sort();
        return categories.map(category => `<option value="${category}">${category}</option>`).join('');
    }
    
    // Function to apply filters and sorting
    function applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const typeFilter = document.getElementById('type-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const sortBy = document.getElementById('sort-by').value;
        
        const transactions = document.querySelectorAll('.recurring-transaction-card');
        const transactionsArray = Array.from(transactions);
        
        // Filter transactions
        transactionsArray.forEach(transaction => {
            const isActive = !transaction.classList.contains('inactive');
            const type = transaction.querySelector('.transaction-type-badge').textContent.trim().toLowerCase();
            const category = transaction.querySelector('.transaction-category').textContent.trim();
            
            let visible = true;
            
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && !isActive) visible = false;
                if (statusFilter === 'inactive' && isActive) visible = false;
            }
            
            if (typeFilter !== 'all' && !type.includes(typeFilter)) visible = false;
            if (categoryFilter !== 'all' && category !== categoryFilter) visible = false;
            
            transaction.style.display = visible ? '' : 'none';
        });
        
        // Sort visible transactions
        const visibleTransactions = transactionsArray.filter(t => t.style.display !== 'none');
        
        visibleTransactions.sort((a, b) => {
            if (sortBy === 'next-date') {
                const dateA = new Date(a.querySelector('.transaction-next-date span').textContent.replace('Next: ', ''));
                const dateB = new Date(b.querySelector('.transaction-next-date span').textContent.replace('Next: ', ''));
                return dateA - dateB;
            } else if (sortBy === 'amount-desc' || sortBy === 'amount-asc') {
                const amountA = parseFloat(a.querySelector('.transaction-amount span').textContent);
                const amountB = parseFloat(b.querySelector('.transaction-amount span').textContent);
                return sortBy === 'amount-desc' ? amountB - amountA : amountA - amountB;
            } else if (sortBy === 'title') {
                const titleA = a.querySelector('.transaction-title').textContent.trim();
                const titleB = b.querySelector('.transaction-title').textContent.trim();
                return titleA.localeCompare(titleB);
            }
            return 0;
        });
        
        // Reorder transactions in the DOM
        const container = document.querySelector('.recurring-transactions-container');
        visibleTransactions.forEach(transaction => {
            container.appendChild(transaction);
        });
    }
    
    // Function to create the dashboard section
    function createDashboardSection() {
        // Create dashboard section element
        const dashboardSection = document.createElement('section');
        dashboardSection.className = 'recurring-dashboard-section';
        
        // Create section header
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        sectionHeader.innerHTML = `
            <h2><i class="fas fa-chart-line"></i> Recurring Insights</h2>
        `;
        
        // Create dashboard content
        const dashboardContent = document.createElement('div');
        dashboardContent.className = 'dashboard-content';
        
        // Create summary cards
        const summaryCards = document.createElement('div');
        summaryCards.className = 'summary-cards';
        
        // Calculate summary data
        const summaryData = calculateSummaryData();
        
        // Create summary cards HTML
        summaryCards.innerHTML = `
            <div class="summary-card total-card">
                <div class="summary-icon">
                    <i class="fas fa-sync-alt"></i>
                </div>
                <div class="summary-content">
                    <h3>Total Recurring</h3>
                    <p class="summary-value">${summaryData.totalCount}</p>
                </div>
            </div>
            
            <div class="summary-card income-card">
                <div class="summary-icon">
                    <i class="fas fa-arrow-down"></i>
                </div>
                <div class="summary-content">
                    <h3>Monthly Income</h3>
                    <p class="summary-value positive">$${summaryData.monthlyIncome.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="summary-card expense-card">
                <div class="summary-icon">
                    <i class="fas fa-arrow-up"></i>
                </div>
                <div class="summary-content">
                    <h3>Monthly Expenses</h3>
                    <p class="summary-value negative">$${summaryData.monthlyExpense.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="summary-card balance-card">
                <div class="summary-icon">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="summary-content">
                    <h3>Net Monthly</h3>
                    <p class="summary-value ${summaryData.netMonthly >= 0 ? 'positive' : 'negative'}">$${summaryData.netMonthly.toFixed(2)}</p>
                </div>
            </div>
        `;
        
        // Create charts container
        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'charts-container';
        chartsContainer.innerHTML = `
            <div class="chart-card">
                <h3>Distribution by Category</h3>
                <div class="chart-container">
                    <canvas id="recurring-category-chart"></canvas>
                </div>
            </div>
            
            <div class="chart-card">
                <h3>Income vs Expenses</h3>
                <div class="chart-container">
                    <canvas id="recurring-type-chart"></canvas>
                </div>
            </div>
        `;
        
        // Create upcoming transactions section
        const upcomingSection = document.createElement('div');
        upcomingSection.className = 'upcoming-section';
        upcomingSection.innerHTML = `
            <h3>Upcoming Transactions (Next 7 Days)</h3>
            <div class="upcoming-transactions" id="upcoming-transactions">
                ${generateUpcomingTransactionsHTML()}
            </div>
        `;
        
        // Assemble dashboard section
        dashboardContent.appendChild(summaryCards);
        dashboardContent.appendChild(chartsContainer);
        dashboardContent.appendChild(upcomingSection);
        
        dashboardSection.appendChild(sectionHeader);
        dashboardSection.appendChild(dashboardContent);
        
        // Insert dashboard section before recurring section
        const recurringSection = document.querySelector('.recurring-section');
        recurringSection.parentNode.insertBefore(dashboardSection, recurringSection);
    }
    
    // Function to calculate summary data
    function calculateSummaryData() {
        const transactions = document.querySelectorAll('.recurring-transaction-card');
        let totalCount = transactions.length;
        let monthlyIncome = 0;
        let monthlyExpense = 0;
        
        transactions.forEach(transaction => {
            if (transaction.classList.contains('inactive')) return;
            
            const type = transaction.querySelector('.transaction-type-badge').textContent.trim().toLowerCase();
            const amount = parseFloat(transaction.querySelector('.transaction-amount span').textContent);
            const frequency = transaction.querySelector('.transaction-frequency span').textContent.trim().toLowerCase();
            
            // Calculate monthly equivalent based on frequency
            let monthlyEquivalent = 0;
            if (frequency.includes('daily')) {
                monthlyEquivalent = amount * 30; // Approximate
            } else if (frequency.includes('weekly')) {
                monthlyEquivalent = amount * 4.33; // Approximate
            } else if (frequency.includes('bi-weekly') || frequency.includes('fortnightly')) {
                monthlyEquivalent = amount * 2.17; // Approximate
            } else if (frequency.includes('monthly')) {
                monthlyEquivalent = amount;
            } else if (frequency.includes('quarterly')) {
                monthlyEquivalent = amount / 3;
            } else if (frequency.includes('semi-annual') || frequency.includes('bi-annual')) {
                monthlyEquivalent = amount / 6;
            } else if (frequency.includes('annual') || frequency.includes('yearly')) {
                monthlyEquivalent = amount / 12;
            }
            
            if (type.includes('income')) {
                monthlyIncome += monthlyEquivalent;
            } else {
                monthlyExpense += monthlyEquivalent;
            }
        });
        
        const netMonthly = monthlyIncome - monthlyExpense;
        
        return {
            totalCount,
            monthlyIncome,
            monthlyExpense,
            netMonthly
        };
    }
    
    // Function to generate upcoming transactions HTML
    function generateUpcomingTransactionsHTML() {
        const transactions = document.querySelectorAll('.recurring-transaction-card');
        const upcomingTransactions = [];
        
        // Get current date and date 7 days from now
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        // Filter transactions due in the next 7 days
        transactions.forEach(transaction => {
            if (transaction.classList.contains('inactive')) return;
            
            const nextDueDateText = transaction.querySelector('.transaction-next-date span').textContent.replace('Next: ', '');
            const nextDueDate = new Date(nextDueDateText);
            
            if (nextDueDate >= today && nextDueDate <= nextWeek) {
                const type = transaction.querySelector('.transaction-type-badge').textContent.trim().toLowerCase();
                const title = transaction.querySelector('.transaction-title').textContent.trim();
                const category = transaction.querySelector('.transaction-category').textContent.trim();
                const amount = transaction.querySelector('.transaction-amount span').textContent.trim();
                
                upcomingTransactions.push({
                    type,
                    title,
                    category,
                    amount,
                    date: nextDueDate
                });
            }
        });
        
        // Sort by date
        upcomingTransactions.sort((a, b) => a.date - b.date);
        
        // Generate HTML
        if (upcomingTransactions.length === 0) {
            return '<div class="no-upcoming">No transactions due in the next 7 days</div>';
        }
        
        return upcomingTransactions.map(transaction => `
            <div class="upcoming-transaction">
                <div class="upcoming-transaction-left">
                    <div class="upcoming-transaction-icon ${transaction.type.includes('expense') ? 'expense' : 'income'}">
                        <i class="fas ${transaction.type.includes('expense') ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                    </div>
                    <div class="upcoming-transaction-details">
                        <span class="upcoming-transaction-title">${transaction.title}</span>
                        <span class="upcoming-transaction-category">${transaction.category}</span>
                    </div>
                </div>
                <div class="upcoming-transaction-right">
                    <span class="upcoming-transaction-amount ${transaction.type.includes('expense') ? 'expense' : 'income'}">
                        ${transaction.type.includes('expense') ? '-' : '+'}$${transaction.amount}
                    </span>
                    <span class="upcoming-transaction-date">
                        ${transaction.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    // Function to initialize charts
    function initializeCharts() {
        // Wait for charts.js to be available
        if (typeof Chart === 'undefined') {
            // Add Chart.js script if not already loaded
            if (!document.querySelector('script[src*="chart.js"]')) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                script.onload = initializeCharts;
                document.head.appendChild(script);
                return;
            }
            // If script is loading but not ready yet, try again in 100ms
            setTimeout(initializeCharts, 100);
            return;
        }
        
        createCategoryChart();
        createTypeChart();
    }
    
    // Function to create category distribution chart
    function createCategoryChart() {
        const categoryChartCanvas = document.getElementById('recurring-category-chart');
        if (!categoryChartCanvas) return;
        
        // Process data for category chart
        const categoryData = processDataForCategoryChart();
        
        new Chart(categoryChartCanvas, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.values,
                    backgroundColor: generateColors(categoryData.labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Function to create income vs expense chart
    function createTypeChart() {
        const typeChartCanvas = document.getElementById('recurring-type-chart');
        if (!typeChartCanvas) return;
        
        // Process data for type chart
        const typeData = processDataForTypeChart();
        
        new Chart(typeChartCanvas, {
            type: 'bar',
            data: {
                labels: ['Monthly Breakdown'],
                datasets: [
                    {
                        label: 'Income',
                        data: [typeData.income],
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--income-color'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--income-color'),
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: [typeData.expense],
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--expense-color'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--expense-color'),
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Function to process data for category chart
    function processDataForCategoryChart() {
        const transactions = document.querySelectorAll('.recurring-transaction-card');
        const categoryMap = {};
        
        transactions.forEach(transaction => {
            if (transaction.classList.contains('inactive')) return;
            
            const category = transaction.querySelector('.transaction-category').textContent.trim();
            const amount = parseFloat(transaction.querySelector('.transaction-amount span').textContent);
            const frequency = transaction.querySelector('.transaction-frequency span').textContent.trim().toLowerCase();
            
            // Calculate monthly equivalent based on frequency
            let monthlyEquivalent = 0;
            if (frequency.includes('daily')) {
                monthlyEquivalent = amount * 30;
            } else if (frequency.includes('weekly')) {
                monthlyEquivalent = amount * 4.33;
            } else if (frequency.includes('bi-weekly') || frequency.includes('fortnightly')) {
                monthlyEquivalent = amount * 2.17;
            } else if (frequency.includes('monthly')) {
                monthlyEquivalent = amount;
            } else if (frequency.includes('quarterly')) {
                monthlyEquivalent = amount / 3;
            } else if (frequency.includes('semi-annual') || frequency.includes('bi-annual')) {
                monthlyEquivalent = amount / 6;
            } else if (frequency.includes('annual') || frequency.includes('yearly')) {
                monthlyEquivalent = amount / 12;
            }
            
            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }
            categoryMap[category] += monthlyEquivalent;
        });
        
        const labels = Object.keys(categoryMap);
        const values = labels.map(label => categoryMap[label]);
        
        return { labels, values };
    }
    
    // Function to process data for type chart
    function processDataForTypeChart() {
        const transactions = document.querySelectorAll('.recurring-transaction-card');
        let income = 0;
        let expense = 0;
        
        transactions.forEach(transaction => {
            if (transaction.classList.contains('inactive')) return;
            
            const type = transaction.querySelector('.transaction-type-badge').textContent.trim().toLowerCase();
            const amount = parseFloat(transaction.querySelector('.transaction-amount span').textContent);
            const frequency = transaction.querySelector('.transaction-frequency span').textContent.trim().toLowerCase();
            
            // Calculate monthly equivalent based on frequency
            let monthlyEquivalent = 0;
            if (frequency.includes('daily')) {
                monthlyEquivalent = amount * 30;
            } else if (frequency.includes('weekly')) {
                monthlyEquivalent = amount * 4.33;
            } else if (frequency.includes('bi-weekly') || frequency.includes('fortnightly')) {
                monthlyEquivalent = amount * 2.17;
            } else if (frequency.includes('monthly')) {
                monthlyEquivalent = amount;
            } else if (frequency.includes('quarterly')) {
                monthlyEquivalent = amount / 3;
            } else if (frequency.includes('semi-annual') || frequency.includes('bi-annual')) {
                monthlyEquivalent = amount / 6;
            } else if (frequency.includes('annual') || frequency.includes('yearly')) {
                monthlyEquivalent = amount / 12;
            }
            
            if (type.includes('income')) {
                income += monthlyEquivalent;
            } else {
                expense += monthlyEquivalent;
            }
        });
        
        return { income, expense };
    }
    
    // Function to generate colors for charts
    function generateColors(count) {
        const colors = [
            '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ];
        
        // If we need more colors than in our predefined array, generate them
        if (count > colors.length) {
            for (let i = colors.length; i < count; i++) {
                const hue = (i * 137) % 360; // Use golden ratio for even distribution
                colors.push(`hsl(${hue}, 70%, 60%)`);
            }
        }
        
        return colors.slice(0, count);
    }
    
    // Helper function to convert hex to rgba
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
});