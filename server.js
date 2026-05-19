const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
};

http
      .createServer((req, res) => {
            const urlPath = decodeURIComponent(req.url.split("?")[0]);
            const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
            const isRoot = safePath === "/" || safePath === "\\";
            let filePath = path.join(ROOT, isRoot ? "index.html" : safePath);

            fs.stat(filePath, (err, stats) => {
                  if (err || !stats.isFile()) {
                        res.writeHead(404);
                        res.end("Not found");
                        return;
                  }

                  const ext = path.extname(filePath).toLowerCase();
                  res.writeHead(200, {
                        "Content-Type": MIME[ext] || "application/octet-stream",
                  });
                  fs.createReadStream(filePath).pipe(res);
            });
      })
      .listen(PORT, () => {
            console.log(`http://localhost:${PORT}`);
      });
