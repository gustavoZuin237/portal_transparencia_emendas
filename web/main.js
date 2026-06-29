async function loadData() {
  const response = await fetch("./input/emendas.json");
  return response.json();
}

const data = await loadData();

// ── Constants ────────────────────────────────────────────────

const STATUS_BADGE_CLASSES = {
  "Análise técnica":        "b-analise",
  "Aprovado":               "b-aprovado",
  "Reprovado":              "b-reprovado",
  "Aguardando nova indicação": "b-aguardando",
  "Em processo":            "b-processo",
  "Empenhado":              "b-empenhado",
  "Liquidado":              "b-liquidado",
  "Pago":                   "b-pago",
  "Concluído":              "b-concluido",
  "Devolvida":              "b-devolvida",
};

const DOCUMENT_TYPES = [
  { field: "planoTrabalho", label: "Plano de Trabalho", color: "#f97316" },
  { field: "notaFiscal",    label: "Nota Fiscal",       color: "#22c55e" },
];

const ELEMENTS = {
  tableBody:      document.getElementById("tbody"),
  resultCount:    document.getElementById("count"),
  searchInput:    document.getElementById("busca"),
  statusFilter:   document.getElementById("fStatus"),
  typeFilter:     document.getElementById("fTipo"),
  sectorFilter:   document.getElementById("fSec"),
  overlay:        document.getElementById("ov"),
  drawer:         document.getElementById("drw"),
  drawerClose:    document.getElementById("drw-close"),
  drawerTitle:    document.getElementById("d-tit"),
  drawerSubtitle: document.getElementById("d-sub"),
  drawerBody:     document.getElementById("d-body"),
};

const sortState = {
  column: null,
  ascending: true,
};

// ── Filter population ────────────────────────────────────────

function populateFilterOptions() {
  const statuses = [...new Set(data.map((a) => a.status).filter(Boolean))];
  const sectors = [...new Set(data.map((a) => a.secretaria).filter(Boolean))].sort();
  const types = [...new Set(data.map(a => a.tipo).filter(Boolean))].sort();

  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    ELEMENTS.statusFilter.appendChild(option);
  });

  sectors.forEach((sector) => {
    const option = document.createElement("option");
    option.value = sector;
    option.textContent = sector;
    ELEMENTS.sectorFilter.appendChild(option);
  });

  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    ELEMENTS.typeFilter.appendChild(option);
});
}

// ── HTML builders ────────────────────────────────────────────

function buildPdfIconSvg(color) {
  return (
    `<svg viewBox="0 0 24 24" fill="none">` +
    `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="${color}" opacity=".2" stroke="${color}" stroke-width="1.5"/>` +
    `<path d="M14 2v6h6" fill="none" stroke="${color}" stroke-width="1.5"/>` +
    `<path d="M9 13h6M9 17h4" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>` +
    `</svg>`
  );
}

function buildTableDocButton(hasDocument, label, color) {
  if (hasDocument) {
    return (
      `<a class="doc-btn" href="#" data-doc="${label}">` +
      buildPdfIconSvg(color) +
      `<span class="tip">${label}</span>` +
      `</a>`
    );
  }
  return `<span class="doc-na">—</span>`;
}

function buildDrawerDocumentLinks(amendment) {
  return DOCUMENT_TYPES.map(({ field, label, color }) => {
    const isAvailable = !!amendment[field];
    const activeColor = isAvailable ? color : "#9ca3af";
    const cssClass    = isAvailable ? "drw-doc" : "drw-doc off";
    const docAttr     = isAvailable ? `data-doc="${label}"` : "";

    return (
      `<a class="${cssClass}" href="#" ${docAttr}>` +
      buildPdfIconSvg(activeColor) +
      `<span class="drw-doc-lbl" style="color:${activeColor}">${label}</span>` +
      `</a>`
    );
  }).join("");
}

function buildDrawerField(label, valueHtml) {
  return (
    `<div class="drw-field">` +
    `<div class="drw-lbl">${label}</div>` +
    `<div class="drw-val">${valueHtml}</div>` +
    `</div>`
  );
}

