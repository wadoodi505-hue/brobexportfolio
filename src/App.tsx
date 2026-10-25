import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ReactBitsEnhancements } from './components/ReactBitsEnhancements';
import { routePages, type PageKey } from './data/routes';

const legacyScripts: Partial<Record<PageKey, string[]>> = {
  home: ['/js/site.js','/responsive/responsive.js','/js/desktop-enhancements.js','/js/theme.js','/js/premium.js','/js/motion-refinement.js'],
  about: ['/js/about.js','/js/estimator.js','/js/site.js','/responsive/responsive.js','/js/desktop-enhancements.js','/js/theme.js','/js/premium.js','/js/motion-refinement.js'],
  services: ['/js/site.js','/responsive/responsive.js','/js/desktop-enhancements.js','/js/theme.js','/js/premium.js','/js/motion-refinement.js'],
  experience: ['/js/site.js','/responsive/responsive.js','/js/desktop-enhancements.js','/js/theme.js','/js/premium.js','/js/motion-refinement.js'],
  projects: ['/js/projects-data.js','/js/projects.js','/js/site.js','/responsive/responsive.js','/js/desktop-enhancements.js','/js/theme.js','/js/premium.js','/js/motion-refinement.js'],
  contact: ['/js/site.js','/responsive/responsive.js','/js/desktop-enhancements.js','/js/theme.js','/js/premium.js','/js/motion-refinement.js'],
};

