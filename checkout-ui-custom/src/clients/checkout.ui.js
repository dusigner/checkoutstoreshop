import BespokeRefrigerator from '../components/_bespokeRefrigerator'
import { general } from '../components/general'

import CustomPreEmail from '../components/_pre-email'
import CustomProfileData from '../components/_profile'
import CustomShippingData from '../components/_shipping'
import InstallationService from '../components/_installationService'
import TradeIn from '../components/_tradeIn'
import SendAttachment from '../components/_sendAttachment'
import CheckoutLimit from '../components/_checkoutLimit'
import SamsungCarePlus from '../components/_samsungCarePlus'
import Messages from '../components/_messages'
import FidelidadeCustomizations from '../components/_fidelidade'
import Discounts from '../components/_discounts'
import ShippingEstimateCustom from '../components/_shippingEstimateCustom'
import CSP from '../components/_csp'
import { rootPath } from '../components/utils/_rootPath'
import SummaryGiftCard from '../components/_summaryGiftCard'

import {
  debounce,
  formatCurrencyBRL,
  formatNegativeValue,
} from '../components/_utils'
import { customHeader } from '../components/headerCustom/header'
import { Rewards } from '../components/rewards/_rewards'
import { fnsCustomAddressForm } from '../components/_customAddressForm'
import { adobeLaunchInit } from '../components/_adobeLaunchPixel'
import { createLayoutEmptyCart } from '../components/emptyCart'
import { ServicesLinks } from '../components/_servicesLinks'

export class CheckoutCustom {
  constructor({
    type = 'vertical',
    accordionPayments = true,
    deliveryDateFormat = false,
    quantityPriceCart = false,
    showNoteField = false,
    customAddressForm = false,
    hideEmailStep = true,
  } = {}) {
    this.type = type // ["vertical"]
    this.orderForm = ''
    this.orderId = this.orderForm ? this.orderForm.orderFormId : ''
    this.lang = ''

    this.accordionPayments = accordionPayments
    this.deliveryDateFormat = deliveryDateFormat
    this.quantityPriceCart = quantityPriceCart
    this.showNoteField = showNoteField
    this.customAddressForm = customAddressForm
    this.hideEmailStep = hideEmailStep
    this.lastOrderFormTotalPrice = 0
    this.termPrice = 0
    this.subTotalValueFinal = null
    this.discountPrices = null

    this.Rewards = null

    this.preEmail = new CustomPreEmail()
    this.profile = new CustomProfileData()
    this.shipping = new CustomShippingData()
    this.installationService = new InstallationService()
    this.TradeIn = new TradeIn()
    this.SendAttachment = new SendAttachment()
    this.hasSelectedDefaultPaymentMethod = false
    this.CheckoutLimit = new CheckoutLimit()
    this.CSP = new CSP()
    this.samsungCarePlus = new SamsungCarePlus()
    this.messages = new Messages()
    this.discounts = new Discounts()
    this.fidelidade = new FidelidadeCustomizations()
    this.servicesLinks = new ServicesLinks()
    // this.topBanners = new TopBanners()
    this.SummaryGiftCard = new SummaryGiftCard()

    if (deliveryDateFormat) {
      this.shippingEstimateCustom = new ShippingEstimateCustom()
    }
  }

