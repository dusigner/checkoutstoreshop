export function customHeader(hash) {
  function _conditionalHeader() {
    try {
      // steps(hash)
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
        console.log('show header', hash)
        _stepElem.css('display', 'block')
        _gotoCartElem.css('display', 'flex')
        _gotoCartElem.css('margin-top', '110px')
      } else {
        _stepElem.css('display', 'none')
        _gotoCartElem.css('display', 'none')
        _headerElem.css('box-shadow', 'none')
      }

      $(window).scroll(function() {
        const scroll = $(window).scrollTop()

        if (scroll > 0) {
          $('header').css('box-shadow', '0px 1px 3px #00000033')
        } else {
          $('header').css('box-shadow', '0px 0px 0px #FFFFFF')
        }
      })

    }
  }

  function _fixLinkSteps() {
    const currentUrl = window.location.href
    const newUrlProfile = 'br/checkout/#/profile'
    const newUrlShipping = 'br/checkout/#/shipping'

    if (currentUrl.indexOf("/br") !== -1) {
      $('.v-custom-step-profile').attr('data-url', newUrlProfile);
      $('.v-custom-step-shipping').attr('data-url', newUrlShipping);
      console.log("A URL contém '/br'");
    }
  }

  function _fixBackToCartLink() {
    $('#go-to-cart-button-custom a[href="#/cart"]').each(function (_, el) {
      $(el).attr('href', window.checkout.cartURL())
    })
  }
  
  _conditionalHeader()
  _fixBackToCartLink()
  _fixLinkSteps()
}
