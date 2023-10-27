/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

import { formatCurrencyBRL, formatNegativeValue } from "./_utils"

export default class Discounts {
  constructor() {
    this.discounts = []
  }

  _getDiscountValue(items, { rateAndBenefitsIdentifierId, skuId } = {}) {
    if (rateAndBenefitsIdentifierId) {
      return items.reduce((acc, currentItem) => {
        const { priceTags } = currentItem
  
        priceTags.forEach((priceTag) => {
          if (priceTag.identifier === rateAndBenefitsIdentifierId) {
            acc += priceTag.value
          }
        })
  
        return acc
      }, 0)
    }

    if (skuId) {
      return items.reduce((acc, currentItem) => {
        const { id, priceTags } = currentItem

        if (skuId === id) {
          priceTags.forEach((priceTag) => {
            if (priceTag.identifier === null) {
              acc += priceTag.value
            }
          })
        }
  
        return acc
      }, 0)
    }
  }

  _discountTemplate({ identifier, title, value } = {}) {
    return `
      <tr id="discount-${identifier}" class="discount cupon" style="height: 23px;">
        <td style="margin-left: 10px;">${title}</td>
        <td>
          <span>${formatNegativeValue(
            formatCurrencyBRL(value)
          )}</span>
        </td>
      </tr>
    `
  }

  _setRatesAndBenefitsDiscounts(orderForm) {
    try {
      const { items, ratesAndBenefitsData } = orderForm
  
      if (!ratesAndBenefitsData.rateAndBenefitsIdentifiers) {
        return
      }

      const { rateAndBenefitsIdentifiers } = ratesAndBenefitsData
  
      const discounts = rateAndBenefitsIdentifiers.reduce((acc, rateAndBenefitsIdentifier) => {
        const { id, name, additionalInfo } = rateAndBenefitsIdentifier
        const discountValue = this._getDiscountValue(items, {
          rateAndBenefitsIdentifierId: id
        })
        
        const isFrete = name.toLowerCase().includes(' frete') || name.toLowerCase().includes(" (frete")
        const title = additionalInfo ? additionalInfo.title : undefined
        const currentDiscount = acc.find(discount => discount.identifier === id)

        if (!currentDiscount && discountValue && !isFrete) {
          const discount = {
            identifier: id,
            name,
            title,
            value: discountValue
          }

          acc.push(discount)
        }

        return acc
      }, [])

      this.discounts = discounts
    } catch (err) { 
      console.error(`Ocorreu um erro ao iniciar os descontos: ${err}`)
    }
  }

  _setCustomDataDiscounts(orderForm) {
    try {
      const { items, customData } = orderForm

      if (!customData) {
        return
      }

      const getAppById = appId => customData.customApps.find(app => app.id === appId)
      const ecoTroca = getAppById('eco_troca')

      if (ecoTroca) {
        const eco_troca_products = JSON.parse(ecoTroca.fields.eco_troca_products)
        eco_troca_products.forEach((item) => {
          const discountValue = this._getDiscountValue(items, {
            skuId: item.skuId
          })

          const identifier = `discount-custom-app-${ecoTroca.id}-${item.skuId}`
          const discountAlreadyExists = this.discounts.some(discount => discount.identifier === identifier)

          if (!discountAlreadyExists && discountValue) {
            const discount = {
              identifier,
              name: ecoTroca.id,
              title: 'Desc. Eco Troca',
              value: discountValue
            }

            this.discounts.push(discount)
          }
        })
      }
    } catch (err) {
      console.error(`Ocorreu um erro ao iniciar descontos de customApps: ${err}`)
    }
  }

  _renderUI() {
    if (!this.discounts.length) {
      return
    }

    const $totalizers = $('.totalizers-list')
    $totalizers.find('.discount').remove()

    const discountsWithTitle = this.discounts.filter(item => item.title)
    const otherDiscounts = this.discounts.filter(item => !item.title)

    const _this = this
    
    // Descontos com títulos cadastrados
    $totalizers.each(function(_, element) {
      const $totalizer = $(element)
      const $tr = $totalizer.find('.Discounts')
      const $trDiscountsWithTitle = discountsWithTitle.reduce((acc, next) => {
        const exits = acc.find(item => item.title.toLowerCase().trim() === next.title.toLowerCase().trim());
        if (!exits) {
          return [...acc, next]
        }

        exits.value += next.value

        return acc
      },[]).map((item) => {
        return _this._discountTemplate({ 
          identifier: item.identifier,
          title: item.title,
          value: item.value
        })
      })

      $tr.before(`${$trDiscountsWithTitle.join()}`)
    })

    if (!otherDiscounts.length) {
      return
    }

    const otherDiscountsTotals = otherDiscounts.reduce((acc, currentDiscount) => {
      if (currentDiscount.value) {
        acc += currentDiscount.value
      }

      return acc
    }, 0)

    if (!otherDiscountsTotals) {
      return
    }

    const hasDiscountWithTitle = _this.discounts.some(discount => discount.title)

    // Descontos sem títulos cadastrados
    $totalizers.each(function(_, element) {
      const $totalizer = $(element)
      const $tr = $totalizer.find('.Discounts')

      const $trOtherDiscounts = _this._discountTemplate({ 
        identifier: 'other-discounts',
        title: hasDiscountWithTitle ? 'Outros' : 'Descontos',
        value: otherDiscountsTotals
      })

      $tr.before(`${$trOtherDiscounts}`)
    })
  }

  init(orderForm) {
    try {
      this._setRatesAndBenefitsDiscounts(orderForm)
      this._setCustomDataDiscounts(orderForm)
      this._renderUI()
    } catch (err) { 
      console.error(`Ocorreu um erro ao iniciar componente de exibição de descontos: ${err}`)
    }
  }
}