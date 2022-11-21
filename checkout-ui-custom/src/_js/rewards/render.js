

const renderRewards = {

  addRewardsBlock: () => {
    if ($('.rewards-block').length) return
  
    const $field = `<div class="rewards-block" id="RewardsBlock" style="display:none">
      <h3>Samsung Rewards</h3>
      <label class="inputOptIn __rewards">
      <input type="checkbox" id="inputRewards" checked />
      <span class="custom-checkbox-icon"></span>
      <span>Participar do programa Samsung Rewards para ganhar pontos com este pedido.</span>
      </label>
    </div>`
  
    $('.terms-and-policies').after($field)
  },

  createElementTotalPoints: (points, totalPointsCurrentOrder, userInfo) => {
    if ($("#total-details-points").length == 0 && points > 0){
      $('.full-cart .accordion-inner .table').after(`
        <div id="total-details-points" style="margin-top: 15px; border-top: 1px solid #ebebeb;">
          <table style="width: 100%; margin-top: 15px;">
            <tfoot>
              <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;">
                <td style="font-size: 14px; color: #373737; font-weight: 400">
                  Pontos Rewards gerados<br />
                  (<a style="cursor: pointer; color: #373737; target: _blank; text-decoration: underline;">Somente para Samsung Account</a>)
                </td>
                <td id="total-points-value" style="font-size: 14px; color: #0077C8; font-weight: 800; text-align: right">${totalPointsCurrentOrder} Pontos</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `)
    }
    if ($("#total-details-points-payment").length == 0 && points > 0 && userInfo.userSaGuid && userInfo.userAcceptedRewards){
      if ($("#total-details-points-payment-notssgcare").length > 0){
        $("#total-details-points-payment-notssgcare").remove();
      }
      $('.orderform-template .summary-template-holder .accordion-inner .table').after(`
        <div id="total-details-points-payment" style="margin-top: 15px; border-top: 1px solid #ebebeb;">
          <table style="width: 100%; margin-top: 15px;">
            <tfoot>
              <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;">
                <td style="font-size: 14px; color: #373737; font-weight: 400">
                  Pontos Rewards gerados<br />
                </td>
                <td id="total-points-value" style="font-size: 14px; color: #0077C8; font-weight: 800; text-align: right">${totalPointsCurrentOrder} Pontos</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `)
    } else if ($("#total-details-points-payment-notssgcare").length == 0 && points > 0 && !userInfo.userAcceptedRewards){
      if ($("#total-details-points-payment").length > 0){
        $("#total-details-points-payment").remove();
      }
      $('.orderform-template .summary-template-holder .accordion-inner .table').after(`
        <div id="total-details-points-payment-notssgcare" style="margin-top: 15px; border-top: 1px solid #ebebeb;">
          <table style="width: 100%; margin-top: 15px;">
            <tfoot>
              <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;">
                <td style="font-size: 14px; color: #373737; font-weight: 400">
                  Pontos Rewards gerados<br />
                </td>
                <td id="total-points-value" style="font-size: 14px; color: #0077C8; font-weight: 800; text-align: right">${totalPointsCurrentOrder} Pontos</td>
              </tr>
              <tr style="display: flex; font-family: 'SamsungOne'; margin-top: 10px;">
                <td style="font-size: 12px; color: #373737; font-weight: 400; text-align: justify; line-height: normal;">
                  Válido somente para membros do programa Samsung Rewards, em compras feitas através de uma Samsung Account.
                </td>
              </tr>	
            </tfoot>
          </table>
        </div>
      `)
    }
  },

  createRewardsTotalDiscount: (discount) => {
    if ($("#rewards-total-discount").length == 0){
      $('.totalizers-list').append(`
        <tr id="rewards-total-discount">
          <td class="info">Rewards</td>
          <td class="space"></td>
          <td class="monetary" style="color: #2189FF">- R$ ${discount}</td>
          <td class="empty"></td>
        </tr>
      `)
    }
  },

  showRewardsCalc: () => {
    $('#group-all-rewards').show();
    $('#show-rewards-group').first().hide();
  
    const rewards = orderForm.paymentData.giftCards[0];
    if (rewards.value > 0 || rewards.inUse == true) {
      $('#group-calc-rewards').hide();
      $('#group-cancel-points').show();
      createRewardsTotalDiscount(rewards.value/100)
    } else {
      $('#group-cancel-points').hide();
      $('#group-calc-rewards').show();
      $('#rewards-total-discount').remove();
    }
  },

  createButtonRewards: () => {
    if ($("#show-rewards-group").length == 0){
      $('#show-gift-card-group').after(`
        <a id="show-rewards-group" class="link-payment-discounts-cod" onclick='return showRewardsCalc()'>
          Resgatar pontos Samsung Rewards
        </a>
      `)
    }
  },

  createGroupCalcRewards: (totalPointsUser, totalCurrencyUser) => {
    if ($("#group-calc-rewards").length == 0){
      $('.link-gift-card').after(`
        <div id="group-all-rewards" style="display: none">
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
                Você tem ${totalPointsUser} pontos
              </span>
            </div>
            <div
              id="calc-content-rewards"
              style="display: grid; grid-template-columns: repeat(auto-fill, 33.33%); margin-top: 20px"
            >
              <div
                id="calc-content-first-column"
                style="display: grid; grid-template-columns: 1fr;"
              >
                <span style="font-size: 12px; font-weight: 700;">QUANTIDADE DE PONTOS</span>
                <input
                  id="input-rewards-points"
                  type="number"
                  min="0"
                  max="${totalPointsUser}"
                  value="${totalPointsUser}"
                  style="width: 150px; height: 35px; font-size: 14px;"
                  oninput="calcDiscountValue(this.value)"
                  onkeyup="if(this.value > ${totalPointsUser}) this.value = null;"
                >
              </div>
              <div
                id="calc-content-second-column"
                style="display: grid; grid-template-columns: 1fr;"
              >
                <span style="font-size: 12px; font-weight: 700;">VALOR</span>
                <input id="input-rewards-currency" type="text" value="R$ ${totalCurrencyUser}" style="width: 150px; height: 35px; font-size: 14px;" disabled>
              </div>
              <div
                id="calc-content-third-column"
                style="display: grid; grid-template-columns: 1fr;"
              >
                <button 
                  type="button"
                  id="button-use-points-rewards"
                  style="font-size: 14px; color: #fff; font-weight: 700; padding-block: 10px; border-radius: 20px; background: #2189FF; border: none; width: 188px; font-family: SamsungOne; max-height: 40px; align-self: end;"
                  onclick="setRewardsDiscount()"
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
            <p style="font-size: 20px; color: #2189FF; font-weight: 700; font-family: SamsungOne;">
              1000 Pontos Rewards Aplicados
            </p>
            <a 
              id="button-cancel-points"
              style="font-size: 12px; color: #000; font-weight: 400; cursor: pointer; text-decoration: underline;"
              onclick="cancelRewardsDiscount()"
            >
              Não quero utilizar pontos
            </a>
          <div>
        </div>
      `);
    }
  }




}

export default renderRewards

