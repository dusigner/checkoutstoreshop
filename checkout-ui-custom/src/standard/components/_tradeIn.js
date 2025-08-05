/* eslint-disable vtex/prefer-early-return */
import { deleteCustomData, formatCurrencyBRL, getCustomDataFields, rootPath } from './_utils'
import SendAttachment from './_sendAttachment'

export default class TradeIn {
  constructor() {
    this.app = 'domain-assurant'
    this.appEndlessAisle = 'tradein_csp' 
    this.empty = false
    this.SendAttachment = new SendAttachment()
  }
  async init(orderForm) {
    const { items = [] } = orderForm ?? {}

    const tradeInFromLocalStorage = JSON.parse(localStorage.getItem('transport'))
    const { trade_in_option_selected } = getCustomDataFields({ app: this.app })

    if (items.length && trade_in_option_selected) {
      this.checkTradeIn(items, trade_in_option_selected ?? [])
    } else if (
      tradeInFromLocalStorage &&
      !trade_in_option_selected
    ) {
      const itemWithTradeIn = items?.find(
        item => tradeInFromLocalStorage?.some(
          transportItem => item.productId === transportItem.mainProductId
        )
      )

      if (itemWithTradeIn) {
        const { id, detailUrl } = itemWithTradeIn
        this.openWarningTradein({ detailUrl: `${detailUrl}?skuId=${id}` })
      }
    }
  }

  openWarningTradein({ detailUrl = '/' } = {}) {
    try {
      const _checkoutElem = $('body')
      const _component = `
        <div id="warning-modal-tradein">
          <div class="container-warning-modal-tradein">
            <p class="text-warning-modal-tradein">
              <b>Atenção:</b> Os dados da sua Troca Smart Samsung não foram salvos. Por favor refaça o processo para confirmar.
            </p>
            <a href="${rootPath()}${detailUrl}&scroll=tradeIn" class="action-warning-modal-tradein">Refazer</a>
          </div>
        </div>
      `

      if ($('.container-warning-modal-tradein.active').length > 0) {
        return
      }

      _checkoutElem.append(_component)
      setTimeout(() => {
        $('#warning-modal-tradein .container-warning-modal-tradein').addClass(
          'active'
        )
      }, 200)

      setTimeout(() => {
        $('#warning-modal-tradein .container-warning-modal-tradein').removeClass("active")
      }, 1000 * 10); // 10 seconds
    } catch (e) {
      console.error('openWarningTradein error:', e)
    }
  }

