---
key: javascript-basic
title: "JavaScript 教程(1) JS 基础"
permalink: "/javascript-basic"
tags:
  - JavaScript
author: Wenxin Zhong
layout: article
download: false
videos: false
refactor: true
mathjax: false
modify_date: "2025-01-27 01:50:00"
---

JavaScript 是一种运行在浏览器中的脚本语言，也是现代 Web 开发中不可或缺的核心技术之一。JavaScript 最初被设计用于为网页添加简单的交互效果；随着技术的发展，JavaScript 已从一个“页面增强工具”演变为一门生态繁荣、功能强大的通用编程语言。

<!--more-->

JavaScript 可以通过直接操作 DOM(即文档对象模型，Document Object Model)，支持事件响应、数据处理、动画效果、网络请求等。JavaScript 的核心优势在于其**多范式**(Multi-paradigm)与**事件驱动**(Event-Driven)的特性。它不仅支持面向对象编程，还完美契合函数式编程(Functional Programming)的模式。这种灵活性不仅赋予了开发者处理复杂业务逻辑的能力，更使其在处理异步操作时游刃有余，确保了应用在不阻塞主线程的前提下，实现流畅的数据交互与响应。

## 变量

在 JavaScript 为了处理数据，我们需要将它们“存储”起来，变量就是存储数据的容器。

### 创建变量

现代 JavaScript 推荐使用`let`和`const`来声明变量。它们具备块级作用域(Block Scope)，这意味着变量只存在于它们被定义的那对花括号`{ ... }`内部，这能有效防止变量污染和意外覆盖。

```javascript
function calculateTotal() {
  let total = 100;

  if (true) {
    let total = 200;  // 这是不同的变量，不会影响外面的 total
    console.log(total); // 输出 200
  }

  console.log(total);   // 输出 100
}
```

当我们需要存储一个变化的值(例如玩家得分、剩余生命值等)时，通常使用`let`去声明一个变量：

```javascript
let playerName;
playerName = 'Alice';
```

也可以在声明时直接赋值：

```javascript
let score = 100;
```

> JavaScript 建议使用驼峰命名法(camelCase)，例如使用`userName`而不是`username`或`user_name`。JavaScript 严格区分大小写，并支持 Unicode 字符。
{: .prompt-warning}

当我们需要存储一个不会改变的值(例如游戏最高等级、配置常量等)时，应始终优先使用`const`。这能提升代码的可读性，并防止意外修改引发的`TypeError`：

```javascript
const MAX_LEVEL = 100;
const INITIAL_SPEED = 5.5;
```

若试图修改通过`const`声明的变量的值，则会引起`TypeError: Assignment to constant variable.`的错误。需要注意的是，`const`禁止的是变量本身的重新赋值。对于对象或数组，引用不变，但可以修改其内部内容：

```javascript
const cart = [];  // 购物车数组
cart.push({ id: 1, name: '商品A' }); // 可以修改内容
```

> 大写命名的常量通常用作“硬编码(hard-coded)”值的别名。
{: .prompt-tip}

早期 JavaScript 会使用`var`声明变量。与`let`和`const`不同，`var`具有“函数作用域”，且存在“变量提升”(hoisting)机制，这往往会导致意想不到的逻辑错误。为了代码的严谨性和可维护性，在现代项目中强烈建议避免使用`var`，改用`let`或`const`。

```javascript
function varTest() {
  var x = 1;

  {
    var x = 2;  // 同一个变量！会覆盖外面的 x
    console.log(x);  // 输出 2
  }

  console.log(x);  // 也会输出 2 (容易出错)
}
```

### 字面量

字面量(Literal)是直接写在代码中的固定值，而不是通过变量存储的值。它让代码更简洁直观。JavaScript 支持多种字面量类型：

#### 数字字面量

数字字面量包括整数字面量和浮点数字面量，以及不同进制的表示(十进制最常用)：

```javascript
const price = 99.99;  // 浮点数
const quantity = 5;  // 整数
const hexColor = 0xFF0000;  // 十六进制红色
const bigNumber = 1234567890123456789n;  // BigInt (大整数，后缀为 n)
```

#### 布尔字面量

布尔字面量只有两个值：true 和 false，常用于条件判断。

