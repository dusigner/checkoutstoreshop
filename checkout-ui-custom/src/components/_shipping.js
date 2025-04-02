import { OptInDimensions } from "./_optinDimensions"

/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

export default class CustomShippingData {
  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  addInvalidPostalCodeMessage() {
    try {
      const $postalCodeForm = $('.vtex-omnishipping-1-x-addressFormPart1')
      const $postalCodeField = $postalCodeForm.find('p.ship-postalCode')
      const $invalidPostalCodeMessage = $(
        '<div class="invalid-postal-code-msg"> <span class="invalid-postal-code-msg__label">CEP Inválido</span> <p class="invalid-postal-code-msg__message"> Infelizmente não oferecemos entrega para a sua região. Em caso de dúvidas, por favor <a class="invalid-postal-code-msg__link" href="https://www.samsung.com/br/support/contacts/#start-chat" target="_blank">clique aqui</a>.</p> </div>'
      )

      if (
        $postalCodeField.find('small').length &&
        !$('.invalid-postal-code-msg').length
      ) {
        $postalCodeField.find('small').before($invalidPostalCodeMessage)
      }

      if (!$('.invalid-postal-code-msg').length) {
        $('.srp-delivery-header').append($invalidPostalCodeMessage)
        $(
          '.shp-alert.vtex-shipping-preview-0-x-alert.shp-alert-shipping-unavailable.vtex-shipping-preview-0-x-alertPickup.w-100'
        ).hide()
        $(
          '.srp-delivery-select-container.br2.bw1.relative.bg-white.ba.b--light-gray.hover-b--silver.h-100'
        ).hide()
      }
    } catch (err) {
      console.error(
        `Ocorreu um erro ao adicionar mensagem de CEP inválido: ${err}`
      )
    }
  }

  addInvalidInventoryCodeMessage() {
    try {
      const $postalCodeForm = $('.vtex-omnishipping-1-x-addressFormPart1')
      const $postalCodeField = $postalCodeForm.find('p.ship-postalCode')
      const $invalidPostalCodeMessage = $(
        '<div class="invalid-postal-inventory"><p class="invalid-postal-code-msg__message">Infelizmente o produto que você escolheu está sem estoque para a sua região. Em breve nosso estoque será reabastecido.</p></div>'
      )

      if (
        $postalCodeField.find('small').length &&
        !$('.invalid-postal-inventory').length
      ) {
        $postalCodeField.find('small').before($invalidPostalCodeMessage)
      }

      if (!$('.invalid-postal-inventory').length) {
        $('.srp-delivery-header').append($invalidPostalCodeMessage)
        $(
          '.shp-alert.vtex-shipping-preview-0-x-alert.shp-alert-shipping-unavailable.vtex-shipping-preview-0-x-alertPickup.w-100'
        ).hide()
        $(
          '.srp-delivery-select-container.br2.bw1.relative.bg-white.ba.b--light-gray.hover-b--silver.h-100'
        ).hide()
      }
    } catch (err) {
      console.error(
        `Ocorreu um erro ao adicionar mensagem de CEP inválido: ${err}`
      )
    }
  }

  removeInvalidPostalCodeMessage() {
    $('.invalid-postal-code-msg').remove()
  }

  setInvalidPostalCode() {
    $('body').removeClass('valid-postal-code').addClass('invalid-postal-code')
  }

  setValidPostalCode() {
    $('body').removeClass('invalid-postal-code').addClass('valid-postal-code')
  }

  resetValidation() {
    $('body').removeClass('invalid-postal-code valid-postal-code')
  }

  lockPostalCodeInput() {
    $('#shipping-data input#ship-postalCode').prop('disabled', true)
  }

  unlockPostalCodeInput() {
    $('#shipping-data input#ship-postalCode').prop('disabled', false)
  }

  addVirtualInventoryMessage() {
    $(window).on('orderFormUpdated.vtex', function () {
      try {
        const $postalCodeForm = $('#shipping-preview-container')
        const $virtualInventoryMessage = $(
          `<div class="virtual-inventory-msg prazo-acima" style="max-width: 566px; margin-top: 16px;">
          <p class="invalid-postal-code-msg__message">
            Este item está com prazo de entrega acima do normal.
          </p>
        </div>`
        )

        if ($('.prazo-acima').length === 0) {
          if (
            $postalCodeForm.find('.shp-alert-shipping-unavailable').length === 1
          ) {
            $postalCodeForm
              .find('.shp-alert-shipping-unavailable')
              .before($virtualInventoryMessage)
          }
        }
      } catch (err) {
        console.error(
          `Ocorreu um erro ao adicionar mensagem de prazo acima do normal: ${err}`
        )
      }
    })
  }

