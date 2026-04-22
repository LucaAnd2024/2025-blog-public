# Obsidian 知识库搭建笔记：从零到好看又好用

> 本文目标：任何人读完这篇文章，都能从零搭建起一套自己的课程笔记知识库。
>
> 适用场景：机器学习/深度学习课程笔记管理。方法论通用，可迁移到任何学科。

---

## 1. 这个知识库是什么

一套基于 Obsidian 的**课程笔记管理系统**，核心解决三个问题：

- **来源杂** — 课程来自 YouTube、B 站、论文，怎么统一管理
- **格式乱** — 字幕是 VTT 格式，课堂是 Markdown，散落在各处
- **用不起来** — 记完就忘，复习时找不到，回头想引用不知道在哪

解决方案：统一格式、统一流程、统一入口。

---

## 2. 目录结构

```
luca-wiki/（知识库根目录）
├── courses/                    # 课程笔记（核心内容）
│   ├── ML2021-L01-machine-learning-basics.md
│   ├── ML2021-L02-deeplearning-basics.md
│   └── CS231N-2025-L01-introduction.md
├── concepts/                   # 独立概念卡片（可跨课程引用）
│   ├── backpropagation.md
│   └── attention-mechanism.md
├── raw/                        # 原始素材（不改）
│   ├── transcripts/            # 字幕文件
│   └── articles/               # 收集的参考文章
├── .obsidian/                  # Obsidian 配置（版本控制）
│   └── snippets/
│       └── ml2021-theme.css   # 自定义主题
├── _templates/                 # Templater 模板
│   └── course-note.md
└── SCHEMA.md                  # 字段规范文档
```

---

## 3. 快速开始

### 3.1 安装 Obsidian