function buildDrawerSection(title, contentHtml) {
  return (
    `<div class="drw-sec">` +
    `<div class="drw-sec-title">${title}</div>` +
    contentHtml +
    `</div>`
  );
}

// ── Table rendering ──────────────────────────────────────────

function buildTableRow(amendment) {
  const badgeClass = STATUS_BADGE_CLASSES[amendment.status] ?? "b-analise";

  const docCells = DOCUMENT_TYPES.map(({ field, label, color }, index) => {
    const cellClass = index === 0 ? "td-center td-sep" : "td-center";
    return `<td class="${cellClass}">${buildTableDocButton(amendment[field], label, color)}</td>`;
  }).join("");

  return (
    `<tr data-id="${amendment.numeroEmenda}">` +
    `<td class="td-nw"><span class="em-num">${amendment.numeroEmenda}</span></td>` +
    `<td><span class="td-nw em-autor">${amendment.parlamentarAutor}</span></td>` +
    `<td><span class="td-nw em-valor">${amendment.secretaria}</span></td>` +
    `<td><span class="td-nw em-benef">${amendment.beneficiario}</span></td>` +
    `<td><span class="td-nw em-obj">${amendment.objeto}</span></td>` +
    `<td><span class="td-nw em-valor">${amendment.tipo}</span></td>` +
    `<td class="td-nw"><span class="em-valor">${amendment.valorPrevisto}</span></td>` +
    `<td class="td-nw"><span class="em-valor">${amendment.valorEmpenhado}</span></td>` +
    `<td class="td-nw"><span class="em-valor">${amendment.valorLiquidado}</span></td>` +
    `<td class="td-nw"><span class="em-valor">${amendment.valorPago}</span></td>` +
    `<td class="td-nw"><span class="badge ${badgeClass}">${amendment.status}</span></td>` +
    `<td class="td-nw"><span class="em-dataEstimadaConclusao">${amendment.dataEstimadaConclusao}</span></td>` +
    docCells +
    `</tr>`
  );
}

function renderTable(amendments) {
  if (!amendments.length) {
    ELEMENTS.tableBody.innerHTML = `<tr class="empty-row"><td colspan="14">Nenhuma emenda encontrada.</td></tr>`;
    ELEMENTS.resultCount.textContent = "0 emendas";
    return;
  }

  ELEMENTS.tableBody.innerHTML = amendments.map(buildTableRow).join("");

  // Row click — open drawer (ignoring clicks on doc buttons)
  ELEMENTS.tableBody.querySelectorAll("tr[data-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest(".doc-btn")) return;
      const amendment = data.find((item) => String(item.numeroEmenda) === row.dataset.id);
      openDrawer(amendment);
    });
  });

  // TODO: replace alert with real document link
  ELEMENTS.tableBody.querySelectorAll(".doc-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      alert(`${button.dataset.doc}\n(link configurado pelo TI)`);
    });
  });

  const label = amendments.length === 1 ? "emenda" : "emendas";
  ELEMENTS.resultCount.textContent = `${amendments.length} ${label}`;
}

// ── Filtering & sorting ──────────────────────────────────────

function getFilteredAmendments() {
  const searchTerm   = ELEMENTS.searchInput.value.toLowerCase();
  const statusFilter = ELEMENTS.statusFilter.value;
  const typeFilter   = ELEMENTS.typeFilter.value;
  const sectorFilter = ELEMENTS.sectorFilter.value;

  return data.filter((amendment) => {
    const searchableText = [
      amendment.numeroEmenda,
      amendment.parlamentarAutor,
      amendment.beneficiario,
      amendment.objeto,
      amendment.status,
      amendment.secretaria,
    ].join(" ").toLowerCase();

    const matchesSearch  = !searchTerm   || searchableText.includes(searchTerm);
    const matchesStatus  = !statusFilter || amendment.status     === statusFilter;
    const matchesType    = !typeFilter   || amendment.tipo       === typeFilter;
    const matchesSector  = !sectorFilter || amendment.secretaria === sectorFilter;

    return matchesSearch && matchesStatus && matchesType && matchesSector;
  });
}

