// =====================================================
//               DASHBOARD OTM - CONTROLLER
//     (Funções de filtro, cards e tabela dinâmica)
// =====================================================

// ===== Base vem do arquivo gerado pelo Python =====
let baseOTM = Base_OTM;   // sempre aponta para a base atual


function parseDataBR(valor) {
    if (valor === null || valor === "" || valor === undefined) return null;

    // 👉 CASO 1: Timestamp em milissegundos (o seu caso)
    if (typeof valor === "number" && valor > 1000000000000) {
        return new Date(valor);
    }

    // 👉 CASO 2: Número Excel (ex: 45508.875)
    if (typeof valor === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + valor * 86400000);
    }

    // 👉 CASO 3: String contendo número Excel
    if (!isNaN(valor)) {
        const num = Number(valor);
        if (num > 1000000000000) return new Date(num);  // timestamp em string
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + num * 86400000);
    }

    // 👉 CASO 4: Data BR DD/MM/YYYY HH:MM
    if (typeof valor === "string" && valor.includes("/")) {
        const [data, hora] = valor.split(" ");
        const [dia, mes, ano] = data.split("/").map(Number);

        let h = 0, m = 0;
        if (hora && hora.includes(":"))
            [h, m] = hora.split(":").map(Number);

        return new Date(ano, mes - 1, dia, h, m);
    }

    // 👉 CASO 5: Última tentativa
    const d = new Date(valor);
    return isNaN(d) ? null : d;
}




// ===== Variáveis de controle de filtros =====
let filtroGlobal = {
    tipoEmbarque: null,
    dataInicio: null,
    dataFim: null,
};

// ===== Status selecionados nos cards (toggle) =====
const statusSelecionados = new Set();

// ===== Inicialização =====
document.addEventListener("DOMContentLoaded", () => {
    preencherDropdownTipoEmbarque();
    inicializarDatasPeloRange();
    registrarEventosCards();
    aplicarFiltrosGlobais();

    atualizarUltimaAtualizacaoOTM(); // <-- ADD AQUI

    const btnPng = document.getElementById("btnPng");
    if (btnPng) {
        btnPng.addEventListener("click", gerarPNGOTM);
    }

    setInterval(() => {
        atualizarTabela();
    }, 60000);
});





// =====================================================
//             DROPDOWN DE TIPO DE EMBARQUE
// =====================================================
function preencherDropdownTipoEmbarque() {
    const select = document.getElementById("filtroEmbarque");
    const tipos = new Set();

    baseOTM.forEach(item => {
        const t = item["Tipo de Embarque"];
        if (t) tipos.add(t);
    });

    select.innerHTML = "";
    tipos.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        select.appendChild(opt);
    });

    if (select.options.length > 0) {
        filtroGlobal.tipoEmbarque = select.options[0].value;
    }
}

// =====================================================
//                 DATAS (Filtro Agenda)
// =====================================================
function inicializarDatasPeloRange() {
    const hoje = new Date();
    const amanha = new Date(Date.now() + 86400000);

    document.getElementById("dataInicio").value = toInputDate(hoje);
    document.getElementById("dataFim").value = toInputDate(amanha);

    filtroGlobal.dataInicio = new Date(hoje.setHours(0, 0, 0, 0));
    filtroGlobal.dataFim = new Date(amanha.setHours(23, 59, 59, 999));
}


// =====================================================
//                  EVENTOS DOS CARDS
// =====================================================
function registrarEventosCards() {
    document.querySelectorAll(".card-status").forEach(card => {
        if (card.classList.contains("card-total")) {
            return; // Total não filtra
        }

        card.addEventListener("click", () => {
            const status = card.getAttribute("data-status");

            if (statusSelecionados.has(status)) {
                statusSelecionados.delete(status);
                card.classList.remove("ativo");
            } else {
                statusSelecionados.add(status);
                card.classList.add("ativo");
            }

            atualizarTabela();
        });
    });
}

// =====================================================
//         BOTÃO "APLICAR" → FILTROS GERAIS
// =====================================================
function aplicarFiltrosGlobais() {
    const select = document.getElementById("filtroEmbarque");
    const di = document.getElementById("dataInicio").value;
    const df = document.getElementById("dataFim").value;

    filtroGlobal.tipoEmbarque = select.value || null;
    filtroGlobal.dataInicio = di ? new Date(di + "T00:00:00") : null;
    filtroGlobal.dataFim = df ? new Date(df + "T23:59:59") : null;

    atualizarCards();
    atualizarTabela();

}

