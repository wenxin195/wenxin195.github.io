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
modify_date: "2025-07-06 13:31:00"
---

Sass(Syntactically Awesome Style Sheets)是一个 CSS 预处理器，有助于减少 CSS 的重复代码并节省时间。它是一种更稳定、更强大的 CSS 扩展语言，能够结构化地描述文档的样式。

<!--more-->

Sass 在 CSS 语法的基础上增加了变量、嵌套、混合宏、继承等高级功能，使 CSS 更易于维护、可复用且更易于编写。使用 Sass 以及 Sass 的样式库(比如 Compass)有助于更好地组织管理样式文件，以及更高效地开发项目。

## Sass 变量

Sass 使用`$`符号来声明变量，例如：

```scss
$myFont: Helvetica, sans-serif;

body {
  font-family: $myFont;
}
```

Sass 变量默认是局部变量，仅在定义它的代码块内有效。如果变量在文件的最外层(不在任何代码块内)定义，则为全局变量，可在整个 Sass 文件或导入的文件中使用。例如：

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

> 如果在局部作用域内定义了与全局变量同名的变量，局部变量会覆盖全局变量，仅在当前代码块内生效。
{: .prompt-tip}

在局部作用域内，可以使用`!global`将变量显式声明为全局变量，覆盖之前定义的同名全局变量。例如：

```scss
$myColor: red;

h1 {
  $myColor: green !global;
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

> 全局变量应该定义在任何代码块之外，因此最好使用单独的文件定义所有全局变量，并使用`@include`导入。
{: .prompt-danger}

在声明变量时，变量值也可以引用其他变量。当你通过粒度区分，为不同的值取不同名字时，这相当有用。下例在独立的颜色值粒度上定义了一个变量，且在另一个更复杂的边框值粒度上也定义了一个变量。

```scss
$highlight-color: blue;
$highlight-border: 1px solid $highlight-color;

.selected {
  border: $highlight-border;
}
```

### 默认变量

一般情况下，如果反复声明一个变量，那么只有最后一处声明有效且它会覆盖前边的值。

可以在变量的结尾添加`!default`，这会给一个未通过`!default`声明赋值的变量赋值，此时如果变量已经被赋值，不会再被重新赋值，但是如果变量还没有被赋值，则会被赋予新的值。例如：

```scss
$content: "First content";
$content: "Second content?" !default;
$new_content: "First time reference" !default;

#main {
  content: $content;
  new-content: $new_content;
}
```

这将会输出

```css
#main {
  content: "First content";
  new-content: "First time reference";
}
```

这样做的好处是：如果在导入 Sass 局部文件之前声明了一个`$content`变量，那么局部文件中对`$content`赋值`Second content?`的操作就无效。如果没有做这样的声明，则`$fancybox-width`将默认为`Second content?`。

变量是`null`时，会视为未被`!default`赋值：

```scss
$content: null;
$content: "Non-null content" !default;

#main {
  content: $content;
}
```

这将会输出

```scss
#main {
  content: "Non-null content";
}
```

## 插值语句

通过插值语句`#{}`可以在选择器或属性名中使用变量：

```scss
$name: foo;
$attr: border;

p.#{$name} {
  #{$attr}-color: blue;
}
```

使用`#{}`可以避免 Sass 运行计算表达式，直接编译 CSS。例如：

```scss
p {
  $font-size: 12px;
  $line-height: 30px;
  font: #{$font-size}/#{$line-height};
}
```

这将会输出

```css
p {
  font: 12px/30px;
}
```

## 数据类型

在 Sass 中，有以下的数据类型：

1. 字符串(Strings)

    Sass 字符串支持有引号字符串(`'`或者`"`定义)，和无引号字符串，在编译 CSS 文件时不会改变其类型。只有一种情况例外，使用`#{}`时，有引号字符串将被编译为无引号字符串。
2. 数组(Lists)
    数组可以指定多个值，这些值之间通过空格或逗号分隔，并且是单个值也被视为(只包含一个值的)数组。

    数组本身没有太多功能，但是通过 Sass 可以发挥其最大的作用：

    - `nth`函数可以直接访问数组中的某一项；
    - `join`函数可以将多个数组连接在一起；
    - `append`函数可以在数组中添加新值；
    - `@each`指令能够遍历数组中的每一项。

    数组中可以包含子数组，例如`1px 2px, 5px 6px`、`(1px 2px) (5px 6px)`或者`(1px, 2px), (5px, 6px)`。
3. 颜色(Colors)

    任何 CSS 颜色表达式都会返回一个颜色值，这包括大量与未加引号的字符串无法区分的命名颜色。在 Compressed 模式下，Sass 会输出颜色的最小 CSS 表示形式。

    例如`#FF0000`在 Compressed 模式下会输出为`red`，但`blanchedalmond`则会输出为`#FFEBCD`。

    > 如果颜色名称用于选择器的构建，必须始终将其加上引号，以避免在选择器中插值的颜色在 Compressed 模式下会变成无效语法。
    {: .prompt-warning}
