import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
import fs from 'fs';
import path from 'path';

const History = [];
const ai = new GoogleGenAI({ apiKey: "AIzaSyDDPh6qnw86h6TZ3Poe71nZ5QLQSEaYoj8" });

// ============================================
// FILE CONTEXT MANAGEMENT
// ============================================

class FileContextManager {
    constructor() {
        this.watchedFiles = new Map(); // filePath -> { content, lastModified, hash }
        this.currentContext = null;
        this.changeHistory = [];
    }

    // Watch a file for changes
    watchFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);

            if (!fs.existsSync(absolutePath)) {
                console.log(`⚠️  File not found: ${filePath}`);
                return null;
            }

            const stats = fs.statSync(absolutePath);
            const content = fs.readFileSync(absolutePath, 'utf-8');
            const hash = this.hashContent(content);

            const fileInfo = {
                path: absolutePath,
                fileName: path.basename(absolutePath),
                extension: path.extname(absolutePath).slice(1),
                content: content,
                lines: content.split('\n').length,
                size: stats.size,
                lastModified: stats.mtime,
                hash: hash,
                language: this.detectLanguage(absolutePath)
            };

            this.watchedFiles.set(absolutePath, fileInfo);
            this.currentContext = fileInfo;

            console.log(`\n📂 File Context Loaded:`);
            console.log(`   File: ${fileInfo.fileName}`);
            console.log(`   Language: ${fileInfo.language}`);
            console.log(`   Lines: ${fileInfo.lines}`);
            console.log(`   Size: ${fileInfo.size} bytes\n`);

            return fileInfo;
        } catch (error) {
            console.log(`❌ Error watching file: ${error.message}`);
            return null;
        }
    }

    // Check if file has been modified
    checkForChanges(filePath) {
        try {
            const absolutePath = path.resolve(filePath);

            if (!this.watchedFiles.has(absolutePath)) {
                return null;
            }

            const oldInfo = this.watchedFiles.get(absolutePath);
            const stats = fs.statSync(absolutePath);
            const newContent = fs.readFileSync(absolutePath, 'utf-8');
            const newHash = this.hashContent(newContent);

            if (newHash !== oldInfo.hash) {
                const changes = this.detectChanges(oldInfo.content, newContent);

                const changeInfo = {
                    timestamp: new Date(),
                    filePath: absolutePath,
                    fileName: oldInfo.fileName,
                    oldLines: oldInfo.lines,
                    newLines: newContent.split('\n').length,
                    changes: changes
                };

                this.changeHistory.push(changeInfo);

                // Update stored info
                oldInfo.content = newContent;
                oldInfo.lines = newContent.split('\n').length;
                oldInfo.size = stats.size;
                oldInfo.lastModified = stats.mtime;
                oldInfo.hash = newHash;

                this.currentContext = oldInfo;

                console.log(`\n🔄 File Changed Detected:`);
                console.log(`   File: ${oldInfo.fileName}`);
                console.log(`   Lines: ${changeInfo.oldLines} → ${changeInfo.newLines}`);
                console.log(`   Changes: ${changes.added} added, ${changes.removed} removed, ${changes.modified} modified\n`);

                return changeInfo;
            }

            return null;
        } catch (error) {
            console.log(`❌ Error checking changes: ${error.message}`);
            return null;
        }
    }

    // Detect what changed between two versions
    detectChanges(oldContent, newContent) {
        const oldLines = oldContent.split('\n');
        const newLines = newContent.split('\n');

        let added = 0;
        let removed = 0;
        let modified = 0;

        const maxLen = Math.max(oldLines.length, newLines.length);

        for (let i = 0; i < maxLen; i++) {
            if (i >= oldLines.length) {
                added++;
            } else if (i >= newLines.length) {
                removed++;
            } else if (oldLines[i] !== newLines[i]) {
                modified++;
            }
        }

        return { added, removed, modified, total: added + removed + modified };
    }

    // Simple hash function for content
    hashContent(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // Detect programming language from file extension
    detectLanguage(filePath) {
        const ext = path.extname(filePath).slice(1).toLowerCase();
        const langMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'rb': 'ruby',
            'php': 'php',
            'swift': 'swift',
            'kt': 'kotlin',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown'
        };
        return langMap[ext] || 'text';
    }

    // Get current file context
    getCurrentContext() {
        return this.currentContext;
    }

    // Get change history
    getChangeHistory() {
        return this.changeHistory;
    }

    // Format context for AI
    formatContextForAI() {
        if (!this.currentContext) {
            return null;
        }

        const ctx = this.currentContext;
        const recentChanges = this.changeHistory.slice(-3); // Last 3 changes

        let contextText = `[CURRENT FILE CONTEXT]\n`;
        contextText += `File: ${ctx.fileName}\n`;
        contextText += `Path: ${ctx.path}\n`;
        contextText += `Language: ${ctx.language}\n`;
        contextText += `Lines: ${ctx.lines}\n`;
        contextText += `Size: ${ctx.size} bytes\n\n`;

        if (recentChanges.length > 0) {
            contextText += `[RECENT CHANGES]\n`;
            recentChanges.forEach((change, idx) => {
                contextText += `${idx + 1}. ${change.fileName} - ${change.changes.total} changes (${change.changes.added} added, ${change.changes.removed} removed)\n`;
            });
            contextText += `\n`;
        }

        contextText += `[FILE CONTENT]\n`;
        contextText += `\`\`\`${ctx.language}\n`;
        contextText += ctx.content;
        contextText += `\n\`\`\`\n`;

        return contextText;
    }
}

