# Specification

## Summary
**Goal:** Fix post-login role initialization so newly authenticated users reliably receive the `#user` role before profile saves/admin checks, and make save failures easier to diagnose.

**Planned changes:**
- Ensure the frontend calls `ensureUserRole()` immediately after successful Internet Identity login and whenever a new authenticated actor/principal becomes available (without requiring a manual refresh and without editing immutable hook files).
- Update the Profile page save error UI to keep the existing generic destructive alert while also showing a human-readable backend error detail when available (e.g., Unauthorized/trap text), without rendering any sensitive secrets.
- Add a minimal in-code regression guard: if `ensureUserRole()` fails after authentication, emit a single clearly labeled debug console log containing the principal string and error message, avoiding repeated spam for the same principal in a stable session.

**User-visible outcome:** After logging in with Internet Identity, users can save their profile without needing to refresh first, and if saving fails they see a more informative error message to help diagnose authorization/role issues during testing.
