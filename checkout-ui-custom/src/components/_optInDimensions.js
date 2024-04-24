import { deleteCustomData, getCustomDataFields, getProductVariations, setCustomData } from "./_utils"

export class OptInDimensions {
  constructor() {
    this.items = []
    this.categories = ['Geladeiras']
    this.app = 'consent_app'
    this.elements = {}
  }

  static runtime = {
    accepted: false,
  }

  static handleSetCustomData() {
    const checked = $('#optin-dimensions').prop('checked')
    OptInDimensions.runtime.accepted = checked

    setCustomData({
      app: 'consent_app',
      fields: {
        product_dimensions: checked ?? false
      }
    }).catch(error => console.error(error))
  }

  static toggleRequiredMessage() {
    const allRequiredFieldsFilled =
      $('#shipping-data p.input.required:visible input').filter(function () {
        return $.trim($(this).val()).length === 0
      }).length === 0

    $('.optin-dimensions .help.error').css({
      visibility: allRequiredFieldsFilled && 'visible'
    })
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
        <input type="checkbox" id="optin-dimensions" ${product_dimensions && "checked" || ""} />
        <span class="custom-checkbox-icon"></span>
        <span class="optin-text">
          Estou ciente das dimensões do produto a ser comprado*
        </span>
      </label>
      <span class="help error" style="visibility:hidden">Campo obrigatório.</span>
    </div>`
  }

  forceAcceptance() {
    if (OptInDimensions.runtime.accepted) return
    
    const { product_dimensions } = getCustomDataFields({ app: this.app });

    if (window.location.hash === "#/payment" && this.items.length && !product_dimensions) {
      window.location.hash = "#/shipping"
    }
  }

  init() {
    this.elements.targets = {
      $addressList: $('.address-list').last(),
      $addressForm: $('.vtex-omnishipping-1-x-address').last()
    }
  }

  render() {
    try {
      this.init()

      if ($('.optin-dimensions').length) return

      if (this.items.length) {
        const { $addressForm, $addressList } = this.elements.targets

        const $targets = [
          $addressForm.find('> div p.input:visible').last(),
          $addressList.find('p.address-create'),
        ]

        const $field = this.optinElement()

        $targets.forEach($target => {
          $target.after($field)
          if (!$target.is(':visible')) $target.remove()
        })
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

      this.forceAcceptance()
    } catch (error) {
      console.error(`Erro ao foi iniciar OptInDimensions: ${error}`);
    }
  }
}