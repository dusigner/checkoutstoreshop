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
            <img
              style="margin-bottom: 15px"
              src="https://samsungbr.vteximg.com.br/arquivos/logo-ssg-account-black.svg"
            />
            <div class="samsung-account-image">
              <button
                id="btn-samsung-account"
                type="submit"
              >
                Login
              </button>
            </div>
            <div style="margin-top: 20px">
              <img style="padding-right: 11px; border-right: 1px solid #cbcbcb" src="https://samsungbr.vteximg.com.br/arquivos/logo-rewards.png?v=1" />
              <img style="margin-left: 10px" src="https://samsungbr.vteximg.com.br/arquivos/logo-frete.png?v=1" />
            </div>
            <div class="samsung-account-label" style="font-size:12px; font-family:'SamsungOne'; margin-top: 20px; justify-content: center; display: flex;">
              <p style="max-width: 326px">
                Suas compras podem valer pontos para utilização como desconto na loja Samsung. Participe agora para garantir sua pontuação.
              </p>
            </div>
            <div class="samsung-account-create" style="font-size:12px; font-family:'SamsungOne'; justify-content: center; display: flex;">
              <p style="max-width: 326px">
                Não tem uma Samsung Account?
                <a href="https://account.samsung.com/membership" target="_blank" style="color: black; text-decoration: underline">Registre-se agora</a>.
              </p>
            </div>
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
