/* ===================================================
   PeakPureCow Milk — Signup Page Logic
   Secure registration with hashing & validation
   =================================================== */
"use strict";

(function () {
  // ─── DOM References ───
  const form = document.getElementById("signupForm");
  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");
  const phoneInput = document.getElementById("signupPhone");
  const passwordInput = document.getElementById("signupPassword");
  const confirmInput = document.getElementById("signupConfirm");
  const agreeTerms = document.getElementById("agreeTerms");
  const signupBtn = document.getElementById("signupBtn");

  const nameError = document.getElementById("signupNameError");
  const emailError = document.getElementById("signupEmailError");
  const phoneError = document.getElementById("signupPhoneError");
  const passwordError = document.getElementById("signupPasswordError");
  const confirmError = document.getElementById("signupConfirmError");

  const pwStrengthEl = document.getElementById("pwStrength");
  const pwStrengthText = document.getElementById("pwStrengthText");

  // ─── Helpers ───
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\+]?[\d\s\-()]{7,15}$/;

  function showError(input, errorEl, message) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    errorEl.textContent = PPC_Security.sanitize(message);
    errorEl.classList.add("visible");
  }

  function clearError(input, errorEl) {
    input.classList.remove("is-invalid");
    errorEl.classList.remove("visible");
  }

  function markValid(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }

  function showToast(message, type) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `auth-toast auth-toast--${type}`;
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type === "success"
          ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
          : type === "error"
          ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
          : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
        }
      </svg>
      ${PPC_Security.sanitize(message)}
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ─── Password Toggle ───
  document.querySelectorAll(".form-group__toggle-pw").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      const isPassword = target.type === "password";
      target.type = isPassword ? "text" : "password";
      btn.querySelector(".eye-open").style.display = isPassword ? "none" : "block";
      btn.querySelector(".eye-closed").style.display = isPassword ? "block" : "none";
    });
  });

  // ─── Password Strength Meter ───
  function evaluateStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  passwordInput.addEventListener("input", () => {
    const pw = passwordInput.value;
    const score = evaluateStrength(pw);
    const levels = ["", "weak", "fair", "good", "strong"];
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const level = levels[score] || "";

    pwStrengthEl.dataset.level = level;
    pwStrengthText.textContent = pw.length > 0 ? labels[score] : "";

    const bars = pwStrengthEl.querySelectorAll(".pw-strength__bar");
    bars.forEach((bar, i) => {
      bar.classList.toggle("active", i < score);
    });

    if (pw.length >= 8) {
      clearError(passwordInput, passwordError);
      markValid(passwordInput);
    }
  });

  // ─── Real-time Validation ───
  nameInput.addEventListener("input", () => {
    if (nameInput.value.trim().length >= 2) {
      clearError(nameInput, nameError);
      markValid(nameInput);
    }
  });

  emailInput.addEventListener("input", () => {
    if (emailRegex.test(emailInput.value.trim())) {
      clearError(emailInput, emailError);
      markValid(emailInput);
    }
  });

  phoneInput.addEventListener("input", () => {
    const val = phoneInput.value.trim();
    if (!val || phoneRegex.test(val)) {
      clearError(phoneInput, phoneError);
      if (val) markValid(phoneInput);
    }
  });

  confirmInput.addEventListener("input", () => {
    if (confirmInput.value === passwordInput.value && confirmInput.value.length > 0) {
      clearError(confirmInput, confirmError);
      markValid(confirmInput);
    }
  });

  // ─── Redirect if already logged in ───
  if (sessionStorage.getItem("ppc_logged_in") === "true") {
    window.location.replace("home.html");
    return;
  }

  // ─── Form Submit (async for password hashing) ───
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;

    const name = PPC_Security.sanitizeTrim(nameInput.value);
    const email = PPC_Security.sanitizeTrim(emailInput.value);
    const phone = PPC_Security.sanitizeTrim(phoneInput.value);
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    // Name
    if (!name || name.length < 2) {
      showError(nameInput, nameError, "Please enter your full name (at least 2 characters)");
      valid = false;
    } else {
      clearError(nameInput, nameError);
      markValid(nameInput);
    }

    // Email
    if (!email) {
      showError(emailInput, emailError, "Email is required");
      valid = false;
    } else if (!emailRegex.test(email)) {
      showError(emailInput, emailError, "Please enter a valid email address");
      valid = false;
    } else {
      clearError(emailInput, emailError);
      markValid(emailInput);
    }

    // Phone (optional)
    if (phone && !phoneRegex.test(phone)) {
      showError(phoneInput, phoneError, "Please enter a valid phone number");
      valid = false;
    } else {
      clearError(phoneInput, phoneError);
      if (phone) markValid(phoneInput);
    }

    // Password (strong policy enforcement)
    if (!password) {
      showError(passwordInput, passwordError, "Password is required");
      valid = false;
    } else if (password.length < 8) {
      showError(passwordInput, passwordError, "Password must be at least 8 characters");
      valid = false;
    } else {
      const policy = PPC_Security.validatePasswordPolicy(password);
      if (!policy.valid) {
        showError(passwordInput, passwordError, "Password needs: " + policy.issues.join(", "));
        valid = false;
      } else {
        clearError(passwordInput, passwordError);
        markValid(passwordInput);
      }
    }

    // Confirm
    if (!confirm) {
      showError(confirmInput, confirmError, "Please confirm your password");
      valid = false;
    } else if (confirm !== password) {
      showError(confirmInput, confirmError, "Passwords do not match");
      valid = false;
    } else {
      clearError(confirmInput, confirmError);
      markValid(confirmInput);
    }

    // Terms
    if (!agreeTerms.checked) {
      showToast("Please agree to the Terms of Service", "error");
      valid = false;
    }

    if (!valid) return;

    // Check for existing user
    const users = JSON.parse(localStorage.getItem("ppc_users") || "[]");
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      showError(emailInput, emailError, "An account with this email already exists");
      showToast("This email is already registered. Try signing in.", "error");
      return;
    }

    // Show loading
    signupBtn.classList.add("loading");
    signupBtn.disabled = true;

    // Save user with hashed password
    try {
      const salt = PPC_Security.generateSalt();
      const hashedPassword = await PPC_Security.hashPassword(password, salt);

      const newUser = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name,
        email,
        phone,
        password: hashedPassword,
        salt: salt,
        provider: null,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("ppc_users", JSON.stringify(users));

      // Auto-login
      sessionStorage.setItem("ppc_logged_in", "true");
      sessionStorage.setItem("ppc_user_name", name);
      sessionStorage.setItem("ppc_user_email", email);
      PPC_Security.refreshSession();

      showToast("Account created! Welcome, " + PPC_Security.sanitize(name) + "!", "success");
      setTimeout(() => {
        window.location.replace("home.html");
      }, 1200);
    } catch (err) {
      signupBtn.classList.remove("loading");
      signupBtn.disabled = false;
      showToast("Something went wrong. Please try again.", "error");
      console.error("[PPC] Signup error:", err);
    }
  });

  // Social auth is now handled by social-auth.js — no stubs needed
})();
