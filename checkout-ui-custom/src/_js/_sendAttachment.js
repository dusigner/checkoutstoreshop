/* eslint eqeqeq: 0 */
/* eslint-disable no-useless-escape */

import { formatCurrencyBRL } from './_utils'

export default class SendAttachment {
  isInstallation(item) {
    return item.productCategoryIds.indexOf('2027') !== -1
  }

  newTextFieldTradeInAndInstallation() {
    let obsForTradeInAndInstallation = ''

    const { items } = window.vtexjs.checkout.orderForm
    const transport = JSON.parse(localStorage.getItem('transport') || '[]')

    if (transport.length) {
      for (let i = 0; i < transport.length; i++) {
        let totalItemTradeIn = 0
        const itemLinkTradeIn = transport[i]
        let itemLinkTradeInValid = 0
        let ean = ''

        for (let j = 0; j < items.length; j++) {
          if (itemLinkTradeIn.mainProductId === items[j].productId) {
            ean = items[j].ean
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
                parseInt(itemLinkTradeIn.boostSSG, 10) * 100
            }
          }

          obsForTradeInAndInstallation += `{'ean':'${ean}', 'isTradeIn':'true', 'trocaSmartValue': '${formatCurrencyBRL(
            totalItemTradeIn,
            false
          )}'}, `
        }
      }
    }

    const hasInstallation = window.vtexjs.checkout.orderForm.items.filter(
      item => this.isInstallation(item)
    )

    const installationInProduct = []

    if (hasInstallation) {
      window.vtexjs.checkout.orderForm.items.filter(item => {
        const productsService = window.vtexjs.checkout.orderForm.items.filter(
          product => this.isInstallation(product)
        )

        if (productsService) {
          productsService.filter(service => {
            if (service.attachments[0].name === 'linkInstallation') {
              if (item.refId == service.attachments[0].content.refId) {
                installationInProduct.push(item)
              }
            }

            return ''
          })
        }

        return productsService
      })

      installationInProduct.filter(install => {
        window.vtexjs.checkout.orderForm.shippingData.logisticsInfo.filter(
          logistic => {
            if (logistic.itemId == install.id) {
              logistic.slas.filter(sla => {
                if (logistic.selectedDeliveryChannel == sla.deliveryChannel) {
                  let estimative = ''

                  estimative = parseInt(
                    sla.shippingEstimate.replace(/[^0-9\.]+/g, ''),
                    10
                  )
                  obsForTradeInAndInstallation += hasInstallation.map(item => {
                    return `{'isInstallation':'true','sku':'${
                      install.refId
                    }','estimate':'${
                      estimative + 1
                    }','price': '${formatCurrencyBRL(item.price)}'}`
                  })
                }

                return ''
              })
            }

            return ''
          }
        )

        return ''
      })
    }

    if (obsForTradeInAndInstallation) {
      window.vtexjs.checkout.sendAttachment('openTextField', {
        value: `${obsForTradeInAndInstallation}`,
      })
      window.vtexjs.checkout.getOrderForm()
    }
  }
}
