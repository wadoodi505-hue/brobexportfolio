# Deployment checklist

1. Use Node.js 20.19+ or 22.12+.
2. Run `npm install` and verify it finishes without errors.
3. Run `npm run typecheck` and `npm run build`.
4. Run locally with `npm run dev`, then test all six pages, estimator step navigation/calculations/email brief, project links, mobile navigation, themes, contact form, keyboard focus and reduced motion.
5. On Vercel, deploy this directory as the project root. Build command: `npm run build`; output directory: `dist`.
6. Confirm static assets under `/css`, `/js`, `/images`, `/responsive`, and `/legacy` are served without rewrites. Confirm each app route refreshes successfully.
7. Before production use, fix any console errors from legacy scripts and run browser tests on mobile and desktop.
8. Reviews require a separate backend/database and are not enabled by this package.

The original supplied source is retained under `original-backup/` for rollback and comparison.
