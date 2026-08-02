---
key: association-rules
title: "统计分析(1) 关联分析"
permalink: "/association-rules"
tags:
  - 统计学
  - 机器学习方法
author: Wenxin Zhong
layout: article
mathjax: true
modify_date: "2025-06-08 13:35:00"
---

关联分析(<a href="https://en.wikipedia.org/wiki/Association_rule_learning" target="_blank">Analysis of Association Rules</a>)是一种**基于规则**的机器学习方法，用于发现数据集中变量之间的相关关系。它通过识别频繁模式、关联或相关性，帮助揭示数据中的条件概率模式，常用于无监督学习场景。

<!--more-->

## 购物篮分析

## 发展历史

## 指标

{% details definition "项目与事务" open %}
设 $\mathcal{I}=\\{I_1, I_2, \cdots, I_n\\}$ 是一组二元集合，即 $I_k=0,1$，$k=1,2,\cdots,n$，称 $\mathcal{I}$ 为项目集(Items)，$I_k$ 为项目(Item)。

设 $\mathcal{T}=\\{T_1, T_2, \cdots, T_m\\}$ 是一组二元向量，称 $\mathcal{T}$ 为事务集(Transactions)，$T_s$ 为事务(Transaction)。如果 $T_s$ 包含项目 $I_k$，那么 $T_{s,k}=1$，否则 $T_{s,k}=0$。
{% enddetails %}


设 $X$ 为 $\mathcal{I}$ 的一个 Items 集合，则 $T_s$ 满足 $X$ 当且仅当 $\forall I_k\in X(k=1,2,\cdots,l)$，有 $T_{s,k}=1$。

> Transactions 通常指在一个特定情境下的记录，比如超市的购物记录、网页浏览历史等。
{: .prompt-info}


<table>
  <caption>表 1: 示例数据集</caption>
  <thead>
    <tr>
      <th>交易 ID</th>
      <th>牛奶</th>
      <th>面包</th>
      <th>黄油</th>
      <th>啤酒</th>
      <th>尿布</th>
      <th>鸡蛋</th>
      <th>水果</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1 </td>
    </tr>
    <tr>
      <th>2</th>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1 </td>
    </tr>
    <tr>
      <th>3</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0 </td>
    </tr>
    <tr>
      <th>4</th>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1 </td>
    </tr>
    <tr>
      <th>5</th>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>

在表 1 的示例数据集中，$\mathcal{I}=\\{牛奶, 面包, 黄油, 啤酒, 尿布, 鸡蛋, 水果\\}$ 就是一组 Items，而交易 ID 的 $1\sim5$ 就是一组 Transactions。设 $X=\\{牛奶,面包,水果\\}$，那么交易 ID 的 $1,4$ 都属于 $X$。

{% details definition "关联规则" open %}
设 $X$ 是 $\mathcal{I}$ 的一个 Items 集合，事务集 $\mathcal{T}=\\{T_1, T_2, \cdots, T_m\\}$。设 $I_j\in \mathcal{I}$ 并且 $I_j\notin X$，规则 $X\Rightarrow I_j$ 在 $\mathcal{T}$ 中以概率 $c$ 成立，当且仅当在满足 $X$ 的事务 $T_s\in\mathcal{T}$ 中，$I_j$ 在 $T_s$ 中以概率 $c$ 成立。用符号 $X\Rightarrow I_j\mid c$ 来表示规则 $X\Rightarrow I_j$ 在 $\mathcal{T}$ 中以概率 $c$ 成立。
{% enddetails %}


例如在表 1 的示例数据集中，设 $X=\\{牛奶,面包,水果\\}$，$I_j=\\{黄油\\}$，那么 $X\Rightarrow I_j$ 在 $\mathcal{T}$ 中以**频率** $\frac{1}{2}$ 成立。

> 关联规则简单来说就是寻找 Item A 在 Item B 下的条件概率！
{: .prompt-tip}


### 支持度(Support)

$$
\mathrm{support}(A\cup B)=\frac{n(A\cap B)}{N}\in[0,1]
$$

其中 $N$ 是事务集 $\mathcal{T}$ 的事务数。

支持度用于筛选频繁项集，是关联规则分析的基础阈值。较高的支持度表示该规则或项集在数据中出现频率较高，适合用于发现显著模式。