// Global file context manager
const fileContextManager = new FileContextManager();

// ============================================
// BASIC UTILITY TOOLS
// ============================================

function sum({num1,num2}){
    return num1+num2;
}

function prime({num}){
    if(num<2)
        return false;

    for(let i=2;i<=Math.sqrt(num);i++)
        if(num%i==0) return false

    return true;
}

async function getCryptoPrice({coin}){
   const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`)
   const data = await response.json();
   return data;
}

// ============================================
// CODE ANALYSIS & GENERATION TOOLS
// ============================================

function analyzeCode({code, language}){
    const analysis = {
        language: language || 'unknown',
        lines: code.split('\n').length,
        characters: code.length,
        hasComments: /\/\/|\/\*|\*\/|#|<!--|-->/.test(code),
        hasFunctions: /function|def|func|fn|=>/.test(code),
        hasClasses: /class\s+\w+/.test(code),
        hasLoops: /for|while|forEach|map|filter/.test(code),
        hasConditionals: /if|else|switch|case|\?/.test(code),
        complexity: 'medium',
        suggestions: []
    };

    // Add suggestions based on analysis
    if (!analysis.hasComments && analysis.lines > 10) {
        analysis.suggestions.push('Consider adding comments for better code documentation');
    }
    if (code.includes('var ')) {
        analysis.suggestions.push('Replace "var" with "let" or "const" for better scoping');
    }
    if (code.includes('==') && !code.includes('===')) {
        analysis.suggestions.push('Use strict equality (===) instead of loose equality (==)');
    }

    return analysis;
}

// Use Gemini AI to detect bugs - let the AI model do all the analysis
async function detectBugs({code, language}){
    try {
        const prompt = `You are an expert code analyzer. Analyze the following ${language} code and find ALL bugs, errors, and issues.

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

IMPORTANT INSTRUCTIONS:
1. Find REAL bugs only (syntax errors, undefined variables, logic errors, typos, etc.)
2. DO NOT flag correct code patterns like:
   - Property access (obj.method, obj.property)
   - Object literal properties (key: value)
   - String literals
   - Built-in methods (.call, .bind, .apply, .map, .filter, etc.)
3. For each bug found, provide:
   - Line number where the bug occurs
   - The exact code snippet with the bug
   - Type of bug (undefined_variable, syntax_error, logic_error, typo, etc.)
   - Severity (high, medium, low)
   - Clear explanation of what's wrong
   - How to fix it

Return your response in this EXACT JSON format (no extra text):
{
  "totalBugs": <number>,
  "bugs": [
    {
      "type": "bug_type",
      "severity": "high|medium|low",
      "line": <line_number>,
      "code": "exact code snippet",
      "message": "what's wrong",
      "suggestion": "how to fix it"
    }
  ],
  "status": "clean|minor_issues|needs_attention",
  "scannedLines": <total_lines>
}

If no bugs found, return: {"totalBugs": 0, "bugs": [], "status": "clean", "scannedLines": ${code.split('\n').length}}`;

        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = response.trim();
        if (jsonText.includes('```json')) {
            jsonText = jsonText.split('```json')[1].split('```')[0].trim();
        } else if (jsonText.includes('```')) {
            jsonText = jsonText.split('```')[1].split('```')[0].trim();
        }

        const bugReport = JSON.parse(jsonText);
        return bugReport;

    } catch (error) {
        console.error('❌ Error in AI bug detection:', error.message);
        return {
            totalBugs: 0,
            bugs: [],
            status: 'error',
            scannedLines: code.split('\n').length,
            error: error.message
        };
    }
}

