---
key: component of powerbi
title: "Power BI 基础(1) Power 组件"
permalink: "/component-of-powerbi.html"
tags:
  - Power BI
author: Wenxin Zhong
layout: article
download: false
videos: false
refactor: true
mathjax: false
modify_date: "2025-01-20 00:40:00"
---

Power BI 是一款功能强大的商业智能软件，在当下的数据分析领域占据着重要地位。它就像是 Excel 的升级版，不过功能更为全面且强大，已然成为数据处理与分析方面的得力助手。Power BI 由三部分组成：Power Query、Power Pivot 和 Power View。

<!--more-->

Power Query 用来获取文件、文件夹、数据库、网页等数据并进行深度加工处理，然后把这些处理步骤进行保存，后期数据更新时无须再次重复操作。Power Query有可视化的操作界面，同时支持用 **M 语言**进行高级编辑。

Power Pivot 可以利用 Power Query 处理好的数据或其他数据建立分析维度，实现模型搭建。Power Pivot 使用 **DAX 语言**进行函数编辑，DAX 具有与 Excel 函数相似的编辑方式。

Power View 则是 Power BI 强大的可视化模块，内置条形图、直方图、折线图、散点图和饼图等基本图形，还包括瀑布图、漏斗图、树状图、桑基图等高级图形，除此之外 Power View 能够从外部导入各式各样的图表。

## Power Query

Power Query 是 Power BI 实现数据 ETL(Extract-Transform-Load)的重要工具，它使得用户能够轻松地从各种数据源提取数据，并对其进行转换和清洗，最终加载到 Power BI 中进行分析和可视化。通过 Power Query，用户可以执行数据合并、过滤、格式转换、分列等操作，支持对多个数据源的连接和处理。

### 数据规范化

有时候由于 Power Query 识别失败的原因，数据集的第一行并不会作为列名，这是就需要我们手动设置“将第一行作为标题”命令。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/title.png" alt="title" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $1$: 将第一行作为标题</p>
</div>

### 格式转换

在字段的左侧会看到数据类型的下拉按钮，单击此按钮在下拉列表就直接可以选择修改数据类型。除了手动修改字段的数据类型，Power Query 还支持自动检测字段的数据类型。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/data_categories.png" alt="data_categories" style="width: 350px;">
       <figcaption>(a) 手动修改数据类型</figcaption>
     </figure>
     <figure style="text-align: center; margin-top:121px;">
       <img src="/assets/images/picture/DAX/data_categories2.png" alt="data_categories2" style="width: 350px;">
       <figcaption>(b) 自动检测数据类型</figcaption>
     </figure>
   </div>
   <p style="margin-top: -26px;">图 $2$: 修改数据类型</p>
</div>

### 数据清洗

当我们想要删除数据集中的重复值、空值和 Error 值等时，可以在“删除行”中进行选择。

需要指出的是，只有当某一行的所有字段都与其他行重复，或者都为空值时，“删除行”的命令才会起作用；当某一行的字段存在 Error 值时，该行就会被删除。

当选择某一字段时，执行“删除行”命令则会保留该列的唯一值或者非空值。删除空值的方法还可以直接对字段进行筛选。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/delete_row.png" alt="delete_row" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $3$: 删除重复值、空值和 Error 值</p>
</div>

对于缺失值的处理，可以选择“填充”命令，向上或者向下填充缺失值。Power Query 有着很强的扩展性，可以选择直接执行 Python/R 脚本选择符合我们需求的缺失值填充方式。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/null_values.png" alt="null_values" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $4$: 填充缺失值</p>
</div>

有时候我们需要替换数据集中的某些文本内容，这就可以使用“替换值”命令进行替换。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/alter.png" alt="alter" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $5$: 内容替换</p>
</div>

除此之外，我们还可以在“格式”命令中对字段中的英文进行转换。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/letter_operation.png" alt="letter_operation" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $6$: 对字段中的英文进行操作</p>
</div>

### 字段拆分合并

在数据清洗过程中，对字段进行拆解合并也是一项十分重要的步骤，这些操作都可以在 Power Query 的“拆分列”和“合并列”选项实现。其中“拆分列”命令支持按分隔符、字符数和指定位置对字段进行拆分。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/split_merge.png" alt="split_merge" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $7$: 对字段进行拆分合并</p>
</div>

Power Query 还能够根据我们的需求提取字段的内容。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/extract.png" alt="extract" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $8$: 对字段的值进行提取</p>
</div>

### 统计聚合

“分组依据”命令可以按照字段和聚合类型，对数据进行分组统计操作。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/group.png" alt="group" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $9$: 分组聚合统计</p>
</div>

另外在 Power Query 中，还可以制作透视表和逆透视表。透视表就是一张二维的列联表，而逆透视表就是将二维列联表转换成一维表。

例如一张二维列联表，它的行是不同的咖啡种类，列是不同的杯型。那么该二维列联表的逆透视表就是一张包含\[咖啡种类、杯型、数量\]的一维表。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/pivot.png" alt="pivot" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $10$: 透视表与逆透视表</p>
</div>

若想制作一张“咖啡种类——杯型”的逆透视表，只需选中关于杯型字段的“大杯数量”、“中杯数量”和“小杯数量”，然后选择“逆透视列”即可；反过来若想制作“咖啡种类——杯型”的透视表，只需选中“杯型”字段，然后选中“透视列”即可。

