/* ============================================================
   hub-pin.js — personal PIN sign-in for BDRV Hub pages
   ------------------------------------------------------------
   Any page can ask for a personal PIN with one call:

     HubPin.require({
       area: "calendar",                       // the area name used in the PIN Register
                                               // (or a list, e.g. ["sc-treasurer","admin"] = any one of these)
       title: "🔒 Village Calendar",
       subtitle: "This tool is for managing the Combined Village Calendar.",
       legacyPin: "5304",                      // old shared PIN — optional, for the changeover
       legacyUntil: "2026-11-30"               // last day the old shared PIN works
     }, function (person) {
       // start the page here
     });

   The PIN is checked by the PIN Manager Apps Script, never in the page.
   Once signed in, the person isn't asked again for 2 hours in that browser tab,
   on any page whose area they have access to.
   ============================================================ */
(function () {
  // Paste the PIN Manager web app URL here (Deploy > Manage deployments > copy the Web app URL)
  var PIN_SERVICE_URL = "https://script.google.com/macros/s/AKfycbz4RH5ux1yecdDf6V9Zrialm8jabfNTXWOVfpzO2vwMFMp6amniOP_FH4JwhgNeXLHK/exec";

  var SESSION_KEY   = "bdrv_pin_session";
  var NAME_KEY      = "bdrv_pin_last_name";
  var SESSION_HOURS = 2;
  var MY_PIN_PAGE   = "my-pin.html";
  var CONTACT       = "Rick, the Hub administrator";

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function niceDate(ymd) {
    return new Date(ymd + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  }
  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function readSession() {
    try {
      var s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (s && s.expires > Date.now()) return s;
    } catch (e) {}
    return null;
  }
  function writeSession(obj) {
    obj.expires = Date.now() + SESSION_HOURS * 3600 * 1000;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(obj)); } catch (e) {}
  }
  function lastName() { try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; } }
  function rememberName(n) { try { localStorage.setItem(NAME_KEY, n); } catch (e) {} }

  function post(params) {
    return fetch(PIN_SERVICE_URL, { method: "POST", body: new URLSearchParams(params) })
      .then(function (r) { return r.json(); });
  }

  var CSS = `
  #hubpin-overlay { position: fixed; inset: 0; background: #263746; z-index: 10000;
    display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 40px 16px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  .hubpin-card { width: 100%; max-width: 420px; color: #F6F2E7; text-align: center; }
  .hubpin-card h2 { color: #D4B860; font-size: 1.5em; margin: 0 0 8px; }
  .hubpin-card .hubpin-sub { color: rgba(246,242,231,0.8); font-size: 0.95em; margin: 0 0 22px; }
  .hubpin-card label { display: block; text-align: left; font-weight: 700; font-size: 0.95em; margin: 14px 0 6px; color: #F6F2E7; }
  .hubpin-card input { width: 100%; box-sizing: border-box; font-size: 1.2em; padding: 12px 14px;
    border-radius: 8px; border: 2px solid #3F4143; outline: none; color: #222; background: #fff; }
  .hubpin-card input:focus { border-color: #D4B860; }
  #hubpin-pin { letter-spacing: 0.35em; text-align: center; }
  #hubpin-go { margin-top: 20px; width: 100%; background: #D4B860; color: #263746; border: none; border-radius: 8px;
    padding: 13px; font-size: 1.1em; font-weight: 700; cursor: pointer; }
  #hubpin-go:disabled { opacity: 0.6; cursor: default; }
  #hubpin-error { color: #ffcccc; min-height: 1.4em; margin-top: 12px; font-size: 0.95em; }
  .hubpin-links { margin-top: 10px; font-size: 0.95em; }
  .hubpin-links a { color: #D4B860; font-weight: 700; }
  .hubpin-notice { margin-top: 26px; text-align: left; background: rgba(246,242,231,0.07);
    border: 1px solid #D4B860; border-radius: 10px; padding: 12px 16px; font-size: 0.93em; line-height: 1.55; }
  .hubpin-notice summary { cursor: pointer; font-weight: 700; color: #D4B860; }
  .hubpin-notice p, .hubpin-notice ol { margin: 10px 0 0; }
  .hubpin-notice ol { padding-left: 22px; }
  .hubpin-notice a { color: #D4B860; font-weight: 700; }
  #hubpin-banner { position: sticky; top: 0; z-index: 9000; background: #D4B860; color: #263746;
    padding: 10px 44px 10px 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 0.95em; font-weight: 600; line-height: 1.45; }
  #hubpin-banner a { color: #263746; text-decoration: underline; font-weight: 800; }
  #hubpin-banner button { position: absolute; right: 10px; top: 8px; background: none; border: none;
    font-size: 1.2em; cursor: pointer; color: #263746; }
  `;

  function injectStyles() {
    if (document.getElementById("hubpin-styles")) return;
    var st = document.createElement("style");
    st.id = "hubpin-styles";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // ── The changeover note ──────────────────────────────────────────────────────
  function noticeHTML(opts, retired) {
    if (!opts.legacyUntil) return "";
    var when = niceDate(opts.legacyUntil);
    var lastLine = retired
      ? "<p><b>The old shared PIN stopped working on " + when + ".</b> If you haven't set up your own PIN yet, please contact " + esc(CONTACT) + ".</p>"
      : "<p>The old shared PIN will keep working until <b>" + when + "</b>. Until then, you can still leave the name box empty and enter the shared PIN.</p>";
    return '<details class="hubpin-notice"' + (retired ? "" : " open") + '>' +
      "<summary>📣 New: your own personal PIN</summary>" +
      "<p>The Hub is moving from one shared PIN to a personal PIN for each person. " +
      "Your PIN is private — no one else can see it, not even the Hub administrator — and you can change it whenever you like.</p>" +
      "<ol>" +
        "<li>Ask " + esc(CONTACT) + " for your one-off <b>welcome code</b>.</li>" +
        '<li>Go to <a href="' + MY_PIN_PAGE + '">My PIN</a> and choose a PIN of 4 to 6 numbers.</li>' +
        "<li>From then on, sign in here with your name and your own PIN.</li>" +
      "</ol>" + lastLine + "</details>";
  }

  function showLegacyBanner(opts) {
    if (document.getElementById("hubpin-banner")) return;
    var b = document.createElement("div");
    b.id = "hubpin-banner";
    b.innerHTML = "📣 You signed in with the old shared PIN, which stops working on " + esc(niceDate(opts.legacyUntil)) +
      '. Please set up your own personal PIN — <a href="' + MY_PIN_PAGE + '">here\'s how</a>.' +
      '<button type="button" aria-label="Close">✕</button>';
    b.querySelector("button").onclick = function () { b.remove(); };
    document.body.insertBefore(b, document.body.firstChild);
  }

  // ── Main entry point ─────────────────────────────────────────────────────────
  function require(opts, onOk) {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", function () { require(opts, onOk); });
      return;
    }
    injectStyles();
    var areas = [].concat(opts.area || []).map(function (a) { return String(a).toLowerCase(); });
    function hasArea(list) { return areas.some(function (a) { return (list || []).indexOf(a) !== -1; }); }
    var retired = !!(opts.legacyUntil && todayStr() > opts.legacyUntil);

    // Already signed in during this visit?
    var s = readSession();
    if (s && hasArea(s.areas) && !(s.legacy && retired)) {
      if (s.legacy) showLegacyBanner(opts);
      onOk({ name: s.name, legacy: !!s.legacy, token: s.token || "" });
      return;
    }

    var ov = document.createElement("div");
    ov.id = "hubpin-overlay";
    ov.innerHTML =
      '<div class="hubpin-card">' +
        "<h2>" + esc(opts.title || "🔒 Members only") + "</h2>" +
        '<p class="hubpin-sub">' + esc(opts.subtitle || "Please sign in with your name and your own PIN.") + "</p>" +
        '<label for="hubpin-name">Your name</label>' +
        '<input id="hubpin-name" autocomplete="username" placeholder="e.g. Kathy" value="' + esc(lastName()) + '">' +
        '<label for="hubpin-pin">Your PIN</label>' +
        '<input id="hubpin-pin" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password" placeholder="••••">' +
        '<button type="button" id="hubpin-go">Sign in</button>' +
        '<div id="hubpin-error"></div>' +
        '<div class="hubpin-links"><a href="' + MY_PIN_PAGE + '">Set up or change my PIN</a></div>' +
        noticeHTML(opts, retired) +
      "</div>";
    document.body.appendChild(ov);

    var nameEl = document.getElementById("hubpin-name");
    var pinEl  = document.getElementById("hubpin-pin");
    var btn    = document.getElementById("hubpin-go");
    var errEl  = document.getElementById("hubpin-error");
    (nameEl.value ? pinEl : nameEl).focus();

    function fail(msg) {
      errEl.textContent = msg;
      btn.disabled = false;
      btn.textContent = "Sign in";
      pinEl.value = "";
      pinEl.focus();
    }
    function finish(person) {
      ov.remove();
      if (person.legacy) showLegacyBanner(opts);
      onOk(person);
    }

    function attempt() {
      var name = nameEl.value.trim();
      var pin  = pinEl.value.trim();
      errEl.textContent = "";
      if (!pin) { fail("Please enter your PIN."); return; }

      if (!name) {
        // The old shared PIN, during the changeover only
        if (opts.legacyPin && pin === String(opts.legacyPin)) {
          if (retired) { fail("The old shared PIN has now been retired. Please enter your name and your own PIN."); return; }
          writeSession({ name: "", areas: areas, legacy: true });
          finish({ name: "", legacy: true });
          return;
        }
        fail("Please enter your name as well as your PIN.");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Checking…";
      post({ action: "verify", name: name, pin: pin, area: areas.join(",") }).then(function (res) {
        if (!res.success) { fail(res.error || "That didn't work. Please try again."); return; }
        rememberName(res.name);
        writeSession({ name: res.name, areas: res.areas || areas, token: res.token || "" });
        finish({ name: res.name, legacy: false, token: res.token || "" });
      }).catch(function () {
        fail("Couldn't reach the PIN service. Please check your internet connection and try again.");
      });
    }

    btn.onclick = attempt;
    nameEl.addEventListener("keydown", function (e) { if (e.key === "Enter") pinEl.focus(); });
    pinEl.addEventListener("keydown", function (e) { if (e.key === "Enter") attempt(); });
  }

  function signOut() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    location.reload();
  }

  window.HubPin = { require: require, post: post, signOut: signOut, current: readSession };
})();
