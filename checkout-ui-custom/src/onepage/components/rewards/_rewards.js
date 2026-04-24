import {
    createLayoutElementTotalPoints,
    createLayoutGroupCalcRewards,
    createLayoutMessageObs,
    createLayoutRewardsTotalDiscount,
  } from './_layout'
  import { rootPath } from '../utils/_rootPath'
  import { PAYLOAD_REWARDS_DEFAULT } from './constants/_payloadRequest'
  
  export class Rewards {
    constructor() {
      this.userAcceptedRewards = false
      this.emailUserRewards = ''
      this.userSaGuid = ''
      this.totalPointsCurrentOrder = 0
      this.totalPointsUser = 0
      this.totalCurrencyUser = 0
      this.pricePerPoint = 0
      this.chosenDiscount = 0
      this.isApplyingRewards = false
      this.orderFormId = ''
      this.isOrderFormListenerBound = false
    }

    bindOrderFormSync() {
      if (this.isOrderFormListenerBound) return

      $(window).on('orderFormUpdated.vtex', (_, orderForm) => {
        if (!orderForm) return

        this.orderFormId = orderForm.orderFormId || ''
      })

      this.isOrderFormListenerBound = true
    }

    waitOrderFormUpdate(previousOrderFormId = '') {
      return new Promise((resolve, reject) => {
        let timeout = null

        const cleanup = () => {
          $(window).off('orderFormUpdated.vtex.rewardsSync', handler)
          if (timeout) {
            clearTimeout(timeout)
          }
        }

        const handler = (_, orderForm) => {
          if (!orderForm) return

          const hasNewForm =
            !previousOrderFormId || orderForm.orderFormId !== previousOrderFormId
          const hasRewardsGiftCard = orderForm.paymentData?.giftCards?.some(
            giftCard => giftCard.provider === 'SSG_REWARDS'
          )

          if (hasNewForm || hasRewardsGiftCard || orderForm.orderFormId) {
            this.orderFormId = orderForm.orderFormId || ''
            cleanup()
            resolve(orderForm)
          }
        }

        $(window).on('orderFormUpdated.vtex.rewardsSync', handler)

        timeout = setTimeout(() => {
          cleanup()
          reject(new Error('Timeout waiting orderFormUpdated.vtex'))
        }, 10000)
      })
    }

    isRewardsGiftCardApplied(orderForm) {
      if (!orderForm?.paymentData?.giftCards) return false

      return orderForm.paymentData.giftCards.some(
        giftCard =>
          giftCard.provider === 'SSG_REWARDS' &&
          giftCard.inUse &&
          Number(giftCard.value) > 0
      )
    }

    async updatePaymentDataGiftCards(giftCards = []) {
      const { checkout } = window.vtexjs || {}
      const orderForm = checkout?.orderForm

      if (!checkout || !orderForm) return null

      const paymentData = orderForm.paymentData || {}
      const expectedOrderFormId = orderForm.orderFormId || this.orderFormId || ''

      const updatedPaymentData = {
        ...paymentData,
        giftCards,
      }

      const updatePromise = this.waitOrderFormUpdate(expectedOrderFormId)

      await checkout.sendAttachment('paymentData', updatedPaymentData)
      const updatedOrderForm = await updatePromise

      return updatedOrderForm
    }
  
    getRewardsData(docId) {
      if (this.emailUserRewards !== docId || !this.userAcceptedRewards) {
        $.ajax({
          url: `${rootPath()}/_v/private/aem-masterdata/v1/get/clients/custom`,
          headers: {
            Accept: 'application/vnd.vtex.ds.v10+json',
            'Content-Type': 'application/json',
          },
          crossDomain: true,
          cache: false,
          type: 'GET',
          success: res => {
            if (this.emailUserRewards !== docId) {
              window.localStorage.setItem('saGuid', res[0].saGuid || '')
              if (window._satellite) {
                window._satellite.setVar('GUID', res[0].saGuid || '')
              }
  
              this.userSaGuid = res[0].saGuid
              this.emailUserRewards = docId
            }
  
            if (!res[0].isRewardsAccepted && res[0].saGuid) {
              $('#RewardsBlock').show()
              $('#inputRewards').attr('checked', false)
              this.userAcceptedRewards = false
            } else if (res[0].isRewardsAccepted && res[0].saGuid) {
              $('#RewardsBlock').hide()
              $('#inputRewards').attr('checked', true)
              this.userAcceptedRewards = true
              if (window.location.hash === '#/payment') {
                this.getPointsSearch()
                this.showRewardsCalc()
                this.showObsRewards()
              }
            }
          },
          error: err => {
            return () => {
              console.error('get client rewards data error', err)
            }
          },
        })
      } else if (this.userSaGuid && this.userAcceptedRewards) {
        if (window.location.hash === '#/payment') {
          this.getPointsSearch()
          this.showRewardsCalc()
          this.showObsRewards()
        }
      }
    }
  
    createElementTotalPoints(points) {
      try {
        const _checkoutElem = $(`.summary-totalizers .table`)
  
        const { _component, _componentVtexId } = createLayoutElementTotalPoints({
          totalPointsCurrentOrder: this.totalPointsCurrentOrder,
        })
  
        if (_checkoutElem.find('#total-details-rewards').length > 0) {
          _checkoutElem.find('#total-details-rewards').remove()
        }
  
        if (points > 0 && this.userSaGuid && this.userAcceptedRewards) {
          _checkoutElem.append(_component)
        } else if (
          points > 0 &&
          (!this.userSaGuid || !this.userAcceptedRewards)
        ) {
          _checkoutElem.append(_componentVtexId)
        }
      } catch (e) {
        console.error('createElementTotalPoints error:', e)
      }
    }
  
    showRewardsCalc() {
      const saGuid = localStorage.getItem('saGuid')
  
      if (!saGuid) return
  
      $('#group-all-rewards').show()
    }
  
    createRewardsTotalDiscount(discount) {
      if ($('.rewards-total-discount').length === 0) {
        const { _component } = createLayoutRewardsTotalDiscount({ discount })
  
        $('.totalizers-list').append(_component)
  
        $('body').on('click', '#rewards-remove-discount', () => {
          this.cancelRewardsDiscount()
        })
  
        return null
      }
  
      return null
    }
  
    showObsRewards() {
      try {
        const { orderForm } = window.vtexjs.checkout
        const saGuid = localStorage.getItem('saGuid')
  
        if (
          orderForm.items.length === 0 &&
          $('#text-details-rewards').length > 0
        ) {
          $('#text-details-rewards').remove()
        }
  
        if (orderForm.items.length === 0) return
  
        if (orderForm.totalizers.length === 0) return
  
        const _checkoutElem = $(`.cart-fixed`)
        const _cartElem = $(`.summary-to-new-components`)
        const { _component } = createLayoutMessageObs(saGuid)
  
        if (
          _checkoutElem.find('#text-details-rewards').length > 0 ||
          _cartElem.find('#text-details-rewards').length > 0
        ) {
          return
        }
  
        _cartElem.append(_component)
        _checkoutElem.append(_component)
      } catch (e) {
        console.error('showObsRewards error:', e)
      }
    }
  
    createGroupCalcRewards() {
      if ($('#group-calc-rewards').length !== 0) return
  
      $('.link-gift-card').after(
        createLayoutGroupCalcRewards({
          totalPointsUser: this.totalPointsUser,
        })
      )
  
      this.showRewardsCalc()
      
      const { orderForm } = window.vtexjs.checkout
  
      if (orderForm.paymentData.giftCards) {
        const giftRewards = orderForm.paymentData.giftCards.filter(
          g => g.provider === 'SSG_REWARDS'
        )
  
        if (
          giftRewards.length &&
          giftRewards[0].inUse &&
          giftRewards[0].value > 0
        ) {
          $('.switch-rewards input')[0].checked = true
          $('.text-switch-rewards').text('Você está utilizando seus pontos nessa compra. Essa transição poderá utilizar todos os seus pontos.')
          $('#group-all-rewards').show()
        } else {
          $('.text-switch-rewards').text('Clique para utilizar seus pontos nessa compra. Essa transição poderá utilizar todos os seus pontos.')
        }
      }
  
      $(document).on('change', '.switch-rewards input', () => {
        const inputChecked = $('.switch-rewards input')[0].checked

        $('.switch-rewards input').prop('disabled', true)
  
        if (inputChecked) {
          $('.text-switch-rewards').text('Você está utilizando seus pontos nessa compra. Essa transição poderá utilizar todos os seus pontos.')
          this.setRewardsDiscount()
        } else {
          $('.text-switch-rewards').text(
            'Clique para utilizar seus pontos nessa compra. Essa transição poderá utilizar todos os seus pontos.'
          )
          this.cancelRewardsDiscount()
        }
      })
    }
  
    getPointsSearch() {
      const { orderForm } = window.vtexjs.checkout
  
      let TotalShipping = 0
  
      if (
        orderForm.totalizers.find(item => {
          return item.id === 'Shipping'
        })
      ) {
        TotalShipping = orderForm.totalizers.find(item => {
          return item.id === 'Shipping'
        }).value
      }
  
      if (orderForm.orderFormId && this.userSaGuid && this.userAcceptedRewards) {
        const data = {
          ...PAYLOAD_REWARDS_DEFAULT,
          Id: orderForm.orderFormId,
          CountryDescription: 'BR',
        }
  
        $.ajax({
          url: `${rootPath()}/_v/private/rewards/points/search`,
          type: 'POST',
          data: JSON.stringify(data),
          dataType: 'json',
          contentType: 'application/json',
          success: res => {
            this.totalPointsUser = res.PointBalance
            this.totalCurrencyUser = res.ExchangedAmount
            this.pricePerPoint = res.ExchangedAmount / res.PointBalance
            this.chosenDiscount = Math.min(
              Math.max(res.ExchangedAmount, 0),
              (orderForm.value - TotalShipping) / 100 / 2
            )
            this.createGroupCalcRewards()
            if (this.totalPointsUser > 0) {
              $('#show-rewards-parent').css('display', 'block')
            }
          },
          error() {
            console.error('points search error')
          },
        })
      }
    }
  
    async setRewardsDiscount() {
      if (this.isApplyingRewards) return

      const { checkout } = window.vtexjs || {}
      const orderForm = checkout?.orderForm

      if (!checkout || !orderForm || this.chosenDiscount <= 0) {
        $('.switch-rewards input').prop('disabled', false)
        return
      }

      if (this.isRewardsGiftCardApplied(orderForm)) {
        $('#show-rewards-parent').addClass('disabled')
        $('.switch-rewards input').prop('disabled', false)
        return
      }

      this.isApplyingRewards = true

      try {
        const rewardsGiftCard = {
          redemptionCode: 'SSG_REWARDS',
          provider: 'SSG_REWARDS',
          value: Math.round(this.chosenDiscount * 100),
          inUse: true,
        }

        const nonRewardsGiftCards = (orderForm.paymentData?.giftCards || []).filter(
          giftCard => giftCard.provider !== 'SSG_REWARDS'
        )

        await this.updatePaymentDataGiftCards([
          ...nonRewardsGiftCards,
          rewardsGiftCard,
        ])

        $('#show-rewards-parent').addClass('disabled')
      } catch (error) {
        console.error('setRewardsDiscount error:', error)
      } finally {
        this.isApplyingRewards = false
        $('.switch-rewards input').prop('disabled', false)
      }
    }

    async cancelRewardsDiscount(verify = false) {
      if (this.isApplyingRewards) return

      const { checkout } = window.vtexjs || {}
      const orderForm = checkout?.orderForm

      if (!checkout || !orderForm) return

      const rewardsDiscount =
        orderForm.paymentData?.giftCards?.find(g => g.provider === 'SSG_REWARDS') ||
        null

      if (!rewardsDiscount || Number(rewardsDiscount.value) === 0) {
        if ($('.switch-rewards input').length > 0) {
          $('.switch-rewards input')[0].checked = false
        }
        $('.switch-rewards input').prop('disabled', false)
        return
      }

      let TotalShipping = 0

      if (
        orderForm.totalizers.find(item => {
          return item.id === 'Shipping'
        })
      ) {
        TotalShipping = orderForm.totalizers.find(item => {
          return item.id === 'Shipping'
        }).value
      }

      if (!verify) {
        return this.removeRewardsGiftCard(orderForm)
      }

      const rewardsOrder = Number(rewardsDiscount.value)

      const totalOrder = orderForm.value

      // verify if value of rewards is more than 50% of order's total
      if (verify && (totalOrder - TotalShipping) / 2 < rewardsOrder) {
        await this.removeRewardsGiftCard(orderForm)
      }
    }

    async removeRewardsGiftCard(orderFormParam) {
      const orderForm = orderFormParam || window.vtexjs?.checkout?.orderForm
      if (!orderForm) return

      this.isApplyingRewards = true

      try {
        const nonRewardsGiftCards = (orderForm.paymentData?.giftCards || []).filter(
          giftCard => giftCard.provider !== 'SSG_REWARDS'
        )

        await this.updatePaymentDataGiftCards(nonRewardsGiftCards)
      } catch (error) {
        console.error('cancelRewardsDiscount error:', error)
      } finally {
        this.isApplyingRewards = false
        if ($('.switch-rewards input').length > 0) {
          $('.switch-rewards input')[0].checked = false
        }
        $('.switch-rewards input').prop('disabled', false)
      }
    }
  
    showPointsSimulation() {
      const { orderForm } = window.vtexjs.checkout

      if (orderForm.loggedIn) {
        this.getRewardsData(orderForm.clientProfileData.email)
      }
  
      if (window.location.hash !== '#/payment') return
  
      if (orderForm.items.length === 0) return
  
      if (orderForm.totalizers.length === 0) return
  
      if (orderForm.paymentData.giftCards) {
        const giftRewards = orderForm.paymentData.giftCards.filter(
          g => g.provider === 'SSG_REWARDS'
        )
  
        if (
          giftRewards.length &&
          giftRewards[0].inUse &&
          giftRewards[0].value > 0
        ) {
          this.createRewardsTotalDiscount(giftRewards[0].value / 100)
        } else {
          $('.rewards-total-discount').remove()
        }
      } else {
        $('.rewards-total-discount').remove()
      }
  
      if ($('.switch-rewards input').length > 0) {
        $('.switch-rewards input').prop('disabled', false)
      }
  
      const rewardsAccepted = $('#inputRewards').is(':checked')
  
      const data = {
        SAGuid: this.userSaGuid || localStorage.getItem('saGuid') || 'GUEST',
        rewardsAccepted: this.userRewardsAccepted || rewardsAccepted,
        orderFormId: orderForm.orderFormId,
      }
  
      $.ajax({
        url: `${rootPath()}/rewards/points/simulation`,
        type: 'POST',
        cache: false,
        data: JSON.stringify(data),
        success: res => {
          if (this.totalPointsCurrentOrder === res.TotalPointAmount) return
          const saGuid = localStorage.getItem('saGuid')
  
          if (!saGuid) return
  
          this.totalPointsCurrentOrder = res.TotalPointAmount
          this.putCustomData(data)
          this.createElementTotalPoints(res.TotalPointAmount)
        },
        error: err => {
          return () => {
            console.error('points simulation error', err)
          }
        },
      })
      
    }
    async putCustomData(data) {
  
      const dataRewards = {
          total_points_earned: this.totalPointsCurrentOrder,
          terms_accepted: data.rewardsAccepted,
          saguid: data.SAGuid,
      }
  
      try {
        await $.ajax({
          url: `${rootPath()}/v1/pub/putCheckoutCustomData/${data.orderFormId}/rewards`,
          type: 'PUT',
          crossDomain: true,
          accept: 'application/vnd.vtex.ds.v10+json',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify(dataRewards),
        })
  
      } catch (error) {
        console.error('Error in putCustomData Rewards:', error)
      }
    }
  }
  
