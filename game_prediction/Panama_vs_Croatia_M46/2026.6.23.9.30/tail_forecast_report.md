# 高偏离聚焦预测报告

> V7.4.0 后处理工具 · Panama vs Croatia

本报告在主预测完成后独立生成。主 Pipeline、胜平负、原始 Score Matrix 与每个比分的主概率均未修改。
LLM 只对高偏离候选进行证据筛选与有限重排；三个情景可能重叠，不能将其概率直接相加。

## 1. 冻结的主预测

- Panama 胜：17.6%
- 平局：28.1%
- Croatia 胜：54.4%
- 主流比分：0-1（16.4%），1-1（13.2%），0-2（12.5%），0-0（11.3%），1-2（8.1%）

## 2. 高偏离情景总览

- 热门方：Croatia；非热门方获胜基础概率：17.6%；热门方不胜：45.6%。

### 开放／大比分

- 情景总概率（来自冻结矩阵）：**18.6%**
- 关注等级：**medium**
- 证据强度：0.48
- 状态：revised
- 情景判断：开放情景有合理依据：Croatia中场优势压制Panama、Croatia防线脆弱性两者叠加可产生多球局面。但Panama进攻质量（首战0.75xG、Carrasquilla缺席）严重限制其稳定贡献进球。候选1-4与blowout池重叠且需Croatia转化率异常高，维持support_grade 0；2-2需要Panama打入两球，与Panama进攻质量证据冲突，将support_grade从0降至-1；1-3方向最贴合机制，维持。
- 边界提醒：开放情景高度依赖Croatia连续转化，Panama若保持低位紧凑则Croatia多次进攻可能只形成低质量外围尝试；雨天可能进一步压制传控节奏。
- 审计说明：2-2的support_grade由0降为-1，因Panama打入2球与首战0.75xG及Carrasquilla缺席明显冲突；1-4维持support_grade 0，其余不变。

| 聚焦比分 | 主矩阵原概率 | 情景内原占比 | LLM后处理情景内占比 | 折算情景贡献 | 支持等级 |
|---|---:|---:|---:|---:|---:|
| 1-3 | 3.78% | 20.28% | 23.96% | 4.46% | +1 |
| 2-2 | 3.07% | 16.50% | 13.81% | 2.57% | -1 |
| 1-4 | 1.89% | 10.14% | 9.98% | 1.86% | +0 |

**1. 1-3**

- 比赛剧本：Croatia通过Modric、Kovacic型中场掌控节奏先取领先；Panama在被迫前压时通过翼卫宽区反击追回一球，但后续防线被Croatia持续禁区占位再次击穿，形成Croatia两球差的开放结局。
- 选择理由：最贴合主机制：体现Croatia中场优势、Panama少量宽区出口、Croatia防线并非绝对稳固，是开放池中最有据可查的Croatia方向比分。
- 证据：E_d541bc940f55, E_f847cd06284f, E_b29147e14ba6, E_d25a6b2b1d9d, E_22df4a960496, E_ccdb0385671f
- 机制：H_midfield_carrasquilla_croatia_control, H_croatia_backline_repair_panama_width, H_group_pressure_croatia_favourite_posture

**2. 2-2**

- 比赛剧本：Croatia控球占优并多次进入前场，但防线在边路身后暴露；Panama依靠翼卫出口或定位球拿到两球，Croatia凭前场回合数扳平。
- 选择理由：Croatia防线脆弱性提供少量依据，但Panama打入2球与首战0.75xG及核心中场缺席明显相悖，降为弱支持。
- 证据：E_22df4a960496, E_fbce61be9472, E_f847cd06284f, E_56fb38e6b808, E_37356042e01e, E_745dffda44a0
- 机制：H_croatia_backline_repair_panama_width, H_group_pressure_croatia_favourite_posture

**3. 1-4**

- 比赛剧本：Croatia早段建立领先后Panama不得不扩大阵型；Panama通过一次宽区推进取得进球，但比赛后段因中路连接不足被Croatia连续扩大比分。
- 选择理由：方向与主机制一致，但需要Croatia转化率显著高于常规预期，且与blowout候选重叠，维持中性支持。
- 证据：E_d541bc940f55, E_4c3e581e0390, E_f847cd06284f, E_ccdb0385671f, E_38d3162653e5
- 机制：H_midfield_carrasquilla_croatia_control, H_group_pressure_croatia_favourite_posture

