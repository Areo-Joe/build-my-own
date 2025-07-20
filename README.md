# build-my-own

## Introduction

`build-my-own` is an AI-friendly CLI tool. Use `build-my-own` to replicate any GitHub project. It sets up the directory structure, prompts, and rules for AI, enabling it to assist you—more like guiding you—to recreate your desired project from scratch. Throughout the process, you’ll collaborate with AI to think through the details of project implementation and understand its principles. Ultimately, you’ll gain a fresh, deeper, and practical understanding of the project.

## Usage

`build-my-own` offers two usage modes:
- MCP Server: Starts an Stdio MCP Server for use in Cursor, Claude Code, or other AI tools.
- CLI: Builds an AI-friendly directory structure and prompts via CLI.

### MCP Server

Configure the MCP Server in your AI tool:
```json
{
  "mcp": {
    "servers": {
      "everything": {
        "command": "npx",
        "args": ["-y", "build-my-own"]
      }
    }
  }
}
```

Then, you can interact with AI. For example, to replicate the Redux project:

```plaintext
I want to rebuild Redux, help me with the build-my-own tool.
```

### CLI

Install:

```shell
npm i -g build-my-own
```

Usage:

```shell
// github-project-url should be ended with `.git`
build-my-own --github <github-project-url>
```

## Why I Built This Project

AI can generate code, but we humans need to master the code it produces. Here are two reasons why:

- Humans maintain the code: If we don’t understand the code AI generates, we can’t maintain it. If AI becomes unreliable or unable to fix issues it creates, the entire project could collapse.
- If you’re using AI to generate code you don’t understand, you’re just creating another potentially unstable product for the world, and you’re not growing personally.

Using AI alongside human knowledge to boost efficiency is crucial. Equally important is leveraging AI as a powerful tool for self-evolution, quickly internalizing unfamiliar knowledge into our own capabilities.
