# BROBEX Full Portfolio Upgrade

This bundle contains the original `DEPLOYMENT.zip` source plus integrated improvements. Existing assets and pages are retained; this is not a stripped-down sample.

## Integrated changes

- Added `public/css/hud-glass.css` and linked it after the existing theme CSS in `index.html`.
- Added reusable dark/light HUD tokens, glass panel utilities, gradient edge treatments, accessible focus states, mobile blur reduction, and reduced-motion-safe hover behavior.
- Added `src/components/PortfolioMotion.tsx`, wired into `src/App.tsx`. It uses the already-installed GSAP + ScrollTrigger dependencies for heading entrances, desktop-only decorative parallax, and a requestAnimationFrame-throttled hide/reveal navbar.
- Added navbar transform styles to `src/styles.css`.
- Expanded the existing `window.BROBEX_PROJECTS` records with problem/approach/solution/impact case-study copy, without inventing performance metrics.
- Updated the existing project renderer to show the case study inside its existing details modal and use responsive WebP `srcset` image variants.
- Generated 480px and 960px WebP project-image variants in `public/images/projects/` while retaining all original images.
- Kept the original CSS/JS files, existing routes, estimator, theme controls, filters, modal, and assets.

## Install and run

```bash
npm install
npm run build
npm run dev
```

The package already includes GSAP. This integrated build uses GSAP + ScrollTrigger with native browser scrolling so it remains compatible with the supplied lockfile and does not introduce an uninstalled runtime dependency. If you specifically want Lenis smooth scrolling, run `npm install lenis` in your own environment and integrate it as a separately tested dependency; it was not added to this archive because dependency installation was unavailable in this environment.

## Validation notes

The edited project data and renderer passed Node syntax checks. A full Vite/TypeScript build could not be run here because the archive does not include `node_modules` and dependency installation timed out. Run `npm install` and `npm run build` locally before deploying. Then test all six routes, direct refreshes, mobile navigation, theme switching, the estimator, project filters and modal keyboard behavior, reduced motion, and Lighthouse in a production preview.

## Performance and accessibility notes

- Only transform and opacity are used for the new GSAP motion.
- Decorative parallax is disabled at widths of 700px and below and when reduced motion is requested.
- The navbar scroll listener is passive and throttled through `requestAnimationFrame`.
- The new WebP image variants are referenced by the existing project renderer; source assets remain in place.
- Lighthouse 95+ is a target, not a guaranteed score. Validate the production build on representative devices and pages.
