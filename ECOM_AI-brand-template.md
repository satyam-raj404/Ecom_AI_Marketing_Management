# EcomAI — Complete Brand Template & UI/UX Theme System

**Version:** 1.0 | **Date:** April 17, 2026 | **Classification:** Internal

---

## Part 1: Brand Identity Foundation

### 1.1 Brand Essence

**Tagline (English):** Your business brain, always on.
**Tagline (Hinglish):** Aapke business ka brain — hamesha alert.
**Positioning line:** The AI-powered business operating system for Indian wholesalers.

**Brand personality:** Trustworthy, intelligent, approachable, Indian-first. Think of EcomAI as a sharp chartered accountant who also speaks your language — not a cold enterprise tool, not a consumer toy. It's the advisor who taps your shoulder and says "Sir, Gate 3 pe problem hai."

**Brand promise:** You will never be surprised by bad debt again.

### 1.2 Logo System

**Logomark:** A rounded square (border-radius: 8px) in Navy 900 (#0F172A) containing a bold "E" in Growth Green (#22C55E). The "E" uses the Lexend font at weight 700.

**Logotype:** "EcomAI" in Lexend 600 weight. The "Ecom" is in Navy 900, the "AI" can be highlighted in Trust Blue (#2563EB) or kept in Navy 900 depending on context.

**Clear space:** Minimum clear space around the logo equals the height of the "E" lettermark on all sides.

**Minimum size:** Logomark alone: 24×24px. Logomark + logotype: 120px wide.

**Logo on backgrounds:**
- Light backgrounds (#F8FAFC, #FFFFFF): Use Navy 900 logotype + standard logomark
- Dark backgrounds (#0F172A, #1E293B): Use white (#F8FAFC) logotype + standard logomark
- Green/accent backgrounds: Use white logomark with frosted overlay

---

## Part 2: Colour System

### 2.1 Primary Palette

| Token | Hex | Usage |
|---|---|---|
| `--navy-900` | `#0F172A` | Primary brand, headings, dark backgrounds |
| `--navy-800` | `#1E293B` | Secondary dark, card backgrounds (dark mode) |
| `--slate-700` | `#334155` | Body text on light, secondary dark |
| `--slate-500` | `#64748B` | Muted text, captions, placeholders |
| `--slate-300` | `#CBD5E1` | Disabled states, light borders |
| `--slate-200` | `#E2E8F0` | Borders, dividers, card outlines |
| `--snow` | `#F8FAFC` | Page backgrounds, surfaces |
| `--white` | `#FFFFFF` | Card backgrounds, inputs |

### 2.2 Accent & Semantic Palette

| Token | Hex | Role | When to use |
|---|---|---|---|
| `--blue` | `#2563EB` | Trust Blue | Primary CTAs, links, active states, info badges |
| `--blue-light` | `#EFF6FF` | Blue tint | Background for info states, selected rows |
| `--blue-dark` | `#1E40AF` | Blue text | Text on blue-light backgrounds |
| `--green` | `#22C55E` | Growth Green | Success, positive trends, money received, delivered |
| `--green-light` | `#F0FDF4` | Green tint | Background for success states |
| `--green-dark` | `#166534` | Green text | Text on green-light backgrounds |
| `--amber` | `#F59E0B` | Alert Amber | Warnings, medium risk, pending states |
| `--amber-light` | `#FFFBEB` | Amber tint | Warning backgrounds |
| `--amber-dark` | `#92400E` | Amber text | Text on amber-light backgrounds |
| `--red` | `#EF4444` | Danger Red | Critical alerts, bad debt, errors, overdue |
| `--red-light` | `#FEF2F2` | Red tint | Danger backgrounds |
| `--red-dark` | `#991B1B` | Red text | Text on red-light backgrounds |

### 2.3 Extended Palette (Charts & Data Viz)

For charts, graphs, and multi-series data. Use in this order to maintain visual consistency:

1. `#2563EB` — Blue (primary series)
2. `#22C55E` — Green (secondary/positive)
3. `#F59E0B` — Amber (tertiary/warning)
4. `#8B5CF6` — Purple (4th series)
5. `#EC4899` — Pink (5th series)
6. `#06B6D4` — Cyan (6th series)
7. `#EF4444` — Red (negative/danger series)
8. `#84CC16` — Lime (8th series)

### 2.4 Dark Mode Mapping

| Light mode | Dark mode equivalent |
|---|---|
| `--snow` (#F8FAFC) page bg | `--navy-900` (#0F172A) page bg |
| `--white` (#FFFFFF) card bg | `--navy-800` (#1E293B) card bg |
| `--slate-200` (#E2E8F0) borders | `--slate-700` (#334155) borders |
| `--navy-900` (#0F172A) text | `#F8FAFC` text |
| `--slate-500` (#64748B) muted | `#94A3B8` muted |
| Accent colours remain the same, but use 15% opacity backgrounds instead of `-light` tints |

---

## Part 3: Typography System

### 3.1 Font Stack

| Role | Font | Weights | Google Fonts |
|---|---|---|---|
| Headings | Lexend | 400, 500, 600, 700 | `family=Lexend:wght@400;500;600;700` |
| Body | Source Sans 3 | 300, 400, 500, 600, 700 | `family=Source+Sans+3:wght@300;400;500;600;700` |
| Monospace / Data | JetBrains Mono | 400, 500 | `family=JetBrains+Mono:wght@400;500` |

**Why Lexend for headings:** Designed for readability across literacy levels — critical for Indian MSME users who may be more comfortable in Hindi than English. Clean, modern, confident without being cold.

**Why Source Sans 3 for body:** Excellent Latin + Devanagari rendering, designed by Adobe for extended reading, open-source. Pairs naturally with Lexend's geometric forms.

**Combined import:**
```
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

### 3.2 Type Scale

| Level | Size | Weight | Font | Line-height | Usage |
|---|---|---|---|---|---|
| Display | 48px | 700 | Lexend | 1.1 | Landing page hero only |
| H1 | 36px | 600 | Lexend | 1.2 | Page titles |
| H2 | 28px | 600 | Lexend | 1.3 | Section headings |
| H3 | 22px | 500 | Lexend | 1.3 | Sub-section headings |
| H4 | 18px | 500 | Lexend | 1.4 | Card titles, modal headers |
| Body | 16px | 400 | Source Sans 3 | 1.6 | Primary body text |
| Body small | 14px | 400 | Source Sans 3 | 1.5 | Secondary text, descriptions |
| Caption | 12px | 400 | Source Sans 3 | 1.4 | Labels, timestamps, metadata |
| Overline | 12px | 600 | Lexend | 1.2 | Section labels, category tags (uppercase, 1.5px tracking) |
| Data | 14-22px | 500 | JetBrains Mono | 1.3 | Numbers, amounts, codes |

### 3.3 Number Formatting

Always use Indian number system: ₹15,42,380 (not ₹1,542,380). Use "lakh" and "crore" in written copy. Currency symbol ₹ always precedes the number with no space.

---

## Part 4: Spacing & Layout

### 4.1 Spacing Scale (base 4px)

`4px` — hairline gaps (icon-to-label)
`8px` — tight spacing (between related elements within a group)
`12px` — default internal padding (cell padding, small card padding)
`16px` — standard component padding, gap between sibling elements
`24px` — card padding, section internal spacing
`32px` — gap between cards in a grid, between sections in a form
`48px` — major section dividers on pages
`64px` — hero padding, page section spacing
`96px` — landing page section spacing

### 4.2 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Badges, inline tags |
| `--radius` | 8px | Buttons, inputs, small cards |
| `--radius-lg` | 12px | Cards, panels, modals |
| `--radius-xl` | 16px | Large panels, full-width sections |
| `--radius-pill` | 999px | Pills, status tags, toggle tracks |

### 4.3 Shadows (use sparingly)

| Name | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift for cards on hover |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Dropdowns, popovers |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.12)` | Modals, dialogs |

### 4.4 Breakpoints

| Name | Width | Target |
|---|---|---|
| `xs` | 375px | Mobile (iPhone SE) |
| `sm` | 640px | Large phone |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1440px | Large desktop |

**Mobile-first design is mandatory.** Wholesalers and retailers both primarily use smartphones. Design for 375px first, then scale up.

---

## Part 5: Component Library Specification

### 5.1 Buttons

**Primary (Trust Blue):** `bg: #2563EB, color: white, radius: 8px, height: 44px (mobile) / 40px (desktop), font: Source Sans 3 500 14px`

**Secondary (Outline):** `bg: transparent, border: 1px solid #E2E8F0, color: #0F172A, hover-bg: #F8FAFC`

**Danger (Red outline):** `bg: transparent, border: 1px solid #FEF2F2, color: #EF4444`

**Success (Green fill):** `bg: #22C55E, color: white`

**Ghost:** `bg: transparent, color: #2563EB, no border, hover: underline`

All buttons: min touch target 44×44px on mobile, transition 150ms ease, cursor: pointer, disabled state at 50% opacity.

### 5.2 Status / Risk Badges

Pattern: `pill shape (border-radius: 999px), padding: 4px 12px, font-size: 12px, font-weight: 500`

| Status | Background | Text colour | Border |
|---|---|---|---|
| Low risk | #F0FDF4 | #166534 | none |
| Medium risk | #FFFBEB | #92400E | none |
| High risk | #FEF2F2 | #991B1B | none |
| Critical | #FEF2F2 | #991B1B | 1px solid #FECACA |
| Pending | #EFF6FF | #1E40AF | none |
| Confirmed | #FFFBEB | #92400E | none |
| Dispatched | #F0F9FF | #0C4A6E | none |
| Delivered | #F0FDF4 | #166534 | none |
| Overdue | #FEF2F2 | #991B1B | none |
| Draft | #F8FAFC | #475569 | 1px solid #E2E8F0 |

### 5.3 Cards

**Standard card:** `bg: white, border: 1px solid #E2E8F0, radius: 12px, padding: 20px`

**Metric card:** `bg: #F8FAFC, radius: 8px, padding: 14px, no border`

**Alert card:** Same as standard but with a 3px left border in the alert colour (green/amber/red)

**Dark mode card:** `bg: #1E293B, border: 1px solid #334155, radius: 12px`

### 5.4 Credit Alert Component

Structure:
1. Status dot (8px circle, colour = risk level)
2. Retailer name (14px, 500 weight)
3. Risk badge (pill, right-aligned)
4. Description line (13px, muted colour — outstanding amount and limit breach)
5. Progress bar (6px height, gradient from amber to red if over limit)
6. Action buttons (Send reminder + Pause credit)

### 5.5 AICA Chat Bubble

Structure:
1. Avatar circle (36px, Navy 900 bg, "AI" in green)
2. Message text (14px body, line-height 1.6)
3. Key numbers highlighted inline with semantic colours
4. Timestamp below (12px, muted)

---

## Part 6: Social Media Templates

### 6.1 Instagram Post (1080×1080px)

**Layout grid:** 80px padding all sides. Content area: 920×920px.

**Template A — Feature spotlight:**
- Top: EcomAI logo (small, left-aligned)
- Middle: Large Lexend heading (28-36px) stating the feature benefit
- Below heading: Supporting body text (16-18px Source Sans 3)
- Bottom: CTA button graphic + URL
- Background: Navy 900 with subtle grid pattern overlay at 5% opacity
- Accent elements: Green (#22C55E) underlines or highlight bars

**Template B — Statistic / Social proof:**
- Center-aligned large number in JetBrains Mono (72px, Green)
- Supporting statement in Lexend (22px, white)
- Small EcomAI logo at bottom
- Background: Navy 900 → Slate 700 subtle gradient

**Template C — Before/After:**
- Split layout: left side "Before" (red tinted), right side "After" (green tinted)
- Each side has 3-4 bullet points
- Divider line in white
- EcomAI logo centered on divider

### 6.2 Instagram Story (1080×1920px)

**Layout:** 60px top safe zone, 180px bottom safe zone (for swipe-up/link area).

**Template:** Full-bleed Navy 900 background. Large heading in centre. Key metric in green. CTA at bottom. Sticker-friendly area in top-right for engagement.

### 6.3 LinkedIn Post (1200×627px)

**Layout:** Left-aligned text block (60% width) + right-aligned visual/mockup (40%). Professional, clean.

**Template:** Snow background, Navy text, Blue accent line on left. Dashboard mockup screenshot on right with subtle shadow.

### 6.4 Twitter/X (1200×675px)

**Template:** Compact version of LinkedIn layout. One strong headline + one supporting stat. Logo in corner.

### 6.5 YouTube Thumbnail (1280×720px)

**Template:** High-contrast Navy bg. Large bold text (3-5 words max). Face/person on right side if applicable. Green highlight on key word. Red "LIVE" or number badge for urgency.

---

## Part 7: Landing Page Theme

### 7.1 Page Structure

1. **Nav bar:** Sticky, white bg, logo left, links center, CTA button right. Height: 64px.
2. **Hero section:** Navy 900 bg. Lexend Display heading. Sub-heading in Source Sans 3. Two CTAs (primary blue + secondary outline white). Dashboard mockup/screenshot floating right.
3. **Social proof strip:** Logo bar of pilot customers or "Trusted by X+ wholesalers in Y cities." Light gray bg.
4. **Problem section:** "Sound familiar?" Three pain-point cards with red accents (credit defaults, pilferage, manual chaos).
5. **Solution section:** Three-layer framework visual (Accounting → Intelligence → Commerce). Blue accent.
6. **Features grid:** 6 feature cards (Storefront, Credit Intelligence, Accounting, Inventory, AICA, WhatsApp). Each with icon, heading, 2-line description.
7. **How it works:** 4-step horizontal timeline (Sign up → Add products → Share storefront → Get alerts).
8. **Pricing:** Single-tier card "Starting at ₹500/month". Feature list. CTA.
9. **Testimonials:** If available; placeholder for pilot customer quotes.
10. **CTA section:** Navy bg, large heading "Apna business sambhaliye — aaj se." CTA button.
11. **Footer:** Links, contact, social icons, legal.

### 7.2 Key Landing Page Patterns

- **Repeat the CTA:** Primary CTA appears at minimum 3 times (hero, mid-page, bottom)
- **Mobile-first:** Hero text must be readable at 375px without horizontal scroll
- **Speed:** Target <3s load on 4G. Use WebP images, lazy-load below-fold
- **Trust signals:** "Made in India" badge, data encryption badge, NBFC partner logos
- **Bilingual:** Key headings in both English and Hindi

---

## Part 8: Application UI Theme

### 8.1 Dashboard Layout

**Desktop (≥1024px):**
- Left sidebar: 240px, Navy 900 bg, navigation icons + labels
- Top bar: 56px, white bg, search + notifications + user avatar
- Content area: Remaining width, Snow bg, 24px padding

**Mobile (<768px):**
- Bottom tab bar: 5 items max (Dashboard, Orders, Products, Retailers, More)
- Full-width content
- Collapsible header with key metrics

### 8.2 Data Tables

- Header row: Snow bg, Lexend 500 12px, uppercase, 1px tracking
- Body rows: White bg, Source Sans 3 400 14px
- Alternating row: #FAFBFC
- Hover row: Blue-light (#EFF6FF)
- Borders: 1px solid #E2E8F0 (horizontal only, no vertical cell borders)
- Sort indicators: Chevron icons in muted colour
- Pagination: Bottom-right, pill buttons

### 8.3 Forms

- Input height: 44px (mobile), 40px (desktop)
- Label: 13px Source Sans 3 500, positioned above input
- Placeholder: 14px, #94A3B8
- Border: 1px solid #E2E8F0, focus: 2px solid #2563EB
- Error state: 1px solid #EF4444, error text below in red-dark 12px
- Helper text: 12px, #64748B, below input

### 8.4 Charts (Recharts / Chart.js)

- Grid lines: #E2E8F0 (light mode), #334155 (dark mode), dashed
- Axis text: 12px Source Sans 3, #64748B
- Tooltip: White card, shadow-md, 13px text, bold value
- Use extended palette in order. Never rely on colour alone — add labels or patterns.

---

## Part 9: Google Stitch Prompt

This is a comprehensive prompt you can paste directly into Google Stitch (Google's AI prototyping tool) to generate screens for EcomAI.

---

### Google Stitch Prompt — Full Version

```
PROJECT: EcomAI — B2B SaaS Business Operating System for Indian FMCG Wholesalers

BRAND IDENTITY:
- Name: EcomAI
- Tagline: "Your business brain, always on" / "Aapke business ka brain — hamesha alert"
- Personality: Trustworthy, intelligent, approachable, Indian-first. Think sharp chartered accountant meets friendly advisor.
- Logo: Rounded square (radius 8px) with navy background (#0F172A) and green "E" (#22C55E) inside. Logotype uses Lexend 600.

COLOUR SYSTEM:
Primary palette:
- Navy 900: #0F172A (brand primary, dark backgrounds, headings)
- Navy 800: #1E293B (secondary dark, card bg in dark mode)
- Slate 700: #334155 (body text on light bg)
- Slate 500: #64748B (muted text, captions)
- Slate 200: #E2E8F0 (borders, dividers)
- Snow: #F8FAFC (page background)
- White: #FFFFFF (card backgrounds, inputs)

Accent palette:
- Trust Blue: #2563EB (CTAs, links, active states)
- Growth Green: #22C55E (success, positive trends, money in, logo accent)
- Alert Amber: #F59E0B (warnings, medium risk)
- Danger Red: #EF4444 (critical alerts, bad debt, errors)

Semantic tints (background + text pairs):
- Blue: bg #EFF6FF, text #1E40AF
- Green: bg #F0FDF4, text #166534
- Amber: bg #FFFBEB, text #92400E
- Red: bg #FEF2F2, text #991B1B

Dark mode: Navy 900 page bg, Navy 800 card bg, Slate 700 borders, #F8FAFC text, #94A3B8 muted text. Accents remain the same but use 15% opacity backgrounds.

TYPOGRAPHY:
- Headings: Lexend (Google Fonts) — weights 400-700. Clean, geometric, designed for readability across literacy levels.
- Body: Source Sans 3 (Google Fonts) — weights 300-700. Excellent Devanagari rendering for Hindi support.
- Data/Mono: JetBrains Mono (Google Fonts) — weights 400-500. For numbers, amounts, codes.
- Type scale: Display 48px/700, H1 36px/600, H2 28px/600, H3 22px/500, H4 18px/500, Body 16px/400, Small 14px/400, Caption 12px/400
- Number formatting: Indian system (₹15,42,380 not ₹1,542,380). Use lakhs and crores.

SPACING & LAYOUT:
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Border radius: 8px default, 12px cards, 16px modals, 999px pills
- Shadows: Use sparingly. sm (1px 2px), md (4px 12px), lg (12px 32px).
- Mobile-first design. Min touch target 44×44px.

COMPONENT PATTERNS:
- Buttons: Primary (blue fill), Secondary (outline), Danger (red outline), Success (green fill), Ghost (no border). All 44px height mobile, 40px desktop. 150ms transitions.
- Status badges: Pill-shaped (border-radius 999px). Low risk (green tint), Medium risk (amber tint), High risk (red tint), Critical (red tint + red border). Order statuses: Placed (blue), Confirmed (amber), Dispatched (cyan), Delivered (green).
- Cards: White bg, 1px #E2E8F0 border, 12px radius, 20px padding. Alert cards have 3px coloured left border.
- Credit alert card: Status dot + retailer name + risk badge + outstanding description + progress bar + action buttons.
- AICA chat bubble: Navy circle avatar with green "AI" text + message with highlighted numbers.
- Metric cards: Snow bg, no border, 8px radius, 14px padding. Label (muted 12px) + value (22px Lexend 600) + delta (12px green/red).

TARGET USERS:
1. Wholesaler owner (primary): Mid-size FMCG business, 150-300 retailers, ₹2-10cr turnover, uses WhatsApp + Tally/Vyapar, owns smartphone, staff of 3-8.
2. Retailer (kirana store owner): Accesses wholesaler's storefront to browse products, place orders, check credit status. Mobile-only user.
3. Staff (accountant/warehouse): Processes orders, manages inventory, generates invoices.

SCREENS TO GENERATE:

1. WHOLESALER DASHBOARD (main screen after login):
- Top: AI-generated morning briefing card from AICA ("Good morning Rajesh ji. Today you have 5 orders to fulfil. 2 retailers have crossed their credit limit...")
- KPI row: 4 metric cards (Total Outstanding, Orders Today, At Risk Amount, Collection Rate)
- Credit alerts section: List of retailers needing attention with risk badges and quick actions
- Sales trend mini-chart: 7-day trend line
- Quick actions strip: "New order", "Send reminders", "Add product"
- Left sidebar: Navigation (Dashboard, Orders, Products, Inventory, Retailers, Invoices, AICA, Settings)
- Design: Light mode (Snow bg). Information-dense but not overwhelming. Data-driven dashboard style with real-time monitoring feel. Status dots pulse for critical items.

2. RETAILER CREDIT DETAIL VIEW:
- Header: Retailer name, phone, location, risk badge
- Credit gauge: Circular or linear progress showing used vs available credit (e.g., "₹68,400 / ₹50,000 limit — 136%"). Red when exceeded.
- Payment history timeline: Last 6 months of payments with amounts and dates
- Order history table: Recent orders with status badges
- AI recommendation panel: "Recommended action: Reduce credit limit to ₹40,000 and require 50% advance payment"
- Action buttons: Send reminder (WhatsApp), Pause credit, Adjust limit, Call
- Design: Clean detail page. Important numbers in JetBrains Mono. Alert colours for exceeded limits.

3. RETAILER STOREFRONT (what the retailer sees):
- Mobile-first design (375px primary viewport)
- Top: Wholesaler's business name and logo (branded)
- Credit status banner: "You've used 86% of your credit limit" with green/amber/red colour
- Search bar for products
- Product category tabs (horizontal scroll)
- Product grid: Cards with product image, name, price, "Add to cart" button
- Bottom: Cart tab with item count badge
- My account: Outstanding balance, order history, invoices
- Design: Clean e-commerce feel. Mobile-optimized. The branded storefront should look professional — this is what the wholesaler shows their retailers.

4. AI ASSISTANT (AICA) CHAT SCREEN:
- Chat interface with message bubbles
- AICA messages have navy avatar with green "AI"
- Support for Hindi/English/Hinglish queries
- Example conversation:
  User: "Mera sabse zyada baki kispe hai?"
  AICA: "Rajesh ji, aapka sabse zyada outstanding Priya Sharma pe hai — ₹68,400. Unka payment 45 din overdue hai. Kya main unhe WhatsApp reminder bhejun?"
- Suggested prompts at bottom: Quick-tap chips for common questions
- Design: Clean chat UI. Message bubbles with subtle bg colours. Key numbers highlighted.

5. ORDERS LIST:
- Filter tabs: All, Pending, Confirmed, Dispatched, Delivered
- Order cards: Retailer name, order number, items count, total amount, status badge, timestamp
- Bulk actions: Select multiple → Confirm / Dispatch
- Search and sort (by date, amount, retailer, status)
- Design: List view with clear status indicators. Efficient for daily order processing.

6. INVOICE VIEW:
- GST-compliant layout: Seller details, buyer details, GSTIN numbers
- Item table: Name, HSN code, qty, rate, GST breakup (CGST/SGST), total
- Totals section: Subtotal, GST, Grand total in JetBrains Mono
- Actions: Download PDF, Share via WhatsApp, Print
- Status: Paid (green), Partially paid (amber), Unpaid (red), Overdue (red + badge)
- Design: Professional, clean invoice template with wholesaler's branding.

7. LANDING PAGE:
- Hero: Navy bg, large Lexend heading "Aapke business ka brain — hamesha alert", sub-heading explaining the platform, two CTAs (Start free pilot + Watch demo), dashboard mockup floating right
- Problem section: 3 pain-point cards with red accents
- Solution: Three-layer framework (Accounting → Intelligence → Commerce)
- Features: 6 cards (Storefront, Credit Intelligence, Accounting, Inventory, AICA, WhatsApp)
- How it works: 4-step timeline
- Pricing: "Starting at ₹500/month"
- Trust signals: "Made in India", encryption badge
- CTA: Navy bg section with Hinglish heading
- Footer: Links, contact, social
- Design: Trust & Authority style. Professional but warm. Bilingual headings. Mobile-responsive.

8. SOCIAL MEDIA TEMPLATES (Instagram 1080×1080):
- Template A: Feature spotlight — Navy bg, green accent, large heading, supporting text, CTA
- Template B: Statistic — Large green number centered, supporting statement, logo
- Template C: Before/After — Split red/green layout showing pain vs solution
- Always include EcomAI logo. Use Lexend for headings, Source Sans 3 for body.

DESIGN PRINCIPLES:
- Trust-first: Every screen should feel reliable and professional
- Data-dense but readable: Wholesalers need information, not decoration
- Indian-first: Hindi/Hinglish support, Indian number formatting, INR currency, Indian colour sensibility
- Mobile-first: Design for 375px smartphones first, then scale up
- Action-oriented: Every alert should have a clear next action
- Semantic colour: Green = good, Amber = attention, Red = problem. Consistent everywhere.
- Accessibility: WCAG AA minimum. 4.5:1 contrast. 44px touch targets. Focus states visible.
- Performance: <3s load on 4G. WebP images. Lazy loading below fold.

AVOID:
- Playful or casual design — this is a business tool handling real money
- AI purple/pink gradient aesthetics — looks gimmicky for this audience
- Dense enterprise UI — keep it clean, not overwhelming
- English-only copy — always include Hindi/Hinglish variants
- Decorative animations — use motion only for status indicators and transitions
- Generic SaaS templates — this needs to feel built for Indian wholesale trade
```

---

## Part 10: CSS Custom Properties (Copy-Paste Ready)

```css
:root {
  /* Primary */
  --navy-900: #0F172A;
  --navy-800: #1E293B;
  --slate-700: #334155;
  --slate-500: #64748B;
  --slate-300: #CBD5E1;
  --slate-200: #E2E8F0;
  --snow: #F8FAFC;
  --white: #FFFFFF;

  /* Accent */
  --blue: #2563EB;
  --blue-light: #EFF6FF;
  --blue-dark: #1E40AF;
  --green: #22C55E;
  --green-light: #F0FDF4;
  --green-dark: #166534;
  --amber: #F59E0B;
  --amber-light: #FFFBEB;
  --amber-dark: #92400E;
  --red: #EF4444;
  --red-light: #FEF2F2;
  --red-dark: #991B1B;

  /* Extended */
  --purple: #8B5CF6;
  --cyan: #06B6D4;
  --pink: #EC4899;
  --lime: #84CC16;

  /* Typography */
  --font-heading: 'Lexend', sans-serif;
  --font-body: 'Source Sans 3', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Radius */
  --radius-sm: 4px;
  --radius: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --snow: #0F172A;
    --white: #1E293B;
    --slate-200: #334155;
    --slate-500: #94A3B8;
    --slate-700: #CBD5E1;
    --navy-900: #F8FAFC;
  }
}
```

### Tailwind Config Addition

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: { 800: '#1E293B', 900: '#0F172A' },
        snow: '#F8FAFC',
        trust: '#2563EB',
        growth: '#22C55E',
        alert: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        heading: ['Lexend', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        pill: '999px',
      },
    },
  },
}
```

---

*This document is the single source of truth for all EcomAI visual design. Every social media post, landing page section, application screen, and investor-facing material should reference these specifications.*
