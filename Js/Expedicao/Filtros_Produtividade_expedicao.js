const BASE_PRODUTIVIDADE = window.PRODUTIVIDADE || [];

let FILTRO_MES = "2025-12";
let FILTRO_TURNO = "Todos";
let FILTRO_DIA = null; // YYYY-MM-DD

function obterDadosFiltrados() {
    return BASE_PRODUTIVIDADE.filter(r => {

        const okMes = r.data.startsWith(FILTRO_MES);

        const okTurno =
            FILTRO_TURNO === "Todos" || r.turno === FILTRO_TURNO;

        const okDia =
            !FILTRO_DIA || r.data === FILTRO_DIA;

        return okMes && okTurno && okDia;
    });
}

/* ===== EVENTOS ===== */

document.getElementById("filtroMes").addEventListener("change", e => {
    FILTRO_MES = e.target.value;
    FILTRO_DIA = null; // reseta o dia
    document.getElementById("filtroDia").value = "";
    atualizarDashboard();
});

document.getElementById("filtroTurno").addEventListener("change", e => {
    FILTRO_TURNO = e.target.value;
    atualizarDashboard();
});

document.getElementById("filtroDia").addEventListener("change", e => {
    FILTRO_DIA = e.target.value || null;
    atualizarDashboard();
});
