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

  setPendingPaymentInLocalStorage() {
    localStorage.setItem('pendingPayment', JSON.stringify({
      timestamp: Date.now()
    }))
  }

  sync(orderForm) {
    try {
      this.addInstallmentsInPaymentGroups(orderForm)
    } catch (err) {
      console.error(`Error in class Payment: ${err}`);
      this.loading(false)
    }
  }

  setPixAsDefaultPaymentMethod() {
    vtexjs.checkout.getOrderForm().done(function (orderForm) {
      try {

        const account = window?.__RUNTIME__?.account

        const accountPaymentMap = {
          samsungbrshopeppnubank: 178,
          default: 125,
        }
        
        const paymentSystem = accountPaymentMap[account] || accountPaymentMap.default

        const pixInstalments = orderForm.paymentData.installmentOptions.filter(
          payment => payment.paymentSystem === String(paymentSystem)
        )

        if (!pixInstalments.length) return

        const data = {
          payments: [
            {
              paymentSystem: paymentSystem,
              installments: 1,
              referenceValue: pixInstalments[0].value,
            },
          ],
        }

        vtexjs.checkout.sendAttachment('paymentData', data)
      } catch (err) {
        console.error(`Erro ao exibir preço à vista para items no carrinho.`)
      }
    })
  }

  orderPaymentMethodScroll(paymentMethod) {
    let headerHeight = $(".main-header").outerHeight() || 0;
  
    requestAnimationFrame(() => {
      const offsetTop = paymentMethod.offset().top;
  
      $("html, body").animate({
        scrollTop: offsetTop - (headerHeight + 65)
      }, 500);
    });
  }

  orderPaymentMethod() {
		let lastIndex = null;

		const observer = new MutationObserver((mutations, obs) => {
			if ($('.payment-group-item').length > 0 && $('.payment-method').length > 0) {
				obs.disconnect();

				const _this = this;

				$('.payment-group-item').each(function (index) {
					let paymentMethod = $('.payment-method').eq(index);
					$(this).after(paymentMethod);
					paymentMethod.addClass(`payment-method-order-${index + 1}`);
          _this.movePaymentConfirmationWrap()
				});

				$('.payment-group-item').on('click', function () {
					let index = $('.payment-group-item').index(this);
					let paymentMethod = $('.payment-method').eq(index);

					if (lastIndex === index) {
						paymentMethod.slideToggle();
						lastIndex = paymentMethod.is(':visible') ? index : null;
					} else {
						paymentMethod.slideDown(() => {
              _this.movePaymentConfirmationWrap();
            });
						lastIndex = index;
					}

          if (window.innerWidth < 769) _this.orderPaymentMethodScroll(paymentMethod);
					
				});
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}

  movePaymentConfirmationWrap() {

    const confirmation = document.querySelector('.payment-confirmation-wrap')
    if (!confirmation) {
      location.reload()
      return
    }
  
    const paymentMethods = Array.from(document.querySelectorAll('[class^="payment-method payment-method-order-"]'))

    const openedMethod = paymentMethods.find(method => {
      const style = window.getComputedStyle(method)
      return style.display !== 'none' && style.visibility !== 'hidden' && method.offsetHeight > 0
    })
  
    if (openedMethod && !openedMethod.contains(confirmation)) {
      openedMethod.appendChild(confirmation)
    }
    if (window.innerWidth > 769) this.adjustPaymentDataMargin()
    
  }

  adjustPaymentDataMargin() {
    const summary = document.querySelector('.cart-template.mini-cart.span4')
    const paymentData = document.querySelector('#payment-data')
  
    if (!summary || !paymentData) return
  
    const summaryHeight = summary.offsetHeight
    paymentData.style.marginTop = `${summaryHeight + 34}px`
  }
}