### 衍生列计算

在 Power Query 中，“添加列”命令可以在现有数据的基础上创建新的列，这些新列可以是基于现有列的计算结果、条件逻辑或其他数据处理操作。通过“添加列”命令，可以扩展数据集并生成新的指标，从而为后续的分析和建模提供更多的洞察力。

“添加列”命令支持“条件列”、“索引列”、“自定义列”和“示例列”。“条件列”类似于 Excel 中的`IF`函数，可以设置多个条件，并为每个条件指定对应的输出值。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/condition_column.png" alt="condition_column" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $11$: 条件列</p>
</div>

“索引列”用于为数据集中的每一行分配一个唯一的编号，这个编号可以是从 0 开始、从 1 开始，也可以根据已有的列进行递增或递减。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/indicator_column.png" alt="indicator_column" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $12$: 索引列</p>
</div>

“示例列”是是一个智能功能，只需输入满足需求的值，之后 Power Query 会解决后续的操作问题。例如在“城市”字段中想提取“市”之前的城市名，那么只需在第一行内输入“北京”，然后会看到整个列都出现了想要的结果了。

“自定义列”则是通过自定义公式或表达式，可以基于现有列的数据进行计算生成新的列。这种列的计算通常是基于 M 语言来实现的，可以包括数学运算、文本操作、日期计算等。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/custom_column.png" alt="custom_column" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $13$: 自定义列</p>
</div>

### 日期/时间操作

Power Query 中的“日期”和“时间”命令可以设置“日期”/“时间”值格式或提取”日期”/“时间”值的元素，“持续时间”命令可以设置“持续时间”值的格式。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/time.png" alt="time" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $14$: 日期&时间列</p>
</div>

### 数据合并

在某些情况下，我们需要在数据表中添加另一张数据表的字段，这时可以使用“合并查询”。它能够将两个或多个查询中的数据按照某些公共字段进行合并，相当于 SQL 中的 JOIN 操作。合并后的结果是一个包含来自不同查询的相关信息的新数据表。该功能非常适合处理需要从多个数据源或多个表中提取相关信息的情况。

合并查询中两张数据表的连接方式与 SQL 中的 JOIN 操作类似，需要设置左连接、右连接、内连接以及全连接。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-top: 264px;">
       <img src="/assets/images/picture/DAX/consolidation1.png" alt="consolidation1" style="width: 350px;">
       <figcaption>(a) 合并查询命令</figcaption>
     </figure>
     <figure style="text-align: center; margin-top:0px;">
       <img src="/assets/images/picture/DAX/consolidation2.png" alt="consolidation2" style="width: 350px;">
       <figcaption>(b) 设置连接方式</figcaption>
     </figure>
   </div>
   <p style="margin-top: -25px;">图 $15$: 合并查询</p>
</div>

除了合并查询之外，还能够想数据表的纵向追加数据行，这可以通过“追加查询”命令完成。注意，这需要两张表的字段完全相同！

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-top: 77px;">
       <img src="/assets/images/picture/DAX/addition1.png" alt="addition1" style="width: 350px;">
       <figcaption>(a) 追加查询命令</figcaption>
     </figure>
     <figure style="text-align: center; margin-top:0px;">
       <img src="/assets/images/picture/DAX/addition2.png" alt="addition2" style="width: 350px;">
       <figcaption>(b) 选择追加数据表</figcaption>
     </figure>
   </div>
   <p style="margin-top: -16px;">图 $16$: 追加查询</p>
</div>

### 汇总数据集

Power Query 允许批量导入文件夹的数据集，后续只需往文件夹中添加新的文件即可，Power Query 会自动更新数据。但是需要注意的是，该文件夹下的数据集的格式必须保持一致，否则 Power Query 会因为格式混乱而报错。

## Power View

Power View 是 Power BI 中的一项强大的数据可视化功能，它为用户提供了一种互动式的方式来创建、查看和分享动态的报表和仪表板。通过 Power View，用户能够通过直观且交互式的图表和图形，将数据转化为具有洞察力的视觉表现，从而帮助更好地理解数据并做出决策。

Power View 允许用户与报告进行深度交互，包括：

- 筛选与切片：用户可以通过筛选条件和切片器选择数据的不同子集，动态更新视图；
- 钻取(Drillthrough)：通过点击图表或表格中的特定数据点，用户可以进一步查看该数据点的详细信息；
- 联动视图：不同的可视化组件之间会联动，用户与一个图表的互动会自动更新其他相关图表，帮助用户更深入地挖掘数据。

## Power Pivot

Power Pivot 是 Power BI 中的核心组件之一。它是一种数据建模工具，能够帮助用户处理和分析大量数据，建立复杂的数据关系模型，并支持高效的计算与分析。Power Pivot 可以处理几百万行数据，并且支持创建多表之间的关系，执行复杂的计算，最终帮助用户生成高效的商业智能分析报告。

### 数据模型

在数据仓库的建设过程中，根据事实表与维表的关系，经常将数据模型分为星型模型、雪花模型及星座模型。

#### 星型模型

星型模型中只有一张事实表，以及 0 张或多张维表，事实表与维表通过主键外键相关联，维表之间不存在关联关系，当所有维表都关联到事实表时，整个图形非常像一种星星的结构，所以称之为“星型模型”。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/data_model1.png" alt="data_model1" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $17$: 星型模型</p>
</div>

