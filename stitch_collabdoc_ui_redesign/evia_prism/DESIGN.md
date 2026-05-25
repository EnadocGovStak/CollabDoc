---
name: Evia Prism
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf0'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d9e3f9'
  on-surface: '#121c2c'
  on-surface-variant: '#414750'
  inverse-surface: '#273141'
  inverse-on-surface: '#ebf1ff'
  outline: '#727782'
  outline-variant: '#c1c7d2'
  surface-tint: '#1960a3'
  primary: '#005394'
  on-primary: '#ffffff'
  primary-container: '#2b6cb0'
  on-primary-container: '#e1ecff'
  inverse-primary: '#a2c9ff'
  secondary: '#006d40'
  on-secondary: '#ffffff'
  secondary-container: '#8ef5b5'
  on-secondary-container: '#007243'
  tertiary: '#a70819'
  on-tertiary: '#ffffff'
  tertiary-container: '#ca2a2e'
  on-tertiary-container: '#ffe6e3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004881'
  secondary-fixed: '#91f8b8'
  secondary-fixed-dim: '#74db9d'
  on-secondary-fixed: '#002110'
  on-secondary-fixed-variant: '#00522f'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f9f9ff'
  on-background: '#121c2c'
  surface-variant: '#d9e3f9'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 32px
  container-max: 1440px
---

## Brand & Style

The brand personality is **Systematic, Collaborative, and Reliable**. It serves as a high-precision workspace for professionals who manage complex document lifecycles. The UI must evoke a sense of focused productivity and institutional trust, ensuring that users feel in control of their data.

The design style follows a **Corporate / Modern** aesthetic with **Minimalist** leanings. It prioritizes functional clarity over decorative elements, using purposeful whitespace to reduce cognitive load in data-dense environments. Subtle depth is used to separate active working areas from global navigation.

## Colors

The palette is rooted in the established deep blue from the existing application, providing a foundation of authority. The brand green is utilized as a secondary accent for success states and primary brand recognition (logo and toggle states).

- **Primary Blue:** Used for primary actions, active navigation states, and structural identifiers.
- **Secondary Green:** Used for "Ready" or "Final" indicators and brand-aligned interactive components.
- **Status Indicators:**
    - **Draft:** Neutral grey-blue backgrounds to signify "In-progress" without urgency.
    - **Public:** Soft green backgrounds with dark green text for clear accessibility.
    - **Internal:** Soft blue-tinted backgrounds to differentiate restricted content.
- **Neutral Scale:** A cooling range of greys ensures the workspace feels modern rather than starkly black and white.

## Typography

The typography system uses **Hanken Grotesk** for headlines to provide a sharp, contemporary edge that feels modern and engineered. **Inter** is used for all body copy and interface labels due to its exceptional legibility in data-heavy tables and forms.

- **Scale:** Larger headlines use tighter letter-spacing to maintain impact on desktop.
- **Labels:** Micro-copy and status chips use `label-md` with slight tracking to ensure readability at small sizes.
- **Hierarchy:** Use weight variation (SemiBold/Bold) in Inter to distinguish between field labels and user input.

## Layout & Spacing

The design system utilizes a **12-column Fluid Grid** with a maximum container width for desktop to prevent line lengths from becoming unreadable.

- **Rhythm:** An 8px/4px base grid ensures consistent alignment.
- **Sidebar:** Document editor sidebars are fixed-width (280px - 320px) to maximize the central workspace.
- **Density:** Use "Comfortable" density for dashboard views (24px padding) and "Compact" density for data tables and editor properties (8px - 12px padding).
- **Mobile:** Transition to a single-column layout with 16px side margins. Horizontal scrolling is reserved for wide data tables.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface 0 (Background):** Light grey-blue (#F7FAFC) to define the application shell.
- **Surface 1 (Cards/Container):** Pure white with a 1px border (#E2E8F0) to create a "sheet" metaphor for documents.
- **Surface 2 (Popovers/Modals):** Pure white with a diffused 12px blur shadow (Opacity 8%, Neutral Color) to indicate floating interaction.
- **Interaction:** Hover states should lift elements via a slightly darker border color rather than a shadow change to maintain a flat, professional look.

## Shapes

The shape language is **Soft**, striking a balance between approachable modern design and the structured nature of enterprise software.

- **Base Radius (0.25rem):** Standard for buttons, input fields, and small UI components.
- **Large Radius (0.5rem):** Used for cards, modals, and container segments.
- **Status Chips:** Use a slightly higher radius (rounded-full) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Blue, White text, 4px radius.
- **Secondary:** Blue outline, 1px border, 4px radius.
- **Ghost:** No border or background until hover; used for toolbar actions.

### Status Chips
- Small, uppercase text. Background colors defined in the palette. Use a "dot" icon prefix for high-priority status like "In Progress" or "Error."

### Form Inputs
- 1px neutral border that thickens and changes to Primary Blue on focus. Labels sit consistently above the field in `label-md` style.

### Cards
- White background, 1px border. Headlines inside cards use `headline-md`. Grouped information (e.g., Document Info) should be separated by subtle horizontal rules (#EDF2F7).

### Toggles & Switches
- Use the Secondary Green for the 'On' state to align with the logo's gear/molecule icon, providing a tactile sense of the system "working."

### Sidebar Navigation
- Vertical list items with 8px padding. Active state uses a Primary Blue left-edge border (4px width) and a subtle blue-tinted background.