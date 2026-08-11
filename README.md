# StatSphere

[English](#english) | [中文](#chinese)

Personal blog of Wenxin Zhong — notes on statistics, data analysis, and related engineering.

Site: https://wenxin195.github.io

---

<a id="english"></a>

## English

### About

**StatSphere** is a personal Jekyll blog. The site structure is based on [TeXt Theme](https://github.com/kitian616/jekyll-TeXt-theme).

### Credits

- Based on [TeXt Theme](https://github.com/kitian616/jekyll-TeXt-theme)
- Code block UI and `prompt-*` short tips adapted from [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy)
- Titled `box-*` / `details-*` callouts and Liquid-tag authoring adapted from [huanyushi.github.io](https://github.com/huanyushi/huanyushi.github.io)

### Upgrades (by area)

#### HTML & layouts

- Clear shell / page-kind split: `base` → `shell` → `home` / `articles` / `article` / `archive` / `page` / `404`
- Article hero extracted from the old page shell (`hero` instead of burying header logic in `page`)
- Documentation-style sidebar layout and `landing` layout are not used

#### Ruby plugins (`_plugins/`)

```
_plugins/
  hooks/post_convert.rb          # Jekyll entry: Guard → enhance; posts → reading time
  content/
    enhancer.rb                  # Single parse/serialize orchestrator
    guard.rb                     # Skip non-article Pages (e.g. assets/*.scss)
    reading_time.rb              # Strip HTML → mixed CJK/English stats (posts only)
    language_name.rb             # Rouge lang ids → display names
    transforms/                  # tables, task_lists, code_blocks
  callouts/tags.rb               # {% box %} / {% details %}
```

- HTML enhancement (Nokogiri): posts and pages share `Content::Guard`; transforms wrap tables, replace task-list icons, and rebuild code blocks
- Code blocks: Rouge at build time → canonical `<figure class="code-block">` (line numbers, header, copy)
- `{% box TYPE "Title" %}` (title required) and `{% details … %}` (unknown types fail the build)
- Language display names via `_data/language_aliases.yml`
- Mixed CJK/English reading time on **posts only** (`reading_time`, `char_count`), from HTML-stripped text after enhancement

#### Callout authoring

Two first-class systems — do not mix roles:

| System | Use for | Author API |
|--------|---------|------------|
| **prompt** | Untitled short tips | Blockquote + `{: .prompt-tip\|info\|warning\|danger}` |
| **box** | Titled callouts | `{% box tip\|info\|warning\|danger "Title" %}…{% endbox %}` |
| **details** | Collapsible notes | `{% details definition\|theorem\|proposition\|example "Summary" [open] %}` |

```markdown
> Short tip body.
{: .prompt-tip}

{% box danger "Independence caveat" %}
Longer titled explanation…
{% endbox %}
```

Untitled `{% box tip %}` is a build error — use `prompt-*` instead.

Paragraph decorations `{:.success}` / `{:.info}` / `{:.warning}` / `{:.danger}` are a separate TeXt-style path (background only, no FA icon).

#### Code block authoring

Fenced blocks are highlighted with Rouge. Defaults: language label, line numbers from 1, copy button.

````markdown
```javascript
let score = 100;
```
````

Optional Kramdown IAL (on the line after the closing fence):

| IAL | Effect |
|-----|--------|
| `{: file="app.js"}` | Header shows the filename instead of the language name |
| `{: .nolineno }` | Hide line numbers (no line-number DOM) |

`mermaid` / `chart` fences are left for their client providers (no code chrome).

##### Mermaid sizing

Enable with `mermaid: true` in front matter (or `layout.enhancements.mermaid`).

Diagrams keep intrinsic SVG size (`useMaxWidth: false`), then **contain**-fit into the article column: scale ≤ 1 against container width and `--mermaid-max-height` (default `70vh`). Font size tracks body type via `--mermaid-font-size` (`1rem`, resolved to px at render). Root rem changes (e.g. narrow breakpoints) trigger a full re-render.

| Author control | Effect |
|----------------|--------|
| `flowchart LR` / `TD` (etc.) | Direction by meaning; fit handles both |
| `data-mermaid-fit="contain"` | Default: fit width and max-height |
| `data-mermaid-fit="width"` | Fit width only |
| `data-mermaid-fit="none"` | Intrinsic size (horizontal scroll if needed) |

Prefer short node labels; split deep vertical flows rather than relying on endless page height.

#### Styles (SCSS)

- Upgraded to a modern Sass toolchain (Dart Sass / `@use` · `@forward`); TeXt still relies on the older `@import`-based stack
- Layered Sass with `@use`: `tokens` → `foundations` → `primitives` → `shell` → `blocks` → `kinds` → `enhancements` → `motion`
- Design tokens as the single source for scale, color, and breakpoints
- Runtime `default` / `dark` themes via CSS variables and `html[data-theme]` (syntax highlighting follows the site theme)

#### Scripts (JS)

- Pure ESM modules under `assets/scripts/` (`entries` / `features` / `lib` / `utils` / `boot`)
- No bundler; no jQuery-centered boot bag
- Feature boundaries for TOC, drawers, search, clipboard, archive filters, etc.

#### Search & integrations

- Site search via [Pagefind](https://pagefind.app/)
- Comments path: Giscus (off by default)
- Site UV/PV via [Busuanzi](https://busuanzi.ibruce.info/) in the footer
- Markdown extras retained where useful: MathJax / Mermaid / Chart / KaTeX (per-page or layout defaults)

#### Config

- Slim `_config.yml`
- Presentation defaults in `_data/layout.yml`
- Public third-party IDs in `_data/integrations.yml` (no secrets in the static site)

#### Responsive

- Breakpoints: `sm` / `md` / `lg` / `xl`
- Narrow viewports: hamburger nav drawer; article TOC as a drawer + floating action
- Drawers share the modal primitive and stay mutually exclusive with search

### Local development

Requirements: Ruby, Bundler, and [Pagefind](https://pagefind.app/) (CLI or `npx`).

```bash
# Install gems
bundle install

# Build the site
bundle exec jekyll build

# Build the search index into _site/pagefind
npx pagefind --site _site

# Serve (rebuild search after content changes if you need local search)
bundle exec jekyll serve
# then: npx pagefind --site _site
```

### License

- Site code: MIT (see `LICENSE`)
- Post content: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) unless a post says otherwise

Please keep the copyright and license notices of TeXt, Chirpy, and other upstream MIT components when redistributing substantial portions of their code.

---

<a id="chinese"></a>

## 中文

### 关于

**StatSphere** 是钟文鑫的个人博客，主要记录统计学、数据分析及相关工程实践。

站点：https://wenxin195.github.io

### 致谢

- Based on [TeXt Theme](https://github.com/kitian616/jekyll-TeXt-theme)
- 代码块与 `prompt-*` 短提示参考 [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy)
- 带标题的 `box-*` / `details-*` 与 Liquid 标签写法参考 [huanyushi.github.io](https://github.com/huanyushi/huanyushi.github.io)

### 升级点（分模块）

#### HTML 与布局

- 壳层与页型分离：`base` → `shell` → `home` / `articles` / `article` / `archive` / `page` / `404`
- 文章头图从 page 壳中抽出（`hero`）
- 不使用文档站式 sidebar，也不使用 `landing` 布局

#### Ruby 插件（`_plugins/`）

```
_plugins/
  hooks/post_convert.rb          # 入口：Guard → 增强；posts → 阅读时间
  content/
    enhancer.rb                  # 单次 parse/serialize 编排
    guard.rb                     # 跳过非文章 Page（如 assets/*.scss）
    reading_time.rb              # 去 HTML → 中英混合统计（仅 posts）
    language_name.rb             # Rouge 语言 id → 显示名
    transforms/                  # tables、task_lists、code_blocks
  callouts/tags.rb               # {% box %} / {% details %}
```

- HTML 增强（Nokogiri）：posts 与 pages 共用 `Content::Guard`；变换含表格横向滚动、任务列表图标、代码块重建
- 代码块：构建期 Rouge → 规范 `<figure class="code-block">`（行号、标题栏、复制）
- `{% box TYPE "标题" %}`（标题必填）与 `{% details … %}`（未知类型构建失败）
- 语言显示名：`_data/language_aliases.yml`
- 中英混合阅读时间仅写入 **posts**（`reading_time`、`char_count`），在增强后对去 HTML 的正文计算

#### 提示块写法

两套分工明确的系统，不要混用：

| 系统 | 用途 | 写法 |
|------|------|------|
| **prompt** | 无标题短提示 | 引用块 + `{: .prompt-tip\|info\|warning\|danger}` |
| **box** | 带标题说明 | `{% box tip\|info\|warning\|danger "标题" %}…{% endbox %}` |
| **details** | 可折叠 | `{% details definition\|theorem\|proposition\|example "摘要" [open] %}` |

```markdown
> 短提示正文。
{: .prompt-tip}

{% box danger "独立性定义问题" %}
带标题的较长说明……
{% endbox %}
```

无标题的 `{% box tip %}` 会构建失败——请改用 `prompt-*`。

`{:.success}` / `{:.info}` / `{:.warning}` / `{:.danger}` 是另一套 TeXt 段落装饰（仅底色，无 FA 图标）。

#### 代码块写法

围栏代码块由 Rouge 高亮。默认：语言标签、行号从 1 起、复制按钮。

````markdown
```javascript
let score = 100;
```
````

可选 Kramdown IAL（写在结束围栏的下一行）：

| IAL | 作用 |
|-----|------|
| `{: file="app.js"}` | 标题栏显示文件名（优先于语言名） |
| `{: .nolineno }` | 关闭行号（不生成行号 DOM） |

`mermaid` / `chart` 围栏交给对应客户端，不套代码块 chrome。

##### Mermaid 尺寸

在 front matter 写 `mermaid: true`（或依赖 `layout.enhancements.mermaid`）启用。

图保留内在 SVG 尺寸（`useMaxWidth: false`），再按文章栏 **contain** 缩放：缩放系数 ≤ 1，同时受容器宽度与 `--mermaid-max-height`（默认 `70vh`）约束。字号通过 `--mermaid-font-size`（`1rem`）跟随正文，渲染时解析为 px。根 rem 变化（如窄屏断点）会触发整图重渲染。

| 作者控制 | 效果 |
|----------|------|
| `flowchart LR` / `TD` 等 | 按语义选方向；适配同时覆盖横纵 |
| `data-mermaid-fit="contain"` | 默认：同时适配宽度与最大高度 |
| `data-mermaid-fit="width"` | 只适配宽度 |
| `data-mermaid-fit="none"` | 保持内在尺寸（过宽可横向滚动） |

节点文案宜短；过深的纵向流程应拆图，而不是依赖页面无限变高。

#### 样式（SCSS）

- 升级到现代 Sass 工具链（Dart Sass / `@use` · `@forward`）；TeXt 仍使用基于 `@import` 的旧栈
- 使用 `@use` 分层：`tokens` → `foundations` → `primitives` → `shell` → `blocks` → `kinds` → `enhancements` → `motion`
- 设计令牌统一管理尺寸、颜色与断点
- 运行时 `default` / `dark` 主题（CSS 变量 + `html[data-theme]`），语法高亮跟随站点主题

#### 脚本（JS）

- `assets/scripts/` 下纯 ESM（`entries` / `features` / `lib` / `utils` / `boot`）
- 无 bundler；不以 jQuery + 全局配置袋为中心
- TOC、抽屉、搜索、复制、归档筛选等按能力拆分

#### 搜索与集成

- 站内搜索使用 [Pagefind](https://pagefind.app/)
- 评论走 Giscus（默认关闭）
- 站级 UV/PV 使用页脚 [不蒜子](https://busuanzi.ibruce.info/)
- 按需保留 MathJax / Mermaid / Chart / KaTeX 等增强

#### 配置

- `_config.yml` 保持精简
- 展示默认放在 `_data/layout.yml`
- 第三方公开参数放在 `_data/integrations.yml`（静态站不放机密）

#### 响应式

- 断点：`sm` / `md` / `lg` / `xl`
- 窄屏：汉堡导航抽屉；文章 TOC 为抽屉 + 浮动入口
- 抽屉复用 modal，并与搜索互斥

### 本地构建

需要：Ruby、Bundler，以及 [Pagefind](https://pagefind.app/)（CLI 或 `npx`）。

```bash
# 安装依赖
bundle install

# 构建站点
bundle exec jekyll build

# 生成搜索索引到 _site/pagefind
npx pagefind --site _site

# 本地预览（若要验证搜索，内容变更后请重新跑 Pagefind）
bundle exec jekyll serve
# 然后：npx pagefind --site _site
```

### 许可

- 站点代码：MIT（见 `LICENSE`）
- 文章内容：除非单篇另有说明，适用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

再分发时请保留 TeXt、Chirpy 等上游 MIT 组件的版权与许可声明。
