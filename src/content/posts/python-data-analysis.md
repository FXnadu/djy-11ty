---
title: Python 数据分析入门
description: 使用 Pandas 和 Matplotlib 进行数据分析和可视化。
date: 2025-05-25
tags: [post, Python, 数据科学]
category: "2024/教程"
---

## 环境搭建

```bash
pip install pandas matplotlib numpy
```

## Pandas 基础

Pandas 是 Python 最强大的数据处理库。

```python
import pandas as pd

# 读取数据
df = pd.read_csv('data.csv')

# 查看数据概览
print(df.head())
print(df.describe())
```

## 数据可视化

使用 Matplotlib 创建图表：

```python
import matplotlib.pyplot as plt

df['column'].plot(kind='bar')
plt.show()
```

## 实战案例

分析销售数据，找出最畅销的产品。
