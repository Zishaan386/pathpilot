# SKILL: Build SmartRoutePlanner

**Trigger this skill when:** the user asks to build, extend, or modify SmartRoutePlanner — the AI-powered route visualization and pathfinding algorithm demonstration tool.

**Do NOT trigger this skill for:** generic React/graph tasks unrelated to SmartRoutePlanner, or for other navigation/mapping projects.

---

## 0. How to Use This Skill

You are building SmartRoutePlanner inside Antigravity. Two source-of-truth documents govern this build:

1. **`SmartRoutePlanner_Spec_Sheet.md`** — defines *what* to build: features, algorithms, data structures, acceptance criteria. This is the **product spec**.
2. **`SmartRoutePlanner_Design_System.md`** — defines *how it looks*: tokens, components, screen-level application. This is the **visual spec**.

This skill defines the *build process* — the order, checkpoints, prompting discipline, and anti-patterns. When these three documents conflict, spec > design system > skill. Flag the conflict to the user before proceeding.

**Operating principles:**
- **Build in phases, never all at once.** Each phase has a validation gate. Do not start phase N+1 until phase N's gate passes.
- **Every prompt includes the relevant excerpt from the spec + design system.** Do not rely on memory of "what we discussed."
- **Build the graph engine before the UI.** The data model and algorithm logic are ground truth. UI that predates its engine is throwaway work.
- **The comparison mode (F6) is built last.** It depends on all four algorithms working independently, stable playback controls, and a reliable metrics layer. Do not attempt it early.
- **Algorithm correctness over visual polish.** A beautiful broken pathfinder is worse than an ugly correct one. Validate outputs against manual calculations on small test graphs before wiring up animation.
- **No hardcoded routes, no fake metrics.** Every path displayed must come from a live algorithm run so results are reproducible and accurate.
- **No authentication, no backend.** This is a client-side-only demo. All computation runs in the browser. Spec §8 is explicit on this — do not introduce a server or login flow.

---

## 1. The Six Phases

| # | Phase | Gate Before Advancing |
|---|---|---|
| P0 | Foundation — scaffold, tokens, canvas setup | App runs; map canvas renders; design tokens visible on a test page |
| P1 | Graph Engine — data model, graph loader, city data | Bangalore graph loads; nodes and edges render on canvas; click sets start/end |
| P2 | Algorithm Core — all 4 algorithms implemented and validated | Each algorithm finds correct path on a 5-node test graph; metrics are accurate |
| P3 | Visualization Layer — step-by-step animation, playback controls, node state colors | Play/Pause/Step/Reset work; speed slider adjusts rate; legend is correct |
| P4 | Conditions & Metrics — traffic simulation, road closures, metrics dashboard, explanation panel | Adding traffic updates edge weights; closure removes edge; re-route triggers correctly |
| P5 | Advanced Features — comparison mode, preferences, path alternatives, route history | Side-by-side view works; preferences affect calculation; 3 alternatives displayed |
| P6 | Polish & Acceptance — mobile, edge cases, full acceptance sweep | All 22 acceptance criteria pass; no console errors; animations are smooth |

Skipping phases causes rework. Do not skip.

---

## 2. Phase 0 — Foundation

**Preconditions:** Antigravity project opened.

### Actions

1. **Initialize React + Vite + Tailwind CSS project.** Name it `smartrouteplanner`.
2. **Install dependencies:**
   ```
   react-router-dom, lucide-react, d3 (or custom canvas renderer)
   ```
   Note: No backend libraries needed. All logic is client-side.
3. **Paste the Tailwind config from Design System §10** into `tailwind.config.js`. Do not modify color or font values.
4. **Load Inter + Space Grotesk** in `index.html` via Google Fonts link.
5. **Apply base styles** in `src/index.css`:
   ```css
   body {
     background: var(--bg-app);
     color: var(--text-primary);
     font-family: var(--font-body);
   }
   ```
