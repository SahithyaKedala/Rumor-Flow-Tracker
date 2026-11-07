# 🖥️ RumorFlow Tracker — Frontend Documentation

## 1. Overview
The **RumorFlow Tracker Frontend** is a high-performance, responsive single-page web dashboard designed for real-time monitoring, tracking, and attribution of viral rumors and cross-media disinformation. It provides fact-checkers, journalists, and researchers with visual intelligence tools to analyze information velocity and detect coordinated narrative propagation.

---

## 2. Technology Stack & Design System
* **Markup & Structure:** Semantic HTML5 with accessible ARIA labeling and clean component hierarchy.
* **Styling & Theming:** Custom CSS3 with dynamic CSS variables (`:root` for Dark Theme and `[data-theme="light"]` for Light Theme).
* **Typography:** `Plus Jakarta Sans` (Google Fonts) for UI typography and `JetBrains Mono` for metadata, timestamps, and confidence scores.
* **Interactive Visualizations:** Native HTML5 Canvas 2D API for the real-time **Flow Network Graph** (zero heavy external D3 or canvas libraries needed).
* **Client-Side Logic:** Vanilla JavaScript (ES6+) with zero build-step overhead, providing instant hot-reloading and high execution speed.
* **Web Server & Reverse Proxy:** Node.js HTTP server (`frontend/server.js`) on port `3000` serving static assets and proxying `/api/*` requests directly to the backend API on port `5000`.

---

## 3. Directory Structure

```
frontend/
├── server.js              # Node.js HTTP server & API reverse proxy (:3000)
├── package.json           # Frontend package metadata & start script
└── public/
    ├── index.html         # Single-Page Application (SPA) layout & modal dialogs
    ├── style.css          # Design system, CSS custom variables, light & dark mode styles
    └── app.js             # Reactive client logic, theme switcher, canvas graph & API client
```

---

## 4. Key Features & Components

### A. Collapsible Side Panel (Open / Close)
* **Collapse / Expand Toggle:** Controlled via a chevron toggle in the sidebar header as well as a panel toggle button in the topbar.
* **Adaptive Rail:** Collapses into a compact 74px icon-only rail to maximize dashboard workspace.
* **State Persistence:** Remembers user state across page reloads via `localStorage.getItem('rumorflow-sidebar-collapsed')`.

### B. Dark Mode & Light Mode (Top-Right Placement)
* **Switch Location:** Cleanly positioned on the far top-right corner of the topbar.
* **Color Schemes:**
  * **Dark Mode:** Deep space navy background (`#080d1a`), slate cards (`#111c33`), subtle glowing cyan borders (`#1c2c4f`).
  * **Light Mode:** Soft off-white canvas (`#f4f6fa`), clean white cards (`#ffffff`), high-contrast dark text (`#0f172a`), refined slate borders (`#e2e8f0`).
* **Zero Flash of Unstyled Theme (FOUT):** Inline pre-render script detects and applies saved theme preference before the DOM paints.

### C. Multi-Lingual News Feed (Telugu, Hindi, English)
* **Regional Coverage:** Greek content was removed and replaced with Indian regional and national media:
  * **Telugu (`te`):** Eenadu (ఈనాడు), Sakshi (సాక్షి).
  * **Hindi (`hi`):** NDTV India (एनडीटीवी), Dainik Bhaskar (दैनिक भास्कर), Navbharat Times (नवभारत).
  * **English (`en`):** The Hindu, BBC News India.
* **Instant Filtering:** Real-time search by headline, keyword, or outlet, filterable by Risk Level (`HIGH`, `MEDIUM`, `LOW`) and Language (`ALL`, `en`, `hi`, `te`).

### D. Interactive Flow Network Graph
* **Canvas-based Rendering:** Renders outlets as core hubs and articles as perimeter nodes.
* **Attribution Links:** Dashed red lines indicate detected copy-paste syndication (e.g. 94% narrative duplication).
* **Theme-Aware Canvas:** Dynamically recalibrates node colors, stroke opacity, and text contrast when switching between Light and Dark mode.

### E. Narrative Clusters & "The Chain of Misinformation"
* Visual timeline tracking how a rumor originates (e.g. anonymous WhatsApp voice note or Telegram post), replicates across regional blogs, and is refuted by verified fact-check releases.

### F. Deep Fact-Check Inspection Modal
Clicking any article opens a modal presenting:
1. **Veracity Status & Risk Banner:** Color-coded risk percentage.
2. **Extracted Claims:** Isolated claims classified as *Fabricated*, *Disputed*, or *Verified*.
3. **Direct Quotes & Sentiment:** Extracted statements with speaker attribution.
4. **Named Entities (NER):** Tagged entities (Organizations, Government bodies, Locations).

### G. AI Rumor & Claim Analyzer Tool
An interactive form allowing analysts to submit any URL or raw text snippet in English, Telugu, or Hindi to simulate instant NLP extraction and risk classification.

### H. "Simulate Live Influx" Generator
One-click simulation in the topbar that pushes real-time synthetic rumor items (in Telugu, Hindi, or English) into the live feed and updates statistics dynamically.

---

## 5. Steps Taken to Build the Frontend

1. **Architecture Planning:** Decided on a lightweight, zero-dependency Node.js static server with an integrated reverse proxy to avoid cross-origin CORS conflicts.
2. **HTML Layout Definition:** Structured `index.html` with distinct view panels (`#view-dashboard`, `#view-live-feed`, `#view-clusters`, `#view-network`, `#view-sources`, `#view-analyzer`) and an inspection modal.
3. **Responsive Design System (`style.css`):** Built custom properties for both dark and light modes, smooth card hover micro-interactions, responsive flex/grid wrappers, and custom scrollbars.
4. **Collapsible Sidebar Implementation:** Configured smooth CSS width transitions and icon-centering classes toggled via JavaScript.
5. **Theme Switcher Implementation:** Bound click listeners to write theme state to `data-theme` attribute and `localStorage`.
6. **Canvas Graph Logic (`app.js`):** Built trigonometric radial node distribution algorithms that dynamically position nodes and draw weighted connecting edges.
7. **Regional Media Integration:** Updated UI selectors and mock data to support Telugu, Hindi, and English.

---

## 6. How to Run the Frontend Locally

```bash
# Navigate to the frontend directory
cd frontend

# Start the frontend server (runs on port 3000)
node server.js
```
The interface is accessible in any modern browser at `http://localhost:3000`.
