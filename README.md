# BROBEX portfolio

This is the enhanced static portfolio for BROBEX. It keeps the original six-page
structure, project URLs, contact links, branding, and image assets. It is
dependency-free and can be served directly from this folder.

## What was improved

- Added a dependency-free command palette (`Ctrl/Cmd + K`) for page navigation,
  theme switching, and view settings.
- Added persistent performance and reduced-motion controls. Performance mode
  removes decorative grain, pointer glow, blur, and continuous ambient effects.
- Reworked the project archive with a featured Stack Tower entry, six accurate
  project records, category filters, live search, project numbering, technology
  tags, and accessible result announcements.
- Added structured data for all six projects and refreshed page-level social
  metadata, canonical URLs, image dimensions, and external-link labeling.
- Kept the existing layered CSS/JavaScript architecture and scoped pointer
  work to fine-pointer desktop layouts instead of adding a framework.
- Touch layouts disable backdrop blur, decorative loops, and expensive reveal
  blur effects while preserving content and navigation.
- Added low-cost pointer glow positioning through transforms, `overflow-x: clip`
  protection, and stronger reduced-motion behavior.

The additive desktop motion layer lives in `css/desktop-enhancements.css` and
`js/desktop-enhancements.js`. It is limited to fine-pointer viewports at
993px and above, uses requestAnimationFrame for cursor updates, and respects
`prefers-reduced-motion`. Touch layouts continue to use the existing
responsive rules without the pointer glow or card tilt.

The shared theme layer lives in `css/theme.css` and `js/theme.js`. Dark is the
default BROBEX direction; the light theme is a separate ivory/charcoal
interface, persists with `localStorage`, follows the system preference on first
visit, and is available from the shared top navigation on every page.

The progressive enhancement layer lives in `css/premium.css` and
`js/premium.js`. It is dependency-free and does not run a continuous
animation loop. The project archive behavior is progressive: the six entries
remain present in the HTML and the controls enhance them when JavaScript runs.

## Run locally

From this directory, serve the files with any static web server. For example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/index.html`.

## Included pages

- `index.html` — homepage
- `about.html` — profile and technical direction
- `services.html` — capabilities
- `experience.html` — development journey
- `projects.html` — selected work
- `contact.html` — contact methods and email-draft form