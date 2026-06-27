#!/usr/bin/env node

import { statSync } from "node:fs";
import { resolve } from "node:path";
import open from "open";
import { findFreePort, startServer } from "./server.js";
import { scanImages } from "./scan.js";
import { resolveLastRead } from "./state.js";

async function main(): Promise<void> {
  const targetPath = resolve(process.argv[2] ?? ".");

  let stat;
  try {
    stat = statSync(targetPath);
  } catch {
    console.error(`ima: path not found: ${targetPath}`);
    process.exit(1);
  }

  if (!stat.isDirectory()) {
    console.error(`ima: not a directory: ${targetPath}`);
    process.exit(1);
  }

  const images = scanImages(targetPath);

  if (images.length === 0) {
    console.error(`ima: no images found in ${targetPath}`);
    process.exit(1);
  }

  const lastRead = resolveLastRead(targetPath, images);

  const port = await findFreePort();
  startServer(targetPath, images, port, lastRead);

  const url = `http://127.0.0.1:${port}`;
  console.log(`Serving ${images.length} image${images.length === 1 ? "" : "s"} at ${url}`);

  await open(url);

  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}

main().catch((err: unknown) => {
  console.error("ima:", err instanceof Error ? err.message : err);
  process.exit(1);
});