6. **Create the app shell** — two-panel layout: left sidebar (controls) + right main canvas. Sidebar: 340px fixed. Canvas: fills remaining width.
7. **Build a throwaway test page** at `/dev-tokens` that renders: one node circle (unvisited, visiting, visited, finalized states), one edge line (default, traffic, blocked), one metric card, one status pill. Confirm they match the design system visually.

### Gate
- App runs on `npm run dev` without errors.
- Two-panel shell renders. Left panel is visually distinct from the canvas area.
- `/dev-tokens` renders all four node states and three edge states matching the Design System color spec.
- No hardcoded hex values anywhere in components — only CSS variables.

### Common Failures
- `d3` not responding to React state updates → use a single `useEffect` with the canvas ref; re-draw on every relevant state change.
- Tailwind classes not applying → check `content` paths in `tailwind.config.js`.
- Canvas sizing off on window resize → listen to `ResizeObserver` and recompute canvas dimensions.

---

## 3. Phase 1 — Graph Engine

**Preconditions:** P0 gate passed.

### Actions

1. **Define the graph data structures** in `src/lib/graph.js`:
   ```javascript
   // Node: { id, name, coordinates: {lat, lng}, type, x, y }
   // Edge: { id, from, to, distance, baseTime, roadType, tollRoad, currentTime, trafficMultiplier, blocked }
   // x, y are computed screen coordinates projected from lat/lng
   ```

2. **Build the graph loader** in `src/lib/graphLoader.js`:
   - Import the Bangalore JSON from `src/data/bangalore.json`
   - Project lat/lng to canvas pixel coordinates using a linear scale:
     ```javascript
     x = (lng - minLng) / (maxLng - minLng) * canvasWidth
     y = (maxLat - lat) / (maxLat - minLat) * canvasHeight
     ```
   - Return a `Graph` object with: `nodes` Map, `edges` Map, `adjacency` Map (node_id → array of edge_ids)

3. **Load the Bangalore city graph** from the spec §7.1. Build the full dataset as `src/data/bangalore.json` using the sample structure. Minimum viable graph: **25 nodes, 60 edges** covering Bangalore landmarks (MG Road, Indiranagar, Whitefield, Koramangala, Electronic City, Hebbal, Marathahalli, BTM Layout, Jayanagar, HSR Layout, and 15+ more).

4. **Build the canvas renderer** in `src/components/MapCanvas.jsx`:
   - Draw edges first (below nodes). Edge color from design system: default, traffic, blocked states.
   - Draw nodes on top. Node color from design system: unvisited, in-queue, processing, finalized, path states.
   - Draw node labels (name) in `font-body` 11px, only when zoom > threshold or on hover.
   - On click: if no start set → set start (green pin); if start set but no end → set end (red pin); if both set → do nothing (user must reset).

5. **Build the `GraphService`** in `src/lib/graphService.js`:
   - `getNeighbors(nodeId)` → returns array of `{ node, edge }` for all non-blocked edges from nodeId
   - `getEdgeWeight(edge, preference)` → computes cost based on preference weighting (distance vs. time)
   - `getHeuristic(nodeId, goalId)` → Euclidean distance on projected (x, y) coordinates
   - `updateTraffic(edgeId, multiplier)` → updates `currentTime` and `trafficMultiplier` on edge
   - `blockEdge(edgeId)` → sets `blocked = true`, redraws edge as dashed/red
   - `resetEdge(edgeId)` → restores `blocked = false` and original `trafficMultiplier`

### Gate
- Bangalore graph loads and renders. All 25+ nodes visible as circles, all 60+ edges visible as lines.
- Clicking an empty node sets start. Clicking another sets end. Both are highlighted distinctly.
- `graphService.getNeighbors()` returns correct adjacency for a manually verified node (test in browser console).
- Heuristic function returns 0 when called with the same nodeId twice.

### Common Failures
- Lat/lng projection inverting Y axis → latitude increases upward on Earth but downward in screen space; subtract from `maxLat`, not `minLat`.
- Adjacency map not bidirectional for undirected edges → during load, add both `from→to` and `to→from` entries for each edge.
- Node clicks not registering → canvas click handler must check distance from click point to each node center; use a hit-radius of 12–16px.

---

