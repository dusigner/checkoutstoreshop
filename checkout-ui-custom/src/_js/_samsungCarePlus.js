export default class SamsungCarePlus {
  constructor() {
    this.SAMSUNG_CARE_CATEGORY = '/2005/'
    this.LINK_SCPLUS = 'linkSCPLUS'
  }

  init() {
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

    // Se tem mais de um seguro então deixa somente o ultimo seguro colocado.
    if (scpItem.length > 1) {
      const remove = scpItem.filter((item, index) => {
        if (index === scpItem.length - 1) return false

        return true
      })

      this.removeSamsungCarePlus(remove)

      return
    }

    const skuMainProduct = scpItem[0].attachments.find(
      att => att.name === this.LINK_SCPLUS
    )

    // Se o produto não tiver o attachment do SC+ então há algo errado no carrinho. Remove o seguro.
    if (!skuMainProduct || !skuMainProduct.content) {
      this.removeSamsungCarePlus()
    }

    // Encontra o produto principal.
    const mainProduct = items.find(
      item => item.id === skuMainProduct.content.idsku
    )

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
