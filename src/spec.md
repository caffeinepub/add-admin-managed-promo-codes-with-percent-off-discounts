# Specification

## Summary
**Goal:** Ensure admin access and visibility are correctly gated by the authenticated Internet Identity principal, preventing the Admin Panel link from flashing for non-admin users.

**Planned changes:**
- Add a backend query method `isCallerAdmin : async Bool` that returns whether the current authenticated caller principal is an admin (returning `false` for non-admins without trapping).
- Store and verify admin authorization in the backend using Internet Identity principal(s) (not email) and persist this admin source of truth across canister upgrades.
- Update frontend navigation to only render the “Admin Panel” entry after the admin check completes and confirms admin status (no visible flash for logged-out or non-admin users) on both desktop and mobile.
- Protect the `/admin` route: show an “Admin Access Required” login prompt when logged out, an “Access Denied” screen when logged in as non-admin, and the admin dashboard only for admins.

**User-visible outcome:** Non-admin users never see the Admin Panel link (including during loading), admins consistently see and can click it, and direct navigation to `#/admin` shows the correct prompt/denied state unless the user is an authenticated admin.
