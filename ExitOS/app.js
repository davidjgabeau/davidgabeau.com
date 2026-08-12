const services = [
  {
    id: "slack",
    name: "Slack",
    category: "Communications",
    status: "ready",
    artifact: "Workspace export ZIP, member list, channel audit report",
    tags: ["messages", "private channels", "membership"],
    selected: true,
    risk: "Private channels and DMs may contain privileged conversations."
  },
  {
    id: "google",
    name: "Google Workspace",
    category: "Knowledge",
    status: "needs-export",
    artifact: "Drive export, users, shared folders, admin context",
    tags: ["drive", "users", "docs"],
    selected: true,
    risk: "Drive exports need owner and external-sharing review."
  },
  {
    id: "notion",
    name: "Notion",
    category: "Knowledge",
    status: "ready",
    artifact: "Markdown and CSV workspace export",
    tags: ["docs", "databases", "product context"],
    selected: true,
    risk: "Internal planning pages can expose sensitive strategy."
  },
  {
    id: "ramp",
    name: "Ramp",
    category: "Finance",
    status: "ready",
    artifact: "Transactions, reimbursements, bills, vendors, users, cards",
    tags: ["spend", "cards", "vendors"],
    selected: true,
    risk: "Receipts can contain personal addresses and card metadata."
  },
  {
    id: "mercury",
    name: "Mercury",
    category: "Finance",
    status: "needs-export",
    artifact: "Statements, account data, transactions, documents",
    tags: ["banking", "statements", "accounts"],
    selected: true,
    risk: "Bank exports require date-range and account completeness checks."
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    category: "Finance",
    status: "ready",
    artifact: "Reports, lists, chart of accounts, customers, vendors",
    tags: ["accounting", "reports", "vendors"],
    selected: true,
    risk: "Reports need accrual/cash basis and fiscal-period labels."
  },
  {
    id: "deel",
    name: "Deel",
    category: "People",
    status: "invite",
    artifact: "Workers, contracts, invoices, payroll, payments",
    tags: ["payroll", "contracts", "compliance"],
    selected: true,
    risk: "Payroll and contractor files need restricted buyer access."
  },
  {
    id: "github",
    name: "GitHub",
    category: "Engineering",
    status: "needs-export",
    artifact: "Repositories, members, issues, releases, security context",
    tags: ["source code", "security", "contributors"],
    selected: true,
    risk: "Secrets, keys, and private forks must be reviewed before share."
  },
  {
    id: "linear",
    name: "Linear",
    category: "Product",
    status: "ready",
    artifact: "Workspace CSV export",
    tags: ["roadmap", "issues", "teams"],
    selected: true,
    risk: "Issue history can reveal customer commitments and incidents."
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Infrastructure",
    status: "invite",
    artifact: "Projects, deployments, domains, env-var inventory",
    tags: ["hosting", "domains", "deployments"],
    selected: true,
    risk: "Environment variables should be inventoried without exposing values."
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Data",
    status: "risk",
    artifact: "Database dump, storage buckets, auth users, project metadata",
    tags: ["database", "auth", "storage"],
    selected: true,
    risk: "Auth tables and storage can contain personal customer data."
  },
  {
    id: "firebase",
    name: "Firebase",
    category: "Data",
    status: "needs-export",
    artifact: "Firestore export, storage, auth, functions metadata",
    tags: ["firestore", "auth", "functions"],
    selected: false,
    risk: "Managed exports can incur reads and storage costs."
  },
  {
    id: "metabase",
    name: "Metabase",
    category: "Data",
    status: "needs-export",
    artifact: "Dashboards, questions, collections, query results",
    tags: ["analytics", "queries", "dashboards"],
    selected: false,
    risk: "Saved queries can expose database schemas and credentials."
  },
  {
    id: "heap",
    name: "Heap",
    category: "Analytics",
    status: "invite",
    artifact: "Reports, events, users, account data",
    tags: ["events", "users", "reports"],
    selected: false,
    risk: "Event exports may include user identifiers."
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "Communications",
    status: "needs-export",
    artifact: "Recordings, transcripts, chats, users, meeting reports",
    tags: ["recordings", "transcripts", "users"],
    selected: false,
    risk: "Recordings may include confidential negotiations."
  },
  {
    id: "loom",
    name: "Loom",
    category: "Communications",
    status: "needs-export",
    artifact: "Recordings, transcripts, workspace folders",
    tags: ["video", "transcripts", "folders"],
    selected: false,
    risk: "Product demos may show customer data or unreleased work."
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "Engineering",
    status: "needs-export",
    artifact: "Workspace files, rules, docs, agent transcripts",
    tags: ["agents", "rules", "project context"],
    selected: false,
    risk: "Agent transcripts can include secrets copied from code."
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "Infrastructure",
    status: "invite",
    artifact: "Messages, calls, recordings, logs, users, reports",
    tags: ["messages", "calls", "logs"],
    selected: false,
    risk: "Message logs can contain phone numbers and personal content."
  }
];

