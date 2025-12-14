# Step-by-Step Testing Guide

## Setup
- Dev server: http://localhost:3003
- Test folder: /Users/mayanksharma/Downloads/SYNAPSE/test-folder
- Files: test.js, test.html, test.txt

## Test 1: Folder Selection ✅
1. Open http://localhost:3003
2. Click "📂 Open Folder" button
3. System folder picker opens
4. Select test-folder
5. ✅ Folder name shows in button
6. ✅ File Explorer opens automatically

## Test 2: File Explorer Display ✅
1. After folder selected
2. ✅ See test.js, test.html, test.txt in tree
3. ✅ Files have correct icons
4. ✅ No errors in console

## Test 3: File Content Loading
1. Click on test.js
2. ✅ Content loads in editor
3. ✅ Syntax highlighting works
4. Click on test.html
5. ✅ HTML content loads
6. Click on test.txt
7. ✅ Text content loads

## Test 4: Code Execution
1. Open test.js
2. Click "Run" button
3. ✅ Terminal shows output
4. ✅ Should see "Hello from test.js" and "8"

## Test 5: AI Chat
1. Type: "List all files"
2. ✅ AI responds with file list
3. Type: "Read test.js"
4. ✅ AI shows file content
5. Type: "Create hello.txt with Hello World"
6. ✅ File created in folder
7. ✅ File appears in explorer

## Test 6: Auto-save
1. Edit test.js
2. Wait 2 seconds
3. Close and reopen file
4. ✅ Changes persisted

## Success Criteria
- ✅ No 404 errors
- ✅ No API calls
- ✅ All features work
- ✅ No console errors