4. 映射(Maps)

    Maps 是`(key: value)`的组合，并且允许被动态访问。Maps 的键值可以是变量、表达式或者是 Sass 的任一数据类型(甚至是另一个 Maps)，给定的值可以与多个键相关联，但是给定的键在 Maps 中只能关联一个值。

    > 使用`inspect($value)`函数生成用于调试 Maps 的有用输出。
    {: .prompt-warning}

    Maps 可以通过以下 Sass 函数对其进行操作：

    - `map-get`函数用于查找键值；
    - `map-merge`函数用于 Map 和新加的键值融合；
    - `@each`指令可添加样式到一个 Map 中的每个键值对。

    数组可以使用的场景，Maps 也同样可以使用。在数组函数中 Maps 会被自动转换为数组。例如`(key1: value1, key2: value2)`会被数组函数自动转换成`key1 value1, key2 value2`，反之则不行(空数组除外)。
  
除此之外，Sass 还包括：布尔值(Booleans)、数字(Numbers)、空值(Nulls)的数据类型。

## 嵌套规则

嵌套是指将不同的逻辑结构组合在一起，从而使样式可读性更高，避免了重复输入父选择器，而且令复杂的 CSS 结构更易于管理。

在 Sass 中我们可以将多个 CSS 规则组合在一起。如果使用了多个选择器，则可以在一个选择器内嵌套另一个选择器，从而创建复合选择器，内层的样式将它外层的选择器作为父选择器。例如：

```scss
#main p {
  color: #00ff00;
  width: 97%;

  .redbox {
    background-color: #ff0000;
    color: #000000;
  }
}
```

当 Sass 解开一个分组选择器的内嵌规则时，它允许把每一个内嵌选择器的规则都正确地解出来，例如：

```scss
.container {
  h1, h2, h3 {
    margin-bottom: 0.8em
  }
}
```

这将会输出

```css
.container h1, .container h2, .container h3 { margin-bottom: 0.8em }
```

对于内嵌在分组选择器内的嵌套规则，处理方式也一样：

```scss
nav, aside {
  a {
    color: blue
  }
}
```

> 虽然 Sass 可以让样式表看上去很小，但实际生成的 CSS 却可能非常大，这会显著降低网站的速度。
{: .prompt-warning}

### 父级选择器

引用父级选择器`&`允许动态引用外部的选择器，增强代码的灵活性和可读性，常用于生成伪类、伪元素、组合选择器或动态类名。例如：

```scss
.button {
  &:hover {
    background-color: darken(blue, 10%);
  }

  &::before {
    content: ">";
  }
}

```

> 编译后的 CSS 文件中`&`将被替换成嵌套外层的父选择器，如果含有多层嵌套，最外层的父选择器会一层一层向下传递。
{: .prompt-tip}

`&`必须作为选择器的第一个字符，其后可以跟随后缀生成复合的选择器，例如：

```scss
#main {
  color: black;

  &-sidebar {
    border: 1px solid;
  }
}
```

### 属性嵌套

有些 CSS 属性遵循相同的命名空间，比如`font-family, font-size, font-weight`都以`font`作为属性的命名空间。为了便于管理这样的属性，同时也为了避免了重复输入，Sass 允许将属性嵌套在命名空间中，例如：

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

## @-Rules

### @import

Sass 拓展了`@import`的功能，允许其导入 SCSS 或 Sass 文件。被导入的文件将合并编译到同一个 CSS 文件中，另外被导入的文件中所包含的变量或者 mixin 指令都可以在导入的文件中使用。

通常`@import`寻找 Sass 文件并将其导入，但在以下情况下，`@import`仅作为普通的 CSS 语句，不会导入任何 Sass 文件。

- 文件拓展名是`.css`；
- 文件名以`http://`开头；
- 文件名是`url()`；
- `@import`包含`media queries`。

如果不在上述情况内，文件的拓展名是`.scss`或`.sass`，则导入成功。没有指定拓展名，Sass 将会试着寻找文件名相同，拓展名为`.scss`或`.sass`的文件并将其导入。

Sass 允许同时导入多个文件。导入文件也可以使用`#{ }`插值语句，但不是通过变量动态导入 Sass 文件，只能作用于 CSS 的`url()`导入方式：

```scss
$family: unquote("Droid+Sans");
@import url("http://fonts.googleapis.com/css?family=\#{$family}");
```

> 如果需要导入 SCSS 或者 Sass 文件，但又不希望将其编译为 CSS，只需要在文件名前添加下划线，这样会告诉 Sass 不要编译这些文件，但导入语句中却不需要添加下划线。
{: .prompt-tip}

### @media

Sass 中`@media`与 CSS 中用法一样，只是增加了一点额外的功能：允许其在 CSS 规则中嵌套。如果`@media`嵌套在 CSS 规则内，那么在编译时`@media`将被编译到文件的最外层，包含嵌套的父选择器。这个功能让`@media`用起来更方便，不需要重复使用选择器，也不会打乱 CSS 的书写流程。例如：

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

