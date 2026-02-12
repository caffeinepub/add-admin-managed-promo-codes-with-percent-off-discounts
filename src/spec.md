# Specification

## Summary
**Goal:** Make admin detection reliable so the “Admin Panel” top-bar button only shows for admins, and ensure the admin invitation accept/decline modal automatically appears right after login for invited principals.

**Planned changes:**
- Backend: expose a public admin-check method that matches what the frontend calls (`actor.isCallerAdmin()`), returning `true` for admins and `false` (no trap) for non-admins.
- Frontend: fix header navigation so “Admin Panel” renders in the top nav (and mobile menu) only for admins, and clicking it navigates directly to `#/admin`.
- Frontend: trigger the “Admin Access Invitation” modal automatically after login when a pending invitation exists, including re-checking after initial user initialization so timing doesn’t suppress the modal.
- Backend + frontend: on invitation accept/decline, clear the invitation server-side and update the current session UI immediately (show admin button after accept) without requiring a page refresh.

**User-visible outcome:** Admin users see an “Admin Panel” button in the header that takes them straight to the admin route, and invited users are automatically prompted to accept/decline admin access immediately after logging in; accepting updates the UI right away.
