# Mobile Fix Lab — Design System

Professional device-repair brand: precise, technical, trustworthy. Light UI with deep
navy structure and a single electric-blue action color. No decorative gradients on
functional elements; photography (real bench shots) carries the visual weight.

---

## 1. Color Palette

| Role       | Name          | HEX       | Usage                                        |
|------------|---------------|-----------|----------------------------------------------|
| Primary    | Lab Navy      | `#0B2447` | Headings, nav/footer, dark sections          |
| Secondary  | Steel Slate   | `#475569` | Secondary text, icons, captions              |
| Accent     | Circuit Blue  | `#2563EB` | CTAs, links, focus rings, highlights         |
| Background | Bench White   | `#F8FAFC` | Page background (cards sit on pure `#FFFFFF`)|
| Text       | Ink Slate     | `#1E293B` | Body copy                                    |

Supporting tokens: `--border: #E2E8F0`, `--accent-dark: #1D4ED8` (hover),
`--success: #15803D`, `--navy-soft: #16345F` (cards on dark sections).

### Contrast checks (WCAG 2.1)

| Pair                             | Ratio   | Result                     |
|----------------------------------|---------|----------------------------|
| Ink Slate `#1E293B` on `#F8FAFC` | 14.9:1  | AAA (body text)            |
| Lab Navy `#0B2447` on `#FFFFFF`  | 16.2:1  | AAA (headings)             |
| Circuit Blue `#2563EB` on white  | 5.2:1   | AA normal / AAA large      |
| White on Circuit Blue `#2563EB`  | 5.2:1   | AA — button labels pass    |
| White on Lab Navy `#0B2447`      | 16.2:1  | AAA (dark sections)        |
| Steel Slate `#475569` on white   | 7.6:1   | AAA (secondary text)       |

Rule: Circuit Blue is never used for text below 16px unless bold; muted text never
drops below `#64748B` (4.8:1) on white.

---

## 2. Typography

Pairing: **Sora** (geometric, technical — display) + **Inter** (neutral, highly
legible — UI/body). Both variable Google Fonts, loaded with `display=swap`.

```css
--font-display: "Sora", system-ui, sans-serif;
--font-body: "Inter", system-ui, sans-serif;

h1 {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5.2vw, 3.9rem);   /* 38–62px fluid */
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--navy);
}

h2 {
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 3.2vw, 2.5rem);   /* 27–40px fluid */
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--navy);
}

body {
  font-family: var(--font-body);
  font-size: 1rem;                            /* 16px */
  font-weight: 400;
  line-height: 1.65;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
```

Scale (1.25 major third): 12.8 / 16 / 20 / 25 / 31 / 39 / 49 / 61 px.
Overlines: 12px, 600, uppercase, `letter-spacing: 0.14em`, Circuit Blue.

---

## 3. Grid & Spacing

**12-column grid**, max content width **1200px**, gutter **24px**, side padding
**24px** (16px under 640px). Implemented as `.container` + CSS Grid utilities
(`.grid`, `.col-span-*`). Cards and split layouts snap to column boundaries:
hero = 6/6, feature cards = 4/4/4, service rows = 3-up or 4-up collapsing to 1.

**8px base unit** — all spacing is a multiple:

| Token       | Value | Use                          |
|-------------|-------|------------------------------|
| `--space-1` | 8px   | icon gaps, chip padding      |
| `--space-2` | 16px  | inside cards, form gaps      |
| `--space-3` | 24px  | card padding, grid gutter    |
| `--space-4` | 32px  | between related blocks       |
| `--space-6` | 48px  | heading → content             |
| `--space-8` | 64px  | subsection spacing           |
| `--space-12`| 96px  | section vertical rhythm      |

Section padding: `96px 0` desktop, `64px 0` mobile. Border radius: 10px inputs,
14px cards, 999px pills. One shadow level for cards
(`0 1px 2px rgb(11 36 71 / .05)`) plus a hover elevation
(`0 12px 32px rgb(11 36 71 / .10)`).

---

## 4. Motion & Accessibility

- Reveal-on-scroll: 500ms ease-out, 16px translate, via IntersectionObserver.
- Hover transitions ≤ 200ms; cards lift 4px max.
- All motion disabled under `prefers-reduced-motion: reduce`.
- Focus: 2px Circuit Blue outline with 2px offset, never removed.
- Skip-to-content link, semantic landmarks, labeled form controls, alt text on
  all imagery, `aria-expanded` on the hamburger toggle.
