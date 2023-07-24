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
      if(document.querySelector('.customTitleStep1')){
        document.querySelector('.customTitleStep1').style.display = 'none'
      }
    }
    if(compareResult.deliveryOption == 'pickup-in-point'){
      if(document.querySelector('.customTitleStep1')){
        document.querySelector('.customTitleStep1').style.display = 'show'
      }else{
        document.querySelector('.step.shipping-data .accordion-heading .accordion-toggle').insertAdjacentHTML('afterend','<p class="vtex-omnishipping-1-x-shippingSectionTitle customTitleStep1">1. Escolher opções de retirada</p>')
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