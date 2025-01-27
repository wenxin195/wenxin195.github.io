---
key: filter function within dax
title: "Power BI 基础(3) 过滤函数"
permalink: "/filter-function-within-dax.html"
tags:
  - Power BI
author: Wenxin Zhong
layout: article
download: false
videos: false
refactor: true
mathjax: false
modify_date: "2025-01-21 14:03:00"
---

DAX 中的过滤函数和值函数(即返回值是数值类型的函数)是一些最复杂和最强大的函数，与 Excel 函数有很大的不同。筛选函数可以操作数据 Context，以创建动态计算。

<!--more-->

## ALL 系列函数

### ALL 函数

ALL 函数返回数据表中的所有字段，或者返回字段中的所有值，并且会忽略任何筛选条件。ALL 函数的最佳实践是用于清除 filters 并对表中的所有行创建计算。

ALL 函数的语法如下：

```text
ALL( [<table> | <column>[, <column>[, <column>[,…]]]] )
```

其中参数 `table` 表示想要清除 filters 的表，`column` 表示想要清除 filters 的列，其返回值为已删除 fliters 的表或列。

> ALL 函数不能与表表达式或者列表达式一起使用！
{: .prompt-danger}

#### 示例 1：计算不同商品成本占总成本的比例

假设需求为在数据透视表中找到当前单元格的销售额除以所有经销商的总销售额，为了确保无论数据透视表如何过滤或分组数据分母都是相同的，则可以使用下面的计算式：

```text
成本占比 = DIVIDE ( SUMX ( '销售表', '销售表'[成本] ), SUMX ( ALL ( '销售表' ), '销售表'[成本] ) )
```

于是得到结果如下图所示：

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/all_practice1.png" alt="all_practice1" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 1: ALL 函数示例 1 结果</p>
</div>

#### 示例 2：计算当月商品成本占总成本的比例

假设需求为显示每个商品每月的销售额百分比，那么需要将该特定月份和商品类别的销售总额除以所有月份相同产品类别的销售总额。换句话说要保留 ProductName 上的filters，但在计算百分比的分母时删除月份上的 filters。则可以使用下面的计算式：

```text
销售成本占比 =
DIVIDE (
    SUMX ( '销售表', '销售表'[成本] ),
    CALCULATE ( SUM ( '销售表'[成本] ), ALL ( '日期表'[Month] ) )
)
```

于是得到结果如下图所示：

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/all_practice2.png" alt="all_practice2" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 2: ALL 函数示例 2 结果</p>
</div>

#### 示例 3：计算每月商品成本对该月成本的占比

假设需求为以每月为基础显示每个商品类别的成本百分比，那么需要计算该特定商品类别在第 N 月的成本总额，然后将结果值除以第 N 月所有商品类别的成本总额。换句话说在计算百分比的分母时要保留 filters，但要删除 ProductName 上的 filters。则可以使用下面的计算式：

```text
销售成本占比 = 
DIVIDE (
    SUMX ( '销售表', '销售表'[成本] ),
    CALCULATE ( SUM ( '销售表'[成本] ), ALL ( '商品表'[商品名称] ) )
)
```

于是得到结果如下图所示：

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/all_practice3.png" alt="all_practice3" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 3: ALL 函数示例 3 结果</p>
</div>

### ALLEXCEPT 函数

ALLEXCEPT 函数可以删除表中除已应用于指定列的 filters 外的所有 Context 的筛选条件。该函数的语法如下：

```text
ALLEXCEPT(<table>,<column>[,<column>[,…]])
```

其中参数 `table` 表示需要删除所有 Context 过滤条件的表，`column` 表示必须为其保留 Context 的筛选条件的列，其返回值为被保留的列而组成的新表。

### ALLNOBLANKROW 函数

ALLNOBLANKROW 函数被用于删除表中由于某些筛选条件而导致的空白行，以便更准确地进行计算和分析。其语法如下：

```text
ALLNOBLANKROW( {<table> | <column>[, <column>[, <column>[,…]]]} )
```