  validateVirtualInventory(orderForm) {
    const _this = this

    try {
      if (!orderForm.shippingData) return
      if (!orderForm.shippingData.address) return
      const { logisticsInfo } = orderForm.shippingData

      logisticsInfo.filter(item => {
        if (logisticsInfo[0].slas.length > 0) {
          const appendItem = item.slas.every(sla => {
            return sla.deliveryIds[0].warehouseId.indexOf('Virtual') > -1
          })

          if (appendItem) {
            if ($('.virtual-inventory-msg').length === 0) {
              _this.addVirtualInventoryMessage()
            }
          }
        }

        return true
      })
    } catch (err) {
      console.error(`Ocorreu um erro ao consultar o estoque virtual: ${err}`)
    }
  }

  validadePostalCode(orderForm) {
    if (!orderForm) return

    try {
      if (!orderForm.shippingData) return

      if (!orderForm.shippingData.address) return

      const _this = this

      const { address: orderFormAddress } = orderForm.shippingData

      this.validateVirtualInventory(orderForm)

      const interval = setInterval(function () {
        if (
          orderForm.messages &&
          orderForm.messages[0] &&
          orderForm.messages[0].text
        ) {
          if (orderForm.messages[0].text.indexOf('CEP selecionado') > -1) {
            if (!$('.invalid-postal-code-msg').length) {
              _this.addInvalidPostalCodeMessage()
              clearInterval(interval)
            }
          } else if (orderForm.messages[0].text.indexOf('coordenadas') > -1) {
            _this.setInvalidPostalCode()
            if (!$('.invalid-postal-inventory').length) {
              _this.addInvalidInventoryCodeMessage()
              clearInterval(interval)
            }
          }
        } else {
          clearInterval(interval)
        }
      }, 50)

      if (orderFormAddress.city) {
        _this.setValidPostalCode()
        _this.removeInvalidPostalCodeMessage()

        return
      }

      if (orderFormAddress.postalCode) {
        $.getJSON(
          `${_this.rootPath()}/api/checkout/pub/postal-code/BRA/${orderFormAddress.postalCode
          }`
        ).done(function (data) {
          const address = data

          if (address.postalCode && !address.city) {
            _this.setInvalidPostalCode()
            _this.addInvalidPostalCodeMessage()
          } else {
            _this.setValidPostalCode()
            _this.removeInvalidPostalCodeMessage()
          }
        })
      }
    } catch (err) {
      console.error(`Ocorreu um erro ao validar CEP: ${err}`)
    }
  }

  validadePostalCodeOnLoad() {
    try {
      const _this = this
      const $postalCodeInput = $('#shipping-data input#ship-postalCode')

      if (!$postalCodeInput.val()) {
        _this.resetValidation()
      }

      if (!$postalCodeInput.val().length < 9) {
        _this.resetValidation()
      }

      $.getJSON(
        `${_this.rootPath()}/api/checkout/pub/postal-code/BRA/${$postalCodeInput.val()}`
      ).done(function (data) {
        const address = data

        _this.validadePostalCode(address)
        _this.unlockPostalCodeInput()
      })
    } catch (err) {
      console.error(`Ocorreu um erro ao validar CEP: ${err}`)
    }
  }

  limitFieldsCharacters() {
    const fieldsToLimit = [
      {
        selector: '#ship-postalCode',
        maxLength: 9,
      },
      {
        selector: '#ship-street',
        maxLength: 60,
      },
      {
        selector: '#ship-number',
        maxLength: 10,
      },
    ]

    try {
      const context = '#shipping-data'

      for (const field of fieldsToLimit) {
        const { selector, maxLength } = field

        $(document).on('focus', `${context} ${selector}`, function () {
          $(this).attr('maxlength', maxLength)
        })
      }
    } catch (err) {
      console.error(`Erro ao limitar caracteres em campos de endereço: ${err}`)
    }
  }

