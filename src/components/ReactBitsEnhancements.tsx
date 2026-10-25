import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Props = { page: string; children: ReactNode };

/**
 * Lightweight React Bits-inspired interaction layer for the existing legacy pages.
 * Uses native browser APIs so the portfolio does not need a second animation engine.
 */
export function ReactBitsEnhancements({ page, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    root.querySelectorAll('.command-trigger, .command-palette-trigger, [aria-label*="COMMAND"], [title*="⌘K"]').forEach((node) => node.remove());

    const headings = root.querySelectorAll<HTMLElement>('main h1, .hero h1, .page-hero h1, h1');
    headings.forEach((heading, index) => {
      heading.classList.add('rb-text-reveal');
      heading.style.animationDelay = `${Math.min(index, 2) * 90}ms`;
    });

    // Keep the active route indicator correct when legacy markup is rendered inside React.
    const routeForPage: Record<string, string> = {
      home: '/', about: '/about', services: '/services',
      experience: '/experience', projects: '/projects', contact: '/contact',
    };
    root.querySelectorAll<HTMLAnchorElement>('.top-nav-links a, .mobile-nav-overlay a, #mobile-nav-overlay a')
      .forEach((link) => {
        let pathname = '';
        try { pathname = new URL(link.href, window.location.href).pathname.replace(/\/$/, '') || '/'; } catch { return; }
        const normalized = pathname.replace(/\.html$/, '') || '/';
        const expected = (routeForPage[page] ?? '/').replace(/\.html$/, '') || '/';
        const isCurrent = normalized === expected || (page === 'home' && normalized === '/index');
        if (isCurrent) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });

    const revealTargets = root.querySelectorAll<HTMLElement>(
      'main h2, section h2, .section-header, .service-card, .project-card, .editorial-card, .skill-card, .timeline-item, .experience-card, .contact-method'
    );
    revealTargets.forEach((element, index) => {
      element.classList.add('rb-scroll-reveal');
      element.style.setProperty('--rb-reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    });

    // GSAP ScrollTrigger adds restrained scroll-linked depth without replacing native
    // scrolling, so touch, keyboard navigation, and browser scrollbars remain reliable.
    const motionContext = gsap.context(() => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.querySelectorAll<HTMLElement>('.page-hero, .hero-section, .split-hero, .contact-form, .contact-methods').forEach((element) => {
          gsap.fromTo(element,
            { y: 22, autoAlpha: 0.82 },
            {
              y: 0,
              autoAlpha: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: element,
                start: 'top 92%',
                end: 'top 48%',
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      }
    }, root);

    const cleanupHandlers: Array<() => void> = [];
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cards = root.querySelectorAll<HTMLElement>(
      '.project-card, .service-card, .editorial-card, .skill-card, .experience-card, .contact-method'
    );
    if (canHover) {
      cards.forEach((card) => {
        card.classList.add('rb-spotlight-card');
        const onPointerMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--rb-pointer-x', `${event.clientX - rect.left}px`);
          card.style.setProperty('--rb-pointer-y', `${event.clientY - rect.top}px`);
        };
        card.addEventListener('pointermove', onPointerMove, { passive: true });
        cleanupHandlers.push(() => card.removeEventListener('pointermove', onPointerMove));
      });
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('rb-is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
      revealTargets.forEach((element) => observer.observe(element));
      headings.forEach((element) => observer.observe(element));

      return () => { observer.disconnect(); cleanupHandlers.forEach((cleanup) => cleanup()); motionContext.revert(); };
    }

    revealTargets.forEach((element) => element.classList.add('rb-is-visible'));
    headings.forEach((element) => element.classList.add('rb-is-visible'));
    return () => { cleanupHandlers.forEach((cleanup) => cleanup()); motionContext.revert(); };
  }, [page]);

  return <div ref={rootRef} className="rb-enhancement-layer" data-enhanced-page={page}>{children}</div>;
}
