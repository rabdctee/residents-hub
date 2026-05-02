/* ============================================================
   sidebar.js — Shared Navigation Sidebar
   Bridgeman Downs Residents' Hub
   ============================================================
   Drop this script into any Hub page:
     <script src="sidebar.js"></script>
   Place it just inside <body>, before any other content.
   The script injects the sidebar CSS and HTML automatically.
   The current page is highlighted based on the filename.
   ============================================================ */

(function () {

  // ── CLEAN UP LITERAL \n TEXT ────────────────────────────────
  // VS Code find-and-replace without regex mode inserts a literal \n
  // character instead of a real line break. This removes it immediately.
  function cleanLiteralNewline() {
    var nodes = document.body ? document.body.childNodes : [];
    for (var i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].nodeType === 3 && nodes[i].nodeValue === '\\n') {
        nodes[i].parentNode.removeChild(nodes[i]);
      }
    }
  }
  // Run immediately and again after DOM is ready
  cleanLiteralNewline();
  document.addEventListener('DOMContentLoaded', cleanLiteralNewline);

  // ── CSS ────────────────────────────────────────────────────
  var css = `
    /* Sidebar layout wrapper */
    .hub-wrapper {
      display: flex;
      align-items: flex-start;
      width: 100%;
      background: white;
    }
    .hub-sidebar {
      width: 210px;
      flex-shrink: 0;
      padding: 14px 10px;
      border-right: 2px solid #c5d8ee;
      background: white;
      align-self: stretch;
    }
    .hub-main {
      flex: 1;
      min-width: 0;
    }

    /* Sidebar card */
    .sb-section {
      background: white;
      border: 1px solid #c5d8ee;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .sb-heading {
      background: #1F4E79;
      color: #C9A44A;
      font-size: 0.72em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 9px 12px;
      line-height: 1.5;
    }

    /* Sidebar links */
    .sb-links { list-style: none; }
    .sb-links li a {
      display: block;
      padding: 9px 12px;
      font-size: 0.88em;
      color: #1F4E79;
      border-bottom: 1px solid #eef0f3;
      transition: background 0.15s;
      text-decoration: none;
    }
    .sb-links li:last-child a { border-bottom: none; }
    .sb-links li a:hover    { background: #E7F1FB; font-weight: 600; }
    .sb-links li a.sb-active { background: #E7F1FB; font-weight: 700; color: #1F4E79; }
    .sb-links li a.sb-lock  { color: #7a5200; background: #fffdf5; }
    .sb-links li a.sb-lock:hover { background: #fff3cc; }

    /* Accordion headers */
    .sb-acc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 12px;
      cursor: pointer;
      font-size: 0.88em;
      font-weight: 600;
      color: #1F4E79;
      border-bottom: 1px solid #eef0f3;
      background: white;
      transition: background 0.15s;
      user-select: none;
    }
    .sb-acc-header:hover,
    .sb-acc-header.open { background: #E7F1FB; }
    .sb-acc-arrow {
      font-size: 0.6em;
      color: #aaa;
      transition: transform 0.2s;
      margin-left: 4px;
      flex-shrink: 0;
    }
    .sb-acc-header.open .sb-acc-arrow { transform: rotate(180deg); }

    /* Accordion bodies */
    .sb-acc-body { display: none; }
    .sb-acc-body.open { display: block; }
    .sb-acc-body .sb-links li a {
      padding-left: 20px;
      font-size: 0.84em;
      color: #444;
    }
    .sb-acc-body .sb-links li a:hover {
      background: #E7F1FB;
      color: #1F4E79;
      font-weight: 600;
    }
    .sb-acc-body .sb-links li a.sb-active {
      background: #E7F1FB;
      color: #1F4E79;
      font-weight: 700;
    }

    /* Hub footer */
    .hub-footer {
      background: #f8f9fa;
      padding: 16px 30px;
      text-align: center;
      color: #5f6368;
      border-top: 1px solid #e0e0e0;
      font-size: 0.85em;
      width: 100%;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .hub-sidebar { width: 185px; }
    }
    @media (max-width: 768px) {
      .hub-wrapper   { flex-direction: column; }
      .hub-sidebar   {
        width: 100%;
        border-right: none;
        border-bottom: 2px solid #c5d8ee;
        align-self: auto;
      }
    }
  `;

  // ── INJECT CSS ─────────────────────────────────────────────
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── DETERMINE CURRENT PAGE ─────────────────────────────────
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  // Handle index.html called as just "/" or ""
  if (currentPage === '' || currentPage === '/') currentPage = 'index.html';

  function isActive(href) {
    if (!href) return false;
    var page = href.split('/').pop();
    return page === currentPage;
  }

  function link(href, label, extraClass) {
    var cls = 'sb-links-a';
    if (isActive(href)) cls += ' sb-active';
    if (extraClass)     cls += ' ' + extraClass;
    return '<li><a href="' + href + '"' +
      (cls.trim() ? ' class="' + cls.trim() + '"' : '') +
      '>' + label + '</a></li>';
  }

  // ── BUILD SIDEBAR HTML ─────────────────────────────────────
  // Determine which accordion group should auto-open
  var communityPages = ['concerts.html','savings.html','info-sessions.html',
                        'memories.html','community-life.html','village-map.html'];
  var newsPages      = ['news.html','activities.html'];
  var infoPages      = ['useful-links.html','how-to.html','contacts.html'];

  var openNews      = newsPages.some(isActive)      ? ' open' : '';
  var openCommunity = communityPages.some(isActive)  ? ' open' : '';
  var openInfo      = infoPages.some(isActive)       ? ' open' : '';

  var sidebarHTML = `
    <aside class="hub-sidebar" id="hubSidebar">
      <div class="sb-section">
        <div class="sb-heading">
          Click a <span style="font-size:1.1em;">&#9660;</span> arrow to see what's here
        </div>

        <!-- Home — always visible -->
        <ul class="sb-links">
          <li><a href="index.html"${isActive('index.html') ? ' class="sb-active"' : ''}>🏠 Home</a></li>
        </ul>

        <!-- News & Events -->
        <div class="sb-acc-header${openNews}" onclick="sbToggle('sba-news')">
          📰 News &amp; Events <span class="sb-acc-arrow">▼</span>
        </div>
        <div class="sb-acc-body${openNews}" id="sba-news">
          <ul class="sb-links">
            <li><a href="news.html"${isActive('news.html') ? ' class="sb-active"' : ''}>📰 Village News</a></li>
            <li><a href="activities.html"${isActive('activities.html') ? ' class="sb-active"' : ''}>🎯 Activities</a></li>
          </ul>
        </div>

        <!-- Community -->
        <div class="sb-acc-header${openCommunity}" onclick="sbToggle('sba-community')">
          🌺 Community <span class="sb-acc-arrow">▼</span>
        </div>
        <div class="sb-acc-body${openCommunity}" id="sba-community">
          <ul class="sb-links">
            <li><a href="concerts.html"${isActive('concerts.html') ? ' class="sb-active"' : ''}>🎵 City Hall Concerts</a></li>
            <li><a href="savings.html"${isActive('savings.html') ? ' class="sb-active"' : ''}>🛒 Best Buys</a></li>
            <li><a href="info-sessions.html"${isActive('info-sessions.html') ? ' class="sb-active"' : ''}>🎓 Information Sessions</a></li>
            <li><a href="memories.html"${isActive('memories.html') ? ' class="sb-active"' : ''}>🕰️ Down Memory Lane</a></li>
            <li><a href="community-life.html"${isActive('community-life.html') ? ' class="sb-active"' : ''}>🌺 Community Life</a></li>
            <li><a href="village-map.html"${isActive('village-map.html') ? ' class="sb-active"' : ''}>🗺️ Village Map</a></li>
          </ul>
        </div>

        <!-- Information -->
        <div class="sb-acc-header${openInfo}" onclick="sbToggle('sba-info')">
          💡 Information <span class="sb-acc-arrow">▼</span>
        </div>
        <div class="sb-acc-body${openInfo}" id="sba-info">
          <ul class="sb-links">
            <li><a href="useful-links.html"${isActive('useful-links.html') ? ' class="sb-active"' : ''}>🔗 Useful Links</a></li>
            <li><a href="how-to.html"${isActive('how-to.html') ? ' class="sb-active"' : ''}>❓ Help &amp; How To</a></li>
            <li><a href="contacts.html"${isActive('contacts.html') ? ' class="sb-active"' : ''}>📞 Contacts</a></li>
          </ul>
        </div>

        <!-- Residents Only — always visible -->
        <ul class="sb-links">
          <li><a href="community-info.html" class="sb-lock${isActive('community-info.html') ? ' sb-active' : ''}">🔒 Residents Only</a></li>
        </ul>

      </div>
    </aside>
  `;


  // Remove any stray literal \n text that may appear if regex mode was off during find-replace
  document.addEventListener('DOMContentLoaded', function() {
    document.body.childNodes.forEach(function(n) {
      if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim() === '\\n') {
        n.parentNode.removeChild(n);
      }
    });
  });

  // ── WRAP PAGE CONTENT IN hub-wrapper ──────────────────────
  // Find the body's first meaningful child after header/breadcrumbs
  // Strategy: wrap everything in body inside hub-wrapper > sidebar + hub-main
  document.addEventListener('DOMContentLoaded', function () {

    var body = document.body;

    // Create wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'hub-wrapper';

    // Create sidebar
    var sidebarDiv = document.createElement('div');
    sidebarDiv.innerHTML = sidebarHTML.trim();
    var aside = sidebarDiv.firstChild;

    // Create main content div
    var mainDiv = document.createElement('div');
    mainDiv.className = 'hub-main';

    // Find the container that holds the page content
    // Most Hub pages use .container or .page-wrapper or direct body children
    var container = document.querySelector('.container') ||
                    document.querySelector('.page-wrapper');

    if (container) {
      // Insert wrapper before the container
      container.parentNode.insertBefore(wrapper, container);
      wrapper.appendChild(aside);
      wrapper.appendChild(mainDiv);
      mainDiv.appendChild(container);
    } else {
      // Fallback: wrap all body children
      var children = Array.from(body.childNodes);
      body.appendChild(wrapper);
      wrapper.appendChild(aside);
      wrapper.appendChild(mainDiv);
      children.forEach(function (child) {
        if (child !== wrapper) mainDiv.appendChild(child);
      });
    }
  });

  // ── ACCORDION TOGGLE ──────────────────────────────────────
  window.sbToggle = function (id) {
    var body   = document.getElementById(id);
    if (!body) return;
    var header = body.previousElementSibling;
    var isOpen = body.classList.contains('open');
    // Close all
    document.querySelectorAll('.sb-acc-body').forEach(function (b) {
      b.classList.remove('open');
    });
    document.querySelectorAll('.sb-acc-header').forEach(function (h) {
      h.classList.remove('open');
    });
    // Open clicked (unless already open)
    if (!isOpen) {
      body.classList.add('open');
      if (header) header.classList.add('open');
    }
  };

})();
