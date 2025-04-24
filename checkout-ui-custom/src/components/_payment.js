import { getMaxInstallmentByPaymentSystem } from "./_utils"

export default class Payment {
  static shouldUpdate = false

  constructor() {
    this.paymentGroups = []
  }

  loading(state = false) {
    const $context = $('.payment-group-list-btn')

    if (state === true) {
      return $context.removeClass('has-btn-installments')
    } else {
      return $context.addClass('has-btn-installments')
    }
  }

  async getPaymentGroups(orderForm) {
    try {
      if (this.paymentGroups.length) {
        return
      }

      this.loading(true)

      const allPaymentSystems = orderForm?.paymentData?.paymentSystems ?? []

      const uniquePaymentGroups = [...new Map(
        allPaymentSystems.map((item) => [item["groupName"], item])
      ).values()]

      const paymentGroups = await Promise.all(
        uniquePaymentGroups.map(async (paymentGroup) => {
          const stringId = paymentGroup.stringId
          const maxInstallment = await getMaxInstallmentByPaymentSystem(stringId)

          return {
            ...paymentGroup,
            maxInstallment
          }
        })
      )

      return paymentGroups
    } catch (error) {
      console.error(`Error in getPaymentGroups: ${error}`)
    }
  }

  installmentTemplate({ groupName, maxInstallment }) {
    const { count, total } = maxInstallment ?? {}
    let text = ''

    if (count > 1) {
      text = `Parcele em até ${count}x sem juros`
    } else if (count <= 1 && groupName === 'instantPaymentPaymentGroup') {
      const hasDicount = this.paymentGroups.some(paymentGroup => (
        paymentGroup?.maxInstallment?.total > total
      ))

      text = hasDicount
        ? `Desconto no pagamento à vista`
        : `Pagamento à vista`
    } else {
      text = 'Consulte as condições'
    }

    return `
      <span class="payment-group-installments">
        ${text}
      </span>
    `
  }

  updateInstallmentsInPaymentGroups(event, request) {
    try {
      const isUpdateItemRequest = request.url.includes('/items/update/')
  
      if (isUpdateItemRequest) {
        Payment.shouldUpdate = true
      }
    } catch (error) {
      console.error(`Error in updateInstallmentsInPaymentGroups: ${error}`);
    }
  }

  async addInstallmentsInPaymentGroups(orderForm) {
    try {
      const _this = this

      const paymentGroups = !this.paymentGroups.length || Payment.shouldUpdate
        ? (await this.getPaymentGroups(orderForm))
        : this.paymentGroups

      this.loading(false)

      this.paymentGroups = paymentGroups ?? []
      Payment.shouldUpdate = false

      this.paymentGroups.forEach(paymentGroup => {
        const { groupName, maxInstallment } = paymentGroup ?? {}

        const $context = $(`#payment-group-${groupName}`)
        const $paymentGroupText = $context.find('.payment-group-item-text')
        const $isWrapped = $paymentGroupText.closest('.payment-group-information').length

        if ($isWrapped) {
          return
        }

        const installmentTemplate = _this.installmentTemplate({ 
          groupName, 
          maxInstallment 
        })

        $paymentGroupText
          .wrap('<div class="payment-group-information" />')
          .parent()
          .append(installmentTemplate)
      })
    } catch (err) {
      console.error(`Error in addInstallmentsInPaymentGroups: ${err}`);
      this.loading(false)
    }
  }

  sync(orderForm) {
    try {
      this.addInstallmentsInPaymentGroups(orderForm)
    } catch (err) {
      console.error(`Error in class Payment: ${err}`);
      this.loading(false)
    }
  }
}
