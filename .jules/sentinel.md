## 2026-09-23 - PII Exposure in Error Handling
**Vulnerability:** The `handleFirestoreError` function in `src/firebase.ts` was collecting and stringifying the complete `auth.currentUser` object (including emails, provider information, etc.) and throwing it as an Error, which exposes sensitive PII to the client-side UI and application logs.
**Learning:** This application captures detailed Firebase auth state in error helpers. Throwing stringified objects with internal state violates the principle of "fail securely". Both logs and client-facing error messages must be sanitized.
**Prevention:** Explicitly pick only non-sensitive identifiers (like `userId`) for logging. Always throw static, generic error messages (e.g., "A database operation failed.") to the caller instead of dynamic internal state objects.

## 2026-09-24 - Rate Limiter Memory Leak Prevention
**Vulnerability:** Implementing custom in-memory rate limiting without a cleanup mechanism leads to continuous accumulation of expired IP records, causing memory leaks and a potential DoS vulnerability.
**Learning:** When using stateful data structures like a `Map` to track temporary metrics, they must be periodically flushed of expired data to maintain a bounded memory footprint. This is essential for defense in depth on Node.js backends.
**Prevention:** Always implement a background cleanup process (e.g., `setInterval`) to prune expired entries from in-memory tracking structures, or use established libraries (like `express-rate-limit`) that handle this automatically.
