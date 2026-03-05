import { hasSelectedPaymentMethod } from "./utils/_hasSelectedPaymentMethod";

export default class Payment {
	static shouldUpdate = false;

	constructor() {
		this.paymentGroups = [];
		this.nubank = {
			maxInstallments: 12,
			bins: [
				"550209",
				"516292",
				"520048",
				"512626",
				"516230",
				"522688",
				"516220",
			],
		};
	}

	loading(state = false) {
		$(".payment-group-list-btn").toggleClass("has-btn-installments", !state);
	}

	installmentTemplate({ groupName, maxInstallment }) {
		const { count, total } = maxInstallment ?? {};
		let text = "";

		if (count > 1) {
			text = `Parcele em até ${count}x sem juros`;
		} else if (count <= 1 && groupName === "instantPaymentPaymentGroup") {
			const hasDicount = this.paymentGroups.some(
				(paymentGroup) => paymentGroup?.maxInstallment?.total > total,
			);

			text = hasDicount ? `Desconto no pagamento à vista` : `Pagamento à vista`;
		} else if (groupName === "NubankPaymentGroup") {
			text = `Parcele em até 18x Sem Juros.`;
		} else {
			text = "Consulte as condições";
		}

		return `
      <span class="payment-group-installments">
        ${text}
      </span>
    `;
	}

	updateInstallmentsInPaymentGroups(event, request) {
		try {
			const isUpdateItemRequest = request.url.includes("/items/update/");

			if (isUpdateItemRequest) {
				Payment.shouldUpdate = true;
			}
		} catch (error) {
			console.error(`Error in updateInstallmentsInPaymentGroups: ${error}`);
		}
	}

	setPendingPaymentInLocalStorage() {
		localStorage.setItem(
			"pendingPayment",
			JSON.stringify({
				timestamp: Date.now(),
			}),
		);
	}

	setNubankIFrameInstallments(orderForm) {
		try {
			const isClubeSamsung = vtexjs?.checkout?.orderForm?.salesChannel === "72";
			const NubankPaymentGroup =
				window?.paymentData?.paymentGroups?.NubankPaymentGroup;

			if (!NubankPaymentGroup && !isClubeSamsung) {
				return;
			}

			const creditCardPaymentGroup =
				window?.paymentData?.paymentGroups?.creditCardPaymentGroup;

			const { payments = [], installmentOptions = [] } =
				orderForm?.paymentData ?? {};

			for (const payment of payments) {
				const bin = payment?.bin?.substr(0, 6);

				if (!this.nubank.bins.includes(bin)) {
					continue;
				}

				for (const installmentOption of installmentOptions) {
					if (
						payment.paymentSystem === installmentOption.paymentSystem &&
						payment.bin === installmentOption.bin &&
						payment.value === installmentOption.value
					) {
						installmentOption.installments =
							installmentOption.installments?.filter(
								(_, index) => index + 1 <= this.nubank.maxInstallments,
							);

						creditCardPaymentGroup?.iFrameSendInstallmentsPreview?.(
							installmentOption,
						);
					}
				}
			}
		} catch (error) {
			console.error("error ~ setNubankIFrameInstallments: ", error);
		}
	}

	getNubankWarningTemplate() {
		const isClubeSamsung = vtexjs?.checkout?.orderForm?.salesChannel === "72";

		if (isClubeSamsung) {
			return `
        <div class="nubankWarningTemplate" style="display: none;">
          <p>
            Caro cliente, a Nubank limita parcelamentos no cartão até 12x sem juros.
          </p>
        </div>
      `;
		}

		return `
      <div class="nubankWarningTemplate" style="display: none;">
        <p>
          Para cartões Nubank com parcelamento até <strong>18x</strong> Sem Juros, 
          selecione o método de pagamento <strong>"Nubank"</strong>.
        </p>
      </div>
    `;
	}

	setNubankWarningMessage(orderForm) {
		try {
			const NubankPaymentGroup =
				window?.paymentData?.paymentGroups?.NubankPaymentGroup;
			const isClubeSamsung = vtexjs?.checkout?.orderForm?.salesChannel === "72";

			if (!NubankPaymentGroup && !isClubeSamsung) {
				return;
			}

			const $iframeContext = $("#iframe-placeholder-creditCardPaymentGroup");

			const { paymentData } = orderForm ?? {};
			const { payments = [] } = paymentData ?? {};

			const isNubankCreditCard = payments.some((payment) =>
				this.nubank.bins.includes(payment.bin?.substr(0, 6)),
			);

			const $hasNubankWarningTemplate =
				$iframeContext
					.toggleClass("nubankCreditCard", isNubankCreditCard)
					.find(".nubankWarningTemplate").length > 0;

			if (isNubankCreditCard && !$hasNubankWarningTemplate) {
				$iframeContext.prepend(this.getNubankWarningTemplate());
			}
		} catch (error) {
			console.error("error ~ setNubankWarningMessage: ", error);
		}
	}

	sync(orderForm) {
		try {
			this.setNubankWarningMessage(orderForm);
			this.setNubankIFrameInstallments(orderForm);
			this.addPaymentMethodsIcons();
		} catch (err) {
			console.error(`Error in class Payment: ${err}`);
			this.loading(false);
		}
	}

