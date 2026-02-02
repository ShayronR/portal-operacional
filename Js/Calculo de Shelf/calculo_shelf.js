// ================================
//       AUTOCOMPLETE GERAL
// ================================

function criarAutocomplete(input, listaDiv, dados, campo, callback = null) {

    input.addEventListener("input", () => {
        const texto = input.value.toLowerCase();
        listaDiv.innerHTML = "";
        listaDiv.style.display = "none";

        if (!texto) return;

        const filtrado = dados.filter(x =>
            String(x[campo]).toLowerCase().includes(texto)

        );

        filtrado.forEach(item => {
            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.textContent = item[campo];

            div.onclick = () => {
                input.value = item[campo];
                listaDiv.style.display = "none";

                // callback só executa no autocomplete do cálculo
                if (callback) callback(item);
            };

            listaDiv.appendChild(div);
        });

        if (filtrado.length) listaDiv.style.display = "block";
    });

    document.addEventListener("click", e => {
        if (!listaDiv.contains(e.target) && e.target !== input) {
            listaDiv.style.display = "none";
        }
    });
}



// ================================
//   Preenche informações do item
// ================================
function preencherItem(item) {
    document.getElementById("descItem").value = item.produto;
    document.getElementById("prazoItem").value = item.prazo;
}


// ================================
//   Shelf automático no cálculo
// ================================
function preencherShelfAutomatico(nomeCliente) {
    const cliente = SHELF_CLIENTES_BASE.find(c =>
        c.cliente.toLowerCase() === nomeCliente.toLowerCase()
    );

    if (cliente) {
        document.getElementById("shelfCliente").value = cliente.shelf;
    }
}


// ================================
//       CONSULTA DE CLIENTE
// ================================
function consultarCliente() {
    const nome = document.getElementById("clienteConsulta").value.trim().toLowerCase();
    const res = document.getElementById("resultadoConsulta");

    const cliente = SHELF_CLIENTES_BASE.find(c =>
        c.cliente.toLowerCase() === nome
    );

    if (!cliente) {
        res.innerHTML = "Cliente não encontrado.";
        return;
    }

    res.innerHTML = `
        <b>Cliente:</b> ${cliente.cliente}<br>
        <b>Observação:</b> ${cliente.obs}<br>
        <b>Shelf padrão:</b> ${(cliente.shelf * 100).toFixed(0)}% (valor: ${cliente.shelf})
    `;
}


// ================================
//        CÁLCULO DE DATA MÍNIMA
// ================================
function calcularData() {

    const cli = document.getElementById("clienteCalc").value.trim();
    const cod = document.getElementById("codigoItem").value.trim();
    const agenda = document.getElementById("dataAgenda").value;
    const shelf = parseFloat(document.getElementById("shelfCliente").value);
    const prazo = parseInt(document.getElementById("prazoItem").value);

    const res = document.getElementById("resultadoCalc");

    if (!cli || !cod || !agenda || prazo === "" || isNaN(shelf)) {
        
        res.innerHTML = "Preencha todos os campos.";
        return;
    }

    const data = new Date(agenda);
    const dias = prazo * shelf;
    data.setDate(data.getDate() + dias);

    const resultado = data.toLocaleDateString("pt-BR");

    res.innerHTML = `
        <b>Cliente:</b> ${cli}<br>
        <b>Item:</b> ${cod}<br>
        <b>Prazo:</b> ${prazo} dias<br>
        <b>Shelf usado:</b> ${shelf}<br>
        <b>Data mínima:</b> <span style="color:#0d2740;font-weight:bold">${resultado}</span>
    `;
}


// ================================
//      ATIVAR AUTOCOMPLETE
// ================================
window.onload = () => {

    // AUTOCOMPLETE — consulta do cliente (NÃO altera nada no cálculo)
    criarAutocomplete(
        document.getElementById("clienteConsulta"),
        document.getElementById("listaClientes"),
        SHELF_CLIENTES_BASE,
        "cliente"
    );

    // AUTOCOMPLETE — cliente no cálculo (ALTERA shelf e nada mais)
    criarAutocomplete(
        document.getElementById("clienteCalc"),
        document.getElementById("listaClientesCalc"),
        SHELF_CLIENTES_BASE,
        "cliente",
        (item) => {
            document.getElementById("shelfCliente").value = item.shelf;
        }
    );

    // AUTOCOMPLETE — itens no cálculo
    criarAutocomplete(
        document.getElementById("codigoItem"),
        document.getElementById("listaItens"),
        PRAZO_ITENS_BASE,
        "codigo",
        (item) => {
            preencherItem(item);
        }
    );
};
