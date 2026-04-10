/* ===================================================
   PeakPureCow Milk — Website Functions
   E-commerce, Navigation, Subscriptions, UX
   =================================================== */

"use strict";

// ─────────────────────────────────────────────
// 1. PRODUCT CATALOG DATA
// ─────────────────────────────────────────────
const ProductCatalog = [
  { id: "whole-milk",       name: "Whole Milk",          category: "milk",    price: 250, unit: "1 kg" },
  { id: "semi-skimmed-milk",name: "Semi-Skimmed Milk",   category: "milk",    price: 220, unit: "1 kg" },
  { id: "skimmed-milk",     name: "Skimmed Milk",        category: "milk",    price: 200, unit: "1 kg" },
  { id: "unsalted-butter",  name: "Unsalted Butter",     category: "butter",  price: 550, unit: "250g" },
  { id: "sea-salt-butter",  name: "Sea Salt Butter",     category: "butter",  price: 600, unit: "250g" },
  { id: "herb-garlic-butter",name:"Herb & Garlic Butter", category: "butter", price: 650, unit: "250g" },
];

// ─────────────────────────────────────────────
// 2A. DELIVERY ZONES CONFIG
// ─────────────────────────────────────────────
const DeliveryZones = [
  {
    zone: 1,
    label: "Zone 1 — Attock City",
    cities: ["attock", "attock city"],
    shippingCost: 0,
    shippingLabel: "Free",
    estimate: "Same-Day Delivery",
    daysToAdd: 0,
  },
  {
    zone: 2,
    label: "Zone 2 — Nearby Towns",
    cities: ["hazro", "kamra", "hasan abdal", "hasanabdal", "fatehjang", "fateh jang", "jand", "pindi gheb", "pindigeb"],
    shippingCost: 150,
    shippingLabel: "Rs.150",
    estimate: "Next-Day Delivery",
    daysToAdd: 1,
  },
  {
    zone: 3,
    label: "Zone 3 — Rawalpindi / Islamabad",
    cities: ["rawalpindi", "islamabad", "pindi", "isb", "rwp", "taxila", "wah cantt", "wah"],
    shippingCost: 300,
    shippingLabel: "Rs.300",
    estimate: "1–2 Day Delivery",
    daysToAdd: 2,
  },
];

/** Detect delivery zone from a city name string */
function detectZone(city) {
  if (!city) return null;
  const c = city.trim().toLowerCase();
  for (const z of DeliveryZones) {
    if (z.cities.some(name => c.includes(name) || name.includes(c))) return z;
  }
  // Default to Zone 3 for any other city
  return { zone: 0, label: "Outside Delivery Zones", cities: [], shippingCost: 500, shippingLabel: "Rs.500", estimate: "3–5 Day Delivery", daysToAdd: 5 };
}

/** Generate a formatted order ID: ORD-YYYYMMDD-XXXX */
function generateOrderId() {
  const d = new Date();
  const dateStr = d.getFullYear().toString() +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    ("0" + d.getDate()).slice(-2);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return "ORD-" + dateStr + "-" + rand;
}

/** Calculate estimated delivery date string */
function getEstimatedDelivery(daysToAdd) {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─────────────────────────────────────────────
// 2. SHOPPING CART (localStorage-backed)
// ─────────────────────────────────────────────
const Cart = {
  STORAGE_KEY: "peakpuremilk_cart",

  /** Get cart items from storage */
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  /** Save cart items to storage */
  _save(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this._dispatch();
  },

  /** Dispatch custom event so UI components can react */
  _dispatch() {
    document.dispatchEvent(new CustomEvent("cart:updated", { detail: this.getSummary() }));
  },

  /** Add a product by ID (increments qty if already in cart) */
  addItem(productId, qty = 1) {
    const product = ProductCatalog.find(p => p.id === productId);
    if (!product) return;
    const items = this.getItems();
    const existing = items.find(i => i.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id: productId, name: product.name, price: product.price, qty });
    }
    this._save(items);
  },

  /** Remove a product entirely */
  removeItem(productId) {
    const items = this.getItems().filter(i => i.id !== productId);
    this._save(items);
  },

  /** Update quantity for a specific item */
  updateQty(productId, qty) {
    const items = this.getItems();
    const item = items.find(i => i.id === productId);
    if (!item) return;
    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }
    item.qty = qty;
    this._save(items);
  },

  /** Clear the cart */
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this._dispatch();
  },

  /** Get totals: item count, subtotal, shipping, discount, total */
  getSummary() {
    const items = this.getItems();
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const FREE_SHIPPING_THRESHOLD = 5000;
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 350;
    return { items, itemCount, subtotal, shipping, total: subtotal + shipping };
  },
};


