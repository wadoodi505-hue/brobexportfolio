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
    const metadata = routePages[page];
    const canonicalUrl = `https://brobexportfolio.vercel.app${metadata.canonicalPath}`;
    const imageUrl = 'https://brobexportfolio.vercel.app/images/brobexcardimage.jpeg';

    const setMeta = (attribute: 'name' | 'property', key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = value;
    };

    document.title = metadata.title;
    setMeta('name', 'description', metadata.description);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'BROBEX Portfolio');
    setMeta('property', 'og:title', metadata.title);
    setMeta('property', 'og:description', metadata.description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:image:alt', 'BROBEX website developer portfolio preview');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', metadata.title);
    setMeta('name', 'twitter:description', metadata.description);
    setMeta('name', 'twitter:image', imageUrl);
    setMeta('name', 'twitter:image:alt', 'BROBEX website developer portfolio preview');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': 'https://brobexportfolio.vercel.app/#person',
          name: 'BROBEX',
          url: 'https://brobexportfolio.vercel.app/',
          image: imageUrl,
          jobTitle: 'Website Developer',
          email: 'brobex.ffx@gmail.com',
          description: 'BROBEX is a website developer based in Pakistan, focused on modern frontend development and responsive web experiences.',
          knowsAbout: ['React.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5', 'Vite', 'Responsive Website Development', 'Frontend Engineering', 'UI Implementation'],
          sameAs: ['https://www.instagram.com/codewithbrobex/', 'https://www.youtube.com/@BrobexCode'],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://brobexportfolio.vercel.app/#website',
          url: 'https://brobexportfolio.vercel.app/',
          name: 'BROBEX Portfolio',
          publisher: { '@id': 'https://brobexportfolio.vercel.app/#person' },
          inLanguage: 'en',
        },
        {
          '@type': 'ProfilePage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: metadata.title,
          description: metadata.description,
          isPartOf: { '@id': 'https://brobexportfolio.vercel.app/#website' },
          about: { '@id': 'https://brobexportfolio.vercel.app/#person' },
          inLanguage: 'en',
        },
        ...(page === 'services' ? [{
          '@type': 'Service',
          '@id': 'https://brobexportfolio.vercel.app/services#web-development',
          name: 'Website and Frontend Development',
          provider: { '@id': 'https://brobexportfolio.vercel.app/#person' },
          serviceType: ['Responsive Website Development', 'React Frontend Development', 'Frontend UI Implementation'],
          areaServed: 'Worldwide',
        }] : []),
        ...(page !== 'home' ? [{
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://brobexportfolio.vercel.app/' },
            { '@type': 'ListItem', position: 2, name: metadata.label, item: canonicalUrl },
          ],
        }] : []),
      ],
    };

    let schema = document.getElementById('brobex-page-schema') as HTMLScriptElement | null;
    if (!schema) {
      schema = document.createElement('script');
      schema.id = 'brobex-page-schema';
      schema.type = 'application/ld+json';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(structuredData);
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
    // Show a short premium entrance on each full page load/direct entry or refresh.
    // React Router navigation stays instant and never replays this overlay.
    if (loaderSetupRef.current) return;
    loaderSetupRef.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setShowFirstLoader(true);
    window.setTimeout(() => setShowFirstLoader(false), 820);
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
