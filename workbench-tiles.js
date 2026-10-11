/* ════════════════════════════════════════════════════════════════════════
   WORKBENCH TILES — the one list that builds everyone's "My Workbench"
   ────────────────────────────────────────────────────────────────────────
   Each tile below says:
     • what it is (icon, title, description, buttons), and
     • roles:  which PIN Manager roles see it.
   When someone signs in, my-workbench.html shows them every tile that
   matches ANY of the roles ticked for them in the PIN Manager.
   The Hub administrator ("admin") sees every tile.

   To ADD a tile:   copy an existing one, change the words and the page,
                    and list the roles that should see it.
   To CHANGE who sees a tile: edit its roles list.
   Optional:  notFor: [...] hides a tile from people who have one of those
              roles (used where a role already has a fuller version).

   The role names are the same ones used in the PIN Manager:
     rc-chair  rc-secretary  rc-treasurer  rc-member  manor-advisor
     sc-convenor  sc-secretary  sc-treasurer  sc-events  sc-member
     calendar  community-manager  text-updates
     bc-chair  bc-manager  bc-secretary  admin

   Tiles only point the way — each page still checks the person's roles
   itself before letting them in.
   ════════════════════════════════════════════════════════════════════════ */

var RC   = ["rc-chair", "rc-secretary", "rc-treasurer", "rc-member", "manor-advisor"];
var SC   = ["sc-convenor", "sc-secretary", "sc-treasurer", "sc-events", "sc-member"];
var BC   = ["bc-chair", "bc-manager", "bc-secretary"];
var SC_FINANCE = ["sc-treasurer", "sc-convenor"];

// The groups tiles are shown under, in this order (colour = the tile's left edge)
var WORKBENCH_SECTIONS = [
  { id: "rc",        label: "🏠 Residents Committee",      colour: "#1F4E79" },
  { id: "issues",    label: "🔧 Issues",                   colour: "#c9010b" },
  { id: "events",    label: "🎉 Events & Notices",         colour: "#2e7d32" },
  { id: "finance",   label: "💰 Finance",                  colour: "#C9A44A" },
  { id: "committee", label: "📁 Committee & Documents",    colour: "#00838f" },
  { id: "resident",  label: "🏘️ Resident-Facing Content",  colour: "#1F4E79" },
  { id: "bc",        label: "🏛️ Body Corporate",           colour: "#7B1F3A" },
  { id: "comms",     label: "📧 Communication",            colour: "#6a1b9a" },
  { id: "community", label: "📚 Around the Village",       colour: "#2e7d32" },
  { id: "admin",     label: "🛠️ Hub Administration",       colour: "#6a1b9a" }
];

