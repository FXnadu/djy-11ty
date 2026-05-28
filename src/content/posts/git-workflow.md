---
title: Git 工作流最佳实践
description: 团队协作中的 Git 分支管理和提交规范。
date: 2026-05-12
tags: [post, Git, 开发工具]
category: 技术
---

## 分支策略

### Git Flow

- **main**：生产分支
- **develop**：开发分支
- **feature/***：功能分支
- **release/***：发布分支
- **hotfix/***：热修复分支

### GitHub Flow

更简单的工作流：
1. 从 main 创建功能分支
2. 提交更改
3. 创建 Pull Request
4. 代码审查
5. 合并到 main

## 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `test`: 测试

## 常用命令

```bash
# 创建并切换分支
git checkout -b feature/new-feature

# 查看分支
git branch -a

# 合并分支
git merge feature/new-feature
```