// ─────────────────────────────────────────────
// 3. SUBSCRIPTION MANAGER
// ─────────────────────────────────────────────
const Subscription = {
  STORAGE_KEY: "peakpuremilk_subscription",
  DISCOUNT: 0.15,

  /** Get saved subscription or null */
  get() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    } catch {
      return null;
    }
  },

  /** Create / update a subscription plan */
  set(frequency, cartItems) {
    const plan = {
      frequency,            // "weekly" | "bi-weekly" | "monthly"
      items: cartItems,
      discount: this.DISCOUNT,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plan));
    document.dispatchEvent(new CustomEvent("subscription:updated", { detail: plan }));
    return plan;
  },

  /** Cancel subscription */
  cancel() {
    localStorage.removeItem(this.STORAGE_KEY);
    document.dispatchEvent(new CustomEvent("subscription:updated", { detail: null }));
  },

  /** Compute discounted total for subscription items */
  getDiscountedTotal(items) {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    return subtotal * (1 - this.DISCOUNT);
  },
};


// ─────────────────────────────────────────────
// 4. NEWSLETTER SIGNUP (front-end handler)
// ─────────────────────────────────────────────
function initNewsletter() {
  document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      if (!email) return;

      // Simulate API call — replace with real endpoint
      const btn = this.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = "Sending...";
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = "✓ Subscribed!";
        btn.classList.add("btn--subscribed");
        emailInput.value = "";
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.classList.remove("btn--subscribed");
        }, 3000);
      }, 800);
    });
  });
}


// ─────────────────────────────────────────────
// 5. MOBILE NAVIGATION
// ─────────────────────────────────────────────
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const isOpen = navLinks.classList.contains("active");
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.innerHTML = isOpen ? "&#10005;" : "&#9776;";
  });

  // Close nav when clicking a link (mobile)
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      toggle.setAttribute("aria-expanded", false);
      toggle.innerHTML = "&#9776;";
    });
  });
}


// ─────────────────────────────────────────────
// 6. STICKY HEADER SCROLL EFFECT (hide/show on scroll)
// ─────────────────────────────────────────────
function initStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  let lastScroll = 0;
  const headerHeight = header.offsetHeight;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 80) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }

    // Hide header on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > headerHeight * 2) {
      header.style.transform = `translateY(-100%)`;
    } else {
      header.style.transform = `translateY(0)`;
    }
    header.style.transition = "transform 0.35s ease, box-shadow 0.3s ease, background 0.3s ease";
    lastScroll = currentScroll;
  }, { passive: true });
}


// ─────────────────────────────────────────────
// 7. ADD-TO-CART BUTTONS (Shop page)
// ─────────────────────────────────────────────
function initAddToCart() {
  const cards = document.querySelectorAll(".product-card");
  if (!cards.length) return;

  cards.forEach((card, index) => {
    const btn = card.querySelector(".btn");
    if (!btn || btn.dataset.cartBound) return;
    btn.dataset.cartBound = "true";

    // Match by data-product-id, then h3 name, then index fallback
    const pid = card.dataset.productId;
    const pName = card.querySelector("h3")?.textContent.trim();
    const product = pid
      ? ProductCatalog.find(p => p.id === pid)
      : pName
        ? ProductCatalog.find(p => p.name === pName)
        : ProductCatalog[index];
    if (!product) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      Cart.addItem(product.id);

      // Button feedback
      const original = this.textContent;
      this.textContent = "✓ Added!";
      this.classList.replace("btn--primary", "btn--gold");
      setTimeout(() => {
        this.textContent = original;
        this.classList.replace("btn--gold", "btn--primary");
      }, 1500);
    });
  });
}


// ─────────────────────────────────────────────
// 8. CART BADGE (shows item count in nav)
// ─────────────────────────────────────────────
function initCartBadge() {
  // Inject badge next to "Order Now" button
  const orderBtn = document.querySelector('.nav-links .btn--primary');
  if (!orderBtn) return;

  const badge = document.createElement("span");
  badge.className = "cart-badge";
  badge.style.cssText = `
    display: none; position: absolute; top: -6px; right: -10px;
    background: var(--color-gold); color: #fff; font-size: 0.7rem;
    width: 20px; height: 20px; border-radius: 50%;
    line-height: 20px; text-align: center; font-weight: 700;
  `;
  orderBtn.style.position = "relative";
  orderBtn.appendChild(badge);

  function update() {
    const { itemCount } = Cart.getSummary();
    badge.textContent = itemCount;
    badge.style.display = itemCount > 0 ? "inline-block" : "none";
  }

  document.addEventListener("cart:updated", update);
  update(); // initial
}


