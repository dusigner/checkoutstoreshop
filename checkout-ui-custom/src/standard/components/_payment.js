import { getMaxInstallmentByPaymentSystem } from "./_utils"
import { hasSelectedPaymentMethod } from "./utils/_hasSelectedPaymentMethod"

export default class Payment {
  static shouldUpdate = false

  constructor() {
    this.paymentGroups = []
    this.nubank = {
      maxInstallments: 12,
      bins: ['550209', '516292', '520048', '512626', '516230', '522688'],
    }
  }

  loading(state = false) {
    $('.payment-group-list-btn')
      .toggleClass('has-btn-installments', !state)
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

  setPendingPaymentInLocalStorage() {
    localStorage.setItem('pendingPayment', JSON.stringify({
      timestamp: Date.now()
    }))
  }

  setNubankIFrameInstallments(orderForm) {
    try {
      const NubankPaymentGroup = 
        window?.paymentData?.paymentGroups?.NubankPaymentGroup

      if (!NubankPaymentGroup) {
        return
      }

      const creditCardPaymentGroup = 
        window?.paymentData?.paymentGroups?.creditCardPaymentGroup

      const { payments = [], installmentOptions = [] } = orderForm?.paymentData ?? {}

      for (const payment of payments) {
        const bin = payment?.bin?.substr(0, 6)

        if (!this.nubank.bins.includes(bin)) {
          continue
        }

        for (const installmentOption of installmentOptions) {
          if (
            payment.paymentSystem == installmentOption.paymentSystem &&
            payment.bin === installmentOption.bin &&
            payment.value == installmentOption.value
          ) {
            installmentOption.installments = installmentOption.installments?.filter(
              (_, index) => index + 1 <= this.nubank.maxInstallments
            )

            creditCardPaymentGroup?.iFrameSendInstallmentsPreview?.(installmentOption)
          }
        }
      }
      
    } catch (error) {
      console.error('error ~ setNubankIFrameInstallments: ', error);
    }
  }

  getNubankWarningTemplate() {
    return `
      <div class="nubankWarningTemplate" style="display: none;">
        <p>
          Para cartões Nubank com parcelamento a partir de <strong>${this.nubank.maxInstallments + 1}x</strong>, 
          selecione o método de pagamento <strong>"Nubank"</strong>. Consulte condições.
        </p>
      </div>
    `
  }

  setNubankWarningMessage(orderForm) {
    try {
      const NubankPaymentGroup = 
        window?.paymentData?.paymentGroups?.NubankPaymentGroup

      if (!NubankPaymentGroup) {
        return
      }

      const $iframeContext = $('#iframe-placeholder-creditCardPaymentGroup')

      const { paymentData } = orderForm ?? {}
      const { payments = [] } = paymentData ?? {}

      const isNubankCreditCard = payments.some(payment => (
        this.nubank.bins.includes(payment.bin?.substr(0, 6))
      ))

      const $hasNubankWarningTemplate = $iframeContext
        .toggleClass('nubankCreditCard', isNubankCreditCard)
        .find('.nubankWarningTemplate').length > 0

      if (isNubankCreditCard && !$hasNubankWarningTemplate) {
        $iframeContext.prepend(
          this.getNubankWarningTemplate()
        )
      }
    } catch (error) {
      console.error('error ~ setNubankWarningMessage: ', error);
    }
  }

  sync(orderForm) {
    try {
      this.addInstallmentsInPaymentGroups(orderForm)
      this.setNubankWarningMessage(orderForm)
      this.setNubankIFrameInstallments(orderForm)
    } catch (err) {
      console.error(`Error in class Payment: ${err}`);
      this.loading(false)
    }
  }

  /**
   * @returns {void}
   */
  setPixAsDefaultPaymentMethod() {
    const account = window?.__RUNTIME__.account
    const defaultPaymentSystemByAccount = {
      samsungbrshopeppnubank: 178, 
      default: 125, // pix 
    }
    const paymentSystemId = defaultPaymentSystemByAccount[account] || defaultPaymentSystemByAccount.default
    const availableInstallments = vtexjs.checkout.orderForm.paymentData.installmentOptions.filter(
      payment => payment.paymentSystem === String(paymentSystemId)
    )

    if (!availableInstallments.length || hasSelectedPaymentMethod()) return

    const paymentAttachment = {
      payments: [
        {
          paymentSystem: paymentSystemId,
          installments: 1,
          referenceValue: availableInstallments[0].value,
        },
      ],
    }

    vtexjs.checkout.sendAttachment('paymentData', paymentAttachment)
  }

  orderPaymentMethodScroll(paymentMethod) {
    let headerHeight = $("#header-standard .main-header").outerHeight() || 0;
  
    requestAnimationFrame(() => {
      const offsetTop = paymentMethod.offset().top;
  
      $("html, body").animate({
        scrollTop: offsetTop - (headerHeight + 65)
      }, 500);
    });
  }

  orderPaymentMethod() {
		if (window.innerWidth > 769) return;

		let lastIndex = null;

		const observer = new MutationObserver((mutations, obs) => {
			if ($('.payment-group-item').length > 0 && $('.payment-method').length > 0) {
				obs.disconnect();

				const _this = this;

				$('.payment-group-item').each(function (index) {
					let paymentMethod = $('.payment-method').eq(index);
					$(this).after(paymentMethod);
					paymentMethod.addClass(`payment-method-order-${index + 1}`);
				});

				$('.payment-group-item').on('click', function () {
					let index = $('.payment-group-item').index(this);
					let paymentMethod = $('.payment-method').eq(index);

					if (lastIndex === index) {
						paymentMethod.slideToggle();
						lastIndex = paymentMethod.is(':visible') ? index : null;
					} else {
						paymentMethod.slideDown();
						lastIndex = index;
					}
					_this.orderPaymentMethodScroll(paymentMethod);
				});
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}
}
