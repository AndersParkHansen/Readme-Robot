let useAPI = true; // set this to false to use mock responses

// Load environment variables with API keys
require('dotenv').config();

// Import required modules, fs used as POC to read directly from local filesystem
//TODO: read changed files in a commit from Github instead 
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const createPullRequest = require('./createPullRequest');

const owner = 'AndersParkHansen'; // Replace with your GitHub username
const repo = 'openai-check-the-docs'; // Replace with your repository name
const base = 'main'; // The base branch for the pull request
const head = 'bot-requests'; // The branch to create
const path = require('path');


// Configure the OpenAI API client with API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Read the local test file
//TODO: change to reading the content of files affected by a commit 
const codeFile = fs.readFileSync('index.js', 'utf-8');

let readmeFile;
let messages;


try {
  // Try to read an existing README.md file
  readmeFile = fs.readFileSync('README.md', 'utf-8');

  // If README exists, prepare the system and user messages to compare the README and code
  messages = [
    { role: 'system', content: 'You are a friendly README.md expert. Your purpose is to identify ERRORS and DISCREPANCIES in the users documentation. You will NOT suggest new features or code in the software refered in the documentation. If changes or additions are needed in the README.md, you will output the entire suggested README.md as one coherent block of markdown. If no features are missing in the documentation and nothing is wrong, DO NOT output any markdown.' },
    { role: 'user', content: `Can you compare this README.md ${readmeFile} with this code ${codeFile} and check for errors and discrepancies? If no features are missing and nothing is explicitly wrong, DO NOT reply with any markdown.` }
];

} catch (error) {
  // If README doesn't exist, prepare the system and user messages to generate a new README
  messages = [
    { role: 'system', content: 'You are a friendly README.md expert. You will assist the user in creating documentation for software being built. Your may provide a rationale around it, and you will output your suggested README.md as one coherent block of markdown.' },
    { role: 'user', content: `Can you create a README.md documenting this code?\n\n ${codeFile}? `}
  ];
}

function extractMarkdown(apiResponse) {
  const content = apiResponse.data.choices[0].message.content.trim();

  // 1. If the response starts with '#', assume it's a markdown-only response and return as is
  if (content.startsWith('#')) {
    console.log("The response only contains markdown and starts with '#'. Returning the content as is.");
    return content;
  }

  // 2. If the response contains triple backticks, assume it's a markdown response with comments
  const firstBacktickIndex = content.indexOf('```');
  const lastBacktickIndex = content.lastIndexOf('```');

  if (firstBacktickIndex !== -1 && lastBacktickIndex !== -1) {
    console.log("Triple backticks found in the response. Extracting the markdown content.");

    // Extract the content between the first and last triple backtick
    const markdownContent = content.slice(firstBacktickIndex, lastBacktickIndex + 3); // +3 to include the last triple backticks

    // Remove the starting and ending triple backticks and 'markdown' after the first set of backticks
    const strippedMarkdownContent = markdownContent
      .replace(/^```markdown\n/, '') // remove starting triple backtick and 'markdown'
      .replace(/```$/, ''); // remove ending triple backtick

    return strippedMarkdownContent;
  }

  // 3. If the response doesn't fit the previous cases, assume it only contains text and no markdown. Log the response and return null
  console.log("The response only contains text and no markdown. No pull request will be created.");
  console.log("API Response:", content);
  
  return null;
}








async function createChatCompletion() {
  let response;
  let content;

  if (useAPI) {
    // Call the OpenAI API with the prepared messages
    response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 2048,
      temperature: 0.0,
    });
  
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error("Unexpected API response format.");
      console.error(response);
      return;
    }
      
  } else {
    // Use the appropriate mock response
    // response = getMockResponse('markdownWithComments.txt'); // adjust this based on the test case
    // response = getMockResponse('onlyMarkdown.txt'); // adjust this based on the test case
    response = getMockResponse('onlyText.txt'); // adjust this based on the test case
  }
  

  // Extract markdown from API response
  const markdown = extractMarkdown(response);

  // If markdown is returned, create pull request
  if (markdown) {
    console.log(markdown);
    await createPullRequest(markdown);
  }
}

function getMockResponse(filename) {
  const filePath = path.join(__dirname, 'mockApiResponses', filename); 
  const content = fs.readFileSync(filePath, 'utf8');
  // Format the content to match the structure of a real API response
  return {
    data: {
      choices: [
        {
          message: {
            content: content
          }
        }
      ]
    }
  };
}

// Call the function to start the process
createChatCompletion();