星型模型是最简单最常用的模型。星型模型本质是一张大表，相比于其他数据模型更合适于大数据处理。其他模型可以通过一定的转换，变为星型模型。

星型模型的缺点是存在一定程度的数据冗余。因为其维表只有一个层级，有些信息被存储了多次。

#### 雪花模型

当一个或多个维表没有直接连接到事实表上，而是通过其他维表连接到事实表上时，其图解就像多个雪花连接在一起，故称雪花模型。雪花模型是对星型模型的扩展。它对星型模型的维表进一步层次化，原有的各维表可能被扩展为小的事实表，形成一些局部的"层次"区域，这些被分解的表都连接到主维表而不是事实表。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/data_model2.png" alt="data_model2" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $18$: 雪花模型</p>
</div>

其优点是通过最大限度地减少数据存储量以及联合较小的维表来改善查询性能，避免了数据冗余。其缺点是增加了主键-外键关联的几率，导致查询效率低于星型模型，并且不利于开发。

#### 星座模型

星座模型也是星型模型的扩展。区别是星座模型中存在多张事实表，不同事实表之间共享维表信息，常用于数据关系更复杂的场景。其经常被称为星系模型。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/DAX/data_model3.png" alt="data_model3" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $19$: 星座模型</p>
</div>

### 数据分析表达式

DAX(Data Analysis Expression)是一种功能强大的数据建模和分析公式语言。DAX 可以从模型中已有的数据中创建新信息，它用于创建计算列、度量值、计算表以及在数据模型中进行高级数据分析和聚合，允许用户在数据模型中创建复杂的计算、度量值和数据分析，帮助用户高效处理和分析数据。

DAX 的核心功能包括：

- 计算列和度量值：可以基于现有数据创建新的计算列或度量值；
- 时间智能：支持强大的时间序列分析，如环比、同比增长等；
- 筛选与上下文修改：通过 CALCULATE 函数等修改数据上下文，进行条件计算和聚合；
- 表格操作：能够执行复杂的表格过滤和聚合，例如使用 FILTER 函数和 SUMMARIZE 函数等生成自定义的计算表。

DAX 使用户能够在数据模型中进行动态计算，提供了深度的数据分析能力以及更强的功能和灵活性，特别适合在商业智能工具中执行实时的数据分析和报表制作。

### 度量值

Power Pivot 将指标(Indicator)定义成**度量值**(Measures)，也被称作计算字段(Calculated fields)。与度量值类似的是**计算列**(Caltulated columns)，度量值与计算列都是由 DAX 编写。

它们二者的区别如下表所示：

<table>
  <thead>
    <tr>
      <th></th>
      <th><strong>计算列</strong></th>
      <th><strong>度量值</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>计算方式</strong></td>
      <td>按行计算数据。<br>每一行的数据都有一个计算结果，结果存储在模型中。</td>
      <td>根据筛选条件和聚合的 Context 动态计算结果。<br>计算结果不会存储，而是根据用户的筛选条件实时计算。</td>
    </tr>
    <tr>
      <td><strong>存储位置</strong></td>
      <td>结果存储在数据模型中，作为表的一部分。</td>
      <td>结果不存储，而是在查询时动态计算，并且只在需要时进行计算。</td>
    </tr>
    <tr>
      <td><strong>计算粒度</strong></td>
      <td>每行数据都有一个计算结果，通常是与其他列的值相关。</td>
      <td>结果通常是聚合的，依赖于筛选条件或透视表的 Context。</td>
    </tr>
    <tr>
      <td><strong>使用场景</strong></td>
      <td>用于将每行的计算结果作为新列添加到数据模型中，<br>适用于每一行需要单独处理的计算。</td>
      <td>用于聚合计算，<br>适用于需要在报表或透视表中显示的汇总数据。</td>
    </tr>
    <tr>
      <td><strong>更新方式</strong></td>
      <td>计算列的值在数据加载时计算，并存储在数据模型中。</td>
      <td>度量值的计算是在查询时动态计算的，因此不会占用存储空间。</td>
    </tr>
    <tr>
      <td><strong>性能</strong></td>
      <td>对于大数据集，计算列可能会增加模型的大小，<br>它将结果存储在数据模型中。</td>
      <td>度量值只在查询时计算，不增加存储大小。<br>对于较大的数据集，通常性能较好。</td>
    </tr>
  </tbody>
</table>

总之，计算列适用于按行计算的场景，通常用于为数据表添加新的列，计算过程在数据加载时完成，并且结果被存储；度量值适用于需要聚合和根据 Context 动态计算的场景，通常用于报告和透视表中进行汇总计算，计算过程在查询时按需进行。

### 上下文

上下文(Context)是理解 DAX 的核心概念，它直接影响着数据的计算、呈现以及交互方式。简单来说 Context 就是 DAX 所处的外部环境，它又分为筛选上下文和行上下文。

筛选上下文(Filter context)是指对数据集应用的筛选条件或上下文。它通常由切片器(Slicers)、行/列维度、度量值、以及其他视觉对象(包括 Visual Level Filters、Page Level Filters 和 Report Level Filters)中的选择所决定。简单来说 Filter context 就是对字段进行筛选。

在 Power BI 中，度量值是最常依赖 Filter context 的元素。当你选择报表中的某个筛选条件或维度时，这些筛选条件会影响度量值的计算，进而改变报表中的结果。

