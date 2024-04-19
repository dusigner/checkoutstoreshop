import { deleteCustomData, getCustomDataFields, getProductVariations, setCustomData } from "./_utils"

export class OptInDimensions {
  constructor() {
    this.items = []
    this.categories = ['Geladeiras']
    this.app = 'consent_app'
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

  handleRemoveCustomData() {
    const fields = getCustomDataFields({ app: this.app });

    deleteCustomData({
      app: this.app,
      fields: fields
    }).catch(error => console.error(error))
  }

  removeOptinElement() {
    return $('.optin-dimensions').remove()
  }

  optinElement() {
    const { product_dimensions } = getCustomDataFields({ app: this.app });

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

  render() {
    try {
      if ($('#optin-dimensions').length) return

      if (this.items.length) {
        const $target = $('.vtex-omnishipping-1-x-address > div p.input').last()

        const $field = this.optinElement()
        $target.after($field)
      }
    } catch (error) {
      console.error(`Erro ao adicionar opt-in dimensions: ${error}`);
    }
  }

  sync(orderForm) {
    if (!orderForm?.items?.length) return

    try {
      const items = orderForm?.items?.filter((item) => {
        return Object.values(item.productCategories).some(category => {
          return this.categories.includes(category)
        })
      }) || []

      if (items.length) {
        const optInItems = items.filter(async (item) => {
          const product = await getProductVariations(item.productId)
          return product['Opt-In Dimensions']
        })
  
        this.items = optInItems
      } else {
        this.items = []
      }

      if (!this.items.length) {
        this.removeOptinElement()
        this.handleRemoveCustomData()
      }
    } catch (error) {
      console.error(`Erro ao foi iniciar OptInDimensions: ${error}`);
    }
  }
}