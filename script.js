const yearNodes = document.querySelectorAll("[data-year]");

yearNodes.forEach((node) => {
  node.textContent = new Date().getFullYear();
});

initSharedNavigation();
initLanguage();
initHomeBrandPage();

const historyData = window.GAOKAO_HISTORY_DATA;
const predictionData = window.GAOKAO_PREDICTION_DATA;
const admissionPredictionData = window.gaokaoAdmissionPredictionData;
const admissionPredictionMeta = window.gaokaoAdmissionPredictionMeta;
const scoreReleaseData = window.gaokaoScoreReleaseData;
const mapModal = document.querySelector("[data-map-modal]");
const worldCupMatches = window.WORLD_CUP_MATCH_PREDICTIONS;
const worldCupTournamentPredictions = window.WORLD_CUP_TOURNAMENT_PREDICTIONS;
const worldCupTournamentEvidenceDir = window.WORLD_CUP_TOURNAMENT_EVIDENCE_DIR || "world_cup_global_prediction";
const worldCupTournamentEvidenceFiles = window.WORLD_CUP_TOURNAMENT_EVIDENCE_FILES || [];
const worldCupTournamentPredictionSpecs = window.WORLD_CUP_TOURNAMENT_PREDICTION_SPECS || worldCupTournamentPredictions || [];
const worldCupGamePredictionDir = window.WORLD_CUP_GAME_PREDICTION_DIR || "game_prediction";
const worldCupGamePredictionManifest = window.WORLD_CUP_GAME_PREDICTION_MANIFEST || [];
const worldCupLatestGamePredictions = window.WORLD_CUP_LATEST_GAME_PREDICTIONS || [];
const worldCupTeams = window.WORLD_CUP_TEAMS;
const worldCupGroups = window.WORLD_CUP_GROUPS;
const worldCupRouteData = window.WORLD_CUP_ROUTE_DATA;
const worldCupRouteRounds = window.WORLD_CUP_ROUTE_ROUNDS;
const worldCupLatestMatchIds = window.WORLD_CUP_LATEST_MATCH_IDS;
const worldCupPredictionReports = window.WORLD_CUP_PREDICTION_REPORTS;
const WORLD_CUP_LATEST_MATCH_LIMIT = 6;
let currentWorldCupTournamentPredictions = worldCupTournamentPredictionSpecs;
let currentWorldCupMatches = worldCupMatches || [];
const worldCupGamePredictionLoadCache = new Map();

// ---------------------------------------------------------------------------
// World Cup dynamic-content i18n layer.
// Render helpers emit content in the active language plus data-zh/data-en
// attributes, so the shared language toggle (initLanguage) can re-localize
// dynamically generated nodes without re-rendering.
// ---------------------------------------------------------------------------
const WC_DICT = {
  "已预测": "Predicted",
  "待预测": "Pending",
  "未预测": "Pending",
  "已结束": "Finished",
  "进行中": "Live",
  "未开赛": "Upcoming",
  "待赛": "Upcoming",
  "待定": "TBD",
  "未确定": "TBD",
  "已晋级": "Qualified",
  "已淘汰": "Eliminated",
  "冠军待定": "Champion TBD",
  "席位来源": "Seed source",
  "待定席位": "TBD slot",
  "命中": "Hit",
  "未命中": "Missed",
  "待复核": "Pending review",
  "待结算": "Pending result",
  "待赛果": "Pending result",
  "时间待定": "Time TBD",
  "场馆待定": "Venue TBD",
  "对阵待定": "Matchup TBD",
  "待补充": "TBD",
  "胜率待补充": "Win rate TBD",
  "待更新": "Pending",
  "长期预测": "Long-term",
  "平局": "Draw",
  "总赛程": "Fixtures",
  "小组赛": "Group Stage",
  "1/16 决赛": "Round of 32",
  "1/8 决赛": "Round of 16",
  "1/4 决赛": "Quarterfinals",
  "半决赛": "Semifinals",
  "三四名决赛": "Third Place",
  "决赛": "Final",
  "冠军": "Champion",
  "亚军": "Runner-up"
};

const WC_VENUE_ZH = {
  "Estadio Azteca, Mexico City": "阿兹特克体育场",
  "Estadio Akron, Zapopan": "阿克隆体育场",
  "Estadio BBVA, Guadalupe": "BBVA 体育场",
  "Mercedes-Benz Stadium, Atlanta": "梅赛德斯-奔驰体育场",
  "BMO Field, Toronto": "BMO 球场",
  "Levi's Stadium, Santa Clara": "李维斯体育场",
  "SoFi Stadium, Inglewood": "SoFi 体育场",
  "BC Place, Vancouver": "BC Place 体育场",
  "Lumen Field, Seattle": "流明球场",
  "Gillette Stadium, Foxborough": "吉列体育场",
  "MetLife Stadium, East Rutherford": "大都会人寿体育场",
  "Lincoln Financial Field, Philadelphia": "林肯金融球场",
  "Hard Rock Stadium, Miami Gardens": "硬石体育场",
  "NRG Stadium, Houston": "NRG 体育场",
  "Arrowhead Stadium, Kansas City": "箭头体育场",
  "AT&T Stadium, Arlington": "AT&T 体育场",
  "Atlanta Stadium": "梅赛德斯-奔驰体育场",
  "Boston Stadium": "吉列体育场",
  "Dallas Stadium": "AT&T 体育场",
  "Guadalajara Stadium": "阿克隆体育场",
  "Houston Stadium": "NRG 体育场",
  "Kansas City Stadium": "箭头体育场",
  "Los Angeles Stadium": "SoFi 体育场",
  "Mexico City Stadium": "阿兹特克体育场",
  "Miami Stadium": "硬石体育场",
  "Monterrey Stadium": "BBVA 体育场",
  "New York New Jersey Stadium": "大都会人寿体育场",
  "New York/New Jersey Stadium, East Rutherford": "大都会人寿体育场",
  "Philadelphia Stadium": "林肯金融球场",
  "San Francisco Bay Area Stadium": "李维斯体育场",
  "San Francisco Bay Area Stadium, Santa Clara": "李维斯体育场",
  "Seattle Stadium": "流明球场",
  "Toronto Stadium": "BMO 球场",
  "BC Place Vancouver": "BC Place 体育场"
};

const WC_CITY_ZH = {
  "Houston": "休斯顿",
  "Dallas": "达拉斯",
  "Toronto": "多伦多",
  "Mexico City": "墨西哥城",
  "Atlanta": "亚特兰大",
  "Kansas City": "堪萨斯城",
  "Los Angeles": "洛杉矶",
  "Boston": "波士顿",
  "Miami": "迈阿密",
  "Philadelphia": "费城",
  "Seattle": "西雅图",
  "Vancouver": "温哥华",
  "Monterrey": "蒙特雷",
  "Guadalajara": "瓜达拉哈拉",
  "New York": "纽约/新泽西",
  "New York/New Jersey": "纽约/新泽西",
  "San Francisco": "旧金山湾区",
  "San Francisco Bay Area": "旧金山湾区"
};

const WC_EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const WC_AWARD = {
  champion: { name: "Champion", type: "Champion", category: "Standings" },
  runnerUp: { name: "Runner-up", type: "Runner-up", category: "Standings" },
  thirdPlace: { name: "Third place", type: "Third place", category: "Standings" },
  fourthPlace: { name: "Fourth place", type: "Fourth place", category: "Standings" },
  goldenBall: { name: "Golden Ball", type: "Golden Ball", category: "Player awards" },
  goldenBoot: { name: "Golden Boot", type: "Golden Boot", category: "Player awards" },
  goldenGlove: { name: "Golden Glove", type: "Golden Glove", category: "Player awards" },
  youngPlayer: { name: "Best Young Player", type: "Best Young Player", category: "Player awards" },
  finalMvp: { name: "Final MVP", type: "Final MVP", category: "Player awards" },
  bestGoal: { name: "Best Goal", type: "Best Goal", category: "Tournament content" },
  fairPlay: { name: "Fair Play Team", type: "Fair Play Team", category: "Team awards" },
  entertainingTeam: { name: "Most Entertaining Team", type: "Most Entertaining Team", category: "Team awards" }
};

function awardPair(item, field) {
  const en = WC_AWARD[item?.id]?.[field];
  const zh = field === "name" ? item?.predictionName : field === "type" ? item?.type : item?.category;
  return { zh: zh || "", en: en || zh || "" };
}

function getLang() {
  return document.documentElement.dataset.lang === "en" ? "en" : "zh";
}

function wcEn(zh) {
  const s = String(zh ?? "");
  return Object.prototype.hasOwnProperty.call(WC_DICT, s) ? WC_DICT[s] : s;
}

// Current-language plain string.
function L(zh, en) {
  if (getLang() === "en") {
    return en == null ? wcEn(zh) : String(en);
  }
  return String(zh ?? "");
}

// data-zh / data-en attribute pair for an existing element.
function biAttrs(zh, en) {
  const z = String(zh ?? "");
  const e = en == null ? wcEn(z) : String(en);
  return `data-zh="${escapeHtml(z)}" data-en="${escapeHtml(e)}"`;
}

// A self-contained <span> carrying both languages, content in active language.
function bi(zh, en) {
  const z = String(zh ?? "");
  const e = en == null ? wcEn(z) : String(en);
  return `<span data-zh="${escapeHtml(z)}" data-en="${escapeHtml(e)}">${escapeHtml(getLang() === "en" ? e : z)}</span>`;
}

// Auto-translate a single value that may be a known Chinese token.
function biAuto(value) {
  const z = String(value ?? "");
  return bi(z, wcEn(z));
}

function teamPair(team, fallback) {
  if (team) {
    return { zh: team.nameZh, en: team.nameEn || team.nameZh };
  }
  const s = String(fallback ?? "").trim();
  if (!s || s === "--" || s === "待补充") {
    return { zh: "对阵待定", en: "Matchup TBD" };
  }
  return { zh: s, en: s };
}

function predictedValuePair(value) {
  const s = String(value ?? "").trim();
  if (!s) {
    return { zh: "", en: "" };
  }
  if (s === "待预测") {
    return { zh: "待预测", en: "Pending" };
  }
  const team = typeof findTeamByEnglishName === "function" ? findTeamByEnglishName(s) : null;
  if (team) {
    return { zh: team.nameZh, en: team.nameEn || team.nameZh };
  }
  const directTeam = worldCupTeams
    ? Object.values(worldCupTeams).find((t) => t.nameZh === s || t.nameEn === s)
    : null;
  if (directTeam) {
    return { zh: directTeam.nameZh, en: directTeam.nameEn || directTeam.nameZh };
  }
  return { zh: s, en: s };
}

function venuePair(value) {
  const s = String(value ?? "").trim();
  if (!s || s === "场馆待定" || s === "待补充" || s === "--") {
    return { zh: "场馆待定", en: "Venue TBD" };
  }
  if (WC_VENUE_ZH[s]) {
    return { zh: WC_VENUE_ZH[s], en: s };
  }
  const cityMatch = s.match(/^(.+?)\s+Stadium(?:,.*)?$/i);
  if (cityMatch && WC_CITY_ZH[cityMatch[1]]) {
    return { zh: `${WC_CITY_ZH[cityMatch[1]]}球场`, en: s };
  }
  return { zh: s, en: s };
}

function matchTimePair(value) {
  const s = String(value ?? "").trim();
  if (!s || s === "时间待定" || s === "待补充" || s === "--") {
    return { zh: "时间待定", en: "Time TBD" };
  }
  const m = s.match(/(\d+)月(\d+)日\s+(\d{1,2}:\d{2})\s*(UTC[+\-\d:]*)?/);
  if (!m) {
    return { zh: s, en: wcEn(s) };
  }
  const month = WC_EN_MONTHS[Number(m[1]) - 1] || m[1];
  const utc = m[4] ? ` ${m[4]}` : "";
  return { zh: s, en: `${month} ${Number(m[2])}, ${m[3]}${utc}` };
}

function groupPair(group) {
  const s = String(group ?? "").trim();
  if (!s) {
    return { zh: "", en: "" };
  }
  const m = s.match(/^([A-L])组$/);
  if (m) {
    return { zh: s, en: `Group ${m[1]}` };
  }
  return { zh: s, en: wcEn(s) };
}

function roundPair(round) {
  const s = String(round ?? "").trim();
  if (!s) {
    return { zh: "", en: "" };
  }
  const en = s
    .replace(/第(\d+)轮/g, "Round $1")
    .replace(/胜者/g, " winner")
    .replace(/(\d+)强/g, "Round of $1")
    .replace(/小组赛/g, "Group Stage");
  return { zh: s, en };
}

function matchStagePair(match) {
  const stage = match?.stage ? { zh: match.stage, en: wcEn(match.stage) } : null;
  const group = match?.group ? groupPair(match.group) : null;
  const round = match?.round ? roundPair(match.round) : null;
  const parts = [stage, group, round].filter(Boolean);
  return {
    zh: parts.map((p) => p.zh).filter(Boolean).join(" · "),
    en: parts.map((p) => p.en).filter(Boolean).join(" · ")
  };
}

function refPair(value) {
  if (value && typeof value === "object") {
    return { zh: value.zh || "", en: value.en || value.zh || "" };
  }
  const s = String(value ?? "");
  return { zh: s, en: wcEn(s) };
}

function pairText(pair, lang) {
  if (!pair) {
    return "";
  }
  return (lang || getLang()) === "en" ? (pair.en || pair.zh || "") : (pair.zh || "");
}

if (historyData && predictionData && mapModal) {
  initGaokaoMaps(historyData, predictionData);
}

if (worldCupMatches && worldCupTournamentPredictions) {
  updateWorldCupPredictionRangeBadges();
  initWorldCupBoards(worldCupMatches, worldCupTournamentPredictionSpecs);
  loadWorldCupGamePredictions(worldCupMatches);
  loadWorldCupTournamentEvidence(worldCupTournamentPredictionSpecs);
}

function initSharedNavigation() {
  const navMounts = document.querySelectorAll("[data-shared-nav]");

  if (!navMounts.length) {
    return;
  }

  const navItems = [
    { id: "home", zh: "首页", en: "Home", href: "index.html" },
    { id: "worldcup", zh: "世界杯", en: "World Cup", href: "worldcup.html" },
    { id: "gaokao", zh: "高考", en: "Gaokao", href: "gaokao.html" },
    { id: "about", zh: "关于我们", en: "About", href: "about.html" },
  ];

  const inferActivePage = () => {
    const fileName = window.location.pathname.split("/").pop() || "index.html";

    if (fileName.includes("worldcup")) {
      return "worldcup";
    }

    if (fileName.includes("gaokao")) {
      return "gaokao";
    }

    if (fileName.includes("about")) {
      return "about";
    }

    return "home";
  };

  navMounts.forEach((mount) => {
    const activePage = mount.dataset.activePage || inferActivePage();
    const navVariant = mount.dataset.navVariant || (activePage === "home" ? "dark" : activePage);
    const links = navItems.map((item) => `
      <a${item.id === activePage ? ' class="is-active"' : ""} href="${item.href}" data-zh="${item.zh}" data-en="${item.en}">${item.zh}</a>
    `).join("");

    mount.classList.add("site-header", "home-nav-shell");
    mount.classList.add(`site-header--${navVariant}`);
    mount.innerHTML = `
      <nav class="nav home-nav" aria-label="Primary navigation">
        <a class="brand home-brand" href="index.html" aria-label="wowcai">
          <img class="site-logo" src="Logo.png" alt="wowcai">
        </a>
        <div class="nav-links home-nav-links" aria-label="Main pages">
          ${links}
        </div>
        <div class="nav-lang-toggle" role="group" aria-label="Language / 语言">
          <button type="button" class="lang-btn" data-lang-btn="zh">中文</button>
          <button type="button" class="lang-btn" data-lang-btn="en">EN</button>
        </div>
      </nav>
    `;
  });

  const updateNavState = () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateNavState();
  window.addEventListener("scroll", updateNavState, { passive: true });
}

function initLanguage() {
  const STORAGE_KEY = "wowcai-lang";

  const readLang = () => {
    const saved = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
    return saved === "en" ? "en" : "zh";
  };

  const applyLang = (lang) => {
    const normalized = lang === "en" ? "en" : "zh";
    document.documentElement.lang = normalized === "en" ? "en" : "zh-CN";
    document.documentElement.dataset.lang = normalized;

    document.querySelectorAll("[data-zh]").forEach((node) => {
      const value = node.getAttribute(normalized === "en" ? "data-en" : "data-zh");

      if (value === null) {
        return;
      }

      if (node.hasAttribute("data-i18n-html")) {
        node.innerHTML = value;
      } else {
        node.textContent = value;
      }
    });

    document.querySelectorAll("[data-zh-aria]").forEach((node) => {
      const value = node.getAttribute(normalized === "en" ? "data-en-aria" : "data-zh-aria");
      if (value !== null) {
        node.setAttribute("aria-label", value);
      }
    });

    document.querySelectorAll("[data-zh-placeholder]").forEach((node) => {
      const value = node.getAttribute(normalized === "en" ? "data-en-placeholder" : "data-zh-placeholder");
      if (value !== null) {
        node.setAttribute("placeholder", value);
      }
    });

    const body = document.body;
    const title = body
      ? body.getAttribute(normalized === "en" ? "data-title-en" : "data-title-zh")
      : null;
    if (title) {
      document.title = title;
    }

    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      const isActive = btn.dataset.langBtn === normalized;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    }

    document.dispatchEvent(new CustomEvent("wowcai:langchange", { detail: { lang: normalized } }));
  };

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-lang-btn]");
    if (!btn) {
      return;
    }
    event.preventDefault();
    applyLang(btn.dataset.langBtn);
  });

  applyLang(readLang());
  window.wowcaiApplyLanguage = applyLang;
}

function initHomeBrandPage() {
  const homePage = document.body.classList.contains("home-brand-page");

  if (!homePage) {
    return;
  }

  const sections = document.querySelectorAll("[data-home-section]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.28 });

    sections.forEach((section) => observer.observe(section));
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }
}

function initWorldCupBoards(matches, tournamentPredictions) {
  const routeMap = document.querySelector("[data-worldcup-route-map]");
  const latestMatches = document.querySelector("[data-worldcup-latest-matches]");
  const matchBoard = document.querySelector("[data-worldcup-match-board]");
  const summaryPanel = document.querySelector("[data-worldcup-summary-panel]");
  const matchSummary = document.querySelector("[data-worldcup-match-summary]");

  if (matchSummary) {
    const predictedMatches = matches.filter((match) => match.predictionStatus === "predicted");
    const finishedMatches = matches.filter((match) => match.matchStatus === "finished");
    matchSummary.innerHTML = `
      <div><strong>${matches.length}</strong>${bi("总赛程")}</div>
      <div><strong>${predictedMatches.length}</strong>${bi("已预测")}</div>
      <div><strong>${finishedMatches.length}</strong>${bi("已结束")}</div>
    `;
  }

  if (routeMap && (worldCupRouteData || worldCupRouteRounds) && worldCupTeams) {
    routeMap.innerHTML = renderTournamentRouteMap(worldCupRouteData || worldCupRouteRounds, matches);
    if (!routeMap.dataset.groupPredictionBound) {
      routeMap.addEventListener("click", handleWorldCupRouteMapClick);
      routeMap.dataset.groupPredictionBound = "true";
    }
  }

  if (latestMatches) {
    latestMatches.innerHTML = renderLatestMatchPredictions(getLatestWorldCupMatches(matches));
    latestMatches.querySelectorAll("[data-open-match-modal]").forEach((button) => {
      button.addEventListener("click", () => openMatchPredictionModal(button.dataset.matchId));
    });
  }

  if (matchBoard) {
    matchBoard.innerHTML = renderScheduleRecords(matches);
  }

  if (summaryPanel) {
    summaryPanel.innerHTML = renderWorldCupSummaryLoading();
    summaryPanel.querySelectorAll("[data-open-tournament-modal]").forEach((button) => {
      button.addEventListener("click", () => openTournamentPredictionModal(button.dataset.predictionId));
    });
  }

  initMatchPredictionModal();
  initTournamentPredictionModal();
}

async function loadWorldCupTournamentEvidence(predictionSpecs) {
  const summaryPanel = document.querySelector("[data-worldcup-summary-panel]");

  if (!summaryPanel || !predictionSpecs?.length) {
    return;
  }

  try {
    const markdownFiles = (await discoverTournamentEvidenceFiles()).filter((fileName) => !/_en\.md$/i.test(fileName));
    const versions = await Promise.all(markdownFiles.map(async (fileName) => {
      const markdown = await fetchTextFile(`${worldCupTournamentEvidenceDir}/${encodeURIComponent(fileName)}`);
      const base = parseTournamentEvidenceMarkdown(markdown, fileName);
      let enParsed = null;

      try {
        const enFileName = toEnglishEvidenceFileName(fileName);
        const enMarkdown = await fetchTextFile(`${worldCupTournamentEvidenceDir}/${encodeURIComponent(enFileName)}`);
        enParsed = parseTournamentEvidenceMarkdown(enMarkdown, enFileName);
      } catch (error) {
        enParsed = null;
      }

      return mergeTournamentEvidenceLanguage(base, enParsed);
    }));
    const predictions = buildTournamentPredictionsFromEvidence(predictionSpecs, versions.filter(Boolean));

    window.WORLD_CUP_TOURNAMENT_PREDICTIONS = predictions;
    currentWorldCupTournamentPredictions = predictions;
    renderTournamentSummaryMount(summaryPanel, predictions);
    updateTournamentPredictionRangeBadge(worldCupTournamentEvidenceFiles);
  } catch (error) {
    console.warn("Failed to load tournament prediction evidence files.", error);
    const fallback = buildTournamentPredictionsFromEvidence(predictionSpecs, []);
    window.WORLD_CUP_TOURNAMENT_PREDICTIONS = fallback;
    currentWorldCupTournamentPredictions = fallback;
    renderTournamentSummaryMount(summaryPanel, fallback);
    updateTournamentPredictionRangeBadge(worldCupTournamentEvidenceFiles);
  }
}

async function discoverTournamentEvidenceFiles() {
  try {
    const indexHtml = await fetchTextFile(`${worldCupTournamentEvidenceDir}/`);
    const files = [...indexHtml.matchAll(/href=["']([^"']+\.md)["']/gi)]
      .map((match) => decodeURIComponent(match[1].split("/").pop()))
      .filter(Boolean);
    const uniqueFiles = [...new Set(files)].sort(compareTournamentEvidenceFiles);

    if (uniqueFiles.length) {
      return uniqueFiles;
    }
  } catch (error) {
    console.warn("Directory listing for tournament evidence files is unavailable; using configured fallback list.", error);
  }

  return [...worldCupTournamentEvidenceFiles].sort(compareTournamentEvidenceFiles);
}

async function fetchTextFile(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.text();
}

