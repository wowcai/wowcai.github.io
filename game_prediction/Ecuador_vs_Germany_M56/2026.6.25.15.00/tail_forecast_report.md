# 高偏离聚焦预测报告

> V7.4.0 后处理工具 · Ecuador vs Germany

本报告在主预测完成后独立生成。主 Pipeline、胜平负、原始 Score Matrix 与每个比分的主概率均未修改。
LLM 只对高偏离候选进行证据筛选与有限重排；三个情景可能重叠，不能将其概率直接相加。

## 1. 冻结的主预测

- Ecuador 胜：24.4%
- 平局：28.9%
- Germany 胜：46.6%
- 主流比分：0-1（14.3%），1-1（13.6%），1-0（9.6%），0-0（9.3%），0-2（8.9%）

## 2. 高偏离情景总览

- 热门方：Germany；非热门方获胜基础概率：24.4%；热门方不胜：53.4%。

### 开放／大比分

- 情景总概率（来自冻结矩阵）：**20.9%**
- 关注等级：**medium**
- 证据强度：0.48
- 状态：revised
- 情景判断：证据真实且可溯源：德国前两场9球/xG6.11、7-1大胜库拉索（E_bf576c7cc364、E_75ff59ee8ace）是实证支撑；厄瓜多尔末轮必须赢球（E_faa23ed5f419、E_0175d2a2a793）是打开比赛的触发机制；厄瓜多尔对库拉索近30脚射门/三次中框/Curaçao门将15扑（E_272376825a68、E_6509da951ae6）说明其具备有限威胁；Schlotterbeck伤退（E_07ee22f1c8eb）是小幅防线弱化的真实依据。核心制约：厄瓜多尔本届0进球（E_26ea3387ccc5）是硬证据，终结极弱；德国有轮换动机且可能降速（E_a3478d552e15、E_57d715e5ce39）；厄瓜多尔被描述为吝啬防线（E_869557a0389e、E_129b7441d6a7）。高比分情景成立但整体概率偏低，候选需在机制上真实支撑而非线性外推。
- 边界提醒：厄瓜多尔0进球是本届赛事硬事实，2-3和2-4中给厄瓜多尔进2球的机制支撑偏弱；需防止把'必须赢球=能进球'的逻辑滑坡。德国轮换/降速可能压制总进球上行。0-4有rollout_9支撑且不依赖厄瓜多尔进球，机制最纯粹。2-3依赖厄瓜多尔终结改善，机制较薄但rollout_1有支撑，可保留低档位。2-4六球路径机制过度依赖两项同时成立的弱假设，应降级。

| 聚焦比分 | 主矩阵原概率 | 情景内原占比 | LLM后处理情景内占比 | 折算情景贡献 | 支持等级 |
|---|---:|---:|---:|---:|---:|
| 1-3 | 3.52% | 16.84% | 19.94% | 4.16% | +2 |
| 2-3 | 2.07% | 9.93% | 11.63% | 2.43% | +1 |
| 0-4 | 1.11% | 5.32% | 5.21% | 1.09% | +1 |
| 2-4 | 0.89% | 4.26% | 4.61% | 0.96% | +0 |

**1. 1-3**

- 比赛剧本：未提供
- 选择理由：德国强攻击证据最充分（9球、xG6.11、7-1），厄瓜多尔必须赢球后段会拉开阵型给德国转换空间，Schlotterbeck缺阵提供防线重组的小幅弱化；1-3对厄瓜多尔终结要求最低（仅需1球），与其本届0进球但拥有大量射门的现实最契合，机制链清晰。rollout中1-3出现于evidence_shortlist高产出推演。此分从2级保留。
- 证据：E_bf576c7cc364, E_75ff59ee8ace, E_468e1d90ca76, E_faa23ed5f419, E_0175d2a2a793, E_07ee22f1c8eb, E_12991ef16cfc, E_aeb5bd0c558a
- 机制：H_germany_attack_vs_ecuador_low_block, H_group_motivation_late_opening

**2. 2-3**

- 比赛剧本：未提供
- 选择理由：rollout_1给出2-3代表比分，机制为德国早段进球后厄瓜多尔加快节奏。德国攻击证据充分；厄瓜多尔进2球虽弱但有近30脚射门和三次中框的量支撑，Schlotterbeck缺阵提供小幅机制依据。该路径比1-3对厄瓜多尔终结要求高一阶，故降为1级。机制支撑真实存在，不应删除。
- 证据：E_bf576c7cc364, E_75ff59ee8ace, E_faa23ed5f419, E_0175d2a2a793, E_272376825a68, E_6509da951ae6, E_07ee22f1c8eb, E_12991ef16cfc
- 机制：H_germany_attack_vs_ecuador_low_block, H_ecuador_chance_creation_vs_germany_rebuilt_cb, H_group_motivation_late_opening

