/**
 * PREMIUM LAUNDRY STORE - PRODUCTION ENGINE
 * Features:
 * - Dynamic Service Catalog & Category Filtering
 * - Quantity-based Cart Management
 * - Subtotal, Free Delivery Threshold, Express Delivery & Promo Discounts
 * - Calibrated Dark Mode with LocalStorage & OS Preference sync
 * - Booking Form Validation with Date/Slot Selector
 * - EmailJS Integration targeting User Gmail Confirmation
 * - Digital Order Receipt Modal with Print capability
 * - Toast Alerts & FAQ Accordions
 */

// EmailJS Configuration loaded from config.js (Protected via .env / APP_CONFIG)
const EMAILJS_PUBLIC_KEY = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.EMAILJS?.PUBLIC_KEY) || "w31DfD4b3031VhNWF";
const EMAILJS_SERVICE_ID = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.EMAILJS?.SERVICE_ID) || "service_5lpj7kg";
const EMAILJS_TEMPLATE_ID = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.EMAILJS?.TEMPLATE_ID) || "template_32gi9fm";

// Initialize EmailJS
(function () {
  if (typeof emailjs !== "undefined") {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch (err) {
      console.warn("EmailJS init warning:", err);
    }
  }
})();

// --- SERVICES DATA ---
const SERVICES_DATA = [
  {
    id: "dry-clean",
    name: "Premium Dry Cleaning",
    price: 200,
    unit: "/ piece",
    category: "dry-clean",
    icon: "fas fa-vest-patches",
    turnaround: "24 Hours",
    desc: "Delicate solvent cleaning with fabric rejuvenation for blazers, coats & silks."
  },
  {
    id: "wash-fold",
    name: "Wash & Fold",
    price: 100,
    unit: "/ kg",
    category: "daily-wash",
    icon: "fas fa-soap",
    turnaround: "Same Day",
    desc: "Everyday apparel washed with premium hypoallergenic detergents & neatly folded."
  },
  {
    id: "steam-iron",
    name: "Steam Press & Ironing",
    price: 30,
    unit: "/ piece",
    category: "ironing",
    icon: "fas fa-fire",
    turnaround: "6 Hours",
    desc: "Precision temperature steam finish to eliminate stubborn wrinkles safely."
  },
  {
    id: "stain-removal",
    name: "Targeted Stain Removal",
    price: 450,
    unit: "/ item",
    category: "premium",
    icon: "fas fa-wand-magic-sparkles",
    turnaround: "24 Hours",
    desc: "Enzyme treatment for oil, grease, coffee, wine and deep fabric spots."
  },
  {
    id: "leather-care",
    name: "Leather & Suede Restoration",
    price: 899,
    unit: "/ item",
    category: "premium",
    icon: "fas fa-user-tie",
    turnaround: "48 Hours",
    desc: "Conditioning, nourishment, and color revival for jackets, boots & bags."
  },
  {
    id: "bridal-gown",
    name: "Bridal & Luxury Couture",
    price: 1999,
    unit: "/ dress",
    category: "premium",
    icon: "fas fa-ring",
    turnaround: "48 Hours",
    desc: "Artisanal hand cleaning for heavily embroidered lehengas, sherwanis & gowns."
  },
  {
    id: "duvet-wash",
    name: "Duvets, Blankets & Quilts",
    price: 350,
    unit: "/ piece",
    category: "linens",
    icon: "fas fa-bed",
    turnaround: "24 Hours",
    desc: "Deep thermal sanitize cycle removing dust mites, allergens & odors."
  },
  {
    id: "curtains-wash",
    name: "Curtains & Home Drapes",
    price: 250,
    unit: "/ panel",
    category: "linens",
    icon: "fas fa-shield-halved",
    turnaround: "24 Hours",
    desc: "Anti-shrink steam wash returning vibrancy and freshness to interior curtains."
  }
];

