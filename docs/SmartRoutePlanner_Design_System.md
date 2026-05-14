# SmartRoutePlanner — Design System

**Purpose:** This document defines the visual language for SmartRoutePlanner. Antigravity must apply these tokens and patterns consistently across every screen. No deviations unless explicitly requested.

**Reference aesthetic:** Light-and-dark hybrid dashboard. Off-white/light-grey canvas with floating dark surface cards. Sharp neon yellow-green (`#CAFF3C`) accent for active states, highlights, and interactive indicators. Heavy, bold display typography for hero metrics paired with small, tight labels. Generously rounded cards and buttons. Clean, data-forward layout with generous whitespace and minimal chrome. Think modern fintech meets academic dashboard.

---

## 1. Visual Direction

| Principle | Meaning |
|---|---|
| **Light canvas, dark cards** | Page background is a soft off-white. Hero and data cards are near-black — creating a strong light/dark contrast that makes data pop. |
| **Neon accent, used sparingly** | `#CAFF3C` (electric yellow-green) is the single accent color. Used only for: active states, selected routes, key metrics, and progress indicators. Never used as a background fill on large areas. |
| **Bold display, small labels** | Hero numbers (distance, time, nodes) are 48–72px, bold. Section labels and captions are 11–12px, uppercase, tracked. Nothing in between feels right — lean into the contrast. |
| **High border-radius everywhere** | Cards: 20–24px radius. Buttons: 14px radius. Pills: fully rounded. The UI should feel soft and approachable, not boxy. |
| **Monochrome base, one accent** | Outside of the neon accent and semantic algorithm colors, the palette is entirely off-whites, near-blacks, and neutral grays. No blue, no red, no purple in the base UI. |
| **Dense but breathable** | Pack meaningful data into cards but give each card generous internal padding (24–32px). Separate card groups with 24–32px gaps. Never let cards touch. |
| **Algorithm colors are semantic, not decorative** | Node and edge states each have a distinct color (see §7). These colors exist only to communicate algorithm state and must not appear anywhere else in the UI. |

---

## 2. Color Tokens

Use these as CSS custom properties. No hardcoded hex values in components.

```css
:root {
  /* Canvas & Surfaces */
  --bg-app:             #F0F0EC;   /* Main page background — warm off-white */
  --bg-card-dark:       #1A1A1A;   /* Primary dark card background */
  --bg-card-mid:        #222222;   /* Secondary dark surface (nested cards, panels) */
  --bg-card-light:      #FFFFFF;   /* Light card (used on dark regions for contrast flip) */
  --bg-input:           #2A2A2A;   /* Input field background (inside dark cards) */
  --bg-sidebar:         #F7F7F3;   /* Left control sidebar — slightly warmer than canvas */

  /* Borders */
  --border-light:       rgba(0, 0, 0, 0.07);   /* On light canvas: card edges */
  --border-dark:        rgba(255, 255, 255, 0.08); /* On dark cards: inner dividers */
  --border-accent:      #CAFF3C;   /* Accent border for active/selected state */

  /* Text — on dark surfaces */
  --text-primary-dark:  #F5F5F0;   /* Main headings on dark cards */
  --text-secondary-dark:#8A8A80;   /* Labels, secondary info on dark cards */
  --text-tertiary-dark: #4A4A44;   /* Placeholder, disabled on dark */

  /* Text — on light surfaces */
  --text-primary-light: #111110;   /* Main headings on light canvas/sidebar */
  --text-secondary-light:#5A5A54;  /* Labels, secondary info on light bg */
  --text-tertiary-light: #9A9A94;  /* Placeholder, disabled on light bg */

  /* Accent */
  --accent:             #CAFF3C;   /* Electric yellow-green — single accent color */
  --accent-dim:         rgba(202, 255, 60, 0.15); /* Soft accent fill for hover states */
  --accent-text:        #111110;   /* Text on accent-colored elements (always dark) */

  /* Algorithm Node States (used ONLY on map canvas) */
  --node-unvisited:     #3A3A3A;   /* Default node color */
  --node-in-queue:      #F59E0B;   /* In priority queue — amber */
  --node-processing:    #FB923C;   /* Currently being expanded — orange */
  --node-finalized:     #6B7280;   /* Fully processed — gray */
  --node-path:          #CAFF3C;   /* On the final optimal path — accent green */
  --node-start:         #22C55E;   /* Start pin — green */
  --node-end:           #EF4444;   /* End pin — red */

  /* Algorithm Edge States (used ONLY on map canvas) */
  --edge-default:       rgba(255, 255, 255, 0.15); /* Default edge color on dark canvas */
  --edge-path:          #CAFF3C;   /* Edge on optimal path */
  --edge-traffic-light: #4ADE80;   /* 1.0x traffic — green tint */
  --edge-traffic-mod:   #FACC15;   /* 1.5x traffic — yellow */
  --edge-traffic-heavy: #F97316;   /* 2.5x traffic — orange */
  --edge-traffic-severe:#EF4444;   /* 3.5x traffic — red */
  --edge-blocked:       #7F1D1D;   /* Closed road — dark red, dashed */
  --edge-alt-path:      rgba(202, 255, 60, 0.4); /* Alternative path — faded accent */

  /* Semantic */
  --success:            #22C55E;
  --success-bg:         rgba(34, 197, 94, 0.12);
  --warning:            #FACC15;
  --warning-bg:         rgba(250, 204, 21, 0.12);
  --danger:             #EF4444;
  --danger-bg:          rgba(239, 68, 68, 0.12);
  --info:               #60A5FA;
  --info-bg:            rgba(96, 165, 250, 0.12);
}
```

