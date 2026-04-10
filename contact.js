// ====== Contact Form Handler ======
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');
  const submitBtn = form.querySelector('.contact-submit');
  const btnText = submitBtn.querySelector('.contact-submit__text');
  const btnLoading = submitBtn.querySelector('.contact-submit__loading');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Basic validation
    const name = form.contactName.value.trim();
    const email = form.contactEmail.value.trim();
    const subject = form.contactSubject.value;
    const message = form.contactMessage.value.trim();

    if (!name || !email || !subject || !message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Show loading state
    btnText.hidden = true;
    btnLoading.hidden = false;
    submitBtn.disabled = true;

    // Simulate sending (replace with actual endpoint)
    setTimeout(function() {
      // Build mailto fallback
      const mailSubject = encodeURIComponent('[PeakPureCow Milk] ' + subject + ' from ' + name);
      const mailBody = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + (form.contactPhone.value || 'Not provided') + '\n' +
        'Subject: ' + subject + '\n\n' +
        'Message:\n' + message
      );

      // Open email client with pre-filled data
      window.location.href = 'mailto:awaisrazaattari0@gmail.com?subject=' + mailSubject + '&body=' + mailBody;

      // Reset form
      btnText.hidden = false;
      btnLoading.hidden = true;
      submitBtn.disabled = false;
      form.reset();

      showStatus('Your email client has been opened with the message. If it didn\'t open, please email us directly at awaisrazaattari0@gmail.com', 'success');
    }, 800);
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showStatus(msg, type) {
    status.textContent = msg;
    status.hidden = false;
    status.className = 'contact-form__status contact-form__status--' + type;
    setTimeout(function() { status.hidden = true; }, 8000);
  }
});
