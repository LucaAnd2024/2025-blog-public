# Obsidian 知识库搭建笔记：从零到好看好用

> 本手册目标：任何人把本文丢进 Hermes 或 OpenClaw 后，能独立搭建起一套完整的课程笔记知识库。
>
> 核心理念：**先找到能力，再采集素材，再处理内容，最后沉淀成可复用、可追溯、可继续扩展的知识资产。**

---

## 一、这个系统是什么，解决什么问题

这套知识库解决三个实际问题：

1. **来源散** — 课程来自 YouTube、B 站、论文，素材格式各异（VTT 字幕、PDF、网页），统一入口管理
2. **用不起来** — 记完就忘，复习时找不到，想引用不知道在哪
3. **无法积累** — 每学完一门课笔记就堆在那，下次捡起来成本极高

解决方案：用一套**固定的工作流程**处理所有素材，用 **Obsidian** 管理，用 **Hermes** 驱动。

---

## 二、先把 Hermes 跑起来

### 2.1 安装 Hermes

参考官方文档：[https://hermes-agent.nousresearch.com/docs/](https://hermes-agent.nousresearch.com/docs/)

安装完成后，启动 Hermes（确保模型配置好，推荐 MiniMax 或 Claude）。

### 2.2 验证 Hermes 可用

在对话里输入：

```
你好，你现在是谁
```

如果正常回复，说明 Hermes 跑通了，可以进入下一步。

---

## 三、用 Hermes 初始化知识库

这一步是核心——把下面的提示词丢给 Hermes，它会自动创建完整的目录结构和所有配置文件。

### 3.1 初始化提示词

**复制下面的全部内容，发给 Hermes：**

```
请帮我初始化一个 LLM Wiki，路径是：
`~/obsidian/luca-wiki`

目标：
- 用 Obsidian 可直接打开和维护
- 建立可持续迭代的知识库，不是一次性笔记仓库

请按下面要求执行：

1) 创建目录结构
- `raw/articles`
- `raw/papers`
- `raw/transcripts`
- `raw/assets`
- `entities`
- `concepts`
- `comparisons`
- `queries`
- `_templates`
- `courses`

2) 创建核心文件
- `SCHEMA.md`
- `index.md`
- `README.md`

3) 写 `SCHEMA.md`
- 定义 Domain：机器学习 / 深度学习 / 计算机视觉（可扩展）
- 定义 frontmatter 规范：title/created/updated/type/course/lecture/tags/sources
- 定义 tag taxonomy（给 10-20 个基础标签）
- 定义页面阈值（什么时候新建概念卡片，什么时候并入课程笔记）
- 定义 update policy（冲突信息如何记录，不直接覆盖）

4) 写 `index.md`
- 写明知识库的定位和使用方法
- 包含快速开始指南

5) 写 `_templates/course-note.md`
- 创建课程笔记模板，包含标准化 frontmatter
- 使用 Templater 语法实现交互式创建

完成后告诉我创建了哪些文件。
```

### 3.2 Hermes 会做什么

它会自动：
- 创建完整的目录结构
- 写 `SCHEMA.md`（定义字段规范、标签体系、更新策略）
- 写 `index.md`（知识库入口说明）
- 写 `_templates/course-note.md`（笔记模板）

### 3.3 用 Obsidian 打开

```bash
# 找到创建的文件夹路径
open ~/obsidian/luca-wiki
```

Obsidian → 打开本地仓库 → 选中 `luca-wiki` 文件夹

---

## 四、安装 Obsidian 插件

打开 Obsidian 后，安装以下两个插件：

### Templater（模板引擎）

1. 设置 → 社区插件 → 搜索「Templater」→ 安装 → 启用
2. 设置 → Templater → 模板文件夹位置 → 选择 `_templates`

作用：新建笔记时自动弹出对话框，填充 frontmatter 字段。

### Dataview（数据查询）

1. 设置 → 社区插件 → 搜索「Dataview」→ 安装 → 启用
2. 设置 → Dataview → 勾选「启用 JavaScript 查询」

作用：在任意笔记里写查询语句，动态显示笔记列表、进度统计。

### 启用 CSS 主题（可选）

Obsidian → 设置 → 外观 → CSS 代码片段 → 启用主题

如果 Hermes 创建的主题不够用，可以自己写 CSS，或找我帮你写。

---

## 五、处理 YouTube 视频的完整工作流

下面是把一个 YouTube 课程视频，变成一条结构化笔记的完整流程。

### Step 1：用 yt-dlp 下载字幕

**安装 yt-dlp（macOS）：**

```bash
brew install yt-dlp
```

**下载字幕：**

```bash
cd ~/Downloads
yt-dlp --write-subs --skip-download --sub-langs "zh-TW,zh-CN,en" \
  -o "%(title)s.%(ext)s" "视频链接"
```

常用参数说明：
- `--write-subs`：下载字幕
- `--skip-download`：不下载视频，只下字幕
- `--sub-langs "zh-TW,zh-CN,en"`：优先繁中 → 简中 → 英文字幕（中文字幕没有时自动降级）

字幕文件下载为 `.vtt` 格式，保存在 `~/Downloads/`。

### Step 2：把字幕交给 Hermes 整理

**复制以下提示词，连同字幕文件一起发给 Hermes：**

```
请帮我把这节课的字幕整理成 Obsidian 笔记。

要求：
1. 标题用中文，简洁，几个词
2. 结构：简介 → 核心概念（3-5 个章节）→ 总结
3. 每章有明确主题，不要按时间顺序流水账
4. 保留关键公式，用代码块包裹 LaTeX
5. 去掉口语词（"呃""嗯""这个"等）
6. 45 分钟的课整理成 3-5 页 Markdown，不要太长

文件命名格式：`{课程代码}-L{编号}-{简短标题}.md`
例如：`ML2021-L01-machine-learning-basics.md`

frontmatter 要求（放在笔记最顶部）：
---
title: "标题"
created: 2026-04-22
updated: 2026-04-22
type: course-note
course: "课程代码"
lecture: "L01"
status: completed
difficulty: medium
tags:
  - 标签1
  - 标签2
sources:
  - "视频链接"
---

请先把整理好的 Markdown 内容发给我，我确认后你再写入文件。
```

### Step 3：Hermes 写入文件

确认笔记内容无误后，告诉 Hermes：

```
内容没问题，请写入 `~/obsidian/luca-wiki/courses/{文件名}.md`
```

---

## 六、frontmatter 字段规范（SCHEMA.md 核心内容）

每篇笔记顶部的 YAML 元数据，格式固定：

```yaml
---
title: "笔记标题"
created: 2026-04-22
updated: 2026-04-22
type: course-note
course: "ML2021"
lecture: "L01"
status: completed
difficulty: medium
tags:
  - cnn
  - computer-vision
  - ml2021
sources:
  - "https://youtube.com/..."
---
```

| 字段 | 必须 | 说明 | 示例 |
|------|------|------|------|
| `title` | ✅ | 笔记标题 | `"CNN基础知识"` |
| `created` | ✅ | 创建日期 | `2026-04-22` |
| `updated` | ✅ | 最后更新 | `2026-04-22` |
| `type` | ✅ | 固定值 | `course-note` |
| `course` | ✅ | 课程代码 | `ML2021` |
| `lecture` | ✅ | 讲次（补零） | `L01` |
| `status` | ✅ | 笔记状态 | `completed` |
| `difficulty` | ✅ | 难度 | `easy/medium/hard` |
| `tags` | ✅ | 标签数组 | `["cnn", "ml"]` |
| `sources` | ✅ | 视频/资料链接 | `["链接"]` |

**注意**：`lecture` 字段必须补零（L01 而不是 L1），否则 Dataview 按字母排序会把 L10 排在 L2 前面。

---

## 七、用 Hermes 补充内容

### 7.1 添加概念卡片

如果某个概念跨多门课出现（比如「反向传播」在 ML2021 和 CS231N 里都有），可以建一张独立概念卡片：

**提示词：**

```
请帮我创建一个概念笔记，写入 `~/obsidian/luca-wiki/concepts/backpropagation.md`

主题：反向传播（Backpropagation）
要求：
- 定义：是什么，用来干什么
- 核心机制：链式法则、计算图
- 前向 vs 反向的区别
- 常见问题（梯度消失/爆炸）
- 与课程笔记的交叉引用

frontmatter：
---
title: "反向传播"
created: 2026-04-22
type: concept
tags:
  - deep-learning
  - optimization
sources:
  - "ML2021 L4"
  - "CS231N L4"
---
```

### 7.2 更新已有笔记

如果发现笔记有错误或需要补充：

```
请帮我更新 `~/obsidian/luca-wiki/courses/ML2021-L04-xxx.md`，
在「激活函数」章节补充 Leaky ReLU 和 ELU 的内容。
```

### 7.3 查询知识库

```
请列出 `~/obsidian/luca-wiki/courses/` 下所有笔记的：
- 文件名
- 课程
- 讲次
- 状态

按讲次排序。
```

---

## 八、Dataview 查询示例

在 Obsidian 任意笔记里创建代码块：

**查看所有课程笔记：**

````markdown
```dataview
TABLE course, lecture, status, difficulty
FROM "courses"
SORT file.name ASC
```
````

**按课程筛选：**

````markdown
```dataview
TABLE lecture, status, difficulty
FROM "courses"
WHERE course = "ML2021"
SORT lecture ASC
```
````

**统计某课程的完成进度：**

````markdown
```dataview
TABLE lecture, status
FROM "courses"
WHERE course = "CS231N-2025"
SORT lecture ASC
```
````

> **常见问题**：如果 Dataview 显示"No results"，检查 `WHERE` 条件中的值是否和 frontmatter 里的实际值完全一致（包括大小写）。

---

## 九、目录结构说明

```
luca-wiki/
├── courses/                  # 课程笔记（按课程分目录）
│   ├── ML2021-L01-xxx.md
│   └── CS231N-2025-L01-xxx.md
├── concepts/                 # 独立概念卡片（跨课程通用）
│   ├── backpropagation.md
│   └── attention-mechanism.md
├── raw/                      # 原始素材（不改）
│   ├── transcripts/          # VTT 字幕文件
│   ├── articles/             # 收集的参考文章
│   ├── papers/               # PDF 论文
│   └── assets/               # 图片等资源
├── _templates/               # Templater 模板
│   └── course-note.md
├── .obsidian/                # Obsidian 配置
│   └── snippets/             # CSS 主题
├── SCHEMA.md                 # 字段规范
├── index.md                  # 知识库说明
└── README.md                 # 项目说明
```

---

## 十、常见问题

**Q: 视频没有字幕怎么办？**

方案 1：用 Whisper 等工具语音转文字
方案 2：告诉 Hermes 视频主题，让它直接写笔记（我处理 CS231N L4 时就是这样做的）

**Q: Dataview 显示"No results"？**

检查两点：① `WHERE` 条件值是否和 frontmatter 一致；② `lecture` 是否补零（字母排序问题）

**Q: 怎么迁移到新电脑？**

```bash
git clone <your-repo-url> ~/obsidian/your-vault
```
然后 Obsidian 打开这个文件夹，所有配置、插件状态、模板全部一起同步。

**Q: Hermes 写文件权限不够？**

确保 `~/obsidian/luca-wiki` 目录存在，且当前用户有读写权限：
```bash
mkdir -p ~/obsidian/luca-wiki
chmod 755 ~/obsidian/luca-wiki
```

---

## 十一、完整工具链

| 步骤 | 工具 | 作用 |
|------|------|------|
| 初始化知识库 | Hermes + 提示词 | 一键创建目录结构 + SCHEMA |
| 下载字幕 | `yt-dlp` | 只下字幕，不占空间 |
| 整理笔记 | Hermes + 提示词 | 字幕 → 结构化 Markdown |
| 管理笔记 | Obsidian | 本地编辑、搜索、图谱 |
| 查询统计 | Dataview | 按课程/标签/状态筛选 |
| 自动填充模板 | Templater | 新建笔记时弹出填充对话框 |
| 样式定制 | CSS snippets | 表格、代码块、Callout 样式 |

---

> **核心理念**：先找到能力（Hermes 能做什么），再采集素材（yt-dlp 下字幕），再处理内容（整理成 Markdown），最后沉淀成资产（Obsidian 知识库）。走完一次完整流程，比知道一堆零散功能更重要。
