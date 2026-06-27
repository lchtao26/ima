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

- Click a filename to open fullscreen
- **Esc** to close
- **↑ / ↓ / ← / →**, **Space** (next), **Shift+Space** (previous) to navigate
- Last-read file is pinned at the top (saved in `~/.ima/state.json`)

## Development

```bash
make build    # compile
make dev      # watch mode
make run      # run without linking
make unlink   # remove global command
```

## Requirements

- Node.js 18+
