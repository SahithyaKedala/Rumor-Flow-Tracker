// RumorFlow Frontend Application Logic
const API_BASE = '/api';

let state = {
  stats: {},
  articles: [],
  clusters: [],
  feeds: [],
  network: { nodes: [], edges: [] },
  activeTab: 'dashboard',
  selectedArticle: null
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  initClock();
  setupNavigation();
  setupEventListeners();
  loadAllData();
});

// Sidebar Management (Open / Close Panel)
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const savedSidebar = localStorage.getItem('rumorflow-sidebar-collapsed');
  
  if (savedSidebar === 'true') {
    sidebar?.classList.add('collapsed');
  }

  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const topbarToggle = document.getElementById('topbar-sidebar-toggle');

  function toggleSidebar() {
    document.documentElement.classList.remove('sidebar-init-collapsed');
    const isCollapsed = sidebar.classList.toggle('collapsed');
    localStorage.setItem('rumorflow-sidebar-collapsed', isCollapsed);
    if (state.activeTab === 'network') {
      setTimeout(renderNetworkGraph, 260);
    }
  }

  collapseBtn?.addEventListener('click', toggleSidebar);
  topbarToggle?.addEventListener('click', toggleSidebar);
}

// Theme Management (Light / Dark Mode)
function initTheme() {
  const savedTheme = localStorage.getItem('rumorflow-theme') || 'dark';
  applyTheme(savedTheme);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('rumorflow-theme', theme);

  const themeText = document.getElementById('theme-text');
  if (themeText) {
    themeText.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }

  // If network tab is active or canvas exists, re-render graph with theme-appropriate colors
  if (state.activeTab === 'network') {
    renderNetworkGraph();
  }
}

// Real-time Clock
function initClock() {
  const clockEl = document.getElementById('clock');
  function update() {
    const now = new Date();
    clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
  }
  update();
  setInterval(update, 1000);
}

// Tab Navigation
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;

  // Update nav buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const activePanel = document.getElementById(`view-${tabId}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // Update page title
  const titles = {
    'dashboard': 'Operational Overview',
    'live-feed': 'Real-Time Ingestion Feed',
    'clusters': 'Narrative Clusters & Chains',
    'network': 'Information Network Analysis',
    'sources': 'Monitored Media Outlets',
    'analyzer': 'AI Rumor & Claim Analyzer'
  };
  document.getElementById('page-title').textContent = titles[tabId] || 'RumorFlow Portal';

  // If network tab opened, draw graph
  if (tabId === 'network') {
    setTimeout(renderNetworkGraph, 50);
  }
}

// Event Listeners
function setupEventListeners() {
  // Search & Filter
  const searchInput = document.getElementById('article-search');
  const riskSelect = document.getElementById('filter-risk');
  const langSelect = document.getElementById('filter-lang');

  if (searchInput) searchInput.addEventListener('input', debounce(loadArticles, 250));
  if (riskSelect) riskSelect.addEventListener('change', loadArticles);
  if (langSelect) langSelect.addEventListener('change', loadArticles);

  // Quick Action Buttons
  document.getElementById('btn-simulate-feed').addEventListener('click', simulateIncomingArticle);
  document.getElementById('btn-quick-analyze').addEventListener('click', () => switchTab('analyzer'));

  // Analyzer Form
  document.getElementById('analyzer-form').addEventListener('submit', handleAnalysisSubmit);

  // Modal Close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('article-modal').addEventListener('click', (e) => {
    if (e.target.id === 'article-modal') closeModal();
  });
}

// Load Initial Data
async function loadAllData() {
  await Promise.all([
    loadStats(),
    loadArticles(),
    loadClusters(),
    loadFeeds(),
    loadNetworkData()
  ]);
}

