import { formatCurrencyBRL } from './_utils'

export default class InstallationService {
  constructor() {
    this.INSTALLATION_URL = '/install-service/p'
  }

  init() {
    const { items } = window.vtexjs.checkout.orderForm
    const hasInstallation = this.hasInstallationService(items)

    if (!hasInstallation) return

    this.addOpenTextFieldToInstallation()
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
    return !!items.find(item => this.isInstallationService(item))
  }

  isInstallationService(item) {
    return item.detailUrl === this.INSTALLATION_URL
  }

  addOpenTextFieldToInstallation() {
    const { items } = window.vtexjs.checkout.orderForm
    const logisticInfo =
      window.vtexjs.checkout.orderForm.shippingData.logisticsInfo

    const installationItems = this.getInstallationItems(items)
    const relatedItemsInstallation = this.getRelatedInstallationItems(items)
    const obsForInstallationService = []

    relatedItemsInstallation.forEach(relatedItem => {
      const logInfo = logisticInfo.find(info => info.itemId === relatedItem.id)
      const selectedSla = logInfo.slas.find(
        sla => logInfo.selectedDeliveryChannel === sla.deliveryChannel
      )
      // eslint-disable-next-line
      const estimate = selectedSla.shippingEstimate.replace(/[^0-9\.]+/g, '')
      const currentInstallation = installationItems.find(
        installation =>
          installation.attachments[0].content.refId === relatedItem.refId
      )

      obsForInstallationService.push(
        `{'isInstallation':'true','sku':'${
          currentInstallation.refId
        }','estimate':'${estimate + 1}','price': '${formatCurrencyBRL(
          relatedItem.price
        )}'}`
      )
    })

    window.vtexjs.checkout.sendAttachment('openTextField', {
      value: `${obsForInstallationService.join(',')}`,
    })
  }
}
