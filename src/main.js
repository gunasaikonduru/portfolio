// ==========================================================================
// PORTFOLIO MAIN CONTROLLER
// ==========================================================================

// Mock Projects Data
const projects = [
  {
    id: "project-1",
    title: "Aether 3D Studio",
    subtitle: "WebGL Interactive Customizer",
    shortDesc: "An immersive 3D product visualizer allowing users to customize materials, colors, and lighting of products in real-time.",
    longDesc: "Aether 3D Studio is an advanced interactive WebGL application that showcases premium 3D design coupled with modular control. Built for high performance, it loads optimized glTF assets, applies dynamic shadows, and lets users preview products in photorealistic environments. It helps e-commerce sites boost conversions by letting recruiters and customers inspect components in a 360-degree space.",
    technologies: ["Three.js", "WebGL", "GSAP", "React.js", "Node.js"],
    liveUrl: "#",
    gitUrl: "#",
    accentGlow: "rgba(147, 51, 234, 0.4)"
  },
  {
    id: "project-2",
    title: "Scribe AI",
    subtitle: "AI Cognitive Document Summarizer",
    shortDesc: "Full-stack cognitive engine that parses, digests, and queries large documents using advanced language processing.",
    longDesc: "Scribe AI is a developer-focused tool designed to summarize and query massive text indices. Built with a robust backend architecture, it handles file uploads asynchronously, indexes vector embeddings, and exposes an API endpoint for interactive question-answering. It features a clean dashboard showing document statistics, process logging, and historical API latency metrics.",
    technologies: ["Python", "Django", "PostgreSQL", "Redis", "VectorDB"],
    liveUrl: "#",
    gitUrl: "#",
    accentGlow: "rgba(0, 245, 255, 0.4)"
  },
  {
    id: "project-3",
    title: "Orbit Finance",
    subtitle: "Real-time Crypto Analyzer",
    shortDesc: "Real-time cryptocurrency portfolio tracker and analytical dashboard utilizing WebSocket pipelines.",
    longDesc: "Orbit Finance is a financial dashboard that processes streaming price data directly from multiple exchange endpoints. It provides automated portfolio rebalancing suggestions, highlights market volatility trends, and graphs historical performances. It is optimized for zero-delay rendering, utilizing rendering batch updates and memory leak preventions.",
    technologies: ["JavaScript (ES6)", "Express", "WebSockets", "Chart.js", "MongoDB"],
    liveUrl: "#",
    gitUrl: "#",
    accentGlow: "rgba(236, 56, 188, 0.4)"
  },
  {
    id: "project-4",
    title: "Vapor CDN",
    subtitle: "High-Performance Assets Cache",
    shortDesc: "Lightweight asset caching server and analytics interface optimized for low latency static delivery.",
    longDesc: "Vapor CDN is a cloud-infrastructure tool designed to cache static files at edge nodes. It features smart invalidation algorithms, request rate throttling, and an administrative telemetry UI that displays real-time bandwidth usage, HTTP hit rates, and geo-location request mapping. Built with efficiency in mind, it handles concurrency seamlessly.",
    technologies: ["Go", "Docker", "Redis", "HTML5 / CSS3", "Prometheus"],
    liveUrl: "#",
    gitUrl: "#",
    accentGlow: "rgba(16, 185, 129, 0.4)"
  }
];

// Document State Variables
let threeBgLoaded = false;
let threeHeroLoaded = false;
const loadingTimeout = 2500; // fail-safe loader exit after 2.5s

// Custom Cursor coordinates
let mouse = { x: 0, y: 0 };
let dotPos = { x: 0, y: 0 };
let circlePos = { x: 0, y: 0 };