// ─────────────────────────────────────────────
// 9. MINI CART DRAWER
// ─────────────────────────────────────────────
function initMiniCart() {
  // Create drawer markup
  const drawer = document.createElement("div");
  drawer.id = "mini-cart";
  drawer.innerHTML = `
    <div class="mini-cart__overlay"></div>
    <aside class="mini-cart__panel">
      <div class="mini-cart__header">
        <h3>Your Cart</h3>
        <button class="mini-cart__close" aria-label="Close cart">&times;</button>
      </div>
      <div class="mini-cart__items"></div>
      <div class="mini-cart__footer">
        <div class="mini-cart__totals"></div>
        <a href="checkout.html" class="btn btn--primary mini-cart__checkout">View Cart & Checkout</a>
      </div>
    </aside>
  `;
  document.body.appendChild(drawer);

  const overlay = drawer.querySelector(".mini-cart__overlay");
  const panel = drawer.querySelector(".mini-cart__panel");
  const closeBtn = drawer.querySelector(".mini-cart__close");
  const itemsContainer = drawer.querySelector(".mini-cart__items");
  const totalsContainer = drawer.querySelector(".mini-cart__totals");

  function openDrawer() {
    drawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", closeDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  // Open on cart update — skip on checkout page to avoid covering the form
  const isCheckoutPage = !!document.getElementById("checkout-form");
  document.addEventListener("cart:updated", (e) => {
    renderCart(e.detail);
    if (!isCheckoutPage && e.detail.itemCount > 0) openDrawer();
  });

  function renderCart(summary) {
    if (!summary.items.length) {
      itemsContainer.innerHTML = '<p class="mini-cart__empty">Your cart is empty.</p>';
      totalsContainer.innerHTML = "";
      return;
    }

    itemsContainer.innerHTML = summary.items.map(item => `
      <div class="mini-cart__item" data-id="${item.id}">
        <div class="mini-cart__item-info">
          <strong>${item.name}</strong>
          <span>Rs.${item.price} × ${item.qty}</span>
        </div>
        <div class="mini-cart__item-actions">
          <button class="mini-cart__qty-btn" data-action="decrease">−</button>
          <span>${item.qty}</span>
          <button class="mini-cart__qty-btn" data-action="increase">+</button>
          <button class="mini-cart__remove" data-action="remove" aria-label="Remove ${item.name}">&times;</button>
        </div>
      </div>
    `).join("");

    totalsContainer.innerHTML = `
      <div class="mini-cart__line">Subtotal: <strong>Rs.${summary.subtotal.toLocaleString()}</strong></div>
      <div class="mini-cart__line">Shipping: <strong>${summary.shipping === 0 ? "FREE" : "Rs." + summary.shipping}</strong></div>
      <div class="mini-cart__line mini-cart__total">Total: <strong>Rs.${summary.total.toLocaleString()}</strong></div>
      ${summary.subtotal < 5000 ? `<p class="mini-cart__hint">Add Rs.${(5000 - summary.subtotal).toLocaleString()} more for free shipping!</p>` : ""}
    `;
  }

  // Delegate qty/remove clicks
  itemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const itemEl = btn.closest(".mini-cart__item");
    const id = itemEl.dataset.id;
    const action = btn.dataset.action;
    const items = Cart.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (action === "increase") Cart.updateQty(id, item.qty + 1);
    else if (action === "decrease") Cart.updateQty(id, item.qty - 1);
    else if (action === "remove") Cart.removeItem(id);
  });
}


// ─────────────────────────────────────────────
// 10. SUBSCRIPTION PLAN SELECTOR
// ─────────────────────────────────────────────
function initSubscriptionSelector() {
  const plans = document.querySelectorAll(".plan");
  const subBtn = document.querySelector('.subscription-box .btn--gold');
  if (!plans.length || !subBtn) return;

  let selectedPlan = null;

  plans.forEach(plan => {
    plan.style.cursor = "pointer";
    plan.addEventListener("click", function () {
      plans.forEach(p => p.classList.remove("plan--active"));
      this.classList.add("plan--active");
      selectedPlan = this.querySelector("h4").textContent.trim().toLowerCase();
    });
  });

  subBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const cartItems = Cart.getItems();
    if (!selectedPlan) {
      showToast("Please select a delivery frequency first.");
      return;
    }
    if (!cartItems.length) {
      showToast("Add products to your cart before subscribing.");
      return;
    }
    const plan = Subscription.set(selectedPlan, cartItems);
    const discounted = Subscription.getDiscountedTotal(cartItems);
    showToast(`Subscribed! You save 15% — total: Rs.${Math.round(discounted).toLocaleString()}/${selectedPlan}.`);
  });
}


