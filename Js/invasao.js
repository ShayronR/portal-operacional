// ===============================
// 🤖 INVASÃO - Assistente Flutuante (VERSÃO LIMPA)
// Shayron - Portal Logística MDB
// ===============================

if (window.__INVASAO_JA_INICIOU__) {
  console.log("⚠️ INVASÃO já iniciou, ignorando novo start...");
} else {
  window.__INVASAO_JA_INICIOU__ = true;
}

window.INVASAO = window.INVASAO || {};

const INVASAO_STATE = {
  aberto: true,
  falaIdx: 0,
  serverOnline: false,
  jaPingou: false,
  timerFalas: null,
  timerPing: null,
  
  travarFalas: false,
  timerDestravar: null
};

// ===============================
// UI: abrir / minimizar
// ===============================
window.INVASAO.minimizar = function () {
  const wrap = document.getElementById("invasaoWrap");
  const min = document.getElementById("invasaoMin");
  if (wrap) wrap.style.display = "none";
  if (min) min.style.display = "block";
  INVASAO_STATE.aberto = false;
};

window.INVASAO.abrir = function () {
  const wrap = document.getElementById("invasaoWrap");
  const min = document.getElementById("invasaoMin");
  if (wrap) wrap.style.display = "block";
  if (min) min.style.display = "none";
  INVASAO_STATE.aberto = true;
};

// ===============================
// Helpers
// ===============================
function getSaudacao() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

function getNomeUsuario() {
  const u = localStorage.getItem("usuario");
  if (u && u.trim()) return u.trim();
  return "Chefe";
}

function setTexto(id, texto) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.opacity = "0";
  el.style.transform = "translateY(2px)";

  setTimeout(() => {
    el.innerText = texto;
    el.style.opacity = "1";
    el.style.transform = "translateY(0px)";
  }, 140);
}

function setBadgeOnline(isOnline) {
  const badge = document.getElementById("invasaoBadge");
  if (!badge) return;

  if (isOnline) {
    badge.classList.remove("off");
    badge.classList.add("on");
    badge.innerText = "● ON";
  } else {
    badge.classList.remove("on");
    badge.classList.add("off");
    badge.innerText = "● OFF";
  }
}

// ===============================
// Página atual
// ===============================
function getPaginaAtual() {
  const p = (window.location.pathname || "").toLowerCase();

  if (p.includes("dashboards.html")) return "DASHBOARDS";
  if (p.includes("dash_docas.html")) return "DOCAS";
  if (p.includes("dash_produtividade_operacional.html")) return "PROD_OP";
  if (p.includes("reporte") || p.includes("reporte expedicao.html")) return "REPORTE";
  if (p.includes("shelf_drp.html")) return "SHELF";
  if (p.includes("efeito_colmeia.html")) return "COLMEIA";
  if (p.includes("produtividade_drp_exp.html")) return "DRP_EXP";
  if (p.includes("ocupacao_estoque.html")) return "Ocupacao_Estoque";
 
  return "GERAL";
}

// ===============================
// Falas por página
// ===============================
function getFalas() {
  const nome = getNomeUsuario();
  const saud = getSaudacao();
  const pag = getPaginaAtual();

  const base = [
    `${saud}, ${nome}! 😄`,
    `Bora deixar os números 100% 🔥`,
    `Se quiser eu verifico a fila 📋`,
    `Só mandar que eu executo 😎`,
    `Partiu produtividade total 💪`
  ];

  const porPagina = {
    DASHBOARDS: [
      `${saud}, ${nome}! 📊`,
      `Quer atualizar os dashboards de hoje? ⚡`,
      `Aqui eu já te dou os botões certos 😈`,
      `Escolhe a missão e deixa comigo 🚀`
    ],
    DOCAS: [
      `Docas na área 🚪`,
      `Quer rodar atualização completa das Docas? 🔄`,
      `Bora destravar o pátio 😎`
    ],
    PROD_OP: [
      `Produtividade Operacional 💪`,
      `Separação + Expedição + Recebimento hoje vai voar 🚀`,
      `Quer rodar Separação agora? 🏗️`,
      `Quer rodar Expedição agora? 🚚`,
      `Quer rodar Recebimento agora? 🏗️`
    ],
    REPORTE: [
      `Reporte Expedição 📦`,
      `Quer atualização completa? 🔄`,
      `OTM + Acompanhamento + Coleta? 😈`,
      `No completo eu monitoro as etapas 🧠`
    ],
    SHELF: [
      `Shelf DRP 🧊`,
      `Quer atualizar o Shelf agora? ⚡`,
      `Se tiver corte eu te ajudo a enxergar 😎`
    ],
    COLMEIA: [
      `Efeito Colmeia 🐝`,
      `Quer extrair estoque + alocação? 📦🏗️`,
      `Bora otimizar endereço e fração 🔥`
    ],
    DRP_EXP: [
      `DRP + EXP TON 📊📦`,
      `Aqui é só converter o que já foi salvo 😄`,
      `Quer atualizar o TON agora? ⚡`
    ],
    Ocupacao_Estoque: [
      `Ocupação do Estoque 📦`,
      `Aqui é só converter o que já foi salvo 😄`,
      `Quer atualizar a Ocupação do estoque agora? ⚡`
    ],
    GERAL: [
      `${saud}, ${nome}! 🤖`,
      `Tô de olho no servidor 👀`,
      `Quer que eu te ajude a atualizar algo?`
    ]
  };

  const lista = porPagina[pag] || porPagina.GERAL;
  return [...lista, ...base];
}

