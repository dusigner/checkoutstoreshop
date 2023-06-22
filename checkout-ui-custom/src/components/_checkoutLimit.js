export default class CheckoutLimit {
  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  changeItem(itemId, action){
    const checkSelector = setInterval(()=>{
      if(document.querySelector(`.product-item[data-sku="${itemId}"]`)){
        clearInterval(checkSelector)

        if(action == 'hide'){
          document.querySelector(`.product-item[data-sku="${itemId}"] .item-quantity-change-increment`).style.opacity = '0.2'
          document.querySelector(`.product-item[data-sku="${itemId}"] .item-quantity-change-increment`).classList.add('disabled')
        }
        if(action == 'show'){
          document.querySelector(`.product-item[data-sku="${itemId}"] .item-quantity-change-increment`).style.opacity = '1'
          document.querySelector(`.product-item[data-sku="${itemId}"] .item-quantity-change-increment`).classList.remove('disabled')
        }
      }
    },400)

  }

  async init(orderForm) {

    if(!sessionStorage.skuLimit){
      await fetch(
        `${this.rootPath()}/api/dataentities/LS/search?_fields=limit`
      ).then(response => response.json())
      .then(response => {
        sessionStorage.skuLimit = response[0].limit
      })
    }
    orderForm.items.forEach((item, index) => {
      if(item.quantity == sessionStorage.skuLimit){
        this.changeItem(item.id, 'hide')
        return null
      }
      if(item.quantity > sessionStorage.skuLimit){

        const that = this
        Swal.fire({
          icon: "warning",
          text: `A quantidade do produto ${item.name} será atualizada para ${sessionStorage.skuLimit} unidades.`
        }).then(()=>{
          that.changeItem(item.id, 'hide')

          let updateItem = {
            index: index,
            quantity: sessionStorage.skuLimit
          };
          return vtexjs.checkout.updateItems([updateItem], null, false);
        })

      }
      if(item.quantity < sessionStorage.skuLimit){
        this.changeItem(item.id, 'show')
        return null
      }
    })
  }
}
