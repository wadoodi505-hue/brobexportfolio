# BROBEX portfolio

This is the enhanced static portfolio for BROBEX. It keeps the original six-page
structure, project URLs, contact links, branding, and image assets.

The additive desktop motion layer lives in `css/desktop-enhancements.css` and
`js/desktop-enhancements.js`. It is limited to fine-pointer viewports at
993px and above, uses requestAnimationFrame for cursor updates, and respects
`prefers-reduced-motion`. Touch layouts continue to use the existing
responsive rules without the pointer glow or card tilt.

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