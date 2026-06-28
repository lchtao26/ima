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

- Click a filename to open fullscreen.
- Last-read file is pinned at the top.
- Dual mode shows two images side by side (spread); LTR for Western comics, RTL for manga.
- Preferences (last-read, dual mode, orientation) are saved per folder in `~/.ima/state.json`.

### Keyboard shortcuts

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
| `v` | Toggle dual mode |
| `Esc` | Back to list |

**Dual mode** (viewer only)

| Key | Action |
| --- | --- |
| `j` `↓` `→` `Space` | Next pair (step by 2) |
| `k` `↑` `←` `Shift+Space` | Previous pair (step by 2) |
| `[` `]` | Previous / next (step by 1) |
| `<` `>` | RTL / LTR spread |

## Development

```bash
make build    # compile
make dev      # watch mode
make run      # run without linking
make unlink   # remove global command
```

## Requirements

- Node.js 18+