function parseTournamentEvidenceMarkdown(markdown, fileName) {
  const sections = [];
  let current = null;

  String(markdown || "").split(/\r?\n/).forEach((line) => {
    const heading = line.match(/^##\s+(.+?)(?::|：)\s*(.+)$/);
    const bullet = line.match(/^-\s+(.+)$/);

    if (heading) {
      current = {
        sectionTitle: heading[1].trim(),
        predictedValue: heading[2].trim(),
        evidence: []
      };
      sections.push(current);
      return;
    }

    if (bullet && current) {
      current.evidence.push(bullet[1].trim());
    }
  });

  return {
    fileName,
    time: extractTournamentEvidenceDate(fileName),
    label: formatTournamentEvidenceLabel(fileName),
    labelEn: formatTournamentEvidenceLabelEn(fileName),
    sections
  };
}

function toEnglishEvidenceFileName(fileName) {
  if (/_zh\.md$/i.test(fileName)) {
    return fileName.replace(/_zh\.md$/i, "_en.md");
  }
  return String(fileName || "").replace(/\.md$/i, "_en.md");
}

function mergeTournamentEvidenceLanguage(base, enParsed) {
  if (!base) {
    return base;
  }

  base.sections = (base.sections || []).map((section, index) => ({
    ...section,
    evidenceEn: enParsed?.sections?.[index]?.evidence || []
  }));

  return base;
}

function buildTournamentPredictionsFromEvidence(specs, versions) {
  const sortedVersions = [...versions].sort((a, b) => compareTournamentEvidenceFiles(a.fileName, b.fileName));
  const latestVersion = sortedVersions[sortedVersions.length - 1];

  return (specs || []).map((spec) => {
    const history = sortedVersions.map((version, index) => {
      const section = findTournamentEvidenceSection(version, spec.sectionTitle);

      return {
        time: version.time || version.fileName,
        label: version.label,
        labelEn: version.labelEn,
        fileName: version.fileName,
        predictedValue: section?.predictedValue || "待预测",
        evidence: section?.evidence || [],
        evidenceEn: section?.evidenceEn || [],
        isLatest: index === sortedVersions.length - 1
      };
    });
    const latestSection = latestVersion ? findTournamentEvidenceSection(latestVersion, spec.sectionTitle) : null;
    const latestHistory = history[history.length - 1];

    return {
      ...spec,
      status: "待结算",
      updatedAt: latestVersion?.time || "待更新",
      predictedValue: latestSection?.predictedValue || latestHistory?.predictedValue || "待预测",
      evidence: latestSection?.evidence || latestHistory?.evidence || [],
      evidenceEn: latestSection?.evidenceEn || latestHistory?.evidenceEn || [],
      history
    };
  });
}

function findTournamentEvidenceSection(version, sectionTitle) {
  return version?.sections?.find((section) => section.sectionTitle === sectionTitle) || null;
}

function extractTournamentEvidenceDate(fileName) {
  const match = String(fileName || "").match(/baseline_(\d{8})/);

  if (!match) {
    return "";
  }

  return `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`;
}

function formatTournamentEvidenceLabel(fileName) {
  const date = extractTournamentEvidenceDate(fileName);
  return date ? `${date} 基线版` : fileName;
}

function formatTournamentEvidenceLabelEn(fileName) {
  const date = extractTournamentEvidenceDate(fileName);
  return date ? `${date} Baseline` : fileName;
}

function compareTournamentEvidenceFiles(a, b) {
  return String(a || "").localeCompare(String(b || ""), "zh-CN", { numeric: true });
}

function updateWorldCupPredictionRangeBadges() {
  updateGamePredictionRangeBadge(normalizeGamePredictionManifest(worldCupGamePredictionManifest));
  updateTournamentPredictionRangeBadge(worldCupTournamentEvidenceFiles);
}

function updateGamePredictionRangeBadge(specs = []) {
  const node = document.querySelector("[data-worldcup-game-prediction-range]");

  if (!node) {
    return;
  }

  setRangeBadge(node, formatPredictionRangeLabel(getGamePredictionVersionLabels(specs)));
}

function updateTournamentPredictionRangeBadge(files = []) {
  const node = document.querySelector("[data-worldcup-tournament-prediction-range]");

  if (!node) {
    return;
  }

  setRangeBadge(node, formatLatestPredictionTimeLabel(getTournamentEvidenceTimeLabels(files)));
}

function setRangeBadge(node, pair) {
  node.setAttribute("data-zh", pair.zh);
  node.setAttribute("data-en", pair.en);
  node.textContent = pairText(pair);
}

function getGamePredictionVersionLabels(specs = []) {
  return (specs || [])
    .flatMap((spec) => spec?.versions || [])
    .map((version) => formatGamePredictionVersionTime(version))
    .filter((label) => label && label !== "时间待定")
    .sort(comparePredictionTimeLabels);
}

function getTournamentEvidenceTimeLabels(files = []) {
  return (files || [])
    .map((fileName) => extractTournamentEvidenceDate(fileName))
    .filter(Boolean)
    .sort(comparePredictionTimeLabels);
}

function comparePredictionTimeLabels(a, b) {
  return String(a || "").localeCompare(String(b || ""), "zh-CN", { numeric: true });
}

function formatPredictionRangeLabel(labels) {
  const uniqueLabels = [...new Set(labels || [])].filter(Boolean);

  if (!uniqueLabels.length) {
    return { zh: "时间待定", en: "Time TBD" };
  }

  const first = uniqueLabels[0];
  const last = uniqueLabels[uniqueLabels.length - 1];

  if (first === last) {
    return { zh: first, en: first };
  }

  return { zh: `${first} 至 ${last}`, en: `${first} – ${last}` };
}

function formatLatestPredictionTimeLabel(labels) {
  const uniqueLabels = [...new Set(labels || [])].filter(Boolean);

  if (!uniqueLabels.length) {
    return { zh: "时间待定", en: "Time TBD" };
  }

  const latest = uniqueLabels[uniqueLabels.length - 1];
  return { zh: latest, en: latest };
}

function renderTournamentSummaryMount(summaryPanel, predictions) {
  summaryPanel.innerHTML = renderWorldCupSummaryPanel(predictions);
  summaryPanel.querySelectorAll("[data-open-tournament-modal]").forEach((button) => {
    button.addEventListener("click", () => openTournamentPredictionModal(button.dataset.predictionId));
  });
}

async function loadWorldCupGamePredictions(baseMatches = worldCupMatches || []) {
  const latestMatches = document.querySelector("[data-worldcup-latest-matches]");
  const routeMap = document.querySelector("[data-worldcup-route-map]");
  const matchSummary = document.querySelector("[data-worldcup-match-summary]");

  if (!latestMatches) {
    return;
  }

  try {
    const specs = await discoverGamePredictionSpecs();

    if (!specs.length) {
      return;
    }

    const folderMatches = await Promise.all(specs.map((spec) => loadGamePredictionMatch(spec, baseMatches)));
    const loadedMatches = folderMatches.filter(Boolean);

    if (!loadedMatches.length) {
      return;
    }

    const baseById = new Map((baseMatches || []).map((match) => [match.id, match]));
    const baseByPair = new Map((baseMatches || []).map((match) => [buildMatchPairKey(match.homeTeam, match.awayTeam), match]));
    const merged = (baseMatches || []).map((match) => {
      const replacement = loadedMatches.find((item) => item.id === match.id || buildMatchPairKey(item.homeTeam, item.awayTeam) === buildMatchPairKey(match.homeTeam, match.awayTeam));
      return replacement ? { ...match, ...replacement } : match;
    });

    loadedMatches.forEach((match) => {
      const existing = baseById.has(match.id) || baseByPair.has(buildMatchPairKey(match.homeTeam, match.awayTeam));

      if (!existing) {
        merged.push(match);
      }
    });

    currentWorldCupMatches = merged;
    window.WORLD_CUP_MATCH_PREDICTIONS = merged;
    const sortedMatches = getLatestLoadedGamePredictionMatches(loadedMatches, specs);
    latestMatches.innerHTML = renderLatestMatchPredictions(sortedMatches.slice(0, WORLD_CUP_LATEST_MATCH_LIMIT));
    if (routeMap && (worldCupRouteData || worldCupRouteRounds) && worldCupTeams) {
      routeMap.innerHTML = renderTournamentRouteMap(worldCupRouteData || worldCupRouteRounds, merged);
    }
    if (matchSummary) {
      const predictedMatches = merged.filter((match) => match.predictionStatus === "predicted");
      const finishedMatches = merged.filter((match) => match.matchStatus === "finished");
      matchSummary.innerHTML = `
        <div><strong>${merged.length}</strong>${bi("总赛程")}</div>
        <div><strong>${predictedMatches.length}</strong>${bi("已预测")}</div>
        <div><strong>${finishedMatches.length}</strong>${bi("已结束")}</div>
      `;
    }
    latestMatches.querySelectorAll("[data-open-match-modal]").forEach((button) => {
      button.addEventListener("click", () => openMatchPredictionModal(button.dataset.matchId));
    });
    updateGamePredictionRangeBadge(getLatestGamePredictionSpecs(specs));
  } catch (error) {
    console.warn("Failed to load game prediction folders.", error);
  }
}

function handleWorldCupRouteMapClick(event) {
  const button = event.target.closest("[data-open-group-prediction-modal]");

  if (!button) {
    return;
  }

  openGroupPredictionModal(button.dataset.matchId);
}

async function openGroupPredictionModal(matchId) {
  const match = (currentWorldCupMatches || worldCupMatches || []).find((item) => String(item.id) === String(matchId));

  if (!match) {
    return;
  }

  const loadedMatch = await loadGroupPredictionMatch(match);

  if (!loadedMatch) {
    return;
  }

  openMatchPredictionModal(loadedMatch.id);
}

async function loadGroupPredictionMatch(match) {
  const configuredSpec = findConfiguredGamePredictionSpec(match);
  const matchFolder = configuredSpec?.matchFolder || buildGamePredictionFolderName(match);
  const cacheKey = matchFolder || match?.id;

  if (!matchFolder) {
    return null;
  }

  if (worldCupGamePredictionLoadCache.has(cacheKey)) {
    return worldCupGamePredictionLoadCache.get(cacheKey);
  }

  const loadPromise = (async () => {
    const versionFolders = configuredSpec?.versions?.length
      ? configuredSpec.versions
      : await discoverGamePredictionVersionFolders(matchFolder);

    if (!versionFolders.length) {
      return null;
    }

    const loaded = await loadGamePredictionMatch({ matchFolder, versions: versionFolders }, worldCupMatches || []);

    if (!loaded) {
      return null;
    }

    mergeWorldCupMatchPrediction(loaded);
    return loaded;
  })();

  worldCupGamePredictionLoadCache.set(cacheKey, loadPromise);

  try {
    return await loadPromise;
  } finally {
    worldCupGamePredictionLoadCache.delete(cacheKey);
  }
}

async function discoverGamePredictionVersionFolders(matchFolder) {
  const configuredSpec = getConfiguredGamePredictionSpecs()
    .find((spec) => spec.matchFolder === matchFolder);

  if (configuredSpec?.versions?.length) {
    return configuredSpec.versions;
  }

  try {
    const versionHtml = await fetchTextFile(`${worldCupGamePredictionDir}/${encodeURIComponent(matchFolder)}/`);
    return extractDirectoryLinks(versionHtml)
      .filter((folder) => /^\d{4}\.\d{1,2}\.\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(folder))
      .sort(compareGamePredictionVersions);
  } catch (error) {
    console.warn(`Unable to load game prediction versions for ${matchFolder}.`, error);
    return [];
  }
}

function buildGamePredictionFolderName(match) {
  const homeTeam = getWorldCupTeam(match?.homeTeamId);
  const awayTeam = getWorldCupTeam(match?.awayTeamId);
  const home = normalizeGamePredictionFolderSegment(homeTeam?.nameEn || match?.homeTeam || "");
  const away = normalizeGamePredictionFolderSegment(awayTeam?.nameEn || match?.awayTeam || "");
  const matchNo = String(match?.matchNo || match?.id || "").match(/^M\d+$/)?.[0] || "";

  if (!home || !away) {
    return "";
  }

  return `${home}_vs_${away}${matchNo ? `_${matchNo}` : ""}`;
}

function findConfiguredGamePredictionFolder(match) {
  return findConfiguredGamePredictionSpec(match)?.matchFolder || "";
}

function findConfiguredGamePredictionSpec(match) {
  const matchNo = String(match?.matchNo || match?.id || "");
  const allSpecs = getConfiguredGamePredictionSpecs();

  if (matchNo) {
    const byNo = allSpecs.find((spec) => String(spec.matchNo || "") === matchNo);

    if (byNo) {
      return byNo;
    }
  }

  const pairKey = buildMatchPairKey(
    getWorldCupTeam(match?.homeTeamId)?.nameEn || match?.homeTeam,
    getWorldCupTeam(match?.awayTeamId)?.nameEn || match?.awayTeam
  );
  const byPair = allSpecs.find((spec) => {
    const inferred = inferGamePredictionTeams(spec.matchFolder);
    return buildMatchPairKey(inferred.homeName, inferred.awayName) === pairKey;
  });

  return byPair || null;
}

function getConfiguredGamePredictionSpecs() {
  return [
    ...normalizeGamePredictionManifest(worldCupLatestGamePredictions, { limit: null }),
    ...normalizeGamePredictionManifest(worldCupGamePredictionManifest, { limit: null })
  ];
}

function normalizeGamePredictionFolderSegment(value) {
  const alias = {
    "Korea Republic": "South Korea",
    "Republic of Korea": "South Korea",
    "Bosnia & Herzegovina": "Bosnia and Herzegovina"
  }[String(value || "")] || value;

  return String(alias || "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function mergeWorldCupMatchPrediction(loadedMatch) {
  const current = currentWorldCupMatches || worldCupMatches || [];
  const next = current.map((match) => (
    String(match.id) === String(loadedMatch.id) ? { ...match, ...loadedMatch } : match
  ));
  const exists = next.some((match) => String(match.id) === String(loadedMatch.id));

  currentWorldCupMatches = exists ? next : [...next, loadedMatch];
  window.WORLD_CUP_MATCH_PREDICTIONS = currentWorldCupMatches;

  const routeMap = document.querySelector("[data-worldcup-route-map]");
  const matchSummary = document.querySelector("[data-worldcup-match-summary]");

  if (routeMap && (worldCupRouteData || worldCupRouteRounds) && worldCupTeams) {
    routeMap.innerHTML = renderTournamentRouteMap(worldCupRouteData || worldCupRouteRounds, currentWorldCupMatches);
  }

  if (matchSummary) {
    const predictedMatches = currentWorldCupMatches.filter((item) => item.predictionStatus === "predicted");
    const finishedMatches = currentWorldCupMatches.filter((item) => item.matchStatus === "finished");
    matchSummary.innerHTML = `
      <div><strong>${currentWorldCupMatches.length}</strong>${bi("总赛程")}</div>
      <div><strong>${predictedMatches.length}</strong>${bi("已预测")}</div>
      <div><strong>${finishedMatches.length}</strong>${bi("已结束")}</div>
    `;
  }
}

async function discoverGamePredictionSpecs() {
  const latestSpecs = normalizeGamePredictionManifest(worldCupLatestGamePredictions, { limit: WORLD_CUP_LATEST_MATCH_LIMIT });

  if (latestSpecs.length) {
    return latestSpecs;
  }

  const discovered = await discoverGamePredictionFolders();

  if (discovered.length) {
    return sortGamePredictionSpecs(discovered);
  }

  return normalizeGamePredictionManifest(worldCupGamePredictionManifest, { limit: null });
}

async function discoverGamePredictionFolders() {
  try {
    const indexHtml = await fetchTextFile(`${worldCupGamePredictionDir}/`);
    const folders = extractDirectoryLinks(indexHtml)
      .filter((folder) => folder && !folder.startsWith("."));
    const specs = [];

    for (const matchFolder of folders) {
      const versionHtml = await fetchTextFile(`${worldCupGamePredictionDir}/${encodeURIComponent(matchFolder)}/`);
      const versions = extractDirectoryLinks(versionHtml)
        .filter((folder) => /^\d{4}\.\d{1,2}\.\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(folder))
        .sort(compareGamePredictionVersions);

      specs.push({ matchFolder, versions });
    }

    return sortGamePredictionSpecs(specs.filter((spec) => spec.versions.length));
  } catch (error) {
    console.warn("Directory listing for game predictions is unavailable; using configured fallback list.", error);
    return [];
  }
}

function extractDirectoryLinks(indexHtml) {
  return [...String(indexHtml || "").matchAll(/href=["']([^"']+\/)["']/gi)]
    .map((match) => decodeURIComponent(match[1].replace(/\/$/, "").split("/").pop()))
    .filter((folder) => folder && folder !== "." && folder !== "..");
}

function normalizeGamePredictionManifest(manifest, options = {}) {
  const limit = options.limit === null ? null : Number(options.limit || WORLD_CUP_LATEST_MATCH_LIMIT);
  const specs = (manifest || [])
    .map((entry) => {
      if (typeof entry === "string") {
        return { matchFolder: entry, versions: [] };
      }

      return {
        matchNo: entry.matchNo || entry.matchId || "",
        matchFolder: entry.matchFolder || entry.folder || "",
        versions: Array.isArray(entry.versions) ? entry.versions : []
      };
    })
    .filter((entry) => entry.matchFolder && entry.versions.length);

  const sorted = sortGamePredictionSpecs(specs);
  return limit ? sorted.slice(0, limit) : sorted;
}

function sortGamePredictionSpecs(specs = []) {
  return [...(specs || [])]
    .map((spec) => ({
      ...spec,
      versions: [...(spec.versions || [])].sort((a, b) => compareGamePredictionVersions(
        normalizeGamePredictionVersionId(a),
        normalizeGamePredictionVersionId(b)
      ))
    }))
    .sort((a, b) => {
      const versionCompare = compareGamePredictionVersions(getLatestGamePredictionSpecVersion(b), getLatestGamePredictionSpecVersion(a));

      if (versionCompare) {
        return versionCompare;
      }

      return String(a.matchFolder || "").localeCompare(String(b.matchFolder || ""), "zh-CN", { numeric: true });
    });
}

function getLatestGamePredictionSpecVersion(spec) {
  return normalizeGamePredictionVersionId(spec?.versions?.[spec.versions.length - 1]);
}

function normalizeGamePredictionVersionId(version) {
  if (!version) {
    return "";
  }

  if (typeof version === "string") {
    return version;
  }

  return version.versionFolder || version.folder || version.version || version.time || "";
}

function getLatestGamePredictionSpecs(specs = []) {
  const sortedSpecs = sortGamePredictionSpecs(specs);

  return sortedSpecs.slice(0, WORLD_CUP_LATEST_MATCH_LIMIT);
}

function getLatestLoadedGamePredictionMatches(matches = [], specs = []) {
  if ((worldCupLatestGamePredictions || []).length) {
    const explicitOrder = new Map((specs || []).map((spec, index) => [spec.matchFolder, index]));

    return [...matches].sort((a, b) => {
      const timeCompare = compareGamePredictionMatchTime(a, b);

      if (timeCompare) {
        return timeCompare;
      }

      return (explicitOrder.get(a.gamePredictionSource?.matchFolder) ?? 0) - (explicitOrder.get(b.gamePredictionSource?.matchFolder) ?? 0);
    });
  }

  const latestVersion = [...matches]
    .map((match) => getLatestGamePredictionSpecVersion(match.gamePredictionSource || {}))
    .filter(Boolean)
    .sort(compareGamePredictionVersions)
    .pop();
  const candidates = latestVersion
    ? matches.filter((match) => getLatestGamePredictionSpecVersion(match.gamePredictionSource || {}) === latestVersion)
    : matches;

  return [...candidates].sort((a, b) => compareGamePredictionMatchTime(a, b));
}

async function loadGamePredictionMatch(spec, baseMatches = worldCupMatches || []) {
  const versions = await Promise.all((spec.versions || []).map((versionFolder) => (
    loadGamePredictionVersion(spec.matchFolder, versionFolder)
  )));
  const validVersions = versions.filter(Boolean).sort((a, b) => compareGamePredictionVersions(a.versionFolder, b.versionFolder));

  if (!validVersions.length) {
    return null;
  }

  const latest = validVersions[validVersions.length - 1];
  const inferred = inferGamePredictionTeams(spec.matchFolder, latest.brief);
  const baseMatch = findBaseMatchForPrediction(inferred.homeName, inferred.awayName, baseMatches);
  const homeTeam = findTeamByEnglishName(inferred.homeName) || getWorldCupTeam(baseMatch?.homeTeamId);
  const awayTeam = findTeamByEnglishName(inferred.awayName) || getWorldCupTeam(baseMatch?.awayTeamId);
  const id = baseMatch?.id || latest.brief?.match?.match_id || buildMatchPairKey(inferred.homeName, inferred.awayName);
  const predictionSummary = buildGamePredictionSummary(latest, homeTeam, awayTeam);
  const topScore = latest.brief?.top_scores?.[0]?.score || "";
  const winReference = formatOutcomeReference(latest, homeTeam, awayTeam);

  return {
    ...(baseMatch || {}),
    id,
    matchNo: baseMatch?.matchNo || id,
    homeTeamId: homeTeam?.id || baseMatch?.homeTeamId || "",
    awayTeamId: awayTeam?.id || baseMatch?.awayTeamId || "",
    homeTeam: homeTeam?.nameZh || inferred.homeName,
    awayTeam: awayTeam?.nameZh || inferred.awayName,
    stage: formatGamePredictionStage(latest.brief?.match?.stage, baseMatch?.stage),
    group: latest.brief?.match?.group ? `${latest.brief.match.group}组` : baseMatch?.group,
    round: baseMatch?.round || "第1轮",
    matchTime: formatKickoffTime(latest.brief?.match?.kickoff_utc) || baseMatch?.matchTime || "时间待定",
    venue: baseMatch?.venue || latest.brief?.match?.venue || "场馆待定",
    predictionStatus: "predicted",
    matchStatus: baseMatch?.matchStatus || "upcoming",
    predictedScore: topScore || baseMatch?.predictedScore || "待预测",
    winReference,
    predictionSummary,
    updatedAt: latest.timeLabel,
    kickoffUtc: latest.brief?.match?.kickoff_utc || baseMatch?.kickoffUtc || "",
    predictionHistory: validVersions.map((version, index) => ({
      ...version,
      isLatest: index === validVersions.length - 1,
      predictedScore: version.brief?.top_scores?.[0]?.score || "待预测",
      winReference: formatOutcomeReference(version, homeTeam, awayTeam),
      summary: buildGamePredictionSummary(version, homeTeam, awayTeam)
    })),
    gamePredictionSource: {
      matchFolder: spec.matchFolder,
      versions: validVersions
    }
  };
}

async function loadGamePredictionVersion(matchFolder, versionFolder) {
  const basePath = `${worldCupGamePredictionDir}/${encodeURIComponent(matchFolder)}/${encodeURIComponent(versionFolder)}`;
  const [briefJson, briefMarkdown, matrixCsv, matrixJson, deviationCsv, deviationJson] = await Promise.all([
    fetchJsonFile(`${basePath}/prediction_brief.json`).catch(() => null),
    fetchTextFile(`${basePath}/prediction_brief.md`).catch(() => ""),
    fetchTextFile(`${basePath}/monte_carlo_score_matrix.csv`).catch(() => ""),
    fetchJsonFile(`${basePath}/monte_carlo_score_matrix.json`).catch(() => null),
    fetchTextFile(`${basePath}/score_deviation_space.csv`).catch(() => ""),
    fetchJsonFile(`${basePath}/score_deviation_space.json`).catch(() => null)
  ]);

  if (!briefJson && !briefMarkdown) {
    return null;
  }

  const markdownBrief = parseGamePredictionBriefMarkdown(briefMarkdown);
  const brief = mergeGamePredictionBrief(markdownBrief, briefJson);

  return {
    versionFolder,
    time: formatGamePredictionVersionTime(versionFolder),
    timeLabel: formatGamePredictionVersionTime(versionFolder),
    label: "比赛预测版本",
    brief,
    markdown: briefMarkdown,
    scoreMatrix: parseScoreMatrixCsv(matrixCsv) || matrixJson,
    deviationSpace: parseScoreDeviationCsv(deviationCsv) || deviationJson,
    keyFactors: normalizeGamePredictionKeyFactors(briefJson, briefMarkdown)
  };
}

async function fetchJsonFile(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.json();
}

function parseGamePredictionBriefMarkdown(markdown) {
  const title = String(markdown || "").match(/^#\s+(.+)$/m)?.[1] || "";
  const teams = title.split(/\s+vs\s+/i);
  const probabilities = {};
  const topScores = [...String(markdown || "").matchAll(/\|\s*`?(\d+\-\d+)`?\s*\|\s*\**(\d+(?:\.\d+)?)%\**\s*\|/g)]
    .map((match) => ({
      score: match[1],
      probability: Number(match[2]) / 100
    }))
    .filter((item) => Number.isFinite(item.probability));

  String(markdown || "").split(/\r?\n/).forEach((line) => {
    const cleaned = line.replace(/\*\*|`/g, "").trim();
    const match = cleaned.match(/^\|\s*(.+?)\s*\|\s*(\d+(?:\.\d+)?)%\s*\|$/);

    if (!match) {
      return;
    }

    if (/平局/.test(match[1])) {
      probabilities.draw = Number(match[2]) / 100;
    } else if (teams[0] && match[1].includes(teams[0])) {
      probabilities.team_a_win = Number(match[2]) / 100;
    } else if (teams[1] && match[1].includes(teams[1])) {
      probabilities.team_b_win = Number(match[2]) / 100;
    }
  });

  return {
    match: {
      team_a: teams[0] || "",
      team_b: teams[1] || ""
    },
    win_draw_loss: probabilities,
    top_scores: topScores,
    key_factors: extractMarkdownSectionBullets(markdown, "关键因素").map((text) => ({ text_cn: text })),
    tail_forecast_summary: parseMarkdownTailForecastSummary(markdown)
  };
}

function parseMarkdownTailForecastSummary(markdown) {
  const text = String(markdown || "");
  const block = text.match(/<!--\s*TAIL_FORECAST_SUMMARY_START\s*-->([\s\S]*?)<!--\s*TAIL_FORECAST_SUMMARY_END\s*-->/)?.[1] || "";

  if (!block) {
    return null;
  }

  const scenarios = [];
  let currentScenario = null;

  block.split(/\r?\n/).forEach((line) => {
    const heading = line.match(/^###\s+(.+?)\s*$/);

    if (heading) {
      const title = stripMarkdownInline(heading[1]);

      if (/其他高偏离风险/.test(title)) {
        currentScenario = null;
        return;
      }

      const titleParts = title.split(/\s*[·•]\s*/).filter(Boolean);
      const label = titleParts[0] || title;
      const attentionLabel = titleParts.slice(1).join(" · ");

      currentScenario = {
        scenario_id: inferTailScenarioId(label, scenarios.length),
        label_cn: label,
        title_cn: title,
        attention_label_cn: attentionLabel.replace(/关注$/, "") || attentionLabel,
        top_scores: []
      };
      scenarios.push(currentScenario);
      return;
    }

    if (!currentScenario) {
      return;
    }

    const probabilityMatch = line.match(/情景基础概率：\s*\**(\d+(?:\.\d+)?)%\**/);
    if (probabilityMatch) {
      currentScenario.base_event_probability = Number(probabilityMatch[1]) / 100;
      return;
    }

    const focusScoreMatch = line.match(/聚焦比分：(.+)$/);
    if (focusScoreMatch) {
      currentScenario.top_scores = parseTailFocusScores(focusScoreMatch[1]);
      return;
    }

    const summaryMatch = line.match(/机制判断：(.+)$/);
    if (summaryMatch) {
      currentScenario.summary_cn = stripMarkdownInline(summaryMatch[1]);
    }
  });

  return scenarios.length ? {
    source: "prediction_brief.md",
    scenarios
  } : null;
}

function stripMarkdownInline(value) {
  return String(value || "").replace(/\*\*|`/g, "").trim();
}

function inferTailScenarioId(label, index) {
  if (/大比分|开放/.test(label)) {
    return "high_scoring";
  }

  if (/崩盘|一边倒/.test(label)) {
    return "blowout";
  }

  if (/爆冷/.test(label)) {
    return "upset";
  }

  return `tail_focus_${index + 1}`;
}

function parseTailFocusScores(text) {
  return [...String(text || "").matchAll(/`(\d+\-\d+)`(?:[（(][^）)]*?(\d+(?:\.\d+)?)%[^）)]*[）)])?/g)]
    .map((match) => ({
      score: match[1],
      probability: match[2] ? Number(match[2]) / 100 : null
    }))
    .filter((item) => item.score);
}

function normalizeGamePredictionKeyFactors(briefJson, markdown) {
  // Prefer the structured JSON factors because they can carry an English
  // translation (text_en); fall back to the Chinese-only markdown bullets.
  const jsonFactors = (briefJson?.key_factors || [])
    .map((item) => {
      if (typeof item === "string") {
        return { zh: item, en: item };
      }
      const zh = item.text_cn || item.text || "";
      const en = item.text_en || item.text_cn || item.text || "";
      return { zh, en };
    })
    .filter((factor) => factor.zh || factor.en);

  if (jsonFactors.length) {
    return jsonFactors;
  }

  return extractMarkdownSectionBullets(markdown, "关键因素")
    .map((text) => ({ zh: text, en: text }));
}

function mergeGamePredictionBrief(markdownBrief, jsonBrief) {
  if (!jsonBrief) {
    return markdownBrief;
  }

  return {
    ...jsonBrief,
    match: {
      ...(jsonBrief.match || {}),
      ...(markdownBrief?.match || {})
    },
    win_draw_loss: hasProbabilityValues(markdownBrief?.win_draw_loss)
      ? markdownBrief.win_draw_loss
      : jsonBrief.win_draw_loss,
    top_scores: Array.isArray(markdownBrief?.top_scores) && markdownBrief.top_scores.length
      ? markdownBrief.top_scores
      : jsonBrief.top_scores,
    key_factors: Array.isArray(markdownBrief?.key_factors) && markdownBrief.key_factors.length
      ? markdownBrief.key_factors
      : jsonBrief.key_factors,
    tail_forecast_summary: hasTailForecastScenarios(markdownBrief?.tail_forecast_summary)
      ? markdownBrief.tail_forecast_summary
      : jsonBrief.tail_forecast_summary
  };
}

function hasProbabilityValues(values) {
  return Boolean(values && Object.values(values).some((value) => Number.isFinite(Number(value))));
}

function hasTailForecastScenarios(summary) {
  return Array.isArray(summary?.scenarios) && summary.scenarios.length > 0;
}

function parseScoreMatrixCsv(csvText) {
  const rows = parseCsvRows(csvText);

  if (rows.length < 2) {
    return null;
  }

  const header = rows[0];
  const columns = header.slice(1);
  const axisTeams = String(header[0] || "").replace(/^\ufeff/, "").split("\\");
  const rowLabels = rows.slice(1).map((row) => row[0]);
  const matrix = rows.slice(1).map((row) => row.slice(1).map((value) => Number(value) || 0));

  return {
    row_axis: {
      team: axisTeams[0] || "主队",
      buckets: rowLabels
    },
    column_axis: {
      team: axisTeams[1] || "客队",
      buckets: columns
    },
    matrix,
    axis_note_cn: `纵轴为${axisTeams[0] || "主队"}进球数，横轴为${axisTeams[1] || "客队"}进球数；5+ 表示至少 5 球。`,
    axis_note_en: `Rows show ${axisTeams[0] || "home"} goals, columns show ${axisTeams[1] || "away"} goals; 5+ means at least 5.`
  };
}

function parseScoreDeviationCsv(csvText) {
  const rows = parseCsvRows(csvText);

  if (rows.length < 2) {
    return null;
  }

  const header = rows[0].map((item) => item.replace(/^\ufeff/, ""));
  const points = rows.slice(1).map((row) => {
    const item = Object.fromEntries(header.map((key, index) => [key, row[index]]));

    return {
      score: item.score,
      deviation: Number(item.deviation),
      probability: Number(item.probability),
      probability_percent: Number(item.probability_percent),
      outcome: item.outcome,
      sample_count: Number(item.sample_count),
      path_deviation: Number(item.path_deviation),
      result_surprise: Number(item.result_surprise),
      reason_cn: item.reason_cn,
      mechanism_ids: item.mechanism_ids ? item.mechanism_ids.split("|").filter(Boolean) : []
    };
  }).filter((point) => point.score && Number.isFinite(point.deviation) && Number.isFinite(point.probability));

  return {
    x_axis: {
      field: "deviation",
      label_cn: "比分偏离度（越大越激进）"
    },
    y_axis: {
      field: "probability",
      label_cn: "最终概率"
    },
    points
  };
}

function parseCsvRows(csvText) {
  const text = String(csvText || "").trim();

  if (!text) {
    return [];
  }

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  rows.push(row);
  return rows.filter((items) => items.some((item) => item !== ""));
}

function extractMarkdownSectionBullets(markdown, sectionTitle) {
  const lines = String(markdown || "").split(/\r?\n/);
  const bullets = [];
  let inSection = false;

  lines.forEach((line) => {
    if (/^##\s+/.test(line)) {
      inSection = line.includes(sectionTitle);
      return;
    }

    if (inSection && /^-\s+/.test(line.trim())) {
      bullets.push(line.trim().replace(/^-\s+/, "").replace(/\*\*/g, ""));
    }
  });

  return bullets;
}

function inferGamePredictionTeams(matchFolder, brief) {
  const fromBrief = brief?.match || {};
  const folderName = String(matchFolder || "").replace(/_M\d+$/i, "");
  const folderNames = folderName.split("_vs_");

  return {
    homeName: fromBrief.team_a || folderNames[0] || "",
    awayName: fromBrief.team_b || folderNames[1] || ""
  };
}

function findBaseMatchForPrediction(homeName, awayName, matches = worldCupMatches || []) {
  const pairKey = buildMatchPairKey(homeName, awayName);

  return (matches || []).find((match) => (
    buildMatchPairKey(match.homeTeam, match.awayTeam) === pairKey ||
    buildMatchPairKey(getWorldCupTeam(match.homeTeamId)?.nameEn, getWorldCupTeam(match.awayTeamId)?.nameEn) === pairKey
  )) || null;
}

function findTeamByEnglishName(name) {
  const normalized = normalizeTeamLookupName(name);

  return Object.values(worldCupTeams || {}).find((team) => (
    normalizeTeamLookupName(team.nameEn) === normalized ||
    normalizeTeamLookupName(team.nameZh) === normalized ||
    normalizeTeamLookupName(team.id) === normalized
  )) || null;
}

function buildMatchPairKey(homeName, awayName) {
  return `${normalizeTeamLookupName(homeName)}_vs_${normalizeTeamLookupName(awayName)}`;
}

function normalizeTeamLookupName(value) {
  const normalized = String(value || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "");
  const aliases = {
    bosniaandherzegovina: "bosniaherzegovina",
    cotedivoire: "ivorycoast",
    korearepublic: "southkorea",
    republicofkorea: "southkorea"
  };

  return aliases[normalized] || normalized;
}

function formatGamePredictionStage(stage, fallbackStage) {
  if (!stage) {
    return fallbackStage || "小组赛";
  }

  const map = {
    group: "小组赛",
    knockout: "淘汰赛",
    final: "决赛"
  };

  return map[String(stage).toLowerCase()] || fallbackStage || stage;
}

function formatKickoffTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return `${month}月${day}日 ${hour}:${minute} UTC`;
}

function formatGamePredictionVersionTime(value) {
  const match = String(value || "").match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.(\d{1,2})$/);

  if (!match) {
    return value || "时间待定";
  }

  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")} ${match[4].padStart(2, "0")}:${match[5].padStart(2, "0")}`;
}

function compareGamePredictionVersions(a, b) {
  return String(a || "").localeCompare(String(b || ""), "zh-CN", { numeric: true });
}

function compareGamePredictionMatchTime(a, b) {
  const timeA = Date.parse(a?.kickoffUtc || a?.gamePredictionSource?.versions?.[a?.gamePredictionSource?.versions?.length - 1]?.time || "");
  const timeB = Date.parse(b?.kickoffUtc || b?.gamePredictionSource?.versions?.[b?.gamePredictionSource?.versions?.length - 1]?.time || "");

  if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
    return timeA - timeB;
  }

  return String(a?.id || "").localeCompare(String(b?.id || ""), "zh-CN", { numeric: true });
}

