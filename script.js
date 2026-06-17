const yearNodes = document.querySelectorAll("[data-year]");

yearNodes.forEach((node) => {
  node.textContent = new Date().getFullYear();
});

initSharedNavigation();
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
const worldCupTeams = window.WORLD_CUP_TEAMS;
const worldCupGroups = window.WORLD_CUP_GROUPS;
const worldCupRouteData = window.WORLD_CUP_ROUTE_DATA;
const worldCupRouteRounds = window.WORLD_CUP_ROUTE_ROUNDS;
const worldCupLatestMatchIds = window.WORLD_CUP_LATEST_MATCH_IDS;
const worldCupPredictionReports = window.WORLD_CUP_PREDICTION_REPORTS;
let currentWorldCupTournamentPredictions = worldCupTournamentPredictionSpecs;
let currentWorldCupMatches = worldCupMatches || [];

if (historyData && predictionData && mapModal) {
  initGaokaoMaps(historyData, predictionData);
}

if (document.querySelector("[data-gaokao-prediction-page]")) {
  initGaokaoPredictionPage({
    admissionData: admissionPredictionData,
    meta: admissionPredictionMeta,
    releaseData: scoreReleaseData,
    historyData,
    predictionData
  });
}

if (worldCupMatches && worldCupTournamentPredictions) {
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
    { id: "home", label: "首页", href: "index.html" },
    { id: "worldcup", label: "世界杯", href: "worldcup.html" },
    { id: "gaokao", label: "高考", href: "gaokao.html" },
    { id: "about", label: "About Us", href: "about.html" },
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
      <a${item.id === activePage ? ' class="is-active"' : ""} href="${item.href}">${item.label}</a>
    `).join("");

    mount.classList.add("site-header", "home-nav-shell");
    mount.classList.add(`site-header--${navVariant}`);
    mount.innerHTML = `
      <nav class="nav home-nav" aria-label="Primary navigation">
        <a class="brand home-brand" href="index.html" aria-label="wowcai 首页">
          <img class="site-logo" src="Logo.png" alt="wowcai">
        </a>
        <div class="nav-links home-nav-links" aria-label="Main pages">
          ${links}
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
      <div><strong>${matches.length}</strong><span>总赛程</span></div>
      <div><strong>${predictedMatches.length}</strong><span>已预测</span></div>
      <div><strong>${finishedMatches.length}</strong><span>已结束</span></div>
    `;
  }

  if (routeMap && (worldCupRouteData || worldCupRouteRounds) && worldCupTeams) {
    routeMap.innerHTML = renderTournamentRouteMap(worldCupRouteData || worldCupRouteRounds, matches);
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
    const markdownFiles = await discoverTournamentEvidenceFiles();
    const versions = await Promise.all(markdownFiles.map(async (fileName) => {
      const markdown = await fetchTextFile(`${worldCupTournamentEvidenceDir}/${encodeURIComponent(fileName)}`);
      return parseTournamentEvidenceMarkdown(markdown, fileName);
    }));
    const predictions = buildTournamentPredictionsFromEvidence(predictionSpecs, versions.filter(Boolean));

    window.WORLD_CUP_TOURNAMENT_PREDICTIONS = predictions;
    currentWorldCupTournamentPredictions = predictions;
    renderTournamentSummaryMount(summaryPanel, predictions);
  } catch (error) {
    console.warn("Failed to load tournament prediction evidence files.", error);
    const fallback = buildTournamentPredictionsFromEvidence(predictionSpecs, []);
    window.WORLD_CUP_TOURNAMENT_PREDICTIONS = fallback;
    currentWorldCupTournamentPredictions = fallback;
    renderTournamentSummaryMount(summaryPanel, fallback);
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
    sections
  };
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
        fileName: version.fileName,
        predictedValue: section?.predictedValue || "待预测",
        evidence: section?.evidence || [],
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

function compareTournamentEvidenceFiles(a, b) {
  return String(a || "").localeCompare(String(b || ""), "zh-CN", { numeric: true });
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
    const sortedMatches = [...loadedMatches].sort((a, b) => compareGamePredictionMatchTime(a, b));
    latestMatches.innerHTML = renderLatestMatchPredictions(sortedMatches.slice(0, 4));
    if (routeMap && (worldCupRouteData || worldCupRouteRounds) && worldCupTeams) {
      routeMap.innerHTML = renderTournamentRouteMap(worldCupRouteData || worldCupRouteRounds, merged);
    }
    if (matchSummary) {
      const predictedMatches = merged.filter((match) => match.predictionStatus === "predicted");
      const finishedMatches = merged.filter((match) => match.matchStatus === "finished");
      matchSummary.innerHTML = `
        <div><strong>${merged.length}</strong><span>总赛程</span></div>
        <div><strong>${predictedMatches.length}</strong><span>已预测</span></div>
        <div><strong>${finishedMatches.length}</strong><span>已结束</span></div>
      `;
    }
    latestMatches.querySelectorAll("[data-open-match-modal]").forEach((button) => {
      button.addEventListener("click", () => openMatchPredictionModal(button.dataset.matchId));
    });
  } catch (error) {
    console.warn("Failed to load game prediction folders.", error);
  }
}

async function discoverGamePredictionSpecs() {
  const discovered = await discoverGamePredictionFolders();

  if (discovered.length) {
    return discovered;
  }

  return normalizeGamePredictionManifest(worldCupGamePredictionManifest);
}

async function discoverGamePredictionFolders() {
  try {
    const indexHtml = await fetchTextFile(`${worldCupGamePredictionDir}/`);
    const folders = extractDirectoryLinks(indexHtml)
      .filter((folder) => folder && !folder.startsWith("."))
      .slice(0, 4);
    const specs = [];

    for (const matchFolder of folders) {
      const versionHtml = await fetchTextFile(`${worldCupGamePredictionDir}/${encodeURIComponent(matchFolder)}/`);
      const versions = extractDirectoryLinks(versionHtml)
        .filter((folder) => /^\d{4}\.\d{1,2}\.\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(folder))
        .sort(compareGamePredictionVersions);

      specs.push({ matchFolder, versions });
    }

    return specs.filter((spec) => spec.versions.length);
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

function normalizeGamePredictionManifest(manifest) {
  return (manifest || [])
    .map((entry) => {
      if (typeof entry === "string") {
        return { matchFolder: entry, versions: [] };
      }

      return {
        matchFolder: entry.matchFolder || entry.folder || "",
        versions: Array.isArray(entry.versions) ? entry.versions : []
      };
    })
    .filter((entry) => entry.matchFolder && entry.versions.length)
    .slice(0, 4);
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
  const predictionSummary = buildGamePredictionSummary(latest, inferred.homeName, inferred.awayName);
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
    venue: latest.brief?.match?.venue || baseMatch?.venue || "场馆待定",
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
      summary: buildGamePredictionSummary(version, inferred.homeName, inferred.awayName)
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
    key_factors: extractMarkdownSectionBullets(markdown, "关键因素").map((text) => ({ text_cn: text }))
  };
}

function normalizeGamePredictionKeyFactors(briefJson, markdown) {
  const markdownFactors = extractMarkdownSectionBullets(markdown, "关键因素");

  if (markdownFactors.length) {
    return markdownFactors;
  }

  const jsonFactors = (briefJson?.key_factors || [])
    .map((item) => typeof item === "string" ? item : item.text_cn)
    .filter(Boolean);

  return jsonFactors;
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
      : jsonBrief.key_factors
  };
}

function hasProbabilityValues(values) {
  return Boolean(values && Object.values(values).some((value) => Number.isFinite(Number(value))));
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
    axis_note_cn: `纵轴为${axisTeams[0] || "主队"}进球数，横轴为${axisTeams[1] || "客队"}进球数；5+ 表示至少 5 球。`
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
  const folderNames = String(matchFolder || "").split("_vs_");

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
  return String(value || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "");
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

function buildGamePredictionSummary(version, homeName, awayName) {
  const outcome = version?.brief?.most_likely_outcome;
  const topScore = version?.brief?.top_scores?.[0];

  if (outcome && topScore) {
    return `最可能赛果为 ${outcome.label}，最高概率比分为 ${topScore.score}。`;
  }

  if (outcome) {
    return `最可能赛果为 ${outcome.label}。`;
  }

  return `${homeName} vs ${awayName} 的预测数据已更新。`;
}

function formatOutcomeReference(version, homeTeam, awayTeam) {
  const probabilities = normalizeWinDrawLossProbabilities(version, homeTeam, awayTeam);
  const top = probabilities.slice().sort((a, b) => b.value - a.value)[0];

  return top ? `${top.label} ${formatProbabilityValue(top.value)}` : "待预测";
}

function getLatestWorldCupMatches(matches) {
  const idSet = new Set(worldCupLatestMatchIds || []);
  const selected = matches.filter((match) => idSet.has(match.id));

  if (selected.length) {
    return selected.sort((a, b) => (worldCupLatestMatchIds || []).indexOf(a.id) - (worldCupLatestMatchIds || []).indexOf(b.id));
  }

  return matches.filter((match) => match.predictionStatus === "predicted").slice(0, 4);
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
        <span>小组赛</span>
        <strong>小组前二 + 8 个最佳第三名晋级</strong>
        <span>淘汰赛</span>
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
      <strong>赛制说明</strong>
      <span>48 支球队 · 12 个小组 · 小组前二 + 8 个最佳第三名 → 32 强淘汰赛</span>
      <small>小组赛阶段共 72 场，淘汰赛从 32 强开始，冠军球队最多进行 8 场比赛。</small>
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
          <h3>小组赛概览</h3>
          <p>展示 12 个小组的比赛队伍、时间与结果，用于说明 32 强席位来源；不代表淘汰赛晋级已经确定。</p>
        </div>
        <p>未开赛比赛显示“未开赛”。</p>
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
        <strong>${group.nameZh || group.name}</strong>
        <span>${group.name}</span>
      </div>
      <ul class="group-team-list">
        ${(group.teams || []).map((teamId) => renderGroupTeamRow(teamId)).join("")}
      </ul>
      <div class="group-result-list">
        <strong>赛程 / 赛果</strong>
        ${groupMatches.length
          ? groupMatches.map((match) => renderGroupResultLine(match)).join("")
          : `<span class="group-result-empty">暂无比赛数据</span>`}
      </div>
    </article>
  `;
}