**Usage rules:**
- Page `<body>` → `--bg-app`
- Left sidebar/control panel → `--bg-sidebar`
- Data cards, metric panels, algorithm explanation → `--bg-card-dark`
- Nested elements inside dark cards → `--bg-card-mid`
- Input fields (inside dark cards) → `--bg-input`
- Never use `--accent` as a button background for large buttons — use it only for small pills, active indicators, and progress fills.
- Never layer more than 2 card depths in one view.

---

## 3. Typography

**Font families:**
```css
--font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;  /* Headings, hero numbers */
--font-body:    'Inter', system-ui, sans-serif;                   /* Everything else */
--font-mono:    'JetBrains Mono', 'SF Mono', monospace;           /* Coordinates, step counters, metrics */
```

Load from Google Fonts:
- Space Grotesk: `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap`
- Inter: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap`
- JetBrains Mono: `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap`

**Type scale:**

| Token | Size | Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| `text-display-hero` | 64px / 4rem | 1.0 | 700 | -0.03em | Page-level hero numbers (distance, time on result) |
| `text-display-lg` | 48px / 3rem | 1.05 | 700 | -0.025em | Metric card primary values |
| `text-display-md` | 36px / 2.25rem | 1.1 | 700 | -0.02em | Secondary metric values |
| `text-display-sm` | 28px / 1.75rem | 1.15 | 600 | -0.015em | Card main stat values |
| `text-h1` | 24px / 1.5rem | 1.2 | 600 | -0.01em | Page title, panel titles |
| `text-h2` | 20px / 1.25rem | 1.3 | 600 | -0.005em | Section headings |
| `text-h3` | 16px / 1rem | 1.4 | 600 | 0 | Card labels, metric names |
| `text-body-lg` | 15px / 0.9375rem | 1.5 | 400 | 0 | Primary body, explanation panel text |
| `text-body` | 14px / 0.875rem | 1.5 | 400 | 0 | Default body |
| `text-body-sm` | 13px / 0.8125rem | 1.45 | 400 | 0 | Secondary body, tooltips |
| `text-caption` | 12px / 0.75rem | 1.4 | 500 | 0.01em | Captions, timestamps |
| `text-label` | 11px / 0.6875rem | 1.3 | 600 | 0.08em, UPPERCASE | Section labels ("ALGORITHM", "METRICS") |
| `text-micro` | 10px / 0.625rem | 1.2 | 600 | 0.06em, UPPERCASE | Badges, queue item tags |

**Rules:**
- Hero numbers always use `font-display` with `font-variant-numeric: tabular-nums`.
- Step counters, coordinates, node IDs always use `font-mono`.
- Uppercase labels always get letter-spacing. Never uppercase body text.
- Display weights are always 600 or 700 — 400 weight on large numbers looks weak on both light and dark surfaces.

---

## 4. Spacing Scale

4px base. Use only these values.

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
```

