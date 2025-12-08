// ============================================
// QUOTES APP - STATIC VERSION
// Works on GitHub Pages, Vercel, Netlify, etc.
// No server.js needed!
// ============================================

// Embedded quotes database (25 quotes in 5 categories)
const EMBEDDED_QUOTES = [
  // ===== WISDOM (5 quotes) =====
  {
    id: 1,
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "wisdom",
  },
  {
    id: 2,
    quote:
      "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein",
    category: "wisdom",
  },
  {
    id: 3,
    quote: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    category: "wisdom",
  },
  {
    id: 4,
    quote: "Knowing yourself is the beginning of all wisdom.",
    author: "Aristotle",
    category: "wisdom",
  },
  {
    id: 5,
    quote:
      "The fool doth think he is wise, but the wise man knows himself to be a fool.",
    author: "William Shakespeare",
    category: "wisdom",
  },

  // ===== INSPIRATION (5 quotes) =====
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

  // ===== SUCCESS (5 quotes) =====
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

  // ===== LIFE (5 quotes) =====
  {
    id: 16,
    quote: "Life is what happens to you while you're busy making other plans.",
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

  // ===== HUMOR (5 quotes) =====
  {
    id: 21,
    quote: "I'm not arguing, I'm just explaining why I'm right.",
    author: "Anonymous",
    category: "humor",
  },
  {
    id: 22,
    quote: "I'm not lazy, I'm on energy saving mode.",
    author: "Anonymous",
    category: "humor",
  },
  {
    id: 23,
    quote:
      "I told my computer I needed a break, and now it won't stop sending me KitKat ads.",
    author: "Anonymous",
    category: "humor",
  },
  {
    id: 24,
    quote:
      "I don't need a hairstylist, my pillow gives me a new hairstyle every morning.",
    author: "Anonymous",
    category: "humor",
  },
  {
    id: 25,
    quote:
      "My bed is a magical place where I suddenly remember everything I was supposed to do.",
    author: "Anonymous",
    category: "humor",
  },
];

// DOM Elements
const loadQuotesBtn = document.getElementById("loadQuotes");
const refreshQuotesBtn = document.getElementById("refreshQuotes");
const clearQuotesBtn = document.getElementById("clearQuotes");
const searchInput = document.getElementById("searchInput");
const quotesContainer = document.getElementById("quotesContainer");
const messageDiv = document.getElementById("message");
const loadingMessageDiv = document.getElementById("loadingMessage");
const randomQuoteBtn = document.getElementById("randomQuoteBtn");
const categorySelect = document.getElementById("categorySelect");
const randomFiveBtn = document.getElementById("randomFiveBtn");

// State Management
let allQuotes = [];
let filteredQuotes = [];
let categories = [];

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  // Initialize categories
  initializeCategories();

  // Add event listeners
  if (loadQuotesBtn) loadQuotesBtn.addEventListener("click", loadAllQuotes);
  if (refreshQuotesBtn)
    refreshQuotesBtn.addEventListener("click", refreshQuotes);
  if (clearQuotesBtn) clearQuotesBtn.addEventListener("click", clearQuotes);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (randomQuoteBtn) randomQuoteBtn.addEventListener("click", loadRandomQuote);
  if (categorySelect)
    categorySelect.addEventListener("change", handleCategoryChange);
  if (randomFiveBtn)
    randomFiveBtn.addEventListener("click", () => loadRandomQuotes(5));

  // Show welcome message
  showWelcomeMessage();
}

// Initialize categories from embedded quotes
function initializeCategories() {
  // Extract unique categories
  const categorySet = new Set();
  EMBEDDED_QUOTES.forEach((quote) => {
    if (quote.category) categorySet.add(quote.category);
  });

  // Count quotes per category
  categories = Array.from(categorySet).map((cat) => {
    const count = EMBEDDED_QUOTES.filter((q) => q.category === cat).length;
    return { name: cat, count: count };
  });

  // Populate dropdown
  populateCategoryDropdown();
}

