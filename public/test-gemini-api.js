import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
    apiKey: "AIzaSyDDPh6qnw86h6TZ3Poe71nZ5QLQSEaYoj8" 
});

const code = "console.log(xyz);";
const language = "javascript";

const prompt = `Analyze this ${language} code for errors. List ONLY the errors found, or say "NO ERRORS" if the code is correct.

CODE:
\`\`\`${language}
${code}
\`\`\`

Check for:
- Undefined variables
- Syntax errors  
- Type errors
- Missing imports

Format each error as:
Line X: [error description]

If no errors, respond with exactly: NO ERRORS`;

console.log('Sending request to Gemini API...');

try {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    console.log('Full result:', JSON.stringify(result, null, 2));
    
    if (result.response && result.response.candidates && result.response.candidates[0]) {
        const candidate = result.response.candidates[0];
        console.log('Candidate:', JSON.stringify(candidate, null, 2));
        
        if (candidate.content && candidate.content.parts) {
            const response = candidate.content.parts.map(p => p.text).join('');
            console.log('Response text:', response);
        }
    }
} catch (error) {
    console.error('Error:', error);
}