## 4. Phase 2 — Algorithm Core

**Preconditions:** P1 gate passed. `GraphService` is available.

Build all four algorithms in `src/lib/algorithms/`. Each algorithm returns a **step-by-step trace** (array of snapshots), not a direct result. The visualization layer will play back the trace.

### Snapshot structure (all algorithms):
```javascript
{
  step: Number,
  visitedNodes: Set<nodeId>,        // nodes fully processed
  queueNodes: Set<nodeId>,          // nodes currently in priority queue
  currentNode: nodeId,              // node being expanded this step
  finalPath: Array<nodeId> | null,  // populated only on completion
  metrics: {
    nodesExplored: Number,
    queueSize: Number,
    currentCost: Number,
    pathFound: Boolean
  },
  explanation: String               // human-readable: "Visiting Indiranagar (cost: 4.2km) because it has the lowest priority queue value"
}
```

### 4.1 Dijkstra's Algorithm (`src/lib/algorithms/dijkstra.js`)

```
function dijkstra(graph, startId, endId, preference):
  dist = Map: all nodes → Infinity, start → 0
  prev = Map: all nodes → null
  pq = MinHeap: [(0, startId)]
  visited = Set
  snapshots = []

  while pq not empty:
    (cost, current) = pq.pop()
    if current in visited: continue
    visited.add(current)
    record snapshot

    if current === endId:
      reconstruct path via prev
      record final snapshot with path
      break

    for each neighbor, edge of graph.getNeighbors(current):
      newCost = cost + getEdgeWeight(edge, preference)
      if newCost < dist[neighbor]:
        dist[neighbor] = newCost
        prev[neighbor] = current
        pq.push((newCost, neighbor))

  return snapshots
```

**Validation:** On a 5-node test graph (manually computed), Dijkstra must return the provably shortest path. Run this validation in a test file before connecting to the UI.

### 4.2 A* Heuristic Search (`src/lib/algorithms/astar.js`)

Same as Dijkstra but priority = `g(n) + h(n)`:
- `g(n)` = actual cost from start to n
- `h(n)` = `graphService.getHeuristic(n, endId)` (Euclidean on projected coords)

The snapshot must additionally include:
```javascript
heuristicValues: Map<nodeId, Number>  // h(n) for each visible node
```

**Validation:** On the same 5-node test graph, A* must find the same path as Dijkstra but with fewer or equal nodes explored.

### 4.3 Greedy Best-First (`src/lib/algorithms/greedy.js`)

Priority = `h(n)` only. Ignores `g(n)`. Otherwise structurally identical to A*.

**Validation:** On a graph where the greedy path is provably suboptimal (e.g., a detour that looks closer by heuristic), Greedy must take it and produce a longer path than Dijkstra/A*.

### 4.4 Binary Search on Routes (`src/lib/algorithms/binarySearch.js`)

This algorithm is different — not a graph traversal. It works on pre-generated candidate routes:

```
function binarySearchRoute(graph, startId, endId, preference, budget):
  candidates = generateCandidateRoutes(graph, startId, endId, N=16)
               // Use DFS/BFS to find N distinct paths, sorted by composite score
  sort candidates by compositeScore(distance, time, preference)
  
  lo = 0, hi = candidates.length - 1
  best = null
  snapshots = []

  while lo <= hi:
    mid = floor((lo + hi) / 2)
    record snapshot with searchSpace: [lo, hi], checking: mid
    
    if candidates[mid].cost <= budget:
      best = candidates[mid]
      hi = mid - 1   // try to find better (cheaper)
    else:
      lo = mid + 1   // need cheaper route

  record final snapshot with selected route highlighted
  return snapshots
```

The snapshot must include:
```javascript
candidateRoutes: Array,   // all N candidate paths, faded
searchSpace: [lo, hi],    // current search window
checkingIndex: Number,    // mid index being evaluated this step
selectedRoute: Array | null
```

**Validation:** On N=8 candidate routes with known costs, binary search must find the correct route in ≤ 3 comparisons.

