
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');
    const navLinksItems = document.querySelectorAll('.nav-links a:not(.dropdown-toggle)');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const dropdowns = document.querySelectorAll('.dropdown');
    const logo = document.querySelector('.logo');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking overlay
    navOverlay.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        // Close all dropdowns
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    });

    // Toggle dropdowns
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            
            // Close other dropdowns
            dropdowns.forEach(dropdown => {
                if (dropdown !== parent) {
                    dropdown.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            parent.classList.toggle('active');
            
            // Add animation to dropdown items
            const dropdownItems = parent.querySelectorAll('.dropdown-menu a');
            dropdownItems.forEach((item, index) => {
                item.style.animationDelay = `${0.1 + (index * 0.05)}s`;
            });
        });
    });

    // Close menu when clicking a nav link (except dropdown toggles)
    navLinksItems.forEach(item => {
        item.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });

    // Add scroll effect to navigation
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Add animation class to nav on page load
    setTimeout(() => {
        document.querySelector('nav').classList.add('nav-loaded');
    }, 100);
});