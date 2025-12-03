// ============================================
// QUOTES API - Vercel Serverless Function
// Location: /api/quotes.js
// ============================================

// Sample quotes database
const quotes = [
  {
    id: 1,
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "Life",
  },
  {
    id: 2,
    quote:
      "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein",
    category: "Science",
  },
  {
    id: 3,
    quote: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
    category: "Books",
  },
  {
    id: 4,
    quote:
      "Be who you are and say what you feel, because those who mind don't matter, and those who matter don't mind",
    author: "Bernard M. Baruch",
    category: "Life",
  },
  {
    id: 5,
    quote: "You only live once, but if you do it right, once is enough.",
    author: "Mae West",
    category: "Life",
  },
  {
    id: 6,
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Work",
  },
  {
    id: 7,
    quote: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "Life",
  },
  {
    id: 8,
    quote:
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Inspiration",
  },
  {
    id: 9,
    quote:
      "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "Hope",
  },
  {
    id: 10,
    quote: "Whoever is happy will make others happy too.",
    author: "Anne Frank",
    category: "Happiness",
  },
  {
    id: 11,
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Opportunity",
  },
  {
    id: 12,
    quote: "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
    category: "Happiness",
  },
  {
    id: 13,
    quote:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Success",
  },
  {
    id: 14,
    quote: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Motivation",
  },
  {
    id: 15,
    quote: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
    category: "Time",
  },
];

// Main serverless function handler
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only GET requests are supported",
    });
  }

  try {
    // Parse query parameters
    const { id, random, limit, category, author } = req.query;

    let responseData = [...quotes];

    // Filter by ID if provided
    if (id) {
      const quoteId = parseInt(id);
      const quote = quotes.find((q) => q.id === quoteId);

      if (!quote) {
        return res.status(404).json({
          error: "Not found",
          message: `Quote with ID ${id} not found`,
        });
      }

      responseData = [quote];
    }

    // Filter by category if provided
    if (category) {
      responseData = responseData.filter(
        (q) => q.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by author if provided
    if (author) {
      responseData = responseData.filter((q) =>
        q.author.toLowerCase().includes(author.toLowerCase())
      );
    }

    // Get random quote if requested
    if (random) {
      const randomIndex = Math.floor(Math.random() * responseData.length);
      responseData = responseData.length > 0 ? [responseData[randomIndex]] : [];
    }

    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        responseData = responseData.slice(0, limitNum);
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      count: responseData.length,
      total: quotes.length,
      data: responseData,
      timestamp: new Date().toISOString(),
      api: {
        name: "Inspirational Quotes API",
        version: "1.0.0",
        documentation:
          "Use query parameters: ?random=true, ?id=1, ?category=Life, ?author=Einstein, ?limit=5",
      },
    });
  } catch (error) {
    console.error("API Error:", error);

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    });
  }
}

// Optional: For testing locally
if (process.env.NODE_ENV === "development") {
  // This allows you to run: node api/quotes.js for local testing
  import("http").then((http) => {
    const server = http.createServer(async (req, res) => {
      // Mock request object
      const mockReq = {
        method: req.method,
        query: new URL(req.url, `http://${req.headers.host}`).searchParams,
      };

      // Mock response object
      const mockRes = {
        setHeader: (key, value) => res.setHeader(key, value),
        status: (code) => ({
          json: (data) => {
            res.writeHead(code, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
          },
          end: () => {
            res.writeHead(code);
            res.end();
          },
        }),
      };

      await handler(mockReq, mockRes);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(
        `Local server running on http://localhost:${PORT}/api/quotes`
      );
      console.log("Try: http://localhost:3000/api/quotes?random=true");
    });
  });
}
