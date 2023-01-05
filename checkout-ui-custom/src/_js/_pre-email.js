/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

export default class CustomPreEmail {
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
                  <img src="https://samsungbr.vteximg.com.br/arquivos/logo-ssg-account.svg?v=1"/>
                </button>
              </div>
              <div style="margin-top: 30px">
                <img style="padding-right: 11px; border-right: 1px solid #cbcbcb" src="https://samsungbr.vteximg.com.br/arquivos/logo-rewards.png?v=1" />
                <img style="margin-left: 10px" src="https://samsungbr.vteximg.com.br/arquivos/logo-frete.png?v=1" />
              </div>
              <div class="samsung-account-label" style="font-size:14px; font-family:'SamsungOne'; margin-top: 30px; justify-content: center; display: flex;">
                <p style="max-width: 326px">
                  Suas compras podem valer pontos para utilização como desconto na loja Samsung. Participe agora para garantir sua pontuação.
                </p>
              </div>
            </div>
        `)
    }
  }

  openSamsungAccountModal() {
    window.vtexid.start()

    const checkCustomButtonInterval = setInterval(function() {
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

    $(document).on('click', '#btn-samsung-account', function() {
      _this.openSamsungAccountModal()
    })
  }
}