// =====================================================
//               FILTRO GERAL DA BASE
// =====================================================
function filtrarBaseGlobal() {
    return baseOTM.filter(item => {

        // 1) Tipo embarque
        if (filtroGlobal.tipoEmbarque &&
            item["Tipo de Embarque"] !== filtroGlobal.tipoEmbarque) {
            return false;
        }

        const tipoAtual = (filtroGlobal.tipoEmbarque ?? "").toString().toLowerCase();

        // 2) Se for IMEDIATO → não trava pelo filtro de Agenda
        if (tipoAtual.includes("imediato")) {
            return true;
        }

        

        // 3) Para os outros tipos → filtra por Agenda normal
        const dAgenda = parseData(item["Agenda"]);
        if (!(dAgenda instanceof Date) || isNaN(dAgenda)) return false;

        if (filtroGlobal.dataInicio && dAgenda < filtroGlobal.dataInicio) return false;
        if (filtroGlobal.dataFim && dAgenda > filtroGlobal.dataFim) return false;

        return true;
    });
}


// =====================================================
//                   CÁLCULOS DOS CARDS
// =====================================================
function atualizarCards() {
    const baseFiltrada = filtrarBaseGlobal();

    document.getElementById("cardAguardando").textContent = contaStatus(baseFiltrada, "Aguardando");
    document.getElementById("cardNoPatio").textContent = contaStatus(baseFiltrada, "No Pátio");
    document.getElementById("cardEmCarregamento").textContent = contaStatus(baseFiltrada, "Em Carregamento");
    document.getElementById("cardCarregado").textContent = contaStatus(baseFiltrada, "Carregado");
    document.getElementById("cardExpedido").textContent = contaStatus(baseFiltrada, "Expedido");
    document.getElementById("cardTotal").textContent = baseFiltrada.length;
}

function contaStatus(lista, statusDesejado) {
    return lista.filter(item => item["Status Final"] === statusDesejado).length;
}

// =====================================================
//                    TABELA
// =====================================================
function atualizarTabela() {
    const baseFiltrada = filtrarBaseGlobal();
    let baseTabela = baseFiltrada;

    if (statusSelecionados.size > 0) {
        baseTabela = baseFiltrada.filter(item =>
            statusSelecionados.has(item["Status Final"])
        );
    }

    const tbody = document.getElementById("tbodyOtm");
    tbody.innerHTML = "";

    // Ordenar por Agenda (mais antigo → mais novo)
    baseTabela.sort((a, b) => {
        const da = parseData(a["Agenda"]);
        const db = parseData(b["Agenda"]);
        return da - db;
    });


    baseTabela.forEach(item => {
        const tr = document.createElement("tr");

        const statusFinal = (item["Status Final"] ?? "").toString().toLowerCase();

        // ✅ só mostra nesses:
        const podeMostrarTempo =
            statusFinal.includes("no pátio") ||
            statusFinal.includes("no patio") ||
            statusFinal.includes("em carregamento");

        // ❌ se for carregado/expedido, nunca mostra
        const bloquearTempo =
            statusFinal.includes("carregado") ||
            statusFinal.includes("expedido");

        // 🔥 pega chegada, se não tiver, usa agenda como fallback
        const chegadaDate = parseDataBR(item["Chegada WMS"]);
        const agendaDate = parseDataBR(item["Agenda"]); // funciona pq agenda é DD/MM/YYYY

        const dataBaseTempo = chegadaDate || agendaDate; // fallback

        const agora = new Date();

        let diffMs = null;
        let tempoTexto = "-";
        let tempoClasse = "";

        if (podeMostrarTempo && !bloquearTempo) {
            if (dataBaseTempo instanceof Date && !isNaN(dataBaseTempo)) {
                diffMs = agora - dataBaseTempo;
                tempoTexto = formatarTempoNoArmazem(dataBaseTempo);
                tempoClasse = classeTempo(diffMs);
            }
        }
        tr.innerHTML = `
            <td>${item["Remessa"] ?? ""}</td>
            <td>${item["Embalagens"] ?? ""}</td>
            <td>${formatarDataCurta(item["Agenda"])}</td>
            <td>${item["Veiculo"] ?? ""}</td>
            <td>${item["Transportadora"] ?? ""}</td>
            <td>${item["Distancia"] ?? ""}</td>
            <td>${renderSeparacao(item["Separação"])}</td>
            <td><span class="badge-status ${classeStatus(item["Status Final"])}">${item["Status Final"] ?? ""}</span></td>
            <td>${item["Cliente Final"] ?? ""}</td>
            <td>${formatarDataHora(item["Chegada WMS"])}</td>
            <td><span class="badge-tempo ${tempoClasse}">${tempoTexto}</span></td>
        `;

        tbody.appendChild(tr);
    });
}

