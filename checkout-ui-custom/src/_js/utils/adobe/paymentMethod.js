export function getPaymentMethod() {
  const paymentMethodSelected = document.querySelector(
    '.payment-group-item.active'
  )

  let paymentMethod = 'boleto invoice'

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-bankInvoicePaymentGroup'
  ) {
    paymentMethod = 'boleto invoice'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-payPalPaymentGroup'
  ) {
    paymentMethod = 'paypal'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-debitCardPaymentGroup'
  ) {
    paymentMethod = 'debit card'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-MercadoPagoPaymentGroup'
  ) {
    paymentMethod = 'mercado pago'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-creditCardPaymentGroup'
  ) {
    paymentMethod = 'credit card'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-customPrivate_501PaymentGroup'
  ) {
    paymentMethod = 'porto'
  }

  return {
    paymentMethod,
  }
}
