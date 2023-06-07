/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
/* eslint-disable prettier/prettier */
/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */
/* eslint eqeqeq: 0 */

const { _locale } = require('./_locale-infos.js')
const {
  debounce,
  formatCurrencyBRL,
  formatNegativeValue,
} = require('./_utils.js')
const FnsCustomAddressForm = require('./_customAddressForm.js')
const { default: CustomProfileData } = require('./_profile')
const { default: CustomShippingData } = require('./_shipping')
const { default: CustomHeader } = require('./_header.js')
const { default: SamsungCarePlus } = require('./_samsungCarePlus.js')
const { default: InstallationService } = require('./_installationService.js')
const { default: CustomPreEmail } = require('./_pre-email.js')
const { default: TradeIn } = require('./_tradeIn.js')
const { default: SendAttachment } = require('./_sendAttachment.js')
const { default: BespokeRefrigerator } = require('./_bespokeRefrigerator.js')
const { default: AdobeLaunchPixel } = require('./_adobeLaunchPixel.js')
const { default: Rewards } = require('./_rewards.js')
const { default: CheckoutLimit } = require('./_checkoutLimit.js')

class checkoutCustom {
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

    this.preEmail = new CustomPreEmail()
    this.profile = new CustomProfileData()
    this.shipping = new CustomShippingData()
    this.installationService = new InstallationService()
    this.TradeIn = new TradeIn()
    this.SendAttachment = new SendAttachment()
    this.adobeLaunchPixel = new AdobeLaunchPixel()
    this.hasSelectedDefaultPaymentMethod = false
    this.Rewards = new Rewards()
    this.CheckoutLimit = new CheckoutLimit()
    this.samsungCarePlus = new SamsungCarePlus()
  }

  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  general() {
    if (!$('.custom-cart-template-wrap').length) {
      $('.cart-template.mini-cart .cart-fixed > *').wrapAll(
        '<div class="custom-cart-template-wrap">'
      )
    }

    $('.table.cart-items tbody tr.product-item').each(function () {
      if (!$(this).find('.v-custom-product-item-wrap').length) {
        $(this).find('> *').wrapAll(`<div class="v-custom-product-item-wrap">`)
      }
    })

    $('body').addClass('v-custom-loaded')
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

  checkEmpty(items) {
    if (items.length === 0) {
      $('body').addClass('v-custom-cart-empty')
    } else {
      $('body').removeClass('v-custom-cart-empty')
    }
  }

  addEditButtoninLogin() {
    $('#v-custom-edit-login-data').remove()
    $('.client-pre-email h3.client-pre-email-h span').append(`
      <a id="v-custom-edit-login-data" class="link-box-edit btn btn-small" style="" title="${
        this.lang ? this.lang.editLabel : true
      }">
        <i class="icon-edit"></i>
        <i class="icon-spinner icon-spin icon-3x"></i>
      </a>
    `)
  }

  addStepsHeader() {
    if ($('.checkout-steps').length > 0 || !this.lang) return false

    const addStepsHeaderHtml = `
        <div class="checkout-steps">
          <div class="checkout-steps-wrap">
            <span class="checkout-steps_bar">
              <span class="checkout-steps_bar_inner"></span>
              <span class="checkout-steps_bar_inner-active"></span>
            </span>
            <div class="checkout-steps_items">
              <span class="checkout-steps_item checkout-steps_item_identification js-checkout-steps-item v-custom-step-profile" data-url="${this.rootPath()}/checkout/#/profile">
                <span class="text" data-before="1">${
                  this.lang
                    ? this.lang.checkoutStepsLabelIdentification
                    : 'Identification'
                }</span>
              </span>
              <span class="checkout-steps_item checkout-steps_item_shipping js-checkout-steps-item v-custom-step-shipping" data-url="${this.rootPath()}/checkout/#/shipping">
                <span class="text" data-before="2">${
                  this.lang ? this.lang.checkoutStepsLabelShipping : 'Shipping'
                }</span>
              </span>
              <span class="checkout-steps_item checkout-steps_item_payment js-checkout-steps-item v-custom-step-payment" data-url="${this.rootPath()}/checkout/#/payment">
                <span class="text" data-before="3">${
                  this.lang ? this.lang.checkoutStepsLabelPayment : 'Payment'
                }</span>
              </span>
            </div>
          </div>
        </div>
      `

    if ($('header.main-header').length) {
      $('header.main-header .container').append(addStepsHeaderHtml)
    }
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

  showCustomDiscounts() {
    try {
      const { items } = window.vtexjs.checkout.orderForm
      const _trElem = $(`.Discounts`)

      if (!items.length) return

      const itemsDiscounts = items
        .map(function (item) {
          return item.priceTags
        })
        .flat()
        .filter(item => item.value < 0)

      const uniqueDiscounts = itemsDiscounts.filter(function (discount) {
        return (
          itemsDiscounts.findIndex(
            i =>
              i.name === discount.name ||
              (i.ratesAndBenefitsIdentifier &&
                i.ratesAndBenefitsIdentifier.name
                  .toLowerCase()
                  .includes('desconto à vista') &&
                discount.ratesAndBenefitsIdentifier &&
                discount.ratesAndBenefitsIdentifier.name
                  .toLowerCase()
                  .includes('desconto à vista'))
          ) === itemsDiscounts.indexOf(discount)
        )
      })

      const discountsTotal = uniqueDiscounts.map(function (discount) {
        const name = discount.ratesAndBenefitsIdentifier
          ? discount.ratesAndBenefitsIdentifier.name
          : ''

        const total = itemsDiscounts.reduce(function (acc, current) {
          const isDiscountInCash = current.ratesAndBenefitsIdentifier
            ? current.ratesAndBenefitsIdentifier.name

                .toLowerCase()
                .includes('desconto à vista') &&
              name.toLowerCase().includes('desconto à vista')
            : ''

          if (current.name === discount.name || isDiscountInCash) {
            return (acc += current.value)
          }

          return acc
        }, 0)

        return {
          name,
          value: total,
        }
      })

      const elements = discountsTotal.map(discount => {
        if (discount.name.toLowerCase().includes('desconto à vista')) {
          this.hasSelectedDefaultPaymentMethod = true
          const selectedPaymentSystem =
            window.vtexjs.checkout.orderForm.paymentData.payments[0]
              .paymentSystem

          const paymentSystemName =
            window.vtexjs.checkout.orderForm.paymentData.paymentSystems.find(
              paymentSystem => {
                return paymentSystem.id == selectedPaymentSystem
              }
            ).name

          return `
            <tr class="discount discount_in_cash" style="height: 23px;">
              <td style="margin-left: 10px;">Desconto ${paymentSystemName}</td>
              <td>
                <span style="font-weight: 700">${formatNegativeValue(
                  formatCurrencyBRL(discount.value)
                )}</span>
              </td>
            </tr>`
        }

        if (discount.name.toLowerCase().includes('cupom instantâneo')) {
          return `
              <tr class="discount instant_voucher" style="height: 23px;">
                <td style="margin-left: 10px;">Desc. Cupom Instantâneo</td>
                <td>
                  <span style="font-weight: 700" >${formatNegativeValue(
                    formatCurrencyBRL(discount.value)
                  )}</span>
                </td>
              </tr>`
        }

        if (discount.name.toLowerCase().includes(' care')) {
          return `
              <tr class="discount sc" style="height: 23px;">
                <td style="margin-left: 10px;">Desc. Samsung Care+</td>
                <td>
                  <span style="font-weight: 700" >${formatNegativeValue(
                    formatCurrencyBRL(discount.value)
                  )}</span>
                </td>
              </tr>`
        }

        if (
          discount.name.toLowerCase().includes(' frete') ||
          discount.name.toLowerCase().includes(' (frete')
        ) {
          return ``
        }

        return `
            <tr class="discount cupon" style="height: 23px;">
              <td style="margin-left: 10px;">Desc. Cupom</td>
              <td>
                <span style="font-weight: 700" >${formatNegativeValue(
                  formatCurrencyBRL(discount.value)
                )}</span>
              </td>
            </tr>`
      })

      $('.totalizers-list .discount').remove()

      _trElem.before(`${elements.join()}`)
    } catch (e) {
      console.error('showCustomDiscounts error', e)
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

  addBusinessDays(n, lang = window.i18n.options.lng) {
    const _this = this
    let d = new Date()

    d = new Date(d.getTime())
    const day = d.getDay()

    d.setDate(
      d.getDate() +
        n +
        (day === 6 ? 2 : +!day) +
        Math.floor((n - 1 + (day % 6 || 1)) / 5) * 2
    )

    let doptions = { weekday: 'long', month: 'short', day: 'numeric' }

    if (lang === 'pt') {
      doptions = { weekday: 'short', month: 'short', day: 'numeric' }
    }

    if (d.getDate() - new Date().getDate() === 1) {
      return _this.lang.tomorrowLabel || 'Tomorrow'
    }

    d = d.toLocaleDateString(lang, doptions)

    return d
  }

  changeShippingTimeInfo() {
    const _this = this

    $('body').addClass('v-custom-changeShippingTimeInfo')
    const mainSTIelems = [
      '.shp-summary-package-time > span',
      'p.vtex-omnishipping-1-x-sla.sla',
      '.vtex-omnishipping-1-x-leanShippingTextLabelSingle > span',
      'span.shipping-date',
      '.shp-option-text-time',
      '.pkpmodal-pickup-point-sla',
      '.shp-option-text-package',
      '.srp-delivery-current-many__sla',
      '.shipping-estimate-date:eq(0)',
      '.srp-shipping-current-single__sla',
    ]

    try {
      $(`
        .vtex-omnishipping-1-x-summaryPackage.shp-summary-package:not(.v-changeShippingTimeInfo-active),
        .vtex-omnishipping-1-x-leanShippingOption,
        .vtex-omnishipping-1-x-packageItem:not(.v-changeShippingTimeInfo-active),
        .orderform-template .cart-template.mini-cart .item,
        .vtex-pickup-points-modal-3-x-pickupPointSlaAvailability,
        .srp-delivery-current-many,
        td.shipping-date,
        .srp-shipping-current-single
      `).each(function () {
        const [logisticsInfo] =
          window.vtexjs.checkout.orderForm.shippingData.logisticsInfo

        const availableSlas = logisticsInfo.slas

        const { selectedSla } = logisticsInfo

        const selectedSlaDays = availableSlas.find(e => e.name === selectedSla)
          ? availableSlas.find(e => e.name === selectedSla).shippingEstimate
          : false

        const txtselectin = $(this)
          .find(
            mainSTIelems
              .map(elem => `${elem}:not(.v-changeShippingTimeInfo-elem-active)`)
              .join(', ')
          )
          .text()

        let days

        if (!$(this).hasClass('srp-delivery-current-many')) {
          if (txtselectin !== '' && txtselectin.match(/(day)|(dia)|(día)/gm)) {
            days = parseInt(txtselectin.match(/\d+/), 10)
          }
        } else if (selectedSlaDays) {
          days = parseInt(selectedSlaDays.match(/\d+/), 10)
        }

        if (days) {
          let _delivtext = _this.lang.deliveryDateText

          if (
            $(this)
              .find(mainSTIelems.join(', '))
              .text()
              .toLowerCase()
              .match(/(ready in up)|(pronto)|(a partir de)|(hasta)/gm)
          ) {
            _delivtext = _this.lang.PickupDateText
          } // check if is pickup. OBS: none of others solutions worked, needs constantly update

          $(this)
            .find(mainSTIelems.join(', '))
            .html(
              `${_delivtext} <strong>${_this.addBusinessDays(days)}</strong>`
            )
            .addClass('v-changeShippingTimeInfo-elem-active')
        }

        $(this).addClass('v-changeShippingTimeInfo-active')
      })

      // temporaly
      const shippingPreviewPackges = $(
        '.srp-delivery-info .srp-packages:not(.v-changeShippingTimeInfo-elem-active)'
      )

      $('.js-shippingPreviewPackges').remove()
      if (shippingPreviewPackges.length) {
        const a = shippingPreviewPackges
          .text()
          .split(':')[1]
          .split(/,| and | e | y /)

        const deliveryDates = []

        $.each(a, function (i) {
          const txtselectin = a[i]

          if (txtselectin !== '' && txtselectin.match(/(day)|(dia)|(día)/gm)) {
            const days = parseInt(txtselectin.match(/\d+/), 10)

            if (days) {
              let _delivtext = _this.lang.deliveryDateText

              if (
                txtselectin
                  .toLowerCase()
                  .match(/(ready in up)|(pronto)|(A partir de)|(hasta)/gm)
              ) {
                _delivtext = _this.lang.PickupDateText
              } // check if is pickup. OBS: none of others solutions worked, needs constantly update

              deliveryDates.push(
                `${_delivtext} <strong>${_this.addBusinessDays(days)}</strong>`
              )
            }
          }
        })
        shippingPreviewPackges
          .hide()
          .after(
            `<p class="black-50 mt3 mb0 js-shippingPreviewPackges">${
              shippingPreviewPackges.text().split(':')[0]
            }: ${deliveryDates.join('; ')}</p>`
          )
          .addClass('v-changeShippingTimeInfo-active')
      }
    } catch (e) {
      console.error('changeShippingTimeInfo Error:', e)
    }
  }

  changeShippingTimeInfoInit() {
    const _this = this

    if (_this.lang && _this.deliveryDateFormat) {
      _this.changeShippingTimeInfo()
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
        const onTermValue = _trElem.find('.total-price:eq(0)').text()

        const free =
          orderForm.items[i].sellingPrice == 1 ||
          orderForm.items[i].sellingPrice == 0

        free ? _trElem.addClass('gratuito') : null

        _trElem.find('.new-product-price').text(onTermValue)

        if (onTermValue !== totalValue) {
          _trElem.find('.new-product-price').addClass('discount')
        }

        _trElem.find('td.product-price').find('.vqc-ldelem').remove()

        _trElem
          .find('td.product-price')
          .addClass('v-custom-quantity-price-active')
          .prepend(
            `
            <div class="v-custom-quantity-price vqc-ldelem">
              <p class="v-custom-quantity-price__best" style="font-size: 18px; color: #000; margin-bottom: 4px">${
                free ? 'Grátis' : totalValue
              }</p>
            </div>
            `
          )
      })
    } catch (e) {
      console.error('enchancementTotalPrice error:', e)
    }
  }

  enchancementProductCart(orderForm) {
    try {
      $.each(orderForm.items, function (i) {
        const _trElem = $(`.table.cart-items tbody tr.product-item:eq(${i})`)

        if (_trElem.find('td.product-name').find('.more-info').length === 1) {
          return
        }

        const refId = orderForm.items[i].refId || ''
        const { detailUrl } = orderForm.items[i]
        const isInstallService = detailUrl.includes('/install-service/p')
        const isSamsungCare = detailUrl.includes('/samsung-care-/p')

        const shippingText =
          isInstallService || isSamsungCare
            ? 'Após a entrega do produto'
            : '2-5 Dias úteis após a confirmação do pagamento'

        const moreInfoHtml = `
          <div class="more-info">
            <p class="ref-id" style="font-size: 12px" data-refid="${refId}">${refId}</p>
            <p class="estimate-shipping">${shippingText}</p>
          </div>
        `

        _trElem.find('td.product-name').append(moreInfoHtml)
      })
    } catch (e) {
      console.error('enchancementProductName error:', e)
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

        if (paymentAmountTotal) {
          const _component = `
          <div class="cart-total" style="margin-bottom: 20px; color: #000">
            <div class="best-price" style="font-size: 26px; display: flex; justify-content: space-between; font-weight: 700">
              <p class="ref-id">Total</p>
              <p class="estimate-shipping">${formatCurrencyBRL(
                paymentAmountTotal
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
            `${this.rootPath()}/api/checkout/pub/orderForm/${
              orderForm.orderFormId
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

        const percentDiscount = Math.floor(
          100 - (inCashPrice / _this.termPrice) * 100
        )

        const _component = `
              <div class="cart-total" style="margin-bottom: 20px; color: #000">
                <div class="best-price" style="font-size: 26px; display: flex; justify-content: space-between; font-weight: 700">
                  <p class="ref-id">Total</p>
                  <p class="estimate-shipping">${formatCurrencyBRL(
                    inCashPrice
                  )}</p>
                </div>
                ${
                  percentDiscount > 0
                    ? `<div class="discount-percent" style="font-size: 12px; display: flex; justify-content: flex-end;">
                        <p>(${percentDiscount}% de desconto)</p>
                      </div>`
                    : ''
                }

                <div class="discount-price" style="font-size: 14px; margin-top: 10px; display: flex; justify-content: space-between;">
                    <p class="gross-total">
                      Ou parcelado em até 12x
                    </p>
                    <p class="discount-total" style="font-weight: 700;">
                      ${formatCurrencyBRL(_this.termPrice)}
                    </p>
                </div>
              </div>
            `

        if (path !== '#/cart') {
          if (_trElem.find('.cart-total').length === 0) {
            _trElem.prepend(_component)
          }
        } else if (path === '#/cart') {
          if (_trElem.find('.cart-total').length === 0) {
            _trElem.prepend(_component)
          } else {
            _trElem.find('.cart-total').remove()
            _trElem.prepend(_component)
          }
        }
      }
    } catch (e) {
      console.error('enchancementSummaryCart error:', e)
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

  paymentDiscount() {
    const _this = this

    if (vtexjs.checkout.orderForm && vtexjs.checkout.orderForm.paymentData) {
      vtexjs.checkout.orderForm.paymentData.paymentSystems.forEach(function (
        e
      ) {
        fetch(
          `${_this.rootPath()}/api/checkout/pub/orderForm/${
            vtexjs.checkout.orderForm.orderFormId
          }/installments?paymentSystem=${e.id}`
        )
          .then(response => response.json())
          .then(data => {
            const { installments, paymentSystem } = data

            switch (paymentSystem) {
              case '125':
                $('.payment-group-list-btn a[data-name="Pix"] > span').append(
                  percentageDiscount(
                    installments[0].total,
                    vtexjs.checkout.orderForm.totalizers[0].value
                  )
                )
                break

              case '1':
                $(
                  '.payment-group-list-btn a[data-name="American Express"] > span'
                ).append(
                  percentageDiscount(
                    installments[0].total,
                    vtexjs.checkout.orderForm.totalizers[0].value
                  )
                )
                break

              case '501':
                $(
                  '.payment-group-list-btn a[data-name="Samsung Itaucard"] > span'
                ).append(
                  percentageDiscount(
                    installments[0].total,
                    vtexjs.checkout.orderForm.totalizers[0].value
                  )
                )
                break

              case '6':
                $(
                  '.payment-group-list-btn a[data-name="Boleto Bancário"] > span'
                ).append(
                  percentageDiscount(
                    installments[0].total,
                    vtexjs.checkout.orderForm.totalizers[0].value
                  )
                )
                break

              case '107':
                $(
                  '.payment-group-list-btn a[data-name="Samsung Pay"] > span'
                ).append(
                  percentageDiscount(
                    installments[0].total,
                    vtexjs.checkout.orderForm.totalizers[0].value
                  )
                )
                break

              case '72':
                $(
                  '.payment-group-list-btn a[data-name="PicPay"] > span'
                ).append(
                  percentageDiscount(
                    installments[0].total,
                    vtexjs.checkout.orderForm.totalizers[0].value
                  )
                )
                $('.payment-group').addClass('paymentDiscount')
                break

              default:
                break
            }
          })
          .catch(err => {
            console.error('Error: ', err)
          })
      })
    }
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

  showEmptyCart(orderForm) {
    if (orderForm.items.length === 0) {
      $('div.empty-cart-content').addClass('is-empty')
    } else {
      $('div.empty-cart-content').removeClass('is-empty')
    }
  }

  imgEmptyCart() {
    try {
      const _trElem = $(`.checkout-container`)

      if (
        _trElem.find('.empty-cart-content').find('.img-empty-cart').length > 0
      ) {
        return
      }

      _trElem
        .find('.empty-cart-content')
        .prepend(
          `<img class="img-empty-cart" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABHNCSVQICAgIfAhkiAAABiZJREFUeF7tnYuRIzUQhu8iACLARABEgC8CIAJMBBwR4IsAiABfBHdEgIkAiABfBEAE0J9rx6zX4+7Wex5SlWp3ayR16/+lVqulmX3+rKemCDxvKr0Lf9YJaDwIBgL+jdDjd6lDfiX5FFG/VxEEUgh4DODX8sehIxqOQC4CkPxC8jFchXXXyEkA4ENCTwEI5CQAsR/19SAA/YxrwCD1W/nlhzAV1l069wz4WeD8Yt2QhvU+NwF/i/gPwlRYd+nQjdj7AtdfBmSfynP2Bz05EAglgCYB92Ol7b4OOIAfisQQwCL7jSLjV3m2DdBh1UVjCADcXwzUYtpdJRGxQFmxo74rdg6nWAKO0v5niowf5dlLpw6rLhZLwF5Q+05BjoUab6inQrb6E2n3N6NtZklP1wic5M+r8H3sDKBZNl3vdYSjELiE71MIeCuiP48S3yuBwHnDmkIAi+z3HctoBF5LzV0KARtp4M9o8b3i2VFJIQAIWVQ+7FhGIXCOGKQScJBGvooS3yslmyAg3En+qWMZhcDZE0qdAZ7wNNHRtYWn2SdZDsr5+DaVAKjv4enbCWB5iO+kCk5MlptxVnh6jceU1h7pEivLMQM4A35jWMEccqIMbaNKnBpinu+lL+UBJGWZAbTTw9P/Q+2Jk3FuTignGwFHaUsLTxOA2jcajbXF0k8tUvyHPIekc8plGiyhawpPW4Px6qwkFwFbIdM6prxMu9pDsrK8IHOciwD6aIWnLwtPZUBqivMMxCvMcxLgdr1qIlJZluWS39wYyUmAtfk4CRjs/pacOCW8LLAjHb1xRnIS4HG/ztvvhTLgCcvc3BrMSQC4Aq4Wnr4cxS2QBGtD+o/0+WZzlpuAgwjRwtPnEOwCwadLlv0fDcnkJgBwtfD0ktcBTgc3yuAavTObmwAUsI4pl3h72tPv0fUvNwEMgDWGp62Zfwk/P50hJQiIsoUzXxei174SBFjeADvmpb1FY9n/u95fCQI8/vALIeE481E/qJ+0/ylBAIoB7lrC01YE4Cr8XGMNQMZeshYTv4mJzHg2JMXASs2ArQC6lvC0+/hxbJCVIgBZVlx8CeFpj/1Xz0FKEpA0NWdikixTq9p/+liSAGtxWsIxZbKzUZIAz/Sce3jaMrOmu12SAGaYdUw55/C0teF0WZjSBERv0WewBlghF5erXZqAnQC51PC0dfzo+mRDaQI2QoAVnsaTmGOy9HaF3UsTALAnyWt7i2b0+LH2RmyQZ9nKOY5+S2f3jfAaM8DjLVgdmttzl/13uUkZeu4JT2cQM6km3PubGjMAZCx3dFLoJSrjNj+1ZgBymAVHydqXthL7PYnqLL4byWxAXanWDBhIYEFe6mutbLx2kk8u5B8K1SRg0IsRQpxIu0MZ0ofWZQGc2R0E/KB0CwJaAzYp+Z2AxnR0AjoBjRFoLH5qM4CFma9w8RNXjoWNYz23W5cRzyq6TIEA9gh8CHYnGQ9pLHF8iQv7OiPAY01V16U1AYDORy3ouCdBBKdo/MydQnVhdnKzI0mXlgRwUEOnQxPmiGDXIbSiUr6ZLq0IyBGidh14OEhqqksLAnKFp5kJRB1TFujmurQgwLrK7Ri0lyKv5Ld9SIUnZXPqcvUJAq9OtQnA5lufOMPtZGFjYcYVtI4zYz+BMAldahPwVgDVPvb69CQJEqwIauzdoknoUpsA7SaxZk6YEffOEtgbxHhTJXQJOozBTNUmQLvKp5kSzVwQh996be6jcpPQpSYBG+n8vTtCeDLae2MAfO99gxgCJqNLTQIYfNqo03TR3MUYAiajy5QI0K5yMPrvmZlgu/tghrTBUE2X2gRongdmCI+GMo8TsaKXio0v4QVV06U2AdpiOmB8lF/IuKCYHuy1ltgNn4wyY48noUttAgAVl9LaXHnxjHVBaX8SutQmgI57Rp6HAO7gsFOOGf1D+811aUEAnT9ITr0flOsty6a6tCIAEqxQgDYLYhfee20206UlAYCxl6y9Uf8UMMwOC/PRY6MCyzTRpTUBYLR5IAJg7/1brHcPZovAXEr83+Kkui5TIOAxKFv5gzwkwGa04znVTlV0mRoBtUFuLq8T0JiCTkAnoDECjcX/B2pcUnADlE3CAAAAAElFTkSuQmCC"/>`
        )
    } catch (e) {
      console.error('imgEmptyCart error:', e)
    }
  }

  WrapSummary() {
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
          <h6>Resumo do pedido (${itemsQuantity} ${
        quantitySelectedItems.length <= 1 ? 'item' : 'itens'
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

  displayHideSuperChat(page) {
    try {
      const _elem = $('#spr-live-chat-app')

      if (page === '#/cart') {
        _elem.show()
      } else {
        _elem.hide()
      }
    } catch (e) {
      console.error('displayHideSuperChat error:', e)
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
             `<p class="vcustom-customTax-resume__i"><span class="n">${
               i.name
             }</span><span class="v">${
               orderForm.storePreferencesData.currencySymbol
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

  update(orderForm) {
    const _this = this

    this.ApplyCoupon(orderForm)
    this.checkEmpty(orderForm.items)
    this.addAssemblies(orderForm)
    this.enchancementTotalPrice(orderForm)
    this.enchancementProductCart(orderForm)
    if (!$('body').hasClass('modalActive')) {
      this.enchancementSummaryCart(orderForm, window.location.hash)
    }

    this.enchancementUnavailableProduct()
    this.createChoiceNewProducts()
    this.couponInfo(orderForm)
    this.imgEmptyCart()
    this.WrapSummary()
    this.bundleItems(orderForm)
    this.condensedTaxes(orderForm)
    this.setParentIndex(orderForm)
    this.indexedInItems(orderForm)
    this.showCustomMsgInstallation(orderForm)
    this.showCustomDiscounts()
    this.summaryCustom()
    new CustomHeader().init()
    this.samsungCarePlus.init()
    new BespokeRefrigerator().init()
    this.installationService.init()
    this.TradeIn.init(orderForm)
    this.Rewards.showObsRewards()

    // debounce to prevent append from default script
    const updateDebounce = debounce(function () {
      if (orderForm.marketingData) {
        _this.showCustomMsgCoupon(orderForm)
      }
    }, 250)

    updateDebounce()
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

  updateLang(orderForm) {
    const clientLocale = orderForm.clientPreferencesData.locale

    this.lang = Object.values(_locale).find(
      country => country.locale === clientLocale
    )
      ? Object.values(_locale).find(country => country.locale === clientLocale)
      : _locale[orderForm.storePreferencesData.countryCode]

    if (!this.lang) return false
    const _lang = this.lang

    if (_lang.editLabel) $('.link-box-edit').attr('title', _lang.editLabel)
    if (_lang.cartSubmitButton) {
      $('#cart-to-orderform').text(_lang.cartSubmitButton)
    }

    if (_lang.cartLabelShipping) {
      $('.srp-main-title').text(_lang.cartLabelShipping)
    }

    if (_lang.cartNoteLabel) $('p.note-label label').text(_lang.cartNoteLabel)

    if (_lang.identifiedUserMessage) {
      $('.identified-user-modal-body p.identified-user-message').html(
        _lang.identifiedUserMessage
      )
    }

    // paypal
    if (_lang.paypalPhone) {
      $('.payment-paypal-help-number').text(_lang.paypalPhone)
    }

    if (_lang.paypalImg) {
      $('.payment-paypal-title-short-logo').css(
        'background-image',
        `url(${_lang.paypalImg})`
      )
    } else if (_lang.paypalImg === '') {
      $('.payment-paypal-title-short-logo').hide()
    }

    // shipping

    if (_lang.googleAddressLabel) {
      const geoElem = $('.vtex-omnishipping-1-x-geolocation')

      if (geoElem.length) {
        geoElem
          .find('.ship-addressQuery > label')
          .text(_lang.googleAddressLabel)
      }
    }

    // placeholders

    if (_lang.address1Placeholder) {
      $('.vtex-omnishipping-1-x-address input#ship-street').attr(
        'placeholder',
        _lang.address1Placeholder
      )
    }

    if (_lang.address2Placeholder) {
      $('.vtex-omnishipping-1-x-address input#ship-complement').attr(
        'placeholder',
        _lang.address2Placeholder
      )
    }

    if (_lang.numberPlaceholder) {
      $('.vtex-omnishipping-1-x-address input#ship-number').attr(
        'placeholder',
        _lang.numberPlaceholder
      )
    }
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
        `<div class='v-custom-payment-item-wrap ${
          $(this).hasClass('active') ? 'active' : ''
        }'></div>`
      )
    })

    $('.payment-group-item').each(function () {
      $(`#payment-data .steps-view > div:eq(${0})`).appendTo(
        $(this).closest('.v-custom-payment-item-wrap')
      )
    })
  }

  customAddressFormLoader() {
    const _this = this

    if (!window.vtex.googleMapsApiKey) {
      console.error(
        'You might need to add your Google Maps API Key in your admin'
      )
      _this.customAddressForm = false

      return false
    }

    if (_this.customAddressForm) {
      _this.customAddressForm = new FnsCustomAddressForm({})
    }
  }

  goToShippingStep() {
    window.location.hash = '#/shipping'
  }

  activateCustomForm() {
    const _this = this

    if (_this.customAddressForm) {
      $('body').addClass('v-custom-addressForm-on')
      _this.customAddressForm.validateAllFields()
    }
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

  // Remove sku de serviços quando o produto atrelado for excluido
  removeInstallationProduct() {
    const _this = this

    $('body').on('click', '.item-link-remove', async function () {
      const dataSku = $(this).closest('tr').attr('data-sku')

      await fetch(
        `${_this.rootPath()}/api/catalog_system/pub/products/search?fq=skuId:${dataSku}`
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
                    .then(() => {})
                }
              }, 2000)
            }
          }
        })
    })
  }
  verifyCSP(orderForm) {
    // Workaround para caso a vtex mude a posição do selectedAddresses
    const filterSlas = orderForm.shippingData.logisticsInfo[0].slas.filter(objeto => objeto.name === orderForm.shippingData.logisticsInfo[0].selectedSla);
    let statePickUp = filterSlas[0].pickupStoreInfo.address.state
    // Validar se o selectedDeliveryChannel do orderForm é do tipo "pick-up-point";
    if(orderForm.shippingData.logisticsInfo[0].selectedDeliveryChannel === 'pickup-in-point'){
      // Se positivo, verificar se campo UF do endereço do pick-up-point é igual ao UF do nó InvoiceData;
      if(statePickUp !== orderForm.invoiceData.address.state) {
        alert('O estado da NF é diferente do estado do endereço de retirada')
        window.location.hash = '#/shipping'
      }
    }
  }
  // Adiciona um botão fake e de remover produto para ssc proteção completa e abre um popup ao clicar
  popupSSC() {
    if ($('.fakeRemove').length === 0) {
      $('.product-item').each(function() {
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

          $(document).on('click', '.fakeRemove', function() {
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

      $(document).on('click', '.modalssc div a', function() {
        $('.layerpopup, .modalssc').fadeOut('fast', function() {
          $(this).remove()
        })
      })
      $(document).on('click', '.modalssc div a + a', function() {
        const productId = $(this).attr('data-id')

        const interval = 4000

        window.vtexjs.checkout.orderForm.items.forEach((el, i) => {
          setTimeout(function() {
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
                  .then(() => {})
              }
            }
          }, i * interval)
        })
      })
    }
  }

  clickModal() {
    $(document).on('click', '.modalssc div a + a', function () {
      $('body').addClass('modalClick')
      const productId = $(this).attr('data-id')
      const productIdSC = $(this).attr('data-id-sc')

      window.vtexjs.checkout.orderForm.items.forEach(el => {
        setTimeout(function () {
          if (el.id === productId) {
            if ($('body').hasClass('modalClick')) {
              $(
                `.table.cart-items tr[data-sku=${productId}]:eq(0) td.item-remove a`
              ).click()
            }

            $('body').removeClass('modalClick')
          }
        }, 4000)

        setTimeout(function () {
          $(
            `.table.cart-items tr[data-sku=${productIdSC}] td.item-remove a`
          ).click()
          $('body').removeClass('modalActive')
        }, 6000)
      })
    })
  }

  // CUSTOMIZAÇÃO PARA TRATAR ERRO NO LOGOUT POR CONTA DO AKAMAI (/BR)
  customizeLogOut() {
    const accountbr = window.__RUNTIME__.account == 'samsungbr'
    const accountbrshop = window.__RUNTIME__.account == 'samsungbrshop'
    const notMyvtex = window.location.href.indexOf('myvtex') == -1

    if (
      ($('.link-logout-container').is(':visible') && accountbr && notMyvtex) ||
      (accountbrshop && notMyvtex)
    ) {
      $('#is-not-me').removeAttr('href')
      $('body').on('click', '#is-not-me', function () {
        const returnUrl = `https://shop.samsung.com/br/checkout/changeToAnonymousUser/${window.vtexjs.checkout.orderForm.orderFormId}`

        window.location.assign(
          `https://shop.samsung.com/br/api/vtexid/pub/logout?scope=samsungbrshop&returnUrl=${returnUrl}`
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
          _this.updateLang(_this.orderForm)
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
    const _this = this

    if (window.vtex) {
      window.vtex.showInstallmentsPreviewValue = true
    }

    _this.orderForm = window.vtexjs.checkout.orderForm
      ? window.vtexjs.checkout.orderForm
      : false
    _this.general()
    _this.updateStep()
    _this.builder()
    _this.changeShippingTimeInfoInit()
    if (_this.orderForm) {
      _this.updateLang(_this.orderForm)
      _this.update(_this.orderForm)
      _this.addStepsHeader()
      _this.paymentBuilder(_this.orderForm)
    }

    _this.fixLabels()
    _this.clickModal()
  }

  start() {
    const _this = this

    try {
      $(function () {
        _this.bind()
        _this.customAddressFormLoader()
        _this.rtlUI()
        // #pre-email
        _this.preEmail.bindEvents()
        _this.preEmail.createElementSamsungAccountLogin()

        // #profile
        _this.profile.bindEvents()

        // #shipping
        _this.shipping.bindEvents()
        _this.shipping.limitFieldsCharacters()

        $(window).on('checkoutRequestBegin.vtex', function (event, request) {
          _this.samsungCarePlus.interceptSamsungCarePlusRequest(event, request)
        })
      })

      $(document).ajaxComplete(function (event, xhr, settings) {
        _this.init()
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

        const acessKeyURL = settings.url.includes('/api/checkout/pub/profiles/')
        const ssgAccountURL = settings.url.includes('/api/sessions')

        if (acessKeyURL || ssgAccountURL) {
          const loginSucess = xhr.statusText === 'success'

          if (loginSucess) {
            trackLogin(ssgAccountURL, acessKeyURL)
            window.digitalData.user.loginStatus = true
            fetch(
              `${_this.rootPath()}/api/vtexid/pub/authenticated/user?fields=email,userProfileId`,
              {
                credentials: 'include',
              }
            )
              .then(resp => resp.json())
              .then(data => {
                const email = data.user
                const userProfileId = data.userId

                return fetch(
                  `${_this.rootPath()}/_v/post/updateClientAcessOrigin`,
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
          } else {
            window.digitalData.user.loginStatus = false
            window._satellite.track('shop_guest_login')
          }
        }
      })

      function trackLogin(ssgAccountURL, accessKeyURL) {
        if (ssgAccountURL) {
          window.digitalData.user.loginStatus = true
          window._satellite.track('samsung_account_login')
        } else if (accessKeyURL) {
          window.digitalData.user.loginStatus = true
          window._satellite.track('vtex_account_login')
        }
      }

      $(window).on('hashchange', function () {
        const cartItems = document.querySelector('.cart-items')

        if (
          window.location.hash === '#/payment' ||
          window.location.hash === '#/cart'
        ) {
          _this.TradeIn.validateTradeinCustomData()
          _this.SendAttachment.sendOpenTextField()
          _this.displayHideSuperChat(window.location.hash)
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
          _this.updateLang(_this.orderForm)
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

      $(window).on('orderFormUpdated.vtex', function (evt, orderForm) {
        _this.update(orderForm)
        _this.customAddressFormInit(orderForm)
        _this.URLHasIncludePayment()
        _this.customizeLogOut()
        _this.showEmptyCart(orderForm)
        if (!window.vtexjs.checkout.orderForm.loggedIn) {
          _this.preEmail.createElementSamsungAccountLogin()
        }

        if (window.location.hash === '#/cart') {
          _this.Rewards.cancelRewardsDiscount()
        }

        if (window.location.hash === '#/payment') {
          _this.profile.addFieldsProfileToSummary(orderForm)
          _this.Rewards.cancelRewardsDiscount(true)
          _this.Rewards.showPointsSimulation()
          _this.verifyCSP(orderForm)
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
        _this.CheckoutLimit.init(orderForm)
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
      $(window).load(function () {
        _this.setPixAsDefaultPaymentMethod()
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
          _this.displayHideSuperChat(window.location.hash)
        }

        $(window).one('componentValidated.vtex', () => _this.builder())
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

        // Adobe Launch Pixel
        _this.adobeLaunchPixel.init()

        if (_this.customAddressForm && typeof store !== 'undefined') {
          window.store.dispatch({
            type: 'DISABLE_CALCULATE_BUTTON',
            isCalculateBttnEnabled: false,
          })
        }
      })

      // eslint-disable-next-line no-console
      console.log(`🎉 Yay! You are using the vtex.checkout.ui customization !!`)
    } catch (e) {
      _this.general()
    }
  }
}

module.exports = checkoutCustom
