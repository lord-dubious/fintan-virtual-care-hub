import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Debounce hook for search and input optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll and resize events
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY,
  };
};

// Optimistic updates hook
export const useOptimisticUpdate = <T>(
  queryKey: string[],
  updateFn: (oldData: T | undefined, newData: Partial<T>) => T
) => {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (newData: Partial<T>) => {
      queryClient.setQueryData<T>(queryKey, (oldData) =>
        updateFn(oldData, newData)
      );
    },
    [queryClient, queryKey, updateFn]
  );

  const revertUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return { optimisticUpdate, revertUpdate };
};

// Prefetch hook for predictive loading
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchQuery = useCallback(
    (queryKey: string[], queryFn: () => Promise<unknown>, options?: Record<string, unknown>) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
      });
    },
    [queryClient]
  );

  const prefetchOnHover = useCallback(
    (queryKey: string[], queryFn: () => Promise<unknown>) => {
      return {
        onMouseEnter: () => prefetchQuery(queryKey, queryFn),
      };
    },
    [prefetchQuery]
  );

  return { prefetchQuery, prefetchOnHover };
};

// Memory usage optimization hook
export const useMemoryOptimization = () => {
  const queryClient = useQueryClient();

  const clearUnusedCache = useCallback(() => {
    queryClient.getQueryCache().clear();
  }, [queryClient]);

  const optimizeMemory = useCallback(() => {
    // Remove queries that haven't been used in the last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    
    queryClient.getQueryCache().getAll().forEach((query) => {
      if (query.state.dataUpdatedAt < tenMinutesAgo) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, [queryClient]);

  // Auto-cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      setTimeout(optimizeMemory, 1000);
    };
  }, [optimizeMemory]);

  return { clearUnusedCache, optimizeMemory };
};

// Image lazy loading hook
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver();

  useEffect(() => {
    if (hasIntersected && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setIsError(true);
      };
      img.src = src;
    }
  }, [hasIntersected, src]);

  return {
    targetRef,
    imageSrc,
    isLoaded,
    isError,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
  });

  useEffect(() => {
    const endTime = Date.now();
    const renderTime = endTime - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - Renders: ${renderCount.current}, Time: ${renderTime}ms`);
    }
  });

  const logPerformance = useCallback((action: string, duration: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - ${action}: ${duration}ms`);
    }
  }, [componentName]);

  return { renderCount: renderCount.current, logPerformance };
};

// Batch updates hook for multiple state changes
export const useBatchUpdates = () => {
  const [updates, setUpdates] = useState<(() => void)[]>([]);

  const batchUpdate = useCallback((updateFn: () => void) => {
    setUpdates(prev => [...prev, updateFn]);
  }, []);

  const flushUpdates = useCallback(() => {
    updates.forEach(update => update());
    setUpdates([]);
  }, [updates]);

  // Auto-flush updates on next tick
  useEffect(() => {
    if (updates.length > 0) {
      const timeout = setTimeout(flushUpdates, 0);
      return () => clearTimeout(timeout);
    }
  }, [updates, flushUpdates]);

  return { batchUpdate, flushUpdates };
};

// Memoized component wrapper
export const withMemoization = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, areEqual);
};
