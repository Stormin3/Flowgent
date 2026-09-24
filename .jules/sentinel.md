## 2024-05-18 - Missing Rate Limiting and Validation on Proxy Endpoint
**Vulnerability:** The `/api/research` endpoint lacked rate limiting and proper input validation.
**Learning:** Proxy endpoints to external APIs (like Gemini AI) must be protected with rate limiting to prevent cost abuse or resource exhaustion, and input length validation to prevent excessively large requests.
**Prevention:** Always implement basic rate limiting and strict payload validation (length, type) for endpoints that proxy requests to paid external services.