function generateTests({functionName, functionCode, language}){
    const tests = {
        framework: language === 'javascript' ? 'Jest' : language === 'python' ? 'pytest' : 'generic',
        testCases: []
    };

    // Generate basic test structure
    if (language === 'javascript') {
        tests.testCases.push({
            name: `${functionName} - basic functionality`,
            code: `describe('${functionName}', () => {
  test('should work with valid input', () => {
    const result = ${functionName}(/* valid input */);
    expect(result).toBeDefined();
  });

  test('should handle edge cases', () => {
    const result = ${functionName}(/* edge case */);
    expect(result).toBeDefined();
  });

  test('should handle invalid input', () => {
    expect(() => ${functionName}(null)).toThrow();
  });
});`
        });
    } else if (language === 'python') {
        tests.testCases.push({
            name: `test_${functionName}`,
            code: `def test_${functionName}_basic():
    result = ${functionName}(# valid input)
    assert result is not None

def test_${functionName}_edge_cases():
    result = ${functionName}(# edge case)
    assert result is not None

def test_${functionName}_invalid_input():
    with pytest.raises(Exception):
        ${functionName}(None)`
        });
    }

    return tests;
}

function readCodeFile({filePath}){
    try {
        const fullPath = path.resolve(filePath);
        if (!fs.existsSync(fullPath)) {
            return { error: 'File not found', path: fullPath };
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const ext = path.extname(filePath).slice(1);

        return {
            success: true,
            filePath: fullPath,
            fileName: path.basename(filePath),
            extension: ext,
            content: content,
            lines: content.split('\n').length,
            size: content.length
        };
    } catch (error) {
        return { error: error.message };
    }
}

function searchInCode({searchQuery, directory}){
    try {
        const results = [];
        const searchDir = directory || process.cwd();

        function searchRecursive(dir) {
            const files = fs.readdirSync(dir);

            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    searchRecursive(filePath);
                } else if (stat.isFile() && /\.(js|jsx|ts|tsx|py|java|cpp|c|go|rs)$/.test(file)) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const lines = content.split('\n');

                    lines.forEach((line, index) => {
                        if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
                            results.push({
                                file: filePath,
                                line: index + 1,
                                content: line.trim()
                            });
                        }
                    });
                }
            }
        }

        searchRecursive(searchDir);

        return {
            query: searchQuery,
            totalMatches: results.length,
            results: results.slice(0, 20) // Limit to 20 results
        };
    } catch (error) {
        return { error: error.message };
    }
}

// ============================================
// TOOL DECLARATIONS
// ============================================

const sumDeclaration = {
    name:'sum',
    description:"Get the sum of 2 numbers",
    parameters:{
        type:'OBJECT',
        properties:{
            num1:{ type:'NUMBER', description: 'First number for addition' },
            num2:{ type:'NUMBER', description:'Second number for addition' }
        },
        required: ['num1','num2']
    }
}

