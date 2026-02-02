let grafico;

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}`; // se quiser ano: `${dia}/${mes}/${ano}`
}

function atualizarGrafico(dados) {

    const resumo = calcularResumoDiario(dados);
    const dias = Object.keys(resumo).sort();

    const labels = dias.map(d => formatarData(d));
    const caixas = dias.map(d => resumo[d].caixas);
    const remessas = dias.map(d => resumo[d].remessas.size);

    const ctx = document.getElementById("graficoDiario");
    if (!ctx) return;

    if (grafico) grafico.destroy();

    // cores
    const COR_BARRA = "#1f4fd8";  // azul MDB mais escuro
    const COR_LINHA = "#ff4d6d";  // linha mantém

    // garante que o plugin existe (se não existir, não quebra a página)
    const plugins = [];
    if (typeof ChartDataLabels !== "undefined") {
        plugins.push(ChartDataLabels);
    }

    grafico = new Chart(ctx, {
        data: {
            labels,
            datasets: [
                {
                    type: "bar",
                    label: "Caixas",
                    data: caixas,
                    backgroundColor: COR_BARRA,
                    borderRadius: 6,
                    datalabels: {
                        anchor: "end",
                        align: "start", // na base
                        color: "#333",
                        font: { weight: "bold" },
                        formatter: v => v.toLocaleString("pt-BR")
                    }
                },
                {
                    type: "line",
                    label: "Remessas",
                    data: remessas,
                    borderColor: COR_LINHA,
                    backgroundColor: COR_LINHA,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: COR_LINHA,
                    yAxisID: "y1",
                    datalabels: {
                        anchor: "end",
                        align: "top", // acima do ponto
                        color: COR_LINHA,
                        font: { weight: "bold" }
                    }
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                // se o plugin não carregou, isso evita erro
                datalabels: { display: true }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Caixas" } },
                y1: {
                    beginAtZero: true,
                    position: "right",
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: "Remessas" }
                }
            }
        },
        plugins
    });
}

// chama pelo seu fluxo
function atualizarDashboard() {
    const dados = obterDadosFiltrados();
    atualizarKPIs(dados);
    atualizarGrafico(dados);
}

atualizarDashboard();