function renderGroupTeamRow(teamId) {
  const team = getWorldCupTeam(teamId);

  return `
    <li>
      ${renderTeamFlag(team, "group-flag")}
      <span>${team ? team.nameZh : teamId}</span>
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
  const resultText = getRouteMatchResultText(match);

  return `
    <span class="group-result-line">
      <em>${match.matchNo}</em>
      <b>${formatTeamName(homeTeam, match.homeTeam)} vs ${formatTeamName(awayTeam, match.awayTeam)}</b>
      <small>${formatMatchField(match.matchTime, "time")}</small>
      <strong>${resultText}</strong>
    </span>
  `;
}

function renderLegacyTournamentRouteMap(rounds, matches = worldCupMatches || []) {
  return `
    <div class="route-map legacy-route-map">
      ${rounds.map((round, index) => `
        <section class="route-round-column" style="--round-index:${index}">
          <div class="route-round-head">
            <span>${round.labelEn || round.name}</span>
            <h3>${round.label || round.nameZh || round.name}</h3>
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
            <h3>${round.nameZh}</h3>
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
          <h3>决赛</h3>
        </div>
        <div class="final-team-list">
          ${(finalData.teams || []).map((node) => renderRouteNode({ ...node, matchNo: finalData.matchNo }, "center", matches)).join("")}
        </div>
      </div>
      <div class="champion-connector" aria-hidden="true"></div>
      <div class="champion-node-wrap">
        <div class="route-round-head champion-head">
          <span>CHAMPION</span>
          <h3>冠军</h3>
        </div>
        ${renderRouteNode(championNode, "center", matches)}
      </div>
    </section>
  `;
}

function renderRouteNode(node, side = "", matches = worldCupMatches || []) {
  const team = getWorldCupTeam(node.teamId);
  const match = findWorldCupMatchByNo(node.matchNo || node.matchId, matches);
  const statusText = {
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
  const nodeLabel = team ? team.nameZh : (node.slotLabel || "待定");
  const stateLabel = team ? statusText : (node.descriptionZh || node.sourceLabel || statusText);
  const metaLabel = team
    ? (node.sourceLabel || node.matchNo || node.matchId || "")
    : (node.matchNo || node.matchId || "");
  const teamsText = getRouteMatchTeamsText(match, node);
  const timeText = match ? formatMatchField(match.matchTime, "time") : "时间待定";
  const resultText = getRouteMatchResultText(match);

  return `
    <article class="team-route-card ${node.status} ${side}">
      ${team ? renderTeamFlag(team, "route-flag") : `<span class="slot-type-badge">${isSourceSlot ? "席位来源" : "待定席位"}</span>`}
      <strong>${nodeLabel}</strong>
      <span>${stateLabel}</span>
      ${metaLabel ? `<small class="route-match-badge">${metaLabel}</small>` : ""}
      <div class="route-match-info">
        <span class="route-match-teams">${teamsText}</span>
        <time>${timeText}</time>
        <strong class="route-match-result">${resultText}</strong>
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
    const homeTeam = getWorldCupTeam(match.homeTeamId);
    const awayTeam = getWorldCupTeam(match.awayTeamId);
    const homeName = formatTeamName(homeTeam, match.homeTeam);
    const awayName = formatTeamName(awayTeam, match.awayTeam);

    if (homeName !== "对阵待定" || awayName !== "对阵待定") {
      return `${homeName} vs ${awayName}`;
    }
  }

  return node?.descriptionZh || node?.slotLabel || "对阵待定";
}

function getRouteMatchResultText(match) {
  if (!match || match.matchStatus !== "finished") {
    return "未开赛";
  }

  if (match.actualResult && match.actualResult !== "待赛果") {
    return formatMatchField(match.actualResult, "actual");
  }

  if (match.actualScore) {
    const homeTeam = getWorldCupTeam(match.homeTeamId);
    const awayTeam = getWorldCupTeam(match.awayTeamId);
    return `${formatTeamName(homeTeam, match.homeTeam)} ${match.actualScore} ${formatTeamName(awayTeam, match.awayTeam)}`;
  }

  return "已结束";
}

function renderLatestMatchPredictions(matches) {
  return matches.map((match) => {
    const homeTeam = getWorldCupTeam(match.homeTeamId);
    const awayTeam = getWorldCupTeam(match.awayTeamId);
    const statusLabel = match.predictionStatus === "predicted" ? "已预测" : "待预测";
    const score = match.predictedScore || "待预测";
    const reference = match.winReference || "待预测";
    const stageText = [match.stage, match.group, match.round].filter(Boolean).join(" · ");

    return `
      <button class="latest-match-card" type="button" data-open-match-modal data-match-id="${match.id}" aria-label="查看 ${formatTeamName(homeTeam, match.homeTeam)} 对 ${formatTeamName(awayTeam, match.awayTeam)} 的预测详情">
        <span class="latest-match-status ${match.predictionStatus}">${statusLabel}</span>
        <div class="latest-match-meta">
          <span>比赛阶段</span>
          <strong>${stageText}</strong>
        </div>
        <div class="latest-teams">
          ${renderLatestTeam(homeTeam, match.homeTeam)}
          <span class="versus">VS</span>
          ${renderLatestTeam(awayTeam, match.awayTeam)}
        </div>
        <div class="latest-match-details">
          <div><span>比赛时间</span><strong>${formatMatchField(match.matchTime, "time")}</strong></div>
          <div><span>比赛场馆</span><strong>${formatMatchField(match.venue, "venue")}</strong></div>
          <div><span>预测比分</span><strong>${score}</strong></div>
          <div><span>胜率参考</span><strong>${reference}</strong></div>
        </div>
        <p>${match.predictionSummary || "预测报告待补充。"}</p>
      </button>
    `;
  }).join("");
}

function renderLatestTeam(team, fallbackName) {
  return `
    <div class="latest-team">
      ${renderTeamFlag(team, "match-flag")}
      <strong>${formatTeamName(team, fallbackName)}</strong>
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
            <h3>${stage}</h3>
            <span>${stageMatches.length} 场比赛</span>
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

  return `
    <article class="schedule-record-card">
      <div class="schedule-match-no">
        <span>${match.matchNo || match.id}</span>
        <strong>${match.group ? `${match.group} · ${match.round}` : match.round}</strong>
      </div>
      <div class="schedule-teams">
        ${renderTinyTeam(homeTeam, match.homeTeam)}
        <span>vs</span>
        ${renderTinyTeam(awayTeam, match.awayTeam)}
      </div>
      <div class="schedule-detail"><span>时间</span><strong>${formatMatchField(match.matchTime, "time")}</strong></div>
      <div class="schedule-detail"><span>球场</span><strong>${formatMatchField(match.venue, "venue")}</strong></div>
      <div class="schedule-detail"><span>实际比分</span><strong>${formatMatchField(match.actualScore || match.actualResult, "actual")}</strong></div>
      <div class="schedule-detail"><span>预测比分</span><strong>${predictionScore}</strong></div>
      <div class="schedule-badges">
        <span class="schedule-status ${match.matchStatus}">${statusText}</span>
        <span class="schedule-hit ${getStatusClassName(hitStatus)}">${hitStatus}</span>
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
  return `
    <span class="tiny-team">
      ${renderTeamFlag(team, "tiny-flag")}
      <strong>${formatTeamName(team, fallbackName)}</strong>
    </span>
  `;
}

function renderWorldCupSummaryPanel(predictions) {
  const preferredNames = ["冠军预测", "亚军预测", "金球奖预测", "金靴奖预测", "金手套奖预测"];
  const selected = preferredNames
    .map((name) => predictions.find((item) => item.predictionName === name))
    .filter(Boolean);

  return selected.map((item) => `
    <button class="summary-card" type="button" data-open-tournament-modal data-prediction-id="${item.id}" aria-label="查看${item.predictionName}详情">
      <span>${item.type}</span>
      <h3>${item.predictionName}</h3>
      <strong>${item.predictedValue}</strong>
      <em>${item.updatedAt || "长期预测"}</em>
      <p>${renderSummaryEvidencePreview(item.evidence)}</p>
    </button>
  `).join("");
}

function renderWorldCupSummaryLoading() {
  return `
    <div class="summary-empty-state">
      <strong>正在更新长期预测</strong>
      <p>请稍候，系统正在整理最新预测结果。</p>
    </div>
  `;
}

function renderSummaryEvidencePreview(evidence) {
  const firstEvidence = Array.isArray(evidence) ? evidence[0] : "";
  return firstEvidence || "证据链条待补充。";
}

function getWorldCupTeam(teamId) {
  return worldCupTeams && teamId ? worldCupTeams[teamId] : null;
}

function formatTeamName(team, fallbackName) {
  return team ? team.nameZh : formatMatchField(fallbackName || "", "team");
}

function renderTeamFlag(team, className) {
  if (!team) {
    return `<span class="${className} flag-fallback" aria-hidden="true">?</span>`;
  }

  const inlineFlags = window.WORLD_CUP_FLAGS || {};
  const src = inlineFlags[team.nameZh];

  if (src) {
    return `<img class="${className}" src="${src}" alt="${team.nameZh} 国旗">`;
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

  header.innerHTML = `
    <div class="tournament-modal-titlebar">
      <span class="match-modal-kicker" id="tournament-modal-title">TOURNAMENT PREDICTION REPORT</span>
    </div>
    <div class="tournament-modal-hero">
      <span>${prediction.type || prediction.category || "长期预测"}</span>
      <h2>${prediction.predictionName}</h2>
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
        predictedValue: prediction.predictedValue,
        evidence: prediction.evidence || [],
        isLatest: true
      }];

  return records.map((record, index) => ({
    ...record,
    isLatest: Boolean(record.isLatest) || index === records.length - 1,
    predictedValue: record.predictedValue || prediction.predictedValue,
    evidence: Array.isArray(record.evidence) ? record.evidence : []
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
        <h3>历史预测记录</h3>
      </div>
      <div class="history-timeline">
        ${timelineVersions.map(({ record, index }) => `
          <button class="history-item ${record.isLatest ? "is-current is-active" : ""}" type="button" data-tournament-version-index="${index}" aria-label="查看 ${record.time || "该时间"} 的长期预测版本">
            <time>${record.time || "时间待补充"}</time>
            <div>
              <strong>${record.predictedValue || "待预测"}</strong>
              <span>${record.label || "预测版本"}</span>
              <p>${record.evidence?.[0] || "证据链条待补充。"}</p>
            </div>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTournamentEvidenceReport(prediction, version) {
  const evidence = Array.isArray(version?.evidence) ? version.evidence : [];

  return `
    <div class="tournament-evidence-body">
      <section class="tournament-result-card">
        <span>${prediction.type || "预测结果"}</span>
        <strong>${version?.predictedValue || prediction.predictedValue}</strong>
      </section>
      <section class="tournament-evidence-card">
        <h3>预测证据链条</h3>
        <div class="evidence-chain-list">
          ${evidence.length
            ? evidence.map((item, index) => `
              <article>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <p>${escapeHtml(item)}</p>
              </article>
            `).join("")
            : `<p class="empty-state">该版本证据链条待补充。</p>`}
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
  const statusLabel = match.predictionStatus === "predicted" ? "已预测" : "待预测";
  const updatedAt = match.updatedAt || "待更新";
  const versions = getPredictionVersions(match, report);
  const isGamePredictionReport = versions.some((version) => version?.brief || version?.scoreMatrix || version?.deviationSpace);

  header.innerHTML = `
    <div class="match-modal-titlebar">
      <span class="match-modal-kicker" id="match-modal-title">MATCH PREDICTION REPORT</span>
      <div class="match-modal-actions">
        <span class="modal-update-time">预测更新时间：${updatedAt}</span>
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
        ${renderPredictionHistory(versions)}
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
  return `
    <div class="modal-team">
      ${renderTeamFlag(team, "modal-flag")}
      <strong>${formatTeamName(team, fallbackName)}</strong>
    </div>
  `;
}

function renderCurrentPredictionPanel(match) {
  return `
    <section class="prediction-current-card">
      <div class="panel-section-head">
        <span>CURRENT VERSION</span>
        <h3>当前预测</h3>
      </div>
      <div class="current-score-box">
        <span>预测比分</span>
        <strong>${match.predictedScore || "待预测"}</strong>
      </div>
      <div class="current-metric-list">
        <div>
          <span>胜率参考</span>
          <strong>${match.winReference || "待预测"}</strong>
        </div>
        <div>
          <span>预测状态</span>
          <strong>${match.predictionStatus === "predicted" ? "已预测" : "待预测"}</strong>
        </div>
      </div>
      <p>${match.predictionSummary || "当前预测摘要待补充。"}</p>
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
        <h3>历史预测记录</h3>
      </div>
      <div class="history-timeline">
        ${timelineVersions.map(({ record, index }) => `
          <button class="history-item ${record.isLatest ? "is-current is-active" : ""}" type="button" data-version-index="${index}" aria-label="查看 ${record.time || "该时间"} 的预测版本">
            <time>${record.time || "时间待补充"}</time>
            <div>
              <strong>${record.predictedScore || "待预测"}</strong>
              <span>${record.winReference || "胜率待补充"}</span>
              <p>${record.summary || "该版本说明待补充。"}</p>
            </div>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPredictionVersionReport(version, match) {
  if (version?.brief || version?.scoreMatrix || version?.deviationSpace) {
    return renderGamePredictionVersionReport(version, match);
  }

  const reportMeta = extractReportMetadata(version?.markdown || "");
  const title = version?.isLatest ? "最新预测报告" : "历史预测报告";
  const description = version?.isLatest
    ? "当前展示的是最新预测版本，可点击左侧历史时间点查看旧版预测。"
    : "当前展示的是历史预测版本，用于对照预测变化。";
  const versionLabel = reportMeta.versionLabel || (version?.isLatest ? "最新版本" : "历史版本");
  const updatedAt = reportMeta.updatedAt || version?.time || "时间待补充";

  return `
    <div class="report-main-head">
      <span>${version?.label || "预测版本"}</span>
      <div class="report-version-title">
        <div>
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
        <time>${updatedAt}</time>
      </div>
      <div class="report-version-meta">
        <span>报告版本：${versionLabel}</span>
        <span>更新时间：${updatedAt}</span>
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
    <section class="probability-pie-panel" aria-label="胜平负概率扇形图">
      <div class="probability-pie" style="background: conic-gradient(${gradientParts.join(", ")});">
        <span>胜平负</span>
      </div>
      <div class="probability-legend">
        ${probabilities.map((item) => `
          <span style="--legend-color:${item.color}">
            <i aria-hidden="true"></i>
            <strong>${escapeHtml(item.label)}</strong>
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
        match?.winReference || "",
        ...(Array.isArray(match?.forecastLines)
          ? match.forecastLines.flatMap((line) => [line.predictionResult, line.possibility])
          : [])
      ]
    : [];
  const rawText = [
    version?.markdown || "",
    version?.winReference || "",
    version?.summary || "",
    ...currentForecastSources
  ].filter(Boolean).join("\n");
  const homeTeam = getWorldCupTeam(match?.homeTeamId);
  const awayTeam = getWorldCupTeam(match?.awayTeamId);
  const labels = [
    {
      key: "home",
      label: `${formatTeamName(homeTeam, match?.homeTeam)}胜`,
      color: "#0d7a56",
      names: [homeTeam?.nameZh, homeTeam?.nameEn, match?.homeTeam].filter(Boolean)
    },
    {
      key: "draw",
      label: "平局",
      color: "#f6c453",
      names: ["平局", "draw", "Draw"]
    },
    {
      key: "away",
      label: `${formatTeamName(awayTeam, match?.awayTeam)}胜`,
      color: "#3ab0ff",
      names: [awayTeam?.nameZh, awayTeam?.nameEn, match?.awayTeam].filter(Boolean)
    }
  ];

  return labels
    .map((item) => ({
      ...item,
      value: findProbabilityForNames(rawText, item.names)
    }))
    .filter((item) => Number.isFinite(item.value) && item.value > 0);
}

function normalizeWinDrawLossProbabilities(version, homeTeam, awayTeam) {
  const values = version?.brief?.win_draw_loss || {};
  const homeName = formatTeamName(homeTeam, version?.brief?.match?.team_a);
  const awayName = formatTeamName(awayTeam, version?.brief?.match?.team_b);
  const items = [
    {
      key: "home",
      label: `${homeName}胜`,
      color: "#0d7a56",
      value: normalizeProbabilityToPercent(values.team_a_win)
    },
    {
      key: "draw",
      label: "平局",
      color: "#f6c453",
      value: normalizeProbabilityToPercent(values.draw)
    },
    {
      key: "away",
      label: `${awayName}胜`,
      color: "#3ab0ff",
      value: normalizeProbabilityToPercent(values.team_b_win)
    }
  ];

  return items.filter((item) => Number.isFinite(item.value) && item.value > 0);
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
    return renderGameChartEmpty("比分矩阵", "蒙特卡洛比分矩阵数据待补充。");
  }

  const values = matrix.flat().map(Number).filter(Number.isFinite);
  const maxValue = Math.max(...values, 0);

  return `
    <section class="game-chart-card score-matrix-card">
      <div class="game-chart-head">
        <span>SCORE MATRIX</span>
      </div>
      <div class="score-matrix-wrap" style="--matrix-cols:${columns.length + 1}">
        <span class="matrix-axis-corner">${escapeHtml(matrixData?.row_axis?.team || "主队")} \\ ${escapeHtml(matrixData?.column_axis?.team || "客队")}</span>
        ${columns.map((column) => `<span class="matrix-axis-label">${escapeHtml(column)}</span>`).join("")}
        ${rows.map((row, rowIndex) => `
          <span class="matrix-axis-label">${escapeHtml(row)}</span>
          ${columns.map((column, columnIndex) => {
            const value = Number(matrix[rowIndex]?.[columnIndex] || 0);
            const intensity = maxValue ? Math.max(0.08, value / maxValue) : 0;

            return `
              <span class="matrix-cell" style="--cell-alpha:${intensity.toFixed(3)}" title="${escapeHtml(row)}-${escapeHtml(column)} ${formatProbabilityValue(normalizeProbabilityToPercent(value) || 0)}">
                <strong>${formatProbabilityValue(normalizeProbabilityToPercent(value) || 0)}</strong>
              </span>
            `;
          }).join("")}
        `).join("")}
      </div>
      ${matrixData?.axis_note_cn ? `<p>${escapeHtml(matrixData.axis_note_cn)}</p>` : ""}
    </section>
  `;
}

function renderScoreDeviationScatter(deviationData, focusScore = "1-0") {
  const points = Array.isArray(deviationData?.points) ? deviationData.points : [];

  if (!points.length) {
    return renderGameChartEmpty("偏差空间", "比分偏差空间数据待补充。");
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
        <span>DEVIATION SPACE</span>
      </div>
      <div class="score-scatter-plot" aria-label="横坐标为 deviation，纵坐标为 probability">
        <span class="scatter-axis x-axis">deviation</span>
        <span class="scatter-axis y-axis">probability</span>
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
      <p>${escapeHtml(focusPoint?.score || "1-0")}：deviation ${Number(focusPoint?.deviation || 0).toFixed(3)}，probability ${formatProbabilityValue(normalizeProbabilityToPercent(focusPoint?.probability) || 0)}</p>
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
        <span>KEY FACTORS</span>
      </div>
      ${factors.length
        ? `<ul>${factors.map((factor) => `<li>${escapeHtml(factor)}</li>`).join("")}</ul>`
        : `<p class="empty-state">该版本关键因素待补充。</p>`}
    </section>
  `;
}

function renderGameChartEmpty(title, message) {
  return `
    <section class="game-chart-card">
      <div class="game-chart-head">
        <span>DATA PENDING</span>
        <h4>${escapeHtml(title)}</h4>
      </div>
      <p>${escapeHtml(message)}</p>
    </section>
  `;
}

function renderVersionSummaryReport(version, match) {
  return `
    <div class="report-section-grid">
      <section class="report-section is-lead">
        <h3>${version?.time || "历史版本"} 预测摘要</h3>
        <div class="version-summary-grid">
          <div><span>预测比分</span><strong>${version?.predictedScore || "待预测"}</strong></div>
          <div><span>胜率参考</span><strong>${version?.winReference || "待补充"}</strong></div>
        </div>
        <div class="report-content">
          <p>${version?.fallbackSummary || version?.summary || match.predictionSummary || "该版本详细预测报告待补充。"}</p>
          <p>该历史版本的详细报告待补充，当前先展示预测比分、胜率参考和版本摘要。</p>
        </div>
      </section>
    </div>
  `;
}

function renderEmptyReport(match) {
  return `
    <section class="report-section">
      <h3>预测报告待补充</h3>
      <p>${match.predictionSummary || "该场比赛的详细 markdown 报告尚未配置。"}</p>
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
      return "待预测";
    }

    if (type === "actual") {
      return "待结算";
    }

    if (type === "time") {
      return "时间待定";
    }

    if (type === "venue") {
      return "场馆待定";
    }

    if (type === "team") {
      return "对阵待定";
    }

    return "待定";
  }

  if (value === "待赛果") {
    return "待结算";
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

function initGaokaoPredictionPage(context = {}) {
  const page = document.querySelector("[data-gaokao-prediction-page]");

  if (!page) {
    return;
  }

  const data = normalizeGaokaoPredictionData(context.admissionData, context.historyData, context.predictionData);
  const meta = context.meta || {};
  const provinceOrder = getGaokaoProvinceOrder(data, context.releaseData);
  const defaultProvince = provinceOrder.includes("广东") ? "广东" : provinceOrder[0] || "";
  const gaokaoPredictionState = {
    province: defaultProvince,
    subjectType: "",
    selectedUniversityId: null
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
    detailBody: document.querySelector("[data-gaokao-detail-body]")
  };

  if (refs.dataBadge) {
    refs.dataBadge.textContent = meta.isSampleData ? "示例/占位数据" : "正式数据";
  }

  renderProvinceSelector(provinceOrder, data, gaokaoPredictionState, refs);
  bindGaokaoPredictionEvents(data, meta, context.releaseData, gaokaoPredictionState, refs);
  updateGaokaoSubjectOptions(data, gaokaoPredictionState, refs);
  renderGaokaoPredictionWorkspace(data, meta, context.releaseData, gaokaoPredictionState, refs);
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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeGaokaoUniversityDetail();
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
    minScore: Number(row.minScore),
    minRank: Number(row.minRank),
    planCount: row.planCount == null ? null : Number(row.planCount)
  })).filter((row) => Number.isFinite(row.year) && Number.isFinite(row.minScore));
  const latest = history[history.length - 1] || {};
  const prediction = item.prediction || {};
  const predictedScore = Number(prediction.predictedScore ?? prediction.score ?? latest.minScore ?? 0);
  const predictedRank = Number(prediction.predictedRank ?? latest.minRank ?? estimateFallbackRank(predictedScore, history.length + 1));

  return {
    province: String(item.province),
    subjectType: String(item.subjectType || "科类待补充"),
    universityId: String(item.universityId),
    universityName: String(item.universityName || item.name || "高校名称待补充"),
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
      changeFromLastYear: Number(prediction.changeFromLastYear ?? (latest.minScore ? predictedScore - latest.minScore : 0)),
      confidence: String(prediction.confidence || "medium").toLowerCase()
    },
    sourceNote: String(item.sourceNote || "示例数据，后续替换为官方和模型结果。")
  };
}

function normalizeRange(range, center, spread, minValue = -Infinity) {
  if (Array.isArray(range) && range.length >= 2) {
    return [Math.max(minValue, Number(range[0])), Math.max(minValue, Number(range[1]))];
  }

  return [Math.max(minValue, Number(center) - spread), Math.max(minValue, Number(center) + spread)];
}

function estimateFallbackRank(score, index) {
  const distance = Math.max(20, 720 - Number(score || 0));
  return Math.max(1, Math.round(distance * distance * 0.9 + index * 41));
}

function getGaokaoProvinceOrder(data, releaseData) {
  const preferred = ["北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆"];
  const provinceSet = new Set(data.map((item) => item.province));
  (releaseData?.provinces || []).forEach((item) => provinceSet.add(item.province));
  const ordered = preferred.filter((province) => provinceSet.has(province));
  const rest = [...provinceSet].filter((province) => !preferred.includes(province)).sort((a, b) => a.localeCompare(b, "zh-CN"));

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
    <div><span>覆盖高校</span><strong>${universities.size || meta.universityCount || 0}</strong><em>所 985 高校</em></div>
    <div><span>覆盖省份</span><strong>${provinces.size || meta.provinceCount || 0}</strong><em>个省级入口</em></div>
    <div><span>历史范围</span><strong>${escapeHtml(yearRange)}</strong><em>最低分 / 位次</em></div>
    <div><span>预测年份</span><strong>${meta.targetYear || 2026}</strong><em>更新时间 ${escapeHtml(meta.updatedAt || "待补充")}</em></div>
  `;
}

function renderProvinceSelector(provinceOrder, data, state, refs) {
  if (refs.provinceSelect) {
    refs.provinceSelect.innerHTML = provinceOrder.map((province) => (
      `<option value="${escapeHtml(province)}">${escapeHtml(province)}</option>`
    )).join("");
    refs.provinceSelect.value = state.province;
  }

  renderProvinceQuickButtons(provinceOrder, state, refs);
  updateGaokaoSubjectOptions(data, state, refs);
}

function renderProvinceQuickButtons(provinceOrder, state, refs) {
  if (!refs.quickList) {
    return;
  }

  const quick = ["广东", "北京", "河南", "四川", "江苏", "山东"].filter((province) => provinceOrder.includes(province));
  refs.quickList.innerHTML = quick.map((province) => `
    <button class="${province === state.province ? "is-active" : ""}" type="button" data-gaokao-quick-province="${escapeHtml(province)}">${escapeHtml(province)}</button>
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
    `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`
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
      <p>${escapeHtml(state.subjectType || "科类待补充")} · ${entries.length} 所 985 高校样本</p>
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
    .filter((entry) => entry.map && Number.isFinite(Number(entry.map.x)) && Number.isFinite(Number(entry.map.y)))
    .sort((a, b) => b.prediction.predictedScore - a.prediction.predictedScore);
  const sourceHeight = Number(refs.predictionMap.dataset.mapSourceHeight) || 0;
  const cropHeight = Number(refs.predictionMap.dataset.mapCropHeight) || 0;
  const yScale = sourceHeight > 0 && cropHeight > 0 ? sourceHeight / cropHeight : 1;
  const scoreValues = entries.map((entry) => entry.prediction.predictedScore).filter(Number.isFinite);
  const markerOffsets = getGaokaoMarkerOffsets(entries);

  if (refs.mapHeading) {
    refs.mapHeading.textContent = `${state.province || "省份"} · ${state.subjectType || "科类"} 985 高校预测地图`;
  }

  if (refs.mapSummary) {
    refs.mapSummary.textContent = entries.length
      ? `${entries.length} 所 985 高校预测分数线，预测范围 ${formatMinMax(scoreValues, "分")}。点击学校标记查看近五年趋势。`
      : "当前省份和科类暂无可展示的高校预测数据。";
  }

  if (!entries.length) {
    refs.predictionMap.innerHTML = renderGaokaoEmptyState("当前选择暂无地图数据", "请切换省份或补充高校地图坐标与预测结果。");

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

  entries.forEach((entry) => {
    const markerY = Math.max(0, Math.min(100, Number(entry.map.y) * yScale));
    const markerOffset = markerOffsets.get(entry.universityId) || { x: 0, y: 0 };
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gaokao-score-marker";
    button.style.left = `${entry.map.x}%`;
    button.style.top = `${markerY}%`;
    button.style.setProperty("--marker-offset-x", `${markerOffset.x}px`);
    button.style.setProperty("--marker-offset-y", `${markerOffset.y}px`);
    button.style.zIndex = `${Math.max(1, Math.round(Number(entry.prediction.predictedScore) || 1))}`;
    button.dataset.universityId = entry.universityId;
    button.title = entry.universityName;
    button.setAttribute("aria-label", `${entry.universityName}，${state.province}${state.subjectType}预测点位`);
    button.innerHTML = `
      <span class="gaokao-score-dot" aria-hidden="true"></span>
      <span class="gaokao-score-tooltip">${escapeHtml(entry.universityName)}</span>
    `;
    button.addEventListener("click", () => openGaokaoUniversityDetail(entry, state, refs));
    markerLayer.appendChild(button);
  });

  if (refs.scoreList) {
    refs.scoreList.innerHTML = entries.map((entry) => `
      <button type="button" data-open-gaokao-map-detail="${escapeHtml(entry.universityId)}">
        <span><em>${escapeHtml(entry.universityName)}</em><small>${escapeHtml(entry.universityLocation)}</small></span>
        <strong>${entry.prediction.predictedScore} 分</strong>
      </button>
    `).join("");

    refs.scoreList.querySelectorAll("[data-open-gaokao-map-detail]").forEach((button) => {
      const entry = entries.find((item) => item.universityId === button.dataset.openGaokaoMapDetail);
      button.addEventListener("click", () => openGaokaoUniversityDetail(entry, state, refs));
    });
  }
}

function getGaokaoMarkerOffsets(entries) {
  const buckets = new Map();
  const offsets = new Map();
  const pattern = [
    [0, 0],
    [7, -5],
    [-7, 5],
    [9, 6],
    [-9, -6],
    [0, 10],
    [0, -10],
    [12, 0],
    [-12, 0]
  ];

  entries.forEach((entry) => {
    const bucketKey = `${Math.round(Number(entry.map.x) / 3)}:${Math.round(Number(entry.map.y) / 3)}`;
    const bucket = buckets.get(bucketKey) || [];
    bucket.push(entry);
    buckets.set(bucketKey, bucket);
  });

  buckets.forEach((bucket) => {
    bucket.forEach((entry, index) => {
      const base = pattern[index % pattern.length];
      const round = Math.floor(index / pattern.length) + 1;
      offsets.set(entry.universityId, {
        x: base[0] * round,
        y: base[1] * round
      });
    });
  });

  return offsets;
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
          <em>${scoreValues.map((value) => `${value}`).join(" / ")}</em>
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
  document.body.classList.remove("modal-open");
}

function renderUniversityDetail(entry) {
  const latest = getLatestHistory(entry);
  const scoreValues = entry.history.map((row) => row.minScore);
  const rankValues = entry.history.map((row) => row.minRank);
  const years = entry.history.map((row) => row.year);

  return `
    <div class="gaokao-detail-header">
      <div>
        <p class="kicker">UNIVERSITY DETAIL</p>
        <h2 id="gaokao-detail-title">${escapeHtml(entry.universityName)}</h2>
        <p>${escapeHtml(entry.universityLocation)} · ${escapeHtml(entry.province)}招生 · ${escapeHtml(entry.subjectType)} · ${escapeHtml(entry.majorGroup)}</p>
      </div>
      <span class="gaokao-detail-score-chip">${formatNullable(entry.prediction.predictedScore, "分")}</span>
    </div>

    <div class="gaokao-detail-kpis">
      <div><span>预测分数线</span><strong>${formatNullable(entry.prediction.predictedScore, "分")}</strong><p>${formatRange(entry.prediction.scoreRange, "分")}</p></div>
      <div><span>预测位次</span><strong>${formatRank(entry.prediction.predictedRank)}</strong><p>${formatRankRange(entry.prediction.rankRange)}</p></div>
      <div><span>较上一年变化</span><strong>${formatSigned(entry.prediction.changeFromLastYear)} 分</strong><p>最新历史分 ${formatNullable(latest?.minScore, "分")}</p></div>
      <div><span>置信度</span><strong>${formatConfidence(entry.prediction.confidence)}</strong><p>${escapeHtml(entry.sourceNote)}</p></div>
    </div>

    <div class="gaokao-detail-chart-grid">
      <div>
        <h3>近五年最低分</h3>
        ${renderDetailLineChart(scoreValues, years, "score")}
      </div>
      <div>
        <h3>近五年最低位次</h3>
        ${renderDetailLineChart(rankValues, years, "rank")}
      </div>
    </div>

    <div class="gaokao-detail-judgement">
      <strong>趋势判断</strong>
      <p>${escapeHtml(makeGaokaoTrendJudgement(entry))}</p>
    </div>

    <div class="modal-table-wrap">
      <table class="modal-data-table gaokao-detail-table">
        <thead>
          <tr><th>年份</th><th>最低分</th><th>最低位次</th><th>招生计划</th></tr>
        </thead>
        <tbody>
          ${entry.history.map((row) => `
            <tr>
              <td>${row.year}</td>
              <td>${formatNullable(row.minScore, "分")}</td>
              <td>${formatRank(row.minRank)}</td>
              <td>${row.planCount == null ? "待补充" : `${row.planCount} 人`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function makeGaokaoTrendJudgement(entry) {
  const lastThree = entry.history.slice(-3);
  const ranks = lastThree.map((row) => row.minRank);
  const rankUp = ranks.length === 3 && ranks[2] < ranks[1] && ranks[1] < ranks[0];
  const rankDown = ranks.length === 3 && ranks[2] > ranks[1] && ranks[1] > ranks[0];
  const change = entry.prediction.changeFromLastYear;

  if (rankUp && change > 0) {
    return "该校近三年录取位次整体上移，预测分数线可能小幅上涨，建议结合位次和专业组热度判断。";
  }

  if (rankDown && change < 0) {
    return "该校近三年录取位次有所下移，预测门槛可能小幅回落，但仍需核对当年招生计划变化。";
  }

  return "该校近年最低分和最低位次存在波动，建议优先看位次区间，并结合专业组、招生计划和院校热度综合判断。";
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
    return `<div class="gaokao-sparkline-empty">数据待补充</div>`;
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

function renderDetailLineChart(values, labels, type) {
  const cleaned = values.filter(Number.isFinite);

  if (cleaned.length < 2) {
    return `<div class="gaokao-chart-empty">趋势数据待补充</div>`;
  }

  const width = 560;
  const height = 230;
  const pad = { left: 56, right: 18, top: 24, bottom: 40 };
  const min = Math.min(...cleaned);
  const max = Math.max(...cleaned);
  const range = max - min || 1;
  const xFor = (index) => pad.left + (index * (width - pad.left - pad.right)) / (cleaned.length - 1);
  const yFor = (value) => {
    const normalized = type === "rank" ? (max - value) / range : (value - min) / range;
    return height - pad.bottom - normalized * (height - pad.top - pad.bottom);
  };
  const points = cleaned.map((value, index) => `${xFor(index)},${yFor(value)}`).join(" ");
  const ticks = [min, Math.round((min + max) / 2), max];

  return `
    <svg class="gaokao-detail-chart ${type}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${type === "rank" ? "最低位次趋势" : "最低分趋势"}">
      <g class="chart-grid">
        ${ticks.map((tick) => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${yFor(tick)}" y2="${yFor(tick)}"></line><text x="12" y="${yFor(tick) + 4}">${type === "rank" ? formatNumber(tick) : tick}</text>`).join("")}
      </g>
      <polyline points="${points}"></polyline>
      ${cleaned.map((value, index) => `<circle cx="${xFor(index)}" cy="${yFor(value)}" r="4"><title>${labels[index]}：${type === "rank" ? formatRank(value) : `${value} 分`}</title></circle>`).join("")}
      <g class="chart-axis">
        ${labels.map((label, index) => `<text x="${xFor(index)}" y="${height - 12}">${label}</text>`).join("")}
      </g>
    </svg>
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
  return entry.history[entry.history.length - 1] || null;
}

function parseGaokaoInputNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function formatNumber(value) {
  if (!Number.isFinite(Number(value))) {
    return "待补充";
  }

  return new Intl.NumberFormat("zh-CN").format(Math.round(Number(value)));
}

function formatRank(value) {
  if (!Number.isFinite(Number(value))) {
    return "待补充";
  }

  return `${formatNumber(value)} 名`;
}

function formatNullable(value, unit = "") {
  if (!Number.isFinite(Number(value))) {
    return "待补充";
  }

  return `${Math.round(Number(value))}${unit}`;
}

function formatSigned(value, digits = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "待补充";
  }

  const fixed = digits > 0 ? number.toFixed(digits) : Math.round(number);
  return number > 0 ? `+${fixed}` : `${fixed}`;
}

function formatRange(range, unit = "") {
  if (!Array.isArray(range) || range.length < 2) {
    return "待补充";
  }

  return `${Math.round(range[0])}-${Math.round(range[1])}${unit}`;
}

function formatRankRange(range) {
  if (!Array.isArray(range) || range.length < 2) {
    return "待补充";
  }

  return `${formatNumber(range[0])}-${formatNumber(range[1])} 名`;
}

function formatMinMax(values, unit = "", rankMode = false) {
  const cleaned = values.filter((value) => Number.isFinite(Number(value)));

  if (!cleaned.length) {
    return "待补充";
  }

  const min = Math.min(...cleaned);
  const max = Math.max(...cleaned);

  if (rankMode) {
    return `${formatNumber(min)}-${formatNumber(max)}${unit}`;
  }

  return `${Math.round(min)}-${Math.round(max)}${unit}`;
}

function formatConfidence(confidence) {
  const map = {
    high: "高",
    medium: "中",
    low: "低"
  };

  return map[String(confidence).toLowerCase()] || "待判断";
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

  universities.forEach((school) => {
    const markerY = Math.max(0, Math.min(100, school.map.y * yScale));
    const button = document.createElement("button");
    button.type = "button";
    button.className = `university-marker ${type}`;
    button.style.left = `${school.map.x}%`;
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