function LegacyPage({ page }: { page: PageKey }) {
  const navigate = useNavigate();
  const [markup, setMarkup] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    setMarkup(''); setError(false);
    fetch(`/legacy/pages/${routePages[page].file}.html`, { headers: { Accept: 'text/html' } })
      .then((response) => { if (!response.ok) throw new Error(`Page request failed (${response.status})`); return response.text(); })
      .then((html) => { if (alive) setMarkup(html); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [page]);

  useEffect(() => {
    if (!markup) return;
    const scripts = legacyScripts[page] ?? [];
    let cancelled = false;
    const added: HTMLScriptElement[] = [];
    const run = async () => {
      for (const src of scripts) {
        if (cancelled) return;
        const script = document.createElement('script');
        script.src = src; script.async = false; script.dataset.legacyRoute = page;
        document.body.appendChild(script); added.push(script);
        await new Promise<void>((resolve) => { script.onload = () => resolve(); script.onerror = () => resolve(); });
      }
      if (!cancelled) document.dispatchEvent(new Event('DOMContentLoaded'));
    };
    void run();
    return () => { cancelled = true; added.forEach((script) => script.remove()); };
  }, [markup, page]);

  // The legacy HTML uses ordinary .html links. Intercept only same-origin portfolio
  // routes so navigation stays inside React Router and in-memory estimator progress survives.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.legacy-page');
    if (!root) return;
    const internalPaths = new Set([
      '/', '/index.html',
      '/about', '/about.html',
      '/services', '/services.html',
      '/experience', '/experience.html',
      '/projects', '/projects.html',
      '/contact', '/contact.html',
    ]);
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      let url: URL;
      try { url = new URL(link.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin || !internalPaths.has(url.pathname)) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      event.preventDefault();
      navigate(`${url.pathname}${url.search}${url.hash}`);
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [markup, page, navigate]);

  useEffect(() => {
    const pageMeta: Record<PageKey, string> = {
      home: 'Brobex is a freelance web developer creating responsive websites, refined interfaces, and interactive digital experiences for modern brands.',
      about: 'Learn about Brobex, a freelance web developer focused on responsive web experiences, thoughtful UI, and clean front-end implementation.',
      services: 'Explore Brobex web development services, including responsive websites, frontend development, UI implementation, redesigns, and performance improvements.',
      experience: 'Explore the Brobex development journey, workflow, and approach to building thoughtful, responsive web experiences.',
      projects: 'Explore selected Brobex web development projects, including business websites, interactive experiences, and game-related builds.',
      contact: 'Contact Brobex to discuss a website, frontend development, redesign, or interactive web project.',
    };
    const canonicalUrl = page === 'home'
      ? 'https://brobexportfolio.vercel.app/'
      : `https://brobexportfolio.vercel.app/${routePages[page].file}.html`;
    const setMeta = (attribute: 'name' | 'property', key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = value;
    };
    document.title = routePages[page].title;
    setMeta('name', 'description', pageMeta[page]);
    setMeta('property', 'og:title', routePages[page].title);
    setMeta('property', 'og:description', pageMeta[page]);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('name', 'twitter:title', routePages[page].title);
    setMeta('name', 'twitter:description', pageMeta[page]);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [page]);
  if (error) return <main className="migration-error"><h1>Unable to load this page</h1><p>Please refresh the page. If the problem continues, check the deployed legacy assets.</p></main>;
  if (!markup) return <div className="app-loading" role="status">Loading {routePages[page].label}â€¦</div>;
  return <ReactBitsEnhancements page={page}><div className="legacy-page" dangerouslySetInnerHTML={{ __html: markup }} /></ReactBitsEnhancements>;
}

export default function App() {
  const location = useLocation();
  const [showFirstLoader, setShowFirstLoader] = useState(false);
  const loaderSetupRef = useRef(false);
  useEffect(() => {
    document.documentElement.dataset.route = location.pathname;
  }, [location.pathname]);
  useEffect(() => {
    // React StrictMode replays effects in development; guard that replay explicitly.
    if (loaderSetupRef.current) return;
    loaderSetupRef.current = true;
    // One entrance per tab session, regardless of the first route visited.
    // sessionStorage survives refreshes but resets for a new independent tab session.
    try {
      if (window.sessionStorage.getItem('brobex-entrance-seen-v2') === '1') return;
      window.sessionStorage.setItem('brobex-entrance-seen-v2', '1');
    } catch {
      // If storage is blocked, show the animation once for this mounted app only.
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setShowFirstLoader(true);
    // Intentionally do not cancel on StrictMode's simulated cleanup; the timer is short
    // and guarantees the overlay cannot become stuck during the development replay.
    window.setTimeout(() => setShowFirstLoader(false), 1050);
  }, []);
  return <>
    {showFirstLoader && <div className="bx-first-loader" role="status" aria-label="BROBEX portfolio is loading" aria-live="polite">
      <div className="bx-loader-inner">
        <img className="bx-loader-mark" src="/images/brobex-logo.webp" alt="" />
        <span className="bx-loader-word">BROBEX</span>
        <span className="bx-loader-track" aria-hidden="true" />
      </div>
    </div>}
    <Routes>
    <Route path="/" element={<LegacyPage page="home" />} />
    <Route path="/index.html" element={<Navigate to="/" replace />} />
    <Route path="/about" element={<LegacyPage page="about" />} />
    <Route path="/about.html" element={<LegacyPage page="about" />} />
    <Route path="/services" element={<LegacyPage page="services" />} />
    <Route path="/services.html" element={<LegacyPage page="services" />} />
    <Route path="/experience" element={<LegacyPage page="experience" />} />
    <Route path="/experience.html" element={<LegacyPage page="experience" />} />
    <Route path="/projects" element={<LegacyPage page="projects" />} />
    <Route path="/projects.html" element={<LegacyPage page="projects" />} />
    <Route path="/contact" element={<LegacyPage page="contact" />} />
    <Route path="/contact.html" element={<LegacyPage page="contact" />} />
    <Route path="*" element={
      <main className="not-found" aria-labelledby="not-found-title">
        <div className="not-found-orbit" aria-hidden="true"><span>404</span></div>
        <p className="not-found-eyebrow"><span className="not-found-status-dot" /> BROBEX / PAGE NOT FOUND</p>
        <h1 id="not-found-title">This page took a different route.</h1>
        <p className="not-found-copy">The link may be outdated, or the page may have moved. Let’s get you back to something useful.</p>
        <div className="not-found-actions">
          <Link className="not-found-primary" to="/">Return to homepage <span aria-hidden="true">↗</span></Link>
          <button className="not-found-secondary" type="button" onClick={() => window.history.back()}>Go back</button>
        </div>
        <p className="not-found-footnote">BROBEX · DIGITAL EXPERIENCES, BUILT WITH INTENTION</p>
      </main>
    } />
  </Routes>
  </>;
}
