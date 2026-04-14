/* ========================================
   DAKO CAFE — Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ---- DOM Elements ----
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    const statNumbers = document.querySelectorAll('.stat-number');

    // ---- Mobile Navigation ----
    let overlay = null;

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMobileMenu);
    }

    function openMobileMenu() {
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    createOverlay();

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.contains('active');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close mobile menu on link click
    navLinkItems.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });


    // ---- Sticky Navbar ----
    let lastScrollY = 0;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check


    // ---- Active Nav Link on Scroll ----
    const sections = document.querySelectorAll('section[id], header[id]');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinkItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });


    // ---- Menu Filter & Load More ----
    const seeMoreContainer = document.getElementById('seeMoreContainer');
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    let visibleCount = 9;
    const itemsPerLoad = 9;

    function updateMenuVisibility(filter = 'all', isLoadMore = false) {
        let count = 0;
        let visibleInFilter = 0;

        menuCards.forEach((card) => {
            const category = card.dataset.category;
            const matchesFilter = filter === 'all' || category === filter;
            
            if (matchesFilter) {
                visibleInFilter++;
                if (filter === 'all') {
                    if (count < visibleCount) {
                        card.classList.remove('hidden');
                        if (!isLoadMore) {
                            card.style.animation = `fadeInUp 0.5s ${count * 0.05}s both`;
                        } else if (card.dataset.isVisible === 'false') {
                            card.style.animation = `fadeInUp 0.5s 0.1s both`;
                        }
                        card.dataset.isVisible = 'true';
                    } else {
                        card.classList.add('hidden');
                        card.dataset.isVisible = 'false';
                        card.style.animation = '';
                    }
                    count++;
                } else {
                    card.classList.remove('hidden');
                    card.dataset.isVisible = 'true';
                    card.style.animation = `fadeInUp 0.5s ${count * 0.08}s both`;
                    count++;
                }
            } else {
                card.classList.add('hidden');
                card.dataset.isVisible = 'false';
                card.style.animation = '';
            }
        });

        // Show/Hide See More button
        if (filter === 'all' && visibleInFilter > visibleCount) {
            seeMoreContainer.classList.remove('disabled');
        } else {
            seeMoreContainer.classList.add('disabled');
        }
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            visibleCount = itemsPerLoad; // Reset visible count on filter change
            updateMenuVisibility(btn.dataset.filter);
        });
    });

    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', () => {
            visibleCount += itemsPerLoad;
            updateMenuVisibility('all', true);
        });
    }

    // Initial menu state
    updateMenuVisibility();


    // ---- Scroll Reveal Animation ----
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ---- Counter Animation ----
    let counterStarted = false;

    function animateCounters() {
        if (counterStarted) return;
        counterStarted = true;

        statNumbers.forEach(counter => {
            const target = parseInt(counter.dataset.count, 10);
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);

                counter.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }


    // ---- Smooth Scroll for all anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ---- Fade-in animation keyframes (injected once) ----
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(24px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(styleSheet);


    // ---- Parallax Effect on Hero (subtle) ----
    const heroBg = document.querySelector('.hero-bg img');

    if (heroBg && window.matchMedia('(min-width: 769px)').matches) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = document.querySelector('.hero').offsetHeight;

            if (scrollY < heroHeight) {
                const parallax = scrollY * 0.3;
                heroBg.style.transform = `scale(1.05) translateY(${parallax}px)`;
            }
        }, { passive: true });
    }


    // ---- Gallery Lightbox (click to view) ----
    const galleryItems = document.querySelectorAll('.gallery-item');

    function createLightbox(imgSrc, imgAlt) {
        const lightbox = document.createElement('div');
        lightbox.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.92);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            cursor: zoom-out;
            animation: fadeInUp 0.3s ease;
        `;

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = imgAlt;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close lightbox');
        closeBtn.style.cssText = `
            position: absolute;
            top: 24px;
            right: 28px;
            font-size: 2.5rem;
            color: #fff;
            background: none;
            border: none;
            cursor: pointer;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.1)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });

        lightbox.appendChild(img);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';

        function removeLightbox() {
            lightbox.style.opacity = '0';
            lightbox.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
                lightbox.remove();
                document.body.style.overflow = '';
            }, 200);
        }

        lightbox.addEventListener('click', removeLightbox);
        document.addEventListener('keydown', function handleEsc(e) {
            if (e.key === 'Escape') {
                removeLightbox();
                document.removeEventListener('keydown', handleEsc);
            }
        });
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img) {
                createLightbox(img.src, img.alt);
            }
        });
    });


    // ---- WhatsApp Float animation delay ----
    const whatsappFloat = document.getElementById('floatingWhatsApp');
    if (whatsappFloat) {
        whatsappFloat.style.opacity = '0';
        whatsappFloat.style.transform = 'scale(0.5)';
        setTimeout(() => {
            whatsappFloat.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            whatsappFloat.style.opacity = '1';
            whatsappFloat.style.transform = 'scale(1)';
        }, 1500);
    }

});

// ---- PWA Service Worker Registration ----
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully!', reg))
            .catch(err => console.log('Service Worker registration failed: ', err));
    });
}
