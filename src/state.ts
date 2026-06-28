import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const STATE_DIR = join(homedir(), ".ima");
const STATE_FILE = join(STATE_DIR, "state.json");

type FolderState = {
  lastRead?: string;
  dualMode?: boolean;
};

type RawState = Record<string, string | FolderState>;

function readRawState(): RawState {
  if (!existsSync(STATE_FILE)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8")) as RawState;
  } catch {
    return {};
  }
}

function normalizeFolderEntry(raw: string | FolderState | undefined): FolderState {
  if (typeof raw === "string") {
    return { lastRead: raw };
  }

  if (!raw) {
    return {};
  }

  return { ...raw };
}

function writeFolderEntry(dirPath: string, entry: FolderState): void {
  const state = readRawState();
  const hasLastRead = entry.lastRead !== undefined;
  const hasDualMode = entry.dualMode === true;

  if (!hasLastRead && !hasDualMode) {
    delete state[dirPath];
  } else {
    const next: FolderState = {};
    if (hasLastRead) {
      next.lastRead = entry.lastRead;
    }
    if (hasDualMode) {
      next.dualMode = true;
    }
    state[dirPath] = next;
  }

  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getFolderEntry(dirPath: string): FolderState {
  return normalizeFolderEntry(readRawState()[dirPath]);
}

export function getLastRead(dirPath: string): string | null {
  return getFolderEntry(dirPath).lastRead ?? null;
}

export function getDualMode(dirPath: string): boolean {
  return getFolderEntry(dirPath).dualMode ?? false;
}

export function setLastRead(dirPath: string, filename: string): void {
  const entry = getFolderEntry(dirPath);
  entry.lastRead = filename;
  writeFolderEntry(dirPath, entry);
}

export function setDualMode(dirPath: string, dualMode: boolean): void {
  const entry = getFolderEntry(dirPath);
  entry.dualMode = dualMode;
  writeFolderEntry(dirPath, entry);
}

function clearLastReadOnly(dirPath: string): void {
  const entry = getFolderEntry(dirPath);
  if (!entry.lastRead) {
    return;
  }

  delete entry.lastRead;
  writeFolderEntry(dirPath, entry);
}

export function resolveLastRead(dirPath: string, images: string[]): string | null {
  const lastRead = getLastRead(dirPath);
  if (!lastRead) {
    return null;
  }

  if (!images.includes(lastRead)) {
    clearLastReadOnly(dirPath);
    return null;
  }

  return lastRead;
}
