export function general() {
  if (!$('.custom-cart-template-wrap').length) {
    $('.cart-template.mini-cart .cart-fixed > *').wrapAll(
      '<div class="custom-cart-template-wrap">'
    )
  }

  $('.table.cart-items tbody tr.product-item').each(function () {
    if (!$(this).find('.v-custom-product-item-wrap').length) {
      $(this).find('> *').wrapAll(`<div class="v-custom-product-item-wrap">`)
    }
  })

  $('body').addClass('v-custom-loaded')
}
