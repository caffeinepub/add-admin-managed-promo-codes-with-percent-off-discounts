# Specification

## Summary
**Goal:** Remove the first-login authorization deadlock by automatically bootstrapping the authenticated caller with the `#user` role so new users can save their profile immediately after Internet Identity login.

**Planned changes:**
- Backend: Add an idempotent public shared method (e.g., “ensure/register user”) that grants `#user` to the authenticated caller on first authenticated interaction, while rejecting anonymous callers with a clear English unauthorized message.
- Backend: Update role/bootstrap flow so new authenticated principals no longer hit “Unauthorized: Only users can save profiles” when saving a profile; keep existing admin role checks and the current email-based auto-promotion behavior intact.
- Frontend: After successful Internet Identity login (and when the authenticated actor becomes available), call the new backend “ensure user role” method, then invalidate/refetch profile and admin-related React Query caches so the UI reflects the new role without a manual refresh (without editing immutable frontend paths).

**User-visible outcome:** A brand-new Internet Identity user can log in and successfully save their profile right away (no failed-save error and no page refresh needed), while admins continue to behave as before.
