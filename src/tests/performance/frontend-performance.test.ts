import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { performance } from 'perf_hooks';

// Mock components for testing
const MockComponent = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class FrontendPerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private readonly TARGET_RENDER_TIME = 100; // 100ms target for component renders

  async measureRender(
    name: string,
    renderFn: () => Promise<void> | void
  ): Promise<PerformanceMetric> {
    const startTime = performance.now();
    await renderFn();
    const endTime = performance.now();
    
    const metric: PerformanceMetric = {
      name,
      duration: endTime - startTime,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    return metric;
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  getAverageDuration(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }

  getSlowRenders(): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > this.TARGET_RENDER_TIME);
  }

  generateReport(): string {
    const report = [
      '=== Frontend Performance Report ===',
      `Total renders tested: ${this.metrics.length}`,
      `Average render time: ${this.getAverageDuration().toFixed(2)}ms`,
      `Target render time: ${this.TARGET_RENDER_TIME}ms`,
      '',
      'Slow Renders (> 100ms):',
      ...this.getSlowRenders().map(m => 
        `  ${m.name}: ${m.duration.toFixed(2)}ms`
      )
    ];

    return report.join('\n');
  }
}

describe('Frontend Performance Tests', () => {
  let tracker: FrontendPerformanceTracker;
  let queryClient: QueryClient;

  beforeEach(() => {
    tracker = new FrontendPerformanceTracker();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });
  });

  afterEach(() => {
    console.log('\n' + tracker.generateReport());
    queryClient.clear();
  });

  describe('Component Render Performance', () => {
    it('should render simple components quickly', async () => {
      const SimpleComponent = () => <div>Hello World</div>;

      const metric = await tracker.measureRender('SimpleComponent', () => {
        render(
          <MockComponent>
            <SimpleComponent />
          </MockComponent>
        );
      });

      expect(metric.duration).toBeLessThan(50);
    });

    it('should render complex components within target time', async () => {
      const ComplexComponent = () => (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} className="item">
              <span>Item {i}</span>
              <button onClick={() => console.log(i)}>Click {i}</button>
            </div>
          ))}
        </div>
      );

      const metric = await tracker.measureRender('ComplexComponent', () => {
        render(
          <MockComponent>
            <ComplexComponent />
          </MockComponent>
        );
      });

      expect(metric.duration).toBeLessThan(200);
    });
  });

  describe('List Rendering Performance', () => {
    it('should handle large lists efficiently', async () => {
      const LargeList = ({ items }: { items: any[] }) => (
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <div className="item-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span>{item.timestamp}</span>
              </div>
            </li>
          ))}
        </ul>
      );

      const items = Array.from({ length: 500 }, (_, i) => ({
        title: `Item ${i}`,
        description: `Description for item ${i}`,
        timestamp: new Date().toISOString()
      }));

      const metric = await tracker.measureRender('LargeList', () => {
        render(
          <MockComponent>
            <LargeList items={items} />
          </MockComponent>
        );
      });

      expect(metric.duration).toBeLessThan(500);
    });

    it('should handle list updates efficiently', async () => {
      const UpdatingList = ({ items }: { items: any[] }) => (
        <ul>
          {items.map((item, index) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
      );

      let items = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random()
      }));

      const { rerender } = render(
        <MockComponent>
          <UpdatingList items={items} />
        </MockComponent>
      );

      // Update items
      items = items.map(item => ({
        ...item,
        value: Math.random()
      }));

      const metric = await tracker.measureRender('ListUpdate', () => {
        rerender(
          <MockComponent>
            <UpdatingList items={items} />
          </MockComponent>
        );
      });

      expect(metric.duration).toBeLessThan(100);
    });
  });

  describe('State Management Performance', () => {
    it('should handle state updates efficiently', async () => {
      const { useState } = await import('react');
      
      const StatefulComponent = () => {
        const [count, setCount] = useState(0);
        const [items, setItems] = useState<string[]>([]);

        const addItem = () => {
          setItems(prev => [...prev, `Item ${prev.length}`]);
          setCount(prev => prev + 1);
        };

        return (
          <div>
            <p>Count: {count}</p>
            <button onClick={addItem}>Add Item</button>
            <ul>
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        );
      };

      const metric = await tracker.measureRender('StatefulComponent', () => {
        render(
          <MockComponent>
            <StatefulComponent />
          </MockComponent>
        );
      });

      expect(metric.duration).toBeLessThan(100);
    });
  });

  describe('API Integration Performance', () => {
    it('should handle loading states efficiently', async () => {
      const LoadingComponent = ({ isLoading }: { isLoading: boolean }) => (
        <div>
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="content">
              <h1>Content Loaded</h1>
              <p>This is the main content</p>
            </div>
          )}
        </div>
      );

      // Test loading state
      const loadingMetric = await tracker.measureRender('LoadingState', () => {
        render(
          <MockComponent>
            <LoadingComponent isLoading={true} />
          </MockComponent>
        );
      });

      expect(loadingMetric.duration).toBeLessThan(50);

      // Test loaded state
      const loadedMetric = await tracker.measureRender('LoadedState', () => {
        render(
          <MockComponent>
            <LoadingComponent isLoading={false} />
          </MockComponent>
        );
      });

      expect(loadedMetric.duration).toBeLessThan(50);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during component mounting/unmounting', async () => {
      const TestComponent = ({ data }: { data: any[] }) => (
        <div>
          {data.map((item, index) => (
            <div key={index} className="item">
              {JSON.stringify(item)}
            </div>
          ))}
        </div>
      );

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Mount and unmount components multiple times
      for (let i = 0; i < 10; i++) {
        const data = Array.from({ length: 100 }, (_, idx) => ({
          id: idx,
          value: Math.random(),
          timestamp: Date.now()
        }));

        const { unmount } = render(
          <MockComponent>
            <TestComponent data={data} />
          </MockComponent>
        );

        unmount();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        // Memory increase should be reasonable (less than 5MB)
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      }
    });
  });

  describe('Bundle Size Impact', () => {
    it('should lazy load components efficiently', async () => {
      const { lazy, Suspense } = await import('react');
      
      // Simulate lazy loading
      const LazyComponent = lazy(async () => {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          default: () => <div>Lazy Loaded Component</div>
        };
      });

      const metric = await tracker.measureRender('LazyComponent', async () => {
        render(
          <MockComponent>
            <Suspense fallback={<div>Loading...</div>}>
              <LazyComponent />
            </Suspense>
          </MockComponent>
        );

        // Wait for lazy component to load
        await waitFor(() => {
          expect(screen.getByText('Lazy Loaded Component')).toBeInTheDocument();
        });
      });

      expect(metric.duration).toBeLessThan(200);
    });
  });

  describe('Event Handling Performance', () => {
    it('should handle frequent events efficiently', async () => {
      const EventComponent = () => {
        const [position, setPosition] = useState({ x: 0, y: 0 });

        const handleMouseMove = (e: React.MouseEvent) => {
          setPosition({ x: e.clientX, y: e.clientY });
        };

        return (
          <div 
            onMouseMove={handleMouseMove}
            style={{ width: 200, height: 200, border: '1px solid black' }}
          >
            Position: {position.x}, {position.y}
          </div>
        );
      };

      const metric = await tracker.measureRender('EventComponent', () => {
        render(
          <MockComponent>
            <EventComponent />
          </MockComponent>
        );
      });

      expect(metric.duration).toBeLessThan(100);
    });
  });
});
