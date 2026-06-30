param(
  [string]$SourceDir,
  [string]$RawTargetDir,
  [string]$OutputFile
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
if (-not $SourceDir) {
  $SourceDir = Join-Path $RepoRoot "gaokao_prediction"
}
if (-not $RawTargetDir) {
  $RawTargetDir = Join-Path $RepoRoot "gaokao_prediction"
}
if (-not $OutputFile) {
  $OutputFile = Join-Path $RepoRoot "gaokao-admission-prediction-data.js"
}

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$KnownProvinceNames = @(
  "北京",
  "天津",
  "河北",
  "山西",
  "内蒙古",
  "辽宁",
  "吉林",
  "黑龙江",
  "上海",
  "江苏",
  "浙江",
  "安徽",
  "福建",
  "江西",
  "山东",
  "河南",
  "湖北",
  "湖南",
  "广东",
  "广西",
  "海南",
  "重庆",
  "四川",
  "贵州",
  "云南",
  "西藏",
  "陕西",
  "甘肃",
  "青海",
  "宁夏",
  "新疆"
)

function Get-CanonicalPath {
  param([string]$Path)

  return [System.IO.Path]::GetFullPath($Path)
}

function Get-PropValue {
  param(
    [object]$Object,
    [string]$Name
  )

  if ($null -eq $Object -or [string]::IsNullOrWhiteSpace($Name)) {
    return $null
  }

  $prop = $Object.PSObject.Properties[$Name]
  if ($null -eq $prop) {
    return $null
  }

  return $prop.Value
}

function To-NullableNumber {
  param([object]$Value)

  if ($null -eq $Value -or $Value -eq "") {
    return $null
  }

  $number = 0.0
  if ([double]::TryParse([string]$Value, [ref]$number)) {
    if ([Math]::Floor($number) -eq $number) {
      return [int64]$number
    }
    return $number
  }

  return $null
}

function Convert-PredictionReason {
  param(
    [object]$Reason,
    [string]$DefaultTitle,
    [string]$ConclusionKey = "预测结论"
  )

  $sections = New-Object System.Collections.Generic.List[object]
  $summary = ""

  if ($Reason -is [string]) {
    $summary = $Reason
    if (-not [string]::IsNullOrWhiteSpace($Reason)) {
      $sections.Add([ordered]@{ title = $DefaultTitle; text = $Reason })
    }
  } elseif ($null -ne $Reason) {
    foreach ($reasonProp in $Reason.PSObject.Properties) {
      $title = [string]$reasonProp.Name
      $text = ""

      if ($reasonProp.Value -is [string]) {
        $text = [string]$reasonProp.Value
      } elseif ($null -ne $reasonProp.Value) {
        $nestedTitle = Get-PropValue $reasonProp.Value "title"
        $nestedText = Get-PropValue $reasonProp.Value "text"

        if (-not [string]::IsNullOrWhiteSpace([string]$nestedTitle)) {
          $title = [string]$nestedTitle
        }
        if (-not [string]::IsNullOrWhiteSpace([string]$nestedText)) {
          $text = [string]$nestedText
        }
      }

      if (-not [string]::IsNullOrWhiteSpace($text)) {
        $sections.Add([ordered]@{ title = $title; text = $text })
        if ($reasonProp.Name -eq $ConclusionKey) {
          $summary = $text
        }
      }
    }
    if ([string]::IsNullOrWhiteSpace($summary) -and $sections.Count -gt 0) {
      $summary = [string]$sections[$sections.Count - 1].text
    }
  }

  return [pscustomobject]@{
    Summary = $summary
    Sections = $sections.ToArray()
  }
}

function Get-StableHashId {
  param([string]$Name)

  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Name)
  $sha = [System.Security.Cryptography.SHA1]::Create()
  try {
    $hash = $sha.ComputeHash($bytes)
  } finally {
    $sha.Dispose()
  }

  $hex = -join ($hash[0..5] | ForEach-Object { $_.ToString("x2") })
  return "u_$hex"
}

