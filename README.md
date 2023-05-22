# openai-check-the-docs

This GitHub action compares the contents of pushed code with the contents of the README.md and creates a pull request with suggested documentation changes. It uses the OpenAI API to generate suggestions for documentation updates.

## Setup (locally for testing)
0. Create an OpenAI API key at https://platform.openai.com/ if you do not already have one
1. Install the required dependencies:

```bash
pnm install
```

2. Create a `.env` file in the root directory and add your OpenAI API key:

```ini
OPENAI_API_KEY=your_api_key_here
```

## Usage

Run the script with the following command:

```bash
node index.js
```

The script will read the contents of `index. js` (change file name in the code to read another file) and compare it with the existing `README.md` file. If the README file doesn't exist, it will generate a new one based on the code.

## How it works

1. The script loads the required modules and configures the OpenAI API client with the provided API key.
2. It reads the contents of the `start.js` file.
3. If a `README.md` file exists, it compares the contents of the README and the code, and suggests changes. If the README file doesn't exist, it generates a new one based on the code.
4. The script calls the OpenAI API with the prepared messages and logs the suggested changes or new README content.

## TODO

- Read changed files in a commit from GitHub instead of reading directly from the local filesystem.
- Change the script to read the content of files affected by a commit instead of a hardcoded `index.js` file.