import axios from 'axios'
import { rootPath } from './_utils'

export async function showAutomationPayment() {
  const paymentElement = $('#payment-group-bankInvoicePaymentGroup')

  if(!paymentElement.length) {
    return
  }

  let isAutomationUser = null

  try {
    const { data } = await axios.post(`${rootPath()}/_v/private/verifyAutomationLogin?email=${vtexjs.checkout.orderForm.clientProfileData.email}`, {
      headers: { accept: 'application/json' },
    })

    isAutomationUser = data.isValid
  } catch (error) {
    console.error(`Error when getting session: ${error}`)
  }

  if (!isAutomationUser) {
    paymentElement.attr('style', 'display: none !important;')

    return
  }

  paymentElement.attr('style', 'display: block !important;')
}