**3. 0-4**

- 比赛剧本：未提供
- 选择理由：德国早球后厄瓜多尔被迫彻底打开、德国连续利用转换是完整机制链，不依赖厄瓜多尔进球，与其0进球硬事实不冲突。rollout_9给出0-4代表比分，且active mechanism包含H_germany_attack_vs_ecuador_low_block和H_group_motivation_late_opening。德国轮换和厄瓜多尔低位紧凑是真实制约，因此保留1级支持而非更高。
- 证据：E_bf576c7cc364, E_75ff59ee8ace, E_468e1d90ca76, E_faa23ed5f419, E_0175d2a2a793, E_869557a0389e, E_129b7441d6a7
- 机制：H_germany_attack_vs_ecuador_low_block, H_group_motivation_late_opening

**4. 2-4**

- 比赛剧本：未提供
- 选择理由：六球要求德国4球+厄瓜多尔2球同时成立。德国4球有进攻证据但需轮换后仍保持高效，厄瓜多尔2球严重依赖其终结改善——而本届0进球是硬反证。两项弱假设叠加使该路径极端，support_grade=0表示存于候选池但几乎无正向净支持。保留是因为原候选池包含此分，且不改变总概率分配。
- 证据：E_bf576c7cc364, E_75ff59ee8ace, E_272376825a68, E_07ee22f1c8eb, E_26ea3387ccc5, E_a3478d552e15
- 机制：H_germany_attack_vs_ecuador_low_block, H_ecuador_chance_creation_vs_germany_rebuilt_cb

### 一边倒／崩盘

- 情景总概率（来自冻结矩阵）：**9.4%**
- 关注等级：**low**
- 证据强度：0.50
- 状态：revised
- 情景判断：德国进攻产出数据真实且来自FIFA/ESPN一级来源（9球、xG 6.11、7-1），厄瓜多尔零进球和终结弱点有FIFA/The Guardian/The Athletic多方确认。动机错位（德国轮换vs厄瓜多尔必须赢）和德国后防重组均有Reuters直接报道。崩盘路径机制链完整，但厄瓜多尔低位纪律和德国轮换降速构成真实制约，因此attention_level维持low。
- 边界提醒：7-1样本来自Curaçao，不可直接外推至防守更强的厄瓜多尔。德国已锁定头名存在真实轮换和降速动机，且官方首发未确认。厄瓜多尔低位三中卫结构和Caicedo保护真实有效，可能把领先差压缩在2球内。崩盘成立需要德国早破门叠加厄瓜多尔被迫前压，缺一则路径退回主预测区间。

| 聚焦比分 | 主矩阵原概率 | 情景内原占比 | LLM后处理情景内占比 | 折算情景贡献 | 支持等级 |
|---|---:|---:|---:|---:|---:|
| 0-3 | 4.44% | 47.24% | 44.97% | 4.23% | +1 |
| 0-4 | 1.11% | 11.81% | 16.13% | 1.52% | +2 |
| 1-4 | 0.81% | 8.66% | 8.90% | 0.84% | +1 |
| 0-5 | 0.44% | 4.72% | 4.81% | 0.45% | +0 |

**1. 0-3**

- 比赛剧本：德国在前段通过边路或定位球打开局面，厄瓜多尔因必须追分逐步放弃低位结构；德国控球压制并利用转换空间在60-90分钟再进第二、三球；厄瓜多尔终结持续低效（对Curaçao近30脚仍0-0），无法完成追分。
- 选择理由：0-3是候选池中基础概率最高的德国方向崩盘比分（base 0.0444），符合德国实力和厄瓜多尔进攻效率低的组合。H_germany_attack_vs_ecuador_low_block和H_group_motivation_late_opening均支持路径合理性。相比0-4，0-3缺少rollout直接代表，但作为最低达标崩盘比分其概率权重本身已反映更高可能性，support_grade=1合理。
- 证据：E_bf576c7cc364, E_75ff59ee8ace, E_272376825a68, E_6509da951ae6, E_faa23ed5f419, E_0175d2a2a793, E_b62e63e64057
- 机制：H_germany_attack_vs_ecuador_low_block, H_group_motivation_late_opening

