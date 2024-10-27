---
title: "概率论基础(1) 随机事件与概率"
permalink: "/概率论基础(1)-随机事件与概率.html"
tags:
  - 统计学
  - 概率论
author: Zhong wenxin
layout: article
katex: True
modify_date: "2024-10-05 18:18:00 +0000"
---

概率论与数理统计研究的对象是随机现象。概率论是研究随机现象的模型(即概率分布)，数理统计是研究随机现象的数据收集与处理。

<!--more-->

在一定的条件下，并不总是出现相同结果的现象称为**随机现象**(Random phenomenon)；只存在一个结果的现象称为**确定性现象**(Deterministic phenomenon)；对在相同的条件下，以重复的随机现象的观察、记录和实验的研究称为**随机试验**(Random trial)。慨率论与数理统计主要研究能大量重复的随机现象和随机试验，但也十分注意研究不能重复的随机现象。

概率(Probability)是随机现象的**不确定性**的一种度量，概率模型就是对随机现象的数学描述。

## 随机事件与概率

### 样本空间与随机事件

样本点是抽样(Sample)的最基本单元，认识随机现象首先要列出它的样本空间。

<details class="details-definition" markdown="1" open>
<summary>样本空间和样本点</summary>
随机现象的一切可能基本结果组成的集合称为样本空间(Sample space)，记为 ${\mit\Omega}=\{\omega\}$，其中 $\omega$ 表示基本结果，称为样本点(Sample point)。
</details>

将样本点的个数为有限个或可列的情况归为一类，称为**离散样本空间**(Discrete sample space)；而将样本点的个数为不可列无限个的情况归为另一类，称为**连续样本空间**(Continuous sample space)。

<div class="box-warning" markdown="1">
<strong>例 $1$</strong> 在研究英文字母的使用情况时，则可能出现的结果为 $A,B,\cdots,Z$和空格“$\lfloor\;\rceil$”，将样本空间选定为 ${\mit\Omega}=\\{\text{空格}, A,B,\cdots,Z\\}$ 是合适的，它是一个离散的样本空间；
</div>

<div class="box-warning" markdown="1">
<strong>例 $2$</strong> 考察一晶体管的寿命，用变量 $t$ 来表示晶体管开始工作到首次发生故障的时间，那么“晶体管寿命”的样本空间就是所有的非负实数 ${\mit\Omega}=\\{ t\mid t\geqslant0\\}$，它是一个连续的样本空间。
</div>

在确定样本空间的时候，不同的试验结果必须是**相互排斥的**，即在试验过程中只能产生**唯一**的一个结果。需要注意的是随机现象的样本空间要包含**至少两个样本点**，若将确定性现象也一并考虑，那么仅含有一个样本点的样本空间对应的确定性现象。

<details class="details-definition" markdown="1" open>
<summary>随机事件</summary>
样本空间的一个子集称作随机事件，简称事件(Event)，通常用大写的英文字母 $A,B,C,\cdots$ 表示。
</details>

例如掷骰子所出现点数的样本空间为 ${\mit\Omega}=\\{1,2,3,4,5,6\\}$，可以定义集合 $\\{1,3,5\\}$ 为事件“掷到奇数点”，定义集合 $\\{4,5,6\\}$ 为事件“掷到的点数大于 3”……

当子集 $A$ 中某个样本点出现了，就说事件 $A$ 发生了，或者说：

<details class="details-proposition" markdown="1" open>
<summary>命题 $1$</summary>
事件 $A$ 发生当且仅当 $A$ 中某个样本点出现了。
</details>

由样本空间 $\mit\Omega$ 中的**单个元素**组成的子集称为**基本事件**(Elementary event)，而样本空间 $\mit\Omega$ 的最大子集(即 $\mit\Omega$ 本身)称为**必然事件**(Certain event)，样本空间 $\mit\Omega$ 的最小子集(即空集 $\varnothing$)称为**不可能事件**(Impossible event)。

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/sample_space.png" alt="sample space" style="width: 500px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $1$: 样本空间、样本点与随机事件</p>
</div>

### 联合样本空间

同一个随机现象，由于研究的“侧重点”不同，通常会定义不同的样本空间，这些“侧重点”就是我们研究随机现象所包含的**指标**(Indicator)、**维度**(Dimension)或者**因子**(Factor)，**不同维度(指标或者因子)本质上描述还是同一个随机现象**。

比如要研究“某城市的交通事故”，如果研究的侧重点在于“交通事故的严重程度”，那么样本空间就为 ${\mit\Omega}_1=\\{\text{轻微碰撞},\text{重度碰撞},\text{严重碰撞}\\}$；如果研究的侧重点在于“一年中发生交通事故的次数”，那么样本空间就为 ${\mit\Omega}_2=\\{0,1,2,\cdots\\}$；比如研究的侧重点在于“交通事故发生的时间段”，那么样本空间就为 ${\mit\Omega}_3=\\{\text{凌晨},\text{早高峰},\text{中午},\text{晚高峰},\text{夜间}\\}$……**但是一旦明确了研究的“侧重点”(维度)，则样本空间就被确定下来，此时样本空间是唯一且固定的**。这意味着不能在同一个维度中使用多个样本空间，否则会导致分析上的混乱。

当然，也可以基于不同的研究维度所定义的样本空间，构建**联合样本空间**，或者称为**重构样本空间**，即将一个较大的、复杂的样本空间细化为更详细的子集来捕捉更具体的信息。比如要同时研究交通事故的严重程度和时间段，此时的样本空间则为：

$$
    {\mathit\Omega}={\mathit\Omega}_1\times{\mathit\Omega}_3=\{(\text{轻微碰撞},\text{凌晨}),(\text{严重碰撞},\text{早高峰}),\cdots\}
$$

其中每个样本点是一个**二元组**，包含了交通事故的严重程度和时间段；${\mit\Omega}_1\times{\mit\Omega}_3$ 为两个集合的**Descartes 集**。

重构样本空间是对样本空间的不同层次的描述，但这并没有改变样本空间的唯一性，只是对它进行了更细致的表述，以适应不同的分析需要。选择样本空间时，重要的是要确保它**包含所有可能的结果**。同一个随机现象，不同样本空间的选择往往意味着对问题的不同维度的不同描述。一旦确定了样本空间，所有事件和概率计算必须基于该样本空间进行，不能在同一维度中混用多个样本空间来描述同一个随机现象。

### 事件间的关系与运算

下面的讨论总是假设事件 $A$ 与 $B$ 在**同一个样本空间** ${\mit\Omega}$ 中进行(即同一个随机现象)，一般使用 Venn 图来表示事件间的关系与运算。事件间的关系与集合间的关系一样，主要有以下几种：

<ol>
    <li>
        包含关系：如果属于 $A$ 的样本点必属于 $B$，则称 $A$ 被包含在 $B$ 中，或称 $B$ 包含 $A$，记为 $A\subset B$，或 $B\supset A$。用概率论的语言说：事件 $A$ 发生必然导致事件 $B$ 发生。对于任一事件 $A$，必有 $\boldsymbol{\varnothing\subset A\subset{\mit\Omega}}$；
    </li>
    <li>
        相等关系：如果事件 $A$ 与事件 $B$ 满足：属于 $A$ 的样本点必属于 $B$，而且属于 $B$ 的样本点必属于 $A$，即 $\boldsymbol{A\subset B}$ <strong>且</strong> $\boldsymbol{B\supset A}$，则称事件 $A$ 与 $B$ 相等，记为 $A=B$。从集合论观点看，两个事件相等就意味着这两事件是<strong>同一个集合</strong>；
    </li>
    <li>
        互不相容关系：如果 $A$ 与 $B$ <strong>没有相同的样本点</strong>，则称 $A$ 与 $B$ 互不相容。用概率论的语言说：$A$ 与 $B$ 互不相容就是<strong>事件</strong>$\boldsymbol{A}$ <strong>与事件</strong> $\boldsymbol{B}$ <strong>不可能同时发生</strong>。
    </li>
