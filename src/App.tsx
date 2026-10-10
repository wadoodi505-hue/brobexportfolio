import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PageTransition } from './components/PageTransition';
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

  useEffect(() => { document.title = routePages[page].title; window.scrollTo({ top: 0, behavior: 'auto' }); }, [page]);
  if (error) return <main className="migration-error"><h1>Unable to load this page</h1><p>Please refresh the page. If the problem continues, check the deployed legacy assets.</p></main>;
  if (!markup) return <div className="app-loading" role="status">Loading {routePages[page].label}…</div>;
  return <PageTransition><div className="legacy-page" dangerouslySetInnerHTML={{ __html: markup }} /></PageTransition>;
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