  toggleGoToPaymentDisabled() {
    // When it has opt-in dimension
    const $optinDimensionsInput = $('input#optin-dimensions');
    ////

    //used for pickup point
    const $pickupReceiverInput = $("#pickup-receiver:visible");
    ////

    let disabled =
      $('#shipping-data p.input.required:visible input').filter(function () {

        return $.trim($(this).val()).length === 0
      }).length === 0

    // When it has opt-in dimension
    if ($optinDimensionsInput.length) {
      disabled = disabled && $optinDimensionsInput.prop('checked')
      OptInDimensions.toggleRequiredMessage()
    } 
    ////

    //used for pickup point
    if ($pickupReceiverInput.length) {
      disabled = disabled && $pickupReceiverInput.val().length > 0
    }
    ////

    $('#btn-go-to-payment').prop('disabled', !disabled)
  }

  checkReceiverName(orderForm) {
    if (!orderForm) return;
  
    const profileData = orderForm.clientProfileData;
    if (!profileData) return;
  
    try {
      const receiverName = `${profileData.firstName} ${profileData.lastName}`;
      const $receiverNameInput = $('#ship-receiverName');
  
      // Adicionar o valor inicial se o campo estiver vazio
      if (!$receiverNameInput.val().trim() && (!$receiverNameInput.attr('data-edited') || $receiverNameInput.attr('data-edited') === 'false')) {
        $receiverNameInput.val(receiverName);
      }
  
      if (!$receiverNameInput.attr('data-edited')) {
        $receiverNameInput.attr('data-edited', 'false');
      }
  
      $receiverNameInput.on('focus', function () {
        if (!$(this).val().trim() && $(this).attr('data-edited') === 'false') {
          $(this).val(receiverName).trigger('input');
        }
      });
  
      const updateLabel = () => {
        const label = $receiverNameInput.prev('label[for="ship-receiverName"]');
        if ($receiverNameInput.val().trim() === receiverName.trim()) {
          label.text('Destinatário é o mesmo da entrega');
        } else {
          label.text('Destinatário');
        }
      };
  
      $receiverNameInput.on('input', function () {
        if ($(this).val().trim()) {
          $(this).attr('data-edited', 'true');
        }
        updateLabel();
      });
  
      updateLabel();
  
      if (!$('#changeReceiverLink').length) {
        const $link = $('<a>')
          .attr('href', '#')
          .attr('id', 'changeReceiverLink')
          .text('Não é você? Alterar o Destinatário')
          .css({
            display: 'block',
            marginTop: '5px',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '12px',
          })
          .on('click', function (e) {
            e.preventDefault();
            $receiverNameInput[0].focus();
            $receiverNameInput.val('0').attr('data-edited', 'true');
            $receiverNameInput.trigger('input');
          });
  
        // Inserir o link após o input
        $receiverNameInput.parent().append($link);
      }
    } catch (err) {
      console.error(`Erro ao verificar campo destinatário: ${err}`);
    }
  }
  
  alertNumberOrReciver() {
    try {
      const $postalCodeForm = $('.vtex-omnishipping-1-x-addressFormPart1')
      const $alertaExistente = $postalCodeForm.find('.alerta-number-reciver')
      const $newAlert = $(
        '<span class="alerta-number-reciver" style="color: red;">Número e destinatário são obrigatórios*</span>'
      )

      const adressNumber = $('#ship-number').val()
      const receiverName = $('#ship-receiverName').val()

      if (adressNumber && receiverName) {
        if ($alertaExistente.length) {
          $alertaExistente.remove()
        }
      } else {
        if (!$alertaExistente.length) {
          $postalCodeForm.append($newAlert)
        }
      }
    } catch (error) {
      console.error(
        `Ocorreu um erro ao adicionar mensagem de alerta: ${error}`
      )
    }
  }

  autoTriggerSlasResult() {
    try {
      const $postalCodeInput = $('.full-cart.active #ship-postalCode:visible')
      const slasResultAlreadyActive = $('.full-cart.active .srp-delivery-info:visible').length > 1

      if (slasResultAlreadyActive || !$postalCodeInput.length) {
        return
      }

      if ($.trim($postalCodeInput.val().length) >= 9) {
        setTimeout(() => $('#cart-shipping-calculate').click(), 10)
      }
    } catch (err) {
      console.error(`Ocorreu um erro ao validar CEP: ${err}`)
    }
  }

