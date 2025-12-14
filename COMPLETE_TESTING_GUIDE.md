# Complete Testing Guide - Frontend-Only Deployment

## Prerequisites
- Dev server running: http://localhost:3003
- Test folder: /Users/mayanksharma/Downloads/SYNAPSE/test-folder
- Test files: test.js, test.html, test.txt

## Test Sequence

### Test 1: Folder Selection
1. Open http://localhost:3003
2. Click "📂 Open Folder" button
3. System folder picker opens
4. Select test-folder
5. ✅ Verify: Folder name shows in button

### Test 2: File Explorer
1. ✅ Verify: test.js, test.html, test.txt appear in tree
2. ✅ Verify: Files have correct icons
3. ✅ Verify: No console errors

### Test 3: File Content Loading
1. Click test.js → content loads in editor
2. Click test.html → content loads in editor
3. Click test.txt → content loads in editor
4. ✅ Verify: Syntax highlighting works

### Test 4: Code Execution
1. Open test.js
2. Click "Run" button
3. ✅ Verify: Terminal shows output
4. ✅ Verify: Output shows "Hello from test.js" and "8"

### Test 5: AI Chat
1. Type: "List all files"
2. ✅ Verify: AI responds with file list
3. Type: "Read test.js"
4. ✅ Verify: AI shows file content
5. Type: "Create hello.txt with Hello World"
6. ✅ Verify: File created and appears in explorer

### Test 6: Auto-save
1. Edit test.js content
2. Wait 2 seconds
3. Close and reopen file
4. ✅ Verify: Changes persisted

## Success Criteria
- ✅ No 404 errors
- ✅ No API calls to backend
- ✅ All features work
- ✅ No console errors
- ✅ AI responds correctly

## After Testing
If all tests pass → Ready to deploy to Netlify

