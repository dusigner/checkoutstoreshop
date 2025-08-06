import { formatCurrencyBRL } from './_utils'

export default class SendAttachment {
  // Método para verificar se um item pertence à categoria de instalação
  isInstallation(item) {
    return item.productCategoryIds.includes('2027')
  }

  // Método principal para enviar texto para o campo openTextField
  sendOpenTextField() {
    const { items, customData } = window.vtexjs.checkout.orderForm
    const obsToOpenTextField = []

    this.processTransportInfo(customData, items, obsToOpenTextField)
    this.processInstallationInfo(items, obsToOpenTextField)
    this.processInStoreInfo(obsToOpenTextField)

    const finalText = this.createFinalText(obsToOpenTextField)
    this.sendFinalTextToOpenTextField(finalText)

    window.vtexjs.checkout.getOrderForm()
  }

  // Cria a string final a ser enviada para o campo openTextField
  createFinalText(obsToOpenTextField) {
    return obsToOpenTextField.length
      ? obsToOpenTextField.map(item => JSON.stringify(item)).join(', ')
      : null
  }

  // Envia a string final para o campo openTextField e armazena no localStorage
  sendFinalTextToOpenTextField(finalText) {
    window.vtexjs.checkout.sendAttachment('openTextField', { value: finalText })
    localStorage.setItem('tradeInCustom', finalText)
  }

  // ====================================================== //
  // ======================= TRADEIN ====================== //
  // ====================================================== //
  processTransportInfo(customData, items, obsToOpenTextField) {
    const transportCustomData = customData?.customApps?.find(
      item => item.id === 'domain-assurant'
    )
    const transport = transportCustomData?.fields?.trade_in_option_selected
      ? JSON.parse(transportCustomData.fields.trade_in_option_selected)
      : []

    transport.forEach(itemLinkTradeIn => {
      const itemLinkTradeInValid = items.filter(
        item => itemLinkTradeIn.mainProductId === item.productId
      )

      if (itemLinkTradeInValid.length > 0) {
        let totalItemTradeIn = 0
        let ean = ''

        if (itemLinkTradeIn?.bestOffer === 'galaxy-club') {
					totalItemTradeIn = itemLinkTradeIn?.galaxyClubValue;
				} else {
          itemLinkTradeIn.evaluatedProducts.forEach((evaluatedProduct, k) => {
            if (k > 0 && totalItemTradeIn > 0) {
              totalItemTradeIn += evaluatedProduct.price
            } else {
              totalItemTradeIn +=
                evaluatedProduct.price + parseFloat(itemLinkTradeIn.boostSSG)
            }
          })
        }

        ean = itemLinkTradeInValid[0].ean
        obsToOpenTextField.push({
          ean,
          isTradeIn: 'true',
          trocaSmartValue: formatCurrencyBRL(totalItemTradeIn, false),
        })
      }
    })
  }

  // ====================================================== //
  // ===================== INSTALATION ==================== //
  // ====================================================== //
  processInstallationInfo(items, obsToOpenTextField) {
    const productsInstallation = items.filter(item => this.isInstallation(item))

    const installationInProduct = productsInstallation.filter(product =>
      product.attachments.some(
        attachment => attachment.name === 'linkInstallation'
      )
    )

    installationInProduct.forEach(install => {
      window.vtexjs.checkout.orderForm.shippingData.logisticsInfo.forEach(
        logistic => {
          if (logistic.itemId === install.id) {
            logistic.slas.forEach(sla => {
              if (logistic.selectedSla === sla.id) {
                const estimative = parseInt(
                  sla.shippingEstimate.replace(/[^0-9\.]+/g, ''),
                  10
                )

                obsToOpenTextField.push({
                  isInstallation: 'true',
                  sku: install.refId,
                  estimate: estimative + 1,
                  price: formatCurrencyBRL(install.price),
                })
              }
            })
          }
        }
      )
    })
  }

  // ====================================================== //
  // ======================= INSTORE ====================== //
  // ====================================================== //
  processInStoreInfo(obsToOpenTextField) {
    const orderForm = window.vtexjs.checkout.orderForm

    if (orderForm) {
      const ofMarketingData =
        !!orderForm.marketingData === false
          ? false
          : !!orderForm.marketingData.marketingTags !== false

      if (ofMarketingData) {
        const isInStore = orderForm.marketingData.marketingTags.some(
          tag => tag.toLowerCase() === 'instore'
        )

        if (isInStore) {
          if (orderForm.openTextField.value.indexOf('instore') < 0) {
            obsToOpenTextField.push({ instore: orderForm.openTextField.value })
          }
        }
      }
    }
  }
}
