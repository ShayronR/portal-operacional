// =======================================
// OCUPAÇÃO DO ESTOQUE - DASH DIÁRIO
// =======================================

const ESTOQUE = window.OCUPACAO_ESTOQUE || [];
const CAPACIDADE = window.CAPACIDADE_ARMAZEM || [];

// ELEMENTOS
const elData = document.getElementById("filtroData");

const cardCapPlt   = document.getElementById("cardCapPlt");
const cardPltOcup  = document.getElementById("cardPltOcup");
const cardPercPlt  = document.getElementById("cardPercPlt");

const cardTotalEnd = document.getElementById("cardTotalEnd");
const cardEndOcup  = document.getElementById("cardEndOcup");
const cardPercEnd  = document.getElementById("cardPercEnd");

const cardColmeiaPlt  = document.getElementById("cardColmeiaPlt");
const cardColmeiaPerc = document.getElementById("cardColmeiaPerc");

const cardGeral    = document.getElementById("cardOcupGeral");
const elUlt        = document.getElementById("ultimaAtualizacao");

// boxes (para trocar cor)
const cardEndBox = document.getElementById("cardEndBox");

const SETORIZACOES_IGNORADAS = ["picking", "porta palete", "porta-palete", "porta paletes"];

// CHARTS
let chartDiario = null;
let chartSetor  = null;

