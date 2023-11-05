export default class CheckoutLimit {
  constructor() {
    this.limit = 5
    this.itemsToUpdate = {
      duplicatedItems: [],
      singleItems: []
    }
  }

  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  limitQuantity(event, request) {
    const isUpdateItemRequest = request.url.includes('/items/update/')

    if (!isUpdateItemRequest) {
      return
    }

    try {
      const { items } = window.vtexjs.checkout.orderForm

      const payload = JSON.parse(request.data || '{}')
      const { orderItems } = payload
      const [currentItem] = orderItems

      if (!currentItem.id) {
        return
      }

      this.lockItem(currentItem.id)
      const notSamsungCare = (item) => item.productCategoryIds !== '/2005/'
      
      const updateItem = items.find(item => item.id === currentItem.id)
      let quantity = currentItem.quantity

      const [duplicatedItem] = items.filter(notSamsungCare).filter(
        item => item.id === currentItem.id && items.indexOf(item) !== currentItem.index
      )
      
      if (duplicatedItem) {
        quantity += duplicatedItem.quantity
      }
      if (duplicatedItem && quantity > this.limit) {
         orderItems.push({
          seller: duplicatedItem.seller,
          quantity: 0,
          id: duplicatedItem.id,
          index: items.indexOf(duplicatedItem),
          hasBundleItems: !!duplicatedItem.bundleItems.length,
        })
      }

      if (quantity > this.limit) {
        currentItem.quantity = this.limit
        this.triggerWarning(updateItem)
        request.data = JSON.stringify(payload)
      }
    } catch (err) {
      console.error(`Erro ao limitar quantidade do item: ${err}`)
    }
  }

  lockItem(itemId){
    const $item = $(`tr.product-item[data-sku=${itemId}]`)
    $item.find('.item-quantity-change-increment').not('.disabled').addClass('disabled')
  }

  unlockItem(itemId){
    const $item = $(`tr.product-item[data-sku=${itemId}]`)
    $item.find('.item-quantity-change-increment.disabled').removeClass('disabled')
  }

  lockIncrementButtons (orderForm) {
    try {
      if (!orderForm) {
        return
      }
  
      const { items } = orderForm
  
      // empty carty
      if (!items || !items.length) {
        return
      }
  
      const notSamsungCare = (item) => item.productCategoryIds !== '/2005/'
  
      items.filter(notSamsungCare).forEach((currentItem) => {
        const id = currentItem.id
        const [item, duplicatedItem] = items.filter(item => item.id === id)
        let quantity = item.quantity
  
        if (duplicatedItem) {
          quantity += duplicatedItem.quantity
        }
        if (quantity >= this.limit) {
          this.lockItem(item.id)
        } else {
          this.unlockItem(item.id)
        }
      })
    } catch (err) {
      console.error(`CheckoutLimit - lockIncrementButtons: ${err}`)
    }
  }

  triggerWarning(itemsToUpdate) {
    try {
      const _this = this
    
      if(_this.limit != null){
        return Swal.fire({
          icon: "warning",
          text: `A quantidade do produto ${itemsToUpdate.name} será atualizada para ${_this.limit} unidades.`
        })
      }

    } catch (err) {
      console.error(`CheckoutLimit - triggerWarning: ${err}`)
    }
  }

  mountItemsToUpdate(orderForm) {
    try {
      if (!orderForm) {
        return
      }
  
      const { items } = orderForm
  
      // empty carty
      if (!items || !items.length) {
        return
      }
  
      const notSamsungCare = (item) => item.productCategoryIds !== '/2005/'
  
      const itemsToUpdate = items.filter(notSamsungCare).reduce((acc, currentItem) => {
        const id = currentItem.id
        const [item, duplicatedItem] = items.filter(item => item.id === id)
        let quantity = item.quantity
  
        if (duplicatedItem) {
          quantity += duplicatedItem.quantity
        }
        if (quantity > this.limit) {
          const singleItemToUpdate = {
            index: items.indexOf(item),
            quantity: this.limit,
            name: item.name
          }
  
          if (duplicatedItem) {
            const duplicatedItemToUpdate = {
              index: items.indexOf(duplicatedItem),
              quantity: 0,
              name: duplicatedItem.name
            }
            
            const itemsToUpdate = [singleItemToUpdate, duplicatedItemToUpdate]
            const alreadyExists = acc.duplicatedItems.some(
              item => JSON.stringify(item) === JSON.stringify(itemsToUpdate)
            )
  
            if (!alreadyExists) {
              acc.duplicatedItems.push(itemsToUpdate)
            }
          } else {
            const itemsToUpdate = [singleItemToUpdate]
            const alreadyExists = acc.singleItems.some(
              item => JSON.stringify(item) === JSON.stringify(itemsToUpdate)
            )
  
            if (!alreadyExists) {
              acc.singleItems.push(itemsToUpdate)
            }
          }
        }
  
        return acc
      }, {
        duplicatedItems: [],
        singleItems: []
      })
  
      this.itemsToUpdate = itemsToUpdate
    } catch (err) {
      console.error(`CheckoutLimit - mountItemsToUpdate: ${err}`)
    }
  }

  updateItem(itemsToUpdate) {
    try {
      if (!itemsToUpdate || !itemsToUpdate.length) {
        return
      }
  
      this.triggerWarning(itemsToUpdate[0]).then(() => {
        window.vtexjs.checkout.updateItems(itemsToUpdate, null, false).fail(() => {
          this.itemsToUpdate = {
            duplicatedItems: [],
            singleItems: []
          }
        })
      })
    } catch (err) {
      console.error(`CheckoutLimit - updateItem: ${err}`)
    }
  }

  updateQuantities() {
    try {
      const _this = this
  
      if (!this.itemsToUpdate) {
        return
      }
  
      if (this.itemsToUpdate.duplicatedItems && this.itemsToUpdate.duplicatedItems.length) {      
        this.itemsToUpdate.duplicatedItems.forEach(itemsToUpdate => {
          _this.updateItem(itemsToUpdate)
        })
      }
  
      if (this.itemsToUpdate.singleItems && this.itemsToUpdate.singleItems.length) {      
        this.itemsToUpdate.singleItems.forEach(itemsToUpdate => {
          _this.updateItem(itemsToUpdate)
        })
      }
    } catch (err) {
      console.error(`CheckoutLimit - updateQuantities: ${err}`)
    }
  }

  sync(orderForm) {
    if (!this.limit) {
      return
    }

    try {
      this.mountItemsToUpdate(orderForm)
      this.updateQuantities()
    } catch (err) {
      console.error(`Could not sync items quantities: ${err}`)
    }
  }

  init() {
    this.limit = 5
  }
}
