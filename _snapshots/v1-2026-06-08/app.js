/* ═══════════════════════════════════════════════════════════
   Jeremy Penn — Portfolio
   Scroll-driven canvas hero + site interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  // Scene: monkey-12fps (129 frames, 0001–0129)
  // Previous scene archived at: scroll-scenes/monkey-v1/
  const FIRST_FRAME = 1;
  const LAST_FRAME = 129;
  const TOTAL_FRAMES = LAST_FRAME - FIRST_FRAME + 1; // 129
  const PHASE1_COUNT = 20;
  const FRAME_PATH = (num) =>
    `scroll-scenes/monkey-12fps/snow-monkey_${String(num).padStart(4, '0')}.webp`;

  /* ── DOM ─────────────────────────────────────────────────── */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const heroScroll = document.getElementById('hero-scroll');
  const whitewash = document.getElementById('whitewash');
  const scrollCue = document.getElementById('scroll-cue');
  const heroText = document.getElementById('hero-text');
  const heroGradient = document.getElementById('hero-gradient');
  const transitionHL = document.getElementById('transition-headline');
  const navEl = document.getElementById('nav');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const subtitleEls = document.querySelectorAll('.subtitle');
  const aboutHeading = document.getElementById('about-heading');
  const transitionText = transitionHL.querySelector('.transition-headline__text');

  /* ── STATE ──────────────────────────────────────────────── */
  const frames = new Array(TOTAL_FRAMES).fill(null);
  let currentFrameIndex = 0;
  let currentSub = 0;
  let isMobile = window.innerWidth < 768;
  // Handoff flag — once concept-reveal takes over #transition-headline, hero stops touching it
  let hlOwnedByConceptReveal = false;

  /* ═══════════════════════════════════════════════════════════
     LENIS SMOOTH SCROLL
     ═══════════════════════════════════════════════════════════ */
  const lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ═══════════════════════════════════════════════════════════
     FRAME LOADER
     ═══════════════════════════════════════════════════════════ */
  function loadFrame(num) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = FRAME_PATH(num);
    });
  }

  async function loadFrames() {
    // Phase 1
    const p1End = Math.min(FIRST_FRAME + PHASE1_COUNT - 1, LAST_FRAME);
    for (let i = FIRST_FRAME; i <= p1End; i++) {
      const img = await loadFrame(i);
      frames[i - FIRST_FRAME] = img;
      loaderBar.style.width = `${((i - FIRST_FRAME + 1) / PHASE1_COUNT) * 100}%`;
    }

    // Draw first frame + hide loader
    if (frames[0]) renderFrame(frames[0]);
    loader.classList.add('hidden');
    initScrollSystem();

    // Phase 2 — background load remaining
    for (let i = FIRST_FRAME + PHASE1_COUNT; i <= LAST_FRAME; i++) {
      const img = await loadFrame(i);
      frames[i - FIRST_FRAME] = img;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CANVAS RENDERER — Always in frame
     Desktop: right-aligned cover
     Mobile: center-aligned contain (monkey always visible)
     ═══════════════════════════════════════════════════════════ */
  let lastCanvasW = 0;
  let lastCanvasH = 0;

  function renderFrame(img) {
    if (!img) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    if (W !== lastCanvasW || H !== lastCanvasH) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      lastCanvasW = W;
      lastCanvasH = H;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fill background to prevent gaps
    ctx.fillStyle = '#e8e6e2';
    ctx.fillRect(0, 0, W, H);

    const imgR = img.naturalWidth / img.naturalHeight;
    const canvasR = W / H;
    let dw, dh, dx, dy;

    if (isMobile) {
      // MOBILE: cover mode, center-aligned (subject always centered)
      if (imgR > canvasR) {
        dh = H;
        dw = H * imgR;
        dx = (W - dw) / 2; // center horizontally
        dy = 0;
      } else {
        dw = W;
        dh = W / imgR;
        dx = 0;
        dy = (H - dh) / 2; // center vertically
      }
    } else {
      // DESKTOP: cover mode, right-aligned
      if (imgR > canvasR) {
        dh = H;
        dw = H * imgR;
        dx = W - dw; // right edge flush
        dy = 0;
      } else {
        dw = W;
        dh = W / imgR;
        dx = 0;
        dy = (H - dh) / 2;
      }
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ═══════════════════════════════════════════════════════════
     HERO SCROLL SYSTEM
     ═══════════════════════════════════════════════════════════ */
  function initScrollSystem() {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: heroScroll,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.15, // very responsive
      onUpdate(self) {
        const p = self.progress;

        // ── Frame advance ──
        const idx = Math.min(
          Math.round(p * (TOTAL_FRAMES - 1)),
          TOTAL_FRAMES - 1
        );
        if (idx !== currentFrameIndex && frames[idx]) {
          currentFrameIndex = idx;
          renderFrame(frames[idx]);
        }

        // ── Hero text + gradient fade (0% → 70% progress) ──
        const heroFade = Math.max(0, 1 - p * 2.5);
        heroText.style.opacity = heroFade;
        heroGradient.style.opacity = heroFade;

        // ── Scroll cue — visible until 50%, fades out by 60% (before CONCEPT TO CULTURE) ──
        let cueOpacity = 1;
        if (p > 0.50) {
          cueOpacity = Math.max(0, 1 - (p - 0.50) / 0.10);
        }
        scrollCue.style.opacity = cueOpacity;

        // ── Canvas fade: starts 60%, complete at 78% — finishes before
        //    .site-content scrolls into view at ~80%, so no visible
        //    "black slate" edge slides over the canvas. ──
        const fadeStart = 0.60;
        const fadeEnd = 0.78;
        const canvasFade = Math.max(0, Math.min(1, (p - fadeStart) / (fadeEnd - fadeStart)));
        whitewash.style.opacity = canvasFade;
        canvas.style.opacity = 1 - canvasFade;

        // ── Concept to Culture: slide up from below as background darkens ──
        // p=0.60→0.82: brand rises from 35vh below resting spot (38vh), fades in.
        // Single element: #transition-headline only (in-section brand stays opacity:0).
        // concept-reveal ST onEnter takes ownership via flag.
        if (!hlOwnedByConceptReveal) {
          const slideP = Math.max(0, Math.min(1, (p - 0.60) / 0.22));
          transitionHL.style.opacity   = Math.min(1, slideP * 1.4); // opacity leads slightly
          transitionHL.style.transform = `translateY(${(1 - slideP) * 35}vh)`;
        }

        // ── Nav solid state ──
        navEl.classList.toggle('nav--solid', p > 0.02);

        // ── Subtitle cycling (no pause — purely scrub-driven) ──
        updateSubtitle(p);
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SUBTITLE — scrub-driven, no pause
     ═══════════════════════════════════════════════════════════ */
  function updateSubtitle(p) {
    if (!subtitleEls.length) return; // no subtitle elements present
    const thresholds = [0.10, 0.20, 0.30, 0.40];
    let target = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (p >= thresholds[i]) target = i + 1;
    }
    target = Math.min(target, subtitleEls.length - 1);

    if (target !== currentSub) {
      subtitleEls[currentSub].classList.remove('is-active');
      subtitleEls[currentSub].style.opacity = '0';

      subtitleEls[target].classList.add('is-active');
      gsap.fromTo(
        subtitleEls[target],
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );

      currentSub = target;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════════════════════ */
  function initNav() {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('is-active');
      mobileOverlay.classList.toggle('open');
      document.body.style.overflow = mobileOverlay.classList.contains('open')
        ? 'hidden'
        : '';
    });

    mobileOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-active');
        mobileOverlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Smooth scroll nav links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const el = document.querySelector(link.getAttribute('href'));
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el, { offset: -80 });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SECTION REVEAL ANIMATIONS
     ═══════════════════════════════════════════════════════════ */
  function initReveals() {
    const sections = document.querySelectorAll(
      '.about, .trusted-by, .project, .process, .contact'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ═══════════════════════════════════════════════════════════
     SELECTED WORKS EXPAND / COLLAPSE
     ═══════════════════════════════════════════════════════════ */
  function initWorks() {
    document.querySelectorAll('.project-header').forEach((header) => {
      header.addEventListener('click', () => {
        const project = header.closest('.project');
        const body = project.querySelector('.project-body');
        const isOpen = project.classList.contains('is-open');

        // Close others
        document.querySelectorAll('.project.is-open').forEach((p) => {
          if (p !== project) closeProject(p);
        });

        if (isOpen) {
          closeProject(project);
        } else {
          openProject(project, body);
        }
      });
    });
  }

  // Close buttons inside expanded case studies
  document.querySelectorAll('.project-close-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const project = btn.closest('.project');
      if (project && project.classList.contains('is-open')) {
        closeProject(project);
        // Scroll back to the project header
        setTimeout(() => {
          lenis.scrollTo(project, { offset: -100 });
        }, 100);
      }
    });
  });

  function openProject(project, body) {
    project.classList.add('is-open');
    const inner = body.querySelector('.project-body__inner');
    const h = inner.offsetHeight;
    gsap.fromTo(body, { height: 0, opacity: 0 }, {
      height: h,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      onComplete() { body.style.height = 'auto'; },
    });
    const label = project.querySelector('.project-toggle__label');
    if (label) label.textContent = 'Close';
  }

  function closeProject(project) {
    const body = project.querySelector('.project-body');
    const h = body.offsetHeight;
    gsap.fromTo(body, { height: h, opacity: 1 }, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.in',
      onComplete() { project.classList.remove('is-open'); },
    });
    const label = project.querySelector('.project-toggle__label');
    if (label) label.textContent = 'View Case Study';
  }

  /* ═══════════════════════════════════════════════════════════
     LIGHTBOX
     ═══════════════════════════════════════════════════════════ */
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lbImg = lightbox.querySelector('.lightbox__img');
    const lbCaption = lightbox.querySelector('.lightbox__caption-text');
    const btnClose = lightbox.querySelector('.lightbox__close');
    const btnPrev = lightbox.querySelector('.lightbox__arrow--prev');
    const btnNext = lightbox.querySelector('.lightbox__arrow--next');

    let currentGallery = [];
    let currentIndex = 0;

    // Attach click handlers to all gallery images
    document.querySelectorAll('.work-gallery img').forEach((img) => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        // Gather all images in this gallery
        const gallery = img.closest('.work-gallery');
        currentGallery = Array.from(gallery.querySelectorAll('img'));
        currentIndex = currentGallery.indexOf(img);
        openLightbox();
      });
    });

    function openLightbox() {
      showImage(currentIndex);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function showImage(idx) {
      const img = currentGallery[idx];
      if (!img) return;
      // Brief fade for image swap
      lbImg.style.opacity = '0';
      lbImg.style.transform = 'scale(0.96)';
      setTimeout(() => {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCaption.textContent = img.dataset.caption || '';
        // Force reflow
        lbImg.offsetHeight;
        lbImg.style.opacity = '1';
        lbImg.style.transform = 'scale(1)';
      }, 150);
      // Hide/show arrows based on position
      btnPrev.style.display = idx === 0 ? 'none' : 'flex';
      btnNext.style.display = idx === currentGallery.length - 1 ? 'none' : 'flex';
    }

    btnClose.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__backdrop').addEventListener('click', closeLightbox);

    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        showImage(currentIndex);
      }
    });

    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex < currentGallery.length - 1) {
        currentIndex++;
        showImage(currentIndex);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        showImage(currentIndex);
      }
      if (e.key === 'ArrowRight' && currentIndex < currentGallery.length - 1) {
        currentIndex++;
        showImage(currentIndex);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     LOGO MARQUEE
     ═══════════════════════════════════════════════════════════ */
  function initMarquee() {
    const r1 = document.querySelector('.marquee-row--1 .marquee-inner');
    const r2 = document.querySelector('.marquee-row--2 .marquee-inner');
    if (r1) gsap.to(r1, { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
    if (r2) {
      gsap.set(r2, { xPercent: -50 });
      gsap.to(r2, { xPercent: 0, duration: 32, ease: 'none', repeat: -1 });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     RESIZE
     ═══════════════════════════════════════════════════════════ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      isMobile = window.innerWidth < 768;
      lastCanvasW = 0; // force re-render
      if (frames[currentFrameIndex]) renderFrame(frames[currentFrameIndex]);
    }, 80);
  });

  /* ═══════════════════════════════════════════════════════════
     FORM SUBMISSION
     ═══════════════════════════════════════════════════════════ */
  function initFormHandler() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch('https://formspree.io/f/mpqypndb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // Show success message
          form.style.display = 'none';
          successMsg.style.display = 'block';
          // Scroll success into view
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          errorMsg.style.display = 'block';
        }
      } catch (error) {
        console.error('Form submission error:', error);
        errorMsg.style.display = 'block';
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     CONCEPT REVEAL — V2: stagger fade-in on enter, no pin
     ═══════════════════════════════════════════════════════════ */
  function initConceptReveal() {
    const section = document.getElementById('concept-reveal');
    if (!section) return;

    const brand = section.querySelector('.concept-reveal__brand');
    const lines = section.querySelectorAll('.concept-reveal__line');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // brand shown via transitionHL (fixed overlay); don't touch in-section brand
      gsap.set(transitionHL, { opacity: 1 });
      gsap.set([...lines], { opacity: 1, y: 0 });
      return;
    }

    // Brand + lines inside pinned section — GSAP owns everything, no hero conflict.
    // Timeline (200vh):
    // Brand is ONLY shown via #transition-headline (fixed overlay, hero-driven).
    // This section's GSAP timeline handles ONLY the 3 lines + synced fade-out.
    //   0.00–0.18   line 1 fades in
    //   0.35–0.53   line 2 fades in
    //   0.70–0.88   line 3 fades in
    //   0.88–1.60   hold — brand + all lines visible together
    //   1.60–1.95   lines + transitionHL (brand) fade out as one
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        onEnter() {
          // Hero has set transitionHL to full opacity; take ownership so hero stops touching it
          hlOwnedByConceptReveal = true;
        },
        onLeaveBack() {
          // Return transitionHL control to hero onUpdate (restores opacity + translateY)
          hlOwnedByConceptReveal = false;
        },
      },
    });

    // .concept-reveal__brand stays opacity:0 — visual brand is transitionHL only

    lines.forEach((line, i) => {
      tl.fromTo(line,
        { opacity: 0 },
        { opacity: 1, duration: 0.18, ease: 'power2.out' },
        i * 0.20
      );
    });

    // Fade out in place — no y movement, just opacity
    tl.to([...lines], { opacity: 0, duration: 0.35, ease: 'none' }, 1.20);
    tl.to(transitionHL, { opacity: 0, duration: 0.35, ease: 'none' }, 1.20);
  }

  /* ═══════════════════════════════════════════════════════════
     PROCESS — Editorial row animations
     ═══════════════════════════════════════════════════════════ */
  function initProcess() {
    const grid = document.querySelector('.practice__grid');
    if (!grid) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Helper: get stroke length for any SVG shape
    function svgLen(el) {
      if (typeof el.getTotalLength === 'function') return el.getTotalLength();
      if (el.tagName === 'circle') return 2 * Math.PI * parseFloat(el.getAttribute('r'));
      if (el.tagName === 'line') {
        const dx = parseFloat(el.getAttribute('x2')) - parseFloat(el.getAttribute('x1'));
        const dy = parseFloat(el.getAttribute('y2')) - parseFloat(el.getAttribute('y1'));
        return Math.sqrt(dx * dx + dy * dy);
      }
      return 100;
    }

    // Pre-set all icon paths to invisible (dashoffset = dashlength)
    grid.querySelectorAll('.practice__icon-svg path, .practice__icon-svg line, .practice__icon-svg circle').forEach(el => {
      const len = svgLen(el);
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });

    const cols = grid.querySelectorAll('.practice__col');

    // One timeline, one trigger — stagger cascades via absolute offsets
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: 'top 78%',
      },
    });

    cols.forEach((col, i) => {
      const rule  = col.querySelector('.practice__rule');
      const icon  = col.querySelectorAll('.practice__icon-svg path, .practice__icon-svg line, .practice__icon-svg circle');
      const num   = col.querySelector('.practice__num');
      const name  = col.querySelector('.practice__name');
      const tag   = col.querySelector('.practice__tag');
      const o     = i * 0.14; // column stagger offset

      // Rule draws + icon paths draw in simultaneously
      tl
        .to(rule, { scaleX: 1, duration: 0.65, ease: 'power3.inOut' }, o)
        .to(icon,  {
          strokeDashoffset: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power2.inOut',
        }, o)
        // Text cascade after icon starts drawing
        .to(num,  { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' }, o + 0.24)
        .to(name, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, o + 0.34)
        .to(tag,  { opacity: 1, y: 0, duration: 0.46, ease: 'power2.out' }, o + 0.50);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════ */
  function init() {
    initNav();
    loadFrames();
    initReveals();
    initConceptReveal();
    initProcess();
    initWorks();
    initLightbox();
    initMarquee();
    initFormHandler();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
