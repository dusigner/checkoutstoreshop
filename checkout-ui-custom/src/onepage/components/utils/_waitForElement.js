/**
 * @typedef {Object} Options
 * @property {number} [interval=100] - Time where a new search will be made in the DOM for the element.
 * @property {number} [timeout=120000] - Maximum time to wait for the element to appear.
 * @property {string} [errorMessage] - Custom error message when the element is not found.
 * If the time is reached, the promise will be rejected.
 */

/**
 * Create a promise that will run every interval checking if the element
 * exists, when it exists it resolves the promise. If the maxTime is reached
 * it will throw an error.
 * 
 * Could be used to wait for an element to appear in the DOM.
 * 
 * @template {Element} E
 * @param {string} selectors - CSS selector of the element to wait for.
 * @param {Options} [options={}] - Options to configure the interval and timeout.
 * @returns {Promise<E>} A promise that resolves with the found element.
 * 
 * @example
 * ```js
 * const $element = await waitForElement('button')
 * ```
 */
export function waitForElement(selectors, options = {}) {
  const { interval = 100, timeout: maxTime = 120000 } = options
  const errorMessage = options.errorMessage || `Not found element with selector ${selectors} after ${maxTime}ms`

  return new Promise((resolve, reject) => {
    const _interval = setInterval(() => {
      const $element = document.querySelector(selectors)
      if (!$element) return
      resolve($element)
      clearInterval(_interval)
    }, interval)

    setTimeout(() => {
      clearInterval(_interval)
      reject(
        new Error(errorMessage),
      )
    }, maxTime)
  })
}