function buildGamePredictionSummary(version, homeTeam, awayTeam) {
  const probabilities = normalizeWinDrawLossProbabilities(version, homeTeam, awayTeam);
  const top = probabilities.slice().sort((a, b) => b.value - a.value)[0];
  const topScore = version?.brief?.top_scores?.[0]?.score;

  if (top && topScore) {
    return {
      zh: `最可能赛果为 ${top.labelZh}，最高概率比分为 ${topScore}。`,
      en: `Most likely result: ${top.labelEn}, most likely score ${topScore}.`
    };
  }

  if (top) {
    return {
      zh: `最可能赛果为 ${top.labelZh}。`,
      en: `Most likely result: ${top.labelEn}.`
    };
  }

  const home = teamPair(homeTeam, version?.brief?.match?.team_a);
  const away = teamPair(awayTeam, version?.brief?.match?.team_b);

  return {
    zh: `${home.zh} vs ${away.zh} 的预测数据已更新。`,
    en: `Prediction data for ${home.en} vs ${away.en} has been updated.`
  };
}

function formatOutcomeReference(version, homeTeam, awayTeam) {
  const probabilities = normalizeWinDrawLossProbabilities(version, homeTeam, awayTeam);
  const top = probabilities.slice().sort((a, b) => b.value - a.value)[0];

  if (!top) {
    return { zh: "待预测", en: "Pending" };
  }

  const value = formatProbabilityValue(top.value);
  return { zh: `${top.labelZh} ${value}`, en: `${top.labelEn} ${value}` };
}

function getLatestWorldCupMatches(matches) {
  const idSet = new Set(worldCupLatestMatchIds || []);
  const selected = matches.filter((match) => idSet.has(match.id));

  if (selected.length) {
    return selected.sort((a, b) => (worldCupLatestMatchIds || []).indexOf(a.id) - (worldCupLatestMatchIds || []).indexOf(b.id));
  }

  return matches.filter((match) => match.predictionStatus === "predicted").slice(0, WORLD_CUP_LATEST_MATCH_LIMIT);
}

function renderTournamentRouteMap(routeData, matches = worldCupMatches || []) {
  if (Array.isArray(routeData)) {
    return renderLegacyTournamentRouteMap(routeData, matches);
  }

  return `
    <div class="route-map-shell">
      ${renderWorldCupFormatBar()}
      ${renderGroupStageSnapshot(worldCupGroups || [], matches)}
      <div class="route-stage-transition">
        ${bi("小组赛", "Group Stage")}
        ${bi("小组前二 + 8 个最佳第三名晋级", "Top 2 + 8 best third-placed teams advance")}
        ${bi("淘汰赛", "Knockout Stage")}
      </div>
      <div class="bidirectional-route-map">
        ${renderBracketSidePanel(routeData.leftBracket, matches)}
        ${renderFinalChampionPanel(routeData.final, routeData.champion, matches)}
        ${renderBracketSidePanel(routeData.rightBracket, matches)}
      </div>
    </div>
  `;
}

function renderWorldCupFormatBar() {
  return `
    <div class="route-format-bar">
      <strong ${biAttrs("赛制说明", "Format")}>${L("赛制说明", "Format")}</strong>
      ${bi("48 支球队 · 12 个小组 · 小组前二 + 8 个最佳第三名 → 32 强淘汰赛", "48 teams · 12 groups · Top 2 + 8 best third-placed → Round of 32")}
      <small ${biAttrs("小组赛阶段共 72 场，淘汰赛从 32 强开始，冠军球队最多进行 8 场比赛。", "72 group-stage matches; the knockout phase begins at the Round of 32, and the champion plays up to 8 matches.")}>${escapeHtml(L("小组赛阶段共 72 场，淘汰赛从 32 强开始，冠军球队最多进行 8 场比赛。", "72 group-stage matches; the knockout phase begins at the Round of 32, and the champion plays up to 8 matches."))}</small>
    </div>
  `;
}

function renderGroupStageSnapshot(groups, matches = worldCupMatches || []) {
  if (!groups.length) {
    return "";
  }

  return `
    <section class="group-stage-snapshot">
      <div class="snapshot-head">
        <div>
          <span>GROUP STAGE SNAPSHOT</span>
          <h3 ${biAttrs("小组赛概览", "Group stage overview")}>${L("小组赛概览", "Group stage overview")}</h3>
          <p ${biAttrs("展示 12 个小组的比赛队伍、时间与结果，用于说明 32 强席位来源；不代表淘汰赛晋级已经确定。", "Teams, times and results for all 12 groups, showing where the 32 knockout berths come from, and it does not mean qualification is confirmed.")}>${escapeHtml(L("展示 12 个小组的比赛队伍、时间与结果，用于说明 32 强席位来源；不代表淘汰赛晋级已经确定。", "Teams, times and results for all 12 groups, showing where the 32 knockout berths come from, and it does not mean qualification is confirmed."))}</p>
        </div>
        <p ${biAttrs("未开赛比赛显示“未开赛”。", "Matches not yet played are marked “Upcoming”.")}>${escapeHtml(L("未开赛比赛显示“未开赛”。", "Matches not yet played are marked “Upcoming”."))}</p>
      </div>
      <div class="group-snapshot-grid">
        ${groups.map((group) => renderGroupSnapshotCard(group, matches)).join("")}
      </div>
    </section>
  `;
}

function renderGroupSnapshotCard(group, matches = worldCupMatches || []) {
  const groupMatches = getGroupMatches(group, matches);

  return `
    <article class="group-snapshot-card">
      <div class="group-card-head">
        <strong ${biAttrs(group.nameZh || group.name, group.name)}>${escapeHtml(getLang() === "en" ? group.name : (group.nameZh || group.name))}</strong>
        <span>${group.name}</span>
      </div>
      <ul class="group-team-list">
        ${(group.teams || []).map((teamId) => renderGroupTeamRow(teamId)).join("")}
      </ul>
      <div class="group-result-list">
        <strong ${biAttrs("赛程 / 状态", "Fixtures / status")}>${L("赛程 / 状态", "Fixtures / status")}</strong>
        ${groupMatches.length
          ? groupMatches.map((match) => renderGroupResultLine(match)).join("")
          : `<span class="group-result-empty" ${biAttrs("暂无比赛数据", "No match data yet")}>${L("暂无比赛数据", "No match data yet")}</span>`}
      </div>
    </article>
  `;
}

function renderGroupTeamRow(teamId) {
  const team = getWorldCupTeam(teamId);
  const name = teamPair(team, teamId);

  return `
    <li>
      ${renderTeamFlag(team, "group-flag")}
      <span ${biAttrs(name.zh, name.en)}>${escapeHtml(pairText(name))}</span>
    </li>
  `;
}

function getFinishedGroupMatches(group) {
  return (worldCupMatches || []).filter((match) => (
    match.stage === "小组赛" &&
    match.group === group.nameZh &&
    match.matchStatus === "finished"
  ));
}

function getGroupMatches(group, matches = worldCupMatches || []) {
  return (matches || [])
    .filter((match) => (
      match.stage === "小组赛" &&
      match.group === group.nameZh
    ))
    .sort(compareWorldCupMatchesByTime);
}

function renderGroupResultLine(match) {
  const homeTeam = getWorldCupTeam(match.homeTeamId);
  const awayTeam = getWorldCupTeam(match.awayTeamId);
  const matchStatus = getMatchStatus(match);
  const home = teamPair(homeTeam, match.homeTeam);
  const away = teamPair(awayTeam, match.awayTeam);
  const time = matchTimePair(match.matchTime);
  const statusZh = getMatchStatusLabel(matchStatus);

  return `
    <button
      class="group-result-line"
      type="button"
      data-open-group-prediction-modal
      data-match-id="${match.id}"
      data-zh-aria="查看 ${escapeHtml(home.zh)} 对 ${escapeHtml(away.zh)} 的预测历史"
      data-en-aria="${escapeHtml(home.en)} vs ${escapeHtml(away.en)} prediction history"
      aria-label="${escapeHtml(L(`查看 ${home.zh} 对 ${away.zh} 的预测历史`, `${home.en} vs ${away.en} prediction history`))}"
    >
      <em>${match.matchNo}</em>
      <b ${biAttrs(`${home.zh} vs ${away.zh}`, `${home.en} vs ${away.en}`)}>${escapeHtml(L(`${home.zh} vs ${away.zh}`, `${home.en} vs ${away.en}`))}</b>
      <span class="group-result-meta">
        <small ${biAttrs(time.zh, time.en)}>${escapeHtml(pairText(time))}</small>
        <strong class="route-match-status ${matchStatus}" ${biAttrs(statusZh)}>${L(statusZh)}</strong>
      </span>
    </button>
  `;
}

