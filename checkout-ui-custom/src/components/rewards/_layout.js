import { formatNumberBRL } from '../_utils'

const isFidelidadeAccount = (window.vtex && (window.vtex.accountName == 'samsungbrtestsfidelidade' || window.vtex.accountName == 'samsungbrshopfidelidade'));

function createLayoutGroupCalcRewards({ totalPointsUser }) {
  return `
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
              Você tem ${formatNumberBRL(totalPointsUser)} pontos
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
              Troque seus pontos por até 50% de desconto. *Essa transação poderá utilizar todos os seus pontos.
            </p>
            </div>
          </div>
        </div>
      </div>
    `
}

function createLayoutElementTotalPoints({ totalPointsCurrentOrder }) {
  const _component = `
        <tbody id="total-details-rewards" style="border-top: 1px solid #cbcbcb;">
          <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;">
            <td id="td-text-rewards-total" style="font-size: 14px; color: #000; font-weight: 400">
              Pontos Rewards gerados para sua próxima compra*
            </td>
            <td id="total-points-value" style="font-size: 14px; color: #2189FF; font-weight: 800; text-align: right !important">${formatNumberBRL(
              totalPointsCurrentOrder
            )} Pontos</td>
          </tr>
        </tbody>
      `

  const _componentVtexId = `
      <tbody id="total-details-rewards" style="border-top: 1px solid #cbcbcb;">
        <tr style="display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;">
          <td id="td-text-rewards-total" style="font-size: 14px; color: #000; font-weight: 400">
            *Pontos Rewards (Gerados apenas quando utilizado Samsung Account)
          </td>
          <td id="total-points-value" style="font-size: 14px; color: #2189FF; font-weight: 800; text-align: right !important">${formatNumberBRL(
            totalPointsCurrentOrder
          )} Pontos</td>
        </tr>
      </tbody>
      `
    return isFidelidadeAccount ? {} : { _component, _componentVtexId };
}

function createLayoutMessageObs(saguid) {

  
  let _component = ''

  if (saguid && !isFidelidadeAccount) {
    _component = `
      <div id="text-details-rewards" style="max-width: 376px; width: 100%; margin-top: 15px; color: #000; font-size: 12px; font-family: 'SamsungOne'; float: right; text-align: justify;">
        <p>
          **Pontos Samsung Rewards são gerados somente em compras realizadas por meio de uma Samsung Account participante do programa. Pontos Samsung Rewards pendentes serão creditados 14 dias após a entrega do pedido. Caso seu pedido seja cancelado ou o pagamento não seja aprovado, os pontos não serão creditados. Ao utilizar seus pontos já existentes do Samsung Rewards as promoções de meios de pagamento vigentes não serão aplicadas.
        </p>
      </div>
    `
  } 
  
  if (!saguid) {
    _component = `
    <div id="text-details-rewards" style="max-width: 376px; width: 100%; margin-top: 15px; color: #000; font-size: 12px; font-family: 'SamsungOne'; float: right; text-align: justify;">
      <p>
      “Faça seu login ou cadastre uma conta Samsung e ganhe Pontos Samsung Rewards ao realizar a sua compra.
      Junte pontos e troque por até 50% de desconto em compras futuras em nossa Loja Online”.
      </p>
    </div>
  `
  }

  return {
    _component,
  }
}

function createLayoutRewardsTotalDiscount({ discount }) {
  const _component = `
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
`

  return {
    _component,
  }
}

export {
  createLayoutGroupCalcRewards,
  createLayoutElementTotalPoints,
  createLayoutMessageObs,
  createLayoutRewardsTotalDiscount,
}