其中参数 `table` 表示需要删除所有 Context 筛选条件的表，`column` 表示需要删除所有 Context 筛选条件的列。当传递的参数是一个表时，该函数的返回值是一个表；当传递的参数是一个列时，返回值则是一个值列。

ALLNOBLANKROW 函数与 ALL 类似，但它会进一步去除所有值为空的行，是数据清理和聚合的有力工具。

### ALLSELECTED 函数

ALLSELECTED 函数能够从当前查询中的列和行中删除 Filter Context，同时保留所有其他 Filter Context 或者 Power View 中的筛选条件。ALLSELECTED 函数的语法如下：

```text
ALLSELECTED([<tableName> | <columnName>[, <columnName>[, <columnName>[,…]]]] )
```

其中参数 `tableName` 是基础表的名称，`columnName` 是基础字段的名称，其返回值为没有任何列和行 filters 的查询 Context。

> ALLSELECTED 函数如果有多个参数，则它们必须是来自同一张表的列。
{: .prompt-danger}

ALLSELECTED 函数与 ALL 不同，因为它保留查询中明确设置的所有 filters，并且保留除行和列 filters 之外的所有 Filter Context。

将 ALL 函数示例 2 的 DAX 表达式中的 `ALL` 替换成 `ALLSELECTED`，然后只筛选 1 至 5 月，就可以很明显地看出区别：

<div style="text-align: center;">
    <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/all_practice4.png" alt="all_practice4" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 4: ALL 函数和 ALLSELECTED 函数的对比</p>
</div>

图 4 左边的透视表使用了 ALL 函数，右边的透视表使用了 ALLSELECTED 函数。可以看出左图的占比数据是基于所有月份计算的，而右图的占比数据是基于筛选条件后的月份计算。

## CALCULATE 函数

CALCULATE 函数的作用是在已修改的 Filter Context 中计算表达式，也就是说 CALCULATE 函数可以修改 Filter Context。CALCULATE 函数的语法如下：

```text
CALCULATE(<expression>[, <filter1> [, <filter2> [, …]]])
```

其中参数 `expression` 表示需要计算的值的表达式，`filter` 可以是布尔表达式、表表达式或者 filters 修改函数。

1. 布尔表达式过滤器是求值为`TRUE`或`FALSE`的表达式，其必须遵守以下几条规则：

   - 可以引用单个表中的列；
   - 不能引用度量值；
   - 不能嵌套使用 CALCULATE 函数。
   - 不能使用扫描或返回表的函数，除非这类函数可以作为参数传递给聚合函数；
   - 可以包含返回标量值的聚合函数，例如

   ```text
   Total sales on the last selected date =
   CALCULATE (
       SUM ( Sales[Sales Amount] ),
       'Sales'[OrderDateKey] = MAX ( 'Sales'[OrderDateKey] )
   )
   ```

2. 表表达式 filters 可以将表对象应用为 filter。它可能是对模型表的引用，但更可能是返回表对象的函数。可以使用 FILTER 函数来应用复杂的筛选条件，包括那些不能由布尔表达式定义的条件。

3. filters 修改函数不仅仅是添加过滤器，它们在修改过滤器上下文时还提供了额外的操作，例如

<table>
  <thead>
    <tr>
      <th>函数</th>
      <th>使用目的</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/removefilters-function-dax" target="_blank">REMOVEFILTERS</a>
      </td>
      <td>删除所有 filters，<br>可以从表的一个或多个列中删除 filters。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/all-function-dax" target="_blank">ALL</a> /
        <a href="https://learn.microsoft.com/en-us/dax/allexcept-function-dax">ALLEXCEPT</a> /
        <a href="https://learn.microsoft.com/en-us/dax/allnoblankrow-function-dax">ALLNOBLANKROW
        </a>
      </td>
      <td>从一个或多个列或从单个表的所有列中删除 fliters。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/keepfilters-function-dax" target="_blank">KEEPFILTERS</a>
      </td>
      <td>添加 filters，并且不删除相同列上的现有 filters。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/userelationship-function-dax">USERELATIONSHIP</a>
      </td>
      <td>在相关列之间建立非活动关系，在这种情况下活动关系将自动变为非活动关系。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/crossfilter-function-dax" target="_blank">CROSSFILTER</a>
      </td>
      <td>修改过滤器方向(从 both 到 single，亦或反之)或禁用关系。</td>
    </tr>
  </tbody>