</ol>

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/including.png" alt="A\subset B" style="width: 300px;">
       <figcaption>(a) $A\subset B$</figcaption>
     </figure>
     <figure style="text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/incompatibility.png" alt="A 与 B 互不相容" style="width: 300px;">
       <figcaption>(b) $A$ 与 $B$ 互不相容</figcaption>
     </figure>
   </div>
   <p style="margin-top: 0;">图 $2$: 事件间的关系</p>
</div>

事件的运算与集合的运算相当，有并、交、差和余四种运算。

<ol>
    <li>
        事件 $A$ 与 $B$ 的差：记为 $A-B$，也可以记作 $A\bar{B}$。其含义为“由在事件 $A$ 中而不在 $B$ 中的样本点组成的新事件”，或用概率论的语言说“事件 $A$ 发生而 $B$ 不发生；
        <div style="text-align: center;">
           <div style="display: flex; justify-content: center;">
             <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
               <img src="/assets/images/picture/event_and_probabity/difference.png" alt="A-B" style="width: 300px;">
               <figcaption>(a) $A-B$</figcaption>
             </figure>
             <figure style="text-align: center; margin-bottom: 0;">
               <img src="/assets/images/picture/event_and_probabity/difference(including).png" alt="A-B(including)" style="width: 300px;">
               <figcaption>(b) $A-B(A\supset B)$</figcaption>
             </figure>
           </div>
           <p style="margin-top: 0;">图 $3$: 事件的差集运算</p>
        </div>
    </li>
    <li>
        事件 $A$ 与 $B$ 的并：记为 $A\cup B$，也可以记作 $A+B$。其含义为“由事件 $A$ 与 $B$ 中所有的样本点(相同的只计一次)组成的新事件”，或用概率论的语言说“事件 $A$ 与 $B$ 中<strong>至少有一个发生</strong>”；
    </li>
    <li>
        事件 $A$ 与 $B$ 的交：记为 $A\cap B$，或简记为 $AB$。其含义为“由事件 $A$ 与 $B$ 中公共的样本点组成的新事件”，或用概率论的语言说“事件 $A$ 与 $B$ <strong>同时发生</strong>”；
    </li>
    <li>
        对立事件(余集)：将事件 $A$ 的对立事件记为 $\bar{A}$，即“由在 $\mit\Omega$ 中而不在 $A$ 中的样本点组成的新事件”，或用概率论的语言说“$A$ 不发生”，即 $\bar{A}={\mit\Omega}-A$。
    </li>
</ol>

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 0px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/cup.png" alt="A\cup B" style="width: 300px;">
       <figcaption>(a) $A\cup B$</figcaption>
     </figure>
     <figure style="text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/cap.png" alt="A\cap B" style="width: 300px;">
       <figcaption>(b) $A-B(A\supset B)$</figcaption>
     </figure>
     <figure style="text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/oppose.png" alt="oppose" style="width: 300px;">
       <figcaption>(b) $A$ 的对立事件 $\bar{A}$</figcaption>
     </figure>
   </div>
   <p style="margin-top: 0;">图 $4$: 事件的交、并与余集运算</p>
</div>

注意，对立事件是相互的，即 $A$ 的对立事件是 $\bar{A}$，而 $\bar{A}$ 的对立事件是 $A$，即 $\bar{\bar{A}}=A$。**必然事件** ${\mit\Omega}$ **与不可能事件** $\boldsymbol{\varnothing}$ **互为对立事件**，即 $\bar{\mit\Omega}=\varnothing$，$\bar{\varnothing}={\mit\Omega}$。

<details class="details-proposition" markdown="1" open>
<summary>命题 $2$</summary>
$A$ 与 $B$ 互为对立事件的充分必要条件是：$A\cap B=\varnothing$，并且 $A\cup B={\mit\Omega}$。
</details>

命题 $2$ 也可作为对立事件的另一种定义，即如果事件 $A$ 与 $B$ 满足：$A\cap B=\varnothing$，且 $A\cup B={\mit\Omega}$，则称 $A$ 与 $B$ 互为对立事件，记为 $\bar{A}=B$，$\bar{B}=A$。

> 对立事件一定是互不相容事件，即 $A\cap\bar{A}=\varnothing$，但是互不相容事件不一定是对立事件。
> {: .prompt-tip}

### 事件运算的性质

<ol>
    <li>
        交换律：
        $$
        \begin{equation}
            A\cup B=B\cup A, \quad AB=BA
        \end{equation}
        $$
    </li>
    <li>
        结合律：
        $$
        \begin{equation}
            A\cup(B\cup C)=(A\cup B)\cup C, \quad A(BC)=(AB)C
        \end{equation}
        $$
    </li>
    <li>
        分配律：
        $$
        \begin{equation}
            (A\cup B)\cap C=AC \cup BC, \quad (A\cap B)\cup C=(A\cup C)\cap(B\cup C)
        \end{equation}
        $$
    </li>
    <li>
        De Morgan公式：
        $$
        \begin{equation}
            \overline{A\cup B}=\bar{A} \cap \bar{B},\quad \overline{A\cap B}=\bar{A} \cup \bar{B}
        \end{equation}
        $$
    </li>
</ol>

De Morgan 公式可推广至 $n$ 个事件以及可列个事件的情况：

$$
\begin{equation}
    \overline{\bigcup_{i=1}^{n}A_i}=\bigcap_{i=1}^{n}\bar{A}_i,\quad \overline{\bigcap_{i=1}^{n}A_i}=\bigcup_{i=1}^{n}\bar{A}_i
\end{equation}
$$

$$
\begin{equation}
    \overline{\bigcup_{i=1}^{\infty}A_i}=\bigcap_{i=1}^{\infty}\bar{A}_i,\quad \overline{\bigcap_{i=1}^{\infty}A_i}=\bigcup_{i=1}^{\infty}\bar{A}_i
\end{equation}
$$

### 概率的公理化

概率的**公理化定义**(Axiomatic definition of probability)是概率论发展的一个重要里程碑，它奠定了**现代概率论**的基础，彻底改变了过去基于经验和直觉的概率观念。

18 世纪早期，Jacob Bernoulli 在古典概率论中，将概率定义为

$$
\begin{equation}
    P(A)=\frac{\text{有利结果数}}{\text{总结果数}}
\end{equation}
$$

尽管这一定义在简单场景中有效，但它依赖于**等可能性**的假设，在更多复杂场景下无法推广。这一时期的概率论主要围绕着**有限样本空间的等可能事件**展开。

18 世纪晚期至 19 世纪，频率学派的概率观开始取代古典定义。Richard von Mises 等人将将概率定义为某一事件在大量重复试验中发生的**相对频率**，即

$$
\begin{equation}
    P(A)=\lim_{n\to\infty}\frac{n_A}{n}
\end{equation}
$$

其中，$n_A$ 是事件 $A$ 发生的次数，$n$ 是试验的总次数。这一方法突破了古典定义在非等可能情境中的局限性，但也面临一些哲学上的争议，特别是在如何定义“**无限次重复**”时遇到了困难。

与频率学派同时期，Bayes 提出了基于先验知识更新概率的概念，即贝叶斯定理。贝叶斯学派强调概率是对某一随机现象的**主观信念程度**，主张通过**已知证据**(即已经发生的事件的信息)来更新这一信念：

$$
\begin{equation}
    P(A\mid B)=\frac{P(A)P(B\mid A)}{P(B)}
\end{equation}
$$

