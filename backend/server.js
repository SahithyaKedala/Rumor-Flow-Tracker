const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5000;

// Monitored Feeds across Telugu, Hindi, and English Outlets
const feeds = [
  { id: 'f-1', name: 'Eenadu (ఈనాడు)', url: 'https://www.eenadu.net/rss', lang: 'te', country: 'IN', status: 'ACTIVE', lastScraped: '2 mins ago', articlesCount: 1420, reliabilityScore: 92 },
  { id: 'f-2', name: 'Sakshi (సాక్షి)', url: 'https://www.sakshi.com/rss', lang: 'te', country: 'IN', status: 'ACTIVE', lastScraped: '4 mins ago', articlesCount: 1180, reliabilityScore: 89 },
  { id: 'f-3', name: 'NDTV India (एनडीटीवी)', url: 'https://ndtv.in/rss/news', lang: 'hi', country: 'IN', status: 'ACTIVE', lastScraped: '1 min ago', articlesCount: 1650, reliabilityScore: 91 },
  { id: 'f-4', name: 'Dainik Bhaskar (दैनिक भास्कर)', url: 'https://www.bhaskar.com/rss', lang: 'hi', country: 'IN', status: 'ACTIVE', lastScraped: '6 mins ago', articlesCount: 1980, reliabilityScore: 88 },
  { id: 'f-5', name: 'Navbharat Times (नवभारत)', url: 'https://navbharattimes.indiatimes.com/rss', lang: 'hi', country: 'IN', status: 'ACTIVE', lastScraped: '3 mins ago', articlesCount: 1340, reliabilityScore: 86 },
  { id: 'f-6', name: 'The Hindu', url: 'https://www.thehindu.com/news/feeder/default.rss', lang: 'en', country: 'IN', status: 'ACTIVE', lastScraped: '5 mins ago', articlesCount: 2450, reliabilityScore: 95 },
  { id: 'f-7', name: 'BBC News India', url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', lang: 'en', country: 'IN', status: 'ACTIVE', lastScraped: '2 mins ago', articlesCount: 2110, reliabilityScore: 94 },
  { id: 'f-8', name: 'Viral Regional Wire', url: 'https://telegram-aggregator.local/feed', lang: 'te', country: 'IN', status: 'FLAGGED', lastScraped: '8 mins ago', articlesCount: 650, reliabilityScore: 38 }
];

let articles = [
  {
    id: 'art-101',
    title: 'ఎన్నికల ఈవీఎంలపై సోషల్ మీడియాలో అసత్య ప్రచారం: ఫ్యాక్ట్ చెక్ లో వెల్లడైన వాస్తవాలు',
    outlet: 'Eenadu (ఈనాడు)',
    sourceUrl: 'https://www.eenadu.net/factcheck/evm-rumor-debunk',
    author: 'ఫ్యాక్ట్ చెక్ డెస్క్',
    lang: 'te',
    publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    topic: 'ఎన్నికలు & భద్రత (Elections)',
    riskScore: 89,
    riskLevel: 'HIGH',
    similarityClusterId: 'cluster-1',
    similarityScore: 94.2,
    summary: 'ఎన్నికల సమయంలో ఈవీఎంల సిగ్నల్స్ రిమోట్ ద్వారా తారుమారు చేయవచ్చంటూ వాట్సాప్ గ్రూపులలో ప్రచారమవుతున్న వాయిస్ క్లిప్ నకిలీదని ఎన్నికల సంఘం ధృవీకరించింది.',
    claims: [
      { text: 'ఈవీఎంలను రిమోట్ వైర్‌లెస్ పరికరాల ద్వారా ప్రభావితం చేయవచ్చని వాదన.', status: 'Fabricated (అసత్యం)', confidence: 0.96 },
      { text: 'ఈవీఎంలు స్వతంత్రమైనవి, వీటికి ఎలాంటి ఇంటర్నెట్ లేదా నెట్‌వర్క్ కనెక్షన్ ఉండదు.', status: 'Verified (నిజం)', confidence: 0.99 }
    ],
    quotes: [
      { quote: 'ఈవీఎంలు పూర్తి సురక్షితమైనవి మరియు పటిష్టమైన భద్రతా ప్రోటోకాల్ కలిగి ఉన్నాయి.', speaker: 'రాష్ట్ర ఎన్నికల ప్రధాన అధికారి', sentiment: 'Official' }
    ],
    entities: [
      { name: 'Election Commission of India', type: 'Organization' },
      { name: 'Hyderabad', type: 'Location' },
      { name: 'Telangana', type: 'Location' }
    ]
  },
  {
    id: 'art-102',
    title: 'సాగునీటి ప్రాజెక్టుల నీటి నిల్వలపై వైరల్ అవుతున్న తప్పుడు వీడియోలు: అధికారులు స్పష్టత',
    outlet: 'Sakshi (సాక్షి)',
    sourceUrl: 'https://www.sakshi.com/news/water-projects-clarification',
    author: 'ప్రత్యేక ప్రతినిధి',
    lang: 'te',
    publishedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    topic: 'సాగునీరు & వ్యవసాయం',
    riskScore: 46,
    riskLevel: 'MEDIUM',
    similarityClusterId: 'cluster-1',
    similarityScore: 82.5,
    summary: 'గోదావరి పరీవాహక ప్రాంత ప్రాజెక్టులపై గతంలో జరిగిన వరదల వీడియోలను ప్రస్తుత దృశ్యాలుగా చూపిస్తూ కొందరు ఆందోళన సృష్టిస్తున్నారు.',
    claims: [
      { text: 'ప్రాజెక్టుల భద్రత నియంత్రణలో ఉంది, ఎలాంటి అదనపు వరద ముప్పు లేదు.', status: 'Verified (నిజం)', confidence: 0.95 }
    ],
    quotes: [
      { quote: 'సోషల్ మీడియాలో తప్పుడు సమాచారాన్ని వ్యాప్తి చేసే వారిపై చట్టపరమైన చర్యలు తప్పవు.', speaker: 'నీటిపారుదల శాఖ ఇంజనీర్-ఇన్-చీఫ్', sentiment: 'Warning' }
    ],
    entities: [
      { name: 'Irrigation Department', type: 'Government' },
      { name: 'Godavari Basin', type: 'Location' }
    ]
  },
  {
    id: 'art-103',
    title: 'बैंक खातों को स्वतः फ्रीज करने का वायरल दावा पूरी तरह फर्जी, पीआईबी और आरबीआई ने दी चेतावनी',
    outlet: 'NDTV India (एनडीटीवी)',
    sourceUrl: 'https://ndtv.in/india-news/rbi-pib-debunks-fake-bank-account-freeze-rumor',
    author: 'फैक्ट चेक टीम',
    lang: 'hi',
    publishedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    topic: 'बैंकिंग एवं अर्थव्यवस्था',
    riskScore: 88,
    riskLevel: 'HIGH',
    similarityClusterId: 'cluster-2',
    similarityScore: 92.4,
    summary: 'सोशल मीडिया पर एक फर्जी सरकारी पत्र प्रसारित कर दावा किया जा रहा था कि 31 तारीख के बाद सभी अनवेरिफाइड खाते बंद हो जाएंगे। आरबीआई ने इसे भ्रामक बताया।',
    claims: [
      { text: 'सभी नागरिकों के बैंक खाते बिना सूचना के फ्रीज कर दिए जाएंगे।', status: 'Fabricated (फर्जी दावा)', confidence: 0.98 },
      { text: 'आरबीआई कभी भी किसी ग्राहक से फोन पर ओटीपी या व्यक्तिगत बैंकिंग विवरण नहीं मांगता।', status: 'Verified (सत्यापित)', confidence: 0.99 }
    ],
    quotes: [
      { quote: 'नागरिक केवल आधिकारिक बैंक पोर्टल या शाखा से ही जानकारी की पुष्टि करें।', speaker: 'आरबीआई प्रवक्ता', sentiment: 'Cautionary' }
    ],
    entities: [
      { name: 'Reserve Bank of India (RBI)', type: 'Organization' },
      { name: 'PIB Fact Check', type: 'Government' },
      { name: 'New Delhi', type: 'Location' }
    ]
  },
  {
    id: 'art-104',
    title: 'राष्ट्रीय पावर ग्रिड पर साइबर हमले की झूठी खबर का भंडाफोड़, ग्रिड संचालन सामान्य',
    outlet: 'Dainik Bhaskar (दैनिक भास्कर)',
    sourceUrl: 'https://www.bhaskar.com/national/cyber-threat-grid-rumor-refuted',
    author: 'विशेष संवाददाता',
    lang: 'hi',
    publishedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    topic: 'ऊर्जा एवं राष्ट्रीय सुरक्षा',
    riskScore: 52,
    riskLevel: 'MEDIUM',
    similarityClusterId: null,
    similarityScore: 41.0,
    summary: 'उत्तरी ग्रिड में बड़े पैमाने पर साइबर घुसपैठ और आगामी ब्लैकआउट के भ्रामक दावों को ऊर्जा मंत्रालय के कंप्यूटर इमरजेंसी रिस्पांस सिस्टम ने खारिज किया।',
    claims: [
      { text: 'नेशनल लोड डिस्पैच सेंटर की सुरक्षा प्रणाली 24 घंटे सक्रिय और सुरक्षित है।', status: 'Verified (सत्यापित)', confidence: 0.97 }
    ],
    quotes: [
      { quote: 'ग्रिड फ्रीक्वेंसी पूरी तरह सामान्य सीमा के भीतर संचालित हो रही है।', speaker: 'ग्रिड नियंत्रक अधिकारी', sentiment: 'Neutral' }
    ],
    entities: [
      { name: 'Ministry of Power', type: 'Government' },
      { name: 'CERT-In', type: 'Organization' }
    ]
  },
  {
    id: 'art-105',
    title: 'Synthetic deepfake voice recording impersonating senior state official debunked by digital forensics lab',
    outlet: 'The Hindu',
    sourceUrl: 'https://www.thehindu.com/news/national/deepfake-audio-busted-forensics',
    author: 'Technology Bureau',
    lang: 'en',
    publishedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    topic: 'Artificial Intelligence & Forensics',
    riskScore: 16,
    riskLevel: 'LOW',
    similarityClusterId: 'cluster-1',
    similarityScore: 88.0,
    summary: 'A 45-second audio clip making fraudulent statements regarding welfare pensions was analyzed using acoustic spectral modeling and confirmed to be generated by AI voice cloning software.',
    claims: [
      { text: 'Spectral acoustic frequency exhibits telltale artifacts typical of neural vocoder synthesis.', status: 'Verified', confidence: 0.97 }
    ],
    quotes: [
      { quote: 'Automated attribution tools allow rapid forensic identification of generated audio within minutes.', speaker: 'Cyber Crime Division Chief', sentiment: 'Analytical' }
    ],
    entities: [
      { name: 'Central Forensic Science Laboratory', type: 'Organization' },
      { name: 'Bengaluru', type: 'Location' }
    ]
  },
  {
    id: 'art-106',
    title: 'Investigation tracks syndicate of 18 automated aggregator portals replicating fraudulent welfare links',
    outlet: 'BBC News India',
    sourceUrl: 'https://www.bbc.com/news/world-asia-india-welfare-scam',
    author: 'Pooja Verma',
    lang: 'en',
    publishedAt: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
    topic: 'Cyber Crime & Disinformation',
    riskScore: 92,
    riskLevel: 'HIGH',
    similarityClusterId: 'cluster-2',
    similarityScore: 95.8,
    summary: 'Multi-lingual investigative investigation exposes an automated syndication network copying identical Hindi and Telugu text to lure citizens into entering banking credentials on cloned domains.',
    claims: [
      { text: 'Over 18 regional domain names reproduced verbatim 350-word phishing prompts.', status: 'Fabricated Scheme', confidence: 0.98 }
    ],
    quotes: [
      { quote: 'The speed of automated cross-lingual syndication requires real-time narrative cluster detection.', speaker: 'Lead Threat Researcher', sentiment: 'Warning' }
    ],
    entities: [
      { name: 'Indian Cyber Crime Coordination Centre (I4C)', type: 'Government' },
      { name: 'RumorFlow Threat Intelligence', type: 'Organization' }
    ]
  }
];

const clusters = [
  {
    id: 'cluster-1',
    name: 'Election EVM & Voting Machine Audio Rumor',
    theme: 'Electoral Integrity (Telugu & English)',
    originArticleId: 'art-101',
    originOutlet: 'Viral Regional Wire (WhatsApp Forward)',
    propagationCount: 7,
    maxSimilarity: 94.2,
    riskScore: 89,
    firstDetected: '1 hour ago',
    timeline: [
      { time: '08:45', outlet: 'Regional WhatsApp Group', action: 'Manipulated audio forward seeded' },
      { time: '09:20', outlet: 'Viral Regional Wire', action: 'Telugu headline syndicated verbatim' },
      { time: '10:05', outlet: 'Local Blog Aggregators', action: 'Cross-language copy-paste narrative detected' },
      { time: '10:45', outlet: 'Eenadu & Sakshi Fact Check', action: 'State Election Commission official debunk published' }
    ]
  },
  {
    id: 'cluster-2',
    name: 'Banking Freeze & False Subsidy Phishing Narrative',
    theme: 'Financial Disinformation (Hindi & English)',
    originArticleId: 'art-103',
    originOutlet: 'Viral Social Media Posts',
    propagationCount: 6,
    maxSimilarity: 95.8,
    riskScore: 92,
    firstDetected: '3 hours ago',
    timeline: [
      { time: '11:00', outlet: 'Social Media Forward', action: 'Fake banking notification letter posted' },
      { time: '11:35', outlet: 'Aggregator Portals', action: 'Identical Hindi copy duplicated across 6 domains' },
      { time: '12:15', outlet: 'NDTV India / PIB Fact Check', action: 'RBI formal clarification issued' },
      { time: '12:50', outlet: 'BBC News India Investigation', action: 'Full syndicate attribution report published' }
    ]
  }
];

// Helper to set JSON headers + CORS
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // Health
  if (path === '/api/health' && method === 'GET') {
    return sendJSON(res, 200, {
      status: 'healthy',
      service: 'RumorFlow Core Backend API',
      version: '2.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }

  // Stats / Dashboard Overview
  if (path === '/api/stats' && method === 'GET') {
    const highRiskCount = articles.filter(a => a.riskLevel === 'HIGH').length;
    return sendJSON(res, 200, {
      totalArticles: articles.length + 3842,
      activeFeeds: feeds.filter(f => f.status === 'ACTIVE').length,
      totalFeeds: feeds.length,
      activeClusters: clusters.length,
      highRiskNarratives: highRiskCount + 14,
      nlpEngineStatus: 'OPERATIONAL (Indic & Multi-Lingual Transformer)',
      clusteringEngine: 'Cross-Lingual Semantic Plagiarism Engine v2.4 (Active)',
      graphStore: 'Neo4j Flow Knowledge Graph (Live Memory Link)'
    });
  }

  // Articles list (with search, topic, risk, language filter)
  if (path === '/api/articles' && method === 'GET') {
    const q = (parsedUrl.query.q || '').toLowerCase();
    const risk = parsedUrl.query.risk;
    const lang = parsedUrl.query.lang;

    let filtered = [...articles];
    if (q) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.outlet.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q)
      );
    }
    if (risk && risk !== 'ALL') {
      filtered = filtered.filter(a => a.riskLevel === risk);
    }
    if (lang && lang !== 'ALL') {
      filtered = filtered.filter(a => a.lang === lang);
    }

    return sendJSON(res, 200, {
      articles: filtered,
      count: filtered.length
    });
  }

  // Single article details
  if (path.startsWith('/api/articles/') && method === 'GET') {
    const id = path.split('/')[3];
    const item = articles.find(a => a.id === id);
    if (!item) {
      return sendJSON(res, 404, { error: 'Article not found' });
    }
    return sendJSON(res, 200, item);
  }

  // Feeds list
  if (path === '/api/feeds' && method === 'GET') {
    return sendJSON(res, 200, { feeds });
  }

  // Toggle feed active status
  if (path === '/api/feeds/toggle' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const feed = feeds.find(f => f.id === payload.id);
        if (feed) {
          feed.status = feed.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          return sendJSON(res, 200, { success: true, feed });
        }
        return sendJSON(res, 404, { error: 'Feed not found' });
      } catch (err) {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // Clusters list (Narrative Chains)
  if (path === '/api/clusters' && method === 'GET') {
    return sendJSON(res, 200, { clusters });
  }

  // Network graph nodes and edges
  if (path === '/api/network' && method === 'GET') {
    const nodes = [];
    const edges = [];

    // Add outlet nodes
    feeds.forEach(f => {
      nodes.push({
        id: f.id,
        label: f.name.split(' ')[0],
        type: 'outlet',
        reliability: f.reliabilityScore,
        status: f.status
      });
    });

    // Add article nodes & link to outlets
    articles.forEach(a => {
      nodes.push({
        id: a.id,
        label: a.title.slice(0, 32) + '...',
        type: 'article',
        risk: a.riskLevel,
        score: a.riskScore
      });

      const matchedFeed = feeds.find(f => a.outlet.toLowerCase().includes(f.name.toLowerCase().split(' ')[0]));
      if (matchedFeed) {
        edges.push({
          source: matchedFeed.id,
          target: a.id,
          type: 'PUBLISHED_BY',
          weight: 1
        });
      }
    });

    // Add cluster relationships (Chain of Misinformation copy links)
    edges.push(
      { source: 'art-101', target: 'art-102', type: 'COPIED_NARRATIVE', weight: 0.94, label: '94% Copy-Paste' },
      { source: 'art-103', target: 'art-106', type: 'SHARED_EXCERPT', weight: 0.96, label: '96% Excerpt Match' }
    );

    return sendJSON(res, 200, { nodes, edges });
  }

  // AI Instant URL / Text Analyzer
  if (path === '/api/analyze' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const text = payload.text || '';
        const inputUrl = payload.url || 'Manual Submission';

        // Perform instant NLP simulation
        const calculatedRisk = text.toLowerCase().includes('freeze') || text.toLowerCase().includes('hack') || text.toLowerCase().includes('tamper') || text.includes('అసత్య') || text.includes('ఫర్జీ')
          ? Math.floor(75 + Math.random() * 20)
          : Math.floor(15 + Math.random() * 35);

        const newArticle = {
          id: 'art-' + (Date.now()),
          title: payload.title || (text.slice(0, 60) + '...'),
          outlet: payload.outlet || 'Custom Analyst Input',
          sourceUrl: inputUrl,
          author: 'Live Extractor',
          lang: payload.lang || 'en',
          publishedAt: new Date().toISOString(),
          topic: payload.topic || 'General News (India)',
          riskScore: calculatedRisk,
          riskLevel: calculatedRisk > 70 ? 'HIGH' : (calculatedRisk > 40 ? 'MEDIUM' : 'LOW'),
          similarityClusterId: calculatedRisk > 60 ? 'cluster-1' : null,
          similarityScore: calculatedRisk > 60 ? 88.4 : 15.0,
          summary: text || 'Article content extracted and parsed by RumorFlow ingestion worker.',
          claims: [
            { text: 'Core claim extracted from submission text.', status: calculatedRisk > 70 ? 'Disputed / Unverified' : 'Verified Fact', confidence: 0.92 }
          ],
          quotes: [
            { quote: 'Extracted key quote from source passage.', speaker: 'Subject mentioned in text', sentiment: 'Neutral' }
          ],
          entities: [
            { name: 'Automated Extraction Target', type: 'Entity' },
            { name: 'India Region', type: 'Location' }
          ]
        };

        articles.unshift(newArticle);

        return sendJSON(res, 200, {
          success: true,
          article: newArticle
        });
      } catch (err) {
        return sendJSON(res, 400, { error: 'Invalid analysis payload' });
      }
    });
    return;
  }

  // Not found
  sendJSON(res, 404, { error: 'Route not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`RumorFlow Core Backend API Server listening on:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