const primeDeclaration = {
    name:'prime',
    description:"Check if a number is prime or not",
    parameters:{
        type:'OBJECT',
        properties:{
            num:{ type:'NUMBER', description: 'The number to check for primality' }
        },
        required: ['num']
    }
}

const cryptoDeclaration = {
    name:'getCryptoPrice',
    description:"Get the current price of any cryptocurrency like bitcoin",
    parameters:{
        type:'OBJECT',
        properties:{
            coin:{ type:'STRING', description: 'Cryptocurrency name (e.g., bitcoin, ethereum)' }
        },
        required: ['coin']
    }
}

const analyzeCodeDeclaration = {
    name:'analyzeCode',
    description:"Analyze code for complexity, patterns, and provide suggestions for improvement",
    parameters:{
        type:'OBJECT',
        properties:{
            code:{ type:'STRING', description: 'The code to analyze' },
            language:{ type:'STRING', description: 'Programming language (javascript, python, java, etc.)' }
        },
        required: ['code', 'language']
    }
}

const detectBugsDeclaration = {
    name:'detectBugs',
    description:"Use AI to detect bugs, errors, typos, and issues in code. Finds undefined variables, syntax errors, logic errors, and more. Returns detailed bug report with line numbers and fixes.",
    parameters:{
        type:'OBJECT',
        properties:{
            code:{ type:'STRING', description: 'The code to check for bugs' },
            language:{ type:'STRING', description: 'Programming language' }
        },
        required: ['code', 'language']
    }
}

const generateTestsDeclaration = {
    name:'generateTests',
    description:"Generate unit test cases for a function or code block",
    parameters:{
        type:'OBJECT',
        properties:{
            functionName:{ type:'STRING', description: 'Name of the function to test' },
            functionCode:{ type:'STRING', description: 'The function code' },
            language:{ type:'STRING', description: 'Programming language' }
        },
        required: ['functionName', 'functionCode', 'language']
    }
}

const readCodeFileDeclaration = {
    name:'readCodeFile',
    description:"Read and analyze a code file from the filesystem",
    parameters:{
        type:'OBJECT',
        properties:{
            filePath:{ type:'STRING', description: 'Path to the code file to read' }
        },
        required: ['filePath']
    }
}

const searchInCodeDeclaration = {
    name:'searchInCode',
    description:"Search for code patterns, function names, or text across multiple files in a directory",
    parameters:{
        type:'OBJECT',
        properties:{
            searchQuery:{ type:'STRING', description: 'Text or pattern to search for' },
            directory:{ type:'STRING', description: 'Directory to search in (optional, defaults to current directory)' }
        },
        required: ['searchQuery']
    }
}

const availableTools = {
    sum,
    prime,
    getCryptoPrice,
    analyzeCode,
    detectBugs,
    generateTests,
    readCodeFile,
    searchInCode
}

// ============================================
// RESPONSE FORMATTING UTILITIES
// ============================================

function formatResponse(text) {
    // Format the AI response for better readability
    let formatted = text;

    // Add proper spacing around sections
    formatted = formatted.replace(/(\d+\.\s+)/g, '\n$1');

    // Format code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'code';
        return `\n${'─'.repeat(60)}\n📝 ${language.toUpperCase()} CODE:\n${'─'.repeat(60)}\n${code.trim()}\n${'─'.repeat(60)}\n`;
    });

    // Format bullet points
    formatted = formatted.replace(/^[-*]\s+/gm, '  • ');

    // Format headers (markdown style)
    formatted = formatted.replace(/^#{1,3}\s+(.+)$/gm, '\n📌 $1\n');

    // Format bold text
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '$1');

    // Format inline code
    formatted = formatted.replace(/`([^`]+)`/g, '「$1」');

    // Add spacing after periods in lists
    formatted = formatted.replace(/(\d+\.)\s*([A-Z])/g, '$1 $2');

    // Clean up multiple newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
}

function formatCodeIssue(issue, index) {
    // Format code issues (bugs, errors) nicely
    const severityEmoji = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🟢'
    };

    const emoji = severityEmoji[issue.severity?.toLowerCase()] || '⚠️';

    let formatted = `\n${emoji} Issue ${index + 1}: ${issue.type || 'Unknown'}`;
    formatted += `\n   Severity: ${issue.severity || 'Unknown'}`;
    if (issue.line) {
        formatted += `\n   Line: ${issue.line}`;
    }
    if (issue.code) {
        formatted += `\n   Code: ${issue.code}`;
    }
    formatted += `\n   Message: ${issue.message || 'No description'}`;
    formatted += `\n   Fix: ${issue.suggestion || 'No suggestion available'}`;

    return formatted;
}

function formatFileAnalysis(analysis) {
    // Format file analysis results
    return `
