---
key: variaties-and-distributions
title: "概率论基础(2) 随机变量及其分布"
permalink: "/variaties-and-distributions"
tags:
  - 统计学
  - 概率论
author: Wenxin Zhong
layout: article
download: false
videos: false
refactor: true
mathjax: true
modify_date: "2025-06-28 21:30:00"
---

为了进行定量的数学处理，必须把随机现象的结果**数量化**。这就是引进随机变量的原因。随机变量概念的引进使得对随机现象的处理更简单与直接，也更统一而有力。

<!--more-->

## 随机变量

在随机现象中有很多样本点本身就是用数量表示的，由于样本点出现的随机性其数量呈现为随机变量。但是在随机现象中还有不少样本点本身不是数，这时可根据研究需要设置随机变量。

<details class="details-definition" markdown="1" open>
<summary>随机变量</summary>
定义在样本空间 ${\mit\Omega}$ 上的实值函数 $X=X(\omega)$ 称为随机变量，常用大写字母 $X,Y,Z$ 等表示随机变量，其取值用小写字母 $x,y,z$ 等表示。
</details>

假如一个随机变量仅可能取有限个或可列个值，则称其为**离散随机变量**。假如一个随机变量的可能取值充满数轴上的一个区间 $(a,b)$，则称其为**连续随机变量**，其中 $a$ 可以是 $-\infty$，$b$ 可以是 $+\infty$。

这个定义表明：**随机变量** $\boldsymbol{X}$ **是样本点的一个函数**，这个函数可以是不同样本点对应不同的实数，也允许多个样本点对应同一个实数。

> 随机变量函数的自变量(样本点)可以是数，也可以不是数，但因变量一定是实数！
{: .prompt-warning}

与微积分中的变量不同，概率论中的随机变量 $X$ 是一种“**随机取值**的变量且伴随一个**分布**”。以离散随机变量为例，我们不仅要知道 $X$ 可能取哪些值，而且还要知道它取这些值的概率各是多少，这就需要分布的概念，有没有分布是区分一般变量与随机变量的主要标志。

## 随机变量的分布函数

随机变量 $X$ 是样本点 $\omega$ 的一个实值函数，若 $B$ 是某些实数组成的集合，即 $B\subset \mathbb{R}$，则 $\{X\in B\}$ 表示如下的随机事件

$$
  \begin{equation}
    \{\omega\mid X(\omega)\in B\}\subset{\mit\Omega}
  \end{equation}
$$

特别地，用等号或不等号把随机变量与某些实数连接起来，用来表示事件。如 $\{X\leqslant a\}$、$\{X>b\}$ 和 ${a<X<b}$ 都是随机事件。

为了掌握 $X$ 的统计规律性，我们只要掌握 $X$ 取各种值的概率。由于

$$
  \begin{aligned}
    \{a<X\leqslant b\}&=\{X\leqslant b\}-\{X\leqslant a\}\\
    \{X>c\}&={\mit\Omega}-\{X\leqslant c\}
  \end{aligned}
$$

因此只要对任意实数 $x$，知道了事件 $\{X\leqslant x\}$ 的概率就够了，这个概率具有累积特性，常用 $F(x)$ 表示。另外这个概率与 $x$ 有关，不同的 $x$，此累积概率的值也不同，为此记

$$
  F(x)=P(X\leqslant x)
$$

于是 $F(x)$ 对所有 $x\in(-\infty,+\infty)$ 都有定义，因而 $F(x)$ 是定义在 $\mathbb{R}$ 上、取值于 $[0,1]$ 的一个函数，于是就把它定义为分布函数：

<details class="details-definition" markdown="1" open>
<summary>分布函数</summary>
设 $X$ 是一个随机变量，对任意实数 $x$，称

$$
  \begin{equation}
    F(x)=P(X\leqslant x)
  \end{equation}
$$

为随机变量 $X$ 的分布函数，且称 $X$ 服从 $F(x)$，记为 $X\sim F(x)$。有时也可用 $F_X(x)$ 以表明是 $X$ 的分布函数。
</details>

从分布函数的定义可见，任一随机变量 $X$(无论离散还是连续)都有一个分布函数。有了分布函数，就可据此算得与随机变量 $X$ 有关事件的概率。

<details class="details-theorem" markdown="1" open>
<summary>定理 1</summary>
任一分布函数 $F(x)$ 都具有如下三条基本性质：
  <ol>
    <li>
      单调性。$\forall x_1,x_2\in\mathbb{R}$，并且 $x_1 < x_2$，则 $F(X_1) < F(X_2)$；
    </li>
    <li>
      有界性。$\forall x\in\mathbb{R}$，有 $0\leqslant F(x)\leqslant 1$，并且
      $$
      \begin{align}
        F(-\infty)=\lim_{x\to-\infty}F(x)=0\\
        F(+\infty)=\lim_{x\to+\infty}F(x)=0
      \end{align}
      $$
    </li>
    <li>
      右连续性。$\forall x_0\in\mathbb{R}$，有
      $$
        \begin{equation}
          \lim_{x\to x_0^+}f(x)=f(x_0)
        \end{equation}
      $$
    </li>
  </ol>
</details>

以上三条基本性质是分布函数必须具有的性质，还可以证明：满足这三条基本性质的函数必定是某个随机变量的分布函数，从而这三条基本性质成为判别某个函数是否能成为分布函数的**充要条件**。

### 分布列

对离散随机变量而言，常用以下定义的分布列来表示其分布：

<details class="details-definition" markdown="1" open>
<summary>分布列</summary>
设是一个离散随机变量，如果 $X$ 的所有可能取值是 $x_1,x_2,\cdots,x_n,\cdots$，则称 $X$ 取 $x_i$ 的概率

$$
  \begin{equation}
    p_i=p(x_i)=P(X=x_i),\quad i=1,2,\cdots,n,\cdots
  \end{equation}
$$

为 $X$ 的概率质量函数(Probability mass function)或者概率分布列，简称为分布列，记为 $X\sim\{p_i\}$。
</details>

分布列也可用如下列表方式来表示：

<table style="text-align: center;">
  <thead>
    <tr>
      <th>$X$</th>
      <th>$x_1$</th>
      <th>$x_2$</th>
      <th>$\cdots$</th>
      <th>$x_n$</th>
      <th>$\cdots$</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>$P$</th>
      <td>$p(x_1)$</td>
      <td>$p(x_2)$</td>
      <td>$\cdots$</td>
      <td>$p(x_n)$</td>
      <td>$\cdots$</td>
    </tr>
  </tbody>
</table>

<details class="details-proposition" markdown="1" open>
<summary>定理 1</summary>
分布列有以下性质：

1. 非负性。即 $p(x_i)\geqslant0$，
2. 正则性。即 即 $\sum\limits_{i=1}^{\infty}p(x_i)=1$。
</details>

> 以上两条基本性质是分布列必须具有的性质，也是判别某个数列是否能成为分布列的**充要条件**。
{: .prompt-danger}

由离散随机变量 $X$ 的分布列很容易写出 $X$ 的累积分布函数

$$
  \begin{equation}
    F(x)=\sum_{x_i\leqslant X}p(x_i)
  \end{equation}
$$

它的图形是有限级(或可列无穷级)的阶梯函数。不过在离散场合常用来描述其分布的是分布列，很少用到分布函数，因为求离散随机变量的有关事件的概率时，用分布列比用分布函数来得更方便。

