# ⚙️ RumorFlow Tracker — Backend Documentation

## 1. Overview
The **RumorFlow Tracker Backend** provides the RESTful API and intelligence engine powering the RumorFlow platform. It handles ingestion feed management, cross-lingual narrative clustering, NLP extraction (claims, quotes, and named entities), semantic similarity attribution, and network graph topology generation.

---

## 2. Technology Stack & Design Decisions
* **Runtime:** Node.js (v18+ / v22+)
* **Core Modules:** Native `http`, `url`, and `child_process` modules (zero external npm dependency footprint for fast startup and rock-solid portability on Windows/macOS/Linux).
* **CORS Handling:** Full CORS preflight (`OPTIONS`) support with permissive development headers.
* **Architecture:** Modular RESTful service running on port `5000`.
* **Multi-Lingual Engine:** Structured for Indic and international language pipelines (Telugu `te`, Hindi `hi`, English `en`).

---

## 3. Directory Structure

```
backend/
├── server.js              # REST API server & ingestion engine (:5000)
└── package.json           # Backend package configuration & scripts
```

---

## 4. API Endpoints Reference

### 1. `GET /api/health`
Returns the operational health and uptime of the backend service.
* **Sample Response:**
  ```json
  {
    "status": "healthy",
    "service": "RumorFlow Core Backend API",
    "version": "2.0.0",
    "uptime": 125.4,
    "timestamp": "2026-11-07T05:00:00.000Z"
  }
  ```

---

### 2. `GET /api/stats`
Returns aggregated operational metrics for the overview dashboard.
* **Sample Response:**
  ```json
  {
    "totalArticles": 3848,
    "activeFeeds": 7,
    "totalFeeds": 8,
    "activeClusters": 2,
    "highRiskNarratives": 15,
    "nlpEngineStatus": "OPERATIONAL (Indic & Multi-Lingual Transformer)",
    "clusteringEngine": "Cross-Lingual Semantic Plagiarism Engine v2.4 (Active)",
    "graphStore": "Neo4j Flow Knowledge Graph (Live Memory Link)"
  }
  ```

---

### 3. `GET /api/articles`
Fetches the stream of monitored news articles with search and filtering capabilities.
* **Query Parameters:**
  * `q` (string): Search query against headline, outlet, or summary.
  * `risk` (string): Filter by risk level (`ALL`, `HIGH`, `MEDIUM`, `LOW`).
  * `lang` (string): Filter by language (`ALL`, `en`, `hi`, `te`).
* **Sample Response:**
  ```json
  {
    "articles": [
      {
        "id": "art-101",
        "title": "ఎన్నికల ఈవీఎంలపై సోషల్ మీడియాలో అసత్య ప్రచారం: ఫ్యాక్ట్ చెక్ లో వెల్లడైన వాస్తవాలు",
        "outlet": "Eenadu (ఈనాడు)",
        "sourceUrl": "https://www.eenadu.net/factcheck/evm-rumor-debunk",
        "author": "ఫ్యాక్ట్ చెక్ డెస్క్",
        "lang": "te",
        "topic": "ఎన్నికలు & భద్రత (Elections)",
        "riskScore": 89,
        "riskLevel": "HIGH",
        "similarityClusterId": "cluster-1",
        "similarityScore": 94.2,
        "summary": "ఎన్నికల సమయంలో ఈవీఎంల సిగ్నల్స్ రిమోట్ ద్వారా తారుమారు చేయవచ్చంటూ వాట్సాప్ గ్రూపులలో ప్రచారమవుతున్న వాయిస్ క్లిప్ నకిలీదని ఎన్నికల సంఘం ధృవీకరించింది.",
        "claims": [
          { "text": "ఈవీఎంలను రిమోట్ పరికరాల ద్వారా ప్రభావితం చేయవచ్చని వాదన.", "status": "Fabricated (అసత్యం)", "confidence": 0.96 }
        ],
        "quotes": [
          { "quote": "ఈవీఎంలు పూర్తి సురక్షితమైనవి మరియు పటిష్టమైన భద్రతా ప్రోటోకాల్ కలిగి ఉన్నాయి.", "speaker": "రాష్ట్ర ఎన్నికల ప్రధాన అధికారి", "sentiment": "Official" }
        ],
        "entities": [
          { "name": "Election Commission of India", "type": "Organization" },
          { "name": "Hyderabad", "type": "Location" }
        ],
        "publishedAt": "2026-11-07T04:22:30.376Z"
      }
    ],
    "count": 1
  }
  ```

---

### 4. `GET /api/articles/:id`
Retrieves full enriched fact-checking metadata for a specific article.

---

### 5. `GET /api/feeds`
Lists all tracked RSS media feeds and news outlets.
* Outlets tracked: **Eenadu (`te`)**, **Sakshi (`te`)**, **NDTV India (`hi`)**, **Dainik Bhaskar (`hi`)**, **Navbharat Times (`hi`)**, **The Hindu (`en`)**, **BBC News India (`en`)**, and **Viral Regional Wire (`te`)**.

---

### 6. `POST /api/feeds/toggle`
Pauses or resumes a specific scraper feed.
* **Request Body:** `{ "id": "f-1" }`
* **Response:** `{ "success": true, "feed": { ... } }`

---

### 7. `GET /api/clusters`
Returns narrative propagation clusters representing "The Chain of Misinformation".
* Includes origin seed source, propagation count, semantic duplication percentage, and chronological dissemination steps.

---

### 8. `GET /api/network`
Returns node and edge definitions for the interactive Flow Network Graph.
* **Nodes:** Media outlets and published articles with risk badges.
* **Edges:** Publication links (`PUBLISHED_BY`) and cross-outlet duplication links (`COPIED_NARRATIVE`).

---

### 9. `POST /api/analyze`
Simulates instant AI NLP parsing, entity extraction, and misinformation risk scoring on an submitted URL or text passage.
* **Request Body:**
  ```json
  {
    "title": "Claim headline",
    "outlet": "News outlet name",
    "url": "https://source.com/article",
    "text": "Full text of the story to inspect...",
    "lang": "te"
  }
  ```
* **Response:** Returns the newly created, scored, and indexed article object.

---

## 5. Steps Taken to Build the Backend

1. **Lightweight Architecture Selection:** Built an optimized REST API service in `backend/server.js` using Node.js standard libraries to eliminate bulky runtime setup.
2. **Indian Multi-Lingual Dataset Migration:** Replaced the legacy Greek dataset with verified media sources and authentic claims in **Telugu**, **Hindi**, and **English**.
3. **NLP Scoring & Extraction Logic:** Built text evaluation rules calculating misinformation risk (0–100%) and extracting structured claims, direct quotes, and named entities.
4. **Graph Edge Generation:** Created logic to automatically link published articles to their parent newsroom and link cluster stories via semantic duplication weights.
5. **CORS & Multi-Language Querying:** Built dynamic query filters for keyword searching, risk level sorting, and multi-lingual separation.

---

## 6. Database Roadmap (Next Phase)

Currently, the backend maintains the active dataset in memory with instant query capabilities. For persistent production storage, the architecture supports:
* **MongoDB (Atlas / Local):** Directly maps the JSON article schema, claims, quotes, and timeline arrays.
* **SQLite:** Embedded file-based SQL storage (`rumorflow.sqlite`) for offline zero-configuration persistence.

---

## 7. How to Run the Backend Locally

```bash
# Navigate to the backend directory
cd backend

# Start the API service (runs on port 5000)
node server.js
```
