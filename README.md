# BROBEX Portfolio — CSS Performance & Premium UI Optimization

## Scope

This package is a targeted performance pass over the existing BROBEX portfolio.

**Core rule followed:** `index.html` was not modified, and no HTML file was changed.

The existing page structure, classes, IDs, links, content, JavaScript behavior, responsive architecture, and visual identity remain compatible with the current HTML.

## Optimization goals

- Reduce unnecessary GPU/CPU paint work.
- Reduce expensive blur/filter compositing.
- Remove unnecessary `will-change` hints.
- Reduce always-running decorative animation.
- Keep premium dark/gold/green visual language.
- Preserve navigation, cards, buttons, forms, sections, and responsive behavior.
- Improve touch/mobile performance.
- Preserve keyboard focus and reduced-motion support.
- Prefer `transform` and `opacity` for motion.

---

## Modified files

### `css/style.css`
Primary performance optimization layer.

Changes:
- Removed 13 CSS blur usages from the original file.
- Removed all 11 unnecessary `will-change` declarations.
- Replaced large navigation/mobile overlay blur effects with lightweight translucent/opaque surfaces.
- Replaced the 24px glass blur system with a non-blur surface.
- Removed continuous profile floating animation.
- Removed continuously rotating profile glow animation.
- Reduced profile glow intensity.
- Reduced large card/HUD shadows.
- Removed blur from scroll-reveal transitions.
- Reduced reveal transition duration from 800ms to 450ms.
- Removed unused `spinGlow` and `smoothFloat` keyframes.
- Added touch/mobile performance guardrails.
- Preserved the existing gold/green luxury palette and component hierarchy.

### `css/animations.css`
Animation cleanup.

Changes:
- Removed blur from page-entry animation.
- Removed unnecessary `will-change`.
- Disabled unused continuous character floating animation.
- Reduced scanline overlay intensity.
- Preserved scroll reveals, staggered reveals, and reduced-motion support.

### `css/desktop-enhancements.css`
Desktop interaction optimization.

Changes:
- Removed unnecessary 3D transform/backface setup.
- Removed the pointer-following radial-gradient overlay from cards.
- Reduced desktop card hover shadow cost.
- Simplified pointer tilt to a lightweight 2D lift.
- Reduced image hover filter intensity.
- Removed continuous status-dot pulse.
- Removed continuous hero-art breathing animation.
- Removed unused related keyframes.
- Added an explicit reduced-motion reset for desktop tilt.

### `css/enhancements.css`
Interaction hint cleanup.

Changes:
- Removed unnecessary `will-change: transform`.
- Preserved focus rings, touch targets, responsive layout helpers, and fallback behavior.

### `css/theme.css`
Theme shadow optimization.

Changes:
- Reduced default panel shadow size.
- Reduced hover shadow depth.
- Preserved dark/light theme tokens and visual identity.

### `css/premium.css`
Premium layer cleanup.

Changes:
- Removed unnecessary `will-change: auto`.
- Reduced oversized command/modal shadow intensity.
- Preserved command palette, premium controls, filters, accessibility states, and existing progressive-enhancement behavior.

### `css/estimator.css`
Estimator visual optimization.

Changes:
- Removed estimator backdrop blur.
- Reduced the large estimator panel shadow.
- Preserved estimator layout, controls, animations, and functionality.

### `project.css`
Project archive optimization.

Changes:
- Removed project modal backdrop blur.
- Replaced it with a lightweight opaque/translucent backdrop.
- Reduced project-image saturation adjustment.
- Reduced large modal shadow depth.
- Preserved filtering, modal behavior, project cards, search, and responsive styling.

---

## Files intentionally NOT modified

### HTML
No HTML file was changed.

This includes:
- `index.html`
- `about.html`
- `contact.html`
- `experience.html`
- `services.html`
- `projects.html`

Their SHA-256 hashes were verified before and after optimization.

### JavaScript
No JavaScript file was modified.

This preserves:
- Navigation behavior
- Mobile menu behavior
- Scroll UI
- Reveal logic
- Counters
- Pointer interactions
- Project filtering
- Project modal behavior
- Theme switching
- Premium controls
- Estimator behavior

---

## Performance strategy

### 1. Blur reduction

Large `backdrop-filter` and `filter: blur()` effects can create expensive compositing layers, especially across large surfaces.

The optimization removes broad blur usage from:
- Navigation
- Mobile navigation
- Cards/HUD surfaces
- Project modal backdrop
- Estimator surface
- Scroll reveals

The profile glow keeps only a very small visual accent without the previous heavy blur treatment.

### 2. Shadow reduction

Large multi-layer shadows were replaced with smaller, controlled shadows.

The goal is not to remove depth, but to make depth visually intentional.

### 3. Animation reduction

Continuous decorative animation was reduced or removed where it did not communicate useful interaction.

Removed/reduced examples:
- Profile floating
- Rotating profile glow
- Hero-art breathing
- Status-dot pulse
- Heavy blur reveal
- 3D pointer tilt

Kept:
- Short hover transitions
- Scroll reveals
- Staggered entrance effects
- Button interactions
- Navigation interactions
- Important UI state transitions

### 4. Mobile optimization

Touch/mobile layouts now use:
- Smaller shadows
- No profile glow blur
- No hover transform effects
- Reduced visual paint complexity

This keeps the same hierarchy without requiring desktop-level decorative rendering on small devices.

### 5. Accessibility

The existing reduced-motion architecture was preserved and strengthened.

`prefers-reduced-motion: reduce` continues to minimize:
- Animation duration
- Animation repetition
- Transition duration
- Smooth scrolling
- Desktop pointer transforms

Keyboard focus states remain visible.

---

## Validation

The optimized CSS was parsed with a CSS parser after editing.

**CSS syntax errors: 0**

HTML integrity check:

**HTML changed: NO**

JavaScript files changed:

**NO**

Modified CSS files:

1. `css/style.css`
2. `css/animations.css`
3. `css/desktop-enhancements.css`
4. `css/enhancements.css`
5. `css/theme.css`
6. `css/premium.css`
7. `css/estimator.css`
8. `project.css`

---

## Important note about FPS

The target is a stable, smooth experience rather than an arbitrary FPS number.

Performance depends on:
- Browser
- Device GPU/CPU
- Display refresh rate
- Image sizes
- Browser extensions
- Network conditions
- Other running applications

The CSS therefore avoids using excessive animation simply to advertise a high FPS target.

---

## Recommended verification

After replacing the files, test:

1. Desktop navigation.
2. Mobile menu open/close.
3. All page links.
4. Project filtering/search.
5. Project modal.
6. Theme switch.
7. Estimator controls.
8. Contact/form interactions.
9. Keyboard Tab navigation.
10. Reduced-motion mode.
11. Mobile scrolling.
12. Chrome DevTools Performance panel.
13. Chrome DevTools Rendering → Paint flashing.
14. Lighthouse performance/accessibility audit.

The intended result is **premium visual quality with less visual noise and lower paint/compositing cost**, not a simplified or rebuilt website.
