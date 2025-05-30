
/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  updateTime: number;
  lastFrameTime: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    updateTime: 0,
    lastFrameTime: 0
  };

  private frameCount = 0;
  private lastTime = performance.now();
  private fpsUpdateInterval = 1000; // Update FPS every second

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    const updateMetrics = () => {
      const currentTime = performance.now();
      this.frameCount++;

      // Calculate FPS
      if (currentTime - this.lastTime >= this.fpsUpdateInterval) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;

        // Update memory usage if available
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
      }

      requestAnimationFrame(updateMetrics);
    };

    requestAnimationFrame(updateMetrics);
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  measureRenderTime<T>(fn: () => T): T {
    const start = performance.now();
    const result = fn();
    this.metrics.renderTime = performance.now() - start;
    return result;
  }

  measureUpdateTime<T>(fn: () => T): T {
    const start = performance.now();
    const result = fn();
    this.metrics.updateTime = performance.now() - start;
    return result;
  }
}

/**
 * Lazy loading utility
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(importFn);
}

/**
 * Memoization utilities
 */
export class MemoCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Create memoized function with cache
 */
export function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return,
  getKey?: (...args: Args) => string,
  maxSize = 100
): (...args: Args) => Return {
  const cache = new MemoCache<string, Return>(maxSize);
  
  return (...args: Args): Return => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Batch operations to reduce re-renders
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processFn: (items: T[]) => void;
  private timeout: NodeJS.Timeout | null = null;
  private delay: number;

  constructor(processFn: (items: T[]) => void, delay = 16) {
    this.processFn = processFn;
    this.delay = delay;
  }

  add(item: T): void {
    this.queue.push(item);
    
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  flush(): void {
    if (this.queue.length > 0) {
      this.processFn([...this.queue]);
      this.queue = [];
    }
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

/**
 * Object pooling for reducing GC pressure
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize = 10,
    maxSize = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool = [];
  }

  size(): number {
    return this.pool.length;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React import for lazy components
import React from 'react';