Bayes 学派认为概率不一定源自重复试验，而是基于观察归纳和对先验知识的修正。

1900 年 Hilbert 提出要建立概率的公理化定义以解决这个问题，即**以最少的几条本质特性出发去刻画概率的概念**。1933 年 Kolmogorov 首次提出了**基于集合论和测度论**的公理化概率定义，标志着概率论进入现代阶段。这个定义既概括了历史上几种概率定义中的共同特性，又避免了各自的局限性和含混之处。**不管什么随机现象，只有满足该定义中的三条公理，才能说它是概率**。

Kolmogorov 的公理化体系使用了集合论的语言，将概率视为对一个集合(样本空间)的子集赋予的**测度**。他提出的三条公理已经形成了现代概率论的基础。

但在这之前，我们必须首先明确哪些集合可以被称为“事件”，并且构造一个包含在样本空间的“事件集合”。直觉上我们所构造的集合应该对事件的各种运算(即余集、交集和并集)封闭，并且样本空间 ${\mit\Omega}$ 本身和它的余集 $\varnothing$ 都应该在这个“事件集合”中。

<details class="details-definition" markdown="1" open>
<summary>事件域</summary>
设 ${\mit\Omega}$ 为一个样本空间，$\mathscr{F}$ 是 ${\mit\Omega}$ 的子集所组成的集合类。若 $\mathscr{F}$ 满足：
<ol>
    <li>${\mit\Omega}\in\mathscr{F}$；</li>
    <li>若 $A\in\mathscr{F}$，则对立事件 $\bar{A}\in\mathscr{F}$；</li>
    <li>若 $A_1,A_2,\cdots,A_n,\cdots\in\mathscr{F}$，则可列并 $\bigcup\limits_{i=1}^{\infty}A_i\in\mathscr{F}$。</li>
</ol>
则称 $\mathscr{F}$ 是一个事件域，或者 $\sigma-\text{域}$ 或者 $\sigma\ -$ 代数。
</details>

在概率论中，称 $({\mit\Omega},\mathscr{F})$ 为**可测空间**(Measurable space)，**在可测空间上才能定义概率**，这时 $\mathscr{F}$ 上都是有概率可言的事件。

$\sigma\ -$ 代数用于定义哪些集合可以称为“事件”，并确保可以在这些事件上合理地定义和计算概率。通过 $\sigma\ -$ 代数，我们能对各种复杂事件进行**可数次或者有限次运算**(余集、交集和并集)，并确保这些操作后的结果依然是事件，即仍然在 $\sigma\ -$ 代数中。

> 需要注意的是，在概率论中，$\sigma\ -$ 代数指的就是那些可以定义概率的事件的集合(并且满足余集和可列并封闭)。至于在其他学科中，有其他学科所赋予的内涵；并且由条件 $(2)$ 可知，$\varnothing\in\mathscr{F}$，并且 $\overline{\bigcup\limits_{i=1}^{\infty}A_i}=\bigcap\limits_{i=1}^{\infty}\bar{A}_i\in\mathscr{F}$。
> {: .prompt-warning}

一维实数轴 $\mathbb{R}$ 上的**Borel 集**是常见的 $\sigma\ -$ 代数，它是由一切有界开区间 $(a,b)$，通过至多可数次的(有限或者可数)余集运算、交集运算和并集运算得到的集合。

在实际应用中，$\sigma\ -$ 代数提供了一个框架，它被用于定义一个复杂事件系统，使其可以进行概率分析，这允许我们根据不同的应用场景定义哪些事件是可以赋予概率的。通常一个较大的集合 ${\mit\Omega}$ 可能包含无穷多个子集，而只有 $\sigma\ -$ 代数中的事件才是我们能够赋予概率的“可测事件”。不仅如此，$\sigma\ -$ 代数还为事件提供了一个良好的数学结构，还确保了我们对事件操作的一致性。由于 $\sigma\ -$ 代数对余集和可数并封闭，所以在定义事件的概率时，无论我们是直接计算事件的概率，还是通过余集或并集的方式来间接计算概率，都能够得到一致的结果。

在实际中，那些无法精确测量、描述过于复杂或超出我们观察能力的事件，通常不属于 $\sigma\ -$ 代数，因此我们无法为它们赋予概率。这些事件往往涉及无限小的区间、无穷复杂的现象或超精确的测量，在实际概率分析中无法处理，属于不可测事件。例如一个颜色的 RGB 值精确为某个特定数值、在无穷多次抛硬币结果中，硬币的正反面组成某个非常特定的无穷序列。

<details class="details-definition" markdown="1" open>
<summary>概率的公理化定义</summary>
设 $\mit\Omega$ 为一个样本空间，$\mathscr{F}$ 为 $\mit\Omega$ 上的事件域，$P(A)$ 为定义在 $\mathscr{F}$ 上的实值函数。若$P(A)$ 满足：
<ol>
   <li>非负性：$\forall A\in\mathscr{F}$，$P(A)\geqslant0$；</li>
   <li>正则性：$P({\mit\Omega})=1$；</li>
   <li>
    可列可加性：$\forall A_1,A_2,\cdots,A_n,\cdots\in\mathscr{F}$，且 $A_1,A_2,\cdots,A_n,\cdots$ 两两互不相容，则
    $$
    \begin{equation}
        P\left(\bigcup_{i=1}^{\infty}A_i\right)=\sum_{i=1}^{\infty}P(A_i)
    \end{equation}
    $$
   </li>
</ol>
则称 $P(A)$ 为事件 $A$ 的概率(Probability)。
</details>

称 $({\mit\Omega},\mathscr{F},P)$ 为**概率空间**(Probability space)，它为研究随机现象提供了一个严谨的数学框架，使我们能够合理地处理、计算和分析各种随机事件的概率。无论是处理简单的随机事件，还是处理复杂的随机变量，都可以在这个框架下进行。

> 从定义可以看出，概率 $P$ 是事件 $A$ 的实函数，并且概率 $P(A)$ 是有界的，即 $0\leqslant P(A)\leqslant1$。
> {: .prompt-tip}

这一公理化体系与**Lebesgue 测度**相结合，使得概率论的基础变得更加坚实，能够处理复杂的事件和连续概率空间问题。Kolmogorov 的公理化定义克服了以往各个学派的局限性，使得概率论从经验和直觉的框架走向了严谨的数学体系。

<details class="details-definition" markdown="1" open>
<summary>样本空间的分割</summary>
在样本空间 ${\mit\Omega}$ 中，若有 $n$ 个事件 $D_1,D_2,\cdots,D_n$，满足：
<ol>
   <li>$D_1,D_2,\cdots,D_n$ 两两互不相容；</li>
   <li>$\bigcup\limits_{i=1}^{n}D_i={\mit\Omega}$。</li>
</ol>
则称 $D_1,D_2,\cdots,D_n$ 为样本空间 ${\mit\Omega}$ 的一个分割(Division)。
</details>

可列个互不相容的事件 $D_1,D_2,\cdots,D_n,\cdots$ 若满足 $\bigcup\limits_{i=1}^{\infty}D_i={\mit\Omega}$，那么 $D_1,D_2,\cdots,D_n,\cdots$ 也可以成为样本空间 ${\mit\Omega}$ 的一个分割。

### 序贯模型

**序贯模型**(Sequential Models)通常指一类用于处理顺序数据或在数据采集过程中逐步更新模型的统计方法。其核心思想是基于当前数据点以及之前的观测数据，实时或分阶段地更新估计、推断或决策。

序贯模型的应用包括以下几个方面：

