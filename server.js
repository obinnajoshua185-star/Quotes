// server.js - Modified with multiple quote categories
const http = require("http");
const url = require("url");

// Multiple quote categories (5 quotes each)
const quoteCategories = {
  wisdom: [
    {
      id: 1,
      quote: "Be yourself; everyone else is already taken.",
      author: "Oscar Wilde",
      category: "wisdom",
    },
    {
      id: 2,
      quote: "The only true wisdom is in knowing you know nothing.",
      author: "Socrates",
      category: "wisdom",
    },
    {
      id: 3,
      quote: "Knowing yourself is the beginning of all wisdom.",
      author: "Aristotle",
      category: "wisdom",
    },
    {
      id: 4,
      quote:
        "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.",
      author: "Albert Einstein",
      category: "wisdom",
    },
    {
      id: 5,
      quote:
        "The fool doth think he is wise, but the wise man knows himself to be a fool.",
      author: "William Shakespeare",
      category: "wisdom",
    },
  ],

  inspiration: [
    {
      id: 6,
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "inspiration",
    },
    {
      id: 7,
      quote: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "inspiration",
    },
    {
      id: 8,
      quote:
        "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "inspiration",
    },
    {
      id: 9,
      quote: "It always seems impossible until it's done.",
      author: "Nelson Mandela",
      category: "inspiration",
    },
    {
      id: 10,
      quote: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      category: "inspiration",
    },
  ],

  success: [
    {
      id: 11,
      quote:
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "success",
    },
    {
      id: 12,
      quote: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      category: "success",
    },
    {
      id: 13,
      quote:
        "Success is walking from failure to failure with no loss of enthusiasm.",
      author: "Winston Churchill",
      category: "success",
    },
    {
      id: 14,
      quote: "Don't be afraid to give up the good to go for the great.",
      author: "John D. Rockefeller",
      category: "success",
    },
    {
      id: 15,
      quote: "I find that the harder I work, the more luck I seem to have.",
      author: "Thomas Jefferson",
      category: "success",
    },
  ],

  life: [
    {
      id: 16,
      quote:
        "Life is what happens to you while you're busy making other plans.",
      author: "John Lennon",
      category: "life",
    },
    {
      id: 17,
      quote: "You only live once, but if you do it right, once is enough.",
      author: "Mae West",
      category: "life",
    },
    {
      id: 18,
      quote:
        "In the end, it's not the years in your life that count. It's the life in your years.",
      author: "Abraham Lincoln",
      category: "life",
    },
    {
      id: 19,
      quote: "Life is really simple, but we insist on making it complicated.",
      author: "Confucius",
      category: "life",
    },
    {
      id: 20,
      quote: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      category: "life",
    },
  ],

  humor: [
    {
      id: 21,
      quote:
        "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
      author: "Albert Einstein",
      category: "humor",
    },
    {
      id: 22,
      quote: "I'm not arguing, I'm just explaining why I'm right.",
      author: "Anonymous",
      category: "humor",
    },
    {
      id: 23,
      quote: "I'm not lazy, I'm on energy saving mode.",
      author: "Anonymous",
      category: "humor",
    },
    {
      id: 24,
      quote:
        "I told my computer I needed a break, and now it won't stop sending me KitKat ads.",
      author: "Anonymous",
      category: "humor",
    },
    {
      id: 25,
      quote:
        "I don't need a hairstylist, my pillow gives me a new hairstyle every morning.",
      author: "Anonymous",
      category: "humor",
    },
  ],
};

// Combine all quotes
const allQuotes = Object.values(quoteCategories).flat();

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET /categories - Get all categories
  if (path === "/categories" && req.method === "GET") {
    const categories = Object.keys(quoteCategories).map((category) => ({
      name: category,
      count: quoteCategories[category].length,
    }));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(categories));
    return;
  }

  // GET /quotes/:category - Get quotes by category (5 quotes)
  if (path.startsWith("/quotes/category/")) {
    const category = path.split("/")[3];

    if (!quoteCategories[category]) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Category not found" }));
      return;
    }

    const quotes = quoteCategories[category];

    // Apply limit if specified, otherwise return 5
    const limit = query.limit ? parseInt(query.limit) : 5;
    const limitedQuotes = quotes.slice(0, Math.min(limit, quotes.length));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(limitedQuotes));
    return;
  }

  // GET /quote - Get random quote from any category
  if (path === "/quote") {
    const randomCategory =
      Object.keys(quoteCategories)[
        Math.floor(Math.random() * Object.keys(quoteCategories).length)
      ];
    const randomQuotes = quoteCategories[randomCategory];
    const randomQuote =
      randomQuotes[Math.floor(Math.random() * randomQuotes.length)];

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(randomQuote));
    return;
  }

  // GET /quotes - Get all quotes or filtered by category
  if (path === "/quotes") {
    let quotesToSend = allQuotes;

    // Filter by category if specified
    if (query.category) {
      quotesToSend = allQuotes.filter((q) => q.category === query.category);
    }

    // Apply limit if specified, default to 5
    const limit = query.limit ? parseInt(query.limit) : 5;
    quotesToSend = quotesToSend.slice(0, Math.min(limit, quotesToSend.length));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(quotesToSend));
    return;
  }

  // GET /quotes/random/:count - Get random quotes (default 5)
  if (path.startsWith("/quotes/random")) {
    const count = query.count ? parseInt(query.count) : 5;

    // Get random quotes from all categories
    const randomQuotes = [];
    const usedIndices = new Set();

    while (
      randomQuotes.length < count &&
      randomQuotes.length < allQuotes.length
    ) {
      const randomIndex = Math.floor(Math.random() * allQuotes.length);
      if (!usedIndices.has(randomIndex)) {
        randomQuotes.push(allQuotes[randomIndex]);
        usedIndices.add(randomIndex);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(randomQuotes));
    return;
  }

  // GET /quotes/:id - Get quote by ID
  if (path.startsWith("/quotes/") && !isNaN(path.split("/")[2])) {
    const id = parseInt(path.split("/")[2], 10);
    const quote = allQuotes.find((q) => q.id === id);

    if (quote) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quote));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Quote not found" }));
    }
    return;
  }

  // 404 for everything else
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// FIXED: Changed to port 3000
server.listen(3000, () => {
  console.log("✅ Quotes API Server running at http://localhost:3000/");
  console.log("📚 Available Endpoints:");
  console.log("   GET /categories                - Get all categories");
  console.log("   GET /quotes                    - Get 5 random quotes");
  console.log("   GET /quotes?category=wisdom    - Get 5 wisdom quotes");
  console.log("   GET /quotes?limit=10           - Get 10 quotes");
  console.log("   GET /quotes/random?count=3     - Get 3 random quotes");
  console.log("   GET /quotes/category/inspiration - Get 5 inspiration quotes");
  console.log("   GET /quote                     - Get 1 random quote");
  console.log("   GET /quotes/:id                - Get quote by ID");
  console.log("\n📊 Total Quotes Available: " + allQuotes.length);
  console.log("📁 Categories: " + Object.keys(quoteCategories).join(", "));
});