// ─────────────────────────────────────────────
// 11. PRODUCT FILTERING (Shop page)
// ─────────────────────────────────────────────
function initProductFilter() {
  const productGrid = document.querySelector(".section .grid-3");
  const cards = document.querySelectorAll(".product-card");
  if (!cards.length || !productGrid) return;

  // Build filter bar
  const filterBar = document.createElement("div");
  filterBar.className = "filter-bar";
  filterBar.innerHTML = `
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="milk">Milk</button>
    <button class="filter-btn" data-filter="butter">Butter</button>
  `;
  productGrid.parentElement.insertBefore(filterBar, productGrid);

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    const filter = btn.dataset.filter;

    filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    cards.forEach((card, i) => {
      const product = ProductCatalog[i];
      if (!product) return;
      if (filter === "all" || product.category === filter) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
}


// ─────────────────────────────────────────────
// 12. TOAST NOTIFICATIONS
// ─────────────────────────────────────────────
function showToast(message, duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}


// ─────────────────────────────────────────────
// 13. SCROLL-REVEAL ANIMATIONS
// ─────────────────────────────────────────────
function initScrollReveal() {
  const elements = document.querySelectorAll(
    ".value-prop, .card, .testimonial, .split, .stat, .product-card, .badge"
  );
  if (!elements.length || !("IntersectionObserver" in window)) return;

  elements.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  elements.forEach(el => observer.observe(el));
}


// ─────────────────────────────────────────────
// 14. BACK-TO-TOP BUTTON
// ─────────────────────────────────────────────
function initBackToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.innerHTML = "&#8593;";
  btn.setAttribute("aria-label", "Back to top");
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


// ─────────────────────────────────────────────
// 15. SMOOTH SCROLL FOR ANCHOR LINKS
// ─────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      try {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) { /* invalid selector */ }
    });
  });
}


// ─────────────────────────────────────────────
// 16. TESTIMONIAL CAROUSEL (auto-rotate)
// ─────────────────────────────────────────────
function initTestimonialCarousel() {
  const testimonials = document.querySelectorAll(".testimonial");
  if (testimonials.length <= 1) return;

  let current = 0;

  // Only run carousel on mobile (single-column view)
  function shouldRotate() {
    return window.innerWidth < 768;
  }

  function showSlide(index) {
    testimonials.forEach((t, i) => {
      t.style.display = (i === index) ? "block" : "none";
    });
  }

  function rotate() {
    if (!shouldRotate()) {
      testimonials.forEach(t => t.style.display = "");
      return;
    }
    current = (current + 1) % testimonials.length;
    showSlide(current);
  }

  setInterval(rotate, 4000);

  // Reset on resize
  window.addEventListener("resize", () => {
    if (!shouldRotate()) {
      testimonials.forEach(t => t.style.display = "");
    } else {
      showSlide(current);
    }
  });
}


