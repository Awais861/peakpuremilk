/* ====== Peak Pure Assistant — Chatbot Engine ====== */
(function () {
  "use strict";

  // ── Knowledge Base ──
  const KB = {
    products: {
      milk: [
        { name: "Whole Milk", price: "Rs.250/kg", desc: "Rich & creamy, 8g protein, omega-3 rich. Perfect for drinking & cooking." },
        { name: "Semi-Skimmed Milk", price: "Rs.220/kg", desc: "Lighter option with great taste, lower fat content." },
        { name: "Skimmed Milk", price: "Rs.200/kg", desc: "Lowest fat, all nutrition. Ideal for health-conscious families." }
      ],
      butter: [
        { name: "Unsalted Butter", price: "Rs.550/250g", desc: "85% butterfat, European-style, ideal for baking." },
        { name: "Sea Salt Butter", price: "Rs.600/250g", desc: "Flaky Maldon sea salt, perfect for spreading." },
        { name: "Herb & Garlic Butter", price: "Rs.650/250g", desc: "Fresh herbs & roasted garlic, gourmet finishing butter." }
      ]
    },
    shipping: {
      zones: [
        { zone: "Zone 1 — Attock City", cost: "FREE", speed: "Same-day (order by 10 AM)" },
        { zone: "Zone 2 — Hazro, Kamra, Hasan Abdal", cost: "Rs.150", speed: "Next-day delivery", free: "Free on orders over Rs.2,000" },
        { zone: "Zone 3 — Rawalpindi, Islamabad", cost: "Rs.300", speed: "1–2 days", free: "Free on orders over Rs.5,000" }
      ],
      extras: "All deliveries use cold-chain insulated packaging to keep dairy below 4°C. You'll get real-time SMS/WhatsApp tracking updates."
    },
    returns: "We have a hassle-free 48-hour return policy. If you're not satisfied, report within 48 hours of delivery for a full refund or free replacement — no questions asked!",
    subscription: "Subscribe & save 15%! Choose weekly, bi-weekly, or monthly auto-delivery. Pause or cancel anytime — no commitment required.",
    contact: {
      phone: "+92 336 941 3146",
      whatsapp: "+92 336 941 3146",
      email: "awaisrazaattari0@gmail.com",
      telegram: "@peakpurwcowmilk",
      hours: "Mon–Sat: 7 AM–8 PM | Sunday: 9 AM–5 PM",
      address: "R956+PXC Near Beacon House School, Attock, Pakistan"
    },
    sustainability: "We practice regenerative grazing on 200+ acres of pesticide-free pasture, use zero-waste packaging (returnable glass bottles & compostable materials), and never use hormones or antibiotics. Every batch is lab-tested for purity.",
    about: "PeakPureCow Milk is a premium farm-fresh dairy brand from Attock, Pakistan (est. 2025). We deliver hormone-free, grass-fed dairy from our farm to your door within 48 hours. We serve 5,000+ families and counting!"
  };

  // ── Intent Matching ──
  const intents = [
    {
      patterns: [/products?|what.*(sell|offer|have)|menu|catalog|range/i],
      handler: handleProducts
    },
    {
      patterns: [/milk|whole milk|skimmed|semi.?skimmed/i],
      handler: () => handleCategory("milk")
    },
    {
      patterns: [/butter|makhan/i],
      handler: () => handleCategory("butter")
    },
    {
      patterns: [/price|cost|how much|kitna|rate|pricing/i],
      handler: handlePricing
    },
    {
      patterns: [/ship|deliver|delivery|zone|shipping cost|free delivery/i],
      handler: handleShipping
    },
    {
      patterns: [/return|refund|replace|exchange|not satisfied|complaint/i],
      handler: handleReturns
    },
    {
      patterns: [/subscri|auto.?deliver|recurring|monthly|weekly|save/i],
      handler: handleSubscription
    },
    {
      patterns: [/contact|phone|email|call|reach|whatsapp|telegram|address|location|hours|timing/i],
      handler: handleContact
    },
    {
      patterns: [/sustain|eco|environment|organic|solar|green|packaging|hormone/i],
      handler: handleSustainability
    },
    {
      patterns: [/about|who are you|your (story|farm)|company|brand/i],
      handler: handleAbout
    },
    {
      patterns: [/order|how.*(buy|order|place)|checkout/i],
      handler: handleOrder
    },
    {
      patterns: [/track|where.*(order|delivery)|status/i],
      handler: handleTracking
    },
    {
      patterns: [/hello|hi|hey|salam|assalam|good (morning|afternoon|evening)/i],
      handler: handleGreeting
    },
    {
      patterns: [/thank|thanks|shukriya|jazak/i],
      handler: () => "You're welcome! 😊 Is there anything else I can help you with?"
    },
    {
      patterns: [/bye|goodbye|see you|khuda hafiz/i],
      handler: () => "Goodbye! Thank you for visiting PeakPureCow Milk. Have a wonderful day! 🥛"
    }
  ];

  // ── Response Handlers ──
  function handleGreeting() {
    const greetings = [
      "Assalam o Alaikum! 🥛 Welcome to PeakPureCow Milk! How can I help you today?",
      "Hello! 👋 Welcome to PeakPureCow Milk — your farm-fresh dairy destination. What can I help you with?",
      "Hi there! 🐄 I'm Peak Pure Assistant. Ask me about our products, delivery, pricing, or anything else!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  function handleProducts() {
    return "We offer 2 categories of premium dairy:\n\n🥛 <b>Milk</b> — Whole, Semi-Skimmed & Skimmed\n🧈 <b>Butter</b> — Unsalted, Sea Salt & Herb & Garlic\n\nAll 100% farm-fresh, hormone-free & grass-fed! Which category interests you?";
  }

  function handleCategory(cat) {
    const items = KB.products[cat];
    let msg = `Here are our <b>${cat}</b> products:\n\n`;
    items.forEach(p => { msg += `• <b>${p.name}</b> — ${p.price}\n   ${p.desc}\n\n`; });
    msg += `Visit our <a href="shop.html" style="color:#2d4a32;font-weight:700;">Shop</a> to order!`;
    return msg;
  }

  function handlePricing() {
    let msg = "Here's our complete pricing:\n\n<b>🥛 Milk:</b>\n";
    KB.products.milk.forEach(p => { msg += `• ${p.name} — ${p.price}\n`; });
    msg += "\n<b> Butter:</b>\n";
    KB.products.butter.forEach(p => { msg += `• ${p.name} — ${p.price}\n`; });
    msg += "\n💡 <b>Tip:</b> Subscribe & save 15% on every order!";
    return msg;
  }

  function handleShipping() {
    let msg = "🚚 <b>Delivery Zones & Costs:</b>\n\n";
    KB.shipping.zones.forEach(z => {
      msg += `• <b>${z.zone}</b>\n   Cost: ${z.cost} | Speed: ${z.speed}`;
      if (z.free) msg += `\n   🎉 ${z.free}`;
      msg += "\n\n";
    });
    msg += `📦 ${KB.shipping.extras}`;
    return msg;
  }

  function handleReturns() {
    return `↩️ <b>Return Policy:</b>\n\n${KB.returns}\n\nYou can submit a return request on our <a href="returns.html" style="color:#2d4a32;font-weight:700;">Returns page</a>.`;
  }

  function handleSubscription() {
    return `🔄 <b>Subscription Plans:</b>\n\n${KB.subscription}\n\nVisit our <a href="shop.html" style="color:#2d4a32;font-weight:700;">Shop</a> and look for the subscription options on any product!`;
  }

  function handleContact() {
    const c = KB.contact;
    return `📞 <b>Contact Us:</b>\n\n• 📱 Phone: ${c.phone}\n• 💬 WhatsApp: ${c.whatsapp}\n• 📧 Email: ${c.email}\n• ✈️ Telegram: ${c.telegram}\n\n📍 <b>Address:</b> ${c.address}\n🕐 <b>Hours:</b> ${c.hours}\n\nOr visit our <a href="contact.html" style="color:#2d4a32;font-weight:700;">Contact page</a>!`;
  }

  function handleSustainability() {
    return `🌿 <b>Our Sustainability Promise:</b>\n\n${KB.sustainability}\n\nLearn more on our <a href="sustainability.html" style="color:#2d4a32;font-weight:700;">Sustainability page</a>.`;
  }

  function handleAbout() {
    return `🏡 <b>About Us:</b>\n\n${KB.about}\n\nRead our full story on the <a href="about.html" style="color:#2d4a32;font-weight:700;">About page</a>.`;
  }

  function handleOrder() {
    return `🛒 <b>How to Order:</b>\n\n1️⃣ Browse products on our <a href="shop.html" style="color:#2d4a32;font-weight:700;">Shop page</a>\n2️⃣ Add items to your cart\n3️⃣ Click the cart icon and proceed to checkout\n4️⃣ Fill in delivery details & confirm\n\nWe accept cash on delivery! Orders placed before 10 AM in Attock get same-day delivery.`;
  }

  function handleTracking() {
    return "📦 <b>Order Tracking:</b>\n\nOnce your order is dispatched, you'll receive real-time tracking updates via SMS and WhatsApp. You can also reach us directly at +92 336 941 3146 to check your order status!";
  }

  function fallback(input) {
    return `I'm sorry, I didn't quite understand that. 😊 Here are some things I can help with:\n\n• Our products & pricing\n• Delivery zones & shipping costs\n• Returns & refund policy\n• Subscriptions & savings\n• Contact information\n• Sustainability practices\n\nOr you can reach us directly on WhatsApp at <b>+92 336 941 3146</b>!`;
  }

  // ── Match Intent ──
  function getResponse(input) {
    const trimmed = input.trim();
    if (!trimmed) return null;
    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        if (pattern.test(trimmed)) {
          return typeof intent.handler === "function" ? intent.handler() : intent.handler;
        }
      }
    }
    return fallback(trimmed);
  }

  // ── Quick Reply Topics ──
  const quickReplies = [
    { label: "🥛 Products", query: "products" },
    { label: "💰 Prices", query: "pricing" },
    { label: "🚚 Delivery", query: "shipping" },
    { label: "↩️ Returns", query: "returns" },
    { label: "📞 Contact", query: "contact" }
  ];

  // ── DOM Setup ──
  function init() {
    const container = document.querySelector(".floating-widgets");
    const window_ = document.querySelector(".chatbot-window");
    const toggleBtn = document.querySelector(".chatbot-toggle");
    const msgArea = document.querySelector(".chatbot-messages");
    const input = document.querySelector(".chatbot-input input");
    const sendBtn = document.querySelector(".chatbot-send");

    if (!container || !window_ || !toggleBtn) return;

    // Toggle chatbot
    toggleBtn.addEventListener("click", function () {
      const isOpen = window_.classList.toggle("open");
      toggleBtn.classList.toggle("active", isOpen);
      if (isOpen && msgArea.children.length === 0) {
        showWelcome(msgArea);
      }
      if (isOpen) input.focus();
    });

    // Send message
    function send() {
      const text = input.value.trim();
      if (!text) return;
      appendMsg(msgArea, text, "user");
      input.value = "";
      showTyping(msgArea);
      setTimeout(() => {
        removeTyping(msgArea);
        const reply = getResponse(text);
        appendMsg(msgArea, reply, "bot");
        addQuickReplies(msgArea);
      }, 600 + Math.random() * 400);
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") send();
    });
  }

  // ── Helpers ──
  function appendMsg(area, html, type) {
    const div = document.createElement("div");
    div.className = `chat-msg ${type}`;
    div.innerHTML = html;
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  function showTyping(area) {
    const div = document.createElement("div");
    div.className = "typing-indicator";
    div.id = "chatbot-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  function removeTyping(area) {
    const el = document.getElementById("chatbot-typing");
    if (el) el.remove();
  }

  function showWelcome(area) {
    appendMsg(area, "Assalam o Alaikum! 🥛 I'm <b>Peak Pure Assistant</b>. I can help you with products, pricing, delivery, returns, and more. How can I help you today?", "bot");
    addQuickReplies(area);
  }

  function addQuickReplies(area) {
    // Remove any existing quick reply container
    const existing = area.querySelector(".quick-replies");
    if (existing) existing.remove();

    const wrap = document.createElement("div");
    wrap.className = "quick-replies";
    quickReplies.forEach(qr => {
      const btn = document.createElement("button");
      btn.className = "quick-reply-btn";
      btn.textContent = qr.label;
      btn.addEventListener("click", function () {
        wrap.remove();
        appendMsg(area, qr.label, "user");
        showTyping(area);
        setTimeout(() => {
          removeTyping(area);
          appendMsg(area, getResponse(qr.query), "bot");
          addQuickReplies(area);
        }, 500);
      });
      wrap.appendChild(btn);
    });
    area.appendChild(wrap);
    area.scrollTop = area.scrollHeight;
  }

  // ── Initialize on DOM ready ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