function renderLegacyTournamentRouteMap(rounds, matches = worldCupMatches || []) {
  return `
    <div class="route-map legacy-route-map">
      ${rounds.map((round, index) => `
        <section class="route-round-column" style="--round-index:${index}">
          <div class="route-round-head">
            <span>${round.labelEn || round.name}</span>
            <h3 ${biAttrs(round.label || round.nameZh || round.name, round.labelEn || round.name)}>${escapeHtml(getLang() === "en" ? (round.labelEn || round.name) : (round.label || round.nameZh || round.name))}</h3>
          </div>
          <div class="route-node-list">
            ${(round.nodes || []).map((node) => renderRouteNode(node, "", matches)).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function renderBracketSidePanel(sideData, matches = worldCupMatches || []) {
  return `
    <section class="bracket-side-panel ${sideData.side}">
      ${(sideData.rounds || []).map((round) => `
        <div class="bracket-round-column ${sideData.side}" style="--node-count:${round.nodes.length}">
          <div class="route-round-head">
            <span>${round.name}</span>
            <h3 ${biAttrs(round.nameZh, round.name)}>${escapeHtml(getLang() === "en" ? round.name : round.nameZh)}</h3>
          </div>
          <div class="route-node-list">
          ${(round.nodes || []).map((node) => renderRouteNode(node, sideData.side, matches)).join("")}
          </div>
        </div>
      `).join("")}
    </section>
  `;
}

function renderFinalChampionPanel(finalData, championNode, matches = worldCupMatches || []) {
  return `
    <section class="final-champion-panel">
      <div class="final-node-group">
        <div class="route-round-head final-head">
          <span>FINAL</span>
          <h3 ${biAttrs("决赛", "Final")}>${L("决赛", "Final")}</h3>
        </div>
        <div class="final-team-list">
          ${(finalData.teams || []).map((node) => renderRouteNode({ ...node, matchNo: finalData.matchNo }, "center", matches)).join("")}
        </div>
      </div>
      <div class="champion-connector" aria-hidden="true"></div>
      <div class="champion-node-wrap">
        <div class="route-round-head champion-head">
          <span>CHAMPION</span>
          <h3 ${biAttrs("冠军", "Champion")}>${L("冠军", "Champion")}</h3>
        </div>
        ${renderRouteNode(championNode, "center", matches)}
      </div>
    </section>
  `;
}

function slotTextEn(value) {
  return String(value ?? "")
    .replace(/最佳第三名/g, "best 3rd-placed")
    .replace(/胜者/g, " winner")
    .replace(/([A-L])组第(\d+)/g, "Group $1 #$2")
    .replace(/([A-L])组/g, "Group $1")
    .replace(/(\d+)强/g, "Round of $1")
    .replace(/小组赛/g, "Group Stage")
    .replace(/三四名决赛/g, "Third place")
    .replace(/半决赛/g, "Semifinal")
    .replace(/决赛/g, "Final")
    .replace(/待定/g, "TBD");
}

function renderRouteNode(node, side = "", matches = worldCupMatches || []) {
  const team = getWorldCupTeam(node.teamId);
  const match = findWorldCupMatchByNo(node.matchNo || node.matchId, matches);
  const nodeStatusZh = {
    empty: "未确定",
    scheduled: "席位来源",
    live: "进行中",
    finished: "已结束",
    qualified: "已晋级",
    eliminated: "已淘汰",
    predicted: "未确定",
    pending: "待定",
    champion: "冠军待定"
  }[node.status] || "待定";
  const isSourceSlot = !team && node.status === "scheduled";
  const nodeLabel = team
    ? { zh: team.nameZh, en: team.nameEn || team.nameZh }
    : { zh: node.slotLabel || "待定", en: slotTextEn(node.slotLabel || "待定") };
  const stateRawZh = team ? nodeStatusZh : (node.descriptionZh || node.sourceLabel || nodeStatusZh);
  const stateLabel = team
    ? { zh: nodeStatusZh, en: wcEn(nodeStatusZh) }
    : { zh: stateRawZh, en: slotTextEn(stateRawZh) };
  const metaLabel = team
    ? (node.sourceLabel || node.matchNo || node.matchId || "")
    : (node.matchNo || node.matchId || "");
  const teams = getRouteMatchTeamsText(match, node);
  const time = match ? matchTimePair(match.matchTime) : { zh: "时间待定", en: "Time TBD" };
  const matchStatus = getMatchStatus(match);
  const statusZh = getMatchStatusLabel(matchStatus);

  return `
    <article class="team-route-card ${node.status} ${side}">
      ${team ? renderTeamFlag(team, "route-flag") : `<span class="slot-type-badge" ${biAttrs(isSourceSlot ? "席位来源" : "待定席位")}>${L(isSourceSlot ? "席位来源" : "待定席位")}</span>`}
      <strong ${biAttrs(nodeLabel.zh, nodeLabel.en)}>${escapeHtml(pairText(nodeLabel))}</strong>
      <span ${biAttrs(stateLabel.zh, stateLabel.en)}>${escapeHtml(pairText(stateLabel))}</span>
      ${metaLabel ? `<small class="route-match-badge">${escapeHtml(metaLabel)}</small>` : ""}
      <div class="route-match-info">
        <span class="route-match-teams" ${biAttrs(teams.zh, teams.en)}>${escapeHtml(pairText(teams))}</span>
        <time ${biAttrs(time.zh, time.en)}>${escapeHtml(pairText(time))}</time>
        <strong class="route-match-status ${matchStatus}" ${biAttrs(statusZh)}>${L(statusZh)}</strong>
      </div>
    </article>
  `;
}

function findWorldCupMatchByNo(matchNo, matches = worldCupMatches || []) {
  if (!matchNo) {
    return null;
  }

  return (matches || []).find((match) => match.matchNo === matchNo || match.id === matchNo) || null;
}

function getRouteMatchTeamsText(match, node) {
  if (match) {
    const home = teamPair(getWorldCupTeam(match.homeTeamId), match.homeTeam);
    const away = teamPair(getWorldCupTeam(match.awayTeamId), match.awayTeam);

    if (home.zh !== "对阵待定" || away.zh !== "对阵待定") {
      return { zh: `${home.zh} vs ${away.zh}`, en: `${home.en} vs ${away.en}` };
    }
  }

  const zh = node?.descriptionZh || node?.slotLabel || "对阵待定";
  return { zh, en: zh === "对阵待定" ? "Matchup TBD" : slotTextEn(zh) };
}

function getMatchStatus(match, now = new Date()) {
  if (match?.actualScore) {
    return "finished";
  }

  const startDate = getMatchStartDate(match);

  if (!startDate) {
    return match?.matchStatus === "live" || match?.matchStatus === "finished"
      ? match.matchStatus
      : "scheduled";
  }

  const nowTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const startTime = startDate.getTime();

  if (!Number.isFinite(nowTime) || nowTime < startTime) {
    return "scheduled";
  }

  return nowTime <= startTime + 120 * 60 * 1000 ? "live" : "finished";
}

function getMatchStatusLabel(status) {
  return {
    scheduled: "未开赛",
    live: "进行中",
    finished: "已结束"
  }[status] || "未开赛";
}

function getMatchStartDate(match) {
  if (!match) {
    return null;
  }

  const kickoffValue = match.kickoffUtc || match.kickoffUTC || match.startTime || match.kickoffTime;

  if (kickoffValue) {
    const kickoffDate = new Date(kickoffValue);

    if (!Number.isNaN(kickoffDate.getTime())) {
      return kickoffDate;
    }
  }

  const parsed = String(match.matchTime || "").match(/(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})\s+UTC([+-])(\d{1,2})(?::?(\d{2}))?/);

  if (!parsed) {
    return null;
  }

  const [, month, day, hour, minute, sign, offsetHour, offsetMinute = "0"] = parsed;
  const offsetMinutes = (sign === "-" ? -1 : 1) * (Number(offsetHour) * 60 + Number(offsetMinute));
  const utcTime = Date.UTC(2026, Number(month) - 1, Number(day), Number(hour), Number(minute)) - offsetMinutes * 60 * 1000;

  return new Date(utcTime);
}

function renderLatestMatchPredictions(matches) {
  return matches.map((match) => {
    const homeTeam = getWorldCupTeam(match.homeTeamId);
    const awayTeam = getWorldCupTeam(match.awayTeamId);
    const statusZh = match.predictionStatus === "predicted" ? "已预测" : "待预测";
    const stage = matchStagePair(match);
    const time = matchTimePair(match.matchTime);
    const venue = venuePair(match.venue);
    const homeName = teamPair(homeTeam, match.homeTeam);
    const awayName = teamPair(awayTeam, match.awayTeam);

    return `
      <button class="latest-match-card" type="button" data-open-match-modal data-match-id="${match.id}" data-zh-aria="查看 ${escapeHtml(homeName.zh)} 对 ${escapeHtml(awayName.zh)} 的预测详情" data-en-aria="${escapeHtml(homeName.en)} vs ${escapeHtml(awayName.en)} prediction details" aria-label="${escapeHtml(L(`查看 ${homeName.zh} 对 ${awayName.zh} 的预测详情`, `${homeName.en} vs ${awayName.en} prediction details`))}">
        <span class="latest-match-status ${match.predictionStatus}" ${biAttrs(statusZh)}>${L(statusZh)}</span>
        <div class="latest-match-meta">
          ${bi("比赛阶段", "Stage")}
          <strong ${biAttrs(stage.zh, stage.en)}>${escapeHtml(pairText(stage))}</strong>
        </div>
        <div class="latest-teams">
          ${renderLatestTeam(homeTeam, match.homeTeam)}
          <span class="versus">VS</span>
          ${renderLatestTeam(awayTeam, match.awayTeam)}
        </div>
        <div class="latest-match-details">
          <div>${bi("比赛时间", "Kick-off")}<strong ${biAttrs(time.zh, time.en)}>${escapeHtml(pairText(time))}</strong></div>
          <div>${bi("比赛场馆", "Venue")}<strong ${biAttrs(venue.zh, venue.en)}>${escapeHtml(pairText(venue))}</strong></div>
        </div>
        ${renderLatestScoreForecast(match)}
      </button>
    `;
  }).join("");
}

function renderLatestScoreForecast(match) {
  const latestVersion = getLatestMatchPredictionVersion(match);
  const brief = latestVersion?.brief || {};
  const topScores = normalizeLatestScoreItems(brief.top_scores).slice(0, 3);
  const tailScenarios = getLatestTailFocusScenarios(brief)
    .filter((scenario) => shouldShowLatestScenario(match, scenario));

  return `
    <div class="latest-score-forecast">
      <div class="latest-score-section is-main">
        <span ${biAttrs("高概率比分", "High probability scores")}>${L("高概率比分", "High probability scores")}</span>
        <div class="latest-score-chip-row">
          ${topScores.length ? topScores.map((item, index) => renderLatestScoreChip(item, index === 0)).join("") : `<em>${L("待补充", "Pending")}</em>`}
        </div>
      </div>
      <div class="latest-score-scenarios">
        ${tailScenarios.length
          ? tailScenarios.map((scenario) => renderLatestScenarioTile(scenario)).join("")
          : renderLatestScenarioTile({ labelZh: "高偏离预测", labelEn: "Tail focus", scoreItems: [] })}
      </div>
    </div>
  `;
}

function shouldShowLatestScenario(match, scenario) {
  if (["high_scoring", "blowout"].includes(scenario?.scenarioId)) {
    return true;
  }

  const matchNo = String(match?.matchNo || match?.id || "").toUpperCase();

  return scenario?.scenarioId === "upset" && matchNo === "M48";
}

function getLatestMatchPredictionVersion(match) {
  const sourceVersions = match?.gamePredictionSource?.versions || [];
  const historyVersions = match?.predictionHistory || [];
  const versions = sourceVersions.length ? sourceVersions : historyVersions;

  return versions.find((version) => version.isLatest) || versions[versions.length - 1] || null;
}

function normalizeLatestScoreItems(scores = []) {
  return (Array.isArray(scores) ? scores : [])
    .map((item) => ({
      score: String(item?.score || "").trim(),
      probability: normalizeProbabilityToPercent(item?.probability ?? item?.base_probability ?? item?.tail_focus_conditional_probability)
    }))
    .filter((item) => item.score);
}

function getLatestTailFocusScenarios(brief) {
  const scenarios = brief?.tail_forecast_summary?.scenarios || [];

  return (Array.isArray(scenarios) ? scenarios : [])
    .map((scenario) => {
      const labelZh = scenario?.label_cn || scenario?.label || "高偏离预测";
      const labelEn = scenario?.title_en || scenario?.label_en || buildTailScenarioLabelEn(scenario, labelZh);

      return {
        scenarioId: scenario?.scenario_id || inferTailScenarioId(labelZh, 0),
        labelZh,
        labelEn,
        titleZh: scenario?.title_cn || labelZh,
        titleEn: scenario?.title_en || labelEn,
        attentionZh: scenario?.attention_label_cn || "",
        attentionEn: scenario?.attention_label_en || scenario?.attention_label_cn || "",
        summaryZh: scenario?.summary_cn || scenario?.mechanism_judgment_cn || "",
        summaryEn: scenario?.summary_en || scenario?.summary_cn || scenario?.mechanism_judgment_cn || "",
        baseProbability: normalizeProbabilityToPercent(scenario?.base_event_probability),
        scoreItems: normalizeLatestScoreItems(scenario?.top_scores || scenario?.selected_scores || []).slice(0, 2)
      };
    })
    .filter((scenario) => scenario.labelZh || Number.isFinite(scenario.baseProbability) || scenario.scoreItems.length);
}

function buildTailScenarioLabelEn(scenario, labelZh) {
  return translateTailScenarioName(scenario?.scenario_id, scenario?.label_cn || labelZh) || "Tail focus";
}

function translateTailScenarioName(scenarioId, label) {
  if (scenarioId === "high_scoring" || /大比分|开放/.test(label || "")) {
    return "Open high-score";
  }

  if (scenarioId === "blowout" || /崩盘|一边倒/.test(label || "")) {
    return "Blowout";
  }

  if (scenarioId === "upset" || /爆冷/.test(label || "")) {
    return "Upset";
  }

  return label || "Tail focus";
}

function renderLatestScoreChip(item, isPrimary = false, options = {}) {
  const showProbability = options.showProbability !== false;
  const probability = showProbability && Number.isFinite(item.probability) ? formatProbabilityValue(item.probability) : "";

  return `
    <span class="latest-score-chip ${isPrimary ? "is-primary" : ""}">
      <strong>${escapeHtml(item.score)}</strong>
      ${probability ? `<small>${escapeHtml(probability)}</small>` : ""}
    </span>
  `;
}

function renderLatestScenarioTile(scenario) {
  const displayLabel = getLatestScenarioDisplayLabel(scenario);
  const labelZh = displayLabel.zh;
  const labelEn = displayLabel.en;
  const baseProbability = Number.isFinite(scenario?.baseProbability)
    ? formatProbabilityValue(scenario.baseProbability)
    : "";
  const scores = Array.isArray(scenario?.scoreItems) ? scenario.scoreItems : [];
  const labelText = baseProbability
    ? `${L(labelZh, labelEn)} · ${baseProbability}`
    : L(labelZh, labelEn);
  const labelAriaZh = baseProbability ? `${labelZh} ${baseProbability}` : labelZh;
  const labelAriaEn = baseProbability ? `${labelEn} ${baseProbability}` : labelEn;

  return `
    <div class="latest-score-scenario">
      <span ${biAttrs(labelAriaZh, labelAriaEn)}>${escapeHtml(labelText)}</span>
      <div class="latest-scenario-score-list">
        ${scores.length ? scores.map((item) => renderLatestScoreChip(item, false, { showProbability: false })).join("") : `<em>${escapeHtml(L("待补充", "Pending"))}</em>`}
      </div>
    </div>
  `;
}

function renderGameTailFocusPanel(version) {
  const scenarios = getLatestTailFocusScenarios(version?.brief).slice(0, 2);

  return `
    <section class="tail-focus-card">
      <div class="panel-section-head">
        <span>TAIL FOCUS</span>
        <h3 ${biAttrs("高偏离聚焦预测", "Tail-focus predictions")}>${L("高偏离聚焦预测", "Tail-focus predictions")}</h3>
      </div>
      ${scenarios.length
        ? `<div class="tail-focus-list">
            ${scenarios.map((scenario, index) => renderTailFocusScenarioCard(scenario, index)).join("")}
          </div>`
        : `<p class="empty-state" ${biAttrs("该版本高偏离聚焦预测待补充。", "Tail-focus predictions for this version are pending.")}>${L("该版本高偏离聚焦预测待补充。", "Tail-focus predictions for this version are pending.")}</p>`}
    </section>
  `;
}

function renderTailFocusScenarioCard(scenario, index) {
  const title = {
    zh: cleanTailFocusTitle(scenario?.titleZh || scenario?.labelZh || "高偏离情景"),
    en: cleanTailFocusTitle(scenario?.titleEn || scenario?.labelEn || "Tail scenario")
  };
  const summary = {
    zh: scenario?.summaryZh || "机制判断待补充。",
    en: scenario?.summaryEn || "Mechanism note pending."
  };
  const baseProbability = Number.isFinite(scenario?.baseProbability)
    ? formatProbabilityValue(scenario.baseProbability)
    : L("概率待补充", "Probability pending");
  const scores = Array.isArray(scenario?.scoreItems) ? scenario.scoreItems : [];

  return `
    <article class="tail-focus-scenario-card">
      <div class="tail-focus-scenario-head">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <div>
          <strong ${biAttrs(title.zh, title.en)}>${escapeHtml(pairText(title))}</strong>
        </div>
        <em>${escapeHtml(baseProbability)}</em>
      </div>
      <div class="tail-focus-score-row">
        ${scores.length
          ? scores.map((item) => renderTailFocusScoreChip(item)).join("")
          : `<span class="tail-focus-score-chip is-empty">${escapeHtml(L("比分待补充", "Scores pending"))}</span>`}
      </div>
      <p ${biAttrs(summary.zh, summary.en)}>${escapeHtml(pairText(summary))}</p>
    </article>
  `;
}

function renderTailFocusScoreChip(item) {
  return `
    <span class="tail-focus-score-chip">
      <strong>${escapeHtml(item?.score || "--")}</strong>
    </span>
  `;
}

function cleanTailFocusTitle(value) {
  const cleaned = String(value || "")
    .replace(/\s*[·•]\s*(?:低|中低|中|中高|高)关注\s*$/u, "")
    .replace(/\s*(?:低|中低|中|中高|高)关注\s*$/u, "")
    .trim();

  if (/开放|大比分|high.?score|goal.?fest/i.test(cleaned)) {
    return "总进球数≥4";
  }

  if (/一边倒|崩盘|blowout|one.?sided/i.test(cleaned)) {
    return "一方大胜";
  }

  return cleaned;
}

function getLatestScenarioDisplayLabel(scenario) {
  const scenarioId = scenario?.scenarioId || inferTailScenarioId(scenario?.labelZh || "", 0);

  if (scenarioId === "high_scoring") {
    return {
      zh: "总进球数≥4",
      en: "Goal fest (total goals >= 4)"
    };
  }

  if (scenarioId === "blowout") {
    return {
      zh: "一方大胜",
      en: "One-sided win (margin >= 3)"
    };
  }

  if (scenarioId === "upset") {
    return {
      zh: "爆冷",
      en: "Upset"
    };
  }

  return {
    zh: scenario?.labelZh || "高偏离预测",
    en: scenario?.labelEn || "Tail focus"
  };
}

function renderLatestTeam(team, fallbackName) {
  const name = teamPair(team, fallbackName);
  return `
    <div class="latest-team">
      ${renderTeamFlag(team, "match-flag")}
      <strong ${biAttrs(name.zh, name.en)}>${escapeHtml(pairText(name))}</strong>
    </div>
  `;
}

function renderScheduleRecords(matches) {
  const stageOrder = window.WORLD_CUP_STAGE_ORDER || [];
  const stages = [
    ...stageOrder,
    ...matches.map((match) => match.stage).filter((stage) => !stageOrder.includes(stage))
  ];

  return stages.map((stage) => {
    const stageMatches = matches
      .filter((match) => match.stage === stage)
      .sort(compareWorldCupMatchesByTime);

    if (!stageMatches.length) {
      return "";
    }

    return `
      <section class="schedule-stage-block">
        <div class="stage-head">
          <div class="stage-title-row">
            <h3 ${biAttrs(stage, wcEn(stage))}>${escapeHtml(L(stage))}</h3>
            <span ${biAttrs(`${stageMatches.length} 场比赛`, `${stageMatches.length} matches`)}>${escapeHtml(L(`${stageMatches.length} 场比赛`, `${stageMatches.length} matches`))}</span>
          </div>
        </div>
        <div class="schedule-record-list">
          ${stageMatches.map((match) => renderScheduleRecord(match)).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function compareWorldCupMatchesByTime(a, b) {
  const timeA = getWorldCupMatchTimeValue(a);
  const timeB = getWorldCupMatchTimeValue(b);

  if (timeA !== timeB) {
    return timeA - timeB;
  }

  return getMatchNumberValue(a) - getMatchNumberValue(b);
}

function getWorldCupMatchTimeValue(match) {
  const value = match.matchTime || "";
  const parsed = value.match(/(\d+)月(\d+)日\s+(\d+):(\d+)\s+UTC([+-]\d+)/);

  if (!parsed) {
    return Number.POSITIVE_INFINITY;
  }

  const [, month, day, hour, minute] = parsed;
  return Date.UTC(
    2026,
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );
}

function getMatchNumberValue(match) {
  const value = String(match.matchNo || match.id || "").match(/\d+/);
  return value ? Number(value[0]) : Number.POSITIVE_INFINITY;
}

function renderScheduleRecord(match) {
  const homeTeam = getWorldCupTeam(match.homeTeamId);
  const awayTeam = getWorldCupTeam(match.awayTeamId);
  const statusText = getMatchStatusText(match);
  const hitStatus = getMatchHitStatus(match);
  const predictionScore = match.predictedScore || "—";
  const group = groupPair(match.group);
  const round = roundPair(match.round);
  const stageMeta = match.group
    ? { zh: `${group.zh} · ${round.zh}`, en: `${group.en} · ${round.en}` }
    : round;
  const time = matchTimePair(match.matchTime);
  const venue = venuePair(match.venue);

  return `
    <article class="schedule-record-card">
      <div class="schedule-match-no">
        <span>${match.matchNo || match.id}</span>
        <strong ${biAttrs(stageMeta.zh, stageMeta.en)}>${escapeHtml(pairText(stageMeta))}</strong>
      </div>
      <div class="schedule-teams">
        ${renderTinyTeam(homeTeam, match.homeTeam)}
        <span>vs</span>
        ${renderTinyTeam(awayTeam, match.awayTeam)}
      </div>
      <div class="schedule-detail">${bi("时间", "Time")}<strong ${biAttrs(time.zh, time.en)}>${escapeHtml(pairText(time))}</strong></div>
      <div class="schedule-detail">${bi("球场", "Venue")}<strong ${biAttrs(venue.zh, venue.en)}>${escapeHtml(pairText(venue))}</strong></div>
      <div class="schedule-detail">${bi("实际比分", "Final score")}<strong>${biAuto(match.actualScore || match.actualResult || "待结算")}</strong></div>
      <div class="schedule-detail">${bi("预测比分", "Predicted score")}<strong>${biAuto(predictionScore)}</strong></div>
      <div class="schedule-badges">
        <span class="schedule-status ${match.matchStatus}" ${biAttrs(statusText)}>${L(statusText)}</span>
        <span class="schedule-hit ${getStatusClassName(hitStatus)}" ${biAttrs(hitStatus)}>${L(hitStatus)}</span>
      </div>
    </article>
  `;
}

function getMatchHitStatus(match) {
  if (match.matchStatus !== "finished") {
    return match.predictionStatus === "predicted" ? "待复核" : "待预测";
  }

  if (match.predictedScore && match.actualScore) {
    return match.predictedScore === match.actualScore ? "命中" : "未命中";
  }

  return match.hitStatus || "待复核";
}

function getStatusClassName(value) {
  const map = {
    命中: "hit",
    未命中: "miss",
    待复核: "review",
    待预测: "pending",
    已预测: "predicted",
    已结束: "finished",
    待赛: "upcoming"
  };

  return map[value] || "neutral";
}

function renderTinyTeam(team, fallbackName) {
  const name = teamPair(team, fallbackName);
  return `
    <span class="tiny-team">
      ${renderTeamFlag(team, "tiny-flag")}
      <strong ${biAttrs(name.zh, name.en)}>${escapeHtml(pairText(name))}</strong>
    </span>
  `;
}

function renderWorldCupSummaryPanel(predictions) {
  const preferredNames = ["冠军预测", "亚军预测", "金球奖预测", "金靴奖预测", "金手套奖预测"];
  const selected = preferredNames
    .map((name) => predictions.find((item) => item.predictionName === name))
    .filter(Boolean);

  return selected.map((item) => {
    const name = awardPair(item, "name");
    const type = awardPair(item, "type");
    const updated = item.updatedAt ? { zh: item.updatedAt, en: item.updatedAt } : { zh: "长期预测", en: "Long-term" };
    const evidence = renderSummaryEvidencePreview(item.evidence, item.evidenceEn);
    const value = predictedValuePair(item.predictedValue);
    return `
    <button class="summary-card" type="button" data-open-tournament-modal data-prediction-id="${item.id}" data-zh-aria="查看${escapeHtml(name.zh)}详情" data-en-aria="View ${escapeHtml(name.en)} details" aria-label="${escapeHtml(L(`查看${name.zh}详情`, `View ${name.en} details`))}">
      <span ${biAttrs(type.zh, type.en)}>${escapeHtml(pairText(type))}</span>
      <h3 ${biAttrs(name.zh, name.en)}>${escapeHtml(pairText(name))}</h3>
      <strong ${biAttrs(value.zh, value.en)}>${escapeHtml(pairText(value))}</strong>
      <em ${biAttrs(updated.zh, updated.en)}>${escapeHtml(pairText(updated))}</em>
      <p ${biAttrs(evidence.zh, evidence.en)}>${escapeHtml(pairText(evidence))}</p>
    </button>
  `;
  }).join("");
}

function renderWorldCupSummaryLoading() {
  return `
    <div class="summary-empty-state">
      <strong ${biAttrs("正在更新长期预测", "Updating long-term predictions")}>${L("正在更新长期预测", "Updating long-term predictions")}</strong>
      <p ${biAttrs("请稍候，系统正在整理最新预测结果。", "Please wait while we gather the latest prediction results.")}>${L("请稍候，系统正在整理最新预测结果。", "Please wait while we gather the latest prediction results.")}</p>
    </div>
  `;
}

function renderSummaryEvidencePreview(evidence, evidenceEn) {
  const firstEvidence = Array.isArray(evidence) ? evidence[0] : "";
  const firstEvidenceEn = Array.isArray(evidenceEn) ? evidenceEn[0] : "";
  if (firstEvidence) {
    return { zh: firstEvidence, en: firstEvidenceEn || firstEvidence };
  }
  return { zh: "证据链条待补充。", en: "Evidence chain to be added." };
}

function getWorldCupTeam(teamId) {
  return worldCupTeams && teamId ? worldCupTeams[teamId] : null;
}

function formatTeamName(team, fallbackName) {
  const pair = teamPair(team, fallbackName);
  return pairText(pair);
}

function renderTeamFlag(team, className) {
  if (!team) {
    return `<span class="${className} flag-fallback" aria-hidden="true">?</span>`;
  }

  const inlineFlags = window.WORLD_CUP_FLAGS || {};
  const src = inlineFlags[team.nameZh];

  if (src) {
    const altText = getLang() === "en" ? `${team.nameEn || team.nameZh} flag` : `${team.nameZh} 国旗`;
    return `<img class="${className}" src="${src}" alt="${escapeHtml(altText)}">`;
  }

  return `<span class="${className} flag-fallback" aria-hidden="true">${team.fallbackFlag || "🏳"}</span>`;
}

function getMatchStatusText(match) {
  if (match.matchStatus === "finished") {
    return "已结束";
  }

  if (match.matchStatus === "live") {
    return "进行中";
  }

  return match.predictionStatus === "predicted" ? "已预测" : "待赛";
}

function initTournamentPredictionModal() {
  const modal = document.querySelector("[data-tournament-prediction-modal]");

  if (!modal || modal.dataset.initialized === "true") {
    return;
  }

  modal.querySelectorAll("[data-close-tournament-modal]").forEach((button) => {
    button.addEventListener("click", closeTournamentPredictionModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeTournamentPredictionModal();
    }
  });

  modal.dataset.initialized = "true";
}

function openTournamentPredictionModal(predictionId) {
  const modal = document.querySelector("[data-tournament-prediction-modal]");
  const header = modal?.querySelector("[data-tournament-modal-header]");
  const body = modal?.querySelector("[data-tournament-modal-body]");
  const prediction = (currentWorldCupTournamentPredictions || []).find((item) => String(item.id) === String(predictionId));

  if (!modal || !header || !body || !prediction) {
    return;
  }

  const versions = getTournamentPredictionVersions(prediction);
  const latestVersion = versions.find((version) => version.isLatest) || versions[versions.length - 1];

  const heroType = prediction.type ? awardPair(prediction, "type") : prediction.category ? awardPair(prediction, "category") : { zh: "长期预测", en: "Long-term" };
  const heroName = awardPair(prediction, "name");

  header.innerHTML = `
    <div class="tournament-modal-titlebar">
      <span class="match-modal-kicker" id="tournament-modal-title">TOURNAMENT PREDICTION REPORT</span>
    </div>
    <div class="tournament-modal-hero">
      <span ${biAttrs(heroType.zh, heroType.en)}>${escapeHtml(pairText(heroType))}</span>
      <h2 ${biAttrs(heroName.zh, heroName.en)}>${escapeHtml(pairText(heroName))}</h2>
    </div>
  `;

  body.innerHTML = `
    <div class="prediction-report-shell">
      <div class="professional-report-layout tournament-report-layout">
        ${renderTournamentPredictionHistory(versions)}
        <section class="prediction-report-main" data-tournament-version-report>
          ${renderTournamentEvidenceReport(prediction, latestVersion)}
        </section>
      </div>
    </div>
  `;

  body.querySelectorAll("[data-tournament-version-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.tournamentVersionIndex);
      const selectedVersion = versions[index];
      const reportNode = body.querySelector("[data-tournament-version-report]");

      if (!selectedVersion || !reportNode) {
        return;
      }

      body.querySelectorAll("[data-tournament-version-index]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      reportNode.innerHTML = renderTournamentEvidenceReport(prediction, selectedVersion);
    });
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeTournamentPredictionModal() {
  const modal = document.querySelector("[data-tournament-prediction-modal]");

  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function getTournamentPredictionVersions(prediction) {
  const history = Array.isArray(prediction.history) ? prediction.history : [];
  const records = history.length
    ? history
    : [{
        time: prediction.updatedAt || "待更新",
        label: "当前版本",
        labelEn: "Current version",
        predictedValue: prediction.predictedValue,
        evidence: prediction.evidence || [],
        evidenceEn: prediction.evidenceEn || [],
        isLatest: true
      }];

  return records.map((record, index) => ({
    ...record,
    isLatest: Boolean(record.isLatest) || index === records.length - 1,
    predictedValue: record.predictedValue || prediction.predictedValue,
    evidence: Array.isArray(record.evidence) ? record.evidence : [],
    evidenceEn: Array.isArray(record.evidenceEn) ? record.evidenceEn : []
  }));
}

function renderTournamentPredictionHistory(versions) {
  const timelineVersions = versions
    .map((record, index) => ({ record, index }))
    .reverse();

  return `
    <section class="prediction-history-card tournament-history-card">
      <div class="panel-section-head">
        <span>VERSION HISTORY</span>
        <h3 ${biAttrs("历史预测记录", "Version history")}>${L("历史预测记录", "Version history")}</h3>
      </div>
      <div class="history-timeline">
        ${timelineVersions.map(({ record, index }) => {
          const label = record.label
            ? { zh: record.label, en: record.labelEn || (record.label === "当前版本" ? "Current version" : record.label === "预测版本" ? "Prediction version" : record.label) }
            : { zh: "预测版本", en: "Prediction version" };
          const evidence = record.evidence?.[0] ? { zh: record.evidence[0], en: record.evidenceEn?.[0] || record.evidence[0] } : { zh: "证据链条待补充。", en: "Evidence chain to be added." };
          const value = predictedValuePair(record.predictedValue);
          const hasValue = Boolean(value.zh);
          return `
          <button class="history-item ${record.isLatest ? "is-current is-active" : ""}" type="button" data-tournament-version-index="${index}" data-zh-aria="查看 ${escapeHtml(record.time || "该时间")} 的长期预测版本" data-en-aria="View long-term prediction from ${escapeHtml(record.time || "this time")}" aria-label="${escapeHtml(L(`查看 ${record.time || "该时间"} 的长期预测版本`, `View long-term prediction from ${record.time || "this time"}`))}">
            <time>${escapeHtml(record.time || L("时间待补充", "Time TBD"))}</time>
            <div>
              <strong ${hasValue ? biAttrs(value.zh, value.en) : biAttrs("待预测", "Pending")}>${escapeHtml(hasValue ? pairText(value) : L("待预测", "Pending"))}</strong>
              <span ${biAttrs(label.zh, label.en)}>${escapeHtml(pairText(label))}</span>
              <p ${biAttrs(evidence.zh, evidence.en)}>${escapeHtml(pairText(evidence))}</p>
            </div>
          </button>
        `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderTournamentEvidenceReport(prediction, version) {
  const evidence = Array.isArray(version?.evidence) ? version.evidence : [];
  const evidenceEn = Array.isArray(version?.evidenceEn) ? version.evidenceEn : [];
  const resultLabel = prediction.type ? awardPair(prediction, "type") : { zh: "预测结果", en: "Predicted result" };
  const value = predictedValuePair(version?.predictedValue || prediction.predictedValue);

  return `
    <div class="tournament-evidence-body">
      <section class="tournament-result-card">
        <span ${biAttrs(resultLabel.zh, resultLabel.en)}>${escapeHtml(pairText(resultLabel))}</span>
        <strong ${biAttrs(value.zh, value.en)}>${escapeHtml(pairText(value))}</strong>
      </section>
      <section class="tournament-evidence-card">
        <h3 ${biAttrs("预测证据链条", "Evidence chain")}>${L("预测证据链条", "Evidence chain")}</h3>
        <div class="evidence-chain-list">
          ${evidence.length
            ? evidence.map((item, index) => {
              const en = evidenceEn[index] || item;
              return `
              <article>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <p ${biAttrs(item, en)}>${escapeHtml(getLang() === "en" ? en : item)}</p>
              </article>
            `;
            }).join("")
            : `<p class="empty-state" ${biAttrs("该版本证据链条待补充。", "Evidence chain for this version to be added.")}>${L("该版本证据链条待补充。", "Evidence chain for this version to be added.")}</p>`}
        </div>
      </section>
    </div>
  `;
}

function initMatchPredictionModal() {
  const modal = document.querySelector("[data-match-prediction-modal]");

  if (!modal || modal.dataset.initialized === "true") {
    return;
  }

  modal.querySelectorAll("[data-close-match-modal]").forEach((button) => {
    button.addEventListener("click", closeMatchPredictionModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeMatchPredictionModal();
    }
  });

  modal.dataset.initialized = "true";
}

function openMatchPredictionModal(matchId) {
  const modal = document.querySelector("[data-match-prediction-modal]");
  const header = modal?.querySelector("[data-match-modal-header]");
  const body = modal?.querySelector("[data-match-modal-body]");
  const match = (currentWorldCupMatches || worldCupMatches || []).find((item) => String(item.id) === String(matchId));

  if (!modal || !header || !body || !match) {
    return;
  }

  const homeTeam = getWorldCupTeam(match.homeTeamId);
  const awayTeam = getWorldCupTeam(match.awayTeamId);
  const report = worldCupPredictionReports?.[match.id];
  const updatedAt = match.updatedAt || "待更新";
  const updatedAtText = updatedAt === "待更新" ? { zh: "待更新", en: "Pending" } : { zh: updatedAt, en: updatedAt };
  const versions = getPredictionVersions(match, report);
  const isGamePredictionReport = versions.some((version) => version?.brief || version?.scoreMatrix || version?.deviationSpace);

  header.innerHTML = `
    <div class="match-modal-titlebar">
      <span class="match-modal-kicker" id="match-modal-title">MATCH PREDICTION REPORT</span>
      <div class="match-modal-actions">
        <span class="modal-update-time" ${biAttrs(`预测更新时间：${updatedAtText.zh}`, `Updated: ${updatedAtText.en}`)}>${escapeHtml(L(`预测更新时间：${updatedAtText.zh}`, `Updated: ${updatedAtText.en}`))}</span>
      </div>
    </div>
    <div class="match-modal-teams">
      ${renderModalTeam(homeTeam, match.homeTeam)}
      <span class="modal-versus">VS</span>
      ${renderModalTeam(awayTeam, match.awayTeam)}
    </div>
  `;

  body.innerHTML = `
    <div class="prediction-report-shell">
      <div class="professional-report-layout">
        <aside class="prediction-side-panel">
          ${renderPredictionHistory(versions)}
          ${isGamePredictionReport ? `<div data-tail-focus-panel>${renderGameTailFocusPanel(versions[versions.length - 1])}</div>` : ""}
          ${isGamePredictionReport ? '<div class="prediction-side-spacer" aria-hidden="true"></div>' : ''}
        </aside>
        <section class="prediction-report-main" data-version-report>
          ${renderPredictionVersionReport(versions[versions.length - 1], match)}
        </section>
      </div>
    </div>
  `;

  modal.classList.toggle("is-game-prediction", isGamePredictionReport);

  body.querySelectorAll("[data-version-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.versionIndex);
      const selectedVersion = versions[index];
      const reportNode = body.querySelector("[data-version-report]");

      if (!selectedVersion || !reportNode) {
        return;
      }

      body.querySelectorAll("[data-version-index]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      reportNode.innerHTML = renderPredictionVersionReport(selectedVersion, match);
      const tailFocusNode = body.querySelector("[data-tail-focus-panel]");
      if (tailFocusNode) {
        tailFocusNode.innerHTML = isGamePredictionReport ? renderGameTailFocusPanel(selectedVersion) : "";
      }
    });
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeMatchPredictionModal() {
  const modal = document.querySelector("[data-match-prediction-modal]");

  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.classList.remove("is-game-prediction");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function renderModalTeam(team, fallbackName) {
  const name = teamPair(team, fallbackName);
  return `
    <div class="modal-team">
      ${renderTeamFlag(team, "modal-flag")}
      <strong ${biAttrs(name.zh, name.en)}>${escapeHtml(pairText(name))}</strong>
    </div>
  `;
}

function renderCurrentPredictionPanel(match) {
  const reference = refPair(match.winReference);
  const hasReference = reference.zh && reference.zh !== "待预测";
  const summary = refPair(match.predictionSummary);
  const hasSummary = Boolean(summary.zh);
  const statusZh = match.predictionStatus === "predicted" ? "已预测" : "待预测";

  return `
    <section class="prediction-current-card">
      <div class="panel-section-head">
        <span>CURRENT VERSION</span>
        <h3 ${biAttrs("当前预测", "Current prediction")}>${L("当前预测", "Current prediction")}</h3>
      </div>
      <div class="current-score-box">
        ${bi("预测比分", "Predicted score")}
        <strong>${biAuto(match.predictedScore || "待预测")}</strong>
      </div>
      <div class="current-metric-list">
        <div>
          ${bi("胜率参考", "Win probability")}
          <strong>${hasReference ? bi(reference.zh, reference.en) : biAuto("待预测")}</strong>
        </div>
        <div>
          ${bi("预测状态", "Status")}
          <strong>${biAuto(statusZh)}</strong>
        </div>
      </div>
      <p ${hasSummary ? biAttrs(summary.zh, summary.en) : biAttrs("当前预测摘要待补充。", "Prediction summary to be added.")}>${escapeHtml(hasSummary ? pairText(summary) : L("当前预测摘要待补充。", "Prediction summary to be added."))}</p>
    </section>
  `;
}

function getPredictionVersions(match, report) {
  const history = Array.isArray(match.predictionHistory) ? match.predictionHistory : [];
  const latestTime = match.updatedAt || "待更新";
  const hasLatest = history.some((record) => record.time === latestTime);
  const records = hasLatest
    ? history
    : [
        ...history,
        {
          time: latestTime,
          predictedScore: match.predictedScore || "待预测",
          winReference: match.winReference || "待预测",
          summary: match.predictionSummary || "当前预测摘要待补充。"
        }
      ];

  return records.map((record, index) => {
    const isLatest = record.time === latestTime || index === records.length - 1;
    const linkedReport = record.reportId ? worldCupPredictionReports?.[record.reportId] : null;

    return {
      ...record,
      isLatest,
      label: record.label || (isLatest ? "最新预测" : "历史预测"),
      markdown: record.markdown || linkedReport?.markdown || (isLatest ? report?.markdown : ""),
      fallbackSummary: record.summary || (isLatest ? match.predictionSummary : "该版本预测摘要待补充。")
    };
  });
}

function renderPredictionHistory(versions) {
  const timelineVersions = versions
    .map((record, index) => ({ record, index }))
    .reverse();

  return `
    <section class="prediction-history-card">
      <div class="panel-section-head">
        <span>VERSION HISTORY</span>
        <h3 ${biAttrs("历史预测记录", "Version history")}>${L("历史预测记录", "Version history")}</h3>
      </div>
      <div class="history-timeline">
        ${timelineVersions.map(({ record, index }) => {
          const reference = refPair(record.winReference);
          const hasReference = Boolean(reference.zh);
          const summary = refPair(record.summary);
          const hasSummary = Boolean(summary.zh);
          return `
          <button class="history-item ${record.isLatest ? "is-current is-active" : ""}" type="button" data-version-index="${index}" data-zh-aria="查看 ${escapeHtml(record.time || "该时间")} 的预测版本" data-en-aria="View prediction version from ${escapeHtml(record.time || "this time")}" aria-label="${escapeHtml(L(`查看 ${record.time || "该时间"} 的预测版本`, `View prediction version from ${record.time || "this time"}`))}">
            <time>${escapeHtml(record.time || L("时间待补充", "Time TBD"))}</time>
            <div>
              <strong>${biAuto(record.predictedScore || "待预测")}</strong>
              <span>${hasReference ? bi(reference.zh, reference.en) : biAuto("胜率待补充")}</span>
              <p ${hasSummary ? biAttrs(summary.zh, summary.en) : biAttrs("该版本说明待补充。", "Notes for this version to be added.")}>${escapeHtml(hasSummary ? pairText(summary) : L("该版本说明待补充。", "Notes for this version to be added."))}</p>
            </div>
          </button>
        `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderPredictionVersionReport(version, match) {
  if (version?.brief || version?.scoreMatrix || version?.deviationSpace) {
    return renderGamePredictionVersionReport(version, match);
  }

  const reportMeta = extractReportMetadata(version?.markdown || "");
  const title = version?.isLatest
    ? { zh: "最新预测报告", en: "Latest prediction report" }
    : { zh: "历史预测报告", en: "Historical prediction report" };
  const description = version?.isLatest
    ? { zh: "当前展示的是最新预测版本，可点击左侧历史时间点查看旧版预测。", en: "Showing the latest prediction version. Click a timestamp on the left to view earlier versions." }
    : { zh: "当前展示的是历史预测版本，用于对照预测变化。", en: "Showing a historical prediction version for comparison." };
  const versionLabel = reportMeta.versionLabel || (version?.isLatest ? "最新版本" : "历史版本");
  const versionLabelPair = { zh: versionLabel, en: versionLabel === "最新版本" ? "Latest version" : versionLabel === "历史版本" ? "Historical version" : versionLabel };
  const updatedAt = reportMeta.updatedAt || version?.time || "时间待补充";
  const updatedAtText = updatedAt === "时间待补充" ? { zh: updatedAt, en: "Time TBD" } : { zh: updatedAt, en: updatedAt };
  const versionLabelText = version?.label
    ? { zh: version.label, en: version.label === "比赛预测版本" ? "Match prediction version" : version.label }
    : { zh: "预测版本", en: "Prediction version" };

  return `
    <div class="report-main-head">
      <span ${biAttrs(versionLabelText.zh, versionLabelText.en)}>${escapeHtml(pairText(versionLabelText))}</span>
      <div class="report-version-title">
        <div>
          <h3 ${biAttrs(title.zh, title.en)}>${escapeHtml(pairText(title))}</h3>
          <p ${biAttrs(description.zh, description.en)}>${escapeHtml(pairText(description))}</p>
        </div>
        <time>${escapeHtml(pairText(updatedAtText))}</time>
      </div>
      <div class="report-version-meta">
        <span ${biAttrs(`报告版本：${versionLabelPair.zh}`, `Report version: ${versionLabelPair.en}`)}>${escapeHtml(L(`报告版本：${versionLabelPair.zh}`, `Report version: ${versionLabelPair.en}`))}</span>
        <span ${biAttrs(`更新时间：${updatedAtText.zh}`, `Updated: ${updatedAtText.en}`)}>${escapeHtml(L(`更新时间：${updatedAtText.zh}`, `Updated: ${updatedAtText.en}`))}</span>
      </div>
    </div>
    ${renderWinDrawLossPie(version, match)}
    ${version?.markdown ? renderMarkdownReport(version.markdown, match) : renderVersionSummaryReport(version, match)}
  `;
}

function renderWinDrawLossPie(version, match) {
  const probabilities = extractWinDrawLossProbabilities(version, match);

  if (!probabilities.length) {
    return "";
  }

  const total = probabilities.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return "";
  }

  let cursor = 0;
  const gradientParts = probabilities.map((item) => {
    const start = cursor;
    const end = cursor + (item.value / total) * 360;
    cursor = end;
    return `${item.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
  });

  return `
    <section class="probability-pie-panel" aria-label="${escapeHtml(L("胜平负概率扇形图", "Win / draw / loss probability chart"))}">
      <div class="probability-pie" style="background: conic-gradient(${gradientParts.join(", ")});">
        ${bi("胜平负", "W/D/L")}
      </div>
      <div class="probability-legend">
        ${probabilities.map((item) => `
          <span style="--legend-color:${item.color}">
            <i aria-hidden="true"></i>
            <strong ${biAttrs(item.labelZh || item.label, item.labelEn || item.label)}>${escapeHtml(item.labelZh || item.label ? pairText({ zh: item.labelZh || item.label, en: item.labelEn || item.label }) : item.label)}</strong>
            <em>${formatProbabilityValue(item.value)}</em>
          </span>
        `).join("")}
      </div>
    </section>
  `;
}

function extractWinDrawLossProbabilities(version, match) {
  const structured = normalizeWinDrawLossProbabilities(version, getWorldCupTeam(match?.homeTeamId), getWorldCupTeam(match?.awayTeamId));

  if (structured.length) {
    return structured;
  }

  const currentForecastSources = version?.isLatest
    ? [
        refPair(match?.winReference).zh,
        ...(Array.isArray(match?.forecastLines)
          ? match.forecastLines.flatMap((line) => [line.predictionResult, line.possibility])
          : [])
      ]
    : [];
  const rawText = [
    version?.markdown || "",
    refPair(version?.winReference).zh,
    refPair(version?.summary).zh,
    ...currentForecastSources
  ].filter(Boolean).join("\n");
  const homeTeam = getWorldCupTeam(match?.homeTeamId);
  const awayTeam = getWorldCupTeam(match?.awayTeamId);
  const home = teamPair(homeTeam, match?.homeTeam);
  const away = teamPair(awayTeam, match?.awayTeam);
  const labels = [
    {
      key: "home",
      labelZh: `${home.zh}胜`,
      labelEn: `${home.en} win`,
      color: "#0d7a56",
      names: [homeTeam?.nameZh, homeTeam?.nameEn, match?.homeTeam].filter(Boolean)
    },
    {
      key: "draw",
      labelZh: "平局",
      labelEn: "Draw",
      color: "#f6c453",
      names: ["平局", "draw", "Draw"]
    },
    {
      key: "away",
      labelZh: `${away.zh}胜`,
      labelEn: `${away.en} win`,
      color: "#3ab0ff",
      names: [awayTeam?.nameZh, awayTeam?.nameEn, match?.awayTeam].filter(Boolean)
    }
  ];

  return labels
    .map((item) => ({
      ...item,
      label: pairText({ zh: item.labelZh, en: item.labelEn }),
      value: findProbabilityForNames(rawText, item.names)
    }))
    .filter((item) => Number.isFinite(item.value) && item.value > 0);
}

function normalizeWinDrawLossProbabilities(version, homeTeam, awayTeam) {
  const values = version?.brief?.win_draw_loss || {};
  const home = teamPair(homeTeam, version?.brief?.match?.team_a);
  const away = teamPair(awayTeam, version?.brief?.match?.team_b);
  const items = [
    {
      key: "home",
      labelZh: `${home.zh}胜`,
      labelEn: `${home.en} win`,
      color: "#0d7a56",
      value: normalizeProbabilityToPercent(values.team_a_win)
    },
    {
      key: "draw",
      labelZh: "平局",
      labelEn: "Draw",
      color: "#f6c453",
      value: normalizeProbabilityToPercent(values.draw)
    },
    {
      key: "away",
      labelZh: `${away.zh}胜`,
      labelEn: `${away.en} win`,
      color: "#3ab0ff",
      value: normalizeProbabilityToPercent(values.team_b_win)
    }
  ];

  return items
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .map((item) => ({ ...item, label: pairText({ zh: item.labelZh, en: item.labelEn }) }));
}

function normalizeProbabilityToPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number <= 1 ? number * 100 : number;
}

function findProbabilityForNames(text, names) {
  const lines = String(text || "").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.replace(/\*\*|`/g, "");

    if (!names.some((name) => name && line.toLowerCase().includes(String(name).toLowerCase()))) {
      continue;
    }

    const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*%/);

    if (percentMatch) {
      return Number(percentMatch[1]);
    }
  }

  return null;
}

function formatProbabilityValue(value) {
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}%`;
}

function renderGamePredictionVersionReport(version, match) {
  return `
    <div class="game-prediction-dashboard">
      <div class="game-prediction-top-row">
        ${renderWinDrawLossPie(version, match)}
        ${renderScoreMatrixChart(version.scoreMatrix)}
      </div>
      ${renderScoreDeviationScatter(version.deviationSpace, version.brief?.top_scores?.[0]?.score || "1-0")}
      ${renderGamePredictionKeyFactors(version)}
    </div>
  `;
}

function renderScoreMatrixChart(matrixData) {
  const rows = matrixData?.row_axis?.buckets || [];
  const columns = matrixData?.column_axis?.buckets || [];
  const matrix = matrixData?.matrix || [];

  if (!rows.length || !columns.length || !matrix.length) {
    return renderGameChartEmpty({ zh: "比分矩阵", en: "Score matrix" }, { zh: "蒙特卡洛比分矩阵数据待补充。", en: "Monte Carlo score matrix data to be added." });
  }

  const values = matrix.flat().map(Number).filter(Number.isFinite);
  const maxValue = Math.max(...values, 0);
  const rowTeam = matrixData?.row_axis?.team;
  const colTeam = matrixData?.column_axis?.team;
  const rowPair = rowTeam ? teamPair(findTeamByEnglishName(rowTeam), rowTeam) : { zh: "主队", en: "Home" };
  const colPair = colTeam ? teamPair(findTeamByEnglishName(colTeam), colTeam) : { zh: "客队", en: "Away" };
  const rowAxisZh = `${rowPair.zh}进球`;
  const rowAxisEn = `${rowPair.en} goals`;
  const colAxisZh = `${colPair.zh}进球`;
  const colAxisEn = `${colPair.en} goals`;

  return `
    <section class="game-chart-card score-matrix-card">
      <div class="game-chart-head">
        <span ${biAttrs("比分矩阵", "Score matrix")}>${escapeHtml(L("比分矩阵", "Score matrix"))}</span>
      </div>
      <div class="matrix-axis-summary" aria-label="${escapeHtml(L(`${rowAxisZh}，${colAxisZh}`, `${rowAxisEn}, ${colAxisEn}`))}">
        <span class="matrix-row-axis" ${biAttrs(rowAxisZh, rowAxisEn)}>${escapeHtml(L(rowAxisZh, rowAxisEn))}</span>
        <span class="matrix-col-axis" ${biAttrs(colAxisZh, colAxisEn)}>${escapeHtml(L(colAxisZh, colAxisEn))}</span>
      </div>
      <div class="score-matrix-wrap" style="--matrix-cols:${columns.length + 1}">
        <span class="matrix-axis-corner" aria-hidden="true"></span>
        ${columns.map((column) => `<span class="matrix-axis-label matrix-col-label" title="${escapeHtml(L(`${colPair.zh} ${column}球`, `${colPair.en} ${column} goals`))}">${escapeHtml(column)}</span>`).join("")}
        ${rows.map((row, rowIndex) => `
          <span class="matrix-axis-label matrix-row-label" title="${escapeHtml(L(`${rowPair.zh} ${row}球`, `${rowPair.en} ${row} goals`))}">${escapeHtml(row)}</span>
          ${columns.map((column, columnIndex) => {
            const value = Number(matrix[rowIndex]?.[columnIndex] || 0);
            const intensity = maxValue ? Math.max(0.08, value / maxValue) : 0;

            return `
              <span class="matrix-cell" style="--cell-alpha:${intensity.toFixed(3)}" title="${escapeHtml(L(`${rowPair.zh} ${row} - ${colPair.zh} ${column}：${formatProbabilityValue(normalizeProbabilityToPercent(value) || 0)}`, `${rowPair.en} ${row} - ${colPair.en} ${column}: ${formatProbabilityValue(normalizeProbabilityToPercent(value) || 0)}`))}">
                <strong>${formatProbabilityValue(normalizeProbabilityToPercent(value) || 0)}</strong>
              </span>
            `;
          }).join("")}
        `).join("")}
      </div>
    </section>
  `;
}

function renderScoreDeviationScatter(deviationData, focusScore = "1-0") {
  const points = Array.isArray(deviationData?.points) ? deviationData.points : [];

  if (!points.length) {
    return renderGameChartEmpty({ zh: "偏差空间", en: "Deviation space" }, { zh: "比分偏差空间数据待补充。", en: "Score deviation space data to be added." });
  }

  const maxY = Math.max(...points.map((point) => Number(point.probability) || 0), 0);
  const focusPoint = points.find((point) => point.score === focusScore) || points[0];
  const labeledScores = new Set(
    [...points]
      .sort((a, b) => (Number(b.probability) || 0) - (Number(a.probability) || 0))
      .slice(0, 7)
      .map((point) => point.score)
  );
  const yTicks = [maxY, maxY * 0.75, maxY * 0.5, maxY * 0.25, 0];
  const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const plotLeft = 12;
  const plotRight = 93;
  const plotBottom = 18;
  const plotTop = 70;
  const mapX = (value) => plotLeft + Math.max(0, Math.min(1, value)) * (plotRight - plotLeft);
  const mapY = (value) => plotBottom + Math.max(0, Math.min(1, value)) * (plotTop - plotBottom);
  const labelBoxes = [];
  const labelCanvas = { width: 1000, height: 260 };
  const baseLabelOffsets = [
    { x: 0, y: -32 },
    { x: -24, y: -32 },
    { x: 24, y: -32 },
    { x: -34, y: -44 },
    { x: 34, y: -44 },
    { x: 0, y: -48 },
    { x: -44, y: -30 },
    { x: 44, y: -30 }
  ];
  const preferredLabelOffsets = {
    "1-1": [{ x: -18, y: -31 }, { x: -28, y: -43 }],
    "1-0": [{ x: 18, y: -45 }, { x: 28, y: -34 }],
    "0-0": [{ x: 0, y: -34 }, { x: 22, y: -34 }],
    "0-1": [{ x: -24, y: -34 }, { x: -36, y: -45 }],
    "2-0": [{ x: 26, y: -46 }, { x: 36, y: -34 }],
    "2-1": [{ x: 18, y: -30 }, { x: 34, y: -40 }],
    "1-2": [{ x: 22, y: -36 }, { x: -24, y: -36 }]
  };
  const labelRectFor = (score, xPercent, yPercent, offset) => {
    const width = Math.max(34, String(score || "").length * 7 + 14);
    const height = 20;
    const centerX = (xPercent / 100) * labelCanvas.width + offset.x;
    const top = labelCanvas.height - (yPercent / 100) * labelCanvas.height + offset.y;
    return {
      left: centerX - width / 2,
      right: centerX + width / 2,
      top,
      bottom: top + height
    };
  };
  const hasLabelCollision = (rect) => labelBoxes.some((box) => !(
    rect.right < box.left - 6 ||
    rect.left > box.right + 6 ||
    rect.bottom < box.top - 5 ||
    rect.top > box.bottom + 5
  ));
  const isLabelInBounds = (rect) => (
    rect.left >= 4 &&
    rect.right <= labelCanvas.width - 4 &&
    rect.top >= 4 &&
    rect.bottom <= labelCanvas.height - 4
  );
  const getLabelOffset = (score, xPercent, yPercent, deviation) => {
    const edgeAwareOffsets = deviation > 0.82
      ? baseLabelOffsets.map((offset) => ({ x: Math.min(offset.x, -18), y: offset.y }))
      : deviation < 0.16
        ? baseLabelOffsets.map((offset) => ({ x: Math.max(offset.x, 18), y: offset.y }))
        : baseLabelOffsets;
    const offsets = [...(preferredLabelOffsets[score] || []), ...edgeAwareOffsets];
    const chosen = offsets.find((offset) => {
      const rect = labelRectFor(score, xPercent, yPercent, offset);
      return isLabelInBounds(rect) && !hasLabelCollision(rect);
    }) || offsets[0] || { x: 0, y: -32 };

    labelBoxes.push(labelRectFor(score, xPercent, yPercent, chosen));
    return chosen;
  };

  return `
    <section class="game-chart-card score-scatter-card">
      <div class="game-chart-head">
        <span ${biAttrs("比分偏差空间", "Deviation space")}>${escapeHtml(L("比分偏差空间", "Deviation space"))}</span>
      </div>
      <div class="score-scatter-plot" data-zh-aria="横坐标为比分偏差，纵坐标为概率" data-en-aria="X axis: deviation, Y axis: probability" aria-label="${escapeHtml(L("横坐标为比分偏差，纵坐标为概率", "X axis: deviation, Y axis: probability"))}">
        <span class="scatter-axis x-axis" ${biAttrs("比分偏差", "deviation")}>${escapeHtml(L("比分偏差", "deviation"))}</span>
        <span class="scatter-axis y-axis" ${biAttrs("概率", "probability")}>${escapeHtml(L("概率", "probability"))}</span>
        ${xTicks.map((tick) => `
          <span class="scatter-gridline vertical" style="left:${mapX(tick).toFixed(2)}%"></span>
          <span class="scatter-tick x-tick" style="left:${mapX(tick).toFixed(2)}%">${tick.toFixed(1)}</span>
        `).join("")}
        ${yTicks.map((tick) => {
          const y = maxY ? mapY(tick / maxY) : plotBottom;
          return `
            <span class="scatter-gridline horizontal" style="bottom:${y.toFixed(1)}%"></span>
            <span class="scatter-tick y-tick" style="bottom:${y.toFixed(1)}%">${formatProbabilityValue(normalizeProbabilityToPercent(tick) || 0)}</span>
          `;
        }).join("")}
        ${points.map((point) => {
          const deviation = Number(point.deviation) || 0;
          const x = mapX(Number(point.deviation) || 0);
          const y = maxY ? mapY((Number(point.probability) || 0) / maxY) : plotBottom;
          const isFocus = point.score === focusPoint.score;
          const isLabeled = isFocus || labeledScores.has(point.score);
          const outcomeClass = getScoreOutcomeClass(point.outcome);
          const labelOffset = isLabeled ? getLabelOffset(point.score, x, y, deviation) : { x: 0, y: -32 };

          return `
            <span class="scatter-point ${outcomeClass} ${isFocus ? "is-focus" : ""} ${isLabeled ? "is-labeled" : ""}" style="left:${x.toFixed(2)}%; bottom:${y.toFixed(2)}%; --label-x:${labelOffset.x}px; --label-y:${labelOffset.y}px;" title="${escapeHtml(point.score)} · deviation ${Number(point.deviation || 0).toFixed(3)} · ${formatProbabilityValue(normalizeProbabilityToPercent(point.probability) || 0)}">
              ${isLabeled ? `<em>${escapeHtml(point.score)}</em>` : ""}
            </span>
          `;
        }).join("")}
      </div>
      ${(() => {
        const fs = focusPoint?.score || "1-0";
        const dev = Number(focusPoint?.deviation || 0).toFixed(3);
        const prob = formatProbabilityValue(normalizeProbabilityToPercent(focusPoint?.probability) || 0);
        return `<p ${biAttrs(`${fs}：偏差 ${dev}，概率 ${prob}`, `${fs}: deviation ${dev}, probability ${prob}`)}>${escapeHtml(L(`${fs}：偏差 ${dev}，概率 ${prob}`, `${fs}: deviation ${dev}, probability ${prob}`))}</p>`;
      })()}
    </section>
  `;
}

function getScoreOutcomeClass(outcome) {
  const map = {
    team_a: "team-a",
    team_b: "team-b",
    draw: "draw"
  };

  return map[outcome] || "neutral";
}

function renderGamePredictionKeyFactors(version) {
  const factors = Array.isArray(version?.keyFactors) ? version.keyFactors : [];

  return `
    <section class="game-factor-card">
      <div class="game-chart-head">
        <span ${biAttrs("关键因素", "Key factors")}>${escapeHtml(L("关键因素", "Key factors"))}</span>
      </div>
      ${factors.length
        ? `<ul>${factors.map((factor) => {
            const pair = typeof factor === "string" ? { zh: factor, en: factor } : factor;
            return `<li ${biAttrs(pair.zh, pair.en)}>${escapeHtml(pairText(pair))}</li>`;
          }).join("")}</ul>`
        : `<p class="empty-state" ${biAttrs("该版本关键因素待补充。", "Key factors for this version to be added.")}>${L("该版本关键因素待补充。", "Key factors for this version to be added.")}</p>`}
    </section>
  `;
}

function renderGameChartEmpty(title, message) {
  const t = typeof title === "object" ? title : { zh: title, en: wcEn(title) };
  const m = typeof message === "object" ? message : { zh: message, en: wcEn(message) };
  return `
    <section class="game-chart-card">
      <div class="game-chart-head">
        <span>DATA PENDING</span>
        <h4 ${biAttrs(t.zh, t.en)}>${escapeHtml(pairText(t))}</h4>
      </div>
      <p ${biAttrs(m.zh, m.en)}>${escapeHtml(pairText(m))}</p>
    </section>
  `;
}

function renderVersionSummaryReport(version, match) {
  const reference = refPair(version?.winReference);
  const hasReference = Boolean(reference.zh);
  const summary = refPair(version?.fallbackSummary || version?.summary || match.predictionSummary);
  const hasSummary = Boolean(summary.zh);
  const titleTime = version?.time || "历史版本";

  return `
    <div class="report-section-grid">
      <section class="report-section is-lead">
        <h3 ${biAttrs(`${titleTime} 预测摘要`, `${titleTime === "历史版本" ? "Historical version" : titleTime} prediction summary`)}>${escapeHtml(L(`${titleTime} 预测摘要`, `${titleTime === "历史版本" ? "Historical version" : titleTime} prediction summary`))}</h3>
        <div class="version-summary-grid">
          <div>${bi("预测比分", "Predicted score")}<strong>${biAuto(version?.predictedScore || "待预测")}</strong></div>
          <div>${bi("胜率参考", "Win probability")}<strong>${hasReference ? bi(reference.zh, reference.en) : biAuto("待补充")}</strong></div>
        </div>
        <div class="report-content">
          <p ${hasSummary ? biAttrs(summary.zh, summary.en) : biAttrs("该版本详细预测报告待补充。", "Detailed report for this version to be added.")}>${escapeHtml(hasSummary ? pairText(summary) : L("该版本详细预测报告待补充。", "Detailed report for this version to be added."))}</p>
          <p ${biAttrs("该历史版本的详细报告待补充，当前先展示预测比分、胜率参考和版本摘要。", "A detailed report for this historical version is pending; for now we show the predicted score, win probability and version summary.")}>${escapeHtml(L("该历史版本的详细报告待补充，当前先展示预测比分、胜率参考和版本摘要。", "A detailed report for this historical version is pending; for now we show the predicted score, win probability and version summary."))}</p>
        </div>
      </section>
    </div>
  `;
}

function renderEmptyReport(match) {
  const summary = refPair(match.predictionSummary);
  const hasSummary = Boolean(summary.zh);
  return `
    <section class="report-section">
      <h3 ${biAttrs("预测报告待补充", "Prediction report pending")}>${L("预测报告待补充", "Prediction report pending")}</h3>
      <p ${hasSummary ? biAttrs(summary.zh, summary.en) : biAttrs("该场比赛的详细 markdown 报告尚未配置。", "A detailed report for this match has not been configured yet.")}>${escapeHtml(hasSummary ? pairText(summary) : L("该场比赛的详细 markdown 报告尚未配置。", "A detailed report for this match has not been configured yet."))}</p>
    </section>
  `;
}

function renderMarkdownReport(markdown, match) {
  const sections = parsePredictionMarkdown(markdown, match);

  return `
    <div class="report-section-grid">
      ${sections.map((section, index) => `
        <section class="report-section ${index === 0 ? "is-lead" : ""}">
          ${section.level === 1 ? `<h3>${section.title}</h3>` : `<h4>${section.title}</h4>`}
          <div class="report-content">${renderMarkdownLines(section.lines, match)}</div>
        </section>
      `).join("")}
    </div>
  `;
}

function parsePredictionMarkdown(markdown, match) {
  const sections = [];
  let current = null;
  let skipCurrentSection = false;

  markdown.split(/\r?\n/).forEach((line) => {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const cleanedLine = sanitizeReportLine(line, match);

    if (cleanedLine === null) {
      return;
    }

    if (heading) {
      const rawTitle = heading[2].trim();
      const normalizedTitle = normalizeReportSectionTitle(rawTitle);

      if (!normalizedTitle) {
        skipCurrentSection = true;
        current = null;
        return;
      }

      skipCurrentSection = false;
      current = {
        level: heading[1].length,
        title: formatInlineMarkdown(normalizedTitle, match),
        lines: []
      };
      sections.push(current);
      return;
    }

    if (skipCurrentSection) {
      return;
    }

    if (!current) {
      current = { level: 2, title: "比赛概览", lines: [] };
      sections.push(current);
    }

    current.lines.push(cleanedLine);
  });

  return sections.filter((section) => section.title || section.lines.some((line) => line.trim()));
}

function normalizeReportSectionTitle(title) {
  const cleaned = title.replace(/^\d+\.\s*/, "").trim();

  if (!cleaned || /^⚽/.test(cleaned) || /精简预测/.test(cleaned)) {
    return "";
  }

  if (/投注建议|暂停展示|相比上一版本/.test(cleaned)) {
    return "";
  }

  if (/胜负/.test(cleaned)) {
    return "胜平负概率";
  }

  if (/比分预测/.test(cleaned)) {
    return "比分路径";
  }

  if (/为什么得到这个结论/.test(cleaned)) {
    return "关键判断";
  }

  if (/风险与可信度/.test(cleaned)) {
    return "风险提示";
  }

  return cleaned;
}

function sanitizeReportLine(line, match) {
  const trimmed = line.trim();

  if (!trimmed) {
    return line;
  }

  if (/版本：.*更新时间：/.test(trimmed)) {
    return null;
  }

  if (/价格说明：|Kelly|仓位约束|账户资金|投注建议仅/.test(trimmed)) {
    return null;
  }

  if (/\*\*(NEW|UPDATED)\*\*|`(lineup_confirmation|injury_update|odds_movement|market_odds_snapshot|score_distribution|win_draw_loss_probabilities|betting_recommendations)/.test(trimmed)) {
    return null;
  }

  return localizeReportText(line, match);
}

function localizeReportText(text, match) {
  let output = String(text);
  const homeTeam = getWorldCupTeam(match?.homeTeamId);
  const awayTeam = getWorldCupTeam(match?.awayTeamId);

  [homeTeam, awayTeam].filter(Boolean).forEach((team) => {
    if (team.nameEn) {
      output = output.replace(new RegExp(escapeRegExp(team.nameEn), "g"), team.nameZh);
    }
  });

  return output
    .replace(/Switzerland/g, "瑞士")
    .replace(/Brazil/g, "巴西")
    .replace(/Morocco/g, "摩洛哥")
    .replace(/Haiti/g, "海地")
    .replace(/Scotland/g, "苏格兰")
    .replace(/Australia/g, "澳大利亚")
    .replace(/Turkey/g, "土耳其")
    .replace(/Qatar/g, "卡塔尔")
    .replace(/low/g, "低")
    .replace(/medium/g, "中")
    .replace(/high/g, "高")
    .replace(/Run质量/g, "模型运行质量");
}

function extractReportMetadata(markdown) {
  const versionMatch = String(markdown || "").match(/版本：\*\*([^*]+)\*\*/);
  const updatedMatch = String(markdown || "").match(/更新时间：(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);

  return {
    versionLabel: formatReportVersionLabel(versionMatch?.[1]),
    updatedAt: updatedMatch ? `${updatedMatch[1]} ${updatedMatch[2]}:${updatedMatch[3]}` : ""
  };
}

function formatReportVersionLabel(value) {
  if (!value) {
    return "";
  }

  if (/T-90min/i.test(value)) {
    return "赛前90分钟版";
  }

  return value.replace(/^T-/i, "赛前").replace(/min/i, "分钟版");
}

function renderMarkdownLines(lines, match) {
  const html = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      html.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`);
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(formatInlineMarkdown(trimmed.slice(2), match));
      return;
    }

    flushList();

    if (trimmed.startsWith(">")) {
      html.push(`<blockquote>${formatInlineMarkdown(trimmed.replace(/^>\s?/, ""), match)}</blockquote>`);
      return;
    }

    if (/^\*\*(.+)\*\*$/.test(trimmed)) {
      html.push(`<p class="report-callout">${formatInlineMarkdown(trimmed, match)}</p>`);
      return;
    }

    html.push(`<p>${formatInlineMarkdown(trimmed, match)}</p>`);
  });

  flushList();
  return html.join("");
}

function formatInlineMarkdown(text, match) {
  return escapeHtml(localizeReportText(text, match))
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderWorldCupMatchBoard(matches) {
  const stageOrder = window.WORLD_CUP_STAGE_ORDER || [];
  const stages = [
    ...stageOrder,
    ...matches.map((match) => match.stage).filter((stage) => !stageOrder.includes(stage))
  ];

  return stages
    .map((stage) => {
      const stageMatches = matches.filter((match) => match.stage === stage);

      if (!stageMatches.length) {
        return "";
      }

      const rows = stageMatches.map((match) => {
        const rowLabel = match.group
          ? `${match.group} · ${match.round}`
          : (match.round ? `${match.stage} · ${match.round}` : match.stage);
        const forecastLines = normalizeForecastLines(match);

        return `
          <article class="match-row">
            <div class="match-time">
              <span>${rowLabel}</span>
              <strong>${formatMatchField(match.matchTime, "time")}</strong>
              ${match.venue ? `<small>${formatMatchField(match.venue, "venue")}</small>` : ""}
            </div>
            <div class="match-teams">
              <strong>${formatMatchField(match.homeTeam, "team")}</strong>
              <span>vs</span>
              <strong>${formatMatchField(match.awayTeam, "team")}</strong>
            </div>
            <div class="match-pick">
              <span>预测结果</span>
              <div class="match-forecast-lines">
                ${forecastLines.map((line) => `
                  <strong>${formatMatchField(line.predictionResult, "prediction")}</strong>
                `).join("")}
              </div>
            </div>
            <div class="match-result">
              <span>胜率参考</span>
              <div class="match-forecast-lines">
                ${forecastLines.map((line) => `
                  <strong>${formatMatchField(line.possibility, "possibility")}</strong>
                `).join("")}
              </div>
            </div>
            <div class="match-actual">
              <span>实际赛果</span>
              <strong>${formatMatchField(match.actualResult, "actual")}</strong>
            </div>
          </article>
        `;
      }).join("");

      return `
        <section class="stage-block">
          <div class="stage-head">
            <div class="stage-title-row">
              <h3>${stage}</h3>
              <span>${stageMatches.length} 场比赛</span>
            </div>
          </div>
          <div class="match-list">${rows}</div>
        </section>
      `;
    })
    .join("");
}

function normalizeForecastLines(match) {
  if (Array.isArray(match.forecastLines) && match.forecastLines.length) {
    return match.forecastLines;
  }

  return [{
    predictionResult: match.predictionResult ?? "待预测",
    possibility: match.possibility ?? "待预测"
  }];
}

function formatMatchField(value, type) {
  if (value === "--" || value === "待补充" || value === "") {
    if (type === "prediction" || type === "possibility") {
      return L("待预测");
    }

    if (type === "actual") {
      return L("待结算");
    }

    if (type === "time") {
      return L("时间待定");
    }

    if (type === "venue") {
      return L("场馆待定");
    }

    if (type === "team") {
      return L("对阵待定");
    }

    return L("待定");
  }

  if (value === "待赛果") {
    return L("待结算");
  }

  if (type === "time") {
    return pairText(matchTimePair(value));
  }

  if (type === "venue") {
    return pairText(venuePair(value));
  }

  return value;
}

function renderWorldCupTournamentBoard(predictions) {
  const categories = [...new Set(predictions.map((item) => item.category))];

  return categories.map((category) => {
    const cards = predictions
      .filter((item) => item.category === category)
      .map((item) => `
        <article class="longterm-card">
          <div>
            <span>${item.type}</span>
            <h3>${item.predictionName}</h3>
          </div>
          <strong>${item.predictedValue}</strong>
          <p>${item.extraInfo}</p>
          <div class="longterm-meta">
            <span>${item.status}</span>
          </div>
        </article>
      `).join("");

    return `
      <section class="longterm-group">
        <div class="stage-head">
          <h3>${category}</h3>
          <span>${predictions.filter((item) => item.category === category).length} 项</span>
        </div>
        <div class="longterm-grid">${cards}</div>
      </section>
    `;
  }).join("");
}

// ---------------------------------------------------------------------------
// Gaokao dynamic-content i18n layer.
// Dictionaries + helpers so the prediction page (selectors, map, score list and
// the university detail modal) renders fully in the active language. The page
// re-renders on the shared "wowcai:langchange" event dispatched by initLanguage.
// ---------------------------------------------------------------------------
const GK_PROVINCE_EN = {
  "北京": "Beijing", "天津": "Tianjin", "河北": "Hebei", "山西": "Shanxi",
  "内蒙古": "Inner Mongolia", "辽宁": "Liaoning", "吉林": "Jilin", "黑龙江": "Heilongjiang",
  "上海": "Shanghai", "上海市": "Shanghai", "江苏": "Jiangsu", "浙江": "Zhejiang", "安徽": "Anhui",
  "福建": "Fujian", "江西": "Jiangxi", "山东": "Shandong", "河南": "Henan",
  "湖北": "Hubei", "湖南": "Hunan", "广东": "Guangdong", "广西": "Guangxi",
  "海南": "Hainan", "重庆": "Chongqing", "四川": "Sichuan", "贵州": "Guizhou",
  "云南": "Yunnan", "西藏": "Tibet", "陕西": "Shaanxi", "甘肃": "Gansu",
  "青海": "Qinghai", "宁夏": "Ningxia", "新疆": "Xinjiang"
};

const GK_SUBJECT_EN = {
  "物理类": "Physics track",
  "历史类": "History track",
  "理科": "Science",
  "文科": "Liberal Arts",
  "综合改革": "Comprehensive reform",
  "综合": "Comprehensive"
};

const GK_CITY_EN = {
  "北京": "Beijing", "天津": "Tianjin", "大连": "Dalian", "沈阳": "Shenyang",
  "长春": "Changchun", "哈尔滨": "Harbin", "上海": "Shanghai", "南京": "Nanjing",
  "杭州": "Hangzhou", "合肥": "Hefei", "厦门": "Xiamen", "济南": "Jinan",
  "青岛": "Qingdao", "武汉": "Wuhan", "长沙": "Changsha", "广州": "Guangzhou",
  "成都": "Chengdu", "重庆": "Chongqing", "西安": "Xi'an", "杨凌": "Yangling",
  "兰州": "Lanzhou", "宣城": "Xuancheng", "福州": "Fuzhou", "深圳": "Shenzhen",
  "南宁": "Nanning", "贵阳": "Guiyang", "海口": "Haikou", "保定": "Baoding",
  "秦皇岛": "Qinhuangdao", "郑州": "Zhengzhou", "延吉": "Yanji", "苏州": "Suzhou",
  "无锡": "Wuxi", "徐州": "Xuzhou", "南昌": "Nanchang", "盘锦": "Panjin",
  "呼和浩特": "Hohhot", "银川": "Yinchuan", "西宁": "Xining", "威海": "Weihai",
  "太原": "Taiyuan", "雅安": "Ya'an", "拉萨": "Lhasa", "克拉玛依": "Karamay",
  "石河子": "Shihezi", "乌鲁木齐": "Urumqi", "昆明": "Kunming"
};

const GK_UNIVERSITY_EN = {
  pku: "Peking University", tsinghua: "Tsinghua University", ruc: "Renmin University of China",
  buaa: "Beihang University", bit: "Beijing Institute of Technology", bnu: "Beijing Normal University",
  cau: "China Agricultural University", muc: "Minzu University of China", nankai: "Nankai University",
  tju: "Tianjin University", dlut: "Dalian University of Technology", neu: "Northeastern University",
  jlu: "Jilin University", hit: "Harbin Institute of Technology", fudan: "Fudan University",
  sjtu: "Shanghai Jiao Tong University", tongji: "Tongji University", ecnu: "East China Normal University",
  nju: "Nanjing University", seu: "Southeast University", zju: "Zhejiang University",
  ustc: "Univ. of Science and Technology of China", xmu: "Xiamen University", sdu: "Shandong University",
  ouc: "Ocean University of China", whu: "Wuhan University", hust: "Huazhong Univ. of Science and Technology",
  hnu: "Hunan University", csu: "Central South University", nudt: "National Univ. of Defense Technology",
  sysu: "Sun Yat-sen University", scut: "South China University of Technology", scu: "Sichuan University",
  uestc: "Univ. of Electronic Science and Technology", cqu: "Chongqing University", xjtu: "Xi'an Jiaotong University",
  nwpu: "Northwestern Polytechnical University", nwafu: "Northwest A&F University", lzu: "Lanzhou University"
};

const GK_NOTE_EN = {
  "示例数据，后续替换为官方和模型结果。": "Sample data, to be replaced with official and model results.",
  "由旧版示例数据适配，缺失字段已按占位逻辑补齐。": "Adapted from legacy sample data; missing fields use placeholder logic.",
  "示例/占位数据：用于展示页面结构和交互口径，后续应替换为各省官方投档线、最低位次、招生计划和模型预测结果。": "Sample / placeholder data, used to show the page structure and interaction. Replace with each province's official admission lines, minimum ranks, enrollment plans and model predictions.",
  "浙江综合类预测数据，最终以浙江省教育考试院和高校官方信息为准。": "Zhejiang comprehensive-track prediction data; final decisions follow the official Zhejiang examination authority and university information.",
  "上海综合类预测数据，最终以上海市教育考试院和高校官方信息为准。": "Shanghai comprehensive-track prediction data; final decisions follow the official Shanghai examination authority and university information."
};

function gkProvinceEn(zh) {
  const s = String(zh ?? "");
  return GK_PROVINCE_EN[s] || s;
}

function gkSubjectEn(zh) {
  const s = String(zh ?? "");
  return GK_SUBJECT_EN[s] || s;
}

function gkCityEn(zh) {
  const s = String(zh ?? "");
  return GK_CITY_EN[s] || s;
}

function gkProvinceText(zh) {
  return L(String(zh ?? ""), gkProvinceEn(zh));
}

function gkSubjectText(zh) {
  return L(String(zh ?? ""), gkSubjectEn(zh));
}

function gkUniversityName(entry) {
  if (!entry) {
    return "";
  }
  const zh = entry.universityName || "";
  const en = entry.universityNameEn || GK_UNIVERSITY_EN[entry.universityId] || zh;
  return L(zh, en);
}

function gkLocationText(entry) {
  const raw = String(entry?.universityLocation ?? "");
  if (getLang() !== "en") {
    return raw;
  }
  const parts = raw.split(" · ");
  const prov = gkProvinceEn(parts[0] || "");
  const city = parts[1] ? gkCityEn(parts[1]) : "";
  return city ? `${prov} · ${city}` : prov;
}

const GK_MAP_CITY_PIXELS = {
  "安徽 · 合肥": [656.6, 415.7],
  "安徽 · 宣城": [674.0, 437.0],
  "北京 · 北京": [635.0, 277.0],
  "重庆 · 重庆": [495.4, 461.3],
  "福建 · 福州": [696.8, 513.4],
  "福建 · 厦门": [690.0, 552.0],
  "甘肃 · 兰州": [463.7, 346.3],
  "广东 · 广州": [602.8, 572.6],
  "广东 · 深圳": [622.0, 593.0],
  "广西 · 南宁": [523.7, 576.6],
  "贵州 · 贵阳": [498.7, 512.2],
  "海南 · 海口": [555.8, 629.3],
  "河北 · 保定": [620.0, 299.0],
  "河北 · 秦皇岛": [670.0, 267.0],
  "河南 · 郑州": [602.3, 370.0],
  "黑龙江 · 哈尔滨": [754.4, 157.9],
  "湖北 · 武汉": [609.5, 444.9],
  "湖南 · 长沙": [598.5, 484.8],
  "吉林 · 延吉": [786.0, 205.0],
  "吉林 · 长春": [741.0, 193.0],
  "江苏 · 南京": [682.2, 412.1],
  "江苏 · 苏州": [709.0, 427.0],
  "江苏 · 无锡": [697.0, 423.0],
  "江苏 · 徐州": [655.0, 382.0],
  "江西 · 南昌": [642.8, 474.9],
  "辽宁 · 大连": [699.0, 288.0],
  "辽宁 · 盘锦": [701.0, 251.0],
  "辽宁 · 沈阳": [722.0, 230.0],
  "内蒙古 · 呼和浩特": [570.7, 260.9],
  "宁夏 · 银川": [499.3, 302.7],
  "青海 · 西宁": [435.9, 332.3],
  "山东 · 济南": [649.0, 334.1],
  "山东 · 青岛": [686.0, 340.0],
  "山东 · 威海": [709.0, 322.0],
  "山西 · 太原": [588.9, 312.3],
  "陕西 · 西安": [535.3, 378.9],
  "陕西 · 杨凌": [523.0, 386.0],
  "上海 · 上海": [718.3, 422.3],
  "四川 · 成都": [462.4, 438.9],
  "四川 · 雅安": [453.0, 456.0],
  "天津 · 天津": [647.2, 287.0],
  "西藏 · 拉萨": [268.0, 432.6],
  "新疆 · 克拉玛依": [246.0, 151.0],
  "新疆 · 石河子": [255.0, 178.0],
  "新疆 · 乌鲁木齐": [271.3, 178.3],
  "云南 · 昆明": [434.9, 533.9],
  "浙江 · 杭州": [700.5, 442.4]
};

function resolveGaokaoMapPoint(entry) {
  const locationKey = String(entry?.universityLocation || (
    entry?.province && entry?.city ? `${entry.province} · ${entry.city}` : ""
  ));
  const cityPoint = GK_MAP_CITY_PIXELS[locationKey];

  if (cityPoint) {
    return {
      x: Number((cityPoint[0] / 10).toFixed(2)),
      y: Number((cityPoint[1] / 9.8).toFixed(2))
    };
  }

  return entry?.map || null;
}

function gkMajorGroupText(zh) {
  const s = String(zh ?? "");
  if (getLang() !== "en") {
    return s;
  }
  if (s === "本科普通批") {
    return "Undergraduate batch";
  }
  if (s === "专业组待补充") {
    return "Group TBD";
  }
  const seg = s.match(/^普通类(.+)段$/);
  if (seg) {
    const segMap = { "一": "1", "二": "2", "三": "3", "四": "4", "五": "5" };
    return `General track · Segment ${segMap[seg[1]] || seg[1]}`;
  }
  const m = s.match(/^专业组\s*(\d+)$/);
  if (m) {
    return `Group ${m[1]}`;
  }
  return s;
}

function gkNoteText(zh) {
  const s = String(zh ?? "");
  return L(s, GK_NOTE_EN[s] || s);
}

function gaokaoBadgePair(meta) {
  if (meta?.badgeZh || meta?.badgeEn) {
    return {
      zh: meta.badgeZh || meta.badgeEn,
      en: meta.badgeEn || meta.badgeZh
    };
  }

  return meta && meta.isSampleData
    ? { zh: "示例/占位数据", en: "Sample / placeholder" }
    : { zh: "正式数据", en: "Official data" };
}

function gkTbd() {
  return getLang() === "en" ? "TBD" : "待补充";
}

// Localize a Chinese measurement unit suffix for the active language.
function gkUnit(unitZh) {
  if (getLang() !== "en") {
    return unitZh;
  }
  const map = {
    "分": " pts",
    " 分": " pts",
    "名": "",
    " 名": "",
    "人": " seats",
    " 人": " seats"
  };
  return Object.prototype.hasOwnProperty.call(map, unitZh) ? map[unitZh] : unitZh;
}

function initGaokaoPredictionPage(context = {}) {
  const page = document.querySelector("[data-gaokao-prediction-page]");

  if (!page) {
    return;
  }

  const data = normalizeGaokaoPredictionData(context.admissionData, context.historyData, context.predictionData);
  const meta = context.meta || {};
  const provinceOrder = getGaokaoProvinceOrder(data, context.releaseData);
  const defaultProvince = provinceOrder.includes("浙江") ? "浙江" : provinceOrder[0] || "";
  const gaokaoPredictionState = {
    province: defaultProvince,
    subjectType: "",
    selectedUniversityId: null,
    selectedLocationProvince: null
  };

  window.gaokaoPredictionState = gaokaoPredictionState;

  const refs = {
    dataBadge: page.querySelector("[data-gaokao-data-badge]"),
    provinceSelect: page.querySelector("[data-gaokao-province-select]"),
    subjectSelect: page.querySelector("[data-gaokao-subject-select]"),
    quickList: page.querySelector("[data-gaokao-province-quick-list]"),
    mapHeading: page.querySelector("[data-gaokao-map-heading]"),
    mapSummary: page.querySelector("[data-gaokao-map-summary]"),
    predictionMap: page.querySelector("[data-gaokao-prediction-map]"),
    scoreList: page.querySelector("[data-gaokao-map-score-list]"),
    detailModal: document.querySelector("[data-gaokao-detail-modal]"),
    detailBody: document.querySelector("[data-gaokao-detail-body]"),
    provinceModal: document.querySelector("[data-gaokao-province-modal]"),
    provinceBody: document.querySelector("[data-gaokao-province-body]")
  };

  if (refs.dataBadge) {
    refs.dataBadge.textContent = pairText(gaokaoBadgePair(meta));
  }

  renderProvinceSelector(provinceOrder, data, gaokaoPredictionState, refs);
  bindGaokaoPredictionEvents(data, meta, context.releaseData, gaokaoPredictionState, refs);
  updateGaokaoSubjectOptions(data, gaokaoPredictionState, refs);
  renderGaokaoPredictionWorkspace(data, meta, context.releaseData, gaokaoPredictionState, refs);

  let mapResizeTimer = null;
  let lastMapWidth = refs.predictionMap ? refs.predictionMap.clientWidth : 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(mapResizeTimer);
    mapResizeTimer = window.setTimeout(() => {
      const width = refs.predictionMap ? refs.predictionMap.clientWidth : 0;

      if (width && Math.abs(width - lastMapWidth) > 24) {
        lastMapWidth = width;
        renderUniversityPredictionMap(data, meta, gaokaoPredictionState, refs);
      }
    }, 220);
  });

  document.addEventListener("wowcai:langchange", () => {
    if (refs.dataBadge) {
      refs.dataBadge.textContent = pairText(gaokaoBadgePair(meta));
    }

    renderProvinceSelector(provinceOrder, data, gaokaoPredictionState, refs);
    renderGaokaoPredictionWorkspace(data, meta, context.releaseData, gaokaoPredictionState, refs);

    if (
      refs.detailModal &&
      refs.detailModal.classList.contains("is-open") &&
      gaokaoPredictionState.selectedUniversityId &&
      refs.detailBody
    ) {
      const entry = data.find((item) => (
        item.universityId === gaokaoPredictionState.selectedUniversityId &&
        item.province === gaokaoPredictionState.province &&
        (!gaokaoPredictionState.subjectType || item.subjectType === gaokaoPredictionState.subjectType)
      ));

      if (entry) {
        refs.detailBody.innerHTML = renderUniversityDetail(entry);
      }
    }

    if (
      refs.provinceModal &&
      refs.provinceModal.classList.contains("is-open") &&
      gaokaoPredictionState.selectedLocationProvince
    ) {
      populateGaokaoProvincePanel(gaokaoPredictionState.selectedLocationProvince, data, gaokaoPredictionState, refs);
    }
  });
}

function bindGaokaoPredictionEvents(data, meta, releaseData, state, refs) {
  if (refs.provinceSelect) {
    refs.provinceSelect.addEventListener("change", () => {
      state.province = refs.provinceSelect.value;
      state.selectedUniversityId = null;
      updateGaokaoSubjectOptions(data, state, refs);
      renderGaokaoPredictionWorkspace(data, meta, releaseData, state, refs);
    });
  }

  if (refs.subjectSelect) {
    refs.subjectSelect.addEventListener("change", () => {
      state.subjectType = refs.subjectSelect.value;
      state.selectedUniversityId = null;
      renderGaokaoPredictionWorkspace(data, meta, releaseData, state, refs);
    });
  }

  if (refs.quickList) {
    refs.quickList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-gaokao-quick-province]");

      if (!button) {
        return;
      }

      state.province = button.dataset.gaokaoQuickProvince;
      state.selectedUniversityId = null;

      if (refs.provinceSelect) {
        refs.provinceSelect.value = state.province;
      }

      updateGaokaoSubjectOptions(data, state, refs);
      renderGaokaoPredictionWorkspace(data, meta, releaseData, state, refs);
    });
  }

  document.querySelectorAll("[data-close-gaokao-detail]").forEach((node) => {
    node.addEventListener("click", closeGaokaoUniversityDetail);
  });

  document.querySelectorAll("[data-close-gaokao-province]").forEach((node) => {
    node.addEventListener("click", closeGaokaoProvinceModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    const detailModal = document.querySelector("[data-gaokao-detail-modal]");

    if (detailModal && detailModal.classList.contains("is-open")) {
      closeGaokaoUniversityDetail();
    } else {
      closeGaokaoProvinceModal();
    }
  });
}

function normalizeGaokaoPredictionData(admissionData, history, prediction) {
  if (Array.isArray(admissionData) && admissionData.length) {
    return admissionData.map((item) => normalizeAdmissionPredictionItem(item)).filter(Boolean);
  }

  const years = Array.isArray(history?.years) ? history.years : [2021, 2022, 2023, 2024, 2025];
  const predictionYear = prediction?.targetYear || 2026;
  const predictionBySchool = new Map((prediction?.universities || []).map((school) => [school.id, school]));

  return (history?.universities || []).flatMap((school) => {
    const forecastSchool = predictionBySchool.get(school.id);

    return Object.entries(school.scores || {}).map(([province, scores]) => {
      const historyRows = scores.map((score, index) => ({
        year: years[index],
        minScore: Number(score),
        minRank: estimateFallbackRank(Number(score), index),
        planCount: null
      }));
      const latest = historyRows[historyRows.length - 1] || {};
      const forecast = forecastSchool?.predictions?.[province] || {};
      const predictedScore = Number(forecast.score || latest.minScore || 0);
      const predictedRank = estimateFallbackRank(predictedScore, historyRows.length + 1);

      return normalizeAdmissionPredictionItem({
        province,
        subjectType: "物理类",
        universityId: school.id,
        universityName: school.name,
        universityLocation: `${school.province} · ${school.city}`,
        majorGroup: "专业组待补充",
        history: historyRows,
        prediction: {
          year: predictionYear,
          predictedScore,
          predictedRank,
          scoreRange: [Number(forecast.low || predictedScore - 5), Number(forecast.high || predictedScore + 5)],
          rankRange: [Math.max(1, predictedRank - 200), predictedRank + 200],
          changeFromLastYear: latest.minScore ? predictedScore - latest.minScore : 0,
          confidence: (forecast.confidence || "medium").toLowerCase()
        },
        sourceNote: "由旧版示例数据适配，缺失字段已按占位逻辑补齐。"
      });
    });
  }).filter(Boolean);
}

function normalizeAdmissionPredictionItem(item) {
  if (!item || !item.province || !item.universityId) {
    return null;
  }

  const baseSchool = (window.GAOKAO_UNIVERSITY_BASE || []).find((school) => school.id === item.universityId);
  const history = (item.history || []).map((row) => ({
    year: Number(row.year),
    minScore: nullableNumber(row.minScore),
    minRank: nullableNumber(row.minRank),
    planCount: row.planCount == null ? null : Number(row.planCount)
  })).filter((row) => Number.isFinite(row.year));
  const latest = [...history].reverse().find((row) => Number.isFinite(row.minScore)) || {};
  const prediction = item.prediction || {};
  const predictedScore = nullableNumber(prediction.predictedScore ?? prediction.score ?? latest.minScore);
  const predictedRank = nullableNumber(prediction.predictedRank ?? latest.minRank) ?? estimateFallbackRank(predictedScore, history.length + 1);
  const changeFromLastYear = nullableNumber(prediction.changeFromLastYear)
    ?? (Number.isFinite(latest.minScore) && Number.isFinite(predictedScore) ? predictedScore - latest.minScore : null);

  return {
    province: String(item.province),
    subjectType: String(item.subjectType || "科类待补充"),
    universityId: String(item.universityId),
    universityName: String(item.universityName || item.name || "高校名称待补充"),
    universityNameEn: item.universityNameEn ? String(item.universityNameEn) : "",
    universityLocation: String(item.universityLocation || item.location || "所在地待补充"),
    map: item.map || baseSchool?.map || null,
    majorGroup: String(item.majorGroup || item.batch || "专业组待补充"),
    history,
    prediction: {
      year: Number(prediction.year || 2026),
      predictedScore,
      predictedRank,
      scoreRange: normalizeRange(prediction.scoreRange, predictedScore, 5),
      rankRange: normalizeRange(prediction.rankRange, predictedRank, 220, 1),
      changeFromLastYear,
      confidence: String(prediction.confidence || "medium").toLowerCase()
    },
    predictionReason: String(item.predictionReason || item.prediction_reason || ""),
    predictionReasonEn: item.predictionReasonEn ? String(item.predictionReasonEn) : "",
    sourceNote: String(item.sourceNote || "示例数据，后续替换为官方和模型结果。")
  };
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeRange(range, center, spread, minValue = -Infinity) {
  if (Array.isArray(range) && range.length >= 2) {
    const low = nullableNumber(range[0]);
    const high = nullableNumber(range[1]);

    if (low !== null && high !== null) {
      return [Math.max(minValue, low), Math.max(minValue, high)];
    }
  }

  if (!Number.isFinite(Number(center))) {
    return [];
  }

  return [Math.max(minValue, Number(center) - spread), Math.max(minValue, Number(center) + spread)];
}

function estimateFallbackRank(score, index) {
  const distance = Math.max(20, 720 - Number(score || 0));
  return Math.max(1, Math.round(distance * distance * 0.9 + index * 41));
}

function getGaokaoProvinceOrder(data, releaseData) {
  const provinceSet = new Set(data.map((item) => item.province));
  const preferred = ["浙江", "上海市"];
  const ordered = preferred.filter((province) => provinceSet.has(province));
  const rest = [...provinceSet]
    .filter((province) => !preferred.includes(province))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));

  return [...ordered, ...rest];
}

function renderGaokaoHeroStats(data, meta, target) {
  if (!target) {
    return;
  }

  const provinces = new Set(data.map((item) => item.province));
  const universities = new Set(data.map((item) => item.universityId));
  const years = meta.historicalYears || [...new Set(data.flatMap((item) => item.history.map((row) => row.year)))].sort();
  const yearRange = years.length ? `${years[0]}-${years[years.length - 1]}` : "待补充";

  target.innerHTML = `
    <div><span>覆盖高校</span><strong>${universities.size || meta.universityCount || 0}</strong><em>所重点高校</em></div>
    <div><span>覆盖省份</span><strong>${provinces.size || meta.provinceCount || 0}</strong><em>个省级入口</em></div>
    <div><span>历史范围</span><strong>${escapeHtml(yearRange)}</strong><em>最低分 / 位次</em></div>
    <div><span>预测年份</span><strong>${meta.targetYear || 2026}</strong><em>更新时间 ${escapeHtml(meta.updatedAt || "待补充")}</em></div>
  `;
}

function renderProvinceSelector(provinceOrder, data, state, refs) {
  if (refs.provinceSelect) {
    refs.provinceSelect.innerHTML = provinceOrder.map((province) => (
      `<option value="${escapeHtml(province)}">${escapeHtml(gkProvinceText(province))}</option>`
    )).join("");
    refs.provinceSelect.value = state.province;
    refs.provinceSelect.disabled = provinceOrder.length <= 1;
  }

  renderProvinceQuickButtons(provinceOrder, state, refs);
  updateGaokaoSubjectOptions(data, state, refs);
}

function renderProvinceQuickButtons(provinceOrder, state, refs) {
  if (!refs.quickList) {
    return;
  }

  const quick = ["浙江", "上海市"].filter((province) => provinceOrder.includes(province));
  refs.quickList.innerHTML = quick.map((province) => `
    <button class="${province === state.province ? "is-active" : ""}" type="button" data-gaokao-quick-province="${escapeHtml(province)}">${escapeHtml(gkProvinceText(province))}</button>
  `).join("");
}

function updateGaokaoSubjectOptions(data, state, refs) {
  const subjects = [...new Set(data.filter((item) => item.province === state.province).map((item) => item.subjectType))];

  if (!subjects.includes(state.subjectType)) {
    state.subjectType = subjects[0] || "";
  }

  if (!refs.subjectSelect) {
    return;
  }

  refs.subjectSelect.innerHTML = subjects.map((subject) => (
    `<option value="${escapeHtml(subject)}">${escapeHtml(gkSubjectText(subject))}</option>`
  )).join("");
  refs.subjectSelect.value = state.subjectType;
}

function renderGaokaoPredictionWorkspace(data, meta, releaseData, state, refs) {
  renderProvinceQuickButtons(getGaokaoProvinceOrder(data, releaseData), state, refs);
  renderUniversityPredictionMap(data, meta, state, refs);
}

function getCurrentGaokaoEntries(data, state) {
  return data.filter((item) => (
    item.province === state.province &&
    (!state.subjectType || item.subjectType === state.subjectType)
  ));
}

function renderProvinceStatusCard(data, meta, state, refs) {
  if (!refs.stateCard) {
    return;
  }

  const entries = getCurrentGaokaoEntries(data, state);
  const inputText = state.score || state.rank
    ? `${state.score ? `${state.score} 分` : "未填分数"} · ${state.rank ? `第 ${formatNumber(state.rank)} 名` : "未填位次"}`
    : "未输入个人成绩，列表将显示为待判断";

  refs.stateCard.innerHTML = `
    <div>
      <span>当前查看</span>
      <strong>${escapeHtml(state.province || "请选择省份")}</strong>
      <p>${escapeHtml(state.subjectType || "科类待补充")} · ${entries.length} 所重点高校样本</p>
    </div>
    <div>
      <span>个人定位</span>
      <strong>${escapeHtml(inputText)}</strong>
      <p>${escapeHtml(meta.sourceNote || "示例数据，后续替换为官方和模型结果。")}</p>
    </div>
  `;
}

function renderProvinceOverview(data, meta, state, refs) {
  if (!refs.overview) {
    return;
  }

  const entries = getCurrentGaokaoEntries(data, state);

  if (refs.overviewTitle) {
    refs.overviewTitle.textContent = `${state.province || "省份"}预测总览`;
  }

  if (!entries.length) {
    refs.overview.innerHTML = renderGaokaoEmptyState("当前省份暂无可展示数据", "请切换省份，或补充该省的历史录取线与预测结果。");
    return;
  }

  const predictedScores = entries.map((item) => item.prediction.predictedScore).filter(Number.isFinite);
  const predictedRanks = entries.map((item) => item.prediction.predictedRank).filter(Number.isFinite);
  const avgScore = Math.round(predictedScores.reduce((sum, value) => sum + value, 0) / predictedScores.length);
  const avgChange = entries.reduce((sum, item) => sum + item.prediction.changeFromLastYear, 0) / entries.length;
  const trendText = avgChange > 2
    ? `整体上行 ${formatSigned(avgChange, 1)} 分`
    : avgChange < -2
      ? `整体下行 ${formatSigned(avgChange, 1)} 分`
      : `整体平稳 ${formatSigned(avgChange, 1)} 分`;

  refs.overview.innerHTML = `
    ${renderOverviewMetric("可查询高校", `${entries.length}`, "当前科类有预测样本")}
    ${renderOverviewMetric("预测最低分范围", formatMinMax(predictedScores, "分"), "按高校预测分统计")}
    ${renderOverviewMetric("预测位次范围", formatMinMax(predictedRanks.map((rank) => Math.round(rank)), "名", true), "位次越小竞争越强")}
    ${renderOverviewMetric("平均预测分", `${avgScore} 分`, "用于观察整体门槛")}
    ${renderOverviewMetric("较去年变化", trendText, "对比最新历史年份")}
    ${renderOverviewMetric("数据更新时间", meta.updatedAt || "待补充", "示例数据需替换")}
    <p class="gaokao-overview-note">提示：预测结果仅供参考，最终以省教育考试院、高校招生章程和官方投档结果为准。</p>
  `;
}

function renderOverviewMetric(label, value, caption) {
  return `
    <div class="gaokao-overview-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <p>${escapeHtml(caption)}</p>
    </div>
  `;
}

function renderUniversityPredictionMap(data, meta, state, refs) {
  if (!refs.predictionMap) {
    return;
  }

  const entries = getCurrentGaokaoEntries(data, state)
    .filter((entry) => {
      const point = resolveGaokaoMapPoint(entry);
      return point && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y));
    })
    .sort((a, b) => b.prediction.predictedScore - a.prediction.predictedScore);
  const provinceGroups = getGaokaoProvinceGroups(entries);
  const sourceHeight = Number(refs.predictionMap.dataset.mapSourceHeight) || 0;
  const cropHeight = Number(refs.predictionMap.dataset.mapCropHeight) || 0;
  const yScale = sourceHeight > 0 && cropHeight > 0 ? sourceHeight / cropHeight : 1;

  if (refs.mapHeading) {
    const provText = state.province ? gkProvinceText(state.province) : L("省份", "Province");
    const subjText = state.subjectType ? gkSubjectText(state.subjectType) : L("科类", "Track");
    refs.mapHeading.textContent = getLang() === "en"
      ? `${provText} · ${subjText} · University Score Map`
      : `${provText} · ${subjText} 高校预测地图`;
  }

  if (refs.mapSummary) {
    if (entries.length) {
      refs.mapSummary.textContent = getLang() === "en"
        ? `${provinceGroups.length} regions · ${entries.length} universities. Tap a region first, then pick a university.`
        : `${provinceGroups.length} 个高校所在省份 · ${entries.length} 所高校。先点击地图上的省份，再选择高校查看趋势。`;
    } else {
      refs.mapSummary.textContent = L(
        "当前省份和科类暂无可展示的高校预测数据。",
        "No university predictions to display for this province and track yet."
      );
    }
  }

  if (!entries.length) {
    refs.predictionMap.innerHTML = renderGaokaoEmptyState(
      L("当前选择暂无地图数据", "No map data for this selection"),
      L("请切换省份或补充高校地图坐标与预测结果。", "Switch province, or add university map coordinates and predictions.")
    );

    if (refs.scoreList) {
      refs.scoreList.innerHTML = "";
    }

    return;
  }

  refs.predictionMap.innerHTML = `
    <div class="gaokao-map-coordinate-layer" data-gaokao-map-coordinate-layer>
      <img class="gaokao-prediction-map-bg" src="china-standard-map.svg" alt="中华人民共和国标准地图（含台湾省）">
    </div>
  `;
  const markerLayer = refs.predictionMap.querySelector("[data-gaokao-map-coordinate-layer]") || refs.predictionMap;

  const maxCount = provinceGroups.reduce((max, group) => Math.max(max, group.count), 0);
  const denseThreshold = Math.max(6, maxCount * 0.6);
  const mapWidth = refs.predictionMap.clientWidth || 1000;
  const mapHeight = refs.predictionMap.clientHeight || mapWidth * 0.7;
  const placedMarkers = spreadGaokaoProvinceMarkers(provinceGroups, yScale, mapWidth, mapHeight);

  placedMarkers.forEach(({ group, x, y }) => {
    const provinceName = gkProvinceText(group.province);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gaokao-province-marker";

    if (group.count >= denseThreshold) {
      button.classList.add("is-dense");
    }

    button.style.left = `${x}%`;
    button.style.top = `${y}%`;
    button.style.zIndex = `${100 + group.count}`;
    button.dataset.locationProvince = group.province;
    button.title = getLang() === "en"
      ? `${provinceName} · ${group.count} universities`
      : `${provinceName} · ${group.count} 所高校`;
    button.setAttribute("aria-label", getLang() === "en"
      ? `${provinceName}, ${group.count} universities, open list`
      : `${provinceName}，${group.count} 所高校，点击查看高校列表`);
    button.innerHTML = `
      <span class="gaokao-province-marker-dot" aria-hidden="true">${group.count}</span>
      <span class="gaokao-province-marker-name">${escapeHtml(provinceName)}</span>
    `;
    button.addEventListener("click", () => openGaokaoProvinceModal(group.province, data, state, refs));
    markerLayer.appendChild(button);
  });

  if (refs.scoreList) {
    refs.scoreList.innerHTML = "";
  }
}

