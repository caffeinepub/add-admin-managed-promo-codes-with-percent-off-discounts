# Specification

## Summary
**Goal:** Remove legal/novelty disclaimer messaging from the customer-facing browsing and ordering experience.

**Planned changes:**
- Remove the “Important Legal Notice” section and any novelty/entertainment-only disclaimer text from the marketing homepage, ensuring the layout remains clean with no empty gaps.
- Remove legal/novelty warning UI and the lawful-use attestation requirement from the order page (including any checkbox, related copy, and client-side validation tied to it) while keeping all existing required order fields and the existing order submission behavior.
- Remove legal/novelty disclaimer wording from other ordering-flow pages where it appears (e.g., prices page and order confirmation content) while preserving core page content and avoiding runtime errors.

**User-visible outcome:** Customers can browse the site and complete an order without seeing or acknowledging legal/novelty disclaimer notices, and the pages continue to render normally.