1. 对于涉及时间序列、文本序列等具有时间或顺序依赖的数据，序贯模型用来捕捉这些数据中前后顺序之间的依赖关系。例如时间序列分析、隐马尔可夫模型(Hidden Markov Model)和循环神经网络等(Recurrent neural network)；
2. 在贝叶斯框架中，序贯模型指在每个时间点或阶段逐步更新模型的参数或预测分布。即随着新数据的到来，不断使用新的证据修正先验信息形成后验，从而改进对未知参数的估计。这种更新是动态的，可以处理逐步到来的数据；
3. 在统计实验设计中，序贯模型也指根据实验过程中逐步获取的数据来动态调整实验的设计或数据采集过程。这种方法与传统的固定样本大小不同，实验者可以根据中间结果调整样本规模或停止实验。例如序贯假设检验在逐步收集样本的过程中，实时决定是否拒绝或接受假设。

许多试验本身具有序贯的特征。例如连续抛掷一枚硬币连续抛三次，或者连续观察一只股票 5 天，又或者在一个通信接收设备上接收 8 位数字。常用**序贯树形图**来刻画样本空间中的试验结果。

### 概率建模的步骤

概率论可以用来分析现实世界的许多不确定现象，这个过程通常分成两个阶段：

1. 从一个**适当的样本空间**中给出概率分布，从而建立概率模型。在这个阶段没有关于建立模型的一般规则，只要建立的概率分布符合概率公理化即可。可能有些人会怀疑所建立模型的真实性，有时人们宁愿使用“错误”的模型，其理由是“错误”的模型比“正确”的模型简单且易于处理，这种处理问题的态度在科学和工程学中很普遍。因此在实际工作中，选择的模型往往既要**准确、简单**又要兼顾**易操作性**。此外统计学家还依据历史数据和过去相似试验的结果，利用统计方法确定模型，比如贝叶斯统计；
2. 我们将在完全严格的概率模型之下进行推导，计算某些事件的概率或推导出一些十分有趣的性质，(1)的任务是**建立现实世界与数学的联系**，而(2)则是严格限制在**概率公理之下的逻辑推理**。如果涉及的计算很复杂或概率分布的陈述不简明，推理和理解就会遇到困难，但是所有的问题将会有一个准确的答案不会产生歧义，只要有足够高的能力，所有的困难都将迎刃而解。

## 概率的性质

### 概率的基本性质

设事件 $A,B$ 属于同一个样本空间 $\mit\Omega$，由概率的公理化定义容易推出概率的以下性质：

<ol>
    <li>
        不可能事件 $\varnothing$ 的概率为 $0$：即 $P(\varnothing)=0$；
<details class="details-warning" markdown="1">
<summary>证明</summary>
由于

$$
   {\mathit\Omega}={\mathit\Omega}\cup\varnothing\cup\cdots\cup\varnothing\cup\cdots
$$

由概率的可列可加性，

$$
   P({\mathit\Omega})=P({\mathit\Omega})+P(\varnothing)+\cdots+\varnothing+\cdots
$$

由于 $P({\mathit\Omega})=1$，因此

$$
   P(\varnothing)+\cdots+P(\varnothing)+\cdots=0
$$

又由于概率的非负性，于是 $P(\varnothing)=0$。

</details>
    </li>
    <li>
        有限可加性：若有 $n$ 个两两互不相容的事件 $A_1,A_2,\cdots,A_n$，则
        $$
        \begin{equation}
            P\left(\bigcup_{i=1}^{n}A_i\right)=\sum_{i=1}^{n}P(A_i)
        \end{equation}
        $$
<details class="details-warning" markdown="1">
<summary>证明</summary>
由于

$$
    A_1\cup A_2\cup\cdots\cup A_n=A_1\cup A_2\cup\cdots\cup A_n\cup\varnothing\cup\cdots\cup\varnothing\cup\cdots
$$

因此由可列可加性，有

$$
      P\left(\bigcup_{i=1}^{n}A_i\right)&=P(A_1)+P(A_2)+\cdots+P(A_n)+P(\varnothing)+\cdots+P(\varnothing)+\cdots\\
      &=P(A_1)+P(A_2)+\cdots+P(A_n)
$$

</details>
    </li>
    <li>
        对立事件的概率：对任意事件 $A$，其对立事件 $\bar{A}$ 的概率为
        $$
        \begin{equation}
            P(\bar{A})=1-P(A)
        \end{equation}
        $$
<details class="details-warning" markdown="1">
<summary>证明</summary>
根据对立事件的定义，

$$
    {\mathit\Omega}=A\cup\bar{A}\quad(\text{或者}\bar{A}={\mathit\Omega}-A)
$$

因此 $P({\mathit\Omega})=P(A)+P(\bar{A})=1$，即

$$
    P(\bar{A})=1-P(A)
$$

结论得证。

</details>
    </li>
</ol>

### 事件的差的概率

<details class="details-proposition" markdown="1" open>
<summary>命题 $4$</summary>
对于任意两个事件 $A$ 与 $B$，其差 $A-B$ 的概率为

$$
   \begin{equation}
       P(A-B)=P(A)-P(AB)
   \end{equation}
$$

</details>

<details class="details-proposition" markdown="1">
<summary>证明</summary>
由事件的结合律，有

$$
    A=A\cup(B\cap\bar{B})=AB\cup A\bar{B}=AB\cup(A-B)
$$

又由于 $AB$ 与 $A-B$ 互不相容，那么

$$
    P(A)=P(AB)+P(A-B)
$$

即 $P(A-B)=P(A)-P(AB)$，结论得证。

</details>

> 事件 $A-B$ 也可以写作 $A\bar{B}$，$P(A-B)$ 实际上计算的是 $P(A\bar{B})$ 的值。
> {: .prompt-tip}

<details class="details-warning" markdown="1" open>
<summary>推论1</summary>
对于任意两个事件 $A$ 与 $B$，若 $B\subset A$，则其差 $A-B$ 的概率为

$$
   \begin{equation}
       P(A-B)=P(A)-P(B)
   \end{equation}
$$

</details>

<details class="details-warning" markdown="1">
<summary>证明</summary>
由于 $B\subset A$，因此 $AB=B$，于是

$$
   P(A-B)=P(A)-P(B)
$$

</details>

从几何直观上看，求事件 $A-B$ (图中灰色部分)的概率只需用事件 $A$ 的“面积”减去事件 $AB$ 的“面积”：

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
      <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
         <img src="/assets/images/picture/event_and_probabity/deduct.png" alt="任意的事件A与B" style="width: 300px;">
            <figcaption>(a) 任意的事件 $A$ 与 $B$</figcaption>
            </figure>
            <figure style="text-align: center; margin-bottom: 0;">
         <img src="/assets/images/picture/event_and_probabity/difference(including).png" alt="A-B(including)" style="width: 300px;">
         <figcaption>(b) $B\subset A$</figcaption>
      </figure>
   </div>
   <p style="margin-top: 0;">图 $6$: 事件 $A-B$ 的概率的 Venn 图示意</p>
</div>

<details class="details-warning" markdown="1" open>
<summary>概率的单调性</summary>
对于任意两个事件 $A$ 与 $B$，若 $B\subset A$，则 $P(B)\leqslant P(A)$。
</details>

> 推论 2 的逆命题不成立，即若 $P(B)\leqslant P(A)$ 无法推出 $B\subset A$。
{: .prompt-danger}

### 加法公式

<details class="details-warning" markdown="1" open>
<summary>定理 $1$</summary>
对于任意的两个事件 $A$ 与 $B$，其交事件 $A\cup B$(即事件 $A$ 或 $B$ 至少发生一个) 的概率为

$$
   \begin{equation}
       P(A\cup B)=P(A)+P(B)-P(AB)
   \end{equation}
$$

</details>

<details class="details-warning" markdown="1">
<summary>证明</summary>
由于

$$
    A\cup B=A\cup(B-AB)
$$

