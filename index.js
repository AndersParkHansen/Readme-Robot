require('dotenv').config();

const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

// Configure the OpenAI API client with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const codeFile = fs.readFileSync('index.js', 'utf-8');

let readmeFile;
let messages;

try {
  readmeFile = fs.readFileSync('README.md', 'utf-8');
  // If README exists, compare it with code
  messages = [
    { role: 'system', content: 'You are a README.md expert. You will assist the user in creating documentation for software being built.' },
    { role: 'user', content: `Can you compare this README.md ${readmeFile} with this code ${codeFile} and suggest changes?`}
  ];
} catch (error) {
  // If README doesn't exist, generate one
  messages = [
    { role: 'system', content: 'You are a README.md expert. You will assist the user in creating documentation for software being built.' },
    { role: 'user', content: `Can you create a README.md documenting this code?\n\n ${codeFile}?`}
  ];
}

async function createChatCompletion() {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: messages,
    max_tokens: 2048,
    temperature: 0.0,
  });

  console.log(`Suggested changes or generated README content: ${response.data.choices[0].message.content}`);
}

createChatCompletion();