  checkTradeIn(items, transport) {
    const totalTradeIn = transport.reduce((total, itemLinkTradeIn) => {
      const itemLinkTradeInValid = items.filter(
        orderItem => orderItem.productId === itemLinkTradeIn.mainProductId
      ).length

      if (itemLinkTradeInValid > 0) {
        if (itemLinkTradeIn?.bestOffer === "galaxy-club") {
          return itemLinkTradeIn?.galaxyClubValue
        }

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

    const isGalaxyClub = transport?.[0]?.galaxyClubValue ? true : false;

    if (totalTradeIn > 0) {
      this.showTotalTradeIn(totalTradeIn, isGalaxyClub)

      $('#total-tradein-value').text(
        `${formatCurrencyBRL(totalTradeIn, false)}*`
      )

      const newTransport = transport.filter(item =>
        items.some(orderItem => orderItem.productId === item.mainProductId)
      )
  
      if (newTransport.length < transport.length) {
        this.putCustomData(newTransport, totalTradeIn)
      }
    }
  }

  showTotalTradeIn(totalTradeIn, isGalaxyClub) {
    try {
      const tradeinText = isGalaxyClub 
        ? "New Galaxy Club - Valor máximo pré-avaliado que poderá ser creditado em sua conta após a entrega do aparelho e a avaliação da Assurant."
        : "Troca Smart Samsung - Valor máximo pré-avaliado que poderá ser creditado em sua conta após a entrega do aparelho e a avaliação da Assurant." 

      const _checkoutElem = $('.summary-template-holder')
      const _component = `
        <tbody id="total-details-tradein">
          <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'">
            <td style="font-size: 14px; color: #000000; font-weight: 400; max-width: 245px;">${tradeinText}</td>
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
    try {
      const { orderFormId, items } = window?.vtexjs?.checkout?.orderForm ?? {}

      if (!orderFormId || !items?.length) {
        return
      }

      const newData = {
        trade_in_option_selected: JSON.stringify(transport),
        trade_in_total_value: total,
      }

      await $.ajax({
        url: `${rootPath()}/v1/pub/putCheckoutCustomData/${orderFormId}/domain-assurant`,
        type: 'PUT',
        crossDomain: true,
        accept: 'application/vnd.vtex.ds.v10+json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(newData),
      })

      this.checkTradeIn(items, transport)
    } catch (error) {
      console.error('Error in putCustomData:', error)
    }
  }

  openWarningTradeinUpdate() {
    try {
      const _checkoutElem = $('body')
      const _component = `
        <div id="warning-modal-tradein-update">
          <div class="container-warning-modal-tradein-update">
            <p class="text-warning-modal-tradein-update">
              <b>Atenção:</b> O valor da sua Troca Smart foi atualizado. Confira o novo valor no resumo do pedido.
            </p>
          </div>
        </div>
      `

      if (_checkoutElem.find('#warning-modal-tradein-update').length > 0) {
        return
      }

      _checkoutElem.append(_component)
      setTimeout(() => {
        $('#warning-modal-tradein-update .container-warning-modal-tradein-update').addClass(
          'inactive'
        )
      }, 10000)
    } catch (e) {
      console.error('openWarningTradein error:', e)
    }
  }

  async validateTradeinCustomData(orderForm) {
    const customDataDomain =
      orderForm?.customData?.customApps.filter(
        i => i.id === 'domain-assurant'
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
        const params = `idCategory=${item.idCategory}&idBrand=${
          item.idBrand
        }&idModel=${item.idModel}&nocache=${Date.now()}`
        const request = fetch(
          `${rootPath()}/tradein/trocafone/getProduct?${params}&isBoosted=${item.boosted
          }`
        )
          .then(response => response.json())
          .then(response =>
            response.products.find(p => p.id === item.idProduct)
          )

        arrayPromise.push(request)
      })

      Promise.all(arrayPromise).then(values => {
        transport.forEach(mainProduct => {
          mainProduct.evaluatedProducts.forEach(item => {
            const resultTrocafone = values.find(v => v.id === item.idProduct)

            if (!!resultTrocafone && !!resultTrocafone.id) {
              if (!!resultTrocafone.gradings) {
                const grading = resultTrocafone.gradings.find(
                  g => g.sku === item.grading.sku
                )

                if (!!grading && !!grading.price) {
                  item.price = grading.price
                  item.grading = grading
                  item.valueWithBoost = item.boosted
                    ? grading.price
                    : item.valueWithBoost
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
          customDataDomain[0].fields.trade_in_option_selected && 
          total > 0
        ) {
          this.openWarningTradeinUpdate()
          this.putCustomData(transport, total)
        }
      })
    }
  }

  async removeCustomDataTradeIn() {
    const fields = getCustomDataFields({ app: this.app })
    return deleteCustomData({ app: this.app, fields })
  }

  async removeCustomDataTradeInEndlessAisle() {
    const fields = getCustomDataFields({ app: this.appEndlessAisle })
    return deleteCustomData({ app: this.appEndlessAisle, fields })
  }

  clearGTI(orderForm) {
    try {
      const { marketingData } = orderForm ?? {}

      const marketingTags = marketingData?.marketingTags?.filter(marketingTag => (
        !marketingTag?.toUpperCase()?.startsWith('GTI')
      )) || []

      vtexjs?.checkout?.sendAttachment('marketingData', {
        ...marketingData,
        marketingTags
      })
    } catch (error) {
      console.error(`clearAllTradeInData: ${error}`);
    }
  }

  clearOpenTextField(orderForm) {
    try {
      const { openTextField } = orderForm ?? {}

      vtexjs?.checkout?.sendAttachment('openTextField', {
        ...openTextField,
        value: null,
      })
    } catch (error) {
      console.error(`clearOpenTextField: ${error}`);
    }
  }

  clearTransport() {
    try {
      localStorage.removeItem('transport')
      localStorage.removeItem('tradeInCustom')
    } catch (error) {
      console.error(`clearTransport: ${error}`);
    }
  }

  clearTotalizerMessages() {
    $('#total-details-tradein').remove()
    $('#text-details-tradein').remove()
  }

  clearAllTradeInData(orderForm) {
    const _this = this

    this.removeCustomDataTradeIn()
      .then(() => {
        _this.clearTotalizerMessages()
        _this.clearTransport()
        _this.clearGTI(orderForm)
        _this.clearOpenTextField(orderForm)
      })
      .catch(error => {
        console.error(`clearAllTradeInData: ${error}`)
      })
      .finally(() => {
        _this.empty = true
      })
  }

  clearAllTradeInDataTradeInCSP(orderForm) {
    const _this = this

    const isEndlessCustomData = orderForm.customData?.customApps?.some(
      customApp => customApp.id === 'endlessaisle'
    )

    const { trade_in_option_selected } = getCustomDataFields({
      app: this.appEndlessAisle,
    })

    if (isEndlessCustomData && trade_in_option_selected) {
      const tradeInAssurant = orderForm.customData?.customApps?.some(
        customApp => customApp.id === this.app
      )
      const { items = [] } = orderForm ?? {}
      const tradeInValidateProduct = trade_in_option_selected?.some(option =>
        items.some(item => item.id === option?.sku)
      )
      
      if (!tradeInAssurant && !tradeInValidateProduct) {
        this.removeCustomDataTradeInEndlessAisle()
          .then(() => {
            _this.clearGTI(orderForm)
          })
          .catch(error => {
            console.error(`clearAllTradeInData: ${error}`)
          })
          .finally(() => {
            _this.empty = true
          })
      }
    }
  }

  shouldClearAllTradeInData(orderForm) {
    if (this.empty) {
      return false
    }

    const { items = [] } = orderForm ?? {}
    const { trade_in_option_selected } = getCustomDataFields({ app: this.app })

    return !trade_in_option_selected || trade_in_option_selected?.some(option => (
      !items.some(item => item.productId === option?.mainProductId)
    ))
  }

  sync(orderForm) {
    try {
      if (!orderForm?.items) {
        return 
      }

      const tradeInCSPEndless = orderForm.customData?.customApps?.some(
        customApp => customApp.id === this.appEndlessAisle
      )

      const shouldClearAllTradeInData = this.shouldClearAllTradeInData(orderForm)

      if (shouldClearAllTradeInData && !tradeInCSPEndless) {
        this.clearAllTradeInData(orderForm)
      }
    } catch (error) {
      console.error(`Erro ao sincronizar dados do TradeIn: ${error}`);
    }
  }
}
