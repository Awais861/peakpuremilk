// ====== FAQ Page Logic ======
document.addEventListener('DOMContentLoaded', function () {

  // ========== Accordion ==========
  var faqItems = document.querySelectorAll('.faq-question');

  faqItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parent = this.parentElement;
      var expanded = this.getAttribute('aria-expanded') === 'true';

      // Close all
      faqItems.forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.parentElement.classList.remove('faq-item--open');
      });

      // Toggle clicked
      if (!expanded) {
        this.setAttribute('aria-expanded', 'true');
        parent.classList.add('faq-item--open');
      }
    });
  });

  // ========== Category Filter ==========
  var categoryNav = document.getElementById('faqCategoryNav');
  var categoryBtns = categoryNav.querySelectorAll('.faq-category-btn');
  var categoryGroups = document.querySelectorAll('.faq-category-group');
  var searchInput = document.getElementById('faqSearch');

  categoryBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = this.getAttribute('data-category');

      // Update active button
      categoryBtns.forEach(function (b) { b.classList.remove('faq-category-btn--active'); });
      this.classList.add('faq-category-btn--active');

      // Clear search
      searchInput.value = '';
      showAllItems();

      // Show/hide groups
      categoryGroups.forEach(function (group) {
        if (cat === 'all' || group.getAttribute('data-category') === cat) {
          group.style.display = '';
        } else {
          group.style.display = 'none';
        }
      });

      updateNoResults();
    });
  });

  // ========== Search ==========
  var noResults = document.getElementById('faqNoResults');
  var searchCount = document.getElementById('faqSearchCount');
  var allFaqItems = document.querySelectorAll('.faq-item');

  searchInput.addEventListener('input', function () {
    var query = this.value.trim().toLowerCase();

    // Reset category filter to "All"
    categoryBtns.forEach(function (b) { b.classList.remove('faq-category-btn--active'); });
    categoryNav.querySelector('[data-category="all"]').classList.add('faq-category-btn--active');
    categoryGroups.forEach(function (g) { g.style.display = ''; });

    if (!query) {
      showAllItems();
      searchCount.hidden = true;
      updateNoResults();
      return;
    }

    var visibleCount = 0;

    allFaqItems.forEach(function (item) {
      var questionText = item.querySelector('.faq-question span').textContent.toLowerCase();
      var answerText = item.querySelector('.faq-answer').textContent.toLowerCase();

      if (questionText.indexOf(query) !== -1 || answerText.indexOf(query) !== -1) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    // Hide empty category groups
    categoryGroups.forEach(function (group) {
      var visibleItems = group.querySelectorAll('.faq-item');
      var hasVisible = false;
      visibleItems.forEach(function (item) {
        if (item.style.display !== 'none') hasVisible = true;
      });
      group.style.display = hasVisible ? '' : 'none';
    });

    // Show count
    searchCount.textContent = visibleCount + ' question' + (visibleCount !== 1 ? 's' : '') + ' found';
    searchCount.hidden = false;

    updateNoResults();
  });

  function showAllItems() {
    allFaqItems.forEach(function (item) { item.style.display = ''; });
  }

  function updateNoResults() {
    var anyVisible = false;
    allFaqItems.forEach(function (item) {
      if (item.style.display !== 'none') anyVisible = true;
    });
    noResults.hidden = anyVisible;
  }

});
