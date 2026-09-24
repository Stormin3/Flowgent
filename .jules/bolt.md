## 2024-09-22 - Redundant filtering in React component render cycle
**Learning:** WorkflowBuilder's StepConfigPanel was executing an expensive inline `APPS.filter` twice per render. Because it checked both app names and nested `appEvents` on every keystroke within a large predefined apps list, it caused unnecessary CPU spikes on every re-render.
**Action:** Extract expensive list filtering logic into a `useMemo` hook, and calculate `.toLowerCase()` of strings once outside the loop instead of inline on every item.

## 2024-10-23 - Redundant O(N) event lookup in WorkflowBuilder and WorkflowGraph
**Learning:** React re-renders were slowing down significantly due to O(N) array `.find` lookups for `app.triggers.find()` and `app.actions.find()` when searching for matching events in large application configs.
**Action:** Use a pre-computed O(1) hash map `EVENTS_BY_APP_AND_ID` to find app events instead of iterating over triggers/actions array in render cycle.
