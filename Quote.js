// ============================================
// INSPIRATIONAL QUOTES APP - Frontend JavaScript
// Works with Vercel Serverless API
// ============================================

// API Configuration - Works both locally and on Vercel
const API_BASE = "/api"; // Relative path for Vercel deployment

// DOM Elements
const loadQuotesBtn = document.getElementById("loadQuotes");
const refreshQuotesBtn = document.getElementById("refreshQuotes");
const clearQuotesBtn = document.getElementById("clearQuotes");
const randomQuoteBtn = document.getElementById("randomQuoteBtn");
const searchInput = document.getElementById("searchInput");
const quotesContainer = document.getElementById("quotesContainer");
const messageDiv = document.getElementById("message");
const loadingMessageDiv = document.getElementById("loadingMessage");
const totalQuotesEl = document.getElementById("totalQuotes");
const filteredQuotesEl = document.getElementById("filteredQuotes");

// State Management
let allQuotes = [];
let filteredQuotes = [];

// Fallback quotes in case API fails
const FALLBACK_QUOTES = [
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
  {
    id: 6,
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    id: 7,
    quote: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
  },
  {
    id: 8,
    quote:
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    id: 9,
    quote:
      "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  {
    id: 10,
    quote: "Whoever is happy will make others happy too.",
    author: "Anne Frank",
  },
  {
    id: 11,
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    id: 12,
    quote: "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
  },
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("Quotes App Initialized");
  initializeApp();
});

function initializeApp() {
  // Add event listeners to buttons
  if (loadQuotesBtn) {
    loadQuotesBtn.addEventListener("click", loadAllQuotes);
  }

  if (refreshQuotesBtn) {
    refreshQuotesBtn.addEventListener("click", refreshQuotes);
  }

  if (clearQuotesBtn) {
    clearQuotesBtn.addEventListener("click", clearQuotes);
  }

  if (randomQuoteBtn) {
    randomQuoteBtn.addEventListener("click", loadRandomQuote);
  }

  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

  // Update stats display
  updateStats();

  // Show welcome message after a short delay
  setTimeout(() => {
    if (allQuotes.length === 0) {
      showMessage(
        "✨ Ready to explore quotes? Click 'Load Quotes' to begin!",
        "info"
      );
    }
  }, 1500);
}

// ============================================
// API FUNCTIONS
// ============================================

