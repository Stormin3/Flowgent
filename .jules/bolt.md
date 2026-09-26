## 2024-09-22 - Redundant filtering in React component render cycle
**Learning:** WorkflowBuilder's StepConfigPanel was executing an expensive inline `APPS.filter` twice per render. Because it checked both app names and nested `appEvents` on every keystroke within a large predefined apps list, it caused unnecessary CPU spikes on every re-render.
**Action:** Extract expensive list filtering logic into a `useMemo` hook, and calculate `.toLowerCase()` of strings once outside the loop instead of inline on every item.

## 2024-05-18 - Optimize Workflow Event Lookups
**Learning:** React render loops were suffering from repeated O(n) array lookups using `.find()` on `app.triggers` and `app.actions` lists in heavily re-rendered components like `WorkflowBuilder.tsx`.
**Action:** Created an `EVENTS_BY_APP_AND_ID` dictionary in `apps.ts` to map `appId` -> `eventId` -> `AppEvent`, replacing all O(n) array lookups with O(1) property access to significantly reduce CPU cycles during drag-and-drop and state updates.

## $(date +%Y-%m-%d) - Redundant filtering in array mapping
**Learning:** In React components like `Dashboard.tsx`, mapping over an array (e.g., `workflows`) and repeatedly computing the same derived array using `.filter()` (e.g., `workflow.steps.filter(s => s.appId)`) inside the return payload causes redundant O(N) operations per render cycle. This specific pattern was found doing this computation 3-4 times per row.
**Action:** Always extract repeated O(N) filtering inside loops or array mappings into a single scoped variable at the top of the block, preventing duplicate execution and maintaining cleaner code.
