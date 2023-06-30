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
import { rootPath } from '../components/utils/_rootPath'
import {
  formatNegativeValue,
  debounce,
  formatCurrencyBRL,
} from '../components/_utils'

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
    this.Rewards = null

    this.preEmail = new CustomPreEmail()
    this.profile = new CustomProfileData()
    this.shipping = new CustomShippingData()
    this.installationService = new InstallationService()
    this.TradeIn = new TradeIn()
    this.SendAttachment = new SendAttachment()
    this.hasSelectedDefaultPaymentMethod = false
    this.CheckoutLimit = new CheckoutLimit()
    this.samsungCarePlus = new SamsungCarePlus()
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

        const refId = orderForm.items[i].refId || ''
        const { detailUrl } = orderForm.items[i]
        const isInstallService = detailUrl.includes('/install-service/p')
        const isSamsungCare = detailUrl.includes('/samsung-care-/p')

        const shippingText =
          isInstallService || isSamsungCare
            ? 'Após a entrega do produto'
            : ''

        const moreInfoHtml = `
            <div class="more-info">
              <p class="ref-id" style="font-size: 12px" data-refid="${refId}">${refId}</p>
              <p class="estimate-shipping">${shippingText}</p>
              <p class="instantvoucher">
                <a class="selecaovoucher" href='${
                  detailUrl.split('/p')[0] +
                  '/instant-voucher?skuId=' +
                  orderForm.items[i].id
                }'>Voltar à seleção de cupom instantâneo</a>
              </p>
            </div>
          `

        _trElem.find('td.product-name').append(moreInfoHtml)
      })
    } catch (e) {
      console.error('enchancementProductName error:', e)
    }
  }

  async imgEmptyCart() {
    const carEmpty = await import('../components/emptyCart')
    carEmpty.createLayoutEmptyCart()
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
        const customAddressFormBoot = await import(
          '../components/_customAddressForm'
        )

        _this.customAddressForm =
          customAddressFormBoot.bootstrapFnsCustomAddressForm()
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
          : discount.name
          ? discount.name
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
        // console.log('discount.name', discount.name)
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
        if (discount.name.toLowerCase().includes('discount@manualprice') && window.vtexjs.checkout.orderForm.customData.customApps.some(app => app.id == 'eco_troca')) {
          return `
              <tr class="discount eco_troca" style="height: 23px;">
                <td style="margin-left: 10px;">Desc. Eco Troca</td>
                <td>
                  <span style="font-weight: 700" >${formatNegativeValue(
                    formatCurrencyBRL(discount.value)
                  )}</span>
                </td>
              </tr>`
        }
        if (discount.name.toLowerCase().includes('garanteed')) {
          return `
            <tr class="discount garanteed-tradein" style="height: 23px;">
              <td style="margin-left: 10px;">Vale Mais - Troca Smart</td>
              <td>
                <span style="font-weight: 700" >${formatNegativeValue(
                  formatCurrencyBRL(discount.value)
                )}</span>
              </td>
            </tr>`
        }

        if (discount.name.toLowerCase().includes('garanteed')) {
          return `
            <tr class="discount garanteed-tradein" style="height: 23px;">
              <td style="margin-left: 10px;">Vale Mais - Troca Smart</td>
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

  checkInstantVoucherService(orderForm) {
    const cupomInstantVoucher = JSON.parse(
      sessionStorage.getItem('instant-voucher')
    )
    const instantVoucherIdSku = Object.keys(cupomInstantVoucher)

    try {
      $.each(orderForm.items, function (i) {
        const _trElem = $(`.table.cart-items tbody tr.product-item:eq(${i})`)
        $.each(instantVoucherIdSku, function (j) {
          if (
            cupomInstantVoucher[`${instantVoucherIdSku[j]}`].length > 0 &&
            orderForm.items[i].productId === instantVoucherIdSku[j]
          ) {
            _trElem.addClass('coupom-instantvoucher')
          }
        })
      })
    } catch (e) {
      console.error('checkInstantVoucherService error:', e)
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

        _trElem.attr('data-id-product', orderForm.items[i].productId)

        _trElem.find('.new-product-price').text(onTermValue)

        _trElem.find('td.product-price').find('.vqc-ldelem').remove()

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
            `${rootPath()}/api/checkout/pub/orderForm/${
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

  checkEmpty(items) {
    if (items.length === 0) {
      $('body').addClass('v-custom-cart-empty')
    } else {
      $('body').removeClass('v-custom-cart-empty')
    }
  }
  async update(orderForm) {
    this.ApplyCoupon(orderForm)
    this.checkEmpty(orderForm.items)
    this.addAssemblies(orderForm)
    this.enchancementTotalPrice(orderForm)
    if ('instant-voucher' in sessionStorage) {
      this.checkInstantVoucherService(orderForm)
    }
    this.enchancementProductCart(orderForm)
    addEventListener('hashchange', async event => {
      const showHeader = ['#/payment', '#/shipping', '#/profile']
      const { hash } = event.target.location

      if (showHeader.includes(hash)) {
        const header = await import('../components/headerCustom/header')
        header.customHeader(hash)
      }
    })

    if (!$('body').hasClass('modalActive')) {
      this.enchancementSummaryCart(orderForm, window.location.hash)
    }

    this.condensedTaxes(orderForm)
    this.setParentIndex(orderForm)
    this.indexedInItems(orderForm)
    this.showCustomMsgInstallation(orderForm)
    this.showCustomDiscounts()
    this.summaryCustom()
    this.createChoiceNewProducts()
    this.bundleItems(orderForm)
    this.wrapSummary()
    this.couponInfo(orderForm)
    this.CheckoutLimit.lockIncrementButtons(orderForm)
    this.samsungCarePlus.samsungCareModalTrigger()
    this.samsungCarePlus.hideQuantityButtons(orderForm)
    this.installationService.init()
    new BespokeRefrigerator().init()

    this.TradeIn.init(orderForm)
    await this.imgEmptyCart()

    const updateDebounce = debounce(function () {
      if (orderForm.marketingData) {
        this.showCustomMsgCoupon(orderForm)
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
                    .then(() => {})
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
                  .then(() => {})
              }
            }
          }, i * interval)
        })
      })
    }
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
          // _this.updateLang(_this.orderForm)
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
    if (window.vtex) {
      window.vtex.showInstallmentsPreviewValue = true
    }

    this.orderForm = window.vtexjs ? window.vtexjs.checkout.orderForm : false

    general()

    this.updateStep()
    this.builder()
    this.changeShippingTimeInfoInit()

    if (this.orderForm) {
      this.update(this.orderForm)
      // _this.updateLang(_this.orderForm) // validar
      this.paymentBuilder(this.orderForm)
    }

    this.fixLabels()
    this.CheckoutLimit.init()
  }

  start() {
    const _this = this
    try {
      console.log('Checkout is already started')

      $(async function () {
        _this.bind()
        _this.customAddressFormLoader()
        _this.rtlUI()
        // await this.customAddressFormLoader()
        // #pre-email
        _this.preEmail.bindEvents()
        _this.preEmail.createElementSamsungAccountLogin()

        // #shipping
        _this.shipping.bindEvents()
        _this.shipping.limitFieldsCharacters()

        // #profile
        _this.profile.bindEvents()
        
        $(window).on('checkoutRequestBegin.vtex', function(event, request) {
          _this.CheckoutLimit.limitQuantity(event, request)
          _this.samsungCarePlus.sendSameQuantityAsAttachedItem(event, request)
        })
        $(window).on('checkoutRequestEnd.vtex', function(event, orderForm) {
          _this.samsungCarePlus.sync(orderForm)
          _this.CheckoutLimit.sync(orderForm)
        })
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

        const acessKeyURL = settings.url.includes('/api/checkout/pub/profiles/')
        const ssgAccountURL = settings.url.includes('/api/sessions')

        if (acessKeyURL || ssgAccountURL) {
          const loginSucess = xhr.statusText === 'success'

          if (loginSucess) {
            trackLogin(ssgAccountURL, acessKeyURL)
            window.digitalData.user.loginStatus = true
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

                return fetch(`${rootPath()}/_v/post/updateClientAcessOrigin`, {
                  method: 'POST',
                  body: JSON.stringify({
                    docId: userProfileId,
                    email,
                    accessOrigin: 'desktop',
                  }),
                })
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
          // _this.updateLang(_this.orderForm)
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
          const header = await import('../components/headerCustom/header')
          header.customHeader(window.location.hash)
        }
        // })
        const rewardsBoot = await import('../components/rewards/_rewards')

        _this.Rewards = rewardsBoot.bootstrapRewards()

        _this.Rewards.showObsRewards()

        if (!window.vtexjs.checkout.orderForm.loggedIn) {
          _this.preEmail.createElementSamsungAccountLogin()
        }
        if (!window.google && _this.customAddressForm) {
          _this.customAddressForm.loadScript()
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
        const AdobeLaunch = await import('../components/_adobeLaunchPixel')

        AdobeLaunch.adobeLaunchInit()

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
      })
    } catch (error) {
      general()
    }
  }
}