async function loadAllQuotes() {
  showLoading("🌐 Connecting to quotes server...");

  try {
    // Fetch from Vercel serverless function
    const response = await fetch(`${API_BASE}/quotes`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Add timeout for better error handling
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Handle different response formats
    if (Array.isArray(data)) {
      allQuotes = data;
    } else if (data.quotes && Array.isArray(data.quotes)) {
      allQuotes = data.quotes;
    } else {
      // If response is not an array, use fallback
      console.warn("Unexpected API response format:", data);
      allQuotes = FALLBACK_QUOTES;
      showMessage(
        "📦 Using backup quotes (server returned unexpected format)",
        "warning"
      );
    }

    filteredQuotes = [...allQuotes];
    displayQuotes(allQuotes);
    updateStats();
    showMessage(
      `✅ Loaded ${allQuotes.length} inspirational quotes`,
      "success"
    );
  } catch (error) {
    console.error("Error loading quotes:", error);

    if (error.name === "AbortError" || error.name === "TimeoutError") {
      showMessage("⏱️ Server timeout. Using backup quotes...", "warning");
    } else if (error.message.includes("Failed to fetch")) {
      showMessage(
        "🔌 Cannot connect to server. Using backup quotes...",
        "warning"
      );
    } else {
      showMessage("⚠️ Error loading quotes. Using backup quotes...", "warning");
    }

    loadFallbackQuotes();
  } finally {
    hideLoading();
  }
}

async function loadRandomQuote() {
  showLoading("🎲 Getting a random quote...");

  try {
    const response = await fetch(`${API_BASE}/quotes?random=true`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const randomQuote = await response.json();

    // Display the random quote prominently
    quotesContainer.innerHTML = `
      <div class="quote-card featured">
        <div class="quote-number">#${randomQuote.id || "RND"}</div>
        <div class="quote-text">"${escapeHtml(randomQuote.quote)}"</div>
        <div class="quote-author">— ${escapeHtml(randomQuote.author)}</div>
        <div class="quote-actions">
          <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(
            randomQuote.quote
          )} - ${escapeHtml(randomQuote.author)}')">
            <i class="fas fa-copy"></i> Copy
          </button>
          <button class="share-btn" onclick="shareQuote('${escapeHtml(
            randomQuote.quote
          )}', '${escapeHtml(randomQuote.author)}')">
            <i class="fas fa-share-alt"></i> Share
          </button>
        </div>
      </div>
    `;

    // Update state
    allQuotes = [randomQuote];
    filteredQuotes = [randomQuote];
    updateStats();

    showMessage("🎯 Random quote loaded successfully!", "success");
  } catch (error) {
    console.error("Error loading random quote:", error);

    // Fallback to local random quote
    const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
    const randomQuote = FALLBACK_QUOTES[randomIndex];

    quotesContainer.innerHTML = `
      <div class="quote-card featured">
        <div class="quote-number">#${randomQuote.id}</div>
        <div class="quote-text">"${escapeHtml(randomQuote.quote)}"</div>
        <div class="quote-author">— ${escapeHtml(randomQuote.author)}</div>
        <div class="quote-actions">
          <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(
            randomQuote.quote
          )} - ${escapeHtml(randomQuote.author)}')">
            <i class="fas fa-copy"></i> Copy
          </button>
          <button class="share-btn" onclick="shareQuote('${escapeHtml(
            randomQuote.quote
          )}', '${escapeHtml(randomQuote.author)}')">
            <i class="fas fa-share-alt"></i> Share
          </button>
        </div>
      </div>
    `;

    allQuotes = [randomQuote];
    filteredQuotes = [randomQuote];
    updateStats();

    showMessage("📚 Loaded random quote from backup collection", "info");
  } finally {
    hideLoading();
  }
}

function loadFallbackQuotes() {
  allQuotes = FALLBACK_QUOTES;
  filteredQuotes = [...FALLBACK_QUOTES];
  displayQuotes(allQuotes);
  updateStats();
  showMessage(`📦 Loaded ${allQuotes.length} backup quotes`, "info");
}

function refreshQuotes() {
  if (allQuotes.length === 0) {
    showMessage("No quotes to refresh. Please load quotes first.", "warning");
    return;
  }

  showLoading("🔀 Shuffling quotes...");

  try {
    // Shuffle using Fisher-Yates algorithm
    const shuffledQuotes = [...allQuotes];
    for (let i = shuffledQuotes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuotes[i], shuffledQuotes[j]] = [
        shuffledQuotes[j],
        shuffledQuotes[i],
      ];
    }

    displayQuotes(shuffledQuotes);
    showMessage("🔄 Quotes shuffled successfully!", "success");
  } catch (error) {
    console.error("Error refreshing quotes:", error);
    showMessage("Error refreshing quotes", "error");
  } finally {
    hideLoading();
  }
}

function clearQuotes() {
  allQuotes = [];
  filteredQuotes = [];
  if (searchInput) searchInput.value = "";
  showWelcomeMessage();
  updateStats();
  showMessage("🗑️ All quotes cleared", "info");
}

function handleSearch() {
  if (!searchInput) return;

  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredQuotes = [...allQuotes];
  } else {
    filteredQuotes = allQuotes.filter(
      (quote) =>
        quote.quote.toLowerCase().includes(searchTerm) ||
        quote.author.toLowerCase().includes(searchTerm)
    );
  }

  if (filteredQuotes.length === 0 && allQuotes.length > 0) {
    displayNoResults(searchTerm);
  } else {
    displayQuotes(filteredQuotes);
  }

  updateStats();
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayQuotes(quotes) {
  if (!quotesContainer) return;

  if (!quotes || quotes.length === 0) {
    displayNoResults();
    return;
  }

  const quotesHTML = quotes
    .map(
      (quote, index) => `
        <div class="quote-card ${
          index === 0 && quotes.length > 1 ? "featured" : ""
        }" data-id="${quote.id}">
          <div class="quote-number">#${quote.id}</div>
          <div class="quote-text">"${escapeHtml(quote.quote)}"</div>
          <div class="quote-author">— ${escapeHtml(quote.author)}</div>
          <div class="quote-actions">
            <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(
              quote.quote
            )} - ${escapeHtml(quote.author)}')">
              <i class="fas fa-copy"></i> Copy
            </button>
            <button class="share-btn" onclick="shareQuote('${escapeHtml(
              quote.quote
            )}', '${escapeHtml(quote.author)}')">
              <i class="fas fa-share-alt"></i> Share
            </button>
          </div>
        </div>
      `
    )
    .join("");

  quotesContainer.innerHTML = quotesHTML;

  // Add fade-in animation
  const quoteCards = quotesContainer.querySelectorAll(".quote-card");
  quoteCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.05}s`;
    card.classList.add("fade-in");
  });
}

function displayNoResults(searchTerm = "") {
  if (!quotesContainer) return;

  quotesContainer.innerHTML = `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <h3>No quotes found${searchTerm ? ` for "${searchTerm}"` : ""}</h3>
      <p>Try different search terms or load quotes to get started</p>
      ${
        allQuotes.length === 0
          ? '<div class="button-group-center">' +
            '<button onclick="loadAllQuotes()" class="btn btn-primary"><i class="fas fa-download"></i> Load Quotes</button>' +
            '<button onclick="loadFallbackQuotes()" class="btn btn-secondary"><i class="fas fa-database"></i> Use Backup</button>' +
            "</div>"
          : ""
      }
    </div>
  `;
}

function showWelcomeMessage() {
  if (!quotesContainer) return;

  quotesContainer.innerHTML = `
    <div class="welcome-state">
      <i class="fas fa-lightbulb"></i>
      <h3>Welcome to Inspirational Quotes</h3>
      <p>Discover wisdom and inspiration from great minds throughout history</p>
      
      <div class="features">
        <div class="feature">
          <i class="fas fa-download"></i>
          <span>Load quotes from our API</span>
        </div>
        <div class="feature">
          <i class="fas fa-random"></i>
          <span>Get random inspirational quotes</span>
        </div>
        <div class="feature">
          <i class="fas fa-search"></i>
          <span>Search by quote or author</span>
        </div>
        <div class="feature">
          <i class="fas fa-share-alt"></i>
          <span>Copy & share favorite quotes</span>
        </div>
      </div>
      
      <button onclick="loadAllQuotes()" class="btn btn-primary btn-large">
        <i class="fas fa-rocket"></i> Get Started - Load Quotes
      </button>
    </div>
  `;
}

function updateStats() {
  if (totalQuotesEl) {
    totalQuotesEl.textContent = allQuotes.length;
  }
  if (filteredQuotesEl) {
    filteredQuotesEl.textContent = filteredQuotes.length;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showMessage(text, type = "info") {
  if (!messageDiv) return;

  // Clear existing classes
  messageDiv.className = "message";

  // Add type class
  messageDiv.classList.add(`message-${type}`);

  // Set icon based on type
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };

  const icon = icons[type] || "info-circle";

  // Set content
  messageDiv.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${text}</span>
    <button class="close-btn" onclick="this.parentElement.style.display='none'">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Show message with animation
  messageDiv.style.display = "flex";
  messageDiv.style.animation = "slideIn 0.3s ease";

  // Auto-hide success messages after 4 seconds
  if (type === "success") {
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 4000);
  }
}

function showLoading(text = "Loading...") {
  if (!loadingMessageDiv) return;

  loadingMessageDiv.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>${text}</span>
    </div>
  `;
  loadingMessageDiv.style.display = "block";
}

