// Jest setup file
require('@testing-library/jest-dom');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock IndexedDB
const indexedDBMock = {
  open: jest.fn(),
};
global.indexedDB = indexedDBMock;

// Mock File System Access API
global.showDirectoryPicker = jest.fn();

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

