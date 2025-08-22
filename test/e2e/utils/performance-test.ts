import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export interface PerformanceTestResult {
  testName: string;
  responseTime: number;
  statusCode: number;
  passed: boolean;
  threshold: number;
}

export class PerformanceTester {
  private results: PerformanceTestResult[] = [];

  async testEndpoint(
    app: INestApplication,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    payload?: any,
    threshold: number = 800,
    testName?: string,
  ): Promise<PerformanceTestResult> {
    const startTime = Date.now();
    
    const req = request(app.getHttpServer())[method](endpoint);
    
    if (payload) {
      req.send(payload);
    }

    const response = await req;
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const result: PerformanceTestResult = {
      testName: testName || `${method.toUpperCase()} ${endpoint}`,
      responseTime,
      statusCode: response.status,
      passed: responseTime < threshold,
      threshold,
    };

    this.results.push(result);
    return result;
  }

  getResults(): PerformanceTestResult[] {
    return this.results;
  }

  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    averageResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const responseTimes = this.results.map(r => r.responseTime);
    
    return {
      total,
      passed,
      failed,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / total,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
    };
  }

  printSummary(): void {
    const summary = this.getSummary();
    console.log('\n📊 PERFORMANCE TEST SUMMARY');
    console.log('============================');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(`Average Response Time: ${summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${summary.maxResponseTime}ms`);
    console.log(`Min Response Time: ${summary.minResponseTime}ms`);
    
    if (summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.testName}: ${r.responseTime}ms (threshold: ${r.threshold}ms)`);
        });
    }
  }
}

export const performanceTester = new PerformanceTester();