  onDomMutation({ targetNode, callback, disconnectCondition = true }) {
    const observeDOM = (function () {
      const MutationObserver =
        window.MutationObserver || window.WebKitMutationObserver

      return function (obj, callback1) {
        if (!obj || obj.nodeType !== 1) return

        if (MutationObserver) {
          // define a new observer
          const mutationObserver = new MutationObserver(callback1)

          // have the observer observe foo for changes in children
          mutationObserver.observe(obj, { childList: true, subtree: true })

          return mutationObserver
        }

        // browser support fallback
        if (window.addEventListener) {
          obj.addEventListener('DOMNodeInserted', callback1, false)
          obj.addEventListener('DOMNodeRemoved', callback1, false)
        }
      }
    })()

    const observer = new MutationObserver(function () {
      if (targetNode && disconnectCondition) {
        observer.disconnect()

        observeDOM(targetNode, () => callback())
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  addAssemblies(orderForm) {
    try {
      $.each(orderForm.items, function (i) {
        const _item = this

        if (_item.assemblies.length > 0) {
          let _assembliesHtml = `<div class="v-custom-assemblies">`

          $.each(_item.assemblies, function () {
            const _assemblies = this

            const inptValues = _assemblies.inputValues

            _assembliesHtml += `<p>${_assemblies.id}</p>`
            _assembliesHtml += `<ul class="v-custom-assemblies__values">`
            Object.entries(inptValues).forEach(([key, val]) => {
              _assembliesHtml += `<li class="v-custom-assemblies__values__item assembly-${key
                .toLowerCase()
                .replace(/ /g, '-')}">
                                      <strong>${key}</strong>
                                      <span>${val.trim()}</span>
                                    </li>`
            })
            _assembliesHtml += `</ul>`
          })
          _assembliesHtml += `</div>`
          if (
            !$(`.table.cart-items tbody > tr.product-item:eq(${i})`).hasClass(
              'v-custom-assemblies-in'
            )
          ) {
            $(`.table.cart-items tbody > tr.product-item:eq(${i})`)
              .addClass('v-custom-assemblies-in')
              .find('td.product-name')
              .append(_assembliesHtml)
          }
        }
      })
    } catch (e) {
      console.error('addAssemblies error:', e)
    }
  }
  createChoiceNewProducts() {
    try {
      const _trElem = $(`.cart-more-options`)

      if (
        _trElem
          .find('#shipping-preview-container .srp-content')
          .find('.choice-new-products').length > 0
      ) {
        return
      }

      _trElem.find('#shipping-preview-container .srp-content').append(
        `<div class="choice-new-products" style="width: 100%; margin-top: 27px; text-align: center;">
          <a href="/" style="font-size: 14px; font-weight: 700; padding-block: 10px; color: #000; margin-bottom: 0; text-decoration: underline;">
            Escolher mais produtos
          </a>
        </div>`
      )
    } catch (e) {
      console.error('createChoiceNewProducts error:', e)
    }
  }

  couponInfo(orderForm) {
    const isThereCoupon =
      orderForm.marketingData === null
        ? false
        : !!orderForm.marketingData.coupon

    try {
      if (!isThereCoupon) {
        const _trElem = $(`.summary-template-holder`)

        if (
          _trElem.find('.coupon-fields').find('.div-coupon-info').length > 0
        ) {
          return
        }

        _trElem.find('.coupon-fields').append(
          `<div class="div-coupon-info" style="margin-bottom: 20px; text-align: left">
            <p style="font-size: 12px; color: #555555;">
              Digite o cupom de desconto
            </p>
          </div>`
        )
      }
    } catch (e) {
      console.error('couponInfo error:', e)
    }
  }

  ApplyCoupon(orderForm) {
    const isThereCoupon =
      orderForm.marketingData === null
        ? false
        : !!orderForm.marketingData.coupon

    try {
      if (isThereCoupon) {
        const _trElem = $(`.summary-template-holder`)
        const removeCouponElement = $(`.coupon-fields .info .delete a`)

        if (
          _trElem.find('.totalizers-list').find('.coupon-applied').length > 0
        ) {
          return
        }

        _trElem.find('.totalizers-list .Items').after(
          `<tr class="coupon-applied" style="height: 23px;">
            <td style="margin-left: 10px;">Cupom</td>
            <td>
              <p class="using-coupon-text" style="font-weight: 700;line-height: 1;display: flex;align-items: center;gap: 5px;">
                ${orderForm.marketingData.coupon}
              </p>
            </td>
          </tr>`
        )
        _trElem
          .find('.totalizers-list .using-coupon-text')
          .append(removeCouponElement[1])
      }
    } catch (e) {
      console.error('ApplyCoupon error:', e)
    }
  }

  buildVertical() {
    $('body').addClass('body-cart-vertical')
    $('.cart-template .cart-links-bottom:eq(0)').appendTo(
      '.cart-template > .summary-template-holder'
    )
  }

  showDeliveryOptions() {
    $(
      '.cart-template .cart-more-options:eq(0), .cart-template .extensions-checkout-buttons-container'
    ).appendTo('.cart-template-holder')
  }

  builder() {
    const _this = this

    _this.buildVertical()
    _this.showDeliveryOptions()

    if (_this.showNoteField) {
      $('body').addClass('js-vcustom-showNoteField')
    }

    if (_this.hideEmailStep) {
      $('body').addClass('js-vcustom-hideEmailStep')
    }
  }

  showEmptyCart(orderForm) {
    if (orderForm.items.length === 0) {
      $('div.empty-cart-content').addClass('is-empty')
    } else {
      $('div.empty-cart-content').removeClass('is-empty')
    }
  }

  enchancementProductCart(orderForm) {
    try {
      $.each(orderForm.items, function (i) {
        const _trElem = $(`.table.cart-items tbody tr.product-item:eq(${i})`)
        if (_trElem.find('td.product-name').find('.more-info').length === 1) {
          return
        }

        const logisticsInfoData = orderForm.shippingData.logisticsInfo[i].selectedDeliveryChannel === 'delivery' && orderForm.shippingData.logisticsInfo[i].selectedSla !== null
          ? `Opção de entrega selecionada: <span>${orderForm.shippingData.logisticsInfo[i].selectedSla}</span><br />`
          : orderForm.shippingData.logisticsInfo[i].selectedSla === null
            ? ''
            : `Retirada em: <span>${orderForm.shippingData.logisticsInfo[i].slas.find(pickup => pickup.name === orderForm.shippingData.logisticsInfo[i].selectedSla).pickupStoreInfo.friendlyName}</span><br /> Retirada após confirmação via e-mail`;

        const refId = orderForm.items[i].refId || ''
        const { detailUrl } = orderForm.items[i]
        const isInstallService = detailUrl.includes('/install-service/p')
        const isSamsungCare = detailUrl.includes('/samsung-care-')

        const shippingText =
          isInstallService || isSamsungCare ? 'Após a entrega do produto' : ''

        const moreInfoHtml = `
            <div class="more-info ${isInstallService || isSamsungCare ? "isServices" : ""}">
              <p class="ref-id" style="font-size: 12px" data-refid="${refId}">${refId}</p>
              <p class="shipping-data">${logisticsInfoData}</p>
              <p class="estimate-shipping">${shippingText}</p>
            </div>
          `

        _trElem.find('td.product-name').append(moreInfoHtml)
      })
    } catch (e) {
      console.error('enchancementProductName error:', e)
    }
  }

  async imgEmptyCart() {
    createLayoutEmptyCart()
  }

  async customAddressFormLoader() {
    const _this = this

    if (!window.vtex.googleMapsApiKey) {
      console.error(
        'You might need to add your Google Maps API Key in your admin'
      )
      _this.customAddressForm = false

      return false
    }

    if (_this.customAddressForm) {
      if (window.location.hash === '#/shipping') {
        _this.customAddressForm = new fnsCustomAddressForm()
      }
    }
  }

  updateStep() {
    const prefixClass = 'v-custom-step-'
    const bClassStep = ['cart', 'email', 'profile', 'shipping', 'payment']

    $('body').removeClass(
      bClassStep
        .map(step => {
          return prefixClass + step
        })
        .join(' ')
    )
    if (window.location.hash) {
      const [, hashstep] = window.location.hash.split('/')

      if (
        bClassStep.findIndex(st => {
          return st === hashstep
        }) !== -1
      ) {
        $('body').addClass(prefixClass + hashstep)
      }
    }
  }

  showCustomMsgInstallation(orderForm) {
    try {
      const { items } = orderForm
      const _trElem = $(`.Discounts`)

      const installationServices = items.filter(item =>
        item.detailUrl.includes('/install-service/p')
      )

      if (!installationServices.length) return

      const installationSummaryRows = installationServices.map(item => {
        const installationPrice =
          item.sellingPrice > 1
            ? formatCurrencyBRL(item.sellingPrice)
            : 'Grátis'

        return `
          <tr style="height: 23px;">
            <td>Serviço de instalação</td>
            <td>
              <span style="font-weight: 700">
                ${installationPrice}
              </span>
            </td>
          </tr>
        `
      })

      const element = `
        <tr class="installation-summary">
          <td style="padding: 0 !important">
            <table width="100%">
              ${installationSummaryRows.join('')}
            </table>
          </td>
        </tr>
      `

      $('.totalizers-list .installation-summary').remove()

      _trElem.before(`${element}`)
    } catch (err) {
      console.error(`installationServiceSummary: ${err}`)
    }
  }

  showCustomMsgCoupon(orderForm) {
    const _thereIsCoupon =
      orderForm.marketingData === null
        ? false
        : !!orderForm.marketingData.coupon

    const _coupon = _thereIsCoupon && orderForm.marketingData.coupon

    const _customer =
      orderForm.clientProfileData === null
        ? false
        : orderForm.clientProfileData.email !== null

    const _message = _customer
      ? 'Cupom inválido para essa compra.'
      : 'Para usar o cupom, você precisa estar logado.'

    const _trElem = $(`.summary-template-holder`)
    const couponItemsCount = orderForm.items.reduce(function (
      accumulator,
      item
    ) {
      return (
        accumulator +
        (item.priceTags.length
          ? item.priceTags.filter(_pricetag => {
            return _pricetag.ratesAndBenefitsIdentifier
              ? _pricetag.ratesAndBenefitsIdentifier.matchedParameters[
              'couponCode@Marketing'
              ] === _coupon
              : 0
          }).length
          : 0)
      )
    },
      0)

    if (!_coupon || couponItemsCount > 0) {
      $('.coupon-applied-message').remove()

      return false
    }

    if (couponItemsCount === 0 && $('.coupon-applied-message').length === 0) {
      _trElem.find('.totalizers-list .coupon-applied').after(
        `<tr class="coupon-applied-message" style="height: 23px;">
            <td>
              <span style="color: #D62E2E; font-size: 12px; margin-left: 10px;">${_message}</span>
            </td>
        </tr>`
      )
    }
  }

  setParentIndex(orderForm) {
    $.each(orderForm.items, function (i) {
      if (this.parentItemIndex !== null) {
        $(`.table.cart-items tbody > tr.product-item:eq(${i})`).attr(
          'data-parentItemIndex',
          this.parentItemIndex
        )
      }
    })
  }

  removeMCLoader() {
    $(`.mini-cart .cart-items`).addClass('v-loaded')
  }

  removeCILoader() {
    $(`.cart-items`).addClass('v-loaded')
  }

  indexedInItems(orderForm) {
    const _this = this

    try {
      if (
        orderForm.items.filter(item => {
          return item.parentItemIndex !== null
        }).length === 0
      ) {
        _this.removeMCLoader()

        return false
      }

      if (orderForm.items) {
        const indexedInItems = orderForm.items.reduce((c, v) => {
          if (v.parentItemIndex !== null) {
            c[v.parentItemIndex] = c[v.parentItemIndex] || []
            c[v.parentItemIndex].push(v)
          }

          return c
        }, {})

        for (const key in indexedInItems) {
          const obj = indexedInItems[key]

          if (
            $(`.table.cart-items tbody > tr.product-item:eq(${key})`).find(
              '.v-custom-bundles'
            ).length <= 1
          ) {
            $(`.table.cart-items tbody > tr.product-item:eq(${key})`)
              .append(`<div class="v-custom-bundles"></div>`)
              .addClass('v-custom-indexedItems-in')
            if (
              $(`.table.cart-items tbody > tr.product-item:eq(${key})`)
                .find('.v-custom-bundles')
                .html() === ''
            ) {
              for (const prop in obj) {
                if (!obj.hasOwnProperty(prop)) continue
                const iiItem = obj[prop]

                $(
                  `.table.cart-items tbody > tr.product-item[data-sku='${iiItem.id}'][data-parentitemindex='${iiItem.parentItemIndex}']`
                )
                  .addClass('v-custom-indexed-item')
                  .clone()
                  .appendTo(
                    `.table.cart-items tbody > tr.product-item:eq(${key}) > .v-custom-bundles`
                  )
              }
            }
          }
        }

        _this.removeMCLoader()
      }
    } catch (e) {
      _this.removeMCLoader()
    }
  }

  changeShippingTimeInfoInit() {
    if (this.deliveryDateFormat) {
      this.shippingEstimateCustom.init()
    }
  }

  setPixAsDefaultPaymentMethod() {
    vtexjs.checkout.getOrderForm().done(function (orderForm) {
      try {
        const pixInstalments = orderForm.paymentData.installmentOptions.filter(
          payment => {
            return payment.paymentSystem === '125'
          }
        )

        if (!pixInstalments.length) return

        const data = {
          payments: [
            {
              paymentSystem: 125,
              installments: 1,
              referenceValue: pixInstalments[0].value,
            },
          ],
        }

        vtexjs.checkout.sendAttachment('paymentData', data)
      } catch (err) {
        console.error(`Erro ao exibir preço à vista para items no carrinho.`)
      }
    })
  }

  enchancementUnavailableProduct() {
    try {
      const _trElem = $(`.table.cart-items tbody`)

      if (
        _trElem
          .find('.product-item.unavailable.lookatme')
          .find('.unavailable-info').length > 0
      ) {
        return
      }

      _trElem.find('.product-item.unavailable.lookatme').append(
        `<div class="unavailable-info" style="width: 100%; background: #FEF6F3">
          <p class="unavailable-text" style="font-size: 12px; font-weight: 700; text-align: center; padding-block: 13px; color: #000; margin-bottom: 0;">
            O produto não pode ser entregue para este endereço.
          </p>
        </div>`
      )
    } catch (e) {
      console.error('enchancementUnavailableProduct error:', e)
    }
  }

  bundleItems(orderForm) {
    try {
      $.each(orderForm.items, function (i) {
        if (this.bundleItems.length > 0) {
          $(`.table.cart-items tbody tr.product-item:eq(${i})`)
            .addClass('v-custom-bundles-in')
            .find('td.product-name')
        } else {
          $(`.table.cart-items tbody tr.product-item:eq(${i})`).removeClass(
            'v-custom-bundles-in'
          )
        }
      })
      $('.table.cart-items tbody tr.item-service').each(function () {
        if ($(this).find('.v-custom-trservice-wrap').length > 0) return false
        $(this).find('> *').wrapAll(`<div class="v-custom-trservice-wrap">`)
      })
    } catch (e) {
      console.error('bundleItems error:', e)
    }
  }

  wrapSummary() {
    try {
      const _trElem = $(`.cart-template.full-cart`)

      if (_trElem.find('.summary-to-new-components').length > 0) {
        return
      }

      _trElem
        .find('> .summary-template-holder')
        .wrap(`<div class="summary-to-new-components"></div>`)

      // Corrigir bug que o botão, em alguns momentos, fica fora do wrapper
      $('.clearfix.pull-right.cart-links.cart-links-bottom.hide').appendTo(
        '.summary-template-holder'
      )
    } catch (e) {
      console.error('WrapSummary error:', e)
    }
  }

  addMedalliaScript() {
    try {
      const script = document.createElement('script')

      script.id = 'medallia-script'
      script.src =
        'https://resources.digital-cloud-west.medallia.com/wdcwest/145272/onsite/embed.js'
      document.body.appendChild(script)
    } catch (e) {
      console.error('addMedalliaScript error:', e)
    }
  }

  condensedTaxes(orderForm) {
    const customtax = orderForm.totalizers.filter(val => val.id === 'CustomTax')

    if (customtax && customtax.length < 2) return false

    const tooltip = `
      <div class="vcustom-customTax-resume">
       ${customtax
        .map(
          i =>
            `<p class="vcustom-customTax-resume__i"><span class="n">${i.name
            }</span><span class="v">${orderForm.storePreferencesData.currencySymbol
            } ${(i.value / 100).toFixed(2)}</span></p>`
        )
        .join('')}
      </div>
    `

    const customTaxElem = $('tr.CustomTax.CustomTax--total')

    if (customTaxElem.length) {
      customTaxElem.find('.vcustom-customTax-tot').remove()
      customTaxElem
        .find('.info')
        .append(
          `<div class="vcustom-customTax-tot"><span>?</span> ${tooltip}</div>`
        )
    }
  }
  summaryCustom() {
    try {
      const { items } = window.vtexjs.checkout.orderForm
      const itemsQuantity = items.length

      const quantitySelectedItems = items.map(item => {
        return item.quantity
      })

      const _accordionElem = $($('.summary-template-holder')[1])

      let listItems = ''

      items.forEach(item => {
        listItems += `
            <li>${item.name || item.skuName}</li>
          `
      })

      const _summaryOrder = `
        <div class="summaryOrder">
          <h6>Resumo do pedido (${itemsQuantity} ${quantitySelectedItems.length <= 1 ? 'item' : 'itens'
        })</h6>
          <ul>
            ${listItems}
          </ul>
        </div>
      `

      if (!$('.summaryOrder').length) {
        _accordionElem.prepend(_summaryOrder)
      } else {
        $('.summaryOrder').remove()
        _accordionElem.prepend(_summaryOrder)
      }
    } catch (e) {
      console.error('summaryCustom error:', e)
    }
  }
  enchancementTotalPrice(orderForm) {
    const _this = this

    if (!_this.quantityPriceCart) return
    try {
      $.each(orderForm.items, function (i) {
        const _trElem = $(`.table.cart-items tbody tr.product-item:eq(${i})`)

        if (_trElem.find('td.product-price').find('.best-price').length === 0) {
          return
        }

        const totalValue = _trElem.find('.total-selling-price:eq(0)').text()
        const listPriceTotalValue = orderForm.items[i].listPrice * orderForm.items[i].quantity
        const sellingPrice = orderForm.items[i].sellingPrice
        const free = sellingPrice == 1 || sellingPrice == 0

        const listPriceFormated = formatCurrencyBRL(listPriceTotalValue)

        free ? _trElem.addClass('gratuito') : null

        _trElem.attr('data-id-product', orderForm.items[i].productId)

        _trElem.find('.new-product-price').text(listPriceFormated)
        _trElem.find('.new-product-price').val(listPriceTotalValue)

        if(sellingPrice < listPriceTotalValue){
          _trElem.find('.new-product-price').addClass('line-through')
        }

        _trElem.find('td.product-price').find('.vqc-ldelem').remove()

        _trElem.find('td.product-price').find('.vqc-ldelem').remove()

        _trElem
          .find('td.product-price')
          .addClass('v-custom-quantity-price-active')
          .prepend(
            `
          <div class="v-custom-quantity-price vqc-ldelem">
            <p class="v-custom-quantity-price__best" style="font-size: 18px; color: #000; margin-bottom: 4px">${free ? 'Grátis' : totalValue
            }</p>
          </div>
          `
          )
      })
    } catch (e) {
      console.error('enchancementTotalPrice error:', e)
    }
    this.subTotalSummary(orderForm)
  }
  subTotalSummary(orderForm) {
    const _this = this

    if (!_this.quantityPriceCart) return

    const _containerTotalizers = $('.summary-totalizers .totalizers-list')
    const _subTotalElement = $(`.summary-totalizers .totalizers-list .Items`).find('.monetary')
    const _discountElement = $(`.summary-totalizers .totalizers-list .Discounts`).find('.monetary')

    const _elementListPrice = $('td.product-price').find('.new-product-price')

    let valoresSubTotalArray = [];

    _elementListPrice.each(function () {
      let valor = $(this).val();
      if (valor != "")
        valoresSubTotalArray.push(parseInt(valor));
    });

    _this.subTotalValueFinal = valoresSubTotalArray.reduce((accumulator, value) => accumulator + value, 0);
    _this.discountPrices = orderForm.totalizers[0].value - _this.subTotalValueFinal
    let discountFinalFormatted = formatNegativeValue(formatCurrencyBRL(_this.discountPrices))
    _subTotalElement.val(_this.subTotalValueFinal)
    _subTotalElement.text(formatCurrencyBRL(_this.subTotalValueFinal))

    if (valoresSubTotalArray.length > 0 && _subTotalElement.val() === `${this.subTotalValueFinal}`) {
      _containerTotalizers.css("display", "flex")
    } else {
      _containerTotalizers.css("display", "none")
    }

    if (orderForm.value === _this.subTotalValueFinal) {
      $(`.discount-subtotal-container`).remove()
      $(`.new-discount-value-container`).remove()
      $(`.new-discount-total-container`).remove()
    } else {
      if (_this.discountPrices) {
        let hasDiscount = orderForm.totalizers?.filter(val => val.id === 'Discounts')
        let discountTotal = _this.discountPrices + hasDiscount[0]?.value
        _discountElement.text(formatNegativeValue(formatCurrencyBRL(discountTotal)))
        if (hasDiscount.length > 0) {
          if (_containerTotalizers.find('.discount-subtotal-container').length === 0) {
            $(`.summary-totalizers .totalizers-list`).find('.Items').after(
              `<tr class="discount-subtotal-container" style="height: 23px; order: 2;">
                <td style="margin-left: 10px;">Oferta Especial Samsung.com</td>
                <td>
                  <span class="value-discount-subtotal">${discountFinalFormatted}</span>
                </td>
              </tr>`
            )
          }
          $(`.new-discount-value-container`).remove()
          $(`.new-discount-total-container`).remove()
        } else {
          if (_containerTotalizers.find('.new-discount-value-container').length === 0 && _containerTotalizers.find('.new-discount-total-container').length === 0) {
            $(`.summary-totalizers .totalizers-list`).find('.Items').after(
              `<tr class="new-discount-value-container" style="height: 23px; order: 2;">
                <td style="margin-left: 10px;">Oferta Especial Samsung.com</td>
                <td>
                  <span class="new-value-discount-total">${discountFinalFormatted}</span>
                </td>
              </tr>
              <tr class="new-discount-total-container" style="height: 23px; order: 1;">
                <td style="font-weight: 700">Descontos Totais</td>
                <td>
                  <span class="new-discount-total">${discountFinalFormatted}</span>
                </td>
              </tr>`
            )
          }
          $(`.discount-subtotal-container`).remove()
        }
      }
    }
  }

  async enchancementSummaryCart(orderForm, path) {
    try {
      if (orderForm.value == 0) {
        return
      }

      const _this = this
      const _trElem = $(`.summary-template-holder`)

      if (path === '#/payment') {
        const paymentAmountTotal = orderForm.value
        const giftRewards = orderForm.paymentData.giftCards.filter(
          g => g.provider === 'SSG_REWARDS'
        )

        let discount = 0

        if (
          giftRewards.length &&
          giftRewards[0].inUse &&
          giftRewards[0].value > 0
        ) {
          discount = giftRewards[0].value
        }

        if (paymentAmountTotal) {
          const _component = `
          <div class="cart-total" style="margin-bottom: 20px; color: #000">
            <div class="best-price" style="font-size: 26px; display: flex; justify-content: space-between; font-weight: 700">
              <p class="ref-id">Total</p>
              <p class="estimate-shipping">${formatCurrencyBRL(
            paymentAmountTotal - discount
          )}</p>
            </div>
          </div>
        `

          if (_trElem.find('.cart-total').length === 0) {
            _trElem.prepend(_component)
          } else {
            _trElem.find('.cart-total').remove()
            _trElem.prepend(_component)
          }
        }

        return
      }

      // Pega o valor do pix (código 125)
      if (
        window.vtexjs.checkout.orderForm &&
        window.vtexjs.checkout.orderForm.items.length > 0
      ) {
        const installmentPix = orderForm.paymentData.installmentOptions.find(
          item => item.paymentSystem == 125
        ).installments

        if (!installmentPix.length) return
        const inCashPrice = installmentPix[0].total
        // Encontra as installments para do cartao visa (código 2)
        // Pega o valor total para a installment com maior quantidade de parcelas (geralmente 12)

        // THE INSTALLMENTS ENDPOINT HAS A LOT OF REQUESTS AND IT AFFECT INDIRECTLY THE REWARDS PERFOMANCE, BECAUSE OF IT
        // I IMPLEMENTED TWO NEW STATES ONE TO KNOW THE LAST TOTALPRICE OF ORDERFORM AND ANOTHER TO KEEP THE INSTALLMENTS PRICE
        // ONLY WILL DO A NEW REQUEST CASE ORDERFORM TOTALPRICE BE CHANGED.
        if (_this.lastOrderFormTotalPrice !== orderForm.value) {
          _this.lastOrderFormTotalPrice = orderForm.value
          _this.termPrice = await fetch(
            `${rootPath()}/api/checkout/pub/orderForm/${orderForm.orderFormId
            }/installments?paymentSystem=2`
          )
            .then(response => response.json())
            .then(data => {
              if (data && data.installments) {
                const installmentOptions = data.installments

                const maxInstallment = installmentOptions.find(
                  install =>
                    install.count ===
                    Math.max(...installmentOptions.map(inst => inst.count))
                )

                return maxInstallment ? maxInstallment.total : ''
              }
            })
            .catch(e => {
              console.error('onTerm Price error', e)
            })
        }
        const discounts = orderForm.totalizers.filter(val => val.id === 'Discounts')
        const discountValue = Math.abs(discounts && discounts.length ? discounts[0].value : 0) + Math.abs(_this.discountPrices || 0)
  
        const _component = `
              <div class="cart-total" style="margin-bottom: 20px; color: #000">
                <div class="best-price" style="font-size: 26px; display: flex; justify-content: space-between; font-weight: 700">
                  <p class="ref-id">Total</p>
                  <p class="estimate-shipping">${formatCurrencyBRL(
                   inCashPrice
                )}</p>
                </div>
                ${!!_this.subTotalValueFinal && !!discountValue ? (
                  `<div class="discount-values" style="font-size: 14px; margin-top: 10px; display: flex; justify-content: end; gap: 24px;">
                    <span style="text-decoration: line-through">${formatCurrencyBRL(_this.subTotalValueFinal)}</span> <b style="color:#2189FF">Economia de ${formatCurrencyBRL(Math.abs(_this.discountPrices) + Math.abs(discounts[0].value))} </b>
                  </div>`
                ) : ''}
                <div class="discount-price" style="text-align: right; font-size: 14px; margin-top: 10px; display: flex; justify-content: space-between;">
                    <p>Ou parcelado em até 12x
                        <span 
                          class="custom-tooltip">
                        i
                        </span>
                    </p>
                    <p class="discount-total" style="font-weight: 700;">
                      ${formatCurrencyBRL(_this.termPrice)}
                    </p>
                </div>
              </div>
            `

        if (_trElem.find('.cart-total').length === 0) {
          _trElem.prepend(_component)
        } else {
          _trElem.find('.cart-total').remove()
          _trElem.prepend(_component)
        }
      }
    } catch (e) {
      console.error('enchancementSummaryCart error:', e)
    }
  }

  checkEmpty(items) {
    if (items.length === 0) {
      $('body').addClass('v-custom-cart-empty')
    } else {
      $('body').removeClass('v-custom-cart-empty')
    }
  }

  shippingColor(orderForm) {
    const shippingTotalizer = orderForm.totalizers.find(
      item => item.id === 'Shipping'
    )
    if (shippingTotalizer && shippingTotalizer.value <= 0.1) {
      $('.srp-summary-result .monetary').addClass('textBlue')
    }
  }

  async update(orderForm) {
    const _this = this

    this.ApplyCoupon(orderForm)
    this.checkEmpty(orderForm.items)
    this.addAssemblies(orderForm)
    this.enchancementTotalPrice(orderForm)
    this.enchancementProductCart(orderForm)
    this.shippingColor(orderForm)

    addEventListener('hashchange', async event => {
      const showHeader = ['#/payment', '#/shipping', '#/profile']
      const { hash } = event.target.location

      if (showHeader.includes(hash)) {
        customHeader()
      }
      this.enchancementSummaryCart(orderForm, window.location.hash)
    })

    if (!$('body').hasClass('modalActive')) {
      this.enchancementSummaryCart(orderForm, window.location.hash)
    }

    this.condensedTaxes(orderForm)
    this.setParentIndex(orderForm)
    this.indexedInItems(orderForm)
    this.showCustomMsgInstallation(orderForm)
    this.summaryCustom()
    this.createChoiceNewProducts()
    this.bundleItems(orderForm)
    this.wrapSummary()
    this.couponInfo(orderForm)
    this.CheckoutLimit.lockIncrementButtons(orderForm)
    this.CSP.init(orderForm)
    this.samsungCarePlus.samsungCareModalTrigger()
    this.samsungCarePlus.hideQuantityButtons(orderForm)
    this.installationService.init()
    new BespokeRefrigerator().init()
    this.changeShippingTimeInfoInit()
    this.servicesLinks.init(orderForm)
    this.SummaryGiftCard.init(orderForm)

    this.TradeIn.init(orderForm)
    await this.imgEmptyCart()

    const updateDebounce = debounce(function () {
      if (orderForm.marketingData) {
        _this.showCustomMsgCoupon(orderForm)
      }
    }, 250)

    updateDebounce()
  }

  paymentBuilder(orderForm) {
    const _this = this

    if (orderForm && $('.payment-group-item-cards').length === 0) {
      if (orderForm.paymentData) {
        const paymentGroups = [
          'debitCardPaymentGroup',
          'creditCardPaymentGroup',
        ]

        let paymentGroupCardsHtml = ``

        $.each(paymentGroups, function (p) {
          paymentGroupCardsHtml = `<span class="payment-group-item-cards">`
          $.each(
            orderForm.paymentData.paymentSystems.filter(
              item => item.groupName === paymentGroups[p]
            ),
            function () {
              paymentGroupCardsHtml += `<span class="card-flag ${this.name}">${this.name}</span>`
            }
          )
          paymentGroupCardsHtml += `</span>`
          if (_this.accordionPayments) {
            $(`#payment-group-${paymentGroups[p]}`).append(
              paymentGroupCardsHtml
            )
          }
        })

        if (!_this.accordionPayments) {
          $('#iframe-placeholder-creditCardPaymentGroup').prepend(
            paymentGroupCardsHtml
          )
        }
      }
    }

    if (
      !this.accordionPayments ||
      $('.payment-group-list-btn').find('.v-custom-payment-item-wrap').length >
      0
    ) {
      return false
    }

    $('body').addClass('v-custom-paymentBuilder-accordion')

    $('.payment-group-item').each(function () {
      $(this).wrap(
        `<div class='v-custom-payment-item-wrap ${$(this).hasClass('active') ? 'active' : ''
        }'></div>`
      )
    })

    $('.payment-group-item').each(function () {
      $(`#payment-data .steps-view > div:eq(${0})`).appendTo(
        $(this).closest('.v-custom-payment-item-wrap')
      )
    })
  }

  activateCustomForm() {
    const _this = this

    if (_this.customAddressForm) {
      $('body').addClass('v-custom-addressForm-on')
      _this.customAddressForm.validateAllFields()
    }
  }
  goToShippingStep() {
    window.location.hash = '#/shipping'
  }

  URLHasIncludePayment() {
    const _this = this

    if (
      window.location.hash === '#/payment' &&
      window.vtexjs.checkout.orderForm.shippingData.address.street === null
    ) {
      _this.goToShippingStep()
      _this.activateCustomForm()
    }
  }
  verifyCSP(orderForm) {
    try {
      // Workaround para caso a vtex mude a posição do selectedAddresses
      const filterSlas = orderForm.shippingData.logisticsInfo[0].slas.filter(
        objeto =>
          objeto.name === orderForm.shippingData.logisticsInfo[0].selectedSla
      )
      let statePickUp = filterSlas[0].pickupStoreInfo.address.state
      // Validar se o selectedDeliveryChannel do orderForm é do tipo "pick-up-point";
      if (
        orderForm.shippingData.logisticsInfo[0].selectedDeliveryChannel ===
        'pickup-in-point'
      ) {
        // Se positivo, verificar se campo UF do endereço do pick-up-point é igual ao UF do nó InvoiceData;
        if (statePickUp !== orderForm.invoiceData.address.state) {
          alert('O estado da NF é diferente do estado do endereço de retirada')
          window.location.hash = '#/shipping'
        }
      }
    } catch (err) {
      console.log('err: ', err)
    }
  }
  customAddressFormInit(orderForm) {
    const _this = this
    const _orderForm = orderForm || window.vtexjs.checkout.orderForm

    if (_this.customAddressForm) _this.customAddressForm.init(_orderForm)
  }

  checkProfileFocus() {
    const _this = this

    if (_this.hideEmailStep) {
      if (
        ~window.location.hash.indexOf('#/email') &&
        $('#client-email').val() === ''
      ) {
        $('#client-email').focus()
      }
    }
  }
  rtlUI() {
    if (
      window.vtex.i18n.getLocale() === 'ar' ||
      window.vtex.i18n.getLocale() === 'ar-SA' ||
      window.vtex.i18n.getLocale() === 'ar-IQ'
    ) {
      $('body').addClass('RTL-checkout')
    }
  }
  fixLabels() {
    $('p.input input').each(function (index, el) {
      const $context = $(el).closest('p.input')
      const isFilled = $(el).val()

      if (isFilled) {
        $context.addClass('filled')
      } else {
        $context.removeClass('filled')
      }
    })
  }

  scrollToPaymentCard(orderForm) {
    const paymentLength = orderForm.paymentData.payments.length;
    const paymentSystem = orderForm.paymentData.payments[0].paymentSystem;

    if (paymentLength == 1 && paymentSystem == 2) {
      const paymentCardsGroup = document.querySelector('.payment-group-item-cards');

      if (paymentCardsGroup) {
        const offsetTop = paymentCardsGroup.offsetTop;

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
  }


  defaultPaymentMethod() {
    try {
      // Default Payment Method: PIX
      const $defaultPaymentMethod = $(
        '#payment-group-instantPaymentPaymentGroup'
      )

      if (
        $defaultPaymentMethod.length &&
        !$defaultPaymentMethod.is('.active')
      ) {
        $defaultPaymentMethod.trigger('click')
      }

      this.hasSelectedDefaultPaymentMethod = true
    } catch (err) {
      this.hasSelectedDefaultPaymentMethod = false
      console.error(`Erro ao definir método de pagamento padrão: ${err}`)
    }
  }

  removeInstallationProduct() {
    const _this = this

    $('body').on('click', '.item-link-remove', async function () {
      const dataSku = $(this).closest('tr').attr('data-sku')

      await fetch(
        `${rootPath()}/api/catalog_system/pub/products/search?fq=skuId:${dataSku}`
      )
        .then(response => response.json())
        .then(response => {
          if (response[0] && response[0].skuSpecifications) {
            const isInstallation = response[0].skuSpecifications.filter(
              item => item.field.name === 'Serviço de Instalação'
            )

            if (isInstallation && isInstallation.length > 0) {
              const nameInstallation = isInstallation[0].values[0].name

              setTimeout(function () {
                const removeList = []

                window.vtexjs.checkout.orderForm.items.forEach((el, i) => {
                  if (el.refId === nameInstallation) {
                    removeList.push({
                      index: i,
                      quantity: 0,
                    })
                  }
                })
                const itemsToRemove = removeList

                if (itemsToRemove.length > 0) {
                  return window.vtexjs.checkout
                    .removeItems(itemsToRemove)
                    .then(() => { })
                }
              }, 2000)
            }
          }
        })
    })
  }
  popupSSC() {
    if ($('.fakeRemove').length === 0) {
      $('.product-item').each(function () {
        const dataSku = $(this).attr('data-sku')

        if (
          dataSku == '3353' ||
          dataSku == '3354' ||
          dataSku == '3653' ||
          dataSku == '3654' ||
          dataSku == '3655' ||
          dataSku == '25811' ||
          dataSku == '25810'
        ) {
          $(
            '<i title="remover" class="icon fakeRemove icon-remove item-remove-ico"></i>'
          ).appendTo($(`.product-item[data-sku=${dataSku}] .item-remove`))
        }
      })
      if (
        window.vtexjs.checkout &&
        window.vtexjs.checkout.orderForm &&
        window.vtexjs.checkout.orderForm.items
      ) {
        const product = window.vtexjs.checkout.orderForm.items.filter(item => {
          return (
            item.id === '3353' ||
            item.id === '3354' ||
            item.id === '3653' ||
            item.id === '3654' ||
            item.id === '3655' ||
            item.id === '25811' ||
            item.id === '25810'
          )
        })

        if (product[0] && product[0].attachments[0]) {
          const nameProduct = product[0].name
          const { idsku } = product[0].attachments[0].content
          const idskusc = product[0].id

          $(document).on('click', '.fakeRemove', function () {
            $('body').addClass('modalActive')
            if (
              product[0] &&
              product[0].attachments[0] &&
              product[0].attachments[0].content.idsku
            ) {
              const name = window.vtexjs.checkout.orderForm.items.filter(
                val => val.id === idsku
              )

              if ($('.modalssc').length == 0 && $('.layerpopup').length == 0) {
                $(`<div class="layerpopup"></div>
                 <div class="modalssc">
                  <p><b>Atenção</b>: ao excluir <b>${nameProduct}</b>, será removido também do seu carrinho o item <b>${name[0].name}</b></p>
                  <div>
                    <a>Voltar ao carrinho</a>
                    <a data-id-sc='${idskusc}' data-id='${idsku}'>Excluir</a>
                  </div>
                 </div>`).prependTo($('body'))
              }
            }
          })
        }
      }

      $(document).on('click', '.modalssc div a', function () {
        $('.layerpopup, .modalssc').fadeOut('fast', function () {
          $(this).remove()
        })
      })
      $(document).on('click', '.modalssc div a + a', function () {
        const productId = $(this).attr('data-id')

        const interval = 4000

        window.vtexjs.checkout.orderForm.items.forEach((el, i) => {
          setTimeout(function () {
            const removeList = []

            if (el.id === productId) {
              removeList.push({
                index: i,
                quantity: 0,
              })
              const itemsToRemove = removeList

              if (itemsToRemove.length > 0) {
                return window.vtexjs.checkout
                  .removeItems(itemsToRemove)
                  .then(() => { })
              }
            }
          }, i * interval)
        })
      })
    }
  }

  // CUSTOMIZAÇÃO PARA TRATAR ERRO NO LOGOUT POR CONTA DO AKAMAI (/BR)
  customizeLogOut() {
    const notMyvtex = window.location.href.indexOf('myvtex') == -1
    if ($('.link-logout-container').is(':visible') && notMyvtex) {
      $('#is-not-me').removeAttr('href')
      $('body').on('click', '#is-not-me', function () {
        const returnUrl = `${window.vtex.endpointAPI.split('/api')[0]
          }/checkout/changeToAnonymousUser/${window.vtexjs.checkout.orderForm.orderFormId
          }`

        window.location.assign(
          `${window.vtex.endpointAPI}/pub/logout?scope=${window.vtex.accountName}&returnUrl=${returnUrl}`
        )
      })
    }
  }

  bind() {
    const _this = this

    _this.removeInstallationProduct()
    $('body').on('click', '#v-custom-edit-login-data', function (e) {
      e.preventDefault()

      $(this).addClass('active')

      const data = null
      const xhr = new XMLHttpRequest()

      xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
          window.location.reload()
          setTimeout(function () {
            $('#v-custom-edit-login-data').removeClass('active')
          }, 1000)
        }
      })

      xhr.open(
        'GET',
        `/checkout/changeToAnonymousUser/${_this.orderForm.orderFormId}`
      )
      xhr.setRequestHeader('content-type', 'application/json')
      xhr.setRequestHeader('accept', 'application/json')

      xhr.send(data)
    })

    $('body').on('click', '.v-custom-payment-item-wrap', function () {
      $('.v-custom-payment-item-wrap').removeClass('active')
      $(this).addClass('active')
    })

    $('body').on(
      'click',
      '.vtex-pickup-points-modal-3-x-pickupDetailsHeaderButton, #map-canvas img, .vtex-omnishipping-1-x-pickupPointChange, .pkpmodal-pickup-point, .vtex-pickup-points-modal-3-x-modalDetailsBackLnk',
      function () {
        setTimeout(() => {
          _this.changeShippingTimeInfoInit()
        }, 100)
      }
    )

    $('body').on('click', '.js-checkout-steps-item .text', function () {
      window.location = $(this).closest('.checkout-steps_item').attr('data-url')
    })

    $('body').on(
      'click',
      '.vtex-omnishipping-1-x-linkEdit.link-edit',
      function () {
        setTimeout(() => {
          if (_this.customAddressForm) {
            $('body').addClass('v-custom-addressForm-on')
          }
        }, 50)
      }
    )

    $('body').on('click', '#btn-client-pre-email', function () {
      setTimeout(function () {
        if (!$('input#client-pre-email').hasClass('error')) {
          $('input#client-email').focus()
        }
      }, 1000)
    })

    $('body').on('click', '#shipping-option-delivery', function () {
      _this.customAddressFormInit(_this.orderForm)
    })

    $('body').on('click', '.show-more-items-button', function () {
      _this.general()
    })

    $('body').on('blur', 'p.input input', function () {
      const $context = $(this).closest('p.input')
      const isFilled = $(this).val()

      if (isFilled) {
        $context.addClass('filled')
      } else {
        $context.removeClass('filled')
      }
    })

    $('body').on(
      'click',
      '.link-edit, .link-box-edit, #edit-address-button, #new-address-button',
      function () {
        setTimeout(() => _this.fixLabels(), 30)
      }
    )

    $('body').on('focus', 'input#ship-postalCode', function () {
      $(this).attr('maxlength', 9)
    })
    $('body').on('paste', '#ship-postalCode', function () {
      const $postalCodeInput = $(this)

      if (!$postalCodeInput.length) return

      setTimeout(() => {
        if (
          $.trim($postalCodeInput.val()).length === 8 &&
          !$postalCodeInput.val().includes('-')
        ) {
          $('#cart-shipping-calculate').trigger('click')
        }

        if (
          $.trim($postalCodeInput.val()).length >= 9 &&
          $postalCodeInput.val().includes('-')
        ) {
          $('#cart-shipping-calculate').trigger('click')
        }
      }, 10)
    })
    $('body').on('input', '#ship-postalCode', function () {
      if ($.trim($(this).val().length) >= 9) {
        setTimeout(() => $('#cart-shipping-calculate').click(), 10)
      }
    })

    $('body').on('input', '#cart-coupon', function () {
      const $this = $(this)

      if ($this.val()) {
        $this.closest('span').addClass('has-value')
      } else {
        $this.closest('span').removeClass('has-value')
      }
    })
  }

  init() {

    if (window.location && this.orderForm) {
      const hash = window.location.hash
      this.handleOrderFromEndless(hash, this.orderForm)
    }

    if (window.vtex) {
      window.vtex.showInstallmentsPreviewValue = false
    }

    this.orderForm = window.vtexjs ? window.vtexjs.checkout.orderForm : false

    general()
    this.updateStep()
    this.builder()

    if (this.orderForm) {
      this.update(this.orderForm)
      this.paymentBuilder(this.orderForm)
      this.CSP.init(this.orderForm)
      this.SummaryGiftCard.init(this.orderForm)
    }

    this.fixLabels()
    this.CheckoutLimit.init()

  }

  start() {
    const _this = this
    try {
      console.log('Checkout is already started!!')

      $(function () {
        _this.messages.init()
        _this.bind()
        // _this.topBanners.init()
        _this.customAddressFormLoader()
        _this.rtlUI()
        _this.shippingEstimateCustom.bindEvents()
        // await this.customAddressFormLoader()
        // #pre-email
        _this.preEmail.bindEvents()
        _this.preEmail.createElementSamsungAccountLogin()

        // #shipping
        _this.shipping.bindEvents()

        // #profile
        _this.profile.bindEvents()

      })

      $(window).on('checkoutRequestBegin.vtex', function (event, request) {
        _this.CheckoutLimit.limitQuantity(event, request)
        _this.samsungCarePlus.sendSameQuantityAsAttachedItem(event, request)
      })
      $(window).on('checkoutRequestEnd.vtex', function (event, orderForm) {
        _this.samsungCarePlus.sync(orderForm)
        _this.CheckoutLimit.sync(orderForm)
        _this.installationService.sync(orderForm)
      })

      function trackLogin(accessKeyURL) {
        if (accessKeyURL) {
          window._satellite.track('shop_guest_login')
        }
      }
      $(document).ajaxComplete(function (event, xhr, settings) {
        if (settings.url.includes('/attachments/shippingData')) {
          _this.shipping.validadePostalCode(window.vtexjs.checkout.orderForm)
          _this.shipping.toggleGoToPaymentDisabled()

          if (window.location.hash === '#/shipping') {
            _this.shipping.checkReceiverName(_this.orderForm)
            _this.shipping.addInvalidSelectedDateMessage()
          }
        }
      })

      $(document).ajaxComplete(function (event, xhr, settings) {
        _this.init()
        const acessKeyURL = settings.url.includes(
          `${rootPath()}/api/checkout/pub/profiles/`
        )
        if (acessKeyURL) {
          const loginSucess = xhr.statusText === 'success'
          if (loginSucess) {
            trackLogin(acessKeyURL)
            setTimeout(() => {
              fetch(
                `${rootPath()}/api/vtexid/pub/authenticated/user?fields=email,userProfileId`,
                {
                  credentials: 'include',
                }
              )
                .then(resp => resp.json())
                .then(data => {
                  const email = data.user
                  const userProfileId = data.userId

                  return fetch(
                    `${rootPath()}/_v/post/updateClientAcessOrigin`,
                    {
                      method: 'POST',
                      body: JSON.stringify({
                        docId: userProfileId,
                        email,
                        accessOrigin: 'desktop',
                      }),
                    }
                  )
                    .then(() => {
                      return response
                    })
                    .catch(console.error)
                })
              window.digitalData.user.loginStatus = true
            }, 1000)
          }
        }
      })

      $(document).ajaxComplete(function (event, xhr, settings) {
        _this.init()
      })

      $(window).on('hashchange', function () {
        const cartItems = document.querySelector('.cart-items')
        if (
          window.location.hash === '#/payment' ||
          window.location.hash === '#/cart'
        ) {
          _this.TradeIn.validateTradeinCustomData()
          _this.SendAttachment.sendOpenTextField()
          // _this.displayHideSuperChat(window.location.hash)
          _this.customizeLogOut()
        }
        _this.updateStep()
        _this.changeShippingTimeInfoInit()
        _this.checkProfileFocus()
        _this.fixLabels()

        if (window.location.hash === '#/payment') {
          _this.defaultPaymentMethod()
        }

        _this.shipping.toggleGoToPaymentDisabled()

        if (window.location.hash === '#/email') {
          _this.preEmail.createElementSamsungAccountLogin()
        }
        if (window.location.hash === '#/profile') {
          // _this.profile.addWhatsAppField()
          _this.profile.addDateBirthField()
          _this.profile.addMsgPhone()
          _this.profile.toggleGoToShippingDisabled()
          _this.profile.removePj()
          _this.customizeLogOut()
        }
        if (_this.orderForm) {
          _this.indexedInItems(_this.orderForm)
          _this.paymentBuilder(_this.orderForm)
          _this.customAddressFormInit(_this.orderForm)
          _this.removeCILoader()

          _this.onDomMutation({
            targetNode: cartItems,
            callback: () => _this.removeCILoader(),
          })

          _this.shipping.validadePostalCode(_this.orderForm)

          if (window.location.hash === '#/profile') {
            _this.profile.addTerms(_this.orderForm)
          }

          if (window.location.hash === '#/shipping') {
            _this.shipping.checkReceiverName(_this.orderForm)
            _this.customizeLogOut()
          }
        }
      })

      $(window).on('orderFormUpdated.vtex', async function (evt, orderForm) {
        _this.update(orderForm)
        _this.showEmptyCart(orderForm)
        // addEventListener('hashchange', async event => {
        const showHeader = ['#/payment', '#/shipping', '#/profile']
        // const { hash } = event.target.location

        if (showHeader.includes(window.location.hash)) {
          customHeader()
        }
        // })

        // VERIFY IF SOME FIDELITY PARTNER DOESNT ACCEPT REWARDS, THEN DONT SHOW REWARDS INFOS
        const doesntAcceptRewards =
          window.sessionStorage.getItem('partnerRewards') === 'false'
        if (!doesntAcceptRewards) {
          _this.Rewards = new Rewards()
        }

        _this.Rewards.showObsRewards()

        if (!window.vtexjs.checkout.orderForm.loggedIn) {
          _this.preEmail.createElementSamsungAccountLogin()
        }
        if (!window.google && _this.customAddressForm) {
          _this.customAddressForm.loadScript()
        }

        if (window.location.hash == '#/shipping') {
          _this.shipping.removeIfHasntPrice()
        }

        if (window.location.hash === '#/cart') {
          _this.Rewards?.cancelRewardsDiscount()
          _this.shipping.removeIfHasntPrice()
        }

        if (window.location.hash === '#/payment') {
          _this.profile.addFieldsProfileToSummary(orderForm)
          _this.Rewards.cancelRewardsDiscount(true)
          _this.Rewards.showPointsSimulation()
          _this.verifyCSP(orderForm)
          _this.scrollToPaymentCard(orderForm)
        }

        if (window.location.hash === '#/profile') {
          // Add WhatsApp
          // _this.profile.addWhatsAppField()
          // Insere o campo data de nascimento
          _this.profile.addDateBirthField()
          _this.profile.addMsgPhone()
          _this.profile.addTerms(orderForm)
          _this.Rewards.showPointsSimulation()
        }
        if (window.location.hash === '#/shipping') {
          _this.shipping.checkReceiverName(orderForm)
        }
        if (!window.google && _this.customAddressForm) {
          _this.customAddressForm.loadScript()
        }

        if ($('#postalCode-finished-loading + .mb5').length) {
          _this.shipping.resetValidation()
        }

        _this.shipping.toggleGoToPaymentDisabled()
      })

      $(window).on('componentValidated.vtex', function () {
        try {
          _this.discounts.init(vtexjs.checkout.orderForm)
        } catch (err) {
          console.error(`${err}`)
        }
      })

      $(window).on('attachmentUpdated.vtex', function (evt, orderFormSection) {
        switch (orderFormSection) {
          case 'shippingData':
            _this.shipping.autoTriggerSlasResult()
            break

          default:
            break
        }
      })

      // ok load
      $(window).load(async function () {
        _this.setPixAsDefaultPaymentMethod()
        if (window.location.hash === '#/cart') {
          _this.Rewards.cancelRewardsDiscount()

          const checkIfRemove = localStorage.getItem(
            '@samsung/shippingResult',
            'remove'
          )

          if (checkIfRemove) {
            $('.srp-toggle__pickup').click()
          }
        }

        $('#cart-to-orderform').on('click', function () {
          _this.SendAttachment.sendOpenTextField()
        })
        if (window.location.hash === '#/email') {
          _this.preEmail.createElementSamsungAccountLogin()
        }

        _this.profile.removePj()
        if (window.location.hash === '#/shipping') {
          try {
            _this.shipping.checkReceiverName(window.vtexjs.checkout.orderForm)
          } catch (err) {
            console.error(`Erro ao verificar campo destinatário: ${err}`)
          }
        }

        if (
          window.location.hash === '#/payment' ||
          window.location.hash === '#/cart'
        ) {
          _this.TradeIn.validateTradeinCustomData()
          _this.SendAttachment.sendOpenTextField()
          // _this.displayHideSuperChat(window.location.hash)
        }

        $(window).one('componentValidated.vtex', () => _this.builder())

        window.vtexjs.checkout.getOrderForm().done(function () {
          _this.addMedalliaScript()
        })

        adobeLaunchInit()

        _this.checkProfileFocus()
        _this.changeShippingTimeInfoInit()
        _this.indexedInItems(window.vtexjs.checkout.orderForm)

        window.vtexjs.checkout.getOrderForm().done(function () {
          _this.addMedalliaScript()
        })
        if (window.location.hash === '#/payment') {
          _this.defaultPaymentMethod()
        }

        // #shipping
        _this.profile.toggleGoToShippingDisabled()
        _this.shipping.toggleGoToPaymentDisabled()
        _this.shipping.validadePostalCode(window.vtexjs.checkout.orderForm)
        $(window).one('componentValidated.vtex', () => _this.builder())
        _this.messages.init()
      })
    } catch (error) {
      general()
    }
  }

  /**
   * Essa função é responsável por limpar os dados pessoais (clientProfielData).
   * Serve para tratar os casos em que o vendedor testa o link de store+ antes de enviar 
   * para o cliente.
   */
  handleOrderFromEndless(hash, orderForm) {
    if (hash !== '#/cart') return

    const isOrderFromEndless = orderForm.customData?.customApps?.some(customApp => customApp.id === 'endlessaisle')
    if (!isOrderFromEndless) return

    if (!orderForm.clientProfileData) return

    if (!orderForm.clientProfileData.email) return

    fetch(`${rootPath()}/checkout/changeToAnonymousUser/${orderForm.orderFormId}`)
      .then(() => {
        location.reload()
      })
  }

}