// 1. Stats
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    state.stats = data;

    document.getElementById('stat-articles').textContent = (data.totalArticles || 0).toLocaleString();
    document.getElementById('stat-risk').textContent = data.highRiskNarratives || 0;
    document.getElementById('stat-clusters').textContent = data.activeClusters || 0;
    document.getElementById('stat-feeds').textContent = `${data.activeFeeds} / ${data.totalFeeds} Active`;
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

// 2. Articles
async function loadArticles() {
  try {
    const q = document.getElementById('article-search')?.value || '';
    const risk = document.getElementById('filter-risk')?.value || 'ALL';
    const lang = document.getElementById('filter-lang')?.value || 'ALL';

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (risk !== 'ALL') params.set('risk', risk);
    if (lang !== 'ALL') params.set('lang', lang);

    const res = await fetch(`${API_BASE}/articles?${params.toString()}`);
    const data = await res.json();
    state.articles = data.articles || [];

    document.getElementById('feed-count-badge').textContent = state.articles.length;

    renderArticlesList();
    renderDashboardRecent();
  } catch (err) {
    console.error('Error loading articles:', err);
  }
}

function renderArticlesList() {
  const container = document.getElementById('articles-list');
  if (!container) return;

  if (state.articles.length === 0) {
    container.innerHTML = `<div class="card" style="text-align:center; color:var(--text-muted); padding:30px;">No articles match your query.</div>`;
    return;
  }

  container.innerHTML = state.articles.map(a => {
    const riskPill = a.riskLevel === 'HIGH' 
      ? '<span class="pill pill-red">HIGH RISK (' + a.riskScore + '%)</span>'
      : (a.riskLevel === 'MEDIUM' ? '<span class="pill pill-amber">MEDIUM RISK (' + a.riskScore + '%)</span>' : '<span class="pill pill-green">VERIFIED (' + a.riskScore + '%)</span>');

    const formattedDate = new Date(a.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="article-card" onclick="openArticleModal('${a.id}')">
        <div class="article-card-top">
          <div>
            <div class="article-outlet-tag">${escapeHTML(a.outlet)} • <span style="font-family:var(--font-mono)">${a.lang.toUpperCase()}</span></div>
            <h3 class="article-title">${escapeHTML(a.title)}</h3>
          </div>
          <div>${riskPill}</div>
        </div>
        <p class="article-summary">${escapeHTML(a.summary)}</p>
        <div class="article-card-bottom">
          <div class="article-tags">
            <span class="tag-item">${escapeHTML(a.topic || 'General')}</span>
            ${a.similarityScore ? `<span class="tag-item" style="color:var(--accent-amber)">Similarity: ${a.similarityScore}%</span>` : ''}
          </div>
          <div>Published: ${formattedDate}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDashboardRecent() {
  const container = document.getElementById('dashboard-recent-articles');
  if (!container) return;

  const topRecent = state.articles.slice(0, 4);
  container.innerHTML = topRecent.map(a => `
    <div class="recent-item" onclick="openArticleModal('${a.id}')">
      <div class="recent-title">${escapeHTML(a.title)}</div>
      <div class="recent-meta">
        <span style="color:var(--accent-primary); font-weight:600;">${escapeHTML(a.outlet)}</span>
        <span>•</span>
        <span>${a.riskLevel === 'HIGH' ? '<span style="color:var(--accent-red); font-weight:700;">High Risk</span>' : 'Standard'}</span>
        <span>•</span>
        <span>${new Date(a.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  `).join('');
}

// 3. Narrative Clusters
async function loadClusters() {
  try {
    const res = await fetch(`${API_BASE}/clusters`);
    const data = await res.json();
    state.clusters = data.clusters || [];

    document.getElementById('cluster-count-badge').textContent = state.clusters.length;

    const container = document.getElementById('clusters-container');
    if (!container) return;

    container.innerHTML = state.clusters.map(c => `
      <div class="cluster-card">
        <div class="cluster-header">
          <div>
            <h3>${escapeHTML(c.name)}</h3>
            <div style="font-size:0.75rem; color:var(--accent-primary); margin-top:2px; font-weight:600;">Theme: ${escapeHTML(c.theme)}</div>
          </div>
          <span class="pill pill-red">RISK ${c.riskScore}%</span>
        </div>
        <div class="cluster-meta-row">
          <span>Origin: <strong>${escapeHTML(c.originOutlet)}</strong></span>
          <span>Max Copy Similarity: <strong>${c.maxSimilarity}%</strong></span>
          <span>Outlets Involved: <strong>${c.propagationCount}</strong></span>
        </div>
        <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">Syndication & Reproduction Timeline</div>
        <div class="cluster-timeline">
          ${c.timeline.map(step => `
            <div class="timeline-step">
              <span class="timeline-time">${escapeHTML(step.time)}</span> - 
              <span class="timeline-outlet">${escapeHTML(step.outlet)}</span>: 
              <span class="timeline-action">${escapeHTML(step.action)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading clusters:', err);
  }
}

// 4. Feeds
async function loadFeeds() {
  try {
    const res = await fetch(`${API_BASE}/feeds`);
    const data = await res.json();
    state.feeds = data.feeds || [];

    const container = document.getElementById('sources-container');
    if (!container) return;

    container.innerHTML = state.feeds.map(f => {
      const isActive = f.status === 'ACTIVE';
      const statusPill = isActive
        ? '<span class="pill pill-green">ACTIVE</span>'
        : (f.status === 'FLAGGED' ? '<span class="pill pill-red">FLAGGED</span>' : '<span class="pill" style="background:var(--bg-surface);color:var(--text-muted)">PAUSED</span>');

      return `
        <div class="source-card">
          <div class="source-top">
            <span class="source-name">${escapeHTML(f.name)}</span>
            ${statusPill}
          </div>
          <div class="source-url">${escapeHTML(f.url)}</div>
          <div class="source-stats">
            <span>Reliability: <strong>${f.reliabilityScore}/100</strong></span>
            <span>Articles: <strong>${f.articlesCount}</strong></span>
          </div>
          <button class="btn btn-secondary" style="font-size:0.75rem; padding:6px 12px;" onclick="toggleFeed('${f.id}')">
            ${isActive ? 'Pause Scraper' : 'Resume Scraper'}
          </button>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading feeds:', err);
  }
}

async function toggleFeed(id) {
  try {
    const res = await fetch(`${API_BASE}/feeds/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      loadFeeds();
      loadStats();
    }
  } catch (err) {
    console.error('Error toggling feed:', err);
  }
}

// 5. Network Graph (Theme Aware)
async function loadNetworkData() {
  try {
    const res = await fetch(`${API_BASE}/network`);
    const data = await res.json();
    state.network = data;
  } catch (err) {
    console.error('Error loading network data:', err);
  }
}

function renderNetworkGraph() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  ctx.clearRect(0, 0, width, height);

  // Position nodes
  const nodes = state.network.nodes || [];
  const edges = state.network.edges || [];

  const outletNodes = nodes.filter(n => n.type === 'outlet');
  const articleNodes = nodes.filter(n => n.type === 'article');

  const positions = {};

  // Outlets on an inner circle
  outletNodes.forEach((node, idx) => {
    const angle = (idx / outletNodes.length) * 2 * Math.PI;
    const radius = 140;
    positions[node.id] = {
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      radius: 18,
      color: isLight ? '#2563eb' : '#3b82f6',
      label: node.label
    };
  });

  // Articles on outer circle
  articleNodes.forEach((node, idx) => {
    const angle = (idx / articleNodes.length) * 2 * Math.PI + 0.2;
    const radius = 230;
    const isHigh = node.risk === 'HIGH';
    positions[node.id] = {
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      radius: 14,
      color: isHigh ? (isLight ? '#dc2626' : '#ef4444') : (isLight ? '#0284c7' : '#38bdf8'),
      label: node.label
    };
  });

  // Draw Edges
  edges.forEach(edge => {
    const p1 = positions[edge.source];
    const p2 = positions[edge.target];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      if (edge.type === 'COPIED_NARRATIVE') {
        ctx.strokeStyle = isLight ? '#dc2626' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 3]);
      } else {
        ctx.strokeStyle = isLight ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Draw Nodes
  Object.keys(positions).forEach(id => {
    const pos = positions[id];

    // Glow halo
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pos.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = pos.color === '#ef4444' || pos.color === '#dc2626' 
      ? (isLight ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.25)')
      : (isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(56, 189, 248, 0.2)');
    ctx.fill();

    // Node body
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
    ctx.fillStyle = pos.color;
    ctx.fill();
    ctx.strokeStyle = isLight ? '#ffffff' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text Label
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = isLight ? '#1e293b' : '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(pos.label.slice(0, 18), pos.x, pos.y + pos.radius + 14);
  });
}

// 6. Article Modal
function openArticleModal(id) {
  const article = state.articles.find(a => a.id === id);
  if (!article) return;

  state.selectedArticle = article;

  document.getElementById('modal-outlet').textContent = `${article.outlet} • Language: ${article.lang.toUpperCase()} • Topic: ${article.topic}`;
  document.getElementById('modal-title').textContent = article.title;
  document.getElementById('modal-meta').textContent = `Published: ${new Date(article.publishedAt).toLocaleString()} | Author: ${article.author || 'Desk'} | Source URL: ${article.sourceUrl}`;
  document.getElementById('modal-summary').textContent = article.summary;

  // Risk Banner
  const banner = document.getElementById('modal-risk-banner');
  if (article.riskLevel === 'HIGH') {
    banner.style.background = 'var(--accent-red-bg)';
    banner.style.color = 'var(--accent-red)';
    banner.innerHTML = `<span>⚠️ HIGH MISINFORMATION RISK DETECTED (${article.riskScore}% Confidence)</span><span>Cluster: ${article.similarityClusterId || 'None'}</span>`;
  } else {
    banner.style.background = 'var(--accent-green-bg)';
    banner.style.color = 'var(--accent-green)';
    banner.innerHTML = `<span>VERIFIED CONTENT INTEGRITY (${article.riskScore}% Risk Factor)</span><span>Standard Syndication</span>`;
  }

  // Claims
  const claimsEl = document.getElementById('modal-claims');
  if (article.claims && article.claims.length > 0) {
    claimsEl.innerHTML = article.claims.map(c => `
      <div class="claim-item">
        <div style="font-weight:700; margin-bottom:2px; color:var(--text-main);">"${escapeHTML(c.text)}"</div>
        <div style="font-size:0.75rem; color:var(--text-dim)">Status: <strong style="color:var(--text-main);">${c.status}</strong> (Confidence: ${(c.confidence * 100).toFixed(0)}%)</div>
      </div>
    `).join('');
  } else {
    claimsEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-dim)">No disputed claims isolated.</div>';
  }

  // Quotes
  const quotesEl = document.getElementById('modal-quotes');
  if (article.quotes && article.quotes.length > 0) {
    quotesEl.innerHTML = article.quotes.map(q => `
      <div class="claim-item" style="border-left-color:var(--accent-blue)">
        <div style="font-style:italic; color:var(--text-main);">"${escapeHTML(q.quote)}"</div>
        <div style="font-size:0.75rem; color:var(--text-dim)">Speaker: <strong style="color:var(--text-main);">${escapeHTML(q.speaker)}</strong> • Sentiment: ${q.sentiment}</div>
      </div>
    `).join('');
  } else {
    quotesEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-dim)">No direct quotes extracted.</div>';
  }

  // Entities
  const entitiesEl = document.getElementById('modal-entities');
  if (article.entities && article.entities.length > 0) {
    entitiesEl.innerHTML = article.entities.map(e => `
      <span class="entity-pill">${escapeHTML(e.name)} (${e.type})</span>
    `).join('');
  } else {
    entitiesEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-dim)">No entities found.</div>';
  }

  document.getElementById('article-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('article-modal').classList.add('hidden');
}

// 7. Instant Ingestion Simulator
async function simulateIncomingArticle() {
  const simulatedHeadlines = [
    {
      title: 'తెలంగాణ కొత్త సంక్షేమ పథకాల మార్గదర్శకాలపై సోషల్ మీడియాలో అసత్య ప్రచారం: స్పష్టత',
      outlet: 'Eenadu (ఈనాడు)',
      lang: 'te',
      topic: 'సంక్షేమం & పరిపాలన',
      text: 'కొత్త నిబంధనల ప్రకారం అర్హుల జాబితా నుంచి పేర్లు తొలగిస్తున్నారంటూ వస్తున్న వార్తలను పౌరసరఫరాల శాఖ తీవ్రంగా ఖండించింది.'
    },
    {
      title: 'यूपीआई डिजिटल लेनदेन पर अतिरिक्त सेवा शुल्क लगने का वायरल दावा पूरी तरह भ्रामक: एनपीसीआई',
      outlet: 'NDTV India (एनडीटीवी)',
      lang: 'hi',
      topic: 'डिजिटल बैंकिंग',
      text: 'सोशल मीडिया पर प्रसारित दावों को एनपीसीआई ने सिरे से खारिज करते हुए स्पष्ट किया कि सामान्य यूपीआई भुगतान पर कोई अतिरिक्त चार्ज नहीं है।'
    },
    {
      title: 'Coordinated network of automated accounts spreading doctored state gazette notification exposed',
      outlet: 'The Hindu',
      lang: 'en',
      topic: 'E-Governance & Security',
      text: 'Digital investigators traced a batch of 40 automated social handles disseminating altered PDF notifications regarding administrative recruitment examinations.'
    }
  ];

  const randomStory = simulatedHeadlines[Math.floor(Math.random() * simulatedHeadlines.length)];

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(randomStory)
    });
    if (res.ok) {
      await loadArticles();
      await loadStats();
      await loadNetworkData();
      alert(`Incoming rumor/story ingested into flow: "${randomStory.title}"`);
    }
  } catch (err) {
    console.error('Error simulating article:', err);
  }
}

// 8. Analyzer Form Handler
async function handleAnalysisSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('input-title').value;
  const outlet = document.getElementById('input-outlet').value;
  const url = document.getElementById('input-url').value;
  const text = document.getElementById('input-text').value;
  const lang = document.getElementById('input-lang')?.value || 'en';

  const btn = document.getElementById('btn-submit-analysis');
  btn.disabled = true;
  btn.innerHTML = '<span>Processing NLP Models...</span>';

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, outlet, url, text, lang })
    });
    const data = await res.json();

    const resultBox = document.getElementById('analysis-result-box');
    resultBox.classList.remove('hidden');

    const art = data.article;
    resultBox.innerHTML = `
      <div style="font-weight:700; font-size:1.05rem; margin-bottom:8px; color:var(--text-main);">
        RumorFlow Inspection Complete: ${escapeHTML(art.title)}
      </div>
      <div style="display:flex; gap:12px; margin-bottom:12px;">
        <span class="pill ${art.riskLevel === 'HIGH' ? 'pill-red' : 'pill-green'}">${art.riskLevel} RISK (${art.riskScore}%)</span>
        <span class="pill pill-blue">Similarity Cluster: ${art.similarityClusterId || 'None (Original Flow)'}</span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px; line-height:1.5;">${escapeHTML(art.summary)}</p>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary" onclick="openArticleModal('${art.id}')">View Deep Inspection</button>
        <button class="btn btn-secondary" onclick="switchTab('live-feed')">Go to Live Feed</button>
      </div>
    `;

    loadArticles();
    loadStats();
    loadNetworkData();
  } catch (err) {
    alert('Failed to analyze content: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><span>Run RumorFlow AI Inspection</span>`;
  }
}

// Utilities
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
