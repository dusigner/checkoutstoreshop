/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

class CustomShippingData {
  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  addInvalidPostalCodeMessage() {
    try {
      const $postalCodeForm = $('.vtex-omnishipping-1-x-addressFormPart1')
      const $postalCodeField = $postalCodeForm.find('p.ship-postalCode')
      const $invalidPostalCodeMessage = $(
        '<div class="invalid-postal-code-msg"> <span class="invalid-postal-code-msg__label">CEP Inválido</span> <p class="invalid-postal-code-msg__message"> Infelizmente não oferecemos entrega para a sua região. Em caso de dúvidas, por favor <a class="invalid-postal-code-msg__link" href="https://static.zdassets.com/web_widget/latest/liveChat.html?v=10#key=ajudasamsungcajamar.zendesk.com" target="_blank">clique aqui</a>.</p> </div>'
      )

      if ($postalCodeField.find('small').length && !$('.invalid-postal-code-msg').length) {
        $postalCodeField.find('small').before($invalidPostalCodeMessage)
      }

      if (!$('.invalid-postal-code-msg').length) {
        $('.srp-delivery-header').append($invalidPostalCodeMessage)
        $('.shp-alert.vtex-shipping-preview-0-x-alert.shp-alert-shipping-unavailable.vtex-shipping-preview-0-x-alertPickup.w-100').hide()
        $('.srp-delivery-select-container.br2.bw1.relative.bg-white.ba.b--light-gray.hover-b--silver.h-100').hide()
      }
    } catch (err) {
      console.error(`Ocorreu um erro ao adicionar mensagem de CEP inválido: ${err}`)
    }
  }


  addInvalidInventoryCodeMessage() {
    try {
      const $postalCodeForm = $('.vtex-omnishipping-1-x-addressFormPart1')
      const $postalCodeField = $postalCodeForm.find('p.ship-postalCode')
      const $invalidPostalCodeMessage = $(
        '<div class="invalid-postal-inventory"><p class="invalid-postal-code-msg__message">Infelizmente o produto que você escolheu está sem estoque para a sua região. Em breve nosso estoque será reabastecido.</p></div>'
      )

      if ($postalCodeField.find('small').length && !$('.invalid-postal-inventory').length) {
        $postalCodeField.find('small').before($invalidPostalCodeMessage)
      }

      if (!$('.invalid-postal-inventory').length) {
        $('.srp-delivery-header').append($invalidPostalCodeMessage)
        $('.shp-alert.vtex-shipping-preview-0-x-alert.shp-alert-shipping-unavailable.vtex-shipping-preview-0-x-alertPickup.w-100').hide()
        $('.srp-delivery-select-container.br2.bw1.relative.bg-white.ba.b--light-gray.hover-b--silver.h-100').hide()
      }
    } catch (err) {
      console.error(`Ocorreu um erro ao adicionar mensagem de CEP inválido: ${err}`)
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
    try {
      const $postalCodeForm = $('.vtex-omnishipping-1-x-addressFormPart1')
      const $postalCodeField = $postalCodeForm.find('p.ship-postalCode')
      const $virtualInventoryMessage = $(
        `<div class="virtual-inventory-msg" style="max-width: 566px; margin-top: 16px;">
          <p class="invalid-postal-code-msg__message">
            O prazo de entrega está acima do normal devido à reposição de estoque.
          </p>
        </div>`
      )

      if ($postalCodeField.find('small').length && $postalCodeField.find('.virtual-inventory-msg').length === 0) {
        $postalCodeField.find('small').before($virtualInventoryMessage)
      }

      if ($('.srp-delivery-header').find('.virtual-inventory-msg').length === 0) {
        $('.srp-delivery-header').append($virtualInventoryMessage) 
      }
    } catch (err) {
      console.error(
        `Ocorreu um erro ao adicionar mensagem de prazo acima do normal: ${err}`
      )
    }
  }

  validateVirtualInventory(orderForm) {
    const _this = this

    try {
      if (!orderForm.shippingData) return
      if (!orderForm.shippingData.address) return
      const { logisticsInfo } = orderForm.shippingData
      logisticsInfo.filter(item => {
        if(logisticsInfo[0].slas.length > 0) {
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

      const { address } = orderForm.shippingData

      this.validateVirtualInventory(orderForm) 


      const interval = setInterval(function () {
        if(orderForm.messages && orderForm.messages[0] && orderForm.messages[0].text) {
          if(orderForm.messages[0].text.indexOf('CEP selecionado') > -1) {
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

      if (address.postalCode && !address.city) {
        this.setInvalidPostalCode()
      } else {
        // console.log('cep válido');
        this.setValidPostalCode()
        this.removeInvalidPostalCodeMessage()
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

  limitPostalCodeInput() {
    $('#shipping-data input#ship-postalCode').attr('maxlength', 9)
  }

  toggleGoToPaymentDisabled() {
    const disabled =
      $('#shipping-data p.input.required input').filter(function () {
        return $.trim($(this).val()).length === 0
      }).length === 0

    $('#btn-go-to-payment').prop('disabled', !disabled)
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
      'focus',
      '#shipping-data input#ship-postalCode',
      function () {
        _this.limitPostalCodeInput()
      }
    )

    $(document).on(
      'input',
      '#shipping-data p.input.required input',
      function () {
        _this.toggleGoToPaymentDisabled()
      }
    )
  }
}

module.exports = CustomShippingData