DAX 中的表函数，例如 FILTER 函数、ALL 函数等，都是基于 Filter context 进行操作的。

> 所有度量值都可以看作是 Filter context 的函数。
{: .prompt-danger }

而行上下文(Row context)是指对每一行数据进行计算时产生的 Context。它通常出现在 Calculated Columns 中。在每一行添加计算时，DAX 引擎会自动为每一行提供 Row context。简单来说 Row context 就是对表进行迭代。

DAX 中的迭代函数，例如 SUMX 函数、AVERAGEX 函数等，都是基于 Row context 进行操作的。

> CALCULATE 函数可以将 Row context 转换为 Filter context。
{: .prompt-tip }

在某些情况下，Row context 和 Filter context 可能会结合在一起。在 Power BI 中，DAX 的计算是动态的，它们会基于当前的上下文来调整结果。

例如在使用 CALCULATE 函数时，DAX 会在现有的 Filter context 基础上修改或添加筛选条件，进而影响度量值的计算。

DAX 中的一些函数(如 EARLIER 函数)会在 Row context 和 Filter context 之间进行转换。

## DAX 表达式

### 变量

在编写 DAX 表达式时，使用变量可以避免重复书写相同的表达式，并大大提高代码的可读性。例如：

```text
VAR TotalSales = SUM( Sales[SalesAmount] )
VAR TotalCosts = SUM( Sales[TotalProductCost] )
VAR GrossMargin = TotalSales - TotalCosts
RETURN
  GrossMargin / TotalSales
```

变量由 `VAR` 关键字定义。在定义了一个变量之后，需要提供一条 `RETURN` 语句来定义表达式的结果值。还可以一次定义多个变量，这些变量属于定义它们的表达式的局部变量。

在表达式中定义的变量不能在表达式自身之外使用。也就是说表达式中不存在全局变量这意味着你不能定义适用于整个模型的变量。

变量使用 Lazy 计算，即假设你定义了一个变量，无论出于什么原因如果没有被使用，那么这个变量将永远不会被计算。如果需要计算，那么计算只会发生一次一后续对变量的调用都将读取先前计算出的值。

因此当多次使用复杂的表达式时，定义变量也可以作为一种优化技术。

### 聚合函数

<table>
  <thead>
    <tr>
      <th><strong>函数</strong></th>
      <th><strong>解释</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/approximate-distinctcount-function-dax" target="_blank"><strong>APPROXIMATEDISTINCTCOUNT</strong></a>
      </td>
      <td>返回列中唯一值的估计值。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/average-function-dax" target="_blank"><strong>AVERAGE</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/averagea-function-dax" target="_blank"><strong>AVERAGEA</strong></a>
      </td>
      <td>返回一列中所有数字的算术平均值，后者能够处理文本和非数字值。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/count-function-dax" target="_blank"><strong>COUNT</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/counta-function-dax" target="_blank"><strong>COUNTA</strong></a>
      </td>
      <td>计算指定列中包含非空值的行数，后者能够处理文本和非数字值。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/countblank-function-dax" target="_blank"><strong>COUNTBLANK</strong></a>
      </td>
      <td>计算列中空白单元格的数量。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/countrows-function-dax" target="_blank"><strong>COUNTROWS</strong></a>
      </td>
      <td>计算指定表或表达式定义的表中的行数。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/distinctcount-function-dax" target="_blank"><strong>DISTINCTCOUNT</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/distinctcountnoblank-function-dax" target="_blank"><strong>DISTINCTCOUNTNOBLANK</strong></a>
      </td>
      <td>计算列中不同值的数量，后者不包括空白单元格。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/max-function-dax" target="_blank"><strong>MAX</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/maxa-function-dax" target="_blank"><strong>MAXA</strong></a><br>
        <a href="https://learn.microsoft.com/en-us/dax/min-function-dax" target="_blank"><strong>MIN</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/mina-function-dax" target="_blank"><strong>MINA</strong></a>
      </td>
      <td>返回一列中或两个标量表达式之间的最大/小值，后者能够处理文本和非数字值。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/product-function-dax" target="_blank"><strong>PRODUCT</strong></a>
      </td>
      <td>返回某列中数字的乘积。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/sum-function-dax" target="_blank"><strong>SUM</strong></a>
      </td>
      <td>将一列中的所有数字相加。</td>
    </tr>
  </tbody>
</table>

### 日期与时间函数