**2. 0-4**

- 比赛剧本：德国0-30分钟利用高质量创造（H_germany_attack_vs_ecuador_low_block）早破两球；厄瓜多尔必须赢球压力迫使翼卫和中场前压（H_group_motivation_late_opening），三中卫身前保护区暴露；德国通过转换和肋部插入30-60分钟再进第三球；后段厄瓜多尔继续前压但终结低效，德国补进第四球。rollout_9直接给出0-4代表比分并包含完整崩盘事件链。
- 选择理由：0-4在德国方向崩盘路径中兼具机制完整性和直接rollout支撑。德国进攻数据（9球/xG 6.11/7-1）提供方向性基础，厄瓜多尔终结弱点（finishing_state 0.36、本届零进球）和必须赢球的前压触发机制共同支撑四球差的合理性。rollout_9作为独立路径验证，激活了H_germany_attack_vs_ecuador_low_block、H_group_motivation_late_opening、H_germany_rotation_low_block_low_tempo三个机制。
- 证据：E_bf576c7cc364, E_75ff59ee8ace, E_468e1d90ca76, E_272376825a68, E_6509da951ae6, E_faa23ed5f419, E_0175d2a2a793, E_57d715e5ce39, E_07ee22f1c8eb
- 机制：H_germany_attack_vs_ecuador_low_block, H_group_motivation_late_opening, H_germany_rotation_low_block_low_tempo

**3. 1-4**

- 比赛剧本：德国早段建立多球领先；厄瓜多尔在追分阶段通过边路宽度和二点球冲击德国重组后防（Schlotterbeck缺阵，Rüdiger-Tah首次搭档），取得一粒安慰球；但德国继续扩大比分，终结为四球差。
- 选择理由：1-4对应厄瓜多尔取得安慰球的开放崩盘分支，H_ecuador_chance_creation_vs_germany_rebuilt_cb提供了可信机制入口：厄瓜多尔对Curaçao制造大量射门和三次中框，说明其存在进入危险区域的能力；Schlotterbeck缺阵后的后防重组（Reuters确认）为厄瓜多尔取分提供机会窗口。但厄瓜多尔前两场零进球和终结弱点使该分支不如0-4直接，support_grade=1。
- 证据：E_272376825a68, E_6509da951ae6, E_07ee22f1c8eb, E_12991ef16cfc, E_bf576c7cc364, E_75ff59ee8ace, E_faa23ed5f419
- 机制：H_germany_attack_vs_ecuador_low_block, H_ecuador_chance_creation_vs_germany_rebuilt_cb, H_group_motivation_late_opening

**4. 0-5**

- 比赛剧本：德国极早建立三球差，厄瓜多尔完全放弃防守结构全力前压；德国在60-90分钟持续通过转换得分；厄瓜多尔终结继续低效，无法缩小比分。该路径需要德国不降速且厄瓜多尔防守纪律完全崩溃，条件极为苛刻。
- 选择理由：0-5需要德国进攻全力输出叠加厄瓜多尔防守结构完全瓦解，但德国锁定头名后的轮换和降速动机（Reuters/Evening Standard/Yahoo Sports均有报道）与该路径直接冲突。厄瓜多尔低位紧凑性（The Guardian/The Athletic确认）和Caicedo保护作用是真实制约。仅德国高产攻击数据提供方向性支持，不足以单独支撑五球差，support_grade=0作为极端尾部保留。
- 证据：E_bf576c7cc364, E_75ff59ee8ace, E_faa23ed5f419, E_a3478d552e15, E_869557a0389e
- 机制：H_germany_attack_vs_ecuador_low_block, H_group_motivation_late_opening

### 爆冷

- 情景总概率（来自冻结矩阵）：**24.4%**
- 关注等级：**medium**
- 证据强度：0.48
- 状态：revised
- 情景判断：爆冷成立但概率受限。核心支撑：德国已锁定头名存在真实轮换语境（Wirtz/Havertz/Neuer可能休息，证据层级B可信），Schlotterbeck确认伤退后防需重组（Reuters层级B强证据），厄瓜多尔末轮必须赢球动机明确（ESPN/Yahoo Sports），厄瓜多尔防守紧凑有韧性（首战仅0-1小负）。核心制约：厄瓜多尔前两场零进球，对Curaçao近30射门仍未破门，finishing_state=0.36，终结短板是真实证据而非幻觉；德国即使轮换整体strength=0.82远高于Ecuador 0.62。
- 边界提醒：厄瓜多尔本届赛事零进球是最强反向证据，2球及以上爆冷路径需要其在一场比赛内突破整届赛事的进球困境；不应因爆冷情景的独立分析语境而忽视该约束。德国轮换幅度未经官方首发确认，support_grade不应基于最大化轮换假设。

