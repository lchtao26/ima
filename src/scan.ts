import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".ico",
]);

export function scanImages(dirPath: string): string[] {
  const entries = readdirSync(dirPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("."))
    .filter((name) => IMAGE_EXTENSIONS.has(getExtension(name)))
    .sort(compareImageNames);
}

export function compareImageNames(a: string, b: string): number {
  const baseA = stripExtension(a);
  const baseB = stripExtension(b);
  const baseCompare = baseA.localeCompare(baseB, undefined, {
    numeric: true,
    sensitivity: "base",
  });

  if (baseCompare !== 0) {
    return baseCompare;
  }

  return getExtension(a).localeCompare(getExtension(b), undefined, {
    sensitivity: "base",
  });
}

function stripExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? filename : filename.slice(0, dot);
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export function resolveImagePath(dirPath: string, filename: string): string | null {
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return null;
  }

  const fullPath = join(dirPath, filename);
  try {
    const stat = statSync(fullPath);
    if (!stat.isFile()) return null;
  } catch {
    return null;
  }

  const ext = getExtension(filename);
  if (!IMAGE_EXTENSIONS.has(ext) || filename.startsWith(".")) {
    return null;
  }

  return fullPath;
}