<table>
  <thead>
    <tr>
      <th>函数</th>
      <th>解释</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/calendar-function-dax" target="_blank"><strong>CALENDAR</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/calendarauto-function-dax" target="_blank"><strong>CALENDARAUTO</strong></a>
      </td>
      <td>返回一个名为“Date”的单列表，该列包含一个连续的日期集。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/date-function-dax" target="_blank"><strong>DATE</strong></a>
      </td>
      <td>返回指定的日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/datediff-function-dax" target="_blank"><strong>DATEDIFF</strong></a>
      </td>
      <td>返回两个日期之间的间隔天数。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/datevalue-function-dax" target="_blank"><strong>DATEVALUE</strong></a>
      </td>
      <td>将文本格式的日期转换为日期时间格式的日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/year-function-dax" target="_blank"><strong>YEAR</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/quarter-function-dax" target="_blank"><strong>QUARTER</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/month-function-dax" target="_blank"><strong>MONTH</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/weekday-function-dax" target="_blank"><strong>WEEKDAY</strong></a>/<br>
        <a href="https://learn.microsoft.com/en-us/dax/day-function-dax" target="_blank"><strong>DAY</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/hour-function-dax" target="_blank"><strong>HOUR</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/minute-function-dax" target="_blank"><strong>MINUTE</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/second-function-dax" target="_blank"><strong>SECOND</strong></a>
      </td>
      <td>返回月份中的年份/季度/月份/星期数/天数/小时数/分钟数/秒数。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/edate-function-dax" target="_blank"><strong>EDATE</strong></a>
      </td>
      <td>返回距离起始日期指定月数之前或之后的日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/eomonth-function-dax" target="_blank"><strong>EOMONTH</strong></a>
      </td>
      <td>返回指定月份之前或之后的最后一天。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/networkdays-function-dax" target="_blank"><strong>NETWORKDAYS</strong></a>
      </td>
      <td>返回两个日期之间的完整工作日数量。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/now-function-dax" target="_blank"><strong>NOW</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/today-function-dax" target="_blank"><strong>TODAY</strong></a>
      </td>
      <td>返回当前日期和时间。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/time-function-dax" target="_blank"><strong>TIME</strong></a>
      </td>
      <td>将给定的小时、分钟和秒数转换为日期时间格式的时间。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/timevalue-function-dax" target="_blank"><strong>TIMEVALUE</strong></a>
      </td>
      <td>将文本格式的时间转换为日期时间格式的时间。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/utcnow-function-dax" target="_blank"><strong>UTCNOW</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/utctoday-function-dax" target="_blank"><strong>UTCTODAY</strong></a>
      </td>
      <td>返回当前 UTC 日期和时间。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/weeknum-function-dax" target="_blank"><strong>WEEKNUM</strong></a>
      </td>
      <td>根据返回类型的值，返回给定日期和年份的周数。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/yearfrac-function-dax" target="_blank"><strong>YEARFRAC</strong></a>
      </td>
      <td>计算两个日期之间的完整天数所代表的年份的分数。</td>
    </tr>
  </tbody>
</table>

### 过滤函数

<table>
  <thead>
    <tr>
      <th>函数</th>
      <th>解释</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/all-function-dax" target="_blank"><strong>ALL</strong></a>
      </td>
      <td>返回表中的所有行或者列中的所有值，忽略可能已应用的任何筛选条件。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/allcrossfiltered-function-dax" target="_blank"><strong>ALLCROSSFILTERED</strong></a>
      </td>
      <td>清除应用于表的所有筛选条件。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/allexcept-function-dax" target="_blank"><strong>ALLEXCEPT</strong></a>
      </td>
      <td>删除表中的所有 Context，除了应用于指定列的筛选条件。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/allnoblankrow-function-dax" target="_blank"><strong>ALLNOBLANKROW</strong></a>
      </td>
      <td>返回所有行或者返回列中所有不同的值(不包括空行)，并忽略可能存在的任何 Context。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/allselected-function-dax" target="_blank"><strong>ALLSELECTED</strong></a>
      </td>
      <td>从当前查询中的列和行中删除 Filter Context，同时保留所有其他 Filter Context 或者 Power View 中的筛选条件。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/calculate-function-dax" target="_blank"><strong>CALCULATE</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/calculatetable-function-dax" target="_blank"><strong>CALCULATETABLE</strong></a>
      </td>
      <td>在修改的 Filter Context 中计算表达式/表表达式。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/earlier-function-dax" target="_blank"><strong>EARLIER</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/earliest-function-dax" target="_blank"><strong>EARLIEST</strong></a>
      </td>
      <td>返回在外部评估过程中指定列的当前值。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/filter-function-dax" target="_blank"><strong>FILTER</strong></a>
      </td>
      <td>返回一个表示另一个表或表达式子集的表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/first-function-dax" target="_blank"><strong>FIRST</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/last-function-dax" target="_blank"><strong>LAST</strong></a>
      </td>
      <td>仅用于视觉计算，从 Axis 的第一行/最后一行中检索视觉矩阵中的一个值。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/index-function-dax" target="_blank"><strong>INDEX</strong></a>
      </td>
      <td>返回指定分区内按指定顺序或指定 Axis 排序的绝对位置指定的行。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/keepfilters-function-dax" target="_blank"><strong>KEEPFILTERS</strong></a>
      </td>
      <td>修改在评估 CALCULATE 或 CALCULATETABLE 函数时应用筛选条件的方式。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/lookupvalue-function-dax" target="_blank"><strong>LOOKUPVALUE</strong></a>
      </td>
      <td>返回符合所有指定搜索条件的行的值，该函数可以应用一个或多个搜索条件。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/matchby-function-dax" target="_blank"><strong>MATCHBY</strong></a>
      </td>
      <td>在窗口函数中定义用于确定如何匹配数据并识别“当前行”的列。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/movingaverage-function-dax" target="_blank"><strong>MOVINGAVERAGE</strong></a>
      </td>
      <td>返回在给定 Axis 上计算的移动平均值。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/previous-function-dax" target="_blank"><strong>PREVIOUS</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/next-function-dax" target="_blank"><strong>NEXT</strong></a>
      </td>
      <td>仅用于视觉计算，从视觉矩阵中 Axis 的前一行/下一行中检索一个值。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/offset-function-dax" target="_blank"><strong>OFFSET</strong></a>
      </td>
      <td>返回一个单行，该行位于同一表中的“当前行”之前或之后，由给定的偏移量决定。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/orderby-function-dax" target="_blank"><strong>ORDERBY</strong></a>
      </td>
      <td>定义窗口函数的每个分区中的排序顺序列。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/partitionby-function-dax" target="_blank"><strong>PARTITIONBY</strong></a>
      </td>
      <td>定义用于分区窗口函数的`relation`参数的列。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/range-function-dax" target="_blank"><strong>RANGE</strong></a>
      </td>
      <td>返回相对于当前行的给定 Axis 中的行间隔。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/rank-function-dax" target="_blank"><strong>RANK</strong></a>
      </td>
      <td>返回给定间隔内行的排名。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/removefilters-function-dax" target="_blank"><strong>REMOVEFILTERS</strong></a>
      </td>
      <td>清除指定表或列上的筛选条件。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/rownumber-function-dax" target="_blank"><strong>ROWNUMBER</strong></a>
      </td>
      <td>返回给定间隔内行的唯一排名。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/runningsum-function-dax" target="_blank"><strong>RUNNINGSUM</strong></a>
      </td>
      <td>返回在给定 Axis 上计算的运行总和。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/selectedvalue-function-dax" target="_blank"><strong>SELECTEDVALUE</strong></a>
      </td>
      <td>当列名的 Context 被过滤为只有一个不同的值时返回该值，否则返回替代结果。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/window-function-dax" target="_blank"><strong>WINDOW</strong></a>
      </td>
      <td>返回多个行，这些行位于给定的间隔内。</td>
    </tr>
  </tbody>
