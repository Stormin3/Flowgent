## 2024-09-22 - Redundant filtering in React component render cycle
**Learning:** WorkflowBuilder's StepConfigPanel was executing an expensive inline `APPS.filter` twice per render. Because it checked both app names and nested `appEvents` on every keystroke within a large predefined apps list, it caused unnecessary CPU spikes on every re-render.
**Action:** Extract expensive list filtering logic into a `useMemo` hook, and calculate `.toLowerCase()` of strings once outside the loop instead of inline on every item.
