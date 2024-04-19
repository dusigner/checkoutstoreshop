import { getCustomDataFields, getProductVariations, setCustomData } from "./_utils"

export class OptInDimensions {
  constructor() {
    this.customApp = 'consent_app'
    this.categories = ['Geladeiras']
  }

  static handleAccept() {
    const checked = $('#optin-dimensions').prop('checked')

    setCustomData({
      app: 'consent_app',
      fields: {
        product_dimensions: checked ?? false
      }
    }).catch(error => console.error(error))
  }

  optinElement() {
    const { product_dimensions } = getCustomDataFields({ app: 'consent_app' });

    return `<div class="optin-dimensions">
      <label class="checkbox-inline">
        <input type="checkbox" id="optin-dimensions" ${product_dimensions && "checked"} />
        <span class="custom-checkbox-icon"></span>
        <span class="optin-text">
          Estou ciente das dimensões do produto a ser comprado 
        </span>
      </label>
    </div>`
  }

  render(orderForm) {
    try {
      if ($('.optin-dimensions').length) return

      const items = orderForm?.items?.filter((item) => {
        return Object.values(item.productCategories).some(category => {
          return this.categories.includes(category)
        })
      }) || []

      const shouldAddOptInDimensions = items.some(async (item) => {
        const product = await getProductVariations(item.productId)
        return product['Opt-In Dimensionas']?.[0] === 'Sim'
      })

      if (shouldAddOptInDimensions) {
        const $target = $('.vtex-omnishipping-1-x-address > div p.input').last()

        const $field = this.optinElement()
        $target.after($field)
      }
    } catch (error) {
      console.error(`Não foi adicionar opt-in dimensions: ${error}`);
    }
  }
}