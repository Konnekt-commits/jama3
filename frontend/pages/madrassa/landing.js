// Madrassa Landing Page - Module École Arabe
// Same design system as jama3 association landing page (cream/gold theme)

export const madrassaLogo = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
</svg>
`;

export function renderMadrassaLanding() {
    const pageContent = document.getElementById('page-content');

    // Hide app shell for landing
    const sidebar = document.getElementById('sidebar');
    const navbar = document.getElementById('navbar');
    const mobileNav = document.getElementById('mobile-nav');
    if (sidebar) sidebar.style.display = 'none';
    if (navbar) navbar.style.display = 'none';
    if (mobileNav) mobileNav.style.display = 'none';

    pageContent.innerHTML = `
        <div class="madrassa-landing">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');

                :root {
                    /* Colors - Ocean/Teal Theme for Madrassa */
                    --color-bg-primary: #F0F7F7;
                    --color-bg-secondary: #E3EEEE;
                    --color-bg-tertiary: #D4E4E4;
                    --color-bg-dark: #1A2F2F;

                    --color-primary: #0D7377;
                    --color-primary-hover: #095B5E;
                    --color-primary-light: #D4EDED;
                    --color-primary-dark: #064547;

                    --color-text-primary: #1A2F2F;
                    --color-text-secondary: #3D5555;
                    --color-text-muted: #6B8585;
                    --color-text-inverse: #F0F7F7;

                    --color-success: #2E8B57;
                    --color-accent: #14919B;

                    --color-border: #B8D4D4;
                    --color-card-bg: #F7FBFB;

                    /* Typography */
                    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    --font-arabic: 'Amiri', serif;

                    /* Spacing */
                    --spacing-xs: 4px;
                    --spacing-sm: 8px;
                    --spacing-md: 16px;
                    --spacing-lg: 24px;
                    --spacing-xl: 32px;
                    --spacing-2xl: 48px;
                    --spacing-3xl: 64px;
                    --spacing-4xl: 96px;

                    /* Border Radius */
                    --radius-sm: 4px;
                    --radius-md: 8px;
                    --radius-lg: 12px;
                    --radius-xl: 16px;
                    --radius-full: 9999px;

                    /* Shadows */
                    --shadow-sm: 0 1px 2px 0 rgba(26, 47, 47, 0.05);
                    --shadow-md: 0 4px 6px -1px rgba(26, 47, 47, 0.1), 0 2px 4px -1px rgba(26, 47, 47, 0.06);
                    --shadow-lg: 0 10px 15px -3px rgba(26, 47, 47, 0.1), 0 4px 6px -2px rgba(26, 47, 47, 0.05);
                    --shadow-xl: 0 20px 25px -5px rgba(26, 47, 47, 0.1), 0 10px 10px -5px rgba(26, 47, 47, 0.04);
                }

                .madrassa-landing {
                    font-family: var(--font-primary);
                    color: var(--color-text-primary);
                    background-color: var(--color-bg-primary);
                    line-height: 1.6;
                    min-height: 100vh;
                }

                .madrassa-landing * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                /* ========== NAVBAR ========== */
                .landing-navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 100;
                    background-color: rgba(240, 247, 247, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--color-border);
                    padding: var(--spacing-md) var(--spacing-lg);
                    transition: all 0.3s ease;
                }

                .landing-navbar.scrolled {
                    box-shadow: var(--shadow-md);
                }

                .navbar-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    text-decoration: none;
                    color: var(--color-primary);
                    font-weight: 700;
                    font-size: 1.25rem;
                }

                .logo-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .logo-text {
                    font-weight: 800;
                    letter-spacing: 1px;
                }

                .logo-arabic {
                    font-family: var(--font-arabic);
                    font-size: 1rem;
                    opacity: 0.7;
                    margin-left: -4px;
                }

                .nav-links {
                    display: none;
                    gap: var(--spacing-xl);
                    list-style: none;
                }

                @media (min-width: 768px) {
                    .nav-links {
                        display: flex;
                    }
                }

                .nav-links a {
                    text-decoration: none;
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    transition: color 0.2s;
                }

                .nav-links a:hover {
                    color: var(--color-primary);
                }

                .nav-cta {
                    display: flex;
                    gap: var(--spacing-sm);
                }

                /* ========== BUTTONS ========== */
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-sm) var(--spacing-lg);
                    font-size: 0.9375rem;
                    font-weight: 600;
                    border-radius: var(--radius-full);
                    text-decoration: none;
                    transition: all 0.2s ease;
                    border: none;
                    cursor: pointer;
                }

                .btn-primary {
                    background-color: var(--color-primary);
                    color: white;
                }

                .btn-primary:hover {
                    background-color: var(--color-primary-hover);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .btn-secondary {
                    background-color: transparent;
                    color: var(--color-primary);
                    border: 2px solid var(--color-primary);
                }

                .btn-secondary:hover {
                    background-color: var(--color-primary);
                    color: white;
                }

                .btn-ghost {
                    background-color: transparent;
                    color: var(--color-text-secondary);
                    border: none;
                }

                .btn-ghost:hover {
                    color: var(--color-primary);
                    background-color: rgba(13, 115, 119, 0.1);
                }

                .btn-lg {
                    padding: var(--spacing-md) var(--spacing-xl);
                    font-size: 1rem;
                }

                /* ========== HERO ========== */
                .hero {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    padding: var(--spacing-4xl) var(--spacing-lg);
                    position: relative;
                    overflow: hidden;
                }

                .hero::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -20%;
                    width: 70%;
                    height: 150%;
                    background: radial-gradient(ellipse, var(--color-primary-light) 0%, transparent 70%);
                    opacity: 0.5;
                    pointer-events: none;
                }

                .hero-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--spacing-3xl);
                    align-items: center;
                    position: relative;
                    z-index: 1;
                }

                @media (min-width: 1024px) {
                    .hero-container {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-xs) var(--spacing-md);
                    background-color: var(--color-primary-light);
                    color: var(--color-primary);
                    border-radius: var(--radius-full);
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: var(--spacing-lg);
                }

                .hero h1 {
                    font-size: clamp(2rem, 5vw, 3.5rem);
                    font-weight: 700;
                    line-height: 1.2;
                    margin-bottom: var(--spacing-lg);
                    color: var(--color-text-primary);
                }

                .hero h1 span {
                    color: var(--color-primary);
                }

                .hero-arabic {
                    font-family: var(--font-arabic);
                    font-size: clamp(1.5rem, 3vw, 2rem);
                    color: var(--color-primary);
                    margin-bottom: var(--spacing-md);
                    opacity: 0.8;
                }

                .hero p {
                    font-size: 1.125rem;
                    color: var(--color-text-secondary);
                    margin-bottom: var(--spacing-xl);
                    max-width: 500px;
                }

                .hero-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-md);
                }

                .hero-image {
                    position: relative;
                }

                .hero-mockup {
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                    background: var(--color-card-bg);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-xl);
                    overflow: hidden;
                    border: 1px solid var(--color-border);
                }

                .mockup-header {
                    background: var(--color-bg-secondary);
                    padding: var(--spacing-sm) var(--spacing-md);
                    display: flex;
                    gap: var(--spacing-xs);
                    border-bottom: 1px solid var(--color-border);
                }

                .mockup-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--color-border);
                }

                .mockup-dot:nth-child(1) { background: #FF6B6B; }
                .mockup-dot:nth-child(2) { background: #FFD93D; }
                .mockup-dot:nth-child(3) { background: #6BCB77; }

                .mockup-content {
                    padding: var(--spacing-lg);
                }

                .mockup-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-md);
                }

                .mockup-stat {
                    background: var(--color-card-bg);
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                }

                .mockup-stat-label {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    margin-bottom: var(--spacing-xs);
                }

                .mockup-stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }

                .mockup-card {
                    background: var(--color-card-bg);
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-sm);
                }

                .mockup-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--color-primary-light);
                    color: var(--color-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .mockup-card-info {
                    flex: 1;
                }

                .mockup-card-name {
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .mockup-card-sub {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                }

                .mockup-badge {
                    padding: var(--spacing-xs) var(--spacing-sm);
                    font-size: 0.625rem;
                    border-radius: var(--radius-full);
                    background: #E2ECD0;
                    color: #4A6318;
                    font-weight: 600;
                }

                .mockup-badge.blue {
                    background: #D4E8F0;
                    color: #1E6B8A;
                }

                /* ========== FEATURES ========== */
                .features {
                    padding: var(--spacing-4xl) var(--spacing-lg);
                    background-color: var(--color-bg-secondary);
                }

                .section-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: var(--spacing-3xl);
                }

                .section-badge {
                    display: inline-block;
                    padding: var(--spacing-xs) var(--spacing-md);
                    background: var(--color-primary-light);
                    color: var(--color-primary);
                    border-radius: var(--radius-full);
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: var(--spacing-md);
                }

                .section-title {
                    font-size: clamp(1.75rem, 4vw, 2.5rem);
                    font-weight: 700;
                    margin-bottom: var(--spacing-md);
                }

                .section-subtitle {
                    font-size: 1.125rem;
                    color: var(--color-text-secondary);
                    max-width: 600px;
                    margin: 0 auto;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: var(--spacing-lg);
                }

                .feature-card {
                    background: var(--color-card-bg);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-xl);
                    transition: all 0.3s ease;
                }

                .feature-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--color-primary);
                }

                .feature-icon {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, var(--color-primary-light), var(--color-bg-secondary));
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: var(--spacing-lg);
                    color: var(--color-primary);
                }

                .feature-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: var(--spacing-sm);
                }

                .feature-description {
                    color: var(--color-text-secondary);
                    font-size: 0.9375rem;
                }

                /* ========== BENEFITS ========== */
                .benefits {
                    padding: var(--spacing-4xl) var(--spacing-lg);
                    background: var(--color-bg-primary);
                }

                .benefits-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--spacing-3xl);
                    align-items: center;
                }

                @media (min-width: 1024px) {
                    .benefits-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .benefits-content h2 {
                    font-size: clamp(1.5rem, 3vw, 2rem);
                    margin-bottom: var(--spacing-lg);
                }

                .benefits-list {
                    list-style: none;
                }

                .benefits-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-lg);
                }

                .benefit-check {
                    width: 24px;
                    height: 24px;
                    background: var(--color-success);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .benefit-text h4 {
                    font-weight: 600;
                    margin-bottom: var(--spacing-xs);
                }

                .benefit-text p {
                    color: var(--color-text-secondary);
                    font-size: 0.9375rem;
                }

                .benefits-image {
                    background: var(--color-card-bg);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-xl);
                    border: 1px solid var(--color-border);
                    box-shadow: var(--shadow-lg);
                }

                .phone-mockup {
                    max-width: 280px;
                    margin: 0 auto;
                    background: var(--color-bg-dark);
                    border-radius: 32px;
                    padding: var(--spacing-sm);
                    box-shadow: var(--shadow-xl);
                }

                .phone-screen {
                    background: var(--color-bg-primary);
                    border-radius: 24px;
                    overflow: hidden;
                    aspect-ratio: 9/16;
                    display: flex;
                    flex-direction: column;
                }

                .phone-header {
                    background: var(--color-bg-secondary);
                    padding: var(--spacing-md);
                    text-align: center;
                    border-bottom: 1px solid var(--color-border);
                }

                .phone-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                }

                .phone-content {
                    flex: 1;
                    padding: var(--spacing-md);
                    overflow: hidden;
                }

                .phone-nav {
                    display: flex;
                    justify-content: space-around;
                    padding: var(--spacing-md);
                    background: var(--color-bg-secondary);
                    border-top: 1px solid var(--color-border);
                }

                .phone-nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--spacing-xs);
                    color: var(--color-text-muted);
                    font-size: 0.625rem;
                }

                .phone-nav-item.active {
                    color: var(--color-primary);
                }

                /* ========== PRICING ========== */
                .pricing {
                    padding: var(--spacing-4xl) var(--spacing-lg);
                    background: var(--color-bg-secondary);
                }

                .pricing-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: var(--spacing-lg);
                    max-width: 900px;
                    margin: 0 auto;
                }

                .pricing-card {
                    background: var(--color-card-bg);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-xl);
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .pricing-card.featured {
                    border-color: var(--color-primary);
                    transform: scale(1.05);
                    box-shadow: var(--shadow-xl);
                }

                .pricing-card:hover {
                    box-shadow: var(--shadow-lg);
                }

                .pricing-badge {
                    display: inline-block;
                    padding: var(--spacing-xs) var(--spacing-md);
                    background: var(--color-primary);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-bottom: var(--spacing-md);
                }

                .pricing-name {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: var(--spacing-sm);
                }

                .pricing-price {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--color-primary);
                    margin-bottom: var(--spacing-xs);
                }

                .pricing-price span {
                    font-size: 1rem;
                    font-weight: 400;
                    color: var(--color-text-muted);
                }

                .pricing-description {
                    color: var(--color-text-secondary);
                    margin-bottom: var(--spacing-lg);
                    font-size: 0.9375rem;
                }

                .pricing-features {
                    list-style: none;
                    text-align: left;
                    margin-bottom: var(--spacing-xl);
                }

                .pricing-features li {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-sm) 0;
                    border-bottom: 1px solid var(--color-border);
                    font-size: 0.9375rem;
                }

                .pricing-features li:last-child {
                    border-bottom: none;
                }

                .pricing-features svg {
                    color: var(--color-success);
                    flex-shrink: 0;
                }

                /* ========== CTA ========== */
                .cta {
                    padding: var(--spacing-4xl) var(--spacing-lg);
                    background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .cta-content {
                    position: relative;
                    z-index: 1;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .cta h2 {
                    font-size: clamp(1.75rem, 4vw, 2.5rem);
                    color: white;
                    margin-bottom: var(--spacing-md);
                }

                .cta p {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 1.125rem;
                    margin-bottom: var(--spacing-xl);
                }

                .cta .btn-primary {
                    background: white;
                    color: var(--color-primary);
                }

                .cta .btn-primary:hover {
                    background: var(--color-bg-primary);
                }

                /* ========== FOOTER ========== */
                .footer {
                    background: var(--color-bg-dark);
                    color: var(--color-text-inverse);
                    padding: var(--spacing-3xl) var(--spacing-lg) var(--spacing-lg);
                }

                .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--spacing-xl);
                    margin-bottom: var(--spacing-3xl);
                }

                .footer-brand {
                    max-width: 300px;
                }

                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-md);
                    font-weight: 700;
                    font-size: 1.25rem;
                }

                .footer-logo .logo-icon {
                    background: var(--color-primary);
                }

                .footer-description {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9375rem;
                    margin-bottom: var(--spacing-lg);
                }

                .footer-title {
                    font-weight: 600;
                    margin-bottom: var(--spacing-md);
                }

                .footer-links {
                    list-style: none;
                }

                .footer-links li {
                    margin-bottom: var(--spacing-sm);
                }

                .footer-links a {
                    color: rgba(255, 255, 255, 0.6);
                    text-decoration: none;
                    font-size: 0.9375rem;
                    transition: color 0.2s;
                }

                .footer-links a:hover {
                    color: white;
                }

                .footer-bottom {
                    padding-top: var(--spacing-lg);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                    gap: var(--spacing-md);
                }

                .footer-copyright {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.875rem;
                }

                /* ========== ANIMATIONS ========== */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-in {
                    animation: fadeInUp 0.6s ease forwards;
                }
            </style>

            <!-- Navbar -->
            <nav class="landing-navbar" id="landing-navbar">
                <div class="navbar-container">
                    <a href="/madrassa" class="logo">
                        <div class="logo-icon">
                            ${madrassaLogo}
                        </div>
                        <span class="logo-text">Madrassa</span>
                        <span class="logo-arabic">مدرسة</span>
                    </a>
                    <ul class="nav-links">
                        <li><a href="#features">Fonctionnalites</a></li>
                        <li><a href="#benefits">Avantages</a></li>
                        <li><a href="#pricing">Tarifs</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                    <div class="nav-cta">
                        <a href="/login-parent" class="btn btn-ghost">Espace Parent</a>
                        <a href="/madrassa/onboarding" class="btn btn-primary">Creer mon ecole</a>
                    </div>
                </div>
            </nav>

            <!-- Hero -->
            <section class="hero">
                <div class="hero-container">
                    <div class="hero-content animate-in">
                        <p class="hero-arabic">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</p>
                        <span class="hero-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            Gestion d'ecole simplifiee
                        </span>
                        <h1>Gerez votre <span>ecole arabe</span> en toute serenite</h1>
                        <p>Madrassa (مدرسة - Ecole) : une plateforme moderne pour gerer vos eleves, classes, presences et frais de scolarite. L'excellence au service de l'enseignement.</p>
                        <div class="hero-buttons">
                            <a href="/madrassa/onboarding" class="btn btn-primary btn-lg">
                                Creer mon ecole gratuitement
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </a>
                            <a href="#features" class="btn btn-secondary btn-lg">En savoir plus</a>
                        </div>
                    </div>
                    <div class="hero-image animate-in">
                        <div class="hero-mockup">
                            <div class="mockup-header">
                                <div class="mockup-dot"></div>
                                <div class="mockup-dot"></div>
                                <div class="mockup-dot"></div>
                            </div>
                            <div class="mockup-content">
                                <div class="mockup-stats">
                                    <div class="mockup-stat">
                                        <div class="mockup-stat-label">Eleves</div>
                                        <div class="mockup-stat-value">156</div>
                                    </div>
                                    <div class="mockup-stat">
                                        <div class="mockup-stat-label">Classes</div>
                                        <div class="mockup-stat-value">12</div>
                                    </div>
                                    <div class="mockup-stat">
                                        <div class="mockup-stat-label">Presence</div>
                                        <div class="mockup-stat-value">94%</div>
                                    </div>
                                    <div class="mockup-stat">
                                        <div class="mockup-stat-label">Enseignants</div>
                                        <div class="mockup-stat-value">8</div>
                                    </div>
                                </div>
                                <div class="mockup-card">
                                    <div class="mockup-avatar">YA</div>
                                    <div class="mockup-card-info">
                                        <div class="mockup-card-name">Yassine Alami</div>
                                        <div class="mockup-card-sub">Classe Coran - Niveau 2</div>
                                    </div>
                                    <div class="mockup-badge">Present</div>
                                </div>
                                <div class="mockup-card">
                                    <div class="mockup-avatar">LB</div>
                                    <div class="mockup-card-info">
                                        <div class="mockup-card-name">Leila Benjelloun</div>
                                        <div class="mockup-card-sub">Classe Arabe - Debutant</div>
                                    </div>
                                    <div class="mockup-badge blue">Avance</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features -->
            <section class="features" id="features">
                <div class="section-container">
                    <div class="section-header">
                        <span class="section-badge">Fonctionnalites</span>
                        <h2 class="section-title">Tout pour gerer votre ecole</h2>
                        <p class="section-subtitle">Des outils puissants et simples pour gerer efficacement votre ecole arabe ou coranique au quotidien.</p>
                    </div>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3 class="feature-title">Gestion des eleves</h3>
                            <p class="feature-description">Centralisez les informations de vos eleves : niveaux, classes, contacts parents et progression.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            </div>
                            <h3 class="feature-title">Classes & programmes</h3>
                            <p class="feature-description">Organisez vos classes par matiere (Coran, Arabe, Fiqh) et par niveau avec des programmes personnalises.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            </div>
                            <h3 class="feature-title">Suivi des presences</h3>
                            <p class="feature-description">Pointage rapide par classe, statistiques de presence et alertes automatiques aux parents.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            </div>
                            <h3 class="feature-title">Frais de scolarite</h3>
                            <p class="feature-description">Gerez les paiements mensuels, suivez les encaissements et envoyez des rappels automatiques.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                            </div>
                            <h3 class="feature-title">Evaluations & notes</h3>
                            <p class="feature-description">Suivez la progression de chaque eleve : examens, memorisation du Coran, niveaux atteints.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                            </div>
                            <h3 class="feature-title">Espace parents</h3>
                            <p class="feature-description">Les parents consultent les presences, notes et paiements de leurs enfants depuis leur espace dedie.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Benefits -->
            <section class="benefits" id="benefits">
                <div class="section-container">
                    <div class="benefits-grid">
                        <div class="benefits-content">
                            <span class="section-badge">Pourquoi nous choisir</span>
                            <h2>Une solution pensee pour les ecoles arabes et coraniques</h2>
                            <ul class="benefits-list">
                                <li>
                                    <div class="benefit-check">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <div class="benefit-text">
                                        <h4>Adapte a l'enseignement islamique</h4>
                                        <p>Matieres specifiques : Coran, Arabe, Fiqh, Sira. Suivi de la memorisation.</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="benefit-check">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <div class="benefit-text">
                                        <h4>Simple et intuitif</h4>
                                        <p>Interface claire, pas besoin de formation. Prise en main immediate.</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="benefit-check">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <div class="benefit-text">
                                        <h4>Accessible partout</h4>
                                        <p>Application web responsive, accessible sur mobile, tablette et ordinateur.</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="benefit-check">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <div class="benefit-text">
                                        <h4>Communication parents</h4>
                                        <p>Espace dedie pour les parents avec suivi en temps reel.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="benefits-image">
                            <div class="phone-mockup">
                                <div class="phone-screen">
                                    <div class="phone-header">
                                        <h3>Madrassa مدرسة</h3>
                                    </div>
                                    <div class="phone-content">
                                        <div class="mockup-stats" style="margin-bottom: 12px;">
                                            <div class="mockup-stat" style="padding: 12px;">
                                                <div class="mockup-stat-label">Mes enfants</div>
                                                <div class="mockup-stat-value" style="font-size: 1rem;">2</div>
                                            </div>
                                            <div class="mockup-stat" style="padding: 12px;">
                                                <div class="mockup-stat-label">Presence</div>
                                                <div class="mockup-stat-value" style="font-size: 1rem;">96%</div>
                                            </div>
                                        </div>
                                        <div class="mockup-card" style="padding: 10px; margin-bottom: 8px;">
                                            <div class="mockup-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">AM</div>
                                            <div class="mockup-card-info">
                                                <div class="mockup-card-name" style="font-size: 0.75rem;">Adam M.</div>
                                                <div class="mockup-card-sub" style="font-size: 0.625rem;">Juz 3 - En cours</div>
                                            </div>
                                        </div>
                                        <div class="mockup-card" style="padding: 10px; margin-bottom: 8px;">
                                            <div class="mockup-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">SM</div>
                                            <div class="mockup-card-info">
                                                <div class="mockup-card-name" style="font-size: 0.75rem;">Sara M.</div>
                                                <div class="mockup-card-sub" style="font-size: 0.625rem;">Arabe Niveau 1</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="phone-nav">
                                        <div class="phone-nav-item active">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                                            Accueil
                                        </div>
                                        <div class="phone-nav-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
                                            Presences
                                        </div>
                                        <div class="phone-nav-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                                            Notes
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Pricing -->
            <section class="pricing" id="pricing">
                <div class="section-container">
                    <div class="section-header">
                        <span class="section-badge">Tarifs</span>
                        <h2 class="section-title">Des tarifs adaptes a votre ecole</h2>
                        <p class="section-subtitle">Commencez gratuitement, evoluez selon vos besoins.</p>
                    </div>
                    <div class="pricing-grid">
                        <div class="pricing-card">
                            <div class="pricing-name">Decouverte</div>
                            <div class="pricing-price">Gratuit</div>
                            <p class="pricing-description">Pour les petites ecoles qui demarrent</p>
                            <ul class="pricing-features">
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Jusqu'a 30 eleves
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    3 classes maximum
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Suivi des presences
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Support par email
                                </li>
                            </ul>
                            <a href="/madrassa/onboarding" class="btn btn-secondary" style="width: 100%;">Commencer</a>
                        </div>
                        <div class="pricing-card featured">
                            <span class="pricing-badge">Populaire</span>
                            <div class="pricing-name">Ecole</div>
                            <div class="pricing-price">39<span> / mois</span></div>
                            <p class="pricing-description">Pour les ecoles en croissance</p>
                            <ul class="pricing-features">
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Eleves illimites
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Toutes les fonctionnalites
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Espace parents inclus
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Notifications SMS
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Support prioritaire
                                </li>
                            </ul>
                            <a href="/madrassa/onboarding" class="btn btn-primary" style="width: 100%;">Essai gratuit 30 jours</a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA -->
            <section class="cta">
                <div class="cta-content">
                    <h2>Pret a simplifier la gestion de votre ecole ?</h2>
                    <p>Rejoignez des centaines d'ecoles qui nous font confiance. Essai gratuit, sans engagement.</p>
                    <a href="/madrassa/onboarding" class="btn btn-primary btn-lg">
                        Creer mon ecole maintenant
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>
            </section>

            <!-- Footer -->
            <footer class="footer" id="contact">
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <div class="footer-logo">
                                <div class="logo-icon" style="border-radius: 50%;">
                                    ${madrassaLogo}
                                </div>
                                <span style="font-weight: 800; letter-spacing: 1px;">Madrassa</span>
                                <span style="font-family: var(--font-arabic); opacity: 0.7; margin-left: 4px;">مدرسة</span>
                            </div>
                            <p class="footer-description">La gestion simplifiee de votre ecole arabe ou coranique. Une solution claire pour l'excellence educative.</p>
                        </div>
                        <div>
                            <h4 class="footer-title">Produit</h4>
                            <ul class="footer-links">
                                <li><a href="#features">Fonctionnalites</a></li>
                                <li><a href="#pricing">Tarifs</a></li>
                                <li><a href="#">Guide d'utilisation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="footer-title">Support</h4>
                            <ul class="footer-links">
                                <li><a href="#">Centre d'aide</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="footer-title">Legal</h4>
                            <ul class="footer-links">
                                <li><a href="#">Mentions legales</a></li>
                                <li><a href="#">Confidentialite</a></li>
                                <li><a href="#">CGU</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p class="footer-copyright">2026 Madrassa - مدرسة. Tous droits reserves.</p>
                    </div>
                </div>
            </footer>
        </div>
    `;

    // Navbar scroll effect
    const navbarEl = document.getElementById('landing-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbarEl.classList.add('scrolled');
        } else {
            navbarEl.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('.madrassa-landing a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