function Get-DisplayUniversityName {
  param([string]$RawName)

  if ($RawName -notmatch "_") {
    return $RawName
  }

  $parts = $RawName -split "_", 2
  $suffix = $parts[1] -replace "_", "·"
  return "$($parts[0])（$suffix）"
}

function Get-SourceParts {
  param([string]$FileName)

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
  $baseName = $baseName -replace "_llm-only-m3$", ""
  $parts = $baseName -split "_", 2

  if ($parts.Count -lt 2) {
    throw "Cannot parse province and university from file name: $FileName"
  }

  return @{
    Province = $parts[0]
    RawUniversityName = $parts[1]
    UniversityName = Get-DisplayUniversityName $parts[1]
  }
}

function Test-GaokaoRawFile {
  param([string]$FileName)

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
  $baseName = $baseName -replace "_llm-only-m3$", ""
  $parts = $baseName -split "_", 2

  if ($parts.Count -lt 2) {
    return $false
  }

  return $KnownProvinceNames -contains $parts[0]
}

function Get-DisplaySubjectType {
  param([string]$SubjectType)

  if ($SubjectType -eq "医学") {
    return "医学类"
  }

  return $SubjectType
}

function Import-ExistingAdmissionData {
  param([string]$Path)

  $result = @{
    ByName = @{}
    ById = @{}
  }

  if (-not (Test-Path -LiteralPath $Path)) {
    return $result
  }

  $text = [System.IO.File]::ReadAllText($Path, $Utf8NoBom)
  $pattern = "window\.gaokaoAdmissionPredictionData\s*=\s*(\[.*?\])\s*;\s*\}\)\(\);"
  $match = [System.Text.RegularExpressions.Regex]::Match(
    $text,
    $pattern,
    [System.Text.RegularExpressions.RegexOptions]::Singleline
  )

  if (-not $match.Success) {
    return $result
  }

  $items = $match.Groups[1].Value | ConvertFrom-Json
  foreach ($item in $items) {
    if ($item.universityName -and -not $result.ByName.ContainsKey($item.universityName)) {
      $result.ByName[$item.universityName] = $item
    }
    if ($item.universityId -and -not $result.ById.ContainsKey($item.universityId)) {
      $result.ById[$item.universityId] = $item
    }
  }

  return $result
}

$KnownIds = @{
  "北京大学" = "pku"
  "清华大学" = "tsinghua"
  "中国人民大学" = "ruc"
  "北京航空航天大学" = "buaa"
  "北京理工大学" = "bit"
  "北京师范大学" = "bnu"
  "中国农业大学" = "cau"
  "中央民族大学" = "muc"
  "南开大学" = "nankai"
  "天津大学" = "tju"
  "大连理工大学" = "dlut"
  "东北大学" = "neu"
  "吉林大学" = "jlu"
  "哈尔滨工业大学" = "hit"
  "复旦大学" = "fudan"
  "上海交通大学" = "sjtu"
  "同济大学" = "tongji"
  "华东师范大学" = "ecnu"
  "南京大学" = "nju"
  "东南大学" = "seu"
  "浙江大学" = "zju"
  "中国科学技术大学" = "ustc"
  "厦门大学" = "xmu"
  "山东大学" = "sdu"
  "中国海洋大学" = "ouc"
  "武汉大学" = "whu"
  "华中科技大学" = "hust"
  "湖南大学" = "hnu"
  "中南大学" = "csu"
  "中国人民解放军国防科技大学" = "nudt"
  "中山大学" = "sysu"
  "华南理工大学" = "scut"
  "四川大学" = "scu"
  "电子科技大学" = "uestc"
  "重庆大学" = "cqu"
  "西安交通大学" = "xjtu"
  "西北工业大学" = "nwpu"
  "西北农林科技大学" = "nwafu"
  "兰州大学" = "lzu"
}

