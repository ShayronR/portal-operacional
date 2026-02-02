// =====================================================
// 🤖 MACRO_CORE.JS  (Assistente Operacional Universal)
// Shayron - Portal Logística MDB
// =====================================================

// ===== DETECÇÃO AUTOMÁTICA DE URL =====
let SERVER_URL;
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  SERVER_URL = "http://localhost:8089";
  console.log("🔧 Modo LOCAL:", SERVER_URL);
} else {
  SERVER_URL = "http://10.148.18.8:8089";
  console.log("🌐 Modo REDE:", SERVER_URL);
}

// ===== CONTROLE DE INTERVALOS =====
window.intervalos = window.intervalos || {};

// ===== ID ÚNICO DO PC =====
function getClientId() {
  let id = localStorage.getItem("client_id");
  if (!id) {
    id = "PC_" + Math.random().toString(16).slice(2) + "_" + Date.now();
    localStorage.setItem("client_id", id);
  }
  return id;
}

// =====================================================
// ✅ MACROS DISPONÍVEIS (IDs iguais ao teu config)
// =====================================================
const MACROS = {
  EXECUTOR: { nome: "🔄 Atualização Completa" },
  OTM: { nome: "📊 OTM" },
  ACOMPANHAMENTO_WMS: { nome: "🚚 Acompanhamento WMS" },
  COLETA_WMS: { nome: "🏗️ Coleta WMS" },

  EFEITO_COLMEIA: { nome: "🐝 Efeito Colmeia" },

  EXTRAIR_PRODUTIVIDADE_SEPARACAO: { nome: "🏗️ Produtividade Separação" },
  EXTRAIR_PRODUTIVIDADE_EXPEDICAO: { nome: "🏗️ Produtividade Expedição" },

  DOCAS_EXECUTOR: { nome: "🚪 Docas - Atualização Completa" },

  "Produtividade DRP_EXP": { nome: "📊📦 Atualizar DRP + Exp TON" },

  "Shelf DRP": { nome: "🧊 Shelf DRP" },

  "Executor Dividir Lote": { nome: "✂️ Dividir Lote - Completo" },
  "Dividir Lote": { nome: "✂️ Dividir Lote" }
};

// =====================================================
// 🤖 ASSISTENTE (fala + servidor on/off)
// =====================================================
let roboTimer = null;
let serverTimer = null;
let idxFala = 0;
let serverOnline = false;

function getSaudacao() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

function getNomeUsuarioAtual() {
  const u = localStorage.getItem("usuario");
  if (u && u.trim()) return u.trim();

  const el = document.getElementById("nomeUsuario");
  if (el && el.innerText.trim()) return el.innerText.trim();

  return "Chefe";
}

function setFalaTexto(texto) {
  const el = document.getElementById("falaTexto");
  if (!el) return;

  el.style.opacity = "0";
  el.style.transform = "translateY(2px)";

  setTimeout(() => {
    el.innerText = texto;
    el.style.opacity = "1";
    el.style.transform = "translateY(0px)";
  }, 180);
}