### Gate
- Each algorithm function produces a valid snapshots array on a test call.
- Dijkstra and A* produce identical final paths on the same test graph.
- A* explores fewer nodes than Dijkstra on a test graph with 20+ nodes.
- Greedy produces a valid (not necessarily optimal) path.
- Binary search halves search space correctly at each step.
- No algorithm throws on disconnected graphs — they return an empty path with `pathFound: false`.

### Common Failures
- MinHeap not available in browser → implement a simple binary heap or use a sorted array with `Array.sort()` for small graphs (acceptable for demo performance).
- A* heuristic inflated → if `h(n)` overestimates, A* is no longer guaranteed optimal. Euclidean on projected coords must be scaled to match the same units as `g(n)`.
- Greedy entering infinite loops → track `visited` set and skip nodes already expanded.
- Binary search on empty candidates array → guard with `if (candidates.length === 0) return emptyResult`.

---

## 5. Phase 3 — Visualization Layer

**Preconditions:** P2 gate passed. All four algorithms produce correct snapshots.

### Actions

1. **Build the Algorithm Runner** in `src/lib/algorithmRunner.js`:
   - `run(algorithm, graph, startId, endId, preference)` → returns snapshots array
   - `play()` → sets an interval that advances `currentStep` at `baseInterval / speedMultiplier`
   - `pause()` → clears the interval
   - `stepForward()` → increments `currentStep` by 1
   - `reset()` → sets `currentStep = 0`, clears visited state
   - `setSpeed(multiplier)` → accepts 0.5, 1, 2, 4

2. **Wire the MapCanvas to the current snapshot:**
   - On each step change, read `currentSnapshot = snapshots[currentStep]`
   - Apply node color from Design System based on node membership: `visitedNodes` (finalized), `queueNodes` (in queue), `currentNode` (processing), path nodes (highlighted)
   - Apply edge color: default, traffic-congested, blocked, or on-path

3. **Build the Playback Controls** (`src/components/PlaybackControls.jsx`):
   - Row of buttons: Reset | Step Back | Play/Pause | Step Forward
   - Speed toggle: 0.5x | 1x | 2x | 4x (pill-style toggle buttons)
   - Step counter: "Step 14 / 87" in `font-mono`
   - Progress bar: fill proportional to `currentStep / totalSteps`

4. **Build the Visual Legend** (`src/components/MapLegend.jsx`):
   - Shows all node states with their colors and labels
   - Shows edge types (default, in-path, traffic, blocked)
   - Always visible, bottom-left of canvas

5. **Node tooltip on hover:**
   - Shows: node name, coordinates, type
   - For A*: also shows `g(n)` and `h(n)` values at the current step
   - 200ms delay before showing, instant hide on mouse-leave

### Gate
- Play auto-advances through all steps and stops at the last snapshot.
- Pause halts animation at the exact current step.
- Step Forward advances exactly 1 step.
- Reset returns to step 0 with all nodes unvisited.
- Speed at 4x is visually noticeably faster than 1x (no lag).
- Node tooltip appears and shows correct data.
- Legend is legible and matches actual node colors on canvas.

### Common Failures
- `setInterval` drift → use `Date.now()` timestamps and dynamic interval adjustment instead of fixed `setInterval`.
- Canvas not re-rendering on step change → ensure the `useEffect` dependency array includes `currentStep`.
- Playback blocking UI thread for large graphs → if step computation is slow, pre-compute all snapshots in P2 (which is already the design).

---

## 6. Phase 4 — Conditions & Metrics

**Preconditions:** P3 gate passed.

### Actions

1. **Build the Traffic Panel** (`src/components/TrafficPanel.jsx`):
   - Edge list: searchable, shows road name + current traffic multiplier
   - On edge select: slider appears — Light (1.0x), Moderate (1.5x), Heavy (2.5x), Severe (3.5x)
   - On change: call `graphService.updateTraffic(edgeId, multiplier)`, update edge color on canvas immediately, trigger re-route if a route is currently displayed
   - Road Closure toggle: on/off switch per edge. On: calls `graphService.blockEdge(edgeId)`, edge dashes out in blocked color

