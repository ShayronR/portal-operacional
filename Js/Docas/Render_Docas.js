window.DOCAS_RENDER = {
  pageSize: 20,
  page: 1,
  linhas: [],
  linhasFiltradas: [],

  prepararLinhas() {
    const set = new Set();
    const out = [];

    (window.DOCAS || []).forEach(l => {
      const remessa = DOCAS_CALC.extrairRemessa(l.pedido_venda);
      const doca = DOCAS_CALC.extrairDoca(l.packing);
      if (remessa === "-" || doca === "-") return;

      const key = `${remessa}|${doca}`;
      if (set.has(key)) return;

      set.add(key);
      out.push({ remessa, doca });
    });

    this.linhas = out;
    this.aplicarFiltros();
  },

  aplicarFiltros() {
    const fRem = document.getElementById("filtroRemessa")?.value.trim();
    const fDoc = document.getElementById("filtroDoca")?.value.trim();

    this.linhasFiltradas = this.linhas.filter(l => {
      const okRem = !fRem || l.remessa.includes(fRem);
      const okDoc = !fDoc || l.doca.includes(fDoc);
      return okRem && okDoc;
    });

    this.page = 1;
    this.render();
  },

  render() {
    const tbody = document.getElementById("tabelaDocas");
    const info = document.getElementById("paginacaoInfo");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");

    const total = this.linhasFiltradas.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));

    const start = (this.page - 1) * this.pageSize;
    const slice = this.linhasFiltradas.slice(start, start + this.pageSize);

    tbody.innerHTML = slice.map(x => `
      <tr>
        <td>${x.remessa}</td>
        <td class="doca-pill">${x.doca}</td>
      </tr>
    `).join("");

    info.textContent = `Página ${this.page} de ${totalPages} — ${total} linhas`;

    btnPrev.disabled = this.page <= 1;
    btnNext.disabled = this.page >= totalPages;
  },

  prev(){ this.page--; this.render(); },
  next(){ this.page++; this.render(); },

  setPageSize(n){
    this.pageSize = Number(n);
    this.page = 1;
    this.render();
  },

  limparFiltros(){
    document.getElementById("filtroRemessa").value = "";
    document.getElementById("filtroDoca").value = "";
    this.aplicarFiltros();
  },

  reset(){
    this.page = 1;
    this.prepararLinhas();
  }
};
