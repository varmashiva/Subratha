# 🚀 Subratha Premium Laundry Platform

Subratha is a modern, premium SaaS-style laundry service platform built with a full-stack architecture. It features a B2C consumer flow with a frictionless multi-step booking engine, alongside a robust B2B enterprise portal designed specifically for hospitality partners.

---

## 🎨 Core Features
### Consumer Flow (B2C)
*   **Premium SaaS Design System**: Strict adherence to a luxury color palette (`#5b3e84`, `#f5f2f8`, `#b6a3ce`) powered by a custom glassmorphism CSS engine.
*   **Frictionless Authentication**: A centralized, glass-overlay modal handling both Google and Manual email/password states without page redirection.
*   **Multi-Step Order Engine**: A seamless, state-driven stepper UI taking users from Service Selection → Address Entry → Time Slot → Review & Confirmation.

### Enterprise Portal (B2B)
*   **Dedicated Hotel Dashboard**: A robust, sidebar-navigation portal separated from the consumer view.
*   **Dynamic Inventory Ordering**: Interactive item lists with `+`/`-` quantity selectors and live real-time price summations.
*   **Order Pipeline & Billing**: Table-based tracking pipeline using visual status badges, coupled with monthly billing summary panels, native **Print Invoice** functionality, and Razorpay UI integration.

---

## 🛠 Technology Stack
*   **Frontend**: React 19, Vite, Lucide-React (Iconography), CSS3 (Custom Variables & Animations).
*   **Backend**: Node.js, Express.js.
*   **Architecture**: Monorepo structure orchestrated via `concurrently`.

---

## 🚀 Run Instructions

```bash
# 1. Clone the repository and navigate into the root directory
cd Subratha

# 2. Install dependencies for the root, frontend, and backend simultaneously
npm run install:all

# 3. Start the application (runs both frontend and backend)
npm run dev

# 4. Open the application in your browser
http://localhost:5173/
```
