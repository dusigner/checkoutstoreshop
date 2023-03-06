/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

export default class CustomPreEmail {
  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }
  createElementSamsungAccountLogin() {
    $('#client-pre-email').attr('placeholder', 'Ex:.exemplo@mail.com')

    if (
      $('.samsung-account-container').length === 0 &&
      $('.client-pre-email-h').length > 0
    ) {

      $("#toggleButtonContainer").remove()

      $("#btn-client-pre-email").after(`
      <div id="toggleButtonContainer" class="samsung-toggle-button-container">

        <p class="samsung-visitante-title">Entrar como visitante:</p>

        <button class="samsung-button-login" id="toggleButtonLogin" type="button">Informe seu e-mail</button>

        <p class="samsung-message-rewards">Ao entrar como visitante não será possível pontuar no programa Samsung Rewards</p>
      </div>
    `)

      $('.client-pre-email-h').after(`
          <div class="samsung-account-container">
            <img
              style="margin-bottom: 15px"
              src="https://samsungbr.vteximg.com.br/arquivos/logo-ssg-account-black.svg"
            />
            <div class="samsung-account-image">
            <div class="samsung-account-label" style="font-size:12px; font-family:'SamsungOne'; margin-top: 20px; justify-content: center; display: flex;">
            <p style="max-width: 326px">
              Suas compras podem valer pontos para utilização como desconto na loja Samsung. Participe agora para garantir sua pontuação.
            </p>
          </div>
              <button
                id="btn-samsung-account"
                type="submit"
              >
              Entrar
              </button>
            </div>
            <div style="margin-top: 20px">
              <img style="padding-right: 11px; border-right: 1px solid #cbcbcb" src="https://samsungbr.vteximg.com.br/arquivos/logo-rewards.png?v=1" />
              <img style="margin-left: 10px" src="https://samsungbr.vteximg.com.br/arquivos/logo-frete.png?v=1" />
            </div>
            <div class="samsung-account-create" style="margin-top: 10px; font-size:12px; font-family:'SamsungOne'; justify-content: center; display: flex;">
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
      if ($('#vtexIdUI-').length) {
        clearInterval(checkCustomButtonInterval)

        $('#vtexIdContainer, #vtexIdUI-global-loader').hide()
        $('#vtexIdUI-').trigger('click')
      }
    }, 100)
  }

  
  loginEmail () {
    const _this = this
    $(document).on('keyup', '#client-pre-email, #client-email', async function (e) { 
        var email = $('#client-pre-email').val();
        var domain = email.split('@')
        domain = domain[1];
        if((domain !== undefined) || domain !== null) {
          setTimeout(function(){
            fetch(
                `${_this.rootPath()}/api/dataentities/DM/search?_where=domain=${domain}&ativo=1&_fields=domain`, {
                    type: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            ).then(response => {
              response.json().then(data => {  
                if($('.wrongdomain').length == 0){
                  $(`<span class="wrongdomain">O domínio <strong>${data[0].domain}</strong> está correto?</span>`).insertBefore($('#btn-client-pre-email'))
                  $(`<span class="wrongdomain">O domínio <strong>${data[0].domain}</strong> está correto?</span>`).appendTo($('body.v-custom-step-profile .client-email'))
                  setTimeout(function(){
                    $('.wrongdomain').remove()
                  }, 5000)
                }
              })
            })
          }, 1000)
        }
    });
  }

  bindEvents() {
    const _this = this
    _this.loginEmail()
    $(document).on('click', '#btn-samsung-account', function () {
      _this.openSamsungAccountModal()
    })

    $(document).on('click', '#toggleButtonLogin', function () {
      $('.samsung-toggle-button-container').hide();
    })
  }
}
