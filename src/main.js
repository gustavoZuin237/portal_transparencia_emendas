import { data } from "./data.js";

const D = data;

const SC = {
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

function pdfSvg(c) {
  return (
    '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="' +
    c +
    '" opacity=".2" stroke="' +
    c +
    '" stroke-width="1.5"/><path d="M14 2v6h6" fill="none" stroke="' +
    c +
    '" stroke-width="1.5"/><path d="M9 13h6M9 17h4" stroke="' +
    c +
    '" stroke-width="1.2" stroke-linecap="round"/></svg>'
  );
}

function docBtn(has, lbl, cor) {
  if (has)
    return (
      '<a class="doc-btn" href="#" data-doc="' + lbl + '">' +
      pdfSvg(cor) +
      '<span class="tip">' + lbl + "</span></a>"
    );
  return '<span class="doc-na">—</span>';
}

var sCol = null,
  sAsc = true;

function render(dados) {
  const tb = document.getElementById("tbody");
  if (!dados.length) {
    tb.innerHTML =
      '<tr class="empty-row"><td colspan="10">Nenhuma emenda encontrada.</td></tr>';
    document.getElementById("count").textContent = "0 emendas";
    return;
  }

  tb.innerHTML = dados
    .map(function (e) {
      var sc = SC[e.status] || "b-analise";
      return (
        '<tr data-idx="' + e.id + '">' +
        '<td class="td-nw"><span class="em-num">' + e.id + "</span></td>" +
        '<td class="td-nw" style="font-size:10px;color:#8ba8cc">' + e.cod + "</td>" +
        '<td><span class="em-autor">' + e.autor + "</span></td>" +
        "<td>" +
        '<span class="em-benef">' + e.benef + "</span>" +
        '<span class="em-sec">' + e.sec + "</span>" +
        "</td>" +
        '<td><span class="em-obj" title="' + e.obj + '">' + e.obj + "</span></td>" +
        '<td class="td-nw"><span class="em-valor">' + e.valor + "</span></td>" +
        '<td class="td-nw"><span class="badge ' + sc + '">' + e.status + "</span></td>" +
        '<td class="td-center td-sep">' + docBtn(e.crono, "Cronograma de Execução", "#3b82f6") + "</td>" +
        '<td class="td-center">' + docBtn(e.pt, "Plano de Trabalho", "#f97316") + "</td>" +
        '<td class="td-center">' + docBtn(e.nf, "Nota Fiscal / Comprovante", "#22c55e") + "</td>" +
        "</tr>"
      );
    })
    .join("");

  tb.querySelectorAll("tr[data-idx]").forEach((tr) => {
    tr.addEventListener("click", (e) => {
      // Ignore clicks that originated from a doc button
      if (e.target.closest(".doc-btn")) return;
      const item = D.find((x) => x.id === tr.dataset.idx);
      abrir(item);
    });
  });

  tb.querySelectorAll(".doc-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      alert(btn.dataset.doc + "\n(link configurado pelo TI)");
    });
  });

  document.getElementById("count").textContent =
    dados.length + " emenda" + (dados.length !== 1 ? "s" : "");
}

function filtrar() {
  var b = document.getElementById("busca").value.toLowerCase();
  var s = document.getElementById("fStatus").value;
  var t = document.getElementById("fTipo").value;
  var sec = document.getElementById("fSec").value;
  var r = D.filter(function (e) {
    var txt = [e.id, e.autor, e.benef, e.obj, e.status, e.sec, e.cod]
      .join(" ")
      .toLowerCase();
    return (
      (!b || txt.includes(b)) &&
      (!s || e.status === s) &&
      (!t || e.tipo === t) &&
      (!sec || e.sec === sec)
    );
  });
  if (sCol) {
    r = r.slice().sort(function (a, b2) {
      var va = a[sCol] || "",
        vb = b2[sCol] || "";
      var r2 =
        typeof va === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "pt");
      return sAsc ? r2 : -r2;
    });
  }
  render(r);
}

function ord(col, thEl) {
  if (sCol === col) sAsc = !sAsc;
  else {
    sCol = col;
    sAsc = true;
  }
  document.querySelectorAll("thead th").forEach((th) => th.classList.remove("sorted"));
  thEl.classList.add("sorted");
  filtrar();
}