**Common applications:**
- Card internal padding: `--space-6` (24px) default, `--space-8` (32px) for hero cards
- Gap between cards: `--space-6` (24px)
- Gap between major UI sections: `--space-8` to `--space-12`
- Button internal padding: `--space-3` vertical × `--space-5` horizontal
- Icon-to-label gap: `--space-2`

---

## 5. Border Radius

```
--radius-sm:    8px      /* Badges, pills, tags */
--radius-md:    14px     /* Buttons, inputs, small cards */
--radius-lg:    20px     /* Default cards */
--radius-xl:    24px     /* Hero cards, map container */
--radius-2xl:   32px     /* Full-bleed panels */
--radius-full:  9999px   /* Status pills, toggle switches, avatars */
```

**Rules:**
- Default card = `--radius-lg` (20px) — this is what gives the UI its soft, friendly feel. Do not reduce.
- Buttons = `--radius-md` (14px)
- Status pills and algorithm state indicators = `--radius-full`
- The map canvas container itself uses `--radius-xl` (24px) with `overflow: hidden` to clip the canvas edges.
- Never mix more than 2 radius sizes in one component.

---

## 6. Shadows & Elevation

Used to separate the light canvas from dark cards and create depth hierarchy.

```css
/* Card on light canvas — primary elevation */
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border-light);

/* Card hover — slight lift */
--shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--border-light);

/* Modal / floating panel */
--shadow-modal: 0 16px 48px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0,0,0,0.06);

/* Accent glow — used on neon elements */
--shadow-accent: 0 0 12px rgba(202, 255, 60, 0.35);

/* Focus ring */
--shadow-focus: 0 0 0 3px rgba(202, 255, 60, 0.5);
```

---

## 7. Algorithm State Colors (Map Canvas Only)

These colors exist solely to communicate algorithm execution state. They must not appear in any non-canvas UI element.

| State | Color | Usage |
|---|---|---|
| Unvisited node | `#3A3A3A` (dark gray circle) | Default state for all nodes |
| In priority queue | `#F59E0B` (amber) | Node is queued but not yet expanded |
| Currently processing | `#FB923C` (orange) | Node being expanded this step — pulse animation |
| Finalized / closed | `#6B7280` (slate gray) | Node fully processed, shortest path confirmed |
| On final path | `#CAFF3C` (accent) | Nodes on the optimal result path |
| Start node | `#22C55E` (green) | Always visible; never changes during algorithm |
| End node | `#EF4444` (red) | Always visible; never changes during algorithm |

**Edge states:**

| State | Visual |
|---|---|
| Default road | Thin `rgba(255,255,255,0.15)` line, 1.5px |
| On optimal path | `#CAFF3C` line, 3px, with subtle glow |
| Light traffic (1.0x) | `#4ADE80` tint overlay on edge |
| Moderate traffic (1.5x) | `#FACC15` |
| Heavy traffic (2.5x) | `#F97316` |
| Severe congestion (3.5x) | `#EF4444` |
| Blocked / closed | `#7F1D1D` dashed line |
| Alternative path | `rgba(202, 255, 60, 0.4)` dashed, thinner |

---

## 8. Components

### 8.1 Dark Metric Card

Used for all data metrics (distance, time, nodes explored, efficiency).

```
background:   --bg-card-dark
border-radius: --radius-lg
padding:       --space-6 to --space-8
border:        1px solid var(--border-dark)
box-shadow:    --shadow-card

Structure:
  [LABEL — text-label, text-secondary-dark, uppercase]
  [VALUE — text-display-md or text-display-lg, text-primary-dark, tabular-nums]
  [SUBTEXT — text-caption, text-secondary-dark]  ← optional delta or unit
```

### 8.2 Primary Button (on light sidebar)

