import { ENVIRONMENTS, getEnv } from './_utils'

export default class VerifyAUthentication {

    init() {
        try {
            const isPayment = window.location.hash === '#/payment'

            if (!isPayment) return
            const env = getEnv()

            if (ENVIRONMENTS.NUBANK === env) {
                this.showVerifyButton()
            }
        } catch (e) {
            console.error('UserLimit error', e)
        }
    }

    showUserNotLogged() {
        if (!$('#verifyAuthenticationModal').length) {
            $('#checkoutMainContainer').prepend(`
                <div id="verifyAuthenticationModal" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                        <p class="title-purchase">Você não está autenticado, para prosseguir faça login no site e finalize sua compra.</p>
                        <div class="boxButton">
                            <button type="button" id="hide-modal" class="login">
                            Faça o login para continuar
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div class="backdrop-purchase-limit-modal"></div>
                </div>
            `)

            $(document).on('click', '#hide-modal.login', () => {
                window.location.href = '/login'
                $('#verifyAuthenticationModal').remove()
            })
        }
    }

    rootPath() {
        return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
    }

    async checkUserAuthentication() {
        const account = getEnv()
        const isAuthenticated = window.vtexjs?.checkout?.orderForm?.loggedIn

        if (isAuthenticated) {
            $('.verify-submit').remove()
            $('.payment-submit-wrap').show()
            $('.payment-submit-wrap #payment-data-submit:last-child').trigger('click')

            return
        }

        if (account === ENVIRONMENTS.NUBANK) {
            $('.verify-submit span').show()
            $('.verify-submit .icon-spinner').hide()
            this.showUserNotLogged()
        }

    }

    showVerifyButton() {
        $('.payment-submit-wrap').hide()

        if (!$('.verify-submit').length) {
            $('.payment-submit-wrap').before(`
				 <button id="payment-data-submit" class="verify-submit submit btn btn-success btn-large btn-block" style="width: 100%; position: relative;">
					 <i class="icon-lock"></i>
					 <span>Finalizar Compra</span>
                     <i class="icon-spinner icon-spin" style="display:none"></i>
				 </button>
			`)

            $(document).on('click', '.verify-submit', () => {
                $('.verify-submit span').hide()
                $('.verify-submit .icon-spinner').show()
                this.checkUserAuthentication()
            })
        }
    }
}