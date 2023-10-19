/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

import { formatCurrencyBRL } from "./_utils"

export default class SummaryGiftCard {

  floatCurrency(value) {
    if(value){
      const mainValue = value.toString()
      const reais = mainValue.substr(0, (mainValue.length - 2))
      const centavos = mainValue.substr(-2)
      const formatedValue = parseFloat(`${reais}.${centavos}`)
      
      return formatedValue
    }
  }

  giftCard(orderForm) {
    let carrinho = this.floatCurrency(orderForm.value)
    let total = 0
    let vale = 0
    let count = 0

    if (orderForm?.paymentData?.giftCards.length > 0) {

      const { giftCards } = orderForm.paymentData
      giftCards.map(gift => {

        if (gift.value) {
          
          count++
          const { value } = gift
          vale += this.floatCurrency(value)

          if (gift.provider.toLowerCase() != 'ssg_rewards') {
            if ($('.srp-summary-voucher').length == 0) {
              $(`<tr class="srp-summary-voucher">
              <td class="info">eVoucher</td>
              <td class="space"></td>
              <td class="monetaryvoucher"></td>
              <td class="empty"></td>
              </tr>`).insertAfter('.table .totalizers-list tr.srp-summary-result')
            }
            $('.monetaryvoucher').text(formatCurrencyBRL(this.floatCurrency(gift.value), false))

          }

          total = parseFloat(carrinho - vale) 

        } else {

          if (count = 0) {
            total = this.floatCurrency(carrinho)
            $('.estimate-shipping').text(formatCurrencyBRL(total, false))
          }
        }
      })
      
      if (total > 0) {
        $('.estimate-shipping').text(formatCurrencyBRL(total, false))
      }
      if (total <= 0 && vale > 0) {
        $('.estimate-shipping').text(formatCurrencyBRL('000', false))
      }

    }
  }

  removeGlobalName(){
    const checkTerm = setInterval(()=>{
      if(document.querySelectorAll('.gift-card-friendly-name')){
        document.querySelectorAll('.gift-card-friendly-name').forEach(el => {
          if(el.innerText.indexOf('global') >= 0)
          el.innerText = el.innerText.split('.')[1]
        })
        clearInterval(checkTerm)
      }
      if(document.querySelectorAll('.payment-discoints-table span[data-bind="text: friendlyName"]')){
        document.querySelectorAll('.payment-discoints-table span[data-bind="text: friendlyName"]').forEach(el => {
          if(el.innerText.indexOf('global') >= 0)
          el.innerText = el.innerText.split('.')[1]
        })
        clearInterval(checkTerm)
      }
    },50)
  }

  checkGiftBlock(){
    const checkElement = setInterval(()=>{
      if(document.querySelector('.payment-discounts-alert-wrap')){
        clearInterval(checkElement)

        document.querySelector('.payment-discounts-alert-wrap').addEventListener('click', (e)=>{
          e.preventDefault()

          Swal.fire({
            text:'Para acessar seus créditos, é necessário efetuar o login, deseja continuar?',
            showCancelButton: true,
            confirmButtonColor: '#000',
            cancelButtonColor: 'red',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar',
            customClass: {
              confirmButton: 'btn btn-success btn-custom btn-accept',
              cancelButton: 'btn btn-danger btn-custom btn-reject'
            }
          }).then((result) => {
            if (result.value) {
              vtexid.start()
            }
          })

        })
      }
    },300)
  }

  init(orderForm) {
    this.giftCard(orderForm)
    this.removeGlobalName()
    this.checkGiftBlock()
  }
}
