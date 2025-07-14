import { CheckoutCustom } from './clients/checkout.ui'

window.vcustom = {
  checkout: new CheckoutCustom({
    type: 'vertical', // ["vertical" , "horizontal"]
    accordionPayments: false,
    deliveryDateFormat: true,
    quantityPriceCart: true,
    showNoteField: false,
    customAddressForm: false,
    hideEmailStep: false,
  }),
}

window.vcustom.checkout.start()
