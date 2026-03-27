# Design System Documentation: The Kinetic Archive

## 1. Overview & Creative North Star
The transit experience is often chaotic and high-friction. This design system seeks to counteract that anxiety through **"The Kinetic Archive"**—a creative north star that blends high-speed utility with editorial calm. 

Instead of a standard "app" feel, we treat real-time data as a curated exhibition. We break the "template" look by utilizing intentional asymmetry—such as oversized arrival times paired with microscopic metadata—and deep tonal layering. This creates a sense of "Information Architecture" where the most critical data (your bus arriving in 2 minutes) feels physically closer to the user than background details.

---

## 2. Colors: Tonal Depth & The No-Line Rule
The palette is rooted in professional stability but injected with high-energy status indicators. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts.
*   **The Logic:** Lines create visual noise. To maintain a premium, editorial feel, separate a card from its background by placing a `surface-container-lowest` (#ffffff) element on a `surface-container-low` (#eff4ff) section.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent layers:
*   **Level 0 (Base):** `surface` (#f8f9ff) – Used for global backgrounds.
*   **Level 1 (Sectioning):** `surface-container` (#e6eeff) – Used to group large content blocks.
*   **Level 2 (Interaction):** `surface-container-highest` (#d5e3fc) – Used for active states or prominent cards.

### The "Glass & Gradient" Rule
To ensure the app feels "fast" and light, use **Glassmorphism** for floating elements (like a bottom sheet or a floating search bar). Use a semi-transparent `surface` color with a `backdrop-blur-md` effect. 
*   **Signature Textures:** For primary CTAs, use a subtle linear gradient from `primary` (#00478d) to `primary_container` (#005eb8) at a 135-degree angle. This adds "soul" and depth that prevents the UI from feeling flat.

---

## 3. Typography: Editorial Authority
We utilize two typefaces to balance function and form: **Manrope** for architectural headlines and **Inter** for high-density data.

*   **Display (Manrope):** Use `display-lg` (3.5rem) for arrival times. The geometric nature of Manrope makes numbers feel like icons.
*   **Headline (Manrope):** `headline-md` (1.75rem) should be used for destination names, providing an authoritative, editorial weight.
*   **Body & Labels (Inter):** All functional data, route numbers, and helper text use Inter. `label-md` (0.75rem) is the workhorse for transit metadata (e.g., "Every 12 mins").

**Hierarchy Tip:** Pair a `display-lg` number with a `label-sm` unit (e.g., "04" in large type, "MINS" in small all-caps) to create a sophisticated, non-traditional data visualization.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. The change in hex value creates a soft "lift" that feels integrated into the OS.
*   **Ambient Shadows:** If an element must float (e.g., a "Locate Me" button), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(13, 28, 46, 0.06)`. Note the use of the `on-surface` color (#0d1c2e) for the shadow tint to keep it natural.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` (#c2c6d4) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Arrival Cards & Lists
*   **Style:** No dividers. Use `spacing.5` (1.1rem) as a vertical gutter between items.
*   **Status Indicators:** Use `secondary` (#006c49) for "On Time" and `tertiary` (#793200) for "Delayed." These should be presented as soft-glow pips or subtle background washes behind the route number.

### Buttons (The "Fast" Interaction)
*   **Primary:** Gradient fill (`primary` to `primary_container`), `rounded-lg` (1rem). Large horizontal padding (`spacing.6`).
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style. `on-primary-fixed-variant` text with no background.

### Real-Time Chips
*   **Selection Chips:** Use `secondary_fixed` (#6ffbbe) with `on_secondary_fixed` (#002113) text. The high-contrast energetic green signals active "Live" tracking.
*   **Rounding:** Always use `rounded-full` for chips to distinguish them from rectangular navigation cards.

### Input Fields
*   **Style:** Minimalist. `surface-container-low` background, `rounded-md`. 
*   **Focus State:** Do not use a heavy border. Use a subtle `primary` (#00478d) glow or a slight shift to `surface-container-high`.

### Bottom Sheets (The Transit Hub)
*   **Surface:** Use `surface-container-lowest` with a `backdrop-blur`. 
*   **Handle:** Use `outline_variant` (#c2c6d4) at 40% opacity, `rounded-full`, width of `spacing.10`.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical spacing. A larger top-padding on a headline creates an "editorial" look.
*   **Do** use `secondary` (green) for all collaborative features (e.g., "3 users reported this bus is crowded").
*   **Do** prioritize legibility in high-glare environments by keeping `on-surface` contrast high against `surface-container` tiers.

### Don't:
*   **Don't** use 1px dividers between list items. Use white space (`spacing.4`) or subtle background shifts.
*   **Don't** use "pure black" for text. Use `on-surface` (#0d1c2e) to maintain a premium tonal range.
*   **Don't** use sharp corners. Everything must use at least `rounded-md` (0.75rem) to maintain the "helpful and friendly" brand personality.