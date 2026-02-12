# Specification

## Summary
**Goal:** Allow any authenticated (non-banned) user to access and use the admin panel after credential login, remove admin-only backend restrictions blocking admin-panel operations, and persist admin-panel login across refreshes.

**Planned changes:**
- Backend: Update `adminLogin` to only validate username/password, set `adminLoginStatus` on success, return `true/false`, and stop attempting to assign the `#admin` role (eliminating the current Unauthorized trap).
- Backend: Remove admin-only role restrictions for admin-panel methods so any authenticated `#user` can perform admin-dashboard operations (orders management, payment contact updates, tracking number updates, banned-user views, ban/unban), while preserving existing banned-user protections and keeping normal users limited to their own orders outside the explicitly listed admin-panel methods.
- Frontend: Remove admin role-based gating (`isCallerAdmin`/role checks) from admin routes/pages and rely on successful admin credential login (with existing Internet Identity authentication still required).
- Frontend: Persist “admin-panel logged in” state across refreshes/revisits using a safe session marker (no raw password storage) and clear it on Internet Identity logout.

**User-visible outcome:** After logging in with Internet Identity and entering valid admin credentials once, users can open admin routes (e.g., `#/admin`, `#/admin/users`) without “Access Denied,” can use the admin dashboard features if they are not banned, and stay logged into the admin panel across page refreshes until they log out.