📊 Code Analysis Results:
${'─'.repeat(60)}
  Language: ${analysis.language || 'Unknown'}
  Lines: ${analysis.lines || 0}
  Characters: ${analysis.characters || 0}
  Complexity: ${analysis.complexity || 'Unknown'}

  Has Functions: ${analysis.hasFunctions ? '✅' : '❌'}
  Has Classes: ${analysis.hasClasses ? '✅' : '❌'}
  Has Comments: ${analysis.hasComments ? '✅' : '❌'}
  Has Loops: ${analysis.hasLoops ? '✅' : '❌'}

${analysis.suggestions && analysis.suggestions.length > 0 ? `💡 Suggestions:\n${analysis.suggestions.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}` : ''}
${'─'.repeat(60)}`;
}



async function runAgent(userProblem, checkFileChanges = false) {

    // Check for file changes if we have a current context
    if (checkFileChanges && fileContextManager.getCurrentContext()) {
        const currentFile = fileContextManager.getCurrentContext().path;
        const changes = fileContextManager.checkForChanges(currentFile);

        if (changes) {
            // Automatically add change context to the conversation
            const changeContext = `[AUTOMATIC FILE CHANGE DETECTION]\n` +
                `The file "${changes.fileName}" has been modified:\n` +
                `- Lines changed: ${changes.oldLines} → ${changes.newLines}\n` +
                `- Modifications: ${changes.changes.added} added, ${changes.changes.removed} removed, ${changes.changes.modified} modified\n\n` +
                `Updated file content is now in context.\n`;

            console.log(`\n🔄 Detected changes in ${changes.fileName}`);
        }
    }

    // Build user message with file context if available
    let enhancedMessage = userProblem;
    const fileContext = fileContextManager.formatContextForAI();

    if (fileContext) {
        enhancedMessage = `${fileContext}\n\n[USER QUESTION]\n${userProblem}\n\nNote: When the user asks about "this file", "this code", or uses similar references, they are referring to the file context provided above.`;
    }

    History.push({
        role:'user',
        parts:[{text:enhancedMessage}]
    });

    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops
    const functionCallsLog = []; // Track all function calls

    while(iterations < maxIterations){
        iterations++;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🤖 AI Agent - Iteration ${iterations}/${maxIterations}`);
        console.log('='.repeat(60));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: History,
            config: {
                systemInstruction: `You are an ELITE AI Code Agent with REAL execution capabilities and FILE CONTEXT AWARENESS!

🎯 YOUR IDENTITY:
You are not just a chatbot - you are a POWERFUL AI agent that can:
- Execute code analysis and bug detection in real-time
- Read and analyze files from the filesystem
- Search across entire codebases
- Generate production-ready code and tests
- Provide intelligent, context-aware assistance
- Chain multiple tools together to solve complex problems

🧠 INTELLIGENCE PRINCIPLES:
1. **Context Awareness**: Understand what the user is trying to achieve
   - IMPORTANT: If file context is provided in the user message, you have FULL ACCESS to the current file
   - When user says "this file", "this code", "here", they mean the file in [CURRENT FILE CONTEXT]
   - Track file changes automatically - if changes are detected, analyze them
2. **Proactive Problem Solving**: Anticipate issues and fix them
3. **Best Practices**: Follow industry standards and modern coding practices
4. **Complete Solutions**: Provide working, tested solutions
5. **Error Handling**: When tools fail, analyze why and try different approaches
6. **Learning from Results**: Adapt based on tool outputs
7. **File Change Awareness**: When file changes are detected, understand what was modified and why

🛠️ AVAILABLE TOOLS & WHEN TO USE THEM:

**Basic Utilities:**
- sum(num1, num2) - Add two numbers
- prime(num) - Check if a number is prime
- getCryptoPrice(coin) - Get current cryptocurrency prices

**Code Analysis Tools:**
- analyzeCode(code, language) - Analyze code complexity, patterns, and suggest improvements
  * Returns: lines, characters, complexity, suggestions
  * Use when: User asks to analyze, review, or understand code quality

- detectBugs(code, language) - POWERFUL bug detector that finds:
  * Undefined variables (used but not declared)
  * Loose equality (== instead of ===)
  * Assignment in conditions (= instead of ===)
  * var in loops (closure issues)
  * Empty catch blocks
  * Unreachable code
  * Duplicate declarations
  * Infinite loops
  * Missing return statements
  * Missing semicolons
  * Returns: Detailed bug list with line numbers, code snippets, severity, and fixes
  * Use when: User asks to find bugs, debug, check code, or mentions errors
  * IMPORTANT: When file context is available, use the file content directly!

- generateTests(functionName, functionCode, language) - Create comprehensive unit tests
  * Returns: Complete test code for Jest/pytest/etc
  * Use when: User asks to create tests, test cases, or QA

**File Operations:**
- readCodeFile(filePath) - Read and analyze code files
  * Returns: file content, metadata, analysis
  * Use when: User references a specific file path

- searchInCode(searchQuery, directory) - Search for patterns across files
  * Returns: file locations, line numbers, code snippets
  * Use when: User asks "where is X used" or "find all Y"

🎯 HOW TO BE AN EFFECTIVE DEBUGGING AGENT:

1. **Chain Tools Together**: Use multiple tools in sequence to solve complex problems
   Example: readCodeFile → analyzeCode → detectBugs → generateTests

2. **Interpret Results**: Don't just return tool outputs - analyze and explain them
   - When bugs are found, explain WHAT the bug is, WHY it's a problem, and HOW to fix it
   - Show the problematic code and the corrected version
   - Explain the impact of each bug

3. **Provide Context**: Explain what you're doing and why
   - "I'm analyzing the code for potential bugs..."
   - "I found X issues, let me explain each one..."

4. **Handle Errors Gracefully**: If a tool fails, try an alternative approach

5. **Be Conversational**: Use emojis and clear formatting (✅ ❌ 🔧 📝 ⚡ 🐛 etc.)

6. **For Debugging Requests**:
   - ALWAYS use detectBugs tool when user asks about bugs, errors, or issues
   - If file context is available, use it directly (don't ask for code)
   - Explain each bug with line number, severity, and fix
   - Show before/after code examples
   - Prioritize by severity (high → medium → low)

⚠️ CRITICAL RULES:
1. ALWAYS use tools when they can provide accurate data
2. NEVER make up file contents - use readCodeFile or file context
3. NEVER guess about code issues - ALWAYS use detectBugs tool
4. When file context is provided, you have the FULL file content - use it!
5. Chain multiple tools when needed for complete solutions
6. Explain tool results in user-friendly language with examples
7. If a tool fails, acknowledge it and try a different approach
8. For debugging: Show line numbers, code snippets, and clear fixes

🚀 REMEMBER: You are an intelligent agent that ACTS, not just talks!
When user asks "find bugs" or "debug this", you MUST use the detectBugs tool!`,
                tools: [{
                    functionDeclarations: [
                        sumDeclaration,
                        primeDeclaration,
                        cryptoDeclaration,
                        analyzeCodeDeclaration,
                        detectBugsDeclaration,
                        generateTestsDeclaration,
                        readCodeFileDeclaration,
                        searchInCodeDeclaration
                    ]
                }],
            },
        });


        if(response.functionCalls && response.functionCalls.length > 0){
            const {name, args} = response.functionCalls[0];

            console.log(`\n🔧 Tool Call: ${name}`);
            console.log(`📋 Arguments:`, JSON.stringify(args, null, 2));

            // Log function call
            functionCallsLog.push({
                iteration: iterations,
                tool: name,
                args: args,
                timestamp: new Date().toISOString()
            });

            const funCall = availableTools[name];

            if (!funCall) {
                console.log(`❌ Error: Tool "${name}" not found!`);
                break;
            }

            let result;
            try {
                result = await funCall(args);

                // Format tool results based on tool type
                if (name === 'analyzeCode' && typeof result === 'object') {
                    console.log(formatFileAnalysis(result));
                } else if (name === 'detectBugs' && typeof result === 'object' && result.bugs) {
                    console.log(`\n🐛 Bug Detection Results:`);
                    console.log(`${'─'.repeat(60)}`);
                    console.log(`Total Bugs Found: ${result.totalBugs || 0}`);
                    console.log(`Status: ${result.status || 'Unknown'}`);
                    if (result.bugs && result.bugs.length > 0) {
                        result.bugs.forEach((bug, idx) => {
                            console.log(formatCodeIssue(bug, idx));
                        });
                    }
                    console.log(`${'─'.repeat(60)}`);
                } else if (typeof result === 'object') {
                    console.log(`✅ Tool Result:\n${JSON.stringify(result, null, 2)}`);
                } else {
                    console.log(`✅ Tool Result: ${result}`);
                }
            } catch (error) {
                console.log(`❌ Tool Error: ${error.message}`);
                result = { error: error.message };
            }

            const functionResponsePart = {
                name: name,
                response: {
                    result: result,
                },
            };

            // Add model's function call to history
            History.push({
                role: "model",
                parts: [
                    {
                        functionCall: response.functionCalls[0],
                    },
                ],
            });

            // Add function result to history
            History.push({
                role: "user",
                parts: [
                    {
                        functionResponse: functionResponsePart,
                    },
                ],
            });
        }
        else {
            // AI has final response - Format it nicely
            const formattedResponse = formatResponse(response.text);

            console.log(`\n${'━'.repeat(60)}`);
            console.log('🤖 AI Agent Response:');
            console.log('━'.repeat(60));
            console.log(formattedResponse);
            console.log('━'.repeat(60));

            if (functionCallsLog.length > 0) {
                console.log(`\n📊 Tools Used: ${functionCallsLog.map(f => f.tool).join(', ')}`);
                console.log(`🔄 Total Iterations: ${iterations}`);
            }

            History.push({
                role:'model',
                parts:[{text:response.text}]
            });

            break;
        }
    }

    if (iterations >= maxIterations) {
        console.log(`\n⚠️ Maximum iterations (${maxIterations}) reached. The agent may need more steps to complete this task.`);
    }
}