function getSortedAmendments(amendments) {
  if (!sortState.column) return amendments;

  return [...amendments].sort((a, b) => {
    const valueA = a[sortState.column] ?? "";
    const valueB = b[sortState.column] ?? "";

    const comparison =
      typeof valueA === "number"
        ? valueA - valueB
        : String(valueA).localeCompare(String(valueB), "pt");

    return sortState.ascending ? comparison : -comparison;
  });
}

function applyFiltersAndRender() {
  const filtered = getFilteredAmendments();
  const sorted   = getSortedAmendments(filtered);
  renderTable(sorted);
}

function handleColumnSort(columnKey, headerEl) {
  if (sortState.column === columnKey) {
    sortState.ascending = !sortState.ascending;
  } else {
    sortState.column = columnKey;
    sortState.ascending = true;
  }

  document.querySelectorAll("thead th").forEach((th) => th.classList.remove("sorted"));
  headerEl.classList.add("sorted");

  applyFiltersAndRender();
}

// ── Drawer ───────────────────────────────────────────────────

function openDrawer(amendment) {
  const badgeClass = STATUS_BADGE_CLASSES[amendment.status] ?? "b-analise";

  ELEMENTS.drawerTitle.textContent    = `${amendment.numeroEmenda} — ${amendment.beneficiario}`;
  ELEMENTS.drawerSubtitle.textContent = amendment.objeto;

  const hasValues = amendment.valorPrevisto && amendment.valorPrevisto !== "—";

  const identificationFields =
    `<div class="drw-field">` +
      `<div class="drw-lbl">Status</div>` +
      `<span class="badge ${badgeClass}">${amendment.status}</span>` +
    `</div>` +
    buildDrawerField("Autor(a)", amendment.parlamentarAutor) +
    buildDrawerField("Tipo", amendment.tipo) +
    buildDrawerField("Secretaria", amendment.secretaria);

  const resourceFields = !hasValues ? "" :
    buildDrawerField("Valor Previsto",   `<span class="drw-val--big">${amendment.valorPrevisto}</span>`) +
    buildDrawerField("Valor Empenhado",  `<span class="drw-val--big">${amendment.valorEmpenhado}</span>`) +
    buildDrawerField("Valor Liquidado",  `<span class="drw-val--big">${amendment.valorLiquidado}</span>`) +
    buildDrawerField("Valor Pago",       `<span class="drw-val--big">${amendment.valorPago}</span>`);

  ELEMENTS.drawerBody.innerHTML =
    buildDrawerSection("Identificação", identificationFields) +
    buildDrawerSection("Objeto e Recursos", resourceFields) +
    buildDrawerSection("Documentos", `<div class="drw-docs">${buildDrawerDocumentLinks(amendment)}</div>`);

  // TODO: replace alert with real document link
  ELEMENTS.drawerBody.querySelectorAll(".drw-doc:not(.off)").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      alert(`${button.dataset.doc}\n(link configurado pelo TI)`);
    });
  });

  ELEMENTS.overlay.classList.add("open");
  ELEMENTS.drawer.classList.add("open");
}

function closeDrawer() {
  ELEMENTS.overlay.classList.remove("open");
  ELEMENTS.drawer.classList.remove("open");
}

// ── Event listeners ──────────────────────────────────────────

ELEMENTS.searchInput.addEventListener("input",  applyFiltersAndRender);
ELEMENTS.statusFilter.addEventListener("change", applyFiltersAndRender);
ELEMENTS.typeFilter.addEventListener("change",   applyFiltersAndRender);
ELEMENTS.sectorFilter.addEventListener("change", applyFiltersAndRender);

ELEMENTS.overlay.addEventListener("click", closeDrawer);
ELEMENTS.drawerClose.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});

document.querySelectorAll("th[data-col]").forEach((th) => {
  th.addEventListener("click", () => handleColumnSort(th.dataset.col, th));
});

// ── Init ─────────────────────────────────────────────────────

populateFilterOptions();
applyFiltersAndRender();