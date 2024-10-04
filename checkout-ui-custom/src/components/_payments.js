import axios from 'axios'

export async function showAutomationPayment() {
  const paymentElement = $('#payment-group-bankInvoicePaymentGroup')

  let isAutomationUser = null

  try {
    const { data } = await axios.post(`/_v/private/verifyAutomationLogin`, {
      headers: { accept: 'application/json' },
    })

    isAutomationUser = data.isValid
  } catch (error) {
    console.error(`Error when getting session: ${error}`)
  }

  if (!isAutomationUser) {
    paymentElement.remove()

    return
  }

  paymentElement.attr('style', 'display: block !important;')
}