> 在具体求离散随机变量 $X$ 的分布列时，关键是求出 $X$ 的所有可能取值及取这些值的概率。
{: .prompt-warning}

### 概率密度函数

连续随机变量的一切可能取值充满某个区间 $(a,b)$，在这个区间内有无穷不可列个实数，因此描述连续随机变量的概率分布不能再用分布列形式表示，而要改用概率密度函数表示。

概率密度函数 $p(x)$ 的值虽不是概率，它表示“在一些地方(如中部)取值的机会大，在另一些地方(如两侧)取值机会小”的一种统计规律性。但乘微分元 $\mathrm{d}x$ 就可得小区间 $(x,x+\mathrm{d}x)$ 上概率的近似值，即

$$
  p(x)\mathrm{d}x\approx P(x<X<x+\mathrm{d}x)
$$

在 $(a,b)$ 上很多相邻的微分元的累积就得到 $p(x)$ 在 $(a,b)$ 上的积分，这个积分值就是 $X$ 在 $(a,b)$ 上取值的概率，即

$$
  \displaystyle\int_{a}^{b}p(x)\mathrm{d}x=P(a<X<b)
$$

特别地，在 $(-\infty,x]$ 上 $p(x)$ 的积分就是分布函数$F(x)$，即

$$
  \displaystyle\int_{-\infty}^{x}p(t)\mathrm{d}t=P(X\leqslant x)=F(x)
$$

这一关系式是连续随机变量 $X$ 的概率密度函数 $p(x)$ 最本质的属性。这一切运算成为可能还要求 $p(x)$ 是非负可积函数。

综上所述，可得概率密度函数 $p(x)$ 的如下严格定义：

<details class="details-definition" markdown="1" open>
<summary>概率分布函数</summary>
设随机变量 $X$ 的分布函数为 $F(x)$，若存在实数轴上的一个非负可积函数 $p(x)$，$\forall x\in\mathbb{R}$，有

$$
\begin{equation}
  F(x)=\displaystyle\int_{-\infty}^{x}p(t)\mathrm{d}t
\end{equation}
$$

则称 $p(x)$ 为随机变量 $X$ 的概率密度函数(Probability density function)，简称为概率密度或者密度。
</details>

从定义可以看出，在 $F(x)$ 的导数存在的点上，有

$$
\begin{equation}
    {F}'(x)=p(x)
\end{equation}
$$

$F(x)$ 是累积分布函数，其导函数 ${F}'(x)$ 是概率密度函数。

<details class="details-proposition" markdown="1" open>
<summary>命题 2</summary>
密度函数有以下性质：

1. 非负性。即 $p(x)\leqslant0$；
2. 正则性。即 $\displaystyle\int_{-\infty}^{+\infty}p(x)\mathrm{d}x=1$。
</details>

> 以上两条基本性质是密度函数必须具有的性质，也是确定或判别某个函数是否成为密度函数的**充要条件**。
{: .prompt-danger}

譬如已知某个函数 $p(x)$ 为密度函数，若 $p(x)$ 中有一个待定常数,则可利用正则性 $\displaystyle\int_{-\infty}^{+\infty}p(x)\mathrm{d}x=1$ 来确定该常数。

以下我们对密度函数与分布列的异同点作一些说明。

在离散随机变量场合

$$
\begin{equation}
    P(a<X\leqslant b)=\sum_{a<x_i\leqslant b}p(x_i)
\end{equation}
$$

其中 $x_i$ 为 $X$ 的可能取值。在连续随机变量场合

$$
\begin{equation}
    P(a<X\leqslant b)=\displaystyle\int_{a}^{b}p(x)\mathrm{d}x
\end{equation}
$$

其含义为密度函数 $p(x)$ 在区间 $(a,b]$ 上的曲边梯形面积。

从这个意义上讲，概率密度函数与概率分布列所起的作用是类似的，但它们之间的差别也是明显的，具体有：

<ol>
  <li>
    离散随机变量的分布函数 $F(x)$ 总是右连续的阶梯函数，而连续随机变量的分布函数 $F(x)$ 在其定义域上一定是连续函数，后者是因为对任意点 $x$ 的增量 $\Delta{x}$，相应分布函数的增量总有

    $$
      F(x+\Delta{x})-F(x)=\displaystyle\int_{x}^{\Delta{x}}p(t)\mathrm{d}t\to0, \Delta{x}\to0
    $$
  </li>
  <li>
    离散随机变量 $X$ 在其可能取值的点 $x_1,x_2,\cdots,x_n,\cdots$ 上的概率不为 0，而连续随机变量 $X$ 在 $(-\infty,+\infty)$ 上任一点 $a$ 的概率恒为0，这是因为

    $$
      P(x=a)=\displaystyle\int_{a}^{a}p(x)\mathrm{d}x=0
    $$

    这表明：不可能事件的概率为 0，但概率为 0 的事件不一定是不可能事件。类似地，必然事件的概率为 1，但概率为 1 的事件不一定是必然事件。
  </li>
  <li>
    由于连续随机变量 $X$ 仅取一点的概率恒为 0，从而在事件 $\{a\leqslant X\leqslant b\}$ 中剔去 $x=a$ 或剔去 $x=b$，不影响其概率，即

    $$
      P(a\leqslant X\leqslant b)=P(a<X\leqslant b)=P(a\leqslant X<b)=P(a<X<b)
    $$

    这给计算带来很大方便，而这个性质在离散随机变量场合是不存在的，在离散随机变量场合计算概率要“点点计较”。
  </li>
  <li>
    由于在若干点上改变密度函数 $p(x)$ 的值并不影响其积分的值，从而不影响其分布函数 $F(x)$ 的值，这意味着一个连续分布的密度函数不唯一。譬如

    $$
      p_1(x)=
      \begin{cases}
        \frac{1}{a}, \quad 0\leqslant x\leqslant a \\
        0, \quad \text{others}
      \end{cases}, \quad
      p_2(x)=
      \begin{cases}
        \frac{1}{a}, \quad 0 < x < a\\
        0, \quad \text{others}
      \end{cases}
    $$

    它们都是 $(0,a)$ 上均匀分布的密度函数，但仔细考察这两个函数 $p_1(x)$ 和 $p_2(x)$，可以发现

    $$
      P(p_1(x)\neq p_2(x))=P(X=0)+P(X=a)=0
    $$

    可见这两个函数在概率意义上是无差别的，在此称 $p_1(x)$ 与 $P_2(x)$“几乎处处相等”，其意义是：在概率论中可剔去概率为 0 的事件后讨论两个函数相等及其他随机问题。
  </li>
</ol>

> 除了离散分布和连续分布之外，还有既非离散又非连续的分布！
{: .prompt-tip}

## 随机变量的数字特征

每个随机变量都有一个分布(分布列、密度函数或分布函数)，不同的随机变量可能拥有不同的分布，也可能拥有相同的分布。分布全面地描述了随机变量取值的统计规律性，由分布可以算出有关随机事件的概率。除此以外由分布还可以算得相应随机变量的均值、方差、分位数等特征数，这些特征数各从一个侧面描述了分布的特征。

### 期望

假设一个离散随机变量 $X$，它可能的取值为 $x_1,x_2,\cdots,x_k$，其发生的频数分别为 $n_1,n_2,\cdots,n_k$，将它们转换为下面的表：