// ─────────────────────────────────────────────
// 17. IMPACT COUNTER ANIMATION
// ─────────────────────────────────────────────
function initCounterAnimation() {
  const counters = document.querySelectorAll(".stat__number");
  if (!counters.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent.trim();
      const numericPart = parseInt(text.replace(/[^0-9]/g, ""), 10);
      const suffix = text.replace(/[0-9,]/g, "");
      if (isNaN(numericPart)) return;

      let count = 0;
      const step = Math.ceil(numericPart / 60);
      const timer = setInterval(() => {
        count += step;
        if (count >= numericPart) {
          count = numericPart;
          clearInterval(timer);
        }
        el.textContent = count.toLocaleString() + suffix;
      }, 30);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}


// ─────────────────────────────────────────────
// 18. CHECKOUT PAGE
// ─────────────────────────────────────────────
function initCheckout() {
  const form = document.getElementById("checkout-form");
  if (!form) return; // Not on checkout page

  const itemsContainer = document.getElementById("checkout-items");
  const emptyContainer = document.getElementById("checkout-empty");
  const totalsContainer = document.getElementById("checkout-totals");
  const submitBtn = document.getElementById("checkout-submit");
  const confirmationSection = document.getElementById("order-confirmation");
  const checkoutSection = form.closest(".section");

  function renderOrderSummary() {
    const summary = Cart.getSummary();

    if (!summary.items.length) {
      itemsContainer.style.display = "none";
      totalsContainer.style.display = "none";
      emptyContainer.style.display = "block";
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";
      return;
    }

    emptyContainer.style.display = "none";
    itemsContainer.style.display = "block";
    totalsContainer.style.display = "block";
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";

    itemsContainer.innerHTML = summary.items.map(item => `
      <div class="checkout-item" data-id="${item.id}">
        <div class="checkout-item__info">
          <strong>${item.name}</strong>
          <span>Rs.${item.price} each</span>
        </div>
        <div class="checkout-item__qty">
          <button type="button" data-action="decrease" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button type="button" data-action="increase" aria-label="Increase quantity">+</button>
        </div>
        <div class="checkout-item__price">Rs.${(item.price * item.qty).toLocaleString()}</div>
        <button type="button" class="checkout-item__remove" data-action="remove" aria-label="Remove ${item.name}">&times;</button>
      </div>
    `).join("");

    // Check for active subscription discount
    const sub = Subscription.get();
    const hasDiscount = sub && sub.discount;
    const discountAmount = hasDiscount ? summary.subtotal * sub.discount : 0;
    const adjustedTotal = summary.total - discountAmount;

    totalsContainer.innerHTML = `
      <div class="checkout-totals__line">
        <span>Subtotal (${summary.itemCount} item${summary.itemCount !== 1 ? "s" : ""})</span>
        <strong>Rs.${summary.subtotal.toLocaleString()}</strong>
      </div>
      ${hasDiscount ? `
      <div class="checkout-totals__line checkout-totals__line--savings">
        <span>Subscription Discount (15%)</span>
        <strong>−Rs.${Math.round(discountAmount).toLocaleString()}</strong>
      </div>` : ""}
      <div class="checkout-totals__line">
        <span>Shipping</span>
        <strong>${summary.shipping === 0 ? "FREE" : "Rs." + summary.shipping}</strong>
      </div>
      ${summary.subtotal < 5000 && summary.subtotal > 0 ? `
      <div class="checkout-totals__line checkout-totals__line--savings">
        <span>Add Rs.${(5000 - summary.subtotal).toLocaleString()} for free shipping</span>
        <span></span>
      </div>` : ""}
      <div class="checkout-totals__line checkout-totals__line--total">
        <span>Total</span>
        <strong>Rs.${Math.round(hasDiscount ? adjustedTotal : summary.total).toLocaleString()}</strong>
      </div>
    `;
  }

  // Initial render
  renderOrderSummary();

  // Qty / remove controls in order summary
  itemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const itemEl = btn.closest(".checkout-item");
    const id = itemEl.dataset.id;
    const action = btn.dataset.action;
    const items = Cart.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (action === "increase") Cart.updateQty(id, item.qty + 1);
    else if (action === "decrease") Cart.updateQty(id, item.qty - 1);
    else if (action === "remove") Cart.removeItem(id);
  });

  // Re-render when cart changes (from qty buttons above)
  document.addEventListener("cart:updated", () => renderOrderSummary());

  // Format card number as user types (groups of 4)
  const cardInput = document.getElementById("checkout-card");
  const cardDetailsFieldset = document.getElementById("card-details-fieldset");
  const paypalDetailsFieldset = document.getElementById("paypal-details-fieldset");
  const paymentMethodRadios = form.querySelectorAll('input[name="paymentMethod"]');
  const paymentMethodError = document.getElementById("payment-method-error");
  const paymentDetected = document.getElementById("payment-detected");
  const detectedCardIcon = document.getElementById("detected-card-icon");
  const detectedCardText = document.getElementById("detected-card-text");

  // Card BIN patterns for Visa/Mastercard detection
  const CARD_PATTERNS = {
    visa: /^4[0-9]{0,15}$/,
    mastercard: /^(5[1-5][0-9]{0,14}|2[2-7][0-9]{0,14})$/
  };

  function getCardType(number) {
    const stripped = number.replace(/\s/g, "");
    if (CARD_PATTERNS.visa.test(stripped)) return "visa";
    if (CARD_PATTERNS.mastercard.test(stripped)) return "mastercard";
    return "unknown";
  }

  // Payment method switching (Visa/Mastercard vs PayPal)
  function handlePaymentMethodSwitch() {
    const selected = form.querySelector('input[name="paymentMethod"]:checked');
    if (!selected) return;

    const method = selected.value;
    const cardFields = cardDetailsFieldset.querySelectorAll("input");
    const paypalField = document.getElementById("checkout-paypal-email");

    // Highlight selected card
    form.querySelectorAll(".payment-card").forEach(c => c.classList.remove("payment-card--active"));
    selected.closest(".payment-card").classList.add("payment-card--active");

    // Hide error
    if (paymentMethodError) paymentMethodError.style.display = "none";

    if (method === "paypal") {
      cardDetailsFieldset.style.display = "none";
      paypalDetailsFieldset.style.display = "block";
      // Remove required from card fields, add to paypal
      cardFields.forEach(f => f.removeAttribute("required"));
      if (paypalField) paypalField.setAttribute("required", "");
    } else {
      cardDetailsFieldset.style.display = "block";
      paypalDetailsFieldset.style.display = "none";
      // Restore required on card fields, remove from paypal
      cardFields.forEach(f => f.setAttribute("required", ""));
      if (paypalField) paypalField.removeAttribute("required");
    }
  }

  paymentMethodRadios.forEach(radio => {
    radio.addEventListener("change", handlePaymentMethodSwitch);
  });

  // Card number detection + formatting
  if (cardInput) {
    cardInput.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").substring(0, 16);
      this.value = v.replace(/(.{4})/g, "$1 ").trim();

      const selected = form.querySelector('input[name="paymentMethod"]:checked');
      if (!selected || selected.value === "paypal") return;

      const type = getCardType(v);
      if (v.length >= 1 && type !== "unknown") {
        paymentDetected.style.display = "flex";
        detectedCardIcon.textContent = type === "visa" ? "💳" : "💳";
        detectedCardText.textContent = type === "visa" ? "Visa card detected" : "Mastercard detected";
        paymentDetected.className = "payment-detected payment-detected--" + type;
        cardInput.classList.remove("invalid");
      } else if (v.length >= 2) {
        paymentDetected.style.display = "flex";
        detectedCardIcon.textContent = "⚠️";
        detectedCardText.textContent = "Only Visa & Mastercard accepted";
        paymentDetected.className = "payment-detected payment-detected--rejected";
      } else {
        paymentDetected.style.display = "none";
      }
    });
  }

  // Format expiry as MM/YY
  const expInput = document.getElementById("checkout-exp");
  if (expInput) {
    expInput.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").substring(0, 4);
      if (v.length >= 3) v = v.substring(0, 2) + "/" + v.substring(2);
      this.value = v;
    });
  }

  // ─── Zone auto-detection on city input ───
  const cityField = document.getElementById("checkout-city");
  const zoneInfoBox = document.getElementById("zone-info");

  function updateZoneDisplay() {
    if (!cityField || !zoneInfoBox) return;
    const city = cityField.value.trim();
    if (!city) {
      zoneInfoBox.style.display = "none";
      return;
    }
    const zone = detectZone(city);
    zoneInfoBox.style.display = "block";
    zoneInfoBox.innerHTML = `
      <div class="zone-info__badge">${zone.label}</div>
      <div class="zone-info__details">
        <span><strong>Shipping:</strong> ${zone.shippingLabel}</span>
        <span><strong>Estimated:</strong> ${zone.estimate} (by ${getEstimatedDelivery(zone.daysToAdd)})</span>
      </div>
    `;
  }

  if (cityField) {
    cityField.addEventListener("input", updateZoneDisplay);
    cityField.addEventListener("change", updateZoneDisplay);
    updateZoneDisplay();
  }

  // Form validation + submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
    form.querySelectorAll(".error-msg").forEach(el => el.remove());

    const requiredFields = form.querySelectorAll("[required]");
    let firstInvalid = null;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add("invalid");
        if (!firstInvalid) firstInvalid = field;
        const msg = document.createElement("span");
        msg.className = "error-msg";
        msg.style.display = "block";
        msg.textContent = "This field is required.";
        field.parentElement.appendChild(msg);
      }
    });

    // Email format
    const emailField = document.getElementById("checkout-email");
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.classList.add("invalid");
      if (!firstInvalid) firstInvalid = emailField;
      const msg = document.createElement("span");
      msg.className = "error-msg";
      msg.style.display = "block";
      msg.textContent = "Please enter a valid email address.";
      emailField.parentElement.appendChild(msg);
    }

    // ZIP code format
    const zipField = document.getElementById("checkout-zip");
    if (zipField && zipField.value && !/^[0-9]{5}(-[0-9]{4})?$/.test(zipField.value.trim())) {
      zipField.classList.add("invalid");
      if (!firstInvalid) firstInvalid = zipField;
      const msg = document.createElement("span");
      msg.className = "error-msg";
      msg.style.display = "block";
      msg.textContent = "Enter a valid 5-digit ZIP code.";
      zipField.parentElement.appendChild(msg);
    }

    // Payment method validation
    const selectedPayment = form.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedPayment) {
      if (paymentMethodError) paymentMethodError.style.display = "flex";
      if (!firstInvalid) {
        const methodSection = document.getElementById("payment-methods");
        if (methodSection) {
          firstInvalid = methodSection;
          methodSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }

    // Card type validation (Visa/Mastercard only when card payment selected)
    if (selectedPayment && selectedPayment.value !== "paypal" && cardInput) {
      const cardNum = cardInput.value.replace(/\s/g, "");
      const cardType = getCardType(cardNum);
      if (cardNum.length > 0 && cardType === "unknown") {
        cardInput.classList.add("invalid");
        if (!firstInvalid) firstInvalid = cardInput;
        const existing = cardInput.parentElement.querySelector(".error-msg");
        if (!existing) {
          const msg = document.createElement("span");
          msg.className = "error-msg";
          msg.style.display = "block";
          msg.textContent = "Only Visa and Mastercard are accepted. Please use a valid card.";
          cardInput.parentElement.appendChild(msg);
        }
      } else if (cardNum.length > 0 && cardType !== selectedPayment.value) {
        // Card doesn't match selected method
        cardInput.classList.add("invalid");
        if (!firstInvalid) firstInvalid = cardInput;
        const existing = cardInput.parentElement.querySelector(".error-msg");
        if (!existing) {
          const msg = document.createElement("span");
          msg.className = "error-msg";
          msg.style.display = "block";
          msg.textContent = `Card number doesn't match selected method. This appears to be a ${cardType.charAt(0).toUpperCase() + cardType.slice(1)} card.`;
          cardInput.parentElement.appendChild(msg);
        }
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Cart must not be empty
    if (!Cart.getItems().length) {
      showToast("Your cart is empty. Add products before checking out.");
      return;
    }

    // Simulate order processing
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    setTimeout(() => {
      // Generate order ID
      const orderId = generateOrderId();

      // Detect zone from city
      const city = cityField ? cityField.value.trim() : "";
      const zone = detectZone(city);
      const estimatedDelivery = getEstimatedDelivery(zone.daysToAdd);
      const now = new Date();

      // Save order to shipping history before clearing cart
      const summary = Cart.getSummary();
      const orderRecord = {
        orderId: orderId,
        date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        items: summary.items.map(i => i.name + " × " + i.qty).join(", "),
        zone: zone.label,
        shippingCost: zone.shippingLabel,
        status: "Order Placed",
        estimatedDelivery: estimatedDelivery,
        total: summary.total,
      };
      try {
        const orders = JSON.parse(localStorage.getItem("peakpurecowmilk_shipping_orders") || "[]");
        orders.unshift(orderRecord);
        localStorage.setItem("peakpurecowmilk_shipping_orders", JSON.stringify(orders));
      } catch (e) { /* storage full */ }

      // Show confirmation
      checkoutSection.style.display = "none";
      document.querySelector(".hero").style.display = "none";
      confirmationSection.style.display = "block";
      confirmationSection.querySelector(".confirmation-id").textContent = orderId;
      confirmationSection.querySelector(".confirmation-email").textContent = emailField.value;

      // Fill in zone & delivery info on confirmation
      const zoneEl = confirmationSection.querySelector(".confirmation-zone");
      if (zoneEl) zoneEl.textContent = zone.label;
      const deliveryEl = confirmationSection.querySelector(".confirmation-delivery");
      if (deliveryEl) deliveryEl.textContent = estimatedDelivery;
      const shippingEl = confirmationSection.querySelector(".confirmation-shipping");
      if (shippingEl) shippingEl.textContent = zone.shippingLabel;

      // Clear cart & subscription after order
      Cart.clear();
      Subscription.cancel();

      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  });
}


// ─────────────────────────────────────────────
// INITIALIZE ALL
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Core navigation & UX
  initMobileNav();
  initStickyHeader();
  initSmoothScroll();
  initBackToTop();
  initScrollReveal();
  initScrollProgress();
  initActiveNav();
  initHeroParticles();
  initParallaxHero();

  // E-commerce
  initAddToCart();
  initCartBadge();
  initMiniCart();
  initProductFilter();
  initSubscriptionSelector();

  // Content features
  initNewsletter();
  initTestimonialCarousel();
  initCounterAnimation();

  // Checkout
  initCheckout();

  // New enhanced features
  initDarkMode();
  initPagePreloader();
  initCookieConsent();
  initHeroTypingEffect();
  initCardTiltEffect();
  initPageTransitions();
  initImageLazyFade();
});


// ─────────────────────────────────────────────
// 19. SCROLL PROGRESS BAR
// ─────────────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + "%";
  }, { passive: true });
}