```javascript
const isLoggedIn = true;
const hasPermission = false;
```

#### 数组字面量

数组字面量常用于存储列表数据，用方括号`[]`表示有序列表：

```javascript
const inventory = ["Iron Sword", "Healing Potion", "Shield"];
```

并且数字字面量允许有空值(不推荐)：

```javascript
const fish = ["Lion", , "Angel"];  // [ 'Lion', <1 empty item>, 'Angel' ]
```

当使用数组遍历方法时，空槽会被跳过。但是使用索引访问`fish[1]`仍会返回`undefined`。

> 数组字面量末尾的逗号会被忽略，这在维护长列表时很方便。
{: .prompt-tip}

每次字面量被求值时，数组字面量都会创建一个新的数组对象，例如在全局作用域中用字面量定义的数组在脚本加载后被创建。若数组字面量位于函数内，每次调用函数时会初始化一个新数组。

#### 对象字面量

对象字面量用于描述“结构化数据”，是将相关数据组织在一起的最佳方式，用大括号`{}`表示键值对集合：

```javascript
const playerProfile = {
  id: 1001,
  nickname: "Knight_01",
  stats: {
    level: 15,
    attack: 50
  },
  // 对象中也可以包含函数
  getLevelUpInfo: function() {
    return `${this.nickname} is ready for Level ${this.stats.level + 1}`;
  }
};
```

要访问对象内的某个具体属性，则可以使用`.`或者`[]`，例如`playerProfile["nickname"]`或者`playerProfile.id`。

> 如果属性名包含非法字符或需要动态计算，必须使用方括号访问，例如`playerProfile["is-active"]`。
{: .prompt-danger}

#### 字符串字面量

字符串字面量使用单引号`'`、双引号`"`或反引号<code class="language-plaintext highlighter-rouge">`</code>(模板字符串)，这在处理包含变量的文案时非常高效：

```javascript
const greeting = "Hello, world!";
const name = '李四';
const message = `欢迎回来，${name}！`;  // 模板字符串，支持插值和换行
```

> 模板字符串(仅在 ES6+)特别实用，它能嵌入变量和多行文本。
{: .prompt-info}

并且字符串字面量还支持转义字符，例如`\n`等。

#### 正则字面量

正则字面量用斜杠`/`包围，用于模式匹配：

```javascript
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

## 数据类型

### Number

在 JavaScript 中，Number 是一种定义为 **64 位双精度浮点型(IEEE 754)**的数字数据类型。包括整数类型以及浮点数类型，还有特殊的`Infinity`、`-Infinity`和`NaN`，例如：

```javascript
let a = 10;
let b = 3.14;
```

### BigInt

BigInt 用于表示任意精度的整数，适用于超出 Number 安全范围的整数，例如：

```javascript
let big = 123456789012345678901234567890n;
```

或者直接用构造函数创建 BigInt 类型的变量：

```javascript
let big = BigInt("12345678901234567890");
```

IntBig 类型主要用于金融计算、加密、超大整数等场景。

> BigInt 不能和 Number 直接混合运算。
{: .prompt-tip}

### String

String 类型用于表示文本数据，并且 JavaScript 支持模板字符串(反引号)以及插值`${}`语句：

```javascript
let str1 = "Hello";
let str2 = 'World';
let str3 = `Hello, ${str2}`;
```

### Boolean

在 JavaScript 中，很多值可以被隐式转换为布尔值，`false`、`0`、`-0`、`0n`、`""`、`null`、`undefined`、`NaN`在逻辑判断中都表示假值。

### null 与 undefined

`null`与`undefined`这两个类型都表示“空”，但含义不同：

- `undefined`表示**未定义**，通常出现在：

    ```javascript
    let a;
    console.log(a); // undefined
    ```

- `null`表示**人为地赋值为空**：

    ```javascript
    let b = null;
    ```

> `null`值存在一个历史遗留的 Bug，即`typeof null === "object"`的结果为`true`。
{: .prompt-info}

### Symbol

Symbol 是一种唯一且不可变的原始类型，通常用于避免属性名冲突：

```javascript
let id1 = Symbol("id");
let id2 = Symbol("id");

console.log(id1 === id2);  // 输出 false
```