// ===============================
// Botões por página
// ===============================
function renderAcoes() {
  const area = document.getElementById("invasaoAcoes");
  if (!area) return;

  let timerMonitor = null;

  function pararMonitor() {
    if (timerMonitor) {
      clearTimeout(timerMonitor);
      timerMonitor = null;
    }
  }

  async function monitorarStatus() {
    pararMonitor();

    const texto = document.getElementById("invasaoTexto");
    if (!texto) return;

    if (!window.MACRO_CORE || !window.MACRO_CORE.SERVER_URL) return;

    const url = window.MACRO_CORE.SERVER_URL;
    const clientId = localStorage.getItem("client_id");

    try {
      const r = await fetch(`${url}/status?client_id=${clientId}`, { cache: "no-store" });
      const data = await r.json();

      if (data.status === "aguardando") {
        texto.innerText = `📋 Aguardando na fila...`;
        timerMonitor = setTimeout(monitorarStatus, 1500);
        return;
      }

      if (data.status === "executando") {
        texto.innerText = `▶️ Executando: ${data.comando || ""}`;
        timerMonitor = setTimeout(monitorarStatus, 1500);
        return;
      }

      if (data.status === "concluido") {
        texto.innerText = `✅ Concluído!`;
        pararMonitor();

        if (INVASAO_STATE.timerDestravar) clearTimeout(INVASAO_STATE.timerDestravar);
        INVASAO_STATE.timerDestravar = setTimeout(() => {
          INVASAO_STATE.travarFalas = false;
          trocarFala();
        }, 4000);

        return;
      }

      if (data.status === "erro") {
        texto.innerText = `❌ Erro: ${data.mensagem || "Falha na execução"}`;
        pararMonitor();

        if (INVASAO_STATE.timerDestravar) clearTimeout(INVASAO_STATE.timerDestravar);
        INVASAO_STATE.timerDestravar = setTimeout(() => {
          INVASAO_STATE.travarFalas = false;
          trocarFala();
        }, 6000);

        return;
      }

      texto.innerText = `ℹ️ Status: ${data.status || "—"}`;
      timerMonitor = setTimeout(monitorarStatus, 1500);

    } catch (e) {
      texto.innerText = `⚠️ Não consegui ler o status agora...`;
      timerMonitor = setTimeout(monitorarStatus, 2000);
    }
  }

  const pag = getPaginaAtual();

  const criarBotao = (label, comando) => {
    const b = document.createElement("button");
    b.className = "invasao-btn";
    b.innerText = label;

    b.onclick = () => {
      const texto = document.getElementById("invasaoTexto");

      if (!window.MACRO_CORE || !window.MACRO_CORE.executarMacro) {
        if (texto) texto.innerText = "⚠️ macro_core.js não carregou ainda...";
        return;
      }

      if (!INVASAO_STATE.serverOnline) {
        if (texto) texto.innerText = "😭 Servidor OFF… liga o Python aí primeiro!";
        return;
      }

      if (texto) texto.innerText = `🚀 Missão iniciada: ${label}`;

      INVASAO_STATE.travarFalas = true;

      pararMonitor(); // 🔥 importante
      window.MACRO_CORE.executarMacro(comando);

      setTimeout(monitorarStatus, 700);
    };

    return b;
  };

  area.innerHTML = "";

  if (pag === "DASHBOARDS") {
    area.appendChild(criarBotao("📦 Reporte Expedição (Completo)", "EXECUTOR"));
    area.appendChild(criarBotao("🏗️ Produtividade Separação", "EXTRAIR_PRODUTIVIDADE_SEPARACAO"));
    area.appendChild(criarBotao("🏗️ Produtividade Expedição", "EXTRAIR_PRODUTIVIDADE_EXPEDICAO"));
    area.appendChild(criarBotao("🏗️ Produtividade Recebimento", "Produtividade Recebimento"));
    area.appendChild(criarBotao("🚪 Atualizar Docas", "DOCAS_EXECUTOR"));
    area.appendChild(criarBotao("🧊 Atualizar Shelf DRP", "Shelf DRP"));
    area.appendChild(criarBotao("🐝 Atualizar Efeito Colmeia", "EFEITO_COLMEIA"));
    area.appendChild(criarBotao("📊 DRP + EXP (TON)", "Produtividade DRP_EXP"));
    area.appendChild(criarBotao("📦 Ocupação do Estoque", "Ocupação do Estoque"));
    return;
  }

  if (pag === "REPORTE") {
    area.appendChild(criarBotao("🔄 Atualização Completa", "EXECUTOR"));
    area.appendChild(criarBotao("📊 OTM", "OTM"));
    area.appendChild(criarBotao("🚚 Acompanhamento WMS", "ACOMPANHAMENTO_WMS"));
    area.appendChild(criarBotao("🏗️ Coleta WMS", "COLETA_WMS"));
    return;
  }

  if (pag === "DOCAS") {
    area.appendChild(criarBotao("🚪 Atualização Completa Docas", "DOCAS_EXECUTOR"));
    return;
  }

  if (pag === "PROD_OP") {
    area.appendChild(criarBotao("🏗️ Rodar Separação", "EXTRAIR_PRODUTIVIDADE_SEPARACAO"));
    area.appendChild(criarBotao("🏗️ Rodar Expedição", "EXTRAIR_PRODUTIVIDADE_EXPEDICAO"));
    area.appendChild(criarBotao("🏗️ Rodar Recebimento", "Produtividade Recebimento"));
    return;
  }

  if (pag === "SHELF") {
    area.appendChild(criarBotao("🧊 Atualizar Shelf DRP", "Shelf DRP"));
    return;
  }

  if (pag === "COLMEIA") {
    area.appendChild(criarBotao("🐝 Executar Colmeia", "EFEITO_COLMEIA"));
    return;
  }

  if (pag === "DRP_EXP") {
    area.appendChild(criarBotao("📊📦 Atualizar TON", "Produtividade DRP_EXP"));
    return;
  }

  if (pag === "Ocupacao_Estoque") {
    area.appendChild(criarBotao("📦 Ocupação do Estoque", "Ocupação do Estoque"));
    return;
  }

  const info = document.createElement("div");
  info.className = "invasao-info";
  info.innerText = "😄 Tô pronto! Escolhe um card aí em cima.";
  area.appendChild(info);
}


