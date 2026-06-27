# ima

A local CLI to browse images in a folder. Starts a server, opens your browser, and lets you view images fullscreen with keyboard navigation.

## Install

```bash
git clone https://github.com/lchtao26/ima.git
cd ima
make setup
```

This installs dependencies, builds the project, and links the `ima` command globally.

## Usage

```bash
ima .              # current directory
ima ~/Pictures     # specific folder
```

Press **Ctrl+C** in the terminal to stop the server.

## Viewer

Click a filename to open fullscreen. Last-read file is pinned at the top (saved in `~/.ima/state.json`).

**List**

| Key | Action |
| --- | --- |
| `j` `↓` | Move selection down |
| `k` `↑` | Move selection up |
| `Enter` | Open selected image |

**Viewer**

| Key | Action |
| --- | --- |
| `j` `↓` `→` `Space` | Next |
| `k` `↑` `←` `Shift+Space` | Previous |
| `Esc` | Back to list |

## Development

```bash
make build    # compile
make dev      # watch mode
make run      # run without linking
make unlink   # remove global command
```

## Requirements

- Node.js 18+
