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

Sass(Syntactically Awesome Style Sheets)是一个 CSS 预处理器，有助于减少 CSS 的重复代码并节省时间。它是一种更稳定、更强大的 CSS 扩展语言，能够结构化地描述文档的样式。

<!--more-->

Sass 在 CSS 语法的基础上增加了[变量](https://sass-lang.com/documentation/variables)、[嵌套规则](https://sass-lang.com/documentation/style-rules#nesting)、[混合宏](https://sass-lang.com/documentation/at-rules/mixin)、[继承](https://sass-lang.com/documentation/at-rules/extend/)和[函数](https://sass-lang.com/documentation/modules)等高级功能，并且所有语法均与 CSS 完全兼容，这使得 CSS 更易于维护、可复用且更易于编写。使用 Sass 有助于更好地组织管理样式文件，以及更高效地开发项目。

## Sass 变量

Sass 变量的定义方式是：`<variable>: <expression>`，其中变量名使用`$`符号开头进行声明。

```scss
$myFont: Helvetica, sans-serif;

body {
  font-family: $myFont;
}
```

### 变量的作用范围

Sass 变量默认是**局部变量**，仅在定义它的**代码块内有效**；如果变量在样式表的最外层(不在任何代码块内)定义，则为全局变量，可在整个 Sass 样式表或者下游文件里使用。例如：

```scss
$myColor: red;

h1 {
  $myColor: green;
  color: $myColor;
}

p {
  color: $myColor;
}
```

这将会输出

```css
h1 {
  color: green;
}

p {
  color: red;
}
```

> 如果在局部作用域内定义了与全局变量同名的变量，那么**局部变量则会遮蔽全局变量**(即 [Shadowing](https://sass-lang.com/documentation/variables/#shadowing))，该变量仅在当前代码块内生效。
{: .prompt-warning}

在局部作用域内，可以使用`!global`将变量显式声明为全局变量，遮蔽之前定义的**同名全局变量**。例如：

```scss
$myColor: red;

@mixin change-color {
  #myColor: green !global;  // 强制遮蔽
};

h1 {
  @include change-color;
  color: $myColor;
}

p {
  color: $myColor;
}
```

这将会输出

```css
h1 {
  color: green;
}

p {
  color: green;
}
```

若`change-color`没有被调用，那么`<h1>`与`<p>`的属性值则会为`red`。

> `!global`只能用于遮蔽已经在样式表顶层声明的变量，不能用于声明一个新变量！
{: .prompt-danger}

在声明变量时，变量值也可以引用其他变量。当通过粒度区分，为不同的值取不同名字时会相当有用。下面这例子中，我们在独立的颜色值粒度上定义了一个变量，且在另一个更复杂的边框值粒度上也定义了一个变量：

```scss
$highlight-color: blue;
$highlight-border: 1px solid $highlight-color;

.selected {
  border: $highlight-border;
}
```

### 默认变量

一般情况下，如果反复声明一个变量，那么只有**最后一次**声明才有效，并且它会覆盖前面所声明过的所有值。可以在变量的结尾添加`!default`，这会给一个未通过`!default`声明的变量赋值。只有当变量**未定义**或者它的值为`null`时，才会将值赋给该变量，否则将会使用默认值。

这样做的好处是：如果在 Sass 样式表里已经声明了一个变量，那么下游文件再对该变量进行声明的操作将会失效；如果下游文件中没有对该变量进行赋值，则会使用样式表的默认值。例如：

```scss
// _library.scss
$content: "First content";
```

```scss
// style.scss
@import "library"
$content: "Second content?" !default;  // 这不会生效！

div {
  content: $content;
}
```

这将会输出

```css
div {
  content: "First content";
}
```

在 Sass 中，可以使用`@use <url> with ( <variable>: <value>[, ...] );`配置变量的值；但是前提条件是：变量必须定义在样式表顶部，并且用`!default`声明时才会生效！

```scss
// _library.scss
$black: #000 !default;
$border-radius: 0.25rem !default;
$box-shadow: 0 0.5rem 1rem rgba($black, 0.15) !default;
```

```scss
// style.scss
@use 'library' with (
  $black: #222,
  $border-radius: 0.1rem
);
```

`$black`的值会被重新赋值为`#222`，`$border-radius`的值为`0.1rem`。

### 控制流中的变量作用域

在控制流中声明的变量有特殊的作用域规则：新的声明会赋值给这些变量，而不是由局部变量遮蔽全局变量。这就使得很容易地为变量赋值定义规则，或者在循环中不断迭代或计算值。例如：

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

这将会输出

```css
.button {
  background-color: hsl(339, 81%, 25%);
  border: 1px solid hsl(277, 70%, 95%);
  border-radius: 3px;
}
```

> 控制流作用域中的声明可以赋值给外部作用域里的变量，但是控制流作用域中定义的变量无法在外作用域里访问。要确保给控制流作用域中的变量赋值之前已经定义了该变量，可以在外部将其声明为`null`或者其他值。
{: .prompt-warning}

## 插值语句

在 Sass 中使用`#{}`定义一个插值语句，它几乎可以在 Sass 样式表的任何地方使用，任意数据类型、变量和运算操作等[^SassScript]都可以嵌入到代码块里。这在编写混合宏时特别有用，因为它允许创建选择器的过程中传入参数：

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

这将会输出

```css
p { font: 12px/30px; }
```

## 数据类型

### 字符串

Sass 字符串(Strings)支持**有引号字符串**(`'`或者`"`定义)和**无引号字符串**，在编译 CSS 文件时不会改变其类型。在实践中除了那些特殊的无引号字符串(例如颜色值)之外，最好都是用有引号字符串。

Sass 中有许多[字符串函数](https://sass-lang.com/documentation/modules/string)，例如`string.unquote()`可以将有引号字符串转换成无引号字符串，`string.quote()`会将无引号字符串转换成无引号字符串。

> 在使用插值语句`#{}`时，有引号字符串将被编译为无引号字符串。
{: .prompt-tip}

Sass 还有很多字符串索引函数，索引 1 表示字符串的第一个字符，索引 -1 表示字符串中的最后一个字符。例如`string.index()`与`string.slice()`。

### 数值

数值(Numbers)由两部分组成：数字及其单位，例如`16`和`16px`。

> Sass 的数值支持与 CSS 的数值的相同格式，包括科学计数法。
{: .prompt-info}

Sass 有强大的单位计算操作，当两个数值相乘时，它们的**单位也做相对应的计算**，例如`4px*6px: 24px*px`，`div(5px, 2s): 2.5px/s`。一个数值的分子、分母可以是**任意数量的单位**，分子的单位为第一个数值的单位，分母的单位是第二个数值的单位。

Sass 可以在兼容的单位之间自动转换，如果尝试组合不兼容的单位时(如`1in+1em`)，Sass 则会抛出错误。

如果分子的单位与分母的单位是兼容(例如`math.div(96px, 1in)`)，那么它们将会被相互抵消，得到一个无单位的数值。这种抵消使得你可以轻松定义一个比率，用于在不同单位之间进行转换。在下面的示例中，我们将速度设置为每个像素 1/50 秒，然后将其乘以过渡覆盖的像素数，以获得所需的时间：

```scss
$transition-speed: math.div(1s, 50px);  // 1/50(s/px)

@mixin move($left-start, $left-stop) {
  position: absolute;
  left: $left-start;
  transition: left ($left-stop - $left-start) * $transition-speed;

  &:hover {
    left: $left-stop;
  }
}

.slider {
  @include move(10px, 120px);
}
```

要特别指出的是，避免使用像`#{$number}px`这样的插值语句。这实际上并没有创建一个数值，而只是创建一个**无引号字符串**，它不能与任何数值或者函数进行运算。尽量让数值单位简洁，例如`$number*1px`或者直接给`$number`赋值一个单位。

Sass 的百分比和其他单位一样，但是它们不能与小数相互转换，因为在 CSS 中小数和百分比意味着不同的东西。例如，`50%`是一个以`%`为单位的数值。可以使用`math.div($percentage, 100%)`将`$percentage`转换成对应的小数，使用`$decimal*100%`或者`math.percentage()`计算对应小数的百分比。

> Sass 在处理精确小数的时候，会四舍五入地将小数保留至 10 位。
{: .prompt-info}

### 数组

数组(Lists)可以指定多个值，这些值之间通过空格、逗号或者`/`分隔，也可以使用`[ ]`括起来，只要它们在数组中保持一致即可。单个值也被视为(只包含一个值的)数组，任何用空格或者逗号的表达式也会被视作是一个数组，空数组可以直接用`[]`表示。

> 使用`/`分隔数组已经被**弃用**，推荐使用`list.slash($elements...)`代替。
{: .prompt-warning}

数组中也可以包含子数组，例如`1px 2px, 5px 6px`、`(1px 2px) (5px 6px)`或者`(1px, 2px), (5px, 6px)`。

数组本身没有太多功能，但是通过 Sass 可以发挥其最大的作用：

- [`nth`](https://sass-lang.com/documentation/modules/list/#nth)函数可以直接访问数组中的某一项；
- [`join`](https://sass-lang.com/documentation/modules/list/#join)函数可以将多个数组连接在一起；
- [`append`](https://sass-lang.com/documentation/modules/list/#append)函数可以在数组中添加新的值；
- [`index`](https://sass-lang.com/documentation/modules/list#index)函数可以查找元素在数组中的索引值；
- [`@each`](#each)指令能够遍历数组中的每一项。

Sass 的数组是不可修改的，数组函数的返回值都是新的数组。当样式表的不同部分之间共享同一个数组时，不可变性可以帮助避免许多潜在的 Bug。但是仍然可以通过将新数组分配给相同的变量来更新状态。这通常在函数和`mixin`中用于将一堆值收集到一个数组中：

```scss
@function prefixes-for-browsers($browsers) {
  $prefixes: ();

  @each $browser in $browsers {
    $prefixes: list.append($prefixes, map.get($prefixes-by-browser, $browser));
  }

  @return $prefixes;
}
```

当需要声明一个接受任意参数的`mixin`或函数时，得到的值是一个被称为**参数数组**的特殊数组。它的作用就像一个包含传递给`mixin`或函数的所有参数的数组，但有一个额外的特性：如果传递了关键字参数，则可以通过将参数数组传递给[`meta.keywords()`](https://sass-lang.com/documentation/modules/meta#keywords)函数来作为映射访问它们：

```scss
@mixin syntax-colors($args...) {
  @debug meta.keywords($args);

  @each $name, $color in meta.keywords($args) {
    pre span.stx-#{$name} {
      color: $color;
    }
  }
}

@include syntax-colors($string: #080, $comment: #800, $variable: #60b)
```

### 颜色

任何 CSS 颜色表达式都会对应一个颜色值，这包括大量与无引号字符串也无法区分的颜色名称。在 Compressed 模式下，Sass 会输出颜色的最小 CSS 表达式。例如`#FF0000`在 Compressed 模式下会输出为`red`，`blanchedalmond`会输出为`#FFEBCD`。

> 如果颜色名称被用于选择器的构建，则必须将其加上引号，以避免选择器中插值的颜色在 Compressed 模式下会变成无效语法。
{: .prompt-warning}

### 映射

Maps 是`(key: value)`的组合，并且允许被**动态访问**。Maps 的键值可以是任意 SassScript 表达式(甚至是另一个 Maps)，使用`==`比较两个键是否相同。给定的值可以与多个键相关联，但是给定的键在 Maps 中只能关联一个值，对于空 Maps 使用`()`表示。

> 使用[`meta.inspect($value)`](https://sass-lang.com/documentation/modules/meta#inspect)函数生成用于调试 Maps 的有用输出。
{: .prompt-warning}

Maps 可以通过以下 Sass 函数对其进行操作：

- [`map-get`](https://sass-lang.com/documentation/modules/map/#get)函数用于通过键查找对应的值；
- [`map-set`](https://sass-lang.com/documentation/modules/map#set)函数用作修改匹配键的值；
- [`map-merge`](https://sass-lang.com/documentation/modules/map/#merge)函数用于 Maps 和新加的键值融合；
- [`@each`](#each)指令可添加样式到一个 Maps 中的每个键值对。

数组可以使用的场景，Maps 也同样可以使用。在数组函数中 Maps 会被自动转换为数组。事实上，一切的 Maps 都是数组(包括空 Map)，每个 Maps 都是包括键值对的子数组的数组。例如`(key1: value1, key2: value2)`会被数组函数自动转换成`key1 value1, key2 value2`，**反之则不行**(空数组除外)。

> 为了避免混淆，应该使用有引号字符串作为 Maps 的键(无引号字符串可能颜色值或者其他类型)。
{: .prompt-tip}

Sass 中的 Maps 是不可修改的，这意味着 Maps 的值的内容永远不会改变。Sass 函数都返回新的 Maps，而不是修改原来的 Maps。不可变性有助于避免在样式表的不同部分共享相同的 Maps 时可能出现的许多隐蔽的 Bug。

但是仍然可以通过将新映射分配给相同的变量来随时间更新状态。这通常在函数和`mixin`中用于跟踪映射中的配置：

```scss
@mixin add-browser-prefix($browser, $prefix) {
  $prefixes-by-browser: map.merge($prefixes-by-browser, ($browser: $prefix)) !global;
}

@include add-browser-prefix("opera", o);
```

> 除此之外，Sass 的数据类型还包括：布尔值(Booleans)和空值(Nulls)。
{: .prompt-info}

## 样式规则

样式规则([Style rules](https://sass-lang.com/documentation/style-rules))是 Sass 的基础。在 Sass 和 CSS 中，属性声明(Property declarations)定义了与选择器匹配的元素的样式。Sass 增加了额外的功能，使它们更容易编写和自动化。声明的值可以是任何 SassScript，它可以被计算并存储在结果中。

```scss
.circle {
  $size: 100px;
  width: $size; height: $size;
  border-radius: $size * 0.5;
}
```

> 若声明的值为`null`或者**无引号空字符串**，那么 Sass 则不会将它编译成 CSS。
{: .prompt-tip}

### 嵌套规则

嵌套([Nesting](https://sass-lang.com/documentation/style-rules/#nesting))是指将不同的逻辑结构组合在一起，避免了重复输入父级选择器，从而使样式可读性更高，而且令复杂的 CSS 结构更易于管理。

在 Sass 中我们可以将多个 CSS 规则组合在一起。如果使用了多个选择器，则可以在一个选择器内嵌套另一个选择器，从而创建**复合选择器**，外层选择器会作为内层选择的父级选择器。例如：

```scss
nav {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li { display: inline-block; }

  a {
    display: block;
    padding: 6px 12px;
    text-decoration: none;
  }
}
```

当 Sass 解开一个分组选择器的内嵌规则时，它可以把每一个内嵌选择器的规则都正确地解出来，例如：

```scss
.alert, .warning {
  ul, p {
    margin-right: 0;
    margin-left: 0;
    padding-bottom: 0;
  }
}
```

这将会输出

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

也可以嵌套使用组合子的选择器。您可以将组合子放在外部选择器的末尾，内部选择器的开头，甚至可以单独放在两者之间：

```scss
ul > {
  li { list-style-type: none; }
}

h2 {
  + p { border-top: 1px solid gray; }
}

p {
  ~ {
    span { opacity: 0.8; }
  }
}
```

> 虽然 Sass 可以让样式表看上去很小，但实际生成的 CSS 却可能非常大，这会显著降低网站的速度！
{: .prompt-warning}

### 父级选择器

父级选择器[`&`](https://sass-lang.com/documentation/style-rules/parent-selector)是 Sass 的一个特殊选择器，在嵌套规则中它被允许动态引用外部的选择器，它使得以更复杂的方式复用外部选择器成为可能，同时增强了代码的灵活性和可读性，比如添加一个伪类或在父类之前添加一个选择器：

```scss
.alert {
  // 父选择器可用于向外部选择器添加伪类
  &:hover { font-weight: bold; }

  // 还可以用于在特定上下文中设置外部选择器的样式，例如将 body 设置为使用从右向左的语言
  [dir=rtl] & {
    margin-left: 0;
    margin-right: 10px;
  }

  // 甚至可以将它用作伪类选择器的参数
  :not(&) { opacity: 0.8; }
}
```

> 编译后的 CSS 文件中`&`将会被替换成嵌套外层的父级选择器，如果含有多层嵌套，最外层的父级选择器会逐层向下传递。
{: .prompt-tip}

`&`可以作为选择器的第一个字符，其后可以跟随后缀生成复合的选择器，例如：

```scss
#main {
  color: black;

  &-sidebar {
    border: 1px solid;
  }
}
```

如果父级表达式`&`在任何样式规则之外使用，则返回`null`。可以像下面的案例一样使用这个规则：

```scss
// 使用上述规则来确认`@mixin`是否被调用
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

可以将`&`传递给函数或将其包含在插值语句，或者在其他选择器中，例如将它与选择器函数和`@at-root`规则结合使用。下面的案例是编写一个匹配外部选择器和元素选择器的选择器：

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

属性名称也可以使用插值语句`${}`，这使得可以根据需要动态生成属性，甚至可以插入整个属性名：

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

有些 CSS 属性遵循相同的命名空间(Namespace)，比如`font-family, font-size, font-weight`都是`font`作为命名空间的属性。为了便于管理这样的属性，同时也为了避免了重复输入，Sass 允许将属性嵌套在命名空间中，例如：

```scss
.funky {
  font: {
    family: fantasy;
    size: 30em;
    weight: bold;
  }
}
```

命名空间也可以包含自己的属性值，例如：

```scss
.funky {
  font: 20px/24px {
    family: fantasy;
    weight: bold;
  }
}
```

### 自定义属性

CSS 自定义属性(即 CSS 变量)允许在其声明值中使用几乎任何文本。更重要的是 JavaScript 可以访问这些值，因此任何值都可能与用户相关。

Sass 解析自定义属性声明的方式与解析其他属性声明的方式不同。所有的 token 都按原样传递给 CSS。唯一的例外是插值语句`#{}`，这是将动态值注入自定义属性的唯一方法。

```scss
$primary: #81899b;
$accent: #302e24;
$warn: #dfa612;

:root {
  --primary: #{$primary};
  --accent: #{$accent};
  --warn: #{$warn};
  --consumed-by-js: $primary;  // $primary 的值并不会被正常解析
}
```

> 插值语句`#{}`会从字符串中删除引号，这很难将有引号字符串用作自定义属性的值，可以使用`meta.inspect()`函数来保留引号。
{: .prompt-tip}

### 占位符选择器

Sass 有一种特殊的选择器，称为“占位符”。它的外观和功能都很像一个 Class 选择器，但它以`%`开头，并且不包含在 CSS 输出中。实际上任何包含占位符选择器的复杂选择器都不包含在 CSS 中，任何选择器都包含占位符的样式规则也不包含在 CSS 中。

占位符选择器不像 Class 选择器，占位符不会让 CSS 显得杂乱。Class 选择器如果定义了但未在 HTML 中使用，仍然会出现在最终的 CSS 文件中，增加文件体积。而占位符选择器如果未被`@extend`引用，则完全不会出现在输出 CSS 中，因此不会造成冗余代码，有助于保持 CSS 文件的简洁。除此之外占位符选择器不会强制编写第三方库的开发者使用特定的类名。

```scss
%toolbelt {
  box-sizing: border-box;
  border-top: 1px rgba(#000, .12) solid;
  padding: 16px 0;
  width: 100%;

  &:hover { border: 2px rgba(#000, .5) solid; }
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

## at-Rules

### @use

`@use`能够从其他 Sass 样式表加载混合宏、函数和变量等，并将多个样式表中的 CSS 组合在一起。通过`@use`加载的样式表被称为模块(modules)。任何以`@use`加载的样式，无论加载了多少次都会在编译后的 CSS 输出中只包含一次。

#### 加载成员

按照下面的方法使用`@use`载入的成员(混合宏、函数和变量等)：

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

也可以为导入的模块重命名：

```scss
//_corners.scss
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

或者使用`*`表示导入所有的成员：

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

> 除`@forward`之外，`@use`的使用必须位于其他指令之前。可以在`@use`前先声明变量，以便在配置模块时使用。
{: .prompt-warning}

#### 创建私有成员

有时候可能不希望定义的所有成员在样式表之外可用，Sass 通过以`-`或`_`开头来定义私有成员，这些成员将在定义它们的样式表中像往常一样工作，但它们不会成为模块公共 API 的一部分，这意味着在引用文件中无法使用它们。

```scss
//_corners.scss
$-radius: 3px;

@mixin rounded {
  border-radius: $-radius;
}

// style.scs
@use "corners";

.button {
  @include corners.rounded;
  padding: 5px + corners.$-radius;  // 这会报错！$-radius 在`_corners.scss`外无法使用
}
```

#### 配置默认值

模块中若有变量使用了`!default`进行声明，那么可以使用`@use <url> with (<variable>: <value>, <variable>: <value>)`对该变量的值进行重新配置，配置的值将覆盖变量的默认值。

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

> 一个模块即时被加载的多次，仍会保持相同的配置。`@use ... with`只能在每个模块中使用一次。
{: .prompt-warning}

使用`@use ... with`来配置模块非常方便，特别是在使用最初编写用于使用`@import`指令的库时。但它不是特别灵活，不建议将其用于更高级的用例。如果发现自己想要一次配置许多变量，将映射作为配置传递，或者在模块加载后更新配置，可以考虑编写一个`mixin`来设置变量，另一个`mixin`来注入样式：

```scss
// _library.scss
$-black: #000;
$-border-radius: 0.25rem;
$-box-shadow: null;

// 如果配置了`$-box-shadow`，则返回其配置值。否则返回`$-black`的值。
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

加载模块后，还可以重新为变量赋新的值：

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

这时`library.$color`的值为`blue`。

### @forward

`@forward`指令能够加载一个 Sass 样式表，并在使用`@use`加载样式表时使混合宏、函数和变量等可用。它使得跨许多文件组织 Sass 库成为可能，同时允许它们的用户加载单个入口文件。

被`@forward`加载模块中的公共变量仅在引用文件里可用，在该模块中不可用。例如：

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
  @include bootstrap.list-reset;  // `list-reset`在`bootstrap.scss`中不可用！
}
```

#### 设置前缀

由于模块成员通常与名称空间一起使用，因此简短的名称通常是最易读的选项。但是这些名称在定义它们的模块之外可能没有意义，因此`@forward`指令可以选择为它的所有成员添加额外的前缀。其写法为`@forward "<url>" as <prefix>-*`，它将给定的前缀添加到模块的每个混合宏，函数和变量名等的开头。例如如果模块定义了一个名为`reset`的成员，并将其命名为`list-*`，则下游样式表将把它引用为`list-reset`：

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

#### 控制可用性

有时可能不希望从模块使用每个成员，需要将某些成员保留为私有，可能希望要求用户以不同的方式加载某些成员。那么可以通过`@forward "<url>" hide <members...>`或者`@forward "<url>" show <members...>`来控制哪些成员可以被使用。例如：

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

#### 配置模块

`@forward`还可以用配置加载模块，这与`@use`的工作原理基本相同，但是`@forward`的配置可以在其配置中使用`!default`。这允许模块更改上游样式表的默认值，同时仍然允许下游样式表覆盖它们。

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

### @import

Sass 拓展了`@import`的功能，允许其导入 SCSS 或 Sass 文件。被导入的文件将合并编译到同一个 CSS 文件中，另外被导入的文件中所包含的变量或者混合宏都可以在导入的文件中使用。如果同一份样式表被多次导入，则`@import`每次都会重新执行。

> 在最新的 Sass 编写规范中，`@import`已经弃用，建议使用`@use`和`@forward`代替！
{: .prompt-danger}

Sass 允许同时导入多个文件，导入文件也可以使用`#{}`插值语句，但不是通过变量动态导入 Sass 文件，只能作用于 CSS 的`url()`导入方式：

```scss
$family: unquote("Droid+Sans");
@import url("http://fonts.googleapis.com/css?family=\#{$family}");
```

> 如果需要导入 SCSS 或者 Sass 文件，但又不希望将其编译为 CSS，只需要在文件名前添加下划线，这样会告诉 Sass 不要编译这些文件。
{: .prompt-tip}

`@import`指令也可以在 CSS 中嵌套使用：

```scss
/* style.scss */
.example {
  color: red;
}

#main {
  @import "example";
}
```

> 在`@mixin`指令和控制流语句中不可以使用嵌套的`@import`！
{: .prompt-danger}


`@use`旨在取代旧的`@import`指令，但它的工作方式被有意设计得不同。以下是两者之间的一些主要区别：

- `@use`只使变量、函数和混合宏在当前文件的作用域中可用，它从不将它们添加到全局作用域。这使得找出 Sass 文件引用的每个名称的来源变得容易，并且意味着可以使用更短的名称而不会有任何冲突的风险；
- `@use`只加载每个文件一次。这确保了不会意外地多次复制依赖项的 CSS；
- `@use`必须出现在文件的开头，不能嵌套在样式规则中。嵌套导入可以迁移到混合宏中调用或`meta.load-css()`中；
- `@use`加载的模块必须使用有引号字符串。

### @media

Sass 中`@media`与 CSS 中用法一样，只是增加了一点额外的功能：允许其在 CSS 规则中嵌套。

如果`@media`嵌套在 CSS 规则内，那么在编译时`@media`将被编译到文件的最外层，包含嵌套的父选择器。这个功能让`@media`用起来更方便，不需要重复使用选择器，也不会打乱 CSS 的书写流程。例如：

```scss
.sidebar {
  width: 300px;
  @media screen and (orientation: landscape) {
    width: 500px;
  }
}
```

这将会输出

```css
.sidebar {
  width: 300px;
}

@media screen and (orientation: landscape) {
  .sidebar {
    width: 500px;
  }
}
```

`@media`允许互相嵌套使用，在编译时 Sass 自动添加`and`关键字：

```scss
@media screen {
  .sidebar {
    @media (orientation: landscape) {
      width: 500px;
    }
  }
}
```

这将会输出

```css
@media screen and (orientation: landscape) {
  .sidebar {
    width: 500px;
  }
}
```

`@media`甚至可以使用变量、函数、运算表达式等代替条件的名称或者值：

```scss
$media: screen;
$feature: -webkit-min-device-pixel-ratio;
$value: 1.5;

@media #{$media} and ($feature: $value) {
  .sidebar {
    width: 500px;
  }
}
```

### @extend

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

麻烦的是，这样做必须时刻记住使用`.seriousError`时需要参考`.error`的样式，这可能会带来意想不到的 Bug，或者给 HTML 添加无语意的样式。使用`@extend`可以避免上述情况，告诉 Sass 将一个选择器下的所有样式继承给另一个选择器：

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

上面代码的意思是将`.error`下的所有样式继承给`.seriousError`，`border-width: 3px;`是单独给`.seriousError`设定特殊样式，这样使用`.seriousError`的地方可以不再使用`.error`，其他使用到`.error`的样式也会同样继承给`.seriousError`。

`@extend`的作用是将重复使用的样式`.error`继承给需要包含这个样式的特殊样式`.seriousError`，正如刚刚的例子会输出：

```css
.error, .seriousError {
  border: 1px #f00;
  background-color: #fdd;
}

.seriousError {
  border-width: 3px;
}
```

当合并选择器时，`@extend`会避免无谓的重复，`.seriousError.seriousError`将编译为`.seriousError`，不能匹配任何元素的选择器(比如`#main#footer`)也会删除。

#### 继承复杂选择器

Class选择器并不是唯一可以被继承的，Sass 允许继承任何定义给单个元素的选择器，比如`.special.cool`、`a:hover`或者`a.user[href^="http://"]`等。

与 类 元素一样，`a:hover`的样式将继承给`.hoverlink`：

```scss
a:hover {
  text-decoration: underline;
}

.hoverlink {
  @extend a:hover;
}
```

这将会输出

```css
a:hover, .hoverlink {
  text-decoration: underline;
}
```

#### 多重继承

同一个选择器可以继承给多个选择器，它所包含的属性将继承给所有被继承的选择器：

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

这将会输出

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

每个`.seriousError`将包含`.error`与`.attention`下的所有样式，这时后定义的样式享有优先权：`.seriousError`的背景颜色是`#ff0`而不是`#fdd`，因为`.attention`在`.error`之后定义。

多重继承可以使用逗号分隔选择器名，比如`@extend .error, .attention;`与`@extend .error;`和`@extend.attention`有相同的效果。

当一个选择器继承给第二个后，可以继续将第二个选择器继承给第三个，例如：

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

现在每个`.seriousError`选择器将包含`.error`的样式，而`.criticalError`不仅包含`.seriousError`的样式也会同时包含`.error`的所有样式，上面的代码编译为：

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

暂时不可以将选择器序列(比如`.foo .bar`或者`.foo + .bar`)延伸给其他元素，但是却可以将其他元素继承给选择器序列，比如

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

有时会遇到复杂的情况，比如选择器列中的某个元素需要继承给另一个选择器序列，这种情况下两个选择器序列需要合并，比如：

```scss
#admin .tabbar a {
  font-weight: bold;
}

#demo .overview .fakelink {
  @extend a;
}
```

理论上讲能够生成所有匹配条件的结果，但是这样生成的样式表太复杂了，上面这个简单的例子就可能有 10 种结果。所以 Sass 只会编译输出有用的选择器。

当两个选择器序列合并时，如果没有包含相同的选择器，则将生成两个新选择器，第一列出现在第二列之前，或者第二列出现在第一列之前：

```scss
#admin .tabbar a {
  font-weight: bold;
}

#demo .overview .fakelink {
  @extend a;
}
```

这将会输出

```css
#admin .tabbar a,
#admin .tabbar #demo .overview .fakelink,
#demo .overview #admin .tabbar .fakelink {
  font-weight: bold;
}
```

如果两个序列包含了相同的选择器，相同部分将会合并在一起，其他部分交替输出。在下面的例子里，两个列都包含`#admin`，输出结果中它们合并在了一起：

```scss
#admin .tabbar a {
  font-weight: bold;
}

#admin .overview .fakelink {
  @extend a;
}
```

这将会输出

```css
#admin .tabbar a,
#admin .tabbar .overview .fakelink,
#admin .overview .tabbar .fakelink {
  font-weight: bold;
}
```

#### @extend-Only 选择器

有时需要定义一套样式并不是给某个元素用，而是只通过`@extend`指令使用，尤其是在制作 Sass 样式库的时候，希望 Sass 能够忽略用不到的样式。

如果使用普通的 CSS 规则，最后会编译出很多用不到的样式，也容易与其他样式名冲突，所以 Sass 引入了**占位符选择器**`%`。

占位符选择器以`%`符号开头，并且不包含在 CSS 输出中。实际上，任何包含占位符选择器的组合选择器都不包含在 CSS 中，任何选择器都包含占位符的样式规则也不包含在 CSS 中。若占位符如果没有继承，那么就不会被编译。

```scss
%toolbelt {
  box-sizing: border-box;
  border-top: 1px rgba(#000, .12) solid;
  padding: 16px 0;
  width: 100%;

  &:hover { border: 2px rgba(#000, .5) solid; }
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

#### !optional 关键字

如果`@extend`失败会收到错误提示，比如`a.important {@extend .notice}`，当没有`.notice`选择器时将会报错，只有 `h1.notice`包含`.notice`时也会报错，因为`h1`与`a`冲突，会生成新的选择器。

如果要求`@extend`不生成新选择器，可以通过`!optional`声明达到这个目的，例如：

```scss
a.important {
  @extend .notice !optional;
}
```

在指令中使用`@extend`时(比如在`@media`中)有一些限制：Sass 不可以将`@media`层外的 CSS 规则继承给指令层内的 CSS，这样会生成大量的无用代码。也就是说如果在`@media`(或者其他 CSS 指令)中使用`@extend`，必须继承给相同指令层中的选择器。

下面的例子是可行的：

```scss
@media print {
  .error {
    border: 1px #f00;
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
  border: 1px #f00;
  background-color: #fdd;
}

@media print {
  .seriousError {
    @extend .error;
    border-width: 3px;
  }
}
```

### @at-rule

## 控制流

### @if 与 @else

例如：

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

### @each

`@each`的语法规则如下：

```scss
@each <variable> in <expression> { ... }
```

其中`<expression>`为一个数组。`@each`可以很容易地为数组中的每个元素或 Maps 中的每对元素指定样式或进行计算。这对于重复的风格来说是很好的，它们之间只有一些变化。

例如：

```scss
$animals: puma, sea-slug, egret, salamander;

@each $animal in $animal {
  .#{$animal}-icon {
    background-image: url('/images/#{$animal}.png');
  }
}
```

### @for

`@for`的语法规则如下：

```scss
@for <variable> from <expression> to <expression> { ... }
```

或者

```scss
@for <variable> from <expression> through <expression> { ... }
```

如果使用`to`，则包前不包后；如果使用了`through`，则包前也包后。

例如：

```scss
@for $i from 1 through 3 {
  .item-#{$i} {
    width: 2em * $i;
  }
}
```

`@each`也可以使用多个变量，如果是该变量是一个数组，那么子数组的每个元素都被分配给各自的变量。例如:

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

由于 Maps 被视为成对的数组，因此多重赋值也适用于它们。例如:

```scss
$object: (h1: 2em, h2: 1.5em, h3: 1.2em);

@each $header, $size in $object {
  #{$header} {
    font-size: $size;
  }
}
```

### @while

例如：

```scss
$i: 6;

@while $i > 0 {
  .item-#{$i} {
    width: 2em * $i;
  }

  $i: $i - 2;
}
```

## 混合器

混合器用于定义可重复使用的样式，避免了使用无语意的 Class，比如`.float-left`。混合器可以包含所有的 CSS 规则，绝大部分 Sass 规则，甚至通过参数功能引入变量，输出多样化的样式。

如果整个网站中有几处小小的样式类似(例如一致的颜色和字体)，那么使用变量来统一处理这种情况是非常不错的选择。但是当你的样式变得越来越复杂，你需要大段大段的重用样式的代码，独立的变量就没办法应付这种情况了。你可以通过 Sass 的混合器实现大段样式的重用。

### @mixin

`@mixin`指令的作用是定义混合器，比如名为`large-text`的混合器通过下面的代码定义：

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

> 大量重用的`@mixin`可能会导致生成的样式表过大，网页加载缓慢。
{: .prompt-tip}

利用混合器，可以很容易地在样式表的不同地方共享样式。如果你发现自己在不停地重复一段样式，那就应该把这段样式构造成优良的混合器，尤其是这段样式本身就是一个逻辑单元，比如说是一组放在一起有意义的属性。

判断一组属性是否应该组合成一个混合器，一条经验法则就是你能否为这个混合器想出一个好的名字。如果你能找到一个很好的短名字来描述这些属性修饰的样式，比如`rounded-corners`、`fancy-font`或者`no-bullets`，那么往往能够构造一个合适的混合器。如果你找不到，这时候构造一个混合器可能并不合适。

混合器在某些方面跟 CSS 类很像。都是需要给一大段样式命名，所以在选择使用哪个的时候可能会产生疑惑。最重要的区别就是类名是在 HTML 文件中应用的，而混合器是在样式表中应用的。这就意味着类名具有语义化含义，而不仅仅是一种展示性的描述：用来描述 HTML 元素的含义而不是 HTML 元素的外观。而另一方面，混合器是展示性的描述，用来描述一条 CSS 规则应用之后会产生怎样的效果。

`@mixin`也可以包含选择器和属性，甚至可以用`&`引用父选择器：

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
    height: 1px
  }
}
```

### @include

定义好混合器之后，需要通过`@include`指令引用混合器，例如：

```scss
.page-title {
  @include clearfix;
  padding: 4px;
  margin-top: 10px;
}
```

也可以在最外层引用混合样式，不会直接定义属性，也不可以使用父选择器：

```scss
@mixin silly-links {
  a {
    color: blue;
    background-color: red;
  }
}

@include silly-links;
```

混合样式中也可以包含其他混合样式：

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

> 混合样式中应该只定义后代选择器，这样可以安全的导入到文件的任何位置。
{: .prompt-tip}

参数用于给混合器中的样式设定变量，并且赋值使用。在定义混合器的时候，按照变量的格式通过逗号分隔，将参数写进圆括号里。引用指令时按照参数的顺序，再将所赋的值对应写进括号：

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

混合器也可以使用给变量赋值的方法给参数设定默认值，然后当这个指令被引用的时候，如果没有给参数赋值，则自动使用默认值：

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

混合器也可以使用关键词参数，上面的例子也可以写成：

```scss
p {
  @include sexy-border($color: blue);
}

h1 {
  @include sexy-border($color: blue, $width: 2in);
}
```

有时不能确定混合器需要使用多少个参数，比如一个关于`box-shadow`的混合器不能确定有多少个`'shadow'`会被用到。这时可以使用参数变量`...`声明告诉 Sass 将这些参数视为值数组处理：

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

在引用`@include`指令的适合，也可以使用参数变量，与平时用法一样，将一串值逐条作为参数引用：

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

可以使用变量参数传给`@mixin`，并在不改变`@mixin`参数签名的情况下添加额外的样式。如果这样做甚至关键字参数也会传递给`@mixin`。例如：

```scss
@mixin wrapped-stylish-mixin($args...) {
  font-weight: bold;
  @include stylish-mixin($args...);
}

.stylish {
  @include wrapped-stylish-mixin(#00ff00, $width: 100px);
}
```

在引用混合样式的时候，可以先将一段代码导入到混合器中，然后再输出混合样式，额外导入的部分将出现在`@content`标志的地方：

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

这将会输出

```scss
* html {
  #logo {
  background-image: url(/logo.gif);
  }
}
```

传递给`@mixin`的内容块在定义该块的作用域中求值，而不是在`@mixin`的作用域中求值。这意味着`@mixin~的局部变量不能在传入的样式块中使用，变量将解析为全局值：

```scss
$color: white;

@mixin colors($color: blue) {
  background-color: $color;
  @content;
  border-color: $color;
}

.colors {
  @include colors {
    color: $color;
  }
}
```

此外这清楚地表明，在传递的块中使用的变量和`@mixin`与块周围定义的其他样式相关。例如：

```scss
#sidebar {
  $sidebar-width: 300px;
  width: $sidebar-width;

  @include smartphone {
    width: $sidebar-width / 3;
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

### 自定义函数

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

[^SassScript]: 在 Sass 中，数据类型、变量和运算操作等统称 [SassScript 表达式](https://sass-lang.com/documentation/syntax/structure#expressions)。
