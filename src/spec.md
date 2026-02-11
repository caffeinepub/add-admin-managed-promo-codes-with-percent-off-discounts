# Specification

## Summary
**Goal:** Add a cPanel shared-hosting self-hosting guide for the static React frontend and ensure the deployment documentation and optional cPanel-friendly config snippet are included and accessible in the production build.

**Planned changes:**
- Create/update an English “Deployment Guide” documentation page that explains how to build the production static frontend and upload it via cPanel for a primary domain and for an addon domain/subdomain.
- Document hosting at the domain root vs. in a subdirectory, including how to set the correct `BASE_URL` for subdirectory hosting (aligned with `import.meta.env.BASE_URL` usage).
- Explicitly document that the Motoko backend cannot run on cPanel/shared hosting and must remain deployed on the Internet Computer.
- Add verification steps and a cPanel/static-hosting troubleshooting section.
- Ensure the “Deployment Guide” footer link opens the shipped documentation from the built static site output.
- Include an optional cPanel-friendly static-hosting configuration snippet (e.g., Apache/.htaccess) alongside the built frontend assets and document where to place it and what to do if directives aren’t supported.

**User-visible outcome:** Users can open the in-app “Deployment Guide” link on the hosted site to follow step-by-step instructions to build and upload the static frontend to cPanel (domain root, addon/subdomain docroot, or subdirectory), use an optional ready-to-upload config snippet when applicable, and verify/troubleshoot the deployment.