2. **Re-routing logic:**
   - When conditions change while a completed route is displayed: show a "Conditions changed — Recalculate?" banner
   - On confirm: re-run the current algorithm from scratch, animate the new path, show a ghost of the old path in faded color for 3 seconds

3. **Build the Metrics Dashboard** (`src/components/MetricsDashboard.jsx`):
   - Cards (real-time, updating each step):
     - **Total Distance** — final path distance in km (shows "–" while running, populates on completion)
     - **Estimated Time** — final path time in minutes (accounts for current traffic multipliers on all path edges)
     - **Nodes Explored** — current count + % of total graph nodes
     - **Algorithm Efficiency** — `nodesOnPath / nodesExplored * 100%` (higher = more efficient)
     - **Current Step** — `step N of M`
     - **Queue Size** — current priority queue size (Dijkstra/A* only; "N/A" for Greedy/Binary)

4. **Build the Algorithm Explanation Panel** (`src/components/ExplanationPanel.jsx`):
   - Displays `currentSnapshot.explanation` string in `text-body` size
   - Shows the current priority queue as an ordered list (node name + cost), max 8 entries visible, scrollable
   - Shows a plain-English summary of what the algorithm just did: "Added Marathahalli to queue with cost 11.2km (via Whitefield). New shortest known path to Marathahalli."
   - Toggle: "Simple" vs. "Technical" explanation depth

### Gate
- Adding heavy traffic to an edge → edge turns orange immediately, re-route prompt appears, new route avoids or de-prioritizes that edge.
- Blocking an edge → edge disappears (dashed), re-route finds path without it. If no alternate path exists, shows "No route available" state.
- All 6 metric cards update correctly in real-time during playback.
- Algorithm efficiency metric is higher for A* than for Dijkstra on the same graph (A* is more efficient).
- Explanation panel text changes with each step and is contextually accurate.

### Common Failures
- Re-route running on every traffic slider drag (too expensive) → debounce by 500ms or wait for slider `onMouseUp`.
- Queue visualization showing stale data → re-read `currentSnapshot.queueNodes` at each step render, don't cache.
- Efficiency metric divide-by-zero when `nodesExplored = 0` → guard: `nodesExplored === 0 ? '–' : (pathNodes / nodesExplored * 100).toFixed(1) + '%'`.

---

## 7. Phase 5 — Advanced Features

**Preconditions:** P4 gate passed.

### 7.1 Multi-Algorithm Comparison Mode (F6)

- Toggle: "Single" / "Compare" mode button in header.
- In Compare mode: canvas splits into 2 panels (or 3 if user selects 3 algorithms). Each panel has its own independent MapCanvas showing the same graph.
- Playback controls are **synchronized** — one Play button steps all panels simultaneously.
- Below the canvases: a comparison table with columns per algorithm and rows: Path Distance (km) | Time (min) | Nodes Explored | Efficiency % | Winner indicator (✓ for best in each metric).
- Algorithm selector becomes a multi-select (max 3 checkboxes).

### 7.2 User Preference Weighting (F8)

- Two sliders in the left panel: "Distance Priority" (0–100%) and "Time Priority" (0–100%). They are linked: adjusting one auto-adjusts the other so they sum to 100%.
- Two toggles: "Avoid Highways" | "Avoid Tolls" (boolean).
- On preference change: if a route is displayed, show "Preferences changed — Recalculate?" prompt (same re-route pattern as traffic).
- The preference weights are passed to `graphService.getEdgeWeight(edge, preference)` which blends distance and currentTime by the ratio.

### 7.3 Path Alternatives (F9)

- After any algorithm completes: show a "Alternatives" tab below the main metrics.
- Display 3 cards: **Fastest** (minimize time), **Shortest** (minimize distance), **Balanced** (50/50 blend). Each card shows: route distance, route time, nodes explored.
- On card click: highlight that alternative path on the canvas in a distinct secondary color.
- The 3 alternatives are computed by running Dijkstra three times with different preference weights.

### 7.4 Route History (F10 / Acceptance Criterion 20)

