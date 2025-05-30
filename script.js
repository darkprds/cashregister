// Register state
const state = {
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  items: [],
  appliedDiscount: false,
};

// DOM Elements
const mainTotalDisplay = document.getElementById("main-total-display");
const itemCountDisplay = document.getElementById("item-count-display");

// Cart elements (right panel)
const cartItemsList = document.getElementById("cart-items-list");
const emptyCartMessage = document.getElementById("empty-cart-message");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartDiscount = document.getElementById("cart-discount");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");

// Separate Receipt elements (left of POS terminal)
const separateReceiptItemsList = document.getElementById(
  "separate-receipt-items-list"
);
const emptySeparateReceipt = document.getElementById("empty-separate-receipt");
const separateReceiptSubtotal = document.getElementById(
  "separate-receipt-subtotal"
);
const separateReceiptDiscount = document.getElementById(
  "separate-receipt-discount"
);
const separateReceiptTax = document.getElementById("separate-receipt-tax");
const separateReceiptTotal = document.getElementById("separate-receipt-total");
const receiptPayment = document.getElementById(
  "separate-receipt-payment-status"
);
const separateReceiptDate = document.getElementById("separate-receipt-date");
const separateReceiptTime = document.getElementById("separate-receipt-time");
const separateReceiptNo = document.getElementById("separate-receipt-no");

// Customer Display Elements
const customerDisplayItem = document.getElementById("customer-display-item");
const customerDisplayTotal = document.getElementById("customer-display-total");

const payBtn = document.getElementById("pay-btn");
const discountBtn = document.getElementById("discount-btn");
const clearBtn = document.getElementById("clear-btn");
const paymentModal = document.getElementById("payment-modal");
const modalAmount = document.getElementById("modal-amount");
const cashPayment = document.getElementById("cash-payment");
const cardPayment = document.getElementById("card-payment");
const messageBox = document.getElementById("message-box");

// Tax rate constant (10%)
const TAX_RATE = 0.1;

// Grocery items (prices remain the same, display changes to €)
const groceryItems = [
  { name: "Apple", price: 0.99, code: "1001" },
  { name: "Banana", price: 0.49, code: "1002" },
  { name: "Milk", price: 3.49, code: "2001" },
  { name: "Bread", price: 2.99, code: "2002" },
  { name: "Eggs", price: 4.29, code: "3001" },
  { name: "Butter", price: 4.49, code: "3002" },
  { name: "Chicken", price: 8.99, code: "4001" },
  { name: "Beef", price: 12.99, code: "4002" },
  { name: "Coffee", price: 2.5, code: "5001" },
  { name: "Soda", price: 1.8, code: "5002" },
];

// Function to show a custom message
function showMessage(message, duration = 3000) {
  messageBox.textContent = message;
  messageBox.classList.remove("hidden");
  messageBox.classList.add("show");
  setTimeout(() => {
    messageBox.classList.remove("show");
    messageBox.classList.add("hidden");
  }, duration);
}

// Add item to cart display (right panel)
function addItemToCartDisplay(name, price) {
  const itemDiv = document.createElement("div");
  itemDiv.className =
    "flex justify-between items-center py-2 border-b border-gray-100 highlight-item";
  itemDiv.innerHTML = `
        <div class="text-sm">${name}</div>
        <div class="text-sm font-semibold">€${price.toFixed(2)}</div>
    `;

  if (!emptyCartMessage.classList.contains("hidden")) {
    emptyCartMessage.classList.add("hidden");
  }

  cartItemsList.appendChild(itemDiv);
  cartItemsList.scrollTop = cartItemsList.scrollHeight; // Scroll to bottom

  setTimeout(() => {
    itemDiv.classList.remove("highlight-item");
  }, 1000);
}