function getGaokaoLocationProvince(entry) {
  const raw = String(entry?.universityLocation ?? "");
  return (raw.split(" · ")[0] || "").trim();
}

function getGaokaoProvinceGroups(entries) {
  const groups = new Map();

  entries.forEach((entry) => {
    const point = resolveGaokaoMapPoint(entry);

    if (!point || !Number.isFinite(Number(point.x)) || !Number.isFinite(Number(point.y))) {
      return;
    }

    const province = getGaokaoLocationProvince(entry) || "其他";
    const group = groups.get(province) || { province, entries: [], sumX: 0, sumY: 0 };
    group.entries.push(entry);
    group.sumX += Number(point.x);
    group.sumY += Number(point.y);
    groups.set(province, group);
  });

  return [...groups.values()]
    .map((group) => ({
      province: group.province,
      entries: group.entries.slice().sort(
        (a, b) => (b.prediction?.predictedScore || 0) - (a.prediction?.predictedScore || 0)
      ),
      count: group.entries.length,
      point: {
        x: group.sumX / group.entries.length,
        y: group.sumY / group.entries.length
      }
    }))
    .sort((a, b) => b.count - a.count);
}

function spreadGaokaoProvinceMarkers(groups, yScale, mapWidth = 1000, mapHeight = 700) {
  const width = mapWidth || 1000;
  const height = mapHeight || width * 0.7;
  const isCompact = width < 520;
  const markerWidthPx = isCompact ? 26 : 64;
  const markerHeightPx = isCompact ? 26 : 46;
  const minDistX = Math.min(15, (markerWidthPx / width) * 100 + 1.2);
  const minDistY = Math.min(13, (markerHeightPx / height) * 100 + 1.2);
  // Keep each marker close to its true geographic position so the map stays meaningful.
  const maxOffsetX = isCompact ? 5.5 : 11;
  const maxOffsetY = isCompact ? 5 : 10;

  const nodes = groups.map((group) => {
    const ox = Math.max(4, Math.min(96, Number(group.point.x)));
    const oy = Math.max(5, Math.min(95, Number(group.point.y) * yScale));
    return { group, ox, oy, x: ox, y: oy };
  });

  for (let iteration = 0; iteration < 120; iteration += 1) {
    let moved = false;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const overlapX = minDistX - Math.abs(dx);
        const overlapY = minDistY - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          if (overlapX / minDistX < overlapY / minDistY) {
            const push = (overlapX / 2 + 0.2) * (dx >= 0 ? 1 : -1);
            a.x -= push;
            b.x += push;
          } else {
            const push = (overlapY / 2 + 0.2) * (dy >= 0 ? 1 : -1);
            a.y -= push;
            b.y += push;
          }

          moved = true;
        }
      }
    }

    nodes.forEach((node) => {
      node.x = Math.max(node.ox - maxOffsetX, Math.min(node.ox + maxOffsetX, node.x));
      node.y = Math.max(node.oy - maxOffsetY, Math.min(node.oy + maxOffsetY, node.y));
      node.x = Math.max(4, Math.min(96, node.x));
      node.y = Math.max(5, Math.min(95, node.y));
    });

    if (!moved) {
      break;
    }
  }

  return nodes;
}

