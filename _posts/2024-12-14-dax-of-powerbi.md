---
key: dax of powerbi
title: "Power BI 基础(2) DAX 表达式"
permalink: "/dax-of-powerbi.html"
tags:
  - Power BI
author: Wenxin Zhong
layout: article
download: false
videos: false
refactor: true
mathjax: false
modify_date: "2024-12-14 23:04:00"
---

DAX(Data Analysis Expression)是⼀种专门为计算数据模型中的商业逻辑而设计的语言，是 Power BI 中数据建模语言。计算列和度量值都是用 DAX 生成的，DAX 可以从模型中已有的数据中创建新信息。

<!--more-->

## 表函数

表函数是 DAX 中的一种常规函数，它返回的结果不是一个标量值，而是一个表。当需要编写 DAX 查询和迭代表的高级计算时，表函数非常有用。

通常，我们不能将表函数返回的结果作为度量值或计算列的值。度量值和计算列都要求结果为标量值。但是，我们可以将表表达式的结果分配给*新建表*(Calculated Table)。新建表是个计算表，其值由 DAX 表达式决定，而不是从数据源加载。

### EVALUATE 语法

DAX Studio 之类的查询工具对于编写复杂的表表达式非常有用。在这种情况下，检查表表达式结果的常用语句是 `EVALUATE`。DAX 查询语句是一个返回表的 DAX 表达式，与 `EVALUATE` 语句一起使用。

`EVALUATE` 用于执行 DAX 查询并返回数据。它通常与其他查询语法(如 `FILTER`、`SUMMARIZE` 等)结合使用，用于在 DAX 查询中提取数据并展示结果集。可以将其理解为 SQL 查询语言中的 `SELECT` 语句。其语法为：

```text
[DEFINE { MEASURE <tableName>[<name>] = <expression> }]
EVALUATE <table>
[ORDER BY {<expression> [{ASC | DESC}]} [,...]]
```

> `EVALUATE` 语句的返回值为一张表。
{: .prompt-danger}

### FILTER 函数

FLITER 函数的语法如下：

```text
FILTER( <table>, <filter> )
```

其中 `<table>` 是表名，`<filter>` 是逻辑条件，并返回满足条件的所有行。FILTER 既是一个表函数，又是一个迭代器。为了返回最终结果，它对表进行逐行扫描，并计算逻辑条件。换句话说，**Fliter 函数迭代了表**。例如：

```text
RedSales = 
SUMX ( 
    FILTER ( Sales, RELATED ( 'Product'[Color] ) = "Red" ),
    Sales[Quantity] * Sales[Net Price] 
)
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/filter.png" alt="filter" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 1: RedSales 只显示红色产品的销售额</p>
</div>

可以在 FILTER 函数中嵌套另一个 FILTER 函数。通常两个嵌套的 FILTER 函数得到的结果与将它们和 AND 函数组合在一起得到的结果相同。例如下面两个 DAX 表达式是等价的：

```text
FabrikamHighMarginProducts =
FILTER (
    FILTER ( 'Product', 'Product'[Brand] = "Fabrikam" ),
    'Product'[Unit Price] > 'Product'[Unit Cost] * 3
)

FabrikamHighMarginProducts =
FILTER (
    'Product',
    AND (
        'Product'[Brand] = "Fabrikam",
        'Product'[Unit Price] > 'Product'[Unit Cost] * 3
    )
)
```

由于两个条件具有不同的约束性，不同的组合方式在大型表上的性能表现可能有所不同。如果一个条件比另一个条件更具约束性，则最佳方法是首先在内层的 FILTER 函数中应用最具约束性的条件。

### ALL 函数

ALL 函数的语法如下：

```text
ALL( [<table> | <column>[, <column>[, <column>[,...]]]] )
```

ALL 函数根据所使用参数的不同，返回表的所有行，或者一列、多个列的所有值。每当我们需要计算**百分比**或**比率**时，ALL 函数会非常有用，因为它可以忽略报表自动引入的筛选器。例如：

```text
Sales Amount =
SUMX ( Sales, Sales[Quantity] * Sales[Net Price] )

All Sales Amount =
SUMX ( ALL ( Sales ), Sales[Quantity] * Sales[Net Price] )

Sales Pct =
DIVIDE ( [Sales Amount], [All Sales Amount] )
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/percentage.png" alt="filter" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 2: 销售额、总计值及其占总计的百分比</p>
</div>

