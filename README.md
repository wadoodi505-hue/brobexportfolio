# BROBEX Portfolio — Premium Estimator & Motion Refinement

This update preserves the existing HTML, CSS, and vanilla JavaScript architecture and current page URLs.

## Changes in this package

- Reworked `js/estimator.js` around configurable USD and GBP pricing tables.
- Removed the blanket 30% discount so displayed estimates are not artificially reduced.
- Added region selection with separately configurable USD and GBP assumptions (not currency conversion).
- Updated website types to focus on realistic small-business project scopes.
- Added feature filtering based on the selected website type.
- Improved estimate summary and brief consistency, including the selected currency and scope.
- Added safe, best-effort persistence for project selections. Contact details are intentionally not saved in localStorage.
- Added graceful handling for malformed/inaccessible saved state, reduced-motion-aware step scrolling, reset confirmation, and accessible focus styling.
- Improved email and WhatsApp brief text and URL encoding. Email links open a draft; they do not send automatically.
- Added `css/motion-refinement.css` to all six pages for consistent, restrained transitions and reduced-motion support.
- Added estimator currency-selector styling in `css/estimator.css`.

## Pricing notes

The USD and GBP figures are editable in the `CONFIG` object at the top of `js/estimator.js`. They are initial planning assumptions, not verified market averages or guaranteed quotes. Confirm delivery costs and competitive positioning before publishing them as official prices. Domain, hosting, paid services, transaction fees, photography, extensive copywriting, product entry, and ongoing maintenance are noted as potentially separate.

## Validation performed

- `node --check` passed for all 9 JavaScript files in the package.
- Local asset references in the six HTML pages were checked; no missing local references were found.
- The estimator script was reviewed against the existing four-step HTML structure.

## Not yet verified in a real browser

A full interactive browser test, accessibility audit, Lighthouse run, and real email/WhatsApp handoff were not performed in this environment. Please test these before deploying. In particular, test the estimator on mobile and verify that the user's browser allows opening WhatsApp or an email application.