// ─────────────────────────────────────────────
// 20. ACTIVE NAV LINK HIGHLIGHTING
// ─────────────────────────────────────────────
function initActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "home.html";
  document.querySelectorAll(".nav-links a:not(.btn)").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.style.color = "var(--color-gold)";
      link.classList.add("nav-active");
    }
  });
}


// ─────────────────────────────────────────────
// 21. HERO FLOATING PARTICLES
// ─────────────────────────────────────────────
function initHeroParticles() {
  const container = document.querySelector(".hero__particles");
  if (!container) return;

  const count = 20;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "hero__particle";
    const size = Math.random() * 4 + 3;
    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.bottom = "-10px";
    p.style.animationDuration = (Math.random() * 8 + 6) + "s";
    p.style.animationDelay = (Math.random() * 10) + "s";
    container.appendChild(p);
  }
}


// ─────────────────────────────────────────────
// 22. PARALLAX HERO BACKGROUND
// ─────────────────────────────────────────────
function initParallaxHero() {
  const hero = document.querySelector(".hero");
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      hero.style.backgroundPositionY = (scrolled * 0.35) + "px";
    }
  }, { passive: true });
}


// ─────────────────────────────────────────────
// 23. DARK MODE TOGGLE
// ─────────────────────────────────────────────
function initDarkMode() {
  const STORAGE_KEY = "peakpure_darkmode";

  // Create toggle button
  const toggle = document.createElement("button");
  toggle.className = "darkmode-toggle";
  toggle.setAttribute("aria-label", "Toggle dark mode");
  toggle.innerHTML = `
    <svg class="darkmode-icon darkmode-icon--sun" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM4 10.5H1v2h3zm9-9.95h-2V3.5h2zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79zM20 10.5v2h3v-2zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2zm-7.45-3.91l1.41 1.41 1.79-1.79-1.41-1.41z"/></svg>
    <svg class="darkmode-icon darkmode-icon--moon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
  `;
  document.body.appendChild(toggle);

  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    toggle.classList.toggle("darkmode-toggle--active", dark);
  }

  // Check stored preference or system preference
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    applyTheme(stored === "true");
  } else {
    applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  toggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(!isDark);
    localStorage.setItem(STORAGE_KEY, (!isDark).toString());
  });
}