// =====================================================
//              FUNÇÕES AUXILIARES
// =====================================================
function formatarTempoNoArmazem(dataChegada) {
    if (!(dataChegada instanceof Date) || isNaN(dataChegada)) return "-";

    const agora = new Date();
    let diffMs = agora - dataChegada;

    // se por algum motivo a chegada for no futuro
    if (diffMs < 0) diffMs = 0;

    const totalMin = Math.floor(diffMs / 60000);
    const dias = Math.floor(totalMin / 1440);
    const horas = Math.floor((totalMin % 1440) / 60);
    const mins = totalMin % 60;

    if (dias > 0) return `${dias}d ${horas}h ${mins}m`;
    if (horas > 0) return `${horas}h ${mins}m`;
    return `${mins}m`;
}

function classeTempo(diffMs) {
    // cores por faixa: <4h ok, 4-8h médio, >8h crítico
    const h = diffMs / 3600000;
    if (h <= 4) return "tp-ok";
    if (h <= 8) return "tp-mid";
    return "tp-bad";
}

function renderSeparacao(valor) {
    // Aceita 100, "100", 1, "1", "0,85", "85%"
    if (valor === null || valor === undefined || valor === "") return "-";

    let n = valor;

    if (typeof n === "string") {
        n = n.replace("%", "").replace(",", ".");
    }

    n = Number(n);

    if (isNaN(n)) return valor;

    // se vier 0-1 transforma em %
    let pct = n <= 1 ? n * 100 : n;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;

    return `
        <div class="sep-box">
            <div class="sep-bar">
                <div class="sep-fill" style="width:${pct.toFixed(0)}%"></div>
            </div>
            <div class="sep-text">${pct.toFixed(0)}%</div>
        </div>
    `;
}



function parseData(dataBr) {
    if (!dataBr) return new Date(0);
    const [dia, mes, ano] = dataBr.split("/");
    return new Date(`${ano}-${mes}-${dia}T00:00:00`);
}


function toInputDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatarDataCurta(dataBr) {
    if (!dataBr) return "";

    const [dia, mes, ano] = dataBr.split("/");
    if (!dia || !mes || !ano) return dataBr;

    return `${dia}/${mes}/${ano}`;
}


function formatarDataHora(dataBr) {
    if (!dataBr) return "";

    const [data, hora] = dataBr.split(" ");
    const [dia, mes, ano] = data.split("/");

    if (!dia || !mes || !ano) return dataBr;

    return hora ? `${dia}/${mes}/${ano} ${hora}` : `${dia}/${mes}/${ano}`;
}




function classeStatus(status) {
    if (!status) return "";
    status = status.toLowerCase();

    if (status.includes("expedido")) return "st-expedido";
    if (status.includes("aguard")) return "st-aguardando";
    if (status.includes("carregamento")) return "st-carregamento";
    if (status.includes("pátio") || status.includes("patio")) return "st-patio";
    if (status.includes("carregado")) return "st-carregado";

    return "st-outro";
}


// =====================================================
//  TROCA AUTOMÁTICA ENTRE TIPOS DE EMBARQUE
// =====================================================

const tiposEmbarque = [
    "Agendado",
    "FOB",
    "Imediato",
    "OPL",
    "Fora de Estado",
    "Transferencia",
    "Cross",
    "Interior",
    "Exportação"
];

let autoIndex = 0;
let autoTimer = 60;  // 1 minuto
let autoInterval = null;
let autoTrocaRodando = false;


// Atualiza display superior
function atualizarAutoDisplay() {
    document.getElementById("autoCurrent").textContent =
        "Exibindo: " + tiposEmbarque[autoIndex];

    document.getElementById("autoTimer").textContent =
        "Próxima troca em: " + autoTimer + "s";
}
function tabelaTemDados() {
    const baseFiltrada = filtrarBaseGlobal(); // ✅ pega a base certa aqui

    let baseTabela = baseFiltrada;

    // se tiver filtro de status pelos cards, respeita também
    if (statusSelecionados.size > 0) {
        baseTabela = baseFiltrada.filter(item =>
            statusSelecionados.has(item["Status Final"])
        );
    }

    return baseTabela.length > 0;
}




