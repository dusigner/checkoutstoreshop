/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

import { formatCurrencyBRL, formatNegativeValue } from "./_utils"

export default class Discounts {
  constructor() {
    this.discounts = []
  }

  _getDiscountValue(items = [], { rateAndBenefitsIdentifierId, skuId } = {}) {
    if (rateAndBenefitsIdentifierId) {
      const availableItems = items.filter(
        item => item.availability !== "withoutStock"
      )
      
      return availableItems.reduce((acc, currentItem) => {
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

  _discountTemplate({ identifier, title, value, isCoupon, coupon } = {}) {
      return `
        <tr id="discount-${isCoupon && !value ? 'invalid' : identifier}" class="discount cupon">
          <td style="margin-left: 10px;">
            <div class="custom-cupon">${isCoupon ? `<span>Desconto Cupom</span> <span style="font-weight: 700">${coupon} </span>` : title}</div></td>
          <td>
            <span ${isCoupon ? 'class="using-coupon-text" style=style="font-weight: 700;line-height: 1;display: flex;align-items: center;gap: 5px;"' : ''}>
              ${value ? formatNegativeValue(
                formatCurrencyBRL(value)
              ) : ''}
            </span>
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
        const { id, name, additionalInfo, matchedParameters: {["couponCode@Marketing"] : couponCode} } = rateAndBenefitsIdentifier

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
            value: discountValue,
            isCoupon: !!couponCode
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

  _renderUI(orderForm) {
    if (!this.discounts.length && !orderForm.marketingData?.coupon) {
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
      const $trSearch = $totalizer.find('.Discounts')
      const $trDiscountFinal = $trSearch.length > 0 ? $trSearch : $totalizer.find('.Items')
      const discountsOptions = JSON.parse(JSON.stringify(discountsWithTitle))
      let $trDiscountsWithTitle = discountsOptions.reduce((acc, next) => {
        const exists = acc.find(item => item.title.toLowerCase().trim() === next.title.toLowerCase().trim());
        if (!exists) {
          return [...acc, next]
        }

        exists.value += next.value

        return acc
      },[])
      
      if(orderForm.marketingData && orderForm.marketingData.coupon) {
        const couponExists = $trDiscountsWithTitle.find(item => !!item.isCoupon)
        if(!couponExists) {
          $trDiscountsWithTitle.push({
            title: orderForm.marketingData.coupon,
            value: null,
            isCoupon: true
          })
        }
      }

      $trDiscountsWithTitle = $trDiscountsWithTitle.sort((a, b) => {
        // Regra 1: Se o title tiver "Oferta Especial {{nome do canal}}", mostra esse item em primeiro lugar
        if (a.title.includes('Oferta Especial') && !b.title.includes('Oferta Especial')) return -1;
        if (!a.title.includes('Oferta Especial') && b.title.includes('Oferta Especial')) return 1;

        // Regra 2: Se o title tiver "Desconto à Vista", mostra em ultimo lugar
        if (a.title === 'Desconto à Vista' && b.title !== 'Desconto à Vista') return 1;
        if (a.title !== 'Desconto à Vista' && b.title === 'Desconto à Vista') return -1;

        // Regra 3: Ordena pelos valores, do maior para o menor (considerando o valor absoluto)
        const absoluteA = Math.abs(a.value);
        const absoluteB = Math.abs(b.value);
        
        return absoluteB - absoluteA;
      }).map((item) => {
        return _this._discountTemplate({ 
          identifier: item.identifier,
          title: item.title,
          value: item.value,
          isCoupon: item.isCoupon,
          coupon: orderForm.marketingData && orderForm.marketingData?.coupon
        })
      })

      $trDiscountFinal.before(`${$trDiscountsWithTitle.join()}`)

      const _trElem = $('.discount .using-coupon-text')
      if($(`.totalizers-list .using-coupon-text a`).length) return 
      
      const removeCouponElement = $(`.coupon-fields .info .delete a`).clone(true)
      _trElem
      .append(removeCouponElement[0])
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
      const $trSearch = $totalizer.find('.Discounts')
      const $trDiscountFinal = $trSearch.length > 0 ? $trSearch : $totalizer.find('.Items')

      const $trOtherDiscounts = _this._discountTemplate({ 
        identifier: 'other-discounts',
        title: hasDiscountWithTitle ? 'Outros' : 'Descontos',
        value: otherDiscountsTotals
      })

      $trDiscountFinal.before(`${$trOtherDiscounts}`)
    })
  }

  init(orderForm) {
    try {
      this._setRatesAndBenefitsDiscounts(orderForm)
      this._setCustomDataDiscounts(orderForm)
      this._renderUI(orderForm)
    } catch (err) { 
      console.error(`Ocorreu um erro ao iniciar componente de exibição de descontos: ${err}`)
    }
  }
}