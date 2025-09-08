import BespokeRefrigerator from '../components/_bespokeRefrigerator'
import { general } from '../components/general'

import Scripts from '../components/_scripts'
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
import RenderLoaderFallback from '../components/_renderLoaderFallback'
import CountDown from '../components/countdown/_countdown'
import fixProfileForm from '../components/_fixProfileData'

import {
  debounce,
  formatCurrencyBRL,
  formatNegativeValue,
  getMaxInstallmentByPaymentSystem,
  getSessionCookie
} from '../components/_utils'
import { hasSelectedPaymentMethod } from '../components/utils/_hasSelectedPaymentMethod'
import { customHeader } from '../components/headerCustom/header'
import { Rewards } from '../components/rewards/_rewards'
import { fnsCustomAddressForm } from '../components/_customAddressForm'
import { adobeLaunchInit } from '../components/_adobeLaunchPixel'
import { createLayoutEmptyCart } from '../components/emptyCart'
import { ServicesLinks } from '../components/_servicesLinks'
import { OptInDimensions } from '../components/_opDimensions'
import Payment from '../components/_payment'
import ToastMessages from '../components/_toastMessage'


const scripts = new Scripts()

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
    scripts.fingerPrint()

    this.type = type // ["vertical"]
    this.orderForm = ''
    this.orderId = this.orderForm ? this.orderForm.orderFormId : ''
    this.lang = ''
    this.isMobile = false

    this.accordionPayments = accordionPayments
    this.deliveryDateFormat = deliveryDateFormat
    this.quantityPriceCart = quantityPriceCart
    this.showNoteField = showNoteField
    this.customAddressForm = customAddressForm
    this.hideEmailStep = hideEmailStep
    this.lastOrderFormTotalPrice = 0
    this.maxInstallment = undefined
    this.maxInstallmentSamsungCard  = undefined
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
    this.optInDimensions = new OptInDimensions()
    this.payment = new Payment()
    this.toastMessages = new ToastMessages()
    this.renderLoaderFallback = new RenderLoaderFallback()
    this.countDown = new CountDown()

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


  getFlagsProductMD() {
    fetch(`${rootPath()}/_v/private/getTagsProducts`)
      .then(resp => resp.json())
      .then(tagData => {
        window.samsungProductTags = tagData;
      })
      .catch(err => {
        console.error('Erro ao buscar tags', err);
        window.samsungProductTags = [];
      });
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

  showCustomToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `vtex-toast${type}`;
  toast.innerHTML = `
    <div class="vtex-toast-content">
      <span class="vtex-toast-icon">${type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span class="vtex-toast-message">${message}</span>
    </div>
  `;
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#f2f4f5',
    color: '#3f3f40',
    padding: '12px 16px',
    borderLeft: type === 'warning' ? '4px solid #f71963' : '4px solid #368df7',
    borderRadius: '4px',
    zIndex: 9999,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
    fontSize: '14px',
    maxWidth: '320px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: '0.95',
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 6000);
}

