function aplicarFiltrosColmeia(lista) {

    const filtroLocal = document.getElementById("filtroLocal").value.trim().toLowerCase();
    const filtroSku = document.getElementById("filtroSku").value.trim();
    const filtroPendencia = document.getElementById("filtroPendencia").value;

    return lista.filter(r => {

        // LOCAL (origem OU destino)
        const localMatch =
            !filtroLocal ||
            r.local_origem.toLowerCase().includes(filtroLocal) ||
            r.local_destino.toLowerCase().includes(filtroLocal);

        // RUA = dois primeiros dígitos (05, 10, etc)
        const ruaOrigem = r.local_origem.substring(0, 2);
        const ruaDestino = r.local_destino.substring(0, 2);

        const ruaMatch =
            !filtroLocal ||
            ruaOrigem.includes(filtroLocal) ||
            ruaDestino.includes(filtroLocal);

        // SKU
        const skuMatch =
            !filtroSku || String(r.sku).includes(filtroSku);

        // Pendência (se existir no objeto)
        const pendenciaMatch =
            !filtroPendencia || r.pendencia === filtroPendencia;

        return localMatch && ruaMatch && skuMatch && pendenciaMatch;
    });
}
