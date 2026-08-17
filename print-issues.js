/**
 * print-issues.js
 * BDRV Issues Progress Tracker — Print / Save as PDF
 *
 * Drop a button like this anywhere on your page:
 *   <button onclick="printIssues()">🖨️ Print / Save PDF</button>
 *
 * The script fetches the live CSV, builds a fully-expanded print view
 * in a hidden iframe, then opens the browser's Print dialog so the
 * resident (or CM) can save as PDF or send to a printer.
 */

(function () {

  const SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/" +
    "2PACX-1vSgVlYaBPjGJkfQWiySdwnnr7OKJvhnVmHb3dEqLJ2o7plAgDMbjox_" +
    "-f47I1LrO3YN8Seiwru5Xmxv/pub?gid=363698576&single=true&output=csv";

  // ── Category remapping — kept identical to progress-tracker.html so a
  // printed section always matches the on-screen section of the same name ──
  const CAT_MAP = {
    "Safety & Emergency":       "Safety, Security & Emergency",
    "Security":                 "Safety, Security & Emergency",
    "Infrastructure & Maintenance": "Village Maintenance",
    "Staffing & Management":    "Village Maintenance",
    "Facilities & Amenities":   "Village Maintenance",
    "Environment & Grounds":    "Village Maintenance",
    "Administration & Finance": "Administration & Finance",
    "Initiatives":              "Initiatives",
    "Manor":                    "Manor",
    "Access":                   "Manor",
  };
  const CAT_ORDER = [
    "Safety, Security & Emergency",
    "Village Maintenance",
    "Administration & Finance",
    "Initiatives",
    "Manor",
  ];
  function normaliseCat(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }
  const CAT_MAP_LOOKUP = {};
  Object.keys(CAT_MAP).forEach(k => { CAT_MAP_LOOKUP[normaliseCat(k).toLowerCase()] = CAT_MAP[k]; });
  function mapCategory(raw) {
    const clean = normaliseCat(raw);
    return CAT_MAP_LOOKUP[clean.toLowerCase()] || clean;
  }

  /* ── Helpers ── */

  function parseCSV(text) {
    // Robust parser that handles newlines inside quoted fields
    const allRows = [];
    let cur = "", inQ = false, cols = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (inQ && text[i+1] === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (ch === ',' && !inQ) {
        cols.push(cur.trim()); cur = "";
      } else if ((ch === '\n' || (ch === '\r' && text[i+1] === '\n')) && !inQ) {
        if (ch === '\r') i++;
        cols.push(cur.trim()); cur = "";
        allRows.push(cols); cols = [];
      } else {
        cur += ch;
      }
    }
    if (cur || cols.length) { cols.push(cur.trim()); allRows.push(cols); }

    if (allRows.length < 2) return [];
    const rows = [];
    for (let i = 1; i < allRows.length; i++) {
      const c = allRows[i];
      const issueNum = c[0], category = c[1], topic = c[2],
            cmNotes  = c[3], status   = c[4], source = c[5] || "General";
      if (category && topic && status) {
        rows.push({
          issueNum: (issueNum || "").trim(),
          category: category.trim(),
          topic:    topic.trim(),
          notes:    (cmNotes || "").trim(),
          status:   status.trim(),
          source:   source.trim()
        });
      }
    }
    return rows;
  }

  function esc(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function statusLabel(s) {
    if (s === "Completed")   return "Completed";
    if (s === "In Progress") return "In Progress";
    if (s === "On Hold")     return "On Hold";
    return "Not Started";
  }

  function statusColour(s) {
    if (s === "Completed")   return { bg: "#d4edda", fg: "#155724", bd: "#28a745" };
    if (s === "In Progress") return { bg: "#ddeeff", fg: "#1F4E79", bd: "#1F4E79" };
    if (s === "On Hold")     return { bg: "#fff3cd", fg: "#7a5200", bd: "#e0a800" };
    return { bg: "#f0f0f0", fg: "#3a3a3a", bd: "#888888" };
  }

  function groupByCategory(rows) {
    const map = {};
    rows.forEach(r => {
      const group = mapCategory(r.category);
      if (!map[group]) map[group] = [];
      map[group].push(r);
    });
    const ordered = {};
    CAT_ORDER.forEach(g => { if (map[g]) ordered[g] = map[g]; });
    Object.keys(map).sort().forEach(g => { if (!ordered[g]) ordered[g] = map[g]; });
    return ordered;
  }

  function buildCountSummary(rows) {
    const c = { Completed: 0, "In Progress": 0, "On Hold": 0, "Not Started": 0 };
    rows.forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }

  /* ── Build print HTML ── */

  function buildPrintHTML(rows, filterLabel) {
    const grouped = groupByCategory(rows);
    const counts  = buildCountSummary(rows);
    const now     = new Date().toLocaleString("en-AU", {
      dateStyle: "full", timeStyle: "short"
    });

    // Summary pills
    const summaryPills = [
      { label: "Total",       n: rows.length,             bg: "#E7F1FB", fg: "#1F4E79", bd: "#1F4E79" },
      { label: "Completed",   n: counts["Completed"],     bg: "#d4edda", fg: "#155724", bd: "#28a745" },
      { label: "In Progress", n: counts["In Progress"],  bg: "#ddeeff", fg: "#1F4E79", bd: "#1F4E79" },
      { label: "Not Started", n: counts["Not Started"],  bg: "#f0f0f0", fg: "#3a3a3a", bd: "#888"    },
      { label: "On Hold",     n: counts["On Hold"],       bg: "#fff3cd", fg: "#7a5200", bd: "#e0a800" },
    ].map(p => `
      <div style="display:inline-block;margin:4px 6px 4px 0;
                  padding:8px 18px;border-radius:20px;
                  background:${p.bg};color:${p.fg};
                  border:2px solid ${p.bd};font-weight:700;font-size:14px;">
        <span style="font-size:1.3em;">${p.n}</span><br>
        <span style="font-size:0.82em;letter-spacing:0.04em;">${p.label.toUpperCase()}</span>
      </div>`).join("");

    // Category blocks
    const catBlocks = Object.entries(grouped).map(([catName, issues]) => {
      const issueRows = issues.map(issue => {
        const sc = statusColour(issue.status);
        const badgeStyle =
          `background:${sc.bg};color:${sc.fg};border:1.5px solid ${sc.bd};` +
          `padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;` +
          `white-space:nowrap;display:inline-block;`;
        const issueBadge = issue.source === "Manor"
          ? `<span style="background:#ede7f6;color:#6a1b9a;border:1.5px solid #ab47bc;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:700;margin-left:6px;">🏡 Manor</span>`
          : "";
        return `
          <tr>
            <td style="padding:10px 12px;vertical-align:top;border-bottom:1px solid #dee2e6;width:34px;
                       font-size:12px;color:#6c757d;font-weight:700;white-space:nowrap;">
              ${esc(issue.issueNum) || ""}
            </td>
            <td style="padding:10px 12px;vertical-align:top;border-bottom:1px solid #dee2e6;">
              <div style="font-weight:700;color:#1F4E79;font-size:14px;margin-bottom:4px;">
                ${esc(issue.topic)}${issueBadge}
              </div>
              ${issue.notes
                ? `<div style="color:#444;font-size:13px;line-height:1.6;white-space:pre-wrap;">${esc(issue.notes)}</div>`
                : `<div style="color:#999;font-size:12px;font-style:italic;">(No CM notes recorded)</div>`}
            </td>
            <td style="padding:10px 12px;vertical-align:top;border-bottom:1px solid #dee2e6;text-align:right;width:110px;">
              <span style="${badgeStyle}">${statusLabel(issue.status)}</span>
            </td>
          </tr>`;
      }).join("");

      return `
        <div style="border:1.5px solid #c5d8ee;border-radius:8px;margin-bottom:18px;
                    page-break-inside:avoid;overflow:hidden;">
          <div style="background:#1F4E79;color:white;padding:10px 16px;
                      font-size:15px;font-weight:700;">
            ${esc(catName)}
            <span style="font-size:12px;font-weight:400;opacity:0.85;margin-left:8px;">
              (${issues.length} issue${issues.length !== 1 ? "s" : ""})
            </span>
          </div>
          <table style="width:100%;border-collapse:collapse;background:white;">
            ${issueRows}
          </table>
        </div>`;
    }).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Issues Progress Tracker — BDRV</title>
<style>
  @page { size: A4; margin: 18mm 14mm 14mm; }
  body  { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14px; color: #1a1a1a; line-height: 1.55; margin: 0; }
  @media print {
    .no-print { display: none !important; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<!-- Letterhead -->
<div style="border-bottom:3px solid #1F4E79;padding-bottom:14px;margin-bottom:18px;">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px;">
    <div>
      <div style="font-size:22px;font-weight:700;color:#1F4E79;line-height:1.2;">
        Issues Progress Tracker
      </div>
      <div style="font-size:13px;color:#5f6368;margin-top:3px;">
        Bridgeman Downs Retirement Village — Residents Committee
        ${filterLabel ? `<span style="color:#1F4E79;font-weight:700;"> — ${esc(filterLabel)}</span>` : ""}
      </div>
    </div>
    <div style="text-align:right;font-size:12px;color:#5f6368;line-height:1.7;">
      <div style="font-weight:700;color:#1F4E79;">BDRV Residents Hub</div>
      <div>Printed: ${now}</div>
      <div>Source: Live Google Sheet</div>
    </div>
  </div>
</div>

<!-- Summary row -->
<div style="margin-bottom:20px;">
  <div style="font-size:13px;font-weight:700;color:#1F4E79;margin-bottom:8px;
              text-transform:uppercase;letter-spacing:0.05em;">Summary</div>
  ${summaryPills}
</div>

<!-- Issue categories -->
${catBlocks}

<!-- Footer -->
<div style="border-top:1px solid #c5d8ee;margin-top:24px;padding-top:10px;
            font-size:11px;color:#888;text-align:center;">
  BDRV Residents Hub · bdrv.au · Bridgeman Downs Retirement Village ·
  Residents Committee · Printed ${now}
</div>

</body>
</html>`;
  }

  /* ── Main entry point ── */

  window.printIssues = async function (btnEl, filter) {
    const orig = btnEl ? btnEl.innerHTML : null;
    if (btnEl) { btnEl.disabled = true; btnEl.innerHTML = "⏳ Loading data…"; }

    try {
      const resp = await fetch(SHEET_CSV_URL + "&cachebust=" + Date.now());
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const text = await resp.text();
      let rows = parseCSV(text);
      if (!rows.length) throw new Error("No data found in the spreadsheet.");

      const labelParts = [];
      if (filter && filter.category) {
        rows = rows.filter(r => mapCategory(r.category) === filter.category);
        labelParts.push(filter.category);
      }
      if (filter && filter.status) {
        rows = rows.filter(r => r.status === filter.status);
        labelParts.push(statusLabel(filter.status) + " only");
      }
      if (!rows.length) throw new Error("No issues match that selection to print.");

      const html = buildPrintHTML(rows, labelParts.join(" — "));

      // Open in a new window and trigger print dialog
      const win = window.open("", "_blank",
        "width=900,height=700,menubar=yes,toolbar=yes");
      if (!win) {
        alert("Your browser blocked the print window. Please allow pop-ups for this page and try again.");
        return;
      }
      win.document.write(html);
      win.document.close();
      // Small delay so the browser finishes rendering before print dialog opens
      win.onload = function () { win.focus(); win.print(); };
      // Fallback if onload already fired
      setTimeout(function () {
        try { win.focus(); win.print(); } catch(e) { /* already printed */ }
      }, 800);

    } catch (err) {
      alert("Sorry — could not load the tracker data.\n\n" + err.message);
    } finally {
      if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = orig; }
    }
  };

})();
