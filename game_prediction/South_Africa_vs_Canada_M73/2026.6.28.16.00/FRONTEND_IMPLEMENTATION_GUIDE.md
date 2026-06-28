# Wowcai 淘汰赛预测前端接入说明（v6.1）

## 目标效果

请按用户提供的网页图例实现：

- 概览页：每场比赛是一张“晋级卡”，突出最终晋级概率、解决方式概率、90分钟Top比分、进入加时/点球概率。
- 详情页：顶部显示最终晋级概率和解决方式概率；左侧显示晋级路径Top3；主体使用三个Tab：常规时间、加时赛、点球大战。
- 三个Tab样式一致：概率卡 + 矩阵 + 偏离空间 + Tail Focus + 关键因素/说明。

## 前端只需要读取这些文件

```text
match_card.json                    # 概览卡片
match_detail.json                  # 详情页顶部、左侧、Tab配置
normal_time_matrix.json            # 常规时间比分矩阵
normal_time_deviation.json         # 常规时间偏离空间/Tail
extra_time_matrix.json             # 加时赛增量矩阵
extra_time_deviation.json          # 加时赛偏离空间/Tail
penalty_matrix.json                # 点球大战比分矩阵
penalty_deviation.json             # 点球大战偏离空间/Tail
manifest.json                      # 版本和质量说明
FRONTEND_IMPLEMENTATION_GUIDE.md   # 本说明
```

不要让前端直接读取 `prediction_brief.md/json`、`knockout_path_report`、CSV或完整path distribution；这些仅保留在report目录用于后端审计。

## 概览页卡片

读取 `match_card.json`：

- `advancement.team_a/team_b`：最终晋级概率，显示为 `South Africa xx% | Canada yy%`。
- `resolution.normal_time/extra_time/penalties`：解决方式条，绿色=90分钟，黄色=加时，红色=点球。
- `normal_time_top_scores`：90分钟Top3比分。
- `entry_probability.extra_time/penalties`：进入加时、进入点球概率。
- `display_path_top3`：UI代表路径，分别覆盖90分钟、加时、点球，不要用raw path_top做左侧展示。

## 详情页布局

读取 `match_detail.json`：

- 顶部：`summary.advancement` + `summary.resolution`。
- 左侧晋级路径Top3：`summary.display_path_top3` 或 `left_panel.path_focus_top3`。
- Tab配置：`tabs.normal_time`、`tabs.extra_time`、`tabs.penalties`。

### Tab 1：常规时间（90分钟）

- 矩阵：`normal_time_matrix.json`
- 偏离空间/Tail：`normal_time_deviation.json`
- 口径：只预测90分钟，不含加时和点球。

### Tab 2：加时赛（如进入）

- 矩阵：`extra_time_matrix.json`
- 偏离空间/Tail：`extra_time_deviation.json`
- 口径：条件概率，只有90分钟打平时生效。
- 矩阵是“加时增量”：`0-0`表示加时仍平进入点球，`1-0`表示South Africa在加时净胜一球。
- 前端优先展示 `matrix` 4x4网格；也可以读取 `rows` 作为卡片列表。

### Tab 3：点球大战（如进入）

- 矩阵：`penalty_matrix.json`
- 偏离空间/Tail：`penalty_deviation.json`
- 口径：条件概率，只有90分钟打平且加时仍平时生效。
- `winner_probability` 用于点球胜方环图；`rows` 用于点球比分Top列表。
- `tail_focus` 是真正的点球高偏离情景，例如门将连续扑点、热门球队压力失误、延长点球决胜，不是Top比分列表。

## 字段口径

- `conditional_probability`：进入该阶段后的条件概率，适合Tab内展示。
- `joint_probability`：整场比赛走到该路径的联合概率，适合晋级路径贡献分析。
- `display_path_top3`：展示用代表路径，固定覆盖不同解决方式。
- `raw_path_top`：数学上按单条路径概率排序的原始Top路径，通常不用于UI主展示。

## 推荐渲染

1. 概览页卡片只读 `match_card.json`。
2. 详情页先读 `match_detail.json`。
3. 根据用户点击Tab，再懒加载对应matrix/deviation JSON。
4. 不显示Markdown正文，不显示CSV。