| 聚焦比分 | 主矩阵原概率 | 情景内原占比 | LLM后处理情景内占比 | 折算情景贡献 | 支持等级 |
|---|---:|---:|---:|---:|---:|
| 1-0 | 9.59% | 39.24% | 46.33% | 11.33% | +2 |
| 2-1 | 6.30% | 25.76% | 25.17% | 6.15% | +1 |
| 2-0 | 3.33% | 13.64% | 11.10% | 2.71% | +0 |

**1. 1-0**

- 比赛剧本：未提供
- 选择理由：最具证据支撑的爆冷路径。厄瓜多尔防守紧凑（low_block_compactness=0.78，Caicedo保护三中卫）能压低比分，Caicedo等核心防线齐整无新增伤病；德国提前锁定头名+可能轮换核心攻击手，使其创造效率真实下降；厄瓜多尔必须赢球动机可触发后段边路和定位球冲击德国重组中卫。仅需厄瓜多尔进1球——对Curaçao30射门三中框说明机会是真实的，只需1次终结奏效。完全零封德国有挑战（德国attack=0.8），但1-0是爆冷情景中最小化终结依赖、最大化防守优势的合理比分。
- 证据：E_faa23ed5f419, E_0175d2a2a793, E_869557a0389e, E_129b7441d6a7, E_c06212d66a9e, E_57d715e5ce39, E_a3478d552e15, E_07ee22f1c8eb, E_272376825a68, E_6509da951ae6
- 机制：H_germany_rotation_low_block_low_tempo, H_ecuador_chance_creation_vs_germany_rebuilt_cb, H_group_motivation_late_opening

**2. 2-1**

- 比赛剧本：未提供
- 选择理由：次优爆冷路径，需要厄瓜多尔进2球，对其本届零进球记录是更高要求，但机制上可成立：德国重组后防+轮换攻击线确实会回一球，厄瓜多尔必须赢球后段压上能制造更多机会，边路宽度和Estupiñán的交叉传中是具体威胁点。support_grade降为1而非更高，因为厄瓜多尔同时进2球且守住德国进1球的联合概率明显低于1-0路径，不能因为该比分在原池中概率绝对值高于1-0就给更高支持度——爆冷情景下的机制成立性才是分级依据。
- 证据：E_faa23ed5f419, E_0175d2a2a793, E_272376825a68, E_6509da951ae6, E_07ee22f1c8eb, E_12991ef16cfc, E_a3478d552e15, E_bf576c7cc364
- 机制：H_ecuador_chance_creation_vs_germany_rebuilt_cb, H_group_motivation_late_opening, H_germany_rotation_low_block_low_tempo

**3. 2-0**

- 比赛剧本：未提供
- 选择理由：保留为边缘候选。需要厄瓜多尔进2球且德国被完全压制不进球，在厄瓜多尔finishing_state=0.36、本届零进球的前提下属于极低概率叠加。德国attack=0.8，即使大幅轮换也难被完全封锁。该比分在候选池中合法存在，保留但给最低支持度，避免删除后丢失候选多样性。
- 证据：E_57d715e5ce39, E_a3478d552e15, E_07ee22f1c8eb, E_272376825a68, E_26ea3387ccc5
- 机制：H_germany_rotation_low_block_low_tempo, H_ecuador_chance_creation_vs_germany_rebuilt_cb

## 3. 方法与解释边界

- 情景总概率完全来自原始联合比分矩阵，没有经过 LLM 调整。
- `主矩阵原概率`是正式主预测；不会被本工具覆盖。
- `LLM后处理情景内占比`只回答“该情景已经发生时，哪些比分更值得聚焦”。
- V7.4.2 对开放大比分和一边倒情景加入独立情景分析与候选多样化，避免机械回到最低达标比分。
- `折算情景贡献`等于情景总概率乘以后处理条件占比，是第二视图的参考值，不回写主矩阵。
- 开放大比分、一边倒崩盘和爆冷可能重叠，三类结果不可相加为总概率。

## 4. 运行状态

- 工具状态：ready
- Proposer：gpt-5.5（success）
- Auditor：claude-opus-4-8（success）
- 输入指纹：`64922e75cc04da186f5294f7d0b3042d1d8f8c0937a811014c8baf3d1138f0da`