// --------------------------------------------------------------------------
// 1. PRELOADER & INITIAL ENTRANCE ANIMATIONS
// --------------------------------------------------------------------------
function setupLoader() {
  const preloader = document.getElementById('preloader');
  const bar = document.querySelector('.preloader-bar');

  // Trigger fake loading bar progression
  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 90) {
      // Slow down near the end if scripts are still loading
      const increment = (threeBgLoaded && threeHeroLoaded) ? 15 : 5;
      progress += Math.floor(Math.random() * increment) + 2;
      if (progress > 90) progress = 90;
      if (bar) bar.style.width = `${progress}%`;
    }
  }, 100);

  // Complete preloader once systems are ready or timeout fires
  function completeLoading() {
    clearInterval(interval);
    if (bar) bar.style.width = '100%';
    
    setTimeout(() => {
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
      }
      // Trigger Hero elements entrance using GSAP
      triggerHeroEntrance();
    }, 400);
  }

  // Listeners for 3D readiness
  window.addEventListener('three-bg-ready', () => {
    threeBgLoaded = true;
    checkReadiness();
  });
  window.addEventListener('three-hero-ready', () => {
    threeHeroLoaded = true;
    checkReadiness();
  });

  function checkReadiness() {
    if (threeBgLoaded && threeHeroLoaded) {
      completeLoading();
    }
  }

  // Failsafe timeout in case WebGL is slow/disabled
  setTimeout(() => {
    if (preloader && preloader.style.opacity !== '0') {
      console.warn("Preloader: WebGL loading timed out. Triggering failsafe entry.");
      completeLoading();
    }
  }, loadingTimeout);
}

function triggerHeroEntrance() {
  // GSAP Entrance Animations
  gsap.fromTo('.logo', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' });
  gsap.fromTo('nav .nav-link', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' });
  gsap.fromTo('.nav-cta', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' });

  gsap.fromTo('.hero-info .badge', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.7)' });
  gsap.fromTo('.hero-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' });
  gsap.fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.4, ease: 'power3.out' });
  gsap.fromTo('.hero-actions .btn', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.5, stagger: 0.15, ease: 'power3.out' });
  gsap.fromTo('.hero-visual', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, delay: 0.5, ease: 'power2.out' });
}

// --------------------------------------------------------------------------
// 2. CUSTOM GLASS CURSOR SMOOTHING
// --------------------------------------------------------------------------
function setupCursor() {
  const cursor = document.getElementById('custom-cursor');
  const dot = document.getElementById('custom-cursor-dot');
  
  if (!cursor || !dot) return;

  // Track raw mouse position
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Animation frame loop for custom cursor (creates a smooth lag trailing effect)
  function renderCursor() {
    // Instant dot movement
    dotPos.x += (mouse.x - dotPos.x);
    dotPos.y += (mouse.y - dotPos.y);
    dot.style.left = `${dotPos.x}px`;
    dot.style.top = `${dotPos.y}px`;

    // Lerp (interpolate) for smooth circle trailing
    circlePos.x += (mouse.x - circlePos.x) * 0.15;
    circlePos.y += (mouse.y - circlePos.y) * 0.15;
    cursor.style.left = `${circlePos.x}px`;
    cursor.style.top = `${circlePos.y}px`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Setup hover expands on interactive targets
  const interactiveSelector = 'a, button, .project-card, .social-link, input, textarea, .modal-close';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursor.style.width = '55px';
      cursor.style.height = '55px';
      cursor.style.borderColor = 'var(--secondary)';
      cursor.style.backgroundColor = 'rgba(236, 56, 188, 0.1)';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursor.style.width = '32px';
      cursor.style.height = '32px';
      cursor.style.borderColor = 'var(--primary)';
      cursor.style.backgroundColor = 'transparent';
    }
  });

  // Click pulse animation
  window.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
  });
  window.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}

// --------------------------------------------------------------------------
// 3. MOBILE NAVIGATION PANEL
// --------------------------------------------------------------------------
function setupMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('nav');
  const navLinks = document.querySelectorAll('nav .nav-link');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    toggle.classList.toggle('open');
    // Rotate toggle lines
    if (toggle.classList.contains('open')) {
      toggle.children[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      toggle.children[1].style.opacity = '0';
      toggle.children[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      toggle.children[0].style.transform = 'none';
      toggle.children[1].style.opacity = '1';
      toggle.children[2].style.transform = 'none';
    }
  });

  // Close nav on link clicks
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
        toggle.classList.remove('open');
        toggle.children[0].style.transform = 'none';
        toggle.children[1].style.opacity = '1';
        toggle.children[2].style.transform = 'none';
      }
    });
  });
}

