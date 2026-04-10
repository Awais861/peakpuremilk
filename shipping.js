// ====== Shipping Page Logic ======
document.addEventListener('DOMContentLoaded', function() {

  // ========== Order History from Cart ==========
  var CART_KEY = 'peakpuremilk_cart';
  var SHIPPING_KEY = 'peakpurecowmilk_shipping_orders';

  function getOrders() {
    try { return JSON.parse(localStorage.getItem(SHIPPING_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveOrders(orders) {
    localStorage.setItem(SHIPPING_KEY, JSON.stringify(orders));
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Render order history table
  function renderTable() {
    var orders = getOrders();
    var tbody = document.getElementById('shippingTableBody');
    var empty = document.getElementById('shippingEmpty');

    if (orders.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = orders.map(function(o) {
      var statusClass = 'shipping-status--' + o.status.replace(/\s/g, '-').toLowerCase();
      return '<tr>' +
        '<td><strong>' + escapeHtml(o.orderId) + '</strong></td>' +
        '<td>' + escapeHtml(o.items) + '</td>' +
        '<td>' + escapeHtml(o.zone) + '</td>' +
        '<td>' + escapeHtml(o.shippingCost) + '</td>' +
        '<td><span class="shipping-status ' + statusClass + '">' + escapeHtml(o.status) + '</span></td>' +
        '<td>' + escapeHtml(o.estimatedDelivery) + '</td>' +
        '<td>' + escapeHtml(o.date) + '</td>' +
      '</tr>';
    }).join('');
  }

  // ========== Order Tracker ==========
  var trackBtn = document.getElementById('shippingTrackBtn');
  var trackInput = document.getElementById('shippingOrderId');
  var trackResult = document.getElementById('shippingTrackResult');

  trackBtn.addEventListener('click', function() {
    var query = trackInput.value.trim();
    if (!query) {
      trackResult.hidden = false;
      trackResult.innerHTML = '<div class="shipping-track-card shipping-track-card--error"><p>Please enter an Order ID to track.</p></div>';
      return;
    }

    var orders = getOrders();
    var match = null;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].orderId.toLowerCase() === query.toLowerCase()) {
        match = orders[i];
        break;
      }
    }

    trackResult.hidden = false;

    if (!match) {
      trackResult.innerHTML = '<div class="shipping-track-card shipping-track-card--error">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' +
        '<p>No order found for "<strong>' + escapeHtml(query) + '</strong>". Please check the ID and try again.</p>' +
        '</div>';
      return;
    }

    var statusClass = 'shipping-status--' + match.status.replace(/\s/g, '-').toLowerCase();
    var steps = ['Order Placed', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered'];
    var currentStep = getStepIndex(match.status);

    trackResult.innerHTML = '<div class="shipping-track-card">' +
      '<div class="shipping-track-card__header">' +
        '<div><strong>Order ID:</strong> ' + escapeHtml(match.orderId) + '</div>' +
        '<span class="shipping-status ' + statusClass + '">' + escapeHtml(match.status) + '</span>' +
      '</div>' +
      '<div class="shipping-track-card__body">' +
        '<div><strong>Items:</strong> ' + escapeHtml(match.items) + '</div>' +
        '<div><strong>Zone:</strong> ' + escapeHtml(match.zone) + '</div>' +
        '<div><strong>Shipping:</strong> ' + escapeHtml(match.shippingCost) + '</div>' +
        '<div><strong>Est. Delivery:</strong> ' + escapeHtml(match.estimatedDelivery) + '</div>' +
        '<div><strong>Ordered:</strong> ' + escapeHtml(match.date) + '</div>' +
      '</div>' +
      '<div class="shipping-track-timeline">' +
        steps.map(function(step, i) {
          var done = i <= currentStep ? 'timeline-step--done' : '';
          var active = i === currentStep ? 'timeline-step--active' : '';
          return '<div class="timeline-step ' + done + ' ' + active + '">' +
            '<div class="timeline-dot"></div>' +
            '<span>' + step + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  });

  trackInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') trackBtn.click();
  });

  function getStepIndex(status) {
    var map = {
      'Order Placed': 0,
      'Processing': 1,
      'Dispatched': 2,
      'Out for Delivery': 3,
      'Delivered': 4
    };
    return typeof map[status] !== 'undefined' ? map[status] : 0;
  }

  // ========== Demo: Generate sample order if cart has items ==========
  // Check if there's a recent checkout that hasn't been recorded yet
  function checkForNewOrder() {
    var cart = [];
    try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e) { /* empty */ }

    var lastCheckout = localStorage.getItem('peakpurecowmilk_last_checkout');
    if (lastCheckout) {
      var orders = getOrders();
      // Avoid duplicates
      var alreadyExists = orders.some(function(o) { return o.checkoutId === lastCheckout; });
      if (!alreadyExists) {
        var checkoutData = {};
        try { checkoutData = JSON.parse(lastCheckout); } catch(e) { return; }

        var now = new Date();
        var est = new Date(now.getTime() + (checkoutData.zone === 1 ? 0 : checkoutData.zone === 2 ? 86400000 : 172800000));

        orders.unshift({
          orderId: checkoutData.orderId || generateOrderId(),
          items: checkoutData.items || 'Mixed Dairy Products',
          zone: 'Zone ' + (checkoutData.zone || 1),
          shippingCost: checkoutData.shippingCost || 'Free',
          status: 'Order Placed',
          estimatedDelivery: est.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          checkoutId: lastCheckout
        });

        saveOrders(orders);
      }
    }
  }

  function generateOrderId() {
    var d = new Date();
    var dateStr = d.getFullYear().toString() +
      ('0' + (d.getMonth()+1)).slice(-2) +
      ('0' + d.getDate()).slice(-2);
    var rand = Math.floor(1000 + Math.random() * 9000);
    return 'ORD-' + dateStr + '-' + rand;
  }

  // ========== Delivery Estimator (zone card interaction) ==========
  var zoneCards = document.querySelectorAll('.shipping-zone');
  zoneCards.forEach(function(card) {
    card.addEventListener('click', function() {
      zoneCards.forEach(function(c) { c.classList.remove('shipping-zone--selected'); });
      this.classList.add('shipping-zone--selected');
    });
  });

  // ========== Init ==========
  checkForNewOrder();
  renderTable();
});
