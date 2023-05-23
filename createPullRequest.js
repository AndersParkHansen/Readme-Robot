// Load environment variables with API keys
require('dotenv').config();

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 1. Check if the branch exists
octokit.rest.git.getRef({
    owner: 'AndersParkHansen',
    repo: 'openai-check-the-docs',
    ref: 'heads/bot-requests'
}).catch(error => {
    // If branch doesn't exist, create it
    if (error.status === 404) {
        return octokit.rest.git.getRef({
            owner: 'AndersParkHansen',
            repo: 'openai-check-the-docs',
            ref: 'heads/main'
        }).then(response => {
            const sha = response.data.object.sha;
    
            // 2. Create a new reference (branch) based on the main branch
            return octokit.rest.git.createRef({
                owner: 'AndersParkHansen',
                repo: 'openai-check-the-docs',
                ref: 'refs/heads/bot-requests',
                sha: sha
            });
        });
    } else {
        throw error;
    }
}).then(response => {
    // 3. Get the sha of the current README.md
    return octokit.rest.repos.getContent({
        owner: 'AndersParkHansen',
        repo: 'openai-check-the-docs',
        path: 'README.md',
        ref: 'bot-requests',
    });
}).then(response => {
    const sha = response.data.sha;

    // 4. Update the README.md on the new branch
    return octokit.rest.repos.createOrUpdateFileContents({
        owner: 'AndersParkHansen',
        repo: 'openai-check-the-docs',
        path: 'README.md',
        message: 'Bot updates README.md',
        content: Buffer.from('Hello, World!').toString('base64'),
        branch: 'bot-requests',
        sha: sha,
    });
}).then(response => {
    // 5. Create a new pull request
    return octokit.rest.pulls.create({
        owner: 'AndersParkHansen',
        repo: 'openai-check-the-docs',
        title: 'Bot Updates',
        head: 'bot-requests',
        base: 'main'
    });
}).then(response => {
    console.log(`Pull request created! 
    URL: ${response.data.html_url} 
    Number: ${response.data.number}`);
}).catch(error => {
    console.error(error);
});