<table style="text-align: center;">
  <thead>
    <tr>
      <th>取值</th>
      <th>$x_1$</th>
      <th>$x_2$</th>
      <th>$\cdots$</th>
      <th>$x_k$</th>
    </tr>
  </thead>
  <tbody>
    <tr>
       <th>频数</th>
       <td>$n_1$</td>
       <td>$n_2$</td>
       <td>$\cdots$</td>
       <td>$n_k$</td>
    </tr>
    <tr>
      <th>频率</th>
      <td>$\frac{n_1}{n}$</td>
      <td>$\frac{n_2}{n}$</td>
      <td>$\cdots$</td>
      <td>$\frac{n_k}{n}$</td>
    </tr>
  </tbody>
</table>

于是该离散型分布的样本的平均值就为

$$
  \bar{x}=\frac{1}{n}\sum_{i=1}^{k}n_ix_i=\sum_{i=1}^{k}\frac{n_i}{n}x_i
$$

其中 $\frac{n_i}{n}$ 实际上就是 $x_i$($i=1,2,\cdots,k$) 出现的频率，解释为 $x_i$ 出现的权重。计算样本平均值的过程其实就是计算 $x_i$($i=1,2,\cdots,k$) 的加权平均值。并且当 $n$ 足够大的时候，$\frac{n_i}{n}\to p(x_i)$($i=1,2,\cdots,k$)。

受到计算样本平均值的启发，随机变量的期望可以定义为如下形式：

<details class="details-definition" markdown="1" open>
<summary>离散随机变量的期望</summary>
设离散随机变量 $X$ 的分布列为

$$
  p(x_i)=P(X=x_i), \quad i=1,2,\cdots,n,\cdots
$$

若

$$
  \begin{equation}\label{eq:离散分布要求}
    \sum_{i=1}^{\infty}|x_i|p(x_i)<\infty
  \end{equation}
$$

则称

$$
  \begin{equation}
    \mathbb{E}(X)=\sum_{i=1}^{\infty}x_ip(x_i)
  \end{equation}
$$
</details>

在定义中要求无穷级数\eqref{eq:离散分布要求}绝对收敛，是为了保证数学期望唯一(这是由于若无穷级数是绝对收敛的，则其和不受到运算次序的影响)。由于有限项的和不受次序变动的影响，故取有限个可能值的随机变量的数学期望总是存在的。若无穷级数\eqref{eq:离散分布要求}不收敛，则离散随机变量 $X$ 的数学期望不存在！

<details class="details-definition" markdown="1" open>
<summary>连续随机变量的期望</summary>
设连续随机变量 $X$ 的密度函数为 $p(x)$，若

$$
  \begin{equation}\label{eq:连续分布要求}
    \displaystyle\int_{-\infty}^{+\infty}|x|p(x)\mathrm{d}x<\infty
  \end{equation}
$$

则称
$$
  \begin{equation}
    \mathbb{E}(X)=\displaystyle\int_{-\infty}^{+\infty}xp(x)\mathrm{d}x
  \end{equation}
$$

为连续随机变量 $X$ 的数学期望。
</details>

若无穷积分\eqref{eq:连续分布要求}不收敛，则连续随机变量 $X$ 的数学期望不存在！

数学期望的理论意义是深刻的，它是消除随机性的主要手段。数学期望是随机变量分布的一种位置特征数，反映了随机变量的“中心趋势”，即该随机变量在重复多次试验后“应该”接近的值，它刻画了 $X$ 的取值总在 $\mathbb{E}(X)$ 周围波动。通过数学期望我们可以了解随机试验的整体趋势，消除单个试验的偶然性。

数学期望 $\mathbb{E}(X)$ 的物理解释是重心。若把概率 $p(x_i)=P(X=x_i)$ 看作点 $x_i$ 上的质量，概率分布看作质量在 $x$ 轴上的分布，则 $X$ 的数学期望 $\mathbb{E}(X)$ 就是该质量分布的重心所在位置。

按照随机变量 $X$ 的数学期望 $\mathbb{E}(X)$ 的定义，$\mathbb{E}(X)$ 由其分布唯一确定.若要求随机变量 $X$ 的一个函数 $g(X)$ (仍是随机变量)的数学期望，当然要先求出 $Y=g(X)$ 的分布，再用此分布来求 $\mathbb{E}(Y)$。

<details class="details-theorem" markdown="1" open>
<summary>定理 2</summary>
若随机变量 $X$ 的分布用分布列 $p(x_i)$ 或用密度函数 $p(x)$ 表示，则 $X$ 的某一函数 $g(X)$ 的数学期望为

$$
  \begin{equation}
  \mathbb{E}[g(X)]=
   \begin{cases}
    \sum\limits_{i}g(x_i)p(x_i),\quad \text{离散场合}\\
      \displaystyle\int_{-\infty}^{+\infty}g(x)p(x)\mathrm{d}x,\quad \text{连续场合}
    \end{cases}
  \end{equation}
$$

这里所涉及的数学期望都假定存在。
</details>

<details class="details-proposition" markdown="1" open>
<summary>命题 3</summary>
假定随机变量 $X$ 与随机变量函数 $g(X)$ 的数学期望存在，则
  <ol>
    <li>
      $\mathbb{E}(c)=c$；
    </li>
    <li>
      $\forall \alpha,\beta\in\mathbb{R}$，随机变量函数 $g(X)$ 的数学期望满足线性性：

      $$
        \begin{equation}
          \mathbb{E}[\alpha g_1(X)\pm\beta g_2(X)]=\alpha\mathbb{E}[g_1(X)]\pm\beta\mathbb{E}[g_2(X)]
        \end{equation}
      $$
    </li>
  </ol>
</details>

### 方差

随机变量的数学期望无法反映出随机变量取值的“波动大小”，即距 $\mathbb{E}(X)$ 的偏离程度。要考察随机变量 $X$ 到它的数学期望 $\mathbb{E}(X)$ 的偏离程度，最自然的想法是考虑 $\|X-\mathbb{E}(X)\|$ 的值，但是这种做法很有可能会导致正负偏离有所抵消，因此我们一般考虑的是 $[X-\mathbb{E}(X)]^2$ 的值。由于 $[X-\mathbb{E}(X)]^2$ 依旧是随机变量，于是可以取其期望 $\mathbb{E}[X-\mathbb{E}(X)]^2$，就可以刻画 $X$ 的“波动”程度了。

<details class="details-definition" markdown="1" open>
<summary>随机变量的方差</summary>
若随机变量 $X^2$ 的数学期望 $\mathbb{E}(X^2)$ 存在，则称偏差平方 $[X-\mathbb{E}(X)]^2$ 的数学期望 $\mathbb{E}[X-\mathbb{E}(X)]^2$ 为随机变量 $X$(或相应分布)的方差，即

$$
\begin{equation*}
   \begin{cases}
    &\sum\limits_{i}[x_i-\mathbb{E}(X)]^2p(x_i),\quad \text{离散场合}\\
    &\displaystyle\int_{-\infty}^{+\infty}[x-\mathbb{E}(X)]^2p(x)\mathrm{d}x,\quad \text{连续场合}
   \end{cases}
\end{equation*}
$$

记作 $Var(X)$。称方差的正平方根 $\sqrt{Var(X)}$ 为随机变量 $X$(或相应分布)的标准差，记为 $\sigma(X)$。
</details>

方差与标准差的功能相似，它们都是用来描述随机变量取值的集中与分散程度的两个特征数。方差与标准差愈小，随机变量的取值愈集中；方差与标准差愈大，随机变量的取值愈分散。

