---
key: sass-tutorial
title: "Sass 教程"
permalink: "/sass-basic" 
tags:
  - Web 前端
  - Sass
author: Wenxin Zhong
layout: article
mathjax: false
download: false
videos: false
refactor: true
modify_date: "2025-07-20 11:45:00"
---

Sass(Syntactically Awesome Style Sheets)是一款功能强大的 CSS 预处理器，它扩展了 CSS 语言的能力，使得开发者能够以更结构化、更易维护且更高效的方式编写样式。通过减少代码冗余并提升可复用性，Sass 在保持与标准 CSS 完全兼容的同时，简化了样式设计流程。

<!--more-->

Sass 引入了超越传统 CSS 的强大特性，即[变量](https://sass-lang.com/documentation/variables)、[样式规则](https://sass-lang.com/documentation/style-rules#nesting)、[Mixins](https://sass-lang.com/documentation/at-rules/mixin)、[继承](https://sass-lang.com/documentation/at-rules/extend/)和[函数](https://sass-lang.com/documentation/modules)等高级功能。这些功能使样式管理更灵活、代码更易维护、开发更高效，让开发者能够更轻松地组织和管理样式表。

Sass 样式表由 **语句** (Statements)和 **表达式** (Expressions)组成，它们协同工作以生成最终的 CSS 输出。

语句是定义 **样式表结构** 和 **行为** 的指令，分为以下几类：

- 通用语句：这些语句可以在 Sass 样式表的 **任何位置** 使用。
  - 变量声明，例如`$primary-color: #c6538c`；
  - 控制指令，例如`@if`、`@each`、`@for`和`@while`等；
  - 调试和错误处理指令，例如`@error`、`@warn`和`@debug`等。
- CSS 语句：这些语句生成 CSS 输出，可在除`@function`之外的任何位置使用。
  - 样式规则(Style rules)，例如`h1 { color: $primary-color; }`；
  - CSS 中的 at-Rules，例如`@media`、`@font-face`或`@keyframes`；
  - 使用了`@include`的 Mixins 指令；
  - 用于控制输出嵌套的`@at-root`规则；
- 顶部语句：这些语句仅限于在 **样式表的顶部** 或 **嵌套在顶部 CSS 语句** 中使用。
  - 使用了`@use`的加载模块，以及使用了`@import`的导入模块；
  - 使用了`@mixin`的 Mixins 定义，以及使用了`@function`的函数定义。
- 其他语句：
  - 属性声明，例如：`font-size: 16px;`，属性声明仅可在 **样式规则** 和某些 **CSS 中的 at-Rules** 中使用；
  - 使用了`@extend`的继承语句，仅可在 **样式规则** 中使用。

表达式出现在 **属性** 或 **变量声明** 的右侧，并计算它们的值。Sass 表达式(我们将其统称为 *SassScript*)比标准 CSS 值强大得多。它们包括：

- 文字表达式(Literal)：用来表示 **静态值**。
  - 数字表达式(Numbers)，它们有或者没有单位，例如`12`或`100px`；
  - 字符串表达式(Strings)，它们带或者不带引号，例如`"Helvetica Neue"`或 `bold`；
  - 颜色表达式(Colors)，通过十六进制代码、名称或函数指定，例如`#c6538c`或`blue`；
  - 布尔表达式(Boolean)，即`true`或`false`；
  - Nulls 值；
  - 列表(Lists)，用空格或逗号分隔，可以带或者不带方括号，例如`1.5em 1em 0 2em`、`Helvetica, Arial, sans-serif`或`[col1-start]`；
  - 映射(Maps)，例如`("background": red, "foreground": pink)`。
- 运算符表达式：支持数学计算、比较和逻辑运算等。
- 其他表达式：包括变量、函数调用和父选择器`&`等。

通过使用这些强大的特性，Sass 让开发人员能够编写更清晰、更模块化、可扩展的样式表，从而改变 CSS 的编写和维护方式。

## Sass 变量

Sass 变量是一项强大的功能，通过减少重复、支持复杂计算以及简化库配置来优化样式表。定义变量的语法是：`<variable>: <expression>`，其中变量名以`$`符号作为前缀。例如：

```scss
$primary-font: Helvetica, sans-serif;

body {
  font-family: $primary-font;
}
```

这种方法提高了样式表的可维护性和一致性。

### 变量的作用域

Sass 变量默认是 **局部变量**，这意味着它们只能在 **定义它们的代码块内** 访问。在任何 **代码块之外** 声明的变量则为 **全局变量**，可以在整个样式表或下游文件中使用。例如：

```scss
$global-color: red;

h1 {
  $local-color: green; // Local variable, will shadowing global variable
  color: $local-color;
}

p {
  color: $global-color; // Uses global variable
}
```

编译后得到：

```css
h1 {
  color: green;
}

p {
  color: red;
}
```

> 当局部变量与全局变量同名时，局部变量会在其作用域内 **遮蔽** ([Shadowing](https://sass-lang.com/documentation/variables/#shadowing))全局变量；在除该作用域之外的全局变量不受影响。
{: .prompt-warning}

要在局部作用域内显式覆盖全局变量，可以使用`!global`，这将修改整个样式表中的全局变量：

```scss
$global-color: red;

@mixin update-color {
  $global-color: green !global; // Overrides global variable
}

h1 {
  @include update-color;
  color: $global-color;
}

p {
  color: $global-color;
}
```

编译后得到：

```css
h1 {
  color: green;
}

p {
  color: green;
}
```

若`update-color`没有被`@include`引用，那么`<h1>`与`<p>`的属性值则都为`red`。

> `!global`只能修改现有的全局变量，无法用于声明新的全局变量！
{: .prompt-danger}

### 引用变量

Sass 变量可以引用其他变量，从而实现模块化和可复用的样式。这对于创建值之间的关系(例如颜色和边框)特别有用，例如：

```scss
$highlight-color: blue;
$highlight-border: 1px solid $highlight-color;

.selected {
  border: $highlight-border;
}
```

这确保了变量的一致性并简化了更新流程，因为修改`$highlight-color`会自动更新`$highlight-border`。

### 默认变量

Sass 允许使用`!default`为变量分配默认值，仅当 **变量未定义** 或为 **空值** 时，Sass 才会为其才会赋值。这在库文件中尤其有用，可实现下游自定义而不覆盖预定义值：

```scss
// _library.scss
$content: "Default content" !default;

// style.scss
@use 'library';
$content: "Custom content" !default; // Ignored, because the `$content` is already defined

div {
  content: $content;
}
```

编译后得到：

```css
div {
  content: "Default content";
}
```

还可以使用`@use <url> with ( <variable>: <value>[, ...] )`在库文件中配置变量，前提是 **变量是在样式表的顶部，使用`!default`声明的**：

```scss
// _library.scss
$black: #000 !default;
$border-radius: 0.25rem !default;
$box-shadow: 0 0.5rem 1rem rgba($black, 0.15) !default;

// style.scss
@use 'library' with (
  $black: #222,
  $border-radius: 0.1rem
);
```

在这个例子中，`$black`被覆盖为`#222`，`$border-radius`被覆盖为`0.1rem`，而`$box-shadow`使用更新后的`$black`值。

### 控制流中的变量

控制流中的变量(例如`@if`、`@for`)具有独特的作用域规则。赋值操作不会创建新局部变量，而是 **更新** 现有变量(通常是全局变量)。这允许在循环或条件语句中进行动态更新：

```scss
$dark-theme: true !default;
$primary-color: hsl(339, 81%, 85%) !default;
$accent-color: hsl(277, 70%, 35%) !default;

@if $dark-theme {
  $primary-color: darken($primary-color, 60%);
  $accent-color: lighten($accent-color, 60%);
}

.button {
  background-color: $primary-color;
  border: 1px solid $accent-color;
  border-radius: 3px;
}
```

编译后得到：

```css
.button {
  background-color: hsl(339, 81%, 25%);
  border: 1px solid hsl(277, 70%, 95%);
  border-radius: 3px;
}
```

> 控制流中赋值的变量可以修改外部作用域的变量，但是 **控制流中定义的新变量在外部无法访问**。因此在控制流中赋值变量之前，需要先在外部作用域中声明变量(通常定义为`null`值或其他)。
{: .prompt-tip}

## 插值语句

Sass 中有一个插值语句(Interpolation)`#{}`，它几乎可以在 Sass 样式表的任何地方使用，任意 *SassScript* 都可以嵌入到代码块里。这在编写 Mixins 时特别有用，因为它允许创建选择器的过程中传入参数：

```scss
@mixin corner-icon($name, $top-or-bottom, $left-or-right) {
  .icon-#{$name} {
    background-image: url("/icons/#{$name}.svg");
    position: absolute;
    #{$top-or-bottom}: 0; #{$left-or-right}: 0;
  }
}

@include corner-icon("mail", top, left);
```

使用`#{}`会直接编译 CSS，可以避免 Sass 运行计算表达式。例如：

```scss
p {
  $font-size: 12px;
  $line-height: 30px;
  font: #{$font-size}/#{$line-height};
}
```

编译后得到：

```css
p {
  font: 12px/30px;
}
```

## 数据类型

### 字符串

Sass 字符串(Strings)支持 **有引号字符串** (使用`'`或者`"`来定义)和 **无引号字符串**，除特定不带引号的值(如颜色名称`red`)外，大多数情况下建议使用有引号的字符串。当 Sass 编译为 CSS 时，字符串类型将保持不变，从而确保一致性。

Sass 提供了一组强大的[字符串函数](https://sass-lang.com/documentation/modules/string)，可高效地操作字符串：

- [`string.unquote($string)`](https://sass-lang.com/documentation/modules/string/#unquote)，将有引号字符串转换为无引号字符串；

- [`string.quote($string)`](https://sass-lang.com/documentation/modules/string/#quote)，可以为无引号字符串添加引号。

  > 使用插值语句`#{}`时，有引号字符串会被编译为无引号字符串，这可能影响它们在 CSS 中的处理方式。
  {: .prompt-tip}

- [`string.index($string, $substring)`](https://sass-lang.com/documentation/modules/string/#index)，返回`$string`中首次出现`$substring`的起始索引(序号从 1 开始计数)，若未找到则返回`null`。

  > 在 Sass 中，字符串索引从第一个字符开始计数，起始值为 1，而非 0。
  {: .prompt-info}

- [`string.slice($string, $start, $end)`](https://sass-lang.com/documentation/modules/string/#slice)，提取字符串中`$start`和`$end`索引之间的部分；
- [`string.insert($string, $insert, $index)`](https://sass-lang.com/documentation/modules/string/#insert)，将`$insert`插入到`$string`的`$index`位置；
- [`string.split($string, $separator)`](https://sass-lang.com/documentation/modules/string/#split)，根据`$separator`将字符串拆分为列表。

### 数值

Sass 中的数字由一个 **数值** 和一个 **可选单位** 组成，例如`16`或`16px`。Sass 支持与 CSS 兼容的数字格式，包括科学记数法(例如 1200 可以表示为`1.2e3`)。

Sass 有灵活的基于单位的计算机制：数字相乘时其单位会相应地计算(例如`4px * 6px`等于`24px*px`)；除法计算的单位是分子来自第一个数字，分母来自第二个数字(例如`math.div(5px, 2s)`等于`2.5px/s`)。

Sass 会自动转换兼容单位(例如`1in`转换为`96px`)，但尝试组合不兼容的单位(例如`1in + 1em`)则会抛出错误；对于单位抵消运算(例如`math.div(96px, 1in)`)，Sass 会简化为无单位数值(即只输出`96`)。

```scss
$transition-speed: math.div(1s, 50px); // 0.02s/px

@mixin move($left-start, $left-stop) {
  position: absolute;
  left: $left-start;
  transition: left ($left-stop - $left-start) * $transition-speed;

  &:hover {
    left: $left-stop;
  }
}

.slider {
  @include move(10px, 120px); // Transition time: (120px - 10px) * 0.02s/px = 2.2s
}
```

需要特别指出的是，**避免使用带单位的数字进行插值** (例如`#{$number}px`)，因为这会创建一个不带引号的字符串，而不是一个数字，这无法应用于计算。最佳实践是改用`$number * 1px`或直接赋予其单位。

Sass 会将百分比视为带`%`单位的数字。使用`math.div($percentage, 100%)`可以将百分比转换为小数，或通过`math.percentage($decimal)`将小数转换为百分比，也可以使用`$decimal * 100%`的形式进行转换。

> 为了保证精度，Sass 将小数四舍五入到小数点后 10 位。
{: .prompt-info}

### 列表

Sass 中的列表(Lists)是由空格、逗号或斜杠`/`分隔，或用方括号`[]`括起的值集合。单个值被视为仅含一项的列表，空列表表示为`[]`。列表还可以嵌套子列表，例如`(1px 2px, 5px 6px)`。

> 不推荐使用`/`作为分隔符，请改用`list.slash($elements...)`！
{: .prompt-warning}

Sass 提供了一系列强大的[列表函数](https://sass-lang.com/documentation/modules/list)：

- [`list.nth($list, $n)`](https://sass-lang.com/documentation/modules/list/#nth)，检索列表中的第 n 个项(从 1 开始计数)。
- [`list.join($list1, $list2)`](https://sass-lang.com/documentation/modules/list/#join)，将两个列表合并为一个；
- [`list.append($list, $value)`](https://sass-lang.com/documentation/modules/list/#append)，将值添加到列表末尾；
- [`list.index($list, $value)`](https://sass-lang.com/documentation/modules/list/#index)，返回 `$list`中`$value`的第一个索引，如果未找到则返回`null`；
- [`@each`](#each)指令，遍历列表中的每个项。

在 Sass 中，**列表是不可变的**，这意味着函数会 **返回新的列表**，而不是修改现有的列表。此特性可避免在不同样式表间共享列表时引发错误。若需更新列表，只需将新列表重新赋值给同一个变量即可。

```scss
@function prefixes-for-browsers($browsers) {
  $prefixes: ();
  @each $browser in $browsers {
    $prefixes: list.append($prefixes, map.get($prefixes-by-browser, $browser));
  }
  @return $prefixes;
}
```

在定义 Mixins 或者带有可变参数`$args...`时，会生成一个名为 **参数列表** 的特殊列表。该列表包含所有传递的参数，并确需通过`meta.keywords($args)`以映射的形式访问关键字参数。

```scss
@mixin syntax-colors($args...) {
  @debug meta.keywords($args); // Outputs keyword arguments as a map
  @each $name, $color in meta.keywords($args) {
    pre span.stx-#{$name} {
      color: $color;
    }
  }
}

@include syntax-colors($string: #080, $comment: #800, $variable: #60b);
```

### 颜色

Sass 将 CSS 颜色表达式(例如`#FF0000`、`rgb(255, 0, 0)`或者`red`)视为颜色值(Colors)。任何 CSS 颜色表达式都会对应一个颜色值，这包括大量的用无引号字符串也无法区分的颜色名称。

在 Compressed 模式下，Sass 会将颜色优化为最短的 CSS 表示形式，例如`#FF0000`会被视为`red`，`blanchedalmond`会被视为`#FFEBCD`。

> 在使用插值语句`${}`的样式选择器中指定颜色名称时，需要使用有引号字符串表示颜色值(例如`"red"`)，以避免 Compressed 模式下出现无效 CSS。
{: .prompt-warning}

主要的[颜色函数](https://sass-lang.com/documentation/modules/color)包括：

- [`color.adjust($color, $properties...)`](https://sass-lang.com/documentation/modules/color/#adjust)，按固定量调整特定的颜色属性(例如色调、饱和度等)；
- [`color.change($color, $properties...)`](https://sass-lang.com/documentation/modules/color/#change)，将特定颜色属性设置为新值；
- [`color.scale($color, $properties...)`](https://sass-lang.com/documentation/modules/color/#scale)，连续缩放颜色属性，与使用离散步骤的`color.adjust`有所不同；
- [`color.mix($color1, $color2, $weight)`](https://sass-lang.com/documentation/modules/color/#mix)，使用与 CSS 里的`color-mix()`函数相同的算法混合两种颜色；
- [`color.channel($color, $channel, $space)`](https://sass-lang.com/documentation/modules/color/#channel)。从给定颜色空间(例如 HSL、RGB 等)中的颜色中提取特定通道(色相、饱和度等)。

```scss
$base-color: #036;
.adjusted {
  background: color.adjust($base-color, $lightness: +10%); // Lightens the color
}
```

### 映射

映射(Maps)是键值对的集合，使用`(key: value, ...)`来定义。其中 Key 可以是任何 *SassScript* 表达式(包括其他映射)，并使用`==`进行比较。每个 Key 只能映射到一个 Value，空映射表示为`()`。

> 使用`meta.inspect($value)`生成可读输出对映射进行调试。
{: .prompt-info}

Sass 中提供了用于动态操作的[映射函数](https://sass-lang.com/documentation/modules/map)：

- [`map.get($map, $key)`](https://sass-lang.com/documentation/modules/map/#get)，检索给定 Key 的值；
- [`map.set($map, $key, $value)`](https://sass-lang.com/documentation/modules/map/#set)，返回一个包含更新后的键值对的新映射；
- [`map.merge($map1, $map2)`](https://sass-lang.com/documentation/modules/map/#merge)，将两张映射合并成一张新映射；
- [`@each`](#each)指令，遍历映射中的每个键值对。

在列表函数中，映射可视为列表进行处理，此时它们会被转换为键值对列表(例如`(key1: value1, key2: value2)`将变为`key1 value1, key2 value2`)；但列表无法转换为映射(空列表除外)。

> 使用有引号字符串作为映射的 Key，以避免与其他数据类型混淆。
{: .prompt-warning}

与列表类似，映射也是不可变的。函数 **返回新的映射**，同时保留原始映射。要更新映射，只需将新映射重新赋值给原变量即可。

```scss
$prefixes-by-browser: (webkit: -webkit, moz: -moz);

@mixin add-browser-prefix($browser, $prefix) {
  $prefixes-by-browser: map.merge($prefixes-by-browser, ($browser: $prefix)) !global;
}

@include add-browser-prefix(opera, -o);
```

### Boolean 值与 Nulls 值

- Boolean 值：即`true`和`false`，常用于条件语句，例如`@if`；
- Nulls 值：即`null`值，用于指示数据缺失或重置属性。

## 样式规则

样式规则([Style rules](https://sass-lang.com/documentation/style-rules))是 Sass 的基础。属性声明(Property declarations)定义了应用于匹配选择器的元素的样式，Sass 通过简化编写过程并自动化样式任务的功能增强了此过程。声明的值可以是任何有效的 *SassScript* 表达式，该表达式会被求值并包含在编译后的 CSS 输出中。

```scss
.circle {
  $size: 100px;
  width: $size;
  height: $size;
  border-radius: $size * 0.5;
}
```

> 如果声明的值为`null`或者是 **无引号的空字符串**，Sass 会将其从编译后的 CSS 中省略。
{: .prompt-info}

### 嵌套规则

嵌套([Nesting](https://sass-lang.com/documentation/style-rules/#nesting))允许开发者按照层次结构组织相关样式，从而减少重复父选择器的需要并提高可读性。此功能使复杂的 CSS 结构更易于管理。

在 Sass 中可以将 CSS 规则嵌套在一起。当使用多个选择器时，则会创建 **复合选择器**，其中外部选择器将成为内部选择器的父级。例如：

```scss
nav {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: inline-block;
  }

  a {
    display: block;
    padding: 6px 12px;
    text-decoration: none;
  }
}
```

当 Sass 处理带有分组选择器的嵌套规则时，它会正确扩展每个嵌套规则。例如：

```scss
.alert, .warning {
  ul, p {
    margin-right: 0;
    margin-left: 0;
    padding-bottom: 0;
  }
}
```

编译后得到：

```css
.alert ul,
.alert p,
.warning ul,
.warning p {
  margin-right: 0;
  margin-left: 0;
  padding-bottom: 0;
}
```

还可以将选择器与组合器嵌套。组合器可以出现在外部选择器的末尾、内部选择器的开头，或者独立于它们之间：

```scss
ul > {
  li {
    list-style-type: none;
  }
}

h2 {
  + p {
    border-top: 1px solid gray;
  }
}

p {
  ~ {
    span {
      opacity: 0.8;
    }
  }
}
```

> 注意：过多的嵌套会导致 CSS 文件过大，影响性能！
{: .prompt-warning}

### 父级选择器

父选择器[`&`](https://sass-lang.com/documentation/style-rules/parent-selector)是 Sass 的一项强大功能，可以在嵌套规则中动态引用外部选择器。它支持复杂选择器的复用，从而提升代码的灵活性与可读性。例如它能为父元素附加伪类或添加前置选择器：

```scss
.alert {
  // Append a pseudo-class to the parent selector
  &:hover {
    font-weight: bold;
  }

  // Apply styles in a specific context, e.g., right-to-left languages
  [dir=rtl] & {
    margin-left: 0;
    margin-right: 10px;
  }

  // Use as an argument in a pseudo-class
  :not(&) {
    opacity: 0.8;
  }
}
```

> 在编译后的 CSS 输出，`&`会被替换为最外层的父选择器。在多层嵌套中，最顶部的父选择器会向下传递到每一层。
{: .prompt-tip}

`&`也可以用作选择器的第一部分，紧接着后缀来创建复合选择器：

```scss
#main {
  color: black;

  &-sidebar {
    border: 1px solid;
  }
}
```

如果`&`在样式规则之外使用，则结果为`null`。这可以在 Mixins 中加以利用，实现条件化样式应用：

```scss
@mixin app-background($color) {
  #{if(&, '&.app-background', '.app-background')} {
    background-color: $color;
    color: rgba(#fff, 0.75);
  }
}

@include app-background(#036);

.sidebar {
  @include app-background(#c6538c);
}
```

`&`也可以传递给函数、或者用于插值语句，或与选择器函数和`@at-root`规则结合使用。例如，要将父选择器与元素选择器统一起来：

```scss
@use "sass:selector";

@mixin unify-parent($child) {
  @at-root #{selector.unify(&, $child)} {
    @content;
  }
}

.wrapper .field {
  @include unify-parent("input") {
    /* ... */
  }
  @include unify-parent("select") {
    /* ... */
  }
}
```

### 属性嵌套

Sass 支持属性嵌套，允许使用插值`${}`动态生成属性名称。这对于动态创建带有前缀的属性或整个属性名称非常有用：

```scss
@mixin prefix($property, $value, $prefixes) {
  @each $prefix in $prefixes {
    -#{$prefix}-#{$property}: $value;
  }
  #{$property}: $value;
}

.gray {
  @include prefix(filter, grayscale(50%), moz webkit);
}
```

共享公共命名空间的属性(例如`font-family`、`font-size`和`font-weight`)可以嵌套在其命名空间下，以减少重复并改善组织方式：

```scss
.funky {
  font: {
    family: fantasy;
    size: 30em;
    weight: bold;
  }
}
```

命名空间还可以包含自己的属性值：

```scss
.funky {
  font: 20px/24px {
    family: fantasy;
    weight: bold;
  }
}
```

### 自定义属性

CSS 自定义属性(即 CSS 变量)几乎允许任何文本作为其值，这使得它们可以被 JavaScript 访问，并且具有高度的动态性。Sass 处理自定义属性声明的方式有所不同，它会将所有标记原样传递给 CSS；插值语句`#{}`除外，这是注入动态值的唯一方法：

```scss
$primary: #81899b;
$accent: #302e24;
$warn: #dfa612;

:root {
  --primary: #{$primary};
  --accent: #{$accent};
  --warn: #{$warn};
  --consumed-by-js: $primary; // $primary is not parsed as a value
}
```

> 插值语句`#{}`会从有引号字符串中删除引号。要保留自定义属性值中的引号，可以使用`meta.inspect()`函数。
{: .prompt-tip}

### 占位符选择器

Sass 引入了占位符选择器，用`%`来表示。它的功能类似于类选择器，但除非经过继承，否则会被排除在编译的 CSS 之外。这可以避免不必要的 CSS 输出，保持文件精简，并避免因未使用的样式导致冗余。占位符选择器非常适合可复用的样式块，无需强制使用特定的类名，尤其是在第三方库中。

```scss
%toolbelt {
  box-sizing: border-box;
  border-top: 1px rgba(#000, .12) solid;
  padding: 16px 0;
  width: 100%;

  &:hover {
    border: 2px rgba(#000, .5) solid;
  }
}

.action-buttons {
  @extend %toolbelt;
  color: #4285f4;
}

.reset-buttons {
  @extend %toolbelt;
  color: #cddc39;
}
```

## Mixins

Mixins 是一项强大的功能，它允许定义可复用的 CSS 样式块，从而避免使用例如`.float-left`这类非语义化的类名。借助 Mixins，开发者可以封装 CSS 规则、Sass 特性，甚至动态变量，从而创建灵活、可重复使用的样式。

当网站存在小规模重复的样式模式(如统一的颜色或字体)时，Sass 变量是保持一致性的理想选择。然而随着样式变得越来越复杂，重复使用大块 CSS 代码会变得非常繁琐，这时 Mixins 就能够高效地重复使用整个样式块。

### @mixin

`@mixin`可以定义可复用的样式块。例如：

```scss
@mixin large-text {
  font: {
    family: Arial;
    size: 20px;
    weight: bold;
  }
  color: #ff0000;
}
```

> 过度使用 Mixins 和大型样式块会使编译后的 CSS 体积膨胀，从而可能降低页面加载速度。请谨慎使用！
{: .prompt-danger}

当需要重复一组逻辑样式时，例如需要协同工作以实现特定效果(圆角或自定义排版设置)的一组属性，Mixins 是理想的选择。一个好的经验法则是：像`rounded-corners`、`fancy-font`或`no-bullets`这样的有着清晰定义的抽象样式，使用 Mixins 是一个非常明智地选择。而如果难以找到一个有意义的名称，Mixins 可能并非最佳解决方案。

Mixin 与 CSS 类有相似之处，但用途截然不同：CSS 类应用于 HTML 中，具有语义含义，描述元素是什么；Mixin 应用于样式表中，描述元素的外观，属于纯粹的样式展示层级。

Mixins 还可以包含选择器，甚至使用`&`引用父选择器。例如：

```scss
@mixin clearfix {
  display: inline-block;
  &:after {
    content: ".";
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
  }
  * html & {
    height: 1px;
  }
}
```

### @include

定义好 Mixins 之后，需要通过`@include`进行引用，例如：

```scss
.page-title {
  @include clearfix;
  padding: 4px;
  margin-top: 10px;
}
```

还可以在样式表的顶部引用 Mixins，但它们不能直接定义属性或使用父选择器：

```scss
@mixin silly-links {
  a {
    color: blue;
    background-color: red;
  }
}

@include silly-links;
```

Mixins 甚至可以包含其他 Mixins 以实现模块化组合：

```scss
@mixin highlighted-background { 
  background-color: #fc0;
}

@mixin header-text {
  font-size: 20px;
}

@mixin compound {
  @include highlighted-background;
  @include header-text;
}
```

> 为了安全性和灵活性，Mixin 最好使用后代选择器。这样可以确保它们在样式表的任何位置被导入时，都不会引发特异性问题。
{: .prompt-warning}

### 参数化 Mixins

Mixins 有了参数之后功能更加强大，它可以传递变量来动态自定义样式。参数定义在括号中，并以逗号分隔：

```scss
@mixin sexy-border($color, $width) {
  border: {
    color: $color;
    width: $width;
    style: dashed;
  }
}

p {
  @include sexy-border(blue, 1in);
}
```

还可以为参数设置默认值，如果没有提供值，则使用这些默认值：

```scss
@mixin sexy-border($color, $width: 1in) {
  border: {
    color: $color;
    width: $width;
    style: dashed;
  }
}

p {
  @include sexy-border(blue);
}

h1 {
  @include sexy-border(blue, 2in);
}
```

为提高可读性，参数也可通过关键字参数传递：

```scss
p {
  @include sexy-border($color: blue);
}

h1 {
  @include sexy-border($color: blue, $width: 2in);
}
```

当不确定 Mixins 需要多少个参数时(例如对于具有多个阴影的`box-shadow`)，可以使用`...`将参数视为列表：

```scss
@mixin box-shadow($shadows...) {
  -moz-box-shadow: $shadows;
  -webkit-box-shadow: $shadows;
  box-shadow: $shadows;
}

.shadows {
  @include box-shadow(0px 4px 5px #666, 2px 6px 10px #999);
}
```

还可以使用`...`传递值列表作为参数：

```scss
$values: #ff0000, #00ff00, #0000ff;

@mixin colors($text, $background, $border) {
  color: $text;
  background-color: $background;
  border-color: $border;
}

.primary {
  @include colors($values...);
}
```

这种方法也适用于包装 Mixins，它可以扩展功能而无需改变原始 Mixins 的签名：

```scss
@mixin stylish-mixin($args...) {
  // Base styles
}

@mixin wrapped-stylish-mixin($args...) {
  font-weight: bold;
  @include stylish-mixin($args...);
}

.stylish {
  @include wrapped-stylish-mixin(#00ff00, $width: 100px);
}
```

### Content Blocks

Mixins 可以接受 Content Blocks，使用`@content`的特定位置注入自定义样式。这对于有条件地应用样式非常有用，例如针对特定浏览器：

```scss
@mixin apply-to-ie6-only {
  * html {
    @content;
  }
}

@include apply-to-ie6-only {
  #logo {
    background-image: url(/logo.gif);
  }
}
```

编译后得到：

```scss
* html {
  #logo {
  background-image: url(/logo.gif);
  }
}
```

Content Blocks 在其定义的作用域内进行求值，而不是在 Mixins 的作用域内。这意味着 Mixins 内部的局部变量无法被内容块访问，变量会被解析为其全局或周围作用域的值：

```scss
$color: white;

@mixin colors($color: blue) {
  background-color: $color;
  @content;
  border-color: $color;
}

.colors {
  @include colors {
    color: $color; // Resolves to global $color (white), not the Mixin's $color (blue)
  }
}
```

类似地，在周围范围内定义的变量可以在 Content Blocks 内使用：

```scss
#sidebar {
  $sidebar-width: 300px;
  width: $sidebar-width;

  @include smartphone {
    width: $sidebar-width / 3;
  }
}
```

## at-Rules

### 加载与导入

Sass 提供了强大的工具来导入和加载样式表，使开发者能够高效组织代码，并在不同文件间复用变量、Mixins 和函数等 *SassScript*。`@use`和`@forward`是 Sass 中管理依赖项的现代推荐方法，而较旧的`@import`现已弃用。

#### @use

`@use`可以从另一个 Sass 样式表(称为模块，Modules)加载 Mixins、函数、变量和其他成员。与旧版`@import`不同，使用`@use`加载的模块无论被引用多少次，在编译后的 CSS 输出中都只会被包含一次，从而确保代码更简洁、更高效。

以下是使用`@use`的基本示例：

```scss
// _corners.scss
$radius: 3px;

@mixin rounded {
  border-radius: $radius;
}

// style.scss
@use "corners";

.button {
  @include corners.rounded;
  padding: 5px + corners.$radius;
}
```

在此示例中，加载了`corners`模块，并且其成员(`rounded` Mixins 和`$radius`变量)使用`corners`命名空间进行访问。

可以使用`as`关键字为模块分配自定义命名空间，从而使代码更简洁或更具上下文相关性：

```scss
// _corners.scss
$radius: 3px;

@mixin rounded {
  border-radius: $radius;
}

// style.scss
@use "corners" as c;

.button {
  @include c.rounded;
  padding: 5px + c.$radius;
}
```

为了完全避免命名空间，还可以使用`as *`将模块的所有成员导入当前作用域：

```scss
// _corners.scss
$radius: 3px;

@mixin rounded {
  border-radius: $radius;
}

// style.scss
@use "src/corners" as *;

.button {
  @include rounded;
  padding: 5px + $radius;
}
```

> `@use`必须出现在其他 Sass 指令之前(`@forward`除外)。但是可以在`@use`之前声明变量来配置模块。
{: .prompt-warning}

为限制特定成员的访问权限，Sass 允许通过在变量、Mixins 或函数名前添加连字符`-`或下划线`_`来定义私有成员。这些成员仅在模块内部可访问，但在加载该模块的文件中不可用：

```scss
// _corners.scss
$-radius: 3px;

@mixin rounded {
  border-radius: $-radius;
}

// style.scss
@use "corners";

.button {
  @include corners.rounded;
  padding: 5px + corners.$-radius; // Error: $-radius is private and inaccessible
}
```

这确保了敏感或内部成员保持封装，使模块的公共 API 保持简洁。

模块可以使用`!default`标志声明变量，允许下游样式表使用`@use ... with`覆盖其默认值：

```scss
// _library.scss
$black: #000 !default;
$border-radius: 0.25rem !default;
$box-shadow: 0 0.5rem 1rem rgba($black, 0.15) !default;

code {
  border-radius: $border-radius;
  box-shadow: $box-shadow;
}

// style.scss
@use 'library' with (
  $black: #222,
  $border-radius: 0.1rem
);
```

在这种情况下，`$black`和`$border-radius`会被覆盖，而 $box-shadow 则保留其默认值。**即使模块被多次加载，其配置也只会应用一次！**

> 在样式表中，每个模块只能使用一次`@use ... with`！
{: .prompt-warning}

对于更高级的配置需求，例如传递多个变量或动态更新配置，可以考虑使用 Mixins：

```scss
// _library.scss
$-black: #000;
$-border-radius: 0.25rem;
$-box-shadow: null;

@function -box-shadow() {
  @return $-box-shadow or (0 0.5rem 1rem rgba($-black, 0.15));
}

@mixin configure($black: null, $border-radius: null, $box-shadow: null) {
  @if $black {
    $-black: $black !global;
  }
  @if $border-radius {
    $-border-radius: $border-radius !global;
  }
  @if $box-shadow {
    $-box-shadow: $box-shadow !global;
  }
}

@mixin styles {
  code {
    border-radius: $-border-radius;
    box-shadow: -box-shadow();
  }
}

// style.scss
@use 'library';

@include library.configure(
  $black: #222,
  $border-radius: 0.1rem
);

@include library.styles;
```

这种方法为复杂的用例提供了更大的灵活性，例如传递配置图或在模块加载后更新样式。

除了以上用法，还可以在加载模块后为模块的变量重新赋值：

```scss
// _library.scss
$color: red;

// _override.scss
@use 'library';
library.$color: blue;

// style.scss
@use 'library';
@use 'override';
```

这时`library.$color`在最终输出中更新为蓝色，演示了如何在下游修改模块。

#### @forward

`@forward`是专为构建模块化 Sass 库而设计。它会加载样式表，并将其中的 Mixins、函数和变量提供给使用`@use`的下游样式表。这可以为跨多个文件的库创建单个入口点。例如：

```scss
// _list.scss
@mixin list-reset {
  margin: 0;
  padding: 0;
  list-style: none;
}

// bootstrap.scss
@forward "list";

// styles.scss
@use "bootstrap";

li {
  @include bootstrap.list-reset;
}
```

注意，`@forward`转发的成员仅在下游样式表`styles.scss`中可用，而在转发文件`bootstrap.scss`中不可用。

为了使成员名称更具描述性，可以使用`<prefix>-*`为所有转发的成员添加前缀：

```scss
// _list.scss
@mixin reset {
  margin: 0;
  padding: 0;
  list-style: none;
}

// bootstrap.scss
@forward "list" as list-*;

// styles.scss
@use "bootstrap";

li {
  @include bootstrap.list-reset;
}
```

在这个示例中，`reset` Mixins 被公开为了`list-reset`，提高了下游样式表的清晰度。

可以使用隐藏或显示关键字来控制转发哪些成员，例如：

```scss
// _list.scss
$horizontal-list-gap: 2em;

@mixin list-reset {
  margin: 0;
  padding: 0;
  list-style: none;
}

@mixin list-horizontal {
  @include list-reset;
  li {
    display: inline-block;
    margin: {
      left: -2px;
      right: $horizontal-list-gap;
    }
  }
}

// bootstrap.scss
@forward "list" hide list-reset, $horizontal-list-gap;
```

在这个例子中，`list-reset`和`$horizo​​ntal-list-gap`被隐藏，使得下游样式表无法使用它们，而`list-horizo​​ntal`仍然可以访问。

类似于`@use`，`@forward`支持使用`with`子句进行配置。带有`!default`的变量可以被覆盖，并且这些默认值可以在后续进一步自定义：

```scss
// _library.scss
$black: #000 !default;
$border-radius: 0.25rem !default;
$box-shadow: 0 0.5rem 1rem rgba($black, 0.15) !default;

code {
  border-radius: $border-radius;
  box-shadow: $box-shadow;
}

// _opinionated.scss
@forward 'library' with (
  $black: #222 !default,
  $border-radius: 0.1rem !default
);

// style.scss
@use 'opinionated' with ($black: #333);
```

例子中的`_opinionated.scss`使用默认配置转发了`_library.scss`，然后`style.scss`进一步覆盖它。

#### @import

Sass 虽然仍能支持`@import`，但在最新版中已被弃用，取而代之的是 `@use`和`@forward`。它将导入的 SCSS 或 Sass 文件合并为一个 CSS 输出，使变量和混合宏在全局范围内可用。然而它有几个缺点：

- 全局作用域污染：导入的成员会被添加到全局作用域，增加了命名冲突的风险；
- 多次导入：同一个文件可能被多次导入，这可能会导致输出中的 CSS 重复；
- 嵌套导入：`@import`可以在样式规则中使用，但不能在`@mixin`或控制流指令中使用。

> `@mixin`或控制流语句中不允许嵌套`@import`！
{: .prompt-danger}

可以使用单个`@import`语句导入多个文件，并为 CSS`url()`导入使用插值语句`#{}`：

```scss
$family: unquote("Droid+Sans");
@import url("http://fonts.googleapis.com/css?family=\#{$family}");
```

> 为了防止 Sass 文件被编译为 CSS，请在其名称前添加下划线(例如`_example.scss`)，这些部分文件仅用于导入。
{: .prompt-tip}

`@use`旨在取代旧的`@import`指令，但它的工作方式被有意设计得不同。以下是两者之间的一些主要区别：

- `@use`将成员加载到模块的命名空间中，避免全局作用域污染，并支持更短、无冲突的名称；
- 使用`@use`加载的模块只会被包含一次，从而避免重复的 CSS 输出；
- `@use`必须出现在文件顶部，并且不能嵌套在样式规则中。嵌套导入可以用 Mixins 或`meta.load-css()`函数替换；
- `@use`要求模块 URL 为带引号的字符串(例如`@use "library"`)。

### 继承

在设计网页时，可能经常会遇到多个元素共享一组通用样式，但某些元素需要额外样式的情况。HTML 中一种常见的做法是为一个元素分配多个类，一个用于共享样式，另一个用于特有样式。例如可能有一个通用的`error`样式和一个更具体的 `seriousError`样式，如下所示：

在设计网页的时候常常遇到一个元素使用的样式与另一个元素完全相同，但又添加了额外的样式。通常会在 HTML 中给元素定义两个 Class：一个通用样式和一个特殊样式。假设现在要设计一个**普通错误样式**与一个**严重错误样式**，我们一般会这样写：

```html
<div class="error seriousError">
  Oh no! You've been hacked!
</div>
```

其样式如下：

```css
.error {
  border: 1px #f00;
  background-color: #fdd;
}

.seriousError {
  border-width: 3px;
}
```

这种方法可行但存在缺陷。你必须始终记住在 HTML 中将`.seriousError`与`.error`配对，这可能会导致错误或混乱、无语义的标记。Sass 的`@extend`提供了一个更简洁的解决方案，它允许一个选择器继承另一个选择器的所有样式，从而无需应用多个类。

Sass 中的`@extend`可以将一个选择器的样式继承到另一个选择器。例如：

```scss
.error {
  border: 1px #f00;
  background-color: #fdd;
}

.seriousError {
  @extend .error;
  border-width: 3px;
}
```

在这个示例中，`.seriousError`继承了`.error`的所有样式，并添加了`border-width: 3px`的样式。这意味着只需要在 HTML 中应用`.seriousError`类，从而简化标记。编译后的 CSS 如下所示：

```css
.error, .seriousError {
  border: 1px #f00;
  background-color: #fdd;
}

.seriousError {
  border-width: 3px;
}
```

Sass 会智能地组合选择器以避免冗余。它不会生成像`.seriousError.seriousError`这样不必要的重复代码，并且会移除无法匹配任何元素的选择器(例如`#main#footer`)。

#### 继承复杂选择器

`@extend`并不局限于类选择器。开发者可以继承任何应用于单个元素的选择器，例如`.special.cool`、`a:hover`，甚至`a.user[href^="http://"]`。例如：

```scss
a:hover {
  text-decoration: underline;
}

.hoverlink {
  @extend a:hover;
}
```

编译后得到：

```css
a:hover, .hoverlink {
  text-decoration: underline;
}
```

这种灵活性使得`@extend`能够在各种选择器类型中重用样式。

#### 多重继承

单个选择器可以继承多个选择器的样式，并组合它们的属性。请考虑以下示例：

```scss
.error {
  border: 1px #f00;
  background-color: #fdd;
}

.attention {
  font-size: 3em;
  background-color: #ff0;
}

.seriousError {
  @extend .error;
  @extend .attention;
  border-width: 3px;
}
```

编译后得到：

```css
.error, .seriousError {
  border: 1px #f00;
  background-color: #fdd;
}

.attention, .seriousError {
  font-size: 3em;
  background-color: #ff0;
}

.seriousError {
  border-width: 3px;
}
```

在这个例子中，`.seriousError`同时继承了`.error`和`.attention`的样式。需要注意的是，后定义的样具有更高的优先级，因此`.seriousError`的背景颜色是`#ff0`(来自`.attention`)，而不是来自`.error`的`#fdd`。

除此之外，还可以使用逗号分隔的列表在一行中写入多个继承名，例如 `@extend .error, .attention;`，这样可以达到相同的效果。

继承也可以链式执行。例如：

```scss
.error {
  border: 1px #f00;
  background-color: #fdd;
}

.seriousError {
  @extend .error;
  border-width: 3px;
}

.criticalError {
  @extend .seriousError;
  position: fixed;
  top: 10%;
  bottom: 10%;
  left: 10%;
  right: 10%;
}
```

此时`.criticalError`继承自`.seriousError`的样式，而`.seriousError`又继承自`.error`，从而形成清晰的样式层级结构。上面的代码编译为：

```css
.error, .seriousError, .criticalError {
  border: 1px #f00;
  background-color: #fdd;
}

.seriousError, .criticalError {
  border-width: 3px;
}

.criticalError {
  position: fixed;
  top: 10%;
  bottom: 10%;
  left: 10%;
  right: 10%;
}
```

#### 选择器序列

在 Sass 中，无法直接继承选择器序列(例如`.foo .bar`或`.foo + .bar`)，但可以在序列中继承单个选择器。例如：

```scss
a {
  color: blue;
  &:hover {
    text-decoration: underline;
  }
}

#fake-links .link {
  @extend a;
}
```

在序列中继承选择器时，Sass 会智能地合并序列，并且只生成有用的选择器组合，避免输出过于复杂或冗余。例如：

```scss
#admin .tabbar a {
  font-weight: bold;
}

#admin .overview .fakelink {
  @extend a;
}
```

编译后得到：

```css
#admin .tabbar a,
#admin .tabbar .overview .fakelink,
#admin .overview .tabbar .fakelink {
  font-weight: bold;
}
```

例如上面的例子中，两个序列存在共同部分(即`#admin`)，Sass 会高效地将它们合并。

#### @extend-Only 选择器

创建 Sass 库时，您可能希望定义仅用于继承而非直接使用的样式。Sass 提供了占位符选择器，用`%`符号表示。除非经过继承，否则这些选择器会被排除在编译后的 CSS 之外，从而保持输出的简洁性并避免与其他样式名称冲突。
例如：

```scss
%toolbelt {
  box-sizing: border-box;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding: 16px 0;
  width: 100%;

  &:hover {
    border: 2px solid rgba(0, 0, 0, 0.5);
  }
}

.action-buttons {
  @extend %toolbelt;
  color: #4285f4;
}

.reset-buttons {
  @extend %toolbelt;
  color: #cddc39;
}
```

在这个例子中，除非进行继承操作，否则`%toolbelt`样式不会出现在编译后的 CSS 中，这使其成为库中可重用样式集的理想选择。

#### !optional 关键字

默认情况下，如果`@extend`失效，如尝试继承不存在的选择器(例如`.notice`)，或者继承存在冲突的选择器(例如将`.notice`从`h1.notice`继承到`a.important`)，Sass 则会抛出错误。要使继承可选并避免错误，可以使用`!optional`标志：

```scss
a.important {
  @extend .notice !optional;
}
```

这确保了如果`.notice`不存在或无法继承，Sass 也不会产生错误。

#### CSS 指令限制

在 CSS 指令(例如`@media`)中使用`@extend`时，Sass 会进行一些限制，以避免生成过多的代码。你只能在同一指令作用域内继承选择器。例如：

```scss
@media print {
  .error {
    border: 1px solid #f00;
    background-color: #fdd;
  }

  .seriousError {
    @extend .error;
    border-width: 3px;
  }
}
```

但不可以这样：

```scss
.error {
  border: 1px solid #f00;
  background-color: #fdd;
}

@media print {
  .seriousError {
    @extend .error;
    border-width: 3px;
  }
}
```

此限制确保 Sass 不会通过在不相关的上下文中扩展样式来产生冗余的 CSS。

### @at-root

`@at-root`的语法是：`@at-root [<selector>] { ... }`。`@at-root`让块中的所有内容在文档根节点处输出，而非采用常规的嵌套方式。它最常用于与 *SassScript* 父选择器和选择器函数进行高级嵌套操作。

例如想编写一个与外部选择器和元素选择器匹配的选择器，那么则可以编写一个类似下面的 Mixins，使用`selector.unify()`函数将`&`与下游样式表的选择器组合起来：

```scss
@use "sass:selector";

@mixin unify-parent($child) {
  @at-root #{selector.unify(&, $child)} {
    @content;
  }
}

.wrapper .field {
  @include unify-parent("input") {
    /* ... */
  }
  @include unify-parent("select") {
    /* ... */
  }
}
```

`@at-root`在这里是必需的，因为 Sass 在执行选择器嵌套时不知道使用了什么插值来生成选择器。这意味着即使你使用`&`作为 *SassScript* 表达式，它也会自动将外部选择器添加到内部选择器中。`@at-root`明确告诉 Sass 不要包含外部选择器(尽管它始终会包含在`&`表达式中)。

在单独使用时，`@at-root`仅会移除样式规则。诸如`@media`或`@supports`之类的 at-Rules 将会保留。如果不希望这样，可以使用类似媒体查询功能的语法来精确控制其包含或排除的内容，例如`@at-root (with: <rules...>) { ... }`或`@at-root (without: <rules...>) { ... }`。`(without: ...)`查询会告诉 Sass 哪些规则应该被排除，而`(with: ...)`查询会排除除列出的规则之外的所有规则。

```scss
@media print {
  .page {
    width: 8in;

    @at-root (without: media) {
      color: #111;
    }

    @at-root (with: rule) {
      font-size: 1.2em;
    }
  }
}
```

## 控制流

### 判断语句

示例如下：

```scss
$type: monster;
p {
  @if $type == ocean {
    color: blue;
  } @else if $type == matador {
    color: red;
  } @else if $type == monster {
    color: green;
  } @else {
    color: black;
  }
}
```

### 循环与遍历

#### @for 与 @while

`@for`的语法为：`@for <variable> from <expression> to <expression> { ... }`，或者`@for <variable> from <expression> through <expression> { ... }`。

如果使用`to`，则包前不包后；如果使用了`through`，则包前也包后。例如：

```scss
@for $i from 1 through 3 {
  .item-#{$i} {
    width: 2em * $i;
  }
}
```

还有的例子是：

```scss
$i: 6;

@while $i > 0 {
  .item-#{$i} {
    width: 2em * $i;
  }

  $i: $i - 2;
}
```

#### @each

`@each`的语法规则如下：

```scss
@each <variable> in <expression> { ... }
```

其中`<expression>`为一个列表。`@each`可以很容易地为列表中的每个元素或 Maps 中的每对元素指定样式或进行计算。这对于重复的风格来说是很好的，它们之间只有一些变化。

例如：

```scss
$animals: puma, sea-slug, egret, salamander;

@each $animal in $animal {
  .#{$animal}-icon {
    background-image: url('/images/#{$animal}.png');
  }
}
```

`@each`也可以使用多个变量，如果是该变量是一个列表，那么子列表的每个元素都被分配给各自的变量。例如:

```scss
$objects: (puma, black, default), (sea-slug, blue, pointer), (egret, white, move);

@each $animal, $color, $cursor in $objects {
  .#{$animal}-icon {
    background-image: url('/images/#{$animal}.png');
    border: 2px solid $color;
    cursor: $cursor;
  }
}
```

由于 Maps 被视为成对的列表，因此多重赋值也适用于它们。例如:

```scss
$object: (h1: 2em, h2: 1.5em, h3: 1.2em);

@each $header, $size in $object {
  #{$header} {
    font-size: $size;
  }
}
```

## 函数

在 Sass 中定义了多种函数，有些甚至可以通过普通的 CSS 语句调用，例如：

```scss
p {
  color: hsl(0, 100%, 50%);
}
```

Sass 函数允许使用关键词参数，上面的例子也可以写成：

```scss
p {
  color: hsl($hue: 0, $saturation: 100%, $lightness: 50%);
}
```

虽然不够简明，但是阅读起来会更方便。关键词参数给函数提供了更灵活的接口，以及容易调用的参数。关键词参数可以打乱顺序使用，如果使用默认值也可以省缺，另外，参数名被视为变量名，下划线、短横线可以互换使用。

通过 [Sass::Script::Functions](http://sass-lang.com/docs/yardoc/Sass/Script/Functions.html) 查看完整的 Sass 函数列表，参数名，以及如何自定义函数。

Sass 支持自定义函数，并能在任何属性值或变量、表达式等中使用：

```scss
$grid-width: 40px;
$gutter-width: 10px;

@function grid-width($n) {
  @return $n * $grid-width + ($n - 1) * $gutter-width;
}

#sidebar {
  width: grid-width(5);
}
```

与`@mixin`相同，也可以传递若干个全局变量给函数作为参数。一个函数可以含有多条语句，需要调用`@return`输出结果。

自定义的函数也可以使用关键词参数，上面的例子还可以这样写：

```scss
#sidebar {
  width: grid-width($n: 5);
}
```

建议在自定义函数前添加前缀避免命名冲突，其他人阅读代码时也会知道这不是 Sass 或者 CSS 的自带函数。自定义函数与`@mixin` 相同，都支持可变参数。

* * *

## 参考文献

1. [Sass: Documentation](https://sass-lang.com/documentation)
2. [https://sass.hk](https://sass.hk)
3. [https://www.w3schools.com/sass/default.php](https://www.w3schools.com/sass/default.php)
4. [https://cankaoshouce.com/sass/sass-course.html](https://cankaoshouce.com/sass/sass-course.html)
5. [https://www.geeksforgeeks.org/css/sass](https://www.geeksforgeeks.org/css/sass)