```
background:   --bg-card-dark
color:        --text-primary-dark
border-radius: --radius-md
padding:       12px 20px
font:          text-body, weight 600
hover:         background --bg-card-mid, slight scale(1.02)
active:        scale(0.98)
```

### 8.3 Accent Button (run / play actions)

```
background:   --accent
color:        --accent-text (always dark)
border-radius: --radius-md
padding:       12px 20px
font:          text-body, weight 700
box-shadow:    --shadow-accent on hover
hover:         brightness(1.08)
```

### 8.4 Algorithm Selector Pills

Horizontal row of pill buttons — one per algorithm.

```
Inactive:
  background:   --bg-card-mid
  color:        --text-secondary-dark
  border:       1px solid var(--border-dark)
  border-radius: --radius-full
  padding:      8px 16px
  font:         text-body-sm, weight 500

Active:
  background:   --accent
  color:        --accent-text
  border:       none
  font-weight:  700
```

### 8.5 Slider (Speed, Preference Weights)

```
Track:        --bg-card-mid, height 4px, border-radius full
Fill:         --accent
Thumb:        white circle 16×16px, box-shadow --shadow-card
Label above: text-label, text-secondary-dark
Value right:  text-body-sm, font-mono, text-primary-dark
```

### 8.6 Toggle Switch (Road Closure, Preferences)

```
Off: track --bg-card-mid, knob --text-tertiary-dark
On:  track --accent (at 60% opacity), knob --accent
Transition: 200ms ease
Size: 36px wide × 20px tall
```

### 8.7 Status Pill (traffic levels, algorithm state)

```
border-radius: --radius-full
padding: 4px 10px
font: text-micro, uppercase, tracked

Light Traffic:  bg --success-bg, color --success
Moderate:       bg --warning-bg, color --warning
Heavy:          bg rgba(249,115,22,0.12), color #F97316
Severe:         bg --danger-bg, color --danger
Blocked:        bg rgba(127,29,29,0.2), color #FCA5A5
```

### 8.8 Playback Controls Bar

Sticky horizontal bar, sits between the map canvas and the metrics section.

```
background:   --bg-card-dark
border-radius: --radius-lg
padding:       --space-3 --space-5
layout:        flex, space-between

Left:  [Reset icon] [Step Back icon] [Play/Pause icon] [Step Forward icon]
       — icon buttons, 36×36px touch target, icon 18px
Center: Progress bar (track --bg-card-mid, fill --accent, height 4px)
        Step counter below: "Step 14 / 87" text-caption, font-mono, text-secondary-dark
Right:  Speed toggles: [0.5×] [1×] [2×] [4×] pill buttons
```

Active icon button:
```
background:   --bg-card-mid
border-radius: --radius-sm
```

### 8.9 Explanation Panel Text Block

```
background:   --bg-card-mid
border-left:  3px solid var(--accent)
border-radius: 0 --radius-sm --radius-sm 0
padding:      --space-4 --space-5
font:         text-body, text-secondary-dark

Queue list inside:
  Each item: [rank] [node name] [cost in font-mono]
  Alternating rows: --bg-card-dark / --bg-card-mid
  Max 8 rows visible; overflow-y: scroll
```

---

## 9. Layout

### 9.1 App Shell

```
Left sidebar (control panel):  340px fixed width, --bg-sidebar, border-right 1px var(--border-light)
Right content area:            flex-1, --bg-app, padding --space-6
```

### 9.2 Control Sidebar Contents (top to bottom)

1. App title — "SmartRoutePlanner" in `text-h2`, `font-display`, `text-primary-light`
2. Algorithm selector pills (horizontal row)
3. Start / End node display — two cards showing selected node names with green/red left border
4. Preference sliders (Distance / Time priority, sum to 100%)
5. Avoid toggles (Highways, Tolls) — two rows of label + toggle
6. Divider (1px, `--border-light`)
7. Traffic & Conditions section label
8. Edge selector dropdown + traffic level slider
9. Road closure toggle per selected edge
10. Divider
11. Route History accordion (last 5 routes)

### 9.3 Main Content Area Contents (top to bottom)