</table>

### 表函数

<table>
  <thead>
    <tr>
      <th>函数</th>
      <th>解释</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/addcolumns-function-dax" target="_blank"><strong>ADDCOLUMNS</strong></a>
      </td>
      <td>将计算列添加到给定的表或表表达式。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/addmissingitems-function-dax" target="_blank"><strong>ADDMISSINGITEMS</strong></a>
      </td>
      <td>将多个列的组合项添加到表中，如果这些组合项尚不存在。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/crossjoin-function-dax" target="_blank"><strong>CROSSJOIN</strong></a>
      </td>
      <td>返回一个表，其中包含所有表的笛卡尔积。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/currentgroup-function-dax" target="_blank"><strong>CURRENTGROUP</strong></a>
      </td>
      <td>返回 GROUPBY 表达式中表参数的行集。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/datatable-function-dax" target="_blank"><strong>DATATABLE</strong></a>
      </td>
      <td>提供声明内联数据值集合的机制。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/detailrows-function-dax" target="_blank"><strong>DETAILROWS</strong></a>
      </td>
      <td>评估为度量值定义的详细行表达式并返回数据。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/distinct-function-dax" target="_blank"><strong>DISTINCT column</strong></a>
      </td>
      <td>返回包含指定列的不同值的单列表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/distinct-table-function-dax" target="_blank"><strong>DISTINCT table</strong></a>
      </td>
      <td>返回通过从另一个表或表达式中删除重复行得到的表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/except-function-dax" target="_blank"><strong>EXCEPT</strong></a>
      </td>
      <td>返回在一个表中存在而另一个表中不存在的行。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/filters-function-dax" target="_blank"><strong>FILTERS</strong></a>
      </td>
      <td>返回直接应用为<code class="language-plaintext highlighter-rouge">columnName</code>filters 的值的表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/generate-function-dax" target="_blank"><strong>GENERATE</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/generateall-function-dax" target="_blank"><strong>GENERATEALL</strong></a>
      </td>
      <td>返回一个表，该表是 <em>table1</em> 中每一行与评估 <em>table2</em> 结果的笛卡尔积，且结果是在 <em>table1</em> 的当前 Row Countext 中评估的。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/generateseries-function-dax" target="_blank"><strong>GENERATESERIES</strong></a>
      </td>
      <td>返回一个包含算术序列值的单列表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/groupby-function-dax" target="_blank"><strong>GROUPBY</strong></a>
      </td>
      <td>与 SUMMARIZE 函数类似，GROUPBY 不会为其添加的任何扩展列执行隐式 CALCULATE。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/ignore-function-dax" target="_blank"><strong>IGNORE</strong></a>
      </td>
      <td>通过省略特定表达式来修改 SUMMARIZECOLUMNS，使其不执行 BLANK/NULL 评估。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/intersect-function-dax" target="_blank"><strong>INTERSECT</strong></a>
      </td>
      <td>返回两表的行交集，保留重复项。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/naturalinnerjoin-function-dax" target="_blank"><strong>NATURALINNERJOIN</strong></a>
      </td>
      <td>对表与另一表进行内连接。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/naturalleftouterjoin-function-dax" target="_blank"><strong>NATURALLEFTOUTERJOIN</strong></a>
      </td>
      <td>对左表和右表执行连接。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/rollup-function-dax" target="_blank"><strong>ROLLUP</strong></a>
      </td>
      <td>通过在 groupBy_columnName 参数定义的列上添加汇总行来修改 SUMMARIZE 的行为。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/rollupaddissubtotal-function-dax" target="_blank"><strong>ROLLUPADDISSUBTOTAL</strong></a>
      </td>
      <td>通过在 groupBy_columnName 列上添加汇总/小计行来修改 SUMMARIZECOLUMNS 的行为。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/rollupissubtotal-function-dax" target="_blank"><strong>ROLLUPISSUBTOTAL</strong></a>
      </td>
      <td>将 ROLLUPADDISSUBTOTAL 添加的列与 ROLLUP 组配对，位于 ADDMISSINGITEMS 表达式中。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/rollupgroup-function-dax" target="_blank"><strong>ROLLUPGROUP</strong></a>
      </td>
      <td>通过在 groupBy_columnName 参数定义的列上添加汇总行来修改 SUMMARIZE 和 SUMMARIZECOLUMNS 的行为。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/row-function-dax" target="_blank"><strong>ROW</strong></a>
      </td>
      <td>返回一个包含表达式结果的单行表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/selectcolumns-function-dax" target="_blank"><strong>SELECTCOLUMNS</strong></a>
      </td>
      <td>将计算列添加到给定的表或表表达式。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/substitutewithindex-function-dax" target="_blank"><strong>SUBSTITUTEWITHINDEX</strong></a>
      </td>
      <td>返回表示两个表左半连接的表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/summarize-function-dax" target="_blank"><strong>SUMMARIZE</strong></a>
      </td>
      <td>返回请求的总计的汇总表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/summarizecolumns-function-dax" target="_blank"><strong>SUMMARIZECOLUMNS</strong></a>
      </td>
      <td>返回一组分组的汇总表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/table-constructor" target="_blank"><strong>Table Constructor</strong></a>
      </td>
      <td>返回一个包含一列或多列的表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/topn-function-dax" target="_blank"><strong>TOPN</strong></a>
      </td>
      <td>返回指定表的前 N 行。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/treatas-function-dax" target="_blank"><strong>TREATAS</strong></a>
      </td>
      <td>将表表达式的结果应用为对不相关表的列的 filters。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/union-function-dax" target="_blank"><strong>UNION</strong></a>
      </td>
      <td>创建一个由两个表组成的联合表。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/values-function-dax" target="_blank"><strong>VALUES</strong></a>
      </td>
      <td>返回一个包含指定表或列的不同值的单列表。</td>
    </tr>
  </tbody>
