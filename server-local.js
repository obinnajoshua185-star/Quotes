// server-local.js - For local development only
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

const quotes = [
  {
    id: 1,
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
  },
  {
    id: 2,
    quote:
      "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein",
  },
  {
    id: 3,
    quote: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
  },
  {
    id: 4,
    quote:
      "Be who you are and say what you feel, because those who mind don't matter, and those who matter don't mind",
    author: "Bernard M. Baruch",
  },
  {
    id: 5,
    quote: "You only live once, but if you do it right, once is enough.",
    author: "Mae West",
  },
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Serve static files
  if (pathname === "/" || pathname === "/index.html") {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  // Serve quotes API
  if (pathname === "/api/quotes") {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === "GET") {
      if (parsedUrl.query.random) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(randomQuote));
      } else if (parsedUrl.query.id) {
        const id = parseInt(parsedUrl.query.id);
        const quote = quotes.find((q) => q.id === id);
        if (quote) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(quote));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Quote not found" }));
        }
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(quotes));
      }
      return;
    }
  }

  // Serve other static files (CSS, JS)
  const ext = path.extname(pathname);
  if (ext === ".css" || ext === ".js") {
    fs.readFile(path.join(__dirname, pathname), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": ext === ".css" ? "text/css" : "application/javascript",
      });
      res.end(data);
    });
    return;
  }

  // 404 for everything else
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(3000, () => {
  console.log("Local server running at http://localhost:3000/");
  console.log("API available at http://localhost:3000/api/quotes");
});
