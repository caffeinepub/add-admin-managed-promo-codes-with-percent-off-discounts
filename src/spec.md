# Specification

## Summary
**Goal:** Restore Admin Panel visibility and routing by fixing the backend admin-status method and making the frontend admin entry/page resilient during loading and error states.

**Planned changes:**
- Backend: Add a Motoko query method `isCallerAdmin : () -> async Bool` that matches the frontend call and returns whether the caller is an admin (anonymous callers return `false` or provide a clear authorization failure the frontend can handle).
- Frontend: Rework the Admin navigation entry so it appears for authenticated users even while admin status is loading (disabled/loading state instead of hidden) in both desktop and mobile menus.
- Frontend: Make `#/admin` always reachable and show clear states on the Admin page (loading, retry-on-check-failure, access denied for non-admins) rather than blank/hidden behavior.

**User-visible outcome:** After logging in, users see an Admin entry (with a loading state while checks run). Navigating to `#/admin` reliably shows either the Admin Orders page (for admins), a clear “no permission” message (for non-admins), or an actionable error with a retry option (if the check fails).
