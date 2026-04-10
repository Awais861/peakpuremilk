# PeakPureCow Milk — Farm-Fresh Dairy E-Commerce Website

> 100% farm-fresh, hormone-free dairy from Attock, Pakistan — delivered from pasture to your doorstep before the dew dries.

---

## Overview

PeakPureCow Milk is a full-featured, responsive e-commerce website for a family-owned dairy brand. It includes product browsing, online ordering with zone-based shipping, subscription savings, user authentication, a built-in chatbot, returns management, and a strong sustainability narrative.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Markup** | Semantic HTML5 with JSON-LD, Open Graph & Twitter Card meta |
| **Styling** | Custom CSS3 — CSS variables, Grid, Flexbox, glassmorphism, dark mode |
| **Fonts** | Google Fonts — Playfair Display (headings) + Lato (body) |
| **Scripts** | Vanilla JavaScript (ES6+, strict mode) |
| **Storage** | `localStorage` (users, cart, returns) · `sessionStorage` (auth session) |
| **Assets** | SVG product illustrations, JPEG/PNG photography |

No build tools, bundlers, or external frameworks required — open any HTML file in a browser.

---

## Pages

| File | Purpose |
|------|---------|
| `home.html` | Hero banner, value propositions, featured products, farm story, stats, testimonials, newsletter |
| `about.html` | Brand origin story, farmer bios, quality promises |
| `products.html` | Full product showcase (milk & butter), nutrition facts, "Why Choose Us" |
| `shop.html` | E-commerce storefront — filter, add to cart, Subscribe & Save 15% |
| `checkout.html` | Order review, zone-based shipping calculator, payment (COD / card / PayPal) |
| `sustainability.html` | Regenerative farming, eco-packaging, solar energy, animal welfare |
| `contact.html` | Contact channels (WhatsApp, email, phone, social), contact form, embedded map |
| `faq.html` | Accordion-style FAQ covering orders, shipping, subscriptions, returns |
| `shipping.html` | Delivery zone info, rate table, order tracking history |
| `returns.html` | Return request form, return ID tracking, refund policy |
| `login.html` | Sign-in page with glassmorphism UI, remember-me, social auth stubs |
| `signup.html` | Registration with password strength meter, real-time validation, terms |

---

## JavaScript Modules

| File | Responsibility |
|------|---------------|
| `PeakPureCow Milk.js` | Core site logic — product catalog, cart, subscriptions, preloader, dark mode, scroll effects, navigation |
| `auth.js` | Auth guard (redirects unauthenticated users to login) + injects user badge with logout into nav header |
| `login.js` | Login form validation, credential check against localStorage, session creation, remember-me |
| `signup.js` | Registration validation, password strength scoring, duplicate-email check, auto-login on success |
| `chatbot.js` | Peak Pure Assistant — keyword-matched AI chatbot with product & shipping knowledge base |
| `contact.js` | Contact form validation, submission handler with loading/success/error states |
| `faq.js` | FAQ accordion toggle with single-open behavior and ARIA accessibility |
| `shipping.js` | Shipping page — loads cart orders, renders tracking history from localStorage |
| `returns.js` | Returns management — generates return IDs (RET-YYYYMMDD-XXXX), stores & displays return history |

---

## Stylesheets

| File | Scope |
|------|-------|
| `css/styles.css` | Global brand styles — variables, layout, components, dark mode, preloader, responsive breakpoints |
| `css/auth.css` | Login & signup pages — glassmorphism card, animated orbs, form states, toast notifications |
| `css/chatbot.css` | Chatbot widget & WhatsApp floating action button |

---

## Product Catalog

| Product | Price | Unit |
|---------|-------|------|
| Whole Milk | Rs. 250 | 1 kg |
| Semi-Skimmed Milk | Rs. 220 | 1 kg |
| Skimmed Milk | Rs. 200 | 1 kg |
| Unsalted Butter | Rs. 550 | 250 g |
| Sea Salt Butter | Rs. 600 | 250 g |
| Herb & Garlic Butter | Rs. 650 | 250 g |

---

## Delivery Zones

| Zone | Coverage | Shipping | Speed | Free Shipping |
|------|----------|----------|-------|---------------|
| 1 | Attock City | Free | Same-day (order by 10 AM) | Always |
| 2 | Hazro, Kamra, Hasan Abdal, Fateh Jang | Rs. 150 | Next-day | Orders ≥ Rs. 2,000 |
| 3 | Rawalpindi, Islamabad, Taxila, Wah | Rs. 300 | 1–2 days | Orders ≥ Rs. 5,000 |

All deliveries use **cold-chain insulated packaging** (≤ 4 °C) with real-time SMS/WhatsApp tracking.

