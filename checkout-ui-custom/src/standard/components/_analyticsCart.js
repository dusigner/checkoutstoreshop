const __cartEventLock = {}

export function buildGa4CartEvent({
  item,
  type = 'add',
  quantity = 1,
  selectButton = '',
  currency = 'BRL',
}) {
  if (!item) return null

  const orderForm = window.vtexjs.checkout.orderForm
  const categories = Object.values(item.productCategories || [])

  const price = Number(item.sellingPrice || 0) / 100
  const originalPrice = Number(item.listPrice || 0) / 100

  return {
    event: type === 'add' ? 'add_to_cart' : 'remove_from_cart',
    ecommerce: {
      currency,
      value: price * quantity,
      select_button: selectButton,
      items: [
        {
          item_id: item.productId,
          item_variant: item.id,
          sku_id: item.refId,
          sku_base: item.productRefId,
          item_name: item.name,
          affiliation: 'Shop Samsung',
          index: item.index ?? orderForm.items.findIndex(i => i.id === item.id) + 1,
          item_brand: item.additionalInfo?.brandName,
          item_category: categories?.[0] || undefined,
          item_category2: categories?.[1] || undefined,
          item_category3: categories?.[2] || undefined,
          item_list_id: 'checkout',
          item_list_name: 'Checkout',
          price,
          original_price: originalPrice,
          quantity,
        },
      ],
    },
  }
}

export function dispatchSsgCartEvent(config) {
  const payload = buildGa4CartEvent(config)
  if (!payload) return

  const sku = config.item.id

  if (__cartEventLock[sku]) return

  __cartEventLock[sku] = true

  setTimeout(() => {
    __cartEventLock[sku] = false
  }, 300)

  window.dataLayer = window.dataLayer || []

  window.dataLayer.push({ ecommerce: null })
  window.dataLayer.push(payload)
}