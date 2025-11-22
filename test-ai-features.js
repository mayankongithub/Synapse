// Test file to demonstrate AI Code Assistant features

// Example 1: Code with bugs (for bug detection)
function calculateDiscount(price, discount) {
    // Bug 1: Using loose equality
    if (discount == 0) {
        return price;
    }
    
    // Bug 2: Using var in loop
    for (var i = 0; i < 10; i++) {
        console.log(i);
    }
    
    // Bug 3: Empty catch block
    try {
        return price - (price * discount / 100);
    } catch (e) {
        // Empty catch - silently swallows errors
    }
}

// Example 2: Function that needs tests
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Example 3: Code that needs refactoring
function processUsers(users) {
    var result = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].age >= 18) {
            result.push(users[i]);
        }
    }
    return result;
}

// Example 4: Complex code that needs explanation
const fibonacci = (n) => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);

// Example 5: Code that needs documentation
function fetchUserData(userId, options) {
    const endpoint = `/api/users/${userId}`;
    const config = {
        method: 'GET',
        headers: options.headers || {},
        ...options
    };
    return fetch(endpoint, config).then(res => res.json());
}

/*
HOW TO TEST THESE FEATURES:

1. Bug Detection:
   Ask: "Check this code for bugs: [paste calculateDiscount function]"
   
2. Test Generation:
   Ask: "Generate tests for the validateEmail function"
   
3. Refactoring:
   Ask: "Refactor the processUsers function to use modern JavaScript"
   
4. Code Explanation:
   Ask: "Explain how the fibonacci function works"
   
5. Documentation:
   Ask: "Add JSDoc documentation to the fetchUserData function"
   
6. Code Analysis:
   Ask: "Analyze the complexity of this file"
   
7. Code Search:
   Ask: "Search for all functions that use fetch in this project"
   
8. Code Generation:
   Ask: "Create a function to sort an array of objects by a specific property"
   
9. Code Review:
   Ask: "Review the calculateDiscount function and suggest improvements"
   
10. Debugging:
    Ask: "Why might the calculateDiscount function return undefined?"
*/

// Run the AI assistant:
// node index.js

// Then try these example queries:
const exampleQueries = [
    "Find bugs in the calculateDiscount function",
    "Generate unit tests for validateEmail",
    "Refactor processUsers to use ES6 features",
    "Explain the fibonacci function in simple terms",
    "Add documentation to fetchUserData",
    "What's the time complexity of fibonacci?",
    "Search for 'fetch' in this project",
    "Create a debounce function",
    "Review my code and suggest improvements",
    "Why is my function returning undefined?"
];

console.log("🚀 AI Code Assistant Test File");
console.log("================================");
console.log("\nExample queries to try:");
exampleQueries.forEach((query, i) => {
    console.log(`${i + 1}. ${query}`);
});
console.log("\n💡 Run: node index.js");
console.log("Then paste any of the above queries!\n");