var WORKBENCH_TILES = [

  // ── Residents Committee ────────────────────────────────────────────────
  { section: "rc", icon: "✅", title: "RC Action Register",
    desc: "View all RC meeting actions and their progress. Add actions and update your own items.",
    roles: ["rc-chair", "rc-secretary", "rc-treasurer", "rc-member", "manor-advisor"],
    links: [["✅ Open Register", "action-register.html"]] },

  { section: "rc", icon: "📢", title: "RC Notices",
    desc: "Read the latest notices and communications from the Residents Committee.",
    roles: RC,
    links: [["📢 View Notices", "rc-notices.html"]] },

  { section: "rc", icon: "📄", title: "Meeting Documents",
    desc: "Access agendas, minutes and quarterly meeting documents.",
    roles: RC,
    links: [["📄 View Documents", "community-info.html#meetings"]] },

  { section: "rc", icon: "📬", title: "Resident Submissions",
    desc: "Concerns raised by residents — update status and add Chair notes.",
    roles: ["rc-chair"],
    links: [["📬 Open Submissions", "chair-submissions.html"]] },

  // ── Issues ─────────────────────────────────────────────────────────────
  { section: "issues", icon: "🔧", title: "Village Issues Tracker",
    desc: "See all issues raised by residents and their current progress.",
    roles: RC.concat(["community-manager"]),
    links: [["🔧 View Tracker", "progress-tracker.html"]] },

  { section: "issues", icon: "💬", title: "RC Issues Response",
    desc: "Read CM notes and add RC responses or update status.",
    roles: ["rc-chair", "rc-secretary", "rc-treasurer", "rc-member"],
    links: [["💬 RC Response", "rc-issues.html"]] },

  { section: "issues", icon: "🏡", title: "Manor Issues",
    desc: "Log, view and update issues specific to Ken Richards Manor residents.",
    roles: ["manor-advisor"],
    links: [["🏡 Manor Issues", "ken-update.html"]] },

  { section: "issues", icon: "🛠️", title: "CM Update",
    desc: "View the Issues Tracker and update CM notes and status.",
    roles: ["community-manager"],
    links: [["🛠️ CM Update", "cm-update.html"]] },

  // ── Events & Notices ───────────────────────────────────────────────────
  { section: "events", icon: "🎉", title: "What's On — Upcoming Events",
    desc: "See all upcoming events and social club programmes.",
    roles: SC,
    links: [["🎉 View Events", "index.html#events"]] },

  { section: "events", icon: "🎟️", title: "Manage Events & Registrations",
    desc: "Manage upcoming events, the What's On widget and registrations.",
    roles: ["sc-convenor", "sc-events"],
    links: [["⚙️ Manage Events", "manage-events.html"],
            ["⚙️ Manage Registrations", "manage-registrations.html"],
            ["👁 View Registrations", "view-registrations.html", "outline"]] },

  { section: "events", icon: "🎟️", title: "Event Registrations",
    desc: "Browse upcoming events, register to attend, and see who has registered.",
    roles: ["sc-secretary", "sc-member", "sc-treasurer"],
    notFor: ["sc-convenor", "sc-events"],
    links: [["🎟️ Register for Event", "register-for-event.html"],
            ["👁 View Registrations", "view-registrations.html", "outline"]] },

  { section: "events", icon: "📣", title: "Latest Announcements",
    desc: "Add, edit or remove announcements shown on the home page.",
    roles: ["sc-convenor"],
    links: [["⚙️ Manage Announcements", "manage-announcements.html"],
            ["👁 View Home Page", "index.html", "outline"]] },

  { section: "events", icon: "📋", title: "RC & SC Notices",
    desc: "Add, edit or archive the notices shown on the RC Notices page.",
    roles: ["rc-chair", "rc-secretary", "sc-convenor"],
    links: [["⚙️ Manage Notices", "rc-notices-admin.html"],
            ["👁 View Live Page", "rc-notices.html", "outline"]] },

  { section: "events", icon: "📊", title: "Surveys",
    desc: "Set up new surveys and view current survey results.",
    roles: ["sc-convenor", "rc-chair"],
    links: [["⚙️ Survey Admin", "survey-admin.html"],
            ["👁 View Surveys", "survey.html", "outline"]] },

  { section: "events", icon: "🎼", title: "Info Sessions & Concerts",
    desc: "Manage information sessions, and view City Hall concerts.",
    roles: ["sc-convenor"],
    links: [["⚙️ Manage Info Sessions", "manage-info-sessions.html"],
            ["🎓 Info Sessions", "info-sessions.html", "outline"],
            ["🎵 Concerts", "concerts.html", "outline"]] },

  { section: "events", icon: "🔥", title: "Fireside Talks",
    desc: "Manage the talks schedule and video archive, and review volunteer submissions.",
    roles: ["sc-convenor"],
    links: [["⚙️ Manage Talks", "fireside-talks-admin.html"],
            ["👁 View Live Page", "fireside-talks.html", "outline"]] },

  { section: "events", icon: "🗓️", title: "Village Calendar",
    desc: "Add, edit or remove activities — updates the Hub's calendar automatically.",
    roles: ["calendar"],
    links: [["🗓️ Manage Calendar", "facility-calendar-admin.html"],
            ["👁 View Live Page", "index.html#calendar", "outline"]] },

  { section: "events", icon: "💬", title: "Text Updates",
    desc: "Send a short text message update to residents who have opted in.",
    roles: ["text-updates", "bc-chair"],
    links: [["💬 Send Text Update", "text-updates.html"]] },

  // ── Finance ────────────────────────────────────────────────────────────
  { section: "finance", icon: "💰", title: "Record a Transaction",
    desc: "Add a new income or expense transaction for the Social Club.",
    roles: SC_FINANCE, links: [["💰 Record", "record-transaction.html"]] },

  { section: "finance", icon: "✏️", title: "Correct a Transaction",
    desc: "Amend an existing transaction that was entered incorrectly.",
    roles: SC_FINANCE, links: [["✏️ Correct", "correct-transaction.html"]] },

  { section: "finance", icon: "🗑️", title: "Delete a Transaction",
    desc: "Flag a transaction for removal from the financial records.",
    roles: SC_FINANCE, links: [["🗑️ Delete", "delete-transaction.html"]] },

  { section: "finance", icon: "📈", title: "View Transactions",
    desc: "Search and review the full transaction history.",
    roles: SC_FINANCE.concat(["rc-treasurer"]), links: [["📈 View", "view-transactions.html"]] },

  { section: "finance", icon: "🏦", title: "Update Bank Balance",
    desc: "Record the latest bank statement balance for reconciliation.",
    roles: SC_FINANCE, links: [["🏦 Update", "update-bank-balance.html"]] },

  { section: "finance", icon: "💵", title: "Update Cash On Hand",
    desc: "Enter the cash currently on hand and awaiting banking.",
    roles: SC_FINANCE, links: [["💵 Update", "update-cash-on-hand.html"]] },

  { section: "finance", icon: "🏧", title: "Upload Bank Statement",
    desc: "Upload the monthly bank statement to the document library.",
    roles: SC_FINANCE, links: [["🏧 Upload", "upload-bank-statement.html"]] },

  { section: "finance", icon: "📊", title: "Financial Dashboard",
    desc: "View the live income, expenditure and cash position summary.",
    roles: SC_FINANCE, links: [["📊 View", "view-financial-dashboard.html"]] },

  { section: "finance", icon: "🧾", title: "Financial Reports",
    desc: "View income and expenditure by category, live from the Finance sheet.",
    roles: SC_FINANCE, links: [["🧾 View", "view-financial-reports.html"]] },

  { section: "finance", icon: "🗂️", title: "Financial Reports & Bank Statements",
    desc: "View and print monthly financial reports and bank statements (PDF archive).",
    roles: SC_FINANCE, links: [["🗂️ View Reports", "community-info.html"]] },

  { section: "finance", icon: "🧾", title: "Asset Register",
    desc: "Record items bought with residents' funds, their disposal, and scheduled maintenance.",
    roles: ["sc-convenor", "sc-treasurer", "rc-chair", "rc-treasurer"],
    links: [["⚙️ Manage Assets", "asset-register-admin.html"],
            ["👁 View Residents' Page", "asset-register.html", "outline"]] },

  // ── Committee & Documents ──────────────────────────────────────────────
  { section: "committee", icon: "📤", title: "Upload a Document",
    desc: "Upload meeting minutes, reports or notices to the Hub's document library.",
    roles: ["rc-secretary", "sc-secretary", "sc-convenor", "sc-treasurer"],
    links: [["📤 Upload", "upload-document.html"]] },

  { section: "committee", icon: "✅", title: "SC Action Register",
    desc: "Social Club committee actions and their progress.",
    roles: SC,
    links: [["✅ Open SC Actions", "sc-action-register.html"]] },

  // ── Resident-Facing Content ────────────────────────────────────────────
  { section: "resident", icon: "📇", title: "Contact List",
    desc: "Review and update the residents' contact list, or view the live page.",
    roles: ["sc-convenor"],
    links: [["⚙️ Manage List", "https://docs.google.com/spreadsheets/d/1npGgVH6QhJwFXN96RpG3byEmxea5r5HhKPsfNABTH7M/edit?gid=1397639661#gid=1397639661", "", true],
            ["👁 View Live Page", "residents-contact-list.html", "outline"]] },

  { section: "resident", icon: "🏷️", title: "Classifieds",
    desc: "Review pending listings. Publish or reject submissions from residents.",
    roles: ["sc-convenor"],
    links: [["⚙️ Manage Classifieds", "classifieds-admin.html"],
            ["👁 View Live Page", "classifieds.html", "outline"]] },

  // ── Body Corporate ─────────────────────────────────────────────────────
  { section: "bc", icon: "🏛️", title: "Body Corporate Area",
    desc: "Your Body Corporate workbench and tools.",
    roles: BC,
    links: [["🏛️ Open Body Corporate", "body-corporate.html"]] },

  // ── Communication ──────────────────────────────────────────────────────
  { section: "comms", icon: "📧", title: "RC Secretary Email",
    desc: "Check rabd.secretary@gmail.com for correspondence.",
    roles: ["rc-secretary"],
    links: [["📧 Open Gmail", "https://mail.google.com/mail/u/0/#inbox?authuser=rabd.secretary@gmail.com", "", true]] },

  { section: "comms", icon: "📧", title: "RC Treasurer Email",
    desc: "Check rabd.treasurer@gmail.com for correspondence.",
    roles: ["rc-treasurer"],
    links: [["📧 Open Gmail", "https://mail.google.com/mail/u/0/#inbox?authuser=rabd.treasurer@gmail.com", "", true]] },

  { section: "comms", icon: "📧", title: "SC Convenor Email",
    desc: "Check bdsc.convenor@gmail.com for correspondence (also used for events).",
    roles: ["sc-convenor", "sc-events"],
    links: [["📧 Open Gmail", "https://mail.google.com/mail/u/0/#inbox?authuser=bdsc.convenor@gmail.com", "", true]] },

  { section: "comms", icon: "📧", title: "SC Secretary Email",
    desc: "Check bdsc.secret@gmail.com for correspondence.",
    roles: ["sc-secretary"],
    links: [["📧 Open Gmail", "https://mail.google.com/mail/u/0/#inbox?authuser=bdsc.secret@gmail.com", "", true]] },

  { section: "comms", icon: "📧", title: "SC Treasurer Email",
    desc: "Check bdsc.treas@gmail.com for correspondence.",
    roles: ["sc-treasurer"],
    links: [["📧 Open Gmail", "https://mail.google.com/mail/u/bdsc.treas@gmail.com/#inbox", "", true]] },

  // ── Around the Village ─────────────────────────────────────────────────
  { section: "community", icon: "📢", title: "Social Club News",
    desc: "Latest announcements and news from the Social Club.",
    roles: SC,
    links: [["📢 View News", "index.html#newsletter"]] },

  { section: "community", icon: "🏘️", title: "Community",
    desc: "Community life, resident stories and village history.",
    roles: ["sc-secretary", "sc-events", "sc-member"],
    links: [["🏘️ View Community Life", "community-life.html"]] },

  { section: "community", icon: "📚", title: "Guides & Links",
    desc: "Helpful guides, how-to pages and useful external links.",
    roles: ["sc-secretary", "sc-events", "sc-member"],
    links: [["📚 View Guides", "how-to.html"]] },

  // ── Hub Administration (administrator only) ────────────────────────────
  { section: "admin", icon: "🛠️", title: "Hub Admin Dashboard",
    desc: "The full administrator dashboard for the Hub.",
    roles: ["admin"],
    links: [["🛠️ Open Dashboard", "hub-admin.html"]] },

  { section: "admin", icon: "🔑", title: "PIN Manager",
    desc: "Choose who can enter each area, issue welcome codes and reset forgotten PINs.",
    roles: ["admin"],
    links: [["🔑 Manage Access", "pin-admin.html"]] }
];