又由于 $A\cap (B-AB)=\varnothing$，即 $A$ 与 $B-AB$ 互不相容，则由有限可加性，以及 $AB\subset B$，有

$$
    P(A\cup B)=P(A)+P(B-AB)=P(A)+P(B)-P(AB)
$$

</details>

从几何直观上看，求事件 $A\cup B$ 的概率就是把事件 $A$ 的“面积”加事件 $B$ 的“面积，但是由于多加了一次事件 $AB$ (图中蓝色部分)的面积，因此必须再额外减去：

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/add.png" alt="事件A\cup B的概率" style="width: 300px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $7$: 事件 $A\cup B$ 的概率的 Venn 图示意</p>
</div>

<details class="details-warning" markdown="1" open>
<summary>推论3</summary>
对于 $n$ 个任意事件 $A_1,A_2,\cdots,A_n$，其交事件的概率为 $\bigcup\limits_{i=1}^{n}A_i$ 的概率为

$$
   \begin{equation}
       \begin{aligned}
           P\left(\bigcup_{i=1}^{n}A_i\right)&=\sum_{i=1}^{n}P(A_i)-\sum_{1\leqslant i\leqslant j\leqslant n}P(A_iA_j)\\
           &+\sum_{1\leqslant i\leqslant j\leqslant k\leqslant n}P(A_iA_jA_k)+(-1)^{n-1}P(A_1A_2\cdots A_n)
       \end{aligned}
   \end{equation}
$$

其中一共包含 $\binom{n}{r}$ 个和项。
</details>

<details class="details-warning" markdown="1" open>
<summary>半可加性</summary>
对于任意两个事件 $A$ 与 $B$，有

$$
  \begin{equation}
      P(A\cup B)\leqslant P(A)+P(B)
  \end{equation}
$$

对于任意 $n$ 个事件 $A_1,A_2,\cdots,A_n$，有

$$
  \begin{equation}
      P\left(\bigcup_{i=1}^{n}A_i\right)\leqslant \sum_{i=1}^{n}P(A_i)
  \end{equation}
$$

</details>

## 确定概率的方法

### 频率的稳定性

确定概率的频率方法是在**大量重复试验**中，用频率的稳定值去获得概率的一种方法，其基本思想是：

<ol>
    <li>
        与考察事件 $A$ 有关的随机现象可大量重复进行。
    </li>
    <li>
        在 $n$ 次重复试验中，记 $n(A) $为事件 $A$ 出现的次数，又称 $n(A)$ 为事件 $A$ 的<strong>频数</strong>，称
        $$
           \begin{equation}
               f_n(A)=\frac{n(A)}{n}
           \end{equation}
        $$
        为事件 $A$ 出现的<strong>频率</strong>。
    </li>
    <li>
        人们的长期实践表明：随着试验重复次数 $n$ 的增加，频率 $f_n(A)$ 会稳定在某一常数 $a$ 附近，我们称这个常数为频率的稳定值，这个频率的稳定值就是我们所求的概率，这个性质被称为<strong>频率的稳定性</strong>。因此就可以用事件 $A$ 发生的频率来近似事件 $A$ 发生的概率：
        $$
           \begin{equation}
               P(A)=\lim_{n\to\infty}f_n(A)=\lim_{n\to\infty}\frac{n(A)}{n}
           \end{equation}
        $$
    </li>
</ol>

容易验证：由 $(20)$ 式定义的“概率”满足非负性与正则性；当事件 $A$ 与 $B$ 不相容时，$n(A\cup B)=n(A)+n(B)$，因此

$$
    P(A\cup B)=\lim_{n\to\infty}\frac{n(A\cup B)}{n}=\lim_{n\to\infty}\frac{n(A)}{n}+\lim_{n\to\infty}\frac{n(B)}{n}=P(A)+P(B)
$$

因此 $(20)$ 式定义的“概率”的确为可测概率。

随机现象有其偶然性的一面，也有其必然性的一面。这种必然性表现为大量试验中随机事件出现的频率的稳定性，即一个随机事件出现的频率常在某个固定的常数附近摆动，这种规律性我们称之为**统计规律性**(Statistical regularity)。频率的稳定性说明随机事件发生的可能性大小是随机事件本身固有的、不随人们意志而改变的一种客观属性，因此可以对它进行度量。

### 确定概率的主观方法

在现实世界里有一些随机现象是不能重复的或不能大量重复的，统计界的贝叶斯学派认为：一个事件的概率是人们根据经验对该事件发生的可能性所给出的个人信念，这样给出的概率称为主观概率。**主观给定的概率要符合概率的公理化定义**。

例如有一个学者以90%的把握断言《伊里亚特》和《奥德赛》是由同一作者创作的，所谓概率为90%的把握是学者的**主观信念**；再比如周五晚上的热门电影，你可能会觉得电影票已经卖完的概率是60%，这是判断基于你对这个时间段和电影受欢迎程度的理解。

### 古典概型

古典概型是最早且最直观的一种概率模型，它适用于那些有限个且等可能事件的情境。所谓“古典”，意思是它起源于概率论的早期发展阶段，其基本思想如下：

<ol>
    <li>所涉及的随机现象只有<strong>有限个样本点</strong>；</li>
    <li>每个样本点发生的<strong>可能性相等</strong>(称为等可能性)；</li>
    <li>
        若事件 $A$ 含有 $k$ 个样本点，则事件 $A$ 的概率为
        $$
            \begin{equation}
            P(A)=\frac{\text{事件}A\text{所含样本点的个数}}{\mit\Omega\text{中所有样本点的个数}}=\frac{k}{n}
            \end{equation}
        $$
    </li>
</ol>

下面来解释一下基本概型的基本思想的内涵，设 ${\mit\Omega}=\\{\omega_1,\omega_2,\cdots,\omega_n\\}$，依据基本思想 $(2)$，有

$$
\begin{equation}
    P(\omega_1)=P(\omega_2)=\cdots=P(\omega_n)=\frac{1}{n}
\end{equation}
$$

对于任意事件 $A$，它总可以表示为样本点之交，即 $A=\omega_{i_1}\cup\omega_{i_2}\cup\cdots\cup\omega_{i_m}$，其中 $\omega_{i_1},\omega_{i_2},\cdots,\omega_{i_m}$ 两两互不相容，于是

$$
    P(A)=P(\omega_{i_1})+P(\omega_{i_2})+\cdots+P(\omega_{i_m})=\frac{m}{n}
$$

所以在古典概型中，事件 $A$ 的概率的分母是样本点的总数 $n$，而分子是事件 $A$ 中所包含的样本点的个数。由于 $\omega_{i_1},\omega_{i_2},\cdots,\omega_{i_m}$ 的出现必导致 $A$ 的出现，即它们的出现对 $A$ 的出现“有利”，因此习惯上常称 $\omega_{i_1},\omega_{i_2},\cdots,\omega_{i_m}$ 是 $A$ 的“有利场合”。

容易验证：$(21)$ 式所定义的“概率”满足非负性与正则性，上面也证明了 $(21)$ 式的可加性，因此 $(21)$ 式所定义的“概率”的确为可测概率。

在古典概型中，求事件 $A$ 的概率归结为计算 $A$ 中含有的样本点的个数和中含有的样本点的总数，所以在计算中经常用到排列组合工具。

### 几何概型

几何概型是古典概型的推广，用于描述在**连续空间**中随机事件的发生概率。在几何概型中，事件的概率是基于**几何特征**(如长度、面积或体积)来计算的。几何概型其基本思想是：