</table>

### 文本函数

<table>
  <thead>
    <tr>
      <th>函数</th>
      <th>解释</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/combinevalues-function-dax" target="_blank"><strong>COMBINEVALUES</strong></a>
      </td>
      <td>将两个或多个文本字符串合并成一个文本字符串。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/concatenate-function-dax" target="_blank"><strong>CONCATENATE</strong></a>
      </td>
      <td>将两个文本字符串合并成一个文本字符串。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/concatenatex-function-dax" target="_blank"><strong>CONCATENATEX</strong></a>
      </td>
      <td>将表达式在表中每行的结果连接起来。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/exact-function-dax" target="_blank"><strong>EXACT</strong></a>
      </td>
      <td>比较两个文本字符串，如果完全相同返回 <code class="language-plaintext highlighter-rouge">TRUE</code>，否则返回 <code class="language-plaintext highlighter-rouge">FALSE</code>。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/find-function-dax" target="_blank"><strong>FIND</strong></a>
      </td>
      <td>返回一个文本字符串在另一个文本字符串中的起始位置。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/fixed-function-dax" target="_blank"><strong>FIXED</strong></a>
      </td>
      <td>将数字四舍五入到指定的小数位数，并返回结果作为文本。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/format-function-dax" target="_blank"><strong>FORMAT</strong></a>
      </td>
      <td>根据指定的格式将值转换为文本。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/left-function-dax" target="_blank"><strong>LEFT</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/right-function-dax" target="_blank"><strong>RIGHT</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/mid-function-dax" target="_blank"><strong>MID</strong></a>
      </td>
      <td>从文本字符串的开始/结尾/指定位置处返回指定数量的字符。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/len-function-dax" target="_blank"><strong>LEN</strong></a>
      </td>
      <td>返回文本字符串中的字符数。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/upper-function-dax" target="_blank"><strong>UPPER</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/lower-function-dax" target="_blank"><strong>LOWER</strong></a>
      </td>
      <td>将文本字符串中的所有字母转换为大/小写字母。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/replace-function-dax" target="_blank"><strong>REPLACE</strong></a>
      </td>
      <td>根据指定的字符数，将文本字符串的部分替换为其他文本字符串。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/rept-function-dax" target="_blank"><strong>REPT</strong></a>
      </td>
      <td>将文本重复指定的次数。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/search-function-dax" target="_blank"><strong>SEARCH</strong></a>
      </td>
      <td>返回在从左到右的方向中，第一个找到特定字符或文本字符串的字符位置。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/substitute-function-dax" target="_blank"><strong>SUBSTITUTE</strong></a>
      </td>
      <td>在文本字符串中将现有文本替换为新的文本。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/trim-function-dax" target="_blank"><strong>TRIM</strong></a>
      </td>
      <td>移除文本中的所有空格，保留单词之间的单个空格。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/unichar-function-dax" target="_blank"><strong>UNICHAR</strong></a>
      </td>
      <td>返回由数字值引用的 Unicode 字符。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/unicode-function-dax" target="_blank"><strong>UNICODE</strong></a>
      </td>
      <td>返回文本字符串第一个字符的数字代码。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/value-function-dax" target="_blank"><strong>VALUE</strong></a>
      </td>
      <td>将表示数字的文本字符串转换为数字。</td>
    </tr>
  </tbody>