1. Metric strip — 4 cards in a row: Total Distance | Estimated Time | Nodes Explored | Efficiency
2. Map canvas card — takes maximum available height (min 480px), `--radius-xl`, dark background (`#111110`)
3. Playback controls bar (below canvas)
4. Algorithm explanation panel (below playback controls)
5. [Alternatives tab — shows after route completes] 3 route alternative cards in a row

### 9.4 Compare Mode Layout

- Canvas area splits horizontally into 2 (or 3) equal panels inside the canvas card
- Each panel has its own algorithm label pill (top-left corner, inside the panel)
- Playback controls remain single, synchronized
- Comparison table card appears below playback controls (replaces explanation panel in this mode):
  ```
  Columns: Algorithm | Distance | Time | Nodes Explored | Efficiency | Winner
  Header row: --bg-card-mid, text-label uppercase
  Data rows: alternating --bg-card-dark / --bg-card-mid
  Winner cell: --accent pill
  ```

---

## 10. Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        app: '#F0F0EC',
        sidebar: '#F7F7F3',
        card: {
          dark: '#1A1A1A',
          mid: '#222222',
          light: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#CAFF3C',
          dim: 'rgba(202,255,60,0.15)',
          text: '#111110',
        },
        node: {
          unvisited: '#3A3A3A',
          queue: '#F59E0B',
          processing: '#FB923C',
          finalized: '#6B7280',
          path: '#CAFF3C',
          start: '#22C55E',
          end: '#EF4444',
        },
        edge: {
          default: 'rgba(255,255,255,0.15)',
          path: '#CAFF3C',
          blocked: '#7F1D1D',
        },
        success: '#22C55E',
        warning: '#FACC15',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'display-hero': ['4rem',    { lineHeight: '1.0',  letterSpacing: '-0.03em',  fontWeight: '700' }],
        'display-lg':   ['3rem',    { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md':   ['2.25rem', { lineHeight: '1.1',  letterSpacing: '-0.02em',  fontWeight: '700' }],
        'display-sm':   ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'label':        ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
        'micro':        ['0.625rem',  { lineHeight: '1.2', letterSpacing: '0.06em', fontWeight: '600' }],
      },
      borderRadius: {
        'lg':  '1.25rem',   // 20px
        'xl':  '1.5rem',    // 24px
        '2xl': '2rem',      // 32px
      },
    },
  },
};
```

---

## 11. Screen-Specific Application

### 11.1 Main Route Planner (Primary Screen)

The only screen. No separate pages — this is a single-page application.

- **Before route selected:** Canvas shows full Bangalore graph with all nodes and edges in default state. Center overlay text: "Click any two nodes to plan your route" in `text-h3 text-secondary-dark`. Playback controls are disabled (grayed out).
- **After start + end selected:** Algorithm selector becomes active. Run button (`--accent` background) appears at bottom of sidebar.
- **During algorithm run:** Metrics cards update in real-time. Explanation panel populates. Playback controls become fully active.
- **After algorithm completes:** Final path highlighted in `--accent`. Metrics show final values. "Alternatives" tab appears below metrics. Route is saved to history.

### 11.2 Metric Strip (4-card row at top of content area)

- Cards use `--bg-card-dark`, `--radius-lg`
- LABEL (text-label, uppercase, `--text-secondary-dark`)
- VALUE (text-display-md, `font-display`, tabular-nums, `--text-primary-dark`) — shows "–" before route runs
- UNIT or DELTA below value in text-caption, `--text-secondary-dark`

Specific cards:
1. **Distance** — value in km, 1 decimal place. Example: `14.2 km`
2. **Time** — value in minutes. Example: `28 min`
3. **Nodes** — `23 / 47` format (explored / total). Sub-label: "EXPLORED"
4. **Efficiency** — `61.4%`. Sub-label: "ALGORITHM EFFICIENCY". Color the percentage: green if >70%, yellow if 40–70%, red if <40%.

### 11.3 Map Canvas Card

```
background:   #111110   (near-black, distinct from --bg-card-dark)
border-radius: --radius-xl
overflow: hidden
border: 1px solid var(--border-light)
```

- Canvas fills the card entirely.
- **Start pin:** Large green circle `--node-start` with "A" label inside in white `text-caption bold`
- **End pin:** Large red circle `--node-end` with "B" label inside
- **Algorithm execution badge:** Top-right corner of canvas — pill showing current algorithm name + running state: "DIJKSTRA · RUNNING" (text-micro, --accent background, --accent-text). Changes to "DIJKSTRA · COMPLETE" on finish.

### 11.4 Alternative Paths (post-route)

Three cards in a horizontal row, each `--bg-card-dark, --radius-lg`:

```
[Icon: clock / ruler / scales]
[TYPE: "FASTEST" / "SHORTEST" / "BALANCED" — text-label, --accent]
[Distance: text-display-sm]
[Time: text-body-lg, --text-secondary-dark]
[Nodes explored: text-caption]
[Active state: border 2px var(--accent), --shadow-accent]
```

Clicking a card highlights that path on the canvas in `--edge-alt-path`.

### 11.5 Route History (sidebar accordion)

```
Header: "RECENT ROUTES" — text-label, --text-secondary-light
Each entry (compact row):
  [Algorithm pill — text-micro]
  [Start → End — text-body-sm, --text-primary-light, truncated]
  [Distance + Time — text-caption, font-mono, --text-secondary-light, right-aligned]

