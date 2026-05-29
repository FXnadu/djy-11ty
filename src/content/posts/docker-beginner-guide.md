---
title: Docker 入门指南
description: 容器化技术基础，从安装到部署的完整教程。
date: 2025-05-16
tags: [post, Docker, DevOps]
category: "2024/技术"
---

## 什么是 Docker

Docker 是一个开源的容器化平台，可以让开发者打包应用及其依赖到一个可移植的容器中。

## 核心概念

- **镜像（Image）**：只读模板
- **容器（Container）**：镜像的运行实例
- **仓库（Registry）**：存储镜像的地方

## 常用命令

```bash
# 拉取镜像
docker pull nginx

# 运行容器
docker run -d -p 80:80 nginx

# 查看运行中的容器
docker ps

# 停止容器
docker stop <container_id>
```

## Dockerfile 示例

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Docker Compose

```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
```
