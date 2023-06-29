/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

export default class Messages {
  /**
   * As mensagens nativas VTEX ficam dentro do objeto window.vtex.i18n["pt-BR"]
   */
  overrideVtexMessages() {
    try {
      const messages = window.vtex.i18n["pt-BR"]

      messages.paymentData.paymentGroup.bankInvoice.description = 'O boleto bancário terá vencimento em 1 dia útil e será exibido após a confirmação da compra e poderá ser impresso ou ter o código de barras anotado para pagamento pelo telefone ou internet.'
      
      // Força atualização
      window.vtex.i18n.setLocale('pt-BR')
    } catch (err) { 
      console.error(`Não foi possível sobrescrever mensagens da vtex: ${err}`)
    }
  }

  init() {
    try {
      this.overrideVtexMessages()
    } catch (err) { 
      console.error(`Não foi possível sobrescrever mensagens da vtex: ${err}`)
    }
  }
}
  