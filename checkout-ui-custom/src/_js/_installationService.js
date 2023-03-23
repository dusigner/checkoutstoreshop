export default class InstallationService {
  constructor() {
    this.INSTALLATION_URL = '/install-service/p'
  }

  init() {
    try {
      const { items } = window.vtexjs.checkout.orderForm
      const hasInstallation = this.hasInstallationService(items)

      if (!hasInstallation) return

      this.validateSamsungCarePlus(items)
    } catch (e) {
      console.error('installationService error', e)
    }
  }

  validateSamsungCarePlus(items) {
    const installations = this.getInstallationItems(items)
    const relatedItems = this.getRelatedInstallationItems(items)
    // eslint-disable-next-line no-console, prettier/prettier, padding-line-between-statements
    console.log('entrou no aqui no installation', installations)

    // remover instalações duplicadas
    // const toRemove = []

    // installations.forEach(installation => {
    //   if ($(`.product-item[data-sku="${installation.id}"] .item-link-remove`)) {
    //     $(`.product-item[data-sku="${installation.id}"] .quantity`).hide()
    //   }

    //   const duplicated = installations.filter(
    //     installationItem =>
    //       installationItem.id === installation.id &&
    //       installationItem.refId === installation.refId
    //   )

    //   const alreadyInArray = toRemove.find(item => item.id === installation.id)

    //   if (duplicated.length > 1 && !alreadyInArray) {
    //     toRemove.push(...duplicated.slice(1, duplicated.length))
    //   }
    // })

    // if (toRemove.length) {
    //   this.removeInstallations(toRemove)
    // }

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