// ─────────────────────────────────────────────
// 24. PAGE PRELOADER
// ─────────────────────────────────────────────
function initPagePreloader() {
  const preloader = document.getElementById("page-preloader");
  if (!preloader) return;

  window.addEventListener("load", () => {
    preloader.classList.add("preloader--done");
    setTimeout(() => preloader.remove(), 600);
  });
}


// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// 25. COOKIE CONSENT BANNER
// ─────────────────────────────────────────────
function initCookieConsent() {
  const STORAGE_KEY = "peakpure_cookie_consent";
  if (localStorage.getItem(STORAGE_KEY)) return;

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <div class="cookie-banner__content">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;color:var(--color-gold);"><path d="M21.95 10.99c-1.79-.03-3.7-1.95-2.68-4.22-2.98 1-5.77-1.59-5.19-4.56C7.11.74 2 6.41 2 12c0 5.52 4.48 10 10 10 5.89 0 10.54-5.08 9.95-11.01zM8.5 15c-.83 0-1.5-.67-1.5-1.5S7.67 12 8.5 12s1.5.67 1.5 1.5S9.33 15 8.5 15zm2-5C9.67 10 9 9.33 9 8.5S9.67 7 10.5 7s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
      <p>We use cookies to enhance your browsing experience and remember your preferences. By continuing, you agree to our use of cookies.</p>
      <div class="cookie-banner__actions">
        <button class="btn btn--gold cookie-banner__accept">Accept All</button>
        <button class="cookie-banner__decline">Decline</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  setTimeout(() => banner.classList.add("cookie-banner--visible"), 1500);

  banner.querySelector(".cookie-banner__accept").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    banner.classList.remove("cookie-banner--visible");
    setTimeout(() => banner.remove(), 400);
  });

  banner.querySelector(".cookie-banner__decline").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    banner.classList.remove("cookie-banner--visible");
    setTimeout(() => banner.remove(), 400);
  });
}


