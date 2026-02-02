// ===============================
// UTILITÁRIOS
// ===============================
function extrairRemessa(pedido) {
  if (!pedido) return null;
  const nums = pedido.replace(/\D/g, "");
  if (nums.length < 10) return null;
  return nums.substring(3, 10); // 7 dígitos após 000
}

function extrairDoca(packing) {
  if (!packing) return "-";
  return packing.slice(-2);
}



// ===============================
// PROCESSAMENTO PRINCIPAL
// ===============================
function montarDocas() {
  const tbody = document.getElementById("tabelaDocas");
  tbody.innerHTML = "";

  const DOCAS = window.DOCAS || [];

  if (!DOCAS.length) {
    console.warn("⚠️ Nenhum dado em window.DOCAS");
    return;
  }

  // 1️⃣ Remessas pendentes (Docas_Status)
  const remessasPendentes = new Map();

  DOCAS.forEach(r => {
    if (!r.status_nf) return; // regra: status existe só no Docas_Status

    const remessa = extrairRemessa(r.pedido_venda);
    if (!remessa) return;

    remessasPendentes.set(remessa, {
      coleta: r.carga || "-"
    });
  });

  // 2️⃣ Cruzar com docas (Produtividade_Docas)
  const mapa = new Map();

  DOCAS.forEach(r => {
    if (!r.packing) return; // regra: packing existe só na produtividade

    const remessa = extrairRemessa(r.pedido_venda);
    if (!remessasPendentes.has(remessa)) return;

    const doca = extrairDoca(r.packing);
    const coleta = remessasPendentes.get(remessa).coleta;

    const chave = `${remessa}-${doca}`;

    if (!mapa.has(chave)) {
      mapa.set(chave, { remessa, doca, coleta });
    }
  });

  // 2.5️⃣ Contar quantas vezes cada remessa aparece NO MAPA (o que vai pra tela)
  const contador = {};
  mapa.forEach(r => {
    contador[r.remessa] = (contador[r.remessa] || 0) + 1;
  });

  // 3️⃣ Render
  mapa.forEach(r => {
    const tr = document.createElement("tr");

    // Se remessa aparece mais de 1 vez, marca duplicada
    if (contador[r.remessa] > 1) {
      tr.classList.add("linha-duplicada");
    }

    tr.innerHTML = `
      <td>${r.remessa}</td>
      <td>${r.doca}</td>
      <td>${r.coleta}</td>
    `;
    tbody.appendChild(tr);
  });

  aplicarFiltros();
}

// ===============================
// FILTROS
// ===============================
function aplicarFiltros() {
  const filtroRemessa = document.getElementById("filtroRemessa").value.trim();
  const filtroDoca = document.getElementById("filtroDoca").value.trim();

  document.querySelectorAll("#tabelaDocas tr").forEach(tr => {
    const remessa = tr.children[0].innerText;
    const doca = tr.children[1].innerText;

    const ok =
      (!filtroRemessa || remessa.includes(filtroRemessa)) &&
      (!filtroDoca || doca.includes(filtroDoca));

    tr.style.display = ok ? "" : "none";
  });
}

// ===============================
// AÇÕES
// ===============================
function imprimirPagina() {
  window.print();
}

document.addEventListener("DOMContentLoaded", montarDocas);

