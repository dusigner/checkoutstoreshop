export default class toastMessages {
  static shouldUpdate = false

  constructor() {
    this._previousItemsQuantity = null
  }

  showToastMessage(message = 'Ação realizada') {
    // Cria container do toast
    const toast = document.createElement('div')
    toast.style.position = 'fixed'
    toast.style.top = '80px'
    toast.style.left = '50%'
    toast.style.transform = 'translateX(-50%)'
    toast.style.backgroundColor = '#313131'
    toast.style.color = '#fff'
    toast.style.padding = '16px 24px'
    toast.style.borderRadius = '8px'
    toast.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
    toast.style.zIndex = '9999'
    toast.style.fontSize = '16px'
    toast.style.display = 'flex'
    toast.style.alignItems = 'center'
    toast.style.justifyContent = 'space-between'
    toast.style.maxWidth = '448px'
    toast.style.width = 'calc(100% - 20px)'
    toast.style.gap = '16px'
    toast.style.boxSizing = 'border-box'
  
    // Cria o texto da mensagem
    const text = document.createElement('span')
    text.innerText = message
    text.style.flex = '1'
    text.style.textAlign = 'center'
    text.style.fontFamily = 'SamsungOne'
    text.style.fontSize = '14px'
    text.style.fontWeight = '700'
  
    // Cria botão de fechar
    const closeBtn = document.createElement('button')
    closeBtn.innerText = '✕'
    closeBtn.style.background = 'transparent'
    closeBtn.style.border = 'none'
    closeBtn.style.color = '#fff'
    closeBtn.style.fontSize = '16px'
    closeBtn.style.cursor = 'pointer'
    closeBtn.style.flexShrink = '0'
  
    // Evento para fechar manualmente
    closeBtn.addEventListener('click', () => {
      toast.style.opacity = '0'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    })
  
    toast.appendChild(text)
    toast.appendChild(closeBtn)
    document.body.appendChild(toast)
  
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 5000)
  }

  notifyItemRemovalFromCart(orderForm) {
    const currentQuantity = orderForm?.items?.reduce((sum, item) => sum + item.quantity, 0)
  
    if (this._previousItemsQuantity !== null && currentQuantity < this._previousItemsQuantity) {
      this.showToastMessage('Item removido do carrinho')
    }
  
    this._previousItemsQuantity = currentQuantity
  }

  notifyMissingBirthDate() {
    this.showToastMessage('Preencha a data de nascimento')
  }

}