# Specification

## Summary
**Goal:** Temporarily show the authenticated user’s Internet Identity Principal ID at the bottom of the Home page, with a one-click copy control.

**Planned changes:**
- Add a small, clearly isolated UI block/component on the Home route that conditionally renders only when the user is authenticated and displays `identity.getPrincipal().toText()` labeled as “Principal ID:”.
- Place the Principal ID block at the very bottom of the Home page (in or directly above the global footer) with responsive styling so it doesn’t overlap content.
- Add a copy-to-clipboard control next to the Principal ID, with English success feedback (e.g., “Copied”) and error feedback (e.g., “Copy failed”).

**User-visible outcome:** When logged in on the Home page, the user can see their Principal ID at the bottom and copy it with one click; when logged out (or on other pages) nothing is shown.