  addInvalidSelectedDateMessage() {
    const _this = this
    const MAX_ATTEMPTS = 200
    let attempts = 0

    // Reset interval timer
    if (window.scheduledDeliveryInterval) {
      clearInterval(window.scheduledDeliveryInterval)
    }

    try {
      window.scheduledDeliveryInterval = setInterval(() => {
        attempts++

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(window.scheduledDeliveryInterval)
          return
        }

        const $scheduleActive = $('.vtex-omnishipping-1-x-scheduleActive')
        const hasSelectedDate = $('#scheduled-delivery-Agendada').length > 0
        const scheduleActive = $scheduleActive.length > 0

        window.scheduleActive = scheduleActive
        window.hasSelectedDate = hasSelectedDate

        if (!hasSelectedDate) {
          $scheduleActive.addClass('required')
        } else {
          $scheduleActive.removeClass('required')
          clearInterval(window.scheduledDeliveryInterval)
        }

        if (!scheduleActive) {
          if (!$('.vtex-omnishipping-1-x-leanShippingOptionActive').length) {
            $('.shp-lean-option').first().trigger('click')
            clearInterval(window.scheduledDeliveryInterval)
          }
        }

        _this.toggleGoToPaymentDisabled()
      }, 10)
    } catch (err) {
      console.error(`Não foi possível adicionar mensagem de data agendamento obrigatória. ${err}`)
      clearInterval(window.scheduledDeliveryInterval)
    }
  }

  bindEvents() {
    const _this = this

    $(document).on(
      'input',
      '#shipping-data input#ship-postalCode',
      function () {
        if (!$(this).val().length < 9) {
          _this.resetValidation()
        }
      }
    )

    $(document).on(
      'input',
      '#shipping-data p.input.required input, #pickup-receiver:visible, input#optin-dimensions',
      function () {
        _this.toggleGoToPaymentDisabled()
      }
    )

    $(document).on('input', '#ship-receiverName', function () {
      try {
        _this.checkReceiverName(window.vtexjs.checkout.orderForm)
      } catch (err) {
        console.error(`Erro ao verificar campo destinatário: ${err}`)
      }
    })

    $(document).on('click', '#btn-go-to-payment', OptInDimensions.handleSetCustomData)

    $('body').on(
      'input',
      'input#ship-street, input#ship-complement, input#ship-neighborhood, input#ship-reference',
      function () {
        const regexp = /[^A-Za-z0-9\s]+$/

        if ($(this).val().match(regexp)) {
          $(this).val($(this).val().replace(regexp, ''))
        }
      }
    )

    $(document).on('click',
      '.vtex-omnishipping-1-x-toggle, .react-datepicker__day:not(.react-datepicker__day--disabled)',
      function () {
        _this.addInvalidSelectedDateMessage()
      }
    )
  }

  async removeIfHasntPrice() {
    const _this = this
    const hasInvalidPrice = vtexjs.checkout.orderForm.items.some(item => item.price === 0);
    const itemsOrderForm = vtexjs.checkout.orderForm.items
    const salesChannelValidate = vtexjs.checkout.orderForm.salesChannel;
    const hasMarketingTagEndless = vtexjs.checkout.orderForm.marketingData?.marketingTags?.find(item => item === "endlessaisle")
    const salesChannelShop = ["1","5","11","12","60","93"].includes(salesChannelValidate)
    const salesChannelFidelidade = ["1","5","11","70","72","78","48","50","2","44","54","3","18","27","30","31","43","59","61","69"].includes(salesChannelValidate)


    if (salesChannelValidate === "56" && hasInvalidPrice) {
      vtexjs.checkout.removeAllItems();
    }
    if(window.vtex.accountName === "samsungbrshop" && !hasMarketingTagEndless){
      if (!salesChannelShop && itemsOrderForm.length > 0) {
        const orderFormIdClient = vtexjs.checkout.orderForm.orderFormId
        let urlClientFlow = document.referrer
        const referrerUrl = sessionStorage.getItem('UrlReferrer')

        if(referrerUrl){
          urlClientFlow = referrerUrl
          sessionStorage.removeItem('UrlReferrer')
        }

        vtexjs.checkout.removeAllItems();

        const responseLogs = await fetch(`${_this.rootPath()}/_v/post/logsCheckoutItemsRemove`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            urlClientFlow,
            orderFormIdClient,
            salesChannelClient: salesChannelValidate,
          })
        })

        await responseLogs.json()
      }
    }
    if(window.vtex.accountName === "samsungbrshopfidelidade"){
      if (!salesChannelFidelidade) {
        vtexjs.checkout.removeAllItems();
      }
    }
  }
}
