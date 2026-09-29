## 2024-09-22 - Redundant filtering in React component render cycle
**Learning:** WorkflowBuilder's StepConfigPanel was executing an expensive inline `APPS.filter` twice per render. Because it checked both app names and nested `appEvents` on every keystroke within a large predefined apps list, it caused unnecessary CPU spikes on every re-render.
**Action:** Extract expensive list filtering logic into a `useMemo` hook, and calculate `.toLowerCase()` of strings once outside the loop instead of inline on every item.

## 2024-05-18 - Optimize Workflow Event Lookups
**Learning:** React render loops were suffering from repeated O(n) array lookups using `.find()` on `app.triggers` and `app.actions` lists in heavily re-rendered components like `WorkflowBuilder.tsx`.
**Action:** Created an `EVENTS_BY_APP_AND_ID` dictionary in `apps.ts` to map `appId` -> `eventId` -> `AppEvent`, replacing all O(n) array lookups with O(1) property access to significantly reduce CPU cycles during drag-and-drop and state updates.

## $(date +%Y-%m-%d) - Redundant filtering in array mapping
**Learning:** In React components like `Dashboard.tsx`, mapping over an array (e.g., `workflows`) and repeatedly computing the same derived array using `.filter()` (e.g., `workflow.steps.filter(s => s.appId)`) inside the return payload causes redundant O(N) operations per render cycle. This specific pattern was found doing this computation 3-4 times per row.
**Action:** Always extract repeated O(N) filtering inside loops or array mappings into a single scoped variable at the top of the block, preventing duplicate execution and maintaining cleaner code.

## 2026-09-27 - Optimize Inline Filtering Inside render loop
**Learning:** In React components like `WorkflowBuilder.tsx`, `MonitoringView.tsx` and `Dashboard.tsx`, performing expensive `.filter()` and `.toLowerCase()` operations repeatedly inside the render cycle (or even worse, inside an array `.map()`) causes unnecessary performance degradation and re-renders.
**Action:** Extract repetitive list filtering and string transformation logic into `useMemo` hooks prior to rendering, preventing repeated calculation and optimizing CPU cycles.

## 2025-03-09 - Avoid Expensive Mock Data Generation in Render Loop
**Learning:** In `Dashboard.tsx`, calling a computationally expensive mock data generator (`generateMockRuns`) and deriving from it directly in the component body caused it to execute on every render, wasting CPU cycles and potentially causing UI lag.
**Action:** Wrap calls to computationally heavy mock or static generation functions in `useMemo` hooks (e.g., `const recentRuns = useMemo(() => generateMockRuns().slice(0, 5), []);`) to ensure they run only once.