// Add item to separate receipt display
function addItemToSeparateReceiptDisplay(name, price) {
  const itemDiv = document.createElement("div");
  itemDiv.className = "separate-receipt-item highlight-item";
  itemDiv.innerHTML = `
        <span>${name}</span>
        <span>€${price.toFixed(2)}</span>
    `;

  if (!emptySeparateReceipt.classList.contains("hidden")) {
    emptySeparateReceipt.classList.add("hidden");
  }

  separateReceiptItemsList.appendChild(itemDiv);
  separateReceiptItemsList.parentElement.scrollTop =
    separateReceiptItemsList.parentElement.scrollHeight; // Scroll receipt to bottom

  setTimeout(() => {
    itemDiv.classList.remove("highlight-item");
  }, 1000);
}

// Update all total displays
function updateAllTotalsDisplay() {
  mainTotalDisplay.textContent = `€${state.total.toFixed(2)}`;
  itemCountDisplay.textContent = `ITEMS: ${state.items.length}`;
  modalAmount.textContent = `€${state.total.toFixed(2)}`;

  // Update cart totals
  cartSubtotal.textContent = `€${state.subtotal.toFixed(2)}`;
  cartDiscount.textContent = `€${state.discount.toFixed(2)}`;
  cartTax.textContent = `€${state.tax.toFixed(2)}`;
  cartTotal.textContent = `€${state.total.toFixed(2)}`;

  // Update separate receipt totals
  separateReceiptSubtotal.textContent = `€${state.subtotal.toFixed(2)}`;
  separateReceiptDiscount.textContent = `€${state.discount.toFixed(2)}`;
  separateReceiptTax.textContent = `€${state.tax.toFixed(2)}`;
  separateReceiptTotal.textContent = `€${state.total.toFixed(2)}`;

  // Update customer display
  customerDisplayTotal.textContent = `€${state.total.toFixed(2)}`;
}

// Calculate all totals (subtotal, discount, tax, total)
function calculateTotals() {
  state.subtotal = state.items.reduce((sum, item) => sum + item.price, 0);

  // Apply discount if applicable
  state.discount = state.appliedDiscount ? state.subtotal * 0.1 : 0;
  const subtotalAfterDiscount = state.subtotal - state.discount;

  // Apply tax (now 10%)
  state.tax = subtotalAfterDiscount * TAX_RATE;

  // Calculate final total
  state.total = subtotalAfterDiscount + state.tax;

  updateAllTotalsDisplay();
}

// Add item to state and update UI
function addItem(item) {
  // Check if a payment has already been processed on the receipt
  const currentPaymentStatus = receiptPayment.textContent.trim();
  if (
    currentPaymentStatus.includes("PAYMENT: CASH") ||
    currentPaymentStatus.includes("PAYMENT: CREDIT CARD")
  ) {
    // If payment was processed, clear the receipt before adding a new item
    clearBtn.click();
  }

  state.items.push(item);
  addItemToCartDisplay(item.name, item.price);
  addItemToSeparateReceiptDisplay(item.name, item.price); // Add to separate receipt

  // Update customer display with the last added item
  customerDisplayItem.textContent = `${item.name} - €${item.price.toFixed(2)}`;

  calculateTotals();
}

// Event listeners for product buttons
document.querySelectorAll(".item-pos-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const itemName = button.dataset.item;
    const itemPrice = parseFloat(button.dataset.price);
    const item = groceryItems.find((i) => i.name === itemName);
    if (item) {
      addItem(item);
    }
  });
});

// Removed Event listeners for numeric keypad
/*
document.querySelectorAll('.num-pos-btn').forEach(button => {
    button.addEventListener('click', () => {
        const digit = button.textContent;
        showMessage(`Keypad pressed: ${digit}`, 1000);
    });
});
*/

// Pay button click handler
payBtn.addEventListener("click", () => {
  if (state.items.length === 0) {
    showMessage("Please add items before proceeding to payment.");
    return;
  }
  paymentModal.classList.add("active");
  paymentModal
    .querySelector(".payment-content")
    .classList.remove("translate-y-5");
});

