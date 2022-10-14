export default class BespokeRefrigerator {
  constructor() {
    this.SKU_BESPOKE_PAIR = ''
    this.SKU_MAIN = []
    this.SKU_BESPOKE_SERVICE = ''
    this.SELLER = ''
    this.CATEGORYID =
      window.location.href.indexOf('samsungbr.') >= 0 ||
      window.location.host.split('.')[0].indexOf('shop') >= 0
        ? '/30/33/39/2113/'
        : '/2044/'
  }

  removeButtons({ items }) {
    if ($('.product-item')) {
      items.forEach(item => {
        if (
          item.productCategoryIds === this.CATEGORYID ||
          item.name.indexOf('Instalação Geladeira') > 0
        ) {
          if ($(`.product-item[data-sku="${item.id}"]`)) {
            if ($(`.product-item[data-sku="${item.id}"] .item-link-remove`)) {
              $(`.product-item[data-sku="${item.id}"] .item-link-remove`).hide()
            }

            if (
              $(`.product-item[data-sku="${item.id}"] .add-item-attachment`)
            ) {
              $(`.product-item[data-sku="${item.id}"] .add-item-attachment`)
            }

            if ($(`.product-item[data-sku="${item.id}"] input`)) {
              $(`.product-item[data-sku="${item.id}"] input`).attr(
                'disabled',
                true
              )
            }

            if ($(`.product-item[data-sku="${item.id}"] input`)) {
              $(`.product-item[data-sku="${item.id}"] input`).attr(
                'disabled',
                true
              )
            }

            if (
              $(
                `.product-item[data-sku="${item.id}"] #item-quantity-change-decrement-${item.id}`
              )
            ) {
              $(
                `.product-item[data-sku="${item.id}"] #item-quantity-change-decrement-${item.id}`
              ).addClass('disabled')
            }

            if (
              $(
                `.product-item[data-sku="${item.id}"] #item-quantity-change-increment-${item.id}`
              )
            ) {
              $(
                `.product-item[data-sku="${item.id}"] #item-quantity-change-increment-${item.id}`
              ).addClass('disabled')
            }
          }
        }

        if (item.productCategoryIds !== this.CATEGORYID) {
          if ($(`.product-item[data-sku="${item.id}"]`)) {
            if ($(`.product-item[data-sku="${item.id}"] .item-link-remove`)) {
              $(`.product-item[data-sku="${item.id}"] .item-link-remove`).show()
            }

            if (
              $(
                `.product-item[data-sku="${item.id}"] .item-quantity-change-decrement`
              )
            ) {
              $(
                `.product-item[data-sku="${item.id}"] .item-quantity-change-decrement`
              ).show()
            }

            if (
              $(
                `.product-item[data-sku="${item.id}"] .item-quantity-change-increment`
              )
            ) {
              $(
                `.product-item[data-sku="${item.id}"] .item-quantity-change-increment`
              ).show()
            }

            if (
              $(`.product-item[data-sku="${item.id}"] .add-item-attachment`)
            ) {
              $(
                `.product-item[data-sku="${item.id}"] .add-item-attachment`
              ).show()
            }
          }
        }

        if (item.name.indexOf('Instalação Geladeira') > 0) {
          document
            .querySelector(`.product-item[data-sku="${item.id}"]`)
            .setAttribute('install-item', true)
        }
      })
    }
  }

  removeItems() {
    $('body').on('click', '.bespokeRemove', e => {
      e.preventDefault()
      const currentItems = window.vtexjs.checkout.orderForm.items
      const data = $(e.target).parents('.product-item').data()
      const skuDeleted = data ? data.sku : null

      $(e.target).remove()

      if (skuDeleted) {
        this.removeBespoke(currentItems, skuDeleted, 0)
      }
    })

    $('body').on('click', '.editBespoke', e => {
      e.preventDefault()
      const currentItems = window.vtexjs.checkout.orderForm.items
      const data = $(e.target).parents('.product-item').data()
      const skuEdited = data ? data.sku : null

      $(e.target).remove()

      if (skuEdited) {
        this.clearBespokeRefrigerator(currentItems, skuEdited, true)
      }
    })
  }

  clearBespokeRefrigerator(items, skuEdited, isRedirect) {
    let category = ''

    items.forEach(el => {
      if (skuEdited.toString() === el.id) {
        category = el.productCategoryIds
      }
    })

    const removeList = []

    if (category === this.CATEGORYID) {
      items.forEach((el, i) => {
        if (
          el.productCategoryIds === '/2044/' ||
          el.productCategoryIds === '/30/33/39/2113/'
        ) {
          // id bespoke
          removeList.push({
            index: i,
            quantity: 0,
          })
        }

        if (el.id === this.SKU_BESPOKE_SERVICE) {
          removeList.push({
            index: i,
            quantity: 0,
          })
        }
      })
    }

    const itemsToRemove = removeList

    if (itemsToRemove.length > 0) {
      return window.vtexjs.checkout.removeItems(itemsToRemove).then(() => {
        if (isRedirect) {
          const thePath =
            window.location.pathname.split('/')[1] === 'br' ? '/br' : ''

          window.location.href = `${thePath}/simule-sua-bespoke?create=true`
        } else {
          localStorage.setItem('BespokeItems', '[]')
        }
      })
    }
  }

  removeBespoke(items, skuDeleted, removeManual) {
    let bespokeItems = JSON.parse(localStorage.getItem('BespokeItems'))
    const item = bespokeItems.filter(
      currentItem => currentItem.mainSku === skuDeleted.toString()
    )

    let listSKU = []
    const updateList = []
    let pairingQtdRemove = 0

    listSKU.push(skuDeleted.toString())
    if (item) {
      item.forEach(({ options }) => {
        options.forEach(sku => {
          listSKU.push(sku.sku)
        })
      })
    }

    listSKU = [...new Set(listSKU)]

    items.forEach((currentItem, i) => {
      if (currentItem.id === skuDeleted.toString()) {
        pairingQtdRemove = currentItem.quantity
      }

      const sku = listSKU.find(skuCurrent => skuCurrent === currentItem.id)

      if (sku) {
        updateList.push({
          index: i,
          quantity: 0,
        })
      }

      if (currentItem.id === this.SKU_BESPOKE_PAIR) {
        if (currentItem.quantity > 0) {
          pairingQtdRemove =
            currentItem.quantity - pairingQtdRemove - removeManual

          if (pairingQtdRemove < 0) pairingQtdRemove = 0

          updateList.push({
            index: i,
            quantity: pairingQtdRemove,
          })
        }
      }
    })

    const itemsToUpdate = updateList

    if (itemsToUpdate.length > 0) {
      window.vtexjs.checkout.updateItems(itemsToUpdate).then(orderForm => {
        this.removeButtons(orderForm)
        this.editButton(orderForm)
        let removeIndex = 0

        orderForm.items.forEach((currentItem, i) => {
          if (currentItem.id === this.SKU_BESPOKE_SERVICE) {
            removeIndex = i
          }
        })

        bespokeItems = bespokeItems.filter(
          currentItem => currentItem.mainSku !== skuDeleted.toString()
        )
        localStorage.setItem('BespokeItems', JSON.stringify(bespokeItems))
        removeIndex = [
          {
            index: removeIndex,
            quantity: 0,
          },
        ]
        if (bespokeItems.length === 0) {
          window.vtexjs.checkout.removeItems(removeIndex)
        }
      })
    }
  }

  checkItems({ items }) {
    const bespokeItems = JSON.parse(localStorage.getItem('BespokeItems'))

    bespokeItems.forEach(itemBsk => {
      const findItem = items.find(
        currentItem => currentItem.id === itemBsk.mainSku
      )

      if (findItem) {
        itemBsk.options.forEach(opt => {
          const findOpt = items.find(currentItem => currentItem.id === opt.sku)

          if (!findOpt) {
            this.removeBespoke(items, findItem.id, 0)
          }
        })
      } else {
        let contador = 0
        const itemToRemove = bespokeItems.filter(
          currentItem => currentItem.mainSku === itemBsk.mainSku
        )

        if (itemToRemove) {
          contador = itemToRemove.length
        }

        this.removeBespoke(items, itemBsk.mainSku, contador)
      }
    })

    const checkPairing = items.find(
      currentItem => currentItem.id === this.SKU_BESPOKE_PAIR
    )

    if (checkPairing) {
      if (checkPairing.quantity !== bespokeItems.length - 1) {
        this.clearBespokeRefrigerator(items, bespokeItems[0].mainSku, false)
      }
    }
  }

  editButton({ items }) {
    // Adiciona botões de voltar para bespoke
    const addbespokeBtn = setInterval(() => {
      if ($('.product-item').length > 0) {
        items.forEach(item => {
          this.SKU_MAIN.forEach(sku => {
            if (sku === item.id) {
              if (
                $(`.product-item[data-sku='${item.id}']`).find('.editBespoke')
                  .length === 0
              ) {
                $($(`.product-item[data-sku='${item.id}']`)).find(
                  '.item-remove'
                ).prepend(`
                  <div style="display: flex; align-items: center;">
                    <a href="/simule-sua-bespoke" class="editBespoke btn" style="
                      background-color: #fff;
                      color: #000;
                      border-radius: 20px;
                      display: flex;
                      text-align: center;
                      align-items: center;
                      justify-content: center;
                      padding: 10px 24px;
                      border: 1px solid #000;
                      text-decoration: none;
                      font-size: 14px;
                      font-weight: bold;
                      line-height: 14px;
                      height: fit-content;
                    ">
                      Editar
                    </a>
                    <a class="bespokeRemove" href="javascript:void(0);">
                        <i class="icon icon-remove item-remove-ico"></i>
                        <span class="hide item-remove-text">
                          remover
                        </span>
                    </a>
                  </div>
								`)
              }
            }
          })
        })
        clearInterval(addbespokeBtn)
      }
    }, 10)
  }

  getMandatorySkus() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      const thePath =
        window.location.pathname.split('/')[1] === 'br' ? 'br' : ''

      let url

      if (
        window.location.href.indexOf('samsungbr.') >= 0 ||
        window.location.host.indexOf('shop.') >= 0
      ) {
        url = `${thePath}/api/catalog_system/pub/products/search?fq=C:/30/33/39/2113/`
      } else {
        url = `${thePath}/api/catalog_system/pub/products/search?fq=C:/2044/`
      }

      await fetch(url)
        .then(response => response.json())
        .then(response => {
          response.forEach(product => {
            if (product.productName.indexOf('parelhamento') < 0) {
              product.items.forEach(currentItem => {
                this.SKU_MAIN.push(currentItem.itemId)
              })
            }
          })
        })

      await fetch(
        `${thePath}/api/dataentities/GB/search?_fields=service,pairing,seller`
      )
        .then(response => response.json())
        .then(response => {
          const { service, pairing, seller } = response[0]

          this.SKU_BESPOKE_SERVICE = service
          this.SKU_BESPOKE_PAIR = pairing
          this.SELLER = seller
        })

      resolve(true)
    })
  }

  init() {
    try {
      const bespokeItems = JSON.parse(localStorage.getItem('BespokeItems'))

      if (!bespokeItems) return

      this.getMandatorySkus().then(response => {
        if (response) {
          $(document).ajaxStop(() => {
            this.checkItems(window.vtexjs.checkout.orderForm)
            this.removeButtons(window.vtexjs.checkout.orderForm)
            this.editButton(window.vtexjs.checkout.orderForm)
            this.removeItems()
          })
        } else {
          console.error(
            "There is a problem with Checkout's Bespoke Customization. Please, check out the code. "
          )
        }
      })
    } catch (e) {
      console.error('Bespoke refrigerators', e)
    }
  }
}
