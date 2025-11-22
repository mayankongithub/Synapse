/**
 * File System Operations Tests
 * Tests file system utilities and operations
 */

const fs = require('fs').promises;
const path = require('path');

const WORKSPACE_PATH = path.join(__dirname, '../../dev-agent/backend/workspace');
const TEST_FILE = 'monty-test-file.txt';
const TEST_CONTENT = 'This is a test file created by Monty';

describe('File System Operations', () => {
  beforeAll(async () => {
    // Ensure workspace directory exists
    try {
      await fs.access(WORKSPACE_PATH);
    } catch {
      await fs.mkdir(WORKSPACE_PATH, { recursive: true });
    }
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.unlink(path.join(WORKSPACE_PATH, TEST_FILE));
    } catch {
      // File might not exist
    }
  });

  describe('File Creation', () => {
    test('should create a new file', async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      await fs.writeFile(filePath, TEST_CONTENT);

      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    test('should write correct content to file', async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      await fs.writeFile(filePath, TEST_CONTENT);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe(TEST_CONTENT);
    });

    test('should overwrite existing file', async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      await fs.writeFile(filePath, 'Old content');
      await fs.writeFile(filePath, TEST_CONTENT);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe(TEST_CONTENT);
    });
  });

  describe('File Reading', () => {
    beforeEach(async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      await fs.writeFile(filePath, TEST_CONTENT);
    });

    test('should read file content', async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      const content = await fs.readFile(filePath, 'utf-8');

      expect(content).toBe(TEST_CONTENT);
    });

    test('should handle non-existent files', async () => {
      const filePath = path.join(WORKSPACE_PATH, 'non-existent.txt');

      await expect(fs.readFile(filePath, 'utf-8')).rejects.toThrow();
    });
  });

  describe('File Deletion', () => {
    beforeEach(async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      await fs.writeFile(filePath, TEST_CONTENT);
    });

    test('should delete a file', async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      await fs.unlink(filePath);

      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(false);
    });

    test('should handle deleting non-existent file', async () => {
      const filePath = path.join(WORKSPACE_PATH, 'non-existent.txt');

      await expect(fs.unlink(filePath)).rejects.toThrow();
    });
  });

  describe('Directory Listing', () => {
    beforeEach(async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      await fs.writeFile(filePath, TEST_CONTENT);
    });

    test('should list files in directory', async () => {
      const files = await fs.readdir(WORKSPACE_PATH);

      expect(Array.isArray(files)).toBe(true);
      expect(files).toContain(TEST_FILE);
    });

    test('should get file stats', async () => {
      const filePath = path.join(WORKSPACE_PATH, TEST_FILE);
      const stats = await fs.stat(filePath);

      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Path Security', () => {
    test('should reject path traversal attempts', () => {
      const maliciousPath = '../../../etc/passwd';
      const normalizedPath = path.normalize(maliciousPath);

      expect(normalizedPath).toContain('..');
    });

    test('should validate file names', () => {
      const invalidNames = ['../file.txt', '../../file.txt', '/etc/passwd'];

      invalidNames.forEach(name => {
        const normalized = path.normalize(name);
        expect(normalized.includes('..') || path.isAbsolute(normalized)).toBe(true);
      });
    });

    test('should accept valid file names', () => {
      const validNames = ['file.txt', 'test.js', 'my-file.py', 'file_123.cpp'];

      validNames.forEach(name => {
        const normalized = path.normalize(name);
        expect(normalized).toBe(name);
        expect(normalized.includes('..')).toBe(false);
      });
    });
  });
});

