window.DOCAS_CALC = {

  // "0002482970-2-AG" -> pega 7 dígitos depois de "000" => 2482970
  extrairRemessa(pedido) {
    if (!pedido) return "-";

    const s = String(pedido).trim();

    // procura exatamente "000" seguido de 7 dígitos
    const m = s.match(/000(\d{7})/);
    if (m) return m[1];

    // fallback (se vier sem 000 por algum motivo): pega 1º bloco numérico e tenta 7 dígitos
    const nums = s.match(/\d+/);
    if (!nums) return "-";
    const n = nums[0].replace(/^0+/, "");
    return n.slice(0, 7) || "-";
  },

  // "00122829" -> "29"
  extrairDoca(packing) {
    if (!packing) return "-";
    const s = String(packing).trim();
    return s.slice(-2);
  }

};