<ol>
    <li>一个随机现象的样本空间 $\mit\Omega$ 充满某个区域，其度量(长度、面积或体积等)大小可用 $S_{\mit\Omega}$ 表示；</li>
    <li>任意一点落在度量相同的子区域内(可能位置不同)是<strong>等可能性的；</strong></li>
    <li>
        若事件 $A$ 为 $\mit\Omega$ 中的某个子区域，且其度量大小可用 $S_A$ 表示，则事件 $A$ 的概率为
        $$
            \begin{equation}
                P(A)=\frac{S_A}{S_\mit\Omega}
            \end{equation}
        $$
    </li>
</ol>

容易验证，$(28)$ 式所定义的“概率”满足非负性和正则性；当事件 $A$ 与 $B$ 互不相容时，显然有 $S_{A\cup B}=S_A+S_B$，于是

$$
    P(A\cup B)=\frac{S_{A\cup B}}{S_{\mathit\Omega}}=\frac{S_A}{S_{\mathit\Omega}}+\frac{S_B}{S_{\mathit\Omega}}=P(A)+P(B)
$$

因此 $(28)$ 式所定义的“概率”的确为可测概率。

求几何概率的关键是对样本空间和所求事件 $A$ 用图形描述清楚(一般用平面或空间图形)，然后计算出相关图形的度量(一般为面积或体积)。

## 条件概率

### 条件概率的定义

**条件概率**(Conditional probability)是在给定**部分信息**的基础上对试验结果一种推断，当然也可以由试验结果反推试验原因的一些性质与可能性，这就是贝叶斯统计的研究内容了。

用更确切的话说，给定一个试验与这个试验相对应的样本空间和概率分布，假设我们已经知道给定的事件 $B$ 发生了，希望知道另一个给定的事件 $A$ 发生的可能性。因此我们要构造一个新的概率分布，它顾及了事件 $B$ 已经发生的信息，求出任何事件 $A$ 发生的概率。

<details class="details-definition" markdown="1" open>
<summary>条件概率</summary>
设 $A$ 与 $B$ 是样本空间 $\mit\Omega$ 中的任意两个事件，若 $P(B)>0$，则称

$$
    \begin{equation}
        P(A\mid B)=\frac{P(AB)}{P(B)}
    \end{equation}
$$

为“在 $B$ 发生的条件下 $A$ 发生”的概率，简称为条件概率(Conditional probability)。
</details>

为了与条件概率相对应，$P(A)$ 可以被称作**无条件概率**(Unconditional probability)。条件概率 $P(A\mid B)$ 可理解为由于事件 $B$ 的发生，**样本空间从** $\boldsymbol{\mit\Omega}$ **变为了** $\boldsymbol{\mit\Omega_{B}=B}$。从几何直观上看，无条件概率 $P(A)$ 就是事件 $A$ (图中灰色部分)占样本空间 ${\mit\Omega}$ 的比例，条件概率 $P(A\mid B)$ 就是事件 $AB$ 的“面积”占事件 $B$ (图中橙色部分加上事件 $AB$ 的灰色部分)的“面积”的比例：

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/condition.png" alt="P(A\mid B)" style="width: 300px;">
     </figure>
   </div>
   <p style="margin-top: 0;">图 $8$: 条件概率 $P(A\mid B)$ 的Venn图示意</p>
</div>

> 在通常意义下，若 $P(B)=0$，那么条件概率 $P(A\mid B)$ 则无法定义或者无意义，也就是说若事件 $B$ 根本不可能发生，那么以事件 $B$ 作为前提来讨论事件 $A$ 的发生情况就不再有意义。不过在测度论的框架下，对于**零概率事件**的条件概率有更为复杂的处理方法，如 Radon-Nikodym 导数，但这是在更抽象的数学背景下讨论的。
{: .prompt-danger}

<details class="details-proposition" markdown="1" open>
<summary>命题 $5$</summary>
设 $P(B)>0$，若
<ol>
   <li>$\forall A\in\mathscr{F}$，有 $P(A\mid B)\geqslant0$；</li>
   <li>$P({\mit\Omega}\mid B)=1$；</li>
   <li>
      若 $\forall A_1,A_2,\cdots,A_n\in\mathscr{F}$，且 $A_i$ 与 $A_j$ 之间两两之间互不相容($i,j=1,2,\cdots,n;i\neq j$)；
      $$
         \begin{equation}
            P\left(\bigcup_{i=1}^{n}A_i\mid B\right)=\sum_{i=1}^{n}P(A_i\mid B)
         \end{equation}
      $$
   </li>
</ol>
则条件概率 $P(A\mid B)$ 是定义在概率空间 $({\mit\Omega},\mathscr{F},P)$ 上的概率。
</details>

因此类似于无条件概率，条件概率也可由三个基本性质导出其他些性质，例如：

<ol>
    <li>$P(\varnothing\mid B)=0$；</li>
    <li>$P(A\mid B)=1-P(\bar{A}\mid B)$；</li>
    <li>对于任意两个事件 $A_1$ 与 $A_2$，有 $P(A_1\cup A_2\mid B)=P(A_1\mid B)+P(A_2\mid B)-P(A_1A_2\mid B)$。</li>
</ol>

### 乘法公式

乘法公式是计算**两个事件同时发生的概率**的工具，它将两个事件的联合概率分解为两个步骤：首先计算事件 $B$ 发生的概率，然后计算在 $B$ 发生的前提下事件 $A$ 发生的概率。这种分解能**从局部的角度理解复杂的联合概率**，其意义在于它可以**分步骤计算复杂的联合概率**，揭示了事件之间的相互依赖关系。

<details class="details-theorem" markdown="1" open>
<summary>乘法公式</summary>
设 $A$ 与 $B$ 是两个任意事件，若 $P(B)>0$，那么

$$
    \begin{equation}
        P(AB)=P(B)P(A\mid B)
    \end{equation}
$$

</details>

由条件概率的定义式可知，

$$
\begin{equation}
    P(AB)=P(B)P(A\mid B)=P(A)P(B\mid A)
\end{equation}
$$

那么则有

$$
\begin{equation}
    P(A\mid B)=\frac{P(A)}{P(B)}\cdot P(B\mid A)
\end{equation}
$$

也就是说 $P(A\mid B)$ 与 $P(B\mid A)$ 的关系是依靠调整因子 $\frac{P(A)}{P(B)}$ 联系在一起的，并且 $P(A\mid B)$ 与 $P(B\mid A)$ 的比例就是 $\frac{P(A)}{P(B)}$ 的值，其意义就在于让我们能够清楚地了解是事件 $A$ 影响事件 $B$ 的因素大，还是事件 $B$ 影响事件 $A$ 的因素大。

若事件 $A$ 与事件 $B$ 之间不是独立发生的两个事件，乘法公式也体现了**一个事件的发生如何影响另一个事件的发生概率**。通过计算条件概率 $P(A\mid B)$ 可以准确估计联合概率。若事件 $A$ 与事件 $B$ 是独立的，即 $P(A\mid B)=P(A)$，则有 $P(AB)=P(A)\cdot P(B)$，这正是独立事件的定义。

### 全概率公式

全概率公式**将事件的概率分解为多个条件下的概率**，从而提供了一种结构化的计算方式，可以更有效地计算复杂情境下的概率。它特别适合处理多个**互不相容**的子事件，在这些不同的子事件中包含另一个事件总的发生概率。

<details class="details-theorem" markdown="1" open>
<summary>全概率公式</summary>
设 $A$是一个任意事件，若 $B_1,B_2,\cdots,B_n$ 是样本空间 $\mit\Omega$ 的一个分割，即 $B_1,B_2,\cdots,B_n$ 两两之间互不相容，且 $\bigcup\limits_{i=1}^{n}B_i={\mit\Omega}$。若 $P(B_i)>0(i=1,2,\cdots,n)$，则 $A$ 发生的概率为

$$
    \begin{equation}
        P(A)=\sum_{i=1}^{n}P(B_i)P(A\mid B_{i})
    \end{equation}
$$

</details>

