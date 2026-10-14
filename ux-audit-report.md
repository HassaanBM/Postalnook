# PostalNook — UX Audit Report

**Site:** www.postalnook.com
**Date:** April 23, 2026
**Audited with:** ui-ux-pro-max

---

## Executive Summary

Five UX issues were identified on the PostalNook homepage, ranging from trust and credibility gaps to form accessibility failures. Three issues (1, 2, 5) can be resolved today with no code changes — just copy and style adjustments. Together these fixes are expected to meaningfully improve visitor trust and signup conversion.

---

## Issue 1 — Conflicting Social Proof Numbers

**Severity:** 🔴 High &nbsp;|&nbsp; **Effort:** ~5 min

**Problem:**
The hero section claims "200+ satisfied customers" while the About section states "over 100 customers." Contradictory figures on the same page destroy credibility — visitors will notice, hesitate, and leave.

**Quick Fix:**
Pick one source of truth (e.g. "200+ customers globally") and use it everywhere. Update the About section copy to match. This is a 5-minute copy change with no code required.

---

## Issue 2 — Two Competing Primary CTAs in the Hero

**Severity:** 🔴 High &nbsp;|&nbsp; **Effort:** ~15 min &nbsp;|&nbsp; **Rule:** `§4 primary-action`

**Problem:**
"Get Started" and "Contact Us" sit side-by-side with equal visual weight. Two equally prominent buttons split attention and dilute conversion. Each screen should have exactly one primary CTA.

**Quick Fix:**
Make "Get Started" the solid primary button (filled, brand color, larger). Demote "Contact Us" to a ghost/text-link style so the hierarchy is unambiguous. The user's eye should land on one action first.

---

## Issue 3 — Contact Form Uses Placeholder-Only Labels

**Severity:** 🟠 Medium &nbsp;|&nbsp; **Effort:** ~10 min &nbsp;|&nbsp; **Rule:** `§8 input-labels`

**Problem:**
Form fields (Name, Email, Comments) use placeholders as labels. Placeholders disappear the moment the user starts typing — they can no longer remember what the field is for. This also fails WCAG accessibility standards.

**Quick Fix:**
Add a persistent `<label>` above each field that stays visible while typing. Keep the placeholder as an example value only (e.g. `john@example.com`), not as the label itself.

---

## Issue 4 — 7-Item Carousel Hides Service Content

**Severity:** 🟠 Medium &nbsp;|&nbsp; **Effort:** ~1–2 hrs &nbsp;|&nbsp; **Rule:** `§5 content-priority`

**Problem:**
All 7 services are locked in a carousel. Most users only see slides 1–2 and never click Next. Carousels have notoriously low engagement. Core offerings like Virtual Mailbox, Registered Address, and Package Receiving are effectively invisible to most visitors.

**Quick Fix:**
Replace the carousel with a 3-column responsive grid (2 columns on mobile). All 7 service cards become scannable at once, SEO gets the full text in the DOM, and no user interaction is required to discover all offerings.

---

## Issue 5 — No Testimonials or Customer Quotes

**Severity:** 🔴 High &nbsp;|&nbsp; **Effort:** ~30 min

**Problem:**
The page references "200+ customers across US, Germany, UK, India, Pakistan" but shows zero testimonials, star ratings, or real customer voices. Stats without faces are weak social proof — especially for a mailbox service where trust is the entire product.

**Quick Fix:**
Add a testimonials section between Benefits and Contact with 3 short quotes (name, country, use case). Pair with a Google/Yelp star rating badge — both profiles are already linked in the footer.

> *"As a digital nomad in Germany, PostalNook gave me a real US business address in minutes."*
> — Aisha K., Berlin

---

## Summary

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Conflicting customer count (200 vs 100) | 🔴 High | 5 min |
| 2 | Two equal-weight hero CTAs | 🔴 High | 15 min |
| 3 | Placeholder-only form labels | 🟠 Medium | 10 min |
| 4 | 7-item carousel hides services | 🟠 Medium | 1–2 hrs |
| 5 | No testimonials / social proof | 🔴 High | 30 min |

> **Issues 1, 2, and 5 are highest-impact and require only copy and style changes — no engineering time needed.**