`@media`甚至可以使用变量、函数、运算符等代替条件的名称或者值：

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

在设计网页的时候常常遇到这种情况：一个元素使用的样式与另一个元素完全相同，但又添加了额外的样式。通常会在 HTML 中给元素定义两个`class`，一个通用样式和一个特殊样式。假设现在要设计一个普通错误样式与一个严重错误样式，一般会这样写：

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

麻烦的是，这样做必须时刻记住使用`.seriousError`时需要参考`.error`的样式，这会带来意想不到的 Bug，或者给 HTML 添加无语意的样式。使用`@extend`可以避免上述情况，告诉 Sass 将一个选择器下的所有样式继承给另一个选择器。

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

上面代码的意思是将`.error`下的所有样式继承给`.seriousError`，`border-width: 3px;`是单独给``.seriousError`设定特殊样式，这样使用`.seriousError`的地方可以不再使用`.error`，其他使用到`.error`的样式也会同样继承给`.seriousError`。

`@extend`的作用是将重复使用的样式`.error`继承给需要包含这个样式的特殊样式`.seriousError`，正如刚刚的例子：

```scss
.error {
  border: 1px #f00;
  background-color: #fdd;
}

.error.intrusion {
  background-image: url("/image/hacked.png");
}

.seriousError {
  @extend .error;
  border-width: 3px;
}
```

这将会输出

```css
.error, .seriousError {
  border: 1px #f00;
  background-color: #fdd;
}

.error.intrusion, .seriousError.intrusion {
  background-image: url("/image/hacked.png");
}

.seriousError {
  border-width: 3px;
}
```

当合并选择器时，`@extend`会避免无谓的重复，`.seriousError.seriousError`将编译为`.seriousError`，不能匹配任何元素的选择器(比如`#main#footer`)也会删除。

类选择器并不是唯一可以被继承的，Sass 允许继承任何定义给单个元素的选择器，比如`.special.cool`、`a:hover`或者`a.user[href^="http://"]`等，例如：

```scss
.hoverlink {
  @extend a:hover;
}
```

同类元素一样，`a:hover`的样式将继承给`.hoverlink`：

```scss
.hoverlink {
  @extend a:hover;
}

a:hover {
  text-decoration: underline;
}
```

这将会输出

```css
a:hover, .hoverlink {
  text-decoration: underline;
}
```

与上面`.error.intrusion`的例子一样，所有`a:hover`的样式将继承给`.hoverlink`，包括其他使用到`a:hover`的样式，例如：

```scss
.hoverlink {
  @extend a:hover;
}

.comment a.user:hover {
  font-weight: bold;
}
```

这将会输出

```css
.comment a.user:hover, .comment .user.hoverlink {
  font-weight: bold;
}
```

同一个选择器可以延伸给多个选择器，它所包含的属性将继承给所有被延伸的选择器：

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

每个`.seriousError`将包含`.error`与`.attention`下的所有样式，这时后定义的样式享有优先权：`.seriousError`的背景颜色是`#ff0`而不是`#fdd，因为`.attention`在`.error`之后定义。

多重延伸可以使用逗号分隔选择器名，比如`@extend .error, .attention;`与`@extend .error;`和`@extend.attention`有相同的效果。

当一个选择器延伸给第二个后，可以继续将第二个选择器延伸给第三个，例如：

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

有时需要定义一套样式并不是给某个元素用，而是只通过`@extend`指令使用，尤其是在制作 Sass 样式库的时候，希望 Sass 能够忽略用不到的样式。

如果使用普通的 CSS 规则，最后会编译出很多用不到的样式，也容易与其他样式名冲突，所以 Sass 引入了“占位符选择器” ，看起来很像普通的 ID 或类选择器，只是`#`或`.`被替换成了`%`。可以像 ID 或者类选择器那样使用，当它们单独使用时，不会被编译到 CSS 文件中。

```scss
#context a%extreme {
  color: blue;
  font-weight: bold;
  font-size: 2em;
}
```

占位符选择器需要通过`@extend`指令使用，用法与 ID 或者类选择器一样，被继承后占位符选择器本身不会被编译。

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

混合器用于定义可重复使用的样式，避免了使用无语意的`class`，比如`.float-left`。混合器可以包含所有的 CSS 规则，绝大部分 Sass 规则，甚至通过参数功能引入变量，输出多样化的样式。

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

有时不能确定混合器需要使用多少个参数，比如一个关于`box-shadow`的混合器不能确定有多少个`'shadow'`会被用到。这时可以使用参数变量`...`声明告诉 Sass 将这些参数视为值列表处理：

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

在引用`@include`指令的适合，也可以使用参数变量，与平时用法一样将一串值列表中的值逐条作为参数引用：

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

通过 <a href="http://sass-lang.com/docs/yardoc/Sass/Script/Functions.html" target="_blank">Sass::Script::Functions</a> 查看完整的 Sass 函数列表，参数名，以及如何自定义函数。

## 自定义函数

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
