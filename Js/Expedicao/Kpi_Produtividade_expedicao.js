function atualizarKPIs(dados) {

    const manha = calcularResumoPorTurno(dados, "Manhã");
    const tarde = calcularResumoPorTurno(dados, "Tarde");
    const noite = calcularResumoPorTurno(dados, "Noite");

    document.getElementById("remManha").textContent = manha.remessas;
    document.getElementById("cxManha").textContent =
        manha.caixas.toLocaleString("pt-BR") + " cx";

    document.getElementById("remTarde").textContent = tarde.remessas;
    document.getElementById("cxTarde").textContent =
        tarde.caixas.toLocaleString("pt-BR") + " cx";

    document.getElementById("remNoite").textContent = noite.remessas;
    document.getElementById("cxNoite").textContent =
        noite.caixas.toLocaleString("pt-BR") + " cx";
}
