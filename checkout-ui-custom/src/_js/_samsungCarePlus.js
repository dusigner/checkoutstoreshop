export default class SamsungCarePlus {
  
  constructor() {
    this.SAMSUNG_CARE_CATEGORY = '/2005/'
    this.LINK_SCPLUS = 'linkSCPLUS'
  }

  init() {
    console.log("TESTE CHECKOUT SAMSUNG CARE")
    try {
      const { items } = window.vtexjs.checkout.orderForm

      if (items) {
        this.validateSamsungCarePlus(items)
      }
    } catch (e) {
      console.error('SamsungCarePlus error', e)
    }
  }

  isSamsungCarePlus(item) {
    return item && item.productCategoryIds === this.SAMSUNG_CARE_CATEGORY
  }

  validateSamsungCarePlus(items) {
    const scpItem = items.filter(item => this.isSamsungCarePlus(item))

    if (!scpItem.length) return
    console.log("scpItem", scpItem)

    const skuMainProduct = scpItem[0].attachments.find(
      att => att.name === this.LINK_SCPLUS
    )
    console.log("skuMainProduct", skuMainProduct)
    // Se o produto não tiver o attachment do SC+ então há algo errado no carrinho. Remove o seguro.
    if (!skuMainProduct || !skuMainProduct.content) {
      this.removeSamsungCarePlus()
    }

    // Encontra o produto principal.
    const mainProduct = items.find(
      item => item.id === skuMainProduct.content.idsku
    )
    console.log("Main Product", mainProduct)
    // Se não tiver o produto principal então remove o seguro.
    if (!mainProduct) {
      this.removeSamsungCarePlus()
    }
  }

  removeSamsungCarePlus(toRemove) {
    const items = toRemove || window.vtexjs.checkout.orderForm.items

    items
      .filter(item => this.isSamsungCarePlus(item))
      .forEach(item => {
        const removeBtn = $(
          `tr.product-item[data-sku="${item.id}"] td.item-remove a`
        )

        if (removeBtn.length) {
          removeBtn[0].click()
          removeBtn[0].remove()
        }
      })
  }
}
