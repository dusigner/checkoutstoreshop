export default class Scripts {
  fingerPrint() {
    try {
      const script = document.createElement("script");
      script.src = "https://www.mercadopago.com/v2/security.js";
      script.setAttribute("output", "vtex.deviceFingerprint");
      script.setAttribute("view", "checkout");
      document.body.appendChild(script);
      console.log("MP-deviceId 2020 " + script.getAttribute("output").value);
    } catch (err) {
      console.error(`Erro ao executar função fingerPrint(): ${err}`);
    }
  }

  init() {
    this.fingerPrint();
  }
}
