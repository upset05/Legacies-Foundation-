import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

async function findFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  const relativePath = path.normalize(decodedPath.replace(/^[/\\]+/, ""));
  let candidate = path.resolve(root, relativePath);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return null;

  const candidates = [candidate];
  if (!path.extname(candidate)) candidates.push(`${candidate}.html`, path.join(candidate, "index.html"));

  for (const filePath of candidates) {
    try {
      await access(filePath);
      if ((await stat(filePath)).isFile()) return filePath;
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
    }
  }
  return null;
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, "http://localhost");
    const filePath = await findFile(requestUrl.pathname);
    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error("Preview request failed:", error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Unable to serve this preview request");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Preview ready at http://127.0.0.1:${port}`);
});