// --------------------------------------------------------------------------
// 4. DYNAMIC PROJECTS GRID & DETAILS MODAL
// --------------------------------------------------------------------------
function setupProjects() {
  const container = document.getElementById('projects-container');
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-project-details');
  const closeBtn = document.querySelector('.modal-close');
  const overlay = document.querySelector('.modal-overlay');

  if (!container || !modal || !modalBody) return;

  // Render cards
  projects.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = 'project-card glass-card fade-in-element';
    card.dataset.id = proj.id;
    card.style.transitionDelay = `${idx * 0.1}s`;

    card.innerHTML = `
      <div class="project-thumbnail">
        <div class="project-placeholder-art">
          <div class="placeholder-glow" style="background: radial-gradient(circle, ${proj.accentGlow.replace('0.4', '1')} 0%, transparent 70%)"></div>
          <div class="placeholder-title">${proj.title.split(' ')[0]}</div>
        </div>
      </div>
      <h3 class="project-title">${proj.title}</h3>
      <p class="project-desc">${proj.shortDesc}</p>
      <div class="project-tags">
        ${proj.technologies.slice(0, 3).map(tech => `<span class="project-tag">${tech}</span>`).join('')}
        ${proj.technologies.length > 3 ? `<span class="project-tag">+${proj.technologies.length - 3}</span>` : ''}
      </div>
    `;

    // Click to Open Modal
    card.addEventListener('click', () => openModal(proj));

    container.appendChild(card);
  });

  function openModal(proj) {
    modalBody.innerHTML = `
      <h2 class="section-title gradient-text">${proj.title}</h2>
      <h3 class="company">${proj.subtitle}</h3>
      <div class="modal-img-container">
        <div class="project-placeholder-art" style="height: 100%">
          <div class="placeholder-glow" style="width: 140px; height: 140px; background: radial-gradient(circle, ${proj.accentGlow.replace('0.4', '1')} 0%, transparent 70%)"></div>
          <div class="placeholder-title" style="font-size: 3rem">${proj.title}</div>
        </div>
      </div>
      <div class="modal-tech-stack">
        <h4>Technologies Used</h4>
        <div class="modal-tags">
          ${proj.technologies.map(tech => `<span class="skill-tag">${tech}</span>`).join('')}
        </div>
      </div>
      <p class="modal-desc">${proj.longDesc}</p>
      <div class="modal-actions">
        <a href="${proj.liveUrl}" class="btn btn-primary btn-sm">Launch Project</a>
        <a href="${proj.gitUrl}" class="btn btn-outline btn-sm">View Source Code</a>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Close on Escape Key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// --------------------------------------------------------------------------
// 5. SCROLL TRIGGERED FADE-INS & NAV LINK HIGHLIGHTS
// --------------------------------------------------------------------------
function setupScrollObserver() {
  const elements = document.querySelectorAll('.fade-in-element, .timeline-item');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav .nav-link');

  // Intersection Observer for scroll triggers
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const elementObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // If it's a project card, make it look beautiful
        if (entry.target.classList.contains('project-card')) {
          gsap.fromTo(entry.target, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' });
        }
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, observerOptions);

  elements.forEach(el => elementObserver.observe(el));

  // Intersection Observer for active navigation links
  const sectionObserverOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px' // Trigger active state when section is centered
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, sectionObserverOptions);

  sections.forEach(sec => sectionObserver.observe(sec));
}

// --------------------------------------------------------------------------
// 6. CONTACT FORM PIPELINES
// --------------------------------------------------------------------------
function setupContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  const successMsg = document.getElementById('form-success-msg');

  if (!form || !successMsg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Trigger fake submittals (Recruiter proofing)
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending message...";

    // Mock API delay (1.5 seconds)
    setTimeout(() => {
      btn.textContent = "Sent!";
      
      // Animate form hiding and success message opening
      gsap.to(form, {
        opacity: 0,
        height: 0,
        pointerEvents: 'none',
        duration: 0.6,
        onComplete: () => {
          form.style.display = 'none';
          successMsg.style.display = 'flex';
          gsap.fromTo(successMsg, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' });
        }
      });
    }, 1500);
  });
}

// --------------------------------------------------------------------------
// INITIALIZE APPLICATION
// --------------------------------------------------------------------------
function initApp() {
  // Pre-load trigger
  setupLoader();
  // Setup interface cursor
  setupCursor();
  // Mobile drawer links
  setupMobileNav();
  // Dyn-load works card grid
  setupProjects();
  // Setup viewport reveal triggers
  setupScrollObserver();
  // Setup mock contact delivery pipelines
  setupContactForm();
}

// Dom ready entry point
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initApp();
} else {
  window.addEventListener('DOMContentLoaded', initApp);
}
