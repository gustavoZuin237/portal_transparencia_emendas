import { data } from "./data.js";

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

const DOCUMENT_TYPES = [
  { field: "crono", label: "Cronograma de Execução", color: "#3b82f6" },
  { field: "pt", label: "Plano de Trabalho", color: "#f97316" },
  { field: "nf", label: "Nota Fiscal / Comprovante", color: "#22c55e" },
];

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
  column: null, // Field key currently sorted by, or null for default order
  ascending: true,
};

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
  const links = DOCUMENT_TYPES.map(({ field, label, color }) => {
    const isAvailable = amendment[field];
    const activeColor = isAvailable ? color : "#9ca3af";
    const cssClass = isAvailable ? "drw-doc" : "drw-doc off";
    const docAttr = isAvailable ? `data-doc="${label}"` : "";
    const labelText = label.replace(" / ", "/<br>");

    return (
      `<a class="${cssClass}" href="#" ${docAttr}>` +
      buildPdfIconSvg(activeColor) +
      `<span class="drw-doc-lbl doc-label--${isAvailable ? "active" : "inactive"}"` +
      ` style="color:${activeColor}">${labelText}</span>` +
      `</a>`
    );
  });

  return links.join("");
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

function renderTable(amendments) {
  if (!amendments.length) {
    ELEMENTS.tableBody.innerHTML = `<tr class="empty-row"><td colspan="10">Nenhuma emenda encontrada.</td></tr>`;
    ELEMENTS.resultCount.textContent = "0 emendas";
    return;
  }

  ELEMENTS.tableBody.innerHTML = amendments.map(buildTableRow).join("");

  // Row click — open drawer (ignoring clicks that land on a doc button)
  ELEMENTS.tableBody.querySelectorAll("tr[data-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest(".doc-btn")) return;
      const amendment = data.find((item) => String(item.id) === row.dataset.id);
      openDrawer(amendment);
    });
  });

  // TODO insert link here
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

function buildTableRow(amendment) {
  const badgeClass = STATUS_BADGE_CLASSES[amendment.status] ?? "b-analise";

  const docCells = DOCUMENT_TYPES.map(({ field, label, color }, index) => {
    const isFirstDoc = index === 0;
    const cellClass = isFirstDoc ? "td-center td-sep" : "td-center";
    return `<td class="${cellClass}">${buildTableDocButton(amendment[field], label, color)}</td>`;
  }).join("");

  return (
    `<tr data-id="${amendment.id}">` +
    `<td class="td-nw"><span class="em-num">${amendment.id}</span></td>` +
    `<td class="td-nw"><span class="em-cod">${amendment.cod}</span></td>` +
    `<td><span class="em-autor">${amendment.autor}</span></td>` +
    `<td>` +
    `<span class="em-benef">${amendment.benef}</span>` +
    `<span class="em-sec">${amendment.sec}</span>` +
    `</td>` +
    `<td><span class="em-obj" title="${amendment.obj}">${amendment.obj}</span></td>` +
    `<td class="td-nw"><span class="em-valor">${amendment.valor}</span></td>` +
    `<td class="td-nw"><span class="badge ${badgeClass}">${amendment.status}</span></td>` +
    docCells +
    `</tr>`
  );
}

function getFilteredAmendments() {
  const searchTerm = ELEMENTS.searchInput.value.toLowerCase();
  const statusFilter = ELEMENTS.statusFilter.value;
  const typeFilter = ELEMENTS.typeFilter.value;
  const sectorFilter = ELEMENTS.sectorFilter.value;

  return data.filter((amendment) => {
    const searchableText = [
      amendment.id,
      amendment.autor,
      amendment.benef,
      amendment.obj,
      amendment.status,
      amendment.sec,
      amendment.cod,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
    const matchesStatus = !statusFilter || amendment.status === statusFilter;
    const matchesType = !typeFilter || amendment.tipo === typeFilter;
    const matchesSector = !sectorFilter || amendment.sec === sectorFilter;

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
  const sorted = getSortedAmendments(filtered);
  renderTable(sorted);
}

function handleColumnSort(columnKey, headerEl) {
  if (sortState.column === columnKey) {
    sortState.ascending = !sortState.ascending;
  } else {
    sortState.column = columnKey;
    sortState.ascending = true;
  }

  document
    .querySelectorAll("thead th")
    .forEach((th) => th.classList.remove("sorted"));
  headerEl.classList.add("sorted");

  applyFiltersAndRender();
}

function openDrawer(amendment) {
  const badgeClass = STATUS_BADGE_CLASSES[amendment.status] ?? "b-analise";
  const typeLabel =
    amendment.tipo === "OSC"
      ? "Entidade (OSC)"
      : "Execução direta pela administração municipal";

  ELEMENTS.drawerTitle.textContent = `${amendment.id} — ${amendment.benef}`;
  ELEMENTS.drawerSubtitle.textContent = amendment.obj;

  const identificationFields =
    `<div class="drw-field">` +
    `<div class="drw-lbl">Status</div>` +
    `<span class="badge ${badgeClass}">${amendment.status}</span>` +
    `</div>` +
    buildDrawerField("Tipo", typeLabel) +
    buildDrawerField("Secretaria gestora", amendment.sec) +
    buildDrawerField("Autor(a)", amendment.autor) +
    (amendment.processo !== "—"
      ? buildDrawerField(
          "Processo administrativo",
          `<span class="mono">${amendment.processo}</span>`,
        )
      : "") +
    (amendment.cod !== "—"
      ? buildDrawerField(
          "Código de aplicação",
          `<span class="mono">${amendment.cod}</span>`,
        )
      : "");

  const resourceFields =
    buildDrawerField("Descrição", amendment.obj_full) +
    (amendment.valor !== "—"
      ? buildDrawerField("Valor", `<span class="big">${amendment.valor}</span>`)
      : "") +
    buildDrawerField("Período", amendment.periodo) +
    buildDrawerField("Público-alvo", amendment.publico);

  ELEMENTS.drawerBody.innerHTML =
    buildDrawerSection("Identificação", identificationFields) +
    buildDrawerSection("Objeto e Recursos", resourceFields) +
    buildDrawerSection(
      "Documentos",
      `<div class="drw-docs">${buildDrawerDocumentLinks(amendment)}</div>`,
    );

  // TODO insert link here
  ELEMENTS.drawerBody
    .querySelectorAll(".drw-doc:not(.off)")
    .forEach((button) => {
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

ELEMENTS.searchInput.addEventListener("input", applyFiltersAndRender);
ELEMENTS.statusFilter.addEventListener("change", applyFiltersAndRender);
ELEMENTS.typeFilter.addEventListener("change", applyFiltersAndRender);
ELEMENTS.sectorFilter.addEventListener("change", applyFiltersAndRender);

ELEMENTS.overlay.addEventListener("click", closeDrawer);
ELEMENTS.drawerClose.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});

document.querySelectorAll("th[data-col]").forEach((th) => {
  th.addEventListener("click", () => handleColumnSort(th.dataset.col, th));
});

applyFiltersAndRender();
