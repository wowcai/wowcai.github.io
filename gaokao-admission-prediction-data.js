(function () {
  const universities = window.GAOKAO_UNIVERSITY_BASE || [];
  const historicalYears = [2021, 2022, 2023, 2024, 2025];
  const targetYear = 2026;

  const admissionProvinces = [
    { name: "北京", adjust: -8, rankFactor: 0.28, subjectType: "综合改革" },
    { name: "天津", adjust: -4, rankFactor: 0.36, subjectType: "综合改革" },
    { name: "河北", adjust: 5, rankFactor: 1.05, subjectType: "物理类" },
    { name: "山西", adjust: -2, rankFactor: 0.82, subjectType: "理科" },
    { name: "内蒙古", adjust: -18, rankFactor: 0.5, subjectType: "理科" },
    { name: "辽宁", adjust: 0, rankFactor: 0.74, subjectType: "物理类" },
    { name: "吉林", adjust: -10, rankFactor: 0.56, subjectType: "物理类" },
    { name: "黑龙江", adjust: -11, rankFactor: 0.58, subjectType: "物理类" },
    { name: "上海", adjust: -24, rankFactor: 0.22, subjectType: "综合改革" },
    { name: "江苏", adjust: 4, rankFactor: 0.92, subjectType: "物理类" },
    { name: "浙江", adjust: 1, rankFactor: 0.96, subjectType: "综合改革" },
    { name: "安徽", adjust: 3, rankFactor: 1.0, subjectType: "物理类" },
    { name: "福建", adjust: 0, rankFactor: 0.88, subjectType: "物理类" },
    { name: "江西", adjust: 2, rankFactor: 0.9, subjectType: "物理类" },
    { name: "山东", adjust: 2, rankFactor: 1.18, subjectType: "综合改革" },
    { name: "河南", adjust: 8, rankFactor: 1.45, subjectType: "理科" },
    { name: "湖北", adjust: 1, rankFactor: 0.95, subjectType: "物理类" },
    { name: "湖南", adjust: 2, rankFactor: 0.98, subjectType: "物理类" },
    { name: "广东", adjust: 1, rankFactor: 1.08, subjectType: "物理类" },
    { name: "广西", adjust: -6, rankFactor: 0.82, subjectType: "物理类" },
    { name: "海南", adjust: -30, rankFactor: 0.26, subjectType: "综合改革" },
    { name: "重庆", adjust: -1, rankFactor: 0.72, subjectType: "物理类" },
    { name: "四川", adjust: 3, rankFactor: 1.06, subjectType: "理科" },
    { name: "贵州", adjust: -8, rankFactor: 0.78, subjectType: "物理类" },
    { name: "云南", adjust: -5, rankFactor: 0.84, subjectType: "理科" },
    { name: "西藏", adjust: -40, rankFactor: 0.18, subjectType: "理科" },
    { name: "陕西", adjust: 0, rankFactor: 0.86, subjectType: "理科" },
    { name: "甘肃", adjust: -9, rankFactor: 0.66, subjectType: "物理类" },
    { name: "青海", adjust: -26, rankFactor: 0.32, subjectType: "理科" },
    { name: "宁夏", adjust: -18, rankFactor: 0.38, subjectType: "理科" },
    { name: "新疆", adjust: -15, rankFactor: 0.6, subjectType: "理科" }
  ];

  const yearDeltas = [-3, -1, 0, 2, 4];

  function clampScore(score) {
    return Math.max(470, Math.min(705, Math.round(score)));
  }

  function estimateRank(score, province, universityIndex, yearIndex) {
    const distance = Math.max(18, 722 - score);
    const jitter = ((universityIndex * 17 + yearIndex * 13) % 91) - 35;
    return Math.max(12, Math.round(distance * distance * province.rankFactor + jitter));
  }

  function buildMajorGroup(province, universityIndex, provinceIndex) {
    if (province.subjectType === "综合改革") {
      return "本科普通批";
    }

    const groupNo = 201 + ((universityIndex + provinceIndex) % 8);
    return `专业组 ${groupNo}`;
  }

  function buildHistory(school, universityIndex, province, provinceIndex) {
    return historicalYears.map((year, yearIndex) => {
      const score = clampScore(
        school.baseScore +
        province.adjust +
        yearDeltas[yearIndex] +
        ((universityIndex + provinceIndex + yearIndex) % 5) -
        2
      );

      return {
        year,
        minScore: score,
        minRank: estimateRank(score, province, universityIndex, yearIndex),
        planCount: Math.max(8, 18 + ((universityIndex * 3 + provinceIndex + yearIndex) % 56))
      };
    });
  }

  function buildPrediction(history, school, universityIndex, province, provinceIndex) {
    const latest = history[history.length - 1];
    const previous = history[history.length - 2] || latest;
    const scoreTrend = latest.minScore - previous.minScore;
    const modelAdjustment = ((universityIndex + provinceIndex) % 3) - 1;
    const predictedScore = clampScore(latest.minScore + Math.round(scoreTrend * 0.55) + 2 + modelAdjustment);
    const predictedRank = estimateRank(predictedScore, province, universityIndex, historicalYears.length + 1);
    const spread = predictedScore >= 670 ? 4 : predictedScore >= 640 ? 5 : 7;
    const rankSpread = Math.max(60, Math.round(predictedRank * (predictedScore >= 660 ? 0.18 : 0.24)));
    const confidence = predictedScore >= 670 || Math.abs(scoreTrend) <= 2 ? "medium" : "low";

    return {
      year: targetYear,
      predictedScore,
      predictedRank,
      scoreRange: [predictedScore - spread, predictedScore + spread],
      rankRange: [Math.max(1, predictedRank - rankSpread), predictedRank + rankSpread],
      changeFromLastYear: predictedScore - latest.minScore,
      confidence
    };
  }

  window.gaokaoAdmissionPredictionMeta = {
    targetYear,
    historicalYears,
    updatedAt: "2026-06-15",
    provinceCount: admissionProvinces.length,
    universityCount: universities.length,
    isSampleData: true,
    sourceNote: "示例/占位数据：用于展示页面结构和交互口径，后续应替换为各省官方投档线、最低位次、招生计划和模型预测结果。"
  };

  window.gaokaoAdmissionPredictionData = universities.flatMap((school, universityIndex) => (
    admissionProvinces.map((province, provinceIndex) => {
      const history = buildHistory(school, universityIndex, province, provinceIndex);

      return {
        province: province.name,
        subjectType: province.subjectType,
        universityId: school.id,
        universityName: school.name,
        universityLocation: `${school.province} · ${school.city}`,
        map: school.map,
        majorGroup: buildMajorGroup(province, universityIndex, provinceIndex),
        history,
        prediction: buildPrediction(history, school, universityIndex, province, provinceIndex),
        sourceNote: "示例数据，后续替换为官方和模型结果。"
      };
    })
  ));
})();