function renderUniversityPredictionList(data, state, refs) {
  if (!refs.universityList) {
    return;
  }

  const entries = getCurrentGaokaoEntries(data, state).map((entry) => ({
    ...entry,
    tier: calculateAdmissionTier(entry, state)
  }));
  const tierCounts = countGaokaoTiers(entries);
  const filtered = state.filter === "all" ? entries : entries.filter((entry) => entry.tier.key === state.filter);
  const sorted = sortGaokaoEntries(filtered, state.sortBy);

  if (refs.listSummary) {
    const personalText = state.score || state.rank ? "已按你的分数/位次重新分层" : "未输入成绩时默认展示为待判断";
    refs.listSummary.textContent = `${state.province} · ${state.subjectType}：${entries.length} 所高校，${personalText}。`;
  }

  if (refs.filterTabs) {
    refs.filterTabs.innerHTML = renderGaokaoFilterTabs(state.filter, tierCounts, entries.length);
  }

  if (!entries.length) {
    refs.universityList.innerHTML = renderGaokaoEmptyState("当前省份暂无高校预测", "请补充该省的统一录取预测数据，页面会自动渲染。");
    return;
  }

  if (!sorted.length) {
    refs.universityList.innerHTML = renderGaokaoEmptyState("当前筛选条件没有结果", "可切回“全部”或输入分数/位次后重新查看冲稳保分类。");
    return;
  }

  refs.universityList.innerHTML = sorted.map((entry) => renderUniversityPredictionCard(entry)).join("");
  refs.universityList.querySelectorAll("[data-open-gaokao-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = entries.find((item) => item.universityId === button.dataset.universityId);
      openGaokaoUniversityDetail(entry, state, refs);
    });
  });
}

