/* ===================================================
   PeakPureCow Milk — Security Utilities
   Shared module: hashing, sanitization, rate limiting
   =================================================== */
"use strict";

const PPC_Security = (function () {

  // ─── Input Sanitization (XSS Prevention) ───
  const _entityMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;", "`": "&#96;" };

  function sanitize(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>"'`/]/g, (ch) => _entityMap[ch]);
  }

  function sanitizeTrim(str) {
    return sanitize((str || "").trim());
  }

  // ─── Password Hashing (SHA-256 + Salt via Web Crypto) ───
  function generateSalt(length) {
    const array = new Uint8Array(length || 16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(salt + password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // ─── Rate Limiting & Account Lockout ───
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  const ATTEMPT_WINDOW = 10 * 60 * 1000;   // 10-minute window for counting attempts

  function _getAttempts() {
    try {
      return JSON.parse(localStorage.getItem("ppc_login_attempts") || "{}");
    } catch { return {}; }
  }

  function _setAttempts(data) {
    localStorage.setItem("ppc_login_attempts", JSON.stringify(data));
  }

  function isLockedOut(email) {
    const key = (email || "").toLowerCase();
    const attempts = _getAttempts();
    const record = attempts[key];
    if (!record) return false;
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      return true;
    }
    // Clear expired lockout
    if (record.lockedUntil && Date.now() >= record.lockedUntil) {
      delete attempts[key];
      _setAttempts(attempts);
    }
    return false;
  }

  function getLockoutRemaining(email) {
    const key = (email || "").toLowerCase();
    const record = _getAttempts()[key];
    if (!record || !record.lockedUntil) return 0;
    return Math.max(0, Math.ceil((record.lockedUntil - Date.now()) / 1000));
  }

  function recordFailedAttempt(email) {
    const key = (email || "").toLowerCase();
    const attempts = _getAttempts();
    const now = Date.now();

    if (!attempts[key]) {
      attempts[key] = { count: 0, timestamps: [] };
    }

    // Prune old timestamps outside the attempt window
    attempts[key].timestamps = (attempts[key].timestamps || []).filter(
      (t) => now - t < ATTEMPT_WINDOW
    );
    attempts[key].timestamps.push(now);
    attempts[key].count = attempts[key].timestamps.length;

    if (attempts[key].count >= MAX_ATTEMPTS) {
      attempts[key].lockedUntil = now + LOCKOUT_DURATION;
    }

    _setAttempts(attempts);
    return {
      remaining: MAX_ATTEMPTS - attempts[key].count,
      locked: attempts[key].count >= MAX_ATTEMPTS,
    };
  }

  function clearAttempts(email) {
    const key = (email || "").toLowerCase();
    const attempts = _getAttempts();
    delete attempts[key];
    _setAttempts(attempts);
  }

  // ─── Session Security ───
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes idle timeout

  function refreshSession() {
    sessionStorage.setItem("ppc_session_ts", Date.now().toString());
  }

  function isSessionExpired() {
    const ts = parseInt(sessionStorage.getItem("ppc_session_ts") || "0", 10);
    if (!ts) return false; // no timestamp yet = fresh session
    return Date.now() - ts > SESSION_TIMEOUT;
  }

  // ─── Password Policy Validation ───
  function validatePasswordPolicy(password) {
    const issues = [];
    if (password.length < 8) issues.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) issues.push("One uppercase letter");
    if (!/[a-z]/.test(password)) issues.push("One lowercase letter");
    if (!/[0-9]/.test(password)) issues.push("One number");
    if (!/[^A-Za-z0-9]/.test(password)) issues.push("One special character");
    return { valid: issues.length === 0, issues };
  }

  // ─── Migrate Legacy Plaintext Passwords ───
  async function migrateUser(user, plaintextPassword) {
    const salt = generateSalt();
    const hashedPassword = await hashPassword(plaintextPassword, salt);
    user.salt = salt;
    user.password = hashedPassword;
    user._migrated = true;
    return user;
  }

  // ─── Public API ───
  return {
    sanitize,
    sanitizeTrim,
    generateSalt,
    hashPassword,
    isLockedOut,
    getLockoutRemaining,
    recordFailedAttempt,
    clearAttempts,
    refreshSession,
    isSessionExpired,
    validatePasswordPolicy,
    migrateUser,
    MAX_ATTEMPTS,
  };

})();
