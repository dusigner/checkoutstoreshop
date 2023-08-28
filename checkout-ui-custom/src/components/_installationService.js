/* eslint-disable prettier/prettier */
/* eslint-disable padding-line-between-statements */
/* eslint-disable no-inner-declarations */
export default class InstallationService {
  constructor() {
    this.INSTALLATION_URL = '/install-service/p'
    this.error = null
  }

  removeInstallations(items) {
    try {
      const installationServices = this.getInstallationItems(items)
  
      if (!installationServices.length) {
        return
      }
  
      const itemsToRemove = installationServices.reduce((acc, currentInstallation) => {
        const hasAttachedItem = this._findAttachedItem(currentInstallation, items)

        if (!hasAttachedItem) {
          acc.push({
            index: items.indexOf(currentInstallation),
            quantity: 0
          })
        }
  
        return acc
      }, [])

      // prevent infinite loop
      if (this.error) {
        return
      }

      if (itemsToRemove.length) {
        window.cart.loadingItem(true)
  
        vtexjs.checkout.removeItems(itemsToRemove, null, false).done(function() {
          window.cart.loadingItem(false)
        }).fail(function() {
          window.cart.loadingItem(false)
          this.error = true // prevent infinite loop
        })
      }
    } catch (err) {
      console.error(`Não foi possível remover items de instalação: ${err}`)
    }
  }

  _findAttachedItem(installationItem, items) {
    const { attachments } = installationItem

    const attachmentItem = attachments.find(attachment => (
      items.some(item => item.refId === attachment.content.refId)
    ))

    return attachmentItem
  }

  getInstallationItems(items) {
    return items.filter((item) => item.detailUrl.includes(this.INSTALLATION_URL))
  }

  addClassToInstallationItems(items) {
    const installations = this.getInstallationItems(items)

    installations.forEach(installation => {
      if ($(`.product-item[data-sku="${installation.id}"] .item-link-remove`)) {
        $(`.product-item[data-sku="${installation.id}"] .quantity`).addClass(
          'quantity-installation-service'
        )
      }
    })
  }

  sync(orderForm) {
    try {
      if (!orderForm) {
        return
      }
  
      const { items } = orderForm
  
      // empty carty
      if (!items || !items.length) {
        return
      }

      this.removeInstallations(items)
    } catch (err) {
      console.error(`Não foi possível sincronizar items de instalação: ${err}`)
    }
  }

  init() {
    try {
      const { items } = window.vtexjs.checkout.orderForm
      this.addClassToInstallationItems(items)
    } catch (e) {
      console.error('installationService error', e)
    }
  }
}