### 置信度(Confidence)

$$
\mathrm{confidence}(A\Rightarrow B)=\frac{P(A\cap B)}{P(A)}=\frac{\mathrm{support}(A\cup B)}{\mathrm{support}(A)}\in[0,1]
$$

置信度表示规则 $A \Rightarrow B$ 的**条件概率**，高的置信度意味着当 $A$ 出现时，$B$ 也很可能出现。但需要注意置信度不对称，即 $\mathrm{confidence}(A\Rightarrow B)\ne\mathrm{confidence}(B\Rightarrow A)$。

### 提升度(Lift)

$$
\mathrm{lift}(A\Rightarrow B)=\frac{\mathrm{P(A\cap B)}}{P(A)P(B)}=\frac{\mathrm{confidence(A\Rightarrow B)}}{\mathrm{support}(B)}\geqslant0
$$

提升度用于比较观察到的联合频率与期望的独立频率。$\mathrm{lift}(A\Rightarrow B)=1$ 表示 $A$ 和 $B$ 独立，大于 1 表示正相关，小于 1 表示负相关，帮助识别有意义的规则。

### 杠杆率(Leverage)

$$
\mathrm{leverage}(A\Rightarrow B)=P(A\cap B)-P(A)P(B)=\mathrm{support}(A\cup B)-\mathrm{support}(A)\mathrm{support}(B)\in\mathbb{R}\in[-1,1]
$$

杠杆率量化了规则的偏差，$\mathrm{leverage}(A\Rightarrow B)=0$ 表示 $A$ 与 $B$ 独立，负值表示负相关，正值表示正相关，适合评估规则的显著性。

### 信念度(Conviction)

$$
\mathrm{conviction}(A\Rightarrow B)=\frac{1-P(B)}{1-P(A\mid B)}=\frac{1 - \mathrm{support}(B)}{1 - \mathrm{confidence}(A\Rightarrow B)}\geqslant0
$$

信念度高表示 $B$ 高度依赖于 $A$，若 $\mathrm{confidence}(A\Rightarrow B)=1$，则意味着规则很强，即 $A$ 发生时 $B$ 很有可能也会同时发生；若 $\mathrm{support}(B)=\mathrm{confidence}(A\Rightarrow B)$，此时 $\mathrm{conviction(A\Rightarrow B)}=1$，则意味着规则很弱，即 $A$ 发生时 $B$ 很可能不发生。

### Jaccard 相似度

$$
\begin{aligned}
  \mathrm{jaccard}(A\Rightarrow B)&=\frac{P(A\cap B)}{P(A\cup B)}\\
  &=\frac{P(A\cap B)}{P(A)+P(B)-P(A\cap B)}\\
  &=\frac{\mathrm{support}(A\cup B)}{\mathrm{support}(A)+\mathrm{support}(B)-\mathrm{support}(A\cup B)}\in[0, 1]
\end{aligned}
$$

Jaccard 相似度用于评估 $A$ 和 $B$ 的交集相对于并集的比例，反映集合的相似性，适合比较规则的覆盖范围。

### 确定性(Certainty)

$$
\mathrm{containty}(A\Rightarrow B)=\frac{P(A\cap B)-P(A)}{P(A)\cdot(1-P(A))}=\frac{\mathrm{confidence}(A\Rightarrow B)-\mathrm{support}(A)}{1-\mathrm{support}(A)}\in[0,1]
$$

确定性评估规则的预测能力，特别是在考虑 $B$ 不存在时的影响，适合用于规则的准确性分析。

### Kulczynski 度量

$$
\mathrm{kulczynski}(A \Rightarrow B) = \frac{1}{2} \left( \frac{P(A\cap B)}{P(A)} + \frac{P(A\cap B)}{P(B)} \right) = \frac{1}{2} \left( \frac{\mathrm{support}(A \cup B)}{\mathrm{support}(A)} + \frac{\mathrm{support}(A \cup B)}{\mathrm{support}(B)} \right)\in[0,1]
$$

Kulczynski 度量是对称的，适合评估 $A$ 和 $B$ 之间的双向关联强度，特别在数据倾斜时有用。

## 算法

## 应用场景

## Python 的实现方法

## R 语言的实现方法
