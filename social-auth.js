/* ===================================================
   PeakPureCow Milk — Social Auth (Google + Facebook)
   Uses Google Identity Services & Facebook JS SDK
   =================================================== */
"use strict";

const PPC_SocialAuth = (function () {

  /* ┌──────────────────────────────────────────────┐
     │  IMPORTANT: Replace these with YOUR real IDs  │
     │  Google: https://console.cloud.google.com     │
     │  Facebook: https://developers.facebook.com    │
     └──────────────────────────────────────────────┘ */
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
  const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID";

  // ─── Shared: Complete social login/signup session ───
  function _completeSocialAuth(provider, profile) {
    const name = PPC_Security.sanitizeTrim(profile.name || "User");
    const email = PPC_Security.sanitizeTrim(profile.email || "");
    const picture = profile.picture || "";

    if (!email) {
      _toast("Could not retrieve your email from " + provider + ". Please try again.", "error");
      return;
    }

    // Check if user exists in local store
    let users = JSON.parse(localStorage.getItem("ppc_users") || "[]");
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Auto-register social user
      user = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: name,
        email: email,
        phone: "",
        password: null,        // social users have no password
        salt: null,
        provider: provider,    // "google" or "facebook"
        picture: picture,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem("ppc_users", JSON.stringify(users));
    } else if (!user.provider) {
      // Link social provider to existing email/password account
      user.provider = user.provider || provider;
      user.picture = user.picture || picture;
      localStorage.setItem("ppc_users", JSON.stringify(users));
    }

    // Create session
    sessionStorage.setItem("ppc_logged_in", "true");
    sessionStorage.setItem("ppc_user_name", name);
    sessionStorage.setItem("ppc_user_email", email);
    sessionStorage.setItem("ppc_user_picture", picture);
    sessionStorage.setItem("ppc_auth_provider", provider);

    if (typeof PPC_Security !== "undefined") {
      PPC_Security.refreshSession();
      PPC_Security.clearAttempts(email);
    }

    _toast("Welcome, " + name + "!", "success");
    setTimeout(function () {
      window.location.replace("home.html");
    }, 1000);
  }

  // ─── Toast shortcut ───
  function _toast(message, type) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "auth-toast auth-toast--" + type;
    toast.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      (type === "success"
        ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
        : type === "error"
        ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>') +
      "</svg> " + PPC_Security.sanitize(message);
    container.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);
  }

  // ══════════════════════════════════════════════════
  //  GOOGLE SIGN-IN  (Google Identity Services)
  // ══════════════════════════════════════════════════
  function initGoogle() {
    if (GOOGLE_CLIENT_ID.startsWith("YOUR_")) {
      console.warn("[PPC] Google Client ID not configured. Replace GOOGLE_CLIENT_ID in social-auth.js");
    }
    if (typeof google === "undefined" || !google.accounts) {
      console.warn("[PPC] Google Identity Services script not loaded");
      return;
    }
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: _handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  function _handleGoogleCredential(response) {
    try {
      // Decode the JWT credential (header.payload.signature)
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      _completeSocialAuth("google", {
        name: payload.name || payload.given_name || "Google User",
        email: payload.email,
        picture: payload.picture || "",
      });
    } catch (err) {
      console.error("[PPC] Google credential decode failed:", err);
      _toast("Google sign-in failed. Please try again.", "error");
    }
  }

  function triggerGoogleSignIn() {
    if (typeof google === "undefined" || !google.accounts) {
      _toast("Google sign-in is not available. Check your internet connection.", "error");
      return;
    }
    if (GOOGLE_CLIENT_ID.startsWith("YOUR_")) {
      _toast("Google sign-in is not configured yet. Contact the site admin.", "info");
      return;
    }
    google.accounts.id.prompt(function (notification) {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: use popup
        google.accounts.id.prompt();
      }
    });
  }

  // ══════════════════════════════════════════════════
  //  FACEBOOK LOGIN  (Facebook JS SDK)
  // ══════════════════════════════════════════════════
  function initFacebook() {
    if (FACEBOOK_APP_ID.startsWith("YOUR_")) {
      console.warn("[PPC] Facebook App ID not configured. Replace FACEBOOK_APP_ID in social-auth.js");
      return;
    }
    window.fbAsyncInit = function () {
      FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v19.0",
      });
    };
  }

  function triggerFacebookLogin() {
    if (typeof FB === "undefined") {
      _toast("Facebook login is not available. Check your internet connection.", "error");
      return;
    }
    if (FACEBOOK_APP_ID.startsWith("YOUR_")) {
      _toast("Facebook login is not configured yet. Contact the site admin.", "info");
      return;
    }
    FB.login(
      function (response) {
        if (response.authResponse) {
          FB.api("/me", { fields: "name,email,picture.type(large)" }, function (me) {
            _completeSocialAuth("facebook", {
              name: me.name || "Facebook User",
              email: me.email || "",
              picture: (me.picture && me.picture.data && me.picture.data.url) || "",
            });
          });
        } else {
          _toast("Facebook login was cancelled.", "info");
        }
      },
      { scope: "public_profile,email" }
    );
  }

  // ─── Init both on page load ───
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", _bind);
    } else {
      _bind();
    }
  }

  function _bind() {
    initGoogle();
    initFacebook();

    // Bind existing buttons
    var gBtn = document.getElementById("googleAuth");
    var fBtn = document.getElementById("facebookAuth");
    if (gBtn) {
      // Remove old listeners by cloning
      var gClone = gBtn.cloneNode(true);
      gBtn.parentNode.replaceChild(gClone, gBtn);
      gClone.addEventListener("click", triggerGoogleSignIn);
    }
    if (fBtn) {
      var fClone = fBtn.cloneNode(true);
      fBtn.parentNode.replaceChild(fClone, fBtn);
      fClone.addEventListener("click", triggerFacebookLogin);
    }
  }

  return {
    init: init,
    triggerGoogleSignIn: triggerGoogleSignIn,
    triggerFacebookLogin: triggerFacebookLogin,
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
    FACEBOOK_APP_ID: FACEBOOK_APP_ID,
  };

})();

// Auto-initialize
PPC_SocialAuth.init();
