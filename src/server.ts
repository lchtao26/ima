import { createReadStream } from "node:fs";
import { extname, basename } from "node:path";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import net from "node:net";
import { resolveImagePath } from "./scan.js";
import { renderPage } from "./page.js";
import { setLastRead } from "./state.js";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
};

export async function findFreePort(start = 3847): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();

    probe.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(findFreePort(start + 1));
        return;
      }
      reject(err);
    });

    probe.listen(start, "127.0.0.1", () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? address.port : start;
      probe.close((closeErr) => {
        if (closeErr) reject(closeErr);
        else resolve(port);
      });
    });
  });
}

export function startServer(
  dirPath: string,
  images: string[],
  port: number,
  lastRead: string | null,
): ReturnType<typeof createServer> {
  const server = createServer((req, res) => {
    handleRequest(req, res, dirPath, images, lastRead).catch(() => {
      if (!res.headersSent) {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    });
  });

  server.listen(port, "127.0.0.1");
  return server;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  dirPath: string,
  images: string[],
  lastRead: string | null,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderPage(images, lastRead, basename(dirPath)));
    return;
  }

  if (url.pathname === "/api/last-read" && req.method === "POST") {
    const body = await readBody(req);
    let filename: string;

    try {
      filename = (JSON.parse(body) as { filename: string }).filename;
    } catch {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    if (!images.includes(filename)) {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    setLastRead(dirPath, filename);
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname.startsWith("/image/")) {
    const filename = decodeURIComponent(url.pathname.slice("/image/".length));
    const imagePath = resolveImagePath(dirPath, filename);

    if (!imagePath || !images.includes(filename)) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    const ext = extname(filename).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" });
    createReadStream(imagePath).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}
