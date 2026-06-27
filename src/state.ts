import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const STATE_DIR = join(homedir(), ".ima");
const STATE_FILE = join(STATE_DIR, "state.json");

type State = Record<string, string>;

function readState(): State {
  if (!existsSync(STATE_FILE)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8")) as State;
  } catch {
    return {};
  }
}

function writeState(state: State): void {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function getLastRead(dirPath: string): string | null {
  return readState()[dirPath] ?? null;
}

export function setLastRead(dirPath: string, filename: string): void {
  const state = readState();
  state[dirPath] = filename;
  writeState(state);
}

export function clearLastRead(dirPath: string): void {
  const state = readState();
  if (!(dirPath in state)) {
    return;
  }

  delete state[dirPath];
  writeState(state);
}

export function resolveLastRead(dirPath: string, images: string[]): string | null {
  const lastRead = getLastRead(dirPath);
  if (!lastRead) {
    return null;
  }

  if (!images.includes(lastRead)) {
    clearLastRead(dirPath);
    return null;
  }

  return lastRead;
}
