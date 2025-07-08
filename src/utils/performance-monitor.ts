/**
 * Performance monitoring utilities for the frontend application
 */

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput?: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory: MemoryInfo;
}

interface PerformanceReport {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  resourceLoadTimes: Array<{
    name: string;
    duration: number;
    size?: number;
  }>;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: WebVitalsMetric[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.handleNavigationEntry(entry as PerformanceNavigationTiming);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            this.handlePaintEntry(entry);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.handleLCPEntry(entry);
          }
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe layout shift
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !('hadRecentInput' in entry && entry.hadRecentInput)) {
            this.handleLayoutShiftEntry(entry);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            this.handleFirstInputEntry(entry);
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const pageLoadTime = entry.loadEventEnd - entry.startTime;
    const domContentLoaded = entry.domContentLoadedEventEnd - entry.startTime;

    this.addMetric('page-load-time', pageLoadTime);
    this.addMetric('dom-content-loaded', domContentLoaded);
  }

  private handlePaintEntry(entry: PerformanceEntry): void {
    if (entry.name === 'first-contentful-paint') {
      this.addMetric('first-contentful-paint', entry.startTime);
    }
  }

  private handleLCPEntry(entry: PerformanceEntry): void {
    this.addMetric('largest-contentful-paint', entry.startTime);
  }

  private handleLayoutShiftEntry(entry: PerformanceEntry): void {
    const currentCLS = this.metrics
      .filter(m => m.name === 'cumulative-layout-shift')
      .reduce((sum, m) => sum + m.value, 0);

    this.addMetric('cumulative-layout-shift', currentCLS + (entry as LayoutShiftEntry).value);
  }

  private handleFirstInputEntry(entry: PerformanceEntry): void {
    const fid = (entry as FirstInputEntry).processingStart - entry.startTime;
    this.addMetric('first-input-delay', fid);
  }

  private addMetric(name: string, value: number): void {
    const rating = this.getRating(name, value);
    
    this.metrics.push({
      name,
      value,
      rating,
      timestamp: Date.now()
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}: ${value.toFixed(2)}ms (${rating})`);
    }
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      'first-contentful-paint': { good: 1800, poor: 3000 },
      'largest-contentful-paint': { good: 2500, poor: 4000 },
      'first-input-delay': { good: 100, poor: 300 },
      'cumulative-layout-shift': { good: 0.1, poor: 0.25 },
      'page-load-time': { good: 3000, poor: 5000 },
      'dom-content-loaded': { good: 1500, poor: 3000 }
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Measure the performance of a specific operation
   */
  async measureOperation<T>(name: string, operation: () => Promise<T> | T): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.addMetric(`operation-${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.addMetric(`operation-${name}-error`, duration);
      throw error;
    }
  }

  /**
   * Measure component render time
   */
  measureRender(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.addMetric(`render-${componentName}`, duration);
    };
  }

  /**
   * Get current performance report
   */
  getPerformanceReport(): PerformanceReport {
    const getLatestMetric = (name: string) => {
      const metric = this.metrics
        .filter(m => m.name === name)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      return metric?.value || 0;
    };

    const report: PerformanceReport = {
      pageLoadTime: getLatestMetric('page-load-time'),
      domContentLoaded: getLatestMetric('dom-content-loaded'),
      firstContentfulPaint: getLatestMetric('first-contentful-paint'),
      largestContentfulPaint: getLatestMetric('largest-contentful-paint'),
      cumulativeLayoutShift: getLatestMetric('cumulative-layout-shift'),
      firstInputDelay: getLatestMetric('first-input-delay'),
      timeToInteractive: 0, // Would need additional measurement
      resourceLoadTimes: this.getResourceLoadTimes(),
    };

    // Add memory usage if available
    if ('memory' in performance) {
      const perfWithMemory = performance as PerformanceWithMemory;
      report.memoryUsage = {
        usedJSHeapSize: perfWithMemory.memory.usedJSHeapSize,
        totalJSHeapSize: perfWithMemory.memory.totalJSHeapSize,
        jsHeapSizeLimit: perfWithMemory.memory.jsHeapSizeLimit,
      };
    }

    return report;
  }

  private getResourceLoadTimes(): Array<{ name: string; duration: number; size?: number }> {
    if (typeof window === 'undefined') return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || undefined
    }));
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, { value: number; rating: string; count: number }> {
    const summary: Record<string, { value: number; rating: string; count: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          value: metric.value,
          rating: metric.rating,
          count: 1
        };
      } else {
        summary[metric.name].count++;
        // Keep the latest value
        if (metric.timestamp > summary[metric.name].value) {
          summary[metric.name].value = metric.value;
          summary[metric.name].rating = metric.rating;
        }
      }
    });

    return summary;
  }

  /**
   * Send performance data to analytics
   */
  sendToAnalytics(): void {
    const report = this.getPerformanceReport();
    
    // In a real application, you would send this to your analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: analytics.track('performance_report', report);
      console.log('Performance report ready for analytics:', report);
    }
  }

  /**
   * Clean up observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export utility functions
export const measureOperation = performanceMonitor.measureOperation.bind(performanceMonitor);
export const measureRender = performanceMonitor.measureRender.bind(performanceMonitor);
export const getPerformanceReport = performanceMonitor.getPerformanceReport.bind(performanceMonitor);

// Auto-send performance data on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.sendToAnalytics();
  });
}
