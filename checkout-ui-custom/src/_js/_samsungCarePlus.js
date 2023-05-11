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
        this.popupSSC(items)
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

      const { items } = window.vtexjs.checkout.orderForm
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

  // Adiciona um botão fake e de remover produto para ssc proteção completa e abre um popup ao clicar
  popupSSC(items) {
    try {
      const scpItem = items.filter(item => this.isSamsungCarePlus(item))
      const scpItemFree = scpItem.filter(item => item.sellingPrice === 0)
      const scpItemFreeIds = scpItemFree.map(item => item.id)

      if(scpItemFree.length){
        if ($('.fakeRemove').length === 0) {
          $('.product-item').each(function () {
            const dataSku = $(this).attr('data-sku')
  
            if (scpItemFreeIds.includes(dataSku)) {
              $(
                '<i title="remover" class="fakeRemove"></i>'
              ).appendTo($(`.product-item[data-sku=${dataSku}] .item-remove`))
            }
          })
          if (items) {
            const product = items.filter(item => scpItemFreeIds.includes(item.id))
  
            if (product[0] && product[0].attachments[0]) {
              const nameProduct = product[0].name
              const { idsku } = product[0].attachments[0].content
              const idskusc = product[0].id
  
              $(document).on('click', '.fakeRemove', function () {
                $('body').addClass('modalActive')
                if (
                  product[0] &&
                  product[0].attachments[0] &&
                  product[0].attachments[0].content.idsku
                ) {
                  const name = items.filter(
                    val => val.id === idsku
                  )
  
                  if ($('.modalssc').length == 0 && $('.layerpopup').length == 0) {
                    $(`<div class="layerpopup"></div>
                    <div class="modalssc">
                      <p><b>Atenção</b>: ao excluir <b>${nameProduct}</b>, será removido também 
                        do seu carrinho o item <b>${name[0].name}</b></p>
                      <div>
                        <a>Voltar ao carrinho</a>
                        <a data-id-sc='${idskusc}' data-id='${idsku}'>Excluir</a>
                      </div>
                    </div>`).prependTo($('body'))
                  }
                }
              })
            }
          }
  
          $(document).on('click', '.modalssc div a', function () {
            $('.layerpopup, .modalssc').fadeOut('fast', function () {
              $(this).remove()
            })
          })
          $(document).on('click', '.modalssc div a + a', function () {
            const productId = $(this).attr('data-id')
  
            const interval = 4000
  
            items.forEach((el, i) => {
              setTimeout(function () {
                const removeList = []
  
                if (el.id === productId) {
                  removeList.push({
                    index: i,
                    quantity: 0,
                  })
                  const itemsToRemove = removeList
  
                  if (itemsToRemove.length > 0) {
                    return window.vtexjs.checkout
                      .removeItems(itemsToRemove)
                      .then(() => {})
                  }
                }
              }, i * interval)
            })
          })
        }
      }
      
    } catch (err) {
      console.error(`Erro ao remover produto de Samsung Care Combo Grátis: ${err}`)
    }
  }
}
