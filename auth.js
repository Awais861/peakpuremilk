/* ===================================================
   PeakPureCow Milk — Auth Guard & User Badge
   Include in <head> of every protected page
   Supports: email/password, Google, Facebook users
   =================================================== */
"use strict";

(function () {
  const isLoggedIn = sessionStorage.getItem("ppc_logged_in") === "true";

  // ─── Auth Guard: redirect to login if not authenticated ───
  if (!isLoggedIn) {
    document.documentElement.style.display = "none";
    window.location.replace("login.html");
    return;
  }

  // ─── Session Timeout Check (requires security.js on protected pages) ───
  function checkSessionTimeout() {
    if (typeof PPC_Security !== "undefined" && PPC_Security.isSessionExpired()) {
      sessionStorage.removeItem("ppc_logged_in");
      sessionStorage.removeItem("ppc_user_name");
      sessionStorage.removeItem("ppc_user_email");
      sessionStorage.removeItem("ppc_user_picture");
      sessionStorage.removeItem("ppc_auth_provider");
      sessionStorage.removeItem("ppc_session_ts");
      document.documentElement.style.display = "none";
      window.location.replace("login.html");
      return true;
    }
    // Keep session alive on activity
    if (typeof PPC_Security !== "undefined") {
      PPC_Security.refreshSession();
    }
    return false;
  }

  if (checkSessionTimeout()) return;

  // Periodically check session timeout (every 60s)
  setInterval(checkSessionTimeout, 60000);

  // Refresh session on user activity
  ["click", "keydown", "scroll", "mousemove"].forEach(function (evt) {
    document.addEventListener(evt, function () {
      if (typeof PPC_Security !== "undefined") PPC_Security.refreshSession();
    }, { passive: true, once: false });
  });

  // ─── Inject User Badge into Header Navigation ───
  const userName = sessionStorage.getItem("ppc_user_name") || "User";
  const userEmail = sessionStorage.getItem("ppc_user_email") || "";
  const userPicture = sessionStorage.getItem("ppc_user_picture") || "";
  const authProvider = sessionStorage.getItem("ppc_auth_provider") || "";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  function injectUserBadge() {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    // Avatar: use social profile picture if available, else initials
    const avatarContent = userPicture
      ? '<img src="' + userPicture + '" alt="' + initials + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" referrerpolicy="no-referrer">'
      : initials;

    // Provider badge label
    const providerLabel = authProvider
      ? '<div style="font-size:0.7rem;color:var(--color-text-light);margin-top:2px;">via ' + authProvider.charAt(0).toUpperCase() + authProvider.slice(1) + '</div>'
      : '';

    const li = document.createElement("li");
    li.style.position = "relative";
    li.innerHTML = `
      <div class="user-badge" id="userBadge" tabindex="0" role="button" aria-expanded="false" aria-label="User menu">
        <div class="user-badge__avatar">${avatarContent}</div>
        <span class="user-badge__name">${userName.split(" ")[0]}</span>
        <div class="user-dropdown" id="userDropdown">
          <div style="padding: 0.7rem 1.2rem; border-bottom: 1px solid var(--color-border);">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-green-dark);">${userName}</div>
            <div style="font-size: 0.8rem; color: var(--color-text-light);">${userEmail}</div>
            ${providerLabel}
          </div>
          <button class="user-dropdown__item" id="logoutBtn" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    `;
    navLinks.appendChild(li);

    // Toggle dropdown
    const badge = document.getElementById("userBadge");
    const dropdown = document.getElementById("userDropdown");

    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("show");
      dropdown.classList.toggle("show", !isOpen);
      badge.setAttribute("aria-expanded", !isOpen);
    });

    document.addEventListener("click", () => {
      dropdown.classList.remove("show");
      badge.setAttribute("aria-expanded", "false");
    });

    // Logout — clear all session data
    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem("ppc_logged_in");
      sessionStorage.removeItem("ppc_user_name");
      sessionStorage.removeItem("ppc_user_email");
      sessionStorage.removeItem("ppc_user_picture");
      sessionStorage.removeItem("ppc_auth_provider");
      sessionStorage.removeItem("ppc_session_ts");
      window.location.replace("login.html");
    });
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectUserBadge);
  } else {
    injectUserBadge();
  }
})();
