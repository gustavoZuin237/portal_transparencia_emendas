async function loadData() {
  const response = await fetch("./data/emendas.json");
  return response.json();
}

const data = await loadData();

// ── Constants ────────────────────────────────────────────────

const STATUS_BADGE_CLASSES = {
  "Análise técnica": "b-analise",
  Aprovado: "b-aprovado",
  Reprovado: "b-reprovado",
  "Aguardando nova indicação": "b-aguardando",
  "Em processo": "b-processo",
  Empenhado: "b-empenhado",
  Liquidado: "b-liquidado",
  Pago: "b-pago",
  Concluído: "b-concluido",
  Devolvida: "b-devolvida",
};

const ELEMENTS = {
  tableBody: document.getElementById("tbody"),
  resultCount: document.getElementById("count"),
  searchInput: document.getElementById("busca"),
  statusFilter: document.getElementById("fStatus"),
  typeFilter: document.getElementById("fTipo"),
  sectorFilter: document.getElementById("fSec"),
  overlay: document.getElementById("ov"),
  drawer: document.getElementById("drw"),
  drawerClose: document.getElementById("drw-close"),
  drawerTitle: document.getElementById("d-tit"),
  drawerSubtitle: document.getElementById("d-sub"),
  drawerBody: document.getElementById("d-body"),
};

const sortState = {
  column: null,
  ascending: true,
};

// ── Filter population ────────────────────────────────────────

function populateFilterOptions() {
  const statuses = [...new Set(data.map((a) => a.status).filter(Boolean))];
  const sectors = [
    ...new Set(data.map((a) => a.secretaria).filter(Boolean)),
  ].sort();
  const types = [...new Set(data.map((a) => a.tipo).filter(Boolean))].sort();

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

function buildTableDocButton(amendment) {
  if (amendment.hasDocument == false) {
    return `<span class="doc-na">—</span>`;
  }

  return (
    `<a class="doc-btn" href="#">` +
    buildPdfIconSvg("#ef4444") +
    `<span class="tip">Documentos</span>` +
    `</a>`
  );
}

function getFileNameFromPath(path) {
  try {
    const url = new URL(path, window.location.href);
    return decodeURIComponent(url.pathname.split("/").pop());
  } catch {
    return path;
  }
}

function buildDrawerDocumentLinks(amendment) {
  if (amendment.hasDocument == false) {
    return `<span class="doc-na">Nenhum documento disponível</span>`;
  }

  return amendment.documents
    .map((doc) => {
      const fileName = getFileNameFromPath(doc);

      return (
        `<a class="drw-doc" href="${doc}" target="_blank" rel="noopener noreferrer">` +
        buildPdfIconSvg("#ef4444") +
        `<span class="drw-doc-lbl" style="color:#ef4444">${fileName}</span>` +
        `</a>`
      );
    })
    .join("");
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

  const docCells = `<td class="td-center td-sep">
      ${buildTableDocButton(amendment)}
    </td>`;

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

  ELEMENTS.tableBody.querySelectorAll("tr[data-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest(".doc-btn")) return;

      const amendment = data.find(
        (item) => String(item.numeroEmenda) === row.dataset.id,
      );

      openDrawer(amendment);
    });
  });

  ELEMENTS.tableBody.querySelectorAll(".doc-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const amendment = data.find(
        (item) => String(item.numeroEmenda) === button.closest("tr").dataset.id,
      );

      openDrawer(amendment);
    });
  });

  const label = amendments.length === 1 ? "emenda" : "emendas";
  ELEMENTS.resultCount.textContent = `${amendments.length} ${label}`;
}

// ── Filtering & sorting ──────────────────────────────────────

function getFilteredAmendments() {
  const searchTerm = ELEMENTS.searchInput.value.toLowerCase();

  return data.filter((amendment) => {
    const searchableText = [
      amendment.numeroEmenda,
      amendment.parlamentarAutor,
      amendment.beneficiario,
      amendment.objeto,
      amendment.status,
      amendment.secretaria,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!searchTerm || searchableText.includes(searchTerm)) &&
      (!ELEMENTS.statusFilter.value ||
        amendment.status === ELEMENTS.statusFilter.value) &&
      (!ELEMENTS.typeFilter.value ||
        amendment.tipo === ELEMENTS.typeFilter.value) &&
      (!ELEMENTS.sectorFilter.value ||
        amendment.secretaria === ELEMENTS.sectorFilter.value)
    );
  });
}

function getSortedAmendments(amendments) {
  if (!sortState.column) return amendments;

  return [...amendments].sort((a, b) => {
    const comparison = String(a[sortState.column]).localeCompare(
      String(b[sortState.column]),
      "pt",
    );

    return sortState.ascending ? comparison : -comparison;
  });
}

function applyFiltersAndRender() {
  renderTable(getSortedAmendments(getFilteredAmendments()));
}

// ── Drawer ───────────────────────────────────────────────────

function openDrawer(amendment) {
  ELEMENTS.drawerTitle.textContent = `${amendment.numeroEmenda} — ${amendment.beneficiario}`;

  ELEMENTS.drawerSubtitle.textContent = amendment.objeto;

  ELEMENTS.drawerBody.innerHTML =
    buildDrawerSection(
      "Identificação",
      buildDrawerField("Número da emenda", amendment.numeroEmenda) +
        buildDrawerField("Autor(a)", amendment.parlamentarAutor) +
        buildDrawerField("Tipo", amendment.tipo) +
        buildDrawerField("Secretaria", amendment.secretaria) +
        buildDrawerField("Status", amendment.status) +
        buildDrawerField(
          "Data estimada de conclusão",
          amendment.dataEstimadaConclusao,
        ),
    ) +
    buildDrawerSection(
      "Valores",
      buildDrawerField("Valor previsto", amendment.valorPrevisto) +
        buildDrawerField("Valor empenhado", amendment.valorEmpenhado) +
        buildDrawerField("Valor liquidado", amendment.valorLiquidado) +
        buildDrawerField("Valor pago", amendment.valorPago),
    ) +
    buildDrawerSection(
      "Documentos",
      `<div class="drw-docs">
        ${buildDrawerDocumentLinks(amendment)}
       </div>`,
    );

  ELEMENTS.overlay.classList.add("open");
  ELEMENTS.drawer.classList.add("open");
}

function closeDrawer() {
  ELEMENTS.overlay.classList.remove("open");
  ELEMENTS.drawer.classList.remove("open");
}

// ── Events ───────────────────────────────────────────────────

ELEMENTS.searchInput.addEventListener("input", applyFiltersAndRender);
ELEMENTS.statusFilter.addEventListener("change", applyFiltersAndRender);
ELEMENTS.typeFilter.addEventListener("change", applyFiltersAndRender);
ELEMENTS.sectorFilter.addEventListener("change", applyFiltersAndRender);

ELEMENTS.overlay.addEventListener("click", closeDrawer);
ELEMENTS.drawerClose.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});

// ── Init ─────────────────────────────────────────────────────

populateFilterOptions();
applyFiltersAndRender();
