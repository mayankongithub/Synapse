/**
 * Integration Tests - File Operations
 * Tests the complete flow of file operations from frontend to backend
 */

const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:5002';
const WORKSPACE_PATH = path.join(__dirname, '../../dev-agent/backend/workspace');

describe('File Operations Integration Tests', () => {
  const testFileName = 'integration-test.js';
  const testContent = 'console.log("Integration test");';

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.unlink(path.join(WORKSPACE_PATH, testFileName));
    } catch {
      // File might not exist
    }
  });

  describe('Complete File Lifecycle', () => {
    test('should create, read, update, and delete a file', async () => {
      // 1. Create file
      const createResponse = await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: testFileName,
          content: testContent
        })
        .expect(200);

      expect(createResponse.body.success).toBe(true);

      // 2. Verify file exists in filesystem
      const filePath = path.join(WORKSPACE_PATH, testFileName);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // 3. Read file via API
      const readResponse = await request(BASE_URL)
        .get(`/api/files/${testFileName}`)
        .expect(200);

      expect(readResponse.body.success).toBe(true);
      expect(readResponse.body.content).toBe(testContent);

      // 4. Update file
      const updatedContent = 'console.log("Updated content");';
      const updateResponse = await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: testFileName,
          content: updatedContent
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);

      // 5. Verify update
      const readUpdatedResponse = await request(BASE_URL)
        .get(`/api/files/${testFileName}`)
        .expect(200);

      expect(readUpdatedResponse.body.content).toBe(updatedContent);

      // 6. Delete file
      const deleteResponse = await request(BASE_URL)
        .delete(`/api/files/${testFileName}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // 7. Verify deletion
      const existsAfterDelete = await fs.access(filePath).then(() => true).catch(() => false);
      expect(existsAfterDelete).toBe(false);
    });
  });

  describe('File Listing Integration', () => {
    test('should list files after creation', async () => {
      // Create a file
      await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: testFileName,
          content: testContent
        })
        .expect(200);

      // List files
      const listResponse = await request(BASE_URL)
        .get('/api/files')
        .expect(200);

      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.files).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: testFileName })
        ])
      );
    });
  });

  describe('Code Execution Integration', () => {
    test('should create file and execute it', async () => {
      const code = 'console.log("Hello from integration test");';

      // Create file
      await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: testFileName,
          content: code
        })
        .expect(200);

      // Execute file
      const runResponse = await request(BASE_URL)
        .post('/api/run')
        .send({
          language: 'javascript',
          code: code,
          fileName: testFileName
        })
        .expect(200);

      expect(runResponse.body.success).toBe(true);
      expect(runResponse.body.output).toContain('Hello from integration test');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle reading non-existent file', async () => {
      const response = await request(BASE_URL)
        .get('/api/files/non-existent-file.js')
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should handle deleting non-existent file', async () => {
      const response = await request(BASE_URL)
        .delete('/api/files/non-existent-file.js')
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should handle invalid file names', async () => {
      const response = await request(BASE_URL)
        .post('/api/files')
        .send({
          fileName: '../../../etc/passwd',
          content: 'malicious'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