function abrir(e) {
  var sc = SC[e.status] || "b-analise";
  document.getElementById("d-tit").textContent = e.id + " — " + e.benef;
  document.getElementById("d-sub").textContent = e.obj;
  var html =
    '<div class="drw-sec"><div class="drw-sec-title">Identificação</div>' +
    '<div class="drw-field"><div class="drw-lbl">Status</div><span class="badge ' + sc + '">' + e.status + "</span></div>" +
    '<div class="drw-field"><div class="drw-lbl">Tipo</div><div class="drw-val">' +
    (e.tipo === "OSC" ? "Entidade (OSC)" : "Execução direta pela administração municipal") +
    "</div></div>" +
    '<div class="drw-field"><div class="drw-lbl">Secretaria gestora</div><div class="drw-val">' + e.sec + "</div></div>" +
    '<div class="drw-field"><div class="drw-lbl">Autor(a)</div><div class="drw-val">' + e.autor + "</div></div>" +
    (e.processo !== "—"
      ? '<div class="drw-field"><div class="drw-lbl">Processo administrativo</div><div class="drw-val mono">' + e.processo + "</div></div>"
      : "") +
    (e.cod !== "—"
      ? '<div class="drw-field"><div class="drw-lbl">Código de aplicação</div><div class="drw-val mono">' + e.cod + "</div></div>"
      : "") +
    "</div>" +
    '<div class="drw-sec"><div class="drw-sec-title">Objeto e Recursos</div>' +
    '<div class="drw-field"><div class="drw-lbl">Descrição</div><div class="drw-val">' + e.obj_full + "</div></div>" +
    (e.valor !== "—"
      ? '<div class="drw-field"><div class="drw-lbl">Valor</div><div class="drw-val big">' + e.valor + "</div></div>"
      : "") +
    '<div class="drw-field"><div class="drw-lbl">Período</div><div class="drw-val">' + e.periodo + "</div></div>" +
    '<div class="drw-field"><div class="drw-lbl">Público-alvo</div><div class="drw-val">' + e.publico + "</div></div>" +
    "</div>" +
    '<div class="drw-sec"><div class="drw-sec-title">Documentos</div><div class="drw-docs">' +
    '<a class="drw-doc' + (e.crono ? "" : " off") + '" href="#" data-doc="' + (e.crono ? "Cronograma de Execução" : "") + '">' +
    pdfSvg(e.crono ? "#3b82f6" : "#9ca3af") +
    '<span class="drw-doc-lbl" style="color:' + (e.crono ? "#3b82f6" : "#9ca3af") + '">Cronograma<br>de Execução</span></a>' +
    '<a class="drw-doc' + (e.pt ? "" : " off") + '" href="#" data-doc="' + (e.pt ? "Plano de Trabalho" : "") + '">' +
    pdfSvg(e.pt ? "#f97316" : "#9ca3af") +
    '<span class="drw-doc-lbl" style="color:' + (e.pt ? "#f97316" : "#9ca3af") + '">Plano de<br>Trabalho</span></a>' +
    '<a class="drw-doc' + (e.nf ? "" : " off") + '" href="#" data-doc="' + (e.nf ? "Nota Fiscal / Comprovante" : "") + '">' +
    pdfSvg(e.nf ? "#22c55e" : "#9ca3af") +
    '<span class="drw-doc-lbl" style="color:' + (e.nf ? "#22c55e" : "#9ca3af") + '">Nota Fiscal /<br>Comprovante</span></a>' +
    "</div></div>";

  document.getElementById("d-body").innerHTML = html;

  // Wire up drawer doc buttons after injecting HTML
  document.querySelectorAll("#d-body .drw-doc:not(.off)").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      alert(btn.dataset.doc + "\n(link configurado pelo TI)");
    });
  });

  document.getElementById("ov").classList.add("open");
  document.getElementById("drw").classList.add("open");
}

function fechar() {
  document.getElementById("ov").classList.remove("open");
  document.getElementById("drw").classList.remove("open");
}

// Event listeners
document.getElementById("busca").addEventListener("input", filtrar);
document.getElementById("fStatus").addEventListener("change", filtrar);
document.getElementById("fTipo").addEventListener("change", filtrar);
document.getElementById("fSec").addEventListener("change", filtrar);
document.getElementById("ov").addEventListener("click", fechar);
document.getElementById("drw-close").addEventListener("click", fechar);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });

document.querySelectorAll("th[data-col]").forEach((th) => {
  th.addEventListener("click", () => ord(th.dataset.col, th));
});

filtrar();