/**
 * Performance Tests - Load Testing
 * Tests application performance under various loads
 */

const request = require('supertest');

const BASE_URL = 'http://localhost:5002';

describe('Performance Tests', () => {
  describe('API Response Times', () => {
    test('GET /api/files should respond within 100ms', async () => {
      const startTime = Date.now();
      
      await request(BASE_URL)
        .get('/api/files')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(100);
    });

    test('POST /api/files should respond within 200ms', async () => {
      const startTime = Date.now();
      
      await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: 'perf-test.js',
          content: 'console.log("test");'
        })
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(200);

      // Cleanup
      await request(BASE_URL).delete('/api/files/perf-test.js');
    });

    test('POST /api/run should respond within 1000ms for simple code', async () => {
      const startTime = Date.now();
      
      await request(BASE_URL)
        .post('/api/run')
        .send({
          language: 'javascript',
          code: 'console.log("test");',
          fileName: 'test.js'
        })
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Concurrent Requests', () => {
    test('should handle 10 concurrent file reads', async () => {
      // Create a test file first
      await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: 'concurrent-test.js',
          content: 'console.log("test");'
        });

      const promises = Array(10).fill(null).map(() =>
        request(BASE_URL)
          .get('/api/files/concurrent-test.js')
          .expect(200)
      );

      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All 10 requests should complete within 1 second
      expect(totalTime).toBeLessThan(1000);

      // Cleanup
      await request(BASE_URL).delete('/api/files/concurrent-test.js');
    });

    test('should handle 5 concurrent code executions', async () => {
      const promises = Array(5).fill(null).map((_, index) =>
        request(BASE_URL)
          .post('/api/run')
          .send({
            language: 'javascript',
            code: `console.log("Test ${index}");`,
            fileName: `test-${index}.js`
          })
          .expect(200)
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All executions should complete within 5 seconds
      expect(totalTime).toBeLessThan(5000);

      // All should succeed
      results.forEach(result => {
        expect(result.body.success).toBe(true);
      });
    });
  });

  describe('Large File Handling', () => {
    test('should handle large file creation (1MB)', async () => {
      const largeContent = 'x'.repeat(1024 * 1024); // 1MB of data

      const startTime = Date.now();
      
      const response = await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: 'large-file.txt',
          content: largeContent
        })
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Should complete within 2 seconds

      // Cleanup
      await request(BASE_URL).delete('/api/files/large-file.txt');
    });

    test('should handle reading large file (1MB)', async () => {
      const largeContent = 'x'.repeat(1024 * 1024);

      // Create large file
      await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: 'large-read.txt',
          content: largeContent
        });

      const startTime = Date.now();
      
      const response = await request(BASE_URL)
        .get('/api/files/large-read.txt')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.body.success).toBe(true);
      expect(response.body.content.length).toBe(largeContent.length);
      expect(responseTime).toBeLessThan(2000);

      // Cleanup
      await request(BASE_URL).delete('/api/files/large-read.txt');
    });
  });

  describe('Memory Usage', () => {
    test('should not leak memory during multiple file operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform 100 file operations
      for (let i = 0; i < 100; i++) {
        await request(BASE_URL)
          .post('/api/files')
          .send({
            fileName: `temp-${i}.js`,
            content: `console.log(${i});`
          });

        await request(BASE_URL)
          .get(`/api/files/temp-${i}.js`);

        await request(BASE_URL)
          .delete(`/api/files/temp-${i}.js`);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be less than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});

