/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

import { formatCurrencyBRL } from "./_utils"

export default class SummaryGiftCard {

  floatCurrency(value) {
    if (value) {
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

  removeGlobalName() {
    const checkTerm = setInterval(() => {
      if (document.querySelectorAll('.gift-card-friendly-name')) {
        document.querySelectorAll('.gift-card-friendly-name').forEach(el => {
          if (el.innerText.indexOf('global') >= 0)
            el.innerText = el.innerText.split('.')[1]
        })
        clearInterval(checkTerm)
      }
      if (document.querySelectorAll('.payment-discoints-table span[data-bind="text: friendlyName"]')) {
        document.querySelectorAll('.payment-discoints-table span[data-bind="text: friendlyName"]').forEach(el => {
          if (el.innerText.indexOf('global') >= 0)
            el.innerText = el.innerText.split('.')[1]
        })
        clearInterval(checkTerm)
      }
    }, 50)
  }

  addMessage() {
    if ($('#cumulative-discount-warn').length) {
      return null;
    }

    const el = `
      <p id="cumulative-discount-warn">
        O desconto de pagamento à vista não é cumulativo com vale-presente, voucher e pontos Samsung Rewards.
      </p>
    `

    $('.payment-body').after(el)
  }

  checkGiftBlock() {
    const checkElement = setInterval(() => {
      if (document.querySelector('.payment-discounts-alert-wrap')) {
        clearInterval(checkElement)

        document.querySelector('.payment-discounts-alert-wrap').addEventListener('click', (e) => {
          e.preventDefault()
          vtexid.start()
        })
      }
    }, 300)
  }

  buttonAddGift(orderForm) {
    try {
      const checkElement = setInterval(() => {
        const btn = document.querySelector('#btn-add-gift-card')
        if (btn) {
          clearInterval(checkElement)

          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);

          newBtn.addEventListener('click', (e) => {
            e.preventDefault()
            e.target.disabled = true


            const giftCard = document.querySelector('input#payment-discounts-code').value

            const url = `/api/checkout/pub/orderForm/${orderForm.orderFormId}/attachments/paymentData`;

            const headers = {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            };

            const data = {
              "giftCards": [
                {
                  "redemptionCode": giftCard,
                  "inUse": true,
                  "isSpecialCard": false,
                  "provider": "VtexGiftCard"
                }
              ]
            };

            fetch(url, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(data)
            }).then(() => {
              e.target.disabled = false
              vtexjs.checkout.getOrderForm()
            }).catch(error => {
              e.target.disabled = false
              vtexjs.checkout.getOrderForm()
              console.error('Error:', error)
            });
          })
        }
      }, 300)
    } catch (error) {
      console.error(error)
    }
  }

  init(orderForm) {
    this.giftCard(orderForm)
    this.buttonAddGift(orderForm)
    this.removeGlobalName()
    this.checkGiftBlock()
    this.addMessage();
  }
}
