/* eslint-disable prettier/prettier */
export function getPaymentMethod() {
  const paymentMethodSelected = document.querySelector(
    '.payment-group-item.active'
  )

  let paymentMethod = 'pix'

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-instantPaymentPaymentGroup'
  ) {
    paymentMethod = 'pix'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-bankInvoicePaymentGroup'
  ) {
    paymentMethod = 'bank slip'
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
    paymentMethod = 'Samsung itaucard'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-picPayPaymentGroup'
  ) {
    paymentMethod = 'picpay'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-SamsungPayPaymentGroup'
  ) {
    paymentMethod = 'Samsung pay'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-MercadoPagoProPaymentGroup'
  ) {
    paymentMethod = 'mercado pago'
  }

  if (
    paymentMethodSelected &&
    paymentMethodSelected.id === 'payment-group-NubankPaymentGroup'
  ) {
    paymentMethod = 'NuPay'
  }

  return {
    paymentMethod,
  }
}