$UniversityLocations = @{
  "安徽大学" = "安徽 · 合肥"
  "北京大学" = "北京 · 北京"
  "北京大学医学部" = "北京 · 北京"
  "北京工业大学" = "北京 · 北京"
  "北京航空航天大学" = "北京 · 北京"
  "北京化工大学" = "北京 · 北京"
  "北京交通大学" = "北京 · 北京"
  "北京科技大学" = "北京 · 北京"
  "北京理工大学" = "北京 · 北京"
  "北京林业大学" = "北京 · 北京"
  "北京师范大学" = "北京 · 北京"
  "北京师范大学（珠海校区）" = "广东 · 珠海"
  "北京外国语大学" = "北京 · 北京"
  "北京邮电大学" = "北京 · 北京"
  "北京中医药大学" = "北京 · 北京"
  "大连海事大学" = "辽宁 · 大连"
  "大连理工大学" = "辽宁 · 大连"
  "大连理工大学（盘锦校区）" = "辽宁 · 盘锦"
  "电子科技大学" = "四川 · 成都"
  "东北大学" = "辽宁 · 沈阳"
  "东北大学秦皇岛分校" = "河北 · 秦皇岛"
  "东北林业大学" = "黑龙江 · 哈尔滨"
  "东北农业大学" = "黑龙江 · 哈尔滨"
  "东北师范大学" = "吉林 · 长春"
  "东南大学" = "江苏 · 南京"
  "东华大学" = "上海 · 上海"
  "对外经济贸易大学" = "北京 · 北京"
  "福州大学" = "福建 · 福州"
  "复旦大学" = "上海 · 上海"
  "复旦大学上海医学院" = "上海 · 上海"
  "广西大学" = "广西 · 南宁"
  "贵州大学" = "贵州 · 贵阳"
  "哈尔滨工程大学" = "黑龙江 · 哈尔滨"
  "哈尔滨工业大学" = "黑龙江 · 哈尔滨"
  "哈尔滨工业大学（深圳）" = "广东 · 深圳"
  "哈尔滨工业大学（威海）" = "山东 · 威海"
  "海军军医大学" = "上海 · 上海"
  "海南大学" = "海南 · 海口"
  "合肥工业大学" = "安徽 · 合肥"
  "合肥工业大学（宣城校区）" = "安徽 · 宣城"
  "河北工业大学" = "天津 · 天津"
  "河海大学" = "江苏 · 南京"
  "湖南大学" = "湖南 · 长沙"
  "湖南师范大学" = "湖南 · 长沙"
  "华北电力大学（保定）" = "河北 · 保定"
  "华北电力大学（北京）" = "北京 · 北京"
  "华东理工大学" = "上海 · 上海"
  "华东师范大学" = "上海 · 上海"
  "华南理工大学" = "广东 · 广州"
  "华南师范大学" = "广东 · 广州"
  "华中科技大学" = "湖北 · 武汉"
  "华中农业大学" = "湖北 · 武汉"
  "华中师范大学" = "湖北 · 武汉"
  "吉林大学" = "吉林 · 长春"
  "暨南大学" = "广东 · 广州"
  "江南大学" = "江苏 · 无锡"
  "兰州大学" = "甘肃 · 兰州"
  "辽宁大学" = "辽宁 · 沈阳"
  "南京大学" = "江苏 · 南京"
  "南京航空航天大学" = "江苏 · 南京"
  "南京理工大学" = "江苏 · 南京"
  "南京农业大学" = "江苏 · 南京"
  "南京师范大学" = "江苏 · 南京"
  "南昌大学" = "江西 · 南昌"
  "南开大学" = "天津 · 天津"
  "内蒙古大学" = "内蒙古 · 呼和浩特"
  "宁夏大学" = "宁夏 · 银川"
  "北京体育大学" = "北京 · 北京"
  "青海大学" = "青海 · 西宁"
  "清华大学" = "北京 · 北京"
  "厦门大学" = "福建 · 厦门"
  "山东大学" = "山东 · 济南"
  "山东大学（威海）" = "山东 · 威海"
  "陕西师范大学" = "陕西 · 西安"
  "上海财经大学" = "上海 · 上海"
  "上海大学" = "上海 · 上海"
  "上海交通大学" = "上海 · 上海"
  "上海交通大学医学院" = "上海 · 上海"
  "上海外国语大学" = "上海 · 上海"
  "石河子大学" = "新疆 · 石河子"
  "四川大学" = "四川 · 成都"
  "四川农业大学" = "四川 · 雅安"
  "苏州大学" = "江苏 · 苏州"
  "太原理工大学" = "山西 · 太原"
  "天津大学" = "天津 · 天津"
  "天津医科大学" = "天津 · 天津"
  "同济大学" = "上海 · 上海"
  "武汉大学" = "湖北 · 武汉"
  "武汉理工大学" = "湖北 · 武汉"
  "西安电子科技大学" = "陕西 · 西安"
  "西安交通大学" = "陕西 · 西安"
  "西北大学" = "陕西 · 西安"
  "西北工业大学" = "陕西 · 西安"
  "西北农林科技大学" = "陕西 · 杨凌"
  "西藏大学" = "西藏 · 拉萨"
  "西南财经大学" = "四川 · 成都"
  "西南大学" = "重庆 · 重庆"
  "西南交通大学" = "四川 · 成都"
  "新疆大学" = "新疆 · 乌鲁木齐"
  "延边大学" = "吉林 · 延吉"
  "云南大学" = "云南 · 昆明"
  "长安大学" = "陕西 · 西安"
  "浙江大学" = "浙江 · 杭州"
  "浙江大学医学院" = "浙江 · 杭州"
  "郑州大学" = "河南 · 郑州"
  "中国传媒大学" = "北京 · 北京"
  "中国地质大学（北京）" = "北京 · 北京"
  "中国地质大学（武汉）" = "湖北 · 武汉"
  "中国海洋大学" = "山东 · 青岛"
  "中国科学技术大学" = "安徽 · 合肥"
  "中国矿业大学" = "江苏 · 徐州"
  "中国矿业大学（北京）" = "北京 · 北京"
  "中国农业大学" = "北京 · 北京"
  "中国人民大学" = "北京 · 北京"
  "中国人民解放军国防科技大学" = "湖南 · 长沙"
  "中国人民解放军空军军医大学" = "陕西 · 西安"
  "中国石油大学（北京）" = "北京 · 北京"
  "中国石油大学（北京克拉玛依校区）" = "新疆 · 克拉玛依"
  "中国石油大学（华东）" = "山东 · 青岛"
  "中国药科大学" = "江苏 · 南京"
  "中国政法大学" = "北京 · 北京"
  "中南财经政法大学" = "湖北 · 武汉"
  "中南大学" = "湖南 · 长沙"
  "中山大学" = "广东 · 广州"
  "中央财经大学" = "北京 · 北京"
  "中央民族大学" = "北京 · 北京"
  "重庆大学" = "重庆 · 重庆"
}