</table>

> ALL 系列函数既可以用作 filters 修改器，也可以充当返回表对象的函数。如果 Power BI 版本支持 REMOVEFILTERS 函数，那么最好使用它来删除 filters。
{: .prompt-tip}

> 还有 CALCULATETABLE 函数，它执行完全相同的功能，只是它修改了应用于返回表对象的表达式的 Filter Context。
{: .prompt-info}

下面的数据表计算了石家庄市的咖啡销售情况：

```text
石家庄销售数量 = CALCULATE ( SUM ( '销售表'[数量] ), '城市'[地区] = "石家庄市" )
```

计算结果如下图所示：

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/calculate_practice1.png" alt="calculate_practice1" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 5: CALCULATE 函数示例 1 结果</p>
</div>

下面的数据表计算了不同性别的销售量及其比例情况：

```text
性别销售占比 = 
DIVIDE (
    SUM ( '销售表'[数量] ),
    CALCULATE ( SUM ( '销售表'[数量] ), REMOVEFILTERS ( '性别'[顾客性别] ) )
)
```

计算结果如下图所示：

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/calculate_practice2.png" alt="calculate_practice2" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 6: CALCULATE 函数示例 2 结果</p>
</div>

下面的 DAX 的表达式定义了低成本商品和高成本商品，当商品成本 $<21.82$ 时定义该商品为低成本商品，否则定义该商品为高成本商品：

```text
商品划分 =
IF (
    CALCULATE (
        AVERAGE ( '销售表'[成本] ),
        ALLEXCEPT ( '商品表', '商品表'[杯型] )
    ) < 21.82,
    "低成本商品",
    "高成本商品"
)
```

在这个例子中，Row Context 转换成了 Filter Context，其中 AVERAGE 函数根据 Row Context 来计算平均成本，CALCULATE 函数通过参数的筛选条件实现对 Row Context 转换成 Filter Context。这就是所谓的 Context 转换，因此 CALCULATE 函数可以当作 Context 转换器。

## EARLIER 函数

EARLIER 函数能够在回溯指定列的 Row Context 时返回上一个 Row Context 的值。EARLIER 函数通常用于多层嵌套的 CALCULATE 函数或者 FILTER 函数中，这能够帮助我们访问外层的 Row Context。

EARLIER 函数主要用于计算列中，它的语法如下：

```text
EARLIER(<column>, <number>)
```

其中参数 `column` 是列名或者列表达式，`number` 是一个正数，表示要回溯的 Row Context 的层数，当`number`缺省时默认为 1。EARLIER 函数的返回值为指定列在回溯时在`number`处的行值。

> 若在表扫描开始之前有 Row Filter，则 EARLIER 函数执行成功，否则报错。
{: .prompt-danger}

> EARLIER 函数的执行性能很差。
{: .prompt-warning}

下面的 DAX 表达式计算了每笔订单在总的销售数据中的排名情况：

```text
排名 = 
COUNTROWS (
    FILTER ( '销售表',
    EARLIER ( '销售表'[数量] ) < '销售表'[数量]
    )
) + 1
```

与之类似的还有 EARLIEST 函数。

## FILTER 函数

## KEEPFILTERS 函数

## LOOKUPVALUE 函数

## MATCHBY 函数

## MOVINGAVERAGE 函数

## OFFSET 函数

ORDERBY 函数 和 PARTITIONBY 函数

## RANGE 函数

## RANK 函数

## REMOVEFILTERS 函数

## ROWNUMBER 函数

## RUNNINGSUM 函数

## SELECTEDVALUE 函数

## WINDOW 函数
