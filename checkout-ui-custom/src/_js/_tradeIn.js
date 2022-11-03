import { formatCurrencyBRL } from './_utils'

export default class TradeIn {
  init() {
    const { items } = window.vtexjs.checkout.orderForm
    const transport = JSON.parse(localStorage.getItem('transport') || '[]')
    const customData = window.vtexjs.checkout.orderForm.customData || null

    const isSocialSelling = window.vtexjs.checkout.orderForm.marketingData
      ? window.vtexjs.checkout.orderForm.marketingData.marketingTags.find(
          item => item === 'vtexSocialSelling'
        )
      : false

    if (items.length && transport.length) {
      this.checkTradeIn(items, transport)
    } else if (items.length && customData && isSocialSelling) {
      const transportCustomData =
        customData.customApps[0].fields.trade_in_option_selected

      this.checkTradeIn(items, JSON.parse(transportCustomData))
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
                parseInt(itemLinkTradeIn.boostSSG, 10)
            }
          }
        }

        totalTradeIn += totalItemTradeIn
      }
    }

    if (totalTradeIn > 0) {
      this.showDetailsTradeIn()
      this.showTotalTradeIn(totalTradeIn)
      $('#total-tradein-value').text(
        `${formatCurrencyBRL(totalTradeIn, false)}*`
      )
    } else if (totalTradeIn === 0) {
      $('#total-details-tradein').remove()
      $('#text-details-tradein').remove()
      this.removeCustomDataTradeIn()
    }

    const newTransport = transport.filter(item => {
      const hasMainProduct =
        items.filter(orderItem => orderItem.id === item.skuId).length > 0

      if (hasMainProduct) {
        return item
      }

      return ''
    })

    if (newTransport.length < transport.length) {
      localStorage.setItem('transport', JSON.stringify(newTransport))
      this.validateTradeinCustomData()
    }
  }

  showDetailsTradeIn() {
    try {
      const _checkoutElem = $(`.cart-fixed`)
      const _cartElem = $(`.summary-to-new-components`)
      const _component = `
        <div id="text-details-tradein" style="max-width: 376px; width: 100%; margin-top: 15px; color: #0077C8; font-size: 12px; font-family: 'SamsungOne'; float: right; text-align: left;">
          <p>* A compra de um produto com a modalidade Troca Smart gera uma <span style="font-weight: 700"> transação de valor total do aparelho </span> para pagamento no site.</p>
          <p>O valor da pré-avaliação da Troca Smart será depositado em conta corrente após avaliação e aceitação do aparelho pela TROCAFONE.</p>
        </div>
      `

      if (
        _checkoutElem.find('#text-details-tradein').length > 0 ||
        _cartElem.find('#text-details-tradein').length > 0
      ) {
        return
      }

      _cartElem.append(_component)
      _checkoutElem.append(_component)
    } catch (e) {
      console.error('showDetailsTradeIn error:', e)
    }
  }

  showTotalTradeIn(totalTradeIn) {
    try {
      const _checkoutElem = $(`.summary-totalizers .table`)
      const _component = `
        <tbody id="total-details-tradein" style="border-top: 1px solid #cbcbcb;">
          <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'">
            <td style="font-size: 14px; color: #000000; font-weight: 400;">Troca Smart <br /> Dinheiro em Conta</td>
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

    localStorage.setItem('transport', JSON.stringify(transport))
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

    localStorage.removeItem('transport')

    await $.ajax({
      url: `${this.rootPath()}/api/checkout/pub/orderForm/${orderFormId}/customData/domain/trade_in_option_selected`,
      type: 'DELETE',
    })

    await $.ajax({
      url: `${this.rootPath()}/api/checkout/pub/orderForm/${orderFormId}/customData/domain/trade_in_total_value`,
      type: 'DELETE',
    })
  }

  async validateTradeinCustomData() {
    const transport = JSON.parse(localStorage.getItem('transport'))

    let total = 0
    const arrayPromise = []
    const arrayProductsTrocafone = []

    const isSocialSelling = window.vtexjs.checkout.orderForm.marketingData
      ? window.vtexjs.checkout.orderForm.marketingData.marketingTags.find(
          item => item === 'vtexSocialSelling'
        )
      : false

    if (isSocialSelling) {
      return
    }

    if (!!transport && transport.length > 0) {
      await transport.map(mainProduct => {
        mainProduct.evaluatedProducts.map(async item => {
          arrayProductsTrocafone.push(item)
        })

        return ''
      })

      arrayProductsTrocafone.map(item => {
        const request = fetch(
          `${this.rootPath()}/p4v1/tradeinCheckImei/${item.imei}`
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
        this.putCustomData(transport, total)
      })
    } else {
      this.removeCustomDataTradeIn()
    }
  }
}
