function renderResultado(lista) {

    let html = "";

    lista.forEach(r => {
        html += `
        <tr>
            <td>${r.local_origem}</td>
            <td>${r.local_destino}</td>
            <td>${r.sku}</td>
            <td>${r.produto}</td>
            <td>${r.plt_mover}</td>
            <td>${r.cx_mover}</td>
        </tr>`;
    });

    document.getElementById("resultadoColmeia").innerHTML = html;
}