Symbol 类型的常见用途为：作为对象的唯一键或者定义内部属性(如迭代器等)。

### Object

在 JavaScript 中，对象可以看作是属性的集合，它用于存储各种键值集合和更复杂的实，用于表示复杂数据结构：

```javascript
let user = {
  name: "Tom",
  age: 18
};
```

使用对象字面量语法，可以初始化一组有限的属性，然后可以添加和删除属性。属性值可以是任何类型的值，也包括其他对象。属性通过键值来标识，键值可以是字符串值或 Symbol 值。

> 数组和函数本质上也是对象类型。
{: .prompt-info}

## 运算符

在 JavaScript 中，表达式(Expression)是可以产生一个值的代码片段，运算符(Operator)是对这些值进行运算的工具。

### 比较运算符

比较运算符用于判断两个值的关系，返回`true`或`false`。

- 宽松比较：宽松比较使用`==`和`!=`运算符，会先进行**强制类型转换**再比较，例如`'5' == 5`会返回`true`；
- 严格比较：严格比较使用`===`和`!==`运算符，会**同时比较值和类型**，例如`0 === false`会返回`false`。

> 大多数情况下推荐使用**严格比较**，以避免意外的类型转换导致的 Bug。
{: .prompt-warning}

### 算术运算符

自增`++`和自减`--`运算符是两种特殊的算术运算符，常用于循环、计数和其他需要快速调整数值的情景。

若自增运算符放在变量前，则返回加 1 后的值；若自增运算符放在变量后，则会先返回原来的值后再加 1。自减运算符遵循类似的规则。例如：

```javascript
let x = 3;

console.log(x++);  // 会输出结果 3，并且 x 值变为4
console.log(++x);  // 会输出结果 4，并且 x 值变为4
```

> 自增/自减会直接修改变量，建议在简单计数场景使用；在复杂表达式中，推荐优先使用`quantity += 1`，使得代码更清晰易读。
{: .prompt-tip}

### 三元运算符

当只需要进行简单的“二选一”赋值时，三元运算符`condition ? value1 : value2`是`if-else`的优雅替代方案，可以让代码更简洁，显著减少代码冗余。例如：

```javascript
let isVip = true;
let rewardMultiplier = isVip ? 2 : 1;
```

这等价于

```javascript
if (isVip === true) {
  rewardMultiplier = 2;
} else {
  rewardMultiplier = 1;
}
```

> 三元运算符适用于简单逻辑，不要滥用！
{: .prompt-warning}

## 函数

函数可以将一段逻辑封装起来，并在需要时复用。在实际开发中常用函数来处理数据、封装业务逻辑、甚至构建整个应用结构。

### 函数声明

函数声明使用`function`关键字去定义一个函数，这是定义函数最标准、最常用的方式。函数声明会被 JavaScript 引擎在执行代码前预先处理，将这段代码完整地移动到所在作用域的顶部，这意味着可以在函数实际定义之前就调用它，这称为**函数提升**(Hoisting)。

```javascript
// 即使在定义之前调用也可以
calculateRevenue(100, 0.8)

function calculateRevenue(users, arpu) {
  let minUsers = 10;  // 局部变量，只在该函数内部有效，不会干扰外部

  if (users < minUsers) {
    return 0;
  }

  return users * arpu;
}
```

JavaScript 采用词法作用域(Lexical Scope)，即变量会从当前作用域向外层逐级查找：

```javascript
let rate = 0.1;

function calculateTax(amount) {
  let rate = 0.2;
  return amount * rate;   // 使用的是局部的 rate = 0.2
}
```

> 函数应保持“单一职责”，即一个函数最好只做一件事情。并且要避免在函数内部定义过多的全局变量，这会让代码难以追踪。
{: .prompt-tip}

若需要定义一个通用的、可复用的**工具函数**，并且希望它在整个作用域内都可访问时，那么最佳的方式就是使用函数声明，它非常适合定义一些独立的、不依赖于特定上下文的逻辑。

### 函数表达式

函数表达式将函数视为一个“值”，可以将其赋值给变量，也可以传递给其他函数。这在我们需要根据条件动态创建函数时非常有用：