方差与标准差之间的差别主要在量纲上，由于标准差与所讨论的随机变量、数学期望有相同的量纲，其加减 $\mathbb{E}(X)\pm k\sigma(X)$ 是有意义的(其中 $k\in\mathbb{R}^+$)，所以在实际中人们比较乐意选用标准差，但标准差的计算必须通过方差才能算得。

另外要指出的是：如果随机变量 $X$ 的数学期望存在，其方差不一定存在；而当 $X$ 的方差存在时，则 $\mathbb{E}(X)$ 必定存在，其原因在于 $\|x\|\leqslant x^2+1$ 总是成立的，从而\eqref{eq:离散分布要求}式和\eqref{eq:连续分布要求}式必定收敛！

<details class="details-proposition" markdown="1" open>
<summary>命题 4</summary>
假定随机变量 $X$ 的方差是存在的，则
<ol>
  <li>
    $Var(X)=\mathbb{E}(X^2)-[\mathbb{E}(X)]^2$；
  </li>
  <li>
    $Var(c)=0$；
  </li>
  <li>
    $\forall\alpha,\beta\in\mathbb{R}$，有

    $$
      \begin{equation}
        Var(\alpha X+\beta)=\alpha^2Var(X)
      \end{equation}
    $$
  </li>
</ol>
</details>

> 从性质(1) 可以看出，若 $\mathbb{E}(X^2)=0$，则 $\mathbb{E}(X)=0$，并且 $Var(X)=0$；若 $\mathbb{E}(X^2)\neq0$，则 $\mathbb{E}(X)$ 与 $Var(X)$ 必存在，并且 $Var(X)\geqslant0$(由定义可知)。
{: .prompt-info}

当 $\mathbb{E}(X^2)=0$ 时，即随机变量 $X^2$ “几乎处处”为 0，于是随机变量 $X$ 同样也“几乎处处”为 0，从而 $\mathbb{E}(X)=0$，并且 $Var(X)=0$。

下面给出随机变量 $X$ 超过某一正数的概率上界：

<details class="details-theorem" markdown="1" open>
<summary>Markov 不等式</summary>
设非负随机变量 $X$ 的数学期望存在，则 $\forall\alpha>0$，有

$$
  \begin{equation}
    P(X\geqslant\alpha)\leqslant\frac{\mathbb{E}(X)}{\alpha}
  \end{equation}
$$
</details>

<details class="details-theorem" markdown="1">
<summary>证明</summary>
证法一&nbsp;&nbsp; 设随机变量 $X$ 是非负的，并且它的数学期望存在，令

$$
  I_{\{X\geqslant\alpha\}}=
  \begin{cases}
    0,\quad X<\alpha\\
    1,\quad X\geqslant\alpha
  \end{cases}
$$

于是就有

$$
  P(X\geqslant\alpha)=\mathbb{E}\left[I_{\{X\geqslant\alpha\}}\right]
$$

注意到当 $X\geqslant\alpha$ 时，$I_{\{X\geqslant\alpha\}}=1$，因此对于 $X$ 的任意取值，都有

$$
  X\geqslant \alpha\cdot I_{\{X\geqslant\alpha\}}
$$

对等式两边求期望有

$$
  \begin{aligned}
    \mathbb{E}(X)\geqslant\mathbb{E}\left[\alpha\cdot I_{\{X\geqslant\alpha\}}\right]&=\alpha\mathbb{E}\left[\cdot I_{\{X\geqslant\alpha\}}\right]\\
    &=\alpha P(X\geqslant\alpha)
  \end{aligned}
$$

即

$$
  P(X\geqslant\alpha)\leqslant\frac{\mathbb{E}(X)}{\alpha}
$$

结论得证。

证法二&nbsp;&nbsp; 对于非负随机变量 $X$ 的数学期望，有

$$
  \begin{aligned}
    \mathbb{E}(X)&=\int_{0}^{+\infty}xf(x)\mathrm{d}x\\
    &=\int_{0}^{\alpha}xf(x)\mathrm{d}x+\int_{\alpha}^{+\infty}xf(x)\mathrm{d}x\\
    &\geqslant\int_{\alpha}^{+\infty}xf(x)\mathrm{d}x\\
    &\geqslant\alpha\int_{\alpha}^{+\infty}f(x)\mathrm{d}x=\alpha P(X\geqslant\alpha)
  \end{aligned}
$$

即

$$
  P(X\geqslant\alpha)\leqslant\frac{\mathbb{E}(X)}{\alpha}
$$

结论得证。
</details>

我们假设在超市排队结账时，所需要等待的平均时间为 $\mathbb{E}(X)=5$ (分钟)，那么排队时间超过 10 分钟的概率约为

$$
  P(X\geqslant10)=\frac{5}{10}=0.5
$$

即最坏的情况下，排队时间超过 10 分钟的概率最大为 $50\%$。

Markov 不等式的美妙之处在于，只需要知道数学期望 $\mathrm{E}(X)$，不需要知道排队时间的具体分布，因此在信息有限时非常实用。

<details class="details-theorem" markdown="1" open>
<summary>推论 1</summary>
设 $\varphi(x)$ 是随机变量 $X$ 取值的集合上的非负不减函数，并且 $\mathbb{E}[\varphi(X)]$ 存在，则 $\forall\alpha>0$，有

$$
  \begin{equation}
    P(X\geqslant\alpha)\leqslant\frac{\mathbb{E}[\varphi(X)]}{\varphi(\alpha)}
  \end{equation}
$$
</details>

下面给出随机变量 $X$($X$ 的方差存在) 偏离其数学期望的概率上界：

<details class="details-theorem" markdown="1" open>
<summary>Chebyshev 不等式</summary>
设随机变量 $X$ 的数学期望与方差都存在，则 $\forall\varepsilon>0$，有

$$
\begin{equation}
  P(|X-\mathbb{E}(X)|\geqslant\varepsilon)\leqslant\frac{Var(X)}{\varepsilon^2}
\end{equation}
$$

或者令 $k=\frac{\varepsilon}{\sigma(X)}>0$，则

$$
\begin{equation}\label{eq:Chebyshev}
  P(|X-\mathbb{E}(X)|\geqslant k\sigma(X))\leqslant\frac{1}{k^2}
\end{equation}
$$
</details>

<details class="details-theorem" markdown="1" open>
<summary>证明</summary>
证法一&nbsp;&nbsp; 设随机变量 $X$ 的数学期望与方差都存在，那么由 Markov 不等式，$\forall\alpha>0$，有

$$
  P(|X-\mathbb{E}(X)|\geqslant\varepsilon)=P([X-\mathbb{E}(X)]^2\geqslant\varepsilon^2)\leqslant\frac{\mathbb{E}[X-\mathbb{E}(X)]^2}{\varepsilon^2}=\frac{Var(X)}{\varepsilon^2}
$$

令 $k=\frac{\varepsilon}{\sigma(X)}$，则就有

$$
  P(|X-\mathbb{E}(X)|\geqslant k\sigma(X))\leqslant\frac{1}{k^2}
$$

结论得证。
  
证法二&nbsp;&nbsp; 设随机变量 $X$ 的密度函数为 $p(x)$，于是

$$
  \begin{aligned}
    P(|X-\mathbb{E}(X)|\geqslant\varepsilon)&=\int_{|X-\mathbb{E}(X)|\geqslant\varepsilon}p(x)\mathrm{d}x\\
    &\leqslant\int_{|X-\mathbb{E}(X)|\geqslant\varepsilon}\frac{[X-\mathbb{E}(X)]^2}{\varepsilon^2}p(x)\mathrm{d}x \quad \left(1\leqslant\frac{[X-\mathbb{E}(X)]^2}{\varepsilon^2}\right)\\
    &\leqslant\frac{1}{\varepsilon^2}\int_{-\infty}^{+\infty}[X-\mathbb{E}(X)]^2p(x)\mathbb{d}x=\frac{Var(X)}{\varepsilon^2}
  \end{aligned}
