/* eslint-disable prettier/prettier */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
export default class CSP {

  checkSelectedDeliveryChannelEquality(objArray) {
    if (!Array.isArray(objArray) || objArray.length === 0) {
      return {
        deliveryOption: null,
        isSame: false
      };
    }
  
    const selectedDeliveryChannel = objArray[0].selectedDeliveryChannel;
    for (const obj of objArray) {
      if (obj.selectedDeliveryChannel !== selectedDeliveryChannel) {
        return {
          deliveryOption: null,
          isSame: false
        };
      }
    }
  
    return {
      deliveryOption: selectedDeliveryChannel,
      isSame: true
    };
  }

  addCSPClass(logistics) {

    const compareResult = this.checkSelectedDeliveryChannelEquality(logistics)

    // console.log('result validade', compareResult)

    if(compareResult.deliveryOption == 'delivery'){
      document.querySelector('.box-step.shipping-summary-placeholder') && document.querySelector('.box-step.shipping-summary-placeholder').classList.add("delivery-class")
      document.querySelector('.pickup-in-point-class') && document.querySelector('.box-step.shipping-summary-placeholder').classList.remove("pickup-in-point-class")
      if(document.querySelector('.customTitleStep1')){
        document.querySelector('.customTitleStep1').style.display = 'none'
        
      }
    }
    if(compareResult.deliveryOption == 'pickup-in-point'){
      document.querySelector('.delivery-class') && document.querySelector('.box-step.shipping-summary-placeholder').classList.remove("delivery-class")
      document.querySelector('.box-step.shipping-summary-placeholder') && document.querySelector('.box-step.shipping-summary-placeholder').classList.add("pickup-in-point-class")
      if(document.querySelector('.customTitleStep1')){
        document.querySelector('.customTitleStep1').style.display = 'show'
      }else{
        document.querySelector('.step.shipping-data .accordion-heading .accordion-toggle').insertAdjacentHTML('afterend','<p class="vtex-omnishipping-1-x-shippingSectionTitle customTitleStep1">1. Escolher opções de retirada</p>')
      }
    }

    if(compareResult.deliveryOption == null) {
      let element = document.querySelector('.shp-info-pickup-identified + .vtex-omnishipping-1-x-btnDelivery')
      document.querySelector('#shipping-data').classList.add("pickup-and-delivery-class")
      if(element) {
        element.click()
      }
    }
  }

  init(orderForm) {
    try {
      this.addCSPClass(orderForm.shippingData?.logisticsInfo)
    } catch (e) {
      console.error('CSP Script Error', e)
    }
  }
}