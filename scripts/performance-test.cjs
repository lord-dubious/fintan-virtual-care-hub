#!/usr/bin/env node

/**
 * Performance testing script for the Fintan Virtual Care Hub
 * Tests API endpoints under various load conditions
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class LoadTester {
  constructor(baseURL = 'http://localhost:10000') {
    this.baseURL = baseURL;
    this.results = [];
    this.authToken = null;
  }

  async authenticate() {
    try {
      console.log('🔐 Authenticating...');
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email: 'john.doe@example.com',
        password: 'patient123!'
      });

      if (response.data.success) {
        this.authToken = response.data.data.token;
        console.log('✅ Authentication successful');
        return true;
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (this.authToken) {
      config.headers.Authorization = `Bearer ${this.authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const startTime = performance.now();
    
    try {
      const response = await axios(config);
      const endTime = performance.now();
      
      return {
        success: true,
        status: response.status,
        responseTime: endTime - startTime,
        dataSize: JSON.stringify(response.data).length
      };
    } catch (error) {
      const endTime = performance.now();
      
      return {
        success: false,
        status: error.response?.status || 0,
        responseTime: endTime - startTime,
        error: error.message
      };
    }
  }

  async testEndpoint(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      concurrency = 1,
      requests = 10,
      name = endpoint
    } = options;

    console.log(`\n🧪 Testing ${name} (${requests} requests, concurrency: ${concurrency})`);

    const results = [];
    const batches = Math.ceil(requests / concurrency);

    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, requests - batch * concurrency);
      const promises = [];

      for (let i = 0; i < batchSize; i++) {
        promises.push(this.makeRequest(endpoint, method, data));
      }

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // Progress indicator
      const completed = (batch + 1) * concurrency;
      const progress = Math.min(completed, requests);
      process.stdout.write(`\r   Progress: ${progress}/${requests} requests`);
    }

    console.log(''); // New line after progress

    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);

    const stats = {
      name,
      endpoint,
      totalRequests: results.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: (successfulRequests.length / results.length) * 100,
      averageResponseTime: successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length || 0,
      minResponseTime: Math.min(...successfulRequests.map(r => r.responseTime)) || 0,
      maxResponseTime: Math.max(...successfulRequests.map(r => r.responseTime)) || 0,
      requestsPerSecond: successfulRequests.length / (Math.max(...successfulRequests.map(r => r.responseTime)) / 1000) || 0,
      averageDataSize: successfulRequests.reduce((sum, r) => sum + (r.dataSize || 0), 0) / successfulRequests.length || 0
    };

    this.results.push(stats);
    this.printStats(stats);

    return stats;
  }

  printStats(stats) {
    console.log(`   ✅ Success Rate: ${stats.successRate.toFixed(1)}%`);
    console.log(`   ⏱️  Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms`);
    console.log(`   🚀 Min/Max Response Time: ${stats.minResponseTime.toFixed(2)}ms / ${stats.maxResponseTime.toFixed(2)}ms`);
    console.log(`   📊 Requests/Second: ${stats.requestsPerSecond.toFixed(2)}`);
    console.log(`   📦 Average Data Size: ${(stats.averageDataSize / 1024).toFixed(2)}KB`);

    if (stats.failedRequests > 0) {
      console.log(`   ❌ Failed Requests: ${stats.failedRequests}`);
    }
  }

  async runHealthCheck() {
    console.log('\n🏥 Running Health Check...');
    
    try {
      const result = await this.makeRequest('/health');
      if (result.success) {
        console.log('✅ Server is healthy');
        console.log(`   Response Time: ${result.responseTime.toFixed(2)}ms`);
        return true;
      } else {
        console.log('❌ Server health check failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Server is not responding');
      return false;
    }
  }

  async runBasicTests() {
    console.log('\n📋 Running Basic Performance Tests...');

    const tests = [
      {
        endpoint: '/health',
        name: 'Health Check',
        requests: 50,
        concurrency: 10
      },
      {
        endpoint: '/api/auth/me',
        name: 'Auth Validation',
        requests: 30,
        concurrency: 5
      },
      {
        endpoint: '/api/patients/dashboard',
        name: 'Patient Dashboard',
        requests: 20,
        concurrency: 3
      },
      {
        endpoint: '/api/appointments',
        name: 'Appointments List',
        requests: 25,
        concurrency: 5
      }
    ];

    for (const test of tests) {
      await this.testEndpoint(test.endpoint, test);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async runLoadTests() {
    console.log('\n🔥 Running Load Tests...');

    const loadTests = [
      {
        endpoint: '/api/patients/dashboard',
        name: 'Dashboard Load Test',
        requests: 100,
        concurrency: 20
      },
      {
        endpoint: '/api/appointments',
        name: 'Appointments Load Test',
        requests: 150,
        concurrency: 25
      },
      {
        endpoint: '/health',
        name: 'Health Check Load Test',
        requests: 200,
        concurrency: 50
      }
    ];

    for (const test of loadTests) {
      await this.testEndpoint(test.endpoint, test);
      
      // Longer delay between load tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async runStressTests() {
    console.log('\n💥 Running Stress Tests...');

    const stressTests = [
      {
        endpoint: '/api/patients/dashboard',
        name: 'Dashboard Stress Test',
        requests: 500,
        concurrency: 100
      },
      {
        endpoint: '/health',
        name: 'Health Check Stress Test',
        requests: 1000,
        concurrency: 200
      }
    ];

    for (const test of stressTests) {
      console.log(`⚠️  Warning: This test will send ${test.requests} requests with ${test.concurrency} concurrent connections`);
      
      await this.testEndpoint(test.endpoint, test);
      
      // Recovery time between stress tests
      console.log('   💤 Cooling down for 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  generateReport() {
    console.log('\n📊 Performance Test Report');
    console.log('=' .repeat(50));

    const overallStats = {
      totalTests: this.results.length,
      totalRequests: this.results.reduce((sum, r) => sum + r.totalRequests, 0),
      totalSuccessful: this.results.reduce((sum, r) => sum + r.successfulRequests, 0),
      totalFailed: this.results.reduce((sum, r) => sum + r.failedRequests, 0),
      averageResponseTime: this.results.reduce((sum, r) => sum + r.averageResponseTime, 0) / this.results.length,
      averageSuccessRate: this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length
    };

    console.log(`\nOverall Statistics:`);
    console.log(`  Total Tests: ${overallStats.totalTests}`);
    console.log(`  Total Requests: ${overallStats.totalRequests}`);
    console.log(`  Successful Requests: ${overallStats.totalSuccessful}`);
    console.log(`  Failed Requests: ${overallStats.totalFailed}`);
    console.log(`  Average Success Rate: ${overallStats.averageSuccessRate.toFixed(1)}%`);
    console.log(`  Average Response Time: ${overallStats.averageResponseTime.toFixed(2)}ms`);

    console.log(`\nDetailed Results:`);
    this.results.forEach(result => {
      console.log(`\n  ${result.name}:`);
      console.log(`    Endpoint: ${result.endpoint}`);
      console.log(`    Success Rate: ${result.successRate.toFixed(1)}%`);
      console.log(`    Avg Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
      console.log(`    Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);
      
      if (result.averageResponseTime > 500) {
        console.log(`    ⚠️  WARNING: Response time exceeds 500ms target`);
      }
      
      if (result.successRate < 95) {
        console.log(`    ❌ ERROR: Success rate below 95%`);
      }
    });

    // Performance recommendations
    console.log(`\n💡 Recommendations:`);
    
    const slowEndpoints = this.results.filter(r => r.averageResponseTime > 500);
    if (slowEndpoints.length > 0) {
      console.log(`  - Optimize slow endpoints: ${slowEndpoints.map(r => r.name).join(', ')}`);
    }

    const unreliableEndpoints = this.results.filter(r => r.successRate < 95);
    if (unreliableEndpoints.length > 0) {
      console.log(`  - Improve reliability for: ${unreliableEndpoints.map(r => r.name).join(', ')}`);
    }

    if (overallStats.averageResponseTime < 200) {
      console.log(`  ✅ Excellent performance! All endpoints are fast.`);
    } else if (overallStats.averageResponseTime < 500) {
      console.log(`  ✅ Good performance. Consider optimizing slower endpoints.`);
    } else {
      console.log(`  ⚠️  Performance needs improvement. Focus on response time optimization.`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'basic';
  const baseURL = args[1] || 'http://localhost:10000';

  console.log('🚀 Fintan Virtual Care Hub - Performance Testing');
  console.log(`   Target: ${baseURL}`);
  console.log(`   Test Type: ${testType}`);

  const tester = new LoadTester(baseURL);

  // Health check first
  const isHealthy = await tester.runHealthCheck();
  if (!isHealthy) {
    console.log('❌ Server is not healthy. Aborting tests.');
    process.exit(1);
  }

  // Authenticate
  const isAuthenticated = await tester.authenticate();
  if (!isAuthenticated) {
    console.log('⚠️  Authentication failed. Some tests may fail.');
  }

  // Run tests based on type
  switch (testType) {
    case 'basic':
      await tester.runBasicTests();
      break;
    case 'load':
      await tester.runBasicTests();
      await tester.runLoadTests();
      break;
    case 'stress':
      await tester.runBasicTests();
      await tester.runLoadTests();
      await tester.runStressTests();
      break;
    case 'all':
      await tester.runBasicTests();
      await tester.runLoadTests();
      await tester.runStressTests();
      break;
    default:
      console.log('❌ Invalid test type. Use: basic, load, stress, or all');
      process.exit(1);
  }

  // Generate report
  tester.generateReport();

  console.log('\n✅ Performance testing completed!');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Performance testing failed:', error);
    process.exit(1);
  });
}

module.exports = { LoadTester };