$$

令 $k=\frac{\varepsilon}{\sigma(X)}$，于是结论得证。
</details>

在概率论中，事件 $\{\|X-\mathbb{E}(X)\|>\varepsilon\}$ 称为大偏差，其概率 $P(\|X-\mathbb{E}(X)\|>\varepsilon)$ 称为大偏差发生概率。Chebyshev 不等式给出大偏差发生概率的上界，这个上界与方差成正比，方差愈大上界也愈大。

同样以超市排队结账为例，假设平均等待时间为 $\mathbb{E}(X)=5$ (分钟)，方差为 $Var(X)=4$ (分钟)，那么排队时间偏离均值至少 4 分钟以上的概率约为

$$
  P(|X-5|\geqslant2\times2)\leqslant\frac{1}{2^2}=0.25
$$

即排队时间在 1 分钟 $\sim9$ 分钟的概率至少为 $0.75\%$。

Markov 不等式与 Chebyshev 不等式都没有假定随机变量 $X$ 的分布，即没有提供 $X$ 的任何信息。Markov 不等式与Chebyshev 不等式在我们不知道随机变量 $X$ 的信息下，可以大致地给出 $X$ 偏离其数学期望 $\mathbb{E}(X)$ 的概率。其中 Chebyshev不等式提供了更严格的上界，因为它利用了额外的分布信息(方差)。

Chebyshev不等式关注的是偏离均值的概率(双侧)，而 Markov 不等式只考虑单侧且不参考方差信息。

在\eqref{eq:Chebyshev}式中，$k$ 决定了我们关心的是随机变量偏离期望值多少倍标准差的概率。例如，选择 $k=2$ 表示我们关注的是随机变量偏离期望至少2倍标准差的概率不超过25\%；选择 $k=3$ 则表示偏离至少 3 倍标准差的概率不超过11.1\%。

下面的定理进一步说明了方差为 0 就意味着随机变量的取值几乎集中在一点上。

<details class="details-theorem" markdown="1" open>
<summary>定理 5</summary>
若随机变量 $X$ 的方差存在，那么 $Var(X)=0$ 的充分必要条件是：$X$ 几乎处处等于常数 $a$，即 $P(X=a)=1$。
</details>

<details class="details-theorem" markdown="1">
<summary>证明</summary>
充分性是显然的，下面证明必要性。

对于 $Var(X)=0$，因此 $\mathbb{E}(X)$ 必存在。由于 $\forall\varepsilon>0$，有

$$
  \{|X-\mathbb{E}(X)|>\varepsilon\}=\bigcup_{n=1}^{\infty}\left\{|X-\mathbb{E}(X)|\geqslant\frac{1}{n}\right\}
$$

因此

$$
  \begin{aligned}
    P(|X-\mathbb{E}(X)|>\varepsilon)&=P\left(\bigcup_{n=1}^{\infty}\left\{|X-\mathbb{E}(X)|>\frac{1}{n}\right\}\right)\\
    &=\sum_{n=1}^{\infty}P\left(|X-\mathbb{E}(X)|\geqslant\frac{1}{n}\right)\\
    &\leqslant\sum_{n=1}^{\infty}\frac{Var(X)}{n^2}=0 \quad \left(\sum_{n=1}^{\infty}\frac{1}{n^2}\text{绝对收敛}\right)
  \end{aligned}
$$

于是令 $\varepsilon=0$，则有

$$
  P(|X-\mathbb{E}(X)|>0)=0
$$

从而

$$
  P(|X-\mathbb{E}(X)|=0)=1-P(|X-\mathbb{E}(X)|>0)=1
$$

即 $X$ 几乎处处等于它的数学期望 $\mathbb{E}(X)$，结论得证。
</details>

### 其他的数字特征

<details class="details-definition" markdown="1" open>
<summary>$k$ 阶矩</summary>
设 $X$ 为随机变量，$k$ 为正整数。如果以下的数学期望都存在，则称

$$
\begin{equation}
  \mu_k=\mathbb{E}(X^k)
\end{equation}
$$

为 $X$ 的 $k$ 阶原点矩。称

$$
\begin{equation}
  \nu_k=\mathbb{E}[X-\mathbb{E}(X)]^k
\end{equation}
$$

为 $X$ 的 $k$ 阶中心矩。
</details>

显然一阶原点矩就是数学期望，二阶中心矩就是方差。由于 $\|X\|^{k-1}\leqslant\|X\|^k+1$，故 $k$ 阶矩存在时，$k-1$ 阶矩也存在，从而低于 $k$ 的各阶矩都存在。

中心矩和原点矩之间有一个简单的关系，事实上

$$
\nu_k=\mathbb{E}[X-\mathbb{E}(X)]^k=\mathbb{E}(X-\mu_1)^k=\sum_{i=1}^{k}\binom{k}{i}X^i\mu_1^{k-i}
$$

方差(或标准差)反映了随机变量取值的波动程度，但在比较两个随机变量的波动大小时，如果仅看方差(或标准差)的大小有时会产生不合理的现象。这有两个原因：

1. 随机变量的取值有量纲，不同量纲的随机变量用其方差(或标准差)去比较它们的波动大小不太合理；
2. 在取值的量纲相同的情况下，取值的大小有一个相对性问题取值较大的随机变量的方差(或标准差)也允许大一些。

所以要比较两个随机变量的波动大小时，在有些场合使用以下定义的变异系数来进行比较，更具可比性。

<details class="details-definition" markdown="1" open>
<summary>变异系数</summary>
设随机变量 $X$ 的二阶矩存在，则称比值

$$
\begin{equation}
  C_v(X)=\frac{\sigma(X)}{\mathbb{E}(X)}
\end{equation}
$$

为 $X$ 的变异系数。
</details>

因为标准差的量纲与数学期望的量纲是一致的，所以变异系数是一个无量纲的量，从而消除量纲对波动的影响。

<details class="details-definition" markdown="1" open>
<summary>分位数</summary>
设连续随机变量 $X$ 的分布函数为 $F(x)$，密度函数为 $p(x)$。对任意 $p\in(0,1)$，称满足条件

$$
\begin{equation}
  F(x_p)=\int_{-\infty}^{x_p}p(x)\mathrm{d}x=p
\end{equation}
$$

的 $x_p$ 为此分布的 $p$ 分位数，又称下侧 $p$ 分位数。
</details>

很多概率统计问题最后都归结为求解满足概率不等式 $F(x)\leqslant p$ 的最大 $x$，其解可用分位数 $x_p$ 表示。

<details class="details-definition" markdown="1" open>
<summary>中位数</summary>
设连续随机变量 $X$ 的分布函数为 $F(x)$，密度函数为 $p(x)$。称 $p=0.5$ 时的 $p$ 分位数 $p_{0.5}$ 为此分布的中位数，即 $x_{0.5}$ 满足

$$
\begin{equation}
  F(x_{0.5})=\int_{-\infty}^{x_{0.5}}p(x)\mathrm{d}x=0.5
\end{equation}
$$
</details>

> 中位数的位置常在分布的中部。
{: .prompt-info}

