# Extra Team Dashboard — Client Project Overview

**Document for:** Prospective clients & decision makers  
**Product:** Extra Team Dashboard (workforce scheduling for cleaning & field teams)  
**Live example:** https://app.pcsmonthlypla.online  

---

## 1. What this product is

**Extra Team Dashboard** is a secure web application that replaces messy spreadsheets, chat messages, and paper schedules with **one clear place** for your team to see:

- **Who works when** (monthly calendar)
- **What each person should do** (company, task, car, transport, location)
- **Site details for the week** (keys, alarm, instructions, equipment, hours)
- **Personal work view** (each staff member sees their own jobs as cards; managers see the whole team)

Staff open it in a normal browser on phone or computer — **no app store install**.

---

## 2. Who it helps

| Role | Benefit |
|------|---------|
| **Field staff** | Clear daily assignments on mobile; less confusion |
| **Schedulers / admins** | Plan months and weeks in one tool; less re-typing |
| **Office / payroll support** | Automatic hour totals for the month and per day |
| **Business owner** | One source of truth; fewer missed jobs and miscommunication |

Built for cleaning and field-service companies, and suitable for any team that schedules people by day and needs detailed weekly job sheets.

---

## 3. Application features (what your client gets)

### Main dashboard — monthly planning board
- Full month view: **each day × each team member**
- Per job: shift time, company, task description, vehicle, transport type, location (text or map link)
- Colour indicators for transport (own car, company car, bike, public transport, taxi, etc.)
- **Today’s row** lightly highlighted so everyone finds the current day quickly
- Automatic summaries: hours per person (month), average per week, total hours per day
- Easy month navigation (past and future)

### Weekly showcase — detailed job sheets
- Week-by-week operational information (customer, site, keys, alarm, instructions, equipment, max time, and more)
- Admins can **add, hide, rename, and restore columns** to match how your business works
- Multiple job lines per week
- Rich text and links in cells

### My work / Staffs — personal cards
- **Team members** see only **their own** jobs as easy-to-read cards
- **Administrators** see **all staff** cards, grouped by person (“Staffs”)
- Same month navigation as the main dashboard

### Accounts & security (simple for users)
- Staff register themselves; admin **approves** before they can use the system
- Secure login and logout
- Password reset by email
- Admins manage users from the sidebar (approve / remove pending accounts)
- Light and dark mode

### Everyday experience
- Works on **phone, tablet, and desktop**
- Sidebar navigation: Main dashboard · Weekly showcase · My work / Staffs
- Branded header with your team logo and title
- Changes save immediately and are shared with the whole team

---

## 4. How a typical week looks

1. Admin opens the **Main dashboard** and assigns jobs for the month.  
2. Admin fills **Weekly showcase** with site instructions for the calendar week.  
3. Staff log in on their phone, open **My work**, and see their cards.  
4. On the job, they check shift, location, and weekly instructions.  
5. At month end, office reviews the **hour summaries** on the main dashboard.

---

## 5. Technology overview (non-technical)

You do **not** need to know programming to buy or use the product. This section only explains “what sits under the hood” for IT or procurement.

| Layer | In plain language | Technology used |
|-------|-------------------|-----------------|
| **Frontend** | The screens your team sees and clicks | Modern web app (Next.js / React) |
| **Backend** | The “brain” that checks login and saves data | API service (Express) |
| **Database** | Permanent storage of users, schedules, and weekly details | PostgreSQL |
| **Hosting** | Runs on a server you (or we) control | Linux server / VPS (or office machine) |
| **Cloudflare** | Public website address, HTTPS lock, and protection | DNS + SSL + security |
| **Cloudflare Tunnel** | Secure connection from the internet to your server **without opening public ports** | cloudflared |

### Simple picture

```
Staff phones & PCs
        ↓  secure HTTPS
   Cloudflare (domain + protection)
        ↓  private tunnel
   Your server
     • Web interface (frontend)
     • API (backend)
     • Database (PostgreSQL)
```

**Why this matters for the customer**
- Data stays on **your infrastructure** (not a shared multi-tenant SaaS by default).
- Access is over **HTTPS**.
- The tunnel design keeps the database and app ports **off the open internet**.
- Unlimited approved users within normal server capacity — **no per-seat fee inside the app**.

---

## 6. What is included vs optional

**Included in the product**
- All features listed above  
- Admin and staff roles  
- Documentation for setup and use  
- Ability to brand logo / title for your company  

**Usually arranged with your provider (optional packages)**
- Server setup and Cloudflare Tunnel  
- Domain name and DNS  
- Email setup for password reset  
- Training and ongoing support  

*(For package prices and support tiers, see [PRODUCT-SALES.md](./PRODUCT-SALES.md).)*

---

## 7. Why clients buy it (benefits in plain language)

| Benefit | What that means for the client |
|---------|--------------------------------|
| **Clarity** | Everyone sees the same live schedule — no “wrong version” of the sheet |
| **Mobile-ready** | Field staff use **My work** on the phone; no special app install |
| **Less admin time** | Plan once on the monthly grid + weekly showcase; staff read it themselves |
| **Hours without spreadsheets** | Daily and monthly totals + Staff KPI vs working limit |
| **Flexible weekly detail** | Add/hide/rename columns for keys, alarm, equipment, and more |
| **Private & secure** | Individual logins, admin approval, password reset by email; data on your server |
| **No per-seat fee in the app** | Unlimited approved users within normal server capacity |
| **Proven** | Built for real monthly cleaning planning (Extra Team production use) |

**Full client benefit script:** [CLIENT-BENEFITS.md](./CLIENT-BENEFITS.md)

---

## 8. Next steps for a sales conversation

1. **Share this overview** with the decision maker.  
2. **Book a short demo** on the live example: https://app.pcsmonthlypla.online  
3. **Agree** setup-only vs setup + monthly support.  
4. **Go live** with domain, first admin, and team registration.  

**Contact:** _______________________________  
**Prepared for:** _______________________________  
**Date:** _______________________________  

---

## Related documents

| Document | Best for |
|----------|----------|
| **CLIENT-OVERVIEW.md** (this file) | Send to customers — features + light tech overview |
| [CLIENT-BENEFITS.md](./CLIENT-BENEFITS.md) | Explain **why** the client benefits — pitch, roles, vs spreadsheet |
| [PRODUCT-ONE-PAGER.md](./PRODUCT-ONE-PAGER.md) | Short leave-behind / email attachment |
| [PRODUCT-SALES.md](./PRODUCT-SALES.md) | Pricing & support packages |
| [PRODUCT.md](./PRODUCT.md) | Full product guide after purchase |
| [DOCUMENTATION.md](./DOCUMENTATION.md) | Technical / developer reference |

---

*Extra Team Dashboard — who works when, what they do, and what they need on site — in one secure place.*
