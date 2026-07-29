(() => {
  const FILES = {
    readme: { name: "README.md", lang: "Dart" },
    packages: { name: "packages.dart", lang: "Dart" },
    apps: { name: "apps.json", lang: "JSON" },
    stack: { name: "stack.yaml", lang: "YAML" },
    ecosystem: { name: "ecosystem.links", lang: "Config" },
    contact: { name: "contact.sh", lang: "Shell" },
  };

  const LINKS = {
    site: "https://sangamadhikari.com",
    portfolio: "https://sangamadhikari.com/portfolio",
    github: "https://github.com/sawongam",
    pub: "https://pub.dev/publishers/sangamadhikari.com/packages",
    linkedin: "https://www.linkedin.com/in/sawongam",
    multi: "https://pub.dev/packages/multi_tap_action",
    bracket: "https://pub.dev/packages/tournament_bracket_kit",
    mail: "mailto:sangamadhikari.61@gmail.com",
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Boot sequence ----------
  const boot = document.getElementById("boot");
  const bootLog = document.getElementById("boot-log");
  const ide = document.getElementById("ide");

  const bootLines = [
    { t: "$ sawongam init --workspace", cls: "cmd" },
    { t: "loading persona ............. Sangam Adhikari", cls: "dim" },
    { t: "mounting packages ............ multi_tap_action, tournament_bracket_kit", cls: "dim" },
    { t: "linking primary domain ...... sangamadhikari.com", cls: "dim" },
    { t: "injecting Person schema ..... ok", cls: "ok" },
    { t: "ready. open README.md · press Ctrl/⌘K for commands", cls: "ok" },
  ];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const runBoot = async () => {
    if (!boot || !bootLog || !ide) return;
    if (reduceMotion) {
      boot.classList.add("is-done");
      ide.classList.add("is-on");
      return;
    }
    for (const line of bootLines) {
      const span = document.createElement("div");
      span.className = line.cls === "cmd" ? "cmd" : line.cls;
      if (line.cls === "cmd") span.innerHTML = `<span class="cmd">${line.t}</span>`;
      else span.textContent = line.t;
      bootLog.appendChild(span);
      await sleep(220);
    }
    await sleep(380);
    boot.classList.add("is-done");
    ide.classList.add("is-on");
    printTerm("workspace online. type <span class=\"cmd\">help</span>", "ok");
  };

  // ---------- Line numbers ----------
  const paintGutters = () => {
    document.querySelectorAll(".buf").forEach((buf) => {
      const code = buf.querySelector(".buf__code code");
      const gutter = buf.querySelector(".buf__gutter");
      if (!code || !gutter) return;
      const lines = code.textContent.split("\n").length;
      gutter.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
    });
  };

  // Make URLs in buffers clickable
  const linkifyBuffers = () => {
    document.querySelectorAll(".buf__code code").forEach((code) => {
      code.innerHTML = code.innerHTML.replace(
        /(https?:\/\/[^\s<"']+|mailto:[^\s<"']+|tel:[^\s<"']+)/g,
        (url) => `<a href="${url}" rel="noopener noreferrer" target="_blank">${url}</a>`
      );
    });
  };

  // ---------- Tabs / files ----------
  const tabsEl = document.getElementById("tabs");
  const statusFile = document.getElementById("status-file");
  const statusLn = document.getElementById("status-ln");
  let openTabs = ["readme"];
  let active = "readme";

  const renderTabs = () => {
    if (!tabsEl) return;
    tabsEl.innerHTML = "";
    openTabs.forEach((id) => {
      const meta = FILES[id];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `tab${id === active ? " is-active" : ""}`;
      btn.dataset.file = id;
      btn.innerHTML = `<span>${meta.name}</span><span class="tab__x" data-close="${id}" title="Close">×</span>`;
      tabsEl.appendChild(btn);
    });
  };

  const openFile = (id, { fromTerminal = false } = {}) => {
    if (!FILES[id]) return;
    if (!openTabs.includes(id)) openTabs.push(id);
    active = id;

    document.querySelectorAll(".tree__file").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.file === id);
    });
    document.querySelectorAll(".buf").forEach((buf) => {
      const on = buf.dataset.buf === id;
      buf.classList.toggle("is-active", on);
      buf.hidden = !on;
    });
    renderTabs();
    if (statusFile) statusFile.textContent = FILES[id].name;
    if (statusLn) statusLn.textContent = "1";
    if (fromTerminal) printTerm(`opened ${FILES[id].name}`, "dim");
  };

  tabsEl?.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (close) {
      e.stopPropagation();
      const id = close.getAttribute("data-close");
      openTabs = openTabs.filter((t) => t !== id);
      if (!openTabs.length) openTabs = ["readme"];
      openFile(openTabs.includes(active) ? active : openTabs[openTabs.length - 1]);
      return;
    }
    const tab = e.target.closest(".tab");
    if (tab?.dataset.file) openFile(tab.dataset.file);
  });

  document.querySelectorAll(".tree__file").forEach((btn) => {
    btn.addEventListener("click", () => openFile(btn.dataset.file));
  });

  // ---------- Activity panels ----------
  document.querySelectorAll(".activity__btn[data-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.dataset.panel;
      document.querySelectorAll(".activity__btn[data-panel]").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });
      document.querySelectorAll(".sidebar__panel").forEach((p) => {
        p.classList.toggle("is-active", p.dataset.panelView === panel);
      });
    });
  });

  // Git panel fake log
  const gitLog = document.getElementById("git-log");
  if (gitLog) {
    gitLog.innerHTML = [
      '<span class="ok">●</span> main · clean working tree',
      "",
      "recent:",
      "  feat: developer hub IDE shell",
      "  feat: pub packages surface",
      "  chore: wire Person schema → sangamadhikari.com",
      "",
      "remote: github.com/sawongam/sawongam.github.io",
    ].join("\n");
  }

  // Search panel
  const searchInput = document.getElementById("sidebar-search");
  const searchHits = document.getElementById("search-hits");
  const searchIndex = Object.entries(FILES).map(([id, meta]) => ({
    id,
    label: meta.name,
    hay: `${meta.name} ${meta.lang} ${id}`.toLowerCase(),
  }));

  const renderSearch = (q) => {
    if (!searchHits) return;
    const query = q.trim().toLowerCase();
    const hits = searchIndex.filter((x) => !query || x.hay.includes(query));
    searchHits.innerHTML = hits
      .map((h) => `<li data-file="${h.id}">${h.label}</li>`)
      .join("");
  };

  searchInput?.addEventListener("input", () => renderSearch(searchInput.value));
  searchHits?.addEventListener("click", (e) => {
    const li = e.target.closest("[data-file]");
    if (li) openFile(li.dataset.file);
  });
  renderSearch("");

  // ---------- Terminal ----------
  const termOut = document.getElementById("term-out");
  const termForm = document.getElementById("term-form");
  const termInput = document.getElementById("term-input");
  const history = [];
  let histIdx = -1;

  const printTerm = (html, cls = "") => {
    if (!termOut) return;
    const line = document.createElement("div");
    if (cls) line.className = cls;
    line.innerHTML = html;
    termOut.appendChild(line);
    termOut.scrollTop = termOut.scrollHeight;
  };

  const HELP = [
    ["help", "list commands"],
    ["ls", "list workspace files"],
    ["open &lt;file&gt;", "open a buffer (readme|packages|apps|…)"],
    ["pub", "open pub.dev publisher"],
    ["site", "open sangamadhikari.com"],
    ["gh", "open GitHub profile"],
    ["install multi|bracket", "copy flutter pub add …"],
    ["whoami", "print identity"],
    ["clear", "clear terminal"],
  ];

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const runCommand = async (raw) => {
    const input = raw.trim();
    if (!input) return;
    printTerm(`<span class="cmd">$ ${input}</span>`);
    history.unshift(input);
    histIdx = -1;

    const [cmd, ...args] = input.split(/\s+/);
    const a0 = (args[0] || "").toLowerCase();

    switch (cmd.toLowerCase()) {
      case "help":
      case "?":
        HELP.forEach(([c, d]) => printTerm(`  <span class="ok">${c}</span>  <span class="dim">${d}</span>`));
        break;
      case "ls":
        Object.values(FILES).forEach((f) => printTerm(`  ${f.name}`, "dim"));
        break;
      case "open":
      case "cat": {
        const key = Object.keys(FILES).find((k) => k === a0 || FILES[k].name.toLowerCase() === a0);
        if (!key) printTerm(`file not found: ${args[0] || "?"}`, "err");
        else openFile(key, { fromTerminal: true });
        break;
      }
      case "cd":
        printTerm("already in ~/sawongam", "dim");
        break;
      case "whoami":
        printTerm("Sangam Adhikari &lt;sawongam&gt; · Flutter Full-Stack · 25k+ users shipped", "ok");
        break;
      case "pub":
        printTerm(`→ <a href="${LINKS.pub}" target="_blank" rel="noopener noreferrer">${LINKS.pub}</a>`);
        window.open(LINKS.pub, "_blank", "noopener,noreferrer");
        break;
      case "site":
      case "web":
        printTerm(`→ <a href="${LINKS.site}" target="_blank" rel="noopener noreferrer">${LINKS.site}</a>`);
        window.open(LINKS.site, "_blank", "noopener,noreferrer");
        break;
      case "gh":
      case "github":
        printTerm(`→ <a href="${LINKS.github}" target="_blank" rel="noopener noreferrer">${LINKS.github}</a>`);
        window.open(LINKS.github, "_blank", "noopener,noreferrer");
        break;
      case "portfolio":
        window.open(LINKS.portfolio, "_blank", "noopener,noreferrer");
        printTerm(`→ ${LINKS.portfolio}`, "ok");
        break;
      case "mail":
      case "email":
        window.location.href = LINKS.mail;
        break;
      case "install": {
        const map = {
          multi: "flutter pub add multi_tap_action",
          multi_tap_action: "flutter pub add multi_tap_action",
          bracket: "flutter pub add tournament_bracket_kit",
          tournament_bracket_kit: "flutter pub add tournament_bracket_kit",
        };
        const line = map[a0];
        if (!line) {
          printTerm("usage: install multi | install bracket", "err");
          break;
        }
        const ok = await copyText(line);
        printTerm(ok ? `copied: ${line}` : line, "ok");
        break;
      }
      case "clear":
        if (termOut) termOut.innerHTML = "";
        break;
      case "neofetch":
      case "fetch":
        printTerm(
          [
            '<span class="ok">sawongam@github.io</span>',
            "---------------------",
            "OS: Flutter Full-Stack",
            "Host: Lalitpur, Nepal",
            "Packages: 2 (pub.dev)",
            "Users: 25000+",
            `Site: ${LINKS.site}`,
          ].join("<br>")
        );
        break;
      default:
        printTerm(`command not found: ${cmd}. try <span class="cmd">help</span>`, "err");
    }
  };

  termForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = termInput.value;
    termInput.value = "";
    runCommand(v);
  });

  termInput?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      histIdx = Math.min(histIdx + 1, history.length - 1);
      termInput.value = history[histIdx] || "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      histIdx = Math.max(histIdx - 1, -1);
      termInput.value = histIdx >= 0 ? history[histIdx] : "";
    }
  });

  // ---------- Command palette ----------
  const pal = document.getElementById("pal");
  const palInput = document.getElementById("pal-input");
  const palList = document.getElementById("pal-list");
  let palIndex = 0;

  const COMMANDS = [
    { id: "readme", label: "Open README.md", kbd: "1", run: () => openFile("readme") },
    { id: "packages", label: "Open packages.dart", kbd: "2", run: () => openFile("packages") },
    { id: "apps", label: "Open apps.json", kbd: "3", run: () => openFile("apps") },
    { id: "stack", label: "Open stack.yaml", kbd: "4", run: () => openFile("stack") },
    { id: "ecosystem", label: "Open ecosystem.links", kbd: "5", run: () => openFile("ecosystem") },
    { id: "contact", label: "Open contact.sh", kbd: "6", run: () => openFile("contact") },
    { id: "site", label: "Open sangamadhikari.com", kbd: "↵", run: () => window.open(LINKS.site, "_blank", "noopener,noreferrer") },
    { id: "pub", label: "Open pub.dev publisher", kbd: "↵", run: () => window.open(LINKS.pub, "_blank", "noopener,noreferrer") },
    { id: "gh", label: "Open GitHub", kbd: "↵", run: () => window.open(LINKS.github, "_blank", "noopener,noreferrer") },
    { id: "term-help", label: "Terminal: help", kbd: "$", run: () => { termInput?.focus(); runCommand("help"); } },
    { id: "install-m", label: "Copy: flutter pub add multi_tap_action", kbd: "$", run: () => runCommand("install multi") },
    { id: "install-b", label: "Copy: flutter pub add tournament_bracket_kit", kbd: "$", run: () => runCommand("install bracket") },
  ];

  let filtered = COMMANDS;

  const renderPal = () => {
    if (!palList) return;
    palList.innerHTML = filtered
      .map(
        (c, i) =>
          `<li class="${i === palIndex ? "is-on" : ""}" data-i="${i}"><span>${c.label}</span><span class="kbd">${c.kbd}</span></li>`
      )
      .join("");
  };

  const openPal = () => {
    if (!pal) return;
    pal.hidden = false;
    filtered = COMMANDS;
    palIndex = 0;
    if (palInput) {
      palInput.value = "";
      palInput.focus();
    }
    renderPal();
  };

  const closePal = () => {
    if (!pal) return;
    pal.hidden = true;
  };

  const runPal = (i) => {
    const cmd = filtered[i];
    if (!cmd) return;
    closePal();
    cmd.run();
  };

  document.getElementById("cmd-open")?.addEventListener("click", openPal);
  pal?.querySelector("[data-close-pal]")?.addEventListener("click", closePal);

  palInput?.addEventListener("input", () => {
    const q = palInput.value.trim().toLowerCase();
    filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.id.includes(q));
    palIndex = 0;
    renderPal();
  });

  palInput?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      palIndex = (palIndex + 1) % Math.max(filtered.length, 1);
      renderPal();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      palIndex = (palIndex - 1 + filtered.length) % Math.max(filtered.length, 1);
      renderPal();
    } else if (e.key === "Enter") {
      e.preventDefault();
      runPal(palIndex);
    } else if (e.key === "Escape") {
      closePal();
    }
  });

  palList?.addEventListener("click", (e) => {
    const li = e.target.closest("[data-i]");
    if (li) runPal(Number(li.dataset.i));
  });

  window.addEventListener("keydown", (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (pal?.hidden === false) closePal();
      else openPal();
    } else if (e.key === "Escape" && pal && !pal.hidden) {
      closePal();
    }
  });

  // ---------- Init ----------
  paintGutters();
  linkifyBuffers();
  paintGutters(); // recount after linkify (same lines)
  renderTabs();
  openFile("readme");
  runBoot();
})();