<details class="details-theorem" markdown="1">
<summary>证明</summary>
由于 $B_1,B_2,\cdots,B_n$ 构成样本空间 ${\mit\Omega}$ 的一个分割，于是

$$
    A=A{\mathit\Omega}=A\left(\bigcup_{i=1}^{n}B_i\right)=\bigcup_{i=1}^{n}(AB_i)
$$

又由于 $B_1,B_2,\cdots,B_n$ 两两之间不互相容，因此 $(AB_1)\cap(AB_2)\cap\cdots\cap(AB_n)=\varnothing$，从而 $AB_1,AB_2,\cdots,AB_2$ 两两之间也互不相容，于是

$$
    P(A)=\sum_{i=1}^{n}P(AB_i)
$$

由乘法公式

$$
    P(AB_i)=P(B_i)P(A\mid B_i)\quad i=1,2,\cdots,n
$$


因此

$$
    P(A)=\sum_{i=1}^{n}P(B_i)P(A\mid B_i)
$$

</details>

可以把全概率公式理解为“**加权平均**”的过程：事件 $A$ 的总概率是基于不同情况 $B_1,B_2,\cdots,B_n$ 下发生的可能性，以及在这些情景下事件 $A$ 发生的条件概率，通过每种情况 $B_i(i=1,2,\cdots,n)$ 下发生的概率 $P(B_i)$ 来对相对应的条件概率 $P(A\mid B)$ “加权”，最终得到事件 $A$ 的总概率。

> 要求 $\sum\limits_{i=1}^{n}P(B_i)=1$，解释为对应的条件概率的权重，体现各条件概率的重要程度或者贡献度。
{: .prompt-danger}

> $B_1,B_2,\cdots,B_n$ 不必为 $\mit\Omega$ 的一个分割，只需 $B_1,B_2,\cdots,B_n$ 是两两互不相容的事件，且 $A\subset\bigcup\limits_{i=1}^{n}B_i$ 即可；另外可列个 $B_1,B_2,\cdots,B_n,\cdots$ 是两两互不相容的事件，且 $A\subset\bigcup\limits_{i=1}^{\infty}B_i$，则全概率公式依旧成立；
{: .prompt-tip}

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
      <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
         <img src="/assets/images/picture/event_and_probabity/full.png" alt="对立事件分割样本" style="width: 300px;">
            <figcaption>(a) 用 $B$ 与 $\bar{B}$ 来分割样本空间</figcaption>
            </figure>
            <figure style="text-align: center; margin-bottom: 0;">
         <img src="/assets/images/picture/event_and_probabity/full_condition.png" alt="互不相容事件分割样本" style="width: 300px;">
         <figcaption>(b) $A\subset \bigcup\limits_{i=1}^{6}B_i$</figcaption>
      </figure>
   </div>
   <p style="margin-top: 0;">图 $11$: 不同形式的全概率公式</p>
</div>

### Bayes 公式

首先我们先来探究 $P(A)$ 与 $P(\bar{A})$、$P(A\mid B)$ 与 $P(\bar{A}\mid B)$ 的关系：

<details class="details-definition" markdown="1" open>
<summary>优势比</summary>
设事件 $A$ 发生的概率为 $P(A)$，那么事件 $A$ 的优势比(Odds ratio)则为

$$
    \begin{equation}
        \frac{P(A)}{P(\bar{A})}=\frac{P(A)}{1-P(A)}
    \end{equation}
$$

</details>

事件 $A$ 的优势比告诉我们事件 $A$ 发生的可能性是不发生时的可能性的倍数，如果 $P(A)=\frac{2}{3}$，那么 $P(A)=2P(\bar{A})$。如果某事件的优势比等于 $\alpha$，那么通常称支持假设(事件)成立的优势比为“$\alpha:1$”。

考虑假设(事件) $H$ 以概率 $P(H)$ 成立，如果我们发现了新的证据 $E$(假设 $H$ 发生所依赖的辅助事件)，那么在 $E$ 成立的条件下，$H$ 成立和 $H$ 不成立的条件概率分别为

$$
    P(H\mid E)=\frac{P(H)P(E\mid H)}{P(E)}, \quad P(\bar{H}\mid E)=\frac{P(\bar{H})P(E\mid \bar{H})}{P(E)}
$$

因此，引进证据 $E$ 后，假设 $H$ 的新的优势比为

$$
\begin{equation}
    \frac{P(H\mid E)}{P(\bar{H}\mid E)}=\frac{P(H)}{P(\bar{H})}\cdot\frac{P(E\mid H)}{P(E\mid\bar{H})}
\end{equation}
$$

即 $H$ 的新的优势比值等于它原来的优势比的值乘以新的证据在 $H$ 和 $\bar{H}$ 之下的条件概率比值。如果

$$
    P(E\mid H)>P(E\mid\bar{H})
$$

则 $H$ 的优势比值是递增的。反之 $H$ 的优势比是递减的。

下面考虑新的证据如何影响某个特定假设成立的概率的问题，令事件 $H$ 表示“某个特定假设”，而事件 $E$ 表示“新的证据”，那么

$$
\begin{equation}
    P(H\mid E)=\frac{P(E\mid H)P(H)}{P(H)P(E\mid H)+P(E\mid \bar{H})[1-P(H)]}
\end{equation}
$$

其中 $P(H)$ 为在新证据展示之前我们对假设成立的可能性的估值。新证据支持假设成立，如果它使得假设成立的可能性增大，即 $P(H\mid E)\geqslant P(H)$。于是

$$
\begin{equation}
    P(E\mid H)\geqslant P(H)P(E\mid H)+P(E\mid \bar{H})[1-P(H)]
\end{equation}
$$

进一步

$$
\begin{equation}
    P(E\mid H)\geqslant P(E\mid \bar{H})
\end{equation}
$$

即当假设成立时，新证据发生的概率大于假设不成立时发生的概率，就认为新证据支持假设。事实上，已知新的证据发生的条件下，假设成立的新概率和初始概率的关系可从下式看出：

$$
\begin{equation}
    P(H\mid E)=\frac{P(H)}{P(H)+[1-P(H)]\frac{P(E\mid \bar{H})}{P(E\mid H)}}
\end{equation}
$$

$(39)$ 式的分母实际上为 $P(E)=P(H)P(E\mid H)+P(\bar{H})P(E\mid\bar{H})$，只包含了事件 $H$ 与其对立事件 $\bar{H}$，分子实际上为 $P(HE)=P(H)P(E\mid H)$。可以将其推而广之，于是就有下面的 Bayes 公式(定理)：

<details class="details-theorem" markdown="1" open>
<summary>Bayes 公式</summary>
设 $B_1,B_2,\cdots,B_n$ 是样本空间 $\mit\Omega$ 的一个分割，即 $B_1,B_2,\cdots,B_n$ 是两两之间互不相容的事件，且 $\bigcup\limits_{i=1}^{n}B_i={\mit\Omega}$。若 $P(A)>0$，且 $P(B_i)>0(i=1,2,\cdots,n)$，那么

$$
    \begin{equation}
        P(B_i\mid A)=\frac{P(B_i)P(A\mid B_i)}{\sum\limits_{j=1}^{n}P(B_j)P(A\mid B_j)}
    \end{equation}
$$

</details>

<details class="details-theorem" markdown="1">
<summary>证明</summary>
由条件概率的定义

$$
   P(B_i\mid A)=\frac{P(AB_i)}{P(A)}, \quad i=1,2,\cdots,n
$$

分子与分母分别用乘法公式和全概率公式代入，即得

$$
   P(B_i\mid A)=\frac{P(AB_i)}{P(A)}=\frac{P(B_i)P(A\mid B_i)}{\sum\limits_{j=1}^{n}P(B_j)P(A\mid B_j)}, \quad i=1,2,\cdots,n
