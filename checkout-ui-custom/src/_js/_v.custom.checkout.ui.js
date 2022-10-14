/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */
const { _locale } = require('./_locale-infos.js')
const { debounce, formatCurrency, formatCurrencyBRL } = require('./_utils.js')
const FnsCustomAddressForm = require('./_customAddressForm.js')
const { default: CustomHeader } = require('./_header.js')

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

  buildHorizontal() {}

  showDeliveryOptions() {
    $(
      '.cart-template .cart-more-options:eq(0), .cart-template .extensions-checkout-buttons-container'
    ).appendTo('.cart-template-holder')
  }

  builder() {
    const _this = this

    if (_this.type === 'vertical') {
      _this.buildVertical()
    } else if (_this.type === 'horizontal') {
      _this.buildHorizontal()
    } else {
      console.error('No `type` identified, check your code')
    }

    if (_this.showNoteField) {
      $('body').addClass('js-vcustom-showNoteField')
    }

    if (_this.hideEmailStep) {
      $('body').addClass('js-vcustom-hideEmailStep')
    }

    _this.showDeliveryOptions()
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
              <span class="checkout-steps_item checkout-steps_item_identification js-checkout-steps-item v-custom-step-profile" data-url="/checkout/#/profile">
                <span class="text" data-before="1">${
                  this.lang
                    ? this.lang.checkoutStepsLabelIdentification
                    : 'Identification'
                }</span>
              </span>
              <span class="checkout-steps_item checkout-steps_item_shipping js-checkout-steps-item v-custom-step-shipping" data-url="/checkout/#/shipping">
                <span class="text" data-before="2">${
                  this.lang ? this.lang.checkoutStepsLabelShipping : 'Shipping'
                }</span>
              </span>
              <span class="checkout-steps_item checkout-steps_item_payment js-checkout-steps-item v-custom-step-payment" data-url="/checkout/#/payment">
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
            <td>Cupom</td>
            <td>
              <p class="using-coupon-text" style="font-weight: 700">
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
              <span style="color: #D62E2E; font-size: 12px;">${_message}</span>
            </td>
        </tr>`
      )
    }
  }

  addLabels(orderForm) {
    const _coupon =
      orderForm.marketingData === null
        ? false
        : orderForm.marketingData.coupon
        ? orderForm.marketingData.coupon
        : false

    const _couponItems = []

    if (!_coupon) return false

    try {
      $(
        `.table.cart-items tbody tr.product-item, .mini-cart .cart-items li`
      ).removeClass('v-custom-addLabels-active js-vcustom-addLabels')
      $(`.v-custom-addLabels-active-flag`).remove()
      $.each(orderForm.items, function (i) {
        if (this.priceTags.length > 0) {
          if (
            this.priceTags.filter(_pricetag => {
              return _pricetag.ratesAndBenefitsIdentifier
                ? _pricetag.ratesAndBenefitsIdentifier.matchedParameters[
                    'couponCode@Marketing'
                  ] === _coupon
                : false
            }).length > 0
          ) {
            _couponItems.push(this)
            $(`.table.cart-items tbody tr.product-item:eq(${i})`)
              .addClass('v-custom-addLabels-active js-vcustom-addLabels')
              .find('.product-name')
              .append(
                `<span class="v-custom-addLabels-active-flag">${_coupon}</span>`
              )
          }
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  buildMiniCart(orderForm) {
    /* overide refresh from vtex */
    if (
      orderForm.items.filter(item => {
        return item.parentItemIndex !== null
      }).length === 0
    ) {
      return false
    }

    if ($(`.mini-cart .cart-items`).text().trim() !== '') {
      $(`.mini-cart .cart-items`).html(`${$(`.mini-cart .cart-items`).html()}`)
      $.each(orderForm.items, function (i) {
        if (this.availability === 'available') {
          $(`.mini-cart .cart-items li:eq(${i})`)
            .find('.item-unavailable')
            .remove()
        }
      })
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

          $(`.mini-cart .cart-items > li:eq(${key})`)
            .find(`.v-custom-bundles`)
            .remove()
          $(`.mini-cart .cart-items > li:eq(${key})`)
            .append(`<div class="v-custom-bundles"></div>`)
            .addClass('v-custom-indexedItems-in')
          if (
            $(`.mini-cart .cart-items > li:eq(${key})`)
              .find(' > .v-custom-bundles')
              .html() === ''
          ) {
            for (const prop in obj) {
              if (!obj.hasOwnProperty(prop)) continue
              const iiItem = obj[prop]

              $(`.mini-cart .cart-items > li:eq(${key}) > .v-custom-bundles`)
                .append(`
                <div class="hproduct item v-custom-indexed-item" data-sku="${
                  iiItem.id
                }">
                  <a href="${iiItem.detailUrl}" class="url">
                    <img height="45" width="45" class="photo" src="${
                      iiItem.imageUrl
                    }" alt="${iiItem.name}">
                  </a>
                  <span class="fn product-name" title="${iiItem.name}" href="${
                iiItem.detailUrl
              }">${iiItem.name}</span>
                  <span class="quantity badge">${iiItem.quantity}</span>
                  <div class="description">
                    <strong class="price pull-right" data-bind="text: sellingPriceLabel">${
                      orderForm.storePreferencesData.currencySymbol
                    } ${formatCurrency(
                orderForm.clientPreferencesData.locale,
                orderForm.storePreferencesData.currencyCode,
                iiItem.sellingPrice
              ).toFixed(2)}</strong>
                  </div>
                </div>
              `)
              $(
                `.mini-cart .cart-items > li[data-sku='${iiItem.id}']`
              ).addClass('v-custom-indexed-item')
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
        const _item = this
        const _trElem = $(`.table.cart-items tbody tr.product-item:eq(${i})`)

        if (_trElem.find('td.product-price').find('.best-price').length === 0) {
          return
        }

        const totalValue = _trElem.find('.total-selling-price:eq(0)').text()
        const _eachprice =
          _item.listPrice > _item.price &&
          `
          <div class="v-custom-quantity-price vqc-ldelem">
            <span class="v-custom-quantity-price__list">
              ${
                _item.listPrice > _item.sellingPrice
                  ? `<span class="v-custom-quantity-price__list--list">
                    ${formatCurrencyBRL(
                      _item.listPrice * _item.quantity
                    )}</span>`
                  : ''
              }
            </span>
          </div>
        `

        _trElem.find('td.product-price').find('.vqc-ldelem').remove()

        _trElem
          .find('td.product-price')
          .addClass('v-custom-quantity-price-active')
          .prepend(
            `<div class="v-custom-quantity-price vqc-ldelem"><p class="v-custom-quantity-price__best" style="font-size: 18px; color: #000; margin-bottom: 4px">${totalValue}</p></div>`
          )
          .append(_eachprice)
        _trElem
          .find('td.product-price')
          .find('> .best-price')
          .wrap(
            `<div class="v-custom-quantity-price__list--selling" style="display: none"></div>`
          )
        _trElem
          .find('td.product-price')
          .find('.v-custom-quantity-price__list--selling')
          .append(`<span class="vqc-ldelem">cada</span>`)
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

        _trElem.find('td.product-name').append(
          `<div class="more-info">
            <p class="ref-id" style="font-size: 12px">${refId}</p>
            <p class="estimate-shipping">2-5 Dias úteis após a confirmação do pagamento</p>
          </div>`
        )
      })
    } catch (e) {
      console.error('enchancementProductName error:', e)
    }
  }

  enchancementSummaryCart(orderForm) {
    try {
      const _trElem = $(`.summary-template-holder`)

      const totalItems =
        orderForm.totalizers.filter(item => item.id === 'Items').value || 0

      const totalDiscount =
        orderForm.totalizers.filter(item => item.id === 'Discounts').value || 0

      const totalShipping =
        orderForm.totalizers.filter(item => item.id === 'Shipping').value || 0

      const totalGross = totalItems + totalShipping

      const _component = `
        <div class="cart-total" style="margin-bottom: 35px; color: #000">
          <div class="best-price" style="font-size: 28px; display: flex; justify-content: space-between; font-weight: 700">
            <p class="ref-id">Total</p>
            <p class="estimate-shipping">${(
              orderForm.value / 100
            ).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}</p>
          </div>
          ${
            totalDiscount
              ? `
                <div class="discount-price" style="font-size: 12px; display: flex; justify-content: flex-end;">
                  <p class="gross-total" style="margin-right: 8px; text-decoration: line-through;">
                    ${formatCurrencyBRL(totalGross)}
                  </p>
                  <p class="discount-total" style="color: #2189FF; font-weight: 700;">
                    ${`economize ${formatCurrencyBRL(-totalDiscount)}`}
                  </p>
                </div>
              `
              : ''
          }
        </div>
      `

      if (_trElem.find('.cart-total').length === 0) {
        _trElem.prepend(_component)
      } else {
        _trElem.find('.cart-total').remove()
        _trElem.prepend(_component)
      }
    } catch (e) {
      console.error('enchancementSummaryCart error:', e)
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
          `<div class="div-coupon-info" style="margin-bottom: 25px; text-align: left">
            <p style="font-size: 12px; padding-top: 5px; color: #555555;">
              Digite o cupom de desconto
            </p>
          </div>`
        )
      }
    } catch (e) {
      console.error('couponInfo error:', e)
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
          `<img class="img-empty-cart" src="data:image/png;base64,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"/>`
        )
    } catch (e) {
      console.error('imgEmptyCart error:', e)
    }
  }

  summaryCustom() {
    try {
      const { items } = window.vtexjs.checkout.orderForm
      const itemsQuantity = items.length
      const { paymentSystem } =
        window.vtexjs.checkout.orderForm.paymentData.payments[0]

      const totalOnTerm =
        window.vtexjs.checkout.orderForm.paymentData.installmentOptions.find(
          installment => installment.paymentSystem === paymentSystem
        ).value

      const _accordionElem = $($('.summary-totalizers .accordion-inner')[1])

      if (!$('.on-term-price').length) {
        const _onTermHTML = `
          <div class="on-term-price">
            <span class="text-description">Total a prazo</span>
            <span class="text-bold-price">${formatCurrencyBRL(
              totalOnTerm
            )}</span>
          </div>
        `

        let listItems = ''

        items.forEach(item => {
          listItems += `
              <li>${item.name || item.skuName}</li>
            `
        })

        const _summaryOrder = `
          <div class="summaryOrder">
            <h6>Resumo do pedido (${itemsQuantity} ${
          itemsQuantity.length > 1 ? 'itens' : 'item'
        })</h6>
            <ul>
              ${listItems}
            </ul>
          </div>
        `

        _accordionElem.append(_onTermHTML)
        _accordionElem.append(_summaryOrder)
      }
    } catch (e) {
      console.error('summaryCustom error:', e)
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
    this.enchancementSummaryCart(orderForm)
    this.enchancementUnavailableProduct()
    this.createChoiceNewProducts()
    this.couponInfo(orderForm)
    this.imgEmptyCart()
    this.bundleItems(orderForm)
    this.buildMiniCart(orderForm)
    this.condensedTaxes(orderForm)
    this.setParentIndex(orderForm)
    this.indexedInItems(orderForm)
    new CustomHeader().init()
    this.summaryCustom()

    // debounce to prevent append from default script
    const updateDebounce = debounce(function () {
      if (orderForm.marketingData) {
        _this.addLabels(orderForm)
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

  bind() {
    const _this = this

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
  }

  init() {
    const _this = this

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

    _this.addEditButtoninLogin()
    _this.fixLabels()
  }

  start() {
    const _this = this

    try {
      $(function () {
        _this.bind()
        _this.customAddressFormLoader()
        _this.rtlUI()
      })

      $(document).ajaxComplete(function () {
        _this.init()
      })

      $(window).on('hashchange', function () {
        const cartItems = document.querySelector('.cart-items')

        _this.updateStep()
        _this.changeShippingTimeInfoInit()
        _this.checkProfileFocus()
        _this.fixLabels()

        if (_this.orderForm) {
          _this.buildMiniCart(_this.orderForm)
          _this.indexedInItems(_this.orderForm)
          _this.updateLang(_this.orderForm)
          _this.paymentBuilder(_this.orderForm)
          _this.customAddressFormInit(_this.orderForm)
          _this.removeCILoader()

          _this.onDomMutation({
            targetNode: cartItems,
            callback: () => _this.removeCILoader(),
          })
        }
      })

      $(window).on('orderFormUpdated.vtex', function (evt, orderForm) {
        _this.update(orderForm)
        _this.customAddressFormInit(orderForm)
        _this.URLHasIncludePayment()
        if (!window.google && _this.customAddressForm) {
          _this.customAddressForm.loadScript()
        }
      })

      $(window).load(function () {
        $(window).one('componentValidated.vtex', () => _this.builder())
        _this.checkProfileFocus()
        _this.changeShippingTimeInfoInit()
        _this.indexedInItems(window.vtexjs.checkout.orderForm)

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