对离散分布也可以同样引入分位数和中位数的概念，但遗憾的是：此时对给定的 $p$，有可能 $x_p$ 不存在或不唯一，所以在离散分布场合很少使用分位数。

中位数与均值一样都是随机变量位置的特征数，但在某些场合可能中位数比均值更能说明问题。

<details class="details-definition" markdown="1" open>
<summary>偏度系数</summary>
设随机变量 $X$ 的前三阶矩存在，则比值

$$
\begin{equation}
  \beta_{S}=\frac{\nu_3}{\nu_2^{3/2}}=\frac{\mathbb{E}[X-\mathbb{E}(X)]^3}{[Var(X)]^{3/2}}
\end{equation}
$$

称为 $X$(或分布)的偏度系数，简称偏度。当 $\beta_{S}>0$ 时，称该分布为正偏，又称右偏；当 $\beta_{S}<0$ 时，称该分布为负偏，又称左偏。
</details>

偏度 $\beta_{S}>0$ 是描述分布偏离对称性程度的一个特征数，这可从以下几方面来认识：

1. 当密度函数 $p(x)$ 关于数学期望对称时，即有 $p(\mathbb{E}(X)-x)=p(\mathbb{E}(X)+x)$，则其三阶中心矩 $\nu_3$必为 0，从而 $\beta_{S}=0$。这表明关于 $\mathbb{E}(X)$ 对称的分布其偏度为 0；
2. 当偏度 $\beta_{S}\neq0$ 时，该分布为偏态分布，偏态分布常有不对称的两个尾部，重尾在右侧(变量在高值处比低值处有较大的偏离中心趋势)必导致 $\beta_{S}>0$，故此分布又称为右偏分布；重尾在左侧(变量在低值处比高值处有较大的偏离中心趋势)必导致 $\beta_{S}<0$，故又称为左偏分布。
3. 偏度 $\beta_{S}$ 是以各自的标准差的三次方 $[\sigma(X)]^3$ 为单位来度量三阶中心矩大小的，从而消去了量纲，使其更具有可比性。简单地说，分布的三阶中心矩 $\nu_3$ 决定偏度的符号，而分布的标准差 $\sigma(X)$ 决定偏度的大小。

<details class="details-definition" markdown="1" open>
<summary>峰度系数</summary>
设随机变量 $X$ 的前四阶矩存在，则

$$
\begin{equation}
  \beta_{k}=\frac{\nu_{4}}{\nu_{2}^{2}}-3=\frac{E\left( X-E\left( X \right) \right)^{4}}{\left[ \mathrm{Var}\left( X \right) \right]^{2}}-3
\end{equation}
$$

称为 $X$(或分布)的峰度系数，简称峰度。
</details>

峰度是描述分布尖峭程度和(或)尾部粗细的一个特征数，这可从以下几方面来认识：

<ol>
  <li>
    假如在上述定义中，分子与分母各除以$[\sigma(X)]^4$，并记 $X$ 的标准化变量为$X^*=\frac{X-\mathbb{E}(X)}{\sigma(X)}$，则$\beta_k$可改写成：

    $$
      \beta_{k}=\frac{\mathbb{E}\left(X^{*}\right)^{4}}{\left[\mathbb{E}\left(X^{*2}\right)\right]^{2}}-3=\mathbb{E}\left(X^{*4}\right)-\mathbb{E}\left(U^{4}\right)
    $$

    其中$\mathbb{E}(X^{*2})=$Var$(X^{*})=1$，$U$ 为标准正态变量，$\mathbb{E}(U^{4})=3$。上式表明：峰度 $\beta_k$ 是相对于正态分布而言的超出量，即峰度 $\beta_k$ 是 $X$ 的标准化变量与标准正态变量的四阶原点矩之差，并以标准正态分布为基准确定其大小。

    <ol>
      <li>$\beta_k>0$ 表示标准化后的分布比标准正态分布更尖峭和(或)尾部更粗；</li>   
      <li>$\beta_k<0$ 表示标准化后的分布比标准正态分布更平坦和(或)尾部更细；</li>
      <li>$\beta_k<0$ 表示标准化后的分布与标准正态分布的尖峭程度与尾部粗细相当。</li>  
    </ol>
  </li>
  <li>
    偏度与峰度都是描述分布形状的特征数，它们的设置都是以正态分布为基准，正态分布的偏度与峰度皆为 0。在实际中一个分布的偏度与峰度皆为 0 或近似为 0 时，常认为该分布为正态分布或近似为正态分布。
  </li>
</ol>

## 信息熵

## 常见的离散型分布

### 退化分布

退化分布(Degenerate distribution)也称作“确定性分布”，是只有一种值的分布，是一种绝对事件的分布。退化分布的取值只有一个，让我们设其为 $c(\forall c\in\mathbb{R})$，则退化分布的的分布列为：

$$
p_0=P(X\ne c)=0, \quad p_1=P(X=c)=1
$$

其分布函数实际上是阶梯函数：

$$
F(x)=
\begin{cases}
  0, \quad x<c\\
  1, \quad x\geqslant c
\end{cases}
$$

退化分布的期望为 $\mathbb{E}(X)=c$，方差为 $Var(X)=0$。

退化分布研究确定性随机变量，这一类的随机变量的特征总是取固定值，几乎没有随机性，所有概率集中在一个点上。例如用来研究固定产量的机器每天生产出的产品数量是否总是一个固定值，使用退化分布来描述机器每天的产量，该分布集中在一个固定值上，表示产量始终一致。

### 二项分布

如果记 $X$ 为 $n$ 重伯努利试验中成功(记为事件 $A$)的次数，则 $X$ 的可能取值为 $0,1,\cdots,n$。记 $p$ 为每次试验中 $A$ 发生的概率，即 $P(A)=p$，则 $P(\bar{A})=1-p$。

因为 $n$ 重伯努利试验的基本结果可以记作

$$
  \omega=(\omega_1,\omega_2,\cdots,\omega_n)
$$

其中 $\omega_{i}$ 或者为 $\bar{A}$，或者为$\bar{A}$。这样的 $\omega$ 共有 $2^n$ 个，这 $2^n$ 个样本点 $\omega$ 组成了样本空间 $\mit{\Omega}$。

下面求 $X$ 的分布列，即求事件 $\{X=k\}$ 的概率。若某个样本点

$$
  \omega=(\omega_1,\omega_2,\cdots,\omega_n)\in\{X=k\}
$$

意味着 $\omega_1,\omega_2,\cdots,\omega_n$ 中有 $k$ 个 $A, n- k$ 个 $\bar{A}$，所以由独立性知，

$$
  P(\omega)=p^{k}(1-p)^{n-k}
$$

而事件$\{X=k\}$中这样的 $\omega$ 共有$\binom{n}{k}$ 个，所以 $X$ 的分布列为

$$
  p(x_k)=P\left(X=k\right)=\binom{n}{k}p^{k}\left(1-p\right)^{n-k},\quad k=0,1,\cdots,n
$$

这个分布称为二项分布(binomial distribution)，记为 $X\sim b(n,p)$。

二项分布的期望为

$$
  \mathbb{E}(X)=\sum\limits_{k=0}^{n}kp(x_k)=\sum\limits_{k=0}^{n}k\cdot\binom{n}{k}p^{k}\left(1-p\right)^{n-k}
$$

注意到 $k\binom{n}{k}=n\binom{n-1}{k-1}$，因此

