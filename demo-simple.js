import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';

const History = [];
const ai = new GoogleGenAI({ apiKey: "AIzaSyDDPh6qnw86h6TZ3Poe71nZ5QLQSEaYoj8" });

// ============ DEMO TOOLS ============

function sum({num1, num2}) {
    console.log(`   🔧 Calling: sum(${num1}, ${num2})`);
    return num1 + num2;
}

function prime({num}) {
    console.log(`   🔧 Calling: prime(${num})`);
    if(num < 2) return false;
    for(let i = 2; i <= Math.sqrt(num); i++)
        if(num % i == 0) return false;
    return true;
}

async function getCryptoPrice({coin}) {
    console.log(`   🔧 Calling: getCryptoPrice("${coin}")`);
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`);
    const data = await response.json();
    return data[0] ? `$${data[0].current_price}` : "Not found";
}

async function getWeather({city}) {
    console.log(`   🔧 Calling: getWeather("${city}")`);
    // Mock weather data for demo
    const weather = {
        "london": "Rainy, 15°C",
        "paris": "Sunny, 22°C", 
        "tokyo": "Cloudy, 18°C",
        "new york": "Sunny, 25°C"
    };
    return weather[city.toLowerCase()] || "Weather data not available";
}

function calculate({operation, num1, num2}) {
    console.log(`   🔧 Calling: calculate("${operation}", ${num1}, ${num2})`);
    switch(operation) {
        case 'multiply': return num1 * num2;
        case 'divide': return num1 / num2;
        case 'subtract': return num1 - num2;
        default: return num1 + num2;
    }
}

// ============ FUNCTION DECLARATIONS ============

const declarations = {
    sum: {
        name: 'sum',
        description: "Add two numbers together",
        parameters: {
            type: 'OBJECT',
            properties: {
                num1: { type: 'NUMBER', description: 'First number' },
                num2: { type: 'NUMBER', description: 'Second number' }
            },
            required: ['num1', 'num2']
        }
    },
    prime: {
        name: 'prime',
        description: "Check if a number is prime",
        parameters: {
            type: 'OBJECT',
            properties: {
                num: { type: 'NUMBER', description: 'Number to check' }
            },
            required: ['num']
        }
    },
    getCryptoPrice: {
        name: 'getCryptoPrice',
        description: "Get current cryptocurrency price",
        parameters: {
            type: 'OBJECT',
            properties: {
                coin: { type: 'STRING', description: 'Crypto name like bitcoin, ethereum' }
            },
            required: ['coin']
        }
    },
    getWeather: {
        name: 'getWeather',
        description: "Get weather for a city",
        parameters: {
            type: 'OBJECT',
            properties: {
                city: { type: 'STRING', description: 'City name' }
            },
            required: ['city']
        }
    },
    calculate: {
        name: 'calculate',
        description: "Perform mathematical operations (multiply, divide, subtract)",
        parameters: {
            type: 'OBJECT',
            properties: {
                operation: { type: 'STRING', description: 'Operation: multiply, divide, subtract' },
                num1: { type: 'NUMBER', description: 'First number' },
                num2: { type: 'NUMBER', description: 'Second number' }
            },
            required: ['operation', 'num1', 'num2']
        }
    }
};

const availableTools = { sum, prime, getCryptoPrice, getWeather, calculate };

// ============ AI AGENT ============

async function runAgent(userProblem) {
    console.log('\n' + '='.repeat(60));
    console.log(`👤 USER: ${userProblem}`);
    console.log('='.repeat(60));
    
    History.push({
        role: 'user',
        parts: [{text: userProblem}]
    });

    let stepCount = 0;
    
    while(true) {
        stepCount++;
        console.log(`\n🤖 AI Agent - Step ${stepCount}:`);
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: History,
            config: {
                systemInstruction: `You are a helpful AI assistant with access to multiple tools.
                Use the tools when needed to answer questions accurately.
                You can use multiple tools in sequence to solve complex problems.`,
                tools: [{
                    functionDeclarations: Object.values(declarations)
                }],
            },
        });

        if(response.functionCalls && response.functionCalls.length > 0) {
            const {name, args} = response.functionCalls[0];
            
            console.log(`   📋 AI decided to call: ${name}`);
            const funCall = availableTools[name];
            const result = await funCall(args);
            console.log(`   ✅ Result: ${JSON.stringify(result)}`);

            History.push({
                role: "model",
                parts: [{ functionCall: response.functionCalls[0] }],
            });

            History.push({
                role: "user",
                parts: [{
                    functionResponse: {
                        name: name,
                        response: { result: result },
                    },
                }],
            });
        } else {
            History.push({
                role: 'model',
                parts: [{text: response.text}]
            });
            
            console.log(`\n💬 FINAL ANSWER:`);
            console.log(`   ${response.text}`);
            console.log('='.repeat(60) + '\n');
            break;
        }
    }
}

// ============ DEMO SCENARIOS ============

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🤖 AI AGENT FUNCTION CALLING DEMO                   ║
║                                                            ║
║  Watch the AI autonomously decide which tools to use!     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

async function main() {
    const userProblem = readlineSync.question("\n💭 Ask me anything (or press Enter for demo): ");
    
    if (!userProblem.trim()) {
        // Run demo scenarios
        console.log("\n🎬 Running Demo Scenarios...\n");
        
        await runAgent("What is 25 + 37?");
        await new Promise(r => setTimeout(r, 2000));
        
        await runAgent("Is 97 prime?");
        await new Promise(r => setTimeout(r, 2000));
        
        await runAgent("What's the price of bitcoin?");
        await new Promise(r => setTimeout(r, 2000));
        
        await runAgent("Is 13 prime? If yes, multiply it by 5");
        await new Promise(r => setTimeout(r, 2000));
        
        await runAgent("Get weather in Paris and bitcoin price");
    } else {
        await runAgent(userProblem);
    }
    
    main();
}

main();

