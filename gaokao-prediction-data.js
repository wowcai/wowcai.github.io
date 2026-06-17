const GAOKAO_PREDICTION_PROVINCES = [
  { name: "北京", adjust: -8, confidence: "High" },
  { name: "河北", adjust: 5, confidence: "Medium" },
  { name: "河南", adjust: 8, confidence: "Medium" },
  { name: "广东", adjust: 1, confidence: "High" },
  { name: "四川", adjust: 3, confidence: "Medium" }
];

function buildPredictionScores(school, schoolIndex) {
  return Object.fromEntries(
    GAOKAO_PREDICTION_PROVINCES.map((province, provinceIndex) => {
      const score = school.baseScore + province.adjust + 6 + ((schoolIndex + provinceIndex) % 3) - 1;
      const spread = province.confidence === "High" ? 4 : 6;

      return [
        province.name,
        {
          score,
          low: score - spread,
          high: score + spread,
          confidence: province.confidence
        }
      ];
    })
  );
}

window.GAOKAO_PREDICTION_DATA = {
  targetYear: 2026,
  sourceNote: "示例预测数据结构：model version, input scope, target year, score interval, confidence definition。后续应替换为正式模型结果。",
  universities: (window.GAOKAO_UNIVERSITY_BASE || []).map((school, index) => ({
    id: school.id,
    name: school.name,
    tier: school.tier,
    province: school.province,
    city: school.city,
    campus: school.campus,
    map: school.map,
    predictions: buildPredictionScores(school, index)
  }))
};
