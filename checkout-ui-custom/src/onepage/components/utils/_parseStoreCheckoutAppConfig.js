// @ts-check

/**
 * @typedef {Object} StoreCheckoutConfig
 * @property {boolean} bypassBankPaymentSlipActive
 * @property {string} cookieKey
 * @property {string} cookieValue
 * @property {string} bankPaymentSlipCssSelector
 */

/**
 * @param {any} obj
 * @returns {StoreCheckoutConfig}
 * @throws {Error}
 */
export function parseStoreCheckoutAppConfig(obj) {
  const errorPrefix = 'parseStoreCheckoutAppConfigError';
  
  if (!obj || typeof obj !== 'object') {
    throw new Error(`${errorPrefix}: parameter must be an object`);
  }

  if (obj.bypassBankPaymentSlipActive !== undefined && typeof obj.bypassBankPaymentSlipActive !== 'boolean') {
    throw new Error(`${errorPrefix}: bypassBankPaymentSlipActive must be a boolean`);
  }

  if (obj.cookieKey !== undefined && typeof obj.cookieKey !== 'string') {
    throw new Error(`${errorPrefix}: cookieKey must be a string`);
  }

  if (obj.cookieValue !== undefined && typeof obj.cookieValue !== 'string') {
    throw new Error(`${errorPrefix}: cookieValue must be a string`);
  }

  if (obj.bankPaymentSlipCssSelector !== undefined && typeof obj.bankPaymentSlipCssSelector !== 'string') {
    throw new Error(`${errorPrefix}: bankPaymentSlipCssSelector must be a string`);
  }
  
  return /** @type {StoreCheckoutConfig} */ ({
    bypassBankPaymentSlipActive: obj.bypassBankPaymentSlipActive,
    cookieKey: obj.cookieKey,
    cookieValue: obj.cookieValue,
    bankPaymentSlipCssSelector: obj.bankPaymentSlipCssSelector ?? "#payment-group-custom202PaymentGroupPaymentGroup"
  });
}