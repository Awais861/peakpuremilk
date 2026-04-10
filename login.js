/* ===================================================
   PeakPureCow Milk — Login Page Logic
   Secure auth with hashing, rate limiting & social
   =================================================== */
"use strict";

(function () {
  // ─── DOM References ───
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const emailError = document.getElementById("loginEmailError");
  const passwordError = document.getElementById("loginPasswordError");
  const loginBtn = document.getElementById("loginBtn");
  const rememberMe = document.getElementById("rememberMe");

  // ─── Helpers ───
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // ─── Real-time Validation ───
  emailInput.addEventListener("input", () => {
    if (emailRegex.test(emailInput.value.trim())) {
      clearError(emailInput, emailError);
      markValid(emailInput);
    }
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length >= 6) {
      clearError(passwordInput, passwordError);
      markValid(passwordInput);
    }
  });

  // ─── Auto-fill remembered email ───
  const savedEmail = localStorage.getItem("ppc_remember_email");
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMe.checked = true;
  }

  // ─── Redirect if already logged in ───
  if (sessionStorage.getItem("ppc_logged_in") === "true") {
    window.location.replace("home.html");
    return;
  }

  // ─── Form Submit (async for hashing) ───
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    const email = PPC_Security.sanitizeTrim(emailInput.value);
    const password = passwordInput.value;

    // Validate email
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

    // Validate password
    if (!password) {
      showError(passwordInput, passwordError, "Password is required");
      valid = false;
    } else if (password.length < 6) {
      showError(passwordInput, passwordError, "Password must be at least 6 characters");
      valid = false;
    } else {
      clearError(passwordInput, passwordError);
      markValid(passwordInput);
    }

    if (!valid) return;

    // ─── Rate Limiting / Account Lockout Check ───
    if (PPC_Security.isLockedOut(email)) {
      const secs = PPC_Security.getLockoutRemaining(email);
      const mins = Math.ceil(secs / 60);
      showToast("Account locked. Try again in " + mins + " minute(s).", "error");
      showError(emailInput, emailError, "Too many failed attempts — account temporarily locked");
      return;
    }

    // Show loading
    loginBtn.classList.add("loading");
    loginBtn.disabled = true;

    // ─── Secure Auth Check ───
    try {
      const users = JSON.parse(localStorage.getItem("ppc_users") || "[]");
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        throw new Error("no_user");
      }

      // Social-only account (no password set)
      if (user.provider && !user.password) {
        loginBtn.classList.remove("loading");
        loginBtn.disabled = false;
        showToast("This account uses " + user.provider + " sign-in. Use the " + user.provider + " button below.", "info");
        showError(emailInput, emailError, "Please use " + user.provider + " sign-in for this account");
        return;
      }

      let matched = false;

      if (user.salt) {
        // Hashed password — compare hashes
        const hashed = await PPC_Security.hashPassword(password, user.salt);
        matched = hashed === user.password;
      } else {
        // Legacy plaintext — compare directly, then migrate
        matched = user.password === password;
        if (matched) {
          await PPC_Security.migrateUser(user, password);
          localStorage.setItem("ppc_users", JSON.stringify(users));
        }
      }

      if (matched) {
        // Clear failed attempts
        PPC_Security.clearAttempts(email);

        // Remember email
        if (rememberMe.checked) {
          localStorage.setItem("ppc_remember_email", email);
        } else {
          localStorage.removeItem("ppc_remember_email");
        }

        // Set session
        sessionStorage.setItem("ppc_logged_in", "true");
        sessionStorage.setItem("ppc_user_name", user.name);
        sessionStorage.setItem("ppc_user_email", user.email);
        PPC_Security.refreshSession();

        showToast("Welcome back, " + PPC_Security.sanitize(user.name) + "!", "success");
        setTimeout(() => {
          window.location.replace("home.html");
        }, 1200);
      } else {
        throw new Error("wrong_password");
      }
    } catch (err) {
      loginBtn.classList.remove("loading");
      loginBtn.disabled = false;

      // Record failed attempt
      const result = PPC_Security.recordFailedAttempt(email);

      if (result.locked) {
        showToast("Too many failed attempts. Account locked for 15 minutes.", "error");
        showError(passwordInput, passwordError, "Account locked — too many failed attempts");
      } else if (result.remaining <= 2) {
        showToast("Invalid credentials. " + result.remaining + " attempt(s) remaining.", "error");
        showError(passwordInput, passwordError, "Invalid email or password (" + result.remaining + " attempts left)");
      } else {
        showToast("Invalid email or password. Please try again.", "error");
        showError(passwordInput, passwordError, "Invalid email or password");
      }
    }
  });

  // ─── Forgot Password ───
  document.getElementById("forgotPwLink").addEventListener("click", (e) => {
    e.preventDefault();
    const email = PPC_Security.sanitizeTrim(emailInput.value);
    if (!email || !emailRegex.test(email)) {
      showToast("Enter your email first, then click Forgot Password", "info");
      emailInput.focus();
      return;
    }
    const users = JSON.parse(localStorage.getItem("ppc_users") || "[]");
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      // Clear lockout when password reset is requested
      PPC_Security.clearAttempts(email);
      showToast("Password reset link sent to " + PPC_Security.sanitize(email) + " (simulated)", "success");
    } else {
      showToast("No account found with that email", "error");
    }
  });

  // Social auth is now handled by social-auth.js — no stubs needed
})();