> ALL 函数的参数不能是表表达式，它必须是表名或列名！
{: .prompt-danger}

如果用表名作为参数，ALL 函数则返回该表所有值的副本；如果用某列作为参数，ALL 函数则返回该列在整个表中的所有**不重复值**。

ALL 函数的参数中还可以指定同一个表中的多列。在这种情况下，ALL 函数返回这些列中所有现有值的组合。例如：

```text
Categories =
ALL ( 'Product'[Category] )

Categories =
ALL ( 'Product'[Category], 'Product'[Subcategory] )
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/all.png" alt="all" style="width: 250px;">
       <figcaption>(a) 使用列作为 ALL 函数生成该列的不重复值列表</figcaption>
     </figure>
     <figure style="text-align: center; margin-top: 48px;">
       <img src="/assets/images/picture/DAX/all2.png" alt="all2" style="width: 350px;">
       <figcaption>(b) 列表包含类别和子类别的所有不重复值组合</figcaption>
     </figure>
   </div>
   <p style="margin-top: -15px;">图 3: ALL 函数传入列名</p>
</div>

> ALL 函数中引用的必须是同一张表中的列！
{: .prompt-danger}

所有形式的 ALL 函数都忽略任何现有的筛选器。我们可以将 ALL函数 用作迭代函数的参数，例如 SUMX 函数和 FILTER 函数，也可以将 ALL 函数用作 CALCULATE 函数中的筛选器参数。

### VALUES 函数与 DISTINCT 函数

ALL 函数总是返回列的所有不同值，而 VALUES 函数返回在当前筛选器中计算的列的不同值。VALUES 函数的语法如下：

```text
VALUES(<TableNameOrColumnName>)
```

其中 `<TableNameOrColumnName>` 是表名或列名。当输入参数是列名时，重复值将被删除，仅返回唯一值(包括空值)的列表。当输入参数是表名时，返回该表的所有不重复的行。例如：

```text
NumOfAllColors = COUNTROWS ( ALL ( 'Product'[Color] ) )

NumOfColors = COUNTROWS ( VALUES ( 'Product'[Color] ) )
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/values.png" alt="values" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 4: VALUES 函数只返回颜色的一个子集(包括空值)</p>
</div>

前面说过，ALL 函数在传入列名时，返回该列的所有不重复值(包括空值)。而 DISTINCT 函数在传入列名时，返回该列的所有不重复值(不包括空值)。DISTINCT 函数的语法如下：

```text
DISTINCT(<TableNameOrColumnName>)
```

例如：

```text
NumOfDistinctColors = COUNTROWS ( DISTINCT ( 'Product'[Color] ) )
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/distinct.png" alt="distinct" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 5: NumOfDistinctColors 为空行显示为空值，其总数显示为 $15$</p>
</div>

一个设计良好的模型中不应该存在无效的关系。因此如果模型是完美的，那么这两个函数总是返回相同的值。然而在处理无效的关系时，特别需要注意这种情况，否则可能会编写出错误的表达式。例如：

```text
AvgSalesPerProduct =
DIVIDE (
    SUMX ( Sales, Sales[Quantity] * Sales[Net Price] ),
    COUNTROWS ( VALUES ( 'Product'[Product Code] ) )
)

AvgSalesPerDistinctProduct =
DIVIDE (
    SUMX ( Sales, Sales[Quantity] * Sales[Net Price] ),
    COUNTROWS ( DISTINCT ( 'Product'[Product Code] ) )
)

