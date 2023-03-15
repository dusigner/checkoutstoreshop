/* eslint-disable no-inner-declarations */
/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */
/* eslint eqeqeq: 0 */
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
    scpItem.forEach(item => {
      if ($(`.product-item[data-sku="${item.id}"] .item-link-remove`)) {
        $(`.product-item[data-sku="${item.id}"] .quantity`).addClass(
          'quantity-samsungCare'
        )
      }
    })

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

  interceptSamsungCarePlusRequest(event, request) {
    const isUpdateItemRequest = request.url.includes('/items/update/')

    if (!isUpdateItemRequest) {
      return
    }

    try {
      function findSamsungCareInCart() {
        const { items } = window.vtexjs.checkout.orderForm

        return items.filter(item => {
          const { attachments } = item

          return attachments.some(attachment => {
            return attachment.name.includes('linkSCPLUS')
          })
        })
      }

      const hasSamsungCareInCart = findSamsungCareInCart()

      if (!hasSamsungCareInCart.length) {
        return
      }

      const { items } = this.vtexjs.checkout.orderForm
      const payload = JSON.parse(request.data || '{}')
      const { orderItems } = payload
      const [currentItem] = orderItems

      function findSamsungCarePlusById(item) {
        const { attachments } = item

        return attachments.some(attachment => {
          return attachment.content.idsku === currentItem.id
        })
      }

      const samsungCarePlus = items.find(findSamsungCarePlusById)

      if (samsungCarePlus) {
        orderItems.push({
          seller: samsungCarePlus.seller,
          quantity: currentItem.quantity,
          id: samsungCarePlus.id,
          index: items.indexOf(samsungCarePlus),
          hasBundleItems: !!samsungCarePlus.bundleItems.length,
        })
        request.data = JSON.stringify(payload)
      }
    } catch (err) {
      console.error(`Erro ao sincronizar quantidade do Samsung Care: ${err}`)
    }
  }
}
