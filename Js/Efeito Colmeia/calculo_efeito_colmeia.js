function calcularColmeia(base) {

    const resultado = [];
    const porSKU = {};

    // =========================
    // AGRUPA POR SKU
    // =========================
    base.forEach(r => {

        // regra: não mexe se tem pendência
        if (r.pendencia === "Sim") return;

        if (!porSKU[r.sku]) porSKU[r.sku] = [];

        porSKU[r.sku].push({ ...r }); // clone
    });

    // =========================
    // PROCESSA CADA SKU
    // =========================
    Object.values(porSKU).forEach(lista => {

        // só endereços com estoque
        const ativos = lista.filter(l => l.plt > 0);

        if (ativos.length < 2) return;

        // menor → maior
        ativos.sort((a, b) => a.plt - b.plt);

        let i = 0;
        let j = ativos.length - 1;

    while (i < j) {

        const origem = ativos[i];
        const destino = ativos[j];

        const espacoLivre = destino.capacidade - destino.plt;

        // 🔴 REGRA NOVA:
        // Só move se couber TODO o estoque da origem
        if (espacoLivre < origem.plt) {
            j--;
            continue;
        }

        const pltMover = origem.plt;
        const cxMover = pltMover * origem.plt_padrao;

        resultado.push({
            local_origem_raw: origem.local,
            local_destino_raw: destino.local,

            local_origem: formatarEndereco(origem.local),
            local_destino: formatarEndereco(destino.local),

            rua_origem: String(origem.local).padStart(8, "0").substring(0,2),
            rua_destino: String(destino.local).padStart(8, "0").substring(0,2),

            sku: origem.sku,
            produto: origem.produto,

            plt_mover: pltMover,
            cx_mover: cxMover,

            // 👇 METADADOS PRA MÉTRICAS
            capacidade_destino: destino.capacidade
        });

        // atualiza volumes
        destino.plt += pltMover;
        origem.plt = 0;

        i++; // origem foi esvaziada
    }

    });

    return resultado;
}