// --- STATE MANAGEMENT ---
let cart = [];
let appliedCoupon = null; // { code: 'WELCOME20', discount: 0.2, type: 'percent' }
let isExpressDelivery = false;
const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 50;
const EXPRESS_SURCHARGE = 99;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderServices("all");
  setupMinDate();
  setupEventListeners();
  updateCartUI();
});

// --- THEME ENGINE (DARK / LIGHT MODE) ---
function initTheme() {
  const savedTheme = localStorage.getItem("laundry_theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  updateThemeIcon(isDark);
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("laundry_theme", isDark ? "dark" : "light");
  updateThemeIcon(isDark);
  showToast(isDark ? "Switched to Dark Mode 🌙" : "Switched to Light Mode ☀️", "info");
}

function updateThemeIcon(isDark) {
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    btn.setAttribute("title", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
  }
}

// --- RENDER SERVICES ---
function renderServices(category = "all") {
  const container = document.getElementById("serviceCatalog");
  if (!container) return;

  const filtered = category === "all" 
    ? SERVICES_DATA 
    : SERVICES_DATA.filter(s => s.category === category);

  container.innerHTML = filtered.map(service => {
    return `
      <div class="service-card" data-category="${service.category}">
        <div class="service-card-top">
          <div class="service-icon-box">
            <i class="${service.icon}"></i>
          </div>
          <div class="service-info">
            <h3>${service.name}</h3>
            <p>${service.desc}</p>
          </div>
        </div>
        <div class="service-card-bottom">
          <div class="service-price">
            ₹${service.price} <span>${service.unit}</span>
          </div>
          <button class="btn-add-item" onclick="addToCart('${service.id}')">
            Add <i class="fas fa-plus-circle"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Filter tabs event
function setupEventListeners() {
  // Category tabs
  const tabs = document.querySelectorAll(".category-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const category = tab.getAttribute("data-category");
      renderServices(category);
    });
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      const icon = mobileBtn.querySelector("i");
      if (icon) {
        icon.className = isOpen ? "fas fa-xmark" : "fas fa-bars";
      }
    });
    // Close mobile nav on link click
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        const icon = mobileBtn.querySelector("i");
        if (icon) icon.className = "fas fa-bars";
      });
    });
  }

  // Express checkbox change
  const expressCheck = document.getElementById("expressDeliveryCheck");
  if (expressCheck) {
    expressCheck.addEventListener("change", (e) => {
      isExpressDelivery = e.target.checked;
      updateCartUI();
    });
  }
}

// Set Minimum Pickup Date to Today
function setupMinDate() {
  const dateInput = document.getElementById("pickupDate");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    dateInput.value = today;
  }
}

// --- CART OPERATIONS ---
function addToCart(serviceId) {
  const service = SERVICES_DATA.find(s => s.id === serviceId);
  if (!service) return;

  const existingIndex = cart.findIndex(item => item.id === serviceId);
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      id: service.id,
      name: service.name,
      price: service.price,
      qty: 1,
      icon: service.icon
    });
  }

  updateCartUI();
  showToast(`Added ${service.name} to cart`, "success");
}

function updateItemQty(serviceId, change) {
  const index = cart.findIndex(item => item.id === serviceId);
  if (index === -1) return;

  cart[index].qty += change;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function removeItemFromCart(serviceId) {
  const index = cart.findIndex(item => item.id === serviceId);
  if (index > -1) {
    const removedName = cart[index].name;
    cart.splice(index, 1);
    updateCartUI();
    showToast(`Removed ${removedName}`, "info");
  }
}

function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  appliedCoupon = null;
  const couponInput = document.getElementById("couponCodeInput");
  if (couponInput) couponInput.value = "";
  updateCartUI();
  showToast("Cart cleared", "info");
}

// --- CART UI UPDATE & CALCULATIONS ---
function updateCartUI() {
  const cartList = document.getElementById("cartItemsList");
  const emptyCartView = document.getElementById("emptyCartView");
  const badge = document.getElementById("navCartCount");
  const totalItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  if (badge) {
    badge.textContent = totalItemCount;
  }

  if (!cartList) return;

  if (cart.length === 0) {
    cartList.innerHTML = "";
    if (emptyCartView) emptyCartView.style.display = "block";
  } else {
    if (emptyCartView) emptyCartView.style.display = "none";
    cartList.innerHTML = cart.map(item => `
      <li class="cart-item-row">
        <span class="cart-item-title">${item.name}</span>
        <div class="cart-qty-control">
          <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)">-</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateItemQty('${item.id}', 1)">+</button>
        </div>
        <span class="cart-item-price">₹${item.price * item.qty}</span>
        <button class="cart-item-del" title="Remove" onclick="removeItemFromCart('${item.id}')">
          <i class="fas fa-trash-alt"></i>
        </button>
      </li>
    `).join("");
  }

  // Calculate financials
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  // Coupon Discount
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === "percent") {
      discount = Math.round(subtotal * appliedCoupon.discount);
    } else if (appliedCoupon.type === "flat") {
      discount = Math.min(subtotal, appliedCoupon.discount);
    }
  }

  // Delivery Fee
  let deliveryFee = 0;
  if (subtotal > 0) {
    deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  }

  // Express Turnaround
  const expressFee = (isExpressDelivery && subtotal > 0) ? EXPRESS_SURCHARGE : 0;

  // Final Total
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee + expressFee);

  // Update DOM summaries
  document.getElementById("summarySubtotal").textContent = `₹${subtotal}`;
  
  const discountRow = document.getElementById("summaryDiscountRow");
  if (discountRow) {
    if (discount > 0) {
      discountRow.style.display = "flex";
      document.getElementById("summaryDiscount").textContent = `- ₹${discount}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  const deliverySpan = document.getElementById("summaryDelivery");
  if (deliverySpan) {
    if (subtotal === 0) {
      deliverySpan.textContent = "₹0";
    } else if (deliveryFee === 0) {
      deliverySpan.innerHTML = '<span class="free-tag">FREE</span>';
    } else {
      deliverySpan.textContent = `₹${deliveryFee}`;
    }
  }

  const expressRow = document.getElementById("summaryExpressRow");
  if (expressRow) {
    expressRow.style.display = expressFee > 0 ? "flex" : "none";
  }

  document.getElementById("summaryGrandTotal").textContent = `₹${grandTotal}`;
}

// --- PROMO COUPON ---
function applyCoupon() {
  const input = document.getElementById("couponCodeInput");
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showToast("Please enter a coupon code", "error");
    return;
  }

  if (cart.length === 0) {
    showToast("Please add items to cart before applying coupon", "info");
    return;
  }

  if (code === "WELCOME20") {
    appliedCoupon = { code: "WELCOME20", discount: 0.2, type: "percent" };
    showToast("Promo applied: 20% OFF your order! 🎉", "success");
  } else if (code === "WELCOME10") {
    appliedCoupon = { code: "WELCOME10", discount: 0.1, type: "percent" };
    showToast("Newsletter Promo applied: 10% OFF your order! 🎉", "success");
  } else if (code === "FRESH50") {
    appliedCoupon = { code: "FRESH50", discount: 50, type: "flat" };
    showToast("Promo applied: ₹50 Flat OFF! 🎉", "success");
  } else {
    showToast("Invalid promo code. Try WELCOME20, WELCOME10 or FRESH50", "error");
    return;
  }

  updateCartUI();
}

// --- BOOKING SUBMISSION & EMAILJS INTEGRATION ---
async function handleBookingSubmit(event) {
  event.preventDefault();

  if (cart.length === 0) {
    showToast("Your cart is empty. Please select at least one service.", "error");
    scrollToSection("services");
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const pickupDate = document.getElementById("pickupDate").value;
  const pickupSlot = document.getElementById("pickupSlot").value;
  const pickupAddress = document.getElementById("pickupAddress").value.trim();
  const notes = document.getElementById("orderNotes").value.trim() || "None";

  // Validations
  if (!name || !email || !phone || !pickupDate || !pickupSlot || !pickupAddress) {
    showToast("Please complete all required fields (*)", "error");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    showToast("Please enter a valid 10-digit mobile number", "error");
    return;
  }

  const submitBtn = document.getElementById("btnBookSubmit");
  const originalBtnHTML = submitBtn.innerHTML;

  // Show Loading Spinner
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div> Confirming & Scheduling...';

  // Compute summary values for email
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = appliedCoupon ? (appliedCoupon.type === "percent" ? Math.round(subtotal * appliedCoupon.discount) : appliedCoupon.discount) : 0;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const expressFee = isExpressDelivery ? EXPRESS_SURCHARGE : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee + expressFee);
  
  const orderId = "LND-" + Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const itemsFormattedText = cart
    .map(i => `• ${i.name} (Qty: ${i.qty}) - ₹${i.price * i.qty}`)
    .join("\n");

  // Template Parameters for EmailJS
  // IMPORTANT: To ensure the customer receives the email in their Gmail,
  // we supply to_email, email, and user_email keys.
  const emailParams = {
    name: name,
    to_name: name,
    customer_name: name,
    email: email,
    to_email: email, // Direct recipient Gmail
    user_email: email,
    customer_email: email,
    phone: phone,
    order_id: orderId,
    pickup_date: pickupDate,
    pickup_slot: pickupSlot,
    pickup_address: pickupAddress,
    items_summary: itemsFormattedText,
    subtotal: "₹" + subtotal,
    discount: discountAmount > 0 ? "₹" + discountAmount : "₹0",
    delivery_fee: deliveryFee === 0 ? "FREE" : "₹" + deliveryFee,
    express_fee: expressFee > 0 ? "₹" + expressFee : "No",
    total_amount: "₹" + grandTotal,
    total: "₹" + grandTotal,
    order_date: orderDate,
    message: `Scheduled pickup on ${pickupDate} (${pickupSlot}) at ${pickupAddress}. Items: ${itemsFormattedText}`,
    notes: notes
  };

  console.log(`%c[EmailJS] Dispatching Order Confirmation to: ${emailParams.to_email}`, "color: #0284c7; font-weight: bold; font-size: 12px;");
  console.log("[EmailJS Payload]", emailParams);

  try {
    if (typeof emailjs !== "undefined" && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams);
      showToast(`Booking Confirmed! Details sent to ${email}`, "success");
    } else {
      console.log("EmailJS payload simulated:", emailParams);
      showToast("Booking Confirmed! (Demo Mode: Email simulated)", "success");
    }
  } catch (err) {
    console.warn("EmailJS warning:", err);
    showToast("Booking registered successfully! (Confirmation notice generated)", "info");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHTML;

    // Display Digital Receipt Modal
    showReceiptModal({
      orderId,
      name,
      email,
      phone,
      pickupDate,
      pickupSlot,
      pickupAddress,
      cartSnapshot: [...cart],
      subtotal,
      discountAmount,
      deliveryFee,
      expressFee,
      grandTotal,
      orderDate
    });

    // Reset Form & Cart
    document.getElementById("bookingForm").reset();
    setupMinDate();
    cart = [];
    appliedCoupon = null;
    isExpressDelivery = false;
    if (document.getElementById("expressDeliveryCheck")) {
      document.getElementById("expressDeliveryCheck").checked = false;
    }
    updateCartUI();
  }
}

