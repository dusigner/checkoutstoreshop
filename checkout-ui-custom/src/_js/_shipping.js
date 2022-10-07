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

      if (
        $postalCodeField.find('small').length &&
        !$('.invalid-postal-code-msg').length
      ) {
        $postalCodeField.find('small').before($invalidPostalCodeMessage)
      }

      if (!$('.invalid-postal-code-msg').length) {
        $('.srp-delivery-header').append($invalidPostalCodeMessage)
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

  validadePostalCode(orderForm) {
    if (!orderForm) return

    try {
      if (!orderForm.shippingData) return

      if (!orderForm.shippingData.address) return

      const _this = this

      const { address } = orderForm.shippingData

      if (address.postalCode && !address.city) {
        this.setInvalidPostalCode()

        const interval = setInterval(function () {
          if (!$('.invalid-postal-code-msg').length) {
            _this.addInvalidPostalCodeMessage()
            clearInterval(interval)
          }
        }, 50)
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
      'input',
      '#shipping-data p.input.required input',
      function () {
        _this.toggleGoToPaymentDisabled()
      }
    )
  }
}

module.exports = CustomShippingData