Hover: background --accent-dim
Click: restores start/end state on canvas
Max 5 entries; oldest drops off when 6th is added
```

---

## 12. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use `tabular-nums` on all distance, time, and step number displays | Let metric numbers jitter with proportional figures |
| Apply `--accent` only to active states, progress fills, and result paths | Paint buttons, backgrounds, or large areas neon yellow-green |
| Keep the canvas background distinctly darker than dark cards | Let the canvas blend into surrounding cards |
| Use `--radius-lg` (20px) or larger for all cards | Use sharp corners anywhere in the UI |
| Apply `--shadow-accent` glow only on the active path and accent button hover | Apply glow to multiple UI elements simultaneously |
| Show node state colors on the canvas only — never in sidebar UI | Reuse amber/orange algorithm colors in metric cards or labels |
| Use `font-mono` for all numeric counters, coordinates, and step indicators | Mix proportional and monospace numbers in the same metric card |
| Keep the sidebar clean: only controls visible at each phase | Pre-populate all controls before user has selected a start/end |
| Transition node colors over 200ms | Snap colors instantly — it looks broken during algorithm steps |
| Use Lucide icons, outlined, 18–20px, 1.5–1.75 stroke | Mix filled and outlined icons in the same UI |
| Disable (opacity 40%) and prevent interaction on controls that aren't applicable yet | Show an error when user clicks a disabled control |
| Show loading/running state on the Run button during algorithm execution | Leave the button active during execution (would re-trigger) |

---

## 13. Implementation Checklist for Antigravity

Before shipping any screen or component, verify:

- [ ] Page background is `--bg-app` (off-white), not pure white or gray
- [ ] All metric cards use `--bg-card-dark` with `--radius-lg` and `--shadow-card`
- [ ] Map canvas uses `--radius-xl` with `overflow: hidden` to clip canvas edges
- [ ] All numeric values in metric cards use `font-variant-numeric: tabular-nums`
- [ ] Step counters and coordinates rendered in `font-mono`
- [ ] Algorithm state colors appear ONLY on the map canvas — not in sidebar or metric UI
- [ ] Active algorithm pill uses `--accent` background with `--accent-text` (dark) color
- [ ] All status pills use `--radius-full`
- [ ] Playback controls: Play/Pause icon swaps correctly; disabled state at opacity 40%
- [ ] Preference sliders: two sliders sum to 100%; adjusting one auto-adjusts the other
- [ ] Traffic status pills use the correct semantic color from §7
- [ ] Focus states use `--shadow-focus` (3px accent ring) on all interactive elements
- [ ] Mobile viewport (375px): sidebar collapses to bottom drawer; canvas full-width
- [ ] Touch targets ≥ 44×44px for all buttons and interactive controls
- [ ] No hardcoded hex values in components — CSS variables only
- [ ] No console errors; all animations run at ≥ 60fps

---

**End of design system.** Reference this doc in every Antigravity prompt that builds or modifies UI for SmartRoutePlanner.
