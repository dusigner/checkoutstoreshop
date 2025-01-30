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
      $('#toggleButtonContainer').remove()

      $('#btn-client-pre-email').after(`
      <div id="toggleButtonContainer" class="samsung-toggle-button-container">

        <p class="samsung-visitante-title">Acessar como visitante</p>

        <button class="samsung-button-login data-omni-signin" data-omni="login_try:guest" id="toggleButtonLogin" type="button">Informe seu e-mail</button>

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
                class="data-omni-signin"
                data-omni="login_try:samsung account"
                id="btn-samsung-account"
                type="button"
              >
              Entrar
              </button>
            </div>
            <div style="margin-top: 20px">
              <img style="padding-right: 11px;" src="https://samsungbr.vteximg.com.br/arquivos/logo-rewards.png?v=1" />
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

  bindEvents() {
    const _this = this

    $(document).on('click', '#btn-samsung-account', function () {
      const returnUrl = encodeURIComponent(window?.location?.pathname);
      const currentUrl = window?.location?.href;
      let newUrl;
      const oAuthRedirect = `/login?oAuthRedirect=Samsung&returnUrl=${returnUrl}`
      newUrl = currentUrl.replace(/\/checkout.*/, oAuthRedirect);
      window.location.href = newUrl;
  });

    $(document).on('click', '#toggleButtonLogin', function () {
      $('.samsung-toggle-button-container').hide()
    })
  }
}
