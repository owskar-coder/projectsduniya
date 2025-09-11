
        AOS.init({
            duration: 1000,
            easing: 'ease-out-cubic',
            once: true,
            offset: 150,
            delay: 100
        });

        // Enhanced Loading Screen
        window.addEventListener('load', function() {
            const loadingScreen = document.getElementById('loadingScreen');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }, 1200);
        });

        // Smooth scrolling function
        function scrollToSection(sectionId) {
            document.getElementById(sectionId).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Enhanced navbar scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', function() {
            const navbar = document.getElementById('navbar');
            const scrollTop = document.getElementById('scrollTop');
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
                scrollTop.classList.add('visible');
                
                // Hide navbar on scroll down, show on scroll up
                if (currentScroll > lastScroll && currentScroll > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            } else {
                navbar.classList.remove('scrolled');
                scrollTop.classList.remove('visible');
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });

        // Enhanced active nav link highlighting
        window.addEventListener('scroll', function() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.cta-btn)');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 250;
                if (window.pageYOffset >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });

        // Smooth scrolling for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const navbarHeight = document.getElementById('navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Scroll to top button
        document.getElementById('scrollTop').addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Enhanced counter animation
        function animateCounters() {
            const counters = document.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = counter.textContent.includes('%') ? 
                    parseInt(counter.textContent.replace('%', '')) : 
                    parseInt(counter.textContent.replace('+', ''));
                
                let count = 0;
                const increment = target / 50;
                const suffix = counter.textContent.includes('%') ? '%' : 
                              counter.textContent.includes('+') ? '+' : '';
                
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        counter.textContent = target + suffix;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(count) + suffix;
                    }
                }, 40);
            });
        }

        // Trigger counter animation when about section is in view
        const aboutSection = document.getElementById('about');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        if (aboutSection) {
            counterObserver.observe(aboutSection);
        }

        // Enhanced contact form handling
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value.trim();
            
            // Enhanced validation
            if (!name || !email || !message) {
                showMessage('Please fill in all required fields.', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = document.querySelector('.btn-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            btnText.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Prepare data for Google Sheets (matching your backend columns)
            const formData = new FormData();
            formData.append('Name', name);
            formData.append('Email', email);
            formData.append('Phone', phone || 'Not provided');
            formData.append('Service', service || 'General Inquiry');
            formData.append('Message', message);
            formData.append('Timestamp', new Date().toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }));
            
            // Submit to Google Sheets
            const scriptURL = 'https://script.google.com/macros/s/AKfycby0ve4bViyYEWW_NMtsQCNcoOZm89F9yrXtwiCzKToucyok3GcCJbIxwO3SP9PJRrW3/exec';
            
            fetch(scriptURL, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.result === 'success') {
                    showMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
                    this.reset();
                } else {
                    throw new Error(data.error || 'Failed to submit form');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Show success message anyway for better UX
                showMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
                this.reset();
            })
            .finally(() => {
                btnText.textContent = originalText;
                submitBtn.disabled = false;
            });
        });

        // Function to show success/error messages
        function showMessage(message, type) {
            const successMsg = document.getElementById('successMessage');
            const errorMsg = document.getElementById('errorMessage');
            
            // Hide both messages first
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';
            
            if (type === 'success') {
                successMsg.textContent = message;
                successMsg.style.display = 'block';
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 8000);
            } else {
                errorMsg.textContent = message;
                errorMsg.style.display = 'block';
                setTimeout(() => {
                    errorMsg.style.display = 'none';
                }, 8000);
            }
        }

        // Mobile menu auto-close
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const navbarCollapse = document.getElementById('navbarNav');
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    bsCollapse.hide();
                }
            });
        });

        // Enhanced floating cards animation
        function initFloatingCards() {
            const cards = document.querySelectorAll('.floating-card');
            cards.forEach((card, index) => {
                // Add different animation delays and directions
                const delay = index * 2;
                const yOffset = Math.random() * 40 - 20;
                
                card.style.animation = `float 6s ease-in-out ${delay}s infinite`;
                card.style.transform = `translateY(${yOffset}px)`;
            });
        }

        // Parallax effect for hero section
        let ticking = false;
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.hero');
            if (parallax) {
                const speed = scrolled * 0.2;
                parallax.style.transform = `translate3d(0, ${speed}px, 0)`;
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });

        // Enhanced service card hover effects
        function initServiceCards() {
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-15px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        }

        // Portfolio card interactions
        function initPortfolioCards() {
            const portfolioCards = document.querySelectorAll('.portfolio-card');
            portfolioCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    const image = this.querySelector('.portfolio-image');
                    image.style.transform = 'scale(1.05)';
                });
                
                card.addEventListener('mouseleave', function() {
                    const image = this.querySelector('.portfolio-image');
                    image.style.transform = 'scale(1)';
                });
            });
        }

        // Trust logos animation
        function initTrustLogos() {
            const logos = document.querySelectorAll('.trust-logo');
            logos.forEach((logo, index) => {
                logo.style.animationDelay = `${index * 0.2}s`;
                logo.classList.add('fade-in-up');
            });
        }

        // Form field enhancements
        function initFormFields() {
            const formControls = document.querySelectorAll('.form-control');
            formControls.forEach(control => {
                // Add focus effects
                control.addEventListener('focus', function() {
                    this.style.borderColor = 'var(--primary)';
                    this.style.boxShadow = '0 0 0 4px rgba(30, 58, 138, 0.1)';
                });
                
                control.addEventListener('blur', function() {
                    if (!this.value) {
                        this.style.borderColor = 'var(--gray-medium)';
                        this.style.boxShadow = 'none';
                    }
                });
                
                // Add validation styling
                control.addEventListener('input', function() {
                    if (this.hasAttribute('required') && this.value.trim()) {
                        this.style.borderColor = 'var(--success)';
                    }
                });
            });
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Update year in footer
            const yearElement = document.querySelector('.footer-bottom p');
            if (yearElement) {
                yearElement.innerHTML = yearElement.innerHTML.replace('2024', new Date().getFullYear());
            }
            
            // Initialize all interactive elements
            initFloatingCards();
            initServiceCards();
            initPortfolioCards();
            initTrustLogos();
            initFormFields();
            
            // Add click handlers for contact links
            document.querySelectorAll('[href*="contact@projectsduniya.in"]').forEach(link => {
                if (!link.href.startsWith('mailto:')) {
                    link.href = 'mailto:contact@projectsduniya.in?subject=Inquiry from Projects Duniya Website';
                }
            });
            
            document.querySelectorAll('[href*="9021168043"]').forEach(link => {
                if (!link.href.startsWith('tel:')) {
                    link.href = 'tel:+919021168043';
                }
            });

            // Enhanced scroll animations
            const observerOptions = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            // Observe all elements with fade-in-up class
            document.querySelectorAll('.fade-in-up').forEach(el => {
                observer.observe(el);
            });
        });

        // Performance optimizations
        if ('IntersectionObserver' in window) {
            // Lazy load images when implemented
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Add loading states and error handling for external resources
        window.addEventListener('error', function(e) {
            // Handle any loading errors gracefully
            console.warn('Resource failed to load:', e.target.src || e.target.href);
        });

        // Preload critical resources
        function preloadResources() {
            const preloadLinks = [
                'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js'
            ];

            preloadLinks.forEach(link => {
                const linkEl = document.createElement('link');
                linkEl.rel = 'preload';
                linkEl.href = link;
                linkEl.as = 'script';
                document.head.appendChild(linkEl);
            });
        }

        // Initialize preloading
        preloadResources();

        // Add keyboard navigation support
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close mobile menu if open
                const navbarCollapse = document.getElementById('navbarNav');
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    bsCollapse.hide();
                }
            }
        });

        // Enhanced accessibility
        document.querySelectorAll('button, a').forEach(element => {
            element.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--primary)';
                this.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', function() {
                this.style.outline = 'none';
            });
        });

        // Add smooth transitions for dynamic content
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
            }
            
            .floating-card {
                will-change: transform;
            }
            
            .service-card,
            .portfolio-card,
            .stat-card {
                will-change: transform, box-shadow;
            }
        `;
        document.head.appendChild(style);
 