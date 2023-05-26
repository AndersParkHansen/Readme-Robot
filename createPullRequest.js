module.exports = async function createPullRequest(markdown) {
    const { Octokit } = require("@octokit/rest");
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
    const owner = 'AndersParkHansen';
    const repo = 'openai-check-the-docs';
    const baseBranch = 'main';
    const botBranch = 'bot-requests';
  
    // 1. Check if the branch exists
    octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${botBranch}`
    }).catch(error => {
        // If branch doesn't exist, create it
        if (error.status === 404) {
            return octokit.rest.git.getRef({
                owner,
                repo,
                ref: `heads/${baseBranch}`
            }).then(response => {
                const sha = response.data.object.sha;
        
                // 2. Create a new reference (branch) based on the main branch
                return octokit.rest.git.createRef({
                    owner,
                    repo,
                    ref: `refs/heads/${botBranch}`,
                    sha: sha
                });
            });
        } else {
            throw error;
        }
    }).then(response => {
        // 3. Get the sha of the current README.md
        return octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'README.md',
            ref: botBranch,
        });
    }).then(response => {
        const sha = response.data.sha;
  
        // Update the README.md on the new branch with the given markdown
        return octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: 'README.md',
            message: 'Bot updates README.md',
            content: Buffer.from(markdown).toString('base64'), // Use markdown here
            branch: botBranch,
            sha: sha,
        });
    }).then(response => {
        // 5. Create a new pull request
        return octokit.rest.pulls.create({
            owner,
            repo,
            title: 'Bot Updates',
            head: botBranch,
            base: baseBranch
        });
    }).then(response => {
        console.log(`Pull request created! 
        URL: ${response.data.html_url} 
        Number: ${response.data.number}`);
    }).catch(error => {
        console.error(error);
    });
  }
  