/// <reference path="./vite-node-shims.d.ts" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SITE = 'https://brobexportfolio.vercel.app';
const ROUTES = [
  {
    path: '/',
    file: 'index',
    title: 'BROBEX | Website Developer in Pakistan',
    description: 'BROBEX is a website developer in Pakistan building responsive React, TypeScript and Tailwind CSS websites with thoughtful user experiences.',
    label: 'Home',
  },
  {
    path: '/about',
    file: 'about',
    title: 'About BROBEX | Website Developer',
    description: 'Meet BROBEX, a website developer focused on modern frontend engineering, responsive interfaces and practical digital experiences.',
    label: 'About',
  },
  {
    path: '/services',
    file: 'services',
    title: 'Web Development Services | BROBEX',
    description: 'Explore BROBEX web development services, including responsive websites, React frontend development, UI implementation and website improvements.',
    label: 'Services',
  },
  {
    path: '/experience',
    file: 'experience',
    title: 'Development Experience | BROBEX',
    description: 'Discover the BROBEX development journey, working approach and experience creating responsive websites and modern frontend projects.',
    label: 'Experience',
  },
  {
    path: '/projects',
    file: 'projects',
    title: 'Web Development Projects | BROBEX',
    description: 'Explore responsive websites and frontend applications built by BROBEX using React, TypeScript, JavaScript and Tailwind CSS.',
    label: 'Projects',
  },
  {
    path: '/contact',
    file: 'contact',
    title: 'Hire BROBEX | Web Development',
    description: 'Contact BROBEX to discuss professional website development, React frontend projects, website redesigns or a custom web application.',
    label: 'Contact',
  },
] as const;

function prerenderPortfolioRoutes(): Plugin {
  let projectRoot = '.';
  let outputDirectory = 'dist';

  const replaceMeta = (html: string, attribute: 'name' | 'property', key: string, value: string) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`<meta\\s+([^>]*?)${attribute}=["']${escapedKey}["']([^>]*?)>`, 'i');
    const tag = `<meta ${attribute}="${key}" content="${value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">`;
    return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `  ${tag}\\n</head>`);
  };

  return {
    name: 'brobex-static-route-prerender',
    apply: 'build',
    configResolved(config) {
      projectRoot = config.root;
      outputDirectory = config.build.outDir;
    },
    closeBundle() {
      const outDir = resolve(projectRoot, outputDirectory);
      const template = readFileSync(resolve(outDir, 'index.html'), 'utf8');
      const image = `${SITE}/images/brobexcardimage.jpeg`;

      for (const route of ROUTES) {
        const source = readFileSync(resolve(projectRoot, 'public/legacy/pages', `${route.file}.html`), 'utf8');
        // The legacy templates use root-relative deployment assets after migration.
        const markup = source
          .replace(/^\s*<body\b[^>]*>/i, '')
          .replace(/<\/body>\s*$/i, '')
          .replace(/(href|src)=(['"])(?!https?:|mailto:|tel:|#|\/|\/\/)([^'"]+)\2/gi, (_match, attr: string, quote: string, value: string) => `${attr}=${quote}/${value.replace(/^\.\//, '')}${quote}`)
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

        const canonical = `${SITE}${route.path}`;
        const personId = `${SITE}/#person`;
        const graph = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Person',
              '@id': personId,
              name: 'BROBEX',
              url: `${SITE}/`,
              image,
              jobTitle: 'Website Developer',
              email: 'brobex.ffx@gmail.com',
              address: { '@type': 'Country', name: 'Pakistan' },
              sameAs: ['https://www.instagram.com/codewithbrobex/', 'https://www.youtube.com/@BrobexCode'],
              knowsAbout: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5', 'Vite', 'Responsive Website Development'],
            },
            {
              '@type': 'WebSite',
              '@id': `${SITE}/#website`,
              url: `${SITE}/`,
              name: 'BROBEX Portfolio',
              publisher: { '@id': personId },
              inLanguage: 'en',
            },
            {
              '@type': 'ProfilePage',
              '@id': `${canonical}#webpage`,
              url: canonical,
              name: route.title,
              description: route.description,
              isPartOf: { '@id': `${SITE}/#website` },
              about: { '@id': personId },
              inLanguage: 'en',
            },
            ...(route.path !== '/' ? [{
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
                { '@type': 'ListItem', position: 2, name: route.label, item: canonical },
              ],
            }] : []),
          ],
        };

        let html = template.replace(/<body[^>]*>/i, '<body class="theme-dark">');
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`);
        html = replaceMeta(html, 'name', 'description', route.description);
        html = replaceMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        html = replaceMeta(html, 'property', 'og:title', route.title);
        html = replaceMeta(html, 'property', 'og:description', route.description);
        html = replaceMeta(html, 'property', 'og:url', canonical);
        html = replaceMeta(html, 'property', 'og:image', image);
        html = replaceMeta(html, 'property', 'og:image:secure_url', image);
        html = replaceMeta(html, 'name', 'twitter:title', route.title);
        html = replaceMeta(html, 'name', 'twitter:description', route.description);
        html = replaceMeta(html, 'name', 'twitter:image', image);
        html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}">`);
        html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, `<script type="application/ld+json">${JSON.stringify(graph)}</script>`);
        html = html.replace(/<div id=["']root["']>[\s\S]*<\/div>\s*(?=<script type=["']module["'])/i, `<div id="root"><div class="legacy-page" data-prerendered-route="${route.path}">${markup}</div></div>`);

        const destination = route.path === '/'
          ? resolve(outDir, 'index.html')
          : resolve(outDir, route.path.slice(1), 'index.html');
        mkdirSync(dirname(destination), { recursive: true });
        writeFileSync(destination, html, 'utf8');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), prerenderPortfolioRoutes()],
  build: { target: 'es2022', sourcemap: true },
  server: { host: '0.0.0.0' },
});