// Troca para próximo tipo
function trocaAutomatica() {
    if (autoTrocaRodando) return;
    autoTrocaRodando = true;

    autoIndex = (autoIndex + 1) % tiposEmbarque.length;

    document.getElementById("filtroEmbarque").value =
        tiposEmbarque[autoIndex];

    aplicarFiltrosGlobais();

    setTimeout(() => {
        const temDados = tabelaTemDados();

        if (!temDados) {
            console.log("🔄 Sem dados! Pulando para o próximo:", tiposEmbarque[autoIndex]);
            autoTrocaRodando = false;
            trocaAutomatica();
            return;
        }

        // ✅ ACHOU DADOS → PARA AQUI
        autoTimer = 60;
        atualizarAutoDisplay();
        autoTrocaRodando = false;
        return;

    }, 2500);
}




function iniciarAutoTroca() {
    atualizarAutoDisplay();

    autoInterval = setInterval(() => {
        autoTimer--;
        atualizarAutoDisplay();

        if (autoTimer <= 0) {
            trocaAutomatica();
        }
    }, 1000);
}

// iniciar automaticamente 5s após carregar página
setTimeout(() => {
    iniciarAutoTroca();
}, 5000);



// =====================================================
//  Função PNG (VERSÃO CORRIGIDA: esconde logo e botões)
// =====================================================

async function gerarPNGOTM() {
    const container = document.querySelector(".content-box-otm");
    if (!container) return;

    // elementos que NÃO devem aparecer no print
    const elementosEsconder = [
        document.querySelector(".btn-voltar"),
        document.querySelector(".btn-aplicar"),
        document.getElementById("btnPng"),
        document.getElementById("autoStatusBox")
    ];

    // Também esconde a logo (importante para evitar erro de segurança)
    const logo = document.querySelector(".logo-mdias");

    // guarda display original
    const estadosOriginais = [];
    elementosEsconder.forEach((el, idx) => {
        if (el) {
            estadosOriginais[idx] = el.style.display;
            el.style.display = "none";
        }
    });

    // esconde logo temporariamente
    let logoVisOriginal = "";
    if (logo) {
        logoVisOriginal = logo.style.visibility;
        logo.style.visibility = "hidden";
    }

    // modo print (remover scroll, deixar página fixa)
    document.body.classList.add("print-mode");

    await new Promise(r => setTimeout(r, 300));

    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        });

        const link = document.createElement("a");

        const hoje = new Date();
        const dataStr = hoje.toISOString().slice(0, 10);
        const tipo = document.getElementById("filtroEmbarque")?.value || "OTM";

        link.download = `OTM_${tipo}_${dataStr}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        console.log("✔ PNG gerado com sucesso!");

    } catch (e) {
        console.error("❌ Erro ao gerar PNG:", e);
    } finally {
        // volta layout
        document.body.classList.remove("print-mode");

        elementosEsconder.forEach((el, idx) => {
            if (el) el.style.display = estadosOriginais[idx];
        });

        if (logo) logo.style.visibility = logoVisOriginal;
    }
}




// =====================================================
//   RECARREGAR BASE OTM A CADA 60s (SEM RECARREGAR A PÁGINA)
// =====================================================
function recarregarBaseOTM() {
    console.log("🔄 Recarregando Base_OTM.js...");

    const script = document.createElement("script");
    script.src = "../Js/Reporte Operacional/Base_OTM.js?t=" + Date.now();
    script.onload = () => {
        console.log("✔ Base_OTM atualizada com sucesso!");

        baseOTM = Base_OTM;
        atualizarUltimaAtualizacaoOTM()

        // Recalcula tudo!
        if (!autoTrocaRodando) {
            aplicarFiltrosGlobais();
        } else {
            console.log("⏳ Base atualizou mas auto troca está rodando, evitando reset de filtro...");
        }

    };

    script.onerror = () => {
        console.error("❌ Erro ao carregar Base_OTM.js");
    };

    document.body.appendChild(script);
}

function atualizarUltimaAtualizacaoOTM() {
  const el = document.getElementById("ultimaAtualizacaoOTM");
  if (!el) return;

  if (window.ULTIMA_ATUALIZACAO_OTM) {
    el.innerText = "Última atualização: " + window.ULTIMA_ATUALIZACAO_OTM;
  } else {
    el.innerText = ""; // ou "Última atualização: -"
  }
}



// Carrega 5s depois de abrir a página
setTimeout(() => {
    recarregarBaseOTM();
}, 5000);

// Recarrega a cada 30s
setInterval(() => {
    recarregarBaseOTM();
}, 30000);

