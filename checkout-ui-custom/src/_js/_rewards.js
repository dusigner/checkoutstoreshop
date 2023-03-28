import { formatNumberBRL } from './_utils'

export default class Rewards {
  constructor() {
    this.userAcceptedRewards = false
    this.emailUserRewards = ''
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

  getRewardsData(docId) {
    if (this.emailUserRewards !== docId || !this.userAcceptedRewards) {
      $.ajax({
        url: `${this.rootPath()}/_v/get/client/${docId}`,
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
              this.createButtonRewards()
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
      // $('#RewardsBlock').hide()
      // $('#inputRewards').attr('checked', true)
      if (window.location.hash === '#/payment') {
        this.getPointsSearch()
        this.createButtonRewards()
      }
    }
  }

  putRewardsOnCustomData(orderFormId, points) {
    const newData = {
      total_points_earned: points,
      terms_accepted: this.userAcceptedRewards,
      saguid: this.userSaGuid || '0',
    }

    $.ajax({
      url: `${this.rootPath()}/v1/pub/putCheckoutCustomData/${orderFormId}/rewards`,
      type: 'PUT',
      crossDomain: true,
      accept: 'application/vnd.vtex.ds.v10+json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(newData),
    })
  }

  createElementTotalPoints(points) {
    try {
      const _checkoutElem = $(`.summary-totalizers .table`)
      const _component = `
        <tbody id="total-details-rewards" style="border-top: 1px solid #cbcbcb;">
          <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;">
            <td id="td-text-rewards-total" style="font-size: 14px; color: #000; font-weight: 400">
              Pontos Rewards gerados para sua próxima compra**
            </td>
            <td id="total-points-value" style="font-size: 14px; color: #2189FF; font-weight: 800; text-align: right !important">${formatNumberBRL(
              this.totalPointsCurrentOrder
            )} Pontos</td>
          </tr>
        </tbody>
      `

      const _componentVtexId = `
      <tbody id="total-details-rewards" style="border-top: 1px solid #cbcbcb;">
        <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;">
          <td id="td-text-rewards-total" style="font-size: 14px; color: #000; font-weight: 400">
            **Pontos Rewards (Gerados apenas quando utilizado Samsung Account)
          </td>
          <td id="total-points-value" style="font-size: 14px; color: #2189FF; font-weight: 800; text-align: right !important">${formatNumberBRL(
            this.totalPointsCurrentOrder
          )} Pontos</td>
        </tr>
      </tbody>
      `

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

  createButtonRewards() {
    if ($('#show-rewards-parent').length !== 0) return

    $('.link-gift-card').after(`
      <p class="link link-gift-card" id="show-rewards-parent" style="display: none; grid-area: rewards-btn; margin-left: 20px">
        <a id="show-rewards-group" class="link-payment-discounts-cod">
          Resgatar pontos Rewards
        </a>
      </p>
    `)

    $('body').on('click', '#show-rewards-group', () => {
      this.showRewardsCalc()
    })
  }

  showRewardsCalc() {
    $('#group-all-rewards').show()
    $('#show-rewards-parent').addClass('disabled')
  }

  createRewardsTotalDiscount(discount) {
    if ($('.rewards-total-discount').length === 0) {
      $('.totalizers-list').append(`
        <tr class="rewards-total-discount">
          <td class="info">Rewards</td>
          <td class="space"></td>
          <td class="monetary" style="color: #000">- ${discount.toLocaleString(
            'pt-BR',
            { style: 'currency', currency: 'BRL' }
          )}</td>
          <td class="empty">
            <a id="rewards-remove-discount" style="text-decoration: none; color #000; margin-left: 10px">
              <svg id="Icon_-_Bold_-_Action_-_Cancel" data-name="Icon - Bold - Action - Cancel" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <rect id="Container" width="16" height="16" fill="none"/>
                <path id="Icon_Bold_Action_Cancel" data-name="Icon / Bold / Action / Cancel" d="M7.583,15.167h0a7.583,7.583,0,1,1,7.584-7.583A7.533,7.533,0,0,1,7.582,15.167ZM7.466,8.29h0l2.651,2.652.825-.825L8.29,7.465l2.652-2.652-.825-.825L7.466,6.64,4.814,3.988l-.825.825L6.641,7.465,3.989,10.117l.825.825L7.465,8.29Z" transform="translate(0.417 0.417)"/>
              </svg>
            </a>
          </td>
        </tr>
      `)

      $('body').on('click', '#rewards-remove-discount', () => {
        this.cancelRewardsDiscount()
      })
    }
  }

  showObsRewards() {
    try {
      const { orderForm } = window.vtexjs.checkout

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
      const _component = `
        <div id="text-details-rewards" style="max-width: 376px; width: 100%; margin-top: 15px; color: #000; font-size: 12px; font-family: 'SamsungOne'; float: right; text-align: justify;">
          <p>**Pontos Samsung Rewards são gerados somente em compras realizadas por meio de uma Samsung Account participante do programa. Pontos Samsung Rewards pendentes serão creditados 14 dias após a entrega do pedido. Caso seu pedido seja cancelado ou o pagamento não seja aprovado, os pontos não serão creditados. Ao utilizar seus pontos já existentes do Samsung Rewards as promoções de meios de pagamento vigentes não serão aplicadas.
          </p>
        </div>
      `

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

    $('.link-gift-card').after(`
      <div id="group-all-rewards" style="display: none; grid-area: rewards-calc">
        <div
          id="group-calc-rewards"
          style="width: auto; margin: 15px 0; padding: 25px 15px 10px 20px; background: #F5F7FE; font-family: SamsungOne; color: #000; font-size: 14px; font-weight: 400; border-radius: 12px;"
        >
          <div
            id="calc-header-rewards"
            style="display: flex; justify-content: flex-start; align-items: center; flex-wrap: wrap; border-bottom: 1px solid #d6d6d6; padding-bottom: 15px"
          >
            <span
              id="calc-header-title"
              style="margin-right: 0.5vw; font-size: 20px; font-weight: 700"
            >
              Samsung Rewards:
            </span>
            <span
              id="calc-header-points"
              style=" color: #006BEA; font-size: 20px; font-weight: 700;"
            >
              Você tem ${formatNumberBRL(this.totalPointsUser)} pontos
            </span>
          </div>
          <div
            id="calc-content-rewards"
            style="margin-top: 10px"
          >
            <div
              id="calc-content-first-column"
              style="display: grid; grid-template-columns: 1fr;"
            >
            <div class="container-switch-rewards">
              <label class="switch-rewards">
                <input type="checkbox">
                <span class="slider"></span>
              </label>
              <span class="text-switch-rewards"></span>
            </div>
            <p style="color: #000000; font-size: 14px; font-weight: 400; padding-bottom: 10px; text-align: justify;">
              Seus pontos valem descontos de até 50% na compra de produtos Samsung.
            </p>
            </div>
          </div>
        </div>
      </div>
    `)

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
        this.showRewardsCalc()
      }
    }

    if ($('.switch-rewards input')[0].checked) {
      $('.text-switch-rewards').text('Utilizar os pontos nesta compra')
    } else {
      $('.text-switch-rewards').text('Acumular pontos para as próximas compras')
    }

    $(document).on('change', '.switch-rewards input', () => {
      const inputChecked = $('.switch-rewards input')[0].checked

      $('.switch-rewards input').prop('disabled', true)

      if (inputChecked) {
        $('.text-switch-rewards').text('Utilizar os pontos nesta compra')
        this.setRewardsDiscount()
      } else {
        $('.text-switch-rewards').text(
          'Acumular pontos para as próximas compras'
        )
        this.cancelRewardsDiscount()
      }
    })
  }

  clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
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
        Id: orderForm.orderFormId,
        Timestamp: new Date().toISOString().split('Z')[0],
        RequestType: 'R',
        SAGuid: this.userSaGuid,
        CountryDescription: 'BR',
      }

      $.ajax({
        url: `${this.rootPath()}/rewards/points/search`,
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

  setRewardsDiscount() {
    const element = document.querySelector(
      '.gift-card-provider-group-ssg_rewards .input-prepend input'
    )

    const evt = new KeyboardEvent('keydown', { key: 'a' })

    element.value = this.chosenDiscount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    element.focus()
    element.dispatchEvent(evt)

    $('#show-rewards-parent').addClass('disabled')
  }

  cancelRewardsDiscount(verify = false) {
    if (window.vtexjs.checkout.orderForm.paymentData.giftCards) {
      const rewardsDiscount = window.vtexjs.checkout.orderForm.paymentData.giftCards.filter(
        g => g.provider === 'SSG_REWARDS'
      )

      if (!rewardsDiscount) return
      if (!rewardsDiscount[0]) return
      if (rewardsDiscount[0].value === 0) return
    }

    const element = document.querySelector(
      '.gift-card-provider-group-ssg_rewards .action a'
    )

    let TotalShipping = 0

    if (
      window.vtexjs.checkout.orderForm.totalizers.find(item => {
        return item.id === 'Shipping'
      })
    ) {
      TotalShipping = window.vtexjs.checkout.orderForm.totalizers.find(item => {
        return item.id === 'Shipping'
      }).value
    }

    if (!verify) {
      if ($('.switch-rewards input').length > 0) {
        $('.switch-rewards input')[0].checked = false
      }

      if ($('.gift-card-provider-group-ssg_rewards .action a').length) {
        element.click()
      }

      return
    }

    const rewardsOrder =
      window.vtexjs.checkout.orderForm.paymentData.giftCards[0].value

    const totalOrder = window.vtexjs.checkout.orderForm.value

    // verify if value of rewards is more than 50% of order's total
    if (verify && (totalOrder - TotalShipping) / 2 < rewardsOrder) {
      if ($('.switch-rewards input').length > 0) {
        $('.switch-rewards input')[0].checked = false
      }

      if ($('.gift-card-provider-group-ssg_rewards .action a').length) {
        element.click()
      }
    }
  }

  showPointsSimulation() {
    const { orderForm } = window.vtexjs.checkout

    if (orderForm.items.length === 0) return

    if (orderForm.totalizers.length === 0) return

    if (orderForm.loggedIn) {
      this.getRewardsData(orderForm.clientProfileData.email)
    }

    let rewardsDiscountApplied = 0

    if (orderForm.paymentData.giftCards) {
      const giftRewards = orderForm.paymentData.giftCards.filter(
        g => g.provider === 'SSG_REWARDS'
      )

      if (
        giftRewards.length &&
        giftRewards[0].inUse &&
        giftRewards[0].value > 0
      ) {
        rewardsDiscountApplied = giftRewards[0].value / 100
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

    const TotalItems =
      orderForm.totalizers.find(item => {
        return item.id === 'Items'
      }).value / 100

    let TotalDisc = 0

    if (
      orderForm.totalizers.find(item => {
        return item.id === 'Discounts'
      })
    ) {
      TotalDisc =
        orderForm.totalizers.find(item => {
          return item.id === 'Discounts'
        }).value / 100
    }

    const ProductItems = []

    orderForm.items.map(item => {
      const MultProporcional =
        ((item.sellingPrice / 100) * item.quantity) / (TotalItems + TotalDisc)

      let TotalRewardsDiscountCurrentItem = 0

      if (rewardsDiscountApplied > 0) {
        TotalRewardsDiscountCurrentItem =
          MultProporcional * rewardsDiscountApplied
      }

      ProductItems.push({
        ObjectType: 'ESTORE_BR',
        ObjectId: item.refId,
        Amount: (
          Math.round(item.sellingPrice * item.quantity) / 100 -
          TotalRewardsDiscountCurrentItem
        ).toString(),
        Quantity: item.quantity.toString(),
      })

      return ''
    })

    const data = {
      Id: orderForm.orderFormId,
      Timestamp: new Date().toISOString().split('Z')[0],
      ContactIdOrigin: 'ESTORE',
      SAGuid: this.userSaGuid || 'GUEST',
      CountryDescription: 'BR',
      ProductItems,
    }

    $.ajax({
      url: `${this.rootPath()}/rewards/points/simulation`,
      type: 'POST',
      cache: false,
      data: JSON.stringify(data),
      success: res => {
        if (this.totalPointsCurrentOrder === res.TotalPointAmount) return

        this.totalPointsCurrentOrder = res.TotalPointAmount
        this.putRewardsOnCustomData(orderForm.orderFormId, res.TotalPointAmount)
        this.createElementTotalPoints(res.TotalPointAmount)
      },
      error: err => {
        return () => {
          console.error('points simulation error', err)
        }
      },
    })
  }
}
