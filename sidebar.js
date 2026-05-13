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
      width: 230px;
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
      font-size: 0.68em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 9px 12px;
      line-height: 1.5;
    }

    /* Sidebar links */
    .sb-links { list-style: none; }
    .sb-links li a {
      display: block;
      padding: 8px 12px;
      font-size: 15px;
      color: #1F4E79;
      border-bottom: 1px solid #eef0f3;
      transition: background 0.15s;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sb-links li:last-child a { border-bottom: none; }
    .sb-links li a:hover    { background: #E7F1FB; font-weight: 600; }
    .sb-links li a.sb-active { background: #ddeef8; font-weight: 700; color: #1F4E79; border-left: 3px solid #1F4E79; padding-left: 9px; }
    .sb-links li a.sb-active:hover { background: #c5d8ee; }
    .sb-links li a.sb-lock  { color: #7a5200; background: #fffdf5; }
    .sb-links li a.sb-lock:hover { background: #fff3cc; }

    /* Accordion headers */
    .sb-acc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 700;
      color: #1F4E79;
      border-bottom: 1px solid #eef0f3;
      background: white;
      transition: background 0.15s;
      user-select: none;
      white-space: nowrap;
    }
    .sb-acc-header:hover,
    .sb-acc-header.open { background: #E7F1FB; }
    .sb-acc-header.open { border-left: 3px solid #1F4E79; padding-left: 9px; }
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
    .sb-acc-body.open {
      display: block;
      background: #f8fafc;
      border-bottom: 1px solid #c5d8ee;
    }
    .sb-acc-body .sb-links li a {
      padding-left: 22px;
      font-size: 13px;
      color: #444;
      border-bottom: 1px solid #eef0f3;
    }
    .sb-acc-body .sb-links li:last-child a { border-bottom: none; }
    .sb-acc-body .sb-links li a:hover {
      background: #E7F1FB;
      color: #1F4E79;
      font-weight: 600;
    }
    .sb-acc-body .sb-links li a.sb-active {
      background: #ddeef8;
      color: #1F4E79;
      font-weight: 700;
      border-left: 3px solid #1F4E79;
      padding-left: 19px;
    }

    /* Breadcrumb bar */
    .sb-breadcrumb {
      background: #E7F1FB;
      border-bottom: 2px solid #c5d8ee;
      padding: 10px 22px;
      font-size: 0.82em;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .sb-breadcrumb a {
      color: #1F4E79;
      text-decoration: none;
      font-weight: 700;
      background: white;
      border: 1px solid #c5d8ee;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 0.95em;
      transition: all 0.15s;
    }
    .sb-breadcrumb a:hover { background: #1F4E79; color: white; }
    .sb-breadcrumb span { color: #aaa; font-size: 0.9em; }
    .sb-breadcrumb strong { color: #444; font-weight: 600; }

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
      .hub-sidebar { width: 200px; }
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

    /* ===== Collapsible Sidebar ===== */
    .hub-wrapper {
      position: relative;
    }
    .hub-sidebar {
      transition: width 0.3s ease, min-width 0.3s ease, padding 0.3s ease;
      overflow: hidden;
    }

    /* Toggle button — always visible, anchored between sidebar and main content */
    .sidebar-toggle {
      position: absolute;
      top: 20px;
      left: 212px;
      z-index: 200;
      width: 36px;
      height: 36px;
      background: #1F4E79;
      color: white;
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: background 0.2s, left 0.3s ease;
      line-height: 1;
    }
    .sidebar-toggle:hover { background: #163d60; }

    /* Arrow rotates when collapsed */
    .sidebar-toggle .sb-toggle-arrow {
      display: inline-block;
      transition: transform 0.3s ease;
    }
    /* Collapsed: arrow points right (▶) — click to expand */
    .hub-wrapper.sb-collapsed .sidebar-toggle .sb-toggle-arrow {
      transform: rotate(180deg);
    }

    /* Collapsed state — sidebar shrinks to nothing */
    .hub-wrapper.sb-collapsed .hub-sidebar {
      width: 0 !important;
      min-width: 0 !important;
      padding: 0 !important;
      border-right: none !important;
    }
    /* Button moves to left edge when sidebar is hidden */
    .hub-wrapper.sb-collapsed .sidebar-toggle {
      left: 0;
    }

    @media (max-width: 900px) {
      .sidebar-toggle { left: 182px; }
      .hub-wrapper.sb-collapsed .sidebar-toggle { left: 0; }
    }

    /* Mobile: sidebar stacks vertically, toggle sits below it */
    @media (max-width: 768px) {
      .hub-sidebar {
        transition: height 0.3s ease, padding 0.3s ease;
      }
      .hub-wrapper.sb-collapsed .hub-sidebar {
        width: 100% !important;
        min-width: 0 !important;
        height: 0 !important;
        padding: 0 !important;
        border-bottom: none !important;
      }
      .sidebar-toggle,
      .hub-wrapper:not(.sb-collapsed) .sidebar-toggle,
      .hub-wrapper.sb-collapsed .sidebar-toggle {
        position: relative;
        top: auto;
        left: auto;
        display: block;
        margin: 6px auto 0;
        border-radius: 20px;
        width: auto;
        height: auto;
        padding: 6px 18px;
        font-size: 13px;
      }
      /* Mobile open: arrow points up */
      .hub-wrapper:not(.sb-collapsed) .sidebar-toggle .sb-toggle-arrow {
        transform: rotate(90deg);
      }
      /* Mobile collapsed: arrow points down */
      .hub-wrapper.sb-collapsed .sidebar-toggle .sb-toggle-arrow {
        transform: rotate(270deg);
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
  var newsPages      = ['index.html'];
  var infoPages      = ['useful-links.html','how-to.html','contacts.html']; // Guides & Links

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
          <li><a href="index.html"${isActive('index.html') ? ' class="sb-active"' : ''} style="font-weight:600;" style="font-weight:600;">🏠 Home</a></li>
        </ul>

        <!-- News & Events -->
        <div class="sb-acc-header${openNews}" onclick="sbToggle('sba-news')">
          📰 News &amp; Events <span class="sb-acc-arrow">▼</span>
        </div>
        <div class="sb-acc-body${openNews}" id="sba-news">
          <ul class="sb-links">
            <li><a href="index.html" onclick="if(window.showPage){showPage('newsletter');return false;}else{window.location.href='index.html#newsletter';return false;}">📰 Village News</a></li>
            <li><a href="index.html" onclick="if(window.showPage){showPage('activity-contacts');return false;}else{window.location.href='index.html#activity-contacts';return false;}">🎯 Activities</a></li>
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
          📚 Guides &amp; Links <span class="sb-acc-arrow">▼</span>
        </div>
        <div class="sb-acc-body${openInfo}" id="sba-info">
          <ul class="sb-links">
            <li><a href="useful-links.html"${isActive('useful-links.html') ? ' class="sb-active"' : ''}>🔗 Useful Links</a></li>
            <li><a href="how-to.html"${isActive('how-to.html') ? ' class="sb-active"' : ''}>❓ Help &amp; How To</a></li>
            ${isActive('how-to.html') ? `
            <li style="background:#f0f6fc;"><a href="#group-getting-started" style="padding-left:30px;font-size:0.8em;color:#555;">🚀 Getting Started</a></li>
            <li style="background:#f0f6fc;"><a href="#group-apps-services"   style="padding-left:30px;font-size:0.8em;color:#555;">📱 Phones, TV &amp; Email</a></li>
            <li style="background:#f0f6fc;"><a href="#group-photos"          style="padding-left:30px;font-size:0.8em;color:#555;">📷 Managing Photos</a></li>
            <li style="background:#f0f6fc;"><a href="#group-home"          style="padding-left:30px;font-size:0.8em;color:#555;">🏠 Around Your Home</a></li>
            <li style="background:#f0f6fc;"><a href="#group-staying-safe"    style="padding-left:30px;font-size:0.8em;color:#555;">🔒 Staying Safe</a></li>
            <li style="background:#f0f6fc;"><a href="#group-new-tech"        style="padding-left:30px;font-size:0.8em;color:#555;">🤖 New Technology</a></li>
            ` : ''}
            <li><a href="index.html" onclick="if(window.showPage){showPage('contact');return false;}else{window.location.href='index.html?page=contact';return false;}"${isActive('contacts.html') ? ' class="sb-active"' : ''}>📞 Contacts</a></li>
            <li><a href="index.html" onclick="if(window.showPage){showPage('about');return false;}else{window.location.href='index.html?page=about';return false;">📖 About This Website</a></li>
          </ul>
        </div>

        <!-- Residents Only — always visible -->
        <ul class="sb-links">
          <li><a href="community-info.html" class="sb-lock${isActive('community-info.html') ? ' sb-active' : ''}" style="font-weight:600;">🔒 Residents Only</a></li>
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
    // Find the main page container
    var container = document.querySelector('.container');
    
    // If page-wrapper is inside container, use container
    // If page-wrapper is standalone, use it
    if (!container) {
      container = document.querySelector('.page-wrapper');
    }

    if (container) {
      // Insert hub-wrapper before the container, move container inside hub-main
      container.parentNode.insertBefore(wrapper, container);
      wrapper.appendChild(aside);
      wrapper.appendChild(mainDiv);
      mainDiv.appendChild(container);
      // Inject toggle button as direct child of hub-wrapper (never clipped by sidebar or content)
      var toggleBtn = document.createElement('button');
      toggleBtn.className = 'sidebar-toggle';
      toggleBtn.id = 'sidebarToggleBtn';
      toggleBtn.onclick = sbToggleSidebar;
      toggleBtn.title = 'Show/hide sidebar';
      toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
      toggleBtn.innerHTML = '<span class="sb-toggle-arrow">&#9664;</span>';
      wrapper.appendChild(toggleBtn);
    } else {
      // Fallback: wrap all direct body children except scripts
      var children = Array.from(body.childNodes).filter(function(n) {
        return !(n.nodeName === 'SCRIPT');
      });
      body.appendChild(wrapper);
      wrapper.appendChild(aside);
      wrapper.appendChild(mainDiv);
      children.forEach(function (child) {
        mainDiv.appendChild(child);
      });
      // Inject toggle button as direct child of hub-wrapper
      var toggleBtn2 = document.createElement('button');
      toggleBtn2.className = 'sidebar-toggle';
      toggleBtn2.id = 'sidebarToggleBtn';
      toggleBtn2.onclick = sbToggleSidebar;
      toggleBtn2.title = 'Show/hide sidebar';
      toggleBtn2.setAttribute('aria-label', 'Toggle sidebar');
      toggleBtn2.innerHTML = '<span class="sb-toggle-arrow">&#9664;</span>';
      wrapper.appendChild(toggleBtn2);
    }

    // ── INJECT BREADCRUMB BAR ──────────────────────────────
    // Add "Home › Page Name" bar after header, inside hub-main
    // Only add if one doesn't already exist
    if (!document.querySelector('.sb-breadcrumb')) {
      var header = document.querySelector('header');
      if (header) {
        // Get page title from <title> tag, stripping " | Bridgeman Downs..."
        var titleFull  = document.title || '';
        var pageTitle  = titleFull.split('|')[0].trim();
        // Don't show breadcrumb on home page
        if (currentPage !== 'index.html') {
          var bc = document.createElement('div');
          bc.className = 'sb-breadcrumb';
          bc.innerHTML =
            '<a href="index.html" style="font-weight:600;">🏠 Home</a>' +
            '<span>›</span>' +
            '<strong>' + pageTitle + '</strong>';
          // Insert after header inside hub-main (header is inside container/hub-main)
          if (header.nextSibling) {
            header.parentNode.insertBefore(bc, header.nextSibling);
          } else {
            header.parentNode.appendChild(bc);
          }
        }
      }
    }

  }); // end DOMContentLoaded

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


  // ── COLLAPSIBLE SIDEBAR ────────────────────────────────────
  var SB_PREF_KEY = 'bdrv_sidebar_collapsed';

  function sbInitSidebar() {
    var wrapper = document.querySelector('.hub-wrapper');
    if (!wrapper) return;
    var isMobile = window.innerWidth <= 768;
    var saved = localStorage.getItem(SB_PREF_KEY);
    var shouldCollapse = (saved !== null) ? (saved === 'true') : isMobile;
    if (shouldCollapse) {
      wrapper.classList.add('sb-collapsed');
    } else {
      wrapper.classList.remove('sb-collapsed');
    }
  }

  window.sbToggleSidebar = function () {
    var wrapper = document.querySelector('.hub-wrapper');
    if (!wrapper) return;
    var isNowCollapsed = wrapper.classList.toggle('sb-collapsed');
    localStorage.setItem(SB_PREF_KEY, isNowCollapsed ? 'true' : 'false');
  };

  // Initialise after DOM is ready (sidebar has been injected by then)
  document.addEventListener('DOMContentLoaded', sbInitSidebar);

})();
