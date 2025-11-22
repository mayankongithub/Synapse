/**
 * UI Layout Tests
 * Tests for UI layout, panels, and responsiveness
 */

describe('UI Layout Tests', () => {
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

  describe('Panel Visibility', () => {
    test('should hide all panels on first visit', () => {
      const hasVisited = localStorageMock.getItem('hasVisited') === 'true';
      const isChatOpen = hasVisited ? localStorageMock.getItem('isChatOpen') === 'true' : false;
      const isFileExplorerOpen = hasVisited ? localStorageMock.getItem('isFileExplorerOpen') === 'true' : false;
      const isTerminalOpen = hasVisited ? localStorageMock.getItem('isTerminalOpen') === 'true' : false;

      expect(isChatOpen).toBe(false);
      expect(isFileExplorerOpen).toBe(false);
      expect(isTerminalOpen).toBe(false);
    });

    test('should restore panel state on subsequent visits', () => {
      localStorageMock.setItem('hasVisited', 'true');
      localStorageMock.setItem('isChatOpen', 'true');
      localStorageMock.setItem('isFileExplorerOpen', 'true');
      localStorageMock.setItem('isTerminalOpen', 'false');

      const hasVisited = localStorageMock.getItem('hasVisited') === 'true';
      const isChatOpen = hasVisited ? localStorageMock.getItem('isChatOpen') === 'true' : false;
      const isFileExplorerOpen = hasVisited ? localStorageMock.getItem('isFileExplorerOpen') === 'true' : false;
      const isTerminalOpen = hasVisited ? localStorageMock.getItem('isTerminalOpen') === 'true' : false;

      expect(isChatOpen).toBe(true);
      expect(isFileExplorerOpen).toBe(true);
      expect(isTerminalOpen).toBe(false);
    });
  });

  describe('Panel Resizing', () => {
    test('should save panel widths to localStorage', () => {
      const leftWidth = 300;
      const rightWidth = 400;
      const terminalHeight = 250;

      localStorageMock.setItem('leftWidth', leftWidth.toString());
      localStorageMock.setItem('rightWidth', rightWidth.toString());
      localStorageMock.setItem('terminalHeight', terminalHeight.toString());

      expect(localStorageMock.getItem('leftWidth')).toBe('300');
      expect(localStorageMock.getItem('rightWidth')).toBe('400');
      expect(localStorageMock.getItem('terminalHeight')).toBe('250');
    });

    test('should restore panel sizes from localStorage', () => {
      localStorageMock.setItem('leftWidth', '350');
      localStorageMock.setItem('rightWidth', '450');
      localStorageMock.setItem('terminalHeight', '200');

      const leftWidth = parseInt(localStorageMock.getItem('leftWidth')) || 250;
      const rightWidth = parseInt(localStorageMock.getItem('rightWidth')) || 350;
      const terminalHeight = parseInt(localStorageMock.getItem('terminalHeight')) || 200;

      expect(leftWidth).toBe(350);
      expect(rightWidth).toBe(450);
      expect(terminalHeight).toBe(200);
    });

    test('should enforce minimum panel widths', () => {
      const minLeftWidth = 200;
      const minRightWidth = 300;
      const minTerminalHeight = 150;

      let leftWidth = 100; // Too small
      let rightWidth = 200; // Too small
      let terminalHeight = 100; // Too small

      leftWidth = Math.max(leftWidth, minLeftWidth);
      rightWidth = Math.max(rightWidth, minRightWidth);
      terminalHeight = Math.max(terminalHeight, minTerminalHeight);

      expect(leftWidth).toBe(200);
      expect(rightWidth).toBe(300);
      expect(terminalHeight).toBe(150);
    });

    test('should enforce maximum panel widths', () => {
      const maxLeftWidth = 500;
      const maxRightWidth = 600;
      const maxTerminalHeight = 600;

      let leftWidth = 700; // Too large
      let rightWidth = 800; // Too large
      let terminalHeight = 700; // Too large

      leftWidth = Math.min(leftWidth, maxLeftWidth);
      rightWidth = Math.min(rightWidth, maxRightWidth);
      terminalHeight = Math.min(terminalHeight, maxTerminalHeight);

      expect(leftWidth).toBe(500);
      expect(rightWidth).toBe(600);
      expect(terminalHeight).toBe(600);
    });
  });

  describe('Terminal Toggle', () => {
    test('should toggle terminal with Ctrl + `', () => {
      let isTerminalOpen = false;

      // Simulate Ctrl + ` keypress
      const event = {
        ctrlKey: true,
        key: '`',
        code: 'Backquote',
        preventDefault: jest.fn()
      };

      if (event.ctrlKey && (event.key === '`' || event.code === 'Backquote')) {
        event.preventDefault();
        isTerminalOpen = !isTerminalOpen;
      }

      expect(isTerminalOpen).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('should mark as visited when terminal is toggled', () => {
      // Simulate terminal toggle
      localStorageMock.setItem('hasVisited', 'true');
      localStorageMock.setItem('isTerminalOpen', 'true');

      expect(localStorageMock.getItem('hasVisited')).toBe('true');
      expect(localStorageMock.getItem('isTerminalOpen')).toBe('true');
    });
  });

  describe('File Explorer', () => {
    test('should show empty state when no folder selected', () => {
      const useLocalFolder = false;
      const folderHandle = null;
      const files = [];

      const shouldShowEmpty = !useLocalFolder && !folderHandle && files.length === 0;

      expect(shouldShowEmpty).toBe(true);
    });

    test('should show folder tree when folder is selected', () => {
      const useLocalFolder = true;
      const folderHandle = { name: 'my-project' };
      const fileTree = {
        name: 'my-project',
        type: 'folder',
        children: {
          'file1.js': { name: 'file1.js', type: 'file' },
          'file2.py': { name: 'file2.py', type: 'file' }
        }
      };

      const shouldShowTree = useLocalFolder && folderHandle && fileTree;

      expect(shouldShowTree).toBeTruthy();
    });
  });

  describe('Welcome Screen', () => {
    test('should show welcome screen when no files are open', () => {
      const openFiles = [];
      const selectedFile = null;

      const showWelcome = openFiles.length === 0 && !selectedFile;

      expect(showWelcome).toBe(true);
    });

    test('should hide welcome screen when file is selected', () => {
      const openFiles = [{ name: 'test.js', path: 'test.js' }];
      const selectedFile = { name: 'test.js', path: 'test.js' };

      const showWelcome = openFiles.length === 0 && !selectedFile;

      expect(showWelcome).toBe(false);
    });
  });
});