AvgSalesPerDistinctKey =
DIVIDE (
    SUMX ( Sales, Sales[Quantity] * Sales[Net Price] ),
    COUNTROWS ( VALUES ( Sales[ProductKey] ) )
)
```

第 1 个 DAX 表达式显然是错误的，因为第一行中有一个过大的、没有意义的数字。这是因为第 1 行中显示的数字(类别为空)对应于所有银色产品的销售情况，它们已经不存在于 Product 表中了。而分子是所有银色产品的销售额，分母是由 VALUES 函数返回的单个空行。因此一个不存在的产品(空行)包含了 Sales 表中引用的许多其他产品的销售额，而这些产品在 Product 表中不可用，从而导致了计算结果是一个巨大的数字。造成这个问题是因为存在无效的关系，而不是公式本身。实际上无论我们创建什么公式，在 Sales 表中都有许多产品的销售记录在数据库中没有对应的产品信息。

在第 2 个 DAX 表达式中，我们使用了 DISTINCT 函数，因此分母的 COUNTROWS 返回空，结果也为空；在第 3 个 DAX 表达式中，我们使用了 VALUES 函数，但是这次计算的是`Sales[ProductKey]`的数量。注意，有许多不同的`Sales[ProductKey]`值，它们都与同一个空行相关。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/AvgSales.png" alt="AvgSales" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 6: 当存在无效的关系时，大部分度量值很可能会出现错误，尽管原因各不相同</p>
</div>

有趣的是，`AvgSalesPerDistinctKey`是唯一计算正确的。由于报表是按类别划分产品的，每个类别都有不同数量的无效`ProductKey`，它们都被归入单个空行中。

正确的方法应该是修复关系，这样就不会有孤立于 Product 表的销售记录了。最佳准则是模型中不能存在任何使约束无效的关系，同时需要非常谨慎地处理空行，以及考虑它的存在可能会对计算产生的影响。

VALUES 函数和 DISTINCT 函数通常用作迭代函数的参数。当关系有效时它们的结果没有任何区别。在这种情况下需要将迭代中的空行视为有效行，以确保迭代所有可能的值。通常情况下，VALUES 函数应该是你的默认选择，只有当你想显式地排除可能的空值时，才考虑使用 DISTINCT 函数。

### 将表作为标量

尽管 VALUES 函数是一个表函数，但由于 DAX 的一个特性(即具有单行和单列的表可以像标量值一样使用)，我们也会经常使用它来计算标量值。例如想在品牌数量的旁边看到品牌名称，一种可行的解决方案是使用 VALUES 函数来检索不同的品牌，并返回它们的名称(而不是对它们进行计数)。这种方案只适用于品牌存在唯一值的情况。实际上在这种情况下，使用 VALUES 函数返回结果是可行的，DAX 会自动将其转换为标量值。为了确保只有一个品牌，还需要使用 IF 语句来保护代码：

```text
NumOfBrands = COUNTROWS ( VALUES ( 'Product'[Brand] ) )

Brand Name = IF ( COUNTROWS ( VALUES ( 'Product'[Brand] ) ) = 1, VALUES ( 'Product'[Brand] ) )
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/scaler.png" alt="scaler" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 7: 当 VALUES 函数返回一行时，我们可以使用它作为标量值</p>
</div>

Brand Name 度量值使用 COUNTROWS 函数检查产品表的品牌列是否只选择了一个值。由于这种方式在 DAX 表达式中经常使用，我们有一个更简单的函数可以检查列中是否只有一个可见值，它就是 HASONEVALUE 函数。以下是 BrandName 度量值(基于 HASONEVALUE 函数)的一种更好的写法：

```text
Brand Name = IF ( HASONEVALUE ( 'Product'[Brand] ), VALUES ( 'Product'[Brand] ) )
```

为了减轻工作量，DAX 还提供了一个函数,可以自动检查列中是否包含单个值，如果包含则返回标量值；如果有多个值，也可以定义需要返回的默认值。这个函数就是 SELECTEDVALUE 函数。所以，前面的度量值也可以被定义为：

```text
Brand Name = SELECTEDVALUE ( 'Product'[Brand] )
```

通过加入第二个可选参数，可以提供一条消息来说明结果包含多个值：

```text
Brand Name = SELECTEDVALUE ( 'Product'[Brand], "Multiple Brands" )
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/scaler2.png" alt="scaler2" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 8: 如果 Brand Name 列有多行，SELECTEDVALUE 函数会返回默认值</p>
</div>

如果不返回 “Multiple brands” 之类的消息，而是希望列出所有品牌。在这种情况下，一种做法是使用 CONCATENATEX 函数选代`Product[Brand]`的值，这样即便有多个值，也可以得到很好的显示效果：

```text
Brand Name = CONCATENATEX ( VALUES ( 'Product'[Brand] ), 'Product'[Brand], ", " )
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/scaler3.png" alt="scaler3" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 9: 使用 CONCATENATEX 函数连接表达式，从表中构建文本</p>
</div>

### SUMMARIZE 函数与 SUMMARIZECOLUMNS 函数

## CALCULATE 函数与 CALCULATETABLE 函数