### 一边倒／崩盘

- 情景总概率（来自冻结矩阵）：**11.8%**
- 关注等级：**medium_high**
- 证据强度：0.56
- 状态：revised
- 情景判断：Croatia方向一边倒有较强证据基础：Carrasquilla缺席削弱Panama中路、Croatia中场质量优势明显、Panama首战进攻产量极低。3-0是最贴合机制的崩盘比分且rollout有对应代表情景。0-4维持作为进一步放大版本。1-4维持中性。3-0（Panama大胜）方向与崩盘情景定义（Croatia大胜）存在情景身份混乱，且Panama进攻质量证据与其打出3-0严重相悖，予以删除。
- 边界提醒：崩盘脚本高度依赖首球时间和Panama是否被迫改变低位策略。Croatia若先求防守稳定或Panama长期保持紧凑低位，比分可能停留在小胜或两球差范围。
- 审计说明：删除3-0（Panama大胜）候选：该比分在blowout情景中方向错置（崩盘定义为任一方净胜3球，但Croatia是强方，Panama方向崩盘需极端反转），且Panama首战0.75xG与Carrasquilla缺席使其打出3-0无法从证据中找到足够支撑；此外该比分已在upset池中覆盖。其余三个候选保留，support_grade不变。

| 聚焦比分 | 主矩阵原概率 | 情景内原占比 | LLM后处理情景内占比 | 折算情景贡献 | 支持等级 |
|---|---:|---:|---:|---:|---:|
| 0-3 | 4.96% | 42.14% | 50.04% | 5.89% | +2 |
| 0-4 | 1.85% | 15.72% | 15.45% | 1.82% | +1 |
| 1-4 | 1.89% | 16.04% | 13.13% | 1.55% | +0 |

**1. 0-3**

- 比赛剧本：Croatia中场压制Panama长期回低位，早段或上半场取得领先；Panama缺少Carrasquilla后难以稳定出球至前场，反击次数少且质量不足。Croatia下半场通过持续控球、边路传中或二次进攻再入两球，最终零封大胜。
- 选择理由：崩盘池中最贴合主机制的比分：体现Croatia优势而无需比赛完全失控到超高总进球；rollout中有对应代表情景支持。
- 证据：E_d541bc940f55, E_4c3e581e0390, E_f847cd06284f, E_b29147e14ba6, E_d25a6b2b1d9d, E_745dffda44a0, E_ccdb0385671f
- 机制：H_midfield_carrasquilla_croatia_control, H_group_pressure_croatia_favourite_posture

**2. 0-4**

- 比赛剧本：Croatia控球和前场压迫快速打开局面，Panama因中路推进受阻长期无法出球；第二球较早出现后Panama阵型被拉开，Croatia通过禁区人数优势和替补冲击继续扩大比分。
- 选择理由：0-3脚本的进一步放大，方向有证据支撑但需Croatia攻击效率明显偏高，支持低于0-3。
- 证据：E_d541bc940f55, E_f847cd06284f, E_ccdb0385671f, E_38d3162653e5, E_745dffda44a0
- 机制：H_midfield_carrasquilla_croatia_control, H_group_pressure_croatia_favourite_posture

**3. 1-4**

- 比赛剧本：Croatia总体压制并多次进球，但Panama仍通过翼卫宽区推进或定位球取得一球；随后Croatia借Panama追分后的空间继续扩大为三球差。
- 选择理由：兼容Croatia大胜与防线脆弱性，但需两方同时具备较高转化率，且Panama进攻质量证据不足，仅作中性关注。
- 证据：E_22df4a960496, E_f847cd06284f, E_56fb38e6b808, E_d541bc940f55, E_745dffda44a0
- 机制：H_midfield_carrasquilla_croatia_control, H_croatia_backline_repair_panama_width, H_group_pressure_croatia_favourite_posture

### 爆冷

