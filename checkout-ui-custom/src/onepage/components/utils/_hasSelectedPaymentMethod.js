/**
 * @returns {boolean} 
 */
export function hasSelectedPaymentMethod() {
  const selectedPayment = window.vtexjs.checkout.orderForm.paymentData?.payments?.find(
    payment => typeof payment.paymentSystem === 'string'
  )
  return Boolean(selectedPayment) 
}