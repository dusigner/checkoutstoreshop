export default class CustomHeader {
  init() {
    this._conditionalHeader()
    this._backToCartLink()
  }

  _conditionalHeader() {
    try {
      steps(window.location.hash)
      /* eslint-disable-next-line no-restricted-globals */
      addEventListener('hashchange', event => {
        const { hash } = event.target.location

        steps(hash)
      })
    } catch (e) {
      console.error('conditionalHeader error', e)
    }

    function steps(hash) {
      const _stepElem = $(`.checkout-steps`)
      const _gotoCartElem = $(`#go-to-cart-button-custom`)
      const _headerElem = $(`.main-header`)

      const showHeader = ['#/payment', '#/shipping', '#/profile']

      if (showHeader.includes(hash)) {
        _stepElem.css('display', 'block')
        _gotoCartElem.css('display', 'flex')
        _headerElem.css('box-shadow', '0px 4px 10px #00000033')
      } else {
        _stepElem.css('display', 'none')
        _gotoCartElem.css('display', 'none')
        _headerElem.css('box-shadow', 'none')
      }
    }
  }

  _backToCartLink() {
    try {
      const _stepElem = $(`.checkout-steps`)
      const _containerElem = $(`.main-header .container`)

      if (_containerElem.find('#go-to-cart-button-custom').length > 0) {
        return
      }

      _stepElem.before(`
        <p id="go-to-cart-button-custom" class="link link-cart pull-right" data-bind="if: !window.router.sac.isActive()">
          <small>
            <a data-bind="attr: { href: window.checkout.cartURL() }" id="orderform-minicart-to-cart" target="_self" data-event="orderformToCart" data-i18n="global.backToCart" href="${window.checkout.cartURL()}">Voltar para o carrinho</a>
          </small>
        </p>
      `)
    } catch (e) {
      console.error('backToCart error', e)
    }
  }
}
