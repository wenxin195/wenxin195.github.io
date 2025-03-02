---
key: event-and-probability-simulation
title: "用计算机模拟 Buffon 投针和三门问题"
permalink: "/event-and-probability-simulation"
tags:
  - 概率论
  - 统计计算
author: Wenxin Zhong
layout: article
download: false
videos: false
refactor: true
modify_date: "2024-11-06 17:51:00"
---

<!--more-->

## Buffon 投针的计算机模拟

回顾用 Buffon 投针估算圆周率 $\pi$ 的公式：

$$
  \begin{equation}
    \pi\approx\frac{2lN}{dn}
  \end{equation}
$$

其中 $l$ 为针的长度，$d$ 为两个平行线间的间距，$N$ 为投掷次数，$n$ 为针与任一平行线相交的次数。针与平行线相交的充分必要条件是：

$$
  \begin{equation}
    x\leqslant\frac{l}{2}\sin{\varphi}
  \end{equation}
$$

<div style="text-align: center;">
   <div style="display: flex; justify-content: center;">
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/needle.png" alt="needle" style="width: 300px;">
       <figcaption>(a) Buffon 投针问题</figcaption>
     </figure>
     <figure style="margin-right: 20px; text-align: center; margin-bottom: 0;">
       <img src="/assets/images/picture/event_and_probabity/intersect.png" alt="相交的充要条件" style="width: 300px; margin-top: 68px;">
       <figcaption>(b) 针与平行线相交的充分必要条件</figcaption>
     </figure>
   </div>
   <p style="margin-top: 0;">图 1: 比丰投针</p>
</div>

用 R 语言来模拟的示例如下：

```R
# toss_nums为试验次数，needle_lengths为针的长度，line_spacing为两平行线的间距
buffon <- function(toss_nums, needle_lengths, line_spacing) {
  angle <- runif(toss_nums, 0, pi / 2)  # 针与平行线的角度
  dist_to_line <- runif(toss_nums, 0, line_spacing / 2)  # 针的中点到平行线的距离  
  
  projection_lengths <- needle_lengths / 2 * sin(angle)  # 计算针的半径投影到平行线方向的长度
  
  # 判断针是否与平行线相交
  hits <- sum(dist_to_line <= projection_lengths)
  
  pi_estimate <- (2 * needle_lengths * toss_nums) / (hits * line_spacing)
  return(pi_estimate)
}
```

当设置`toss_nums=100000`、`needle_lengths=1`、`line_spacing=2`时，则会输出

```R
> buffon(100000, 1, 2)
[1] 3.15338
```
{: .nolineno }

用 Python 来模拟的示例如下：

```python
import numpy as np
from scipy.stats import uniform

def buffon(toss_nums, needle_lengths, line_spacing):
  dist_to_line = uniform.rvs(0, line_spacing / 2, toss_nums)  # 针的中点到平行线的距离
  angle = uniform.rvs(0, np.pi / 2, toss_nums)  # 针与平行线的角度

  # 计算针的半径投影到平行线的长度
  projection_lengths = needle_lengths / 2 * np.sin(angle)

  # 判断针是否与平行线相交
  hits = np.sum(dist_to_line <= projection_lengths)

  pi_estimate = (2 * needle_lengths * toss_nums) / (hits * line_spacing)
  return pi_estimate
```

## 三门问题的计算机模拟

回顾一下三门问题的背景：你站在三个封闭的门前，其中一个门后有奖品，当然奖品在哪一个门后是完全随机的。当你选定一个门以后，主持人打开其余两扇门中的一扇空门，显示门后没有奖品。此时你可以有两种选择，保持原来的选择或者改选另一扇没有被打开的门。

当你作出最后选择以后，如果打开的门后有奖品，这个奖品就归你。现在有三种策略：

1. 坚持原来的选择；
2. 改选另一扇没有被打开的门。

我们已经知道若采取第 1 种策略，那么赢得奖品的概率为 $\frac{1}{3}$；若采取第 2 种策略，那么赢得奖品的概率为 $\frac{2}{3}$。因此当主持人在打开没有奖品的门后，改选另一扇没有被打开的门是一个最优策略。

三门问题的 R 语言模拟示例如下：

```R
# num_trials为试验次数，change指示是否改变选择
monty_hall_simulation <- function(num_trials, change) {
  prize_doors <- sample(1:3, num_trials, replace = TRUE)  # 随机生成奖品的位置 (1, 2, 3表示三个门)
  initial_choices <- sample(1:3, num_trials, replace = TRUE)  # 随机生成初始选择的门
  
  # 主持人打开一个空门  
  open_doors <- integer(num_trials)
  for (i in 1:num_trials) {
    if (initial_choices[i] == prize_doors[i]) {
      remaining_doors <- setdiff(1:3, initial_choices[i])
      open_doors[i] <- sample(remaining_doors, 1)
    } else {
      open_doors[i] <- setdiff(1:3, c(initial_choices[i], prize_doors[i]))
    }
  }
  
  # 根据是否换门来决定最终选择的门
  if (change == TRUE) {
    final_choices <- 6 - (initial_choices + open_doors)
  } else {
    final_choices <- initial_choices
  }
  
  wins <- sum(final_choices == prize_doors)
  return(wins / num_trials)
}
```

当取定`num_trials=10000`和分别设置`change=FALSE`和`change=TRUE`时，则会输出

```R
> monty_hall_simulation(10000, change = TRUE)
[1] 0.6645

> monty_hall_simulation(10000, change = FALSE)
[1] 0.3346
```
{: .nolineno }

Python 模拟示例如下：

```python
import numpy as np

def monty_hall_simulation(num_trials, change):
  prize_doors = np.random.choice(3, size=num_trials, replace=True)  # 随机生成奖品的门位置 (0, 1, 2表示三个门)
  initial_choices = np.random.choice(3, size=num_trials, replace=True)  # 随机生成初始选择的门

  # 主持人打开一个空门
  open_doors = np.zeros(num_trials, dtype=int)
  for i in range(num_trials):
    remaining_doors = np.array([0, 1, 2])
    
    if initial_choices[i] == prize_doors[i]:
      remaining_doors = np.setdiff1d(remaining_doors, initial_choices[i])
      open_doors[i] = np.random.choice(remaining_doors, size=1).item()
    else:
      open_doors[i] = np.setdiff1d(remaining_doors, [initial_choices[i], prize_doors[i]]).item()

  # 根据是否换门来决定最终选择的门
  if change == True:
    final_choices = 3 - (initial_choices + open_doors)
  else:
    final_choices = initial_choices

  wins = np.sum(final_choices == prize_doors)
  return wins / num_trials
```
