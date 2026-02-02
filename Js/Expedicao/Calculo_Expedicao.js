window.EXP_CALC = {

  extrairRemessa(pedidoVenda) {
    if (!pedidoVenda) return null;
    const parte = String(pedidoVenda).split("-")[0];
    return parte.replace(/^0+/, "");
  },

  normalizarDataHora(str) {
    if (!str) return null;
    return String(str).trim();
  },

  caixas(linha) {
    return Number(linha.qtde_total_produto || 0);
  },

  normalizarLinha(linha) {
    const dh = this.normalizarDataHora(linha.faturado_em);
    const pedidoOriginal = String(linha.pedido_venda || "").trim();

    return {
      remessa: this.extrairRemessa(linha.pedido_venda),
      remessa_raw: pedidoOriginal,
      data_hora: dh,
      caixas: this.caixas(linha),
      turno: PROD_CALC.getTurno(dh)
    };
  },

  carregarBase() {
    const b1 = window.PRODUTIVIDADE_EXP_1 || [];
    const b2 = window.PRODUTIVIDADE_EXP_2 || [];

    return [...b1, ...b2]
      .map(l => this.normalizarLinha(l))
      .filter(l => l.remessa && l.data_hora);
  },

  // ======================================
  // FILTRO EXPEDIÇÃO (MESMO DO DASH)
  // filtroMes = "01/2026" ou "todos"
  // filtroData = "10/01/2026" ou "todos"
  // ======================================
  filtrarPorTela(base, filtroMes, filtroData) {
    return base.filter(l => {

      if (!l.data_hora) return false;

      const data = l.data_hora.split(" ")[0]; // "10/01/2026"
      const partes = data.split("/");
      if (partes.length !== 3) return false;

      const dia = partes[0];
      const mes = partes[1];
      const ano = partes[2];

      const mesAno = `${mes}/${ano}`; // "01/2026"

      // filtro mês
      if (filtroMes !== "todos" && mesAno !== filtroMes) return false;

      // filtro data
      if (filtroData !== "todos" && data !== filtroData) return false;

      return true;
    });
  },

  resumoTurnos(base) {
    const modelo = {
      "1º Turno": { caixas: 0, remessas: new Set() },
      "2º Turno": { caixas: 0, remessas: new Set() },
      "3º Turno": { caixas: 0, remessas: new Set() }
    };

    base.forEach(l => {
      if (!l.turno) return;
      modelo[l.turno].caixas += l.caixas;
      modelo[l.turno].remessas.add(l.remessa);
    });

    return modelo;
  }
};