下载：[obsidian.md](https://obsidian.md/download)

打开后选择「打开本地仓库」，选中 `luca-wiki/` 文件夹即可。

### 3.2 安装必要插件

Obsidian → 设置 → 社区插件 → 关闭安全模式 → 浏览

安装以下两个插件：

**Templater**（模板引擎）
- 启用后：设置 → Templater → 模板文件夹位置 → 选择 `_templates/`
- 作用：新建笔记时自动填充标准化 frontmatter

**Dataview**（数据查询）
- 启用后：设置 → Dataview → 勾选「启用 JavaScript 查询」
- 作用：在任意笔记里写查询语句，动态显示笔记列表/统计数据

### 3.3 启用 CSS 主题

设置 → 外观 → CSS 代码片段 → 启用 `ml2021-theme.css`

主题效果：深色 Tokyo Night 配色，自定义表格样式，代码高亮。

---

## 4. 核心工作流程：处理一个新视频

假设你有一个 YouTube 视频链接，想把它变成一条结构化笔记。

### Step 1：下载字幕

```bash
# 安装 yt-dlp（macOS）
brew install yt-dlp

# 下载字幕（跳过视频，只下字幕）
yt-dlp --write-subs --skip-download --sub-langs "zh-TW,zh-CN,en" \
  -o "%(title)s.%(ext)s" "视频链接"
```

常见选项：
- `zh-TW`：繁体中文字幕
- `zh-CN`：简体中文字幕
- `en`：英文字幕
- 如果中文字幕没有，Fallback 到英文字幕

字幕会下载为 `.vtt` 文件，可以用任意文本编辑器打开。

### Step 2：整理笔记内容

用 LLM（我）把字幕整理成结构化笔记，格式要求：

- **标题用中文**
- **分点清晰**，每部分有明确主题
- **保留关键公式**，用 LaTeX 或代码块
- **去掉口语**：字幕里有很多「呃」「嗯」「这个」之类的语气词，整理时删除
- **适当压缩**：45 分钟的课不可能变成 45 页笔记，提取核心概念和逻辑链

### Step 3：确定 frontmatter

每篇笔记顶部有一段 YAML 格式的元数据，叫 frontmatter。格式固定如下：

```yaml
---
title: "课程名称或笔记标题"
created: 2026-04-22
updated: 2026-04-22
type: course-note
course: ML2021
lecture: L01
status: completed
difficulty: medium
tags:
  - cnn
  - computer-vision
  - ml2021
sources:
  - "YouTube 视频链接"
---
```

各字段含义：

| 字段 | 必须 | 说明 | 示例 |
|------|------|------|------|
| `title` | ✅ | 笔记标题 | `"CNN基础知识"` |
| `created` | ✅ | 创建日期 | `2026-04-22` |
| `updated` | ✅ | 最后更新 | `2026-04-22` |
| `type` | ✅ | 固定值 | `course-note` |
| `course` | ✅ | 课程代码 | `ML2021` |
| `lecture` | ✅ | 讲次（补零） | `L01` |
| `status` | ✅ | 笔记状态 | `completed` / `in-progress` |
| `difficulty` | ✅ | 难度 | `easy` / `medium` / `hard` |
| `tags` | ✅ | 标签数组 | `["cnn", "ml"]` |
| `sources` | ✅ | 视频/资料链接 | `["链接"]` |

### Step 4：文件命名规范

格式：`{课程代码}-L{编号}-{简短标题}`

规则：
- 课程代码大写：`ML2021`、`CS231N-2025`
- 讲次**补零**：`L01` `L02` ... `L16`（不补零的话 L10 会排在 L2 前面）
- 标题用英文或拼音（方便搜索），简短，几个词

示例：
```
ML2021-L01-machine-learning-basics.md
ML2021-L09-cnn.md
CS231N-2025-L04-neural-networks-backpropagation.md
```

### Step 5：用 Templater 创建笔记

Obsidian 中按 `Cmd+N` 新建笔记 → Templater 会自动在顶部插入模板。

模板内容（`/_templates/course-note.md`）：

```markdown
---
title: "<% tp.system.prompt("标题") %>"
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
type: course-note
course: "<% tp.system.prompt("课程代码", "ML2021") %>"
lecture: "<% tp.system.prompt("讲次（如 L01）") %>"
status: in-progress
difficulty: medium
tags:
  -
sources:
  -
---

# <% tp.system.prompt("笔记标题") %>

## 简介

## 核心内容

## 总结
```

模板里的 `tp.system.prompt()` 会弹出对话框让你输入，实现了 frontmatter 的交互式填充。

---

## 5. Dataview 查询怎么用

Dataview 让你用类 SQL 的语法查询笔记库。

### 基本查询

在任意 `.md` 文件里新建代码块：

````markdown
```dataview
TABLE course, lecture, status, difficulty
FROM "courses"
SORT file.name ASC
```
````

效果：显示 `courses/` 文件夹下所有笔记的课程、讲次、状态、难度。

### 按课程筛选

````markdown
```dataview
TABLE lecture, status, difficulty
FROM "courses"
WHERE course = "ML2021"
SORT lecture ASC
```
````

### 统计某课程的笔记数量

````markdown
```dataview
TABLE length(file.tasks) as tasks
FROM "courses"
WHERE course = "ML2021"
```
````

> **注意**：Dataview 对字段类型敏感。`lecture: "L01"` 是字符串，`SORT lecture ASC` 按字母顺序排，不是数字顺序。所以 lecture 必须补零（L01 而不是 L1）。

---

## 6. 自定义 CSS 主题怎么写

Obsidian 的外观完全由 CSS 控制。在 `.obsidian/snippets/` 目录下放 `.css` 文件，Obsidian 会自动加载。

### 修改表格样式

```css
/* 表格样式 */
.markdown-source-view table {
  border-collapse: collapse;
  width: 100%;
}

.markdown-source-view th {
  background: transparent;    /* 不要深色背景 */
  border-bottom: 2px solid var(--background-modifier-border);
  font-weight: 600;
}

.markdown-source-view td {
  border-bottom: 1px solid var(--background-modifier-border);
}
```

### 修改 Callout（高亮块）样式

```css
/* 信息高亮 */
.callout {
  border-left: 3px solid #7aa2f7;
  background: rgba(122, 162, 247, 0.1);
}
```

### 深色主题配色参考（Tokyo Night）

```css
--background-primary: #1a1b26;
--background-secondary: #1f2335;
--text-normal: #c0caf5;
--accent: #7aa2f7;         /* 蓝色 */
--accent-secondary: #bb9af7; /* 紫色 */
```

---

## 7. 常见问题

### Q: 视频没有字幕怎么办？

两个方案：

1. 用 Whisper 等语音识别工具生成字幕（需要额外工具）
2. 根据视频主题直接写笔记（我就是这样处理 CS231N L4 的）

### Q: 笔记写成 transcript 风格怎么办？

字幕直接整理会变成口语化的流水账。正确姿势：
- 提取核心概念，用自己的话重写
- 按逻辑主题组织，不是按时间顺序
- 45 分钟的课 → 3-5 个主题章节

### Q: Dataview 显示 "No results"？

检查两点：
1. `WHERE` 条件是否正确（状态值拼写是否一致）
2. `SORT lecture ASC` 对字符串无效，lecture 字段必须补零

### Q: 怎么迁移到新电脑？

```bash
# 克隆整个知识库
git clone <your-repo-url> ~/obsidian/your-vault

# Obsidian 打开这个文件夹
# 插件、模板、CSS 全部在仓库里，一起同步过来
```

所有配置都在 `.obsidian/` 目录和各个 `.md` 文件的 frontmatter 里，不需要额外导出。

---

## 8. 扩展方向

学完一门课后，知识库可以继续扩展：

- **概念卡片**：`concepts/` 目录下建独立概念笔记，如 `backpropagation.md`、`attention.md`
- **标签系统**：给笔记打标签，跨课程追踪某个概念（如 `backpropagation` 在 ML2021 和 CS231N 里都有）
- **图谱视图**：Obsidian 有「局部图谱」和「全局图谱」插件，可以可视化概念之间的引用关系
- **发表博客**：把 `courses/` 里的内容整理成博客文章，用博客框架发布到 Vercel

---

## 9. 完整工具链总结

| 步骤 | 工具 | 作用 |
|------|------|------|
| 视频下载字幕 | `yt-dlp` | 只下字幕，不下视频，节省空间 |
| 笔记整理 | LLM（我） | 字幕 → 结构化 Markdown |
| 笔记管理 | Obsidian | 本地编辑、搜索、图谱 |
| 元数据查询 | Dataview | 按课程/标签/状态筛选笔记 |
| 模板填充 | Templater | 新建笔记自动填充 frontmatter |
| 样式定制 | CSS snippets | 表格、代码块、Callout 样式 |
| 博客发布 | Vercel + Next.js | 把笔记变成公开博客 |

---

> 这套方法论的核心不是工具，而是**流程标准化**：命名规范、元数据规范、文件组织规范。有了规范，工具才能发挥威力。
