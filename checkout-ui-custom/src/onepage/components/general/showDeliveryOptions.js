export function showDeliveryOptions() {
  $(
    '.cart-template .cart-more-options:eq(0), .cart-template .extensions-checkout-buttons-container'
  ).appendTo('.cart-template-holder')
}
