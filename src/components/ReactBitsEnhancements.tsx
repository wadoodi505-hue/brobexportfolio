import { useEffect, useRef, type ReactNode } from 'react';

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

    const headings = root.querySelectorAll<HTMLElement>('main h1, .hero h1, h1');
    headings.forEach((heading) => heading.classList.add('rb-text-reveal'));

    const revealTargets = root.querySelectorAll<HTMLElement>(
      'main h2, section h2, .service-card, .project-card, .editorial-card, .skill-card, .timeline-item'
    );
    revealTargets.forEach((element, index) => {
      element.classList.add('rb-scroll-reveal');
      element.style.setProperty('--rb-reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    });

    const cleanupHandlers: Array<() => void> = [];
    const cards = root.querySelectorAll<HTMLElement>(
      '.project-card, .service-card, .editorial-card, .skill-card'
    );
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

      return () => { observer.disconnect(); cleanupHandlers.forEach((cleanup) => cleanup()); };
    }

    revealTargets.forEach((element) => element.classList.add('rb-is-visible'));
    headings.forEach((element) => element.classList.add('rb-is-visible'));
    return () => cleanupHandlers.forEach((cleanup) => cleanup());
  }, [page]);

  return <div ref={rootRef} className="rb-enhancement-layer" data-enhanced-page={page}>{children}</div>;
}