const statusMeta = {
  ready: { label: "Ready", weight: 1 },
  "needs-export": { label: "Needs export", weight: 0.48 },
  invite: { label: "Invite/access", weight: 0.34 },
  risk: { label: "Review risk", weight: 0.18 }
};

const agentSteps = [
  {
    title: "Parse diligence request",
    detail: "Scope systems, date ranges, buyer type, and sensitive categories."
  },
  {
    title: "Map evidence owners",
    detail: "Assign each export to an admin console, local folder, or access grant."
  },
  {
    title: "Validate package",
    detail: "Check file presence, naming, freshness, and missing date ranges."
  },
  {
    title: "Run risk screen",
    detail: "Flag payroll, customer data, source code, secrets, and privileged material."
  },
  {
    title: "Generate buyer manifest",
    detail: "Create a readable index for the data room and unresolved exceptions."
  }
];

let activeFilter = "all";
let completedSteps = 0;
let runTimers = [];

const els = {
  systemGrid: document.querySelector("#systemGrid"),
  readinessScore: document.querySelector("#readinessScore"),
  scoreArc: document.querySelector("#scoreArc"),
  systemsCount: document.querySelector("#systemsCount"),
  readyCount: document.querySelector("#readyCount"),
  riskCount: document.querySelector("#riskCount"),
  dayCount: document.querySelector("#dayCount"),
  riskList: document.querySelector("#riskList"),
  manifestPreview: document.querySelector("#manifestPreview"),
  agentLog: document.querySelector("#agentLog"),
  agentHeadline: document.querySelector("#agentHeadline"),
  runAgent: document.querySelector("#runAgent"),
  downloadManifest: document.querySelector("#downloadManifest"),
  companyName: document.querySelector("#companyName"),
  salePath: document.querySelector("#salePath"),
  timeline: document.querySelector("#timeline"),
  sensitivity: document.querySelector("#sensitivity")
};

function selectedServices() {
  return services.filter((service) => service.selected);
}

function readiness() {
  const selected = selectedServices();
  if (!selected.length) return 0;

  const total = selected.reduce((sum, service) => sum + statusMeta[service.status].weight, 0);
  return Math.round((total / selected.length) * 100);
}

function riskItems() {
  const selected = selectedServices();
  const items = selected
    .filter((service) => service.status === "risk" || service.status === "needs-export")
    .slice(0, 5)
    .map((service) => ({
      severity: service.status === "risk" ? "high" : "medium",
      title: `${service.name}: ${service.artifact}`,
      detail: service.risk
    }));

  const categories = new Set(selected.map((service) => service.category));

  if (categories.has("Finance") || categories.has("People")) {
    items.unshift({
      severity: "high",
      title: "Restricted financial and people data",
      detail: "Payroll, statements, and contracts should be shared with named buyer-side recipients only."
    });
  }

  if (categories.has("Engineering") || categories.has("Infrastructure")) {
    items.push({
      severity: "medium",
      title: "Source and infrastructure secrets",
      detail: "Share inventories and access paths without exposing raw secret values."
    });
  }

  if (!items.length) {
    items.push({
      severity: "low",
      title: "No urgent risk flags",
      detail: "Current scope is mostly ready, with standard access review still recommended."
    });
  }

  return items.slice(0, 6);
}

function manifest() {
  const selected = selectedServices();
  const score = readiness();
  const missing = selected
    .filter((service) => service.status !== "ready")
    .map((service) => ({
      system: service.name,
      action: statusMeta[service.status].label,
      expected_artifact: service.artifact
    }));

  return {
    product: "ExitOS",
    company: els.companyName.value.trim() || "Untitled Company",
    deal_context: {
      sale_path: els.salePath.value,
      timeline: els.timeline.value,
      sensitivity: els.sensitivity.value
    },
    readiness_score: score,
    generated_at: new Date().toISOString(),
    included_systems: selected.map((service) => ({
      name: service.name,
      category: service.category,
      status: statusMeta[service.status].label,
      artifact: service.artifact,
      tags: service.tags
    })),
    missing_or_blocked: missing,
    risk_register: riskItems().map((item) => ({
      severity: item.severity,
      title: item.title,
      detail: item.detail
    })),
    recommended_next_agent_run: nextAgentRun(missing.length)
  };
}

function nextAgentRun(missingCount) {
  if (!missingCount) {
    return "Package ready for final founder review and buyer-room upload.";
  }

  if (missingCount <= 3) {
    return "Resolve remaining exports, then generate final README and audit trail.";
  }

  return "Prioritize finance, comms, source-code, and data exports before buyer share.";
}