function setServerStatus(isOnline) {
  const badge = document.getElementById("serverBadge");
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

function getFalasBase() {
  const nome = getNomeUsuarioAtual();
  const saudacao = getSaudacao();

  return [
    `${saudacao}, ${nome}! 😄`,
    `O que vamos atualizar hoje? ⚡`,
    `Bora acelerar, ${nome}! 🚀`,
    `Quer que eu rode as macros? 🔄`,
    `Partiu atualizar os dashboards 📊`,
    `Se quiser, eu já verifico a fila 📋`,
    `Hoje é produtividade total 💪`,
    `Só mandar que eu executo 😎`,
    `Bora deixar tudo 100% 🔥`
  ];
}

function trocarFalaRobo() {
  const falas = getFalasBase();
  const frase = falas[idxFala % falas.length];
  idxFala++;

  if (!serverOnline && Math.random() < 0.35) {
    setFalaTexto(`Servidor OFF 😭 (liga o Python aí, ${getNomeUsuarioAtual()}!)`);
    return;
  }

  setFalaTexto(frase);
}

async function checarServidor() {
  try {
    const r = await fetch(`${SERVER_URL}/ping`, { cache: "no-store" });
    await r.json();

    serverOnline = true;
    setServerStatus(true);
    return true;
  } catch (e) {
    serverOnline = false;
    setServerStatus(false);
    return false;
  }
}

function iniciarAssistenteRobo() {
  if (roboTimer) clearInterval(roboTimer);
  if (serverTimer) clearInterval(serverTimer);

  trocarFalaRobo();
  roboTimer = setInterval(trocarFalaRobo, 4500);

  checarServidor();
  serverTimer = setInterval(checarServidor, 5000);
}

// =====================================================
// 🚀 EXECUTAR MACRO (universal)
// =====================================================
async function executarMacro(comando) {
  const body = document.getElementById("chat-body");
  if (body) body.innerHTML = `<div class="msg ia">⏳ Enviando comando...</div>`;

  console.log("EXECUTAR | client_id:", getClientId(), "| comando:", comando);

  try {
    const res = await fetch(`${SERVER_URL}/executar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comando, client_id: getClientId() })
    });

    const data = await res.json();

    if (body) {
      if (data.status === "sucesso" || data.status === "adicionado_fila") {
        body.innerHTML = `
          <div class="msg ia">✅ Comando enviado!</div>
          <div class="msg ia">📋 Posição na fila: ${data.posicao_fila || 1}</div>
          <button onclick="verificarFila()">📋 Ver fila</button>
        `;
      } else {
        body.innerHTML = `<div class="msg ia">❌ ${data.mensagem || "Resposta inesperada"}</div>`;
      }
    }

    return data;

  } catch (err) {
    if (body) {
      body.innerHTML = `
        <div class="msg ia">❌ Erro de conexão!</div>
        <div class="msg ia" style="font-size:12px; background:#ffebee; padding:10px; border-radius:8px;">
          <strong>Erro:</strong> ${err.message}<br>
          <strong>URL:</strong> ${SERVER_URL}
        </div>
        <button onclick="testarConexao()">🔧 Testar Servidor</button>
      `;
    }
    return null;
  }
}

// =====================================================
// 📋 VER FILA (universal)
// =====================================================
async function verificarFila() {
  const body = document.getElementById("chat-body");
  if (body) body.innerHTML = `<div class="msg ia">📋 Consultando fila...</div>`;

  try {
    const r = await fetch(`${SERVER_URL}/fila`, { cache: "no-store" });
    const data = await r.json();

    const totalFila = data.total_fila ?? 0;

    if (!body) return;

    if (totalFila === 0) {
      body.innerHTML = `
        <div class="msg ia">📋 Fila vazia</div>
        <div class="msg ia">Executando agora: <strong>${data.executando || "Nenhum"}</strong></div>
      `;
      return;
    }

    let html = `<div class="msg ia"><strong>📋 Fila de Execução</strong></div>`;
    html += `<div class="msg ia">Executando agora: <strong>${data.executando || "Nenhum"}</strong></div>`;
    html += `<div class="msg ia">Total na fila: <strong>${totalFila}</strong></div>`;

    if (data.comandos && data.comandos.length > 0) {
      html += `<div style="margin-top:10px;"><strong>⏳ Comandos:</strong></div>`;
      data.comandos.forEach((item, idx) => {
        const cmdId = item.comando;
        const nomeAmigavel = MACROS[cmdId]?.nome || cmdId;
        const cliente = item.client_id || "—";

        html += `
          <div style="background:#f5f5f5; padding:8px; margin:5px 0; border-radius:6px;">
            <div><strong>${idx + 1}.</strong> ${nomeAmigavel}</div>
            <div style="font-size:12px; opacity:.7;">Client: ${cliente}</div>
          </div>
        `;
      });
    }

    body.innerHTML = html;

  } catch (err) {
    if (body) {
      body.innerHTML = `
        <div class="msg ia">❌ Erro ao verificar fila: ${err.message}</div>
      `;
    }
  }
}

// =====================================================
// 🔧 TESTAR CONEXÃO
// =====================================================
async function testarConexao() {
  const body = document.getElementById("chat-body");
  if (body) body.innerHTML = `<div class="msg ia">🔍 Testando conexão...</div>`;

  try {
    const r = await fetch(`${SERVER_URL}/ping`, { cache: "no-store" });
    const d = await r.json();

    if (body) {
      body.innerHTML = `
        <div class="msg ia">✅ Servidor conectado!</div>
        <div class="msg ia" style="font-size:12px; background:#e8f5e9; padding:10px; border-radius:8px;">
          <strong>URL:</strong> ${SERVER_URL}<br>
          <strong>Status:</strong> ${d.status}<br>
          <strong>Timestamp:</strong> ${d.timestamp}<br>
          <strong>Macros disponíveis:</strong> ${d.macros_disponiveis ? d.macros_disponiveis.length : "N/A"}
        </div>
      `;
    }

  } catch (e) {
    if (body) {
      body.innerHTML = `
        <div class="msg ia">❌ Servidor não responde!</div>
        <div class="msg ia" style="font-size:12px; background:#ffebee; padding:10px; border-radius:8px;">
          <strong>URL tentada:</strong> ${SERVER_URL}<br>
          <strong>Erro:</strong> ${e.message}<br><br>
          <strong>Verifique:</strong><br>
          1. Servidor Python está rodando?<br>
          2. Porta 8089 está aberta?<br>
          3. Firewall bloqueando?
        </div>
      `;
    }
  }
}

// =====================================================
// 🎯 EXPOR FUNÇÕES GLOBAL (pra usar no onclick)
// =====================================================
window.MACRO_CORE = {
  SERVER_URL,
  executarMacro,
  verificarFila,
  testarConexao,
  iniciarAssistenteRobo,
  checarServidor
};

// =====================================================
// ⚡ AUTO START (se existir avatar na página)
// =====================================================
window.addEventListener("load", () => {
  if (document.getElementById("avatar-ia")) {
    iniciarAssistenteRobo();

    document.getElementById("avatar-ia")?.addEventListener("click", () => {
      trocarFalaRobo();
    });
  }
});
window.MACRO_CORE_READY = true;
console.log("✅ MACRO_CORE pronto!");
