// ====== Returns Page Logic ======
document.addEventListener('DOMContentLoaded', function() {
  var STORAGE_KEY = 'peakpurecowmilk_returns';

  // --- Load existing returns ---
  function getReturns() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveReturns(returns) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
  }

  function generateReturnId() {
    var d = new Date();
    var dateStr = d.getFullYear().toString() +
      ('0' + (d.getMonth()+1)).slice(-2) +
      ('0' + d.getDate()).slice(-2);
    var rand = Math.floor(1000 + Math.random() * 9000);
    return 'RET-' + dateStr + '-' + rand;
  }

  // --- Render table ---
  function renderTable() {
    var returns = getReturns();
    var tbody = document.getElementById('returnsTableBody');
    var empty = document.getElementById('returnsEmpty');

    if (returns.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = returns.map(function(r) {
      var statusClass = 'returns-status--' + r.status.replace(/\s/g, '-').toLowerCase();
      return '<tr>' +
        '<td><strong>' + escapeHtml(r.returnId) + '</strong></td>' +
        '<td>' + escapeHtml(r.orderId) + '</td>' +
        '<td>' + escapeHtml(r.product) + '</td>' +
        '<td>' + escapeHtml(r.reason) + '</td>' +
        '<td class="returns-resolution">' + escapeHtml(r.resolution) + '</td>' +
        '<td><span class="returns-status ' + statusClass + '">' + escapeHtml(r.status) + '</span></td>' +
        '<td>' + escapeHtml(r.date) + '</td>' +
      '</tr>';
    }).join('');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Form submission ---
  var form = document.getElementById('returnForm');
  var statusEl = document.getElementById('returnStatus');
  var submitBtn = form.querySelector('.returns-submit');
  var btnText = submitBtn.querySelector('.returns-submit__text');
  var btnLoading = submitBtn.querySelector('.returns-submit__loading');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var name = form.returnName.value.trim();
    var email = form.returnEmail.value.trim();
    var phone = form.returnPhone.value.trim();
    var orderId = form.returnOrder.value.trim();
    var product = form.returnProduct.value;
    var reason = form.returnReason.value;
    var details = form.returnDetails.value.trim();
    var resolution = form.querySelector('input[name="resolution"]:checked').value;

    if (!name || !email || !phone || !orderId || !product || !reason || !details) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Show loading
    btnText.hidden = true;
    btnLoading.hidden = false;
    submitBtn.disabled = true;

    setTimeout(function() {
      var returnId = generateReturnId();
      var now = new Date();
      var dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      var record = {
        returnId: returnId,
        name: name,
        email: email,
        phone: phone,
        orderId: orderId,
        product: product,
        reason: reason,
        details: details,
        resolution: resolution.charAt(0).toUpperCase() + resolution.slice(1),
        status: 'Pending',
        date: dateStr
      };

      var returns = getReturns();
      returns.unshift(record);
      saveReturns(returns);
      renderTable();

      // Reset
      btnText.hidden = false;
      btnLoading.hidden = true;
      submitBtn.disabled = false;
      form.reset();

      showStatus('Return request submitted! Your Return ID is: ' + returnId + '. We\'ll process it within 24 hours.', 'success');

      // Scroll to records
      document.querySelector('.returns-records-section').scrollIntoView({ behavior: 'smooth' });
    }, 900);
  });

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.hidden = false;
    statusEl.className = 'returns-form__status returns-form__status--' + type;
    setTimeout(function() { statusEl.hidden = true; }, 10000);
  }

  // --- Track return ---
  var trackBtn = document.getElementById('trackBtn');
  var trackInput = document.getElementById('trackOrderId');
  var trackResult = document.getElementById('trackResult');

  trackBtn.addEventListener('click', function() {
    var query = trackInput.value.trim();
    if (!query) {
      trackResult.hidden = false;
      trackResult.innerHTML = '<div class="returns-track-card returns-track-card--error"><p>Please enter an Order ID or Return ID.</p></div>';
      return;
    }

    var returns = getReturns();
    var matches = returns.filter(function(r) {
      return r.orderId.toLowerCase() === query.toLowerCase() ||
             r.returnId.toLowerCase() === query.toLowerCase();
    });

    trackResult.hidden = false;

    if (matches.length === 0) {
      trackResult.innerHTML = '<div class="returns-track-card returns-track-card--error">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' +
        '<p>No return request found for "<strong>' + escapeHtml(query) + '</strong>". Please check your ID and try again.</p>' +
        '</div>';
      return;
    }

    trackResult.innerHTML = matches.map(function(r) {
      var statusClass = 'returns-status--' + r.status.replace(/\s/g, '-').toLowerCase();
      return '<div class="returns-track-card">' +
        '<div class="returns-track-card__header">' +
          '<div><strong>Return ID:</strong> ' + escapeHtml(r.returnId) + '</div>' +
          '<span class="returns-status ' + statusClass + '">' + escapeHtml(r.status) + '</span>' +
        '</div>' +
        '<div class="returns-track-card__body">' +
          '<div><strong>Order ID:</strong> ' + escapeHtml(r.orderId) + '</div>' +
          '<div><strong>Product:</strong> ' + escapeHtml(r.product) + '</div>' +
          '<div><strong>Reason:</strong> ' + escapeHtml(r.reason) + '</div>' +
          '<div><strong>Resolution:</strong> ' + escapeHtml(r.resolution) + '</div>' +
          '<div><strong>Date:</strong> ' + escapeHtml(r.date) + '</div>' +
        '</div>' +
        '<div class="returns-track-timeline">' +
          '<div class="timeline-step timeline-step--done"><div class="timeline-dot"></div><span>Submitted</span></div>' +
          '<div class="timeline-step ' + (r.status !== 'Pending' ? 'timeline-step--done' : '') + '"><div class="timeline-dot"></div><span>Under Review</span></div>' +
          '<div class="timeline-step ' + (r.status === 'Approved' || r.status === 'Completed' ? 'timeline-step--done' : '') + '"><div class="timeline-dot"></div><span>Approved</span></div>' +
          '<div class="timeline-step ' + (r.status === 'Completed' ? 'timeline-step--done' : '') + '"><div class="timeline-dot"></div><span>Completed</span></div>' +
        '</div>' +
      '</div>';
    }).join('');
  });

  trackInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') trackBtn.click();
  });

  // --- Initial render ---
  renderTable();
});
