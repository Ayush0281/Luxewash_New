# 🫧 LuxeWash - Premium Doorstep Laundry & Dry Cleaning Web App

An ultra-modern, dynamic, and production-ready web application built for on-demand laundry, dry cleaning, and garment care services. Equipped with an interactive service catalog, quantity-based live cart, dynamic pricing & coupon engine, calibrated dark mode, and real-time automated customer confirmation emails via EmailJS.

---

## 🚀 Live Demo

- 🌐 **Live Website**: [https://luxewash0.netlify.app/](https://luxewash0.netlify.app/)
- 💻 **GitHub Repository**: [https://github.com/Ayush0281/Luxewash_New](https://github.com/Ayush0281/Luxewash_New)

---

## ✨ Features

### 🛍️ Dynamic Services & Smart Cart Engine
- **Category Filter Tabs**: Easily filter between *Dry Cleaning*, *Daily Wash & Fold*, *Steam Pressing*, *Luxury Couture*, and *Home Linens*.
- **Itemized Quantity Control**: Add services and modify quantities (`+` / `-`) in real-time.
- **Smart Delivery Threshold**: Orders over ₹499 automatically receive **Free Delivery** (standard ₹50 otherwise).
- **Express Turnaround Toggle**: Optional 6-hour express delivery (+₹99 surcharge).
- **Promo Coupon System**: Supports discount codes like `WELCOME10` (10% OFF), `WELCOME20` (20% OFF), and `FRESH50` (₹50 Flat OFF).

### 📧 Automated Customer Confirmation (EmailJS)
- **Instant Booking Confirmation**: Automatically emails the complete order bill, scheduled pickup date/time slot, and address directly to the customer's Gmail.
- **Newsletter Subscription**: Welcome email with an instant **10% OFF Welcome Coupon (`WELCOME10`)** delivered straight to subscriber's inbox.
- **Digital Order Receipt Modal**: Instant printable order slip with unique Order ID (`#LND-XXXXXX`).

### 🌓 Calibrated Dark / Light Mode
- Deep slate blue palette (`#090d16` background and `#131c31` cards) with luminous cyan accents.
- Animated Sun ☀️ / Moon 🌙 toggle button.
- State saved in `localStorage` and syncs with system OS preferences.

### 🎨 UI & UX Design
- **Typography**: Google Fonts (*Plus Jakarta Sans* and *Outfit*).
- **Micro-Animations**: Floating ambient background bubbles, card hover elevations, smooth scroll navigation, and interactive FAQ accordion.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System & CSS Variables), JavaScript (ES6+)
- **Email Service**: EmailJS Browser SDK
- **Icons & Fonts**: FontAwesome 6, Google Fonts
- **Deployment & Hosting**: Netlify

---

## 🔐 Environment & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Ayush0281/Luxewash_New.git
   cd Luxewash_New
   ```

2. Configure EmailJS Credentials:
   - Duplicate `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your EmailJS keys in `.env` (kept safe and ignored by `.gitignore`).

---

## 📄 License & Credits

Developed with ❤️ by **Sarthak Rana**.  
All rights reserved © 2026 LuxeWash.
