# Extra Team Dashboard — Sales & Pricing Guide

**Audience:** Decision makers, operations managers, and procurement  
**Format:** Sales brochure (export to PDF — see [Export to PDF](#export-to-pdf) below)  
**Live reference:** https://app.pcsmonthlypla.online

---

## Executive summary

**Extra Team Dashboard** replaces fragmented scheduling (spreadsheets, chat, paper) with one secure web application for cleaning and field-service teams.

Your team gets:

- **Clarity** — monthly grid shows every assignment at a glance.
- **Detail** — weekly showcase holds site-specific instructions your staff actually need on the job.
- **Control** — admins plan; staff view; data stays on **your server**.
- **Flexibility** — custom columns, themes, and approval-based onboarding without per-user license fees.

Built from a production deployment for **Extra Team**. Ready to deploy for your organization with optional managed setup and support.

---

## Who benefits

| Stakeholder | Outcome |
|-------------|---------|
| **Field staff** | See today’s job on their phone — shift, location, car, instructions |
| **Schedulers / admins** | Plan months and weeks in minutes, not hours |
| **Operations** | Automatic hour totals for payroll and capacity planning |
| **Management** | One source of truth; fewer missed shifts and miscommunication |
| **IT / security** | Self-hosted data, HTTPS, admin-gated access, audit-friendly logging |

---

## Product capabilities

### 1. Main dashboard — monthly workforce grid

- Full month view: **days × team members**
- Per assignment: shift time, company, task (rich text), car, transport type, location
- Colour-coded status indicators (Start from PCS Driving, Start from Customer, Paid Holiday, Vacation, Sick leave, etc.)
- **Hour summaries:** monthly total and weekly average per person; daily team total
- Mobile-friendly with sticky date columns
- Personal column highlight so each user finds their schedule quickly

### 2. Weekly showcase — operational job sheets

- Week-by-week planning with fields for customer, site, keys, alarm, instructions, equipment, max hours
- **Custom columns** — add fields your business needs (e.g. parking, contact person)
- **Show / hide columns** — simplify the view without deleting data
- **Rename headers** and apply highlight styles for critical columns
- **Multiple rows per week** for several jobs in the same period
- Rich text and links inside cells

### 3. Team access & security

- Staff **self-register**; admin **approves** before access
- Secure login (hashed passwords, JWT + refresh tokens)
- Password reset via email
- **Admin** vs **approved user** roles — only admins edit schedules
- Rate limiting on auth endpoints

### 4. Experience

- Light / dark mode
- Responsive on phone, tablet, desktop
- No native app required — any modern browser
- Branded header (your logo and title)

---

## How it works (simple)

```
Your team’s phones & laptops
        ↓  HTTPS
   Cloudflare (DNS + security)
        ↓
   Your server (private network)
   • Web app  • API  • PostgreSQL database
```

Staff open a URL like `https://app.yourcompany.com`. Admins log in and update plans. Changes save instantly and appear for the whole team.

**Typical rollout timeline:** 3–7 business days from signed agreement to production URL (depending on domain and hosting choices).

---

## Pricing overview

All prices below are **indicative list prices in EUR**. Adjust for your market, currency, and contract terms. There is **no per-user fee** inside the application.

### A. One-time setup

| Item | Price | Includes |
|------|-------|----------|
| **Standard deployment** | **€1,490** | Server hardening checklist, PostgreSQL, app install, Cloudflare Tunnel, domain wiring, env configuration, first admin user, smoke test, handover document |
| **Branded deployment** | **€1,990** | Everything in Standard + custom logo/title in app header, sidebar branding review, 1h admin training call |
| **Migration assist** | **€490** | Import guidance from spreadsheet (up to 2 source files), column mapping workshop, validation pass |

*Customer provides or purchases: domain, VPS/host, Cloudflare account, transactional email (e.g. Resend). We configure; you retain ownership.*

### B. Monthly support packages

Choose one package for ongoing peace of mind. All packages assume **one production environment**.

| | **Essential** | **Standard** | **Premium** |
|---|:---:|:---:|:---:|
| **Monthly fee** | **€49** | **€99** | **€199** |
| **Best for** | ≤15 users, stable ops | 15–50 users, active planning | 50+ users or strict uptime needs |
| | | | |
| **Email support** | Business hours, 48h response | Business hours, 24h response | Business hours, 8h response |
| **Uptime monitoring** | Weekly manual check | Daily automated check + alert | 24/7 monitoring + monthly uptime report |
| **Security patches** | Quarterly dependency review | Monthly dependency review | Monthly + priority security fixes |
| **Backups** | Documentation + you run backups | We verify backup job monthly | Automated backup verification + restore drill 2×/year |
| **Application updates** | Bugfix releases | Bugfix + minor features | Bugfix + minor + scheduled enhancement hours |
| **Included dev hours** | — | 1 h/month | 4 h/month |
| **Admin training** | — | 30 min/quarter | 1 h/quarter |
| **SLA target** | — | 99.5% monthly | 99.9% monthly |
| **Incident response** | Best effort | Next business day | Same day (business hours) |

**Add-ons (any tier)**

| Add-on | Price |
|--------|-------|
| Extra production environment (staging) | €29/mo |
| Additional 5 support hours | €450 |
| Custom feature (scoped quote) | From €800 |
| On-site / extended training (remote) | €120/h |

### C. Infrastructure (paid by you, not marked up)

Typical monthly running costs — billed directly by your providers:

| Service | Typical cost |
|---------|----------------|
| VPS / small server (2 GB RAM+) | €5–25 / mo |
| Domain | ~€1 / mo (annual billing) |
| Cloudflare | €0 (free tier usually enough) |
| Transactional email (Resend etc.) | €0–20 / mo |
| **Typical total** | **€15–55 / mo** |

You own all accounts. No vendor lock-in on hosting.

---

## Package comparison — what to choose

| Your situation | Recommended |
|----------------|-------------|
| IT-savvy team, happy to self-manage | **Standard deployment** only, no monthly package |
| Small cleaning crew, want someone on call | **Standard deployment** + **Essential** |
| Regular schedule changes, growing headcount | **Branded deployment** + **Standard** |
| Payroll depends on hour summaries, many sites | **Branded deployment** + **Premium** |
| Moving off Excel/WhatsApp | **Standard deployment** + **Migration assist** + **Standard** |

---

## Implementation roadmap

### Phase 1 — Discovery (Day 1–2)
- Confirm team size, admin count, domain, and hosting preference
- Review weekly columns and monthly fields you use today
- Agree support tier and training needs

### Phase 2 — Deploy (Day 3–5)
- Provision server and database
- Configure Cloudflare Tunnel and HTTPS
- Deploy API + web client as systemd services
- Create first admin account and verify auth email

### Phase 3 — Onboard (Day 5–7)
- Admin training: monthly grid, weekly showcase, user approval
- Pilot with 3–5 team members
- Go-live announcement and registration instructions

### Phase 4 — Steady state (ongoing)
- Support per selected package
- Optional enhancement hours for new columns or workflow tweaks

---

## Flexibility — built for real operations

| Business need | How the product adapts |
|---------------|-------------------------|
| Different clients need different fields | Add custom weekly columns anytime |
| Screen too busy for mobile | Hide columns; restore later |
| Terminology differs by region | Rename column headers |
| Multiple jobs same week | Add rows on weekly showcase |
| New hire starts Monday | They register; admin approves same day |
| Seasonal planning | Navigate any month or calendar week |
| Staff preference | Light or dark theme per user |

---

## Security & compliance talking points

- Data stored in **PostgreSQL on your infrastructure**
- Public access via **Cloudflare Tunnel** — no open web ports on the server
- Passwords hashed; sessions use httpOnly cookies
- Admin approval gate before any schedule access
- Documented security logging and audit scripts (`deploy/SECURITY-LOGGING.md`)
- Suitable for teams that need **data residency control** (EU server of your choice)

---

## Objection handling (quick answers)

**“We already use Excel.”**  
Excel doesn’t give field staff a live mobile view, automatic hour totals, or per-site weekly instructions in one app. We can help migrate your current sheets.

**“Another subscription per user?”**  
No. Pricing is setup + optional flat monthly support. Add as many approved users as your server supports.

**“What if our process changes?”**  
Weekly columns are admin-configurable. Standard and Premium packages include hours for small workflow adjustments.

**“Do cleaners need to install an app?”**  
No. They use the browser on their phone.

**“Who owns the data?”**  
You do. Database and server accounts are in your name.

---

## What's included vs. not included

**Included in deployment**
- Application as deployed in this repository
- Production configuration templates (`deploy/`)
- Admin handover checklist
- Documentation (`PRODUCT.md`, `DOCUMENTATION.md`)

**Not included unless scoped**
- Custom mobile native apps
- Payroll system integration
- Multi-tenant SaaS hosting on our infrastructure
- 24/7 phone support (Premium is business-hours SLA)
- Legal/compliance certification (SOC2, etc.)

---

## Documents in this package

| File | Use |
|------|-----|
| **PRODUCT-ONE-PAGER.md** | Email attachment, leave-behind, conference handout |
| **PRODUCT-SALES.md** (this file) | Proposals, pricing discussions, PDF brochure |
| **PRODUCT.md** | Full product guide for customers after purchase |
| **DOCUMENTATION.md** | Technical reference for IT |

---

## Export to PDF

From the project root, with [Pandoc](https://pandoc.org/) installed:

```bash
# One-pager (compact)
pandoc PRODUCT-ONE-PAGER.md -o Extra-Team-Dashboard-One-Pager.pdf \
  --pdf-engine=wkhtmltopdf -V margin-top=15mm -V margin-bottom=15mm

# Sales brochure
pandoc PRODUCT-SALES.md -o Extra-Team-Dashboard-Sales.pdf \
  --pdf-engine=wkhtmltopdf -V margin-top=20mm -V margin-bottom=20mm
```

Alternative: open the `.md` file in VS Code / Cursor → **Markdown PDF** extension → Export.

For print-ready branding, add your logo and contact block to the PDF cover page in your design tool.

---

## Proposal footer (customize)

**Prepared for:** ___________________________  
**Valid until:** ___________________________  
**Contact:** ___________________________  
**Selected package:** ☐ Setup only  ☐ Essential  ☐ Standard  ☐ Premium  

---

*Extra Team Dashboard — workforce scheduling and weekly job planning for field teams.*
