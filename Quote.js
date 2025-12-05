// ============================================
// QUOTES APP - MODIFIED FRONTEND
// Now with category filtering and 25 quotes
// ============================================

// API Configuration
const API_BASE = "http://localhost:3000";

// DOM Elements - NEW: Added categorySelect and randomFiveBtn
const loadQuotesBtn = document.getElementById("loadQuotes");
const refreshQuotesBtn = document.getElementById("refreshQuotes");
const clearQuotesBtn = document.getElementById("clearQuotes");
const searchInput = document.getElementById("searchInput");
const quotesContainer = document.getElementById("quotesContainer");
const messageDiv = document.getElementById("message");
const loadingMessageDiv = document.getElementById("loadingMessage");
const randomQuoteBtn = document.getElementById("randomQuoteBtn");
const categorySelect = document.getElementById("categorySelect"); // ✅ NEW
const randomFiveBtn = document.getElementById("randomFiveBtn"); // ✅ NEW

// State Management
let allQuotes = [];
let filteredQuotes = [];
let categories = []; // ✅ NEW: Store categories

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

async function initializeApp() {
  // ✅ NEW: Load categories first
  await loadCategories();

  // Add event listeners to buttons
  if (loadQuotesBtn) loadQuotesBtn.addEventListener("click", loadAllQuotes);
  if (refreshQuotesBtn)
    refreshQuotesBtn.addEventListener("click", refreshQuotes);
  if (clearQuotesBtn) clearQuotesBtn.addEventListener("click", clearQuotes);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (randomQuoteBtn) randomQuoteBtn.addEventListener("click", loadRandomQuote);

  // ✅ NEW: Category selector event
  if (categorySelect)
    categorySelect.addEventListener("change", handleCategoryChange);

  // ✅ NEW: Random 5 button event
  if (randomFiveBtn)
    randomFiveBtn.addEventListener("click", () => loadRandomQuotes(5));

  // Show welcome message
  showWelcomeMessage();
}

// ✅ NEW FUNCTION: Load categories from API
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    if (response.ok) {
      categories = await response.json();
      populateCategoryDropdown();
      console.log(`Loaded ${categories.length} categories`);
    }
  } catch (error) {
    console.error("Error loading categories:", error);
    // Fallback categories
    categories = [
      { name: "wisdom", count: 5 },
      { name: "inspiration", count: 5 },
      { name: "success", count: 5 },
      { name: "life", count: 5 },
      { name: "humor", count: 5 },
    ];
    populateCategoryDropdown();
  }
}

// ✅ NEW FUNCTION: Populate category dropdown
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

// ✅ NEW FUNCTION: Capitalize first letter
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ✅ MODIFIED: Now supports category filtering
async function loadAllQuotes() {
  showLoading("Loading inspirational quotes...");

  try {
    // ✅ NEW: Get selected category
    const selectedCategory = categorySelect ? categorySelect.value : "";

    // ✅ MODIFIED: Build URL with optional category filter
    let url = `${API_BASE}/quotes`;
    if (selectedCategory) {
      url += `?category=${selectedCategory}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allQuotes = await response.json();
    filteredQuotes = [...allQuotes];

    displayQuotes(allQuotes);

    // ✅ MODIFIED: Show category in success message
    const categoryText = selectedCategory ? `${selectedCategory} ` : "";
    showMessage(
      `Successfully loaded ${allQuotes.length} ${categoryText}quotes`,
      "success"
    );
  } catch (error) {
    console.error("Error loading quotes:", error);
    showMessage(
      "Failed to load quotes. Please make sure the server is running on port 3000.",
      "error"
    );
    displayErrorState();
  } finally {
    hideLoading();
  }
}

// ✅ NEW FUNCTION: Load random quotes (count parameter)
async function loadRandomQuotes(count = 5) {
  showLoading(`Loading ${count} random quotes...`);

  try {
    const response = await fetch(`${API_BASE}/quotes/random?count=${count}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const randomQuotes = await response.json();

    // Update state with random quotes
    allQuotes = randomQuotes;
    filteredQuotes = [...randomQuotes];

    displayQuotes(randomQuotes);
    showMessage(`Loaded ${randomQuotes.length} random quotes`, "success");
  } catch (error) {
    console.error("Error loading random quotes:", error);
    showMessage("Error loading random quotes", "error");
  } finally {
    hideLoading();
  }
}

// ✅ MODIFIED: Load single random quote
async function loadRandomQuote() {
  showLoading("Fetching a random quote...");

  try {
    const response = await fetch(`${API_BASE}/quote`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const randomQuote = await response.json();

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
  } catch (error) {
    console.error("Error loading random quote:", error);
    showMessage("Error loading random quote", "error");
  } finally {
    hideLoading();
  }
}

// ✅ NEW FUNCTION: Handle category change
function handleCategoryChange() {
  const selectedCategory = categorySelect.value;

  if (selectedCategory === "") {
    // If "All Categories" is selected, show current quotes
    if (allQuotes.length > 0) {
      displayQuotes(allQuotes);
    }
  } else {
    // Filter existing quotes by category
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
        `No ${selectedCategory} quotes in current selection. Try loading quotes first.`,
        "warning"
      );
    }
  }
}

// MODIFIED refreshQuotes to use new random function
async function refreshQuotes() {
  if (allQuotes.length === 0) {
    showMessage("No quotes to refresh. Please load quotes first.", "warning");
    return;
  }

  showLoading("Refreshing quotes...");

  try {
    // ✅ MODIFIED: Use new random quotes function
    await loadRandomQuotes(5);
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
  if (categorySelect) categorySelect.value = ""; // ✅ NEW: Reset category
  showWelcomeMessage();
  showMessage("🗑️ All quotes cleared", "info");
}

// ✅ MODIFIED: Now searches category too
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredQuotes = [...allQuotes];
  } else {
    filteredQuotes = allQuotes.filter(
      (quote) =>
        quote.quote.toLowerCase().includes(searchTerm) ||
        quote.author.toLowerCase().includes(searchTerm) ||
        (quote.category && quote.category.toLowerCase().includes(searchTerm)) // ✅ NEW
    );
  }

  if (filteredQuotes.length === 0 && allQuotes.length > 0) {
    displayNoResults(searchTerm);
  } else {
    displayQuotes(filteredQuotes);
  }
}

// ✅ MODIFIED: Now shows category badge
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

function displayErrorState() {
  if (!quotesContainer) return;

  quotesContainer.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Connection Error</h3>
      <p>Unable to connect to the quotes server</p>
      <button onclick="loadAllQuotes()" class="btn btn-primary">
        <i class="fas fa-redo"></i> Try Again
      </button>
    </div>
  `;
}

// ✅ MODIFIED: Updated welcome message
function showWelcomeMessage() {
  if (!quotesContainer) return;

  const totalCategories = categories.length || 5;
  const totalQuotes = categories.reduce((sum, cat) => sum + cat.count, 0) || 25;

  quotesContainer.innerHTML = `
    <div class="welcome-state">
      <i class="fas fa-lightbulb"></i>
      <h3>Welcome to Quote Explorer</h3>
      <p>Now with ${totalQuotes} quotes across ${totalCategories} categories!</p>
      <p>Select a category from the dropdown or click "Load Quotes" to begin</p>
    </div>
  `;
}

// Utility Functions (unchanged but included for completeness)
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

// ✅ NEW: Inject category styles
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
