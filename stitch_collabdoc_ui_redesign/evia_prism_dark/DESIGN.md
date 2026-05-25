---
name: Evia Prism Dark
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c909f'
  outline-variant: '#424753'
  surface-tint: '#afc6ff'
  primary: '#afc6ff'
  on-primary: '#002d6c'
  primary-container: '#528dff'
  on-primary-container: '#00275f'
  inverse-primary: '#0059c6'
  secondary: '#00e29c'
  on-secondary: '#003824'
  secondary-container: '#00a571'
  on-secondary-container: '#00311e'
  tertiary: '#cabeff'
  on-tertiary: '#31009a'
  tertiary-container: '#937dff'
  on-tertiary-container: '#2a0088'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004398'
  secondary-fixed: '#48ffb6'
  secondary-fixed-dim: '#00e29c'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e6deff'
  tertiary-fixed-dim: '#cabeff'
  on-tertiary-fixed: '#1c0062'
  on-tertiary-fixed-variant: '#4717ca'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  desktop-max-width: 1440px
---

## Brand & Style

This design system is a high-performance, technical evolution of the brand, optimized for deep-focus environments. It balances the authority of a professional enterprise tool with the kinetic energy of a modern startup. The visual language is rooted in **Modern-Corporate** principles but infused with **Glassmorphism** and high-contrast accents to ensure the interface feels expansive rather than heavy.

The emotional response should be one of "Technical Precision." By utilizing a deep, atmospheric foundation, the design system allows vibrant accent colors to act as functional beacons, guiding the user's eye toward critical data and primary actions. It is built for power users who require clarity, speed, and a sophisticated aesthetic that reduces eye strain during long working sessions.

## Colors

The palette is anchored in a multi-layered dark scheme. The foundation uses a deep **Charcoal (#121212)** for the lowest logic level (backgrounds), while **Navy (#1A1C1E)** is reserved for UI containers and elevated surfaces to provide subtle structural contrast.

**Accent Strategy:**
- **Primary Blue (#4D8BFF):** Used for primary actions, active states, and focus indicators. It should feel "electric" against the dark background.
- **Secondary Green (#2DFFB3):** Utilized for success states, positive trends, and "Go" signals.
- **Functional Grays:** Text follows a strict hierarchy—Pure White for headers, and a muted slate-gray for supporting body copy to maintain high readability without "vibration" against the black.

## Typography

This design system utilizes **Hanken Grotesk** across all levels to maintain a clean, contemporary, and highly legible appearance. The typeface’s sharp geometry excels in dark mode, where font weight often needs to be slightly increased or letter-spacing adjusted to prevent "ink bleed" visual effects.

**Usage Rules:**
- **Headlines:** Use Bold (700) or SemiBold (600) weights with negative letter spacing for a compact, technical look.
- **Body:** Stick to Regular (400) for long-form reading to ensure maximum clarity against dark surfaces.
- **Labels:** Use Medium (500) or SemiBold (600) in uppercase for small metadata to differentiate it from standard body text.

## Layout & Spacing

The layout philosophy is based on a **Fluid Grid** model using an 8px base unit. This ensures vertical rhythm and consistent alignment across complex data dashboards.

**Breakpoints:**
- **Desktop (1440px+):** 12-column grid, 24px margins, 16px gutters.
- **Tablet (768px - 1439px):** 8-column grid, 24px margins, 16px gutters.
- **Mobile (Under 767px):** 4-column grid, 16px margins, 12px gutters.

Avoid "crowding" the UI. In dark mode, whitespace (or "darkspace") acts as a visual separator that is more effective than heavy borders. Use generous padding inside containers to let content breathe.

## Elevation & Depth

Hierarchy in this design system is achieved through **Tonal Layering** and **Subtle Glassmorphism** rather than traditional heavy shadows.

1.  **Level 0 (Background):** #121212. The base canvas.
2.  **Level 1 (Cards/Containers):** #1A1C1E. Used for primary content blocks.
3.  **Level 2 (Overlays/Popovers):** A semi-transparent version of the Navy color with a 20px backdrop blur and a 1px inner border (20% white opacity) to simulate a "Prism" glass effect.
4.  **Shadows:** Use extremely soft, large-radius shadows (Blur: 40px, Opacity: 40%) with a slight blue tint (#000000) to lift elements off the background without creating harsh edges.

## Shapes

The shape language is **Rounded**, strike a balance between friendly approachability and professional structure.

- **Components (Buttons, Inputs):** 0.5rem (8px) radius.
- **Large Containers (Cards, Modals):** 1rem (16px) radius.
- **Feature Elements:** 1.5rem (24px) for distinct "Prism" callouts.

All strokes and borders should be kept thin (1px) to maintain a crisp, high-definition feel.

## Components

### Buttons
- **Primary:** Solid Primary Blue (#4D8BFF) with White text. Use a subtle outer glow on hover.
- **Secondary:** Transparent background with a 1px Navy border and White text.
- **Ghost:** No border, Primary Blue text. Reserved for low-priority actions.

### Input Fields
Inputs use the Navy (#1A1C1E) background with a 1px border that shifts to Primary Blue upon focus. Labels should be small, capitalized, and positioned above the field in Secondary Text color.

### Cards
Cards should have no visible outer shadow by default. Instead, they are defined by their #1A1C1E background against the #121212 canvas. Add a subtle 1px "rim light" (top border) at 10% white opacity to define the edge.

### Chips & Status Indicators
- **Success:** Secondary Green (#2DFFB3) text with a 10% opacity green background.
- **Critical:** Soft Red (#FF5C5C) with a 10% opacity red background.
- **Neutral:** Secondary Text color with a 1px border.

### Progress Bars
Use the Primary Blue for the fill, and a deep charcoal for the track. The fill should have a slight "pulse" or gradient to imply movement and energy.