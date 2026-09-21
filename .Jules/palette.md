## 2024-05-20 - Missing aria-labels on icon-only buttons
**Learning:** Found multiple instances of icon-only buttons lacking `aria-label`s, rendering them inaccessible to screen readers. This seems to be a common pattern in this application where utility buttons (like toggles and close buttons) are implemented using just icons.
**Action:** Ensure that any future icon-only interactive elements added or modified include a descriptive `aria-label`.
