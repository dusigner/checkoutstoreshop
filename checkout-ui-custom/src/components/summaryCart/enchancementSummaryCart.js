// import { formatCurrencyBRL } from '../utils'
// import { rootPath } from '../utils/_rootPath'

// export async function enchancementSummaryCart({ path, _this }) {
//   const orderForm = _this.orderForm

//   console.log('orderForm - enchancementSummaryCart', orderForm);

//   try {
//     if (orderForm === undefined && orderForm.value == 0) {
//       return
//     }

//     const _trElem = $(`.summary-template-holder`)

//     if (path === '#/payment') {
//       const paymentAmountTotal = orderForm.value

//       if (paymentAmountTotal) {
//         const _component = `
//           <div class="cart-total" style="margin-bottom: 20px; color: #000">
//             <div class="best-price" style="font-size: 26px; display: flex; justify-content: space-between; font-weight: 700">
//               <p class="ref-id">Total</p>
//               <p class="estimate-shipping">${formatCurrencyBRL(
//                 paymentAmountTotal
//               )}</p>
//             </div>
//           </div>
//         `

//         if (_trElem.find('.cart-total').length === 0) {
//           _trElem.prepend(_component)
//         } else {
//           _trElem.find('.cart-total').remove()
//           _trElem.prepend(_component)
//         }
//       }

//       return
//     }

//     if (
//       window.vtexjs.checkout.orderForm &&
//       window.vtexjs.checkout.orderForm.items.length > 0
//     ) {
//       const installmentPix = orderForm.paymentData.installmentOptions.find(
//         item => item.paymentSystem == 125
//       ).installments

//       if (!installmentPix.length) return
//       const inCashPrice = installmentPix[0].total

//       let teste = null
//       if (_this.lastOrderFormTotalPrice !== orderForm.value) {
//         _this.lastOrderFormTotalPrice = orderForm.value
//         console.log('enchancementSummaryCart - response', response)
//         teste = await fetch(
//           `${rootPath()}/api/checkout/pub/orderForm/${
//             orderForm.orderFormId
//           }/installments?paymentSystem=2`
//         )
//           .then(response => response.json())
//           .then(data => {
//             if (data && data.installments) {
//               const installmentOptions = data.installments

//               const maxInstallment = installmentOptions.find(
//                 install =>
//                   install.count ===
//                   Math.max(...installmentOptions.map(inst => inst.count))
//               )

//               return maxInstallment ? maxInstallment.total : ''
//             }
//           })
//           .catch(e => {
//             console.error('onTerm Price error', e)
//           })
//       }

//       console.log('enchancementSummaryCart - teste', teste)

//       const percentDiscount = Math.floor(100 - (inCashPrice / teste) * 100)

//       const _component = `
//               <div class="cart-total" style="margin-bottom: 20px; color: #000">
//                 <div class="best-price" style="font-size: 26px; display: flex; justify-content: space-between; font-weight: 700">
//                   <p class="ref-id">Total</p>
//                   <p class="estimate-shipping">${formatCurrencyBRL(
//                     inCashPrice
//                   )}</p>
//                 </div>
//                 ${
//                   percentDiscount > 0
//                     ? `<div class="discount-percent" style="font-size: 12px; display: flex; justify-content: flex-end;">
//                         <p>(${percentDiscount}% de desconto)</p>
//                       </div>`
//                     : ''
//                 }
  
//                 <div class="discount-price" style="font-size: 14px; margin-top: 10px; display: flex; justify-content: space-between;">
//                     <p class="gross-total">
//                       Ou parcelado em até 12x
//                     </p>
//                     <p class="discount-total" style="font-weight: 700;">
//                       ${formatCurrencyBRL(teste)}
//                     </p>
//                 </div>
//               </div>
//             `

//       if (path !== '#/cart') {
//         if (_trElem.find('.cart-total').length === 0) {
//           _trElem.prepend(_component)
//         }
//       } else if (path === '#/cart') {
//         if (_trElem.find('.cart-total').length === 0) {
//           _trElem.prepend(_component)
//         } else {
//           _trElem.find('.cart-total').remove()
//           _trElem.prepend(_component)
//         }
//       }
//     }
//   } catch (e) {
//     console.error('enchancementSummaryCart error:', e)
//   }
// }