// ─────────────────────────────────────────────
// 27. HERO TYPING EFFECT
// ─────────────────────────────────────────────
function initHeroTypingEffect() {
  const heroH1 = document.querySelector(".hero h1");
  if (!heroH1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const fullText = heroH1.textContent;
  heroH1.textContent = "";
  heroH1.style.borderRight = "3px solid var(--color-gold)";
  heroH1.style.minHeight = heroH1.offsetHeight + "px";

  let i = 0;
  function typeChar() {
    if (i < fullText.length) {
      heroH1.textContent += fullText.charAt(i);
      i++;
      setTimeout(typeChar, 35);
    } else {
      // Remove cursor after typing is done
      setTimeout(() => {
        heroH1.style.borderRight = "none";
      }, 1000);
    }
  }

  // Start after preloader finishes
  setTimeout(typeChar, 800);
}


// ─────────────────────────────────────────────
// 28. CARD TILT HOVER EFFECT
// ─────────────────────────────────────────────
function initCardTiltEffect() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if ("ontouchstart" in window) return; // skip on touch devices

  const cards = document.querySelectorAll(".card, .product-card, .contact-card, .shipping-zone, .badge");
  cards.forEach(card => {
    card.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      this.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      this.style.transition = "transform 0.1s ease";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "";
      this.style.transition = "transform 0.4s ease";
    });
  });
}


// ─────────────────────────────────────────────
// 29. SMOOTH PAGE TRANSITIONS
// ─────────────────────────────────────────────
function initPageTransitions() {
  document.body.classList.add("page-loaded");

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") ||
        href.startsWith("http") || link.getAttribute("target") === "_blank") return;

    link.addEventListener("click", function (e) {
      e.preventDefault();
      document.body.classList.add("page-leaving");
      setTimeout(() => { window.location.href = href; }, 300);
    });
  });
}


// ─────────────────────────────────────────────
// 30. IMAGE LAZY FADE-IN
// ─────────────────────────────────────────────
function initImageLazyFade() {
  if (!("IntersectionObserver" in window)) return;

  const images = document.querySelectorAll("img:not(.logo__icon)");
  images.forEach(img => {
    if (img.complete) return;
    img.classList.add("img-lazy");
    img.addEventListener("load", () => img.classList.add("img-lazy--loaded"));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: "100px" });

  images.forEach(img => observer.observe(img));
}