- After each completed route: save to `localStorage` as `smartroute_history`.
- Each history entry: `{ timestamp, algorithm, startName, endName, distance, time, nodesExplored }`.
- Show last 5 entries in a collapsible "History" section at the bottom of the left sidebar.
- Clicking a history entry: re-populates the start/end pins and algorithm selector (does not auto-run).

### Gate
- Compare mode renders 2 algorithm panels side-by-side without layout breaking.
- Synchronized play steps both panels together.
- Comparison table shows correct values and correctly identifies the winner for each metric.
- Preference sliders correctly cause route to change (test: set 100% time priority vs 100% distance priority on a graph where fastest ≠ shortest route).
- 3 path alternatives all display with distinct colors; clicking each highlights correctly.
- After 3 route runs, history shows 3 entries. Clicking an entry restores start/end state.

---

## 8. Phase 6 — Polish & Acceptance

**Preconditions:** P5 gate passed.

### Actions

1. **Walk through all 22 acceptance criteria in Spec §6.** Check each one off. Any failure = go back and fix.

2. **Mobile layout at 768px and 375px:**
   - Left sidebar collapses into a bottom drawer (swipe up to expand).
   - Canvas takes full width.
   - Playback controls pin to bottom of screen above the drawer handle.
   - Metrics dashboard becomes a horizontally scrollable card strip above the canvas.
   - Touch targets ≥ 44×44px for all interactive elements.

3. **Empty states on every failure case:**
   - No start/end selected → canvas shows "Click two nodes to set your route" overlay text.
   - No path exists (disconnected nodes) → "No route available between these locations" state (spec §8, AC 22).
   - Binary search finds no route within budget → "No route matches your preferences" state.

4. **Animation quality:**
   - All node color transitions use CSS transitions (200ms ease), not instant repaints.
   - Edge color changes animate smoothly.
   - No jank during playback at 1x or 2x speed. If performance degrades at 4x on large graphs, cap animation update rate at 60fps using `requestAnimationFrame`.

5. **Error boundaries:**
   - Wrap algorithm runner in try/catch. Surface failures as: "Algorithm error — try resetting the route" (log real error to console).
   - Never show a raw JS error to the user.

6. **Console clean:** zero errors, zero warnings, no React key warnings, no unhandled promise rejections.

### Final Gate — Ship Readiness Checklist

- [ ] All 22 acceptance criteria from Spec §6 verified
- [ ] Design system checklist from Design System §12 all checked
- [ ] Bangalore graph loads with 25+ nodes and 60+ edges
- [ ] All 4 algorithms produce correct results on a known test graph
- [ ] Dijkstra and A* find the same path; A* explores fewer nodes
- [ ] Traffic conditions correctly alter edge weights and trigger re-routing
- [ ] Road closure removes edge from graph and forces detour
- [ ] Comparison mode works with 2 algorithms; metrics table is accurate
- [ ] Route history persists to localStorage and restores state on click
- [ ] Works on 375px viewport without horizontal scroll
- [ ] No console errors in production build

---

## 9. Prompting Discipline (for the User When Talking to You)

**Good prompt:**
> "Build Phase 3 — Visualization Layer. Wire the Dijkstra snapshots to the MapCanvas. Follow Spec §2.2.1 (Dijkstra visualization) and Design System §8 (node state colors). Don't build the traffic panel yet."

**Bad prompt:**
> "Make the algorithm run and show on the map."

→ Respond by asking which phase, which algorithm, and point them at this skill file.

**When user says "just make it work":**
- Do not skip phases.
- Do not skip the graph engine → algorithm → visualization order.
- If you must cut scope, cut features (e.g., skip Binary Search for now), not correctness layers (e.g., never skip algorithm validation to get the animation running faster).

---

## 10. Anti-Patterns (Do NOT Do These)

