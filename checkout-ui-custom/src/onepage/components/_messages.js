/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

import getPaymentErrorMessage from "./utils/paymentErrorMessages"

export default class Messages {
  /**
   * As mensagens nativas VTEX ficam dentro do objeto window.vtex.i18n["pt-BR"]
   */
  overrideVtexMessages() {
    try {
      const messages = window.vtex.i18n["pt-BR"]

      messages.paymentData.paymentGroup.bankInvoice.description = 'O boleto bancário terá vencimento em 1 dia útil e será exibido após a confirmação da compra e poderá ser impresso ou ter o código de barras anotado para pagamento pelo telefone ou internet.'
      messages.cart.finalize = 'Continuar'
      
      // Força atualização
      window.vtex.i18n.setLocale('pt-BR')
    } catch (err) { 
      console.error(`Não foi possível sobrescrever mensagens da vtex: ${err}`)
    }
  }

  overrideMessagesPaymentModal(){
    $(document).ajaxComplete(function (event, xhr, settings) {
      if (settings.url.includes('/api/checkout/pub/gatewayCallback/')) {
        const { status, responseText } = xhr
        const response = JSON.parse(responseText)

        if(status === 500){
          const { error: { message } } = response;
          
          const { title, message1, message2 } = getPaymentErrorMessage(message)
          const messages = window.vtex.i18n["pt-BR"]

          if(title && (message1 || message2)){
            messages.modal.paymentUnauthorizedReviewData = title
            messages.modal.paymentUnauthorizedMessage1 = message1
            messages.modal.paymentUnauthorizedMessage2 = message2
  
            window.vtex.i18n.setLocale('pt-BR')
          }
        }
      }
    })
  }

  init() {
    try {
      this.overrideVtexMessages()
      this.overrideMessagesPaymentModal()
    } catch (err) { 
      console.error(`Não foi possível sobrescrever mensagens da vtex: ${err}`)
    }
  }
}
  