// ==========================
// UTIL
// ==========================
function normText(v){
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

// corrige alguns “Ã‡ÃƒO” etc do Senior/Excel
function fixMojibake(s){
  const x = String(s ?? "");
  const map = {
    "EXPORTAÃ‡ÃƒO": "EXPORTAÇÃO",
    "EXPORTAÃ‡AO": "EXPORTAÇÃO",
    "CAMARA FRIA": "CÂMARA FRIA",
    "GRU - CAMARA FRIA": "GRU - CÂMARA FRIA"
  };
  const k = normText(x);
  return map[k] || x;
}

function isIgnorada(setorizacao){
  const t = String(setorizacao ?? "").toLowerCase();
  return SETORIZACOES_IGNORADAS.some(s => t.includes(s));
}

// ==========================
// LEGENDA (Setor -> Setorização) - SUA TABELA
// ==========================
const LEGENDA_SETOR_SETORIZACAO = [
  ["RUA 01 -  NÍVEL 1 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 01 - NÍVEL 2 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 01 - NÍVEL 3 ALT VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 01 - NÍVEL 3 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 01 - NÍVEL 4 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 01 - NÍVEL 5 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 02 - NÍVEL 1 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 02 - NÍVEL 2 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 02 - NÍVEL 3 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 02 - NÍVEL 4 VITARELLA E PLUGADOS", "Vitarella e Plugados"],
  ["RUA 02 - NÍVEL 5 VITARELLA E PLUGADOS", "Vitarella e Plugados"],

  ["RUA 03 - NÍVEL 1 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],
  ["RUA 03 - NÍVEL 2 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],
  ["RUA 03 - NÍVEL 3 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],

  ["RUA 04 - NÍVEL 1 ALT PLUGADOS", "Plugados"],
  ["RUA 04 - NÍVEL 2 ALT PLUGADOS", "Plugados"],
  ["RUA 04 - NÍVEL 2 TORTINHAS", "Tortinhas"],
  ["RUA 04 - NÍVEL 3 ALT PLUGADOS", "Plugados"],
  ["RUA 04 - NÍVEL 3 TORTINHAS", "TORTINHAS"],
  ["RUA 04 - NÍVEL 4 ALT PLUGADOS", "Plugados"],
  ["RUA 04 - NÍVEL 4 INSTANTANEO", "Instantaneo"],
  ["RUA 04 - NÍVEL 5 ALT PLUGADOS", "Plugados"],
  ["RUA 04 - NÍVEL 5 INSTANTANEO", "Instantaneo"],

  ["RUA 05 - NÍVEL 1 ALT PULMAO", "Piraque"],
  ["RUA 05 - NÍVEL 1 FARINHAS", "Farinha"],
  ["RUA 05 - NÍVEL 2 ALT PULMAO", "Piraque"],
  ["RUA 05 - NÍVEL 2 PIRAQUE", "Piraque"],
  ["RUA 05 - NÍVEL 3 ALT PULMAO", "Piraque"],
  ["RUA 05 - NÍVEL 3 IMPAR PIRAQUE", "Piraque"],
  ["RUA 05 - NÍVEL 3 PIRAQUE", "Piraque"],
  ["RUA 05 - NÍVEL 4 ALT PULMAO", "Piraque"],
  ["RUA 05 - NÍVEL 4 PIRAQUE", "Piraque"],
  ["RUA 05 - NÍVEL 5 ALT PULMAO", "Piraque"],
  ["RUA 05 - NÍVEL 5 PIRAQUE", "Piraque"],

  ["RUA 06 - NÍVEL 1 MASSAS", "Massas"],
  ["RUA 06 - NÍVEL 2 MASSAS", "Massas"],
  ["RUA 06 - NÍVEL 3 MASSAS", "Massas"],
  ["RUA 06 - NÍVEL 4 MASSAS", "Massas"],
  ["RUA 06 - NÍVEL 5 MASSAS", "Massas"],

  ["RUA 07 - NÍVEL 1 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],
  ["RUA 07 - NÍVEL 2 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],
  ["RUA 07 - NÍVEL 3 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],

  ["RUA 08 - NÍVEL 1 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],
  ["RUA 08 - NÍVEL 2 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],
  ["RUA 08 - NÍVEL 3 FOLHATA/CRACKERS/TORRADAS", "Folhata - Crackers e Torradas"],

  ["PICKING", "Picking"],
  ["GRU - CAMARA FRIA", "Camara Fria"],
  ["EXPORTAÇÃO", "Exportação"],
  ["PORTA PALETE", "Porta Palete"],
];

// cria mapa normalizado
const MAP_SETOR_TO_SETORIZACAO = (() => {
  const m = {};
  LEGENDA_SETOR_SETORIZACAO.forEach(([setor, setorizacao]) => {
    const key = normText(fixMojibake(setor));
    m[key] = setorizacao;
  });
  return m;
})();

function getSetorizacaoBySetor(setor){
  const key = normText(fixMojibake(setor));
  return MAP_SETOR_TO_SETORIZACAO[key] || "Sem Setorização";
}

// =======================================
// INIT
// =======================================
init();

function init() {
  carregarDatas();
  aplicarCalculos();
  elData.addEventListener("change", aplicarCalculos);
}

// =======================================
// DATA
// =======================================
function carregarDatas() {
  const datas = [...new Set(ESTOQUE.map(e => e.Data))].sort();
  datas.forEach(d => {
    const op = document.createElement("option");
    op.value = d;
    op.textContent = d;
    elData.appendChild(op);
  });
  elData.value = datas[datas.length - 1];
}

// =======================================
// CÁLCULOS + GRÁFICOS
// =======================================
function aplicarCalculos() {
  const dataAtiva = elData.value;

  // ===== ESTOQUE DO DIA =====
  const estoqueDia = ESTOQUE.filter(e => e.Data === dataAtiva);

  // ===== PLT por Local =====
  const pltPorLocal = {};
  estoqueDia.forEach(e => {
    const l = e.Local;
    const q = Number(e["Qtd PLT"] || 0);
    pltPorLocal[l] = (pltPorLocal[l] || 0) + q;
  });

  // ===== CAPACIDADE TOTAL =====
  const capacidadeTotalPLT = CAPACIDADE.reduce(
    (s, c) => s + Number(c.CAPACIDADE || 0), 0
  );

  // ===== ENDEREÇOS + PLT OCUPADO =====
  const totalEnd = CAPACIDADE.length;
  let endOcup = 0;
  let pltOcup = 0;

  CAPACIDADE.forEach(c => {
    const plt = pltPorLocal[c.Local] || 0;
    if (plt > 0) endOcup++;
    pltOcup += plt;
  });

  const percEnd = totalEnd ? (endOcup / totalEnd) * 100 : 0;
  const percPlt = capacidadeTotalPLT ? (pltOcup / capacidadeTotalPLT) * 100 : 0;

  // ===== CARDS =====
  cardCapPlt.textContent  = capacidadeTotalPLT.toLocaleString("pt-BR");
  cardPltOcup.textContent = pltOcup.toLocaleString("pt-BR");
  cardPercPlt.textContent = percPlt.toFixed(1) + "%";

  cardTotalEnd.textContent = totalEnd.toLocaleString("pt-BR");
  cardEndOcup.textContent  = endOcup.toLocaleString("pt-BR");
  cardPercEnd.textContent  = percEnd.toFixed(1) + "%";

  cardGeral.textContent = ((percEnd + percPlt) / 2).toFixed(1) + "%";
  elUlt.textContent = `Base: ${dataAtiva}`;

  // ===== ALERTA NO CARD ENDEREÇOS (75 amarelo / 80 laranja / >80 vermelho) =====
  cardEndBox.classList.remove("warn-yellow", "warn-orange", "warn-red");
  if (percEnd >= 80) {
    cardEndBox.classList.add("warn-red");
  } else if (percEnd >= 75) {
    cardEndBox.classList.add("warn-orange");
  }

  // ===== EFEITO COLMEIA =====
  let perdaColmeiaPLT = 0;
  CAPACIDADE.forEach(c => {
    const cap = Number(c.CAPACIDADE || 0);
    const plt = pltPorLocal[c.Local] || 0;
    if (plt > 0 && plt < cap) perdaColmeiaPLT += (cap - plt);
  });

  const percColmeia = capacidadeTotalPLT
    ? (perdaColmeiaPLT / capacidadeTotalPLT) * 100
    : 0;

  cardColmeiaPerc.textContent = percColmeia.toFixed(1) + "%";
  cardColmeiaPlt.textContent  = perdaColmeiaPLT.toLocaleString("pt-BR");

  // ===== GRÁFICOS =====
  montarGraficoDiario();
  montarGraficoSetorizacao(dataAtiva);
}

// =======================================
// GRÁFICO 1 — HISTÓRICO DIÁRIO
// =======================================
function montarGraficoDiario() {
  if (chartDiario) chartDiario.destroy();

  const datas = [...new Set(ESTOQUE.map(e => e.Data))].sort();
  const percPLT = [];
  const percEnd = [];

  // cap total constante
  const capTotal = CAPACIDADE.reduce((s,c)=>s+Number(c.CAPACIDADE||0),0);

  datas.forEach(data => {
    const estoqueDia = ESTOQUE.filter(e => e.Data === data);

    const pltPorLocal = {};
    estoqueDia.forEach(e => {
      pltPorLocal[e.Local] = (pltPorLocal[e.Local] || 0) + Number(e["Qtd PLT"] || 0);
    });

    let pltOcup = 0;
    let endOcup = 0;

    CAPACIDADE.forEach(c => {
      const plt = pltPorLocal[c.Local] || 0;
      if (plt > 0) endOcup++;
      pltOcup += plt;
    });

    percPLT.push(capTotal ? (pltOcup / capTotal) * 100 : 0);
    percEnd.push(CAPACIDADE.length ? (endOcup / CAPACIDADE.length) * 100 : 0);
  });

  chartDiario = new Chart(document.getElementById("graficoDiario"), {
    type: "bar",
    data: {
      labels: datas,
      datasets: [
        {
          label: "% PLT",
          data: percPLT,
          backgroundColor: "rgba(31,111,235,0.85)",
          borderRadius: 10,
          barThickness: 46
        },
        {
          label: "% Endereços",
          data: percEnd,
          backgroundColor: "rgba(43,140,255,0.85)",
          borderRadius: 10,
          barThickness: 46
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color:"#eaf2ff", boxWidth:14, font:{ weight:"600" } }
        },
        datalabels: {
          color: "#ffffff",
          anchor: "end",
          align: "top",
          offset: 4,
          formatter: v => v.toFixed(1) + "%",
          font: { weight: "800", size: 11 }
        }
      },
      scales: {
        y: {
          max: 100,
          grid: { color: "rgba(255,255,255,.05)" },
          ticks:{ color:"rgba(234,242,255,.7)", callback:v=>v+"%" }
        },
        x: {
          grid:{ display:false },
          ticks:{ color:"rgba(234,242,255,.65)" }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// =======================================
// GRÁFICO 2 — SETORIZAÇÃO (CERTO MESMO)
// cap = CAPACIDADE.Setor
// ocup = ESTOQUE.Setor
// agrega por Setorização (pela legenda)
// =======================================
function montarGraficoSetorizacao(dataAtiva){

  if (chartSetor) chartSetor.destroy();

  // ===== PLT por Local (estoque do dia) =====
  const estoqueDia = ESTOQUE.filter(e => e.Data === dataAtiva);
  const pltPorLocal = {};

  estoqueDia.forEach(e => {
    pltPorLocal[e.Local] =
      (pltPorLocal[e.Local] || 0) + Number(e["Qtd PLT"] || 0);
  });

  // ===== Acumular por Setorização =====
  const capPorSetorizacao = {};
  const pltPorSetorizacao = {};

  CAPACIDADE.forEach(c => {
    const setorizacao = c.Setorização;
    if (!setorizacao) return;

    // ❌ IGNORAR PICKING
    if (setorizacao.toLowerCase().includes("picking")) return;


    const cap = Number(c.CAPACIDADE || 0);
    const plt = pltPorLocal[c.Local] || 0;

    capPorSetorizacao[setorizacao] =
      (capPorSetorizacao[setorizacao] || 0) + cap;

    pltPorSetorizacao[setorizacao] =
      (pltPorSetorizacao[setorizacao] || 0) + plt;
  });

  // ===== Percentual =====
  const dados = Object.keys(capPorSetorizacao).map(s => ({
    setorizacao: s,
    perc: capPorSetorizacao[s]
      ? (pltPorSetorizacao[s] / capPorSetorizacao[s]) * 100
      : 0
  }));

  dados.sort((a,b) => b.perc - a.perc);

  // ===== Cor por regra =====
  const corPorPerc = v => {
    if (v >= 85) return "rgba(244,67,54,.9)";   // vermelho
    if (v >= 75) return "rgba(255,152,0,.9)";  // laranja
    return "rgba(31,111,235,.9)";              // azul
  };

  // ===== Chart =====
  chartSetor = new Chart(
    document.getElementById("graficoSetorizacao"),
    {
      type: "bar",
      data: {
        labels: dados.map(d => d.setorizacao),
        datasets: [{
          data: dados.map(d => d.perc),
          backgroundColor: dados.map(d => corPorPerc(d.perc)),
          borderRadius: 10,
          barThickness: 26
        }]
      },
      options: {
        indexAxis: "y",
        plugins:{
          legend:{ display:false },
          datalabels:{
            color:"#fff",
            anchor:"end",
            align:"right",
            formatter:v=>v.toFixed(1)+"%",
            font:{ weight:"800", size:11 }
          }
        },
        scales:{
          x:{
            max:100,
            ticks:{ callback:v=>v+"%" }
          },
          y:{ grid:{ display:false } }
        }
      },
      plugins:[ChartDataLabels]
    }
  );
}

