/**
 * Test Helper Utilities
 * Common utilities for testing
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Clean up test files in workspace
 */
async function cleanupTestFiles(workspacePath, pattern = 'test-') {
  try {
    const files = await fs.readdir(workspacePath);
    const testFiles = files.filter(file => file.includes(pattern));
    
    await Promise.all(
      testFiles.map(file => 
        fs.unlink(path.join(workspacePath, file)).catch(() => {})
      )
    );
  } catch (error) {
    console.error('Error cleaning up test files:', error);
  }
}

/**
 * Create a temporary test file
 */
async function createTestFile(workspacePath, fileName, content) {
  const filePath = path.join(workspacePath, fileName);
  await fs.writeFile(filePath, content);
  return filePath;
}

/**
 * Wait for a condition to be true
 */
async function waitFor(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
}

/**
 * Mock localStorage for testing
 */
function mockLocalStorage() {
  const store = {};
  
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
    get length() { return Object.keys(store).length; },
    key: (index) => Object.keys(store)[index] || null
  };
}

/**
 * Generate random test data
 */
function generateTestData(type = 'string', length = 10) {
  switch (type) {
    case 'string':
      return Math.random().toString(36).substring(2, length + 2);
    case 'number':
      return Math.floor(Math.random() * length);
    case 'code':
      return `console.log("Test ${Math.random()}");`;
    case 'filename':
      return `test-${Date.now()}.js`;
    default:
      return Math.random().toString(36).substring(2, length + 2);
  }
}

/**
 * Measure execution time
 */
async function measureTime(fn) {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  
  return {
    result,
    duration: endTime - startTime
  };
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 100) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Create a mock file tree structure
 */
function createMockFileTree(depth = 2, filesPerFolder = 3) {
  const tree = {
    name: 'root',
    type: 'folder',
    children: {}
  };
  
  function addFiles(node, currentDepth) {
    if (currentDepth >= depth) return;
    
    // Add files
    for (let i = 0; i < filesPerFolder; i++) {
      const fileName = `file${i}.js`;
      node.children[fileName] = {
        name: fileName,
        type: 'file',
        path: `${node.name}/${fileName}`
      };
    }
    
    // Add folders
    for (let i = 0; i < 2; i++) {
      const folderName = `folder${i}`;
      node.children[folderName] = {
        name: folderName,
        type: 'folder',
        path: `${node.name}/${folderName}`,
        children: {}
      };
      addFiles(node.children[folderName], currentDepth + 1);
    }
  }
  
  addFiles(tree, 0);
  return tree;
}

module.exports = {
  cleanupTestFiles,
  createTestFile,
  waitFor,
  mockLocalStorage,
  generateTestData,
  measureTime,
  retryWithBackoff,
  createMockFileTree
};