// Discount button click handler
discountBtn.addEventListener("click", () => {
  state.appliedDiscount = !state.appliedDiscount;
  discountBtn.textContent = state.appliedDiscount
    ? "REMOVE DISCOUNT"
    : "DISCOUNT 10%";
  discountBtn.classList.toggle("orange", state.appliedDiscount);
  discountBtn.classList.toggle("blue", !state.appliedDiscount);
  calculateTotals();
  showMessage(
    state.appliedDiscount ? "Discount applied!" : "Discount removed!"
  );
});

// Clear button click handler
clearBtn.addEventListener("click", () => {
  state.subtotal = 0;
  state.tax = 0;
  state.discount = 0;
  state.total = 0;
  state.items = [];
  state.appliedDiscount = false;

  cartItemsList.innerHTML = ""; // Clear items from cart
  emptyCartMessage.classList.remove("hidden"); // Show empty cart message

  separateReceiptItemsList.innerHTML = ""; // Clear items from separate receipt
  emptySeparateReceipt.classList.remove("hidden"); // Show empty separate receipt message
  receiptPayment.textContent = "PAYMENT: NOT PROCESSED"; // Reset payment status

  // Reset customer display
  customerDisplayItem.textContent = "";
  customerDisplayTotal.textContent = "€0.00";

  discountBtn.textContent = "DISCOUNT 10%";
  discountBtn.classList.remove("orange");
  discountBtn.classList.add("blue");
  updateAllTotalsDisplay(); // Reset all displays
  updateDateTime(); // Update date/time on clear
  generateReceiptNumber(); // Generate new receipt number
  showMessage("Transaction cleared!");
});

// Payment methods
cashPayment.addEventListener("click", () => {
  receiptPayment.innerHTML = `
        PAYMENT: CASH<br>
        AMOUNT TENDERED: €${state.total.toFixed(2)}<br>
        CHANGE: €0.00
    `;
  showMessage("Payment processed: CASH");
  paymentModal.classList.remove("active");
  paymentModal.querySelector(".payment-content").classList.add("translate-y-5");
});

cardPayment.addEventListener("click", () => {
  receiptPayment.innerHTML = `
        PAYMENT: CREDIT CARD<br>
        APPROVED: CHASE VISA **** 3568<br>
        AUTH CODE: 5T8K9H
    `;
  showMessage("Payment processed: CARD");
  paymentModal.classList.remove("active");
  paymentModal.querySelector(".payment-content").classList.add("translate-y-5");
});

// Close payment modal when clicking outside
paymentModal.addEventListener("click", (e) => {
  if (e.target === paymentModal) {
    paymentModal.classList.remove("active");
    paymentModal
      .querySelector(".payment-content")
      .classList.add("translate-y-5");
  }
});

// Function to update date and time on receipt
function updateDateTime() {
  const now = new Date();
  const dateOptions = { month: "2-digit", day: "2-digit", year: "numeric" };
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
  separateReceiptDate.textContent = now.toLocaleDateString(
    "en-US",
    dateOptions
  );
  separateReceiptTime.textContent = now.toLocaleTimeString(
    "en-US",
    timeOptions
  );
}

// Function to generate a simple receipt number
function generateReceiptNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  separateReceiptNo.textContent = `#${year}${month}${day}-${random}`;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  updateAllTotalsDisplay(); // Initialize display to 0.00
  updateDateTime();
  generateReceiptNumber();

  // Add some demo items when page loads
  setTimeout(() => {
    addItem(groceryItems[0]); // Apple
    addItem(groceryItems[2]); // Milk
    addItem(groceryItems[3]); // Bread
    addItem(groceryItems[1]); // Banana
    state.appliedDiscount = true;
    discountBtn.textContent = "REMOVE DISCOUNT";
    discountBtn.classList.remove("blue");
    discountBtn.classList.add("orange");
    calculateTotals();
  }, 1000);
});
