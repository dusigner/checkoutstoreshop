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
            // this.getPointsSearch()
            // this.createButtonRewards()
          }
        },
        error: err => {
          return () => {
            console.error('get client rewards data error', err)
          }
        },
      })
    } else if (this.userSaGuid && this.userAcceptedRewards) {
      $('#RewardsBlock').hide()
      $('#inputRewards').attr('checked', true)
      // this.getPointsSearch()
      // this.createButtonRewards()
    }
  }

  putRewardsOnCustomData(orderFormId, points) {
    const newData = {
      total_points_earned: points,
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
