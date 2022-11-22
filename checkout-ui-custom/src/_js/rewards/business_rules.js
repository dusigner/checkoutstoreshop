import renderRewards from "./render";
class Rewards{
	constructor (){
		this.userAcceptedRewards= false;
		this.this.emailUserRewards= '';
		this.alreadyRedirected= false;
		this.userSaGuid= '';
	
		this.totalPointsCurrentOrder= 0;
		this.totalPointsUser= 0;
		this.totalCurrencyUser= 0;
		this.pricePerPoint= 0;
		this.chosenDiscount= 0;

	}

	rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

	ajaxQuery(path, method, data, callbackSuccess, callbackError) {
		$.ajax({
			url: `${rootPath()}${path}`,
			headers: {
				Accept: 'application/vnd.vtex.ds.v10+json',
				'Content-Type': 'application/json',
			},
			crossDomain: true,
			cache:false,
			type: method,
			data: data,
			success: function (data) {
				return callbackSuccess(data);
			},
			error: function (error) {
				return callbackError ? callbackError(error) : null
			}
		})
	}

	getRewardsData(docId){
		const _hideRewardsBlock = ()=> {
			$('#RewardsBlock').hide()
			$('#inputRewards').attr('checked', true)
			createButtonRewards();
			getPointsSearch();
		}

		if (this.emailUserRewards != docId || !this.userAcceptedRewards) {
			const _getRewardsDataAjaxSuccess = (data) => {
				if (this.emailUserRewards != docId){
					window.localStorage.setItem('saGuid', data[0].saGuid || '');
					this.userSaGuid = data[0].saGuid;
					this.emailUserRewards = docId;
				}

				if (!data[0].isRewardsAccepted && data[0].saGuid) {
					$('#RewardsBlock').show()
					$('#inputRewards').attr('checked', true)
					this.userAcceptedRewards = false;
					if (!alreadyRedirected) {
						window.location.href = '#/profile'
						alreadyRedirected = true;
					}
				} else if (data[0].isRewardsAccepted && data[0].saGuid) {
					_hideRewardsBlock();
					this.userAcceptedRewards = true;
				}
			}

			this.ajaxQuery(
				`/_v/get/client/${docId}`,
				"GET",
				null,
				_getRewardsDataAjaxSuccess,
				null
			)

		} else if(this.userSaGuid && this.userAcceptedRewards){
			_hideRewardsBlock();
		} 
	}

	showPointsSimulation(){
		const orderForm = vtexjs.checkout.orderForm
		if (orderForm.loggedIn){
			this.getRewardsData(orderForm.clientProfileData.email);
		}
		if (orderForm.items) {
			const orderData = orderForm;
			let ProductItems = [];
			orderData.items.map(item => {
				ProductItems.push({
					ObjectType: 'ESTORE_BR',
					ObjectId: item.id,
					// AMOUNT É O VALOR UNITARIO OU TOTAL?
					Amount: item.sellingPrice/100,
					// CASO PRECISE ENVIAR O VALOR TOTAL:
					// Amount: (item.sellingPrice/100) * item.quantity,
					Quantity: item.quantity,
				})
			})
	
			let data = {
				Id: orderData.orderFormId,
				Timestamp: new Date().toISOString().split('Z')[0],
				ContactIdOrigin: 'ESTORE',
				SAGuid: userSaGuid || 'GUEST',
				CountryDescription: 'BR',
				ProductItems,
			}

			const _showPointsSimulationAjaxSuccess = (res)=>{
				if (this.totalPointsCurrentOrder != res.ExchangedAmount) {
					this.totalPointsCurrentOrder = res.ExchangedAmount;
					this.putRewardsOnCustomData(orderData.orderFormId, res.ExchangedAmount);
					$('#total-details-points').remove();
					$("#total-details-points-payment").remove();
					$("#total-details-points-payment-notssgcare").remove
					this.createElementTotalPoints(res.ExchangedAmount)
				}
			}
			this.ajaxQuery(
				'/rewards/points/simulation',
				'POST',
				data,
				_showPointsSimulationAjaxSuccess,
				console.error('points simulation error')
			)
		}
	}

	getPointsSearch(){
		if (vtexjs.checkout.orderForm.orderFormId) {
			let data = {
				Id: vtexjs.checkout.orderForm.orderFormId,
				Timestamp: new Date().toISOString().split('Z')[0],
				RequestType: 'R',
				SAGuid: userSaGuid,
				CountryDescription: 'BR',
			}
			const _getPointsSearchAjaxSuccess = (res)=>{
				this.totalPointsUser = res.PointBalance;
				this.totalCurrencyUser = res.ExchangedAmount;
				this.pricePerPoint = res.ExchangedAmount/res.PointBalance;
			}

			this.ajaxQuery(
				'/rewards/points/search',
				'POST',
				JSON.stringify(data),
				_getPointsSearchAjaxSuccess,
				console.error('points search error')
			)
			// $.ajax({
			// 	data: JSON.stringify(data),
			// 		dataType: 'json',
			// 		contentType:  'application/json'
			// })

			renderRewards.createGroupCalcRewards(
				totalPointsUser, 
				totalCurrencyUser
			)
		}
	}

	calcDiscountValue(discount){
		if (discount <= totalPointsUser) {
			//chosenDiscount = discount * pricePerPoint;
			chosenDiscount = discount * 1;
			let element = document.querySelector("#input-rewards-currency");
		
			element.value = `R$ ${chosenDiscount}`;
		}
	}
	
	setRewardsDiscount(){
		let element = document.querySelector(".gift-card-provider-group-ssg_rewards .input-prepend input");
		let evt = new KeyboardEvent('keydown', { key: "a" });
	
		//element.value = chosenDiscount;
		element.value = 1000;
		element.focus();
		element.dispatchEvent(evt);
	}

	cancelRewardsDiscount(){
		let element = document.querySelector(".gift-card-provider-group-ssg_rewards .action a");
		element.click();
		$('#rewards-total-discount').remove();

	}

	putRewardsOnCustomData(orderFormId, points){
		const newData = {total_points_earned: points}
		
		this.ajaxQuery(
			`/v1/pub/putCheckoutCustomData/${orderFormId}/rewards`,
			'PUT',
			JSON.stringify(newData),
			console.log("Sucess!!"),
			console.log("fail...")
		)
	}

	bindEvents(){
		$('body').on("click", "#btn-add-gift-card", function(){
			$("#show-gift-card-group").show();
		});
	}

}
// .
/* $("#show-gift-card-group").live('click',function(){
	$(".link-gift-card").show();
	$("#show-gift-card-group").hide();
}); */




// SE TIVER DESCONTO DEVE MANDAR O DESCONTO PROPORCIONAL POR ITENS PARA O SIMULATION DEVE OS PONTOS !!!!! FAZER ISSO APOS TASK DA CALCULADORA !!!

// END REWARDS



export default {Rewards}