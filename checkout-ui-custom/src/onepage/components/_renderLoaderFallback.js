const HALF_SECOND_IN_MS = 500
const TEN_SECONDS_IN_MS = 10_000

/**
 * Same function found in the inline script tag in the checkout HTML with attribute `data-render-loader-script="true"`
 */
function renderLoaderReady() {
  if (window.checkout) {
    $(window).trigger('renderLoaderReady.vtex')
  } else {
    setTimeout(renderLoaderReady, HALF_SECOND_IN_MS)
  }
}

/**
 * Fallback for the trigger to avoid long/infinite loading.
 *
 * @see https://jira.sdslasupport.com/jira/browse/EENGS-4908?focusedId=1053884&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-1053884
 */
export default class RenderLoaderFallback {
  init() {
    this.setupEvents();
  }

  setupEvents() {
    const fallback = setTimeout(renderLoaderReady, TEN_SECONDS_IN_MS)

    $(window).on('renderLoaderReady.vtex', () => {
      clearTimeout(fallback)
    })
  }
}
