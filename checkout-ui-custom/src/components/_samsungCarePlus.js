/* eslint-disable no-inner-declarations */
/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */
/* eslint eqeqeq: 0 */

const SAMSUNG_CARE_CATEGORY = '/2005/'
export default class SamsungCarePlus {
  constructor() {
    this.samsungCareItems = []
  }

  isSamsungCare(item) {
    return item && item.productCategoryIds === SAMSUNG_CARE_CATEGORY
  }

  filterAttachedProducts(samsungCareItem, items) {
    if (!samsungCareItem) {
      return
    }

    const { attachments } = samsungCareItem

    return items.filter(item => {
      return attachments.some(attachment => {
        return item.id === attachment.content.idsku 
      })
    })
  }

  findAttachedProduct(samsungCareItem, items) {
    const { attachments } = samsungCareItem

    return items.find(item => {
      return attachments.some(attachment => {
        return item.id === attachment.content.idsku 
      })
    })
  }

  isDuplicated(samsungCareItem, items) {
    if (!items.length) {
      return
    }

    return items.some(item => item.id === samsungCareItem.id)
  }

  isFree(item) {
    if (!item) {
      return 
    }

    return item.sellingPrice <= 1
  }

  sendSameQuantityAsAttachedItem(event, request) {
    const isUpdateItemRequest = request.url.includes('/items/update/')

    if (!isUpdateItemRequest) {
      return
    }

    try {
      const { items } = window.vtexjs.checkout.orderForm
      const hasSamsungCareInCart = items.some(this.isSamsungCare)

      if (!hasSamsungCareInCart) {
        return
      }

      const payload = JSON.parse(request.data || '{}')
      const { orderItems } = payload
      const [currentItem] = orderItems

      if (!currentItem.id) {
        return
      }
      
      function findSamsungCareById(item) {
        const { attachments } = item

        return attachments.some(attachment => {
          return attachment.content.idsku === currentItem.id
        })
      }

      const samsungCare = items.find(findSamsungCareById)
      const attachedProducts = this.filterAttachedProducts(samsungCare, items)

      if (samsungCare && attachedProducts.length < 2) {
        orderItems.push({
          seller: samsungCare.seller,
          quantity: currentItem.quantity,
          id: samsungCare.id,
          index: items.indexOf(samsungCare),
          hasBundleItems: !!samsungCare.bundleItems.length,
        })
        request.data = JSON.stringify(payload)
      }
    } catch (err) {
      console.error(`Erro ao sincronizar quantidade do Samsung Care: ${err}`)
    }
  }
  
  mountSamsungCareItems(items) {
    try {
      const samsungCaresInCart = items.filter(this.isSamsungCare)
  
      if (!samsungCaresInCart.length) {
        return
      }
  
      const samsungCareItems = samsungCaresInCart.reduce((accumulator, samsungCareItem) => {
        const attachedItem = this.findAttachedProduct(samsungCareItem, items)
        const isFree = this.isFree(samsungCareItem)
        const isDuplicated = accumulator.some(item => (
          JSON.stringify(item.samsungCareItem.attachments) === JSON.stringify(samsungCareItem.attachments)
        ))
        
        accumulator.push({ samsungCareItem, attachedItem, isFree, isDuplicated })
  
        return accumulator
      }, [])
  
      this.samsungCareItems = samsungCareItems
    } catch (err) {
      console.error(`SamsungCarePlus - mountSamsungCareItems: ${err}`);
    }
  }

  hideQuantityButtons(orderForm) {
    if (!orderForm) {
      return
    }

    const { items } = orderForm

    // empty carty
    if (!items || !items.length) {
      return
    }

    items.filter(this.isSamsungCare).forEach(samsungCareItem => {
      const $samsungCareElement = $(`.product-item[data-sku="${samsungCareItem.id}"] .quantity`)
      $samsungCareElement.not('.quantity-samsungCare').addClass('quantity-samsungCare')
    })
  }

  removeUnmatched(items) {
    try {      
      const unmatchedItems = this.samsungCareItems.reduce((accumulator, item) => {
        if (items.indexOf(item.samsungCareItem) < 0) {
          return accumulator
        }
  
        if (!item.attachedItem) {
          accumulator.push({
            index: items.indexOf(item.samsungCareItem),
            quantity: 0
          })
        }
        return accumulator
      }, [])
        
      if (unmatchedItems.length) {
        window.cart.loadingItem(true)
  
        vtexjs.checkout.removeItems(unmatchedItems, null, false).done(function() {
          window.cart.loadingItem(false)
        }).fail(function() {
          window.cart.loadingItem(false)
          this.samsungCareItems = []
        })
      }
    } catch (err) {
      console.error(`SamsungCarePlus - removeUnmatched: ${err}`);
    }
  }

