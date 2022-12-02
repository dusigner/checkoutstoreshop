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
            $('#inputRewards').attr('checked', true)
            this.userAcceptedRewards = false
            if (!this.alreadyRedirected) {
              window.location.href = '#/profile'
              this.alreadyRedirected = true
            }
          } else if (res[0].isRewardsAccepted && res[0].saGuid) {
            $('#RewardsBlock').hide()
            $('#inputRewards').attr('checked', true)
            this.userAcceptedRewards = true
            this.getPointsSearch()
            this.createButtonRewards()
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
      this.getPointsSearch()
      this.createButtonRewards()
    }
  }

  putRewardsOnCustomData(orderFormId, points) {
    const newData = {
      total_points_earned: points,
      terms_accepted: this.userAcceptedRewards,
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
            <td id="td-text-rewards-total" style="font-size: 14px; color: #373737; font-weight: 400">
              Pontos Rewards gerados<br />
            </td>
            <td id="total-points-value" style="font-size: 14px; color: #0077C8; font-weight: 800; text-align: right">${this.totalPointsCurrentOrder} Pontos</td>
          </tr>
        </tbody>
      `

      const _tdNotAcceptedTermsAndNotSaGuid = `
        (<a href="https://account.samsung.com/" target="_blank" style="cursor: pointer; color: #373737; text-decoration: underline;">Somente para Samsung Account</a>)
      `

      const _trNotAcceptedTerms = `
        <tr style="display: flex; font-family: 'SamsungOne'; margin-top: 10px;">
          <td style="font-size: 12px; color: #373737; font-weight: 400; text-align: justify; line-height: normal;">
            Válido somente para membros do programa Samsung Rewards, em compras feitas através de uma Samsung Account.
          </td>
        </tr>
      `

      if (_checkoutElem.find('#total-details-rewards').length > 0) {
        return
      }

      if (points > 0 && this.userSaGuid && this.userAcceptedRewards) {
        _checkoutElem.append(_component)
      } else if (points > 0 && !this.userSaGuid && !this.userAcceptedRewards) {
        _checkoutElem.append(_component)
        $(`#td-text-rewards-total`).append(_tdNotAcceptedTermsAndNotSaGuid)
      } else if (points > 0 && this.userSaGuid && !this.userAcceptedRewards) {
        _checkoutElem.append(_component)
        $(`#total-details-rewards`).append(_trNotAcceptedTerms)
      }
    } catch (e) {
      console.error('showDetailsTradeIn error:', e)
    }
  }

  createButtonRewards() {
    if ($('#show-rewards-group').length !== 0) return

    $('.link-gift-card').after(`
      <p class="link link-gift-card" id="show-rewards-parent" style="display: none; grid-area: rewards-btn">
        <a id="show-rewards-group" class="link-payment-discounts-cod">
          Resgatar pontos Rewards
        </a>
      </p>
    `)

    document
      .getElementById('show-rewards-group')
      .addEventListener('click', () => {
        this.showRewardsCalc()
      })
  }

  showRewardsCalc() {
    $('#group-all-rewards').show()
    $('#show-rewards-parent')
      .first()
      .hide()

    const { giftCards } = window.vtexjs.checkout.orderForm.paymentData

    if (giftCards.length) {
      const { value, inUse } = giftCards[0]

      if (value > 0 || inUse === true) {
        $('#group-calc-rewards').hide()
        $('#group-cancel-points').show()
        this.createRewardsTotalDiscount(value / 100)
      } else {
        $('#group-cancel-points').hide()
        $('#group-calc-rewards').show()
        $('#rewards-total-discount').remove()
      }
    }
  }

  createRewardsTotalDiscount(discount) {
    if ($('#rewards-total-discount').length === 0) {
      $('.totalizers-list').append(`
        <tr id="rewards-total-discount">
          <td class="info">Rewards</td>
          <td class="space"></td>
          <td class="monetary" style="color: #2189FF">- ${discount.toLocaleString(
            'pt-BR',
            { style: 'currency', currency: 'BRL' }
          )}</td>
          <td class="empty"></td>
        </tr>
      `)
    }
  }

  createGroupCalcRewards() {
    if ($('#group-calc-rewards').length !== 0) return

    $('.link-gift-card').after(`
      <div id="group-all-rewards" style="display: none; grid-area: rewards-calc">
        <div
          id="group-calc-rewards"
          style="width: auto; margin: 15px 0; padding: 25px 15px 10px 20px; background: #f4f4f4; font-family: SamsungOne; color: #000; font-size: 14px; font-weight: 400;"
        >
          <div
            id="calc-header-rewards"
            style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;"
          >
            <span
              id="calc-header-title"
              style="flex-basis: 50%; font-size: 20px; font-weight: 700;"
            >
              Samsung Rewards
            </span>
            <span
              id="calc-header-points"
              style="flex-basis: 50%; text-align: end; color: #2189FF; font-size: 14px; font-weight: 700;"
            >
              Você tem ${this.totalPointsUser} pontos
            </span>
          </div>
          <div
            id="calc-content-rewards"
            style="display: grid; grid-template-columns: 2fr 1fr; margin-top: 20px"
          >
            <div
              id="calc-content-first-column"
              style="display: grid; grid-template-columns: 1fr;"
            >
              Seus pontos valem descontos de até 50% na compra de produtos Samsung.
            </div>
            <div
              id="calc-content-third-column"
              style="display: flex; flex-direction: column; align-items: center"
            >
              <p style="font-weight: 500">Use os seus pontos para ter um desconto de até ${this.chosenDiscount.toLocaleString(
                'pt-BR',
                { style: 'currency', currency: 'BRL' }
              )}</p>
              <button 
                type="button"
                id="button-use-points-rewards"
                style="font-size: 14px; color: #fff; font-weight: 700; padding-block: 10px; border-radius: 20px; background: #2189FF; border: none; width: 188px; font-family: SamsungOne; max-height: 40px; align-self: center;"
              >
                APLICAR ESTE VALOR
              </button>
            </div>
          </div>
          <div
            id="calc-footer-rewards"
            style="margin-top: 20px"
          >
            <p id="footer-rewards-info" style="color: #000000; font-size: 14px; font-weight: 400; padding-bottom: 10px; text-align: justify;">
              Pontos Samsung Rewards gerados nesta compra serão creditados apenas após o período legal de devolução do produto - 7 dias após o recebimento. Caso seu pedido seja cancelado ou o pagamento não seja aprovado, seus pontos não serão utilizados.
            </p>
          </div>
        </div>

        <div id="group-cancel-points" style="display: flex; align-items: baseline; justify-content: flex-start; gap: 10px; padding-block: 10px;">
          <p id="group-cancel-points-p" style="font-size: 20px; color: #2189FF; font-weight: 700; font-family: SamsungOne;"></p>
          <a 
            id="button-cancel-points"
            style="font-size: 12px; color: #000; font-weight: 400; cursor: pointer; text-decoration: underline;"
          >
            Não quero utilizar pontos
          </a>
        <div>
      </div>
    `)

    document
      .getElementById('button-use-points-rewards')
      .addEventListener('click', () => {
        this.setRewardsDiscount()
      })

    document
      .getElementById('button-cancel-points')
      .addEventListener('click', () => {
        this.cancelRewardsDiscount()
      })
  }

  clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
  }

  getPointsSearch() {
    const { orderForm } = window.vtexjs.checkout

    if (orderForm.orderFormId) {
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
            orderForm.value / 100 / 2
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
  }

  cancelRewardsDiscount() {
    const element = document.querySelector(
      '.gift-card-provider-group-ssg_rewards .action a'
    )

    element.click()
    $('#rewards-total-discount').remove()
  }

  showPointsSimulation() {
    const { orderForm } = window.vtexjs.checkout

    if (orderForm.loggedIn) {
      this.getRewardsData(orderForm.clientProfileData.email)
    }

    if (!orderForm.items) return

    const ProductItems = []

    orderForm.items.map(item => {
      ProductItems.push({
        ObjectType: 'ESTORE_BR',
        ObjectId: item.refId,
        Amount: ((item.sellingPrice / 100) * item.quantity).toString(),
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
