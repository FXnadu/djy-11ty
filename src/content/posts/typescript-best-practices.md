---
title: TypeScript 最佳实践
description: 编写更健壮、可维护的 TypeScript 代码。
date: 2026-05-18
tags: [post, TypeScript, 前端]
category: 技术
---

## 严格模式

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## 类型定义

### 接口 vs 类型别名

```typescript
// 接口 - 可扩展
interface User {
  name: string;
  age: number;
}

// 类型别名 - 更灵活
type ID = string | number;
```

### 泛型

```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

## 类型守卫

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

## 实用工具类型

- `Partial<T>`
- `Required<T>`
- `Pick<T, K>`
- `Omit<T, K>`
- `Record<K, T>`