couponInfo(response) {
  const { marketingData, messages, ratesAndBenefitsData } = response;

  const _trElem = $('.summary-template-holder');
  const couponFields = _trElem.find('.coupon-fieldset');
  const messagesElem = $('.vtex-front-messages-placeholder-opened');
  const inputCoupon = $('.coupon-value.input-small');

  couponFields.find('.div-coupon-info').remove();

  const couponExists = ratesAndBenefitsData.rateAndBenefitsIdentifiers.some(item => {
    return item.matchedParameters && item.matchedParameters['couponCode@Marketing'] === marketingData?.coupon;
  });

  try {
    const couponInfoElement = $('<div class="div-coupon-info"><p style="font-size: 12px; color: #000;"></p></div>');

    if (marketingData && marketingData.coupon) {
      if (couponExists) {
        inputCoupon.each(function () { $(this).prop('disabled', true); });
        couponInfoElement.find('p').text('Cupom de desconto aplicado').css('color', '#006BEA');
        couponFields.append(couponInfoElement); 
        return;
      }

      couponInfoElement.find('p').text('Cupom inválido para compra').css('color', 'red');
      vtexjs.checkout.removeDiscountCoupon().then((res, code) => {
        if (code === 'success') {
          window.location.reload();
        }
      });
    } else {
      if (messages && messages.length > 0) {
        const warningMessage = messages.find(message => message.status === 'warning');
        const errorMessage = messages.find(message => message.status === 'error');

        if (["giftCardCommunicationError", "invalidGiftCard"].includes(errorMessage?.code)) {
          messagesElem.css('display', 'block');
          return;
        }

        if (warningMessage) {
          const text = warningMessage.text?.trim();

          if (text === 'O valor do frete foi alterado') {
            this.showCustomToast(text, 'warning');
            messagesElem.empty(); 
            return; 
          }

          if (text === 'O valor dos itens foi alterado') {
            messagesElem.css('display', 'none');
            couponInfoElement.find('p').text('Digite o cupom de desconto').css('color', '#000');
            couponFields.append(couponInfoElement);
            return;
          }

          // Cupom expirado
          messagesElem.css('display', 'none');
          const couponCodeMatch = text.match(/Cupom (.+?) (?:inválido|expirado)/);
          const couponCode = couponCodeMatch ? couponCodeMatch[1] : null;
          const isRewardsCoupon = couponCode?.toLowerCase().includes('rewards');
          const isReward = window.vtex.accountName === 'samsungbrshopfidelidade' || window.vtex.accountName === 'samsungbrtestsfidelidade';

          if (!isReward && isRewardsCoupon) {
            couponInfoElement.find('p').text('Esse cupom é para uso exclusivo do Portal Rewards! Acesse agora para finalizar sua compra').css('color', 'red');
            couponInfoElement.addClass('isReward');
            $('.coupon-fields button').addClass('isButtonReward');
          } else {
            couponInfoElement.find('p').text(text).css('color', 'red');
          }

          inputCoupon.each(function () {
            $(this).css('border-bottom', 'solid 1px red').val(couponCode);
          });

          couponFields.append(couponInfoElement);
          return;
        }
      }

      // Nenhum cupom aplicado
      couponInfoElement.find('p').text('Digite o cupom de desconto').css('color', '#000');
    }

    couponFields.append(couponInfoElement);
  } catch (e) {
    console.error('couponInfo error:', e);
  }
}


  buildVertical() {
    $('body').addClass('body-cart-vertical')
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

        const logisticsInfoData =
          orderForm.shippingData.logisticsInfo[i].selectedDeliveryChannel === 'delivery' &&
          orderForm.shippingData.logisticsInfo[i].selectedSla !== null
            ? `Opção de entrega selecionada: <span>${orderForm.shippingData.logisticsInfo[i].selectedSla}</span><br />`
            : orderForm.shippingData.logisticsInfo[i].selectedSla === null
              ? ''
              : `Retirada em: <span>${
                  orderForm.shippingData.logisticsInfo[i].slas.find(
                    pickup =>
                      pickup.name === orderForm.shippingData.logisticsInfo[i].selectedSla
                  ).pickupStoreInfo.friendlyName
                }</span><br /> Retirada após confirmação via e-mail`;
          const productId = String(orderForm.items[i].productId);
          const refId = orderForm.items[i].refId || '';
          const { detailUrl } = orderForm.items[i];
          const isInstallService = detailUrl.includes('/install-service/p');
          const isSamsungCare = detailUrl.includes('/samsung-care-');
          const shippingText = isInstallService || isSamsungCare ? 'Após a entrega do produto' : '';
 
          const tagList = window.samsungProductTags || [];
          const matchedTag = tagList.find(tag =>
            tag.productIdTag === String(productId) &&
            tag.activeTag === true &&
            tag.tagCheckoutVisible === true
          );
 
          const installedHtml = matchedTag
          ? `<p class="samsung-tag" style="
                background-color: ${matchedTag.colorTag};
                color: ${matchedTag.colorTextTag};
            ">Instalado pela Samsung</p>`
          : '';
 
          const moreInfoHtml = `
            <div class="more-info ${isInstallService || isSamsungCare ? 'isServices' : ''}">
              ${installedHtml}
              <p class="ref-id" style="font-size: 12px" data-refid="${refId}">${refId}</p>
              <p class="shipping-data">${logisticsInfoData}</p>
              <p class="estimate-shipping">${shippingText}</p>
            </div>
          `;
 
          _trElem.find('td.product-name').append(moreInfoHtml);
      });
    } catch (e) {
      console.error('enchancementProductName error:', e);
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

        const textColor = (installationPrice) !== "Grátis" ? 'color: #000 ;' : 'color: #2189FF';

        return `
          <tr style="height: 23px;">
            <td>Serviço de instalação</td>
            <td>
              <span style="font-weight: 700 ; ${textColor}"> 
                ${installationPrice}
              </span>
            </td>
          </tr>
        `
      })

      const element = `
        <tr class="installation-summary">
          <td style="padding: 0 !important; font-weight: bold">
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
		  const _trElem = $(`.cart-template.full-cart`);
		  const summaryHolder = _trElem.find('> .summary-template-holder');

		  if (summaryHolder.parent().hasClass('summary-to-new-components')) {
			  $('.cart-links-bottom').appendTo(summaryHolder);
			  return;
		  }

		  summaryHolder.wrap(`<div class="summary-to-new-components"></div>`);
		  $('.cart-links-bottom').appendTo(summaryHolder);
	  } catch (e) {
		  console.error('WrapSummary error:', e);
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

  addMercadoPagoScript() {
    try {
      const script = document.createElement('script')
      script.src = 'https://www.mercadopago.com/v2/security.js'
      script.setAttribute('output', 'vtex.deviceFingerprint')
      script.setAttribute('view', 'checkout')

      document.body.appendChild(script)
    } catch (e) {
      console.error('addMercadoPagoScript error:', e)
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

      const quantitySelectedItemsArray = items.map(item => {
        return item.quantity
      })

      const quantitySelectedItems = quantitySelectedItemsArray.reduce((accumulator, value) => accumulator + value, 0)

      const _accordionElem = $($('.summary-template-holder')[1])

      let listItems = ''

      items.forEach(item => {
        listItems += `
            <li>${item.quantity}x ${item.name || item.skuName}</li>
          `
      })

      const _summaryOrder = `
        <div class="summaryOrder">
          <h6>Resumo do pedido (${quantitySelectedItems} ${quantitySelectedItems <= 1 ? 'item' : 'itens'
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
        const listPriceTotalValue =
          orderForm.items[i].listPrice * orderForm.items[i].quantity
        const sellingPrice = orderForm.items[i].sellingPrice
        const free = sellingPrice == 1 || sellingPrice == 0
        const samsungCare = Object.values(orderForm.items[i].productCategories)
          .map(el => el.toLowerCase())
          .filter(el => el.match('samsung care'))

        const listPriceFormated = formatCurrencyBRL(listPriceTotalValue)

        free ? _trElem.addClass('gratuito') : null
        samsungCare?.length ? _trElem.find('td.shipping-date').remove() : null

        _trElem.attr('data-id-product', orderForm.items[i].productId)

        _trElem.find('.new-product-price').text(free ? '' : listPriceFormated)
        _trElem.find('.new-product-price').val(free ? '' : listPriceTotalValue)

        if (sellingPrice < listPriceTotalValue) {
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

            <p class="v-custom-quantity-price__best" style="font-size: 18px; margin-bottom: 4px; 
            font-weight:bold; ${free && !samsungCare?.length ? 'color: #2189FF;' : ''}" >${free ? 'Grátis' : totalValue
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
    try {
      const _this = this

      if (!_this.quantityPriceCart) return

      const _containerTotalizers = $('.summary-totalizers .totalizers-list')
      const _subTotalElement = $(
        `.summary-totalizers .totalizers-list .Items`
      ).find('.monetary')
      const _discountElement = $(
        `.summary-totalizers .totalizers-list .Discounts`
      ).find('.monetary')

      const _elementListPrice = $('td.product-price').find('.new-product-price')

      let valoresSubTotalArray = []

      _elementListPrice.each(function () {
        let valor = $(this).val()
        if (valor != '') valoresSubTotalArray.push(parseInt(valor))
      })

      _this.subTotalValueFinal = valoresSubTotalArray.reduce(
        (accumulator, value) => accumulator + value,
        0
      )
      _this.discountPrices =
        orderForm.totalizers[0].value - _this.subTotalValueFinal
      let discountFinalFormatted = formatNegativeValue(
        formatCurrencyBRL(_this.discountPrices)
      )
      _subTotalElement.val(_this.subTotalValueFinal)
      _subTotalElement.text(formatCurrencyBRL(_this.subTotalValueFinal))

      if (
        valoresSubTotalArray.length > 0 &&
        _subTotalElement.val() === `${this.subTotalValueFinal}`
      ) {
        _containerTotalizers.css('display', 'flex')
      } else {
        _containerTotalizers.css('display', 'none')
      }

      if (orderForm.value === _this.subTotalValueFinal) {
        $(`.discount-subtotal-container`).remove()
        $(`.new-discount-value-container`).remove()
        $(`.new-discount-total-container`).remove()
      } else {
        if (_this.discountPrices) {
          let hasDiscount = orderForm.totalizers?.filter(
            val => val.id === 'Discounts'
          )
          let discountTotal = _this.discountPrices + hasDiscount[0]?.value
          _discountElement.text(
            formatNegativeValue(formatCurrencyBRL(discountTotal))
          )
          if (hasDiscount.length > 0) {
            if (
              _containerTotalizers.find('.discount-subtotal-container').length ===
              0
            ) {
              $(`.summary-totalizers .totalizers-list`)
                .find('.Items')
                .after(
                  `<tr class="discount-subtotal-container" style="order: 2;">
                <td style="font-size: 12px; margin-left: 10px;">Oferta Especial Samsung.com</td>
                <td>
                  <span class="value-discount-subtotal">${discountFinalFormatted}</span>
                </td>
              </tr>`
                )
            }
            $(`.new-discount-value-container`).remove()
            $(`.new-discount-total-container`).remove()
          } else {
            if (
              _containerTotalizers.find('.new-discount-value-container')
                .length === 0 &&
              _containerTotalizers.find('.new-discount-total-container')
                .length === 0
            ) {
              $(`.summary-totalizers .totalizers-list`)
                .find('.Items')
                .after(
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
    } catch (e) {
      console.error("subTotalSummary", e)
    }
  }

  verifyMobileScreen() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) this.isMobile = true;
  }

  buttonCheckoutOrder(orderForm) {
    const _this = this
    const buttons = document.querySelectorAll('button[id="payment-data-submit"]');
    function verifyPixMessage() {
      const pixPayment = orderForm.paymentData.payments.find(
        item => item.paymentSystem === '125'
      )
      if(pixPayment){
        setTimeout(function () {
          let count = 0
          const interval = setInterval(function () {
            if ($('.body-order-form .container-order-form .transactions-container .VTEX-PIX__modal-background').length) {
              _this.showMessagePix(orderForm)
              clearInterval(interval)
            } else {
              count++
              if(count === 20) {
                clearInterval(interval)
              }
            }
          }, 1000)
        }, 5000)
      }
    }
    if(buttons){
      buttons.forEach(button => {
        button.addEventListener('click', verifyPixMessage);
      });
    } 
  }

  showMessagePix(orderForm) {
    try {
      if (orderForm.items === 0) return
      const _containerQRCode = $('.body-order-form .container-order-form .transactions-container .VTEX-PIX__modal-background .VTEX-PIX__qrcode-container')
      const _containerPixHeaderDescription = $(`.body-order-form .container-order-form .transactions-container .VTEX-PIX__modal-background ${this.isMobile ? '.VTEX-PIX__center-container-head-mobile' : '.VTEX-PIX__container-info-head'}`)
      const _containerPixDescription = $(`.body-order-form .container-order-form .transactions-container .VTEX-PIX__modal-background ${this.isMobile ? '.VTEX-PIX__center-container-subhead-mobile' : '.VTEX-PIX__container-info-description'}`)
      const _containerPixDescriptionInfos = $('.body-order-form .container-order-form .transactions-container .VTEX-PIX__modal-background .VTEX-PIX__container-info')
      const _containerPixValueFooter = $('.body-order-form .container-order-form .transactions-container .VTEX-PIX__modal-background .VTEX-PIX__footer .VTEX-PIX_footer-value')
      const _containerPixElementValue = _containerPixValueFooter.find('.VTEX-PIX_footer-value-samsung')
      const _containerPixElement = _containerPixHeaderDescription.find('.VTEX-PIX__container-info-head-samsung') && _containerPixDescription.find('.VTEX-PIX__container-info-head-samsung') && _containerPixDescriptionInfos.find('.VTEX-PIX_description-footer-samsung')
      
      const headerDescriptionPixText = `
        <div class="VTEX-PIX__container-info-head-samsung">Instruções para Pagamento</div>
      `;
      const descriptionPixText = `
        <div class="VTEX-PIX__container-info-description-samsung">
          <ol>
            <li>Abra o aplicativo do seu banco: Se preferir, você pode fazer isso em outro celular.</li>
            <li>Selecione a opção "Pix"</li>
            <li>Aponte a câmera do seu celular para o código QR.</li>
          </ol>
        </div>
      `;
      const descriptionFooterPix = `
        <span class="VTEX-PIX_description-footer-samsung">Se ocorrer algum erro, por favor, refaça seu pedido.</span>
      `;
      const valueFooterPix = `
        <span class="VTEX-PIX_footer-value">${formatCurrencyBRL(orderForm.value)}</span>
      `;
      
      if(_containerQRCode.length > 0){
        if (_containerPixElement.length === 0) {
          _containerPixHeaderDescription.empty()
          _containerPixDescription.empty()
          _containerPixDescriptionInfos.append(descriptionFooterPix);
        }
        _containerPixHeaderDescription.html(headerDescriptionPixText);
        _containerPixDescription.html(descriptionPixText);
      }
      if (_containerPixElementValue.length === 0) {
        _containerPixValueFooter.empty()
      }
      _containerPixValueFooter.html(valueFooterPix);
    } catch (e) {
      console.error("showMessagePix", e)
    }
  }

  showMessageMercadoPagoPayment(orderForm) {
    try {
      if (orderForm.items === 0) return
      const _containerTotalizers = $('.box-step .box-step-content .steps-view .box-payment-mercadopago .mercadopago-box-wrapper')
      const _containerMercadoPagoElement = _containerTotalizers.find('.mercadopago-box-wrapper-samsung')
      const descriptionMercadoPagoText = `
          <div class="mercadopago-box-wrapper-samsung">
            <div class="header-mercado-pago-samsung">
                <p>Mercado Pago</p>
                <div class="payment-mercadopago-ico-logo"></div>
            </div>
            <div class="row-fluid">
                <div class="box-title">
                  <p class="span12">
                    Clique no botão <strong>"Finalizar compra"</strong> ${this.isMobile ? "abaixo" : "ao lado"} e pague em até 12x com segurança, com ou sem uma conta Mercado Pago
                  </p>
                </div>
            </div>        
            <div>
                <div class="row-fluid">
                  <ul class="box-img thumbnails-grid-samsung">
                      <li class="span4 mini-box-samsung mini-box-line-one">
                        <div class="payment-mercadopago-ico payment-mercadopago-ico-credit-card"></div>
                        <p>Cartões de crédito</p>
                      </li>
                      <li class="span4 mini-box-samsung mini-box-line-one">
                        <div class="payment-mercadopago-ico payment-mercadopago-ico-debit-card"></div>
                        <p>Cartões de débito</p>
                      </li>
                      <li class="span4 mini-box-samsung">
                        <div class="payment-mercadopago-ico payment-mercadopago-ico-pix img-pix mb-img"></div>
                        <p>Pix</p>
                      </li>
                      <li class="span4 mini-box-samsung">
                        <div class="payment-mercadopago-ico payment-mercadopago-ico-credito"></div>
                        <p>Linha de Crédito</p>
                      </li>
                  </ul>
                </div>
            </div>           
            <div class="row-fluid">
                <div class="box-flags">
                  <p class="span12">Bandeiras aceitas: </p>           
                  <div class="payment-mercadopago-flags payment-mercadopago-flags-bra"></div>
                </div>
            </div>
          </div>
        `;
      if (_containerMercadoPagoElement.length === 0) {
        _containerTotalizers.empty()
      }
      _containerTotalizers.html(descriptionMercadoPagoText);
    } catch (e) {
      console.error("showMessageMercadoPagoPayment", e)
    }
  }

  showMessageNubankPayment(orderForm) {
    try {
      if (orderForm.items === 0) return
      const _containerTotalizersNubankExtra = $('.box-step .box-step-content .steps-view .box-payment-nubank .nu-container .nu-extra-limit')
      const _containerNubankExtraElement = _containerTotalizersNubankExtra.find('.nu-extra-limit-samsung')
      const descriptionNubankExtraText = `
          <div class="nu-extra-limit-samsung">
            <div class="nu-extra-limit-badge">Novidade</div>
            <span class="nu-extra-limit-text"><strong class="nu-extra-limit-text-bold">Você pode ter um limite adicional para essa compra!</strong> Verifique no momento do pagamento se está disponível.</span>  
          </div>
        `;

      const _containerTotalizers = $('.box-step .box-step-content .steps-view .box-payment-nubank .nu-container .nu-body')
      const _containerNubankElement = _containerTotalizers.find('.nu-body-items-samsung')
      const descriptionNubankText = `
          <div class="nu-body-items-samsung">
            <div class="nu-body-item">
                <div class="nu-body-item-icon">
                  <strong class="nu-extra-limit-text-bold">1</strong>
                </div>
                <div class="nu-body-item-text">Clique no botão <strong>"Finalizar compra"</strong> ${this.isMobile ? "abaixo" : "ao lado"}</div>
            </div>
            <div class="nu-body-item">
                <div class="nu-body-item-icon">
                  <strong class="nu-extra-limit-text-bold">2</strong>
                </div>
                <div class="nu-body-item-text">Depois abra o <strong>app Nubank</strong> para finalizar com o pagamento</div>
            </div>
            <hr class="nu-hr-space-body">
          </div>
        `;
      if (_containerNubankElement.length === 0) {
        _containerTotalizers.prepend(descriptionNubankText);
      }

      if (_containerNubankExtraElement.length === 0) {
        _containerTotalizersNubankExtra.empty()
      }
        
      _containerTotalizersNubankExtra.html(descriptionNubankExtraText);
    } catch (e) {
      console.error("showMessageNubankPayment", e)
    }
  }

  setItemsCount(items = []) {
    try {
      const quantity = items.reduce((acc, item) => acc += item.quantity, 0)
      const text = quantity === 1 ? 'item' : 'itens'

      $('h1#cart-title').attr('data-quantity', `${quantity} ${text}`)
    } catch (error) {
      console.error('error: ', error);
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

        const account = window?.__RUNTIME__?.account

        const accountPaymentMap = {
          samsungbrshopeppnubank: 178,
          default: 125,
        }

        const paymentSystem = accountPaymentMap[account] || accountPaymentMap.default

        const installmentPix = orderForm.paymentData.installmentOptions.find(
          item => item.paymentSystem == paymentSystem
        ).installments

        const creditCardPaymentGroup = orderForm?.paymentData?.paymentSystems?.find(
          paymentSystem => paymentSystem?.groupName === 'creditCardPaymentGroup'
        )

        const customPrivate_501PaymentGroup = orderForm?.paymentData?.paymentSystems?.find(
          paymentSystem => paymentSystem?.groupName === 'customPrivate_501PaymentGroup'
        )

        const creditCardPaymentSystemId = creditCardPaymentGroup?.stringId
        const samsungCardPaymentSystemId = customPrivate_501PaymentGroup?.stringId

        if (!installmentPix.length) return
        const inCashPrice = installmentPix[0].total
        // Encontra as installments para do cartao visa (código 2)
        // Pega o valor total para a installment com maior quantidade de parcelas (geralmente 12)

        // THE INSTALLMENTS ENDPOINT HAS A LOT OF REQUESTS AND IT AFFECT INDIRECTLY THE REWARDS PERFOMANCE, BECAUSE OF IT
        // I IMPLEMENTED TWO NEW STATES ONE TO KNOW THE LAST TOTALPRICE OF ORDERFORM AND ANOTHER TO KEEP THE INSTALLMENTS PRICE
        // ONLY WILL DO A NEW REQUEST CASE ORDERFORM TOTALPRICE BE CHANGED.
        if (_this.lastOrderFormTotalPrice !== orderForm.value) {
          _this.lastOrderFormTotalPrice = orderForm.value

          const installmentsPromises = []

          if (creditCardPaymentSystemId) {
            installmentsPromises.push(
              getMaxInstallmentByPaymentSystem(creditCardPaymentSystemId)
            );
          }

          if (samsungCardPaymentSystemId) {
            installmentsPromises.push(
              getMaxInstallmentByPaymentSystem(samsungCardPaymentSystemId)
            );
          }

          const [
            creditCardInstallments,
            samsungCardInstallments
          ] = await Promise.allSettled(installmentsPromises);

          _this.maxInstallment = creditCardInstallments?.value
          _this.maxInstallmentSamsungCard = samsungCardInstallments?.value
        }

        const _component =
          `
            <div class="cart-total" style="margin-bottom: 20px; color: #000">
              <div class="best-price" style="font-size: 26px; display: flex; justify-content: space-between; font-weight: 700">
                <p class="ref-id">Total</p>
                <p class="estimate-shipping">
                  ${formatCurrencyBRL(inCashPrice)}
                </p>
            </div>
          ${(_this.maxInstallment?.count > 1 && _this.maxInstallment?.total > 0) ? (
            `<div class="discount-price" style="text-align: left; font-size: 14px; margin-top: 10px;">
                <p style="margin-bottom: 0;">
                  <strong>${formatCurrencyBRL(_this.maxInstallment.total)}</strong> em até <strong>${_this.maxInstallment.count}x sem juros</strong>
                  ${!_this.maxInstallmentSamsungCard?.total ? (
                  `<span class="custom-tooltip">i</span>`
                ) : ''}
                </p>

                ${(_this.maxInstallmentSamsungCard?.count > 1) ? (
                  `<p>
                      ou <strong>${_this.maxInstallmentSamsungCard.count}x sem juros</strong> com o <strong>Cartão Samsung</strong> 
                      <span class="custom-tooltip">i</span>
                    </p>`
                ) : ''}
              </div>
            </div>`
          ) : '<div style="margin-top: 10px; height: 54px" />'}`

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
    fixProfileForm()
    const _this = this

    this.payment.setNubankWarningMessage(orderForm)
    this.payment.setNubankIFrameInstallments(orderForm)
    this.setItemsCount(orderForm?.items ?? [])
    this.checkEmpty(orderForm.items)
    this.addAssemblies(orderForm)
    this.enchancementTotalPrice(orderForm)
    this.enchancementProductCart(orderForm)
    this.shippingColor(orderForm)
    this.toastMessages.notifyItemRemovalFromCart(orderForm)

    if (window.location.hash === '#/cart') {
      this.shipping.pickupRule(orderForm)
    }

    if (window.location.hash === '#/payment') {
      this.showMessageNubankPayment(orderForm)
      this.showMessageMercadoPagoPayment(orderForm)
      this.buttonCheckoutOrder(orderForm)
    }

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

  paymentBuilder() {
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

  itauCardMessage(orderForm) {
    if (orderForm && $('.itauCardMessage').length === 0) {
      if (orderForm.paymentData) {
        let itauCardMessageHtml = `<div class="itauCardMessage">
          <h2 class="itauCardMessage__title">Importante</h2>
          <p class="itauCardMessage__visaFlag">Bandeira Visa: até <b>24x</b> sem juros</p>
          <p class="itauCardMessage__mastercardFlag">Bandeira Mastercard: até <b>21x</b> sem juros</p>
          <span class="itauCardMessage__text">Caso selecione um parcelamento acima de 21x, seu pedido será cancelado.</span
        </div>`

        let itauCardSelectElement = $(".steps-view .pg-samsung-itaucard")

        if (itauCardSelectElement) {
          itauCardSelectElement.before(itauCardMessageHtml)
        }
      }
    }
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
      let statePickUp = filterSlas[0].pickupStoreInfo.address?.state
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
    if (hasSelectedPaymentMethod()) {
      return
    }
    try {
      const _this = this
      // Default Payment Method: PIX
      const $defaultPaymentMethod = $(
        '#payment-group-instantPaymentPaymentGroup'
      )

      if (
        $defaultPaymentMethod.length &&
        !$defaultPaymentMethod.is('.active')
      ) {
        $defaultPaymentMethod.trigger('click')
        _this.payment.orderPaymentMethodScroll($defaultPaymentMethod);
      }

      this.hasSelectedDefaultPaymentMethod = true
    } catch (err) {
      this.hasSelectedDefaultPaymentMethod = false
      console.error(`Erro ao definir método de pagamento padrão: ${err}`)
    }
  }

  defaultGiftCard(orderForm, defaultId = 'VtexGiftCard') {
    // Default Voucher Select: VtexGiftCard
    const giftCardsProviders = window?.checkoutConfig?.giftCardsProviders()

    if (giftCardsProviders) {
      giftCardsProviders.sort((a) => a.id === defaultId ? -1 : 1)
    }

    try {
      const giftCardsVtex = orderForm?.paymentData?.giftCards?.filter(
        g => g.provider === defaultId && g.redemptionCode
      )
      if (giftCardsVtex.length === 0) {
        setTimeout(() => {
          $('body').on(
            'click',
            '#show-gift-card-group',
            function () {
              setTimeout(() => {
                $("#gift-card-provider-selector option").filter(function () {
                  return this.text == defaultId;
                })[0].selected = true;
              }, 1000)
            }
          )
        }, 1000)
      } else {
        setTimeout(() => {
          $("#gift-card-provider-selector option").filter(function () {
            return this.text == defaultId;
          })[0].selected = true;
        }, 1000)
      }
    } catch (err) {
      console.error(`Erro ao definir o tipo de voucher padrão selecionado: ${err}`)
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

  handleModalAuthConflictRedirect() {
    try {
      $(this).addClass("js-loading");

      const notMyvtex = window?.location?.href?.indexOf('myvtex') === -1;
      const orderFormId = window?.vtexjs?.checkout?.orderForm?.orderFormId
      
      if (notMyvtex && orderFormId) {
        const returnUrl = `${window.vtex.endpointAPI.split('/api')[0]}/checkout/changeToAnonymousUser/${window.vtexjs.checkout.orderForm.orderFormId}`
  
        window.location.assign(
          `${window.vtex.endpointAPI}/pub/logout?scope=${window.vtex.accountName}&returnUrl=${returnUrl}`
        )
      };
    } catch (error) {
      console.error('error handleModalAuthConflictRedirect: ', error);
    }
  }

  bind() {
    const _this = this
    _this.getFlagsProductMD()
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

    $('body').on('click', '.VTEX-PIX__dry-button', function () {
      setTimeout(function () {
        _this.showMessagePix(_this.orderForm)
      }, 10)
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

    $("body")
      .off("click", ".js-checkEmailAuthConflict__modal--button")
      .on("click", ".js-checkEmailAuthConflict__modal--button", _this.handleModalAuthConflictRedirect)
  }

  init() {
    if (window.location && this.orderForm) {
      const hash = window.location.hash
      this.handleOrderFromEndless(hash, this.orderForm)
      this.showPersonalDataEndless(this.orderForm)
    }

    if (window.vtex) {
      window.vtex.showInstallmentsPreviewValue = true
    }

    this.orderForm = window.vtexjs ? window.vtexjs.checkout.orderForm : false

    general()
    this.updateStep()
    this.builder()

    if (this.orderForm) {
      this.update(this.orderForm)
      this.paymentBuilder()
      this.CSP.init(this.orderForm)
      this.SummaryGiftCard.init(this.orderForm)
      if (window.location.hash === '#/payment') {
        this.verifyCSP(this.orderForm)
        this.itauCardMessage(this.orderForm)
      }

    }

    this.fixLabels()
    this.CheckoutLimit.init()
  }

  start() {
    const _this = this
    try {
      addEventListener('hashchange', async (event) => {
        const showHeader = ['#/payment', '#/shipping', '#/profile']
        const { hash } = event.target.location

        if (showHeader.includes(hash)) {
          customHeader()
        }

        this.enchancementSummaryCart(_this.orderForm, window.location.hash)

        window.scrollTo({ top: 0, behavior: 'smooth' });
      })

      _this.renderLoaderFallback.init()
      _this.verifyMobileScreen()
      _this.init()
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

        _this.countDown.init()
      })

      $(window).on('checkoutRequestBegin.vtex', function (event, request) {
        _this.CheckoutLimit.limitQuantity(event, request)
        _this.samsungCarePlus.sendSameQuantityAsAttachedItem(event, request)
        _this.payment.updateInstallmentsInPaymentGroups(event, request)
      })

      $(window).on('checkoutRequestEnd.vtex', function (event, orderForm) {
        _this.samsungCarePlus.sync(orderForm)
        _this.CheckoutLimit.sync(orderForm)
        _this.installationService.sync(orderForm)
        _this.optInDimensions.sync(orderForm)
        _this.payment.sync(orderForm)
        _this.TradeIn.sync(orderForm)
      })

      function trackLogin(accessKeyURL) {
        if (accessKeyURL) {
          window._satellite.track('shop_guest_login')
        }
      }

      // !ATENTION
      $(document).ajaxComplete(function (event, xhr, settings) {
        if (settings.url.includes('/attachments/shippingData')) {
          _this.shipping.validadePostalCode(window.vtexjs.checkout.orderForm)
          _this.shipping.toggleGoToPaymentDisabled()

          if (window.location.hash === '#/shipping') {
            _this.shipping.checkReceiverName(_this.orderForm)
            _this.shipping.addInvalidSelectedDateMessage()
            _this.optInDimensions.render()
          }
        }

        if (settings.url.includes('/coupons')) {
          const { responseText } = xhr
          const response = JSON.parse(responseText)
          _this.couponInfo(response)
        }

        _this.init()

        const acessKeyURL = settings.url.includes(
          `${rootPath()}/api/checkout/pub/profiles/`
        )
        if (acessKeyURL) {
          const loginSucess = xhr.statusText === 'success'
          if (loginSucess) {
            trackLogin(acessKeyURL)
            // !ATENTION
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
            }, 1000)
          }
        }
      })

      $(window).on('hashchange', function () {
        const cartItems = document.querySelector('.cart-items')
        if (
          window.location.hash === '#/payment' ||
          window.location.hash === '#/cart'
        ) {
          _this.TradeIn.validateTradeinCustomData(_this.orderForm)
          _this.SendAttachment.sendOpenTextField()
          // _this.displayHideSuperChat(window.location.hash)
          _this.customizeLogOut()
        }
        _this.updateStep()
        _this.changeShippingTimeInfoInit()
        _this.checkProfileFocus()
        _this.fixLabels()

        _this.TradeIn.clearAllTradeInDataTradeInCSP(_this.orderForm)

        if (window.location.hash === '#/payment') {
          _this.defaultPaymentMethod()
          _this.payment.orderPaymentMethod()
          _this.payment.setPendingPaymentInLocalStorage()
          if (_this.orderForm) {
            _this.defaultGiftCard(_this.orderForm)
            _this.verifyCSP(_this.orderForm)
          }
        }

        setTimeout(_this.shipping.toggleGoToPaymentDisabled, 300)

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
          _this.paymentBuilder()
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
            _this.optInDimensions.render()
            _this.customizeLogOut()
            _this.profile.redirectProfileNotBirthDate(_this.orderForm)
          }

          if (window.location.hash === '#/payment') {
            _this.itauCardMessage(_this.orderForm)
            _this.profile.redirectProfileNotBirthDate(_this.orderForm)
          }
        }
      })

      if(!_this.sessionPolicy) {
        getSessionCookie().then(session => {
          const policy = session?.namespaces?.store?.channel?.value
          _this.sessionPolicy = policy
        })
      }

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
        const doesntAcceptRewards = _this.sessionPolicy && _this.sessionPolicy === '72' 
        if (!doesntAcceptRewards) {
          _this.Rewards = new Rewards()
        }

        _this.Rewards?.showObsRewards()

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
          _this.defaultGiftCard(orderForm)
          _this.shipping.removeIfHasntPrice()
          _this.profile.addFieldsProfileToSummary(orderForm)
          _this.Rewards?.cancelRewardsDiscount(true)
          _this.Rewards?.showPointsSimulation()
          _this.verifyCSP(orderForm)
          _this.TradeIn.validateTradeinCustomData(orderForm)
        }

        _this.TradeIn.clearAllTradeInDataTradeInCSP(orderForm)

        if (window.location.hash === '#/profile') {
          // Add WhatsApp
          // _this.profile.addWhatsAppField()
          // Insere o campo data de nascimento
          _this.profile.addDateBirthField()
          _this.profile.addMsgPhone()
          _this.profile.addTerms(orderForm)
          _this.Rewards?.showPointsSimulation()
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
          _this.optInDimensions.render()
        } catch (err) {
          console.error(`${err}`)
        }
      })

      $(window).on('attachmentUpdated.vtex', function (evt, orderFormSection) {
        switch (orderFormSection) {
          case 'shippingData':
            _this.shipping.autoTriggerSlasResult()
            // _this.optInDimensions.render()
            break

          default:
            break
        }
      })

      // ok load
      $(window).load(async function () {
        _this.payment.setPixAsDefaultPaymentMethod()
        if (window.location.hash === '#/cart') {
          _this.Rewards?.cancelRewardsDiscount()

          const checkIfPickupIsTrue = localStorage.getItem(
            'srp-toggle__pickupClickedOnPdp'
          )

          if (checkIfPickupIsTrue === 'true') {
            $('.srp-toggle__pickup').click()
            localStorage.removeItem('srp-toggle__pickupClickedOnPdp')
          } else {
            $('.srp-toggle__delivery').click()
            localStorage.removeItem('srp-toggle__pickupClickedOnPdp')
          }
        }

        $(document).on('click', '#back-to-address-list', function () {
          _this.shipping.alertNumberOrReciver();
        });

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
          _this.TradeIn.validateTradeinCustomData(window.vtexjs.checkout.orderForm)
          _this.SendAttachment.sendOpenTextField()
          // _this.displayHideSuperChat(window.location.hash)
        }

        $(window).one('componentValidated.vtex', () => _this.builder())

        window.vtexjs.checkout.getOrderForm().done(function () {
          _this.addMedalliaScript()
          _this.addMercadoPagoScript()
        })

        if ((window.vtex.accountName === "samsungbrshop" || window.vtex.accountName === "samsungbrtests") && !window.location.host.includes("storeplus")) {
          adobeLaunchInit()
        }

        _this.checkProfileFocus()
        _this.changeShippingTimeInfoInit()
        _this.indexedInItems(window.vtexjs.checkout.orderForm)

        if (window.location.hash === '#/payment') {
          _this.defaultPaymentMethod()
          _this.payment.orderPaymentMethod()
          _this.payment.setPendingPaymentInLocalStorage()
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

  changeToAnonymousUserAndReload(orderFormId) {
    fetch(
      `${rootPath()}/checkout/changeToAnonymousUser/${orderFormId}`
    ).then(() => {
      console.log('changeToAnonymousUserAndReload: reloading...') // this log is necessary to help debugging in production
      location.reload()
    }).catch((error) => {
      console.error(`Erro na função changeToAnonymousUser: ${error}`)
    })
  }

  /**
   * Essa função é responsável por limpar os dados pessoais (clientProfielData).
   * Serve para tratar os casos em que o vendedor testa o link de store+ antes de enviar
   * para o cliente.
   */
  
  handleOrderFromEndless(hash, orderForm) {
    if (hash !== '#/cart') return
    const _this = this

    try {
      const isEndlessOrderForm = orderForm.customData?.customApps?.some(
        customApp => customApp.id === 'endlessaisle'
      )

      const orderFormId = orderForm?.orderFormId
      const orderFormUser = orderForm?.clientProfileData?.email

      if (isEndlessOrderForm && orderFormId && orderFormUser) {
        fetch(`${rootPath()}/api/vtexid/pub/authenticated/user`, {
          credentials: 'include'
        }).then(response => response.json()).then(function (response) {
          if (!response) {
            return false
          }

          const authenticatedUser = response.user;

          if (orderFormUser !== authenticatedUser) {
            _this.changeToAnonymousUserAndReload(orderFormId)
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
  }
  showPersonalDataEndless(orderForm) {
    
    try {
      const isEndlessOrderForm = orderForm.customData?.customApps?.some(
        customApp => customApp.id === 'endlessaisle'
      )

      if (isEndlessOrderForm) {
        if (!document.querySelector(`#show-personal-data-from-storeplus`)) {
              document.querySelector(`body`).insertAdjacentHTML("afterbegin", `
                <style id="show-personal-data-from-storeplus">
                  #client-profile-data .box-info {
                    display: block !important;
                  }
                </style>`)
          }
      }
    } catch (e) {
      console.error(e)
    }
  }
}