$CustomMapPoints = @{
  "广东 · 珠海" = @{ x = 60.8; y = 60.7 }
}

$ComprehensiveSubjectProvinces = @(
  "北京",
  "天津",
  "上海",
  "浙江",
  "山东",
  "海南"
)

if (-not (Test-Path -LiteralPath $SourceDir)) {
  throw "Source directory not found: $SourceDir"
}

if (-not (Test-Path -LiteralPath $RawTargetDir)) {
  New-Item -ItemType Directory -Path $RawTargetDir | Out-Null
}

$SourceDirPath = Get-CanonicalPath $SourceDir
$RawTargetDirPath = Get-CanonicalPath $RawTargetDir
if ($SourceDirPath -ne $RawTargetDirPath) {
  Get-ChildItem -LiteralPath $SourceDir -File -Filter "*_llm-only-m3.json" | Where-Object { Test-GaokaoRawFile $_.Name } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $RawTargetDir -Force
  }
}

$existing = Import-ExistingAdmissionData -Path $OutputFile
$jsonFiles = Get-ChildItem -LiteralPath $SourceDir -File -Filter "*_llm-only-m3.json" | Where-Object { Test-GaokaoRawFile $_.Name } | Sort-Object Name
$records = New-Object System.Collections.Generic.List[object]
$universitiesSeen = @{}
$parseErrors = New-Object System.Collections.Generic.List[string]