---

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  signup.html │────▶│  login.html │────▶│  home.html  │
│  (register)  │     │  (sign in)  │     │ (protected) │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                         auth.js guard
                                         on every page
                                               │
                                     ┌─────────┴─────────┐
                                     │  Not logged in?    │
                                     │  → redirect login  │
                                     └───────────────────┘
```

- **Registration** saves user to `localStorage` (`ppc_users` array)
- **Login** verifies credentials, creates `sessionStorage` session
- **Auth guard** (`auth.js`) runs in `<head>` of every protected page — redirects to login instantly if no session
- **User badge** with initials + dropdown (name, email, sign-out) is injected into the nav header

---

## Key Features

- **Responsive Design** — Mobile-first with breakpoints at 480px, 768px, 992px
- **Dark Mode** — Full theme toggle with CSS custom properties
- **Page Preloader** — Spinner with branded text, fades out on load
- **Scroll Effects** — Progress bar, reveal-on-scroll animations, parallax hero
- **Glassmorphism Auth** — Frosted-glass login/signup cards with animated background orbs
- **Live Validation** — Real-time form feedback with shake animations and color states
- **Password Strength Meter** — 4-bar indicator (Weak → Strong)
- **Toast Notifications** — Slide-in success/error/info toasts
- **Mini Cart Drawer** — Side panel with quantity controls and checkout summary
- **Subscribe & Save** — 15% discount on recurring delivery plans
- **Chatbot** — Floating assistant with keyword-matched dairy knowledge base
- **WhatsApp Integration** — Floating button for direct customer support
- **Cookie Consent** — GDPR-style banner with accept/decline
- **SEO** — JSON-LD structured data, Open Graph, Twitter Cards, semantic HTML

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-cream` | `#f7f3eb` | Page background |
| `--color-green-dark` | `#2d4a32` | Primary brand, headings |
| `--color-green-mid` | `#456b4c` | Buttons, accents |
| `--color-green-light` | `#b5ccaa` | Subtle highlights |
| `--color-gold` | `#b8963a` | CTA buttons, badges |
| `--color-earth` | `#6b5b3e` | Secondary text |
| `--color-sand` | `#d9cbb3` | Borders, dividers |
| `--color-sage` | `#8fa888` | Decorative accents |

---

## Project Structure

```
E:\Html\
├── home.html                  # Homepage
├── about.html                 # About Us
├── products.html              # Product Showcase
├── shop.html                  # Online Store
├── checkout.html              # Checkout & Payment
├── contact.html               # Contact Us
├── faq.html                   # FAQ
├── sustainability.html        # Sustainability
├── shipping.html              # Shipping Info & Tracking
├── returns.html               # Returns & Refunds
├── login.html                 # Sign In
├── signup.html                # Create Account
├── PeakPureCow Milk.js        # Core site logic
├── auth.js                    # Auth guard + user badge
├── login.js                   # Login form handler
├── signup.js                  # Signup form handler
├── chatbot.js                 # Chatbot engine
├── contact.js                 # Contact form handler
├── faq.js                     # FAQ accordion
├── shipping.js                # Shipping tracker
├── returns.js                 # Returns manager
├── SITEMAP-AND-WIREFRAME.md   # Site architecture reference
├── README.md                  # ← You are here
├── css/
│   ├── styles.css             # Global styles + dark mode
│   ├── auth.css               # Auth page styles
│   └── chatbot.css            # Chatbot widget styles
└── imgs/
    ├── logo.svg               # Brand logo
    ├── whole-milk.svg          # Product illustrations
    ├── semi-skimmed-milk.svg
    ├── skimmed-milk.svg
    ├── unsalted-butter.svg
    ├── sea-salt-butter.svg
    ├── herb-garlic-butter.svg
    ├── plain-yogurt.svg
    ├── honey-yogurt.svg
    ├── vanilla-yogurt.svg
    ├── farm-pasture.svg
    ├── farm-heritage.svg
    ├── dairy-facility.svg
    ├── farmer-marcus.svg
    ├── rotational-grazing.svg
    ├── animal-welfare.svg
    ├── solar-energy.svg
    ├── eco-packaging.svg
    ├── poster2.jpeg
    ├── postermilk.png
    ├── headfarm.jpg
    ├── ongrass.jpeg
    └── chachu.jpeg
```

---

## Getting Started

1. Clone or download this folder
2. Open `login.html` in any modern browser (or use VS Code Live Server)
3. Create an account on the signup page
4. You'll be redirected to the homepage — start browsing

No server, no dependencies, no build step required.

---

## Contact

**PeakPureCow Milk**  
Near Beacon House School, Attock, Pakistan  
Email: awaisrazaattari0@gmail.com  
Phone: +92 336 941 3146

---

*© 2026 PeakPureCow Milk. All rights reserved.*
