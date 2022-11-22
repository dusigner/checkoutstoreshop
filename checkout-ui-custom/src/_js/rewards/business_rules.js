import renderRewards from './render'

export default class Rewards {
  constructor() {
    this.userAcceptedRewards = false
    this.emailUserRewards = ''
    this.alreadyRedirected = false
    this.userSaGuid = ''
    this.totalPointsCurrentOrder = 0
    this.totalPointsUser = 0
    this.totalCurrencyUser = 0
    this.pricePerPoint = 0
    this.chosenDiscount = 0
  }

  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  ajaxQuery(dataObj, callbackSuccess, callbackError) {
    $.ajax({
      url: `${this.rootPath()}${dataObj.path}`,
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
      },
      crossDomain: true,
      cache: false,
      type: dataObj.method,
      data: dataObj.data,
      success: response => {
        return callbackSuccess(response)
      },
      error: error => {
        return callbackError ? callbackError(error) : null
      },
    })
  }

  getRewardsData(docId) {
    const _hideRewardsBlock = () => {
      $('#RewardsBlock').hide()
      $('#inputRewards').attr('checked', true)
      renderRewards.createButtonRewards()
      renderRewards.getPointsSearch()
    }

    if (this.emailUserRewards !== docId || !this.userAcceptedRewards) {
      const _getRewardsDataAjaxSuccess = data => {
        if (this.emailUserRewards !== docId) {
          window.localStorage.setItem('saGuid', data[0].saGuid || '')
          this.userSaGuid = data[0].saGuid
          this.emailUserRewards = docId
        }

        if (
          !data[0].isRewardsAccepted &&
          (data[0].saGuid ||
            this.emailUserRewards.includes('@partner.sdslasupport.com'))
        ) {
          $('#RewardsBlock').show()
          $('#inputRewards').attr('checked', true)
          this.userAcceptedRewards = false
          if (!this.alreadyRedirected) {
            window.location.href = '#/profile'
            this.alreadyRedirected = true
          }
        } else if (
          data[0].isRewardsAccepted &&
          (data[0].saGuid ||
            this.emailUserRewards.includes('@partner.sdslasupport.com'))
        ) {
          _hideRewardsBlock()
          this.userAcceptedRewards = true
        }
      }

      this.ajaxQuery(
        `/_v/get/client/${docId}`,
        'GET',
        null,
        _getRewardsDataAjaxSuccess,
        null
      )
    } else if (this.userSaGuid && this.userAcceptedRewards) {
      _hideRewardsBlock()
    }
  }

  showPointsSimulation() {
    // console.log('+++++++++++++showPointsSimulation+++++++++++++')
    const { orderForm } = window.vtexjs.checkout

    if (orderForm.loggedIn) {
      this.getRewardsData(orderForm.clientProfileData.email)
    }

    if (!orderForm.items) return
    const productItems = orderForm.items.map(item => {
      return {
        ObjectType: 'ESTORE_BR',
        ObjectId: item.id,
        // AMOUNT É O VALOR UNITARIO OU TOTAL?
        Amount: item.sellingPrice / 100,
        // CASO PRECISE ENVIAR O VALOR TOTAL:
        // Amount: (item.sellingPrice/100) * item.quantity,
        Quantity: item.quantity,
      }
    })

    const data = {
      Id: orderForm.orderFormId,
      Timestamp: new Date().toISOString().split('Z')[0],
      ContactIdOrigin: 'ESTORE',
      SAGuid: this.userSaGuid || 'GUEST',
      CountryDescription: 'BR',
      productItems,
    }

    const _showPointsSimulationAjaxSuccess = res => {
      if (this.totalPointsCurrentOrder === res.ExchangedAmount) return
      this.totalPointsCurrentOrder = res.ExchangedAmount
      this.putRewardsOnCustomData(orderForm.orderFormId, res.ExchangedAmount)
      $('#total-details-points').remove()
      $('#total-details-points-payment').remove()
      $('#total-details-points-payment-notssgcare').remove
      this.createElementTotalPoints(res.ExchangedAmount)
    }

    this.ajaxQuery(
      '/rewards/points/simulation',
      'POST',
      data,
      _showPointsSimulationAjaxSuccess,
      console.error('points simulation error')
    )
  }

  getPointsSearch() {
    if (!window.vtexjs.checkout.orderForm.orderFormId) return
    const data = {
      Id: window.vtexjs.checkout.orderForm.orderFormId,
      Timestamp: new Date().toISOString().split('Z')[0],
      RequestType: 'R',
      SAGuid: this.userSaGuid,
      CountryDescription: 'BR',
    }

    const _getPointsSearchAjaxSuccess = res => {
      this.totalPointsUser = res.PointBalance
      this.totalCurrencyUser = res.ExchangedAmount
      this.pricePerPoint = res.ExchangedAmount / res.PointBalance
    }

    this.ajaxQuery(
      '/rewards/points/search',
      'POST',
      JSON.stringify(data),
      _getPointsSearchAjaxSuccess,
      console.error('points search error')
    )
    // $.ajax({
    //   data: JSON.stringify(data),
    //     dataType: 'json',
    //     contentType:  'application/json'
    // })

    renderRewards.createGroupCalcRewards(
      this.totalPointsUser,
      this.totalCurrencyUser
    )
  }

  calcDiscountValue(discount) {
    if (!(discount <= this.totalPointsUser)) return
    // chosenDiscount = discount * pricePerPoint;
    this.chosenDiscount = discount * 1
    const element = document.querySelector('#input-rewards-currency')

    element.value = `R$ ${this.chosenDiscount}`
  }

  setRewardsDiscount() {
    const element = document.querySelector(
      '.gift-card-provider-group-ssg_rewards .input-prepend input'
    )

    const evt = new KeyboardEvent('keydown', { key: 'a' })

    // element.value = chosenDiscount;
    element.value = 1000
    element.focus()
    element.dispatchEvent(evt)
  }

  cancelRewardsDiscount() {
    const element = document.querySelector(
      '.gift-card-provider-group-ssg_rewards .action a'
    )

    element.click()
    $('#rewards-total-discount').remove()
  }

  putRewardsOnCustomData(orderFormId, points) {
    const newData = { total_points_earned: points }

    this.ajaxQuery(
      `/v1/pub/putCheckoutCustomData/${orderFormId}/rewards`,
      'PUT',
      JSON.stringify(newData)
      // console.log("Sucess!!"),
      // console.log("fail...")
    )
  }

  bindEvents() {
    $('body').on('click', '#btn-add-gift-card', () => {
      $('#show-gift-card-group').show()
    })
  }
}
// .
/* $("#show-gift-card-group").live('click',function(){
  $(".link-gift-card").show();
  $("#show-gift-card-group").hide();
}); */

// SE TIVER DESCONTO DEVE MANDAR O DESCONTO PROPORCIONAL POR ITENS PARA O SIMULATION DEVE OS PONTOS !!!!! FAZER ISSO APOS TASK DA CALCULADORA !!!

// END REWARDS
