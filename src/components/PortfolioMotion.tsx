import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Shared motion layer for the injected legacy pages. GSAP is already a project dependency. */
export function PortfolioMotion({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = document.querySelector<HTMLElement>('.legacy-page');
    if (!root) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      // Animate headings only; existing IntersectionObserver remains responsible for card reveals.
      root.querySelectorAll<HTMLElement>('main h1, .hero h1, .page-hero h1').forEach((heading) => {
        gsap.fromTo(heading, { autoAlpha: 0, y: 18 }, {
          autoAlpha: 1, y: 0, duration: .72, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: heading, start: 'top 92%', once: true }
        });
      });
      // Parallax is decorative, desktop-only, and transform-based.
      if (!isMobile) {
        root.querySelectorAll<HTMLElement>('.bg-luxury-wallpaper, .cinematic-grain').forEach((element, index) => {
          gsap.to(element, {
            y: index === 0 ? -26 : -12, ease: 'none',
            scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: .8 }
          });
        });
      }
    }, root);

    // Header direction behavior: class writes are RAF-throttled and do not read layout each frame.
    const header = root.querySelector<HTMLElement>('.top-nav');
    let previousY = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - previousY;
        if (currentY < 72 || delta < -8) header?.classList.remove('hud-nav-hidden');
        else if (delta > 8) header?.classList.add('hud-nav-hidden');
        previousY = currentY;
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      header?.classList.remove('hud-nav-hidden');
      ctx.revert();
    };
  }, [routeKey]);
  return null;
}
