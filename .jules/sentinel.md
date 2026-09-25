## 2026-09-23 - PII Exposure in Error Handling
**Vulnerability:** The `handleFirestoreError` function in `src/firebase.ts` was collecting and stringifying the complete `auth.currentUser` object (including emails, provider information, etc.) and throwing it as an Error, which exposes sensitive PII to the client-side UI and application logs.
**Learning:** This application captures detailed Firebase auth state in error helpers. Throwing stringified objects with internal state violates the principle of "fail securely". Both logs and client-facing error messages must be sanitized.
**Prevention:** Explicitly pick only non-sensitive identifiers (like `userId`) for logging. Always throw static, generic error messages (e.g., "A database operation failed.") to the caller instead of dynamic internal state objects.

## 2026-09-25 - Memory Leak in Custom Rate Limiting
**Vulnerability:** Implementing in-memory rate limiting using a `Map` without a periodic cleanup mechanism introduces a Denial of Service (DoS) vulnerability due to a memory leak, as records for inactive IPs accumulate indefinitely.
**Learning:** In-memory maps tracking user connections or IPs must explicitly clear old state. Over time, malicious or organic traffic can fill the memory causing the server process to crash.
**Prevention:** Always pair in-memory tracking maps (e.g. rate limits) with a TTL/cleanup mechanism (like `setInterval`) to periodically delete expired records, or use established rate-limiting libraries like `express-rate-limit`.
