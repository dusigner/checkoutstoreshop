
// @ts-check

import { AppsGraphql } from "../api/_AppsGraphql";
import { parseStoreCheckoutAppConfig } from "./utils/_parseStoreCheckoutAppConfig";
import { waitForElement } from "./utils/_waitForElement";

/**
 * @see https://jira.sdslasupport.com/jira/browse/EENGS-5193
 * 
 * @temporary - This file will be used only during the stress test period.
 */
export default class BankPaymentSlip {
  #AppsGraphql;

  constructor() {
    this.#AppsGraphql = new AppsGraphql();
  }

  async init() {
    const publicData = await this.#AppsGraphql.publicSettingsForApp({
      app: `${__CHECKOUT_VENDOR__}.${__CHECKOUT_NAME__}`,
      version: __CHECKOUT_VERSION__,
    });

    const parsedAppConfig = parseStoreCheckoutAppConfig(publicData);

    if (await this.#shouldBypassBankPaymentSlip(parsedAppConfig)) {
      await this.#makePaymentSlipVisible(parsedAppConfig.bankPaymentSlipCssSelector);
      console.debug('BankPaymentSlip: Payment slip is visible');
      return;
    }
    await this.#removeBankPaymentSlip(parsedAppConfig.bankPaymentSlipCssSelector);
  console.debug('BankPaymentSlip: Payment slip removed');
  }

  /**
   * 
   * @param {import("./utils/_parseStoreCheckoutAppConfig").StoreCheckoutConfig} appConfig 
   */
  async #shouldBypassBankPaymentSlip(appConfig) {
    if (appConfig.bypassBankPaymentSlipActive === false) {
      return false;
    }

    const cookie = await cookieStore.get(appConfig.cookieKey)

    if (!cookie) {
      return false;
    }

    return cookie.value === appConfig.cookieValue;
  }

  /**
   * 
   * @param {string} cssSelector 
   */
  async #removeBankPaymentSlip(cssSelector) {
    /** @type {HTMLElement} */
    const paymentGroupElement = await waitForElement(cssSelector, {
      errorMessage: `BankPaymentSlip: could not find payment group element with selector ${cssSelector}`
    });

    paymentGroupElement.remove();
  }

  /**
   * @param {string} cssSelector 
   */
  async #makePaymentSlipVisible(cssSelector) {
    /** @type {HTMLElement} */
    const paymentGroupElement = await waitForElement(cssSelector, {
      errorMessage: `BankPaymentSlip: could not find payment group element with selector ${cssSelector}`
    });
    paymentGroupElement.style.display = 'block !important';

    // fallback
    const styleElement = document.createElement('style');
    styleElement.id = 'bank-payment-slip-style-override';
    styleElement.innerHTML = `
      ${cssSelector} {
        display: block !important;
      }
    `;

    if (document.getElementById(styleElement.id)) {
      return;
    }
    document.head.appendChild(styleElement);
  }
}