function hideLoading() {
  if (!loadingMessageDiv) return;
  loadingMessageDiv.style.display = "none";
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================
// SHARING & CLIPBOARD FUNCTIONS
// ============================================

function copyToClipboard(text) {
  // Clean up the text (remove HTML entities if any)
  const cleanText = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(cleanText)
      .then(() => {
        showMessage("📋 Quote copied to clipboard!", "success");
      })
      .catch((err) => {
        console.error("Clipboard API failed:", err);
        useFallbackCopy(cleanText);
      });
  } else {
    // Use fallback for older browsers or non-HTTPS contexts
    useFallbackCopy(cleanText);
  }
}

function useFallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      showMessage("📋 Quote copied to clipboard!", "success");
    } else {
      showMessage("❌ Could not copy quote. Please try again.", "error");
    }
  } catch (err) {
    console.error("Fallback copy failed:", err);
    showMessage(
      "❌ Could not copy quote. Please select and copy manually.",
      "error"
    );
  }

  document.body.removeChild(textArea);
}

function shareQuote(quote, author) {
  const cleanQuote = quote
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  const cleanAuthor = author
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  const shareText = `"${cleanQuote}" - ${cleanAuthor}`;
  const shareUrl = window.location.href;

  // Try Web Share API if available (mobile devices)
  if (navigator.share) {
    navigator
      .share({
        title: "Inspirational Quote",
        text: shareText,
        url: shareUrl,
      })
      .then(() => showMessage("✅ Quote shared successfully!", "success"))
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.log("Sharing failed:", error);
          copyToClipboard(shareText);
        }
      });
  } else {
    // Fallback to clipboard
    copyToClipboard(shareText);
  }
}

// ============================================
// ADDITIONAL STYLES (dynamically injected)
// ============================================

const additionalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease forwards;
    opacity: 0;
  }
  
  .button-group-center {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  
  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

// Inject additional styles
document.addEventListener("DOMContentLoaded", function () {
  if (!document.querySelector("style[data-quotes-dynamic]")) {
    const styleSheet = document.createElement("style");
    styleSheet.setAttribute("data-quotes-dynamic", "true");
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
  }
});

// ============================================
// GLOBAL FUNCTION EXPORTS
// ============================================

// Make functions available globally for HTML onclick attributes
window.loadAllQuotes = loadAllQuotes;
window.loadRandomQuote = loadRandomQuote;
window.loadFallbackQuotes = loadFallbackQuotes;
window.copyToClipboard = copyToClipboard;
window.shareQuote = shareQuote;

console.log("✅ Quotes App Frontend JavaScript loaded successfully");
