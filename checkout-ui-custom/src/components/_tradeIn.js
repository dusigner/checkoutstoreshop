/* eslint-disable vtex/prefer-early-return */
import { formatCurrencyBRL } from './_utils'

export default class TradeIn {
  async init(orderForm) {
    const { items } = orderForm

    const customDataDomain = orderForm.customData
      ? orderForm.customData.customApps.filter(i => i.id === 'domain')
      : []

    const getTransport =
      customDataDomain.length > 0
        ? customDataDomain[0].fields.trade_in_option_selected
        : ''

    const transport = getTransport ? JSON.parse(getTransport) : ''

    if (items.length && transport.length) {
      this.checkTradeIn(items, transport)
    } else if (
      !items.length &&
      transport.length &&
      localStorage.getItem('transport')
    ) {
      $('#total-details-tradein').remove()
      $('#text-details-tradein').remove()
      await this.removeCustomDataTradeIn()
    }
  }

  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  checkTradeIn(items, transport) {
    let totalTradeIn = 0

    if (transport.length) {
      for (let i = 0; i < transport.length; i++) {
        let totalItemTradeIn = 0
        const itemLinkTradeIn = transport[i]
        let itemLinkTradeInValid = 0

        for (let j = 0; j < items.length; j++) {
          if (itemLinkTradeIn.mainProductId === items[j].productId) {
            ++itemLinkTradeInValid
          }
        }

        if (itemLinkTradeInValid > 0) {
          for (let k = 0; k < itemLinkTradeIn.evaluatedProducts.length; k++) {
            if (k > 0 && totalItemTradeIn > 0) {
              totalItemTradeIn += itemLinkTradeIn.evaluatedProducts[k].price
            } else {
              totalItemTradeIn +=
                itemLinkTradeIn.evaluatedProducts[k].price +
                parseFloat(itemLinkTradeIn.boostSSG)
            }
          }
        }

        totalTradeIn += totalItemTradeIn
      }
    }

    if (totalTradeIn > 0) {
      this.showTotalTradeIn(totalTradeIn)
      $('#total-tradein-value').text(
        `${formatCurrencyBRL(totalTradeIn, false)}*`
      )
    } else if (totalTradeIn === 0) {
      $('#total-details-tradein').remove()
      $('#text-details-tradein').remove()
      this.removeCustomDataTradeIn()

      return
    }

    const newTransport = transport.filter(item => {
      const hasMainProduct =
        items.filter(orderItem => orderItem.productId === item.mainProductId)
          .length > 0

      if (hasMainProduct) {
        return item
      }

      return ''
    })

    if (newTransport.length < transport.length) {
      this.putCustomData(newTransport, totalTradeIn)
    }
  }

  showTotalTradeIn(totalTradeIn) {
    try {
      const _checkoutElem = $(`.summary-template-holder`)
      const _component = `
        <tbody id="total-details-tradein" >
          <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'">
            <td style="font-size: 14px; color: #000000; font-weight: 400; max-width: 245px;">Bônus Troca Smart - Dinheiro creditado em conta após a entrega do(s) aparelho(s) usado(s) e avaliação da Trocafone:</td>
            <td id="total-tradein-value" style="font-size: 14px; color: #0077C8; font-weight: 700;">${formatCurrencyBRL(
              totalTradeIn,
              false
            )}*
            </td>
          </tr>
        </tbody>
      `

      if (_checkoutElem.find('#total-details-tradein').length > 0) {
        return
      }

      _checkoutElem.append(_component)
    } catch (e) {
      console.error('showDetailsTradeIn error:', e)
    }
  }

  async putCustomData(transport, total) {
    const { orderFormId } = window.vtexjs.checkout.orderForm
    const newData = {
      trade_in_option_selected: JSON.stringify(transport),
      trade_in_total_value: total,
    }

    $('#total-tradein-value').text(`${formatCurrencyBRL(total, false)}*`)

    await $.ajax({
      url: `${this.rootPath()}/v1/pub/putCheckoutCustomData/${orderFormId}/domain`,
      type: 'PUT',
      crossDomain: true,
      accept: 'application/vnd.vtex.ds.v10+json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(newData),
    })
  }

  async removeCustomDataTradeIn() {
    const { orderFormId } = window.vtexjs.checkout.orderForm
    const openTextField = localStorage.getItem('tradeInCustom')
    if(openTextField !== null || openTextField !== "null"){
      localStorage.removeItem('tradeInCustom')
      localStorage.removeItem('transport')
      window.vtexjs.checkout.sendAttachment('openTextField', { value: null })
      await $.ajax({
        url: `${this.rootPath()}/v1/pub/deleteCheckoutCustomData/${orderFormId}/domain/trade_in_option_selected`,
        type: 'DELETE',
      })
  
      await $.ajax({
        url: `${this.rootPath()}/v1/pub/deleteCheckoutCustomData/${orderFormId}/domain/trade_in_total_value`,
        type: 'DELETE',
      })
    }
  }

  async validateTradeinCustomData() {
    const customDataDomain = window.vtexjs.checkout.orderForm.customData
      ? window.vtexjs.checkout.orderForm.customData.customApps.filter(
          i => i.id === 'domain'
        )
      : []

    const getTransport =
      customDataDomain.length > 0
        ? customDataDomain[0].fields.trade_in_option_selected
        : ''

    const transport = getTransport ? JSON.parse(getTransport) : ''

    let total = 0
    const arrayPromise = []
    const arrayProductsTrocafone = []

    if (!!transport && transport.length > 0) {
      await transport.map(mainProduct => {
        mainProduct.evaluatedProducts.map(async item => {
          arrayProductsTrocafone.push(item)
        })

        return ''
      })

      arrayProductsTrocafone.map(item => {
        const request = fetch(
          `${this.rootPath()}/p4v1/tradeinCheckImei/${item.imei}/${
            item.boosted
          }`
        )
          .then(response => response.json())
          .then(response => {
            return {
              ...response,
              imei: item.imei,
            }
          })

        arrayPromise.push(request)

        return ''
      })

      Promise.all(arrayPromise).then(values => {
        transport.map(mainProduct => {
          mainProduct.evaluatedProducts.map(async item => {
            const resultTrocafone = values.find(v => v.imei === item.imei)

            if (
              !!resultTrocafone &&
              !!resultTrocafone.products &&
              resultTrocafone.products.length > 0
            ) {
              const product = resultTrocafone.products.find(
                p => p.id === item.idProduct
              )

              if (!!product && !!product.gradings) {
                const grading = product.gradings.find(
                  g => g.code === item.grading
                )

                if (!!grading && !!grading.price) {
                  item.price = grading.price
                  total += item.price

                  return
                }
              }
            }

            total += item.price
          })

          return ''
        })
        if (JSON.stringify(transport) !== getTransport) {
          this.putCustomData(transport, total)
        }
      })
    }
  }
}
