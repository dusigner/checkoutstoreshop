/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

class CustomPreEmail {
  createElementSamsungAccountLogin() {
    $('#client-pre-email').attr('placeholder', 'Ex:.exemplo@mail.com')

    if (
      $('.samsung-account-container').length === 0 &&
      $('.client-pre-email-h').length > 0
    ) {
      $('.client-pre-email-h').after(`
            <div class="samsung-account-container">
              <div class="samsung-account-image">
                <button 
                  id="btn-samsung-account"
                  type="submit"
                  style="background: black; border-radius: 20px; border: none; padding-inline: 60px; padding-block: 11px;"
                >
                  <img src="https://samsungbr.vteximg.com.br/arquivos/logo-ssg-account.svg"/>
                </button>
              </div>
              <div class="samsung-account-label" style="font-size:14px; font-family:'SamsungOne'; margin-top: 30px;">Ou informe seu e-mail:</div>
            </div>
        `)
    }
  }

  openSamsungAccountModal() {
    window.vtexid.start()

    const checkCustomButtonInterval = setInterval(function () {
      if ($('#vtexIdUI-custom-oauth').length) {
        clearInterval(checkCustomButtonInterval)

        $('#vtexIdContainer, #vtexIdUI-global-loader').hide()
        $('#vtexIdUI-custom-oauth').trigger('click')
      }

      // test environment
      if (window.location.href.includes('samsungbrtest')) {
        if ($('#vtexIdUI-').length) {
          clearInterval(checkCustomButtonInterval)

          $('#vtexIdContainer, #vtexIdUI-global-loader').hide()
          $('#vtexIdUI-').trigger('click')
        }
      }
    }, 100)
  }

  bindEvents() {
    const _this = this

    $(document).on('click', '#btn-samsung-account', function () {
      _this.openSamsungAccountModal()
    })
  }
}

module.exports = CustomPreEmail