// Populate category dropdown
function populateCategoryDropdown() {
  if (!categorySelect) return;

  categorySelect.innerHTML = '<option value="">All Categories</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = `${capitalizeFirst(category.name)} (${
      category.count
    })`;
    categorySelect.appendChild(option);
  });
}

// Capitalize first letter
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// NEW FUNCTION: Get one random quote from each category
function getOneQuoteFromEachCategory() {
  const selectedQuotes = [];
  const categoryMap = {};

  // Group quotes by category
  EMBEDDED_QUOTES.forEach((quote) => {
    if (!categoryMap[quote.category]) {
      categoryMap[quote.category] = [];
    }
    categoryMap[quote.category].push(quote);
  });

  // Get one random quote from each category
  Object.keys(categoryMap).forEach((category) => {
    const quotesInCategory = categoryMap[category];
    if (quotesInCategory.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotesInCategory.length);
      selectedQuotes.push(quotesInCategory[randomIndex]);
    }
  });

  return selectedQuotes;
}

// Main Functions
function loadAllQuotes() {
  showLoading("Loading inspirational quotes...");

  // Simulate loading delay for better UX
  setTimeout(() => {
    const selectedCategory = categorySelect ? categorySelect.value : "";

    // MODIFIED LOGIC: If "All Categories" is selected, get 1 quote from each category
    if (selectedCategory === "") {
      // Get one random quote from each category
      allQuotes = getOneQuoteFromEachCategory();
    } else {
      // Get all quotes from the selected category
      allQuotes = EMBEDDED_QUOTES.filter(
        (quote) => quote.category === selectedCategory
      );
    }

    filteredQuotes = [...allQuotes];

    displayQuotes(allQuotes);

    // Update message based on selection
    if (selectedCategory === "") {
      showMessage(
        `Loaded 1 quote from each of ${categories.length} categories`,
        "success"
      );
    } else {
      showMessage(
        `Successfully loaded ${allQuotes.length} ${selectedCategory} quotes`,
        "success"
      );
    }

    hideLoading();
  }, 500);
}

function loadRandomQuotes(count = 5) {
  showLoading(`Loading ${count} random quotes...`);

  setTimeout(() => {
    // Get random quotes (can be from any category)
    const shuffled = [...EMBEDDED_QUOTES].sort(() => 0.5 - Math.random());
    const randomQuotes = shuffled.slice(
      0,
      Math.min(count, EMBEDDED_QUOTES.length)
    );

    allQuotes = randomQuotes;
    filteredQuotes = [...randomQuotes];

    displayQuotes(randomQuotes);
    showMessage(`Loaded ${randomQuotes.length} random quotes`, "success");

    hideLoading();
  }, 500);
}

function loadRandomQuote() {
  showLoading("Fetching a random quote...");

  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * EMBEDDED_QUOTES.length);
    const randomQuote = EMBEDDED_QUOTES[randomIndex];

    // Display just the random quote
    quotesContainer.innerHTML = `
      <div class="quote-card featured" data-category="${
        randomQuote.category || ""
      }">
        <div class="quote-text">"${escapeHtml(randomQuote.quote)}"</div>
        <div class="quote-author">— ${escapeHtml(randomQuote.author)}</div>
        ${
          randomQuote.category
            ? `<div class="quote-category">${capitalizeFirst(
                randomQuote.category
              )}</div>`
            : ""
        }
      </div>
    `;

    // Update state
    allQuotes = [randomQuote];
    filteredQuotes = [randomQuote];

    showMessage("🎲 Random quote loaded successfully!", "success");

    hideLoading();
  }, 500);
}

function handleCategoryChange() {
  const selectedCategory = categorySelect.value;

  if (selectedCategory === "") {
    // Show all quotes (but don't reload)
    if (allQuotes.length === 0) {
      allQuotes = getOneQuoteFromEachCategory();
      filteredQuotes = [...allQuotes];
      displayQuotes(allQuotes);
    } else {
      filteredQuotes = [...allQuotes];
      displayQuotes(allQuotes);
    }
  } else {
    // Filter by category
    const filtered = allQuotes.filter(
      (quote) => quote.category === selectedCategory
    );

    if (filtered.length > 0) {
      filteredQuotes = filtered;
      displayQuotes(filtered);
      showMessage(
        `Showing ${filtered.length} ${selectedCategory} quotes`,
        "info"
      );
    } else if (allQuotes.length > 0) {
      showMessage(
        `No ${selectedCategory} quotes in current selection`,
        "warning"
      );
    }
  }
}

function refreshQuotes() {
  if (allQuotes.length === 0) {
    showMessage("No quotes to refresh. Please load quotes first.", "warning");
    return;
  }

  showLoading("Refreshing quotes...");

  setTimeout(() => {
    const selectedCategory = categorySelect ? categorySelect.value : "";

    // If "All Categories" is selected, refresh by getting new quotes from each category
    if (selectedCategory === "") {
      allQuotes = getOneQuoteFromEachCategory();
      filteredQuotes = [...allQuotes];
      displayQuotes(allQuotes);
      showMessage("🔄 Refreshed quotes from all categories", "success");
    } else {
      // Just shuffle current quotes for specific category
      const shuffledQuotes = [...allQuotes].sort(() => Math.random() - 0.5);
      displayQuotes(shuffledQuotes);
      showMessage("🔄 Quotes refreshed successfully!", "success");
    }

    hideLoading();
  }, 500);
}

function clearQuotes() {
  allQuotes = [];
  filteredQuotes = [];
  if (searchInput) searchInput.value = "";
  if (categorySelect) categorySelect.value = "";
  showWelcomeMessage();
  showMessage("🗑️ All quotes cleared", "info");
}

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredQuotes = [...allQuotes];
  } else {
    filteredQuotes = allQuotes.filter(
      (quote) =>
        quote.quote.toLowerCase().includes(searchTerm) ||
        quote.author.toLowerCase().includes(searchTerm) ||
        (quote.category && quote.category.toLowerCase().includes(searchTerm))
    );
  }

  if (filteredQuotes.length === 0 && allQuotes.length > 0) {
    displayNoResults(searchTerm);
  } else {
    displayQuotes(filteredQuotes);
  }
}

// Display Functions
function displayQuotes(quotes) {
  if (!quotesContainer) return;

  if (!quotes || quotes.length === 0) {
    displayNoResults();
    return;
  }

  const quotesHTML = quotes
    .map(
      (quote) => `
        <div class="quote-card" data-id="${quote.id}" data-category="${
        quote.category || ""
      }">
            <div class="quote-text">"${escapeHtml(quote.quote)}"</div>
            <div class="quote-author">— ${escapeHtml(quote.author)}</div>
            ${
              quote.category
                ? `<div class="quote-category">${capitalizeFirst(
                    quote.category
                  )}</div>`
                : ""
            }
        </div>
    `
    )
    .join("");

  quotesContainer.innerHTML = quotesHTML;
}

function displayNoResults(searchTerm = "") {
  if (!quotesContainer) return;

  quotesContainer.innerHTML = `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <h3>No quotes found${searchTerm ? ` for "${searchTerm}"` : ""}</h3>
      <p>Try adjusting your search terms or load quotes first</p>
      ${
        allQuotes.length === 0
          ? '<button onclick="loadAllQuotes()" class="btn btn-primary mt-3">' +
            '<i class="fas fa-download"></i> Load Quotes</button>'
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
      <h3>Welcome to Quote Explorer</h3>
      <p>Discover ${EMBEDDED_QUOTES.length} inspirational quotes across ${categories.length} categories!</p>
      <p>Select a category or click "Load Quotes" to begin</p>
    </div>
  `;
}

// Utility Functions
function showMessage(text, type = "info") {
  if (!messageDiv) return;

  messageDiv.className = "message";
  messageDiv.classList.add(`message-${type}`);

  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };

  const icon = icons[type] || "info-circle";

  messageDiv.innerHTML = `
    <i class="fas fa-${icon}"></i>
    ${text}
  `;

  messageDiv.style.display = "block";

  if (type === "success") {
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 3000);
  }
}

function showLoading(text = "Loading...") {
  if (!loadingMessageDiv) return;

  loadingMessageDiv.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      ${text}
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

// Category styles (inject if not already present)
const categoryStyles = `
.quote-category {
    display: inline-block;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 10px;
    border: 1px solid rgba(99, 102, 241, 0.2);
}

.quote-card[data-category="wisdom"] .quote-category {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.2);
}

.quote-card[data-category="inspiration"] .quote-category {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border-color: rgba(245, 158, 11, 0.2);
}

.quote-card[data-category="success"] .quote-category {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
}

.quote-card[data-category="life"] .quote-category {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
    border-color: rgba(139, 92, 246, 0.2);
}

.quote-card[data-category="humor"] .quote-category {
    background: rgba(14, 165, 233, 0.1);
    color: #0ea5e9;
    border-color: rgba(14, 165, 233, 0.2);
}
`;

// Inject styles
document.addEventListener("DOMContentLoaded", function () {
  if (!document.querySelector("style[data-category-styles]")) {
    const styleSheet = document.createElement("style");
    styleSheet.setAttribute("data-category-styles", "true");
    styleSheet.textContent = categoryStyles;
    document.head.appendChild(styleSheet);
  }
});

// Make functions globally available
window.loadAllQuotes = loadAllQuotes;
window.loadRandomQuote = loadRandomQuote;

console.log("✅ Quotes App (Static Version) Loaded Successfully");
console.log(`📊 Total Quotes: ${EMBEDDED_QUOTES.length}`);
console.log(`📁 Categories: ${categories.map((c) => c.name).join(", ")}`);
