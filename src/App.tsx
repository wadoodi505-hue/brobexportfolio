import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { PageTransition } from './components/PageTransition';
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
  return <PageTransition><ReactBitsEnhancements page={page}><div className="legacy-page" dangerouslySetInnerHTML={{ __html: markup }} /></ReactBitsEnhancements></PageTransition>;
}

export default function App() {
  const location = useLocation();
  useEffect(() => { document.documentElement.dataset.route = location.pathname; }, [location.pathname]);
  return <Routes>
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
    <Route path="*" element={<main className="not-found"><p className="eyebrow">BROBEX / 404</p><h1>This route doesn't exist.</h1><a href="/">Return home</a></main>} />
  </Routes>;
}