$$

</details>

假定 $B_1,B_2,\cdots,B_n$ 是导致试验结果的各种“原因”，$P(B_i)$ 称之为**先验概率**(Prior)，是事件 $B_i$ 没有任何经验或者知识的情况下的概率，它反映了各种“原因”发生的可能性，一般是对以向经验的总结。

现在在试验中发生了事件 $A$，这个信息将有助于探讨事件发生的“原因”，$P(B_i\mid A)$ 称之为 $B_i$ 的**后验概率**(Posterior)，是通过事件 $A$ 发生的条件下，用事件 $A$ 的经验或者知识来修正先验概率 $P(B_i)$，它反映了试验之后对各种“原因”发生的可能性大小的新知识。

$P(A\mid B_i)$ 称之为事件 $A$ 发生的**似然概率**[^likelihood](Likelihood)，似然概率是对因果关系的一种量化。

## 独立性

### 独立性的定义

两个事件之间的独立性是指：一个事件的发生不影响另一个事件的发生，即事件 $B$ 的发生并没有给事件 $A$ 带来新的信息，它没有改变事件 $A$ 发生的概率。

另外从概率的角度看，事件 $A$ 的条件概率 $P(A\mid B)$ 与无条件概率的差别在于：事件 $B$ 的发生改变了事件 $A$ 发生的概率，也即事件 $B$ 对事件 $A$ 有某种“影响”。如果事件 $A$ 与 $B$ 的发生是相互不影响的，则有 $P(A\mid B)=P(A)$ 和 $P(B\mid A)=P(B)$，它们都等价于

$$
    P(AB)=P(A)P(B)
$$

另外对 $P(B)=0$ 或者 $P(A)=0$，上式仍然成立。为此，我们用该式作为两个事件相互独立的定义。

<details class="details-definition" markdown="1" open>
<summary>两个事件的独立性</summary>
设事件 $A$ 与 $B$ 是样本空间 ${\mit\Omega}$ 中的任意两个事件，如果

$$
    \begin{equation}
        P(AB)=P(A)P(B)
    \end{equation}
$$

成立，则称事件 $A$ 与 $B$ 相互独立(Independent)，简称 $A$ 与 $B$ 独立。否则称 $A$ 与 $B$ 不独立或相依(Dependent)。
</details>

至于用 $P(AB)=P(A)P(B)$ 作为独立性的定义，而不用 $P(A\mid B)=P(A)$ 的理由如下：

<ol>
    <li>
        独立性是事件之间的一种对称关系，也就是说若事件 $A$ 与 $B$ 独立，那么事件 $B$ 与 $A$ 也必须独立，因此我们需要一个对称性的定义。然而条件概率 $P(A\mid B)$ 是非对称的，它只考虑了已知事件 $B$ 发生下 $A$ 十分受影响，并且 $P(A\mid B)$ 并不总是等于 $P(B\mid A)$；
    </li>
    <li>
        条件概率 $P(A\mid B)$ 要求 $P(B)>0$，在 $P(B)>0$ 的情况下 $P(A\mid B)$ 才有意义。若 $P(B)=0$，则会遇到无法定义事件 $A$ 与 $B$ 的独立性；
    </li>
    <li>
        $P(AB)=P(A)P(B)$ 表明，两个事件的共同发生的概率仅仅是它们各自发生的概率的乘积，表明它们彼此之间没有任何影响。相比之下，条件概率 $P(A\mid B)=P(A)$ 只描述了在事件 $B$ 已经发生的情况下 $A$ 发生的概率与 $B$ 无关，而无法直观地表达 $A$ 和 $B$ 同时发生的独立性；
    </li>
    <li>
        $P(A\mid B)=P(A)$ 可以作为 $P(AB)=P(A)P(B)$ 的推论，即
        $$
            P(A\mid B)=\frac{P(AB)}{P(B)}=\frac{P(A)P(B)}{P(B)}=P(A)
        $$
    </li>
</ol>

<details class="details-proposition" markdown="1" open>
<summary>命题 $6$</summary>
若事件 $A$ 与 $B$ 独立，则 $A$ 与 $\bar{B} $独立，$\bar{A}$ 与 $B$ 独立，$\bar{A}$ 与 $\bar{B}$ 独立。
</details>

<details class="details-proposition" markdown="1">
<summary>证明</summary>
由于事件 $A$ 与 $B$ 独立，那么

$$
    P(AB)=P(A)P(B)
$$

于是

$$
    P(A\bar{B})=P(A-B)=P(A)-P(AB)=P(A)[1-P(B)]=P(A)P(\bar{B})
$$

即事件 $A$ 与 $\bar{B}$ 独立，同理事件 $\bar{A}$ 与 $B$ 也独立。

又由于

$$
    P(\bar{A}\bar{B})=P(\overline{A\cup B})=1-P(A\cup B)=P(\bar{A})-P(B)P(\bar{A})=P(\bar{A})P(\bar{B})
$$

即事件 $\bar{A}$ 与 $\bar{B}$ 独立，结论得证。
</details>

在实践中，通常 $P(AB)$ 与 $P(A)P(B)$ 的绝对误差不超过 $10^{-3}$ 或者 $10^{-4}$、相对误差不超过1%或者5%，即

$$
    |P(AB)-P(A)P(B)|\leqslant10^{-4} \quad \text{或者} \quad |P(AB)-P(A)P(B)|\leqslant10^{-3}
$$

以及

$$
    \frac{|P(AB)-P(A)P(B)|}{P(AB)}\leqslant1\% \quad \text{或者} \quad \frac{|P(AB)-P(A)P(B)|}{P(AB)}\leqslant5\% 
$$

即认为事件 $A$ 与 $B$ 相互独立，也可以根据实际需要选择合适的显著性水平。

<details class="details-definition" markdown="1" open>
<summary>多个事件的独立性</summary>
设 $A,B,C$ 是三个任意的事件，若有

$$
   \begin{cases}
      P(AB)=P(A)P(B)\\
      P(AC)=P(A)P(C)\\
      P(BC)=P(B)P(C)
   \end{cases}
$$

则称 $A,B,C$ 两两独立；若还有

$$
   P(ABC)=P(A)P(B)P(C)
$$

则称 $A,B,C$ 相互独立
</details>

> 事件 $A,B,C$ 两两独立不能推出事件 $A,B,C$ 相互独立；反过来事件 $A,B,C$ 相互独立也不能推出事件 $A,B,C$ 两两独立！
{: .prompt-danger}

### 试验的独立性

<details class="details-definition" markdown="1" open>
<summary>试验的独立性</summary>
设有两个试验 $E_1$ 和 $E_2$，假如试验 $E_1$ 的任一结果(事件)与试验 $E_2$ 的任一结果(事件)都是相互独立的事件，则称这两个试验相互独立。
</details>

例如掷一枚硬币(试验 $E_1$)与掷一颗骰子(试验 $E_2$)是相互独立的试验。

类似地可以定义 $n$ 个试验 $E_1,E_2,\cdots,E_n$ 的相互独立性：如果 $E_1$ 的任一结果、$E_2$ 的任一结果、……、$E_n$ 的任一结果都是相互独立的事件，则称试验 $E_1,E_2,\cdots,E_n$ 相互独立。

如果这几个独立试验还是相同的，则称其为 $n$ 重独立重复试验。如果在 $n$ 重独立重复试验中，每次试验的可能结果为两个：$A$ 或者 $\bar{A}$，则称这种试验为 $n$ 重 Bernoulli 试验。

[^likelihood]: 概率(Probability)与似然概率(Likelihood)的区别在于：Probability是给定参数的情况下预测某个事件发生的可能性；而Likelihood是给定数据推测参数的可能性。