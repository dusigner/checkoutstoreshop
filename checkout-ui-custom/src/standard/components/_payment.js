import { hasSelectedPaymentMethod } from "./utils/_hasSelectedPaymentMethod"

export default class Payment {
  static shouldUpdate = false

  constructor() {
    this.paymentGroups = []
    this.nubank = {
      maxInstallments: 17,
      bins: ['550209', '516292', '520048', '512626', '516230', '522688', '516220'],
    }
  }

  loading(state = false) {
    $('.payment-group-list-btn')
      .toggleClass('has-btn-installments', !state)
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
    } else if (groupName === 'NubankPaymentGroup') {
      text = `Parcele em até 18x Sem Juros.`
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
          Para cartões Nubank com parcelamento até <strong>${this.nubank.maxInstallments + 1}x</strong> Sem Juros, 
          selecione o método de pagamento <strong>"Nubank"</strong>.
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

  clearInputsChangeMethod() {

    const PAYMENT_IFRAMES = {
      'creditCardPaymentGroup': 'iframe-placeholder-creditCardPaymentGroup',
      'customPrivate_501PaymentGroup': 'iframe-placeholder-customPrivate_501PaymentGroup',
    };

    function reloadIframe(wrapperId) {
      const $iframe = $(`#${wrapperId} iframe`);
      if ($iframe.length === 0) {
        return;
      }

      const src = $iframe.attr('src');
      const newSrc = src.replace(
        /(&?_cleartime=\d+)?$/,
        (src.includes('?') ? '&' : '?') + '_cleartime=' + Date.now()
      );
      $iframe.attr('src', newSrc);
    }

    $(document).on('click', '.payment-group-item', function () {
      const id = $(this).attr('id');
      const groupKey = id?.replace('payment-group-', '');

      const wrapperId = PAYMENT_IFRAMES[groupKey];
      if (wrapperId) {
        setTimeout(() => reloadIframe(wrapperId), 100);
      }
    });
  }
}