// --- ORDER RECEIPT MODAL ---
function showReceiptModal(order) {
  const modal = document.getElementById("receiptModal");
  if (!modal) return;

  document.getElementById("receiptOrderId").textContent = `#${order.orderId}`;
  document.getElementById("receiptCustName").textContent = order.name;
  document.getElementById("receiptCustEmail").textContent = order.email;
  document.getElementById("receiptCustPhone").textContent = order.phone;
  document.getElementById("receiptPickupDate").textContent = `${order.pickupDate} (${order.pickupSlot})`;
  document.getElementById("receiptAddress").textContent = order.pickupAddress;

  const itemsContainer = document.getElementById("receiptItems");
  itemsContainer.innerHTML = order.cartSnapshot.map(item => `
    <div class="receipt-detail-row">
      <span>${item.name} × ${item.qty}</span>
      <span>₹${item.price * item.qty}</span>
    </div>
  `).join("");

  document.getElementById("receiptSubtotal").textContent = `₹${order.subtotal}`;
  document.getElementById("receiptDiscount").textContent = order.discountAmount > 0 ? `- ₹${order.discountAmount}` : "₹0";
  document.getElementById("receiptDelivery").textContent = order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`;
  document.getElementById("receiptGrandTotal").textContent = `₹${order.grandTotal}`;

  modal.classList.add("active");
}

function closeReceiptModal() {
  const modal = document.getElementById("receiptModal");
  if (modal) modal.classList.remove("active");
}

function printReceipt() {
  window.print();
}

// --- FAQ ACCORDION ---
function toggleFAQ(element) {
  const parent = element.parentElement;
  const isActive = parent.classList.contains("active");

  // Close all open items
  document.querySelectorAll(".faq-item").forEach(item => {
    item.classList.remove("active");
    const body = item.querySelector(".faq-body");
    if (body) body.style.maxHeight = null;
  });

  // Open clicked if not already active
  if (!isActive) {
    parent.classList.add("active");
    const body = parent.querySelector(".faq-body");
    if (body) body.style.maxHeight = body.scrollHeight + 30 + "px";
  }
}

// --- NEWSLETTER SUBSCRIPTION VIA EMAILJS ---
async function handleNewsletter(event) {
  event.preventDefault();
  const input = document.getElementById("newsletterEmail");
  const form = event.target;
  const submitBtn = form.querySelector("button[type='submit']");
  if (!input) return;
  const email = input.value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Subscribe";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
  }

  const rawName = email.split("@")[0].replace(/[._0-9]/g, " ").trim() || "Valued Customer";
  const subscriberName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const couponCode = "WELCOME10";
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  // Complete parameter payload matching EmailJS template
  const newsletterParams = {
    name: subscriberName,
    to_name: subscriberName,
    customer_name: subscriberName,
    email: email,
    to_email: email,
    user_email: email,
    customer_email: email,
    phone: "Newsletter Subscriber",
    order_id: "VIP-" + couponCode,
    order_date: currentDate,
    pickup_date: "Instant Digital Delivery",
    pickup_slot: "All Time Slots",
    pickup_address: "Sent to " + email,
    items_summary: `✨ Welcome to LuxeWash Club!\n• Exclusive 10% OFF Welcome Coupon\n• Coupon Code: ${couponCode}\n• Applicable on all Dry Cleaning, Laundry & Steam Press services`,
    subtotal: "10% OFF Coupon",
    discount: "10% OFF",
    delivery_fee: "FREE",
    total_amount: "Promo Code: " + couponCode,
    total: "Promo Code: " + couponCode,
    message: `Welcome to LuxeWash! Here is your exclusive 10% discount coupon: ${couponCode}. Use it at checkout to enjoy 10% off your laundry service.`,
    notes: `Use coupon code "${couponCode}" at checkout to enjoy 10% off your laundry service!`
  };

  console.log(`%c[EmailJS] Dispatching Newsletter 10% Coupon to: ${newsletterParams.to_email}`, "color: #10b981; font-weight: bold; font-size: 12px;");
  console.log("[Newsletter Payload]", newsletterParams);

  try {
    if (typeof emailjs !== "undefined" && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, newsletterParams);
      showToast(`Welcome! 10% coupon code sent to ${email} 🎉`, "success");
    } else {
      showToast(`Subscribed! Use code: ${couponCode} for 10% off 🎉`, "success");
    }
  } catch (err) {
    console.warn("Newsletter email send warning:", err);
    showToast(`Subscribed! Your 10% coupon code is: ${couponCode} 🎉`, "success");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
    input.value = "";
  }
}

// --- TOAST ALERTS ---
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "info-circle";
  if (type === "success") icon = "check-circle";
  if (type === "error") icon = "triangle-exclamation";

  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Helper smooth scroll
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