foreach ($file in $jsonFiles) {
  try {
    $parts = Get-SourceParts $file.Name
    $rawJson = [System.IO.File]::ReadAllText($file.FullName, $Utf8NoBom)
    $parsed = $rawJson | ConvertFrom-Json
    $translation = Get-PropValue $parsed "_translation"
  } catch {
    $parseErrors.Add("$($file.Name): $($_.Exception.Message)")
    continue
  }

  $province = $parts.Province
  $rawUniversityName = $parts.RawUniversityName
  $universityName = $parts.UniversityName
  $oldItem = $existing.ByName[$universityName]
  if ($null -eq $oldItem) {
    $oldItem = $existing.ByName[$rawUniversityName]
  }

  $universityId = $null
  if ($oldItem -and $oldItem.universityId) {
    $universityId = [string]$oldItem.universityId
  } elseif ($KnownIds.ContainsKey($universityName)) {
    $universityId = $KnownIds[$universityName]
  } else {
    $universityId = Get-StableHashId $universityName
  }

  $universityLocation = $null
  if ($UniversityLocations.ContainsKey($universityName)) {
    $universityLocation = $UniversityLocations[$universityName]
  } elseif ($UniversityLocations.ContainsKey($rawUniversityName)) {
    $universityLocation = $UniversityLocations[$rawUniversityName]
  } elseif ($oldItem -and $oldItem.universityLocation) {
    $universityLocation = [string]$oldItem.universityLocation
  } else {
    $universityLocation = "所在地待补充"
  }

  $map = $null
  if ($CustomMapPoints.ContainsKey($universityLocation)) {
    $map = $CustomMapPoints[$universityLocation]
  } elseif ($oldItem -and $oldItem.map) {
    $map = $oldItem.map
  }

  $universityNameEn = [string](Get-PropValue $translation "university_name_en")
  if ([string]::IsNullOrWhiteSpace($universityNameEn) -and $oldItem -and $oldItem.universityNameEn) {
    $universityNameEn = [string]$oldItem.universityNameEn
  }
  $provinceEn = [string](Get-PropValue $translation "province_en")

  $processedSubjectTypes = @{}
  foreach ($subjectProp in $parsed.PSObject.Properties) {
    if ([string]$subjectProp.Name -like "_*") {
      continue
    }

    $subjectType = Get-DisplaySubjectType ([string]$subjectProp.Name)

    if ($processedSubjectTypes.ContainsKey($subjectType)) {
      continue
    }
    $processedSubjectTypes[$subjectType] = $true

    if ($subjectType -eq "综合" -and ($ComprehensiveSubjectProvinces -notcontains $province)) {
      continue
    }

    $item = $subjectProp.Value
    $subjectTypeEn = [string](Get-PropValue $item "subject_type_en")
    $historyObject = Get-PropValue $item "往年"
    $history = New-Object System.Collections.Generic.List[object]

    foreach ($year in @(2021, 2022, 2023, 2024, 2025)) {
      $yearRow = Get-PropValue $historyObject ([string]$year)
      $history.Add([ordered]@{
        year = $year
        minScore = To-NullableNumber (Get-PropValue $yearRow "score")
        minRank = To-NullableNumber (Get-PropValue $yearRow "rank")
        planCount = $null
      })
    }

    $rankRangeObject = Get-PropValue $item "rank_range"
    $rankLow = To-NullableNumber (Get-PropValue $rankRangeObject "low")
    $rankHigh = To-NullableNumber (Get-PropValue $rankRangeObject "high")
    $rankRange = @()
    if ($null -ne $rankLow -and $null -ne $rankHigh) {
      $rankRange = @($rankLow, $rankHigh)
    }

    $scoreRangeObject = Get-PropValue $item "score_range"
    $scoreLow = To-NullableNumber (Get-PropValue $scoreRangeObject "low")
    $scoreHigh = To-NullableNumber (Get-PropValue $scoreRangeObject "high")
    $scoreRange = @()
    if ($null -ne $scoreLow -and $null -ne $scoreHigh) {
      $scoreRange = @($scoreLow, $scoreHigh)
    }

    $reasonResult = Convert-PredictionReason (Get-PropValue $item "prediction_reason") "预测依据" "预测结论"
    $reasonEnResult = Convert-PredictionReason (Get-PropValue $item "prediction_reason_en") "Prediction rationale" "预测结论"

    $predictedRank = To-NullableNumber (Get-PropValue $item "predicted_rank")
    $predictedScore = To-NullableNumber (Get-PropValue $item "predicted_score")
    $majorTierRecommendation = Get-PropValue $item "major_tier_recommendation"
    $majorTierRecommendationEn = Get-PropValue $item "major_tier_recommendation_en"

    $record = [ordered]@{
      province = $province
      provinceEn = $provinceEn
      subjectType = $subjectType
      subjectTypeEn = $subjectTypeEn
      universityId = $universityId
      universityName = $universityName
      universityNameEn = $universityNameEn
      universityLocation = $universityLocation
      majorGroup = "本科普通批"
      history = $history.ToArray()
      prediction = [ordered]@{
        year = 2026
        predictedScore = $predictedScore
        predictedRank = $predictedRank
        scoreRange = $scoreRange
        rankRange = $rankRange
        changeFromLastYear = $null
        confidence = "medium"
      }
      predictionReason = $reasonResult.Summary
      predictionReasonEn = $reasonEnResult.Summary
      predictionReasonSections = $reasonResult.Sections
      predictionReasonSectionsEn = $reasonEnResult.Sections
      majorTierRecommendation = $majorTierRecommendation
      majorTierRecommendationEn = $majorTierRecommendationEn
      sourceFile = $file.Name
      sourceNote = "$province，来源：gaokao_prediction。"
    }

    if ($null -ne $map) {
      $record.map = $map
    }

    $records.Add($record)
    $universitiesSeen[$universityId] = $universityName
  }
}