// ── Daily checklist items, by role (everyone gets the items for all their roles) ──
var WORKBENCH_CHECKS = {
  "rc-secretary": ["RC Secretary email (rabd.secretary) checked", "Document uploads — anything pending?"],
  "rc-treasurer": ["RC Treasurer email (rabd.treasurer) checked", "Transaction records up to date?", "Bank balance reconciled?"],
  "sc-convenor":  ["SC Convenor email (bdsc.convenor) checked", "Document uploads — anything pending?",
                   "What's On widget — events still current?", "Latest Announcements — any updates needed?",
                   "Event Registrations — any changes?"],
  "sc-secretary": ["SC Secretary email (bdsc.secret) checked", "Document uploads — anything pending?"],
  "sc-treasurer": ["SC Treasurer email (bdsc.treas) checked", "Transaction records up to date?",
                   "Bank balance reconciled?", "Bank statement uploaded for the month?"],
  "sc-events":    ["SC Convenor email (bdsc.convenor) checked", "What's On widget — events still current?",
                   "Event Registrations — any changes?"]
};

// ── Role names as shown on the page ──
var WORKBENCH_ROLE_NAMES = {
  "rc-chair": "RC Chair", "rc-secretary": "RC Secretary", "rc-treasurer": "RC Treasurer",
  "rc-member": "RC Member", "manor-advisor": "Manor Advisor",
  "sc-convenor": "SC Convenor", "sc-secretary": "SC Secretary", "sc-treasurer": "SC Treasurer",
  "sc-events": "SC Events Coordinator", "sc-member": "SC Member",
  "calendar": "Village Calendar", "community-manager": "Community Manager", "text-updates": "Text Updates",
  "bc-chair": "Body Corporate Chair", "bc-manager": "Body Corporate Manager",
  "bc-secretary": "Body Corporate Secretary", "admin": "Hub Administrator"
};