function renderSystems() {
  const fragment = document.createDocumentFragment();

  services.forEach((service) => {
    const card = document.createElement("article");
    card.className = "system-card";
    card.dataset.status = service.status;
    card.dataset.risk = service.status === "risk" || service.status === "needs-export" ? "true" : "false";

    const shouldShow =
      activeFilter === "all" ||
      activeFilter === service.status ||
      (activeFilter === "risk" && card.dataset.risk === "true");

    if (!shouldShow) card.hidden = true;

    card.innerHTML = `
      <div class="system-main">
        <div class="system-topline">
          <span class="service-category">${service.category}</span>
          <span class="status-pill ${service.status}">${statusMeta[service.status].label}</span>
        </div>
        <strong class="service-name">${service.name}</strong>
        <p class="artifact">${service.artifact}</p>
      </div>
      <label class="system-toggle" aria-label="Toggle ${service.name}">
        <input type="checkbox" ${service.selected ? "checked" : ""} data-service-id="${service.id}">
        <span aria-hidden="true"></span>
      </label>
      <div class="system-footer">
        ${service.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    `;

    fragment.appendChild(card);
  });

  els.systemGrid.replaceChildren(fragment);

  els.systemGrid.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.addEventListener("change", () => {
      const service = services.find((item) => item.id === input.dataset.serviceId);
      service.selected = input.checked;
      completedSteps = 0;
      renderAll();
    });
  });
}

function renderSnapshot() {
  const selected = selectedServices();
  const score = readiness();
  const circumference = 301.59;

  els.readinessScore.textContent = `${score}%`;
  els.scoreArc.style.strokeDashoffset = `${circumference - (circumference * score) / 100}`;
  els.systemsCount.textContent = selected.length;
  els.readyCount.textContent = selected.filter((service) => service.status === "ready").length;
  els.riskCount.textContent = riskItems().filter((item) => item.severity !== "low").length;
  els.dayCount.textContent = Math.max(1, Math.round(selected.length * 0.38));
}

function renderRisks() {
  const fragment = document.createDocumentFragment();

  riskItems().forEach((item) => {
    const risk = document.createElement("div");
    risk.className = "risk-item";
    risk.innerHTML = `
      <span class="risk-dot ${item.severity}" aria-hidden="true"></span>
      <div>
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </div>
    `;
    fragment.appendChild(risk);
  });

  els.riskList.replaceChildren(fragment);
}

function renderManifest() {
  els.manifestPreview.textContent = JSON.stringify(manifest(), null, 2);
}

function renderAgentLog() {
  const fragment = document.createDocumentFragment();

  agentSteps.forEach((step, index) => {
    const item = document.createElement("li");
    if (index < completedSteps) item.classList.add("is-complete");
    item.innerHTML = `
      <span class="agent-step-index">${index < completedSteps ? "ok" : index + 1}</span>
      <div>
        <strong>${step.title}</strong>
        <span>${step.detail}</span>
      </div>
    `;
    fragment.appendChild(item);
  });

  els.agentLog.replaceChildren(fragment);

  if (completedSteps === agentSteps.length) {
    els.agentHeadline.textContent = "Buyer package assembled";
  } else if (completedSteps > 0) {
    els.agentHeadline.textContent = `Agent running: ${completedSteps}/${agentSteps.length}`;
  } else {
    els.agentHeadline.textContent = "Ready to assemble the package";
  }
}

function renderAll() {
  renderSystems();
  renderSnapshot();
  renderRisks();
  renderManifest();
  renderAgentLog();
}

function runAgent() {
  runTimers.forEach((timer) => window.clearTimeout(timer));
  runTimers = [];
  completedSteps = 0;
  renderAgentLog();

  agentSteps.forEach((_, index) => {
    const timer = window.setTimeout(() => {
      completedSteps = index + 1;
      renderAgentLog();
      renderManifest();
    }, 420 * (index + 1));
    runTimers.push(timer);
  });
}

function downloadManifest() {
  const data = JSON.stringify(manifest(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const safeCompany = (els.companyName.value || "company").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeCompany || "company"}-exitos-manifest.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function bindControls() {
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter;
      document.querySelectorAll(".filter-tab").forEach((item) => item.classList.toggle("active", item === tab));
      renderSystems();
    });
  });

  [els.companyName, els.salePath, els.timeline, els.sensitivity].forEach((control) => {
    control.addEventListener("input", () => {
      renderSnapshot();
      renderRisks();
      renderManifest();
    });
  });

  els.runAgent.addEventListener("click", runAgent);
  els.downloadManifest.addEventListener("click", downloadManifest);
}

bindControls();
renderAll();