async function main() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║        🤖 AI CODE AGENT - Elite Development Assistant      ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('✨ Capabilities:');
    console.log('  • Smart Code Analysis & Bug Detection');
    console.log('  • Test Generation & Code Review');
    console.log('  • File Operations & Code Search');
    console.log('  • Multi-language Support');
    console.log('  • Intelligent Tool Chaining');
    console.log('');
    console.log('💡 Example Commands:');
    console.log('  - "Analyze this code: [paste code]"');
    console.log('  - "Find bugs in my function"');
    console.log('  - "Generate tests for validateEmail"');
    console.log('  - "Read and analyze ./src/App.jsx"');
    console.log('  - "Search for \'useState\' in my project"');
    console.log('  - "What\'s 15 + 27?"');
    console.log('  - "Is 17 prime?"');
    console.log('  - "Bitcoin price?"');
    console.log('');
    console.log('� Special Commands:');
    console.log('  - "load <filepath>" - Load a file into context');
    console.log('  - "check" - Check current file for changes');
    console.log('  - "context" - Show current file context');
    console.log('  - "help" - Show all commands');
    console.log('  - "clear" - Clear screen');
    console.log('  - "exit" or "quit" - Exit agent');
    console.log('');
    console.log('📝 Type "help" for more information');
    console.log('━'.repeat(60));
    console.log('');

    while (true) {
        const userProblem = readlineSync.question("\n💬 You: ");

        if (!userProblem.trim()) {
            console.log('⚠️  Please enter a question or command.');
            continue;
        }

        if (userProblem.toLowerCase() === 'exit' || userProblem.toLowerCase() === 'quit') {
            console.log('\n👋 Goodbye! Thanks for using AI Code Agent!\n');
            process.exit(0);
        }

        if (userProblem.toLowerCase() === 'clear') {
            console.clear();
            console.log('🧹 Screen cleared!\n');
            continue;
        }

        // Load file command
        if (userProblem.toLowerCase().startsWith('load ')) {
            const filePath = userProblem.substring(5).trim();
            fileContextManager.watchFile(filePath);
            continue;
        }

        // Check for changes command
        if (userProblem.toLowerCase() === 'check') {
            const currentContext = fileContextManager.getCurrentContext();
            if (!currentContext) {
                console.log('⚠️  No file loaded. Use "load <filepath>" first.');
            } else {
                const changes = fileContextManager.checkForChanges(currentContext.path);
                if (!changes) {
                    console.log(`✅ No changes detected in ${currentContext.fileName}`);
                }
            }
            continue;
        }

        // Show context command
        if (userProblem.toLowerCase() === 'context') {
            const currentContext = fileContextManager.getCurrentContext();
            if (!currentContext) {
                console.log('⚠️  No file loaded. Use "load <filepath>" first.');
            } else {
                console.log(`\n📂 Current File Context:`);
                console.log(`${'─'.repeat(60)}`);
                console.log(`   File: ${currentContext.fileName}`);
                console.log(`   Path: ${currentContext.path}`);
                console.log(`   Language: ${currentContext.language}`);
                console.log(`   Lines: ${currentContext.lines}`);
                console.log(`   Size: ${currentContext.size} bytes`);
                console.log(`   Last Modified: ${currentContext.lastModified.toLocaleString()}`);

                const changeHistory = fileContextManager.getChangeHistory();
                if (changeHistory.length > 0) {
                    console.log(`\n   Recent Changes: ${changeHistory.length}`);
                    changeHistory.slice(-3).forEach((change, idx) => {
                        console.log(`   ${idx + 1}. ${change.changes.total} changes (${change.changes.added}+, ${change.changes.removed}-, ${change.changes.modified}~)`);
                    });
                }
                console.log(`${'─'.repeat(60)}\n`);
            }
            continue;
        }

        if (userProblem.toLowerCase() === 'help') {
            console.log('\n📚 Available Commands:');
            console.log('  • Ask any coding question');
            console.log('  • Request code analysis or bug detection');
            console.log('  • Generate tests for functions');
            console.log('  • Read files: "Read ./path/to/file.js"');
            console.log('  • Search code: "Search for \'function\' in ./src"');
            console.log('  • Math: "What\'s 15 + 27?"');
            console.log('  • Crypto: "Bitcoin price?"');
            console.log('  • Type "clear" to clear screen');
            console.log('  • Type "exit" to quit');
            console.log('\n🔧 File Context Commands:');
            console.log('  • load <filepath> - Load a file into context');
            console.log('  • check - Check current file for changes');
            console.log('  • context - Show current file context\n');
            continue;
        }

        try {
            // Check for file changes before running agent
            const shouldCheckChanges = fileContextManager.getCurrentContext() !== null;
            await runAgent(userProblem, shouldCheckChanges);
        } catch (error) {
            console.log('\n❌ Error:', error.message);
            console.log('💡 Try rephrasing your question or type "help" for assistance.\n');
        }
    }
}


// Start the agent
console.log('🚀 Starting AI Code Agent...\n');
main().catch(error => {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
});