// ===============================
// Trocar fala
// ===============================
function trocarFala() {

  if (INVASAO_STATE.travarFalas) return;

  const falas = getFalas();
  const frase = falas[INVASAO_STATE.falaIdx % falas.length];
  INVASAO_STATE.falaIdx++;

  if (INVASAO_STATE.jaPingou && !INVASAO_STATE.serverOnline && Math.random() < 0.35) {
    setTexto("invasaoTexto", `Servidor OFF 😭 (liga o Python aí, ${getNomeUsuario()}!)`);
    return;
  }

  if (!INVASAO_STATE.aberto) {
    mostrarBalaoMini(frase, 5000);
  }

  setTexto("invasaoTexto", frase);
}

// ===============================
// Ping servidor
// ===============================
async function pingServidor() {
  try {
    if (!window.MACRO_CORE || !window.MACRO_CORE.SERVER_URL) {
      INVASAO_STATE.serverOnline = false;
      INVASAO_STATE.jaPingou = true;
      setBadgeOnline(false);
      return;
    }

    const url = window.MACRO_CORE.SERVER_URL;
    const r = await fetch(`${url}/ping`, { cache: "no-store" });
    await r.json();

    INVASAO_STATE.serverOnline = true;
    INVASAO_STATE.jaPingou = true;
    setBadgeOnline(true);

  } catch (e) {
    INVASAO_STATE.serverOnline = false;
    INVASAO_STATE.jaPingou = true;
    setBadgeOnline(false);
  }
}

// ===============================
// Mini balão
// ===============================
function setMiniTexto(texto) {
  const el = document.getElementById("invasaoMiniTexto");
  if (!el) return;
  el.innerText = texto;
}

function mostrarBalaoMini(texto, autoHideMs = 6000) {
  const balao = document.getElementById("invasaoBalaoMini");
  if (!balao) return;

  setMiniTexto(texto);
  balao.classList.remove("hide");

  if (autoHideMs > 0) {
    setTimeout(() => {
      balao.classList.add("hide");
    }, autoHideMs);
  }
}

// ===============================
// Start
// ===============================
function iniciarInvasao() {
  if (INVASAO_STATE.timerFalas) clearInterval(INVASAO_STATE.timerFalas);
  if (INVASAO_STATE.timerPing) clearInterval(INVASAO_STATE.timerPing);

  setTexto("invasaoSaudacao", getSaudacao());
  renderAcoes();

  INVASAO.minimizar();
  mostrarBalaoMini("Quer atualizar os dashboards de hoje? ⚡", 7000);

  pingServidor();
  INVASAO_STATE.timerPing = setInterval(pingServidor, 5000);

  trocarFala();
  INVASAO_STATE.timerFalas = setInterval(trocarFala, 4500);
}

window.addEventListener("load", () => {
  iniciarInvasao();
});
