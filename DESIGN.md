# Design Brief

## Direction

Bazaar Fresh — a market-stall green marketplace where product photography is the hero and prices read at a glance in harsh daylight.

## Tone

Clean, appetizing, trustworthy consumer commerce — confident produce-green brand with a saffron deal accent; restrained chrome so pack shots dominate.

## Differentiation

Every product tile sits in a warm "product well" with a large 1:1 image, a saffron discount ribbon, and a price stack (bold price + struck original + green savings) that makes the deal legible in one glance.

## Color Palette

| Token      | OKLCH           | Role                                    |
| ---------- | --------------- | --------------------------------------- |
| background | 0.985 0.004 150 | Warm-white app canvas                   |
| foreground | 0.185 0.028 158 | Near-black green ink, AA+ on canvas      |
| card       | 1 0 0           | Pure-white product cards / sticky bars   |
| primary    | 0.52 0.13 158   | Brand green — CTAs, active nav, add btn  |
| accent     | 0.78 0.155 72   | Saffron — deals, discount badges, promo  |
| muted      | 0.955 0.014 150 | Section bands, chips, input fills        |
| well       | 0.965 0.012 120 | Product image well behind pack shots     |
| discount   | 0.55 0.21 27    | Red discount badge / strike-through cue  |
| savings    | 0.52 0.14 156   | Green "You save ₹X" success text         |
| stock      | in 0.55 0.15 156 / low 0.72 0.15 70 / out 0.6 0.016 158 | Stock state dots & out-of-stock veil |

## Typography

- Display: Plus Jakarta Sans — headings, prices, nav labels, brand wordmark
- Body: Figtree — product names, descriptions, UI copy, form labels
- Mono: JetBrains Mono — order IDs, coupon codes, quantities
- Scale: hero `text-3xl font-bold tracking-tight`, section `text-lg font-bold`, label `text-xs font-semibold uppercase tracking-wider`, body `text-sm`, price `text-base font-bold tabular-nums`

## Elevation & Depth

Flat warm canvas with pure-white cards lifted by `shadow-subtle`; sticky header and bottom nav are opaque white with directional borders; only the active deal banner and cart sheet use `shadow-elevated`.

## Structural Zones

| Zone         | Background            | Border             | Notes                                                          |
| ------------ | --------------------- | ------------------ | -------------------------------------------------------------- |
| Header       | `bg-card` + `shadow-subtle` | `border-b`   | Sticky: address selector, cart icon, search bar                |
| Search bar   | `bg-muted` pill       | `border-border`    | Sticky under header, `rounded-full`, 44px touch target        |
| Content      | `bg-background`       | —                  | Alternate sections on `bg-muted/40`; category rails scroll-x   |
| Product card | `bg-card`             | `border-border`    | Image well `bg-well`, 1:1 ratio, `rounded-xl`, `shadow-subtle` |
| Bottom nav   | `bg-card` + `shadow-nav-top` | `border-t`  | 5 tabs, active tab `text-primary` + filled icon, `pb-safe`     |

## Spacing & Rhythm

4px base unit; page gutters `px-4`, section gaps `space-y-6`, card grids `gap-3`, in-card padding `p-2.5`; tight 2px/6px micro-gaps bind price stack and image caption as one unit.

## Component Patterns

- Buttons: primary = solid `bg-primary` `rounded-full` h-10 with `hover:bg-primary/90`; ghost/secondary = `border-border` outline; add-to-cart = compact `rounded-lg` primary with quantity stepper swap
- Cards: `rounded-xl` white surface, `border-border`, `shadow-subtle`, hover `shadow-card-hover` + `scale-[1.01]`
- Badges: discount = saffron or red `rounded-md` pill, `text-[10px] font-bold uppercase`; stock = dot + label; savings = green inline text

## Motion

- Entrance: product grid `animate-fade-up` staggered 40ms; cart sheet `animate-slide-in-right`
- Hover: cards lift via `shadow-card-hover` + `scale-[1.01]` in 220ms; buttons darken 150ms
- Decorative: add-to-cart `animate-badge-pop`; skeleton loaders `animate-shimmer`; low-stock dot `animate-pulse-soft`

## Constraints

- Mobile-first only: design 360–430px; desktop is a centered max-w-md column, never a wide dashboard
- Product imagery is the hero — never shrink the image well below 1:1 or cover it with chrome
- Token-only styling: no raw hex, no arbitrary color classes, no inline colors
- Bottom nav always visible on shopping routes; sticky search stays reachable one-handed
- Light mode is primary; dark mode mirrors tokens for evening browsing

## Signature Detail

The "price stack" — bold price, struck-through original, and a green savings chip stacked in 2px rhythm inside every card, with a saffron discount ribbon clipped to the image corner; it makes value comparison instant and is the app's recognizable commerce signature.
