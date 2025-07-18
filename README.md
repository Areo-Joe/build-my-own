# build-my-own

`build-my-own` is a CLI tool for `Build Your Own X`. It clones a GitHub project and sets up AI teaching rules for both Cursor and Claude Code editors, so that you can make AI guide you to rebuild the project from the ground up. Through rebuilding a version of your own, I believe that you can better understand the project.

## Features

- **CLI Mode**: Traditional command-line interface for project setup
- **MCP Mode**: Model Context Protocol server for AI integration
- **Multi-Editor Support**: Works with both Cursor and Claude Code editors
- **AI-Friendly Tools**: Dynamic path support for flexible project management
- **Learning Environment**: Automatic setup of teaching rules and project structure

## usage

### MCP Mode (Default)

`build-my-own` now supports MCP (Model Context Protocol) for seamless AI integration:

```shell
npx -y build-my-own
```

This starts an MCP server with stdio transport, providing AI assistants with tools to:
- Clone and setup projects with dynamic paths
- Create and manage cursor rules files
- List existing build-my-own projects

The MCP server provides three main tools:
- `clone_and_setup_project`: Clone repos and setup learning environments (supports both Cursor and Claude Code)
- `create_rules_file`: Create/update AI teaching rules for your preferred editor
- `list_projects`: List all build-my-own projects with editor support information

### CLI Mode

Install:

```shell
npm i -g build-my-own
```

Run:

> The following command creates a new directory in current pwd with the name of the project.

```shell
build-my-own --github <github-url>
```

### MCP Integration

To use with AI assistants that support MCP:

1. Start the server: `npx -y build-my-own`
2. The AI can now use the provided tools to help you learn by rebuilding projects
3. Projects are created with flexible paths as specified by the AI
4. Teaching rules are automatically configured for optimal learning

## Project Structure

When a project is cloned, `build-my-own` creates:

### For Cursor:
```
project-name/
├── project-name-original/    # The original cloned repository
├── project-name-my-own/      # Your workspace for rebuilding
└── .cursor/
    └── rules/
        └── teach.mdc         # AI teaching rules for guided learning
```

### For Claude Code:
```
project-name/
├── project-name-original/    # The original cloned repository
├── project-name-my-own/      # Your workspace for rebuilding
└── CLAUDE.md                 # AI teaching rules for guided learning
```

The tool automatically detects your preferred editor and sets up the appropriate configuration.