CALCULATE 是目前 DAX 语言中最重要、最有用同时也是最复杂的函数，值得单独成章进行介绍。CALCULATE 函数本身很容易学习，它仅执行几项任务，其复杂性来自这样一个事实：CALCULATE 和 CALCULATETABLE 是 DAX 中仅有的两个能够创建新的筛选上下文的函数。虽然它们很简单，但是在公式中使用 CALCULATE 或 CALCULATETABLE 会立即增加复杂性。

## ALL 系列函数

### ALLEXCEPT 函数

如果想用 ALL 函数调用一个表的大部分列，但不是所有列，则可以使用 ALLEXCEPT 函数。ALLEXCEPT 函数的语法如下：

```text
ALLEXCEPT( <table>, <column>[, <column> [,...]] )
```

ALLEXCEPT 函数返回包含该表其他列中现有值组合的唯一列表。通过 ALLEXCEPT 函数编写的 DAX 表达式，将自动在结果中包含将来可能出现在表中的任何附加列。

### ALLNOBLANKROW 函数

ALLNOBLANKROW 函数的语法如下：

```text
ALLNOBLANKROW( {<table> | <column>[, <column>[, <column>[,...]]]} )
```

ALLNOBLANKROW 函数返回列或表的所有不重复值，忽略为无效关系的空白行。

### ALLSELECTED 函数

ALLSELECTED 函数在检索表或列的值时非常有用，这类值的特点是在当前报表中可见，并且只考虑除当前视觉对象之外的所有筛选器。ALLSELECTED 函数的语法如下：

```text
ALLSELECTED([<tableName> | <columnName>[, <columnName>[, <columnName>[,...]]]] )
```

ALLSELECTED 函数从当前查询中的列和行中删除 Context，同时保留所有其他 Context 过滤器或显式过滤器，它返回从最后一个 Context 中返回列或表的不重复值。此函数可用于在查询中获得可视总计。例如：

```text
Sales Pct =
DIVIDE (
    SUMX ( Sales, Sales[Quantity] * Sales[Net Price] ),
    SUMX ( ALL ( Sales ), Sales[Quantity] * Sales[Net Price] )
)
```

因为分母使用了 ALL 函数，所以它总是计算总销售额，不考虑任何筛选器。因此如果使用切片器来减少所显示的类别数量，则报表仍然基于总销售额计算百分比。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/allselected.png" alt="allselected" style="width: 300px;">
       <figcaption>(a) 一个矩阵视觉对象和一个切片器</figcaption>
     </figure>
     <figure style="text-align: center; margin-top: 36px;">
       <img src="/assets/images/picture/DAX/allselected2.png" alt="allselected2" style="width: 300px;">
       <figcaption>(b) 使用 ALL 函数的百分比仍然是基于总销售额计算</figcaption>
     </figure>
   </div>
   <p style="margin-top: -20px;">图 10: ALL 函数应用于切片器</p>
</div>

矩阵中的一些行因为筛选器的作用消失了，但是其余行显示的值没有变化。而且矩阵中的总计不再是 100%。如果不希望呈现这种结果，也就是百分比不是基于总销售额计算的，而是只计算筛选器选定的值，则需要使用 ALLSELECTED 函数。是只计算筛选器选定的值，则需要使用 ALLSELECTED 函数。

使用 ALLSELECTED 函数代替 ALL 函数来编写 SalesPct 的代码，分母在计算销售额时只考虑矩阵视觉对象之外的所有筛选器。换句话说，它返回除 Audio、Music 和 TV 之外的所有类别的销售额：

```text
Sales Pct =
DIVIDE (
    SUMX ( Sales, Sales[Quantity] * Sales[Net Price] ),
    SUMX ( ALLSELECTED ( Sales ), Sales[Quantity] * Sales[Net Price] )
)
```

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/allselected3.png" alt="allselected3" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 11: 使用 ALLSELECTED 函数在基于销售额计算百分比时只考虑外部筛选器</p>
</div>

如上图所示总计恢复为 100%，报表的数字反映的是占可见总计(Visible Total，即只考虑除当前视觉对象之外的所有筛选器)的百分比，而不是占总销售额的百分比。ALLSELECTED 函数是一个强大而有用的函数，但是它也是一个非常复杂的函数。

### ALLCROSSFILTERED 函数

ALLCROSSFILTERED 函数的语法如下：

```text
ALLCROSSFILTERED( <table> )
```

ALLCROSSFILTERED 函数清除应用于表的所有过滤器，其返回值为 `N/A`，不能返回表。

## 时间智能函数

## 半累加计算

## 计算组