  removeDuplicated(items) {
    try {
      const duplicatedItems = this.samsungCareItems.reduce((accumulator, item) => {
        if (items.indexOf(item.samsungCareItem) < 0) {
          return accumulator
        }
  
        if (item.isDuplicated) {
          accumulator.push({
            index: items.indexOf(item.samsungCareItem),
            quantity: 0
          })
        }
        return accumulator
      }, [])
      
      if (duplicatedItems.length) {
        window.cart.loadingItem(true)
  
        vtexjs.checkout.removeItems(duplicatedItems, null, false).done(function() {
          window.cart.loadingItem(false)
        }).fail(function() {
          window.cart.loadingItem(false)
          this.samsungCareItems = []
        })
      }
    } catch (err) {
      console.error(`SamsungCarePlus - removeDuplicated: ${err}`);
    }
  }

  removeTogether(samsungCareItem, attachedProduct) {
    try {
      const { items } = vtexjs.checkout.orderForm

      if (items.indexOf(samsungCareItem) < 0) {
        return
      }
  
      const itemsToRemove = [
        {
          index: items.indexOf(samsungCareItem),
          quantity: 0
        }
      ]

      // push all attached items
      items.forEach(item => {
        if (item.id === attachedProduct.id) {
          itemsToRemove.push({
            index: items.indexOf(item),
            quantity: 0
          })
        }
      })
    
      window.cart.loadingItem(true)

      vtexjs.checkout.removeItems(itemsToRemove, null, false).done(function() {
        window.cart.loadingItem(false)
      }).fail(function() {
        window.cart.loadingItem(false)
      })
    } catch (err) {
      console.error(`SamsungCarePlus - removeTogether: ${err}`);
    }
  }

  modalRemoveTogether(samsungCareItem, attachedProduct) {
    try {
      const _this = this
  
      if ($('.layerpopup').length) {
        return
      }
  
      const $confirmModal = $(`<div class="layerpopup"></div>
        <div class="modalssc">
          <p><b>Atenção</b>: ao excluir <b>${samsungCareItem.name}</b>, será removido também 
            do seu carrinho o item <b>${attachedProduct.name}</b></p>
          <div>
            <a class="ssc-cancel-action">Voltar ao carrinho</a>
            <a class="ssc-remove-together">Excluir</a>
          </div>
      </div>`)
  
      $confirmModal.prependTo($('body'))
  
      $confirmModal.find('.ssc-remove-together').on('click', function() {
        _this.removeTogether(samsungCareItem, attachedProduct)
      })
  
      $confirmModal.find('.ssc-remove-together, .ssc-cancel-action').on('click', function() {
        $('.modalssc, .layerpopup').remove()
      })
    } catch (err) {
      console.error(`SamsungCarePlus - modalRemoveTogether: ${err}`);
    }
  }

  samsungCareModalTrigger() {
    try {
      const _this = this
  
      this.samsungCareItems.forEach(item => {
        if (!item) {
          return
        }
  
        const { samsungCareItem, attachedItem, isFree } = item
  
        if (samsungCareItem && attachedItem && isFree) {
          const $freeSamsungCareElement = $(`tr.product-item[data-sku="${samsungCareItem.id}"]`)
          const $removeIcon = $freeSamsungCareElement.find('.item-link-remove')
          
          // Remove evento de click da vtex
          $removeIcon.unbind('click')
  
          // Adiciona evento customizado
          $removeIcon.click(function() {
            _this.modalRemoveTogether(samsungCareItem, attachedItem)
          })
        }
      })
    } catch (err) {
      console.error(`SamsungCarePlus - samsungCareModalTrigger: ${err}`);
    }
  }

  updateQuantity(items) {
   try {
    const _this = this

    const itemsToUpdate = this.samsungCareItems.reduce((accumulator, item) => {
      if (items.indexOf(item.attachedItem) < 0) {
        return accumulator
      }

      const attachedItemQuantity = items.reduce((accumulatedQuantity, orderFormItem) => {
        if (orderFormItem.id === item.attachedItem.id) {
          return accumulatedQuantity + orderFormItem.quantity
        }

        return accumulatedQuantity
      }, 0)

      const samsungCareItemQuantity = item.samsungCareItem.quantity

      if ((attachedItemQuantity !== samsungCareItemQuantity)) {
        accumulator.push({
          index: items.indexOf(item.samsungCareItem),
          quantity: attachedItemQuantity
        })
      }
      
      return accumulator
    }, [])
    
    if (itemsToUpdate.length) {
      window.cart.loadingItem(true)

      vtexjs.checkout.updateItems(itemsToUpdate, null, false).done(function (orderForm) {
        window.cart.loadingItem(false)
        _this.removeDuplicated(orderForm.items)
      }).fail(function() {
        window.cart.loadingItem(false)
        this.samsungCareItems = []
      })
    }
   } catch (err) {
     console.error(`SamsungCarePlus - updateQuantity: ${err}`);
   }
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

      this.mountSamsungCareItems(items)
      this.removeDuplicated(items)
      this.updateQuantity(items)
      this.removeUnmatched(items)
    } catch (err) {
      console.error(`Não foi possível sincronizar Samsung Care items: ${err}`)
    }
  }
}
