---
name: FinGame Design System
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
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
  unit: 4px
  container-margin: 20px
  gutter: 16px
  card-padding: 24px
  stack-gap: 12px
---

## Brand & Style

The design system is built to transform the mundane task of expense tracking into an engaging, high-stakes quest for financial health. The brand personality is **Encouraging, Alive, and Addictive**, sitting at the intersection of professional fintech reliability and the dopamine-driven loops of modern gaming.

The visual style employs **Soft Glassmorphism** layered over a **Deep Navy** dark mode to create a premium, "liquid" interface feel. Elements utilize Neumorphic principles—not through heavy 2020-style bevels, but through subtle, multi-layered "glow" shadows that make interactive elements feel physically raised and energized. The target audience is Gen-Z and Millennial users who find traditional banking apps sterile and intimidating.

## Colors

The palette is anchored in **Deep Navy (#0F172A)** to provide a high-contrast canvas for vibrant accents. 

- **Primary (Electric Indigo):** Used for main actions, leveling up, and active states.
- **Success (Mint Green):** Signifies savings goals reached and positive cash flow.
- **Warning (Sunset Orange):** Alerts users when approaching budget limits.
- **Danger (Rose):** Immediate notification of overspending.

**Gradients** are the primary vehicle for emotion: Purple-to-Teal represents "Growth" (investments/savings), while Orange-to-Red represents "Spending heat." Glassmorphic surfaces should use the `glass_fill` token with a `20px` backdrop blur to maintain legibility over moving gradients.

## Typography

This design system uses a dual-font strategy to balance character with utility. 

**Montserrat** is reserved for headings and "Achievement" moments. Its geometric, bold nature reinforces the gaming aesthetic. **Inter** is used for all functional data, expense lists, and micro-copy to ensure maximum readability at small sizes. 

Numerical data representing balances should always use **Medium or Semi-Bold** weights to feel substantial. Use `label-caps` for secondary information like timestamps or category headers to create clear visual hierarchy against primary titles.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous internal padding to allow elements "room to breathe," mimicking the spaciousness of high-end mobile games. 

- **Mobile:** 1-column layout with 20px side margins.
- **Desktop:** 12-column grid with a max-width of 1200px. Content is grouped into logical "Zones" (Quest Log, Wallet, Market).

Spacing follows a 4px baseline, but components primarily utilize `stack-gap` (12px) for vertical relationships and `card-padding` (24px) for internal containment. This creates a "chunky," touch-friendly interface that feels satisfying to interact with.

## Elevation & Depth

Depth is achieved through a combination of **Tonal Layering** and **Luminous Shadows**.

1.  **Base Layer:** Deep Navy background.
2.  **Surface Layer:** Glassmorphic cards with 70% opacity and a 1px inner border (white at 10% opacity) to simulate a glass edge.
3.  **Active Layer:** Floating elements use "Glow Shadows"—shadows that inherit the color of the element (e.g., a Mint Green button has a soft Mint Green shadow) with a high blur radius (20px-30px) and low opacity (30%).

Neumorphic effects are applied sparingly to "Action" buttons to make them appear slightly extruded from the glass surface, inviting a press.

## Shapes

The shape language is ultra-rounded to evoke friendliness and safety. All primary containers (Cards) use a `24px` (2xl) corner radius. This high level of roundedness is essential to the "Apple-smooth" feel.

Interactive elements like buttons use a slightly smaller `16px` radius to maintain a distinct visual identity from the containers they sit within. Avatars and category icons are always nested in circles or "squircle" frames.

## Components

### Buttons
Buttons are high-gloss. Primary buttons use the **Electric Indigo** to **Teal** gradient. They should have a `scale(0.96)` transform on press to provide tactile feedback.

### Cards
"Quest Cards" use the glassmorphic style. They feature a 1px stroke to define their edges against the dark background. Headers within cards should include an emoji icon for instant category recognition (e.g., 🍔 for Food, ⚡ for Utilities).

### Progress Bars
Progress bars are thick (12px height) with fully rounded caps. The background track is a dark semi-transparent navy. The fill uses the **Growth Gradient**. For goals, add a "sparkle" animation to the leading edge of the progress bar.

### Input Fields
Inputs are "Sunken" glass surfaces—using an inner shadow to appear recessed into the card. Focus states are indicated by the 1px border glowing in the primary Indigo color.

### Chips/Tags
Small, pill-shaped indicators with high-contrast backgrounds. Used for "XP Gained" or "Cashback" notifications.

### Gamification Elements
- **Level Badges:** Hexagonal frames with metallic gradients.
- **Streak Counters:** Sunset Orange flame icons with a pulse animation.