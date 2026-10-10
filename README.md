# BROBEX React + TypeScript + Vite migration

## Important migration note
This package is a compatibility-first migration of the supplied archive. It adds a React + TypeScript + Vite application, React Router routes, strict TypeScript configuration, reduced-motion-aware Motion page transitions, and production build setup while preserving each supplied page's original markup, CSS, assets, estimator code, and existing interactions under `public/`. This deliberately avoids silently rewriting business logic that has not yet been independently validated. The page bodies are still legacy HTML rendered inside React, so this is a migration bridge—not yet a full component-by-component React rewrite.

## Requirements
Node.js 20.19+ or 22.12+ recommended for Vite 7.

## Commands
```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Routes
`/`, `/about`, `/services`, `/experience`, `/projects`, `/contact` and their `.html` aliases are configured. Configure your hosting provider to serve `index.html` for application routes while keeping `/legacy/*`, `/css/*`, `/js/*`, `/images/*`, `/responsive/*`, `/project.css`, `/robots.txt` and `/sitemap.xml` as static assets.

## Existing functionality
The supplied HTML body markup, CSS, images, estimator JS, projects registry and legacy scripts are copied into `public/`. The runtime loads the corresponding page markup and scripts. Since some original scripts may rely on full-document navigation or DOMContentLoaded timing, test the complete site in a browser before production release.

## Reviews backend
No secure reviews backend was included in the supplied archive. The React app does not pretend reviews are persisted or provide insecure client-only ownership. To add reviews, configure a server API plus database, authentication/ownership verification, rate limiting, and server-side validation. No secrets belong in `VITE_*` variables.

## Dependencies
- React / React DOM: UI runtime
- React Router DOM: client-side routes
- TypeScript: strict static typing
- Vite / React plugin: development and production build
- Motion: restrained page transitions
- GSAP / @gsap/react: available for future scoped scroll sequences; not yet wired into legacy page markup
- Lucide React: consistent icons for future component migration
- Vitest, Testing Library, Playwright: test tooling dependencies; browser tests need explicit test cases and Playwright browser installation

## Known limitations
- The current ZIP contained only six HTML pages and their frontend assets; no reviews backend or authentication system was supplied.
- This is not a completed rewrite of every legacy HTML section into typed React components. The compatibility layer is intentional to preserve the estimator and interactions during the first migration stage.
- A production build and real browser tests must be run after installing dependencies; no passing test results are claimed in this README.
