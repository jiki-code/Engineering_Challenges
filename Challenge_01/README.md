# 🛡️ Engineering_Challenges — AI Challenge 01: Insurance Plan Comparison Page

An interactive, responsive, and clear side-by-side **Health Insurance Plan Comparison Page** built for **AI Challenge 01**. 

This application renders plan tiers (Bronze, Silver, Gold), highlights the best values across benefit rows, provides interactive tooltips for non-technical users, and features mobile-optimized tabbed navigation.

---

## ✨ Features & Evaluation Checklist

- [x] **Correct Data Rendering:** Renders exact plan dataset without missing or hardcoded values.
- [x] **Side-by-Side Comparison Table:** Clear 4-column matrix on desktop displays.
- [x] **Visual Indicators:** Green checkmark badge for included benefits, muted strikethrough for non-included benefits (`null`), and amber badge for `-1` (Unlimited).
- [x] **Highlight Best Value in Each Row:** Automated comparison algorithm highlights the best value for every benefit row (e.g., highest limit, 0% copay, lowest waiting period).
- [x] **"Recommended" Badge:** Silver Plan is highlighted with a gradient badge based on the best value-for-money ratio.
- [x] **Responsive Layout:** Stacks cleanly with sticky tabbed navigation on mobile viewports (< 768px).
- [x] **Interactive Billing Toggle:** Switch between Monthly and Annual billing (with 10% annual savings calculation).
- [x] **Term Tooltips:** Explains technical terms (Copay, Waiting Period, Outpatient, Inpatient) on hover/click.
- [x] **Clean Architecture:** Modular React component design with Tailwind CSS styling.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Custom Glassmorphism CSS
- **Iconography:** Lucide React (`Check`, `X`, `Shield`, `Sparkles`, `Star`)
- **Animation:** Framer Motion
- **Design System:** Dark Theme (Slate 950 / Cyan / Gold)

---

## ⏱️ Timeline & Problem Decomposition

### Estimated Timeline: 2.5 – 3 Hours

| Phase | Milestone / Task | Status |
| :--- | :--- | :---: |
| **Phase 1** | Setup Vite + React + Tailwind CSS project architecture & TypeScript/JS types | ✅ Complete |
| **Phase 2** | Build data structures & row-by-row `bestValue` calculator utilities | ✅ Complete |
| **Phase 3** | Implement Desktop 4-column side-by-side comparison table & visual indicators | ✅ Complete |
| **Phase 4** | Build Mobile Tabbed comparison view & interactive term tooltips | ✅ Complete |
| **Phase 5** | Add Billing Cycle toggle (Monthly/Annual), Enrollment Modal & README documentation | ✅ Complete |

---

## 🧠 AI Tool Direction Strategy (How AI Was Guided)

1. **Problem Decomposition:** Divided the task into modular layers: Data Model -> Logic Utility -> Desktop View -> Mobile View -> Polish & Interactive Modal.
2. **Data Integrity:** Strict enforcement of original plan JSON fields with zero data alteration.
3. **UX First Approach:** Formatted `-1` as `"Unlimited"` for clarity and added row-level badges for non-technical users.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/insurance-plan-comparison.git
cd insurance-plan-comparison

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

---

## 📦 Deployment

This project is configured for one-click deployment on **Vercel**, **Netlify**, or **GitHub Pages**.

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
