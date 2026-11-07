# 🌊 RumorFlow Tracker

### *Real-Time Cross-Media Disinformation Tracking & Flow Analysis Platform*

[![Status](https://img.shields.io/badge/Status-Operational-10b981.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-Port%203000-0284c7.svg)](http://localhost:3000)
[![Backend](https://img.shields.io/badge/Backend-Port%205000-6366f1.svg)](http://localhost:5000)
[![Languages](https://img.shields.io/badge/Languages-Telugu%20%7C%20Hindi%20%7C%20English-f59e0b.svg)]()
[![Theme](https://img.shields.io/badge/Theme-Dark%20%26%20Light%20Mode-8b5cf6.svg)]()

---

## 📌 Executive Summary

Digital media and messaging platforms operate at unprecedented velocity, allowing false allegations, manipulated media, and unvetted rumors to spread rapidly across digital newsrooms. In multi-lingual societies, disinformation frequently transforms across languages through a copy-paste process known as **"The Chain of Misinformation"**—where an initial seed on social media is replicated by regional aggregators to artificially inflate search rankings and perceived credibility.

**RumorFlow Tracker** is an intelligence platform designed to monitor online media outlets, identify flows of information in real time, and detect coordinated disinformation networks. The platform isolates verbatim passages, extracts factual claims, highlights named entities, and visualizes the network of relationships across **Telugu**, **Hindi**, and **English** media.

---

## ✨ Key Features

1. **Multi-Lingual Ingestion & Filtering:**
   * Full cross-media tracking supporting **Telugu (`te`)**, **Hindi (`hi`)**, and **English (`en`)**.
   * Outlets tracked: *Eenadu (ఈనాడు), Sakshi (సాక్షి), NDTV India (एनडीटीवी), Dainik Bhaskar (दैनिक भास्कर), Navbharat Times (नवभारत), The Hindu, BBC News India*.

2. **The Chain of Misinformation (Narrative Clusters):**
   * Groups articles reproducing identical claims or excerpts.
   * Visualizes the chronological dissemination timeline from initial social seed to mainstream news coverage.

3. **Interactive Flow Network Graph:**
   * Dynamic HTML5 Canvas graph illustrating relationships between newsroom hubs, published stories, and cross-republication links.
   * Theme-adaptive canvas colors matching light and dark modes.

4. **Modern UI/UX with Dual Theme Support:**
   * **Collapsible Side Panel:** Expands for full menu labels or collapses into a compact 74px icon rail with saved preference.
   * **Dark & Light Mode:** Fast, zero-lag theme switch conveniently positioned on the top-right corner.

5. **AI Rumor & Claim Analyzer:**
   * Submit any URL or raw text in English, Telugu, or Hindi for automated risk evaluation, claim extraction, and entity classification.

6. **Deep Fact-Check Inspection Modal:**
   * Detailed breakdown of veracity ratings (*Fabricated*, *Disputed*, *Verified*), direct quotes with sentiment analysis, and Named Entity Recognition (NER).

---

## 🏗️ System Architecture

```
                          ┌───────────────────────────┐
                          │   RumorFlow Frontend UI   │
                          │   Port 3000 (Vanilla JS)  │
                          └─────────────┬─────────────┘
                                        │ Proxy (/api/*)
                                        ▼
                          ┌───────────────────────────┐
                          │  RumorFlow REST API Core  │
                          │     Port 5000 (Node.js)   │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│   Telugu Pipeline  │       │   Hindi Pipeline   │       │  English Pipeline  │
│  Eenadu / Sakshi   │       │  NDTV / Bhaskar    │       │ The Hindu / BBC    │
└────────────────────┘       └────────────────────┘       └────────────────────┘
```

---

## 📂 Repository Structure

```
Rumor-Flow-Tracker/
├── README.md              # Main project documentation & overview
├── FRONTEND.md            # Detailed frontend architecture & design system
├── BACKEND.md             # Detailed backend API specifications & endpoints
├── start.js               # Concurrent launcher for Frontend & Backend
├── start.bat              # Double-clickable Windows launch script
├── backend/
│   ├── server.js          # REST API & NLP simulation engine (:5000)
│   └── package.json       # Backend configuration
└── frontend/
    ├── server.js          # Static web server & API reverse proxy (:3000)
    ├── package.json       # Frontend configuration
    └── public/
        ├── index.html     # Single-Page Application markup
        ├── style.css      # Dark & Light mode styles, Plus Jakarta Sans font
        └── app.js         # Reactive UI logic, theme switch & canvas graph
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.x or v20.x or v22.x) installed on your system.

### One-Click Launch (Recommended)
Double-click the Windows batch script:
```powershell
start.bat
```
*Or launch via terminal:*
```powershell
node start.js
```

Both services will spin up simultaneously:
* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** [http://localhost:5000](http://localhost:5000)
* **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📖 In-Depth Documentation

* For frontend component details, themes, and canvas rendering, see [FRONTEND.md](FRONTEND.md).
* For API route specifications, request/response payloads, and NLP logic, see [BACKEND.md](BACKEND.md).

---

## 🗄️ Database Roadmap
RumorFlow is architected to seamlessly plug into persistent databases:
* **MongoDB (Atlas / Local):** Directly stores hierarchical articles, extracted claims, quotes, and syndication timelines.
* **SQLite:** Portable embedded zero-configuration database option (`rumorflow.sqlite`).

---

## 📄 License
This project is licensed under the MIT License.
