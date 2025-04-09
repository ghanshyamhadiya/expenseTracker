// Theme Toggle Functionality

// Check for saved theme preference or use system preference
function getInitialTheme() {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    
    // Check if user's system prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    // Default to light theme
    return 'light';
}

// Apply theme to document
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update toggle button icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }
}

// Toggle between light and dark themes
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// Initialize theme toggle button in the DOM
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        // Update icon based on current theme
        themeToggle.innerHTML = localStorage.getItem('theme') === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        
        // Add event listener if not already added
        if (!themeToggle.hasAttribute('data-theme-initialized')) {
            themeToggle.addEventListener('click', toggleTheme);
            themeToggle.setAttribute('data-theme-initialized', 'true');
        }
    }
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
    initThemeToggle();
});