```javascript
const calculateRetention = function (retainedUsers, totalUsers) {
  return retainedUsers / totalUsers;
};
```

函数表达式可以是匿名的，也可以是具名的：

```javascript
const fibonacci = function fib(n) {
  if (n <= 0) {
    return 0;
  };
  
  if (n === 1) {
    return 1;
  };
  
  return fib(n - 1) + fib(n - 2);
};
```

> 这里的`fib`只在函数内部可见，常用于递归或调试。
{: .prompt-info}

当函数作为参数传递给另一个函数时，它被称为回调函数。在实际开发中非常常见，例如数据处理：

```javascript
function processUsers(users, handler) {
  const result = [];

  for (let i = 0; i < users.length; i++) {
    result.push(handler(users[i]));
  }

  return result;
}

const getUserLevel = function(user) {
  return user.level;
};

processUsers(
  [{ level: 1 }, { level: 3 }],
  getUserLevel
);  // [1, 3]
```

最后我们要明确的是，函数声明和函数表达式最重要的区别是**提升行为**的不同；函数表达式不会被“提升”，即如果尝试在定义之前调用它则会抛出错误。这是因为 JavaScript 将函数表达式视为变量赋值，而变量只有在代码执行到那一行时才会被初始化。

```javascript
sayHi("John");  // 正常运行

function sayHi(name) {
  console.log(`Hello, ${name}`);
}
```

```javascript
sayHi("John");  // ❌ 报错

let sayHi = function(name) {
  console.log(`Hello, ${name}`);
};
```

此外，函数声明在代码块中的行为需要特别注意：

```javascript
if (true) {
  function test() {}
}

test(); // 在严格模式下通常不可用
```

更安全的做法是使用函数表达式：

```javascript
let test;

if (true) {
  test = function() {};
}

test(); // 正常
```

若需要**条件性地创建函数**、将函数作为**回调**进行传递，或者在**闭包**中封装私有逻辑时，那么最好的方案是使用函数表达式，它是实现模块化和函数式编程模式的基础。

> 实际开发中，推荐优先使用函数表达式或箭头函数，以避免作用域带来的不确定性。
{: .prompt-tip}

### 箭头函数

箭头函数是 ES6 引入的现代语法，它提供了一种极简的写法。除了语法更短之外，它在处理`this`指向问题时与普通函数有本质区别(箭头函数没有自己的`this`，它会继承父级作用域的`this`)，并且箭头函数不能作为构造函数(不能使用`new`关键字)。

```javascript
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
];

// 使用箭头函数简化映射逻辑
const names = users.map((user) => {
  return user.name
});

console.log(names);  // ['Alice', 'Bob']
```

> 如果函数体只有一行，则可以直接省略大括号和`return`关键字；如果函数参数只有一个，也可以省略参数外的括号。箭头函数的这种特性非常适合简单的转换逻辑。
{: .prompt-info}

若需要编写简短的回调函数，尤其是在数组方法(如`map`、`filter`、`reduce`等)中，或者需要保持外层`this`上下文时，箭头函数是最佳选择。

### 立即执行函数

立即执行函数(Immediately Invoked Function Expression，LLFE)是一种只执行一次的模式。它的主要作用是创建一个独立的作用域，防止变量污染全局命名空间。在大型项目中，如果不想让一些临时的变量(如配置项、中间计数器)暴露在全局，IIFE 是极佳的选择：

```javascript
// 使用 () 将函数包裹，最后再加 () 立即执行
(function() {
  const config = { apiEndpoint: '/api/v1', timeout: 5000 };
  
  // 即使在外部，也无法访问上面的 config 变量
  console.log("系统初始化完成，配置已加载。");
})();
```

或者

```javascript
(() => {
  const config = { apiEndpoint: '/api/v1', timeout: 5000 };  
  console.log("系统初始化完成，配置已加载。");
})();
```

在早期的 JavaScript 中，IIFE 是实现“私有变量”的唯一手段。但在现代 JavaScript (ES6+)中，我们通常使用`let`和`const`配合块级作用域`{ ... }`，或者直接利用模块化(Modules)来隔离作用域。但了解 IIFE 仍然很重要，因为它经常出现在阅读遗留代码(Legacy Code)或某些第三方库的源码中。