if ($parseErrors.Count -gt 0) {
  throw "Failed to parse $($parseErrors.Count) JSON files:`n$($parseErrors -join "`n")"
}

$provinceCount = @($records | ForEach-Object { $_.province } | Sort-Object -Unique).Count
$universityCount = $universitiesSeen.Count
$recordCount = $records.Count
$rawFileCount = $jsonFiles.Count

$meta = [ordered]@{
  targetYear = 2026
  historicalYears = @(2021, 2022, 2023, 2024, 2025)
  updatedAt = (Get-Date -Format "yyyy-MM-dd")
  provinceCount = $provinceCount
  universityCount = $universityCount
  recordCount = $recordCount
  rawFileCount = $rawFileCount
  isSampleData = $false
  badgeZh = "$provinceCount 省份 / $universityCount 所高校预测数据"
  badgeEn = "$provinceCount provinces / $universityCount university forecasts"
  sourceFolder = $SourceDir
  sourceNote = "预测数据覆盖 2021-2025 历史分数/位次与 2026 模型预测位次；最终以各省市教育考试院和高校官方信息为准。"
}

$metaJson = $meta | ConvertTo-Json -Depth 20
$dataJson = $records.ToArray() | ConvertTo-Json -Depth 30
$content = @"
(function () {
  window.gaokaoAdmissionPredictionMeta = $metaJson;

  window.gaokaoAdmissionPredictionData = $dataJson;
})();
"@

[System.IO.File]::WriteAllText($OutputFile, $content, $Utf8NoBom)

Write-Host "Synced raw files: $((Get-ChildItem -LiteralPath $SourceDir -File).Count)"
Write-Host "JSON files parsed: $rawFileCount"
Write-Host "Records generated: $recordCount"
Write-Host "Provinces: $provinceCount"
Write-Host "Universities: $universityCount"
Write-Host "Output: $OutputFile"
