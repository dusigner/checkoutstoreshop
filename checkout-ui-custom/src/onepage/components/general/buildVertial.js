export function buildVertical() {
  $('body').addClass('body-cart-vertical')
  $('.cart-template .cart-links-bottom:eq(0)').appendTo(
    '.cart-template > .summary-template-holder'
  )
}
