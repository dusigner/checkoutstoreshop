import { deleteCustomData, getCustomDataFields, getProductVariations, setCustomData } from "./_utils"

export class OptInDimensions {
  constructor() {
    this.items = null
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
    const infosOptinCategory = this.items
    const { product_dimensions } = getCustomDataFields({ app: this.app });

    return `<div class="optin-dimensions">
      <label class="checkbox-inline">
        <input type="checkbox" id="optin-dimensions" ${product_dimensions && "checked" || ""} />
        <span class="custom-checkbox-icon"></span>
        <span class="optin-text">
          ${infosOptinCategory?.messageCategoryCheckout}
        </span>
      </label>
      <span class="help error" style="visibility:hidden">Campo obrigatório.</span>
    </div>`
  }

  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  async getAlertMessageProducts() {
    try {
      return fetch(`${this.rootPath()}/_v/private/get/alertMessageProducts`)
        .then((resp) => resp.json())
        .then((data) => data);
    } catch (e) {
      console.error('Alert message searching MD error', e);
      return [];
    }
  };


  forceAcceptance() {
    if (OptInDimensions.runtime.accepted) return

    const { product_dimensions } = getCustomDataFields({ app: this.app });

    if (window.location.hash === "#/payment" && this.items && !product_dimensions) {
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

      if (this.items) {
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

  async sync(orderForm) {
    if (!orderForm?.items?.length) return

    try {
      if (orderForm?.items?.length > 0) {
        const listCategoriesStorage = JSON.parse(localStorage.getItem('ListCategoriesMessage'))
        const arrayItemsCategories = []
        let alertMessageInfos = listCategoriesStorage
        if (listCategoriesStorage?.length === 0 || !listCategoriesStorage) {
          alertMessageInfos = await this.getAlertMessageProducts()
          localStorage.setItem('ListCategoriesMessage', JSON.stringify(alertMessageInfos))
        }

        if (alertMessageInfos) {
          orderForm?.items?.map(item => arrayItemsCategories.push(Object.values(item.productCategories)))
          const listArrayCategories = arrayItemsCategories.reduce((list, sub) => list.concat(sub), [])
          const optinItems = alertMessageInfos?.find(infos => {
            return listArrayCategories.some(category => category?.toLowerCase() === infos?.nameCategory?.toLowerCase() && infos?.activeCategory && infos?.messageCategoryCheckout)
          })
          this.items = optinItems
        }
      } else {
        this.items = null
      }

      if (!this.items) {
        this.removeOptinElement()
        this.handleRemoveCustomData()
      }

      this.forceAcceptance()
    } catch (error) {
      console.error(`Erro ao foi iniciar OptInDimensions: ${error}`);
    }
  }
}