	/**
	 * @returns {void}
	 */
	setPixAsDefaultPaymentMethod() {
		const account = window?.__RUNTIME__.account;
		const defaultPaymentSystemByAccount = {
			samsungbrshopeppnubank: 178,
			default: 125, // pix
		};
		const paymentSystemId =
			defaultPaymentSystemByAccount[account] ||
			defaultPaymentSystemByAccount.default;
		const availableInstallments =
			vtexjs.checkout.orderForm.paymentData.installmentOptions.filter(
				(payment) => payment.paymentSystem === String(paymentSystemId),
			);

		if (!availableInstallments.length || hasSelectedPaymentMethod()) return;

		const paymentAttachment = {
			payments: [
				{
					paymentSystem: paymentSystemId,
					installments: 1,
					referenceValue: availableInstallments[0].value,
				},
			],
		};

		vtexjs.checkout.sendAttachment("paymentData", paymentAttachment);
	}

	orderPaymentMethodScroll(paymentMethod) {
		const headerHeight = $("#header-standard .main-header").outerHeight() || 0;

		requestAnimationFrame(() => {
			const offsetTop = paymentMethod.offset().top;

			$("html, body").animate(
				{
					scrollTop: offsetTop - (headerHeight + 65),
				},
				500,
			);
		});
	}

	orderPaymentMethod() {
		if (window.innerWidth > 769) return;

		let lastIndex = null;

		const observer = new MutationObserver((mutations, obs) => {
			if (
				$(".payment-group-item").length > 0 &&
				$(".payment-method").length > 0
			) {
				obs.disconnect();

				const _this = this;

				$(".payment-group-item").each(function (index) {
					const paymentMethod = $(".payment-method").eq(index);
					$(this).after(paymentMethod);
					paymentMethod.addClass(`payment-method-order-${index + 1}`);
				});

				$(".payment-group-item").on("click", function () {
					const index = $(".payment-group-item").index(this);
					const paymentMethod = $(".payment-method").eq(index);

					if (lastIndex === index) {
						paymentMethod.slideToggle();
						lastIndex = paymentMethod.is(":visible") ? index : null;
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
			creditCardPaymentGroup: "iframe-placeholder-creditCardPaymentGroup",
			customPrivate_501PaymentGroup:
				"iframe-placeholder-customPrivate_501PaymentGroup",
		};

		function reloadIframe(wrapperId) {
			const $iframe = $(`#${wrapperId} iframe`);
			if ($iframe.length === 0) {
				return;
			}

			const src = $iframe.attr("src");
			const newSrc = src.replace(
				/(&?_cleartime=\d+)?$/,
				(src.includes("?") ? "&" : "?") + "_cleartime=" + Date.now(),
			);
			$iframe.attr("src", newSrc);
		}

		$(document).on("click", ".payment-group-item", function () {
			const id = $(this).attr("id");
			const groupKey = id?.replace("payment-group-", "");

			const wrapperId = PAYMENT_IFRAMES[groupKey];
			if (wrapperId) {
				setTimeout(() => reloadIframe(wrapperId), 100);
			}
		});
	}

	addPaymentMethodsIcons() {
		if ($(".payment-methods-container").length > 0) return;

		const iconsElement = `
      <div class="payment-methods-container">
        <div class="payment-methods-infos">
          <p>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/932a300b-6877-474d-981b-0c3b68a1deaa___321926fdd56aecf4dd63c6d4309bb5e3.svg" alt="" />
            Pagamento <b>100%</b> seguro
          </p>
          <p>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/f2e2ec70-a9a2-4287-9498-b3ac6e183eb1___9513c65f5de67d014f4a9fc03cac5a73.svg" alt="" />
            Parcele em até <b>24x</b> no cartão
          </p>
        </div>
        <div class="payment-methods-icons">
          <p>Formas de Pagamento:</p>
          <div>
            <img src="https://samsungbr.vtexassets.com/arquivos/icons-payments_icon-ssg-itaucard.png" alt=""/>
            <img src="https://samsungbr.vtexassets.com/arquivos/icons-payments_icon-pix.png" alt=""/>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/4492c33b-98b2-4b67-ad68-cea51bb04a31___a7c7056738c180722240a31eb7a9cdb6.svg" alt=""/>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/4d88cc67-151d-4b7b-bd45-766100275cc7___8b205ac44367b37ba1ed43276ce84b29.svg" alt=""/>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/bfd271b5-246f-4ae9-b817-0ef059f58693___b0f2948fe225dcfa67fcae4c78c8440a.svg" alt=""/>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/5224f5d0-25a8-44d1-b0bb-4f2ec57127e5___4b665a249b4fa8eed0ef9a20559d154f.svg" alt=""/>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/7b6948ee-4e18-4dae-9207-49c09dffd648___6624accec46562be51b767255675eaf3.svg" alt=""/>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/7557f348-6ce6-4077-8337-16a0924b4a21___43933cc7997768334a376a9d68479a79.svg" alt=""/>
            <img src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/2036dba3-8a3a-4ac6-acf0-f9f861ff431b___9c246f035d98955fc8b3d0822c915a72.svg" alt=""/>
            </div>
        </div>
      </div>
    `;
		$("#payments-title").append(iconsElement);
	}
}
