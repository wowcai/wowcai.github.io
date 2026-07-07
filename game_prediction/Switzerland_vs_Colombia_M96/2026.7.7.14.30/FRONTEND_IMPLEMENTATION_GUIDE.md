# Wowcai 淘汰赛预测前端接入说明（v6.2.2 bilingual）

## 本次修正目标

v6.2 只修改前端输出契约，不改变主预测逻辑。修正点：

1. 常规时间矩阵恢复为完整 6x6 bucket dense matrix，不再只给 Top-5。
2. 常规时间偏差空间恢复完整 score-space points，并恢复三个高偏离场景：开放/大比分、一边倒/崩盘、爆冷。
3. 加时赛和点球大战都新增 `key_factors`，前端不要再把比分解释当作关键因素。
4. 加时赛 Tail Focus 改为三类条件尾部情景：加时偷袭/一球决胜、加时开放/双方进球、体能崩盘/加时打穿。
5. 点球大战矩阵增加 `6+` bucket，表示进入第6轮及之后的延长点球。
6. 点球大战 Tail Focus 改为三类情景：门将连续扑点、热门方压力失误、延长点球决胜。
7. v6.2.2 在同一 JSON 对象内补充英文 sibling 字段，例如 `text_cn/text_en`、`label_cn/label_en`、`definition_cn/definition_en`、`rationale_cn/rationale_en`、`script_cn/script_en`。

## 前端只需要读取这些文件

```text
match_card.json
match_detail.json
normal_time_matrix.json
normal_time_deviation.json
extra_time_matrix.json
extra_time_deviation.json
penalty_matrix.json
penalty_deviation.json
manifest.json
FRONTEND_IMPLEMENTATION_GUIDE.md
```

不要让前端直接读取 `knockout_path_report.json/md`、`latest_state_v7.json`、CSV、`tail_forecast_report.json` 或完整 path distribution。那些保留在 report 目录用于后端审计。

## 1. 概览页卡片

读取 `match_card.json`：

- `advancement.team_a/team_b`：最终晋级概率。
- `resolution.normal_time/extra_time/penalties`：解决方式概率。
- `normal_time_top_scores`：90分钟 Top 比分。
- `entry_probability.extra_time/penalties`：进入加时、进入点球概率。
- `display_path_top3`：UI代表路径，覆盖90分钟、加时、点球。不要用 `raw_path_top` 做左侧主展示。

## 2. 详情页总配置

读取 `match_detail.json`：

- 顶部：`summary.advancement` + `summary.resolution`。
- 左侧晋级路径：`summary.display_path_top3` 或 `left_panel.path_focus_top3`。
- 三个Tab：`tabs.normal_time`、`tabs.extra_time`、`tabs.penalties`。
- 每个Tab都有：`matrix_file`、`deviation_file`、`tail_focus`、`key_factors`。
- 中文页面优先读 `*_cn`；英文页面优先读同对象内的 `*_en`。例如关键因素可读 `key_factors[].text_cn/text_en`，Tail 可读 `tail_focus[].label_cn/label_en`。

## 3. 常规时间 Tab

读取：

```text
normal_time_matrix.json
normal_time_deviation.json
```

### normal_time_matrix.json

- `matrix_type = normal_time_score_dense_6x6_bucketed`
- `row_axis.buckets = [0,1,2,3,4,5+]`
- `column_axis.buckets = [0,1,2,3,4,5+]`
- `matrix`：二维概率矩阵。
- `cells`：每个格子的概率与该bucket内Top比分。
- `rows`：完整原始比分行，按概率排序。

口径：90分钟比分概率，不含加时和点球。

### normal_time_deviation.json

- `points`：完整比分偏差空间点。
- `tail_focus_type = normal_time_three_scenarios`
- `tail_focus` 固定三类：
  1. 开放 / 大比分
  2. 一边倒 / 崩盘
  3. 爆冷 / 非热门方取胜

前端的“高偏离聚焦预测”必须读取 `tail_focus`，不要从Top比分自行生成。

## 4. 加时赛 Tab

读取：

```text
extra_time_matrix.json
extra_time_deviation.json
```

- 只在90分钟打平时生效。
- `conditional_probability` 是进入加时后的条件概率，适合Tab内展示。
- `joint_probability` 是整场比赛走到该路径的联合概率，适合解释路径贡献。
- 加时矩阵是“加时增量”，不是全场最终比分：`0-0` 表示加时仍平进入点球，`1-0` 表示 Switzerland 加时多进1球。
- `key_factors` 是加时真正影响因素，包括体能、替补、风险偏好、定位球、牌面、点球预期。
- `tail_focus_type = extra_time_three_scenarios`
- `tail_focus` 固定三类：
  1. 加时偷袭 / 一球决胜
  2. 加时开放 / 双方进球
  3. 体能崩盘 / 加时打穿

注意：`0-0 加时仍平` 是常见路径，不应作为高偏离卡片的第一类展示。

## 5. 点球大战 Tab

读取：

```text
penalty_matrix.json
penalty_deviation.json
```

- 只在90分钟打平且加时仍平时生效。
- `matrix_type = penalty_score_dense_7x7_bucketed_6plus`
- 点球矩阵 bucket 为 `[0,1,2,3,4,5,6+]`。
- `6+` 表示进入第6轮及之后的突然死亡延长点球。
- `winner_probability.team_a/team_b` 用于点球胜率环图。
- `key_factors` 是点球真正影响因素，包括门将、主罚手深度、人员留存、压力、历史经验、左右脚习惯。
- `tail_focus_type = penalty_three_scenarios`
- `tail_focus` 固定三类：
  1. 门将连续扑点
  2. 热门方压力失误
  3. 延长点球决胜

前端不要把点球Top比分当作高偏离情景。

## 6. 推荐渲染顺序

每个Tab建议按以下顺序渲染：

1. 概率卡 / 环图
2. Top比分卡
3. 矩阵热力图
4. 偏差空间散点图
5. Tail Focus 三张卡片
6. Key Factors 关键因素列表

## 7. 字段含义速查

- `probability`：该对象主概率字段。
- `conditional_probability`：进入该阶段后的条件概率。
- `joint_probability`：整场比赛路径联合概率。
- `tail_focus`：人工可读的高偏离/尾部情景卡片。
- `key_factors`：真正影响因素，不是比分解释。
- `display_path_top3`：UI代表晋级路径。
- `raw_path_top`：数学上按单条路径概率排序的原始路径，一般不用于主UI。
- `*_cn` / `*_en`：同一对象内的中英文字段；不要读取单独英文文件。
