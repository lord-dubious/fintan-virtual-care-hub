import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { performance } from 'perf_hooks';
import { PrismaClient } from '@prisma/client';

// Import your app
const app = require('../../src/server');
const prisma = new PrismaClient();

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
}

class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];
  private readonly TARGET_RESPONSE_TIME = 500; // 500ms target

  async measureEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    requestFn: () => Promise<request.Response>
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const response = await requestFn();
    const endTime = performance.now();
    
    const metric: PerformanceMetrics = {
      endpoint,
      method,
      responseTime: endTime - startTime,
      statusCode: response.status,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    return metric;
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  getAverageResponseTime(endpoint?: string): number {
    const filteredMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (filteredMetrics.length === 0) return 0;
    
    const total = filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return total / filteredMetrics.length;
  }

  getSlowEndpoints(): PerformanceMetrics[] {
    return this.metrics.filter(m => m.responseTime > this.TARGET_RESPONSE_TIME);
  }

  generateReport(): string {
    const report = [
      '=== API Performance Report ===',
      `Total requests tested: ${this.metrics.length}`,
      `Average response time: ${this.getAverageResponseTime().toFixed(2)}ms`,
      `Target response time: ${this.TARGET_RESPONSE_TIME}ms`,
      '',
      'Endpoint Performance:',
      ...this.getEndpointSummary(),
      '',
      'Slow Endpoints (> 500ms):',
      ...this.getSlowEndpoints().map(m => 
        `  ${m.method} ${m.endpoint}: ${m.responseTime.toFixed(2)}ms`
      )
    ];

    return report.join('\n');
  }

  private getEndpointSummary(): string[] {
    const endpointGroups = this.metrics.reduce((groups, metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetrics[]>);

    return Object.entries(endpointGroups).map(([endpoint, metrics]) => {
      const avgTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
      const maxTime = Math.max(...metrics.map(m => m.responseTime));
      const minTime = Math.min(...metrics.map(m => m.responseTime));
      
      return `  ${endpoint}: avg=${avgTime.toFixed(2)}ms, min=${minTime.toFixed(2)}ms, max=${maxTime.toFixed(2)}ms`;
    });
  }
}

describe('API Performance Tests', () => {
  let authToken: string;
  let patientToken: string;
  let providerToken: string;
  let tracker: PerformanceTracker;

  beforeAll(async () => {
    tracker = new PerformanceTracker();

    // Create test users and get auth tokens
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@drfintan.com',
        password: 'admin123!'
      });

    authToken = adminResponse.body.data.token;

    const patientResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'patient123!'
      });

    patientToken = patientResponse.body.data.token;

    const providerResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dr.smith@drfintan.com',
        password: 'provider123!'
      });

    providerToken = providerResponse.body.data.token;
  });

  afterAll(async () => {
    console.log('\n' + tracker.generateReport());
    await prisma.$disconnect();
  });

  describe('Authentication Endpoints', () => {
    it('should handle login requests efficiently', async () => {
      const metric = await tracker.measureEndpoint('/api/auth/login', 'POST', () =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'john.doe@example.com',
            password: 'patient123!'
          })
      );

      expect(metric.statusCode).toBe(200);
      expect(metric.responseTime).toBeLessThan(500);
    });

    it('should handle token validation efficiently', async () => {
      const metric = await tracker.measureEndpoint('/api/auth/me', 'GET', () =>
        request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authToken}`)
      );

      expect(metric.statusCode).toBe(200);
      expect(metric.responseTime).toBeLessThan(200);
    });
  });

  describe('Dashboard Endpoints', () => {
    it('should load patient dashboard quickly', async () => {
      const metric = await tracker.measureEndpoint('/api/patients/dashboard', 'GET', () =>
        request(app)
          .get('/api/patients/dashboard')
          .set('Authorization', `Bearer ${patientToken}`)
      );

      expect(metric.statusCode).toBe(200);
      expect(metric.responseTime).toBeLessThan(500);
    });

    it('should load provider dashboard quickly', async () => {
      const metric = await tracker.measureEndpoint('/api/providers/dashboard', 'GET', () =>
        request(app)
          .get('/api/providers/dashboard')
          .set('Authorization', `Bearer ${providerToken}`)
      );

      expect(metric.statusCode).toBe(200);
      expect(metric.responseTime).toBeLessThan(500);
    });
  });

  describe('Appointment Endpoints', () => {
    it('should list appointments efficiently', async () => {
      const metric = await tracker.measureEndpoint('/api/appointments', 'GET', () =>
        request(app)
          .get('/api/appointments')
          .set('Authorization', `Bearer ${patientToken}`)
      );

      expect(metric.statusCode).toBe(200);
      expect(metric.responseTime).toBeLessThan(500);
    });

    it('should handle appointment creation efficiently', async () => {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 7);
      appointmentDate.setHours(14, 0, 0, 0);

      const metric = await tracker.measureEndpoint('/api/appointments', 'POST', () =>
        request(app)
          .post('/api/appointments')
          .set('Authorization', `Bearer ${patientToken}`)
          .send({
            providerId: 'provider-id',
            appointmentDate: appointmentDate.toISOString(),
            duration: 30,
            consultationType: 'VIDEO',
            reason: 'Performance test consultation'
          })
      );

      // Note: This might fail due to provider validation, but we're testing response time
      expect(metric.responseTime).toBeLessThan(1000);
    });
  });

  describe('Availability Endpoints', () => {
    it('should fetch availability slots quickly', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const metric = await tracker.measureEndpoint('/api/availability/slots', 'GET', () =>
        request(app)
          .get('/api/availability/slots')
          .query({
            providerId: 'provider-id',
            startDate,
            endDate,
            slotDuration: 30
          })
      );

      expect(metric.responseTime).toBeLessThan(500);
    });

    it('should check conflicts efficiently', async () => {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 1);
      appointmentDate.setHours(10, 0, 0, 0);

      const metric = await tracker.measureEndpoint('/api/availability/check-conflicts', 'POST', () =>
        request(app)
          .post('/api/availability/check-conflicts')
          .send({
            providerId: 'provider-id',
            appointmentDate: appointmentDate.toISOString(),
            duration: 30
          })
      );

      expect(metric.responseTime).toBeLessThan(300);
    });
  });

  describe('Medical Records Endpoints', () => {
    it('should list medical records efficiently', async () => {
      const metric = await tracker.measureEndpoint('/api/medical-records', 'GET', () =>
        request(app)
          .get('/api/medical-records')
          .set('Authorization', `Bearer ${patientToken}`)
      );

      expect(metric.statusCode).toBe(200);
      expect(metric.responseTime).toBeLessThan(500);
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent requests to dashboard', async () => {
      const concurrentRequests = 10;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        tracker.measureEndpoint(`/api/patients/dashboard-${i}`, 'GET', () =>
          request(app)
            .get('/api/patients/dashboard')
            .set('Authorization', `Bearer ${patientToken}`)
        )
      );

      const results = await Promise.all(promises);
      
      // All requests should complete within reasonable time
      results.forEach(result => {
        expect(result.responseTime).toBeLessThan(1000);
        expect(result.statusCode).toBe(200);
      });

      // Average response time should still be good under load
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      expect(avgResponseTime).toBeLessThan(750);
    });

    it('should handle concurrent appointment lookups', async () => {
      const concurrentRequests = 5;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        tracker.measureEndpoint(`/api/appointments-load-${i}`, 'GET', () =>
          request(app)
            .get('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
        )
      );

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.responseTime).toBeLessThan(800);
        expect(result.statusCode).toBe(200);
      });
    });
  });

  describe('Database Performance', () => {
    it('should handle complex queries efficiently', async () => {
      const metric = await tracker.measureEndpoint('/api/providers/dashboard', 'GET', () =>
        request(app)
          .get('/api/providers/dashboard')
          .set('Authorization', `Bearer ${providerToken}`)
      );

      // Provider dashboard has complex aggregations
      expect(metric.responseTime).toBeLessThan(750);
      expect(metric.statusCode).toBe(200);
    });
  });
});
