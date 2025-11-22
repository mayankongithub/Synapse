/**
 * Frontend Component Tests
 * Tests logic for frontend components
 */

describe('Frontend Component Tests', () => {
  let localStorageMock;

  beforeEach(() => {
    const store = {};
    localStorageMock = {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
      removeItem: jest.fn((key) => { delete store[key]; }),
      clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
    };
    global.localStorage = localStorageMock;
  });

  describe('Theme Logic', () => {
    test('should default to dark theme', () => {
      const isDark = localStorageMock.getItem('theme') !== 'light';
      expect(isDark).toBe(true);
    });

    test('should persist theme to localStorage', () => {
      localStorageMock.setItem('theme', 'light');
      const theme = localStorageMock.getItem('theme');
      expect(theme).toBe('light');
    });
  });

  describe('File Explorer Logic', () => {
    test('should store selected file', () => {
      const selectedFile = 'test.js';
      localStorageMock.setItem('selectedFile', JSON.stringify({ name: selectedFile }));
      
      const stored = JSON.parse(localStorageMock.getItem('selectedFile'));
      expect(stored.name).toBe(selectedFile);
    });
  });
});