function renderGaokaoFilterTabs(activeFilter, counts, total) {
  const filters = [
    ["all", "全部", total],
    ["sprint", "冲刺", counts.sprint || 0],
    ["stable", "稳妥", counts.stable || 0],
    ["safe", "保底", counts.safe || 0],
    ["risk", "风险较高", counts.risk || 0],
    ["pending", "待判断", counts.pending || 0]
  ];

  return filters.map(([key, label, count]) => `
    <button class="${activeFilter === key ? "is-active" : ""}" type="button" data-gaokao-filter="${key}" aria-pressed="${activeFilter === key}">
      <span>${escapeHtml(label)}</span><strong>${count}</strong>
    </button>
  `).join("");
}

function countGaokaoTiers(entries) {
  return entries.reduce((counts, entry) => {
    counts[entry.tier.key] = (counts[entry.tier.key] || 0) + 1;
    return counts;
  }, {});
}

function sortGaokaoEntries(entries, sortBy) {
  const tierOrder = { risk: 0, sprint: 1, stable: 2, safe: 3, pending: 4 };
  const list = [...entries];

  list.sort((a, b) => {
    if (sortBy === "predictedRankAsc") {
      return a.prediction.predictedRank - b.prediction.predictedRank;
    }

    if (sortBy === "predictedRankDesc") {
      return b.prediction.predictedRank - a.prediction.predictedRank;
    }

    if (sortBy === "changeDesc") {
      return b.prediction.changeFromLastYear - a.prediction.changeFromLastYear;
    }

    if (sortBy === "tier") {
      return (tierOrder[a.tier.key] ?? 9) - (tierOrder[b.tier.key] ?? 9) || b.prediction.predictedScore - a.prediction.predictedScore;
    }

    return b.prediction.predictedScore - a.prediction.predictedScore;
  });

  return list;
}

function calculateAdmissionTier(entry, state) {
  const predictedScore = entry.prediction.predictedScore;
  const predictedRank = entry.prediction.predictedRank;

  if (!state.score && !state.rank) {
    return { key: "pending", label: "待判断", note: "输入分数或位次后自动分层" };
  }

  if (state.rank && predictedRank) {
    const rankGapRatio = (state.rank - predictedRank) / predictedRank;

    if (rankGapRatio > 0.18) {
      return { key: "risk", label: "风险较高", note: "位次明显低于预测门槛" };
    }

    if (rankGapRatio > 0.03) {
      return { key: "sprint", label: "冲刺", note: "位次略低于预测门槛" };
    }

    if (rankGapRatio >= -0.08) {
      return { key: "stable", label: "稳妥", note: "位次接近预测门槛" };
    }

    return { key: "safe", label: "保底", note: "位次优于预测门槛" };
  }

  const scoreGap = state.score - predictedScore;

  if (scoreGap < -12) {
    return { key: "risk", label: "风险较高", note: "分数明显低于预测线" };
  }

  if (scoreGap < 0) {
    return { key: "sprint", label: "冲刺", note: "分数略低于预测线" };
  }

  if (scoreGap <= 12) {
    return { key: "stable", label: "稳妥", note: "分数接近预测线" };
  }

  return { key: "safe", label: "保底", note: "分数高于预测线" };
}

function renderUniversityPredictionCard(entry) {
  const latest = getLatestHistory(entry);
  const scoreValues = entry.history.map((row) => row.minScore);
  const rankValues = entry.history.map((row) => row.minRank);
  const scoreRange = entry.prediction.scoreRange || [];
  const rankRange = entry.prediction.rankRange || [];

  return `
    <article class="gaokao-university-card tier-${entry.tier.key}">
      <div class="gaokao-university-title-row">
        <div>
          <span>${escapeHtml(entry.universityLocation)}</span>
          <h3>${escapeHtml(entry.universityName)}</h3>
          <p>${escapeHtml(entry.province)}招生 · ${escapeHtml(entry.subjectType)} · ${escapeHtml(entry.majorGroup)}</p>
        </div>
        <strong class="gaokao-tier-badge ${entry.tier.key}">${escapeHtml(entry.tier.label)}</strong>
      </div>

      <div class="gaokao-card-metrics">
        <div><span>最新最低分</span><strong>${formatNullable(latest?.minScore, "分")}</strong></div>
        <div><span>最新最低位次</span><strong>${formatRank(latest?.minRank)}</strong></div>
        <div><span>${entry.prediction.year} 预测分</span><strong>${formatNullable(entry.prediction.predictedScore, "分")}</strong></div>
        <div><span>${entry.prediction.year} 预测位次</span><strong>${formatRank(entry.prediction.predictedRank)}</strong></div>
      </div>

      <div class="gaokao-trend-blocks">
        <div>
          <span>近五年最低分趋势</span>
          ${renderSparkline(scoreValues, "score")}
          <em>${scoreValues.map((value) => formatNullable(value)).join(" / ")}</em>
        </div>
        <div>
          <span>近五年最低位次趋势</span>
          ${renderSparkline(rankValues, "rank")}
          <em>${rankValues.map((value) => formatNumber(value)).join(" / ")}</em>
        </div>
      </div>

      <div class="gaokao-card-footer">
        <div>
          <span>预测区间 ${formatRange(scoreRange, "分")} · 位次 ${formatRankRange(rankRange)}</span>
          <strong class="${entry.prediction.changeFromLastYear >= 0 ? "is-up" : "is-down"}">较去年 ${formatSigned(entry.prediction.changeFromLastYear)} 分</strong>
        </div>
        <button type="button" data-open-gaokao-detail data-university-id="${escapeHtml(entry.universityId)}">查看详情</button>
      </div>
      <p class="gaokao-tier-note">${escapeHtml(entry.tier.note)} · ${escapeHtml(entry.sourceNote)}</p>
    </article>
  `;
}

function syncGaokaoModalScrollLock() {
  const detailOpen = document.querySelector("[data-gaokao-detail-modal]")?.classList.contains("is-open");
  const provinceOpen = document.querySelector("[data-gaokao-province-modal]")?.classList.contains("is-open");
  document.body.classList.toggle("modal-open", Boolean(detailOpen || provinceOpen));
}

function populateGaokaoProvincePanel(locationProvince, data, state, refs) {
  if (!refs.provinceBody) {
    return false;
  }

  const entries = getCurrentGaokaoEntries(data, state).filter(
    (entry) => getGaokaoLocationProvince(entry) === locationProvince
  );

  if (!entries.length) {
    return false;
  }

  refs.provinceBody.innerHTML = renderGaokaoProvincePanel(locationProvince, entries, state);
  refs.provinceBody.querySelectorAll("[data-open-gaokao-detail-from-province]").forEach((button) => {
    const entry = entries.find((item) => item.universityId === button.dataset.openGaokaoDetailFromProvince);

    if (entry) {
      button.addEventListener("click", () => openGaokaoUniversityDetail(entry, state, refs));
    }
  });

  return true;
}

function openGaokaoProvinceModal(locationProvince, data, state, refs) {
  if (!refs.provinceModal || !populateGaokaoProvincePanel(locationProvince, data, state, refs)) {
    return;
  }

  state.selectedLocationProvince = locationProvince;
  refs.provinceModal.classList.add("is-open");
  refs.provinceModal.setAttribute("aria-hidden", "false");
  refs.provinceModal.scrollTop = 0;
  const card = refs.provinceModal.querySelector(".gaokao-province-card");

  if (card) {
    card.scrollTop = 0;
  }

  document.body.classList.add("modal-open");
}

function closeGaokaoProvinceModal() {
  const modal = document.querySelector("[data-gaokao-province-modal]");

  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  if (window.gaokaoPredictionState) {
    window.gaokaoPredictionState.selectedLocationProvince = null;
  }

  syncGaokaoModalScrollLock();
}

