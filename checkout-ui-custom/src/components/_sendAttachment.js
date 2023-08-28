/* eslint-disable padding-line-between-statements */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint eqeqeq: 0 */
/* eslint-disable no-useless-escape */

import { formatCurrencyBRL } from './_utils'

export default class SendAttachment {
  isInstallation(item) {
    return item.productCategoryIds.indexOf('2027') !== -1
  }

  sendOpenTextField() {
    let obsToOpenTextField = ''

    const { items } = window.vtexjs.checkout.orderForm
    const customData = window.vtexjs.checkout.orderForm.customData || false
    const tradeInCustomData =
      customData && customData.customApps.find(item => item.id === 'domain')

    const transportCustomData =
      tradeInCustomData && tradeInCustomData.fields.trade_in_option_selected

    const transport = transportCustomData ? JSON.parse(transportCustomData) : []

    // TRADE-IN
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
                parseFloat(itemLinkTradeIn.boostSSG)
            }
          }

          obsToOpenTextField += `{'ean':'${ean}', 'isTradeIn':'true', 'trocaSmartValue': '${formatCurrencyBRL(
            totalItemTradeIn,
            false
          )}'}, `
        }
      }
    }

    // INSTALLATION
    const productsInstallation = window.vtexjs.checkout.orderForm.items.filter(
      item => this.isInstallation(item)
    )

    const installationInProduct = []

    if (productsInstallation) {
      window.vtexjs.checkout.orderForm.items.filter(item => {
        if (productsInstallation) {
          productsInstallation.filter(service => {
            if (
              service.attachments.length &&
              service.attachments[0].name === 'linkInstallation'
            ) {
              if (item.refId == service.attachments[0].content.refId) {
                installationInProduct.push(item)
              }
            }

            return ''
          })
        }

        return ''
      })

      installationInProduct.map(install => {
        window.vtexjs.checkout.orderForm.shippingData.logisticsInfo.map(
          logistic => {
            if (logistic.itemId == install.id) {
              logistic.slas.map(sla => {
                if (logistic.selectedSla == sla.id) {
                  const estimative = parseInt(
                    sla.shippingEstimate.replace(/[^0-9\.]+/g, ''),
                    10
                  )

                  obsToOpenTextField += `{'isInstallation':'true','sku':'${
                    install.refId
                  }','estimate':'${estimative +
                    1}','price': '${formatCurrencyBRL(install.price)}'}, `
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

    // IN STORE
    const of = window.vtexjs.checkout.orderForm

    if (of) {
      const ofMarketingData =
        !!of.marketingData === false
          ? false
          : !!of.marketingData.marketingTags !== false

      if (ofMarketingData) {
        const isInStore = of.marketingData.marketingTags.some(
          tag => tag.toLowerCase() == 'instore'
        )

        if (isInStore) {
          if (of.openTextField.value.indexOf('instore') < 0) {
            obsToOpenTextField += `{'instore': '${window.vtexjs.checkout.orderForm.openTextField.value}'}, `
          }
        }
      }
    }

    // SEND FINAL TEXT TO OPENTEXTFIELD
    if (obsToOpenTextField) {
      window.vtexjs.checkout.sendAttachment('openTextField', {
        value: `${obsToOpenTextField}`,
      })
      localStorage.setItem('tradeInCustom', `${obsToOpenTextField}`)
    } else {
      window.vtexjs.checkout.sendAttachment('openTextField', { value: null })
      localStorage.setItem('tradeInCustom', null)
    }

    window.vtexjs.checkout.getOrderForm()
  }
}
