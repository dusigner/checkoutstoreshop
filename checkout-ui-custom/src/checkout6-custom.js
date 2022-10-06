const Debug = require('./_js/_debug.js')
const CheckoutCustom = require('./_js/_v.custom.checkout.ui.js')

window.vcustom = {
  checkout: new CheckoutCustom({
    type: 'vertical', // ["vertical" , "horizontal"]
    accordionPayments: false,
    deliveryDateFormat: false,
    quantityPriceCart: true,
    showNoteField: false,
    customAddressForm: false,
    hideEmailStep: false,
  }),
  debug: new Debug({
    dbg: false,
    logo: '',
  }),
}

window.vcustom.checkout.start()

// vcustom.debug.start();