function renderGaokaoProvincePanel(locationProvince, entries, state) {
  const sorted = entries.slice().sort(
    (a, b) => (b.prediction?.predictedScore || 0) - (a.prediction?.predictedScore || 0)
  );
  const provinceName = gkProvinceText(locationProvince);
  const sourceProvinceText = state.province ? gkProvinceText(state.province) : "";
  const subjText = state.subjectType ? gkSubjectText(state.subjectType) : "";
  const contextText = getLang() === "en"
    ? `${sourceProvinceText} ${subjText}`.trim()
    : `${sourceProvinceText}${subjText}`;
  const metaText = getLang() === "en"
    ? `${contextText} · ${sorted.length} universities`
    : `${contextText}招生 · ${sorted.length} 所高校`;

  const items = sorted.map((entry) => `
    <button type="button" class="gaokao-province-school" data-open-gaokao-detail-from-province="${escapeHtml(entry.universityId)}">
      <span class="gaokao-province-school-main">
        <em>${escapeHtml(gkUniversityName(entry))}</em>
        <small>${escapeHtml(gkLocationText(entry))} · ${escapeHtml(gkMajorGroupText(entry.majorGroup))}</small>
      </span>
      <span class="gaokao-province-school-score">
        <strong>${formatRank(entry.prediction.predictedRank)}</strong>
        <small>${escapeHtml(L("预测位次", "Predicted rank"))}</small>
      </span>
    </button>
  `).join("");

  return `
    <div class="gaokao-province-head">
      <div>
        <p class="kicker">${escapeHtml(L("高校所在省份", "University region"))}</p>
        <h2 id="gaokao-province-title">${escapeHtml(provinceName)}</h2>
        <p>${escapeHtml(metaText)}</p>
      </div>
      <span class="gaokao-province-count">${sorted.length}</span>
    </div>
    <p class="gaokao-province-tip">${escapeHtml(L("点击任意高校，查看 2021-2026 年分数 / 位次趋势与预测依据。", "Tap any university to view its 2021-2026 score / rank trend and forecast basis."))}</p>
    <div class="gaokao-province-school-list">${items}</div>
  `;
}

function openGaokaoUniversityDetail(entry, state, refs) {
  if (!entry || !refs.detailModal || !refs.detailBody) {
    return;
  }

  state.selectedUniversityId = entry.universityId;
  refs.detailBody.innerHTML = renderUniversityDetail(entry);
  refs.detailModal.classList.add("is-open");
  refs.detailModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeGaokaoUniversityDetail() {
  const modal = document.querySelector("[data-gaokao-detail-modal]");

  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  syncGaokaoModalScrollLock();
}

function renderUniversityDetail(entry) {
  const latest = getLatestHistory(entry);
  const scoreValues = entry.history.map((row) => row.minScore);
  const rankValues = entry.history.map((row) => row.minRank);
  const years = entry.history.map((row) => row.year);
  const predictionYear = entry.prediction?.year || 2026;
  const rankChangeFromLastYear = Number.isFinite(nullableNumber(entry.prediction?.predictedRank)) && Number.isFinite(nullableNumber(latest?.minRank))
    ? nullableNumber(entry.prediction.predictedRank) - nullableNumber(latest.minRank)
    : null;

  const admissionText = getLang() === "en"
    ? `${gkProvinceEn(entry.province)} admission`
    : `${entry.province}招生`;
  const latestRankText = getLang() === "en"
    ? `Latest historical rank ${formatRank(latest?.minRank)}`
    : `最新历史位次 ${formatRank(latest?.minRank)}`;

  return `
    <div class="gaokao-detail-header">
      <div>
        <p class="kicker">UNIVERSITY DETAIL</p>
        <h2 id="gaokao-detail-title">${escapeHtml(gkUniversityName(entry))}</h2>
        <p>${escapeHtml(gkLocationText(entry))} · ${escapeHtml(admissionText)} · ${escapeHtml(gkSubjectText(entry.subjectType))} · ${escapeHtml(gkMajorGroupText(entry.majorGroup))}</p>
      </div>
      <span class="gaokao-detail-score-chip">${formatRank(entry.prediction.predictedRank)}</span>
    </div>

    <div class="gaokao-detail-kpis">
      <div><span>${escapeHtml(L("预测位次", "Predicted rank"))}</span><strong>${formatRank(entry.prediction.predictedRank)}</strong><p>${formatRankRange(entry.prediction.rankRange)}</p></div>
      <div><span>${escapeHtml(L("位次较上一年变化", "Rank change vs last year"))}</span><strong>${formatSigned(rankChangeFromLastYear)}${gkUnit(" 名")}</strong><p>${escapeHtml(latestRankText)}</p></div>
      <div><span>${escapeHtml(L("预测分数线", "Predicted score"))}</span><strong>${escapeHtml(L("待更新", "Pending"))}</strong><p>${escapeHtml(L("待更新", "Pending"))}</p></div>
    </div>

    <div class="gaokao-detail-chart-grid">
      <div>
        <h3>${escapeHtml(L("2021-2026最低位次趋势", "2021-2026 minimum rank trend"))}</h3>
        ${renderDetailLineChart(rankValues, years, "rank", {
          year: predictionYear,
          value: entry.prediction.predictedRank
        })}
      </div>
      <div>
        <h3>${escapeHtml(L("2021-2026最低分趋势", "2021-2026 minimum score trend"))}</h3>
        ${renderDetailLineChart(scoreValues, years, "score", {
          year: predictionYear,
          value: null,
          reserveYear: true
        })}
      </div>
    </div>

    <div class="gaokao-detail-judgement">
      <strong>${escapeHtml(L("趋势判断", "Trend read"))}</strong>
      <p>${escapeHtml(makeGaokaoTrendJudgement(entry))}</p>
    </div>

    ${entry.predictionReason ? `
      <div class="gaokao-detail-judgement gaokao-detail-reason">
        <strong>${escapeHtml(L(`${predictionYear} 预测依据`, `${predictionYear} forecast basis`))}</strong>
        <p>${escapeHtml(getLang() === "en" && entry.predictionReasonEn ? entry.predictionReasonEn : entry.predictionReason)}</p>
      </div>
    ` : ""}

    <div class="modal-table-wrap">
      <table class="modal-data-table gaokao-detail-table">
        <thead>
          <tr><th>${escapeHtml(L("年份", "Year"))}</th><th>${escapeHtml(L("最低分", "Min score"))}</th><th>${escapeHtml(L("最低位次", "Min rank"))}</th><th>${escapeHtml(L("招生计划", "Plan"))}</th></tr>
        </thead>
        <tbody>
          ${entry.history.map((row) => `
            <tr>
              <td>${row.year}</td>
              <td>${formatNullable(row.minScore, "分")}</td>
              <td>${formatRank(row.minRank)}</td>
              <td>${row.planCount == null ? gkTbd() : `${row.planCount}${gkUnit(" 人")}`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function makeGaokaoTrendJudgement(entry) {
  const lastThree = entry.history.filter((row) => Number.isFinite(row.minRank)).slice(-3);
  const ranks = lastThree.map((row) => row.minRank);
  const rankUp = ranks.length === 3 && ranks[2] < ranks[1] && ranks[1] < ranks[0];
  const rankDown = ranks.length === 3 && ranks[2] > ranks[1] && ranks[1] > ranks[0];
  const change = entry.prediction.changeFromLastYear;

  if (rankUp && change > 0) {
    return L(
      "该校近三年录取位次整体上移，预测分数线可能小幅上涨，建议结合位次和专业组热度判断。",
      "Admission ranks have risen over the past three years, so the predicted score line may edge up. Weigh the rank trend and how competitive each major group is."
    );
  }

  if (rankDown && change < 0) {
    return L(
      "该校近三年录取位次有所下移，预测门槛可能小幅回落，但仍需核对当年招生计划变化。",
      "Admission ranks have eased over the past three years, so the predicted threshold may dip slightly, but still check this year's enrollment-plan changes."
    );
  }

  return L(
    "该校近年最低分和最低位次存在波动，建议优先看位次区间，并结合专业组、招生计划和院校热度综合判断。",
    "Minimum scores and ranks have fluctuated in recent years. Prioritize the rank range, and weigh major groups, enrollment plans and overall demand together."
  );
}

function renderScoreReleaseModule(releaseData, state, refs) {
  if (!refs.releaseModule) {
    return;
  }

  const list = releaseData?.provinces || [];
  const current = list.find((item) => item.province === state.province);
  const highlights = [current, ...list.filter((item) => item.province !== state.province).slice(0, 6)].filter(Boolean);

  if (!highlights.length) {
    refs.releaseModule.innerHTML = renderGaokaoEmptyState("暂无分数公布时间数据", "可在 gaokao-score-release-data.js 中补充分省发布时间。");
    return;
  }

  refs.releaseModule.innerHTML = `
    <div class="gaokao-release-current">
      <span>${escapeHtml(state.province || "当前省份")}</span>
      <strong>${escapeHtml(current?.dateText || "待补充")}</strong>
      <p>${escapeHtml(current?.note || releaseData?.disclaimer || "具体时间以各省教育考试院官方通知为准。")}</p>
    </div>
    <div class="gaokao-release-list">
      ${highlights.map((item) => `
        <div class="${item.province === state.province ? "is-current" : ""}">
          <span>${escapeHtml(item.province)}</span>
          <strong>${escapeHtml(item.dateText)}</strong>
          <em>${escapeHtml(item.status)}</em>
        </div>
      `).join("")}
    </div>
    <p class="gaokao-release-note">${escapeHtml(releaseData?.disclaimer || "具体时间以各省教育考试院官方通知为准。")}</p>
  `;
}

function renderSparkline(values, type) {
  const cleaned = values.filter(Number.isFinite);

  if (cleaned.length < 2) {
    return `<div class="gaokao-sparkline-empty">${escapeHtml(L("数据待补充", "Data TBD"))}</div>`;
  }

  const width = 148;
  const height = 44;
  const pad = 5;
  const min = Math.min(...cleaned);
  const max = Math.max(...cleaned);
  const range = max - min || 1;
  const points = cleaned.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / (cleaned.length - 1);
    const normalized = type === "rank" ? (max - value) / range : (value - min) / range;
    const y = height - pad - normalized * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return `
    <svg class="gaokao-sparkline ${type}" viewBox="0 0 ${width} ${height}" aria-hidden="true">
      <polyline points="${points}"></polyline>
      ${points.split(" ").map((point) => {
        const [x, y] = point.split(",");
        return `<circle cx="${x}" cy="${y}" r="2.7"></circle>`;
      }).join("")}
    </svg>
  `;
}

function renderDetailLineChart(values, labels, type, forecast = null) {
  const yearLabels = labels.map((label) => Number(label));
  const historicalPoints = values.map((value, index) => ({
    value: nullableNumber(value),
    label: labels[index],
    index
  })).filter((point) => Number.isFinite(point.value));
  const forecastValue = nullableNumber(forecast?.value);
  const hasForecast = Number.isFinite(forecastValue);
  const shouldReserveForecastYear = Boolean(forecast && (hasForecast || forecast.reserveYear));
  const allValues = [
    ...historicalPoints.map((point) => point.value),
    ...(hasForecast ? [forecastValue] : [])
  ];

  if (!allValues.length) {
    return `<div class="gaokao-chart-empty">${escapeHtml(L("趋势数据待补充", "Trend data TBD"))}</div>`;
  }

  const width = 560;
  const height = 230;
  const pad = { left: 56, right: 18, top: 24, bottom: 40 };
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const chartLabels = shouldReserveForecastYear ? [...labels, forecast.year || 2026] : labels;
  const forecastIndex = chartLabels.length - 1;
  const denominator = Math.max(1, chartLabels.length - 1);
  const xFor = (index) => pad.left + (index * (width - pad.left - pad.right)) / denominator;
  const yFor = (value) => {
    const normalized = type === "rank" ? (max - value) / range : (value - min) / range;
    return height - pad.bottom - normalized * (height - pad.top - pad.bottom);
  };
  const points = historicalPoints.map((point) => `${xFor(point.index)},${yFor(point.value)}`).join(" ");
  const latestHistoricalPoint = historicalPoints[historicalPoints.length - 1] || null;
  const forecastBridge = latestHistoricalPoint && hasForecast
    ? `${xFor(latestHistoricalPoint.index)},${yFor(latestHistoricalPoint.value)} ${xFor(forecastIndex)},${yFor(forecastValue)}`
    : "";
  const ticks = [min, Math.round((min + max) / 2), max];
  const titleSeparator = getLang() === "en" ? ": " : "：";

  return `
    <svg class="gaokao-detail-chart ${type}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${type === "rank" ? L("最低位次趋势", "Minimum rank trend") : L("最低分趋势", "Minimum score trend")}">
      <g class="chart-grid">
        ${ticks.map((tick) => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${yFor(tick)}" y2="${yFor(tick)}"></line><text x="12" y="${yFor(tick) + 4}">${type === "rank" ? formatNumber(tick) : tick}</text>`).join("")}
      </g>
      ${historicalPoints.length >= 2 ? `<polyline points="${points}"></polyline>` : ""}
      ${forecastBridge ? `<polyline class="forecast-bridge" points="${forecastBridge}"></polyline>` : ""}
      ${historicalPoints.map((point) => `<circle cx="${xFor(point.index)}" cy="${yFor(point.value)}" r="4"><title>${point.label}${titleSeparator}${type === "rank" ? formatRank(point.value) : formatNullable(point.value, "分")}</title></circle>`).join("")}
      ${hasForecast ? `<circle class="forecast-point" cx="${xFor(forecastIndex)}" cy="${yFor(forecastValue)}" r="5"><title>${forecast.year || 2026}${titleSeparator}${type === "rank" ? formatRank(forecastValue) : formatNullable(forecastValue, "分")}</title></circle>` : ""}
      <g class="chart-axis">
        ${chartLabels.map((label, index) => `<text class="${index === forecastIndex && hasForecast ? "forecast-label" : ""}" x="${xFor(index)}" y="${height - 12}">${label}</text>`).join("")}
      </g>
    </svg>
    <div class="gaokao-chart-legend">
      <span class="history">${escapeHtml(L("2021-2025 往年", "2021-2025 historical"))}</span>
      ${hasForecast ? `<span class="forecast">${escapeHtml(L("2026 预测", "2026 forecast"))}</span>` : ""}
    </div>
  `;
}

function renderGaokaoEmptyState(title, text) {
  return `
    <div class="gaokao-empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

function getLatestHistory(entry) {
  return [...entry.history].reverse().find((row) => Number.isFinite(row.minScore) || Number.isFinite(row.minRank)) || null;
}

function parseGaokaoInputNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function formatNumber(value) {
  const number = nullableNumber(value);

  if (!Number.isFinite(number)) {
    return gkTbd();
  }

  const locale = getLang() === "en" ? "en-US" : "zh-CN";
  return new Intl.NumberFormat(locale).format(Math.round(number));
}

function formatRank(value) {
  if (!Number.isFinite(Number(value))) {
    return gkTbd();
  }

  return `${formatNumber(value)}${gkUnit(" 名")}`;
}

function formatNullable(value, unit = "") {
  const number = nullableNumber(value);

  if (!Number.isFinite(number)) {
    return gkTbd();
  }

  return `${Math.round(number)}${gkUnit(unit)}`;
}

function formatSigned(value, digits = 0) {
  const number = nullableNumber(value);

  if (!Number.isFinite(number)) {
    return gkTbd();
  }

  const fixed = digits > 0 ? number.toFixed(digits) : Math.round(number);
  return number > 0 ? `+${fixed}` : `${fixed}`;
}

function formatRange(range, unit = "") {
  if (!Array.isArray(range) || range.length < 2) {
    return gkTbd();
  }

  const low = nullableNumber(range[0]);
  const high = nullableNumber(range[1]);

  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    return gkTbd();
  }

  return `${Math.round(low)}-${Math.round(high)}${gkUnit(unit)}`;
}

function formatRankRange(range) {
  if (!Array.isArray(range) || range.length < 2) {
    return gkTbd();
  }

  const low = nullableNumber(range[0]);
  const high = nullableNumber(range[1]);

  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    return gkTbd();
  }

  return `${formatNumber(low)}-${formatNumber(high)}${gkUnit(" 名")}`;
}

function formatMinMax(values, unit = "", rankMode = false) {
  const cleaned = values.map((value) => nullableNumber(value)).filter((value) => Number.isFinite(value));

  if (!cleaned.length) {
    return gkTbd();
  }

  const min = Math.min(...cleaned);
  const max = Math.max(...cleaned);

  if (rankMode) {
    return `${formatNumber(min)}-${formatNumber(max)}${gkUnit(unit)}`;
  }

  return `${Math.round(min)}-${Math.round(max)}${gkUnit(unit)}`;
}

function formatConfidence(confidence) {
  const map = getLang() === "en"
    ? { high: "High", medium: "Medium", low: "Low" }
    : { high: "高", medium: "中", low: "低" };

  return map[String(confidence).toLowerCase()] || (getLang() === "en" ? "TBD" : "待判断");
}

function initGaokaoMaps(history, prediction) {
  const combinedMap = document.querySelector("[data-gaokao-combined-map]");
  const historyMap = document.querySelector('[data-map-type="history"]');
  const predictionMap = document.querySelector('[data-map-type="prediction"]');

  if (combinedMap) {
    setupCombinedGaokaoMap(combinedMap, history, prediction);
  } else {
    if (historyMap) {
      renderChinaMap(historyMap, history.universities, "history");
    }

    if (predictionMap) {
      renderChinaMap(predictionMap, prediction.universities, "prediction");
    }
  }

  document.querySelectorAll("[data-close-modal]").forEach((node) => {
    node.addEventListener("click", closeMapModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMapModal();
    }
  });
}

function setupCombinedGaokaoMap(target, history, prediction) {
  const toggles = document.querySelectorAll("[data-gaokao-map-toggle]");
  const titleNode = document.querySelector("[data-gaokao-map-title]");
  const kickerNode = document.querySelector("[data-gaokao-map-kicker]");
  const descriptionNode = document.querySelector("[data-gaokao-map-description]");
  const viewCopy = {
    history: {
      kicker: "ADMISSION TREND",
      title: "近五年分数线",
      description: "点击地图中的高校点位，查看该校近五年在各省份的录取分数线变化。",
      universities: history.universities
    },
    prediction: {
      kicker: "ADMISSION TREND",
      title: "预测分数线",
      description: "点击地图中的高校点位，查看模型对该校各省份录取分数线的预测结果。",
      universities: prediction.universities
    }
  };

  const setView = (view) => {
    const nextView = viewCopy[view] ? view : "history";

    if (kickerNode) {
      kickerNode.textContent = viewCopy[nextView].kicker;
    }

    if (titleNode) {
      titleNode.textContent = viewCopy[nextView].title;
    }

    if (descriptionNode) {
      descriptionNode.textContent = viewCopy[nextView].description;
    }

    toggles.forEach((toggle) => {
      const isActive = toggle.dataset.mapView === nextView;
      toggle.classList.toggle("is-active", isActive);
      toggle.setAttribute("aria-pressed", String(isActive));
    });

    renderChinaMap(target, viewCopy[nextView].universities, nextView);
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => setView(toggle.dataset.mapView));
  });

  setView("history");
}

function renderChinaMap(target, universities, type) {
  const sourceHeight = Number(target.dataset.mapSourceHeight) || 0;
  const cropHeight = Number(target.dataset.mapCropHeight) || 0;
  const yScale = sourceHeight > 0 && cropHeight > 0 ? sourceHeight / cropHeight : 1;

  target.innerHTML = `
    <img class="china-map-bg standard-map-image" src="china-standard-map.svg" alt="中华人民共和国标准地图（含台湾省）">
  `;

  universities
    .filter((school) => {
      const point = resolveGaokaoMapPoint(school);
      return point && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y));
    })
    .forEach((school) => {
    const mapPoint = resolveGaokaoMapPoint(school);
    const markerY = Math.max(0, Math.min(100, Number(mapPoint.y) * yScale));
    const button = document.createElement("button");
    button.type = "button";
    button.className = `university-marker ${type}`;
    button.style.left = `${mapPoint.x}%`;
    button.style.top = `${markerY}%`;
    button.dataset.schoolId = school.id;
    button.dataset.type = type;
    button.title = `${school.name} · ${school.city}`;
    button.setAttribute("aria-label", `${school.name}，${school.city}`);
    button.innerHTML = `<span aria-hidden="true"></span><strong>${school.name}</strong>`;
    button.addEventListener("click", () => openSchoolModal(type, school.id));
    target.appendChild(button);
  });
}

function openSchoolModal(type, schoolId) {
  const data = type === "history" ? historyData : predictionData;
  const school = data.universities.find((item) => item.id === schoolId);

  if (!school) {
    return;
  }

  const titleNode = mapModal.querySelector("[data-modal-title]");
  const subtitleNode = mapModal.querySelector("[data-modal-subtitle]");
  const badgeNode = mapModal.querySelector("[data-modal-badge]");
  const kickerNode = mapModal.querySelector("[data-modal-kicker]");
  const chartWrap = mapModal.querySelector("[data-chart-wrap]");
  const tableWrap = mapModal.querySelector("[data-modal-table]");

  titleNode.textContent = school.name;
  subtitleNode.textContent = `${school.tier} · ${school.province} · ${school.city}${school.campus ? ` · ${school.campus}` : ""}`;
  badgeNode.textContent = type === "history" ? "近五年分数线" : `${data.targetYear} 预测分数线`;
  kickerNode.textContent = "ADMISSION TREND";

  if (type === "history") {
    chartWrap.innerHTML = renderHistoryChart(data.years, school.scores);
    tableWrap.innerHTML = renderHistoryTable(data.years, school.scores);
  } else {
    chartWrap.innerHTML = renderPredictionChart(data.targetYear, school.predictions);
    tableWrap.innerHTML = renderPredictionTable(data.targetYear, school.predictions);
  }

  mapModal.classList.add("is-open");
  mapModal.setAttribute("aria-hidden", "false");
}

function closeMapModal() {
  if (!mapModal) {
    return;
  }

  mapModal.classList.remove("is-open");
  mapModal.setAttribute("aria-hidden", "true");
}

function renderHistoryChart(years, scoresByProvince) {
  const entries = Object.entries(scoresByProvince);
  const values = entries.flatMap(([, scores]) => scores);
  const min = Math.floor((Math.min(...values) - 6) / 5) * 5;
  const max = Math.ceil((Math.max(...values) + 6) / 5) * 5;
  const colors = ["#8a653e", "#f4a261", "#846afd", "#2f80ed", "#16a34a"];
  const width = 760;
  const height = 320;
  const pad = { left: 54, right: 24, top: 24, bottom: 44 };

  const xFor = (index) => pad.left + (index * (width - pad.left - pad.right)) / (years.length - 1);
  const yFor = (score) => pad.top + ((max - score) * (height - pad.top - pad.bottom)) / (max - min);

  const grid = [min, Math.round((min + max) / 2), max]
    .map((tick) => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${yFor(tick)}" y2="${yFor(tick)}"></line><text x="12" y="${yFor(tick) + 4}">${tick}</text>`)
    .join("");

  const lines = entries.map(([province, scores], index) => {
    const points = scores.map((score, scoreIndex) => `${xFor(scoreIndex)},${yFor(score)}`).join(" ");
    const dots = scores.map((score, scoreIndex) => `<circle cx="${xFor(scoreIndex)}" cy="${yFor(score)}" r="4"></circle>`).join("");
    return `<g class="chart-series" style="--series-color:${colors[index % colors.length]}"><polyline points="${points}"></polyline>${dots}<title>${province}</title></g>`;
  }).join("");

  const labels = years.map((year, index) => `<text class="x-label" x="${xFor(index)}" y="${height - 12}">${year}</text>`).join("");
  const legend = entries.map(([province], index) => `<span style="--series-color:${colors[index % colors.length]}">${province}</span>`).join("");

  return `
    <svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="近五年录取分数线折线图">
      <g class="chart-grid">${grid}</g>
      <g class="chart-lines">${lines}</g>
      <g class="chart-axis">${labels}</g>
    </svg>
    <div class="chart-legend">${legend}</div>
  `;
}

function renderPredictionChart(targetYear, predictions) {
  const entries = Object.entries(predictions);
  const values = entries.flatMap(([, result]) => [result.low, result.score, result.high]);
  const min = Math.floor((Math.min(...values) - 6) / 5) * 5;
  const max = Math.ceil((Math.max(...values) + 6) / 5) * 5;
  const width = 760;
  const height = 320;
  const pad = { left: 54, right: 24, top: 24, bottom: 54 };
  const barGap = (width - pad.left - pad.right) / entries.length;
  const yFor = (score) => pad.top + ((max - score) * (height - pad.top - pad.bottom)) / (max - min);

  const grid = [min, Math.round((min + max) / 2), max]
    .map((tick) => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${yFor(tick)}" y2="${yFor(tick)}"></line><text x="12" y="${yFor(tick) + 4}">${tick}</text>`)
    .join("");

  const bars = entries.map(([province, result], index) => {
    const x = pad.left + index * barGap + barGap / 2;
    const lowY = yFor(result.low);
    const highY = yFor(result.high);
    const scoreY = yFor(result.score);
    return `
      <g class="prediction-point">
        <line x1="${x}" x2="${x}" y1="${highY}" y2="${lowY}"></line>
        <circle cx="${x}" cy="${scoreY}" r="7"></circle>
        <text class="score-label" x="${x}" y="${scoreY - 12}">${result.score}</text>
        <text class="x-label" x="${x}" y="${height - 18}">${province}</text>
      </g>
    `;
  }).join("");

  return `
    <svg class="line-chart prediction-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${targetYear} 年预测分数线图">
      <g class="chart-grid">${grid}</g>
      <g class="chart-lines">${bars}</g>
    </svg>
    <div class="chart-legend"><span>${targetYear} 预测分</span><span>竖线为预测区间</span></div>
  `;
}

function renderHistoryTable(years, scoresByProvince) {
  const head = years.map((year) => `<th>${year}</th>`).join("");
  const rows = Object.entries(scoresByProvince).map(([province, scores]) => (
    `<tr><td>${province}</td>${scores.map((score) => `<td>${score}</td>`).join("")}</tr>`
  )).join("");

  return `
    <table class="modal-data-table">
      <thead><tr><th>生源省份</th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderPredictionTable(targetYear, predictions) {
  const rows = Object.entries(predictions).map(([province, result]) => (
    `<tr><td>${province}</td><td>${result.score}</td><td>${result.low} - ${result.high}</td><td>${result.confidence}</td></tr>`
  )).join("");

  return `
    <table class="modal-data-table">
      <thead><tr><th>生源省份</th><th>${targetYear} 预测分</th><th>预测区间</th><th>置信度</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// Initialized after the Gaokao i18n dictionaries above are evaluated, so the
// prediction page renders in the active language on first paint.
if (document.querySelector("[data-gaokao-prediction-page]")) {
  initGaokaoPredictionPage({
    admissionData: admissionPredictionData,
    meta: admissionPredictionMeta,
    releaseData: scoreReleaseData,
    historyData,
    predictionData
  });
}