- 情景总概率（来自冻结矩阵）：**17.6%**
- 关注等级：**medium**
- 证据强度：0.34
- 状态：revised
- 情景判断：Panama爆冷适用但证据强度有限。可行路径为低位守住并利用Croatia防线漏洞制造少数高价值机会。反向压力强：Carrasquilla缺席、首战0.75xG、Croatia中场质量优势。3-2需要Panama打入3球，与现有证据严重相悖，降为-2；其余维持。
- 边界提醒：Panama取胜高度依赖低频事件和反击效率，现有证据无强支撑；Croatia中场若顺利控场，爆冷路径迅速收窄。
- 审计说明：3-2的support_grade由-1降为-2：Panama打入3球需要其进攻产量远超首战水平，而Carrasquilla缺席和0.75xG均指向相反方向，-1仍过于宽松；其余三个候选support_grade不变。

| 聚焦比分 | 主矩阵原概率 | 情景内原占比 | LLM后处理情景内占比 | 折算情景贡献 | 支持等级 |
|---|---:|---:|---:|---:|---:|
| 1-0 | 7.78% | 44.30% | 46.16% | 8.10% | +0 |
| 2-1 | 4.07% | 23.21% | 24.18% | 4.24% | +0 |
| 2-0 | 2.41% | 13.71% | 12.14% | 2.13% | -1 |
| 3-2 | 1.15% | 6.54% | 4.77% | 0.84% | -2 |

**1. 1-0**

- 比赛剧本：Panama长时间保持低位紧凑，Croatia控球但未能持续创造清晰机会；Panama通过一次边路反击、定位球或二点球取得领先，随后压缩空间守住比分。
- 选择理由：若爆冷发生，低比分小胜最符合Panama进攻质量有限和低位策略预期；Croatia整体优势明显，仅中性支持。
- 证据：E_22df4a960496, E_f847cd06284f, E_56fb38e6b808, E_37356042e01e, E_745dffda44a0
- 机制：H_croatia_backline_repair_panama_width

**2. 2-1**

- 比赛剧本：Croatia凭控球取得进球或持续施压，但Panama利用宽区转换两次打到Croatia防线身后；比赛后段Croatia追分加速，Panama防线承压但守住一球优势。
- 选择理由：保留Croatia进球能力同时反映其防线近期脆弱；但需Panama显著高于首战的机会转化，仍为中性偏谨慎。
- 证据：E_22df4a960496, E_fbce61be9472, E_f847cd06284f, E_56fb38e6b808, E_d541bc940f55, E_745dffda44a0
- 机制：H_croatia_backline_repair_panama_width, H_group_pressure_croatia_favourite_posture

**3. 2-0**

- 比赛剧本：Panama早段依靠低位防守和一次转换领先，随后Croatia压上未果；Panama在后段利用更大反击空间再入一球并完成零封。
- 选择理由：需要Panama既高效进攻又限制Croatia整场不得分，与Croatia中场优势和Panama核心中场缺席的证据相冲突，仅作弱关注。
- 证据：E_22df4a960496, E_f847cd06284f, E_56fb38e6b808, E_d541bc940f55, E_b29147e14ba6, E_745dffda44a0
- 机制：H_croatia_backline_repair_panama_width

**4. 3-2**

- 比赛剧本：比赛因早球或Croatia追分被拉开，Panama多次通过宽区反击攻击Croatia身后，Croatia凭中场持续回应；Panama在高波动对攻中险胜。
- 选择理由：Panama打入3球需要其进攻产量远超首战水平，而Carrasquilla缺席和首战0.75xG均强烈指向相反方向；Croatia防线脆弱性提供极少量依据但不足以支撑Panama3球产量，降为最弱支持。
- 证据：E_22df4a960496, E_fbce61be9472, E_f847cd06284f, E_56fb38e6b808, E_d541bc940f55, E_745dffda44a0
- 机制：H_croatia_backline_repair_panama_width, H_group_pressure_croatia_favourite_posture

## 3. 方法与解释边界

- 情景总概率完全来自原始联合比分矩阵，没有经过 LLM 调整。
- `主矩阵原概率`是正式主预测；不会被本工具覆盖。
- `LLM后处理情景内占比`只回答“该情景已经发生时，哪些比分更值得聚焦”。
- `折算情景贡献`等于情景总概率乘以后处理条件占比，是第二视图的参考值，不回写主矩阵。
- 开放大比分、一边倒崩盘和爆冷可能重叠，三类结果不可相加为总概率。

## 4. 运行状态

- 工具状态：ready
- Proposer：gpt-5.5（success）
- Auditor：claude-opus-4-8（success）
- 输入指纹：`071de1df4b2652b15bb6647d1d42c4e7dbe65315c75db6d5894207b6e906c69b`
