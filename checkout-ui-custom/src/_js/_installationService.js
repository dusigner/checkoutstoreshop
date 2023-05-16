/* eslint-disable prettier/prettier */
/* eslint-disable padding-line-between-statements */
/* eslint-disable no-inner-declarations */
export default class InstallationService {
  constructor() {
    this.INSTALLATION_URL = '/install-service/p'
  }

  init() {
    try {
      const { items } = window.vtexjs.checkout.orderForm
      const hasInstallation = this.hasInstallationService(items)

      if (!hasInstallation) return

      this.validateInstallationService(items)
    } catch (e) {
      console.error('installationService error', e)
    }
  }

  validateInstallationService(items) {
    const installations = this.getInstallationItems(items)
    const relatedItems = this.getRelatedInstallationItems(items)

    installations.forEach(installation => {
      if ($(`.product-item[data-sku="${installation.id}"] .item-link-remove`)) {
        $(`.product-item[data-sku="${installation.id}"] .quantity`).addClass(
          'quantity-installation-service'
        )
      }
    })

    // Caso a quantidade de itens e a quantidade de instalações sejam iguais então não falta items.
    if (installations.length === relatedItems.length) return

    // Verifica se removeu um produto. Caso sim, remove a instalação dele.
    if (installations.length > relatedItems.length) {
      const intallationsToRemove = installations.filter(installation => {
        const relatedItemToInstallation = relatedItems.find(
          item => item.refId === installation.attachments[0].content.refId
        )

        if (relatedItemToInstallation) return false

        return true
      })

      this.removeInstallations(intallationsToRemove)
    }
  }

  removeInstallations(installations) {
    installations.forEach(installation => {
      const removeBtn = $(
        `tr.product-item[data-sku="${installation.id}"] td.item-remove a`
      )

      if (removeBtn.length) {
        removeBtn[0].click()
        removeBtn[0].remove()
      }
    })
  }

  syncQuantity(event, request) {
    const isUpdateItemRequest = request.url.includes('/items/update/')
    if (!isUpdateItemRequest) {
      return
    }
    try {
      function findInstallationServiceInCart() {
        const { items } = window.vtexjs.checkout.orderForm
        return items.filter(item => {
          const { attachments } = item
          return attachments.some(attachment => {
            return attachment.name.includes('linkInstallation')
          })
        })
      }
      const hasInstallationServiceInCart = findInstallationServiceInCart()
      if (!hasInstallationServiceInCart.length) {
        return
      }
      const { items } = window.vtexjs.checkout.orderForm
      const payload = JSON.parse(request.data || '{}')
      const { orderItems } = payload
      const [currentItem] = orderItems

      function findInstallationServiceById(item) {
        const mainItem = items.find(
          itemResponse => itemResponse.id === currentItem.id
        )
        const { attachments } = item
        return attachments.some(attachment => {
          return attachment.content.refId === mainItem.refId
        })
      }
      const installationService = items.find(findInstallationServiceById)
      if (installationService) {
        orderItems.push({
          seller: installationService.seller,
          quantity: currentItem.quantity,
          id: installationService.id,
          index: items.indexOf(installationService),
          hasBundleItems: !!installationService.bundleItems.length,
        })
        request.data = JSON.stringify(payload)
      }
    } catch (err) {
      console.error(
        `Erro ao sincronizar quantidade do Serviço de instalação: ${err}`
      )
    }
  }

  // Encontrar as instalações.
  getInstallationItems(items) {
    return items.filter(item => this.isInstallationService(item))
  }

  // Encontrar os produtos que estão relacionados com as instalações.
  getRelatedInstallationItems(items) {
    const installationItems = this.getInstallationItems(items)

    const relatedItems = []

    installationItems.forEach(installationitem => {
      const related = items.find(
        item => item.refId === installationitem.attachments[0].content.refId
      )

      if (related) {
        relatedItems.push(related)
      }
    })

    return relatedItems
  }

  hasInstallationService(items) {
    return !!items.find(
      item => this.isInstallationService(item) && item.attachments.length
    )
  }

  isInstallationService(item) {
    return item.detailUrl === this.INSTALLATION_URL && item.attachments.length
  }
}
