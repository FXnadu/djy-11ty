---
title: React Hooks 深度解析
description: 深入理解 useState、useEffect 等核心 Hooks 的工作原理。
date: 2022-05-20
tags: [post, React, 前端]
category: "2025/技术"
---

## 为什么需要 Hooks

Hooks 让我们可以在函数组件中使用状态和其他 React 特性。

## useState

```javascript
const [count, setCount] = useState(0);
```

### 函数式更新

```javascript
setCount(prev => prev + 1);
```

## useEffect

处理副作用：

```javascript
useEffect(() => {
  // 执行副作用
  return () => {
    // 清理函数
  };
}, [dependencies]);
```

## useCallback & useMemo

优化性能：

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

## 自定义 Hooks

提取可复用逻辑：

```javascript
function useLocalStorage(key, initialValue) {
  // 实现...
}
```
