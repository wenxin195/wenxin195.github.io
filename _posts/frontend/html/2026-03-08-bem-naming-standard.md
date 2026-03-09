---
key: bem-naming-standard
title: "BEM 命名规范"
permalink: "/bem-naming-standard"
tags:
  - HTML
  - CSS
  - 代码风格指南
author: Wenxin Zhong
layout: article
download: false
videos: false
refactor: true
mathjax: false
modify_date: "2026-03-09 21:08:00"
---

BEM 命名规则(Block Element Modifier)是由俄罗斯公司 [Yandex](https://en.wikipedia.org/wiki/Yandex) 提出的一种 CSS 类名的命名规则，主要用于大型前端项目的 CSS 架构设计，帮助开发者写出结构清晰、可维护、可复用的 CSS 代码。

<!--more-->

BEM 命名把页面拆分成独立组件，每个组件的类名严格按照 **块(Block) + 元素(Element) + 修饰符(Modifier)** 的结构来命名，避免命名冲突和样式污染。

在大型前端项目中，CSS 通常会遇到几个问题：

- 类名冲突
- 样式污染
- 难以维护
- 组件复用困难

BEM 通过严格的命名结构，解决了这些问题，使 CSS 具有类似组件化的结构。

> 随着 [Tailwind CSS](https://tailwindcss.com)、[CSS Modules](https://github.com/css-modules/css-modules)、[Vanilla Extract](https://vanilla-extract.style) 等方案流行，纯 BEM 的使用率有所下降。但在中大型的传统项目、需要严格可维护性的 CSS 的团队中，BEM 仍然是非常主流且有效的方案。
{: .prompt-info}

## BEM 的基本结构

BEM 的类名结构通常是：

```text
Block-name__Element-name--Modifier-name
```

其含义为：

<table style="text-align: center">
  <thead>
    <tr>
      <th>类型</th>
      <th>意义</th>
      <th>示例</th>
    </tr>
</thead>
<tbody>
    <tr>
      <td>Block</td>
      <td>独立组件</td>
      <td>card</td>
    </tr>
    <tr>
      <td>Element</td>
      <td>组件内部元素</td>
      <td>card__title</td>
    </tr>
    <tr>
      <td>Modifier</td>
      <td>状态或变体</td>
      <td>card--large</td>
    </tr>
  </tbody>
</table>

### Block

Block 是一个逻辑上独立、语义上有意义的组件，它表示一个功能模块。Block 可以被复用，不依赖于其他组件，并且 Block 本身就是一个类名。例如：

- `.card`
- `.button`
- `.menu`

### Element

Element 是 Block 的内部组成部分，它不能脱离 Block 单独使用，必须属于某个 Block。例如：

- `.card__title`
- `.button__icon`
- `.menu__item`

### Modifier

Modifier 用来定义和表示 Block 或者 Element 的状态、样式变体(例如颜色、大小、主题等)。例如：

- `.card--featured`
- `.card__title--highlight`
- `.button--primary`
- `.menu--disabled`

## 完整示例

下面是完整的 HTML 代码示例：

```html
<div class="card card--featured">
  <img class="card__image" src="img.jpg">
  <h2 class="card__title">文章标题</h2>
  <p class="card__text">文章内容</p>
  <button class="card__button card__button--primary">阅读</button>
</div>
```

CSS 样式为：

```css
.card {
  border: 1px solid #ddd;
}

.card__title {
  font-size: 18px;
}

.card__button {
  padding: 8px;
}

.card__button--primary {
  background: blue;
}
```

## 注意事项

1. Element 不能多级嵌套

    例如：

    ```text
    menu__item__link
    ```

    而是应该：

    ```text
    menu__item
    menu__link
    ```

    > Element 永远只属于 Block，而不属于另一个 Element。无论 DOM 树有多深，BEM 结构永远是扁平的。
    {: .prompt-warning}

2. 不得使用标签名

    例如：

    ```text
    card__h2
    ```

    因为这会让组件失去可复用性。

3. Modifier 不单独使用

    例如：

    ```html
    <button class="primary">
    ```

    而是应该：

    ```html
    <button class="button button--primary">
    ```