$$
\begin{aligned}
  \mathbb{E}(X)&=\sum\limits_{k=0}^{n}k\cdot\binom{n}{k}p^{k}\left(1-p\right)^{n-k}\\
  &=n\sum\limits_{k=0}^{n}\binom{n-1}{k-1}p^{k}\left(1-p\right)^{n-k}\\
  &=np\sum\limits_{k=0}^{n}\binom{n-1}{k}p^{k}\left(1-p\right)^{n-k-1}
\end{aligned}

$$

连加号里的 $\binom{n-1}{k}p^{k}\left(1-p\right)^{n-k-1}$ 实际上是随机变量 $X\sim b(n-1,p)$ 的分布列，根据分布列的正则性，可得

$$
\mathbb{E}(X)=np
$$

二项分布的方差为

$$
  Var(X)=\mathbb{E}[X-\mathbb{E}(X)]^2=\mathbb{E}(X^2)-\mathbb{E}^2(X)
$$

先计算 $\mathbb{E}(X^2)$ 的结果，按照定义

$$
\begin{aligned}
  \mathbb{E}(X^2)&=\sum\limits_{k=0}^{n}k^2\cdot\binom{n}{k}p^{k}\left(1-p\right)^{n-k}\\
  &=n\sum\limits_{k=0}^{n}k\cdot\binom{n-1}{k-1}p^{k}\left(1-p\right)^{n-k}\\
  &=np\sum\limits_{k=0}^{n}(k+1)\cdot\binom{n-1}{k}p^{k}\left(1-p\right)^{n-k-1}\\
  &=np\sum\limits_{k=0}^{n}k\cdot\binom{n-1}{k}p^{k}\left(1-p\right)^{n-k-1}+np\sum\limits_{k=0}^{n}\binom{n-1}{k}p^{k}\left(1-p\right)^{n-k-1}\\
  &=n(n-1)p^2\sum\limits_{k=0}^{n}\binom{n-2}{k}p^{k}\left(1-p\right)^{n-k-2}+np\\
  &=np^2(n-1)+np
\end{aligned}
$$

于是

$$
Var(X)=\mathbb{E}(X^2)-\mathbb{E}^2(X)=np^2(n-1)+np-n^2p^2=np(1-p)
$$

<table style="text-align: center;">
  <caption>表 1: 不同 $p$ 值的 $b(10,p)$ 的概率值</caption>
  <thead>
    <tr>
      <th>$k$</th>
      <th>0</th>
      <th>1</th>
      <th>2</th>
      <th>3</th>
      <th>4</th>
      <th>5</th>
      <th>6</th>
      <th>7</th>
      <th>8</th>
      <th>9</th>
      <th>10</th>
    </tr>
</thead>
<tbody>
    <tr>
      <th>$b(10, 0.2)$</th>
      <td>0.107</td>
      <td>0.268</td>
      <td>0.302</td>
      <td>0.201</td>
      <td>0.088</td>
      <td>0.027</td>
      <td>0.006</td>
      <td>0.001</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th>$b(10, 0.5)$</th>
      <td>0.001</td>
      <td>0.010</td>
      <td>0.044</td>
      <td>0.117</td>
      <td>0.205</td>
      <td>0.246</td>
      <td>0.205</td>
      <td>0.117</td>
      <td>0.044</td>
      <td>0.010</td>
      <td>0.001</td>
    </tr>
    <tr>
      <th>$b(10, 0.8)$</th>
      <td></td>
      <td></td>
      <td></td>
      <td>0.001</td>
      <td>0.006</td>
      <td>0.027</td>
      <td>0.088</td>
      <td>0.201</td>
      <td>0.302</td>
      <td>0.268</td>
      <td>0.107</td>
    </tr>
  </tbody>
</table>

当 $n=1$ 时的二项分布 $b(1,p)$ 称为伯努利分布(Bernoulli distribution)，或者称之为两点分布，或者 $0-1$ 分布，其分布列为

$$
  p(X=0)=p^x(1-p)^{1-x}, \quad x=0,1
$$

二点分布 $b(1,p)$主要用来描述一次伯努利试验中成功(记为 $A$)的次数(0或1)。

很多随机现象的样本空间$\mit{\Omega}$常可一分为二，记为 $A$ 与 $\bar{A}$，由此形成伯努利试验。$n$ 重伯努利试验是由 $n$ 个相同的 、独立进行的伯努利试验组成，若将第 $i$ 个伯努利试验中 $A$ 出现的次数记为$X_i(i=1,2,\cdots,n)$，则 $X$ 相互独立，且服从相同的二点分布 $b(1,p)$(称 $X_i$ 独立同分布与 $b(1,p)$，记作 $X_i\overset{\text{i.i.d.}}{\sim}b(1,p)$)。此时其和

$$
  X=X_1+X_2+\cdots+X_n
$$

就是 $n$ 重伯努利试验中 $A$ 出现的总次数，它服从二项分布 $b(n,p)$。这就是二项分布 $b(n,p)$ 与二点分布 $b(1,p)$ 之间的联系，即服从二项分布的随机变量是 $n$ 个独立同为二点分布的随机变量之和。

伯努利分布的数学期望为

$$
\mathbb{E}(X)=\sum_{k=0}^{1}kp^x(1-p)^{1-x}=p
$$

方差为

$$
Var(X)=\mathbb{E}(X^2)-\mathbb{E}^2(X)=p(1-p)
$$

由于二项分布可以看成是 $n$ 个伯努利分布的和，因此二项分布的期望和方差也可以利用伯努利分布计算。设 $X_i\sim b(1,p)$，那么满足二项分布 $X\sim b(n,p)$ 的随机变量可以表示为

$$
X=X_1+X_2+\cdots+X_n
$$

于是

$$
\mathbb{E}(X)=\mathbb{E}(X_1)+\mathbb{E}(X_2)+\cdots+\mathbb{E}(X_n)=np
$$

并且

$$
Var(X)=Var(X_1)+Var(X_2)+\cdots+Var(X_n)=np(1-p)
$$

伯努利分布的分布函数为

$$
F(x)=
\begin{cases}
  0, \quad x<0\\
  p, \quad 0\leqslant x<1\\
  1, \quad x\geqslant1\\
\end{cases}
$$

### 泊松分布

泊松分布(Poisson distribution)适合于描述单位时间内，独立发生的随机事件发生次数的概率分布，如某一服务设施在一定时间内受到的服务请求的次数，电话交换机接到呼叫的次数等(单位时间内发生的次数，可以看作事件发生的频率)。

例如要研究银行每天到达的客户数量，使用泊松分布，假设在给定时间段内客户到达的平均次数为 $\lambda$，可以计算每一天到达的客户数量的概率。

记 $X$ 为单位时间内随机时间 $A$ 发生的次数，它的可能取值为 $0,1,2,\cdots$，泊松分布的分布列为：

$$
  P(X=k)=\frac{\lambda^k}{k!}e^{-\lambda}, \quad k=0,1,2,\cdots
$$

其中 $\lambda>0$，是随机事件 $A$ 发生次数的数学期望，记作 $X\sim P(\lambda)$ 或者 $X\sim \pi(\lambda)$。通常要求随机事件 $A$ 在单位时间内以 $\lambda$ 为平均速率均匀发生的，其中 $\lambda$ 不随时间的变化而变化，并且两个事件不可能在同一时刻发生，也就是说在每个非常小的子间隔内，要么恰好发生一个事件，要么不发生任何事件。

除了单位时间间隔外，泊松分布还适用于描述任何维数大于1的单位区域内的计数过程。

泊松分布的期望为：