</table>

### 时间智能函数

<table>
  <thead>
    <tr>
      <th>函数</th>
      <th>解释</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/closingbalanceyear-function-dax" target="_blank"><strong>CLOSINGBALANCEYEAR</strong></a> /<br>
        <a href="https://learn.microsoft.com/en-us/dax/closingbalancequarter-function-dax" target="_blank"><strong>CLOSINGBALANCEQUARTER</strong></a> /<br>
        <a href="https://learn.microsoft.com/en-us/dax/closingbalancemonth-function-dax" target="_blank"><strong>CLOSINGBALANCEMONTH</strong></a>
      </td>
      <td>计算当前 Context 中每年/每季度/每月的最后日期的表达式。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/dateadd-function-dax" target="_blank"><strong>DATEADD</strong></a>
      </td>
      <td>返回一个表格，包含一个日期列，日期根据当前 Context 中的日期按指定的间隔向前或向后移动。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/datesbetween-function-dax" target="_blank"><strong>DATESBETWEEN</strong></a>
      </td>
      <td>返回一个表格，包含一个日期列，开始于指定的起始日期，直到指定的结束日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/datesinperiod-function-dax" target="_blank"><strong>DATESINPERIOD</strong></a>
      </td>
      <td>返回一个表格，包含一个日期列，开始于指定的起始日期，并持续指定数量和类型的日期间隔。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/datesytd-function-dax" target="_blank"><strong>DATESYTD</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/datesqtd-function-dax" target="_blank"><strong>DATESQTD</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/datesmtd-function-dax" target="_blank"><strong>DATESMTD</strong></a>
      </td>
      <td>返回一个表格，包含当前 Context 中年度/季度/月度至今的日期列。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/endofyear-function-dax" target="_blank"><strong>ENDOFYEAR</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/endofquarter-function-dax" target="_blank"><strong>ENDOFQUARTER</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/endofmonth-function-dax" target="_blank"><strong>ENDOFMONTH</strong></a>
      </td>
      <td>返回当前 Context 中指定日期列的年份/季度/月度的最后日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/firstdate-function-dax" target="_blank"><strong>FIRSTDATE</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/lastdate-function-dax" target="_blank"><strong>LASTDATE</strong></a>
      </td>
      <td>返回当前 Context 中指定日期列的第一个/最后一个日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/nextyear-function-dax" target="_blank"><strong>NEXTYEAR</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/nextquarter-function-dax" target="_blank"><strong>NEXTQUARTER</strong></a> /<br>
        <a href="https://learn.microsoft.com/en-us/dax/nextmonth-function-dax" target="_blank"><strong>NEXTMONTH</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/nextday-function-dax" target="_blank"><strong>NEXTDAY</strong></a>
      </td>
      <td>返回一个表格，包含基于当前 Context 中日期列中指定日期的下一年/季度/月/天的所有日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/openingbalanceyear-function-dax" target="_blank"><strong>OPENINGBALANCEYEAR</strong></a> /<br>
        <a href="https://learn.microsoft.com/en-us/dax/openingbalancequarter-function-dax" target="_blank"><strong>OPENINGBALANCEQUARTER</strong></a> /<br>
        <a href="https://learn.microsoft.com/en-us/dax/openingbalancemonth-function-dax" target="_blank"><strong>OPENINGBALANCEMONTH</strong></a>
      </td>
      <td>计算当前 Context 中每年/季度/月的第一日期的表达式。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/parallelperiod-function-dax" target="_blank"><strong>PARALLELPERIOD</strong></a>
      </td>
      <td>返回一个表格，包含一个日期列，表示与指定日期列中日期平行的期间，日期可以根据指定的时间间隔向前或向后移动。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/previousyear-function-dax" target="_blank"><strong>PREVIOUSYEAR</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/previousquarter-function-dax" target="_blank"><strong>PREVIOUSQUARTER</strong></a> /<br>
        <a href="https://learn.microsoft.com/en-us/dax/previousmonth-function-dax" target="_blank"><strong>PREVIOUSMONTH</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/previousday-function-dax" target="_blank"><strong>PREVIOUSDAY</strong></a>
      </td>
      <td>返回一个表格，包含基于当前 Context 中日期列中指定日期的上一年/季度/月/天的所有日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/sameperiodlastyear-function-dax" target="_blank"><strong>SAMEPERIODLASTYEAR</strong></a>
      </td>
      <td>返回一个表格，包含基于指定日期列中日期的前一年相同期间的日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/startofyear-function-dax" target="_blank"><strong>STARTOFYEAR</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/startofquarter-function-dax" target="_blank"><strong>STARTOFQUARTER</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/startofmonth-function-dax" target="_blank"><strong>STARTOFMONTH</strong></a>
      </td>
      <td>返回当前 Context 中指定日期列的年份/季度/月份的第一日期。</td>
    </tr>
    <tr>
      <td>
        <a href="https://learn.microsoft.com/en-us/dax/totalytd-function-dax" target="_blank"><strong>TOTALYTD</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/totalqtd-function-dax" target="_blank"><strong>TOTALQTD</strong></a> /
        <a href="https://learn.microsoft.com/en-us/dax/totalmtd-function-dax" target="_blank"><strong>TOTALMTD</strong></a>
      </td>
      <td>计算当前 Context 中的年度/季度/月份至今的表达式的值。</td>
    </tr>
  </tbody>
</table>
