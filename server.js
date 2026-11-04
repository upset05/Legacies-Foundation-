import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import applicationHandler from "./api/apply.js";
import mcpHandler from "./api/mcp.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(root, "dist");
const app = express();
const linkHeader = '</llms.txt>; rel="describedby", </index.md>; rel="alternate"; type="text/markdown"';

app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: false, limit: "64kb" }));
app.all("/api/apply", applicationHandler);
app.all("/api/mcp", mcpHandler);

app.use((request, response, next) => {
  if (request.method !== "GET" && request.method !== "HEAD") return next();

  const requestedPath = request.path;
  if (requestedPath === "/") {
    response.set("Link", linkHeader);
    response.vary("Accept");
    if (prefersMarkdown(request.get("Accept"))) {
      response.type("text/markdown");
      return response.sendFile(path.join(publicDirectory, "index.md"));
    }
    return response.sendFile(path.join(publicDirectory, "index.html"));
  }

  if (requestedPath === "/index.html") return response.redirect(301, "/");
  if (requestedPath.endsWith("/index.html")) {
    return response.redirect(301, requestedPath.slice(0, -11) || "/");
  }
  if (requestedPath.endsWith(".html")) {
    return response.redirect(301, requestedPath.slice(0, -5));
  }
  if (requestedPath.length > 1 && requestedPath.endsWith("/")) {
    return response.redirect(301, requestedPath.slice(0, -1));
  }

  const cleanRoute = requestedPath === "/careers" || requestedPath === "/catalogue"
    ? path.join(publicDirectory, `${requestedPath.slice(1)}.html`)
    : path.resolve(publicDirectory, `.${requestedPath}`, "index.html");
  if (!cleanRoute.startsWith(`${publicDirectory}${path.sep}`) || !existsSync(cleanRoute)) return next();
  return response.sendFile(cleanRoute);
});

app.use(express.static(publicDirectory, {
  dotfiles: "allow",
  index: false,
  redirect: false,
  setHeaders(response, filePath) {
    if (filePath.endsWith(".md")) response.type("text/markdown");
  },
}));

app.use((request, response) => {
  response.status(404).sendFile(path.join(publicDirectory, "404.html"));
});

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
  console.error("Request processing failed.", error);
  response.status(status).json({ error: status === 413 ? "Request body is too large." : "The request could not be processed." });
});

function prefersMarkdown(header = "") {
  let markdownQuality = 0;
  let htmlQuality = 0;
  for (const item of header.split(",")) {
    const [type, ...parameters] = item.trim().toLowerCase().split(";");
    const quality = Number(parameters.find(parameter => parameter.trim().startsWith("q="))?.split("=")[1] ?? 1);
    if (!Number.isFinite(quality) || quality <= 0) continue;
    if (type === "text/markdown") markdownQuality = quality;
    if (type === "text/html" || type === "application/xhtml+xml") htmlQuality = quality;
  }
  return markdownQuality > htmlQuality;
}

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid TCP port.");
app.listen(port, "0.0.0.0", () => {
  console.log(`Legacies Global site listening on port ${port}.`);
});