$$
  \mathbb{E}(X)=\sum_{k=0}^{\infty}k\cdot\frac{\lambda^k}{k!}e^{-\lambda}=e^{-\lambda}\sum_{k=1}^{\infty}\frac{\lambda^k}{(k-1)!}=\lambda e^{-\lambda}\sum_{k=0}^{\infty}\frac{\lambda^k}{k!}
$$

由函数 $e^{\lambda}$ 的泰勒级数可知，$\sum\limits_{k=0}^{\infty}\frac{\lambda^k}{k!}=e^{\lambda}$，于是$\mathbb{E}(X)=\lambda$。而

$$
  \mathbb{E}(X^2)=\sum_{k=0}^{\infty}k^2\cdot\frac{\lambda^k}{k!}e^{-\lambda}=\lambda e^{-\lambda}\sum_{k=0}^{\infty}(k+1)\cdot\frac{\lambda^k}{k!}=\lambda^2+\lambda
$$

从而

$$
  Var(X)=\mathbb{E}(X^2)-\mathbb{E}^2(X)=\lambda
$$

可见，泊松分布的 $\mathbb{E}(X)=Var(X)=\lambda$。

<table>
  <caption>表 2: 不同 $\lambda$ 值的 $P(\lambda)$ 的概率值</caption>
  <thead>
    <tr>
        <th>$k$</th>
        <th>0</th>
        <th>1</th>
        <th>2</th>
        <th>3</th>
        <th>4</th>
        <th>5</th>
        <th>6</th>
        <th>7</th>
        <th>8</th>
        <th>9</th>
        <th>10</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <th>$P(0.8)$</th>
        <td>0.449</td>
        <td>0.360</td>
        <td>0.144</td>
        <td>0.038</td>
        <td>0.008</td>
        <td>0.001</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <th>$P(2.0)$</th>
        <td>0.135</td>
        <td>0.271</td>
        <td>0.271</td>
        <td>0.180</td>
        <td>0.090</td>
        <td>0.036</td>
        <td>0.012</td>
        <td>0.004</td>
        <td>0.001</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <th>$P(4.0)$</th>
        <td>0.018</td>
        <td>0.074</td>
        <td>0.146</td>
        <td>0.195</td>
        <td>0.196</td>
        <td>0.156</td>
        <td>0.104</td>
        <td>0.060</td>
        <td>0.030</td>
        <td>0.013</td>
        <td>0.005</td>
    </tr>
  </tbody>
</table>

<details class="details-proposition" markdown="1" open>
<summary>命题 5</summary>
设有两个随机变量 $X_1\sim P(\lambda_1)$，$X_2\sim P(\lambda_2)$，并且 $X_1$ 与 $X_2$ 是相互独立的，则 $X_1+X_2\sim P(\lambda_1+\lambda_2)$。
</details>

<details class="details-proposition" markdown="1">
<summary>证明</summary>
由假设 $X_1\sim P(\lambda_1)$，$X_2\sim P(\lambda_2)$，并且 $X_1$ 与 $X_2$ 是相互独立的，按照定义

$$
  \begin{aligned}
    P(X_1+X_2=k)&=\sum_{i=0}^{k}P(X_1=i)P(X_2=k-i)\\
    &=\sum_{i=0}^{k}\frac{\lambda_1^ie^{-\lambda_1}}{i!}\cdot\frac{\lambda_2^{(k-i)}e^{-\lambda_2}}{(k-i)!}\\
    &=e^{-(\lambda_1+\lambda_2)}\sum_{i=0}^{k}\frac{\lambda_1^i\lambda_2^{(k-i)}}{i!(k-i!)}\\
    &=\frac{e^{-(\lambda_1+\lambda_2)}}{k!}\sum_{i=0}^{k}\binom{k}{i}\lambda_1^i\lambda_2^{(k-i)}\\
    &=\frac{(\lambda_1+\lambda_2)^k}{k!}e^{-(\lambda_1+\lambda_2)}
  \end{aligned}
$$

即 $X_1+X_2\sim P(\lambda_1+\lambda_2)$，结论得证。
</details>

泊松分布可以推导为二项分布的一种极限情况，即试验次数趋于无穷大，而成功的预期次数保持固定。因此，当 $n$ 足够大，$p$ 足够小时，它可以用作二项分布的近似。当 $n\geqslant20$ 且 $p\leqslant0.05$ 时，泊松分布是二项分布的良好近似值；当 $n\geqslant100$ 且 $np\leqslant10$ 时，泊松分布是良好近似值。

<details class="details-theorem" markdown="1" open>
<summary>泊松定理</summary>
在 $n$ 重伯努利试验中，记事件 $A$ 在一次试验中发生的概率为 $p_n$ (与试验次数 $n$ 有关)，当 $n\to\infty$ 时，由 $np_n\to\lambda$，则

$$
  \lim_{n\to\infty}\binom{n}{k}p_n^k(1-p_n)^{n-k}=\frac{\lambda^k}{k!}e^{-\lambda}
$$

</details>

<details class="details-theorem" markdown="1">
<summary>证明</summary>
令 $np_n=\lambda_n$，即 $p_n=\frac{\lambda_n}{n}$，那么则有

$$
  \begin{aligned}
    \binom{n}{k}\left(\frac{\lambda_n}{n}\right)^k\left(1-\frac{\lambda_n}{n}\right)^{n-k}&=\frac{n(n-1)\cdots(n-k+1)}{k!}\left(\frac{\lambda_n}{n}\right)^k\left(1-\frac{\lambda_n}{n}\right)^{n-k}\\
    &=\frac{\lambda_n^k}{k!}\cdot\left[\left(1-\frac{1}{n}\right)\cdots\left(1-\frac{k-1}{n}\right)\right]\cdot\left(1-\frac{\lambda_n}{n}\right)^{n-k}\\
  \end{aligned}
$$

对于固定的 $k$，由于

$$
  \lim_{n\to\infty}\lambda_n=\lambda, \quad \lim_{n\to\infty}\left(1-\frac{\lambda_n}{n}\right)^{n-k}=e^{-\lambda}
$$

并且有

$$
  \left(1-\frac{k-1}{n}\right)^{k-1}\leqslant\left(1-\frac{1}{n}\right)\cdots\left(1-\frac{k-1}{n}\right)\leqslant1
$$

因此

$$
  \lim_{n\to\infty}\left(1-\frac{1}{n}\right)\cdots\left(1-\frac{k-1}{n}\right)=1
$$

从而 $\forall k\in\mathbb{Z}^+$，有

$$
  \lim_{n\to\infty}\binom{n}{k}\left(\frac{\lambda}{n}\right)^k\left(1-\frac{\lambda}{n}\right)^{n-k}=\frac{\lambda^k}{k!}e^{-\lambda}
$$

</details>

由于泊松定理是在 $np_n=\lambda$ 的条件下成立的，故在计算二项分布 $b(n,p)$ 时，当 $n$ 很大，$p$ 很小，并且乘积 $np$ 适中的时候，可以用泊松分布近似，即

$$
  \binom{n}{k}p_n^k(1-p_n)^{n-k}=\frac{(np)^k}{k!}e^{-np}, \quad k=0,1,2,\cdots
$$

### 几何分布

### 负二项分布

### 超几何分布

## 常见的连续型分布

### 均匀分布

### 正态分布

### 对数正态分布

### Gamma 分布

### Beta 分布

## 抽样分布

### $\chi^2$ 分布

### $t$ 分布

### $F$ 分布

## 随机变量函数的分布