| Anti-pattern | Why it's wrong | What to do instead |
|---|---|---|
| Building the UI before the algorithm engine | Animation with no correct algorithm is just a demo lie | Graph engine + algorithm correctness first, always |
| Using `Math.random()` to simulate algorithm steps | Produces unreproducible, incorrect visualizations | Run the real algorithm, record real snapshots |
| Hardcoded hex colors in components (`#10B981`, `#fff`) | Breaks the design system | Use CSS variables / Tailwind tokens from Design System |
| Mutating graph edges directly during animation | Corrupts the graph state for re-runs | Clone edge data into snapshot; only mutate on explicit user action |
| Using `setInterval` without cleanup | Causes playback to continue after component unmount, produces bugs | Always clear interval in `useEffect` cleanup |
| Skipping algorithm validation before wiring to canvas | You won't know if the bug is in the algorithm or the renderer | Validate algorithm output in isolation first |
| Calling the algorithm on every render | Catastrophically slow | Run algorithm once on user trigger, store snapshots in state |
| Implementing Binary Search as a graph traversal | It's fundamentally a sorted-list search; misrepresenting it is educationally wrong | Pre-generate candidates, sort, then binary search |
| Adding a backend or auth system | Spec §8 explicitly excludes this | All computation stays client-side |
| Showing tooltip lat/lng coordinates as "position" to users | Confusing for non-technical users | Show human-readable node name and type only in tooltip |
| Letting comparison mode desync | Defeats the purpose of comparison | Single clock advances all panels |
| Using `<form onSubmit>` in a Claude artifact preview | Breaks in the artifact sandbox | Use `onClick` on the submit button |

---

## 11. Debugging Playbook

| Symptom | Likely cause | Fix |
|---|---|---|
| A* explores more nodes than Dijkstra | Heuristic scale mismatch — h(n) in pixels but g(n) in km | Normalize: convert projected-pixel heuristic to km using the same scale factor as edges |
| Greedy enters infinite loop | Missing visited set | Add `if (visited.has(current)) continue` at top of loop |
| Animation freezes after a few steps | `setInterval` callback taking longer than interval duration | Reduce default speed or pre-compute snapshots in a Web Worker |
| Path not highlighted after algorithm completes | `finalPath` not populated in last snapshot | Ensure `reconstructPath(prev, endId)` runs and is attached to the last snapshot |
| Road closure doesn't prevent routing | `getNeighbors` not filtering blocked edges | Add `if (edge.blocked) continue` in neighbor iteration |
| Traffic changes don't affect re-routed path | Old snapshots cached, not recomputed | On any condition change, invalidate `snapshots` state and require explicit user trigger to re-run |
| Binary search selects wrong route | Candidates not sorted before binary search | Assert sort order in unit test: `candidates[i].cost <= candidates[i+1].cost` for all i |
| Canvas nodes misaligned with actual map position | Lat/lng min/max computed incorrectly | Use only the loaded graph's node coordinates for scale bounds, not global lat/lng extremes |
| Comparison table shows same values for both algorithms | Both panels pointing to same snapshot reference | Deep-clone snapshot arrays when forking for comparison mode |
| Mobile layout breaks | Fixed sidebar width not collapsing | Replace `width: 340px` with responsive class: `w-full md:w-[340px]` |

---

## 12. What Success Looks Like

At the end of Phase 6, any user can:

1. Open SmartRoutePlanner → click MG Road and Electronic City on the Bangalore map → select Dijkstra → press Play → watch the algorithm fan out across the graph and converge on the optimal route.
2. Switch to A* → Run → observe fewer nodes explored, identical path — understand the efficiency gain visually.
3. Switch to Greedy → Run → observe a faster but potentially suboptimal path — understand the trade-off.
4. Add heavy traffic to Hosur Road → watch the edge turn orange → press Recalculate → see the algorithm reroute away from congestion.
5. Enable Compare mode with Dijkstra vs. A* → press Play → watch both run simultaneously → read the comparison table and immediately see which won and why.

If a CS professor can use this in a lecture to demonstrate all four algorithms in real-time, and a student can use it to study for a pathfinding exam — the skill succeeded.

---

**End of skill.** Load alongside `SmartRoutePlanner_Spec_Sheet.md` and `SmartRoutePlanner_Design_System.md` in every Antigravity session that touches this codebase.
