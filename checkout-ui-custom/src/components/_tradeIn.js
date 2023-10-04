/* eslint-disable vtex/prefer-early-return */
import { formatCurrencyBRL } from './_utils'

export default class TradeIn {
  async init(orderForm) {
    const { items } = orderForm

    const customDataDomain =
      orderForm.customData?.customApps.filter(i => i.id === 'domain') || []

    const transport =
      customDataDomain.length > 0
        ? JSON.parse(
            customDataDomain[0].fields.trade_in_option_selected || '[]'
          )
        : []

    if (items.length && transport.length) {
      this.checkTradeIn(items, transport)
    } else if (
      !items.length &&
      transport.length &&
      localStorage.getItem('transport')
    ) {
      this.removeTradeInDetails()
      await this.removeCustomDataTradeIn()
    }
  }

  removeTradeInDetails() {
    $('#total-details-tradein').remove()
    $('#text-details-tradein').remove()
  }

  rootPath() {
    return window.__RUNTIME__.rootPath || ''
  }

  checkTradeIn(items, transport) {
    const totalTradeIn = transport.reduce((total, itemLinkTradeIn) => {
      const itemLinkTradeInValid = items.filter(
        orderItem => orderItem.productId === itemLinkTradeIn.mainProductId
      ).length

      if (itemLinkTradeInValid > 0) {
        const totalItemTradeIn = itemLinkTradeIn.evaluatedProducts.reduce(
          (itemTotal, evaluatedProduct, k) => {
            const price =
              k > 0
                ? evaluatedProduct.price
                : evaluatedProduct.price + parseFloat(itemLinkTradeIn.boostSSG)
            return itemTotal + price
          },
          0
        )
        return total + totalItemTradeIn
      }
      return total
    }, 0)

    if (totalTradeIn > 0) {
      this.showTotalTradeIn(totalTradeIn)
      $('#total-tradein-value').text(
        `${formatCurrencyBRL(totalTradeIn, false)}*`
      )
    } else if (totalTradeIn === 0) {
      this.removeTradeInDetails()
      this.removeCustomDataTradeIn()
    }

    const newTransport = transport.filter(item =>
      items.some(orderItem => orderItem.productId === item.mainProductId)
    )

    if (newTransport.length < transport.length) {
      this.putCustomData(newTransport, totalTradeIn)
    }
  }

  showTotalTradeIn(totalTradeIn) {
    try {
      const _checkoutElem = $('.summary-template-holder')
      const _component = `
        <tbody id="total-details-tradein">
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

    try {
      await $.ajax({
        url: `${this.rootPath()}/v1/pub/putCheckoutCustomData/${orderFormId}/domain`,
        type: 'PUT',
        crossDomain: true,
        accept: 'application/vnd.vtex.ds.v10+json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(newData),
      })
    } catch (error) {
      console.error('Error in putCustomData:', error)
    }
  }

  async removeCustomDataTradeIn() {
    const t0 = performance.now()

    const { orderFormId } = window.vtexjs.checkout.orderForm
    const openTextField = localStorage.getItem('tradeInCustom')

    if (openTextField !== null && openTextField !== 'null') {
      localStorage.removeItem('tradeInCustom')
      localStorage.removeItem('transport')
      window.vtexjs.checkout.sendAttachment('openTextField', { value: null })

      const deleteRequests = [
        $.ajax({
          url: `${this.rootPath()}/v1/pub/deleteCheckoutCustomData/${orderFormId}/domain/trade_in_option_selected`,
          type: 'POST',
        }),
        $.ajax({
          url: `${this.rootPath()}/v1/pub/deleteCheckoutCustomData/${orderFormId}/domain/trade_in_total_value`,
          type: 'POST',
        }),
      ]

      // chamadas em paralelo reduzindo bons segundos das requisições
      await Promise.all(deleteRequests)
        .then(() => {
          console.log('Dados personalizados excluídos com sucesso.')

          const t1 = performance.now()
          console.log('Este código levou ', t1 - t0, ' milissegundos.')
        })
        .catch(error => {
          console.error('Erro ao excluir dados personalizados:', error)
        })
    }
  }

  async validateTradeinCustomData() {
    const customDataDomain =
      window.vtexjs.checkout.orderForm.customData?.customApps.filter(
        i => i.id === 'domain'
      ) || []

    const transport =
      customDataDomain.length > 0
        ? JSON.parse(
            customDataDomain[0].fields.trade_in_option_selected || '[]'
          )
        : []

    let total = 0
    const arrayPromise = []
    const arrayProductsTrocafone = []

    if (!!transport && transport.length > 0) {
      transport.forEach(mainProduct => {
        mainProduct.evaluatedProducts.forEach(item => {
          arrayProductsTrocafone.push(item)
        })
      })

      arrayProductsTrocafone.forEach(item => {
        const request = fetch(
          `${this.rootPath()}/p4v1/tradeinCheckImei/${item.imei}/${
            item.boosted
          }`
        )
          .then(response => response.json())
          .then(response => ({
            ...response,
            imei: item.imei,
          }))

        arrayPromise.push(request)
      })

      Promise.all(arrayPromise).then(values => {
        transport.forEach(mainProduct => {
          mainProduct.evaluatedProducts.forEach(item => {
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
        })

        const transportString = JSON.stringify(transport)
        if (
          transportString !==
          customDataDomain[0].fields.trade_in_option_selected
        ) {
          this.putCustomData(transport, total)
        }
      })
    }
  }
}
